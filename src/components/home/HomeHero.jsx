import React from "react";
import { Sprout, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { format } from "date-fns";

// Compact hero: greeting, zone/week/ready inline, freemium counter.
export default function HomeHero({ user, currentWeek, readyCount, remaining, isPremium }) {
  const firstName = user?.full_name?.split(" ")[0] || "Gardener";
  const zone = user?.growing_zone;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-4 md:p-5">
      <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground">{format(new Date(), "EEEE, MMMM d")}</p>
          <h1 className="text-lg md:text-xl font-bold text-foreground leading-tight">
            Hi {firstName} 👋
          </h1>
          {zone ? (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-[11px]">
              <span className="font-semibold text-foreground">Zone {zone}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">Week {currentWeek}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-primary font-medium">{readyCount} ready</span>
            </div>
          ) : (
            <p className="mt-1 text-[11px] text-muted-foreground">Set your zone to begin</p>
          )}
        </div>
        <div className="w-11 h-11 md:w-12 md:h-12 bg-gradient-to-br from-primary/25 to-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 flex-shrink-0">
          <Sprout className="w-5 h-5 text-primary" />
        </div>
      </div>

      {!isPremium && zone && (
        <div className="relative mt-2.5 flex items-center justify-between gap-2 text-[11px]">
          <span className="text-muted-foreground">
            {remaining} free add{remaining !== 1 ? "s" : ""} left this week
          </span>
          <Link
            to={createPageUrl("Upgrade")}
            className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
          >
            <Sparkles className="w-3 h-3" />
            Go Pro
          </Link>
        </div>
      )}
    </div>
  );
}