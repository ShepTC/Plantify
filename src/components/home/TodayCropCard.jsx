import React from 'react';
import { Check, Plus, Sun, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CropArtwork from '@/components/home/CropArtwork';
import { methodLabels, windowLabel } from '@/utils/plantingSchedule';

export default function TodayCropCard({ plant, featured = false, added, adding, onAdd, onDetails }) {
  return <article className={`overflow-hidden rounded-3xl border border-border bg-card shadow-sm ${featured ? 'sm:grid sm:grid-cols-[0.85fr_1fr]' : 'w-56 shrink-0 snap-start'}`}>
    <button onClick={() => onDetails(plant)} aria-label={`View ${plant.name}`} className="block w-full text-left"><CropArtwork plant={plant} className={featured ? 'h-36 sm:h-full sm:min-h-60' : 'h-24'} /></button>
    <div className={`flex flex-col ${featured ? 'p-5 gap-3' : 'p-4 gap-2'}`}>
      <span className="text-[10px] uppercase tracking-widest font-bold text-primary">{methodLabels[plant.method]}</span>
      <button onClick={() => onDetails(plant)} className="flex items-center justify-between gap-2 text-left"><h3 className={featured ? 'text-3xl font-semibold tracking-tight' : 'font-semibold'}>{plant.name}</h3><ArrowUpRight className="w-4 h-4 shrink-0 text-muted-foreground" /></button>
      <p className="text-sm text-muted-foreground">{windowLabel(plant)}</p>
      {featured && <p className="text-sm text-muted-foreground flex items-center gap-2"><Sun className="w-4 h-4 text-primary" />{plant.sun_requirements?.replaceAll('_',' ') || 'See growing guide'}{plant.days_to_maturity ? ` · ~${plant.days_to_maturity} days to maturity` : ''}</p>}
      <Button disabled={added || adding} onClick={() => onAdd(plant)} className="mt-auto rounded-xl w-full" variant={added ? 'outline' : 'default'}>{added ? <Check /> : <Plus />}{added ? 'In your garden' : adding ? 'Adding…' : 'Add to garden'}</Button>
    </div>
  </article>;
}