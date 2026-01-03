import React, { useState, useEffect, useMemo, useCallback } from "react";
import { User } from "@/entities/User";
import { UserPlant } from "@/entities/UserPlant";
import { Plant } from "@/entities/Plant";
import { Reminder } from "@/entities/Reminder";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Sprout,
  Flower,
  Sun as SunIcon,
  Trash2,
  Eye,
  CheckCircle2,
  Leaf,
  Clock,
  CalendarCheck,
  Ruler,
  Sparkles,
  X,
  Cloud
} from
"lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  startOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  getWeek,
  getYear,
  addDays
} from
"date-fns";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from
"@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from
"@/components/ui/dialog";
import LoginPrompt from "../components/auth/LoginPrompt";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { syncGoogleCalendar } from "@/functions/syncGoogleCalendar";
import { useToast } from "@/components/ui/use-toast";

const categoryColors = {
  vegetables: "bg-green-500/30 text-green-100 border border-green-500/40 backdrop-blur-sm",
  herbs: "bg-teal-500/30 text-teal-100 border border-teal-500/40 backdrop-blur-sm",
  flowers: "bg-pink-500/30 text-pink-100 border border-pink-500/40 backdrop-blur-sm",
  fruits: "bg-red-500/30 text-red-100 border border-red-500/40 backdrop-blur-sm",
  grains: "bg-yellow-500/30 text-yellow-100 border border-yellow-500/40 backdrop-blur-sm"
};

const categoryIcons = {
  vegetables: <Leaf className="w-3 h-3" />,
  herbs: <Sprout className="w-3 h-3" />,
  flowers: <Flower className="w-3 h-3" />,
  fruits: <Sprout className="w-3 h-3" />,
  grains: <Sprout className="w-3 h-3" />
};

// Helper function to calculate event spans for cleaner rendering
const calculateSpanningEvents = (days, plantingsByWeek, harvestsByDate) => {
  const eventsByDay = {}; // Key: dayIndex, Value: Array of {start, len, track, event}
  const dayGrid = Array(days.length).fill(0); // Tracks vertical space usage for each day

  // 1. Process weekly planting events
  const monthStart = days[15]; // A day in the middle to check against for month validation
  const plantingEventsByWeek = {};
  days.forEach((day) => {
    // Only consider days within the current month for planting calculations (as per original logic)
    // This makes sure planting events are not calculated for previous/next month days shown on the calendar
    if (!isSameMonth(day, monthStart)) return; 
    const weekKey = `${getYear(day)}-${getWeek(day, { weekStartsOn: 0 })}`;
    const weeklyPlantings = plantingsByWeek[weekKey] || [];
    weeklyPlantings.forEach((plant) => {
      if (!plantingEventsByWeek[weekKey]) plantingEventsByWeek[weekKey] = {};
      if (!plantingEventsByWeek[weekKey][plant.category]) {
        plantingEventsByWeek[weekKey][plant.category] = {
          category: plant.category,
          plants: [],
          plantData: plant.plantData, // This will be the plantData of the first plant added to the group
          eventType: 'planting_group'
        };
      }
      if (!plantingEventsByWeek[weekKey][plant.category].plants.some((p) => p.userPlantId === plant.userPlantId)) {
        plantingEventsByWeek[weekKey][plant.category].plants.push(plant);
      }
    });
  });

  const weeksInView = Math.ceil(days.length / 7);
  for (let weekIndex = 0; weekIndex < weeksInView; weekIndex++) {
    const weekStartDay = days[weekIndex * 7];
    if (!weekStartDay) continue; // Safety check
    const weekKey = `${getYear(weekStartDay)}-${getWeek(weekStartDay, { weekStartsOn: 0 })}`;
    const categoryEvents = plantingEventsByWeek[weekKey] || {};

    Object.values(categoryEvents).forEach((event) => {
      const startIndex = weekIndex * 7;
      const len = 7; // Planting events span the whole week
      const eventWithDetails = {
        ...event,
        name: event.plants.length > 1 ? `${event.plants.length} ${event.category}` : event.plants[0].name
      };

      let track = 0;
      let placed = false;
      while (!placed) {
        let canPlace = true;
        for (let i = startIndex; i < startIndex + len; i++) {
          if (i < dayGrid.length && (dayGrid[i] & (1 << track)) !== 0) {
            canPlace = false;
            break;
          }
        }
        if (canPlace) {
          for (let i = startIndex; i < startIndex + len; i++) {
            if (i < dayGrid.length) dayGrid[i] |= (1 << track);
          }
          if (!eventsByDay[startIndex]) eventsByDay[startIndex] = [];
          eventsByDay[startIndex].push({ start: startIndex, len, track, event: eventWithDetails });
          placed = true;
        } else {
          track++;
        }
      }
    });
  }

  // 2. Process multi-day harvest events
  const processedHarvestIds = new Set();
  days.forEach((day, dayIndex) => {
    const dateKey = format(day, "yyyy-MM-dd");
    const dailyHarvests = harvestsByDate[dateKey] || [];

    dailyHarvests.forEach(harvest => {
      // If this harvest userPlantId has already been processed as part of a span, skip it
      if (processedHarvestIds.has(harvest.userPlantId)) return;

      // Find the start and end of this harvest window for the specific userPlantId
      let startIndex = -1;
      let contiguousEndIndex = -1;

      // Iterate around the current day to find the full contiguous span for this harvest
      // We check a range around the current day to capture the full 3-day window
      for (let i = -2; i <= 2; i++) {
          const checkDayIndex = dayIndex + i;
          if (checkDayIndex >= 0 && checkDayIndex < days.length) {
              const checkDateKey = format(days[checkDayIndex], "yyyy-MM-dd");
              // Check if the current harvest event exists on checkDateKey
              if ((harvestsByDate[checkDateKey] || []).some(h => h.userPlantId === harvest.userPlantId)) {
                  if (startIndex === -1 || checkDayIndex < startIndex) {
                      startIndex = checkDayIndex; // Update start index to the earliest day
                  }
                  if (contiguousEndIndex === -1 || checkDayIndex > contiguousEndIndex) {
                      contiguousEndIndex = checkDayIndex; // Update end index to the latest day
                  }
              }
          }
      }
      
      // If we found a span and the current day is not its start, skip processing for this day
      if (startIndex !== -1 && startIndex !== dayIndex) {
        return; 
      }
      
      // If no start index was found (shouldn't happen if dailyHarvests is not empty)
      if (startIndex === -1) return;

      processedHarvestIds.add(harvest.userPlantId);
      const len = contiguousEndIndex - startIndex + 1; // Calculate length of the span

      let track = 0;
      let placed = false;
      while (!placed) {
        let canPlace = true;
        for (let i = startIndex; i <= contiguousEndIndex; i++) { // Check all days in the span
          if (i < dayGrid.length && (dayGrid[i] & (1 << track)) !== 0) {
            canPlace = false;
            break;
          }
        }
        if (canPlace) {
          for (let i = startIndex; i <= contiguousEndIndex; i++) { // Mark all days in the span
            if (i < dayGrid.length) dayGrid[i] |= (1 << track);
          }
          if (!eventsByDay[startIndex]) eventsByDay[startIndex] = [];
          eventsByDay[startIndex].push({ start: startIndex, len, track, event: {...harvest, eventType: 'harvest'} });
          placed = true;
        } else {
          track++;
        }
      }
    });
  });

  return { eventsByDay, dayGrid };
};


// This helper counts how many vertical tracks an event needs to be pushed down
const getTrackCountForDay = (dayIndex, dayGrid) => {
  // dayGrid now directly holds the bitmask for each day
  const dayGridMask = dayGrid[dayIndex] || 0;

  if (dayGridMask === 0) return 0;

  // Find the highest set bit to determine how many tracks are used
  return Math.floor(Math.log2(dayGridMask)) + 1;
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [user, setUser] = useState(null);

  // Processed data for the current view
  const [plantingsByWeek, setPlantingsByWeek] = useState({});
  const [harvestsByDate, setHarvestsByDate] = useState({});
  const [remindersByDate, setRemindersByDate] = useState({});

  // Raw data, fetched only once
  const [rawUserPlants, setRawUserPlants] = useState([]);
  const [plantDataMap, setPlantDataMap] = useState({});
  const [rawReminders, setRawReminders] = useState([]);

  // UI State
  const [isLoading, setIsLoading] = useState(true); // For initial load only
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [fullScreenPlant, setFullScreenPlant] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  // This effect runs only ONCE on component mount to fetch all data.
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        if (!currentUser.growing_zone) {
          setIsLoading(false);
          return;
        }

        const [userPlants, allPlants, reminders] = await Promise.all([
          UserPlant.filter({ created_by: currentUser.email }),
          Plant.list(),
          Reminder.filter({ created_by: currentUser.email })
        ]);

        const plantMap = {};
        allPlants.forEach((p) => {
          plantMap[p.id] = p;
        });

        setPlantDataMap(plantMap);
        setRawUserPlants(userPlants);
        setRawReminders(reminders);

      } catch (error) {
        console.error("Error loading initial calendar data:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const processReminders = useCallback((reminders) => {
    const remindersByDateMap = {};
    reminders.forEach((reminder) => {
      const dateKey = format(new Date(reminder.due_date), "yyyy-MM-dd");
      if (!remindersByDateMap[dateKey]) {
        remindersByDateMap[dateKey] = [];
      }
      remindersByDateMap[dateKey].push({
        id: reminder.id,
        title: reminder.title,
        description: reminder.description,
        type: reminder.type,
        is_completed: reminder.is_completed,
        eventType: "reminder"
      });
    });
    setRemindersByDate(remindersByDateMap);
  }, []); // setRemindersByDate is a stable setter, format is an external utility

  const processCalendarEvents = useCallback((userPlants, userZone, plantMap) => {
    const plantings = {};
    const harvests = {};
    const currentYear = getYear(currentDate); // Make sure this uses the component's currentDate

    userPlants.forEach((userPlant) => {
      const plantData = plantMap[userPlant.plant_id];
      if (!plantData) return;

      if (userPlant.status === 'planned' && plantData.planting_zones) {
        const zoneData = plantData.planting_zones.find(
          (z) => z.zone === userZone || z.zone === userZone.substring(0, userZone.length - 1)
        );
        if (!zoneData) return;

        const windows = [
          { start: zoneData.spring_start_week, end: zoneData.spring_end_week, season: 'Spring' },
          { start: zoneData.fall_start_week, end: zoneData.fall_end_week, season: 'Fall' }];


        windows.forEach((window) => {
          if (window.start && window.end) {
            for (let week = window.start; week <= window.end; week++) {
              const weekKey = `${currentYear}-${week}`;
              if (!plantings[weekKey]) {
                plantings[weekKey] = [];
              }
              plantings[weekKey].push({
                name: plantData.name,
                category: plantData.category,
                userPlantId: userPlant.id,
                plantData: plantData,
                season: window.season,
                optimalWeeks: `Weeks ${window.start}-${window.end}`,
                eventType: 'planting'
              });
            }
          }
        });
      }

      if (userPlant.harvest_date) {
        const harvestBaseDate = new Date(userPlant.harvest_date);
        
        // Create a 3-day window: one day before, the day of, and one day after
        for (let i = -1; i <= 1; i++) {
          const date = addDays(harvestBaseDate, i);
          const dateKey = format(date, "yyyy-MM-dd");

          if (!harvests[dateKey]) {
            harvests[dateKey] = [];
          }
          
          // Add harvest event to the date, ensuring userPlantId is unique per date
          if (!harvests[dateKey].some(h => h.userPlantId === userPlant.id)) {
            harvests[dateKey].push({
              name: userPlant.plant_name,
              category: plantMap[userPlant.plant_id]?.category || 'vegetables', // Default category if not found
              status: userPlant.status,
              userPlantId: userPlant.id,
              actualPlantingDate: userPlant.actual_planting_date,
              plantData: plantData, // Include plantData for details
              eventType: 'harvest'
            });
          }
        }
      }
    });

    setPlantingsByWeek(plantings);
    setHarvestsByDate(harvests);
  }, [currentDate]); // currentDate is used to get the currentYear

  // This effect re-processes the raw data whenever the month changes or raw data is updated.
  // It does NOT re-fetch, making it seamless.
  useEffect(() => {
    // Only process if user and their growing zone are available and not in initial loading state
    if (isLoading || !user?.growing_zone) {
      // If data is not yet loaded, or zone is missing, clear processed data
      setPlantingsByWeek({});
      setHarvestsByDate({});
      setRemindersByDate({});
      return;
    }

    processCalendarEvents(rawUserPlants, user.growing_zone, plantDataMap);
    processReminders(rawReminders);

  }, [currentDate, isLoading, user, rawUserPlants, plantDataMap, rawReminders, processCalendarEvents, processReminders]);


  const handleViewEvent = (event, eventType) => {
    const eventWithType = { ...event, eventType };
    setSelectedEvent(eventWithType);
    setIsEventDialogOpen(true);
  };

  const handleOpenFullScreen = (plant, eventType) => {
    setFullScreenPlant({ ...plant, eventType });
    setIsFullScreenOpen(true);
  };

  const handleDeleteEvent = async (event, eventType) => {
    if (!user?.email) {
      console.error("User email not available for deletion.");
      return;
    }
    if (eventType === 'reminder' && event.id) {
      try {
        await Reminder.delete(event.id);
        // Re-fetch data after deletion
        const reminders = await Reminder.filter({ created_by: user.email });
        setRawReminders(reminders);
      } catch (error) {
        console.error("Error deleting reminder:", error);
      }
    } else if ((eventType === 'planting' || eventType === 'harvest' || eventType === 'planting_group') && event.userPlantId) { // Check userPlantId for planting/harvest
      try {
        await UserPlant.delete(event.userPlantId);
      } catch (error) {
        // If the plant is not found (404), it means it was already deleted.
        // We can safely ignore this error and proceed to refresh the data.
        if (error.message && error.message.includes('404')) {
          console.log(`Gracefully handled 404 for already deleted plant: ${event.userPlantId}`);
        } else {
          // For any other error, log it.
          console.error("Error deleting plant from calendar:", error);
        }
      } finally {
        // Always re-fetch the data to ensure the calendar is up-to-date.
        // This handles successful deletions and 404s by ensuring the UI is synced with the database.
        const userPlants = await UserPlant.filter({ created_by: user.email });
        setRawUserPlants(userPlants);
      }
    } else {
      console.warn("Cannot delete event of type " + eventType + " without a valid ID or userPlantId.");
    }
  };

  const handleCompleteReminder = async (reminderId) => {
    if (!user?.email) {
      console.error("User email not available for reminder completion.");
      return;
    }
    try {
      await Reminder.update(reminderId, { is_completed: true });
      // Re-fetch data after update
      const reminders = await Reminder.filter({ created_by: user.email });
      setRawReminders(reminders);
    } catch (error) {
      console.error("Error completing reminder:", error);
    }
  };

  const handleSyncGoogleCalendar = async () => {
    setIsSyncing(true);
    try {
      const response = await syncGoogleCalendar({ action: 'sync' });
      
      if (response.data.success) {
        const { created, updated, errors } = response.data.results;
        
        toast({
          title: "Google Calendar Synced",
          description: `Created ${created} events, updated ${updated} events${errors.length > 0 ? `, ${errors.length} errors` : ''}`,
          variant: errors.length > 0 ? "default" : "default"
        });
        
        // Refresh plant data
        const userPlants = await UserPlant.filter({ created_by: user.email });
        setRawUserPlants(userPlants);
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync with Google Calendar",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  // Calculate the start date of the calendar grid (Sunday of the week of monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });

  // Calculate the end date of the calendar grid to ensure 6 weeks are always displayed (6 * 7 = 42 days)
  // addDays(startDate, 41) because startDate is the first day (day 0), so 41 more days make 42 total.
  const endDateConsistent = addDays(startDate, 41);

  const days = eachDayOfInterval({ start: startDate, end: endDateConsistent });

  const { eventsByDay, dayGrid } = useMemo(
    () => calculateSpanningEvents(days, plantingsByWeek, harvestsByDate),
    [days, plantingsByWeek, harvestsByDate]
  );

  const Header = () =>
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-3">
      <h1 className="text-xl md:text-3xl font-bold text-foreground whitespace-nowrap">
        {format(currentDate, "MMM yyyy")}
      </h1>
      <div className="flex items-center gap-2 w-full md:w-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="flex-shrink-0">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" onClick={() => setCurrentDate(new Date())} className="flex-shrink-0">
          Today
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="flex-shrink-0">
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          onClick={handleSyncGoogleCalendar}
          disabled={isSyncing}
          className="ml-auto md:ml-2 flex-shrink-0 relative overflow-hidden group border-2 hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-red-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/fe6c37c78_google-logo-g-suite-google-9820d64d83b313b7a901dcc7f6052ee6.png"
            alt="Google"
            className={`w-4 h-4 mr-2 relative z-10 ${isSyncing ? 'animate-pulse' : ''}`}
          />
          <span className="relative z-10">{isSyncing ? 'Syncing...' : 'Sync'}</span>
          {!isSyncing && (
            <div className="absolute inset-0 rounded-lg shadow-[0_0_15px_rgba(66,133,244,0.3)] dark:shadow-[0_0_20px_rgba(66,133,244,0.4)] opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </Button>
      </div>
    </div>;



  const DaysOfWeek = () =>
    <div className="grid grid-cols-7 text-center text-sm font-medium text-muted-foreground pb-2 border-b border-border">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) =>
        <div key={day}>{day}</div>
      )}
    </div>;



  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 flex items-center justify-center">
        <LoadingSpinner message="Loading your planting calendar..." size="large" />
      </div>
    );
  }
  if (!user) {
    return <LoginPrompt />;
  }
  if (!user?.growing_zone) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 pb-20 md:pb-6 flex items-center justify-center">
        <Card className="w-full max-w-md bg-card border-border text-center">
          <CardContent className="p-8 md:p-10">
            <CalendarIcon className="w-12 h-12 md:w-16 md:h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-xl md:text-2xl font-bold text-foreground mb-2">
              Set Your Location
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mb-6">
              Please set your location in your profile to view your personalized planting calendar.
            </p>
          </CardContent>
        </Card>
      </div>);

  }

  const imageUrl = fullScreenPlant?.eventType === 'planting_group'
    ? fullScreenPlant.plants?.[0]?.plantData?.image_url
    : fullScreenPlant?.plantData?.image_url;

  return (
    <div className="min-h-screen bg-background text-foreground p-3 md:p-6 pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto w-full">
        <Header />
        <Card className="border-border overflow-hidden">
          <CardContent className="p-2 md:p-4">
            <DaysOfWeek />
            {/* Calendar grid with fixed row heights for standard shape */}
            <div className="grid grid-cols-7">
              {days.map((day, dayIndex) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const dailyReminders = remindersByDate[dateKey] || [];
                const maxDisplayEvents = 3;

                const daySpans = eventsByDay[dayIndex] || []; // Get events that start on this specific dayIndex
                const trackCount = getTrackCountForDay(dayIndex, dayGrid); // Get max tracks used up to this day
                const paddingTop = trackCount > 0 ? `calc(${trackCount * 1.5}rem + 2px)` : '0rem'; // Use 1.5rem for height of events


                return (
                  <div
                    key={day.toString()}
                    className={
                      "border-r border-b border-border p-1 md:p-2 flex flex-col relative min-h-[70px] md:min-h-[90px] " + (
                        !isSameMonth(day, monthStart) ?
                          "bg-muted/30 text-muted-foreground" :
                          "bg-card")
                    }>

                    <time
                      dateTime={format(day, "yyyy-MM-dd")}
                      className={
                        "font-semibold text-xs mb-1 " + (
                          isToday(day) ?
                            "bg-primary text-primary-foreground rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-[10px] md:text-xs" :
                            "")
                      }>

                      {format(day, "d")}
                    </time>

                    {daySpans.map(({ start, len, track, event }, spanIndex) => {
                      const isPlantingGroup = event.eventType === 'planting_group';
                      const isHarvest = event.eventType === 'harvest';
                      
                      const eventCategory = isPlantingGroup ? event.category : event.plantData?.category || event.category || 'vegetables';
                      const colorClass = isHarvest 
                        ? "bg-yellow-500/30 text-yellow-100 border border-yellow-500/40 backdrop-blur-sm"
                        : categoryColors[eventCategory];
                      
                      const icon = isHarvest 
                        ? <SunIcon className="w-3 h-3" /> 
                        : categoryIcons[eventCategory];

                      const openHandler = () => {
                        const eventTypeToPass = isPlantingGroup ? 'planting_group' : (isHarvest ? 'harvest' : event.eventType);
                        handleOpenFullScreen(event, eventTypeToPass)
                      };

                      return (
                        <ContextMenu key={`span-${dayIndex}-${spanIndex}`}>
                          <ContextMenuTrigger asChild>
                            <div
                              className={`absolute flex items-center px-1 md:px-1.5 py-0.5 rounded-sm cursor-pointer hover:opacity-90 z-10 ${colorClass}`}
                              style={{
                                top: `calc(1.4rem + ${track * 1.5}rem)`, // Adjusted for new event height
                                left: `2px`,
                                width: `calc(${len * 100}% - 4px)`,
                                height: '1.25rem' // New height for events
                              }}
                              onClick={openHandler}>

                              {icon}
                              <span className="ml-1 text-[9px] md:text-[11px] font-medium truncate">{event.name}</span>
                            </div>
                          </ContextMenuTrigger>
                          <ContextMenuContent>
                           {isPlantingGroup ? (
                              event.plants.map((plant, pIndex) =>
                                <div key={`${plant.userPlantId}-${pIndex}`}>
                                  <ContextMenuItem onClick={() => handleOpenFullScreen(plant, 'planting')}><Sprout className="w-4 h-4 mr-2" /> Details for {plant.name}</ContextMenuItem>
                                  <ContextMenuItem onClick={() => handleDeleteEvent(plant, 'planting')} className="text-destructive focus:bg-destructive focus:text-destructive-foreground"><Trash2 className="w-4 h-4 mr-2" /> Remove {plant.name}</ContextMenuItem>
                                </div>
                              )
                            ) : (
                                <div>
                                  <ContextMenuItem onClick={openHandler}><Eye className="w-4 h-4 mr-2" /> View Details</ContextMenuItem>
                                  {/* For harvest events, the userPlantId is directly on the event */}
                                  <ContextMenuItem onClick={() => handleDeleteEvent(event, 'harvest')} className="text-destructive focus:bg-destructive focus:text-destructive-foreground"><Trash2 className="w-4 h-4 mr-2" /> Remove from Garden</ContextMenuItem>
                                </div>
                            )}
                          </ContextMenuContent>
                        </ContextMenu>);

                    })}

                    <div className="flex-1 space-y-0.5 md:space-y-1 overflow-hidden" style={{ paddingTop }}>
                      {dailyReminders.slice(0, maxDisplayEvents).map((reminder, index) =>
                        <Badge key={`reminder-${reminder.id}-${index}`} variant="outline" onClick={() => handleViewEvent(reminder, 'reminder')} className={`w-full justify-start text-xs truncate cursor-pointer hover:opacity-80 px-1 py-0.5 h-3 md:h-4 ${reminder.is_completed ? "bg-gray-100 text-gray-500 border-gray-300 line-through dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-500" : "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700/60"}`}>
                          <CalendarIcon className="w-2 h-2 md:w-2.5 md:h-2.5 mr-1 flex-shrink-0" />
                          <span className="truncate text-[9px] md:text-[11px]">{reminder.title}</span>
                        </Badge>
                      )}
                      {/* Daily Harvest Badges are now replaced by the spanning event logic */}
                    </div>
                  </div>);

              })}
            </div>
          </CardContent>
        </Card>

        {/* Full Screen Plant Details Dialog */}
        <Dialog open={isFullScreenOpen} onOpenChange={setIsFullScreenOpen}>
          <DialogContent className="p-0 max-w-lg w-[95vw] h-[90vh] flex flex-col bg-card border-border data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-2xl">
            {/* Header with Image */}
            <div className="relative h-1/3 md:h-2/5 w-full flex-shrink-0">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={fullScreenPlant?.name || 'Plant'}
                  className="w-full h-full object-cover rounded-t-2xl"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center rounded-t-2xl">
                  <div className="w-16 h-16 bg-muted-foreground/10 rounded-full flex items-center justify-center">
                    {categoryIcons[fullScreenPlant?.category || 'vegetables']}
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-t-2xl" />

              <div className="absolute bottom-0 left-0 p-4 md:p-6 text-white">
                <h1 className="text-2xl md:text-4xl font-bold leading-tight flex items-center gap-3">
                  {fullScreenPlant?.eventType === 'planting_group' ? (
                    <>
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        {categoryIcons[fullScreenPlant.category]}
                      </div>
                      {fullScreenPlant.name}
                    </>
                  ) : fullScreenPlant?.eventType === 'harvest' ? (
                    <>
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <SunIcon className="w-5 h-5" />
                      </div>
                      {fullScreenPlant?.name}
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        {categoryIcons[fullScreenPlant?.category] || <Sprout className="w-5 h-5" />}
                      </div>
                      {fullScreenPlant?.name}
                    </>
                  )}
                </h1>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullScreenOpen(false)}
                className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {fullScreenPlant &&
                <div className="space-y-4 md:space-y-6">
                  {fullScreenPlant.eventType === 'planting_group' ?
                    <div className="space-y-3 md:space-y-4">
                      <div className="p-3 md:p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/30">
                        <p className="text-muted-foreground leading-relaxed text-xs md:text-sm">
                          This planting window is optimal for {fullScreenPlant.plants?.length} {fullScreenPlant.category} plants in your garden.
                        </p>
                      </div>
                      <div className="space-y-2 md:space-y-3">
                        <h3 className="font-semibold text-foreground text-sm md:text-base">Your Plants in this Group:</h3>
                        {fullScreenPlant.plants?.map((plant, index) =>
                          <div
                            key={index}
                            className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-muted/30 rounded-lg border border-border/30 cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleOpenFullScreen(plant, 'planting')}>

                            <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white flex-shrink-0">
                              {categoryIcons[plant.category] || <Sprout className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                              <span className="font-medium text-foreground text-sm">{plant.name}</span>
                              <p className="text-xs text-muted-foreground">Tap to view planting details</p>
                            </div>
                            <Sprout className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div> :
                  fullScreenPlant.eventType === 'harvest' ?
                    <div className="space-y-3 md:space-y-4">
                      {/* Harvest Details */}
                      <div className="p-3 md:p-4 bg-gradient-to-r from-yellow-100/30 to-yellow-100/10 rounded-lg border border-yellow-300/60 space-y-1.5 md:space-y-2">
                        <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm md:text-base">
                          <SunIcon className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
                          Harvest Information
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          This is an estimated harvest window for your <span className="font-bold text-foreground">{fullScreenPlant.name}</span>.
                          Its status is <Badge variant="secondary" className="text-xs">{fullScreenPlant.status === 'harvested' ? 'Harvested' : 'Estimated'}</Badge>.
                        </p>
                      </div>

                      {/* Key Harvest Dates/Times */}
                      <div className="space-y-1.5 md:space-y-2">
                        <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm md:text-base">
                          <Clock className="w-4 h-4 text-secondary" />
                          Key Dates
                        </h3>
                        <div className="grid grid-cols-2 gap-3 md:gap-4 p-3 md:p-4 bg-muted/30 rounded-lg border border-border/20 text-xs md:text-sm">
                          {fullScreenPlant.actualPlantingDate && <div>
                            <p className="text-muted-foreground text-[10px] md:text-xs mb-0.5 md:mb-1">Planted On</p>
                            <p className="font-medium text-foreground">{format(new Date(fullScreenPlant.actualPlantingDate), 'MMMM d, yyyy')}</p>
                          </div>}
                          {fullScreenPlant.plantData?.days_to_maturity && <div>
                            <p className="text-muted-foreground text-[10px] md:text-xs mb-0.5 md:mb-1">Days to Maturity</p>
                            <p className="font-medium text-foreground">{fullScreenPlant.plantData.days_to_maturity} days</p>
                          </div>}
                          {fullScreenPlant.category && <div>
                            <p className="text-muted-foreground text-[10px] md:text-xs mb-0.5 md:mb-1">Category</p>
                            <p className="font-medium text-foreground capitalize">{fullScreenPlant.category}</p>
                          </div>}
                          {fullScreenPlant.status && <div>
                            <p className="text-muted-foreground text-[10px] md:text-xs mb-0.5 md:mb-1">Status</p>
                            <Badge variant="secondary" className="font-medium capitalize">{fullScreenPlant.status}</Badge>
                          </div>}
                        </div>
                      </div>

                      {/* Growing Tips (if available from plantData) */}
                      {fullScreenPlant.plantData?.growing_tips &&
                        <div className="space-y-1.5 md:space-y-2">
                          <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm md:text-base">
                            <Sparkles className="w-4 h-4 text-secondary" />
                            Gardener's Tips
                          </h3>
                          <div className="p-3 md:p-4 bg-muted/30 rounded-lg border border-border/20">
                            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{fullScreenPlant.plantData.growing_tips}</p>
                          </div>
                        </div>
                      }
                    </div>
                  : // Default for 'planting' eventType
                    <div className="space-y-3 md:space-y-4">
                      {/* Planting Window Info */}
                      <div className="p-3 md:p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/30 space-y-1.5 md:space-y-2">
                        <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm md:text-base">
                          <CalendarCheck className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                          Optimal Planting Time
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          This is a prime time for planting <span className="font-bold text-foreground">{fullScreenPlant.name}</span> in your zone (<span className="font-bold text-foreground">{user.growing_zone}</span>).
                        </p>
                        <Badge variant="secondary" className="text-xs">{fullScreenPlant.season} Planting: {fullScreenPlant.optimalWeeks}</Badge>
                      </div>

                      {/* Planting Instructions */}
                      <div className="space-y-1.5 md:space-y-2">
                        <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm md:text-base">
                          <Ruler className="w-4 h-4 text-secondary" />
                          How to Plant
                        </h3>
                        <div className="grid grid-cols-2 gap-3 md:gap-4 p-3 md:p-4 bg-muted/30 rounded-lg border border-border/20 text-xs md:text-sm">
                          <div>
                            <p className="text-muted-foreground text-[10px] md:text-xs mb-0.5 md:mb-1">Spacing</p>
                            <p className="font-medium text-foreground">{fullScreenPlant.plantData?.spacing || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-[10px] md:text-xs mb-0.5 md:mb-1">Planting Depth</p>
                            <p className="font-medium text-foreground">{fullScreenPlant.plantData?.planting_depth || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-[10px] md:text-xs mb-0.5 md:mb-1">Sunlight</p>
                            <p className="font-medium text-foreground capitalize">{fullScreenPlant.plantData?.sun_requirements?.replace(/_/g, ' ') || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-[10px] md:text-xs mb-0.5 md:mb-1">Water Needs</p>
                            <p className="font-medium text-foreground capitalize">{fullScreenPlant.plantData?.water_needs || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Growing Tips */}
                      {fullScreenPlant.plantData?.growing_tips &&
                        <div className="space-y-1.5 md:space-y-2">
                          <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm md:text-base">
                            <Sparkles className="w-4 h-4 text-secondary" />
                            Gardener's Tips
                          </h3>
                          <div className="p-3 md:p-4 bg-muted/30 rounded-lg border border-border/20">
                            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{fullScreenPlant.plantData.growing_tips}</p>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>

          </DialogContent>
        </Dialog>

        {/* Regular Event Dialog */}
        <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
          <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedEvent?.eventType === 'multiple' ? <><CalendarIcon className="w-5 h-5 text-primary" /> {selectedEvent.name}</> :
                  selectedEvent?.eventType === 'harvest' ? <SunIcon className="w-5 h-5 text-yellow-600" /> :
                    selectedEvent?.eventType === 'reminder' ? <CalendarIcon className="w-5 h-5 text-purple-600" /> :
                      categoryIcons[selectedEvent?.category] || <Sprout className="w-5 h-5 text-gray-500" />}
                {selectedEvent?.eventType !== 'multiple' && (selectedEvent?.name || selectedEvent?.title)}
              </DialogTitle>
            </DialogHeader>
            {selectedEvent &&
              <div className="space-y-4">
                {selectedEvent.eventType === 'reminder' &&
                  <>
                    <div><p className="text-sm font-medium text-muted-foreground">Type</p><p className="capitalize">{selectedEvent.type?.replace(/_/g, ' ')}</p></div>
                    <div><p className="text-sm font-medium text-muted-foreground">Description</p><p className="text-sm">{selectedEvent.description}</p></div>
                    <div><p className="text-sm font-medium text-muted-foreground">Status</p><Badge className={selectedEvent.is_completed ? 'bg-gray-500 text-white' : 'bg-purple-500 text-white'}>{selectedEvent.is_completed ? 'Completed' : 'Pending'}</Badge></div>
                  </>
                }
                {selectedEvent.eventType !== 'reminder' && selectedEvent.eventType !== 'multiple' &&
                  <div><p className="text-sm font-medium text-muted-foreground">Category</p><p className="capitalize">{selectedEvent.category}</p></div>
                }
                {selectedEvent.eventType === 'harvest' &&
                  <>
                    <div><p className="text-sm font-medium text-muted-foreground">Status</p><Badge className={selectedEvent.status === 'harvested' ? 'bg-gray-500' : 'bg-yellow-500'}>{selectedEvent.status === 'harvested' ? 'Harvested' : 'Estimated Harvest'}</Badge></div>
                    {selectedEvent.actualPlantingDate && <div><p className="text-sm font-medium text-muted-foreground">Planted On</p><p>{format(new Date(selectedEvent.actualPlantingDate), 'MMMM d, yyyy')}</p></div>}
                    {selectedEvent.plantData?.days_to_maturity && <div><p className="text-sm font-medium text-muted-foreground">Days to Maturity</p><p>{selectedEvent.plantData.days_to_maturity} days</p></div>}
                  </>
                }
                {selectedEvent.eventType === 'planting' &&
                  <>
                    <div><p className="text-sm font-medium text-muted-foreground">Event Type</p><p>Optimal Planting Window</p></div>
                    {selectedEvent.plantData?.days_to_maturity && <div><p className="text-sm font-medium text-muted-foreground">Days to Maturity</p><p>{selectedEvent.plantData.days_to_maturity} days</p></div>}
                  </>
                }
                {selectedEvent.plantData?.growing_tips && <div><p className="text-sm font-medium text-muted-foreground">Growing Tips</p><p className="text-sm">{selectedEvent.plantData.growing_tips}</p></div>}
              </div>
            }
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>Close</Button>
              {selectedEvent?.eventType === 'reminder' && !selectedEvent?.is_completed && <Button onClick={() => { handleCompleteReminder(selectedEvent.id); setIsEventDialogOpen(false); }} className="bg-green-600 hover:bg-green-700 text-white"><CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Complete</Button>}
              {/* For planting and harvest, direct to full screen view */}
              {(selectedEvent?.eventType === 'planting' || selectedEvent?.eventType === 'harvest') && (
                <Button onClick={() => { setIsEventDialogOpen(false); handleOpenFullScreen(selectedEvent, selectedEvent.eventType); }}>
                  {(selectedEvent?.eventType === 'planting') ? <Sprout className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  View Details
                </Button>
              )}
              {(selectedEvent?.userPlantId || (selectedEvent?.eventType === 'reminder' && selectedEvent?.id)) && selectedEvent?.eventType !== 'multiple' &&
                <Button variant="destructive" onClick={() => { handleDeleteEvent(selectedEvent, selectedEvent.eventType); setIsEventDialogOpen(false); }}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {selectedEvent.eventType === 'reminder' ? 'Delete Reminder' : 'Remove from Garden'}
                </Button>
              }
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>);

}