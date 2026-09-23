import React from 'react';
import { Apple, Flower2, Leaf, Sprout, Wheat } from 'lucide-react';
const icons = { fruits: Apple, flowers: Flower2, herbs: Leaf, vegetables: Sprout, grains: Wheat };
export default function CropArtwork({ plant, className = '' }) {
  const Icon = icons[plant.category] || Sprout;
  return <div className={`relative overflow-hidden bg-gradient-to-br from-primary/15 via-card to-secondary/15 flex items-center justify-center ${className}`}>
    {plant.image_url ? <img src={plant.image_url} alt={plant.name} className="w-full h-full object-cover" /> : <><div className="absolute h-28 w-28 rounded-full border border-primary/15" /><div className="absolute h-40 w-40 rounded-full border border-primary/10" /><Icon className="w-16 h-16 text-primary stroke-1" /></>}
  </div>;
}