import React from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Lock, Sparkles, CalendarDays } from "lucide-react";
import { FREE_COMING_UP_PREVIEW } from "@/utils/freemium";

function Row({ item, blurred }) {
  return (
    <div className={`flex items-center gap-3 py-2.5 ${blurred ? "blur-[3px] select-none" : ""}`}>
      <div className="w-11 flex-shrink-0 rounded-xl border border-border bg-background/60 py-1 text-center">
        <p className="text-[9px] font-bold uppercase tracking-wider text-secondary">{format(item.startDate, "MMM")}</p>
        <p className="text-base font-bold leading-none text-foreground">{format(item.startDate, "d")}</p>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
        <p className="text-[11px] text-muted-foreground">{item.methodLabel} · in {item.weeksAway} week{item.weeksAway !== 1 ? "s" : ""}</p>
      </div>
    </div>
  );
}

// Forward-looking peek. Free: the next item. Pro: the whole season ahead.
export default function ComingUp({ items, isPremium }) {
  if (items.length === 0) return null;
  const visible = isPremium ? items.slice(0, 8) : items.slice(0, FREE_COMING_UP_PREVIEW);
  const teaser = isPremium ? [] : items.slice(FREE_COMING_UP_PREVIEW, FREE_COMING_UP_PREVIEW + 2);

  return (
    <section className="rounded-3xl border border-border bg-card/70 backdrop-blur-md px-4 pt-3 pb-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Coming up</h3>
        <Link to="/Calendar" className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
          <CalendarDays className="w-3.5 h-3.5" /> Calendar
        </Link>
      </div>
      <div className="divide-y divide-border">
        {visible.map((item) => <Row key={item.id} item={item} />)}
      </div>
      {teaser.length > 0 && (
        <div className="relative divide-y divide-border border-t border-border">
          {teaser.map((item) => <Row key={item.id} item={item} blurred />)}
          <Link to="/Upgrade" className="absolute inset-0 flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/25">
              <Lock className="w-3 h-3" /> See your full season <Sparkles className="w-3 h-3" />
            </span>
          </Link>
        </div>
      )}
    </section>
  );
}