import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogIn, Sparkles, Leaf } from 'lucide-react';
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
    base44.auth.redirectToLogin();
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
        
        {/* Garden Background with Pattern */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getBackgroundColors()}`} />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        
        {/* Floating Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Floating garden elements */}
          <div className="absolute top-20 left-20 animate-float" style={{ animationDelay: '0s' }}>
            <Leaf className="w-6 h-6 text-green-500/40 dark:text-green-400/40" />
          </div>
          <div className="absolute top-40 right-32 animate-float" style={{ animationDelay: '2s' }}>
            <Sparkles className="w-4 h-4 text-emerald-500/35 dark:text-emerald-400/35" />
          </div>
          <div className="absolute bottom-32 left-40 animate-float" style={{ animationDelay: '4s' }}>
            <Leaf className="w-5 h-5 text-primary/40" />
          </div>
          <div className="absolute bottom-20 right-20 animate-float" style={{ animationDelay: '3s' }}>
            <Sparkles className="w-5 h-5 text-accent/30" />
          </div>
          <div className="absolute top-1/3 right-1/4 animate-float" style={{ animationDelay: '1s' }}>
            <Leaf className="w-4 h-4 text-secondary/35" />
          </div>

          {/* Growth orbs */}
          <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-primary/20 rounded-full animate-dewdrop blur-sm" style={{ animationDelay: '0s' }} />
          <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-accent/25 rounded-full animate-dewdrop blur-sm" style={{ animationDelay: '3s' }} />
          <div className="absolute bottom-1/3 left-1/4 w-4 h-4 bg-secondary/15 rounded-full animate-dewdrop blur-sm" style={{ animationDelay: '6s' }} />
          
          {/* Garden atmosphere glow */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-primary/15 to-accent/10 rounded-full blur-3xl animate-gentle-wave" />
            <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-gradient-to-tl from-secondary/12 to-primary/10 rounded-full blur-3xl animate-gentle-wave" style={{ animationDelay: '4s' }} />
            <div className="absolute top-1/2 right-1/3 w-36 h-36 bg-gradient-to-br from-accent/12 to-primary/8 rounded-full blur-3xl animate-gentle-wave" style={{ animationDelay: '6s' }} />
            <div className="absolute bottom-1/4 left-1/3 w-44 h-44 bg-gradient-to-tr from-primary/8 to-secondary/10 rounded-full blur-3xl animate-gentle-wave" style={{ animationDelay: '2s' }} />
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
          <Card className="w-full max-w-md frosted-glass shadow-2xl animate-float border-2 border-primary/30 dark:border-primary/20">
            <CardHeader className="text-center pb-2 relative">
              {/* Decorative top border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0" />
              
              <motion.div 
                className="w-28 h-28 mx-auto flex items-center justify-center mb-4 relative"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                {/* Glowing ring behind logo */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/25 to-accent/20 rounded-full blur-xl" />
                <div className="absolute inset-2 bg-gradient-to-br from-primary/15 to-accent/10 rounded-full animate-pulse" />
                
                <img 
                  src={getLogoUrl()} 
                  alt="Plantify Logo" 
                  className="w-28 h-28 object-contain filter drop-shadow-2xl relative z-10"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-2">
                  Welcome to Plantify
                </CardTitle>
                <CardDescription className="text-primary/80 dark:text-primary/70 text-lg font-medium">
                  🌱 Cultivate your digital garden journey
                </CardDescription>
              </motion.div>
            </CardHeader>
            
            <CardContent className="flex flex-col items-center space-y-6 pt-4 px-8">
              <motion.div
                className="w-full space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                {/* Feature highlights */}
                <div className="flex items-center gap-3 text-sm text-foreground/80">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <span>AI-powered planting insights</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground/80">
                  <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-4 h-4 text-accent" />
                  </div>
                  <span>Personalized growing calendar</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground/80">
                  <div className="w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-4 h-4 text-secondary" />
                  </div>
                  <span>Expert garden guidance</span>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full pt-2"
              >
                <Button 
                  size="lg" 
                  className="w-full text-lg py-7 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group border-0"
                  onClick={handleLogin}
                >
                  {/* Button background animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  
                  <LogIn className="w-5 h-5 mr-3 relative z-10" />
                  <span className="relative z-10 font-semibold">Start Growing Today</span>
                </Button>
              </motion.div>
              
              <motion.p 
                className="text-xs text-muted-foreground text-center pb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.4 }}
              >
                🔒 Secure sign-in with Google
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Garden vine decorations */}
        <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none">
          <svg className="w-full h-full text-primary/15 dark:text-primary/10 animate-gentle-wave" viewBox="0 0 100 100">
            <path 
              d="M0,100 Q20,80 40,85 T80,70 L85,65 L80,60 Q60,65 40,75 T0,90 Z" 
              fill="currentColor"
            />
          </svg>
        </div>

        <div className="absolute top-0 right-0 w-28 h-28 pointer-events-none rotate-180">
          <svg className="w-full h-full text-accent/15 dark:text-accent/10 animate-gentle-wave" viewBox="0 0 100 100" style={{ animationDelay: '2s' }}>
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