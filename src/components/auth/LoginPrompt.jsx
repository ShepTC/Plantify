import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogIn, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

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
    User.login();
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
          ? 'from-purple-950/30 via-green-950/20 to-emerald-950/25'
          : 'from-purple-50/50 via-green-50/70 to-emerald-100/60';
      case 'ocean':
        return currentTheme === 'dark'
          ? 'from-teal-950/30 via-green-950/20 to-emerald-950/25'
          : 'from-teal-50/50 via-green-50/70 to-emerald-100/60';
      case 'sunset':
        return currentTheme === 'dark'
          ? 'from-orange-950/25 via-green-950/20 to-amber-950/25'
          : 'from-orange-50/40 via-green-50/70 to-amber-100/50';
      case 'default':
      default:
        return currentTheme === 'dark'
          ? 'from-green-950/30 via-emerald-950/25 to-teal-950/30'
          : 'from-green-50/60 via-emerald-50/80 to-teal-50/70';
    }
  };

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(-2deg); }
          66% { transform: translateY(5px) rotate(2deg); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes dewdrop {
          0% { transform: translateX(-10px) translateY(-10px) scale(0.8); opacity: 0.3; }
          50% { transform: translateX(5px) translateY(10px) scale(1); opacity: 0.8; }
          100% { transform: translateX(15px) translateY(20px) scale(0.6); opacity: 0.2; }
        }
        
        @keyframes gentleWave {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          25% { transform: translateX(5px) translateY(-3px); }
          50% { transform: translateX(-3px) translateY(3px); }
          75% { transform: translateX(-5px) translateY(-2px); }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-sparkle { animation: sparkle 3s ease-in-out infinite; }
        .animate-dewdrop { animation: dewdrop 8s ease-in-out infinite; }
        .animate-gentle-wave { animation: gentleWave 12s ease-in-out infinite; }
        
        .frosted-glass {
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .dark .frosted-glass {
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>

      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
        
        {/* Enchanted Background Layers */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getBackgroundColors()}`} />
        
        {/* Floating Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Floating leaf elements */}
          <div className="absolute top-20 left-20 animate-sparkle">
            <Leaf className="w-4 h-4 text-green-600/30 dark:text-green-400/30" style={{ animationDelay: '0s' }} />
          </div>
          <div className="absolute top-40 right-32 animate-sparkle">
            <Leaf className="w-3 h-3 text-emerald-600/25 dark:text-emerald-400/25" style={{ animationDelay: '2s' }} />
          </div>
          <div className="absolute bottom-32 left-40 animate-sparkle">
            <Leaf className="w-5 h-5 text-teal-600/30 dark:text-teal-400/30" style={{ animationDelay: '4s' }} />
          </div>
          <div className="absolute bottom-20 right-20 animate-sparkle">
            <Sparkles className="w-3 h-3 text-green-600/20 dark:text-green-400/20" style={{ animationDelay: '1.5s' }} />
          </div>
          
          {/* Floating dewdrops/orbs */}
          <div className="absolute top-32 right-40 w-2 h-2 bg-green-500/20 dark:bg-green-400/20 rounded-full animate-dewdrop" style={{ animationDelay: '0s' }} />
          <div className="absolute top-60 left-32 w-3 h-3 bg-emerald-500/15 dark:bg-emerald-400/15 rounded-full animate-dewdrop" style={{ animationDelay: '3s' }} />
          <div className="absolute bottom-40 right-60 w-1.5 h-1.5 bg-teal-500/25 dark:bg-teal-400/25 rounded-full animate-dewdrop" style={{ animationDelay: '6s' }} />
          
          {/* Gentle wave elements */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-3xl animate-gentle-wave" />
            <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-gradient-to-tl from-teal-500/10 to-green-500/10 rounded-full blur-3xl animate-gentle-wave" style={{ animationDelay: '4s' }} />
            <div className="absolute top-1/2 right-1/3 w-36 h-36 bg-gradient-to-br from-emerald-500/8 to-green-500/8 rounded-full blur-3xl animate-gentle-wave" style={{ animationDelay: '6s' }} />
          </div>
        </div>

        {/* Main Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
          className="relative z-10"
        >
          <Card className="w-full max-w-md frosted-glass shadow-2xl animate-float">
            <CardHeader className="text-center pb-2">
              <motion.div 
                className="w-24 h-24 mx-auto flex items-center justify-center mb-6"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <img 
                  src={getLogoUrl()} 
                  alt="Plantify Logo" 
                  className="w-24 h-24 object-contain filter drop-shadow-lg"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <CardTitle className="text-3xl font-bold text-slate-900 dark:text-foreground mb-2">
                  Welcome to Plantify
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-muted-foreground text-lg">
                  Cultivate your digital garden journey.
                </CardDescription>
              </motion.div>
            </CardHeader>
            
            <CardContent className="flex flex-col items-center space-y-6 pt-4">
              <motion.p 
                className="text-slate-700 dark:text-foreground/80 text-center leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                Join thousands of gardeners growing smarter with AI-powered planting insights, 
                personalized alerts, and expert guidance.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full"
              >
                <Button 
                  size="lg" 
                  className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                  onClick={handleLogin}
                >
                  {/* Button background animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  
                  <LogIn className="w-5 h-5 mr-3 relative z-10" />
                  <span className="relative z-10">Enter Your Garden</span>
                </Button>
              </motion.div>
              
              <motion.p 
                className="text-xs text-slate-500 dark:text-muted-foreground text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.4 }}
              >
                Secure sign-in powered by Google ✨
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subtle Growing Vines Animation (Corner Elements) */}
        <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none">
          <svg className="w-full h-full text-green-600/10 dark:text-green-400/10 animate-gentle-wave" viewBox="0 0 100 100">
            <path 
              d="M0,100 Q20,80 40,85 T80,70 L85,65 L80,60 Q60,65 40,75 T0,90 Z" 
              fill="currentColor"
            />
          </svg>
        </div>
        
        <div className="absolute top-0 right-0 w-28 h-28 pointer-events-none rotate-180">
          <svg className="w-full h-full text-emerald-600/10 dark:text-emerald-400/10 animate-gentle-wave" viewBox="0 0 100 100" style={{ animationDelay: '2s' }}>
            <path 
              d="M0,100 Q20,80 40,85 T80,70 L85,65 L80,60 Q60,65 40,75 T0,90 Z" 
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    </>
  );
}