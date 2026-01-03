import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sprout, Clock, Sun, Trash2, ChevronDown, Droplets, Calendar, Leaf } from "lucide-react";
import { format, differenceInDays, getWeek } from "date-fns";
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

export default function PlantCard({ plant, plantDetails, onStatusChange, onOpenPlantedDialog, onDelete, onClick }) {
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

  // Get planting window info
  const getPlantingWindow = () => {
    if (!plantDetails?.planting_zones || plant.status !== 'planned') return null;
    
    // Try to find zone info (simplified check)
    const zoneInfo = plantDetails.planting_zones[0];
    if (!zoneInfo) return null;
    
    const currentWeek = getWeek(new Date());
    
    // Check if in spring window
    if (zoneInfo.spring_start_week && zoneInfo.spring_end_week) {
      if (currentWeek >= zoneInfo.spring_start_week && currentWeek <= zoneInfo.spring_end_week) {
        return `Plant now (Spring wk ${zoneInfo.spring_start_week}-${zoneInfo.spring_end_week})`;
      }
      if (currentWeek < zoneInfo.spring_start_week) {
        return `Spring: wk ${zoneInfo.spring_start_week}-${zoneInfo.spring_end_week}`;
      }
    }
    
    // Check if in fall window
    if (zoneInfo.fall_start_week && zoneInfo.fall_end_week) {
      if (currentWeek >= zoneInfo.fall_start_week && currentWeek <= zoneInfo.fall_end_week) {
        return `Plant now (Fall wk ${zoneInfo.fall_start_week}-${zoneInfo.fall_end_week})`;
      }
      if (currentWeek < zoneInfo.fall_start_week) {
        return `Fall: wk ${zoneInfo.fall_start_week}-${zoneInfo.fall_end_week}`;
      }
    }
    
    return null;
  };

  const plantingWindow = getPlantingWindow();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-card border-border hover:border-primary/40 transition-all duration-300 overflow-hidden cursor-pointer" onClick={onClick}>
        <CardContent className="p-3">
          {/* Header with icon and status */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-foreground truncate">
                {plant.plant_name}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(plant.id);
              }}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0 -mr-1 flex-shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Planting window - only for planned plants */}
          {plantingWindow && (
            <div className="mb-2 text-[10px] text-primary bg-primary/10 rounded px-2 py-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {plantingWindow}
            </div>
          )}

          {/* Quick info */}
          <div className="flex items-center gap-2 mb-2 text-[10px] text-muted-foreground">
            {plantDetails?.water_needs && (
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3" />
                {plantDetails.water_needs}
              </span>
            )}
            {plantDetails?.sun_requirements && (
              <span className="flex items-center gap-1">
                <Sun className="w-3 h-3" />
                {plantDetails.sun_requirements.split('_')[0]}
              </span>
            )}
          </div>

          {/* Harvest info */}
          {daysUntilHarvest && (
            <div className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded px-2 py-1 mb-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Harvest: {daysUntilHarvest}
            </div>
          )}

          {/* Status dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="outline" size="sm" className="w-full text-xs h-7">
                Change Status <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onStatusChange(plant.id, 'planned');
              }}>
                <Clock className="w-4 h-4 mr-2 text-blue-500" /> Planned
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onOpenPlantedDialog(plant);
              }}>
                <Sprout className="w-4 h-4 mr-2 text-green-500" /> Planted
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onStatusChange(plant.id, 'harvested');
              }}>
                <Sun className="w-4 h-4 mr-2 text-amber-500" /> Harvested
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
    </motion.div>
  );
}