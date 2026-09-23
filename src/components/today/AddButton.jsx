import React from "react";
import { Plus, Check, Loader2 } from "lucide-react";

// Shared add-to-garden control: full pill or compact round.
export default function AddButton({ added, loading, onClick, compact = false }) {
  const handle = (e) => {
    e.stopPropagation();
    if (!added && !loading) onClick();
  };
  const Icon = loading ? Loader2 : added ? Check : Plus;
  const tone = added
    ? "bg-primary/10 text-primary border border-primary/25"
    : "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90";

  if (compact) {
    return (
      <button onClick={handle} aria-label={added ? "In your garden" : "Add to garden"}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${tone}`}>
        <Icon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      </button>
    );
  }
  return (
    <button onClick={handle}
      className={`w-full h-11 rounded-2xl text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${tone}`}>
      <Icon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      {added ? "In your garden" : "Add to my garden"}
    </button>
  );
}