import React from "react";
import { Link } from "react-router-dom";
import { Bell, Bot, Lock, Sparkles, ChevronRight } from "lucide-react";

// Power features, woven in at the bottom of Today. Free users see a value-based nudge.
export default function ProTools({ isPremium }) {
  if (isPremium) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <Tile to="/MyGarden" icon={Bell} title="Reminders" sub="Set per plant" />
        <Tile to="/Assistant" icon={Bot} title="Garden AI" sub="Ask anything" />
      </div>
    );
  }
  return (
    <Link to="/Upgrade" className="group block relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/15 via-card to-secondary/15 p-4">
      <div className="absolute -right-8 -bottom-10 w-32 h-32 rounded-full bg-secondary/20 blur-2xl" />
      <div className="relative flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">Never miss a planting day</p>
          <p className="text-[11px] text-muted-foreground">Reminders, calendar sync, full season plan and Garden AI with Pro.</p>
        </div>
        <ChevronRight className="w-5 h-5 text-primary transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function Tile({ to, icon: Icon, title, sub, locked }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-3xl border border-border bg-card/70 backdrop-blur-md p-3 hover:border-primary/40 transition-colors">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        {locked ? <Lock className="w-4 h-4 text-primary" /> : <Icon className="w-4 h-4 text-primary" />}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{title}</p>
        <p className="text-[11px] text-muted-foreground truncate">{sub}</p>
      </div>
    </Link>
  );
}