// Pantify freemium model.
// Core planting (see what to plant, add plants, browse the library) is FREE and unlimited.
// Plantify Pro unlocks the power features: reminders, calendar sync, full season plan, AI tools.

export const FREE_COMING_UP_PREVIEW = 1;

export const isPro = (user) => !!user?.is_premium;

// Adding plants is unlimited for everyone.
export const getRemainingAdds = () => Infinity;
export const canAddPlant = () => true;

export const canUseReminders = (user) => isPro(user);