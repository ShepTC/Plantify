import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sprout, BookOpen, Lightbulb } from "lucide-react";

const SEASONAL_INSIGHTS = {
  // Winter (Dec, Jan, Feb)
  winter: [
    { emoji: "📋", tip: "Plan your crop rotation now so you're ready when spring arrives." },
    { emoji: "🌱", tip: "Start seeds indoors for early spring transplants like peppers and tomatoes." },
    { emoji: "📚", tip: "Research new varieties to try this season — heirlooms can add great flavor." },
    { emoji: "🌿", tip: "Check your stored bulbs and tubers for rot or drying out." },
  ],
  // Spring (Mar, Apr, May)
  spring: [
    { emoji: "🌧️", tip: "Consistent moisture is key right now — mulch to retain soil humidity." },
    { emoji: "🐛", tip: "Inspect young seedlings for pests early — prevention is easier than treatment." },
    { emoji: "🌡️", tip: "Harden off indoor seedlings before transplanting — start with a few hours outside." },
    { emoji: "🌼", tip: "Plant companion flowers like marigolds to naturally deter garden pests." },
  ],
  // Summer (Jun, Jul, Aug)
  summer: [
    { emoji: "💧", tip: "Water deeply and less frequently to encourage deep root growth." },
    { emoji: "☀️", tip: "Shade cloth can protect heat-sensitive crops from afternoon sun." },
    { emoji: "✂️", tip: "Deadhead flowers and prune tomato suckers to keep plants productive." },
    { emoji: "🍅", tip: "Harvest regularly — leaving ripe produce on the plant slows new fruit growth." },
  ],
  // Fall (Sep, Oct, Nov)
  fall: [
    { emoji: "🌾", tip: "Plant garlic and spring bulbs now for a head start next year." },
    { emoji: "🍂", tip: "Add fallen leaves to your compost pile — they're a great carbon source." },
    { emoji: "❄️", tip: "Use row covers to extend your growing season by a few weeks." },
    { emoji: "🧄", tip: "Cool-season crops like kale and spinach actually taste better after a frost." },
  ],
};

function getSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "fall";
  return "winter";
}

export default function PlantingProgress({ userPlants }) {
  const season = getSeason();
  const insights = SEASONAL_INSIGHTS[season];

  // Pick 3 tips based on day of month so they rotate daily
  const dayOfMonth = new Date().getDate();
  const tip1 = insights[dayOfMonth % insights.length];
  const tip2 = insights[(dayOfMonth + 1) % insights.length];
  const tip3 = insights[(dayOfMonth + 2) % insights.length];
  const displayTips = [tip1, tip2, tip3];

  if (userPlants.length === 0) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border">
        <CardContent className="p-6">
          <div className="text-center py-6">
            <Sprout className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-3">Start Your Garden</h3>
            <Link to={createPageUrl("PlantLibrary")}>
              <Button variant="outline" size="sm" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Browse Plant Library
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border">
      <CardContent className="px-5 py-4 space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-secondary" />
          <h3 className="font-semibold text-foreground capitalize">{season} Garden Insights</h3>
        </div>

        <div className="space-y-2">
          {displayTips.map((tip, i) => (
            <div key={i} className="bg-muted/50 rounded-lg px-4 py-3 flex items-start gap-3">
              <span className="text-lg leading-tight">{tip.emoji}</span>
              <p className="text-sm text-foreground leading-snug">{tip.tip}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}