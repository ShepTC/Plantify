import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Bell, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import usePlantCollection from '@/hooks/usePlantCollection';
import { plantingSchedule } from '@/utils/plantingSchedule';
import TodayRecommendations from '@/components/home/TodayRecommendations';
import ComingUp from '@/components/home/ComingUp';
import PlantDetailView from '@/components/library/PlantDetailView';
import ProFeatureDialog from '@/components/freemium/ProFeatureDialog';

export default function Dashboard() {
  const { user, plants, garden, isLoading, error, refetch, addPlant, adding, actionError } = usePlantCollection();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [pro, setPro] = useState('');
  if (isLoading) return <p className="p-8 text-muted-foreground">Finding your planting windows…</p>;
  if (error) return <div className="p-8 space-y-3"><p>We couldn’t load your planting guide.</p><Button onClick={() => refetch()}>Try again</Button></div>;
  const { current, upcoming } = plantingSchedule(plants, user?.growing_zone);
  const ids = new Set(garden.map(p => p.plant_id));
  return <div className="max-w-6xl mx-auto px-4 py-5 md:p-8 space-y-6">
    <header className="flex flex-wrap justify-between items-center gap-2"><div><p className="text-sm font-medium">Hello, {user?.full_name?.split(' ')[0] || 'grower'}.</p><p className="text-xs text-muted-foreground mt-1">{format(new Date(), 'EEEE, MMMM d')}</p></div><Link to="/Profile" className="text-xs rounded-full bg-muted/40 border border-border px-3 py-2 flex items-center gap-1.5"><MapPin className="w-3 h-3 text-primary" />{user?.growing_zone ? `Zone ${user.growing_zone}` : 'Set location'}</Link></header>
    {actionError && <p role="alert" className="text-sm text-destructive">{actionError}</p>}
    <div className="grid lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] gap-6 items-start">
      <TodayRecommendations plants={current} zone={user?.growing_zone} gardenIds={ids} adding={adding} onAdd={addPlant} onDetails={setSelected} />
      <div className="space-y-4 lg:pt-16">
        {user?.growing_zone && <ComingUp items={upcoming} isPremium={user.is_premium} onUpgrade={setPro} onDetails={setSelected} />}
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-border p-4"><div className="flex gap-3"><Bell className="w-5 h-5 text-primary shrink-0 mt-0.5" /><div><h2 className="text-sm font-semibold">A little help remembering.</h2><p className="text-xs text-muted-foreground mt-1">Plan your plants here. Keep track of the next step in your garden.</p></div></div><Button variant="ghost" className="text-primary mt-2 w-full justify-between" onClick={() => user.is_premium ? navigate('/MyGarden') : setPro('Planting reminders')}>{user.is_premium ? 'Set a garden reminder' : 'Discover reminders with Pro'}<ArrowRight /></Button></div>
        <Link to="/PlantLibrary" className="flex justify-between text-sm font-medium p-4 rounded-2xl border border-border hover:bg-muted/30">Browse every crop<ArrowRight className="w-4 h-4 text-primary" /></Link>
      </div>
    </div>
    <PlantDetailView actionError={actionError} plant={selected} open={!!selected} onOpenChange={open => !open && setSelected(null)} userZone={user?.growing_zone} onAddPlant={addPlant} isAdded={ids.has(selected?.id)} userPlantData={garden.find(p => p.plant_id === selected?.id)} canAdd={!adding} isPremium={user?.is_premium} />
    <ProFeatureDialog feature={pro} onClose={() => setPro('')} />
  </div>;
}