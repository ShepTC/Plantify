import React from "react";
import { Link } from "react-router-dom";
import { Lock, Sparkles, ArrowLeft } from "lucide-react";

// Full-screen gate for Pro-only tools.
export default function ProLocked({ title, description }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-background">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-primary/25 bg-card/80 backdrop-blur-xl p-6 text-center shadow-xl">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-foreground">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
          <Link to="/Upgrade" className="mt-5 inline-flex w-full h-11 items-center justify-center gap-1.5 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Sparkles className="w-4 h-4" /> Unlock with Pro
          </Link>
          <Link to="/Dashboard" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-3 h-3" /> Back to Today
          </Link>
        </div>
      </div>
    </div>
  );
}