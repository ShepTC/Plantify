
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

  if (!userZone) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground text-base md:text-lg">
            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
            Weekly Planting Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-xs md:text-sm">
              Set your growing zone in your profile to see personalized planting alerts.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="flex items-center justify-between text-foreground">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
            <span className="text-base md:text-lg">This Week's Planting Alerts</span>
          </div>
          <Badge variant="outline" className="bg-muted text-xs md:text-sm">
            Week {currentWeek}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6 pt-0">
        
        {/* Plants to Plant This Week */}
        {plantsToPlant.length > 0 && (
          <div className="space-y-3 md:space-y-4">
            <h3 className="font-semibold text-primary flex items-center gap-2 text-sm md:text-base">
              <Leaf className="w-3 h-3 md:w-4 md:h-4" />
              Ready to Plant Now ({plantsToPlant.length})
            </h3>
            <div className="space-y-2 md:space-y-3">
              {plantsToPlant.map(plant => (
                <div key={plant.id} className="bg-muted/50 rounded-lg p-3 md:p-4 border border-border">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-foreground text-sm md:text-base">{plant.plant_name}</h4>
                      <p className="text-xs md:text-sm text-secondary">{plant.season} Planting - Optimal window</p>
                      <p className="text-xs text-muted-foreground">{plant.optimalWeeks}</p>
                      {plant.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{plant.notes}</p>
                      )}
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => markAsPlanted(plant.id)}
                      className="bg-primary hover:bg-primary/90 text-xs md:text-sm"
                    >
                      <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      Mark Planted
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Plants */}
        {upcomingPlants.length > 0 && (
          <div className="space-y-3 md:space-y-4">
            <h3 className="font-semibold text-secondary flex items-center gap-2 text-sm md:text-base">
              <Calendar className="w-3 h-3 md:w-4 md:h-4" />
              Coming Up Soon ({upcomingPlants.length})
            </h3>
            <div className="space-y-2">
              {upcomingPlants.map(plant => (
                <div key={plant.id} className="flex items-center justify-between p-2 md:p-3 bg-muted/30 rounded-lg border border-border">
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-foreground text-sm md:text-base">{plant.plant_name}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {plant.season} - Week {plant.startsInWeek}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Alerts */}
        {plantsToPlant.length === 0 && upcomingPlants.length === 0 && (
          <div className="text-center py-6 md:py-8">
            <Leaf className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground mx-auto mb-3 md:mb-4" />
            <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">No planting alerts this week</h3>
            <p className="text-secondary mb-3 md:mb-4 text-xs md:text-sm">Add plants to your garden to get personalized alerts.</p>
            <Link to={createPageUrl("PlantLibrary")}>
              <Button className="bg-primary hover:bg-primary/90 text-xs md:text-sm">
                <Plus className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                Browse Plants
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
