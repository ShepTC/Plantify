import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sprout, Clock, Sun, Trash2, ChevronDown, Droplets, Calendar } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

const statusConfig = {
  planned: { icon: Clock, color: "bg-blue-500", textColor: "text-blue-600 dark:text-blue-400", label: "Planned" },
  planted: { icon: Sprout, color: "bg-green-500", textColor: "text-green-600 dark:text-green-400", label: "Growing" },
  harvested: { icon: Sun, color: "bg-amber-500", textColor: "text-amber-600 dark:text-amber-400", label: "Harvested" }
};

export default function PlantCard({ plant, plantDetails, onStatusChange, onOpenPlantedDialog, onDelete, onClick, userZone }) {
  const config = statusConfig[plant.status] || statusConfig.planned;
  const Icon = config.icon;

  // Calculate days until harvest
  const getDaysUntilHarvest = () => {
    if (!plant.harvest_date || plant.status === 'harvested') return null;
    const days = differenceInDays(new Date(plant.harvest_date), new Date());
    if (days < 0) return "Ready!";
    if (days === 0) return "Today!";
    return `${days}d`;
  };

  const daysUntilHarvest = getDaysUntilHarvest();

  // Get planting windows for user's zone
  const getPlantingWindows = () => {
    if (!userZone || !plantDetails?.planting_zones) return null;
    return plantDetails.planting_zones.find(
      (z) => z.zone === userZone || z.zone === userZone.substring(0, userZone.length - 1)
    );
  };

  const plantingWindows = getPlantingWindows();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="bg-card border-border hover:border-primary/40 transition-all duration-300 overflow-hidden group cursor-pointer"
        onClick={onClick}
      >
        {/* Plant Image or Gradient */}
        <div className="relative h-24 md:h-32 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
          {plantDetails?.image_url ? (
            <img 
              src={plantDetails.image_url} 
              alt={plant.plant_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Sprout className="w-10 h-10 text-primary/40" />
            </div>
          )}
          
          {/* Status Badge */}
          <Badge className={`absolute top-2 left-2 ${config.color} text-white text-[10px] md:text-xs`}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>

          {/* Days until harvest badge */}
          {daysUntilHarvest && (
            <Badge className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] md:text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              {daysUntilHarvest}
            </Badge>
          )}
        </div>

        <CardContent className="p-3 md:p-4">
          <h3 className="font-semibold text-sm md:text-base text-foreground line-clamp-1 mb-2">
            {plant.plant_name}
          </h3>

          {/* Planting Window Info - Show for planned plants */}
          {plant.status === 'planned' && plantingWindows && (
            <div className="mb-3 text-[10px] md:text-xs">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Spring:</span> Weeks {plantingWindows.spring_start_week}-{plantingWindows.spring_end_week}
              </p>
              {plantingWindows.fall_start_week && (
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Fall:</span> Weeks {plantingWindows.fall_start_week}-{plantingWindows.fall_end_week}
                </p>
              )}
            </div>
          )}

          {/* Plant Info */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {plantDetails?.water_needs && (
              <span className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1">
                <Droplets className="w-3 h-3" />
                {plantDetails.water_needs}
              </span>
            )}
            {plantDetails?.sun_requirements && (
              <span className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1">
                <Sun className="w-3 h-3" />
                {plantDetails.sun_requirements.replace("_", " ")}
              </span>
            )}
          </div>

          {/* Harvest Date */}
          {plant.harvest_date && plant.status !== 'harvested' && (
            <p className="text-[10px] md:text-xs text-muted-foreground mb-3">
              Est. harvest: <span className="font-medium text-foreground">{format(new Date(plant.harvest_date), 'MMM d, yyyy')}</span>
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                  Status <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onStatusChange(plant.id, 'planned')}>
                  <Clock className="w-4 h-4 mr-2 text-blue-500" /> Planned
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onOpenPlantedDialog(plant)}>
                  <Sprout className="w-4 h-4 mr-2 text-green-500" /> Planted
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(plant.id, 'harvested')}>
                  <Sun className="w-4 h-4 mr-2 text-amber-500" /> Harvested
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(plant.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}