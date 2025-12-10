
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Bot, ShieldCheck, Camera, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const premiumPerks = [
{
  name: "AI Garden Helper",
  description: "Personalized advice, diagnostics, and step-by-step guidance to solve any plant problem.",
  icon: Bot
},
{
  name: "Plant Health Scanner",
  description: "Instantly identify pests, diseases, and nutrient deficiencies from a single photo.",
  icon: ShieldCheck
},
{
  name: "Unlimited Plant ID",
  description: "Discover the name and care details of any plant you find, with no limits.",
  icon: Camera
},
{
  name: "Priority Access",
  description: "Get unlimited access to all current and future Plantify Pro features.", // Updated description
  icon: Zap
}];


export default function UpgradePage() {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    // This is where the in-app purchase flow would be initiated.
    console.log("Initiating purchase flow...");
  };

  return (
    <>
      <style jsx>{`
        .glow-text {
          text-shadow: 0 0 20px hsl(var(--primary) / 0.3), 
                       0 0 40px hsl(var(--primary) / 0.2),
                       0 0 60px hsl(var(--primary) / 0.1);
        }
      `}</style>
      
      <div className="bg-background text-foreground min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b border-border md:border-none">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="bg-[#48a46b] text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 w-10">
            <ArrowLeft className="w-6 h-6 text-white hover:text-white" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">
            Plantify Pro {/* Updated title */}
          </h1>
          <div className="w-10"></div> {/* Spacer */}
        </header>

        {/* Main Content - now scrollable */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            className="w-full max-w-2xl mx-auto space-y-10">

            {/* Hero Section */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="text-center">

              <div className="inline-block p-4 mb-4 bg-primary/10 text-primary rounded-2xl">
                <Sparkles className="w-12 h-12" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground glow-text">
                Supercharge Your Garden
              </h2>
              <p className="text-lg text-muted-foreground mt-2">
                Unlock exclusive AI-powered tools to help your garden thrive.
              </p>
            </motion.div>

            {/* Perks List */}
            <div className="space-y-6">
              {premiumPerks.map((perk) =>
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
              )}
            </div>
          </motion.div>
        </main>

        {/* Footer with Purchase Button */}
        <footer className="p-4 bg-background/80 backdrop-blur-sm border-t border-border sticky bottom-0">
          <div className="max-w-2xl mx-auto space-y-3 text-center">
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-opacity"
              onClick={handleUpgrade}>

              Upgrade Now - $4.99
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
    </>);

}
