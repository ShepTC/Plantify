/**
 * Zone Data Utility
 *
 * Maps USDA zone strings (e.g. "7b") to their corresponding Base44 entity name.
 * To add more zones in the future, just add an entry to ZONE_ENTITY_MAP.
 */

import { base44 } from '@/api/base44Client';

// Maps lowercase zone key → Base44 entity name
export const ZONE_ENTITY_MAP = {
  '2a':  'PlantingZone2a',
  '2b':  'PlantingZone2b',
  '3a':  'PlantingZone3a',
  '3b':  'PlantingZone3b',
  '4a':  'PlantingZone4a',
  '4b':  'PlantingZone4b',
  '5a':  'PlantingZone5a',
  '5b':  'PlantingZone5b',
  '6a':  'PlantingZone6a',
  '6b':  'PlantingZone6b',
  '7a':  'PlantingZone7a',
  '7b':  'PlantingZone7b',
  '8a':  'PlantingZone8a',
  '8b':  'PlantingZone8b',
  '9a':  'PlantingZone9a',
  '9b':  'PlantingZone9b',
  '10a': 'PlantingZone10a',
  '10b': 'PlantingZone10b',
};

/**
 * Returns the entity name for a given zone string.
 * Input is normalized (trimmed, lowercased) before lookup.
 * Returns null if the zone is not supported.
 */
export function getZoneEntityName(zone) {
  if (!zone) return null;
  const key = zone.trim().toLowerCase();
  return ZONE_ENTITY_MAP[key] ?? null;
}

/**
 * Fetches all planting records for a given user zone.
 * Returns an empty array if the zone is not mapped or has no data.
 */
export async function fetchZonePlants(userZone) {
  const entityName = getZoneEntityName(userZone);
  if (!entityName) return [];
  return await base44.entities[entityName].list();
}

/**
 * Returns true if the given zone is supported.
 */
export function isSupportedZone(zone) {
  return getZoneEntityName(zone) !== null;
}

/**
 * Returns all supported zone keys in order.
 */
export const SUPPORTED_ZONES = Object.keys(ZONE_ENTITY_MAP);