import React from "react";
import { Link } from "react-router-dom";
import { Plus, LayoutGrid, Gamepad2 } from "lucide-react";

// Compact garden header: counts + opt-in pixel garden toggle.
export default function GardenHeader({ plants, showPixel, onTogglePixel }) {
  const growing = plants.filter((p) => p.status === "planted").length;
  const planned = plants.filter((p) => p.status === "planned").length;
  const harvested = plants.filter((p) => p.status === "harvested").length;

  return (
    <header className="flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">My Garden</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          <span className="font-semibold text-primary">{growing} growing</span> · {planned} planned · {harvested} harvested
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {plants.length > 0 && (
          <button
            onClick={onTogglePixel}
            aria-label={showPixel ? "Show list view" : "Show pixel garden"}
            className={`h-9 px-3 rounded-full border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${showPixel ? "bg-primary text-primary-foreground border-primary" : "bg-card/70 border-border text-muted-foreground hover:text-primary"}`}
          >
            {showPixel ? <LayoutGrid className="w-3.5 h-3.5" /> : <Gamepad2 className="w-3.5 h-3.5" />}
            {showPixel ? "List" : "Pixel view"}
          </button>
        )}
        <Link to="/PlantLibrary" aria-label="Add plants" className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/20 hover:bg-primary/90">
          <Plus className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}