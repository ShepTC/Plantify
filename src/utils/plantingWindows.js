// Shared planting-window helpers (extracted from PlantingAlerts so the merged
// Home page and the legacy PlantingAlerts page use the same logic).
import { findZone } from './zoneUtils';

export const isWeekInWindow = (currentWeek, startWeek, endWeek) => {
  if (startWeek == null || endWeek == null) return false;
  if (startWeek <= endWeek) {
    return currentWeek >= startWeek && currentWeek <= endWeek;
  }
  // Wrap-around (e.g. a fall window that crosses year-end)
  return currentWeek >= startWeek || currentWeek <= endWeek;
};

export const isPlantableToday = (plant, userZone, currentWeek) => {
  if (plant.direct_sow_zones) {
    const dsZone = findZone(plant.direct_sow_zones, userZone);
    if (dsZone) {
      if (isWeekInWindow(currentWeek, dsZone.spring_start_week, dsZone.spring_end_week)) return true;
      if (isWeekInWindow(currentWeek, dsZone.fall_start_week, dsZone.fall_end_week)) return true;
    }
  }
  if (plant.transplant_outdoor_zones) {
    const txZone = findZone(plant.transplant_outdoor_zones, userZone);
    if (txZone) {
      if (isWeekInWindow(currentWeek, txZone.spring_start_week, txZone.spring_end_week)) return true;
      if (isWeekInWindow(currentWeek, txZone.fall_start_week, txZone.fall_end_week)) return true;
    }
  }
  return false;
};

// Returns { plantsForToday, plantsByCategory } where each plant carries
// plantingMethod ('direct_sow' | 'transplant'), methodLabel and season.
export const computePlantableToday = (allPlants, userZone, currentWeek, excludeIds = new Set()) => {
  const plantsForToday = [];
  const byCategory = {
    vegetables: [], fruits: [], herbs: [], flowers: [], grains: [],
    direct_sow: [], transplant: [],
  };

  allPlants.forEach((plant) => {
    if (excludeIds.has(plant.id)) return;

    if (plant.direct_sow_zones) {
      const dsZone = findZone(plant.direct_sow_zones, userZone);
      if (dsZone) {
        const inSpring = isWeekInWindow(currentWeek, dsZone.spring_start_week, dsZone.spring_end_week);
        const inFall = isWeekInWindow(currentWeek, dsZone.fall_start_week, dsZone.fall_end_week);
        if (inSpring || inFall) {
          const p = { ...plant, plantingMethod: 'direct_sow', methodLabel: 'Direct Sow', season: inFall ? 'Fall' : 'Spring' };
          plantsForToday.push(p);
          if (byCategory.direct_sow.length < 6) byCategory.direct_sow.push(p);
          if (byCategory[plant.category] && byCategory[plant.category].length < 6) byCategory[plant.category].push(p);
        }
      }
    }

    if (plant.transplant_outdoor_zones) {
      const txZone = findZone(plant.transplant_outdoor_zones, userZone);
      if (txZone) {
        const inSpring = isWeekInWindow(currentWeek, txZone.spring_start_week, txZone.spring_end_week);
        const inFall = isWeekInWindow(currentWeek, txZone.fall_start_week, txZone.fall_end_week);
        if (inSpring || inFall) {
          const p = { ...plant, plantingMethod: 'transplant', methodLabel: 'Transplant', season: inFall ? 'Fall' : 'Spring' };
          plantsForToday.push(p);
          if (byCategory.transplant.length < 6) byCategory.transplant.push(p);
          if (byCategory[plant.category] && byCategory[plant.category].length < 6) byCategory[plant.category].push(p);
        }
      }
    }
  });

  return { plantsForToday, plantsByCategory: byCategory };
};