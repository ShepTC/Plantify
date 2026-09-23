import React from "react";
import { AnimatePresence } from "framer-motion";
import PlantTaskCard from "./PlantTaskCard";

export default function GardenSection({ title, icon: Icon, plants, color, hint, ...cardProps }) {
  if (plants.length === 0) return null;
  const { onPlantClick, plantDataMap, ...rest } = cardProps;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground">{plants.length}</span>
        {hint && <span className="ml-auto text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {plants.map((plant) => (
            <PlantTaskCard
              key={plant.id}
              plant={plant}
              plantDetails={plantDataMap[plant.plant_id]}
              onClick={() => onPlantClick?.(plant)}
              {...rest}
            />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}