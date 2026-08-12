import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sprout, Clock, Sun, Trash2, ChevronDown, Droplets, Calendar, Leaf } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { getHardeningOffWindow } from "@/utils/hardeningOff";

const statusConfig = {
  planned: { icon: Clock, color: "bg-blue-500", textColor: "text-blue-600 dark:text-blue-400", label: "Planned" },
  planted: { icon: Sprout, color: "bg-green-500", textColor: "text-green-600 dark:text-green-400", label: "Growing" },
  harvested: { icon: Sun, color: "bg-amber-500", textColor: "text-amber-600 dark:text-amber-400", label: "Harvested" }
};

export default function PlantCard({ plant, plantDetails, onStatusChange, onOpenPlantedDialog, onDelete, onClick, userZone }) {
  const config = statusConfig[plant.status] || statusConfig.planned;
  const Icon = config.icon;

  // Determine the next-step action label for planned plants
  const actionLabel = (() => {
    if (plant.status !== 'planned') return null;
    try {
      const hardeningWindow = getHardeningOffWindow(plantDetails, userZone);
      if (hardeningWindow) {
        const daysUntilHardening = differenceInDays(hardeningWindow.start, new Date());
        if (daysUntilHardening <= 0) return 'transplant';
      }
    } catch (e) {
      // If hardening-off calc fails, still show seed_start
    }
    return 'seed_start';
  })();

  // Calculate days until harvest
  const getDaysUntilHarvest = () => {
    if (!plant.harvest_date || plant.status === 'harvested') return null;
    const days = differenceInDays(new Date(plant.harvest_date), new Date());
    if (days < 0) return "Ready!";
    if (days === 0) return "Today!";
    return `${days}d`;
  };

  const daysUntilHarvest = getDaysUntilHarvest();

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
        <div className="relative h-16 md:h-20 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
          {plantDetails?.image_url ? (
            <img 
              src={plantDetails.image_url} 
              alt={plant.plant_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Sprout className="w-7 h-7 text-primary/40" />
            </div>
          )}
          
          {/* Status Badge */}
          <Badge className={`absolute top-1 left-1 ${config.color} text-white text-[9px] md:text-[10px] px-1.5 py-0.5`}>
            <Icon className="w-2.5 h-2.5 mr-0.5" />
            {config.label}
          </Badge>

          {/* Days until harvest badge */}
          {daysUntilHarvest && (
            <Badge className="absolute top-1 right-1 bg-amber-500 text-white text-[9px] md:text-[10px] px-1.5 py-0.5">
              <Calendar className="w-2.5 h-2.5 mr-0.5" />
              {daysUntilHarvest}
            </Badge>
          )}
        </div>

        <CardContent className="p-2 md:p-2.5">
          <h3 className="font-semibold text-xs md:text-sm text-foreground line-clamp-1 mb-1">
            {plant.plant_name}
          </h3>

          {/* Plant Info + Harvest Date */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-2">
            {plantDetails?.water_needs && (
              <span className="text-[9px] md:text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Droplets className="w-2.5 h-2.5" />
                {plantDetails.water_needs}
              </span>
            )}
            {plantDetails?.sun_requirements && (
              <span className="text-[9px] md:text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Sun className="w-2.5 h-2.5" />
                {plantDetails.sun_requirements.replace("_", " ")}
              </span>
            )}
            {plant.harvest_date && plant.status !== 'harvested' && (
              <span className="text-[9px] md:text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Calendar className="w-2.5 h-2.5" />
                {format(new Date(plant.harvest_date), 'MMM d')}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 text-[10px] md:text-xs h-7 px-2">
                  Status <ChevronDown className="w-3 h-3 ml-0.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {actionLabel && (
                  <DropdownMenuItem
                    onClick={() => onOpenPlantedDialog(plant, actionLabel)}
                    className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-semibold rounded-md mb-1 shadow-md hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 focus:from-purple-600 focus:via-pink-600 focus:to-orange-500"
                  >
                    {actionLabel === 'transplant' ? (
                      <Leaf className="w-4 h-4 mr-2 text-white" />
                    ) : (
                      <Sprout className="w-4 h-4 mr-2 text-white" />
                    )}
                    {actionLabel === 'transplant' ? 'Transplant' : 'Seed Start'}
                  </DropdownMenuItem>
                )}
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
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}