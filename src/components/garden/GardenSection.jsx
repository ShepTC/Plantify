import React from "react";
import { AnimatePresence } from "framer-motion";
import PlantTaskCard from "./PlantTaskCard";

export default function GardenSection({
  title,
  icon: Icon,
  plants,
  plantDataMap,
  color,
  onStatusChange,
  onOpenPlantedDialog,
  onDelete,
  onPlantClick,
  userZone,
}) {
  if (plants.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <span className="text-sm text-muted-foreground">({plants.length})</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {plants.map((plant) => (
            <PlantTaskCard
              key={plant.id}
              plant={plant}
              plantDetails={plantDataMap[plant.plant_id]}
              onStatusChange={onStatusChange}
              onOpenPlantedDialog={onOpenPlantedDialog}
              onDelete={onDelete}
              onClick={() => onPlantClick?.(plant)}
              userZone={userZone}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}