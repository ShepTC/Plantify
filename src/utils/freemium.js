// Core planting is free. Pro gates reminders, season planning and AI tools.
// Legacy count exports remain for older screens; additions are unlimited.

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
export const getRemainingAdds = () => Infinity;

// Whether the user may add another plant right now.
export const canAddPlant = (user) => !!user;