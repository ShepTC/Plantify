import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";

export default function TodayFocusCard({ userPlants, currentWeek, userZone }) {
  // Count plants that should be planted this week
  const plantsTodayCount = userPlants.filter(p => p.planned_planting_week === currentWeek && p.status === 'planned').length;

  return (
    <div className="flex justify-center pt-2 md:pt-4">
      <Link to={createPageUrl("PlantingAlerts")} className="group relative inline-block w-full md:w-auto">
        {/* Glow effect */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 opacity-30 blur-md transition-all duration-300 group-hover:opacity-80 group-hover:blur-lg animate-pulse" />
        <Button
          size="lg"
          className="bg-gradient-to-r text-white w-full md:w-auto px-6 md:px-10 lg:px-12 py-6 md:py-7 lg:py-8 text-base md:text-lg lg:text-xl font-bold rounded-xl justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 hover:bg-primary/90 h-auto relative flex items-center gap-2 md:gap-3 from-purple-500 via-pink-500 to-orange-400 shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/5f6c1662c_LightmodeSubLogo.png"
            alt="Plant"
            className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 object-contain"
          />
          <span>What can I plant today?</span>
          {plantsTodayCount > 0 && (
            <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs md:text-sm font-semibold">
              {plantsTodayCount} ready
            </span>
          )}
        </Button>
      </Link>
    </div>
  );
}