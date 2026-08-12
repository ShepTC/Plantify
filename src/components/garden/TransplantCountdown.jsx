import React, { useState, useEffect } from "react";
import { Sprout, Wind } from "lucide-react";
import { getHardeningOffWindow } from "@/utils/hardeningOff";
import { differenceInDays, format } from "date-fns";

/**
 * Live countdown to transplant day for planned indoor-start crops.
 * Shows days remaining until transplant, or alerts when hardening-off
 * is in progress. Uses theme tokens so it adapts to every palette.
 */
export default function TransplantCountdown({ plant, userZone }) {
  const ho = getHardeningOffWindow(plant, userZone);
  const [now, setNow] = useState(() => new Date());

  // Tick once a day boundary could have crossed; a short interval is enough.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  if (!ho) return null;

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const daysUntilHardening = differenceInDays(ho.start, today);
  const daysUntilTransplant = differenceInDays(ho.transplantDate, today);

  // Transplant day reached or passed
  if (daysUntilTransplant <= 0) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Sprout className="w-3.5 h-3.5 text-primary" />
          <p className="text-[11px] md:text-xs font-semibold text-primary">
            Transplant outdoors now!
          </p>
        </div>
        <p className="text-[10px] md:text-[11px] text-muted-foreground mt-0.5">
          Scheduled for {format(ho.transplantDate, 'MMM d')}
        </p>
      </div>
    );
  }

  // Hardening-off window is active (between start and transplant date)
  if (daysUntilHardening <= 0 && daysUntilTransplant > 0) {
    return (
      <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Wind className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
          <p className="text-[11px] md:text-xs font-semibold text-blue-600 dark:text-blue-400">
            Hardening off now
          </p>
        </div>
        <p className="text-[10px] md:text-[11px] text-muted-foreground mt-0.5">
          Transplant in <span className="font-bold text-foreground">{daysUntilTransplant}d</span> · {format(ho.transplantDate, 'MMM d')}
        </p>
      </div>
    );
  }

  // Waiting period before hardening-off begins
  return (
    <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sprout className="w-3.5 h-3.5 text-primary" />
          <p className="text-[11px] md:text-xs font-semibold text-foreground">
            Transplant in {daysUntilTransplant}d
          </p>
        </div>
        <p className="text-[10px] md:text-[11px] text-muted-foreground">
          {format(ho.transplantDate, 'MMM d')}
        </p>
      </div>
      <p className="text-[10px] md:text-[11px] text-muted-foreground mt-0.5">
        Harden off in {daysUntilHardening}d
      </p>
    </div>
  );
}