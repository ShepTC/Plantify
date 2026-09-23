import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Sprout, Bell, Bot, ShieldCheck, Camera, Zap, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const premiumPerks = [
  { name: "Planting Reminders", description: "One tap on any plant and we'll remind you when to harden off, transplant, sow or harvest.", icon: Bell },
  { name: "Full Season Plan", description: "See everything coming up in your zone for the weeks ahead, not just the next crop.", icon: Sprout },
  { name: "Google Calendar Sync", description: "Send your whole garden schedule to Google Calendar automatically.", icon: Zap },
  { name: "AI Garden Helper", description: "Personalized advice and step-by-step guidance for any plant problem.", icon: Bot },
  { name: "Plant Health Scanner", description: "Identify pests, diseases, and nutrient deficiencies from a single photo.", icon: ShieldCheck },
  { name: "Unlimited Plant ID", description: "Discover the name and care details of any plant you find.", icon: Camera },
  { name: "Priority Access", description: "All current and future Plantify Pro features.", icon: Zap },
];

export default function UpgradePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('create-checkout', { productId: 'plantify-pro' });
      const redirectUrl = res?.data?.redirectUrl;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        console.error('No redirect URL returned from checkout');
      }
    } catch (e) {
      console.error('Checkout failed:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b border-border md:border-none">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-10 w-10">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">Plantify Pro</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="w-full max-w-2xl mx-auto space-y-10">

          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="text-center">
            <div className="inline-block p-4 mb-4 bg-primary/10 text-primary rounded-2xl">
              <Sparkles className="w-12 h-12" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Supercharge Your Garden
            </h2>
            <p className="text-lg text-muted-foreground mt-2">
              Knowing what to plant is always free. Pro makes sure you never miss the moment.
            </p>
          </motion.div>

          <div className="space-y-6">
            {premiumPerks.map((perk) => (
              <motion.div
                key={perk.name}
                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-lg mt-1">
                  <perk.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{perk.name}</h3>
                  <p className="text-sm text-muted-foreground">{perk.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      <footer className="p-4 bg-background/80 backdrop-blur-sm border-t border-border sticky bottom-0">
        <div className="max-w-2xl mx-auto space-y-3 text-center">
          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-opacity"
            onClick={handleUpgrade}
            disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Starting checkout…
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Upgrade Now — $4.99
              </>
            )}
          </Button>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <p>One-time purchase</p>
            <span className="text-border">|</span>
            <Button variant="link" className="text-xs h-auto p-0 text-muted-foreground hover:text-primary">
              Restore Purchase
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}