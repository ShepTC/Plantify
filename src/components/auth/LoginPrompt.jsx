import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogIn, Sparkles, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/components/utils';

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
    switch (currentPalette) {
      case 'pastel':
        return "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/bee4fbc3e_PlantifyPastelLogo.png";
      case 'ocean':
        return "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/6ff3caca3_PlantifyOceanLogo.png";
      case 'sunset':
        return "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/046b7b36c_PlantifySunsetLogo.png";
      case 'default':
      default:
        return "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/04c895d97_PlantifyGardenLogo.png";
    }
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
            className="text-center space-y-8"
          >
            {/* Logo */}
            <div className="flex justify-center">
              <img 
                src={getLogoUrl()} 
                alt="Plantify Logo" 
                className="w-24 h-24 object-contain"
              />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">
                Welcome to Plantify
              </h1>
              <p className="text-muted-foreground text-lg">
                Your personal garden companion
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 text-left">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 opacity-30 blur-md transition-all duration-300 group-hover:opacity-80 group-hover:blur-lg animate-pulse" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-foreground">Track your garden's progress</span>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 opacity-30 blur-md transition-all duration-300 group-hover:opacity-80 group-hover:blur-lg animate-pulse" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-foreground">Get personalized planting advice</span>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 opacity-30 blur-md transition-all duration-300 group-hover:opacity-80 group-hover:blur-lg animate-pulse" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-foreground">Discover what plants you can plant today</span>
                </div>
              </div>
            </div>

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