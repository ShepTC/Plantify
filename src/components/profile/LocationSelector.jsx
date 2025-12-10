import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, GeoJSON } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { MapPin, ChevronsUpDown, Check } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet - use CDN URLs
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
});

// USDA Zone boundaries (expanded and more detailed for demonstration)
const ZONE_DATA = {
  // Zone 0: below -60°F
  "0a": { minTemp: -60, maxTemp: -55, color: "#1E0D43" }, // Very dark purple
  "0b": { minTemp: -55, maxTemp: -50, color: "#2D1460" }, // Darker purple
  // Zone 1: -60 to -50°F
  "1a": { minTemp: -50, maxTemp: -45, color: "#3D1B7D" }, // Dark purple
  "1b": { minTemp: -45, maxTemp: -40, color: "#4D229A" }, // Purple
  // Zone 2: -50 to -40°F
  "2a": { minTemp: -40, maxTemp: -35, color: "#5C29B7" }, // Lighter purple
  "2b": { minTemp: -35, maxTemp: -30, color: "#6C30D4" }, // Lavender
  // Zone 3: -40 to -30°F
  "3a": { minTemp: -30, maxTemp: -25, color: "#7B37F1" }, // Bright purple
  "3b": { minTemp: -25, maxTemp: -20, color: "#8B3EFF" }, // Light violet
  // Zone 4: -30 to -20°F
  "4a": { minTemp: -20, maxTemp: -15, color: "#9A45FF" }, // Indigo
  "4b": { minTemp: -15, maxTemp: -10, color: "#AA4CFF" }, // Lighter indigo
  // Zone 5: -20 to -10°F
  "5a": { minTemp: -20, maxTemp: -15, color: "#4A90E2" },
  "5b": { minTemp: -15, maxTemp: -10, color: "#5BA0F2" },
  // Zone 6: -10 to 0°F
  "6a": { minTemp: -10, maxTemp: -5, color: "#7CB0FF" },
  "6b": { minTemp: -5, maxTemp: 0, color: "#9CC0FF" },
  // Zone 7: 0 to 10°F
  "7a": { minTemp: 0, maxTemp: 5, color: "#BCD0FF" },
  "7b": { minTemp: 5, maxTemp: 10, color: "#DCE0FF" },
  // Zone 8: 10 to 20°F
  "8a": { minTemp: 10, maxTemp: 15, color: "#FFE0DC" },
  "8b": { minTemp: 15, maxTemp: 20, color: "#FFC0BC" },
  // Zone 9: 20 to 30°F
  "9a": { minTemp: 20, maxTemp: 25, color: "#FFA09C" },
  "9b": { minTemp: 25, maxTemp: 30, color: "#FF807C" },
  // Zone 10: 30 to 40°F
  "10a": { minTemp: 30, maxTemp: 35, color: "#FF605C" }, // Orange-red
  "10b": { minTemp: 35, maxTemp: 40, color: "#FF403C" }, // Red
  // Zone 11: 40 to 50°F
  "11a": { minTemp: 40, maxTemp: 45, color: "#FF201C" }, // Darker Red
  "11b": { minTemp: 45, maxTemp: 50, color: "#FF0000" }, // Bright Red
  // Zone 12: 50 to 60°F (or above)
  "12a": { minTemp: 50, maxTemp: 55, color: "#E00000" }, // Deep Red
  "12b": { minTemp: 55, maxTemp: 60, color: "#C00000" } // Darkest Red
};

// NEW: Comprehensive, approximated global GeoJSON data for USDA-style zones.
// This is a large, simulated dataset to provide global coverage without an API.
const geoJsonData = {
  "type": "FeatureCollection",
  "features": [
  // --- NORTH AMERICA ---
  { "type": "Feature", "properties": { "zone": "0" }, "geometry": { "type": "Polygon", "coordinates": [[[-140, 70], [-140, 85], [-60, 85], [-60, 70], [-140, 70]]] } },
  { "type": "Feature", "properties": { "zone": "1" }, "geometry": { "type": "Polygon", "coordinates": [[[-165, 65], [-165, 70], [-60, 70], [-60, 65], [-165, 65]]] } },
  { "type": "Feature", "properties": { "zone": "2" }, "geometry": { "type": "Polygon", "coordinates": [[[-165, 60], [-165, 65], [-60, 65], [-60, 60], [-165, 60]]] } },
  { "type": "Feature", "properties": { "zone": "3" }, "geometry": { "type": "Polygon", "coordinates": [[[-140, 55], [-140, 60], [-55, 60], [-55, 55], [-140, 55]]] } },
  { "type": "Feature", "properties": { "zone": "4" }, "geometry": { "type": "Polygon", "coordinates": [[[-130, 48], [-130, 55], [-60, 55], [-60, 48], [-130, 48]]] } },
  { "type": "Feature", "properties": { "zone": "5" }, "geometry": { "type": "Polygon", "coordinates": [[[-125, 42], [-125, 48], [-65, 48], [-65, 42], [-125, 42]]] } },
  { "type": "Feature", "properties": { "zone": "6" }, "geometry": { "type": "Polygon", "coordinates": [[[-123, 38], [-123, 42], [-70, 42], [-70, 38], [-123, 38]]] } },
  { "type": "Feature", "properties": { "zone": "7" }, "geometry": { "type": "Polygon", "coordinates": [[[-122, 35], [-122, 38], [-75, 38], [-75, 35], [-122, 35]]] } },
  { "type": "Feature", "properties": { "zone": "8" }, "geometry": { "type": "Polygon", "coordinates": [[[-122, 32], [-122, 35], [-78, 35], [-78, 32], [-122, 32]]] } },
  { "type": "Feature", "properties": { "zone": "9" }, "geometry": { "type": "Polygon", "coordinates": [[[-120, 28], [-120, 32], [-80, 32], [-80, 28], [-120, 28]]] } },
  { "type": "Feature", "properties": { "zone": "10" }, "geometry": { "type": "Polygon", "coordinates": [[[-118, 24], [-118, 28], [-80, 28], [-80, 24], [-118, 24]]] } },
  { "type": "Feature", "properties": { "zone": "11" }, "geometry": { "type": "Polygon", "coordinates": [[[-110, 15], [-110, 24], [-82, 24], [-82, 15], [-110, 15]]] } },
  { "type": "Feature", "properties": { "zone": "12" }, "geometry": { "type": "Polygon", "coordinates": [[[-105, 8], [-105, 15], [-85, 15], [-85, 8], [-105, 8]]] } },
  // Greenland
  { "type": "Feature", "properties": { "zone": "0" }, "geometry": { "type": "Polygon", "coordinates": [[[-70, 60], [-70, 84], [-20, 84], [-20, 60], [-70, 60]]] } },

  // --- SOUTH AMERICA ---
  { "type": "Feature", "properties": { "zone": "12" }, "geometry": { "type": "Polygon", "coordinates": [[[-82, 12], [-82, -5], [-35, -5], [-35, 12], [-82, 12]]] } },
  { "type": "Feature", "properties": { "zone": "11" }, "geometry": { "type": "Polygon", "coordinates": [[[-75, -5], [-75, -15], [-35, -15], [-35, -5], [-75, -5]]] } },
  { "type": "Feature", "properties": { "zone": "10" }, "geometry": { "type": "Polygon", "coordinates": [[[-70, -15], [-70, -25], [-40, -25], [-40, -15], [-70, -15]]] } },
  { "type": "Feature", "properties": { "zone": "9" }, "geometry": { "type": "Polygon", "coordinates": [[[-72, -25], [-72, -35], [-50, -35], [-50, -25], [-72, -25]]] } },
  { "type": "Feature", "properties": { "zone": "8" }, "geometry": { "type": "Polygon", "coordinates": [[[-75, -35], [-75, -45], [-60, -45], [-60, -35], [-75, -35]]] } },
  { "type": "Feature", "properties": { "zone": "7" }, "geometry": { "type": "Polygon", "coordinates": [[[-75, -45], [-75, -56], [-65, -56], [-65, -45], [-75, -45]]] } },

  // --- EUROPE ---
  { "type": "Feature", "properties": { "zone": "3" }, "geometry": { "type": "Polygon", "coordinates": [[[5, 68], [45, 68], [45, 72], [5, 72], [5, 68]]] } },
  { "type": "Feature", "properties": { "zone": "4" }, "geometry": { "type": "Polygon", "coordinates": [[[5, 62], [40, 62], [40, 68], [5, 68], [5, 62]]] } },
  { "type": "Feature", "properties": { "zone": "5" }, "geometry": { "type": "Polygon", "coordinates": [[[-8, 58], [35, 58], [35, 62], [-8, 62], [-8, 58]]] } },
  { "type": "Feature", "properties": { "zone": "6" }, "geometry": { "type": "Polygon", "coordinates": [[[-10, 52], [30, 52], [30, 58], [-10, 58], [-10, 52]]] } },
  { "type": "Feature", "properties": { "zone": "7" }, "geometry": { "type": "Polygon", "coordinates": [[[-10, 48], [25, 48], [25, 52], [-10, 52], [-10, 48]]] } },
  { "type": "Feature", "properties": { "zone": "8" }, "geometry": { "type": "Polygon", "coordinates": [[[-10, 43], [35, 43], [35, 48], [-10, 48], [-10, 43]]] } },
  { "type": "Feature", "properties": { "zone": "9" }, "geometry": { "type": "Polygon", "coordinates": [[[-10, 38], [40, 38], [40, 43], [-10, 43], [-10, 38]]] } },
  { "type": "Feature", "properties": { "zone": "10" }, "geometry": { "type": "Polygon", "coordinates": [[[-8, 35], [38, 35], [38, 38], [-8, 38], [-8, 35]]] } },

  // --- AFRICA ---
  { "type": "Feature", "properties": { "zone": "12" }, "geometry": { "type": "Polygon", "coordinates": [[[-18, 10], [52, 10], [52, -10], [-18, -10], [-18, 10]]] } },
  { "type": "Feature", "properties": { "zone": "11" }, "geometry": { "type": "Polygon", "coordinates": [[[-18, 18], [50, 18], [50, 10], [-18, 10], [-18, 18]]] } },
  { "type": "Feature", "properties": { "zone": "11" }, "geometry": { "type": "Polygon", "coordinates": [[[-15, -10], [50, -10], [50, -20], [-15, -20], [-15, -10]]] } },
  { "type": "Feature", "properties": { "zone": "10" }, "geometry": { "type": "Polygon", "coordinates": [[[-20, 28], [40, 28], [40, 18], [-20, 18], [-20, 28]]] } },
  { "type": "Feature", "properties": { "zone": "10" }, "geometry": { "type": "Polygon", "coordinates": [[[10, -20], [45, -20], [45, -30], [10, -30], [10, -20]]] } },
  { "type": "Feature", "properties": { "zone": "9" }, "geometry": { "type": "Polygon", "coordinates": [[[-10, 37], [38, 37], [38, 28], [-10, 28], [-10, 37]]] } },
  { "type": "Feature", "properties": { "zone": "9" }, "geometry": { "type": "Polygon", "coordinates": [[[15, -30], [35, -30], [35, -35], [15, -35], [15, -30]]] } },

  // --- ASIA ---
  { "type": "Feature", "properties": { "zone": "1" }, "geometry": { "type": "Polygon", "coordinates": [[[60, 75], [180, 75], [180, 85], [60, 85], [60, 75]]] } },
  { "type": "Feature", "properties": { "zone": "2" }, "geometry": { "type": "Polygon", "coordinates": [[[60, 68], [180, 68], [180, 75], [60, 75], [60, 68]]] } },
  { "type": "Feature", "properties": { "zone": "3" }, "geometry": { "type": "Polygon", "coordinates": [[[50, 60], [140, 60], [140, 68], [50, 68], [50, 60]]] } },
  { "type": "Feature", "properties": { "zone": "4" }, "geometry": { "type": "Polygon", "coordinates": [[[50, 50], [140, 50], [140, 60], [50, 60], [50, 50]]] } },
  { "type": "Feature", "properties": { "zone": "5" }, "geometry": { "type": "Polygon", "coordinates": [[[50, 40], [135, 40], [135, 50], [50, 50], [50, 40]]] } },
  { "type": "Feature", "properties": { "zone": "6" }, "geometry": { "type": "Polygon", "coordinates": [[[60, 35], [140, 35], [140, 40], [60, 40], [60, 35]]] } },
  { "type": "Feature", "properties": { "zone": "7" }, "geometry": { "type": "Polygon", "coordinates": [[[70, 30], [145, 30], [145, 35], [70, 35], [70, 30]]] } },
  { "type": "Feature", "properties": { "zone": "8" }, "geometry": { "type": "Polygon", "coordinates": [[[70, 25], [130, 25], [130, 30], [70, 30], [70, 25]]] } },
  { "type": "Feature", "properties": { "zone": "9" }, "geometry": { "type": "Polygon", "coordinates": [[[60, 20], [125, 20], [125, 25], [60, 25], [60, 20]]] } },
  { "type": "Feature", "properties": { "zone": "10" }, "geometry": { "type": "Polygon", "coordinates": [[[65, 10], [140, 10], [140, 20], [65, 20], [65, 10]]] } },
  { "type": "Feature", "properties": { "zone": "11" }, "geometry": { "type": "Polygon", "coordinates": [[[95, 0], [150, 0], [150, 10], [95, 10], [95, 0]]] } },
  { "type": "Feature", "properties": { "zone": "12" }, "geometry": { "type": "Polygon", "coordinates": [[[95, -10], [150, -10], [150, 0], [95, 0], [95, -10]]] } },
  // Middle East
  { "type": "Feature", "properties": { "zone": "8" }, "geometry": { "type": "Polygon", "coordinates": [[[35, 30], [60, 30], [60, 40], [35, 40], [35, 30]]] } },
  { "type": "Feature", "properties": { "zone": "9" }, "geometry": { "type": "Polygon", "coordinates": [[[35, 20], [60, 20], [60, 30], [35, 30], [35, 20]]] } },
  { "type": "Feature", "properties": { "zone": "10" }, "geometry": { "type": "Polygon", "coordinates": [[[40, 12], [60, 12], [60, 20], [40, 20], [40, 12]]] } },

  // --- AUSTRALIA & OCEANIA ---
  { "type": "Feature", "properties": { "zone": "12" }, "geometry": { "type": "Polygon", "coordinates": [[[110, -10], [155, -10], [155, -20], [110, -20], [110, -10]]] } },
  { "type": "Feature", "properties": { "zone": "11" }, "geometry": { "type": "Polygon", "coordinates": [[[110, -20], [155, -20], [155, -28], [110, -28], [110, -20]]] } },
  { "type": "Feature", "properties": { "zone": "10" }, "geometry": { "type": "Polygon", "coordinates": [[[112, -28], [155, -28], [155, -35], [112, -35], [112, -28]]] } },
  { "type": "Feature", "properties": { "zone": "9" }, "geometry": { "type": "Polygon", "coordinates": [[[115, -35], [155, -35], [155, -40], [115, -40], [115, -35]]] } },
  { "type": "Feature", "properties": { "zone": "8" }, "geometry": { "type": "Polygon", "coordinates": [[[144, -40], [148, -40], [148, -44], [144, -44], [144, -40]]] } }, // Tasmania
  // New Zealand
  { "type": "Feature", "properties": { "zone": "8" }, "geometry": { "type": "Polygon", "coordinates": [[[166, -47], [174, -47], [174, -43], [166, -43], [166, -47]]] } },
  { "type": "Feature", "properties": { "zone": "9" }, "geometry": { "type": "Polygon", "coordinates": [[[168, -43], [179, -43], [179, -38], [168, -38], [168, -43]]] } },
  { "type": "Feature", "properties": { "zone": "10" }, "geometry": { "type": "Polygon", "coordinates": [[[172, -38], [178, -38], [178, -34], [172, -34], [172, -38]]] } },

  // --- ANTARCTICA ---
  { "type": "Feature", "properties": { "zone": "0" }, "geometry": { "type": "Polygon", "coordinates": [[[-180, -60], [180, -60], [180, -90], [-180, -90], [-180, -60]]] } }]

};


const zoneColors = {
  "0": "rgba(30, 10, 70, 0.4)", // Deepest Purple
  "1": "rgba(60, 20, 120, 0.4)", // Dark Purple
  "2": "rgba(90, 30, 170, 0.4)", // Purple
  "3": "rgba(120, 40, 220, 0.4)", // Light Purple
  "4": "rgba(150, 50, 255, 0.4)", // Lavender
  "5": "rgba(56, 182, 255, 0.4)",
  "6": "rgba(56, 255, 201, 0.4)",
  "7": "rgba(152, 255, 56, 0.4)",
  "8": "rgba(255, 239, 56, 0.4)",
  "9": "rgba(255, 148, 56, 0.4)",
  "10": "rgba(255, 56, 56, 0.4)",
  "11": "rgba(200, 0, 0, 0.4)", // Darker Red
  "12": "rgba(150, 0, 0, 0.4)" // Deep Red
};

function getZoneStyle(feature) {
  return {
    fillColor: zoneColors[feature.properties.zone] || "rgba(0,0,0,0.4)",
    weight: 1,
    opacity: 1,
    color: 'rgba(255,255,255,0.5)',
    fillOpacity: 0.5
  };
}

function LocationMarker({ position, onLocationSelect }) {
  const [markerPosition, setMarkerPosition] = useState(position);

  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setMarkerPosition(newPos);
      onLocationSelect(newPos);
    }
  });

  return markerPosition ?
  <Marker position={markerPosition}>
      <Popup>
        <div className="text-center">
          <p className="font-medium text-forest-dark mb-2">Selected Location</p>
          <p className="text-sm text-accent-green">
            {markerPosition[0].toFixed(4)}, {markerPosition[1].toFixed(4)}
          </p>
        </div>
      </Popup>
    </Marker> :
  null;
}

// Helper to check if point is inside a single ring (ray casting algorithm)
function pointInRing(point, ring) {
  const x = point[0], y = point[1];
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Check if point is in polygon (handles exterior ring and holes)
function pointInPolygon(point, polygonCoords) {
  // Must be inside exterior ring
  if (!pointInRing(point, polygonCoords[0])) {
    return false;
  }
  // Must not be inside any hole
  for (let i = 1; i < polygonCoords.length; i++) {
    if (pointInRing(point, polygonCoords[i])) {
      return false;
    }
  }
  return true;
}

function getZoneForLocation(lat, lng) {
  const point = [lng, lat]; // GeoJSON uses [longitude, latitude]
  
  for (const feature of geoJsonData.features) {
    const geometry = feature.geometry;

    if (geometry.type === 'Polygon') {
      if (pointInPolygon(point, geometry.coordinates)) {
        return feature.properties.zone;
      }
    } else if (geometry.type === 'MultiPolygon') {
      for (const polygonCoords of geometry.coordinates) {
        if (pointInPolygon(point, polygonCoords)) {
          return feature.properties.zone;
        }
      }
    }
  }
  return null;
}

export default function LocationSelector({ currentLocation, onLocationChange }) {
  const [selectedPosition, setSelectedPosition] = useState(
    currentLocation?.latitude && currentLocation?.longitude ?
    [currentLocation.latitude, currentLocation.longitude] :
    [39.8283, -98.5795] // Center of USA
  );
  const [detectedZone, setDetectedZone] = useState(null);
  const [manualZone, setManualZone] = useState(null);
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'light');
  const [isZonePickerOpen, setIsZonePickerOpen] = useState(false);

  useEffect(() => {
    // Listener for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          setTheme(document.documentElement.getAttribute('data-theme') || 'light');
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (selectedPosition) {
      const detected = detectZone(selectedPosition[0], selectedPosition[1]);
      const locationData = {
        city: "Custom Location", state: "", country: "",
        latitude: selectedPosition[0], longitude: selectedPosition[1]
      };
      // When position changes, update parent with current zone (manual override respected)
      onLocationChange(locationData, manualZone || detected);
    }
  }, [selectedPosition, manualZone]); // Added manualZone to dependencies to trigger re-render of parent

  const detectZone = (lat, lng) => {
    const zone = getZoneForLocation(lat, lng);
    // Add a or b for more granular feel, default to 7b if not found
    // The 'a'/'b' assignment here is arbitrary and not based on real data, just for demonstration
    // It alternates 'a' and 'b' based on latitude parity, which is a simplification.
    const fullZone = zone ? `${zone}${lat % 2 > 0.5 ? 'a' : 'b'}` : '7b';
    setDetectedZone(fullZone);
    return fullZone;
  };

  const handleMapClick = (position) => {
    setSelectedPosition(position);
    // The useEffect for selectedPosition will handle onLocationChange and zone detection
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = [position.coords.latitude, position.coords.longitude];
          setSelectedPosition(newPos);
          // The useEffect for selectedPosition will handle onLocationChange and zone detection
        },
        (error) => {
          console.error("Error getting current location:", error);
        }
      );
    }
  };

  const handleZoneChange = (newZone) => {
    setManualZone(newZone);

    // Update the parent component with the new manually selected zone
    if (selectedPosition) {
      const locationData = {
        city: currentLocation?.city || "Custom Location",
        state: currentLocation?.state || "",
        country: currentLocation?.country || "",
        latitude: selectedPosition[0],
        longitude: selectedPosition[1]
      };
      onLocationChange(locationData, newZone);
    }
  };

  const getAllZones = () => {
    const zones = [];
    for (let i = 0; i <= 12; i++) {
      if (ZONE_DATA[`${i}a`]) zones.push(`${i}a`);
      if (ZONE_DATA[`${i}b`]) zones.push(`${i}b`);
    }
    return zones.sort((a, b) => {
      const numA = parseInt(a);
      const charA = a.slice(-1);
      const numB = parseInt(b);
      const charB = b.slice(-1);

      if (numA === numB) {
        return charA.localeCompare(charB);
      }
      return numA - numB;
    });
  };

  const getZoneDisplayColor = (zone) => {
    if (!zone) return '#64748b'; // muted-foreground color
    const zoneNumber = parseInt(zone);
    const colors = [
    '#581c87', '#6d28d9', '#4f46e5', '#2563eb', '#0284c7',
    '#059669', '#16a34a', '#ca8a04', '#ea580c', '#dc2626', '#be123c', '#881337', '#7f1d1d'];

    return colors[Math.min(zoneNumber, colors.length - 1)];
  };

  const mapTileUrls = {
    light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
  };

  const mapAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  const currentZone = manualZone || detectedZone;

  return (
    <div className="space-y-4">
      {/* Current Location Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={handleCurrentLocation}
          className="flex items-center gap-2 px-4 py-2">

          <MapPin className="w-4 h-4" />
          Use My Current Location
        </Button>
      </div>

      {/* Map */}
      <Card className="overflow-hidden border-border">
        <CardContent className="p-0">
          <div className="relative w-full h-[200px] md:h-[300px] overflow-hidden rounded-lg">
            <div className="absolute inset-0 z-10">
              <MapContainer
                center={selectedPosition}
                zoom={4}
                style={{ height: "100%", width: "100%", zIndex: 1 }}
                key={`${selectedPosition[0]}-${selectedPosition[1]}-${theme}`}
                zoomControl={true}
                scrollWheelZoom={false}
                doubleClickZoom={true}
                dragging={true}
                className="leaflet-container">

                <TileLayer url={mapTileUrls[theme]} attribution={mapAttribution} />
                <GeoJSON data={geoJsonData} style={getZoneStyle} />
                <LocationMarker
                  position={selectedPosition}
                  onLocationSelect={handleMapClick} />

              </MapContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Combined Zone & Location Card */}
      <div className="bg-muted/40 border-border rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 gap-3 sm:gap-4">
          <div className="flex-1 min-w-0 w-full sm:w-auto">
               <p className="font-medium text-foreground text-sm md:text-base truncate">
                  {currentLocation?.city && currentLocation.city !== "Custom Location" ? `${currentLocation.city}, ${currentLocation.country}` : 'Selected Location'}
               </p>
               <p className="text-xs text-muted-foreground">
                  {manualZone ? 'Manual Zone Override' : 'Auto-Detected Growing Zone'}
               </p>
          </div>
          <div className="flex-shrink-0 w-full sm:w-auto">
              <Popover open={isZonePickerOpen} onOpenChange={setIsZonePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                variant="outline"
                role="combobox"
                aria-expanded={isZonePickerOpen}
                className="w-full sm:w-[160px] justify-between bg-background">

                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getZoneDisplayColor(currentZone) }} />
                        <span>Zone {currentZone || 'N/A'}</span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="bg-popover text-popover-foreground mx-5 p-0 rounded-md border shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 w-[calc(100vw-2rem)] sm:w-[300px] z-50"

            align="end"
            side="bottom">

                  <Command>
                    {/* <CommandInput placeholder="Search zone..." />  -- Removed as per request */}
                    <CommandList>
                      <CommandEmpty>No zone found.</CommandEmpty>
                      {detectedZone && !manualZone &&
                  <CommandGroup heading="Detected Zone">
                            <CommandItem
                      key={`detected-${detectedZone}`}
                      value={detectedZone}
                      onSelect={(value) => {
                        handleZoneChange(value);
                        setIsZonePickerOpen(false);
                      }}>

                                <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          currentZone === detectedZone ? "opacity-100" : "opacity-0"
                        )} />

                                <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: getZoneDisplayColor(detectedZone) }} />
                                Zone {detectedZone} (Detected)
                                <span className="text-muted-foreground text-xs ml-auto">({ZONE_DATA[detectedZone]?.minTemp}°F to {ZONE_DATA[detectedZone]?.maxTemp}°F)</span>
                            </CommandItem>
                        </CommandGroup>
                  }
                      <CommandGroup heading="All Zones">
                        {getAllZones().map((zone) =>
                    <CommandItem
                      key={zone}
                      value={zone}
                      onSelect={(value) => {
                        handleZoneChange(value);
                        setIsZonePickerOpen(false);
                      }}>

                            <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          currentZone === zone ? "opacity-100" : "opacity-0"
                        )} />

                            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: getZoneDisplayColor(zone) }} />
                            Zone {zone}
                            <span className="text-muted-foreground text-xs ml-auto">({ZONE_DATA[zone]?.minTemp}°F to {ZONE_DATA[zone]?.maxTemp}°F)</span>
                          </CommandItem>
                    )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
          </div>
      </div>

      <p className="text-xs text-muted-foreground text-center px-2">
        Click on the map to select your exact location. You can override the detected zone using the dropdown above.
      </p>
    </div>);

}