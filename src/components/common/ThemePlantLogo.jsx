import React, { useState, useEffect } from 'react';

export default function ThemePlantLogo({ className = "w-7 h-7" }) {
  const [logoUrl, setLogoUrl] = useState("https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/298c219c1_GardenSubLogo.png");

  useEffect(() => {
    const updateLogo = () => {
      const currentPalette = document.documentElement.getAttribute('data-palette') || 'default';

      switch (currentPalette) {
        case 'pastel':
          setLogoUrl("https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/65a6ff1fd_PastelSubLogo.png");
          break;
        case 'ocean':
          setLogoUrl("https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/0f36e5ac0_OceanSubLogo.png");
          break;
        case 'sunset':
          setLogoUrl("https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/2998abfd9_SunsetSubLogo.png");
          break;
        default:
          setLogoUrl("https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/298c219c1_GardenSubLogo.png");
      }
    };

    updateLogo();

    // Listen for theme changes
    const handleThemeChange = () => updateLogo();
    window.addEventListener('theme-updated', handleThemeChange);

    return () => {
      window.removeEventListener('theme-updated', handleThemeChange);
    };
  }, []);

  return (
    <img 
      src={logoUrl} 
      alt="Plantify" 
      className={className}
    />
  );
}