import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { UserPlant } from "@/entities/UserPlant";
import { Plant } from "@/entities/Plant";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Sprout, Leaf, Sun, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { addDays, format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter } from
"@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import LoginPrompt from "../components/auth/LoginPrompt";
import LoadingSpinner from "../components/common/LoadingSpinner";
import GardenStats from "../components/garden/GardenStats";
import GardenSection from "../components/garden/GardenSection";
import PixelGarden from "../components/garden/PixelGarden";
import PlantDetailView from "../components/library/PlantDetailView";

export default function MyGarden() {
  const [myPlants, setMyPlants] = useState([]);
  const [plantDataMap, setPlantDataMap] = useState({}); // To store full plant data
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // State for the date picker dialog
  const [isPlantedDialogOpen, setIsPlantedDialogOpen] = useState(false);
  const [plantToUpdate, setPlantToUpdate] = useState(null);
  const [selectedPlantingDate, setSelectedPlantingDate] = useState(null);

  // State for plant detail view
  const [selectedPlant, setSelectedPlant] = useState(null);

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
      UserPlant.filter({ created_by: currentUser.email }),
      Plant.list()]
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

  const updatePlantStatus = async (plantId, newStatus, plantingDate) => {
    try {
      const userPlant = myPlants.find((p) => p.id === plantId);
      if (!userPlant) return;

      let updatePayload = { status: newStatus };

      if (newStatus === 'planted') {
        const plantDetails = plantDataMap[userPlant.plant_id];
        const actualPlantingDate = plantingDate || new Date(); // Use provided date
        updatePayload.actual_planting_date = format(actualPlantingDate, 'yyyy-MM-dd');

        if (plantDetails && plantDetails.days_to_maturity) {
          const estimatedHarvestDate = addDays(actualPlantingDate, plantDetails.days_to_maturity);
          updatePayload.harvest_date = format(estimatedHarvestDate, 'yyyy-MM-dd');
        }
      } else if (newStatus === 'planned') {
        // Clear dates if moved back to planned
        updatePayload.actual_planting_date = null;
        updatePayload.harvest_date = null;
      }

      await UserPlant.update(plantId, updatePayload);

      // Manually update local state to reflect all changes immediately
      setMyPlants((prevPlants) =>
      prevPlants.map((p) => p.id === plantId ? { ...p, ...updatePayload } : p)
      );

    } catch (error) {
      console.error("Error updating plant status:", error);
    }
  };

  const deletePlant = async (plantId) => {
    try {
      await UserPlant.delete(plantId);
    } catch (error) {
      console.error("Error deleting plant:", error);
      // Plant may already be deleted on server, continue to remove from UI
    } finally {
      // Always remove from local state to keep UI in sync
      setMyPlants((prevPlants) => prevPlants.filter((p) => p.id !== plantId));
    }
  };

  const handleOpenPlantedDialog = (plant) => {
    setPlantToUpdate(plant);
    // Use existing plant date if available, otherwise default to today
    const initialDate = plant.actual_planting_date ? new Date(plant.actual_planting_date) : new Date();
    setSelectedPlantingDate(initialDate);
    setIsPlantedDialogOpen(true);
  };

  const handleConfirmPlantedDate = () => {
    if (plantToUpdate && selectedPlantingDate) {
      updatePlantStatus(plantToUpdate.id, 'planted', selectedPlantingDate);
    }
    setIsPlantedDialogOpen(false);
    setPlantToUpdate(null);
  };

  const handlePlantClick = (userPlant) => {
    const plantDetails = plantDataMap[userPlant.plant_id];
    if (plantDetails) {
      setSelectedPlant(plantDetails);
    }
  };

  const selectedUserPlantData = selectedPlant 
    ? myPlants.find(up => up.plant_id === selectedPlant.id)
    : null;

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
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <div className="text-center space-y-3 md:space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">My Garden</h1>
            <p className="text-lg md:text-xl text-secondary font-medium">
              Track and manage all the plants you're growing
            </p>
        </div>

        {myPlants.length === 0 ?
        <Card className="text-center py-16 md:py-20 bg-card border-border">
            <CardContent className="p-4 md:p-6">
              <Leaf className="w-12 h-12 md:w-16 md:h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">Your garden is empty!</h2>
              <p className="text-muted-foreground mb-6 text-sm md:text-base">
                Add some plants from the library to get started.
              </p>
              <Link to={createPageUrl("PlantLibrary")}>
                <Button className="w-full md:w-auto">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Go to Plant Library
                </Button>
              </Link>
            </CardContent>
          </Card> :

        <div className="space-y-6">
            {/* Stats Overview */}
            <GardenStats plants={myPlants} />

            {/* Pixel Garden Visual */}
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-lg bg-gradient-to-br from-card via-card to-secondary/30 backdrop-blur-sm">
              <div className="relative" style={{ opacity: 0.92 }}>
                <PixelGarden
                  userPlants={myPlants}
                  night={isNight}
                  onSelectBed={handlePlantClick}
                />
              </div>
              {/* Dreamy edge fades that blend the pixel art into the card */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-card via-card/70 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card via-card/70 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-card via-card/60 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-card via-card/60 to-transparent" />
              {/* Glassy sheen across the top */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 dark:via-white/5 dark:to-white/10" />
              {/* Soft dreamy glow */}
              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.08)]" />
            </div>

            {/* Growing Plants */}
            <GardenSection
            title="Currently Growing"
            icon={Sprout}
            color="text-green-500"
            plants={myPlants.filter((p) => p.status === 'planted')}
            plantDataMap={plantDataMap}
            onStatusChange={updatePlantStatus}
            onOpenPlantedDialog={handleOpenPlantedDialog}
            onDelete={deletePlant}
            onPlantClick={handlePlantClick}
            userZone={user?.growing_zone} />


            {/* Planned Plants */}
            <GardenSection
            title="Planned"
            icon={Clock}
            color="text-blue-500"
            plants={myPlants.filter((p) => p.status === 'planned')}
            plantDataMap={plantDataMap}
            onStatusChange={updatePlantStatus}
            onOpenPlantedDialog={handleOpenPlantedDialog}
            onDelete={deletePlant}
            onPlantClick={handlePlantClick}
            userZone={user?.growing_zone} />


            {/* Harvested Plants */}
            <GardenSection
            title="Harvested"
            icon={Sun}
            color="text-amber-500"
            plants={myPlants.filter((p) => p.status === 'harvested')}
            plantDataMap={plantDataMap}
            onStatusChange={updatePlantStatus}
            onOpenPlantedDialog={handleOpenPlantedDialog}
            onDelete={deletePlant}
            onPlantClick={handlePlantClick}
            userZone={user?.growing_zone} />

          </div>
        }
      </div>

      <Dialog open={isPlantedDialogOpen} onOpenChange={setIsPlantedDialogOpen}>
        <DialogContent className="bg-background p-6 rounded-2xl fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-[calc(100%-2rem)] sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Select Planting Date</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Calendar
              mode="single"
              selected={selectedPlantingDate}
              onSelect={setSelectedPlantingDate}
              className="rounded-md border"
              initialFocus />

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPlantedDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPlantedDate} className="bg-primary text-primary-foreground my-1 px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-10">Confirm Date</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PlantDetailView
        plant={selectedPlant}
        userZone={user?.growing_zone}
        open={!!selectedPlant}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedPlant(null);
          }
        }}
        onAddPlant={() => {}}
        isAdded={selectedPlant ? userPlantIds.has(selectedPlant.id) : false}
        userPlantData={selectedUserPlantData}
      />
    </div>);

}