import React from "react";
import { Link } from "react-router-dom";
import { Leaf, ArrowRight } from "lucide-react";

// Honest state when nothing can go in the ground this week.
export default function EmptyHero({ nextUp }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-border bg-card/80 backdrop-blur-xl p-6 text-center">
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Leaf className="w-6 h-6 text-primary" />
        </div>
        <h2 className="mt-3 text-lg font-bold text-foreground">Nothing to plant this week</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {nextUp
            ? <>Next up: <span className="font-semibold text-primary">{nextUp.name}</span> in {nextUp.weeksAway} week{nextUp.weeksAway !== 1 ? "s" : ""}.</>
            : "Your zone is between planting windows. A good time to plan."}
        </p>
        <Link to="/PlantLibrary" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          Plan ahead <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}