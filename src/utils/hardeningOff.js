import { addDays, format } from 'date-fns';
import { findZone } from './zoneUtils';

/**
 * Parse the start date of a date_range string like "Jun 17-Jul 1".
 * Returns a Date for the given year, or null if unparseable.
 */
const parseRangeStart = (dateRange, year) => {
  if (!dateRange) return null;
  const startPart = String(dateRange).split('-')[0].trim();
  const d = new Date(`${startPart} ${year}`);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Derive the hardening-off window for a plant in a given USDA zone.
 *
 * Hardening off begins 10 days before the transplant_indoor date_range start
 * (the date the seedling should be moved out to the garden) and ends on that
 * transplant date. Returns null when the plant has no transplant_indoor entry
 * for the zone — direct-sow-only crops get no hardening-off step.
 */
export const getHardeningOffWindow = (plant, userZone) => {
  if (!plant || !userZone) return null;
  const entry = findZone(plant.transplant_indoor, userZone);
  if (!entry || !entry.date_range) return null;

  const year = new Date().getFullYear();
  let transplantDate = parseRangeStart(entry.date_range, year);
  if (!transplantDate) return null;

  // If the transplant date already passed this year, roll forward to next year
  // so reminders land in the future.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (transplantDate < today) {
    transplantDate = parseRangeStart(entry.date_range, year + 1);
    if (!transplantDate) return null;
  }

  const start = addDays(transplantDate, -10);
  return {
    start,
    end: transplantDate,
    transplantDate,
    dateRangeStr: `${format(start, 'MMM d')} – ${format(transplantDate, 'MMM d')}`,
    transplantDateStr: format(transplantDate, 'MMM d'),
  };
};

/**
 * Get the "start seeds indoors" date range string for a plant in a zone, if any.
 */
export const getStartSeedsIndoorStr = (plant, userZone) => {
  if (!plant || !userZone) return null;
  const entry = findZone(plant.start_seeds_indoor, userZone);
  return entry?.date_range || null;
};