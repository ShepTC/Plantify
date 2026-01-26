import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sprout, Sun, Calendar, AlertTriangle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { Plant } from "@/entities/Plant";
import { Reminder } from "@/entities/Reminder";
import { format, differenceInDays, addDays } from "date-fns";

export default function TodayFocusCard({ userPlants, currentWeek, userZone }) {
  const [nextAction, setNextAction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    findMostUrgentAction();
  }, [userPlants, currentWeek, userZone]);

  const findMostUrgentAction = async () => {
    try {
      // Priority 1: Plants to plant this week
      const plantsThisWeek = userPlants.filter(
        (p) => p.status === "planned" && p.planned_planting_week === currentWeek
      );

      if (plantsThisWeek.length > 0) {
        setNextAction({
          type: "plant",
          plant: plantsThisWeek[0],
          count: plantsThisWeek.length,
          urgency: "this-week",
          message: plantsThisWeek.length === 1 
            ? `${plantsThisWeek[0].plant_name}` 
            : `${plantsThisWeek.length} plants`,
          action: "Plant now",
          icon: Sprout,
          color: "primary",
          link: createPageUrl("PlantingAlerts")
        });
        setLoading(false);
        return;
      }

      // Priority 2: Plants ready to harvest soon (within 7 days)
      const today = new Date();
      const readyToHarvest = userPlants.filter((p) => {
        if (p.status !== "planted" || !p.actual_planting_date || !p.plant_id) return false;
        // Simple estimation: assume 60 days to maturity if we don't have the data
        const plantingDate = new Date(p.actual_planting_date);
        const estimatedHarvest = addDays(plantingDate, 60);
        const daysUntil = differenceInDays(estimatedHarvest, today);
        return daysUntil >= 0 && daysUntil <= 7;
      });

      if (readyToHarvest.length > 0) {
        setNextAction({
          type: "harvest",
          plant: readyToHarvest[0],
          count: readyToHarvest.length,
          urgency: "soon",
          message: readyToHarvest.length === 1
            ? `${readyToHarvest[0].plant_name}`
            : `${readyToHarvest.length} plants`,
          action: "Check harvest",
          icon: Sun,
          color: "accent",
          link: createPageUrl("MyGarden")
        });
        setLoading(false);
        return;
      }

      // Priority 3: Plants to plant next week
      const plantsNextWeek = userPlants.filter(
        (p) => p.status === "planned" && p.planned_planting_week === currentWeek + 1
      );

      if (plantsNextWeek.length > 0) {
        setNextAction({
          type: "plant",
          plant: plantsNextWeek[0],
          count: plantsNextWeek.length,
          urgency: "next-week",
          message: plantsNextWeek.length === 1
            ? `${plantsNextWeek[0].plant_name}`
            : `${plantsNextWeek.length} plants`,
          action: "Plan ahead",
          icon: Calendar,
          color: "secondary",
          link: createPageUrl("PlantingAlerts")
        });
        setLoading(false);
        return;
      }

      // Priority 4: No urgent actions - encourage exploration
      setNextAction({
        type: "explore",
        urgency: "none",
        message: "Explore planting opportunities",
        action: "Browse plants",
        icon: Sprout,
        color: "primary",
        link: createPageUrl("PlantLibrary")
      });
      setLoading(false);
    } catch (error) {
      console.error("Error finding urgent action:", error);
      setLoading(false);
    }
  };

  if (loading || !nextAction) {
    return null;
  }

  const Icon = nextAction.icon;

  const urgencyConfig = {
    "this-week": {
      badge: "This Week",
      badgeClass: "bg-primary text-primary-foreground",
      title: "Ready to Plant"
    },
    "soon": {
      badge: "Ready Soon",
      badgeClass: "bg-accent text-accent-foreground",
      title: "Harvest Window"
    },
    "next-week": {
      badge: "Next Week",
      badgeClass: "bg-secondary text-secondary-foreground",
      title: "Coming Up"
    },
    "none": {
      badge: "Today",
      badgeClass: "bg-muted text-muted-foreground",
      title: "Garden Ready"
    }
  };

  const config = urgencyConfig[nextAction.urgency];

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border overflow-hidden">
      <CardContent className="p-6 md:p-8">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <Badge className={config.badgeClass}>
                {config.badge}
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {config.title}
              </h2>
            </div>
            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full bg-${nextAction.color}/10 flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-6 h-6 md:w-8 md:h-8 text-${nextAction.color}`} />
            </div>
          </div>

          {/* Main message */}
          <div className="py-4">
            <p className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {nextAction.message}
            </p>
            {nextAction.count > 1 && (
              <p className="text-muted-foreground">
                and {nextAction.count - 1} more
              </p>
            )}
          </div>

          {/* CTA */}
          <Link to={nextAction.link}>
            <Button 
              size="lg" 
              className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold h-14 px-8"
            >
              {nextAction.action}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}