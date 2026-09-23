// Shared planting-window helpers used by Today, Garden and the legacy PlantingAlerts page.
import { findZone } from './zoneUtils';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Week number matching the app's existing convention.
export const getCurrentWeek = (date = new Date()) => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  return Math.ceil((date.getTime() - startOfYear.getTime()) / WEEK_MS);
};

// Calendar date for the start of a week number, rolling into next year when it wrapped.
export const weekToDate = (week, currentWeek = getCurrentWeek()) => {
  const now = new Date();
  const year = week < currentWeek - 26 ? now.getFullYear() + 1 : now.getFullYear();
  return new Date(year, 0, 1 + (week - 1) * 7);
};

// Weeks from currentWeek until targetWeek (0-51, wraps across year-end).
export const weeksUntil = (targetWeek, currentWeek) => (((targetWeek - currentWeek) % 52) + 52) % 52;

export const isWeekInWindow = (currentWeek, startWeek, endWeek) => {
  if (startWeek == null || endWeek == null) return false;
  if (startWeek <= endWeek) {
    return currentWeek >= startWeek && currentWeek <= endWeek;
  }
  // Wrap-around (e.g. a fall window that crosses year-end)
  return currentWeek >= startWeek || currentWeek <= endWeek;
};

// "Jul 8-Aug 12" → { start, end } week numbers (null when unparseable).
const rangeToWeeks = (range) => {
  const [a, b] = String(range).split('-').map((s) => s.trim());
  if (!a || !b) return null;
  const year = new Date().getFullYear();
  const endStr = /^\d+$/.test(b) ? `${a.split(' ')[0]} ${b}` : b;
  const d1 = new Date(`${a} ${year}`);
  const d2 = new Date(`${endStr} ${year}`);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;
  return { start: getCurrentWeek(d1), end: getCurrentWeek(d2) };
};

// All planting windows (indoor seed start + outdoor sow/transplant) for a plant in a zone.
const getWindows = (plant, userZone) => {
  const out = [];
  const si = findZone(plant.start_seeds_indoor, userZone);
  const siWeeks = si?.date_range ? rangeToWeeks(si.date_range) : null;
  if (siWeeks) out.push({ method: 'indoor', methodLabel: 'Start Indoors', season: siWeeks.start < 27 ? 'Spring' : 'Fall', ...siWeeks });
  const ds = findZone(plant.direct_sow_zones, userZone);
  const tx = findZone(plant.transplant_outdoor_zones, userZone);
  const push = (z, method, methodLabel) => {
    if (!z) return;
    out.push({ method, methodLabel, season: 'Spring', start: z.spring_start_week, end: z.spring_end_week });
    out.push({ method, methodLabel, season: 'Fall', start: z.fall_start_week, end: z.fall_end_week });
  };
  push(ds, 'direct_sow', 'Direct Sow');
  push(tx, 'transplant', 'Transplant');
  return out.filter((w) => w.start != null && w.end != null);
};

export const isPlantableToday = (plant, userZone, currentWeek) =>
  getWindows(plant, userZone).some((w) => isWeekInWindow(currentWeek, w.start, w.end));

// Next window that opens after this week (null when none).
export const nextWindowStart = (plant, userZone, currentWeek) => {
  let best = null;
  getWindows(plant, userZone).forEach((w) => {
    const away = weeksUntil(w.start, currentWeek);
    if (away < 1) return;
    if (!best || away < best.weeksAway) best = { ...w, weeksAway: away };
  });
  return best;
};

// Returns { plantsForToday, plantsByCategory } where each plant carries
// plantingMethod, methodLabel, season and windowEndWeek.
export const computePlantableToday = (allPlants, userZone, currentWeek, excludeIds = new Set()) => {
  const plantsForToday = [];
  const byCategory = {
    vegetables: [], fruits: [], herbs: [], flowers: [], grains: [],
    direct_sow: [], transplant: [],
  };

  allPlants.forEach((plant) => {
    if (excludeIds.has(plant.id)) return;
    getWindows(plant, userZone).forEach((w) => {
      if (!isWeekInWindow(currentWeek, w.start, w.end)) return;
      if (plantsForToday.some((p) => p.id === plant.id && p.plantingMethod === w.method)) return;
      const p = { ...plant, plantingMethod: w.method, methodLabel: w.methodLabel, season: w.season, windowEndWeek: w.end };
      plantsForToday.push(p);
      if (byCategory[w.method] && byCategory[w.method].length < 6) byCategory[w.method].push(p);
      if (byCategory[plant.category] && byCategory[plant.category].length < 6) byCategory[plant.category].push(p);
    });
  });

  return { plantsForToday, plantsByCategory: byCategory };
};

// Plants whose next window opens within `horizon` weeks, soonest first.
export const computeComingUp = (allPlants, userZone, currentWeek, horizon = 51) => {
  const items = [];
  allPlants.forEach((plant) => {
    if (isPlantableToday(plant, userZone, currentWeek)) return;
    const next = nextWindowStart(plant, userZone, currentWeek);
    if (!next || next.weeksAway > horizon) return;
    items.push({ ...plant, weeksAway: next.weeksAway, methodLabel: next.methodLabel, startDate: weekToDate(next.start, currentWeek) });
  });
  return items.sort((a, b) => a.weeksAway - b.weeksAway || a.name.localeCompare(b.name));
};