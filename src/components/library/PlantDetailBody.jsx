import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X, Sprout, Sun, Droplets, Ruler, Plus, CheckCircle, Flower, Leaf, Clock, Thermometer
} from 'lucide-react';
import { findZone } from "@/utils/zoneUtils";
import { motion } from 'framer-motion';
import HardeningOffTimeline from "./HardeningOffTimeline";

const categoryColors = {
  vegetables: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700",
  fruits: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700",
  flowers: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-700",
  grains: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700",
  herbs: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/50 dark:text-teal-300 dark:border-teal-700"
};

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-lg">
    <div className="w-7 h-7 bg-background rounded-md flex items-center justify-center text-muted-foreground flex-shrink-0 border">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
      <p className="text-xs font-semibold text-foreground capitalize leading-tight truncate">{value}</p>
    </div>
  </div>
);

export default function PlantDetailBody({
  plant,
  userZone,
  onOpenChange,
  onAddPlant,
  isAdded,
  userPlantData,
  animated = true
}) {
  if (!plant) return null;

  const transplantInfo = findZone(plant.transplant_zones, userZone);
  const directSowInfo = findZone(plant.direct_sow_zones, userZone);
  const legacyZoneInfo = userZone && plant.planting_zones ? findZone(plant.planting_zones, userZone) : null;

  const formatMMDD = (mmdd) => {
    if (!mmdd) return null;
    const [month, day] = mmdd.split('-').map(Number);
    return new Date(2000, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDateRange = (from, to) => {
    if (!from) return null;
    const formattedFrom = formatMMDD(from);
    if (!to || to === from) return formattedFrom;
    return `${formattedFrom} – ${formatMMDD(to)}`;
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    onAddPlant(plant);
  };

  const H = animated ? motion.h1 : 'h1';
  const P = animated ? motion.p : 'p';
  const hAnim = animated ? { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1, duration: 0.5 } } : {};
  const pAnim = animated ? { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2, duration: 0.5 } } : {};

  return (
    <>
      {/* Header */}
      <div className="relative p-3 md:p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-b border-border">
        <H {...hAnim} className="text-lg md:text-xl font-bold leading-tight text-foreground pr-8">
          {plant.name}
        </H>
        <P {...pAnim} className="text-[11px] italic text-muted-foreground">
          {plant.botanical_name}
        </P>

        {Array.isArray(plant.transplant_outdoor_zones) && plant.transplant_outdoor_zones.length > 0 && (
          <div className="mt-1.5 inline-flex items-center gap-1 bg-blue-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-sm">
            <Sprout className="w-2.5 h-2.5" />
            Transplant
          </div>
        )}

        <Button
          onClick={() => onOpenChange(false)}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-2 py-0.5 h-auto rounded-md shadow-lg hover:shadow-red-500/50 transition-all duration-300 text-[10px] font-semibold"
        >
          <X className="w-2.5 h-2.5 mr-0.5" />
          Close
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        <div className="space-y-3">

          <div className="flex flex-wrap gap-1.5">
            <Badge className={`${categoryColors[plant.category]} text-[11px] py-0.5`}>{plant.category}</Badge>
            <Badge variant="outline" className="text-[11px] py-0.5 capitalize">{plant.plant_type}</Badge>
            {userPlantData && (
              <Badge className="bg-primary text-primary-foreground text-[11px] py-0.5">
                <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                In Your Garden
              </Badge>
            )}
          </div>

          {userPlantData && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-2.5">
              <h3 className="font-semibold text-sm mb-1.5 flex items-center gap-1.5 text-foreground">
                <Sprout className="w-3.5 h-3.5 text-primary" />Your Garden Info
              </h3>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={
                    userPlantData.status === 'planted' ? 'bg-green-500' :
                    userPlantData.status === 'harvested' ? 'bg-amber-500' :
                    'bg-blue-500'
                  }>
                    {userPlantData.status === 'planted' ? 'Growing' :
                     userPlantData.status === 'harvested' ? 'Harvested' : 'Planned'}
                  </Badge>
                </div>
                {userPlantData.actual_planting_date && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Planted:</span>
                    <span className="font-medium text-foreground">
                      {new Date(userPlantData.actual_planting_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {userPlantData.harvest_date && (
                  <div className="flex items-center gap-2">
                    <Sun className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {userPlantData.status === 'harvested' ? 'Harvested:' : 'Est. Harvest:'}
                    </span>
                    <span className="font-medium text-foreground">
                      {new Date(userPlantData.harvest_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {userPlantData.notes && (
                  <div className="mt-1.5 pt-1.5 border-t border-primary/20">
                    <p className="text-muted-foreground mb-0.5 text-[10px]">Notes:</p>
                    <p className="text-foreground text-[11px]">{userPlantData.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Plant Details Grid */}
          <div>
            <h3 className="font-semibold text-sm mb-1.5 text-foreground">Plant Details</h3>
            <div className="grid grid-cols-2 gap-1.5">
              <DetailItem icon={<Sun className="w-4 h-4" />} label="Sunlight" value={plant.sun_requirements?.replace(/_/g, ' ')} />
              <DetailItem icon={<Droplets className="w-4 h-4" />} label="Water Needs" value={plant.water_needs} />
              <DetailItem icon={<Ruler className="w-4 h-4" />} label="Spacing" value={plant.spacing} />
              <DetailItem icon={<Ruler className="w-4 h-4 -rotate-90" />} label="Planting Depth" value={plant.planting_depth} />
              <DetailItem icon={<Clock className="w-4 h-4" />} label="Maturity" value={`${plant.days_to_maturity} days`} />
            </div>
          </div>

          {/* Seedling hardening-off timeline (only for indoor-start/transplant crops) */}
          {userZone && <HardeningOffTimeline plant={plant} userZone={userZone} />}

          {/* Planting Info for Zone */}
          {userZone && (transplantInfo || directSowInfo || legacyZoneInfo) && (
            <div>
              <h3 className="font-semibold text-sm mb-1.5 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-primary" />Zone {userZone} Planting
              </h3>
              <div className="bg-muted/50 rounded-lg p-2.5 border border-border text-xs space-y-1.5">
                <div>
                  <span className="font-semibold text-foreground">Transplant (indoor sow): </span>
                  {transplantInfo?.from
                    ? <span>{formatDateRange(transplantInfo.from, transplantInfo.to)}</span>
                    : <span className="text-muted-foreground italic">No data available</span>}
                </div>
                {transplantInfo?.transplant_from && (
                  <div>
                    <span className="font-semibold text-foreground">Transplant (outdoors): </span>
                    <span>{formatDateRange(transplantInfo.transplant_from, transplantInfo.transplant_to)}</span>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-foreground">Direct Sow: </span>
                  {directSowInfo?.from
                    ? <span>{formatDateRange(directSowInfo.from, directSowInfo.to)}</span>
                    : <span className="text-muted-foreground italic">No data available</span>}
                </div>
                {!transplantInfo && !directSowInfo && legacyZoneInfo && (
                  <>
                    {legacyZoneInfo.spring_start_week && (
                      <p><span className="font-semibold text-foreground">Spring:</span> Weeks {legacyZoneInfo.spring_start_week}–{legacyZoneInfo.spring_end_week}</p>
                    )}
                    {legacyZoneInfo.fall_start_week && (
                      <p><span className="font-semibold text-foreground">Fall:</span> Weeks {legacyZoneInfo.fall_start_week}–{legacyZoneInfo.fall_end_week}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Growing Tips */}
          <div>
            <h3 className="font-semibold text-sm mb-1.5">Growing Tips</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{plant.growing_tips || "No specific tips available."}</p>
          </div>

          {/* Companion Plants */}
          {plant.companion_plants && plant.companion_plants.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-1.5">Companion Plants</h3>
              <div className="flex flex-wrap gap-1">
                {plant.companion_plants.map((p, i) => (
                  <Badge key={i} variant="secondary" className="text-[11px] py-0.5">{p}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-2.5 border-t border-border flex-shrink-0 bg-card">
        <Button
          size="sm"
          className="w-full text-xs"
          onClick={handleAddClick}
          disabled={isAdded}
          variant={isAdded ? "secondary" : "default"}
        >
          {isAdded ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Added to Your Garden
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add to My Garden
            </>
          )}
        </Button>
      </div>
    </>
  );
}