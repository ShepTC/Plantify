import { base44 } from "@/api/base44Client";

/**
 * Maps a USDA zone string (e.g. "7b", "7B", " 7b ") to its entity name.
 * Returns null if the zone is not supported.
 * To add more zones: add to ZONE_ENTITY_MAP below.
 */
const ZONE_ENTITY_MAP = {
  "2a":  "PlantingZone2a",
  "2b":  "PlantingZone2b",
  "3a":  "PlantingZone3a",
  "3b":  "PlantingZone3b",
  "4a":  "PlantingZone4a",
  "4b":  "PlantingZone4b",
  "5a":  "PlantingZone5a",
  "5b":  "PlantingZone5b",
  "6a":  "PlantingZone6a",
  "6b":  "PlantingZone6b",
  "7a":  "PlantingZone7a",
  "7b":  "PlantingZone7b",
  "8a":  "PlantingZone8a",
  "8b":  "PlantingZone8b",
  "9a":  "PlantingZone9a",
  "9b":  "PlantingZone9b",
  "10a": "PlantingZone10a",
  "10b": "PlantingZone10b",
};

/**
 * Normalize a zone string to lowercase, trimmed key (e.g. " 7B " -> "7b").
 */
export function normalizeZone(zone) {
  if (!zone) return null;
  return zone.trim().toLowerCase();
}

/**
 * Get the entity name for a given USDA zone.
 * Returns null if the zone has no matching entity.
 */
export function getZoneEntityName(zone) {
  const key = normalizeZone(zone);
  return ZONE_ENTITY_MAP[key] || null;
}

/**
 * Fetch all planting records for a given USDA zone.
 * Returns an empty array if the zone is unsupported or has no data.
 */
export async function fetchZonePlants(zone) {
  const entityName = getZoneEntityName(zone);
  if (!entityName) return [];
  return await base44.entities[entityName].list();
}

/**
 * Returns all supported zone keys (e.g. ["2a", "2b", ... "10b"]).
 */
export function getSupportedZones() {
  return Object.keys(ZONE_ENTITY_MAP);
}