import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { Sparkles, Lock } from "lucide-react";
import { motion } from "framer-motion";

// Soft, contextual upgrade card. Non-blocking — the core planting flow stays
// frictionless for free users.
export default function UpgradePrompt({ title = "Unlock Plantify Pro", description, compact = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 ${compact ? "p-3" : "p-4"}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0 border border-primary/20">
          <Lock className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`font-semibold text-foreground ${compact ? "text-xs" : "text-sm"}`}>{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
          )}
          <Link
            to={createPageUrl("Upgrade")}
            className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Upgrade to Pro
          </Link>
        </div>
      </div>
    </motion.div>
  );
}