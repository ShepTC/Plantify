import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sprout, Leaf, Sun, ArrowRight } from "lucide-react";

export default function PlantingProgress({ userPlants }) {
  const totalPlants = userPlants.length;
  const plantedCount = userPlants.filter((p) => p.status === 'planted').length;
  const harvestedCount = userPlants.filter((p) => p.status === 'harvested').length;

  const plantedPercentage = totalPlants > 0 ? plantedCount / totalPlants * 100 : 0;
  const harvestedPercentage = totalPlants > 0 ? harvestedCount / totalPlants * 100 : 0;

  const plannedCount = userPlants.filter((p) => p.status === 'planned').length;

  if (totalPlants === 0) {
    return (
      <Link to={createPageUrl("PlantLibrary")} className="block">
        <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="text-center py-4">
              <Sprout className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">Add plants to get started</p>
              <p className="text-xs text-muted-foreground mt-1">Browse the plant library</p>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={createPageUrl("PlantLibrary")} className="block">
      <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 transition-colors cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <CardTitle className="text-base text-foreground">Garden Progress</CardTitle>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xl font-bold text-secondary">{plannedCount}</p>
              <p className="text-xs text-muted-foreground">Planned</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-primary">{plantedCount}</p>
              <p className="text-xs text-muted-foreground">Planted</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-accent">{harvestedCount}</p>
              <p className="text-xs text-muted-foreground">Harvested</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
  }