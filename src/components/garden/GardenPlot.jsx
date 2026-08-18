import React from "react";
import { Sprout, Sun, Trash2, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { getGrowthStage } from "@/utils/growthStage";
import { getHardeningOffWindow } from "@/utils/hardeningOff";
import { differenceInDays } from "date-fns";

// Plant name → emoji sprite (8-bit friendly, works in every theme)
const PLANT_EMOJI = [
  [/tomato/i, "🍅"],
  [/corn|maize/i, "🌽"],
  [/carrot|radish|beet|turnip|parsnip/i, "🥕"],
  [/lettuce|spinach|kale|chard|cabbage|collard|broccoli|bok/i, "🥬"],
  [/strawberr/i, "🍓"],
  [/pepper|chili|chilli/i, "🌶️"],
  [/potato/i, "🥔"],
  [/cucumber|zucchini|squash|pumpkin/i, "🥒"],
  [/eggplant|aubergine/i, "🍆"],
  [/onion|garlic|leek|shallot/i, "🧅"],
  [/herb|basil|mint|oregano|thyme|sage|rosemary|cilantro|coriander|parsley|dill/i, "🌿"],
  [/sunflower/i, "🌻"],
  [/lavender/i, "💜"],
  [/tulip|daffodil|iris|lily|crocus|rose|daisy|marigold|petunia/i, "🌸"],
  [/blueberr|raspberr|blackberr|currant/i, "🫐"],
  [/wheat|barley|oat|rye|grain/i, "🌾"],
  [/bean|pea|legume/i, "🫛"],
  [/apple|pear|cherry|peach|plum|apricot|nectarine/i, "🍎"],
  [/lemon|lime|orange|citrus/i, "🍋"],
  [/melon|watermelon|cantaloupe/i, "🍉"],
];

const emojiFor = (name = "") => {
  for (const [re, emoji] of PLANT_EMOJI) if (re.test(name)) return emoji;
  return "🌱";
};

const STAGE_CONFIG = {
  seed: { label: "Seeds", scale: 0, showPlant: false },
  sprout: { label: "Sprout", scale: 0.45, showPlant: true, forceEmoji: "🌱" },
  young: { label: "Growing", scale: 0.7, showPlant: true },
  mature: { label: "Mature", scale: 1, showPlant: true },
  harvested: { label: "Harvested", scale: 1, showPlant: true, forceEmoji: "🥀" },
};

const STATUS_COLOR = {
  planned: "bg-blue-500 text-white",
  planted: "bg-green-500 text-white",
  harvested: "bg-amber-500 text-white",
};

export default function GardenPlot({ plant, plantDetails, onAction, onDelete, onClick, userZone }) {
  const stage = getGrowthStage(plant, { [plant.plant_id]: plantDetails });
  const stageCfg = STAGE_CONFIG[stage] || STAGE_CONFIG.seed;
  const emoji = stageCfg.forceEmoji || emojiFor(plant.plant_name);

  // Determine the next-step action for planned plants (same logic as old PlantCard)
  const actionLabel = (() => {
    if (plant.status !== "planned") return null;
    try {
      const ho = getHardeningOffWindow(plantDetails, userZone);
      if (ho) {
        const daysUntilHardening = differenceInDays(ho.start, new Date());
        if (daysUntilHardening <= 0) return "transplant";
      }
    } catch (e) { /* fall through to seed_start */ }
    return "seed_start";
  })();

  // Growth progress 0..1 for the pixel progress bar
  const progress = {
    seed: 0,
    sprout: 0.2,
    young: 0.55,
    mature: 0.9,
    harvested: 1,
  }[stage] ?? 0;
  const filledBlocks = Math.round(progress * 10);

  const handleActionClick = (e) => {
    e.stopPropagation();
    onAction(plant, actionLabel);
  };
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(plant.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.18 }}
    >
      <div
        onClick={onClick}
        className="group cursor-pointer bg-card border-2 border-border shadow-[4px_4px_0_0_hsl(var(--border))] hover:shadow-[2px_2px_0_0_hsl(var(--border))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
      >
        {/* Top row: status badge + delete */}
        <div className="flex items-center justify-between px-2 pt-2">
          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 ${STATUS_COLOR[plant.status] || STATUS_COLOR.planned}`}>
            {stageCfg.label}
          </span>
          <button
            onClick={handleDeleteClick}
            className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
            aria-label="Remove from garden"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pixel-art soil bed */}
        <div className="relative h-24 mx-2 mt-1 border-2 border-amber-800/40 dark:border-amber-950/60 overflow-hidden bg-amber-800/25 dark:bg-amber-950/45">
          {/* soil texture stripes */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent 0, transparent 6px, rgba(0,0,0,0.15) 6px, rgba(0,0,0,0.15) 8px)",
            }}
          />
          {/* seeds in soil */}
          {stage === "seed" && (
            <div className="absolute inset-0 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-amber-200 dark:bg-amber-300/80 rounded-full" />
              <span className="w-1.5 h-1.5 bg-amber-200 dark:bg-amber-300/80 rounded-full" />
              <span className="w-1.5 h-1.5 bg-amber-200 dark:bg-amber-300/80 rounded-full" />
            </div>
          )}
          {/* plant emoji */}
          {stageCfg.showPlant && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="select-none drop-shadow-sm"
                style={{
                  fontSize: `${42 * stageCfg.scale}px`,
                  lineHeight: 1,
                }}
              >
                {emoji}
              </span>
            </div>
          )}
          {/* indoor-start pennant badge */}
          {plant.status === "planned" && plantDetails?.transplant_outdoor_zones?.length > 0 && (
            <div className="absolute top-1 left-1 bg-blue-500 text-white text-[8px] font-bold px-1 py-0.5 uppercase tracking-wide">
              Indoor
            </div>
          )}
        </div>

        {/* Pixel progress bar — 10 blocks */}
        <div className="flex gap-0.5 px-2 mt-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 ${i < filledBlocks ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        {/* Name + maturity */}
        <div className="px-2 pt-1.5 pb-1">
          <p className="text-xs font-bold text-foreground truncate">{plant.plant_name}</p>
          {plantDetails?.days_to_maturity && (
            <p className="text-[10px] text-muted-foreground">{plantDetails.days_to_maturity}d to harvest</p>
          )}
        </div>

        {/* Direct action button — no dropdown */}
        {plant.status === "planned" && (
          <button
            onClick={handleActionClick}
            className="block w-[calc(100%-16px)] mx-2 mb-2 py-1.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {actionLabel === "transplant" ? (
              <>
                <Leaf className="w-3 h-3 inline mr-1 -mt-0.5" />
                Transplant
              </>
            ) : (
              <>
                <Sprout className="w-3 h-3 inline mr-1 -mt-0.5" />
                Start Seeds
              </>
            )}
          </button>
        )}
        {plant.status === "planted" && (
          <button
            onClick={handleActionClick}
            className="block w-[calc(100%-16px)] mx-2 mb-2 py-1.5 text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Sun className="w-3 h-3 inline mr-1 -mt-0.5" />
            Harvest
          </button>
        )}
        {plant.status === "harvested" && (
          <div className="mx-2 mb-2 py-1.5 text-xs font-bold uppercase tracking-wider text-center text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30">
            ✓ Done
          </div>
        )}
      </div>
    </motion.div>
  );
}