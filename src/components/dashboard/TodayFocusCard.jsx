import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function TodayFocusCard({ userPlants, currentWeek, userZone }) {
  // Get plants that should be planted this week
  const plantsForThisWeek = userPlants.filter(p => p.status === 'planned' && p.planned_planting_week === currentWeek);
  
  // Get currently growing plants
  const growingPlants = userPlants.filter(p => p.status === 'planted');

  if (userPlants.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-muted/40 to-muted/20 border-border backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">No plants added yet. Start exploring the plant library!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-border backdrop-blur-sm">
      <CardContent className="p-6 space-y-4">
        {/* Today's Focus Header */}
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">This Week's Focus</h2>
          <span className="text-sm text-muted-foreground ml-auto">Week {currentWeek}</span>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {plantsForThisWeek.length > 0 ? (
            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
              <div className="flex items-start gap-3">
                <div className="bg-primary/20 rounded-full p-2 mt-0.5">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {plantsForThisWeek.length} plant{plantsForThisWeek.length !== 1 ? 's' : ''} ready to plant
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {plantsForThisWeek.map(p => p.plant_name).join(", ")}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <p className="text-sm text-muted-foreground">
                No plants scheduled for planting this week.
              </p>
            </div>
          )}

          {growingPlants.length > 0 && (
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
              <div className="flex items-start gap-3">
                <div className="bg-accent/20 rounded-full p-2 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {growingPlants.length} plant{growingPlants.length !== 1 ? 's' : ''} growing
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Keep monitoring your garden!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}