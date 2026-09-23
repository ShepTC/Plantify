// Freemium planting limits for Pantify.
// Free users can add a limited number of plants per week; premium is unlimited.

export const FREE_WEEKLY_ADD_LIMIT = 3;

// Week number matching the app's existing convention (used across Dashboard/PlantingAlerts).
const weekOf = (date) => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  return Math.ceil((date.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000));
};

// Count how many UserPlant records were created in the current week.
export const countAddsThisWeek = (userPlants = []) => {
  const currentWeek = weekOf(new Date());
  return userPlants.filter((p) => {
    if (!p.created_date) return false;
    return weekOf(new Date(p.created_date)) === currentWeek;
  }).length;
};

// Infinity for premium, otherwise the remaining free adds this week (floored at 0).
export const getRemainingAdds = (user, userPlants = []) => {
  if (user?.is_premium) return Infinity;
  return Math.max(0, FREE_WEEKLY_ADD_LIMIT - countAddsThisWeek(userPlants));
};

// Whether the user may add another plant right now.
export const canAddPlant = (user, userPlants = []) => {
  if (user?.is_premium) return true;
  return countAddsThisWeek(userPlants) < FREE_WEEKLY_ADD_LIMIT;
};