import React from 'react';
import { startOfDay, addDays, format } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { plantWindows, methodLabels, windowLabel } from '@/utils/plantingSchedule';
export default function PlantWindowDetails({ plant, zone }) {
  if (!zone) return <p className="text-xs text-muted-foreground">Set your growing zone in Profile to see planting dates.</p>;
  const today = startOfDay(new Date());
  const windows = plantWindows(plant, zone).filter(w => w.end >= today && w.start <= addDays(today,365));
  return <section className="space-y-2"><h3 className="text-sm font-semibold flex gap-1.5 items-center"><CalendarDays className="w-4 h-4 text-primary" />Planting windows · Zone {zone}</h3><div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">{windows.length ? windows.map(w => <div key={`${w.method}-${w.start.getTime()}`} className="flex justify-between gap-3 text-xs"><span className="font-medium">{methodLabels[w.method]}</span><span className="text-muted-foreground text-right">{windowLabel(w)}{w.start.getFullYear() !== today.getFullYear() ? `, ${format(w.start,'yyyy')}` : ''}</span></div>) : <p className="text-xs text-muted-foreground">No dates available for this zone yet.</p>}</div><p className="text-[10px] text-muted-foreground">Approximate local-season guidance. Check frost and soil conditions before planting.</p></section>;
}