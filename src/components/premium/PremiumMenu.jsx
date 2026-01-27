import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/components/utils';
import { Sparkles, Camera, Zap, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';

const GREEN_CHAT_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/7fb8eaed4_newlogowhite.png";
const SUNSET_CHAT_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/3d8f3caac_ChatLogoSunset.png";

export default function PremiumMenu() {
  const colorPalette = document.documentElement.getAttribute('data-palette') || 'default';
  const premiumTools = [
    {
      name: "AI Garden Helper",
      description: "Get personalized advice from our AI assistant",
      icon: "image",
      url: createPageUrl("Assistant"),
      gradient: "from-purple-500 via-purple-600 to-pink-500",
      shadowColor: "shadow-purple-500/50"
    },
    {
      name: "Plant Health Scanner",
      description: "Diagnose plant diseases with AI photo analysis",
      icon: Camera,
      url: createPageUrl("HealthScanner"),
      gradient: "from-green-500 via-emerald-500 to-teal-500",
      shadowColor: "shadow-green-500/50"
    }
  ];

  return (
    <div className="w-full max-w-xs space-y-3">
      {/* Premium Header */}
      <div className="text-center mb-3 p-3 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-orange-900/20 rounded-lg border border-purple-500/30 shadow-xl shadow-purple-500/30">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/60">
            <Crown className="w-3 h-3 text-white drop-shadow-[0_0_8px_rgba(168,85,247,0.9)]" />
          </div>
          <span className="font-bold text-sm bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">
            Plantify Pro Tools
          </span>
        </div>
      </div>

      {/* Premium Tools */}
      <div className="space-y-2">
        {premiumTools.map((tool) => (
          <Link key={tool.name} to={tool.url} className="block">
            <Card className={`relative hover:scale-[1.02] transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-r p-[1.5px] rounded-lg shadow-2xl ${tool.shadowColor} hover:shadow-2xl`}>
              {/* Animated border gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${tool.gradient} rounded-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300 shadow-2xl`} />

              {/* Content container */}
              <div className="relative bg-card rounded-[7px] p-3 h-full flex flex-col items-center text-center">
                <h3 className="font-bold text-foreground text-sm mb-2 group-hover:text-primary transition-colors drop-shadow-[0_0_6px_rgba(168,85,247,0.4)]">
                  {tool.name}
                </h3>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tool.gradient} flex items-center justify-center shadow-2xl group-hover:shadow-[0_0_25px_rgba(168,85,247,0.8)] group-hover:scale-110 transition-all duration-300`}>
                  {tool.icon === "image" ? (
                    <img src={colorPalette === 'sunset' ? SUNSET_CHAT_LOGO : GREEN_CHAT_LOGO} alt="Garden Helper" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                  ) : (
                    <tool.icon className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                  )}
                </div>

                {/* Sparkle decorations */}
                <div className="absolute top-1.5 right-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                  <Sparkles className="w-3 h-3 text-purple-400 drop-shadow-[0_0_6px_rgba(192,132,252,0.9)]" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Premium Badge Footer */}
      <div className="text-center pt-2 border-t border-border/50">
        <div className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 px-3 py-1.5 rounded-full shadow-2xl shadow-yellow-500/70">
          <Zap className="w-3 h-3 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
          <span className="text-xs font-semibold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">Pro Active</span>
        </div>
      </div>
    </div>
  );
}