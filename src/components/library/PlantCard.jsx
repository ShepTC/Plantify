import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sprout, Flower, Droplets, Sun, Plus, CheckCircle, Calendar, Leaf, Apple } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";

const categoryIcons = {
  vegetables: <Sprout className="w-8 h-8 sm:w-10 sm:h-10" />,
  herbs: <Leaf className="w-8 h-8 sm:w-10 sm:h-10" />,
  flowers: <Flower className="w-8 h-8 sm:w-10 sm:h-10" />,
  fruits: <Apple className="w-8 h-8 sm:w-10 sm:h-10" />,
  grains: <Sprout className="w-8 h-8 sm:w-10 sm:h-10" />
};

const categoryGradients = {
  vegetables: "from-green-500 to-emerald-600",
  fruits: "from-red-500 to-orange-600",
  flowers: "from-pink-500 to-rose-600",
  grains: "from-yellow-500 to-amber-600",
  herbs: "from-teal-500 to-cyan-600"
};

const categoryBadgeColors = {
  vegetables: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700",
  fruits: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700",
  flowers: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-700",
  grains: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700",
  herbs: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/50 dark:text-teal-300 dark:border-teal-700"
};

export default function PlantCard({ plant, onAddPlant, isAdded, userZone, onClick, isPremium }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const getPlantingInfo = () => {
    if (!userZone || !plant.planting_zones) return null;

    return plant.planting_zones.find(
      (z) => z.zone === userZone || z.zone === userZone.substring(0, userZone.length - 1)
    );
  };

  const plantingInfo = getPlantingInfo();

  const handleAddClick = (e) => {
    e.stopPropagation(); // Prevent the card's onClick from firing
    onAddPlant(plant);
  };

  return (
    <div
      className={`
        h-full
        transition-opacity duration-500 ease-in-out
        cursor-pointer
        ${visible ? "opacity-100" : "opacity-0"}
      `}
      onClick={onClick}
      >

      <Card className="rounded-lg border text-card-foreground shadow-sm h-full bg-card border-border flex flex-col hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg overflow-hidden w-90">
        {/* Gradient Header with Icon */}
        <div className={`relative h-24 sm:h-28 bg-gradient-to-br ${categoryGradients[plant.category] || 'from-primary to-secondary'} overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
          <div className="absolute inset-0 flex items-center justify-center text-white">
            {categoryIcons[plant.category] || <Sprout className="w-8 h-8 sm:w-10 sm:h-10" />}
          </div>
          
          {/* Category badge overlay */}
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="text-[10px] sm:text-xs backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border-white/50 dark:border-gray-700/50 shadow-sm">
              {plant.category}
            </Badge>
          </div>
        </div>

        <CardHeader className="p-2 sm:p-4 pb-2 sm:pb-3">
          <div className="flex items-start justify-between gap-1 sm:gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-foreground text-sm font-bold tracking-tight sm:text-base leading-tight line-clamp-2">
                {plant.name}
              </CardTitle>
              {/* Always show botanical/common name to differentiate varieties */}
              <p className="text-[10px] sm:text-xs text-muted-foreground italic truncate mt-0.5">
                {plant.botanical_name || plant.common_name}
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow space-y-1 sm:space-y-3 p-2 sm:p-4 pt-0">
          <div className="flex gap-1 flex-wrap">
            {/* Hide plant type on mobile */}
            <Badge variant="outline" className="text-[10px] sm:text-xs hidden sm:inline-flex">
              {plant.plant_type}
            </Badge>
          </div>

          {/* Planting info - simplified on mobile */}
          {plantingInfo &&
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-md sm:rounded-lg p-1.5 sm:p-3 border border-primary/10">
              <div className="flex items-center gap-1 mb-1">
                <Calendar className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-primary" />
                <span className="text-[10px] sm:text-sm font-medium text-foreground">Zone {userZone}</span>
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-[9px] sm:text-xs text-muted-foreground">
                  <span className="font-medium">Spring:</span> W {plantingInfo.spring_start_week}-{plantingInfo.spring_end_week}
                </p>
                {plantingInfo.fall_start_week &&
              <p className="text-[9px] sm:text-xs text-muted-foreground hidden sm:block">
                    <span className="font-medium">Fall:</span> W {plantingInfo.fall_start_week}-{plantingInfo.fall_end_week}
                  </p>
              }
              </div>
            </div>
          }

          {/* Requirements - simplified layout on mobile */}
          <div className="grid grid-cols-2 gap-1 sm:gap-2">
            <div className="flex items-center gap-1">
              <Sun className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-secondary" />
              <span className="capitalize text-muted-foreground text-[9px] sm:text-xs truncate">
                {plant.sun_requirements?.replace("_", " ").replace("full_sun", "Sun").replace("partial_sun", "P.Sun").replace("partial_shade", "P.Shade").replace("full_shade", "Shade")}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-secondary" />
              <span className="capitalize text-muted-foreground text-[9px] sm:text-xs truncate">
                {plant.water_needs}
              </span>
            </div>
          </div>

          {/* Growing tips - hidden on mobile, show on desktop */}
          <p className="hidden sm:block text-xs text-muted-foreground line-clamp-2 pt-1">
            {plant.growing_tips}
          </p>

          {/* Days to maturity - show on both but smaller on mobile */}
          {plant.days_to_maturity &&
          <p className="text-[9px] sm:text-xs text-muted-foreground pt-0.5 sm:pt-1">
              <span className="font-medium">Harvest:</span> {plant.days_to_maturity}d
            </p>
          }
        </CardContent>
        
        <CardFooter className="p-2 sm:p-4 pt-0">
          <div className="flex flex-col gap-2 w-full">
            {isPremium && (
              <Link 
                to={createPageUrl(`Assistant?highlightPlantId=${plant.id}`)} 
                className="group relative inline-block w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-300 via-sky-300 to-cyan-300 opacity-70 blur-md transition-all duration-300 group-hover:opacity-100 group-hover:blur-lg" />
                <Button
                  size="sm"
                  className="relative w-full text-[10px] sm:text-sm h-6 sm:h-9 px-2 sm:px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Ask Assistant
                </Button>
              </Link>
            )}
            <Button
              size="sm"
              className="w-full text-[10px] sm:text-sm h-6 sm:h-9 px-2 sm:px-4"
              onClick={handleAddClick}
              disabled={isAdded}
              variant={isAdded ? "secondary" : "default"}>

              {isAdded ?
              <>
                  <CheckCircle className="w-2.5 h-2.5 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden xs:inline sm:inline">Added</span>
                  <span className="xs:hidden sm:hidden">✓</span>
                </> :

              <>
                  <Plus className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                </>
              }
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>);

}