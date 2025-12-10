import React from "react";
import { Sprout, Clock, Sun, TrendingUp } from "lucide-react";

export default function GardenStats({ plants }) {
  const planned = plants.filter(p => p.status === 'planned').length;
  const planted = plants.filter(p => p.status === 'planted').length;
  const harvested = plants.filter(p => p.status === 'harvested').length;
  const total = plants.length;

  const stats = [
    { label: "Planned", value: planned, icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Growing", value: planted, icon: Sprout, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Harvested", value: harvested, icon: Sun, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Total", value: total, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className={`${stat.bg} rounded-xl p-3 md:p-4 text-center`}>
          <stat.icon className={`w-5 h-5 md:w-6 md:h-6 mx-auto mb-1 ${stat.color}`} />
          <p className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</p>
          <p className="text-[10px] md:text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}