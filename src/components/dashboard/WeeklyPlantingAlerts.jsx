import React, { useState, useEffect, useCallback } from "react";
import { Plant } from "@/entities/Plant";
import { UserPlant } from "@/entities/UserPlant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertCircle, 
  Clock, 
  Leaf, 
  Plus,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";

export default function WeeklyPlantingAlerts({ currentWeek, userPlants, userZone, onPlantUpdate }) {
  const [plantsToPlant, setPlantsToPlant] = useState([]);
  const [upcomingPlants, setUpcomingPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPlantingAlerts = useCallback(async () => {
    try {
      // Get all plant details for user's plants
      const allPlants = await Plant.list();
      const plantLookup = {};
      allPlants.forEach(plant => {
        plantLookup[plant.id] = plant;
      });

      // Find plants that should be planted this week
      const thisWeekPlants = [];
      const upcomingWeekPlants = [];

      userPlants
        .filter(userPlant => userPlant.status === 'planned')
        .forEach(userPlant => {
          const plantData = plantLookup[userPlant.plant_id];
          if (!plantData || !plantData.planting_zones) return;

          // Find zone data for user's zone
          const zoneData = plantData.planting_zones.find(z => 
            z.zone === userZone || 
            z.zone === userZone.substring(0, userZone.length - 1) // Handle 5a -> 5
          );

          if (!zoneData) return;

          // Check if current week is in planting window
          const isSpringPlanting = currentWeek >= zoneData.spring_start_week && currentWeek <= zoneData.spring_end_week;
          const isFallPlanting = zoneData.fall_start_week && currentWeek >= zoneData.fall_start_week && currentWeek <= zoneData.fall_end_week;
          
          // Check upcoming weeks (next 2 weeks)
          const isUpcomingSpring = currentWeek + 1 >= zoneData.spring_start_week && currentWeek + 1 <= zoneData.spring_end_week ||
                                   currentWeek + 2 >= zoneData.spring_start_week && currentWeek + 2 <= zoneData.spring_end_week;
          const isUpcomingFall = zoneData.fall_start_week && 
                                (currentWeek + 1 >= zoneData.fall_start_week && currentWeek + 1 <= zoneData.fall_end_week ||
                                 currentWeek + 2 >= zoneData.fall_start_week && currentWeek + 2 <= zoneData.fall_end_week);

          if (isSpringPlanting || isFallPlanting) {
            thisWeekPlants.push({
              ...userPlant,
              plantData,
              season: isSpringPlanting ? 'Spring' : 'Fall',
              optimalWeeks: isSpringPlanting ? 
                `Weeks ${zoneData.spring_start_week}-${zoneData.spring_end_week}` :
                `Weeks ${zoneData.fall_start_week}-${zoneData.fall_end_week}`
            });
          } else if (isUpcomingSpring || isUpcomingFall) {
            upcomingWeekPlants.push({
              ...userPlant,
              plantData,
              season: isUpcomingSpring ? 'Spring' : 'Fall',
              startsInWeek: isUpcomingSpring ? zoneData.spring_start_week : zoneData.fall_start_week
            });
          }
        });

      setPlantsToPlant(thisWeekPlants);
      setUpcomingPlants(upcomingWeekPlants);

    } catch (error) {
      console.error("Error loading planting alerts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentWeek, userPlants, userZone]);

  useEffect(() => {
    if (userZone) {
      loadPlantingAlerts();
    } else {
      setIsLoading(false);
    }
  }, [userZone, loadPlantingAlerts]);

  const markAsPlanted = async (userPlantId) => {
    try {
      await UserPlant.update(userPlantId, {
        status: 'planted',
        actual_planting_date: new Date().toISOString().split('T')[0]
      });
      // Reload dashboard data
      if (onPlantUpdate) {
        onPlantUpdate();
      }
    } catch (error) {
      console.error("Error updating plant status:", error);
    }
  };

  // Single line display
  if (!userZone) return null;
  
  if (!plantsToPlant || plantsToPlant.length === 0) {
    // Show upcoming if exists
    if (upcomingPlants && upcomingPlants.length > 0) {
      const nextPlant = upcomingPlants[0];
      const weeksUntil = nextPlant.startsInWeek - currentWeek;
      return (
        <div className="text-center py-3 border-y border-border">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Next planting window:</span>{" "}
            <span className="text-foreground">{nextPlant.plant_name}</span>
            {weeksUntil > 0 && <span className="text-muted-foreground"> (in {weeksUntil} week{weeksUntil > 1 ? 's' : ''})</span>}
          </p>
        </div>
      );
    }
    return null;
  }

  // Show ready to plant
  return (
    <Link to={createPageUrl("PlantingAlerts")} className="block">
      <div className="text-center py-3 border-y border-border hover:bg-muted/50 transition-colors cursor-pointer">
        <p className="text-sm text-muted-foreground">
          <span className="text-primary font-semibold">Ready to plant now:</span>{" "}
          <span className="text-foreground">{plantsToPlant.slice(0, 3).map(p => p.plant_name).join(", ")}</span>
          {plantsToPlant.length > 3 && <span className="text-muted-foreground"> +{plantsToPlant.length - 3} more</span>}
        </p>
      </div>
    </Link>
  );
}