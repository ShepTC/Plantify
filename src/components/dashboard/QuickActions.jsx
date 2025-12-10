
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import {
  Plus,
  Calendar,
  Settings,
  Leaf, // Adding for My Garden - matches the requested icon in mockup
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Define the actions here, now usable directly or via props
export const quickActionsData = [
  {
    id: "add-plants",
    title: "Add Plants",
    description: "Browse and add new plants to your garden",
    icon: Plus,
    url: createPageUrl("PlantLibrary"),
    color: "bg-primary hover:bg-primary/90",
    iconColor: "text-primary-foreground"
  },
  {
    id: "view-calendar",
    title: "View Calendar",
    description: "See your full planting schedule",
    icon: Calendar,
    url: createPageUrl("Calendar"),
    color: "bg-secondary hover:bg-secondary/90",
    iconColor: "text-primary-foreground"
  },
  {
    id: "my-garden",
    title: "My Garden",
    description: "Manage your current plants",
    icon: Leaf, // Changed from BookOpen to Leaf to match common garden icons
    url: createPageUrl("MyGarden"),
    color: "bg-accent hover:bg-accent/90",
    iconColor: "text-primary-foreground"
  },
  {
    id: "settings",
    title: "Settings",
    description: "Update your growing zone and preferences",
    icon: Settings,
    url: createPageUrl("Profile"),
    color: "bg-primary hover:bg-primary/90",
    iconColor: "text-primary-foreground"
  }
];

// Reusable component for a single quick action button
export function QuickActionButton({ action }) {
  return (
    <Link to={action.url} className="block w-full group">
      <Button
        variant="ghost"
        className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground w-full justify-start h-auto p-3 md:p-4 bg-gradient-to-r from-muted/50 to-muted-foreground/10 rounded-lg border border-border transition-all duration-200"
      >
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${action.color} flex items-center justify-center mr-2 md:mr-3 shadow-sm transition-transform duration-300 ease-in-out group-hover:-translate-y-1`}>
          <action.icon className={`w-4 h-4 md:w-5 md:h-5 ${action.iconColor}`} />
        </div>
        <div className="text-left min-w-0 flex-1">
          <p className="font-medium text-foreground text-sm md:text-base">{action.title}</p>
          <p className="text-xs text-muted-foreground">{action.description}</p>
        </div>
      </Button>
    </Link>
  );
}

// Default export is no longer a Card, but a simple component wrapper if needed, or can be removed if only using actions directly
export default function QuickActions({ items = quickActionsData }) {
  return (
    <div className="space-y-2 md:space-y-3">
      {items.map((action) => (
        <QuickActionButton key={action.id} action={action} />
      ))}
    </div>
  );
}
