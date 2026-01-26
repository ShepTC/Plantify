import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet - use CDN URLs
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
});

// NEW: Comprehensive, approximated global GeoJSON data for USDA-style zones.
// This is a large, simulated dataset to provide global coverage without an API.
const geoJsonData = {
  "type": "FeatureCollection",
  "features": [
    // --- NORTH AMERICA ---
    { "type": "Feature", "properties": { "zone": "0" }, "geometry": { "type": "Polygon", "coordinates": [[[-140, 70], [-140, 85], [-60, 85], [-60, 70], [-140, 70]]] }},
    { "type": "Feature", "properties": { "zone": "1" }, "geometry": { "type": "Polygon", "coordinates": [[[-165, 65], [-165, 70], [-60, 70], [-60, 65], [-165, 65]]] }},
    { "type": "Feature", "properties": { "zone": "2" }, "geometry": { "type": "Polygon", "coordinates": [[[-165, 60], [-165, 65], [-60, 65], [-60, 60], [-165, 60]]] }},
    { "type": "Feature", "properties": { "zone": "3" }, "geometry": { "type": "Polygon", "coordinates": [[[-140, 55], [-140, 60], [-55, 60], [-55, 55], [-140, 55]]] }},
    { "type": "Feature", "properties": { "zone": "4" }, "geometry": { "type": "Polygon", "coordinates": [[[-130, 48], [-130, 55], [-60, 55], [-60, 48], [-130, 48]]] }},
    { "type": "Feature", "properties": { "zone": "5" }, "geometry": { "type": "Polygon", "coordinates": [[[-125, 42], [-125, 48], [-65, 48], [-65, 42], [-125, 42]]] }},
    { "type": "Feature", "properties": { "zone": "6" }, "geometry": { "type": "Polygon", "coordinates": [[[-123, 38], [-123, 42], [-70, 42], [-70, 38], [-123, 38]]] }},
    { "type": "Feature", "properties": { "zone": "7" }, "geometry": { "type": "Polygon", "coordinates": [[[-122, 35], [-122, 38], [-75, 38], [-75, 35], [-122, 35]]] }},
    { "type": "Feature", "properties": { "zone": "8" }, "geometry": { "type": "Polygon", "coordinates": [[[-122, 32], [-122, 35], [-78, 35], [-78, 32], [-122, 32]]] }},
    { "type": "Feature", "properties": { "zone": "9" }, "geometry": { "type": "Polygon", "coordinates": [[[-120, 28], [-120, 32], [-80, 32], [-80, 28], [-120, 28]]] }},
    { "type": "Feature", "properties": { "zone": "10" }, "geometry": { "type": "Polygon", "coordinates": [[[-118, 24], [-118, 28], [-80, 28], [-80, 24], [-118, 24]]] }},
    { "type": "Feature", "properties": { "zone": "11" }, "geometry": { "type": "Polygon", "coordinates": [[[-110, 15], [-110, 24], [-82, 24], [-82, 15], [-110, 15]]] }},
    { "type": "Feature", "properties": { "zone": "12" }, "geometry": { "type": "Polygon", "coordinates": [[[-105, 8], [-105, 15], [-85, 15], [-85, 8], [-105, 8]]] }},
    // Greenland
    { "type": "Feature", "properties": { "zone": "0" }, "geometry": { "type": "Polygon", "coordinates": [[[-70, 60], [-70, 84], [-20, 84], [-20, 60], [-70, 60]]] }},
    
    // --- SOUTH AMERICA ---
    { "type": "Feature", "properties": { "zone": "12" }, "geometry": { "type": "Polygon", "coordinates": [[[-82, 12], [-82, -5], [-35, -5], [-35, 12], [-82, 12]]] }},
    { "type": "Feature", "properties": { "zone": "11" }, "geometry": { "type": "Polygon", "coordinates": [[[-75, -5], [-75, -15], [-35, -15], [-35, -5], [-75, -5]]] }},
    { "type": "Feature", "properties": { "zone": "10" }, "geometry": { "type": "Polygon", "coordinates": [[[-70, -15], [-70, -25], [-40, -25], [-40, -15], [-70, -15]]] }},
    { "type": "Feature", "properties": { "zone": "9" }, "geometry": { "type": "Polygon", "coordinates": [[[-72, -25], [-72, -35], [-50, -35], [-50, -25], [-72, -25]]] }},
    { "type": "Feature", "properties": { "zone": "8" }, "geometry": { "type": "Polygon", "coordinates": [[[-75, -35], [-75, -45], [-60, -45], [-60, -35], [-75, -35]]] }},
    { "type": "Feature", "properties": { "zone": "7" }, "geometry": { "type": "Polygon", "coordinates": [[[-75, -45], [-75, -56], [-65, -56], [-65, -45], [-75, -45]]] }},
    
    // --- EUROPE ---
    { "type": "Feature", "properties": { "zone": "3" }, "geometry": { "type": "Polygon", "coordinates": [[[5, 68], [45, 68], [45, 72], [5, 72], [5, 68]]] }},
    { "type": "Feature", "properties": { "zone": "4" }, "geometry": { "type": "Polygon", "coordinates": [[[5, 62], [40, 62], [40, 68], [5, 68], [5, 62]]] }},
    { "type": "Feature", "properties": { "zone": "5" }, "geometry": { "type": "Polygon", "coordinates": [[[-8, 58], [35, 58], [35, 62], [-8, 62], [-8, 58]]] }},
    { "type": "Feature", "properties": { "zone": "6" }, "geometry": { "type": "Polygon", "coordinates": [[[-10, 52], [30, 52], [30, 58], [-10, 58], [-10, 52]]] }},
    { "type": "Feature", "properties": { "zone": "7" }, "geometry": { "type": "Polygon", "coordinates": [[[-10, 48], [25, 48], [25, 52], [-10, 52], [-10, 48]]] }},
    { "type": "Feature", "properties": { "zone": "8" }, "geometry": { "type": "Polygon", "coordinates": [[[-10, 43], [35, 43], [35, 48], [-10, 48], [-10, 43]]] }},
    { "type": "Feature", "properties": { "zone": "9" }, "geometry": { "type": "Polygon", "coordinates": [[[-10, 38], [40, 38], [40, 43], [-10, 43], [-10, 38]]] }},
    { "type": "Feature", "properties": { "zone": "10" }, "geometry": { "type": "Polygon", "coordinates": [[[-8, 35], [38, 35], [38, 38], [-8, 38], [-8, 35]]] }},
    
    // --- AFRICA ---
    { "type": "Feature", "properties": { "zone": "12" }, "geometry": { "type": "Polygon", "coordinates": [[[-18, 10], [52, 10], [52, -10], [-18, -10], [-18, 10]]] }},
    { "type": "Feature", "properties": { "zone": "11" }, "geometry": { "type": "Polygon", "coordinates": [[[-18, 18], [50, 18], [50, 10], [-18, 10], [-18, 18]]] }},
    { "type": "Feature", "properties": { "zone": "11" }, "geometry": { "type": "Polygon", "coordinates": [[[-15, -10], [50, -10], [50, -20], [-15, -20], [-15, -10]]] }},
    { "type": "Feature", "properties": { "zone": "10" }, "geometry": { "type": "Polygon", "coordinates": [[[-20, 28], [40, 28], [40, 18], [-20, 18], [-20, 28]]] }},
    { "type": "Feature", "properties": { "zone": "10" }, "geometry": { "type": "Polygon", "coordinates": [[[10, -20], [45, -20], [45, -30], [10, -30], [10, -20]]] }},
    { "type": "Feature", "properties": { "zone": "9" }, "geometry": { "type": "Polygon", "coordinates": [[[-10, 37], [38, 37], [38, 28], [-10, 28], [-10, 37]]] }},
    { "type": "Feature", "properties": { "zone": "9" }, "geometry": { "type": "Polygon", "coordinates": [[[15, -30], [35, -30], [35, -35], [15, -35], [15, -30]]] }},
    
    // --- ASIA ---
    { "type": "Feature", "properties": { "zone": "1" }, "geometry": { "type": "Polygon", "coordinates": [[[60, 75], [180, 75], [180, 85], [60, 85], [60, 75]]] }},
    { "type": "Feature", "properties": { "zone": "2" }, "geometry": { "type": "Polygon", "coordinates": [[[60, 68], [180, 68], [180, 75], [60, 75], [60, 68]]] }},
    { "type": "Feature", "properties": { "zone": "3" }, "geometry": { "type": "Polygon", "coordinates": [[[50, 60], [140, 60], [140, 68], [50, 68], [50, 60]]] }},
    { "type": "Feature", "properties": { "zone": "4" }, "geometry": { "type": "Polygon", "coordinates": [[[50, 50], [140, 50], [140, 60], [50, 60], [50, 50]]] }},
    { "type": "Feature", "properties": { "zone": "5" }, "geometry": { "type": "Polygon", "coordinates": [[[50, 40], [135, 40], [135, 50], [50, 50], [50, 40]]] }},
    { "type": "Feature", "properties": { "zone": "6" }, "geometry": { "type": "Polygon", "coordinates": [[[60, 35], [140, 35], [140, 40], [60, 40], [60, 35]]] }},
    { "type": "Feature", "properties": { "zone": "7" }, "geometry": { "type": "Polygon", "coordinates": [[[70, 30], [145, 30], [145, 35], [70, 35], [70, 30]]] }},
    { "type": "Feature", "properties": { "zone": "8" }, "geometry": { "type": "Polygon", "coordinates": [[[70, 25], [130, 25], [130, 30], [70, 30], [70, 25]]] }},
    { "type": "Feature", "properties": { "zone": "9" }, "geometry": { "type": "Polygon", "coordinates": [[[60, 20], [125, 20], [125, 25], [60, 25], [60, 20]]] }},
    { "type": "Feature", "properties": { "zone": "10" }, "geometry": { "type": "Polygon", "coordinates": [[[65, 10], [140, 10], [140, 20], [65, 20], [65, 10]]] }},
    { "type": "Feature", "properties": { "zone": "11" }, "geometry": { "type": "Polygon", "coordinates": [[[95, 0], [150, 0], [150, 10], [95, 10], [95, 0]]] }},
    { "type": "Feature", "properties": { "zone": "12" }, "geometry": { "type": "Polygon", "coordinates": [[[95, -10], [150, -10], [150, 0], [95, 0], [95, -10]]] }},
    // Middle East
    { "type": "Feature", "properties": { "zone": "8" }, "geometry": { "type": "Polygon", "coordinates": [[[35, 30], [60, 30], [60, 40], [35, 40], [35, 30]]] }},
    { "type": "Feature", "properties": { "zone": "9" }, "geometry": { "type": "Polygon", "coordinates": [[[35, 20], [60, 20], [60, 30], [35, 30], [35, 20]]] }},
    { "type": "Feature", "properties": { "zone": "10" }, "geometry": { "type": "Polygon", "coordinates": [[[40, 12], [60, 12], [60, 20], [40, 20], [40, 12]]] }},
    
    // --- AUSTRALIA & OCEANIA ---
    { "type": "Feature", "properties": { "zone": "12" }, "geometry": { "type": "Polygon", "coordinates": [[[110, -10], [155, -10], [155, -20], [110, -20], [110, -10]]] }},
    { "type": "Feature", "properties": { "zone": "11" }, "geometry": { "type": "Polygon", "coordinates": [[[110, -20], [155, -20], [155, -28], [110, -28], [110, -20]]] }},
    { "type": "Feature", "properties": { "zone": "10" }, "geometry": { "type": "Polygon", "coordinates": [[[112, -28], [155, -28], [155, -35], [112, -35], [112, -28]]] }},
    { "type": "Feature", "properties": { "zone": "9" }, "geometry": { "type": "Polygon", "coordinates": [[[115, -35], [155, -35], [155, -40], [115, -40], [115, -35]]] }},
    { "type": "Feature", "properties": { "zone": "8" }, "geometry": { "type": "Polygon", "coordinates": [[[144, -40], [148, -40], [148, -44], [144, -44], [144, -40]]] }}, // Tasmania
    // New Zealand
    { "type": "Feature", "properties": { "zone": "8" }, "geometry": { "type": "Polygon", "coordinates": [[[166, -47], [174, -47], [174, -43], [166, -43], [166, -47]]] }},
    { "type": "Feature", "properties": { "zone": "9" }, "geometry": { "type": "Polygon", "coordinates": [[[168, -43], [179, -43], [179, -38], [168, -38], [168, -43]]] }},
    { "type": "Feature", "properties": { "zone": "10" }, "geometry": { "type": "Polygon", "coordinates": [[[172, -38], [178, -38], [178, -34], [172, -34], [172, -38]]] }},
    
    // --- ANTARCTICA ---
    { "type": "Feature", "properties": { "zone": "0" }, "geometry": { "type": "Polygon", "coordinates": [[[-180, -60], [180, -60], [180, -90], [-180, -90], [-180, -60]]] }}
  ]
};

const zoneColors = {
  "0": "rgba(50, 0, 150, 0.4)", // Arctic/Extremely Cold
  "1": "rgba(75, 0, 200, 0.4)", // Subarctic
  "2": "rgba(125, 0, 255, 0.4)", // Very Cold
  "3": "rgba(100, 0, 255, 0.4)",
  "4": "rgba(56, 102, 255, 0.4)",
  "5": "rgba(56, 182, 255, 0.4)",
  "6": "rgba(56, 255, 201, 0.4)",
  "7": "rgba(152, 255, 56, 0.4)",
  "8": "rgba(255, 239, 56, 0.4)",
  "9": "rgba(255, 148, 56, 0.4)",
  "10": "rgba(255, 56, 56, 0.4)",
  "11": "rgba(255, 30, 30, 0.4)", // Very Hot
  "12": "rgba(255, 0, 0, 0.4)" // Extremely Hot
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

export default function LocationMap({ user }) {
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'light');

  useEffect(() => {
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

  if (!user?.location) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-foreground text-base md:text-lg">
            <MapPin className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
            Your Location & Zone Map
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="text-center py-3 md:py-4">
            <MapPin className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground mx-auto mb-2 md:mb-3" />
            <p className="text-secondary text-xs md:text-sm mb-2">
              Set your location in profile to see zone information.
            </p>
          </div>
        </CardContent>
      </Card>);

  }

  const mapCenter = user.location.latitude && user.location.longitude ?
  [user.location.latitude, user.location.longitude] :
  [39.8283, -98.5795];

  const mapTileUrls = {
    light: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
    dark: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
  };

  const mapAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-foreground text-base md:text-lg">
          <MapPin className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
          Your Location & Zone Map
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0">
        
        {/* Location Info */}
        <div className="bg-gradient-to-r from-muted/50 to-muted-foreground/10 rounded-lg p-2 md:p-3 border border-border">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground text-sm md:text-base">
                {user.location.city}
                {user.location.state && `, ${user.location.state}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.location.latitude?.toFixed(4)}, {user.location.longitude?.toFixed(4)}
              </p>
            </div>
            {user.growing_zone &&
            <div className="text-right flex-shrink-0">
                <p className="text-xs text-muted-foreground">Zone</p>
                <p className="text-xl md:text-2xl font-bold text-primary">
                  {user.growing_zone}
                </p>
              </div>
            }
          </div>
        </div>

        {/* Mini Map */}
        <div className="relative w-full h-[150px] md:h-[200px] overflow-hidden rounded-lg border border-border">
          <div className="absolute inset-0 z-10">
            <MapContainer
              center={mapCenter}
              zoom={4}
              style={{ height: "100%", width: "100%", zIndex: 1 }}
              scrollWheelZoom={false}
              key={theme}
              zoomControl={false}
              dragging={false}
              doubleClickZoom={false}
              className="leaflet-container">

              <TileLayer url={mapTileUrls[theme]} attribution={mapAttribution} />
              <GeoJSON data={geoJsonData} style={getZoneStyle} />
              <Marker position={mapCenter}>
                <Popup>
                  <div className="text-center">
                    <p className="font-medium text-foreground mb-1">Your Garden</p>
                    {user.growing_zone &&
                    <p className="text-sm text-muted-foreground">
                        Zone {user.growing_zone}
                      </p>
                    }
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </CardContent>
    </Card>);

}