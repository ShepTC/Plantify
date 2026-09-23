import React, { useState } from 'react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
export default function PlantReminderDialog({ plant, onClose, onSaved, isPremium }) {
  const [title, setTitle] = useState(plant.reminder_title || `Check on ${plant.plant_name}`);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const save = async e => {
    e.preventDefault(); if (!isPremium || saving) return;
    setSaving(true); setError('');
    try {
      await base44.entities.Reminder.create({ title: title.trim(), description: `Garden reminder for ${plant.plant_name}`, due_date: date, type: 'general', is_completed: false });
      onSaved(); onClose();
    } catch (e) { setError(e.message || 'Could not save your reminder.'); }
    finally { setSaving(false); }
  };
  return <Dialog open onOpenChange={open => !open && !saving && onClose()}><DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-3xl sm:rounded-3xl bg-card"><DialogHeader><DialogTitle>Set a reminder</DialogTitle><DialogDescription>For {plant.plant_name}. Appears in your Garden and Calendar; no email or push notification.</DialogDescription></DialogHeader><form onSubmit={save} className="space-y-4"><label className="block text-sm space-y-2"><span>What should you do?</span><Input aria-label="Reminder title" required maxLength={150} value={title} onChange={e => setTitle(e.target.value)} /></label><label className="block text-sm space-y-2"><span>When?</span><Input aria-label="Reminder date" required type="date" min={format(new Date(),'yyyy-MM-dd')} value={date} onChange={e => setDate(e.target.value)} /></label>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button type="submit" disabled={saving || !title.trim()} className="w-full rounded-xl">{saving ? 'Saving…' : 'Save reminder'}</Button></form></DialogContent></Dialog>;
}