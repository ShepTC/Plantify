import React from 'react';
import { Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CropArtwork from '@/components/home/CropArtwork';
export default function LibraryCropCard({ plant, added, adding, onAdd, onDetails }) {
  return <article className="rounded-2xl overflow-hidden border border-border bg-card flex flex-col">
    <button onClick={() => onDetails(plant)} className="text-left w-full"><CropArtwork plant={plant} className="h-28 sm:h-36" /><div className="p-3 pb-1"><p className="text-[10px] uppercase tracking-widest text-primary mb-1">{plant.category}</p><h2 className="font-semibold text-sm sm:text-base">{plant.name}</h2><p className="text-xs text-muted-foreground mt-1 capitalize">{plant.sun_requirements?.replaceAll('_',' ') || 'See growing guide'}</p></div></button>
    <div className="p-3 pt-2 mt-auto"><Button size="sm" disabled={added || adding} className="w-full rounded-xl" variant={added ? 'outline' : 'default'} onClick={() => onAdd(plant)} aria-label={added ? `${plant.name} added` : `Add ${plant.name}`}>
      {added ? <Check /> : <Plus />}{added ? 'Added' : adding ? 'Adding…' : 'Add'}
    </Button></div>
  </article>;
}