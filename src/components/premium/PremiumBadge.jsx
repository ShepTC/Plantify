import React from "react";
import { Sparkles, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function PremiumBadge({ size = "medium", showText = true, className = "" }) {
  const sizes = {
    small: "w-6 h-6 text-xs",
    medium: "w-8 h-8 text-sm",
    large: "w-12 h-12 text-base"
  };

  const textSizes = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base"
  };

  // Mobile version with glowing shining star
  if (size === "small") {
    const starClipPath =
    "polygon(50% 0%, 55% 45%, 100% 50%, 55% 55%, 50% 100%, 45% 55%, 0% 50%, 45% 45%)";

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.2
        }}
        className={`relative w-8 h-8 ${className}`}>

      {/* Outer glow pulse */}
      <motion.div
          className="absolute inset-0 rounded-full bg-purple-500/60 blur-md"
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.3, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} />


      {/* Shine glint effect */}
      <motion.div
          className="absolute inset-0 bg-white dark:bg-purple-200 shadow-2xl"
          style={{ clipPath: starClipPath }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }} />


        {/* Main Star Shape - consistent purple gradient */}
        <motion.div
          className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 shadow-[0_0_12px_rgba(168,85,247,0.9)] drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]"
          style={{ clipPath: starClipPath }}
          animate={{ opacity: [0.9, 1, 0.9], scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />



      {/* Top right sparkle */}
      <motion.div
          className="absolute -top-1 -right-1"
          animate={{ scale: [0.9, 1.3, 0.9], rotate: [0, 90, 180] }}
          transition={{ duration: 3, repeat: Infinity, ease: "circOut", delay: 0.5 }}>

        <Plus className="w-2.5 h-2.5 text-white drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]" strokeWidth={3} />
      </motion.div>

      {/* Bottom left sparkle */}
      <motion.div
          className="absolute -bottom-1 -left-1"
          animate={{ scale: [0.9, 1.3, 0.9], rotate: [0, -90, -180] }}
          transition={{ duration: 3, repeat: Infinity, ease: "circOut", delay: 1.8 }}>

        <Plus className="w-2.5 h-2.5 text-white drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]" strokeWidth={3} />
      </motion.div>
    </motion.div>);

  }


  // Desktop version (unchanged)
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.1
      }}
      className={`flex items-center gap-2 ${className}`}>

      {/* Premium Gem/Diamond Logo */}
      <div className={`
        ${sizes[size]} 
        bg-gradient-to-br from-primary via-secondary to-accent
        rounded-lg shadow-lg flex items-center justify-center
        relative overflow-hidden
        animate-pulse
      `}>
        {/* Sparkle overlay effect */}
        <div className="bg-[#820876] absolute inset-0 from-white/20 to-transparent opacity-70"></div>
        <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full opacity-80"></div>
        <div className="absolute bottom-1 right-1 w-0.5 h-0.5 bg-white rounded-full opacity-60"></div>
        
        {/* Main icon */}
        <Sparkles className={`
          ${size === 'small' ? 'w-3 h-3' : size === 'medium' ? 'w-4 h-4' : 'w-6 h-6'}
          text-primary-foreground drop-shadow-sm relative z-10
        `} />
      </div>

      {/* Premium text */}
      {showText &&
      <span className={`
          font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 
          bg-clip-text text-transparent ${textSizes[size]}
        `}>
          Plantify Pro
        </span>
      }
    </motion.div>);

}