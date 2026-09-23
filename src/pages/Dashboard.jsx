import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { UserPlant } from "@/entities/UserPlant";
import { Plant } from "@/entities/Plant";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Sprout, Leaf, Clock, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import LoginPrompt from "../components/auth/LoginPrompt";
import LoadingSpinner from "../components/common/LoadingSpinner";
import HomeHero from "../components/home/HomeHero";
import PlantableCropCard from "../components/home/PlantableCropCard";
import CategoryShelf from "../components/home/CategoryShelf";
import UpgradePrompt from "../components/freemium/UpgradePrompt";
import { computePlantableToday } from "@/utils/plantingWindows";
import { canAddPlant, getRemainingAdds, FREE_WEEKLY_ADD_LIMIT } from "@/utils/freemium";

// Merged Home page: answers "what can I plant this week" immediately.
// Replaces the old Dashboard + Plant Today split.
const homeCategoryData = {
  vegetables: { name: "Vegetables", icon: Leaf, color: "from-green-500 to-green-600" },
  fruits: { name: "Fruits", icon: Sprout, color: "from-red-500 to-red-600" },
  herbs: { name: "Herbs", icon: Leaf, color: "from-teal-500 to-teal-600" },
  flowers: { name: "Flowers", icon: Leaf, color: "from-pink-500 to-pink-600" },
  grains: { name: "Grains", icon: Sprout, color: "from-yellow-500 to-yellow-600" },
  direct_sow: { name: "Direct Sow", icon: Sprout, color: "from-emerald-500 to-emerald-600" },
  transplant: { name: "Transplant", icon: Leaf, color: "from-blue-500 to-blue-600" },
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [userPlants, setUserPlants] = useState([]);
  const [allPlants, setAllPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      setCurrentWeek(
        Math.ceil((now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000))
      );

      const [plants, allP] = await Promise.all([
        UserPlant.filter({ created_by: currentUser.email }),
        Plant.list(),
      ]);
      setUserPlants(plants);
      setAllPlants(allP);
    } catch (error) {
      console.error("Error loading home:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const addPlant = async (plant) => {
    if (!canAddPlant(user, userPlants)) return;
    try {
      const created = await UserPlant.create({
        plant_id: plant.id,
        plant_name: plant.name,
        status: "planned",
      });
      setUserPlants((prev) => [...prev, created]);
    } catch (error) {
      console.error("Error adding plant:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 md:p-6">
        <LoadingSpinner message="Loading your garden..." size="large" />
      </div>
    );
  }

  if (!user) {
    return <LoginPrompt />;
  }

  const userZone = user?.growing_zone;
  const userPlantIds = new Set(userPlants.map((p) => p.plant_id));
  const { plantsForToday, plantsByCategory } = userZone
    ? computePlantableToday(allPlants, userZone, currentWeek, userPlantIds)
    : { plantsForToday: [], plantsByCategory: {} };

  const topCrops = plantsForToday.slice(0, 3);
  const isPremium = !!user?.is_premium;
  const remaining = getRemainingAdds(user, userPlants);
  const atLimit = !isPremium && remaining <= 0;

  const plannedCount = userPlants.filter((p) => p.status === "planned").length;
  const plantedCount = userPlants.filter((p) => p.status === "planted").length;
  const harvestedCount = userPlants.filter((p) => p.status === "harvested").length;

  return (
    <div className="min-h-screen bg-background p-3 pb-20 md:p-6 md:pb-6">
      <div className="mx-auto max-w-5xl space-y-4 md:space-y-6">
        <HomeHero
          user={user}
          currentWeek={currentWeek}
          readyCount={plantsForToday.length}
          remaining={remaining}
          isPremium={isPremium}
        />

        {/* Location setup warning */}
        {!user?.location && (
          <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-900/50 backdrop-blur-sm">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500" />
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 text-sm font-semibold text-foreground">Set Your Location</h3>
                  <p className="mb-2 text-xs text-muted-foreground">
                    Get accurate planting recommendations for your USDA zone.
                  </p>
                  <Link to={createPageUrl("Profile")}>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-xs h-8">
                      Set Location
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Compact stats row */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <StatChip label="Planned" value={plannedCount} icon={<Clock className="w-3.5 h-3.5" />} />
          <StatChip label="Growing" value={plantedCount} icon={<Sprout className="w-3.5 h-3.5" />} />
          <StatChip label="Harvested" value={harvestedCount} icon={<Sun className="w-3.5 h-3.5" />} />
        </div>

        {/* Top crops to plant this week */}
        {topCrops.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground md:text-lg">Plant this week</h2>
              {!isPremium && (
                <span className="text-xs text-muted-foreground">
                  {remaining}/{FREE_WEEKLY_ADD_LIMIT} adds left
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {topCrops.map((plant) => (
                <PlantableCropCard
                  key={plant.id}
                  plant={plant}
                  onAdd={addPlant}
                  disabled={atLimit}
                  isPremium={isPremium}
                />
              ))}
            </div>
          </div>
        )}

        {/* Freemium limit reached */}
        {atLimit && topCrops.length > 0 && (
          <UpgradePrompt
            title="You've used all 3 free adds this week"
            description="Upgrade to Plantify Pro to add unlimited plants, set reminders, and sync your calendar."
          />
        )}

        {/* No zone set */}
        {!userZone && (
          <Card className="border-border bg-card">
            <CardContent className="p-6 text-center">
              <Sprout className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                Set your location to see what you can plant this week.
              </p>
              <Link to={createPageUrl("Profile")}>
                <Button size="sm">Set Location</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Category shelves */}
        {userZone && (
          <div className="space-y-3">
            {Object.entries(homeCategoryData).map(([key, cat]) => {
              const plants = plantsByCategory[key] || [];
              if (plants.length === 0) return null;
              return (
                <CategoryShelf
                  key={key}
                  categoryKey={key}
                  category={cat}
                  plants={plants}
                  onAdd={addPlant}
                  disabled={atLimit}
                  isPremium={isPremium}
                />
              );
            })}
          </div>
        )}

        {/* Nothing to plant right now */}
        {userZone && plantsForToday.length === 0 && (
          <Card className="border-border bg-card">
            <CardContent className="p-6 text-center">
              <Leaf className="w-10 h-10 mx-auto text-accent mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Perfect timing, nothing urgent</h3>
              <p className="text-sm text-muted-foreground mb-4">
                No crops are optimal to plant this week. Check back during your next planting window.
              </p>
              <Link to={createPageUrl("PlantLibrary")}>
                <Button variant="outline" size="sm">
                  Browse Plant Library
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatChip({ label, value, icon }) {
  return (
    <Card className="border-border bg-card/80 backdrop-blur-sm">
      <CardContent className="p-2.5 md:p-3 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-primary flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold text-foreground leading-none">{value}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}