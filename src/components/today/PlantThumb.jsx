import React, { useState } from "react";
import { Sprout } from "lucide-react";

// Plant photo with a soft themed fallback when missing or broken.
export default function PlantThumb({ plant, className = "", iconClass = "w-6 h-6" }) {
  const [broken, setBroken] = useState(false);
  if (plant?.image_url && !broken) {
    return (
      <img
        src={plant.image_url}
        alt={plant.name}
        loading="lazy"
        onError={() => setBroken(true)}
        className={`object-cover ${className}`}
      />
    );
  }
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 ${className}`}>
      <Sprout className={`${iconClass} text-primary`} />
    </div>
  );
}