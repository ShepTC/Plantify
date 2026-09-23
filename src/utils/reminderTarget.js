import { format } from 'date-fns';
import { getHardeningOffWindow } from './hardeningOff';
import { getCurrentWeek, isPlantableToday, nextWindowStart, weekToDate } from './plantingWindows';

// The next milestone worth a reminder for a garden plant: { date: 'yyyy-MM-dd', title, description } or null.
export const getReminderTarget = (userPlant, plantDetails, userZone) => {
  if (!userPlant || !plantDetails || userPlant.status === 'harvested') return null;
  const name = userPlant.plant_name;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fmt = (d) => format(d, 'yyyy-MM-dd');

  if (userPlant.status === 'planted') {
    if (!userPlant.harvest_date || new Date(userPlant.harvest_date) < today) return null;
    return { date: userPlant.harvest_date, title: `Harvest your ${name}`, description: `Your ${name} should be ready to harvest.` };
  }

  const ho = getHardeningOffWindow(plantDetails, userZone);
  if (ho) {
    if (ho.start > today) {
      return { date: fmt(ho.start), title: `Harden off your ${name}`, description: `Start setting your ${name} seedlings outside for a few hours a day before transplanting on ${ho.transplantDateStr}.` };
    }
    return { date: fmt(ho.transplantDate), title: `Transplant your ${name}`, description: `Time to move your ${name} into the garden.` };
  }

  if (!userZone) return null;
  const week = getCurrentWeek();
  if (isPlantableToday(plantDetails, userZone, week)) {
    return { date: fmt(today), title: `Sow your ${name}`, description: `Your ${name} planting window is open now.` };
  }
  const next = nextWindowStart(plantDetails, userZone, week);
  if (!next) return null;
  return { date: fmt(weekToDate(next.start, week)), title: `Sow your ${name}`, description: `The planting window for ${name} opens this week.` };
};