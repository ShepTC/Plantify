import React from "react";
import { motion } from "framer-motion";
import { format, addDays } from "date-fns";
import { Sprout, Leaf, Clock } from "lucide-react";
import PlantThumb from "./PlantThumb";
import AddButton from "./AddButton";
import { weekToDate, weeksUntil } from "@/utils/plantingWindows";

// THE answer: the single most time-sensitive crop to plant right now.
export default function HeroPick({ plant, currentWeek, added, loading, onAdd, onOpen }) {
  const left = weeksUntil(plant.windowEndWeek, currentWeek);
  const closes = addDays(weekToDate(plant.windowEndWeek, currentWeek), 6);
  const MethodIcon = plant.plantingMethod === "transplant" ? Leaf : Sprout;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      onClick={onOpen}
      className="relative overflow-hidden rounded-[28px] border border-primary/20 bg-card/80 backdrop-blur-xl shadow-xl shadow-primary/5 cursor-pointer md:grid md:grid-cols-2"
    >
      <div className="relative h-44 md:h-full md:min-h-[260px]">
        <PlantThumb plant={plant} className="absolute inset-0 w-full h-full" iconClass="w-14 h-14" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:bg-gradient-to-r" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/45 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          Plant this week
        </span>
      </div>

      <div className="p-4 md:p-6 flex flex-col">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary">
          <MethodIcon className="w-3.5 h-3.5" />
          {plant.plantingMethod === "indoor" ? "Start seeds indoors" : `${plant.methodLabel} outdoors`} · {plant.season}
        </div>
        <h2 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">{plant.name}</h2>
        {plant.botanical_name && <p className="text-xs italic text-muted-foreground">{plant.botanical_name}</p>}

        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-muted/60 px-3 py-2">
          <Clock className="w-4 h-4 text-secondary flex-shrink-0" />
          <p className="text-xs text-foreground">
            {left === 0 ? <span className="font-semibold">Last week to plant</span> : <>Window open for <span className="font-semibold">{left + 1} more weeks</span></>}
            <span className="text-muted-foreground"> · closes {format(closes, "MMM d")}</span>
          </p>
        </div>

        {plant.days_to_maturity && (
          <p className="mt-2 text-xs text-muted-foreground">Harvest in about {plant.days_to_maturity} days</p>
        )}

        <div className="mt-4 md:mt-auto md:pt-4">
          <AddButton added={added} loading={loading} onClick={() => onAdd(plant)} />
        </div>
      </div>
    </motion.article>
  );
}