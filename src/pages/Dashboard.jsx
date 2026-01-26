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
  Sun } from
"lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";

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
      <div className="mx-auto max-w-7xl space-y-4 md:space-y-8">
        {/* Welcome Header */}
        <div className="space-y-4 pt-2 md:pt-6 text-center">
          <div>
            <h1 className="text-xl font-bold text-foreground md:text-2xl lg:text-4xl">
              {getGreeting()}, {user?.full_name?.split(" ")[0] || "Gardener"}!
            </h1>
            <p className="text-sm text-muted-foreground md:text-base lg:text-lg md:mt-2">
              Week {currentWeek} • {format(new Date(), "EEEE, MMMM d")}
            </p>
            <p className="hidden md:block text-sm lg:text-base text-secondary mt-1">
              {getSeasonalMessage()}
            </p>
          </div>

          {/* Plant Today Button */}
          <div className="flex justify-center md:pt-4">
            <Link
              to={createPageUrl("PlantingAlerts")}
              className="group relative inline-block">

              {/* Glow effect */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 opacity-30 blur-md transition-all duration-300 group-hover:opacity-80 group-hover:blur-lg animate-pulse" />
              <Button
                size="lg" className="bg-gradient-to-r text-white mx-6 md:mx-0 px-6 md:px-10 lg:px-12 py-6 md:py-7 lg:py-8 text-base md:text-lg lg:text-xl font-bold rounded-xl justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 hover:bg-primary/90 h-11 md:h-auto relative flex items-center gap-2 md:gap-3 from-purple-500 via-pink-500 to-orange-400 shadow-xl hover:shadow-2xl transition-all duration-300">


                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/5f6c1662c_LightmodeSubLogo.png" 
                  alt="Plant" 
                  className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 object-contain" 
                />
                What can I plant today?
              </Button>
            </Link>
          </div>
        </div>

        {/* Seasonal Goal Banner */}
        {user && <SeasonalGoalBanner user={user} onUserUpdate={loadDashboardData} />}

        {/* Zone Setup Warning */}
        {!user?.location &&
        <Card className="border-orange-200 bg-orange-50/50 backdrop-blur-sm">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-start gap-3 md:gap-4">
                <AlertCircle className="mt-1 h-5 w-5 flex-shrink-0 text-orange-500 md:h-6 md:w-6" />
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 text-sm font-semibold text-orange-800 md:mb-2 md:text-base">
                    Set Your Location
                  </h3>
                  <p className="mb-3 text-xs text-orange-700 md:mb-4 md:text-base">
                    To get accurate planting recommendations, please set your location in
                    your profile to automatically detect your USDA Hardiness Zone.
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
        }

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-6">
          <StatCard
            title="Plants Planned"
            value={userPlants.length}
            icon={<Sprout className="h-4 w-4 text-primary md:h-6 md:w-6" />} />

          <StatCard
            title="This Week"
            value={userPlants.filter((p) => p.planned_planting_week === currentWeek).length}
            icon={<Clock className="h-4 w-4 text-primary md:h-6 md:w-6" />} />

          <StatCard
            title="Planted"
            value={userPlants.filter((p) => p.status === "planted").length}
            icon={<Leaf className="h-4 w-4 text-primary md:h-6 md:w-6" />} />

          <StatCard
            title="Harvested"
            value={userPlants.filter((p) => p.status === "harvested").length}
            icon={<Sun className="h-4 w-4 text-accent md:h-6 md:w-6" />} />

        </div>

        {/* Alerts & Progress */}
        <div className="grid gap-4 lg:grid-cols-1 md:gap-8">
          <WeeklyPlantingAlerts
            currentWeek={currentWeek}
            userPlants={userPlants}
            userZone={user?.growing_zone}
            userLocation={user?.location}
            onPlantUpdate={loadDashboardData} />

          <PlantingProgress userPlants={userPlants} />
        </div>

        {/* Weather / Map & Quick Actions */}
        <div className="space-y-4 pt-4 md:space-y-8">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 md:gap-8">
            <WeatherInsights user={user} />
            <LocationMap user={user} />
          </div>

          <Card className="bg-card/80 backdrop-blur-sm border-border">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base text-foreground md:text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                <div className="space-y-2 md:space-y-3">
                  <QuickActionButton action={quickActionsData.find((a) => a.id === "add-plants")} />
                  <QuickActionButton action={quickActionsData.find((a) => a.id === "view-calendar")} />
                </div>
                <div className="space-y-2 md:space-y-3">
                  <QuickActionButton action={quickActionsData.find((a) => a.id === "my-garden")} />
                  <QuickActionButton action={quickActionsData.find((a) => a.id === "settings")} />
                </div>
              </div>
            </CardContent>
          </Card>
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