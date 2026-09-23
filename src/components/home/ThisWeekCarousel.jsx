import React from "react";
import { motion } from "framer-motion";
import { Sprout, Leaf, Plus, Lock, Sun, Droplets } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { Button } from "@/components/ui/button";
import UpgradePrompt from "@/components/freemium/UpgradePrompt";

const methodStyles = {
  direct_sow: { badge: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700", icon: Sprout, label: "Direct Sow" },
  transplant: { badge: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700", icon: Leaf, label: "Transplant" },
};

// Horizontal swipeable carousel of plantable crops (mobile) / 3-up grid (desktop).
export default function ThisWeekCarousel({ plants, onAdd, disabled, isPremium, remaining, limit }) {
  if (plants.length === 0) {
    return (
      <div className="mt-3 rounded-2xl border border-border bg-card p-6 text-center">
        <Leaf className="w-9 h-9 mx-auto text-accent mb-2" />
        <h3 className="font-semibold text-sm text-foreground mb-1">Perfect timing, nothing urgent</h3>
        <p className="text-xs text-muted-foreground mb-3">
          No crops are optimal to plant this week. Check back during your next planting window.
        </p>
        <Link to={createPageUrl("PlantLibrary")}>
          <Button variant="outline" size="sm">Browse Plant Library</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground">
          {plants.length} crop{plants.length !== 1 ? "s" : ""} ready
        </p>
        {!isPremium && (
          <span className="text-xs text-muted-foreground">{remaining}/{limit} adds left</span>
        )}
      </div>

      <div className="-mx-3 px-3 flex gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:mx-0">
        {plants.map((plant) => {
          const m = methodStyles[plant.plantingMethod] || methodStyles.direct_sow;
          const MIcon = m.icon;
          return (
            <motion.div
              key={plant.id + plant.plantingMethod}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="snap-start shrink-0 w-[150px] md:w-auto"
            >
              <div className="rounded-2xl border border-border bg-card hover:border-primary/40 transition-colors h-full p-3 flex flex-col">
                <h3 className="font-semibold text-sm text-foreground truncate leading-tight">{plant.name}</h3>
                <p className="text-[10px] text-muted-foreground italic truncate mb-1.5">{plant.botanical_name}</p>
                <span className={`inline-flex items-center gap-1 self-start text-[10px] border rounded-full px-2 py-0.5 ${m.badge}`}>
                  <MIcon className="w-2.5 h-2.5" />
                  {m.label}
                </span>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-auto mb-2 pt-2">
                  <span className="flex items-center gap-0.5 capitalize"><Sun className="w-3 h-3" />{plant.sun_requirements?.replace("_", " ")}</span>
                  <span className="flex items-center gap-0.5 capitalize"><Droplets className="w-3 h-3" />{plant.water_needs}</span>
                </div>
                <button
                  onClick={() => !disabled && onAdd(plant)}
                  disabled={disabled}
                  className={`w-full h-8 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-[0.98] ${
                    disabled ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {disabled ? <><Lock className="w-3 h-3" />Locked</> : <><Plus className="w-3.5 h-3.5" />Add</>}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {disabled && (
        <div className="mt-3">
          <UpgradePrompt
            title="You've used all 3 free adds this week"
            description="Upgrade to Plantify Pro to add unlimited plants, set reminders, and sync your calendar."
          />
        </div>
      )}
    </div>
  );
}