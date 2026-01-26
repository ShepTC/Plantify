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
    if (month >= 3 && month <= 5) return "Spring";
    if (month >= 6 && month <= 8) return "Summer";
    if (month >= 9 && month <= 11) return "Fall";
    return "Winter";
  };

  return (
    <div className="min-h-screen bg-background p-3 pb-20 md:p-6 md:pb-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Hero Action */}
        <div className="flex justify-center pt-4 md:pt-8">
          <Link
            to={createPageUrl("PlantingAlerts")}
            className="group relative inline-block w-full max-w-2xl">

            {/* Glow effect */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 opacity-30 blur-md transition-all duration-300 group-hover:opacity-80 group-hover:blur-lg animate-pulse" />
            <Button
              size="lg" 
              className="w-full bg-gradient-to-r text-white px-8 py-8 md:py-10 text-lg md:text-2xl font-bold rounded-xl relative flex items-center justify-center gap-3 md:gap-4 from-purple-500 via-pink-500 to-orange-400 shadow-xl hover:shadow-2xl transition-all duration-300">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/5f6c1662c_LightmodeSubLogo.png" 
                alt="Plant" 
                className="h-6 w-6 md:h-10 md:w-10 object-contain" 
              />
              What can I plant today?
            </Button>
          </Link>
        </div>

        {/* Context Strip */}
        <div className="flex items-center justify-center gap-4 text-sm md:text-base text-muted-foreground py-2">
          {user?.growing_zone && (
            <span className="flex items-center gap-1.5">
              <span className="text-foreground font-medium">Zone {user.growing_zone}</span>
            </span>
          )}
          <span className="text-muted-foreground/50">·</span>
          <span>{getSeason()}</span>
          <span className="text-muted-foreground/50">·</span>
          <span>Week {currentWeek}</span>
        </div>

        {/* Zone Setup Warning */}
        {!user?.location && (
          <Card className="bg-card/80 backdrop-blur-sm border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-orange-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    Set your location to get planting recommendations
                  </p>
                </div>
                <Link to={createPageUrl("Profile")}>
                  <Button size="sm" variant="outline">
                    Set Location
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Supporting Cards - Max 3 visible */}
        <div className="space-y-4">
          {userPlants.length > 0 && (
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                      {userPlants.filter((p) => p.status === "planted").length}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground">Planted</div>
                  </div>
                  <div className="text-center border-x border-border">
                    <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                      {userPlants.filter((p) => p.planned_planting_week === currentWeek).length}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground">This Week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                      {userPlants.filter((p) => p.status === "harvested").length}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground">Harvested</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <WeatherInsights user={user} />

          {user?.garden_goals && (
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start gap-3">
                  <Leaf className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Garden Goal</p>
                    <p className="text-sm md:text-base text-foreground">{user.garden_goals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>);

}