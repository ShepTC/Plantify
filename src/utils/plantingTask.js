import { getHardeningOffWindow, getStartSeedsIndoorStr } from './hardeningOff';
import { differenceInDays, format } from 'date-fns';

/**
 * Compute the current planting "task" for a UserPlant.
 *
 * Returns an object describing what the user should do next, the relevant
 * date/countdown, and the action that marks the milestone complete.
 *
 *   label       — short task title (e.g. "Start Seeds Indoors")
 *   accent      — color key for the card (purple|blue|primary|emerald|green|amber)
 *   dateLabel   — prominent date/countdown string, or null
 *   reason      — secondary context line, or null
 *   action      — 'seed_start' | 'transplant' | 'harvest' | null
 *   actionLabel — button text for the action, or null
 */
export const getPlantingTask = (userPlant, plantDetails, userZone) => {
  if (!userPlant || !plantDetails) return null;

  const status = userPlant.status;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ── Harvested ──
  if (status === 'harvested') {
    return {
      label: 'Harvested',
      accent: 'amber',
      dateLabel: userPlant.harvest_date ? format(new Date(userPlant.harvest_date), 'MMM d') : null,
      reason: null,
      action: null,
      actionLabel: null,
    };
  }

  // ── Growing ──
  if (status === 'planted') {
    const harvestDate = userPlant.harvest_date ? new Date(userPlant.harvest_date) : null;
    const daysToHarvest = harvestDate ? differenceInDays(harvestDate, today) : null;
    let dateLabel = null;
    if (daysToHarvest !== null) {
      if (daysToHarvest <= 0) dateLabel = 'Ready to harvest!';
      else dateLabel = `${daysToHarvest}d to harvest`;
    }
    return {
      label: 'Growing',
      accent: 'green',
      dateLabel,
      reason: harvestDate ? `Est. harvest ${format(harvestDate, 'MMM d')}` : null,
      action: 'harvest',
      actionLabel: 'Mark Harvested',
    };
  }

  // ── Planned ──
  const isTransplantCrop =
    Array.isArray(plantDetails.transplant_indoor) && plantDetails.transplant_indoor.length > 0;
  const hasDirectSow =
    Array.isArray(plantDetails.direct_sow_zones) && plantDetails.direct_sow_zones.length > 0;

  if (isTransplantCrop) {
    const ho = getHardeningOffWindow(plantDetails, userZone);
    if (ho) {
      const daysUntilHardening = differenceInDays(ho.start, today);
      const daysUntilTransplant = differenceInDays(ho.transplantDate, today);

      // Transplant day has arrived
      if (daysUntilTransplant <= 0) {
        return {
          label: 'Transplant Outdoors',
          accent: 'primary',
          dateLabel: 'Today!',
          reason: `Scheduled ${format(ho.transplantDate, 'MMM d')}`,
          action: 'transplant',
          actionLabel: 'Mark Transplanted',
        };
      }

      // Hardening-off window is active
      if (daysUntilHardening <= 0 && daysUntilTransplant > 0) {
        return {
          label: 'Harden Off',
          accent: 'blue',
          dateLabel: `${daysUntilTransplant}d until transplant`,
          reason: `Move outdoors ${format(ho.transplantDate, 'MMM d')}`,
          action: 'transplant',
          actionLabel: 'Mark Transplanted',
        };
      }

      // Waiting — seeds should be started / seedling growing
      const seedStr = getStartSeedsIndoorStr(plantDetails, userZone);
      return {
        label: 'Start Seeds Indoors',
        accent: 'purple',
        dateLabel: seedStr || `${daysUntilHardening}d until harden off`,
        reason: `Harden off ${format(ho.start, 'MMM d')}`,
        action: 'seed_start',
        actionLabel: 'Mark Seeds Started',
      };
    }

    // Transplant crop but no zone-specific data
    return {
      label: 'Start Seeds Indoors',
      accent: 'purple',
      dateLabel: null,
      reason: null,
      action: 'seed_start',
      actionLabel: 'Mark Seeds Started',
    };
  }

  // Direct-sow crop
  if (hasDirectSow) {
    return {
      label: 'Direct Sow Outdoors',
      accent: 'emerald',
      dateLabel: null,
      reason: userZone ? `Zone ${userZone}` : null,
      action: 'seed_start',
      actionLabel: 'Mark Planted',
    };
  }

  // Generic planned fallback
  return {
    label: 'Plant',
    accent: 'purple',
    dateLabel: null,
    reason: null,
    action: 'seed_start',
    actionLabel: 'Mark Planted',
  };
};