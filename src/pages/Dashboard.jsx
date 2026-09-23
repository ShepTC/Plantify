import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { UserPlant } from "@/entities/UserPlant";
import { Plant } from "@/entities/Plant";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Sprout, Clock, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import LoginPrompt from "../components/auth/LoginPrompt";
import LoadingSpinner from "../components/common/LoadingSpinner";
import HomeHero from "../components/home/HomeHero";
import ThisWeekCarousel from "../components/home/ThisWeekCarousel";
import BrowsePanel from "../components/home/BrowsePanel";
import { computePlantableToday } from "@/utils/plantingWindows";
import { canAddPlant, getRemainingAdds, FREE_WEEKLY_ADD_LIMIT } from "@/utils/freemium";

// Merged Home page: answers "what can I plant this week" immediately.
const homeCategoryData = {
  vegetables: { key: "vegetables", name: "Vegetables", icon: Sprout, color: "from-green-500 to-green-600" },
  fruits: { key: "fruits", name: "Fruits", icon: Sprout, color: "from-red-500 to-red-600" },
  herbs: { key: "herbs", name: "Herbs", icon: Sprout, color: "from-teal-500 to-teal-600" },
  flowers: { key: "flowers", name: "Flowers", icon: Sprout, color: "from-pink-500 to-pink-600" },
  grains: { key: "grains", name: "Grains", icon: Sprout, color: "from-yellow-500 to-yellow-600" },
  direct_sow: { key: "direct_sow", name: "Direct Sow", icon: Sprout, color: "from-emerald-500 to-emerald-600" },
  transplant: { key: "transplant", name: "Transplant", icon: Sprout, color: "from-blue-500 to-blue-600" },
};

// Categories used by the Browse tab (full library grouped by plant.category).
const browseCategories = [
  homeCategoryData.vegetables,
  homeCategoryData.fruits,
  homeCategoryData.herbs,
  homeCategoryData.flowers,
  homeCategoryData.grains,
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [userPlants, setUserPlants] = useState([]);
  const [allPlants, setAllPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState("week");

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

  const isPremium = !!user?.is_premium;
  const remaining = getRemainingAdds(user, userPlants);
  const atLimit = !isPremium && remaining <= 0;

  const plannedCount = userPlants.filter((p) => p.status === "planned").length;
  const plantedCount = userPlants.filter((p) => p.status === "planted").length;
  const harvestedCount = userPlants.filter((p) => p.status === "harvested").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-3 pt-3 pb-24 md:px-6 md:pt-6 md:pb-6">
        <HomeHero
          user={user}
          currentWeek={currentWeek}
          readyCount={plantsForToday.length}
          remaining={remaining}
          isPremium={isPremium}
        />

        {/* Location setup warning */}
        {!user?.location && (
          <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-orange-200 bg-orange-50/50 dark:border-orange-900/50 dark:bg-orange-950/20 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-foreground"><span className="font-semibold">Set your location</span> for accurate USDA-zone planting recommendations.</p>
              <Link to={createPageUrl("Profile")}>
                <Button size="sm" className="mt-1.5 bg-orange-500 hover:bg-orange-600 text-xs h-7 px-2.5">
                  Set Location
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Stats ribbon — single card, three segments */}
        <div className="mt-3 grid grid-cols-3 rounded-2xl border border-border bg-card/80 backdrop-blur-sm overflow-hidden">
          <StatSegment label="Planned" value={plannedCount} icon={<Clock className="w-3.5 h-3.5" />} />
          <StatSegment label="Growing" value={plantedCount} icon={<Sprout className="w-3.5 h-3.5" />} divider />
          <StatSegment label="Harvested" value={harvestedCount} icon={<Sun className="w-3.5 h-3.5" />} divider />
        </div>

        {/* No zone set */}
        {!userZone ? (
          <div className="mt-3 rounded-2xl border border-border bg-card p-6 text-center">
            <Sprout className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">Set your location to see what you can plant this week.</p>
            <Link to={createPageUrl("Profile")}>
              <Button size="sm">Set Location</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Segmented control */}
            <div className="mt-3 flex p-1 rounded-2xl bg-muted/60 border border-border">
              <button
                onClick={() => setView("week")}
                className={`flex-1 rounded-xl text-sm py-2 font-semibold transition-all ${
                  view === "week" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setView("browse")}
                className={`flex-1 rounded-xl text-sm py-2 font-semibold transition-all ${
                  view === "browse" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Browse
              </button>
            </div>

            {view === "week" ? (
              <ThisWeekCarousel
                plants={plantsForToday}
                onAdd={addPlant}
                disabled={atLimit}
                isPremium={isPremium}
                remaining={remaining}
                limit={FREE_WEEKLY_ADD_LIMIT}
              />
            ) : (
              <BrowsePanel
                plants={allPlants}
                categories={browseCategories}
                excludeIds={userPlantIds}
                onAdd={addPlant}
                disabled={atLimit}
                isPremium={isPremium}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatSegment({ label, value, icon, divider }) {
  return (
    <div className={`p-2.5 md:p-3 flex items-center gap-2 ${divider ? "border-l border-border" : ""}`}>
      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-primary flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-foreground leading-none">{value}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}