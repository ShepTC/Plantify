import React, { useState, useEffect } from "react";

export default function PlantLogo({ className = "w-8 h-8" }) {
  const [desktopLogoUrl, setDesktopLogoUrl] = useState("");
  const [mobileLogoUrl, setMobileLogoUrl] = useState("");

  useEffect(() => {
    const updateLogos = () => {
      const palette = document.documentElement.getAttribute('data-palette') || 'default';
      
      const desktopLogoMap = {
        'pastel': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/ab0451c2d_PastelSubLogo.png',
        'ocean': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/0cbb5e417_OceanSubLogo.png',
        'sunset': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/1e338f15e_SunsetSubLogo.png',
        'default': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/ce02abc3c_GardenSubLogo.png'
      };

      const mobileLogoMap = {
        'pastel': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/06abebac7_LogoPastel.png',
        'ocean': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/adf8bab24_LogoOcean.png',
        'sunset': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/2d4b219c9_LogoSunset.png',
        'default': 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/3d4f42c2e_PlantifyLogoFinal.png'
      };

      setDesktopLogoUrl(desktopLogoMap[palette] || desktopLogoMap['default']);
      setMobileLogoUrl(mobileLogoMap[palette] || mobileLogoMap['default']);
    };

    updateLogos();

    // Listen for theme changes
    const observer = new MutationObserver(updateLogos);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-palette']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <img src={desktopLogoUrl} alt="Plant" className={`hidden md:block ${className}`} />
      <img src={mobileLogoUrl} alt="Plantify" className={`md:hidden ${className}`} />
    </>
  );
}