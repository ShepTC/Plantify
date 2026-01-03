import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, event } = await req.json();
        
        // Get the access token for Google Calendar
        const accessToken = await base44.asServiceRole.connectors.getAccessToken("googlecalendar");

        if (!accessToken) {
            return Response.json({ error: 'Google Calendar not connected' }, { status: 400 });
        }

        const calendarId = 'primary';
        const baseUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;

        if (action === 'create') {
            // Create a new event
            const response = await fetch(baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    summary: event.title,
                    description: event.description || '',
                    start: {
                        date: event.startDate,
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    },
                    end: {
                        date: event.endDate || event.startDate,
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    },
                    colorId: event.colorId || '10', // Green for plant events
                }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                return Response.json({ error: data.error?.message || 'Failed to create event' }, { status: response.status });
            }

            return Response.json({ success: true, eventId: data.id });
        }

        if (action === 'update' && event.googleEventId) {
            // Update an existing event
            const response = await fetch(`${baseUrl}/${event.googleEventId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    summary: event.title,
                    description: event.description || '',
                    start: {
                        date: event.startDate,
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    },
                    end: {
                        date: event.endDate || event.startDate,
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    },
                    colorId: event.colorId || '10',
                }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                return Response.json({ error: data.error?.message || 'Failed to update event' }, { status: response.status });
            }

            return Response.json({ success: true });
        }

        if (action === 'delete' && event.googleEventId) {
            // Delete an event
            const response = await fetch(`${baseUrl}/${event.googleEventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok && response.status !== 404) {
                const data = await response.json();
                return Response.json({ error: data.error?.message || 'Failed to delete event' }, { status: response.status });
            }

            return Response.json({ success: true });
        }

        if (action === 'sync') {
            // Sync all events
            const userPlants = await base44.entities.UserPlant.filter({ created_by: user.email });
            const results = { created: 0, updated: 0, errors: [] };

            for (const plant of userPlants) {
                try {
                    const eventData = {
                        title: `🌱 ${plant.plant_name}`,
                        description: `Planting: ${plant.plant_name}\nStatus: ${plant.status}${plant.notes ? `\nNotes: ${plant.notes}` : ''}`,
                        startDate: plant.actual_planting_date || plant.planned_planting_date,
                        colorId: '10',
                    };

                    if (plant.google_event_id) {
                        // Update existing event
                        const response = await fetch(`${baseUrl}/${plant.google_event_id}`, {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                summary: eventData.title,
                                description: eventData.description,
                                start: {
                                    date: eventData.startDate,
                                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                                },
                                end: {
                                    date: eventData.startDate,
                                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                                },
                                colorId: eventData.colorId,
                            }),
                        });

                        if (response.ok) {
                            results.updated++;
                        } else {
                            results.errors.push(`Failed to update ${plant.plant_name}`);
                        }
                    } else if (eventData.startDate) {
                        // Create new event
                        const response = await fetch(baseUrl, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                summary: eventData.title,
                                description: eventData.description,
                                start: {
                                    date: eventData.startDate,
                                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                                },
                                end: {
                                    date: eventData.startDate,
                                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                                },
                                colorId: eventData.colorId,
                            }),
                        });

                        if (response.ok) {
                            const data = await response.json();
                            // Update UserPlant with Google event ID
                            await base44.entities.UserPlant.update(plant.id, {
                                google_event_id: data.id,
                            });
                            results.created++;
                        } else {
                            results.errors.push(`Failed to create ${plant.plant_name}`);
                        }
                    }
                } catch (error) {
                    results.errors.push(`Error syncing ${plant.plant_name}: ${error.message}`);
                }
            }

            return Response.json({ success: true, results });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});