import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Sparkles, Sprout, Calendar, Zap, Shield } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    id: 1,
    icon: Leaf,
    title: "Track Progress",
    description: "Monitor your garden's growth with detailed tracking and beautiful visualizations"
  },
  {
    id: 2,
    icon: Sparkles,
    title: "AI Planting Advice",
    description: "Get personalized recommendations powered by AI tailored to your growing zone"
  },
  {
    id: 3,
    icon: Sprout,
    title: "Plant Today",
    description: "Discover what plants you can start today with real-time recommendations"
  },
  {
    id: 4,
    icon: Calendar,
    title: "Smart Calendar",
    description: "Never miss a planting date with seasonal planning and reminders"
  },
  {
    id: 5,
    icon: Zap,
    title: "Quick Insights",
    description: "Get instant gardening tips and plant care advice at your fingertips"
  },
  {
    id: 6,
    icon: Shield,
    title: "Expert Database",
    description: "Access thousands of plants with detailed care information"
  }
];

export default function FeatureCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      zIndex: 0,
      x: dir > 0 ? -1000 : 1000,
      opacity: 0,
    }),
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + features.length) % features.length);
  };

  const CurrentIcon = features[current].icon;

  return (
    <div className="w-full space-y-6">
      {/* Feature Card */}
      <div className="relative h-64 flex flex-col items-center justify-start pt-8">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.4 },
            }}
            className="absolute w-full h-full flex flex-col items-center justify-center px-6 py-8 text-center"
          >
            <div className="relative mb-4">
              <div className="absolute -inset-2 rounded-xl bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 opacity-30 blur-md" />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="relative w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center"
              >
                <CurrentIcon className="w-8 h-8 text-primary" />
              </motion.div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {features[current].title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {features[current].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>


      {/* Counter */}
      <div className="text-center text-xs text-muted-foreground">
        {current + 1} / {features.length}
      </div>
    </div>
  );
}