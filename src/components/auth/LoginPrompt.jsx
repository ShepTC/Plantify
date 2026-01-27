import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/components/utils';
import FeatureCarousel from './FeatureCarousel';

export default function LoginPrompt() {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [currentPalette, setCurrentPalette] = useState('default');

  useEffect(() => {
    // Read theme from localStorage or default
    const savedTheme = localStorage.getItem('user-theme') || 'light';
    const savedPalette = localStorage.getItem('user-palette') || 'default';
    setCurrentTheme(savedTheme);
    setCurrentPalette(savedPalette);
  }, []);

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl('Dashboard'));
  };

  const getLogoUrl = () => {
    return "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/0d5963d75_LogoAll.png";
  };

  const getBackgroundColors = () => {
    switch (currentPalette) {
      case 'pastel':
        return currentTheme === 'dark' 
          ? 'from-purple-950/40 via-green-950/30 to-pink-950/30'
          : 'from-purple-100/60 via-green-100/80 to-pink-100/60';
      case 'ocean':
        return currentTheme === 'dark'
          ? 'from-teal-950/40 via-cyan-950/30 to-blue-950/30'
          : 'from-teal-100/60 via-cyan-100/80 to-blue-100/60';
      case 'sunset':
        return currentTheme === 'dark'
          ? 'from-orange-950/40 via-amber-950/30 to-yellow-950/30'
          : 'from-orange-100/60 via-amber-100/80 to-yellow-100/60';
      case 'default':
      default:
        return currentTheme === 'dark'
          ? 'from-green-950/40 via-emerald-950/35 to-lime-950/40'
          : 'from-green-100/70 via-emerald-100/90 to-lime-100/70';
    }
  };

  return (
    <>
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="w-full max-w-md mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3 md:space-y-8"
          >
            {/* Logo */}
            <div className="flex justify-center pt-8">
              <img 
                src={getLogoUrl()} 
                alt="Plantify Logo" 
                className="w-24 h-24 object-contain"
              />
            </div>

            {/* Title */}
            <div className="space-y-0">
                    <h1 className="text-4xl font-bold text-foreground">
                      Welcome to
                    </h1>

              {/* Long Logo */}
              <div className="flex justify-center py-2">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/4d2bef4ab_PlantifyLogofinal.png" 
                  alt="Plantify Logo" 
                  className="w-full max-w-md h-auto object-contain scale-75"
                />
              </div>

              <p className="text-muted-foreground text-lg">
                Your personal garden companion
              </p>
            </div>

            {/* Feature Carousel */}
            <FeatureCarousel />

            {/* CTA Button */}
            <Button 
              size="lg" 
              className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleLogin}
            >
              <LogIn className="w-5 h-5 mr-2" />
              Get Started
            </Button>
          </motion.div>
        </div>
      </div>
    </>
  );
}