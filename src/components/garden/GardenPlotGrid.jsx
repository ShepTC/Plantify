import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Sprout, Clock, Sun, LayoutGrid } from "lucide-react";
import GardenPlot from "./GardenPlot";
import TransplantCountdown from "./TransplantCountdown";

const FILTERS = [
  { key: "all", label: "All", icon: LayoutGrid },
  { key: "planted", label: "Growing", icon: Sprout },
  { key: "planned", label: "Planned", icon: Clock },
  { key: "harvested", label: "Harvested", icon: Sun },
];

export default function GardenPlotGrid({
  plants,
  plantDataMap,
  onAction,
  onDelete,
  onPlantClick,
  userZone,
}) {
  const [filter, setFilter] = useState("all");

  const counts = {
    all: plants.length,
    planted: plants.filter((p) => p.status === "planted").length,
    planned: plants.filter((p) => p.status === "planned").length,
    harvested: plants.filter((p) => p.status === "harvested").length,
  };

  const visible = filter === "all" ? plants : plants.filter((p) => p.status === filter);

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const Icon = f.icon;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 transition-all whitespace-nowrap ${
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-[2px_2px_0_0_hsl(var(--border))]"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {f.label}
              <span className={`ml-0.5 text-[10px] ${active ? "opacity-80" : "opacity-60"}`}>
                {counts[f.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Plot grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        <AnimatePresence mode="popLayout">
          {visible.map((plant) => (
            <div key={plant.id} className="flex flex-col gap-2">
              <GardenPlot
                plant={plant}
                plantDetails={plantDataMap[plant.plant_id]}
                onAction={onAction}
                onDelete={onDelete}
                onClick={() => onPlantClick?.(plant)}
                userZone={userZone}
              />
              {plant.status === "planned" && (
                <TransplantCountdown plant={plantDataMap[plant.plant_id]} userZone={userZone} />
              )}
            </div>
          ))}
        </AnimatePresence>
      </div>

      {visible.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No plants in this category yet.
        </div>
      )}
    </div>
  );
}