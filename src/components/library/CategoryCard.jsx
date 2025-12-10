import React from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function CategoryCard({ category, plantCount, onClick, compact = false }) {
  const Icon = category.icon;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className="cursor-pointer h-full"
      onClick={onClick}
    >
      <Card className={`h-full overflow-hidden relative group border-0 shadow-lg hover:shadow-xl transition-all duration-300`}>
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90`} />
        
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large background icon */}
          <div className="absolute -right-4 -bottom-4 opacity-20">
            <Icon className="w-24 h-24 md:w-32 md:h-32 text-white transform rotate-12" />
          </div>
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        
        {/* Content */}
        <div className={`relative z-10 ${compact ? 'p-3 md:p-6' : 'p-4 md:p-6'} flex ${compact ? 'flex-row items-center gap-3' : 'flex-col'} h-full ${compact ? 'min-h-[70px]' : 'min-h-[140px]'} md:min-h-[180px] md:flex-col`}>
          {/* Icon */}
          <div className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} md:w-14 md:h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ${compact ? '' : 'mb-3 md:mb-4'} md:mb-4 border border-white/30 flex-shrink-0`}>
            <Icon className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} md:w-7 md:h-7 text-white`} />
          </div>

          {/* Text */}
          <div className={`${compact ? '' : 'flex-1'} md:flex-1`}>
            <h3 className={`text-white font-bold ${compact ? 'text-base' : 'text-lg'} md:text-xl mb-0 md:mb-1`}>
              {category.name}
            </h3>
            <p className={`text-white/80 text-xs md:text-sm leading-tight line-clamp-2 ${compact ? 'hidden' : ''} md:block`}>
              {category.description}
            </p>
          </div>

          {/* Footer - inline on mobile compact, row on desktop */}
          <div className={`flex items-center ${compact ? 'ml-auto gap-2' : 'justify-between mt-3 pt-3 border-t border-white/20'} md:justify-between md:mt-3 md:pt-3 md:border-t md:border-white/20 md:ml-0 md:w-full`}>
            <span className={`text-white/90 ${compact ? 'text-xs' : 'text-sm'} md:text-sm font-medium`}>
              {plantCount} {plantCount === 1 ? 'plant' : 'plants'}
            </span>
            <div className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} md:w-8 md:h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors`}>
              <ChevronRight className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} md:w-4 md:h-4 text-white`} />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}