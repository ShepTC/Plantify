import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sprout, BookOpen, Lightbulb, ChevronRight } from "lucide-react";

const SEASON_TIPS = {
  spring: [
    { tip: "Start hardening off seedlings by placing them outside for a few hours each day before transplanting.", emoji: "🌱" },
    { tip: "Amend your soil with compost before planting — spring is the best time to boost nutrients.", emoji: "🪱" },
    { tip: "Sow fast-growing crops like radishes and lettuce directly into the ground once soil temps hit 40°F.", emoji: "🥬" },
    { tip: "Keep an eye on late frost warnings — cover tender seedlings overnight if needed.", emoji: "❄️" },
    { tip: "Prune dead branches from perennials now to encourage healthy new growth.", emoji: "✂️" },
  ],
  summer: [
    { tip: "Water deeply and less frequently to encourage deep root growth and drought resistance.", emoji: "💧" },
    { tip: "Mulch around plants to retain moisture, suppress weeds, and keep roots cool.", emoji: "🌿" },
    { tip: "Harvest vegetables regularly — leaving ripe produce on plants slows new production.", emoji: "🍅" },
    { tip: "Watch for heat stress: wilting in the morning (not afternoon) means your plants need more water.", emoji: "☀️" },
    { tip: "Deadhead flowers frequently to extend their blooming season.", emoji: "🌸" },
  ],
  fall: [
    { tip: "Plant garlic and spring bulbs now for a head start before winter.", emoji: "🧄" },
    { tip: "Collect seeds from your best-performing plants for next year's garden.", emoji: "🌾" },
    { tip: "Add fallen leaves to your compost or use them as mulch to enrich the soil over winter.", emoji: "🍂" },
    { tip: "Plant cool-season crops like kale, spinach, and broccoli for a fall harvest.", emoji: "🥦" },
    { tip: "Clean up diseased plant debris to prevent pests and diseases from overwintering.", emoji: "🧹" },
  ],
  winter: [
    { tip: "Plan next year's garden layout now — rotate crop families to prevent soil diseases.", emoji: "📋" },
    { tip: "Start seeds indoors 6–8 weeks before your last frost date for an early spring harvest.", emoji: "🌡️" },
    { tip: "Order seeds from catalogs early — popular varieties sell out fast!", emoji: "📬" },
    { tip: "Test your soil pH and add amendments now so they're ready by spring planting time.", emoji: "🧪" },
    { tip: "Check stored bulbs and tubers for rot, and discard any that are soft or moldy.", emoji: "🔍" },
  ],
};

function getSeason(month) {
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "fall";
  return "winter";
}

export default function PlantingProgress({ userPlants }) {
  const [tipIndex, setTipIndex] = useState(0);

  const season = getSeason(new Date().getMonth());
  const tips = SEASON_TIPS[season];

  useEffect(() => {
    // Rotate tip based on day of year so it changes daily
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    setTipIndex(dayOfYear % tips.length);
  }, [tips.length]);

  const currentTip = tips[tipIndex];

  const handleNextTip = (e) => {
    e.preventDefault();
    setTipIndex((prev) => (prev + 1) % tips.length);
  };

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

  const seasonLabel = season.charAt(0).toUpperCase() + season.slice(1);

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border">
      <CardContent className="px-5 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-secondary" />
            <h3 className="font-semibold text-foreground">{seasonLabel} Garden Tip</h3>
          </div>
          <span className="text-xs text-muted-foreground">{tipIndex + 1}/{tips.length}</span>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-4 border border-primary/20">
          <p className="text-2xl mb-2">{currentTip.emoji}</p>
          <p className="text-sm text-foreground leading-relaxed">{currentTip.tip}</p>
        </div>

        <button
          onClick={handleNextTip}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors ml-auto"
        >
          Next tip <ChevronRight className="w-3 h-3" />
        </button>
      </CardContent>
    </Card>
  );
}