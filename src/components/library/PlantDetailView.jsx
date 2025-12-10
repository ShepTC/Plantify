
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X, Sprout, Sun, Droplets, Ruler, Plus, CheckCircle, Flower, Leaf, Clock, Thermometer
} from 'lucide-react';
import { motion } from 'framer-motion';

const categoryIcons = {
  vegetables: <Leaf className="w-5 h-5" />,
  herbs: <Sprout className="w-5 h-5" />,
  flowers: <Flower className="w-5 h-5" />,
  fruits: <Sprout className="w-5 h-5" />,
  grains: <Sprout className="w-5 h-5" />
};

const categoryColors = {
  vegetables: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700",
  fruits: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700",
  flowers: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-700",
  grains: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700",
  herbs: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/50 dark:text-teal-300 dark:border-teal-700"
};

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-lg">
    <div className="w-8 h-8 bg-background rounded-md flex items-center justify-center text-muted-foreground flex-shrink-0 border">
      {icon}
    </div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground capitalize">{value}</p>
    </div>
  </div>
);

export default function PlantDetailView({ plant, userZone, open, onOpenChange, onAddPlant, isAdded }) {
  if (!plant) return null;

  const getPlantingInfo = () => {
    if (!userZone || !plant.planting_zones) return null;
    return plant.planting_zones.find(
      (z) => z.zone === userZone || z.zone === userZone.substring(0, userZone.length - 1)
    );
  };
  const plantingInfo = getPlantingInfo();

  const handleAddClick = (e) => {
    e.stopPropagation();
    onAddPlant(plant);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-lg w-[95vw] h-[90vh] flex flex-col bg-card border-border data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-2xl">
        
        {/* Header with Image */}
        <div className="relative h-1/3 md:h-2/5 w-full flex-shrink-0">
          <img 
            src={plant.image_url} 
            alt={plant.name}
            className="w-full h-full object-cover rounded-t-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-t-2xl" />
          
          <div className="absolute bottom-0 left-0 p-4 md:p-6 text-white">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-2xl md:text-4xl font-bold leading-tight"
            >
              {plant.name}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-sm md:text-base italic text-white/80"
            >
              {plant.botanical_name}
            </motion.p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-6">

            <div className="flex flex-wrap gap-2">
                <Badge className={`${categoryColors[plant.category]} text-sm py-1`}>{plant.category}</Badge>
                <Badge variant="outline" className="text-sm py-1 capitalize">{plant.plant_type}</Badge>
            </div>
            
            {/* Plant Details Grid */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3 text-foreground">Plant Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <DetailItem icon={<Sun className="w-4 h-4"/>} label="Sunlight" value={plant.sun_requirements?.replace(/_/g, ' ')}/>
                <DetailItem icon={<Droplets className="w-4 h-4"/>} label="Water Needs" value={plant.water_needs}/>
                <DetailItem icon={<Ruler className="w-4 h-4"/>} label="Spacing" value={plant.spacing}/>
                <DetailItem icon={<Ruler className="w-4 h-4 -rotate-90"/>} label="Planting Depth" value={plant.planting_depth}/>
                <DetailItem icon={<Clock className="w-4 h-4"/>} label="Maturity" value={`${plant.days_to_maturity} days`}/>
              </div>
            </div>

            {/* Planting Info for Zone */}
            {plantingInfo && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><Thermometer className="w-5 h-5 text-primary"/>Zone {userZone} Planting</h3>
                <div className="bg-muted/50 rounded-lg p-4 border border-border text-sm space-y-2">
                  <p><span className="font-semibold text-foreground">Spring Window:</span> Weeks {plantingInfo.spring_start_week}-{plantingInfo.spring_end_week}</p>
                  {plantingInfo.fall_start_week && (
                    <p><span className="font-semibold text-foreground">Fall Window:</span> Weeks {plantingInfo.fall_start_week}-{plantingInfo.fall_end_week}</p>
                  )}
                </div>
              </div>
            )}

            {/* Growing Tips */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Growing Tips</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{plant.growing_tips || "No specific tips available."}</p>
            </div>
            
            {/* Companion Plants */}
            {plant.companion_plants && plant.companion_plants.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Companion Plants</h3>
                <div className="flex flex-wrap gap-2">
                  {plant.companion_plants.map((p, i) => (
                    <Badge key={i} variant="secondary">{p}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-border flex-shrink-0 bg-card rounded-b-2xl">
          <Button
            size="lg"
            className="w-full text-base"
            onClick={handleAddClick}
            disabled={isAdded}
            variant={isAdded ? "secondary" : "default"}
          >
            {isAdded ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Added to Your Garden
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Add to My Garden
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
