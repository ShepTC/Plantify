import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sprout, Flower, Droplets, Sun, Plus, CheckCircle, Calendar, ImageIcon } from "lucide-react";

const categoryIcons = {
  vegetables: <Sprout className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />,
  herbs: <Sprout className="w-3 h-3 sm:w-4 sm:h-4 text-teal-600" />,
  flowers: <Flower className="w-3 h-3 sm:w-4 sm:h-4 text-pink-600" />,
  fruits: <Sprout className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />,
  grains: <Sprout className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
};

const categoryBadgeColors = {
  vegetables: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700",
  fruits: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700",
  flowers: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-700",
  grains: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700",
  herbs: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/50 dark:text-teal-300 dark:border-teal-700"
};

export default function PlantCard({ plant, onAddPlant, isAdded, userZone, onClick }) {
  const [visible, setVisible] = useState(false);
  const [imageError, setImageError] = useState(false);

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

  const handleImageError = () => {
    setImageError(true);
  };

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
        {/* Plant Image */}
        <div className="relative h-32 sm:h-40 bg-muted overflow-hidden">
          {plant.image_url && !imageError ?
          <img
            src={plant.image_url}
            alt={plant.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={handleImageError}
            loading="lazy" /> :


          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground/50 mx-auto mb-1" />
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted-foreground/10 rounded-full flex items-center justify-center mx-auto">
                  {categoryIcons[plant.category] || <Sprout className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground/50" />}
                </div>
              </div>
            </div>
          }
          
          {/* Category badge overlay */}
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className={`text-[10px] sm:text-xs backdrop-blur-sm bg-white/90 border-white/50 ${categoryBadgeColors[plant.category]} shadow-sm`}>
              {plant.category}
            </Badge>
          </div>
        </div>

        <CardHeader className="p-2 sm:p-4 pb-2 sm:pb-3">
          <div className="flex items-start justify-between gap-1 sm:gap-2">
            <CardTitle className="text-foreground text-sm font-bold tracking-tight sm:text-base leading-tight line-clamp-2">
              {plant.name}
            </CardTitle>
          </div>
          {/* Hide botanical name on mobile, show on larger screens */}
          <p className="hidden sm:block text-xs text-muted-foreground italic truncate">
            {plant.botanical_name}
          </p>
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
        </CardFooter>
      </Card>
    </div>);

}