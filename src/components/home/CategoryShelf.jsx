import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Lock, Sun, Droplets } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const methodBadge = {
  direct_sow: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
  transplant: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
};

// Collapsible category shelf with inline plant cards (Direct Sow / Transplant
// grouped by category), reused on the Home page.
export default function CategoryShelf({ categoryKey, category, plants, onAdd, disabled, isPremium }) {
  const [open, setOpen] = useState(false);
  const Icon = category.icon;

  return (
    <motion.div layout>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full text-left rounded-2xl border transition-all duration-300 px-4 py-3 flex items-center justify-between gap-3 ${
          open
            ? "bg-primary/10 border-primary/40"
            : "bg-card/80 border-border hover:border-primary/30 hover:bg-muted/40"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${category.color}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">{category.name}</p>
            <p className="text-xs text-muted-foreground">{plants.length} ready</p>
          </div>
        </div>
        <div
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            open ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {open ? "Hide" : "View"}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3">
              {plants.map((plant) => (
                <div
                  key={plant.id}
                  className="rounded-xl border border-border bg-muted/30 hover:border-primary/40 transition-colors p-2.5"
                >
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <h4 className="font-semibold text-xs text-foreground truncate leading-tight">{plant.name}</h4>
                    <Badge className={`text-[9px] border flex-shrink-0 ${methodBadge[plant.plantingMethod]}`}>
                      {plant.methodLabel}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-muted-foreground mb-2">
                    <span className="flex items-center gap-0.5 capitalize">
                      <Sun className="w-2.5 h-2.5" />
                      {plant.sun_requirements?.replace("_", " ")}
                    </span>
                    <span className="flex items-center gap-0.5 capitalize">
                      <Droplets className="w-2.5 h-2.5" />
                      {plant.water_needs}
                    </span>
                  </div>
                  <button
                    onClick={() => !disabled && onAdd(plant)}
                    disabled={disabled}
                    className={`w-full h-7 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-all ${
                      disabled
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {disabled ? (
                      <>
                        <Lock className="w-3 h-3" />
                        Locked
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        Add
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}