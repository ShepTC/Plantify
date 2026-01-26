import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Sprout } from 'lucide-react';

const categoryIcons = {
  vegetables: <Sprout className="w-3 h-3" />,
  herbs: <Sprout className="w-3 h-3" />,
  flowers: <Sprout className="w-3 h-3" />,
  fruits: <Sprout className="w-3 h-3" />,
  grains: <Sprout className="w-3 h-3" />
};

export default function MiniPlantCard({ plant, onAddPlant, isAdded, onClick }) {
  if (!plant) return null;

  return (
    <Card 
      onClick={onClick}
      className="cursor-pointer bg-card/60 hover:bg-card border border-border/60 hover:border-primary/50 transition-all duration-200 p-2.5 hover:shadow-md"
    >
      <div className="space-y-2">
        {plant.image_url && (
          <div className="w-full h-20 rounded-lg overflow-hidden bg-muted">
            <img 
              src={plant.image_url} 
              alt={plant.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div>
          <h4 className="text-xs font-semibold text-foreground line-clamp-2">
            {plant.name}
          </h4>
          <p className="text-[10px] text-muted-foreground italic line-clamp-1 mt-0.5">
            {plant.botanical_name}
          </p>
        </div>

        <div className="flex items-center justify-between gap-1.5 pt-1">
          <div className="flex items-center gap-1">
            {categoryIcons[plant.category]}
            <span className="text-[10px] text-muted-foreground capitalize truncate">
              {plant.category}
            </span>
          </div>
        </div>

        <div className="flex gap-1.5 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-7 text-[10px]"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            View
          </Button>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddPlant?.(plant);
            }}
            disabled={isAdded}
            className="flex-1 h-7 text-[10px]"
          >
            {isAdded ? '✓' : <Plus className="w-3 h-3" />}
          </Button>
        </div>
      </div>
    </Card>
  );
}