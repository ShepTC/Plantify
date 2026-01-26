import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { UserPlant } from "@/entities/UserPlant";
import { Plant } from "@/entities/Plant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Leaf,
  Clock,
  AlertCircle,
  Sprout,
  Sun,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";

import TodayFocusCard from "../components/dashboard/TodayFocusCard";
import WeeklyPlantingAlerts from "../components/dashboard/WeeklyPlantingAlerts";
import PlantingProgress from "../components/dashboard/PlantingProgress";
import WeatherInsights from "../components/dashboard/WeatherInsights";
import LocationMap from "../components/dashboard/LocationMap";
import { quickActionsData, QuickActionButton } from "../components/dashboard/QuickActions";
import SeasonalGoalBanner from "../components/dashboard/SeasonalGoalBanner";
import LoginPrompt from "../components/auth/LoginPrompt";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [userPlants, setUserPlants] = useState([]);
  const [recommendedPlants, setRecommendedPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOverview, setShowOverview] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const weekNumber = Math.ceil(
        (now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      setCurrentWeek(weekNumber);

      const plants = await UserPlant.filter({ created_by: currentUser.email });
      setUserPlants(plants);

      const allPlants = await Plant.list();
      setRecommendedPlants(allPlants.slice(0, 3));
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getSeasonalMessage = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return "Spring is here! Time to start your garden.";
    if (month >= 6 && month <= 8) return "Summer growing season is in full swing!";
    if (month >= 9 && month <= 11) return "Fall planting time for cool-season crops.";
    return "Winter planning season - prepare for next year!";
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-background/20 p-4 md:p-6">
        <LoadingSpinner message="Loading your garden..." size="large" />
      </div>);

  }

  if (!user) {
    return <LoginPrompt />;
  }

  return (
    <div className="min-h-screen bg-background p-3 pb-20 md:p-6 md:pb-6">
      <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
        {/* Simple Header */}
        <div className="pt-2 md:pt-6">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            {getGreeting()}, {user?.full_name?.split(" ")[0] || "Gardener"}
          </h1>
          <p className="text-sm text-muted-foreground md:text-base mt-1">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
        </div>

        {/* Seasonal Goal Banner */}
        {user && <SeasonalGoalBanner user={user} onUserUpdate={loadDashboardData} />}

        {/* Zone Setup Warning */}
        {!user?.location && (
          <Card className="border-orange-200 bg-orange-50/50 backdrop-blur-sm dark:bg-orange-950/20 dark:border-orange-800">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start gap-3 md:gap-4">
                <AlertCircle className="mt-1 h-5 w-5 flex-shrink-0 text-orange-500 md:h-6 md:w-6" />
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 text-sm font-semibold text-orange-800 dark:text-orange-200 md:mb-2 md:text-base">
                    Set Your Location
                  </h3>
                  <p className="mb-3 text-xs text-orange-700 dark:text-orange-300 md:mb-4 md:text-sm">
                    Set your location to get personalized planting recommendations.
                  </p>
                  <Link to={createPageUrl("Profile")}>
                    <Button size="sm" className="bg-orange-500 text-xs hover:bg-orange-600 md:text-sm">
                      Set Location
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PRIMARY: Today Focus Card */}
        <TodayFocusCard 
          userPlants={userPlants}
          currentWeek={currentWeek}
          userZone={user?.growing_zone}
        />

        {/* Quick Stats - Simplified */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <div className="flex flex-col items-center justify-center p-3 md:p-4 bg-card/60 backdrop-blur-sm border border-border rounded-lg">
            <Sprout className="h-6 w-6 md:h-8 md:w-8 text-primary mb-1 md:mb-2" />
            <p className="text-xl md:text-3xl font-bold text-foreground">{userPlants.filter(p => p.status === "planned").length}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Planned</p>
          </div>
          <div className="flex flex-col items-center justify-center p-3 md:p-4 bg-card/60 backdrop-blur-sm border border-border rounded-lg">
            <Leaf className="h-6 w-6 md:h-8 md:w-8 text-primary mb-1 md:mb-2" />
            <p className="text-xl md:text-3xl font-bold text-foreground">{userPlants.filter(p => p.status === "planted").length}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Growing</p>
          </div>
          <div className="flex flex-col items-center justify-center p-3 md:p-4 bg-card/60 backdrop-blur-sm border border-border rounded-lg">
            <Sun className="h-6 w-6 md:h-8 md:w-8 text-accent mb-1 md:mb-2" />
            <p className="text-xl md:text-3xl font-bold text-foreground">{userPlants.filter(p => p.status === "harvested").length}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Harvested</p>
          </div>
        </div>

        {/* SECONDARY: Collapsible Overview Section */}
        <div className="space-y-4">
          <button
            onClick={() => setShowOverview(!showOverview)}
            className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 border border-border rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Season Overview</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {showOverview ? "Hide" : "Show"}
            </span>
          </button>

          {showOverview && (
            <div className="space-y-4 md:space-y-6 animate-in fade-in duration-300">
              {/* Alerts & Progress */}
              <div className="grid gap-4 lg:grid-cols-1">
                <WeeklyPlantingAlerts
                  currentWeek={currentWeek}
                  userPlants={userPlants}
                  userZone={user?.growing_zone}
                  onPlantUpdate={loadDashboardData}
                />
                <PlantingProgress userPlants={userPlants} />
              </div>

              {/* Weather / Map */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <WeatherInsights user={user} />
                <LocationMap user={user} />
              </div>

              {/* Quick Actions */}
              <Card className="bg-card/80 backdrop-blur-sm border-border">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-base text-foreground md:text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 md:p-6">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <QuickActionButton action={quickActionsData.find((a) => a.id === "add-plants")} />
                    <QuickActionButton action={quickActionsData.find((a) => a.id === "view-calendar")} />
                    <QuickActionButton action={quickActionsData.find((a) => a.id === "my-garden")} />
                    <QuickActionButton action={quickActionsData.find((a) => a.id === "settings")} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>);

}

// Helper component for quick stats
function StatCard({ title, value, icon }) {
  return (
    <Card className="border-border bg-card/80 backdrop-blur-sm">
      <CardContent className="p-3 md:p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-secondary md:text-sm">{title}</p>
            <p className="text-xl font-bold text-foreground md:text-3xl">{value}</p>
          </div>
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted md:h-12 md:w-12 md:rounded-xl">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>);

}