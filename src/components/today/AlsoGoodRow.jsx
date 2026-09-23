import React from "react";
import { motion } from "framer-motion";
import PlantThumb from "./PlantThumb";
import AddButton from "./AddButton";

// Browsable layer: other crops in season, swipeable on mobile.
export default function AlsoGoodRow({ plants, addedIds, loadingId, onAdd, onOpen }) {
  if (plants.length === 0) return null;
  return (
    <section>
      <div className="flex items-baseline justify-between px-1 mb-2">
        <h3 className="text-sm font-bold text-foreground">Also good right now</h3>
        <span className="text-[11px] text-muted-foreground">{plants.length} more</span>
      </div>
      <div className="-mx-4 px-4 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] md:mx-0 md:px-0 md:grid md:grid-cols-4 md:overflow-visible">
        {plants.map((plant, i) => (
          <motion.div
            key={plant.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * Math.min(i, 6), duration: 0.25 }}
            onClick={() => onOpen(plant)}
            className="snap-start shrink-0 w-[140px] md:w-auto cursor-pointer rounded-3xl border border-border bg-card/70 backdrop-blur-md p-2 hover:border-primary/40 transition-colors"
          >
            <PlantThumb plant={plant} className="w-full h-24 rounded-2xl" />
            <div className="mt-2 flex items-end justify-between gap-1 px-0.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate leading-tight">{plant.name}</p>
                <p className="text-[10px] text-muted-foreground">{plant.methodLabel}</p>
              </div>
              <AddButton compact added={addedIds.has(plant.id)} loading={loadingId === plant.id} onClick={() => onAdd(plant)} />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}