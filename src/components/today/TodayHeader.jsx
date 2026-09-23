import React from "react";
import { format } from "date-fns";
import { MapPin } from "lucide-react";

// Quiet greeting line — the answer below is the hero, not this.
export default function TodayHeader({ user, currentWeek }) {
  const first = user?.full_name?.split(" ")[0] || "Gardener";
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const zone = user?.growing_zone;

  return (
    <header className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {format(new Date(), "EEEE · MMM d")}
        </p>
        <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
          {greet}, {first}
        </h1>
      </div>
      {zone && (
        <div className="flex-shrink-0 inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
          <MapPin className="w-3 h-3" />
          Zone {zone} · Wk {currentWeek}
        </div>
      )}
    </header>
  );
}