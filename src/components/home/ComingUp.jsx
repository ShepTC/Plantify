import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ArrowRight, Lock } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { methodLabels } from '@/utils/plantingSchedule';

export default function ComingUp({ items, isPremium, onUpgrade, onDetails }) {
  const [expanded, setExpanded] = useState(false);
  const soon = items.filter(p => p.start <= addDays(new Date(),14));
  const visible = expanded && isPremium ? items : (soon.length ? soon : items).slice(0, isPremium ? 3 : 1);
  return <section className="rounded-3xl border border-border bg-card/70 backdrop-blur-sm p-5">
    <div className="flex items-center justify-between gap-3 mb-3"><h2 className="font-semibold flex gap-2 items-center"><CalendarDays className="w-4 h-4 text-primary" />Coming up</h2><Link to="/Calendar" className="text-xs font-medium text-primary hover:underline">My calendar <ArrowRight className="inline w-3 h-3" /></Link></div>
    <p className="text-xs text-muted-foreground mb-3">{expanded ? 'Your next 12 months of planting windows' : soon.length ? 'In the next two weeks' : 'No new windows in the next two weeks. Next on the horizon:'}</p>
    <div className={expanded ? 'max-h-80 overflow-y-auto divide-y divide-border' : 'divide-y divide-border'}>{visible.map(p => <button key={`${p.id}-${p.method}-${p.start.getTime()}`} onClick={() => onDetails(p)} className="flex w-full items-center justify-between gap-3 py-3 text-left hover:text-primary"><div className="min-w-0"><p className="font-medium text-sm">{p.name}</p><p className="text-xs text-muted-foreground">{methodLabels[p.method]}</p></div><span className="text-xs font-medium whitespace-nowrap">{format(p.start,'MMM d, yyyy')}</span></button>)}</div>
    {!items.length && <p className="text-sm text-muted-foreground py-2">No upcoming dates in our library for this zone yet.</p>}
    <Button variant="ghost" className="w-full rounded-xl mt-2 text-primary bg-primary/5" onClick={() => isPremium ? setExpanded(!expanded) : onUpgrade('Full-season planning')}>{!isPremium && <Lock className="w-3 h-3" />}{expanded ? 'Show less' : 'See your full season'}<ArrowRight className="w-4 h-4" /></Button>
  </section>;
}