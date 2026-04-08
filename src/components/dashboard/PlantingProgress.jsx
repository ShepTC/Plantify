import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sprout, BookOpen, Clock, ChevronRight } from "lucide-react";

export default function PlantingProgress({ userPlants }) {
  const needsPlanting = userPlants.filter((p) => p.status === 'planned').slice(0, 3);
  const comingUp = userPlants.filter((p) => p.status === 'planted').slice(0, 3);

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
      <CardContent className="px-5 py-2 space-y-3">

        {/* Needs Planting */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sprout className="w-4 h-4 text-secondary" />
              <h3 className="font-semibold text-foreground text-sm">Needs Planting</h3>
            </div>
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              {userPlants.filter(p => p.status === 'planned').length}
            </span>
          </div>
          {needsPlanting.length > 0 ? (
            <div className="space-y-1.5">
              {needsPlanting.map((p) => (
                <div key={p.id} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
                  <span className="text-sm text-foreground truncate">{p.plant_name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">Nothing planned yet</p>
          )}
        </div>

        {/* Coming Up */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">Coming Up</h3>
            </div>
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              {userPlants.filter(p => p.status === 'planted').length}
            </span>
          </div>
          {comingUp.length > 0 ? (
            <div className="space-y-1.5">
              {comingUp.map((p) => (
                <div key={p.id} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-sm text-foreground truncate">{p.plant_name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">Nothing planted yet</p>
          )}
        </div>

        {/* Link */}
        <Link to={createPageUrl("MyGarden")} className="block">
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg px-4 py-2.5 border border-primary/20 hover:border-primary/40 transition-colors cursor-pointer group flex items-center justify-between">
            <p className="font-medium text-foreground text-sm">View My Garden</p>
            <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

      </CardContent>
    </Card>
  );
}