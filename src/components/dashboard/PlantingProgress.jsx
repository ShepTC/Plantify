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

  if (totalPlants === 0) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="w-5 h-5 text-secondary" />
            Garden Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sprout className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Start Your Garden Journey</h3>
            <p className="text-secondary">Add your first plants to track your progress!</p>
          </div>
        </CardContent>
      </Card>);

  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border">
      <CardHeader className="flex flex-col space-y-1.5 p-6">
        <CardTitle className="flex items-center justify-between text-foreground">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-secondary" />
            Garden Progress
          </div>
          <Badge variant="outline" className="bg-muted">
            {totalPlants} plants total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Planting Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">Planted</span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {plantedCount} of {totalPlants} ({Math.round(plantedPercentage)}%)
            </span>
          </div>
          <Progress
            value={plantedPercentage} className="relative w-full overflow-hidden rounded-full bg-slate-400/30 h-3" />


        </div>

        {/* Harvest Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-accent" />
              <span className="font-medium text-foreground">Harvested</span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {harvestedCount} of {totalPlants} ({Math.round(harvestedPercentage)}%)
            </span>
          </div>
          <Progress
            value={harvestedPercentage} className="relative w-full overflow-hidden rounded-full bg-slate-400/30 h-3" />


        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="w-8 h-8 bg-muted rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-sm font-bold text-secondary">
                {userPlants.filter((p) => p.status === 'planned').length}
              </span>
            </div>
            <p className="text-xs font-medium text-secondary">Planned</p>
          </div>
          
          <div className="text-center">
            <div className="w-8 h-8 bg-muted rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{plantedCount}</span>
            </div>
            <p className="text-xs font-medium text-primary">Planted</p>
          </div>
          
          <div className="text-center">
            <div className="w-8 h-8 bg-muted rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-sm font-bold text-muted-foreground">{harvestedCount}</span>
            </div>
            <p className="text-xs font-medium text-muted-foreground">Harvested</p>
          </div>
        </div>
      </CardContent>
    </Card>);

}