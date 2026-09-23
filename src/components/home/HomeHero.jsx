import React from "react";
import { Sprout, Calendar, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { format } from "date-fns";

// Compact hero for the merged Home page: greeting, zone + week, a one-line
// "ready to plant" strip, and the freemium weekly-add counter.
export default function HomeHero({ user, currentWeek, readyCount, remaining, isPremium }) {
  const firstName = user?.full_name?.split(" ")[0] || "Gardener";
  const zone = user?.growing_zone;

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-secondary/10 rounded-3xl blur-2xl scale-105 opacity-60" />
      <div className="relative bg-gradient-to-br from-primary/8 via-card to-accent/8 border border-primary/15 backdrop-blur-md rounded-2xl px-4 py-5 md:px-8 md:py-7">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{format(new Date(), "EEEE, MMMM d")}</p>
            <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
              Hi {firstName} 👋
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              {zone ? <>Zone {zone} &middot; Week {currentWeek}</> : "Set your zone to begin"}
            </p>
          </div>
          <div className="w-11 h-11 md:w-14 md:h-14 bg-gradient-to-br from-primary/25 to-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg flex-shrink-0">
            <Sprout className="w-5 h-5 md:w-7 md:h-7 text-primary" />
          </div>
        </div>

        {zone && (
          <div className="mt-3 flex items-center gap-2 bg-muted/40 rounded-full px-3 py-1.5 border border-border/50 text-xs">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span className="text-foreground font-medium">
              {readyCount} crop{readyCount !== 1 ? "s" : ""} ready to plant this week
            </span>
          </div>
        )}

        {!isPremium && zone && (
          <div className="mt-2 flex items-center justify-between gap-2 text-xs">
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
    </div>
  );
}