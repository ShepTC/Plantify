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
import WeatherInsights from "../components/dashboard/WeatherInsights";
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
    if (month >= 6 && month <= 8) return "Mid Summer";
    if (month >= 9 && month <= 11) return "Mid Fall";
    return "Mid Winter";
  };

  const plannedCount = userPlants.filter(p => p.status === 'planned').length;
  const plantedCount = userPlants.filter(p => p.status === 'planted').length;
  const totalPlants = userPlants.length;

  return (
    <div className="min-h-screen bg-background p-4 pb-24 md:p-8 md:pb-8">
      <div className="mx-auto max-w-4xl space-y-6 md:space-y-8">
        
        {/* Tier 1: Primary Action */}
        <div className="text-center space-y-6 pt-4">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            {getGreeting()}, {user?.full_name?.split(" ")[0] || "Gardener"}!
          </h1>

          {/* Plant Today Button */}
          <Link
            to={createPageUrl("PlantingAlerts")}
            className="group relative inline-block">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 opacity-30 blur-md transition-all duration-300 group-hover:opacity-80 group-hover:blur-lg animate-pulse" />
            <Button
              size="lg"
              className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white px-8 py-7 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 md:px-12 md:py-8 md:text-xl">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/5f6c1662c_LightmodeSubLogo.png" 
                alt="Plant" 
                className="h-6 w-6 md:h-8 md:w-8 object-contain" 
              />
              What can I plant today?
            </Button>
          </Link>

          {/* Time + Zone Context (Passive) */}
          {user?.location && user?.growing_zone && (
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium">Zone {user.growing_zone}</span>
              <span>•</span>
              <span>{getSeason()}</span>
              <span>•</span>
              <span>Week {currentWeek}</span>
            </div>
          )}
        </div>

        {/* Seasonal Goal Banner */}
        {user && <SeasonalGoalBanner user={user} onUserUpdate={loadDashboardData} />}

        {/* Zone Setup Warning */}
        {!user?.location && (
          <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-1 h-5 w-5 flex-shrink-0 text-orange-500" />
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 text-sm font-semibold text-orange-800 dark:text-orange-200">
                    Set Your Location
                  </h3>
                  <p className="mb-3 text-xs text-orange-700 dark:text-orange-300">
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

        {/* Tier 2: Support Info */}
        <div className="space-y-4">
          {/* Planting Progress - Single Metric */}
          {totalPlants > 0 && (
            <div className="text-center py-3 border-y border-border">
              <p className="text-muted-foreground text-sm">
                <span className="text-2xl font-bold text-primary">{plantedCount}</span>
                <span className="text-muted-foreground"> / {totalPlants}</span>
                <span className="ml-2">plants planted this season</span>
              </p>
            </div>
          )}

          {/* Upcoming Window - Single Line */}
          <WeeklyPlantingAlerts
            currentWeek={currentWeek}
            userPlants={userPlants}
            userZone={user?.growing_zone}
            onPlantUpdate={loadDashboardData}
          />
        </div>

        {/* Tier 3: Weather (Only if risk) & Quick Actions */}
        <div className="space-y-4">
          <WeatherInsights user={user} />
          
          <div className="grid grid-cols-2 gap-3">
            <Link to={createPageUrl("PlantLibrary")}>
              <Button variant="outline" className="w-full">
                <Leaf className="mr-2 h-4 w-4" />
                Browse Plants
              </Button>
            </Link>
            <Link to={createPageUrl("Calendar")}>
              <Button variant="outline" className="w-full">
                <Clock className="mr-2 h-4 w-4" />
                View Calendar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

}