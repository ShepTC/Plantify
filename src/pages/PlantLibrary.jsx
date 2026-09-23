import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import usePlantCollection from '@/hooks/usePlantCollection';
import { findZone } from '@/utils/zoneUtils';
import LibraryCropCard from '@/components/library/LibraryCropCard';
import PlantDetailView from '@/components/library/PlantDetailView';
const categories = ['all', 'vegetables', 'herbs', 'fruits', 'flowers', 'grains'];
export default function PlantLibrary() {
  const { user, plants, garden, isLoading, error, refetch, addPlant, adding, actionError } = usePlantCollection();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [zoneOnly, setZoneOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  if (isLoading) return <p className="p-8 text-muted-foreground">Opening the plant library…</p>;
  if (error) return <div className="p-8"><p>Couldn’t load the library.</p><Button onClick={() => refetch()}>Try again</Button></div>;
  const filtered = plants.filter(p => (category === 'all' || p.category === category) && `${p.name} ${p.common_name || ''} ${p.botanical_name || ''}`.toLowerCase().includes(search.toLowerCase()) && (!zoneOnly || ['direct_sow_zones','transplant_outdoor_zones','start_seeds_indoor'].some(field => findZone(p[field],user?.growing_zone))));
  const ids = new Set(garden.map(p => p.plant_id)), pages = Math.max(1,Math.ceil(filtered.length/24));
  return <div className="max-w-6xl mx-auto px-4 py-5 md:p-8 space-y-5">
    <header><p className="text-xs font-semibold uppercase tracking-widest text-primary">Find your next favorite</p><h1 className="text-3xl font-semibold tracking-tight mt-1">What can you grow?</h1><p className="text-sm text-muted-foreground mt-2">Explore, learn, and add to your garden. Always free.</p></header>
    <div className="space-y-3"><div className="relative"><Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" /><Input aria-label="Search plants" placeholder="Search plants…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-10 h-11 rounded-xl bg-card" /></div><div className="flex gap-2 overflow-x-auto pb-1">{categories.map(c => <Button key={c} variant={category === c ? 'default' : 'outline'} aria-pressed={category === c} size="sm" className="rounded-full capitalize" onClick={() => { setCategory(c); setPage(1); }}>{c}</Button>)}</div><div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{filtered.length} crops</span>{user?.growing_zone && <Button size="sm" variant={zoneOnly ? 'default' : 'ghost'} aria-pressed={zoneOnly} className="rounded-full" onClick={() => { setZoneOnly(!zoneOnly); setPage(1); }}>For Zone {user.growing_zone}</Button>}</div></div>
    {actionError && <p role="alert" className="text-sm text-destructive">{actionError}</p>}
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">{filtered.slice((page-1)*24,page*24).map(p => <LibraryCropCard key={p.id} plant={p} added={ids.has(p.id)} adding={adding === p.id} onAdd={addPlant} onDetails={setSelected} />)}</div>
    {!filtered.length && <div className="text-center p-8"><p className="text-muted-foreground">No matching crops. Try another search.</p><Button variant="ghost" onClick={() => { setSearch(''); setCategory('all'); setZoneOnly(false); setPage(1); }}>Reset filters</Button></div>}
    {pages > 1 && <div className="flex justify-center items-center gap-4"><Button variant="outline" disabled={page === 1} onClick={() => setPage(page-1)}>Previous</Button><span className="text-xs">{page} / {pages}</span><Button variant="outline" disabled={page >= pages} onClick={() => setPage(page+1)}>Next</Button></div>}
    <PlantDetailView actionError={actionError} plant={selected} open={!!selected} onOpenChange={open => !open && setSelected(null)} userZone={user?.growing_zone} onAddPlant={addPlant} isAdded={ids.has(selected?.id)} userPlantData={garden.find(p => p.plant_id === selected?.id)} canAdd={!adding} isPremium={user?.is_premium} />
  </div>;
}