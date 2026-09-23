import React, { useEffect, useState } from "react";
import { User } from "@/entities/User";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

// Public post-checkout page. The webhook is the source of truth for granting
// Pro access; we poll the user record to surface a "you're Pro" state once it
// lands, but activation works even if the buyer closes the tab.
export default function ThankYou() {
  const [activated, setActivated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let attempts = 0;
    let timer;
    const check = async () => {
      try {
        const me = await User.me();
        if (me?.is_premium) {
          setActivated(true);
          setChecking(false);
          return;
        }
      } catch (_) {
        // Not signed in (anonymous buyer) — keep the generic confirming state.
      }
      attempts += 1;
      if (attempts >= 6) {
        setChecking(false);
        return;
      }
      timer = setTimeout(check, 2000);
    };
    check();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
          {checking ? (
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          ) : (
            <CheckCircle2 className="w-8 h-8 text-accent" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {activated ? "You're Pro! 🌱" : "Confirming your payment…"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {activated
            ? "Plantify Pro is active. Enjoy unlimited plants, reminders, and calendar sync."
            : "We're activating your Pro access — this usually takes a few seconds. You can keep using the app."}
        </p>
        <Link to={createPageUrl("Dashboard")}>
          <Button className="w-full">{activated ? "Start Planting" : "Back to Home"}</Button>
        </Link>
      </div>
    </div>
  );
}