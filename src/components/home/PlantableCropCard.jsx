import React from "react";
import { Sprout, Leaf, Plus, Lock, Sun, Droplets } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const methodStyles = {
  direct_sow: {
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
    icon: Sprout,
    label: "Direct Sow",
  },
  transplant: {
    badge: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
    icon: Leaf,
    label: "Transplant",
  },
};

// Action card for a single plantable crop on the Home page.
export default function PlantableCropCard({ plant, onAdd, disabled, isPremium }) {
  const m = methodStyles[plant.plantingMethod] || methodStyles.direct_sow;
  const MIcon = m.icon;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (disabled) return;
    onAdd(plant);
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/40 transition-colors h-full">
        <div className="p-3">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate leading-tight">{plant.name}</h3>
              <p className="text-[10px] text-muted-foreground italic truncate">{plant.botanical_name}</p>
            </div>
            <Badge className={`text-[10px] border flex-shrink-0 ${m.badge}`}>
              <MIcon className="w-2.5 h-2.5 mr-1" />
              {m.label}
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2.5">
            <span className="flex items-center gap-1 capitalize">
              <Sun className="w-3 h-3" />
              {plant.sun_requirements?.replace("_", " ")}
            </span>
            <span className="flex items-center gap-1 capitalize">
              <Droplets className="w-3 h-3" />
              {plant.water_needs}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={disabled}
            className={`w-full h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
              disabled
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {disabled ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                Limit reached
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Add to Garden
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}