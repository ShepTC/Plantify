import React, { useState, useEffect } from 'react';

export default function LoadingSpinner({ message = "Loading...", size = "large" }) {
  const [logoUrl, setLogoUrl] = useState("https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/3d4f42c2e_PlantifyLogoFinal.png");

  useEffect(() => {
    // Read from data attribute to get the most current palette
    const currentPalette = document.documentElement.getAttribute('data-palette') || 'default';

    switch (currentPalette) {
      case 'pastel':
        setLogoUrl("https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/06abebac7_LogoPastel.png");
        break;
      case 'ocean':
        // Swapped with sunset logo
        setLogoUrl("https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/2d4b219c9_LogoSunset.png"); 
        break;
      case 'sunset':
        // Swapped with ocean logo
        setLogoUrl("https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/adf8bab24_LogoOcean.png"); 
        break;
      default:
        setLogoUrl("https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/3d4f42c2e_PlantifyLogoFinal.png");
    }
  }, []);

  const sizeClasses = {
    small: "w-10 h-10",
    medium: "w-16 h-16",
    large: "w-24 h-24",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(-15%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        .animate-bounce-logo {
          animation: bounce 1.2s infinite;
        }
      `}</style>
      <div className={`flex items-center justify-center ${sizeClasses[size]}`}>
        <img 
          src={logoUrl} 
          alt="Plantify Logo" 
          className="w-full h-full object-contain animate-bounce-logo"
        />
      </div>
      {message && <p className="text-muted-foreground font-medium">{message}</p>}
    </div>
  );
}