import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sprout,
  Leaf,
  Sun,
  BookOpen } from
"lucide-react";

export default function PlantingProgress({ userPlants }) {
  const plannedCount = userPlants.filter((p) => p.status === 'planned').length;
  const plantedCount = userPlants.filter((p) => p.status === 'planted').length;
  const harvestedCount = userPlants.filter((p) => p.status === 'harvested').length;

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
      <CardContent className="p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Garden Status</h3>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sprout className="w-4 h-4 text-secondary" />
              <p className="text-xs text-muted-foreground">Planned</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{plannedCount}</p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">Planted</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{plantedCount}</p>
          </div>
        </div>

        {/* Plant Library Link Card */}
        <Link to={createPageUrl("PlantLibrary")} className="block">
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-4 border border-primary/20 hover:border-primary/40 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 group-hover:bg-primary/30 transition-colors rounded-lg p-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Explore Plants</p>
                  <p className="text-xs text-muted-foreground">Browse 100+ varieties</p>
                </div>
              </div>
              <span className="text-primary group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}