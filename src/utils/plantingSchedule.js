import { addDays, endOfMonth, format, startOfDay } from 'date-fns';
import { findZone } from '@/utils/zoneUtils';

export const methodLabels = { seed_start: 'Start seeds indoors', direct_sow: 'Sow seeds outdoors', transplant: 'Transplant outdoors' };
const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
function rangeDate(text, year, end = false) {
  const match = text.trim().match(/^([a-z]+)\s*(\d{1,2})?$/i);
  if (!match) return null;
  const month = months.indexOf(match[1].slice(0,3).toLowerCase());
  if (month < 0) return null;
  const date = new Date(year, month, Number(match[2] || 1));
  return end && !match[2] ? endOfMonth(date) : date;
}
export function plantWindows(plant, zone, now = new Date()) {
  if (!zone) return [];
  const windows = [];
  for (const year of [now.getFullYear()-1, now.getFullYear(), now.getFullYear()+1]) {
    for (const [field, method] of [['direct_sow_zones','direct_sow'], ['transplant_outdoor_zones','transplant']]) {
      const entry = findZone(plant[field], zone);
      for (const season of ['spring','fall']) {
        const a = entry?.[`${season}_start_week`], b = entry?.[`${season}_end_week`];
        if (a == null || b == null || a < 1 || b < 1 || a > 53 || b > 53) continue;
        const start = addDays(new Date(year,0,1), (a-1)*7);
        const end = addDays(new Date(b < a ? year+1 : year,0,1), b*7-1);
        windows.push({ start, end, method });
      }
    }
    const text = findZone(plant.start_seeds_indoor, zone)?.date_range;
    if (text) {
      const parts = text.split(/\s*[-–—]\s*/);
      const start = rangeDate(parts[0], year), end = rangeDate(parts[1] || parts[0], year, true);
      if (start && end) { if (end < start) end.setFullYear(year+1); windows.push({ start, end, method: 'seed_start' }); }
    }
  }
  return windows.sort((a,b) => a.start-b.start);
}
export function plantingSchedule(plants, zone, now = new Date()) {
  const today = startOfDay(now), horizon = addDays(today, 365);
  const current = [], upcoming = [];
  for (const plant of plants) {
    const windows = plantWindows(plant, zone, today);
    const active = windows.filter(w => w.start <= today && w.end >= today).sort((a,b) => a.end-b.end);
    if (active.length) current.push({ ...plant, ...active[0] });
    windows.filter(w => w.start > today && w.start <= horizon).forEach(w => upcoming.push({ ...plant, ...w }));
  }
  current.sort((a,b) => a.end-b.end || (a.days_to_maturity || 999)-(b.days_to_maturity || 999));
  upcoming.sort((a,b) => a.start-b.start || a.name.localeCompare(b.name));
  return { current, upcoming };
}
export const windowLabel = (item) => `${format(item.start, 'MMM d')} – ${format(item.end, 'MMM d')}`;