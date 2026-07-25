/**
 * Returns a growth stage for a UserPlant, used by the pixel-art renderer
 * to draw progressively taller sprites as the plant ages.
 *
 * Stages: 'seed' | 'sprout' | 'young' | 'mature' | 'harvested'
 */
export function getGrowthStage(userPlant, plantDataMap = {}) {
  if (!userPlant) return 'seed';
  const status = userPlant.status;
  if (status === 'planned') return 'seed';
  if (status === 'harvested') return 'harvested';
  if (status !== 'planted') return 'seed';

  // Look up days_to_maturity by plant_id, falling back to a name match.
  let maturity = plantDataMap[userPlant.plant_id]?.days_to_maturity;
  if (!maturity) {
    const name = (userPlant.plant_name || '').toLowerCase().trim();
    if (name) {
      const match = Object.values(plantDataMap).find(
        (p) => p && p.name && p.name.toLowerCase().trim() === name
      );
      maturity = match?.days_to_maturity;
    }
  }
  maturity = maturity || 60;

  const plantingDate = userPlant.actual_planting_date
    ? new Date(userPlant.actual_planting_date)
    : null;
  if (!plantingDate || isNaN(plantingDate.getTime())) return 'sprout';

  const now = new Date();
  const ageDays = Math.max(0, (now - plantingDate) / 86400000);
  const ratio = ageDays / maturity;

  if (ratio < 0.18) return 'sprout';
  if (ratio < 0.5) return 'young';
  return 'mature';
}