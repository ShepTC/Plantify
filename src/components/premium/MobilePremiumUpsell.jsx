
import React from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Bot, ShieldCheck, Zap, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/components/utils'; // Changed import path
import { motion } from 'framer-motion';

const premiumPerks = [
  {
    icon: Bot,
    title: "AI Garden Helper",
    description: "Get personalized advice and diagnostics.",
  },
  {
    icon: ShieldCheck,
    title: "Plant Health Scanner",
    description: "Instantly identify pests and diseases.",
  },
  {
    icon: Zap,
    title: "Unlimited Everything",
    description: "Full access with no limits on scans or questions.",
  },
];

export default function MobilePremiumUpsell({ open, onOpenChange, onDismiss }) {
  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    } else {
      onOpenChange(false);
    }
  };

  const handleUpgradeClick = () => {
    onOpenChange(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[360px] w-[90%] bg-transparent border-none p-0 rounded-2xl shadow-2xl mx-auto focus:outline-none">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-background border border-border/50 rounded-2xl overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-muted-foreground bg-black/10 dark:bg-white/10 rounded-full hover:bg-black/20 dark:hover:bg-white/20 transition-colors z-20"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Section */}
          <div className="relative text-center p-8 bg-gradient-to-br from-primary to-primary/70 overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leaf.png')] opacity-[0.05]"></div>
            <Sparkles className="absolute -top-4 -left-8 w-32 h-32 text-primary/30 dark:text-primary-foreground/10" />
            <Sparkles className="absolute -bottom-8 -right-4 w-24 h-24 text-primary/30 dark:text-primary-foreground/10 rotate-45" />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: -15 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 10 }}
              className="relative inline-block p-4 mb-4 bg-black/5 dark:bg-primary-foreground/20 rounded-2xl"
            >
              <Sparkles className="w-12 h-12 text-slate-800 dark:text-primary-foreground" />
            </motion.div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-primary-foreground">
              Go Plantify Pro
            </h2>
            <p className="text-slate-800/90 dark:text-primary-foreground/90 mt-1">
              Unlock your garden's full potential.
            </p>
          </div>

          {/* Perks Section */}
          <div className="px-6 py-8 bg-gradient-to-b from-background to-muted/20">
            <motion.ul
              className="space-y-4"
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.1, delayChildren: 0.3 }}
            >
              {premiumPerks.map((perk) => (
                <motion.li key={perk.title} variants={itemVariants} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-slate-200/70 text-slate-700 dark:bg-primary/10 dark:text-primary border border-slate-300/70 dark:border-primary/20">
                    <perk.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-base">{perk.title}</h3>
                    <p className="text-sm text-foreground/80">{perk.description}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </div>

          {/* Footer with CTA */}
          <div className="px-6 pb-6 pt-6 border-t border-border/50 bg-background">
            <Link to={createPageUrl("Upgrade")} className="block" onClick={handleUpgradeClick}>
              <Button
                size="lg"
                className="w-full h-14 text-lg font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
              >
                Upgrade Now - $4.99
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground text-center mt-3">
              One-time purchase, lifetime access.
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
