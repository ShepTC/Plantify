import React from "react";
import { format } from "date-fns";
import { Bell, BellRing, Lock } from "lucide-react";

// Per-plant reminder control. Pro sets it; free users see a lock that leads to Upgrade.
export default function RemindButton({ target, reminderDate, isPremium, onRemind }) {
  if (reminderDate) {
    return (
      <div className="h-9 px-2.5 rounded-xl bg-primary/10 text-primary text-[11px] font-semibold inline-flex items-center gap-1 flex-shrink-0" title="Reminder set">
        <BellRing className="w-3.5 h-3.5" />
        {format(new Date(reminderDate + "T00:00:00"), "MMM d")}
      </div>
    );
  }
  if (!target) return null;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onRemind(); }}
      aria-label={isPremium ? `Remind me: ${target.title}` : "Reminders are a Pro feature"}
      title={target.title}
      className="relative h-9 w-9 rounded-xl border border-border bg-background/60 text-muted-foreground hover:text-primary hover:border-primary/40 inline-flex items-center justify-center flex-shrink-0 transition-colors"
    >
      <Bell className="w-4 h-4" />
      {!isPremium && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <Lock className="w-2.5 h-2.5" />
        </span>
      )}
    </button>
  );
}