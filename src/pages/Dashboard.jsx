import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User } from "@/entities/User";
import { UserPlant } from "@/entities/UserPlant";
import { Plant } from "@/entities/Plant";
import { MapPin, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import LoginPrompt from "../components/auth/LoginPrompt";
import LoadingSpinner from "../components/common/LoadingSpinner";
import PlantDetailView from "../components/library/PlantDetailView";
import TodayHeader from "../components/today/TodayHeader";
import HeroPick from "../components/today/HeroPick";
import EmptyHero from "../components/today/EmptyHero";
import AlsoGoodRow from "../components/today/AlsoGoodRow";
import ComingUp from "../components/today/ComingUp";
import ProTools from "../components/today/ProTools";
import { computePlantableToday, computeComingUp, getCurrentWeek, weeksUntil } from "@/utils/plantingWindows";

// "Today" — answers one question: what should I plant right now?
export default function Dashboard() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [userPlants, setUserPlants] = useState([]);
  const [allPlants, setAllPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [openPlant, setOpenPlant] = useState(null);
  const currentWeek = getCurrentWeek();

  useEffect(() => {
    const load = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        const [plants, allP] = await Promise.all([
          UserPlant.filter({ created_by: currentUser.email }),
          Plant.list(),
        ]);
        setUserPlants(plants);
        setAllPlants(allP);
      } catch (error) {
        console.error("Error loading today:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const addPlant = async (plant) => {
    setLoadingId(plant.id);
    const created = await UserPlant.create({ plant_id: plant.id, plant_name: plant.name, status: "planned" });
    setUserPlants((prev) => [...prev, created]);
    setLoadingId(null);
    toast({ title: `${plant.name} added`, description: "Find it in your Garden with its next step." });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <LoadingSpinner message="Checking what to plant..." size="large" />
      </div>
    );
  }
  if (!user) return <LoginPrompt />;

  const zone = user.growing_zone;
  const isPremium = !!user.is_premium;
  const addedIds = new Set(userPlants.map((p) => p.plant_id));

  // One entry per plant, most urgent (window closing soonest) first.
  const seen = new Set();
  const inSeason = zone
    ? computePlantableToday(allPlants, zone, currentWeek).plantsForToday
        .sort((a, b) => weeksUntil(a.windowEndWeek, currentWeek) - weeksUntil(b.windowEndWeek, currentWeek) || (b.image_url ? 1 : 0) - (a.image_url ? 1 : 0))
        .filter((p) => (seen.has(p.id) ? false : seen.add(p.id)))
    : [];
  const hero = inSeason.find((p) => !addedIds.has(p.id)) || inSeason[0];
  const others = inSeason.filter((p) => p !== hero);
  const comingUp = zone ? computeComingUp(allPlants, zone, currentWeek) : [];

  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/10 via-secondary/5 to-transparent" />
      <div className="relative mx-auto max-w-3xl space-y-5 px-4 pt-5 pb-28 md:px-6 md:pt-8 md:pb-10">
        <TodayHeader user={user} currentWeek={currentWeek} />

        {!zone ? (
          <Link to="/Profile" className="flex items-center gap-3 rounded-[28px] border border-secondary/40 bg-secondary/10 p-5">
            <div className="w-11 h-11 rounded-2xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground">Set your location</p>
              <p className="text-xs text-muted-foreground">We'll tell you exactly what to plant in your zone this week.</p>
            </div>
            <ArrowRight className="w-5 h-5 text-secondary" />
          </Link>
        ) : (
          <>
            {hero ? (
              <HeroPick plant={hero} currentWeek={currentWeek} added={addedIds.has(hero.id)} loading={loadingId === hero.id} onAdd={addPlant} onOpen={() => setOpenPlant(hero)} />
            ) : (
              <EmptyHero nextUp={comingUp[0]} />
            )}
            <AlsoGoodRow plants={others} addedIds={addedIds} loadingId={loadingId} onAdd={addPlant} onOpen={setOpenPlant} />
            <ComingUp items={comingUp} isPremium={isPremium} />
          </>
        )}

        <ProTools isPremium={isPremium} />
      </div>

      {openPlant && (
        <PlantDetailView
          plant={openPlant}
          userZone={zone}
          open={!!openPlant}
          onOpenChange={(o) => !o && setOpenPlant(null)}
          onAddPlant={addPlant}
          isAdded={addedIds.has(openPlant.id)}
          userPlantData={userPlants.find((p) => p.plant_id === openPlant.id)}
          isPremium={isPremium}
        />
      )}
    </div>
  );
}