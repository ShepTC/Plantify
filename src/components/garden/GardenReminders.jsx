import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, parseISO } from 'date-fns';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function GardenReminders({ user }) {
  const client = useQueryClient();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);
  const { data = [], isLoading, error: loadError } = useQuery({ queryKey: ['garden-reminders', user.id], queryFn: () => base44.entities.Reminder.filter({ created_by_id: user.id, is_completed: false }, 'due_date', 100) });
  const complete = async reminder => {
    setBusy(reminder.id); setError('');
    try { await base44.entities.Reminder.update(reminder.id, { is_completed: true }); await client.invalidateQueries({ queryKey: ['garden-reminders'] }); }
    catch (e) { setError(e.message || 'Could not complete reminder.'); }
    finally { setBusy(null); }
  };
  return <section className="rounded-2xl border border-border bg-card p-4"><h2 className="font-semibold flex items-center gap-2 text-sm"><Bell className="w-4 h-4 text-primary" />Your reminders</h2>{isLoading ? <p className="text-xs text-muted-foreground mt-2">Loading reminders…</p> : !data.length && <p className="text-xs text-muted-foreground mt-2">No reminders yet. Use “Remind me” on any plant.</p>}{data.map(r => <div key={r.id} className="flex items-center gap-3 border-t border-border mt-3 pt-3"><div className="flex-1"><p className="text-sm font-medium">{r.title}</p><p className="text-xs text-muted-foreground">{format(parseISO(r.due_date), 'MMM d, yyyy')}</p></div><Button size="icon" variant="ghost" aria-label={`Complete ${r.title}`} disabled={busy === r.id} onClick={() => complete(r)}><Check /></Button></div>)}{(error || loadError) && <p role="alert" className="text-sm text-destructive">{error || 'Could not load reminders.'}</p>}</section>;
}