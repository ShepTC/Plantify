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

// Calculate confidence score based on timing and weather
const calculateConfidence = (currentWeek, zoneData, season, weatherConditions = {}) => {
  const isSpring = season === 'Spring';
  const startWeek = isSpring ? zoneData.spring_start_week : zoneData.fall_start_week;
  const endWeek = isSpring ? zoneData.spring_end_week : zoneData.fall_end_week;
  
  // Base score: proximity to midpoint of planting window
  const windowSize = endWeek - startWeek + 1;
  const midpoint = startWeek + (windowSize / 2);
  const distanceFromMidpoint = Math.abs(currentWeek - midpoint);
  const maxDistance = windowSize / 2;
  const timingScore = Math.max(70, 100 - (distanceFromMidpoint / maxDistance) * 30);
  
  // Apply weather modifiers
  let confidenceScore = timingScore;
  const { goodTemp = false, lowWind = false, notTooWet = false, noFrostRisk = false } = weatherConditions;
  
  if (goodTemp) confidenceScore += 5;
  if (lowWind) confidenceScore += 3;
  if (notTooWet) confidenceScore += 4;
  if (noFrostRisk) confidenceScore += 3;
  
  // Cap at 100
  return Math.min(100, Math.round(confidenceScore));
};

// Fetch weather conditions
const fetchWeatherConditions = async (userLocation) => {
  try {
    let latitude, longitude;
    
    if (userLocation?.lat && userLocation?.lng) {
      latitude = userLocation.lat;
      longitude = userLocation.lng;
    } else {
      const locRes = await fetch("https://ipapi.co/json/", { 
        signal: AbortSignal.timeout(5000) 
      });
      const locData = await locRes.json();
      latitude = locData.latitude;
      longitude = locData.longitude;
    }
    
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_min,precipitation_sum,windspeed_10m_max&past_days=7&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=auto`,
      { signal: AbortSignal.timeout(10000) }
    );
    const weatherJson = await weatherRes.json();
    
    const current = weatherJson.current_weather;
    const daily = weatherJson.daily;
    const rainWeek = daily.precipitation_sum.slice(0, 7).reduce((a, b) => a + b, 0);
    
    return {
      goodTemp: current.temperature >= 60 && current.temperature <= 80,
      lowWind: current.windspeed <= 15,
      notTooWet: rainWeek <= 2,
      noFrostRisk: daily.temperature_2m_min[0] > 40
    };
  } catch (error) {
    console.warn("Could not fetch weather conditions:", error);
    return {};
  }
};

export default function WeeklyPlantingAlerts({ currentWeek, userPlants, userZone, userLocation, onPlantUpdate }) {
  const [plantsToPlant, setPlantsToPlant] = useState([]);
  const [upcomingPlants, setUpcomingPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [weatherConditions, setWeatherConditions] = useState({});

  const loadPlantingAlerts = useCallback(async () => {
    try {
      // Fetch weather conditions
      const weather = await fetchWeatherConditions(userLocation);
      setWeatherConditions(weather);

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
            const season = isSpringPlanting ? 'Spring' : 'Fall';
            const confidence = calculateConfidence(currentWeek, zoneData, season, weather);
            thisWeekPlants.push({
              ...userPlant,
              plantData,
              season,
              confidence,
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
  }, [currentWeek, userPlants, userZone, userLocation]);

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
  const topPlants = plantsToPlant.slice(0, 3);
  
  return (
    <Link to={createPageUrl("PlantingAlerts")} className="block">
      <div className="text-center py-3 border-y border-border hover:bg-muted/50 transition-colors cursor-pointer">
        <p className="text-sm text-muted-foreground mb-2">
          <span className="text-primary font-semibold">Ready to plant now:</span>{" "}
          <span className="text-foreground">{topPlants.map(p => p.plant_name).join(", ")}</span>
          {plantsToPlant.length > 3 && <span className="text-muted-foreground"> +{plantsToPlant.length - 3} more</span>}
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          {topPlants.map(plant => (
            <Badge 
              key={plant.id} 
              variant="outline"
              className="text-xs"
            >
              <span className="text-green-600 dark:text-green-400 font-semibold">{plant.confidence}%</span>
              <span className="text-muted-foreground ml-1">confidence</span>
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}