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
  Cloud,
  ListChecks,
  TrendingUp
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  vegetables: "bg-gradient-to-r from-green-500/40 to-green-500/30 text-green-100 border border-green-500/50 backdrop-blur-sm",
  herbs: "bg-gradient-to-r from-teal-500/40 to-teal-500/30 text-teal-100 border border-teal-500/50 backdrop-blur-sm",
  flowers: "bg-gradient-to-r from-pink-500/40 to-pink-500/30 text-pink-100 border border-pink-500/50 backdrop-blur-sm",
  fruits: "bg-gradient-to-r from-red-500/40 to-red-500/30 text-red-100 border border-red-500/50 backdrop-blur-sm",
  grains: "bg-gradient-to-r from-yellow-500/40 to-yellow-500/30 text-yellow-100 border border-yellow-500/50 backdrop-blur-sm",
  direct_sow: "bg-gradient-to-r from-emerald-500/40 to-emerald-500/30 text-emerald-100 border border-emerald-500/50 backdrop-blur-sm",
  transplant: "bg-gradient-to-r from-blue-500/40 to-blue-500/30 text-blue-100 border border-blue-500/50 backdrop-blur-sm"
};

const categoryIcons = {
  vegetables: <Leaf className="w-3 h-3" />,
  herbs: <Sprout className="w-3 h-3" />,
  flowers: <Flower className="w-3 h-3" />,
  fruits: <Sprout className="w-3 h-3" />,
  grains: <Sprout className="w-3 h-3" />,
  direct_sow: <Sprout className="w-3 h-3" />,
  transplant: <Flower className="w-3 h-3" />
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
  const [justSynced, setJustSynced] = useState(false);
  const { toast } = useToast();

  // Swipe gesture state
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

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
    
    // Auto-sync in background after page loads (silent sync)
    const autoSync = async () => {
      try {
        await handleSyncGoogleCalendar(true);
      } catch (error) {
        // Silent fail for background sync
      }
    };
    
    // Wait 2 seconds after initial load to auto-sync
    const timer = setTimeout(() => {
      autoSync();
    }, 2000);
    
    return () => clearTimeout(timer);
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

  const processCalendarEvents = useCallback((userPlants, userZone2, plantMap) => {
    const userZone = userZone2;
    const plantings = {};
    const harvests = {};
    const currentYear = getYear(currentDate); // Make sure this uses the component's currentDate

    userPlants.forEach((userPlant) => {
      const plantData = plantMap[userPlant.plant_id];
      if (!plantData) return;

      let hasSpecificPlantingData = false;

      // Direct Sow events (date-based)
      if (userPlant.status === 'planned' && plantData.direct_sow_zones) {
        const dsZone = plantData.direct_sow_zones.find(z => z.zone === userZone || z.zone === userZone.substring(0, userZone.length - 1));
        if (dsZone?.from) {
          const fromDate = new Date(`${currentYear}-${dsZone.from}`);
          const toDate = dsZone.to ? new Date(`${currentYear}-${dsZone.to}`) : fromDate;
          if (!isNaN(fromDate.getTime())) {
            const startWeek = getWeek(fromDate, { weekStartsOn: 0 });
            const endWeek = getWeek(toDate, { weekStartsOn: 0 });
            for (let week = startWeek; week <= endWeek; week++) {
              const weekKey = `${currentYear}-${week}`;
              if (!plantings[weekKey]) plantings[weekKey] = [];
              plantings[weekKey].push({
                name: plantData.name,
                category: 'direct_sow',
                userPlantId: userPlant.id,
                plantData,
                season: 'Direct Sow',
                optimalWeeks: `${dsZone.from} – ${dsZone.to || dsZone.from}`,
                eventType: 'planting'
              });
            }
          }
        }
      }

      // Transplant events (date-based)
      if (userPlant.status === 'planned' && plantData.transplant_zones) {
        const txZone = plantData.transplant_zones.find(z => z.zone === userZone || z.zone === userZone.substring(0, userZone.length - 1));
        if (txZone) {
          const fromMMDD = txZone.transplant_from || txZone.from;
          const toMMDD = txZone.transplant_to || txZone.to;
          if (fromMMDD) {
            const fromDate = new Date(`${currentYear}-${fromMMDD}`);
            const toDate = toMMDD ? new Date(`${currentYear}-${toMMDD}`) : fromDate;
            if (!isNaN(fromDate.getTime())) {
              const startWeek = getWeek(fromDate, { weekStartsOn: 0 });
              const endWeek = getWeek(toDate, { weekStartsOn: 0 });
              for (let week = startWeek; week <= endWeek; week++) {
                const weekKey = `${currentYear}-${week}`;
                if (!plantings[weekKey]) plantings[weekKey] = [];
                plantings[weekKey].push({
                  name: plantData.name,
                  category: 'transplant',
                  userPlantId: userPlant.id,
                  plantData,
                  season: 'Transplant',
                  optimalWeeks: `${fromMMDD} – ${toMMDD || fromMMDD}`,
                  eventType: 'planting'
                });
              }
            }
          }
        }
      }

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

  const handleSyncGoogleCalendar = async (silent = false) => {
    setIsSyncing(true);
    try {
      const response = await syncGoogleCalendar({ action: 'sync' });
      
      if (response.data.success) {
        const { created, updated, errors } = response.data.results;
        
        if (!silent) {
          const toastId = toast({
            title: "Google Calendar Synced",
            description: `Created ${created} events, updated ${updated} events${errors.length > 0 ? `, ${errors.length} errors` : ''}`,
          });
          
          // Auto dismiss after 3 seconds
          setTimeout(() => {
            if (toastId?.dismiss) toastId.dismiss();
          }, 3000);
        }
        
        // Refresh plant data
        const userPlants = await UserPlant.filter({ created_by: user.email });
        setRawUserPlants(userPlants);
        
        // Show success state
        if (!silent) {
          setJustSynced(true);
          setTimeout(() => setJustSynced(false), 3000);
        }
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      if (!silent) {
        const toastId = toast({
          title: "Sync Failed",
          description: error.message || "Failed to sync with Google Calendar",
          variant: "destructive",
        });
        
        setTimeout(() => {
          if (toastId?.dismiss) toastId.dismiss();
        }, 3000);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Get all planting events for the current month
  const getMonthPlantings = useCallback(() => {
    const plantingEvents = [];
    const currentYear = getYear(currentDate);
    const currentMonth = currentDate.getMonth();
    
    Object.entries(plantingsByWeek).forEach(([weekKey, plants]) => {
      plants.forEach(plant => {
        const [year, week] = weekKey.split('-').map(Number);
        if (year === currentYear) {
          // Approximate week to month
          const weekDate = new Date(year, 0, 1 + (week - 1) * 7);
          if (weekDate.getMonth() === currentMonth) {
            plantingEvents.push({
              ...plant,
              weekKey,
              weekNumber: week,
              date: weekDate
            });
          }
        }
      });
    });
    
    return plantingEvents.sort((a, b) => a.weekNumber - b.weekNumber);
  }, [plantingsByWeek, currentDate]);

  // Get all harvest events for the current month
  const getMonthHarvests = useCallback(() => {
    const harvestEvents = [];
    const currentMonth = currentDate.getMonth();
    const currentYear = getYear(currentDate);
    
    Object.entries(harvestsByDate).forEach(([dateKey, harvests]) => {
      const date = new Date(dateKey);
      if (date.getMonth() === currentMonth && getYear(date) === currentYear) {
        harvests.forEach(harvest => {
          harvestEvents.push({
            ...harvest,
            dateKey,
            date
          });
        });
      }
    });
    
    return harvestEvents.sort((a, b) => a.date - b.date);
  }, [harvestsByDate, currentDate]);

  // Get all reminders for the current month
  const getMonthReminders = useCallback(() => {
    const reminderEvents = [];
    const currentMonth = currentDate.getMonth();
    const currentYear = getYear(currentDate);
    
    Object.entries(remindersByDate).forEach(([dateKey, reminders]) => {
      const date = new Date(dateKey);
      if (date.getMonth() === currentMonth && getYear(date) === currentYear) {
        reminders.forEach(reminder => {
          reminderEvents.push({
            ...reminder,
            dateKey,
            date: new Date(dateKey)
          });
        });
      }
    });
    
    return reminderEvents.sort((a, b) => a.date - b.date);
  }, [remindersByDate, currentDate]);

  const monthPlantings = getMonthPlantings();
  const monthHarvests = getMonthHarvests();
  const monthReminders = getMonthReminders();

  // Swipe handling
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      setCurrentDate(addMonths(currentDate, 1));
    }
    if (isRightSwipe) {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const Header = () =>
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-3">
      <h1 className="text-xl md:text-3xl font-bold text-foreground whitespace-nowrap">
        {format(currentDate, "MMMM yyyy")}
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
        {!justSynced && (
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
        )}
      </div>
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
      <div className="max-w-5xl mx-auto w-full">
        <Header />
        
        <Tabs defaultValue="all" className="w-full" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all" className="text-xs md:text-sm">
              <CalendarIcon className="w-4 h-4 mr-1 md:mr-2" />
              All Events
            </TabsTrigger>
            <TabsTrigger value="planting" className="text-xs md:text-sm">
              <Sprout className="w-4 h-4 mr-1 md:mr-2" />
              Planting
            </TabsTrigger>
            <TabsTrigger value="harvest" className="text-xs md:text-sm">
              <SunIcon className="w-4 h-4 mr-1 md:mr-2" />
              Harvest
            </TabsTrigger>
            <TabsTrigger value="reminders" className="text-xs md:text-sm">
              <ListChecks className="w-4 h-4 mr-1 md:mr-2" />
              Tasks
            </TabsTrigger>
          </TabsList>

          {/* All Events Tab */}
          <TabsContent value="all" className="space-y-3">
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto space-y-3 pr-2">
              {monthPlantings.length === 0 && monthHarvests.length === 0 && monthReminders.length === 0 ? (
                <Card className="border-border">
                  <CardContent className="p-8 text-center">
                    <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No events scheduled for this month</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {[...monthPlantings.map(p => ({...p, type: 'planting'})), 
                    ...monthHarvests.map(h => ({...h, type: 'harvest'})),
                    ...monthReminders.map(r => ({...r, type: 'reminder'}))]
                    .sort((a, b) => a.date - b.date)
                    .map((event, idx) => {
                      if (event.type === 'planting') {
                        return (
                          <Card key={`planting-${idx}`} className="border-border hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleOpenFullScreen(event, 'planting')}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${categoryColors[event.category]}`}>
                                  {categoryIcons[event.category]}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-foreground mb-1">{event.name}</h3>
                                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    <Badge variant="outline" className="text-xs">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Week {event.weekNumber}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {event.season}
                                    </Badge>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event, 'planting'); }}>
                                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      } else if (event.type === 'harvest') {
                        return (
                          <Card key={`harvest-${idx}`} className="border-border hover:border-yellow-500/50 transition-colors cursor-pointer" onClick={() => handleOpenFullScreen(event, 'harvest')}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-yellow-500/40 to-orange-500/30 border border-yellow-500/50">
                                  <SunIcon className="w-5 h-5 text-yellow-100" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-foreground mb-1">{event.name}</h3>
                                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    <Badge variant="outline" className="text-xs">
                                      <CalendarIcon className="w-3 h-3 mr-1" />
                                      {format(event.date, 'MMM d, yyyy')}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs capitalize">
                                      {event.status}
                                    </Badge>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event, 'harvest'); }}>
                                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      } else {
                        return (
                          <Card key={`reminder-${idx}`} className={`border-border hover:border-purple-500/50 transition-colors cursor-pointer ${event.is_completed ? 'opacity-60' : ''}`} onClick={() => handleViewEvent(event, 'reminder')}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${event.is_completed ? 'bg-gray-200 dark:bg-gray-800' : 'bg-purple-100 dark:bg-purple-900/40'}`}>
                                  {event.is_completed ? <CheckCircle2 className="w-5 h-5 text-gray-500" /> : <ListChecks className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className={`font-semibold mb-1 ${event.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{event.title}</h3>
                                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    <Badge variant="outline" className="text-xs">
                                      <CalendarIcon className="w-3 h-3 mr-1" />
                                      {format(event.date, 'MMM d, yyyy')}
                                    </Badge>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event, 'reminder'); }}>
                                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      }
                    })}
                </>
              )}
            </div>
          </TabsContent>

          {/* Planting Tab */}
          <TabsContent value="planting" className="space-y-3">
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto space-y-3 pr-2">
              {monthPlantings.length === 0 ? (
                <Card className="border-border">
                  <CardContent className="p-8 text-center">
                    <Sprout className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No planting windows this month</p>
                  </CardContent>
                </Card>
              ) : (
                monthPlantings.map((planting, idx) => (
                  <Card key={idx} className="border-border hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleOpenFullScreen(planting, 'planting')}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${categoryColors[planting.category]}`}>
                          {categoryIcons[planting.category]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground mb-1">{planting.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{planting.optimalWeeks}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              Week {planting.weekNumber}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {planting.season}
                            </Badge>
                            <Badge className={categoryColors[planting.category] || "bg-gradient-to-r from-slate-500/40 to-slate-500/30 text-slate-100 border border-slate-500/50"}>
                              {planting.category === 'direct_sow' ? 'Direct Sow' : planting.category === 'transplant' ? 'Transplant' : planting.category}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteEvent(planting, 'planting'); }}>
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Harvest Tab */}
          <TabsContent value="harvest" className="space-y-3">
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto space-y-3 pr-2">
              {monthHarvests.length === 0 ? (
                <Card className="border-border">
                  <CardContent className="p-8 text-center">
                    <SunIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No harvests scheduled this month</p>
                  </CardContent>
                </Card>
              ) : (
                monthHarvests.map((harvest, idx) => (
                  <Card key={idx} className="border-border hover:border-yellow-500/50 transition-colors cursor-pointer" onClick={() => handleOpenFullScreen(harvest, 'harvest')}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-yellow-500/40 to-orange-500/30 border border-yellow-500/50">
                          <SunIcon className="w-5 h-5 text-yellow-100" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground mb-1">{harvest.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {harvest.actualPlantingDate && `Planted ${format(new Date(harvest.actualPlantingDate), 'MMM d')}`}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs">
                              <CalendarIcon className="w-3 h-3 mr-1" />
                              {format(harvest.date, 'MMM d, yyyy')}
                            </Badge>
                            <Badge variant="secondary" className="text-xs capitalize">
                              {harvest.status}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteEvent(harvest, 'harvest'); }}>
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders" className="space-y-3">
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto space-y-3 pr-2">
              {monthReminders.length === 0 ? (
                <Card className="border-border">
                  <CardContent className="p-8 text-center">
                    <ListChecks className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No tasks or reminders this month</p>
                  </CardContent>
                </Card>
              ) : (
                monthReminders.map((reminder, idx) => (
                  <Card key={idx} className={`border-border hover:border-purple-500/50 transition-colors cursor-pointer ${reminder.is_completed ? 'opacity-60' : ''}`} onClick={() => handleViewEvent(reminder, 'reminder')}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${reminder.is_completed ? 'bg-gray-200 dark:bg-gray-800' : 'bg-purple-100 dark:bg-purple-900/40'}`}>
                          {reminder.is_completed ? <CheckCircle2 className="w-5 h-5 text-gray-500" /> : <ListChecks className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold mb-1 ${reminder.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{reminder.title}</h3>
                          {reminder.description && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{reminder.description}</p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs">
                              <CalendarIcon className="w-3 h-3 mr-1" />
                              {format(reminder.date, 'MMM d, yyyy')}
                            </Badge>
                            {!reminder.is_completed && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 px-2 text-xs"
                                onClick={(e) => { e.stopPropagation(); handleCompleteReminder(reminder.id); }}
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Complete
                              </Button>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteEvent(reminder, 'reminder'); }}>
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

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


            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
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

                {/* Remove Plant Button */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-card via-card to-transparent border-t border-border">
                <Button
                onClick={() => {
                  if (fullScreenPlant?.eventType === 'planting_group' && fullScreenPlant?.plants?.length > 0) {
                    // Delete all plants in the group
                    fullScreenPlant.plants.forEach(plant => {
                      handleDeleteEvent(plant, 'planting');
                    });
                  } else {
                    handleDeleteEvent(fullScreenPlant, fullScreenPlant?.eventType);
                  }
                  setIsFullScreenOpen(false);
                }}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg hover:shadow-red-500/50 transition-all duration-300 relative overflow-hidden group"
                size="lg"
                >
                <div className="absolute inset-0 bg-red-400/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300" />
                <Trash2 className="w-5 h-5 mr-2 relative z-10" />
                <span className="relative z-10">Remove Plant</span>
                </Button>
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