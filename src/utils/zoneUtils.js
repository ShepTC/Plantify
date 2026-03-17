/**
 * Case-insensitive zone matching utility.
 * Normalizes both zone strings to lowercase before comparing.
 * Also handles short zone matching (e.g. "7" matches "7a" or "7b").
 */
export const zoneMatch = (zoneA, zoneB) => {
  if (!zoneA || !zoneB) return false;
  const a = zoneA.toString().trim().toLowerCase();
  const b = zoneB.toString().trim().toLowerCase();
  return a === b;
};

/**
 * Find a zone entry from an array of zone objects, case-insensitively.
 * Also tries matching the short zone (without trailing letter) as fallback.
 */
export const findZone = (zonesArray, userZone) => {
  if (!zonesArray || !Array.isArray(zonesArray) || !userZone) return null;
  const normalizedUser = userZone.toString().trim().toLowerCase();
  const shortZone = normalizedUser.replace(/[ab]$/, '');

  return zonesArray.find(z => {
    if (!z?.zone) return false;
    const normalized = z.zone.toString().trim().toLowerCase();
    return normalized === normalizedUser || normalized === shortZone;
  }) || null;
};