import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TodayCropCard from '@/components/home/TodayCropCard';

export default function TodayRecommendations({ plants, zone, gardenIds, adding, onAdd, onDetails }) {
  const props = p => ({ plant: p, added: gardenIds.has(p.id), adding: adding === p.id, onAdd, onDetails });
  return <section className="space-y-4 min-w-0">
    <div className="flex items-center justify-between"><div><p className="text-xs text-primary font-semibold uppercase tracking-widest mb-1">Your growing guide</p><h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Plant this week.</h1></div><span className="rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5">{plants.length} crops</span></div>
    {plants.length ? <TodayCropCard featured {...props(plants[0])} /> : <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-6"><Sprout className="w-10 h-10 text-primary mb-4" /><h2 className="text-xl font-semibold">{zone ? 'A little pause in planting.' : 'First, find your growing zone.'}</h2><p className="mt-2 text-sm text-muted-foreground max-w-lg">{zone ? `No planting windows are open in our library for Zone ${zone} today. Check what’s coming up, or pick a crop to plan for later.` : 'Set your location so we can show what to plant and when, tailored to your local season.'}</p><Button asChild className="rounded-xl mt-5"><Link to={zone ? '/PlantLibrary' : '/Profile'}>{zone ? 'Find your next crop' : 'Set my location'}<ArrowRight /></Link></Button></div>}
    {plants.length > 1 && <div><div className="flex justify-between items-center mb-3"><h2 className="text-sm font-semibold">Also good right now</h2><span className="text-xs text-muted-foreground">Swipe to explore</span></div><div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2">{plants.slice(1).map(p => <TodayCropCard key={p.id} {...props(p)} />)}</div></div>}
    <p className="text-xs text-muted-foreground">Dates are a guide, not a guarantee. Check local frost and soil conditions before planting outdoors.</p>
  </section>;
}