import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Flag, Lock } from 'lucide-react';
export default function SeasonGoalPanel({ user, onUpdate, onUpgrade, onRemind }) {
  const [goal, setGoal] = useState(user.garden_goals || '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const save = async e => {
    e.preventDefault(); if (!user.is_premium || busy) return;
    setBusy(true); setMessage('');
    try { const updated = await base44.auth.updateMe({ garden_goals: goal }); onUpdate(updated); setMessage('Goal saved.'); }
    catch (e) { setMessage(e.message || 'Could not save your goal.'); }
    finally { setBusy(false); }
  };
  return <section className="rounded-2xl border border-border bg-card p-4 space-y-3"><h2 className="text-sm font-semibold flex items-center gap-2"><Flag className="w-4 h-4 text-primary" />Your seasonal goal<span className="ml-auto text-[10px] font-bold text-primary">PRO</span></h2>{user.is_premium ? <form onSubmit={save} className="space-y-3"><Textarea aria-label="Seasonal garden goal" placeholder="This season, I want to grow…" className="text-sm rounded-xl" value={goal} onChange={e => setGoal(e.target.value)} /><div className="flex flex-wrap gap-2"><Button size="sm" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save goal'}</Button><Button size="sm" type="button" variant="outline" onClick={() => onRemind({ plant_name: 'your seasonal garden goal', reminder_title: 'Review garden goals' })}>Remind me to review</Button></div>{message && <p role="status" className="text-xs text-muted-foreground">{message}</p>}</form> : <><p className="text-xs text-muted-foreground">Turn a small ambition into a season of progress.</p><Button variant="ghost" size="sm" className="text-primary" onClick={() => onUpgrade('Seasonal goals')}><Lock className="w-3 h-3" />Set a goal with Pro</Button></>}</section>;
}