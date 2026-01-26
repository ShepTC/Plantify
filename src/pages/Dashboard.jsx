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

  const getSeason = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return "Mid Spring";
    if (month >= 6 && month <= 8) return "Summer";
    if (month >= 9 && month <= 11) return "Fall";
    return "Winter";
  };

  const plantedCount = userPlants.filter((p) => p.status === "planted").length;
  const totalPlanned = userPlants.length;

  return (
    <div className="min-h-screen bg-background p-4 pb-20 md:p-8 md:pb-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Tier 1: Primary Action */}
        <div className="text-center space-y-6 pt-4">
          <Link
            to={createPageUrl("PlantingAlerts")}
            className="group relative inline-block">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 opacity-30 blur-md transition-all duration-300 group-hover:opacity-80 group-hover:blur-lg animate-pulse" />
            <Button
              size="lg"
              className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white px-8 md:px-12 py-6 md:py-8 text-lg md:text-2xl font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/5f6c1662c_LightmodeSubLogo.png" 
                alt="Plant" 
                className="h-6 w-6 md:h-8 md:w-8 object-contain" 
              />
              What can I plant today?
            </Button>
          </Link>

          {/* Tier 1: Time + Zone Context (Passive) */}
          {user?.location && (
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-sm md:text-base text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-primary">Zone {user.growing_zone || "?"}</span>
              </div>
              <span className="text-muted-foreground/50">•</span>
              <div>{getSeason()}</div>
              <span className="text-muted-foreground/50">•</span>
              <div>Week {currentWeek}</div>
            </div>
          )}
        </div>

        {/* Zone Setup Warning */}
        {!user?.location && (
          <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-1 h-5 w-5 flex-shrink-0 text-orange-500" />
                <div className="flex-1">
                  <h3 className="mb-1 text-sm font-semibold text-orange-800 dark:text-orange-400">
                    Set Your Location
                  </h3>
                  <p className="mb-3 text-xs text-orange-700 dark:text-orange-500">
                    Get accurate planting recommendations by setting your location.
                  </p>
                  <Link to={createPageUrl("Profile")}>
                    <Button size="sm" className="bg-orange-500 text-xs hover:bg-orange-600">
                      Set Location
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Seasonal Goal Banner */}
        {user && <SeasonalGoalBanner user={user} onUserUpdate={loadDashboardData} />}

        {/* Tier 2: Planting Progress (One Metric Only) */}
        {totalPlanned > 0 && (
          <div className="text-center py-4">
            <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
              {plantedCount} / {totalPlanned}
            </div>
            <div className="text-sm text-muted-foreground">
              plants planted this season
            </div>
          </div>
        )}

        {/* Tier 2: Upcoming Window Indicator (if applicable) */}
        <WeeklyPlantingAlerts
          currentWeek={currentWeek}
          userPlants={userPlants}
          userZone={user?.growing_zone}
          onPlantUpdate={loadDashboardData}
        />
      </div>
    </div>
  );

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