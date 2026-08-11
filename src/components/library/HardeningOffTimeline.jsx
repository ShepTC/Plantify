import React from 'react';
import { Sprout, Wind, Leaf as PlantIcon, Info } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { getHardeningOffWindow, getStartSeedsIndoorStr } from '@/utils/hardeningOff';

const HARDENING_INFO =
  'Gradually acclimate indoor-grown seedlings to outdoor sun, wind, and temperature swings over 7–10 days to prevent transplant shock.';

function Step({ icon: Icon, label, date, tooltip, isLast }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center flex-shrink-0 border border-primary/30">
          <Icon className="w-4 h-4" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-border my-1 min-h-[16px]" />}
      </div>
      <div className="pb-4">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          {tooltip && (
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-muted-foreground hover:text-primary transition-colors" aria-label="What is hardening off?">
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[220px] text-left leading-relaxed">
                  {tooltip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {date && <p className="text-xs text-muted-foreground mt-0.5">{date}</p>}
      </div>
    </div>
  );
}

export default function HardeningOffTimeline({ plant, userZone }) {
  const ho = getHardeningOffWindow(plant, userZone);
  if (!ho) return null;
  const seedsStr = getStartSeedsIndoorStr(plant, userZone);

  return (
    <div>
      <h3 className="font-semibold text-base mb-3 flex items-center gap-2 text-foreground">
        <Wind className="w-4 h-4 text-primary" />Seedling Timeline
      </h3>
      <div className="bg-muted/40 rounded-lg p-3 border border-border">
        <Step icon={Sprout} label="Start seeds indoors" date={seedsStr || '—'} />
        <Step
          icon={Wind}
          label="Harden off"
          date={ho.dateRangeStr}
          tooltip={HARDENING_INFO}
        />
        <Step icon={PlantIcon} label="Transplant outdoors" date={ho.transplantDateStr} isLast />
      </div>
    </div>
  );
}