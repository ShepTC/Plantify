import { differenceInDays, format, parseISO, startOfDay } from 'date-fns';
import { plantWindows, methodLabels, windowLabel } from '@/utils/plantingSchedule';

export const getPlantingTask = (userPlant, plantDetails, userZone) => {
  if (!userPlant) return null;
  const today = startOfDay(new Date());
  const windows = plantDetails ? plantWindows(plantDetails, userZone).filter(w => w.end >= today) : [];
  if (userPlant.status === 'harvested') return { label: 'Harvested', accent: 'amber', dateLabel: userPlant.harvest_date ? format(parseISO(userPlant.harvest_date),'MMM d') : null, action: null };
  if (userPlant.seed_started_date && !userPlant.transplant_date && userPlant.status === 'planted') {
    const next = windows.find(w => w.method === 'transplant');
    return { label: 'Transplant outdoors', accent: 'blue', dateLabel: next ? windowLabel(next) : 'Check your local conditions', reason: 'Harden off seedlings gradually for 7–10 days first.', action: 'transplant', actionLabel: 'Mark transplanted' };
  }
  if (userPlant.status === 'planted') {
    const harvest = userPlant.harvest_date ? parseISO(userPlant.harvest_date) : null;
    const days = harvest ? differenceInDays(harvest,today) : null;
    return { label: 'Next: Harvest', accent: 'green', dateLabel: harvest ? `Est. ${format(harvest,'MMM d')}` : 'Watch for signs of maturity', reason: days === null ? null : days > 0 ? `About ${days} days to go` : 'Check if your crop is ready', action: 'harvest', actionLabel: 'Mark harvested' };
  }
  const next = windows.find(w => !userPlant.planting_method || w.method === userPlant.planting_method) || windows[0];
  const method = next?.method || userPlant.planting_method || 'direct_sow';
  return { label: methodLabels[method], accent: method === 'seed_start' ? 'purple' : 'primary', dateLabel: next ? windowLabel(next) : 'No zone-specific dates available', reason: next ? next.start <= today ? 'Your planting window is open' : 'Plan ahead · wait for this window' : 'See the growing guide before planting.', action: method, actionLabel: method === 'seed_start' ? 'Start seeds' : method === 'transplant' ? 'Mark transplanted' : 'Mark planted' };
};