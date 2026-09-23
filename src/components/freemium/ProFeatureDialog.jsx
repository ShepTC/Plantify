import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, CalendarDays, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ProFeatureDialog({ feature, onClose }) {
  return <Dialog open={!!feature} onOpenChange={open => !open && onClose()}>
    <DialogContent className="max-w-sm w-[calc(100%-2rem)] rounded-3xl sm:rounded-3xl bg-card p-6">
      <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Sparkles className="w-5 h-5" /></div>
      <DialogHeader className="text-left"><DialogTitle>{feature} with Pro</DialogTitle><DialogDescription>Grow for free. Get a helping hand when you need one.</DialogDescription></DialogHeader>
      <div className="space-y-3 text-sm text-muted-foreground"><p className="flex gap-2"><Bell className="w-4 h-4 shrink-0 text-primary" /> Personal in-app planting reminders</p><p className="flex gap-2"><CalendarDays className="w-4 h-4 shrink-0 text-primary" /> Full-season lookahead and calendar sync</p><p className="flex gap-2"><Sparkles className="w-4 h-4 shrink-0 text-primary" /> AI garden help and seasonal goals</p></div>
      <Button asChild className="rounded-xl"><Link to="/Upgrade">Explore Plantify Pro</Link></Button>
      <Button variant="ghost" onClick={onClose}>Not now</Button>
      <p className="text-xs text-center text-muted-foreground">Plant recommendations and garden additions stay free.</p>
    </DialogContent>
  </Dialog>;
}