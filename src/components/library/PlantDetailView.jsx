import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PlantDetailBody from "./PlantDetailBody";

export default function PlantDetailView({ plant, userZone, open, onOpenChange, onAddPlant, isAdded, userPlantData }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-md w-[95vw] max-h-[85vh] flex flex-col bg-card border-border data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-2xl overflow-hidden">
        <PlantDetailBody
          plant={plant}
          userZone={userZone}
          onOpenChange={onOpenChange}
          onAddPlant={onAddPlant}
          isAdded={isAdded}
          userPlantData={userPlantData}
          animated
        />
      </DialogContent>
    </Dialog>
  );
}