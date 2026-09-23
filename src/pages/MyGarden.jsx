import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { UserPlant } from "@/entities/UserPlant";
import { Plant } from "@/entities/Plant";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Sprout, Leaf, Sun, Clock, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { addDays, format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter } from
"@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction } from
"@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import LoginPrompt from "../components/auth/LoginPrompt";
import LoadingSpinner from "../components/common/LoadingSpinner";
import GardenStats from "../components/garden/GardenStats";
import GardenSection from "../components/garden/GardenSection";
import PixelGarden from "../components/garden/PixelGarden";
import PlantDetailBody from "../components/library/PlantDetailBody";
import { useQueryClient } from '@tanstack/react-query';
import PlantReminderDialog from '@/components/garden/PlantReminderDialog';
import GardenReminders from '@/components/garden/GardenReminders';
import SeasonGoalPanel from '@/components/garden/SeasonGoalPanel';
import ProFeatureDialog from '@/components/freemium/ProFeatureDialog';

export default function MyGarden() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPixel, setShowPixel] = useState(false);
  const [reminderPlant, setReminderPlant] = useState(null);
  const [proFeature, setProFeature] = useState('');
  const [saving, setSaving] = useState(false);
  const handleRemind = plant => user?.is_premium ? setReminderPlant(plant) : setProFeature('Planting reminders');
  const [myPlants, setMyPlants] = useState([]);
  const [plantDataMap, setPlantDataMap] = useState({}); // To store full plant data
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // State for the date picker dialog
  const [isPlantedDialogOpen, setIsPlantedDialogOpen] = useState(false);
  const [plantToDelete, setPlantToDelete] = useState(null);
  const [plantToUpdate, setPlantToUpdate] = useState(null);
  const [selectedPlantingDate, setSelectedPlantingDate] = useState(null);
  const [pendingActionLabel, setPendingActionLabel] = useState(null);

  // State for plant detail view
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedUserPlant, setSelectedUserPlant] = useState(null);

  // Track active theme for pixel-garden night rendering
  const [isNight, setIsNight] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark') ||
    localStorage.getItem('user-theme') === 'dark';
  });

  useEffect(() => {
    const sync = () => {
      setIsNight(
        document.documentElement.classList.contains('dark') ||
        localStorage.getItem('user-theme') === 'dark'
      );
    };
    sync();
    window.addEventListener('theme-updated', sync);
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      window.removeEventListener('theme-updated', sync);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    loadMyGarden();
  }, []);

  const loadMyGarden = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const [userPlants, allPlants] = await Promise.all([
      UserPlant.filter({ created_by_id: currentUser.id }, '-created_date', 2000),
      Plant.list('name', 2000)]
      );

      const plantMap = {};
      allPlants.forEach((p) => {plantMap[p.id] = p;});
      setPlantDataMap(plantMap);

      setMyPlants(userPlants);
    } catch (error) {
      console.error("Error loading my garden:", error);
      setUser(null); // Set user to null if authentication fails
    } finally {
      setIsLoading(false);
    }
  };

  const updatePlantStatus = async (plantId, newStatus, plantingDate, action) => {
    if (saving) return false;
    setSaving(true);
    try {
      const userPlant = myPlants.find(p => p.id === plantId);
      if (!userPlant) return false;
      const details = plantDataMap[userPlant.plant_id] || Object.values(plantDataMap).find(p => p.name?.toLowerCase() === userPlant.plant_name?.toLowerCase());
      const date = plantingDate || new Date();
      const dateText = format(date, 'yyyy-MM-dd');
      const update = { status: newStatus };
      if (newStatus === 'planted') {
        update.actual_planting_date = userPlant.actual_planting_date || dateText;
        if (action === 'seed_start') { update.seed_started_date = dateText; update.planting_method = 'seed_start'; }
        if (action === 'transplant') { update.transplant_date = dateText; update.planting_method = 'transplant'; }
        if (action === 'direct_sow') update.planting_method = 'direct_sow';
        if (details?.days_to_maturity && action !== 'seed_start') update.harvest_date = format(addDays(date, details.days_to_maturity), 'yyyy-MM-dd');
      }
      if (newStatus === 'harvested') update.harvest_date = dateText;
      if (newStatus === 'planned') Object.assign(update, { actual_planting_date: null, harvest_date: null, seed_started_date: null, transplant_date: null });
      await UserPlant.update(plantId, update);
      setMyPlants(prev => prev.map(p => p.id === plantId ? { ...p, ...update } : p));
      queryClient.invalidateQueries({ queryKey: ['plant-collection'] });
      toast({ title: 'Garden updated', description: `${userPlant.plant_name} is up to date.` });
      return true;
    } catch (error) { toast({ title: 'Could not save your change', description: error.message, variant: 'destructive' }); return false; }
    finally { setSaving(false); }
  };

  const deletePlant = async (plantId) => {
    try {
      await UserPlant.delete(plantId);
      setMyPlants(prev => prev.filter(p => p.id !== plantId));
      queryClient.invalidateQueries({ queryKey: ['plant-collection'] });
    } catch (error) {
      toast({ title: 'Could not remove the plant', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteRequest = (plantId) => {
    setPlantToDelete(plantId);
  };

  const confirmDelete = async () => {
    const id = plantToDelete;
    setPlantToDelete(null);
    if (id) {
      await deletePlant(id);
    }
  };

  const handleOpenPlantedDialog = (plant, actionLabel = null) => {
    setPlantToUpdate(plant);
    setPendingActionLabel(actionLabel);
    // Use existing plant date if available, otherwise default to today
    const initialDate = plant.actual_planting_date ? new Date(plant.actual_planting_date) : new Date();
    setSelectedPlantingDate(initialDate);
    setIsPlantedDialogOpen(true);
  };

  const handleConfirmPlantedDate = async () => {
    if (!plantToUpdate || !selectedPlantingDate) return;
    const saved = await updatePlantStatus(plantToUpdate.id, 'planted', selectedPlantingDate, pendingActionLabel);
    if (saved) { setIsPlantedDialogOpen(false); setPlantToUpdate(null); setPendingActionLabel(null); }
  };

  const handlePlantClick = (userPlant) => {
    if (!userPlant) {setSelectedPlant(null);setSelectedUserPlant(null);return;}
    const byName = (userPlant.plant_name || '').toLowerCase();
    const plantDetails =
    plantDataMap[userPlant.plant_id] ||
    Object.values(plantDataMap).find((p) =>
    p.name && p.name.toLowerCase() === byName ||
    p.common_name && p.common_name.toLowerCase() === byName
    ) ||
    { name: userPlant.plant_name };
    setSelectedUserPlant(userPlant);
    setSelectedPlant(plantDetails);
  };

  const selectedUserPlantData = selectedPlant ?
  myPlants.find((up) => up.plant_id === selectedPlant.id) :
  null;

  const userPlantIds = new Set(myPlants.map((p) => p.plant_id));

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4 md:p-6">
        <LoadingSpinner message="Tending to your garden..." size="large" />
      </div>);

  }

  if (!user) {
    return <LoginPrompt />;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 pb-20 md:pb-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <header className="flex justify-between gap-3 items-center"><div><p className="text-xs font-semibold uppercase tracking-widest text-primary">One little step at a time</p><h1 className="text-3xl font-semibold tracking-tight mt-1">My garden</h1><p className="text-sm text-muted-foreground mt-2">{myPlants.filter(p => p.status === 'planted').length} growing · {myPlants.filter(p => p.status === 'planned').length} planned · {myPlants.filter(p => p.status === 'harvested').length} harvested</p></div><Button asChild variant="outline" size="sm" className="rounded-xl"><Link to="/PlantLibrary"><PlusCircle className="w-4 h-4" />Add plants</Link></Button></header>

        {myPlants.length === 0 ?
        <Card className="text-center py-16 md:py-20 bg-card border-border">
            <CardContent className="p-4 md:p-6">
              <Leaf className="w-12 h-12 md:w-16 md:h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">Your garden is empty!</h2>
              <p className="text-muted-foreground mb-6 text-sm md:text-base">
                Add some plants from the library to get started.
              </p>
              <Link
                to={createPageUrl("PlantLibrary")}
                className="group relative inline-block w-full md:w-auto">
                {/* Glow effect */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 opacity-40 blur-md transition-all duration-300 group-hover:opacity-80 group-hover:blur-lg dark:opacity-30 dark:group-hover:opacity-70" />
                <Button className="relative w-full md:w-auto bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Go to Plant Library
                </Button>
              </Link>
            </CardContent>
          </Card> :

        <div className="space-y-6">
            {/* Task cards are the default view; the playful garden is opt-in below. */}

            {selectedPlant &&
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <PlantDetailBody
              plant={selectedPlant}
              userZone={user?.growing_zone}
              onOpenChange={(isOpen) => {if (!isOpen) {setSelectedPlant(null);setSelectedUserPlant(null);}}}
              onAddPlant={() => {}}
              isAdded={!!selectedUserPlant}
              userPlantData={selectedUserPlant}
              animated={false} />
            
              </div>
          }

            {/* Growing Plants */}
            <GardenSection
            title="Currently Growing"
            icon={Sprout}
            color="text-green-500"
            plants={myPlants.filter((p) => p.status === 'planted')}
            plantDataMap={plantDataMap}
            onStatusChange={updatePlantStatus}
            onOpenPlantedDialog={handleOpenPlantedDialog}
            onDelete={handleDeleteRequest}
            onPlantClick={handlePlantClick}
            userZone={user?.growing_zone}
            onRemind={handleRemind}
            isPremium={user?.is_premium} />


            {/* Planned Plants */}
            <GardenSection
            title="Planned"
            icon={Clock}
            color="text-blue-500"
            plants={myPlants.filter((p) => p.status === 'planned')}
            plantDataMap={plantDataMap}
            onStatusChange={updatePlantStatus}
            onOpenPlantedDialog={handleOpenPlantedDialog}
            onDelete={handleDeleteRequest}
            onPlantClick={handlePlantClick}
            userZone={user?.growing_zone}
            onRemind={handleRemind}
            isPremium={user?.is_premium} />


            {/* Harvested Plants */}
            <GardenSection
            title="Harvested"
            icon={Sun}
            color="text-amber-500"
            plants={myPlants.filter((p) => p.status === 'harvested')}
            plantDataMap={plantDataMap}
            onStatusChange={updatePlantStatus}
            onOpenPlantedDialog={handleOpenPlantedDialog}
            onDelete={handleDeleteRequest}
            onPlantClick={handlePlantClick}
            userZone={user?.growing_zone}
            onRemind={handleRemind}
            isPremium={user?.is_premium} />

          </div>
        }
        <div className="grid sm:grid-cols-2 gap-4">{user.is_premium && <GardenReminders user={user} />}<SeasonGoalPanel user={user} onUpdate={setUser} onUpgrade={setProFeature} onRemind={handleRemind} /></div>
        {myPlants.length > 0 && <section className="rounded-2xl border border-border overflow-hidden"><button className="w-full p-4 text-left text-sm font-medium hover:bg-muted/30" aria-expanded={showPixel} onClick={() => setShowPixel(!showPixel)}>{showPixel ? 'Hide' : 'Show'} pixel garden · a little fun view</button>{showPixel && <PixelGarden userPlants={myPlants} night={isNight} plantDataMap={plantDataMap} onOpenDetails={handlePlantClick} />}</section>}
      </div>
      <ProFeatureDialog feature={proFeature} onClose={() => setProFeature('')} />
      {reminderPlant && <PlantReminderDialog plant={reminderPlant} isPremium={user.is_premium} onClose={() => setReminderPlant(null)} onSaved={() => { queryClient.invalidateQueries({ queryKey: ['garden-reminders'] }); toast({ title: 'Reminder saved', description: 'Find it in your Garden and Calendar.' }); }} />}

      <Dialog open={isPlantedDialogOpen} onOpenChange={setIsPlantedDialogOpen}>
        <DialogContent className="bg-background p-6 rounded-2xl fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-[calc(100%-2rem)] sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{pendingActionLabel === 'transplant' ? 'When did you transplant?' : pendingActionLabel === 'seed_start' ? 'When did you start seeds?' : 'When did you plant?'}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Calendar
              mode="single"
              selected={selectedPlantingDate}
              onSelect={setSelectedPlantingDate}
              disabled={{ after: new Date(), ...(pendingActionLabel === 'transplant' && plantToUpdate?.seed_started_date ? { before: new Date(plantToUpdate.seed_started_date + 'T00:00:00') } : {}) }}
              className="rounded-md border"
              initialFocus />

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPlantedDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saving || !selectedPlantingDate} onClick={handleConfirmPlantedDate} className="bg-primary text-primary-foreground my-1 px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-10">Confirm Date</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!plantToDelete} onOpenChange={(open) => {if (!open) setPlantToDelete(null);}}>
        <AlertDialogContent className="pointer-events-auto bg-card border-border sm:rounded-[28px] rounded-[28px] sm:max-w-[400px] shadow-2xl gap-0 p-6 sm:p-7 w-[calc(100%-32px)]">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <AlertDialogTitle className="text-lg font-semibold text-foreground leading-tight">
                Remove from garden?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                This will remove the plant from your garden. You can add it again later from the Plant Library.
              </AlertDialogDescription>
            </div>
          </div>
          <AlertDialogFooter className="flex-row justify-end gap-2.5 mt-6 sm:justify-end">
            <AlertDialogCancel className="rounded-xl h-10 text-sm px-5 mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="rounded-xl h-10 px-5 text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 mx-0">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>);

}