import React, { useState, useMemo } from "react";
import { Plus, Lock, Sun, Droplets } from "lucide-react";

// Filter-pill bar + dense list of the full library grouped by plant category.
export default function BrowsePanel({ plants, categories, onAdd, disabled, isPremium, excludeIds }) {
  const entries = useMemo(
    () => categories.filter((cat) => plants.some((p) => p.category === cat.key && !excludeIds?.has(p.id))),
    [plants, categories, excludeIds]
  );

  const [active, setActive] = useState(() => entries[0]?.key || "vegetables");
  if (entries.length === 0) {
    return (
      <div className="mt-3 rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">No plants to browse. Try the Plant Library.</p>
      </div>
    );
  }

  const current = entries.find((c) => c.key === active) || entries[0];
  const list = plants.filter((p) => p.category === current.key && !excludeIds?.has(p.id));
  const Icon = current.icon;

  return (
    <div className="mt-3">
      {/* Filter pills */}
      <div className="-mx-3 px-3 flex gap-2 overflow-x-auto pb-2 md:px-0 md:mx-0">
        {entries.map((cat) => {
          const CIcon = cat.icon;
          const count = plants.filter((p) => p.category === cat.key && !excludeIds?.has(p.id)).length;
          const isActive = cat.key === current.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActive(cat.key)}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                isActive
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              <CIcon className="w-3.5 h-3.5" />
              {cat.name}
              <span className={`text-[10px] ${isActive ? "text-background/70" : "text-muted-foreground/70"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Dense list */}
      <div className="space-y-2">
        {list.map((plant) => (
          <div
            key={plant.id}
            className="flex items-center gap-3 p-2.5 rounded-2xl border border-border bg-card hover:border-primary/40 transition-colors"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${current.color} shrink-0`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm text-foreground truncate leading-tight">{plant.name}</h4>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                <span className="flex items-center gap-0.5 capitalize"><Sun className="w-3 h-3" />{plant.sun_requirements?.replace("_", " ")}</span>
                <span className="flex items-center gap-0.5 capitalize"><Droplets className="w-3 h-3" />{plant.water_needs}</span>
              </div>
            </div>
            <button
              onClick={() => !disabled && onAdd(plant)}
              disabled={disabled}
              className={`shrink-0 h-8 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-[0.98] ${
                disabled ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {disabled ? <Lock className="w-3 h-3" /> : <><Plus className="w-3.5 h-3.5" />Add</>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}