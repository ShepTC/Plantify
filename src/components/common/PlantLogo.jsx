import React, { useState, useEffect } from "react";

export default function PlantLogo({ className = "w-8 h-8" }) {
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    const palette = document.documentElement.getAttribute('data-palette') || 'default';
    
    const logoMap = {
      'pastel': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/ab0451c2d_PastelSubLogo.png',
      'ocean': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/0cbb5e417_OceanSubLogo.png',
      'sunset': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/1e338f15e_SunsetSubLogo.png',
      'default': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/ce02abc3c_GardenSubLogo.png'
    };

    setLogoUrl(logoMap[palette] || logoMap['default']);

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const newPalette = document.documentElement.getAttribute('data-palette') || 'default';
      setLogoUrl(logoMap[newPalette] || logoMap['default']);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-palette']
    });

    return () => observer.disconnect();
  }, []);

  return <img src={logoUrl} alt="Plant" className={className} />;
}