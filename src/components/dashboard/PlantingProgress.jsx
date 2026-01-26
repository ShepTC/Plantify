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
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-semibold text-foreground">Garden Status</h3>
          <Link to={createPageUrl("PlantLibrary")}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <BookOpen className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
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
      </CardContent>
    </Card>
  );
}