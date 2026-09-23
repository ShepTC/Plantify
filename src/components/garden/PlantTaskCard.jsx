import React from "react";
import { motion } from "framer-motion";
import { Sprout, Wind, Sun, Leaf, Check, Trash2, Calendar } from "lucide-react";
import { getPlantingTask } from "@/utils/plantingTask";

const accentStyles = {
  purple: {
    bar: "bg-purple-500",
    text: "text-purple-600 dark:text-purple-400",
    soft: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-200 dark:border-purple-800",
  },
  blue: {
    bar: "bg-blue-500",
    text: "text-blue-600 dark:text-blue-400",
    soft: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
  },
  primary: {
    bar: "bg-primary",
    text: "text-primary",
    soft: "bg-primary/10",
    border: "border-primary/30",
  },
  emerald: {
    bar: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    soft: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  green: {
    bar: "bg-green-500",
    text: "text-green-600 dark:text-green-400",
    soft: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
  },
  amber: {
    bar: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    soft: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
  },
};

const labelIcons = {
  "Start Seeds Indoors": Sprout,
  "Harden Off": Wind,
  "Transplant Outdoors": Leaf,
  "Direct Sow Outdoors": Sprout,
  Growing: Sun,
  Harvested: Check,
  Plant: Sprout,
};

export default function PlantTaskCard({
  plant,
  plantDetails,
  onStatusChange,
  onOpenPlantedDialog,
  onDelete,
  onClick,
  userZone,
}) {
  const task = getPlantingTask(plant, plantDetails, userZone);
  if (!task) return null;

  const accent = accentStyles[task.accent] || accentStyles.purple;
  const Icon = labelIcons[task.label] || Sprout;

  const handleAction = (e) => {
    e.stopPropagation();
    if (task.action === "harvest") {
      onStatusChange(plant.id, "harvested");
    } else if (task.action) {
      onOpenPlantedDialog(plant, task.action);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`relative overflow-hidden rounded-2xl border ${accent.border} bg-card cursor-pointer transition-all duration-200 hover:shadow-md`}
        onClick={onClick}
      >
        {/* accent stripe */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accent.bar}`} />

        <div className="pl-4 pr-3 py-3">
          {/* task label + delete */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-7 h-7 rounded-lg ${accent.soft} flex items-center justify-center flex-shrink-0`}
              >
                <Icon className={`w-4 h-4 ${accent.text}`} />
              </div>
              <span
                className={`text-[11px] font-bold uppercase tracking-wide ${accent.text} truncate`}
              >
                {task.label}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(plant.id);
              }}
              className="text-muted-foreground hover:text-destructive transition-colors p-1 -m-1 flex-shrink-0"
              aria-label="Remove from garden"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* plant name */}
          <h3 className="text-base font-bold text-foreground leading-tight mb-1">
            {plant.plant_name}
          </h3>

          {/* date + reason row */}
          {(task.dateLabel || task.reason) && (
            <div className="flex items-center gap-1.5 text-xs mb-3 flex-wrap">
              {task.dateLabel && (
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  {task.dateLabel}
                </span>
              )}
              {task.dateLabel && task.reason && (
                <span className="text-border">·</span>
              )}
              {task.reason && (
                <span className="text-muted-foreground">{task.reason}</span>
              )}
            </div>
          )}

          {/* action button */}
          {task.action ? (
            <button
              onClick={handleAction}
              className={`w-full h-9 rounded-xl text-sm font-semibold text-white transition-all ${accent.bar} hover:opacity-90 active:scale-[0.98]`}
            >
              {task.actionLabel}
            </button>
          ) : (
            <div className={`w-full h-9 rounded-xl text-sm font-medium ${accent.soft} ${accent.text} flex items-center justify-center`}>
              <Check className="w-4 h-4 mr-1.5" />
              Done
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}