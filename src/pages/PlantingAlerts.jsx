import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/entities/User";
import { Plant } from "@/entities/Plant";
import { UserPlant } from "@/entities/UserPlant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Leaf,
  Plus,
  AlertCircle,
  CheckCircle2,
  Sun,
  Droplets,
  Sprout,
  ArrowLeft,
  Flower
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import LoginPrompt from "../components/auth/LoginPrompt";
import RecommendedPlants from "../components/alerts/RecommendedPlants";
import LoadingSpinner from "../components/common/LoadingSpinner";
import CategoryCard from "../components/library/CategoryCard";
import PlantingWeatherCard from "../components/alerts/PlantingWeatherCard";
import { motion, AnimatePresence } from "framer-motion";

const categoryData = {
  vegetables: {
    name: "Vegetables",
    icon: Leaf,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-700",
    description: "Ready to grow vegetables"
  },
  fruits: {
    name: "Fruits",
    icon: Sprout,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-700",
    description: "Sweet and delicious fruits"
  },
  herbs: {
    name: "Herbs",
    icon: Leaf,
    color: "from-teal-500 to-teal-600",
    bgColor: "bg-teal-50 dark:bg-teal-900/20",
    borderColor: "border-teal-200 dark:border-teal-700",
    description: "Aromatic cooking herbs"
  },
  flowers: {
    name: "Flowers",
    icon: Flower,
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-50 dark:bg-pink-900/20",
    borderColor: "border-pink-200 dark:border-pink-700",
    description: "Beautiful garden blooms"
  },
  grains: {
    name: "Grains",
    icon: Sprout,
    color: "from-yellow-500 to-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    borderColor: "border-yellow-200 dark:border-yellow-700",
    description: "Hardy grains and cereals"
  }
};

const categoryColors = {
  vegetables: "bg-green-100 text-green-800 border-green-300",
  herbs: "bg-teal-100 text-teal-800 border-teal-300",
  flowers: "bg-pink-100 text-pink-800 border-pink-300",
  fruits: "bg-red-100 text-red-800 border-red-300",
  grains: "bg-yellow-100 text-yellow-800 border-yellow-300"
};

const categoryIcons = {
  vegetables: <Sprout className="w-4 h-4" />,
  herbs: <Leaf className="w-4 h-4" />,
  flowers: <Flower className="w-4 h-4" />,
  fruits: <Sprout className="w-4 h-4" />,
  grains: <Sprout className="w-4 h-4" />
};

export default function PlantingAlerts() {
  const [user, setUser] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const [plantToday, setPlantToday] = useState([]);
  const [plantThisWeek, setPlantThisWeek] = useState([]);
  const [userPlants, setUserPlants] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [plantsByCategoryToday, setPlantsByCategoryToday] = useState({});
  const [viewMode, setViewMode] = useState('shelf'); // 'shelf' or 'category'
  const [selectedCategory, setSelectedCategory] = useState(null);

  const isPlantableToday = useCallback((plant, userZone, dayNumber) => {
    if (!plant.planting_zones) return false;

    const zoneData = plant.planting_zones.find(z =>
      z.zone === userZone ||
      z.zone === userZone.substring(0, userZone.length - 1)
    );

    if (!zoneData) return false;

    const springStartDay = zoneData.spring_start_week * 7;
    const springEndDay = zoneData.spring_end_week * 7;
    const fallStartDay = zoneData.fall_start_week ? zoneData.fall_start_week * 7 : null;
    const fallEndDay = zoneData.fall_end_week ? zoneData.fall_end_week * 7 : null;

    const isSpringPlanting = dayNumber >= springStartDay && dayNumber <= springEndDay;
    const isFallPlanting = fallStartDay && fallEndDay && dayNumber >= fallStartDay && dayNumber <= fallEndDay;

    return isSpringPlanting || isFallPlanting;
  }, []);

  const loadPlantingData = useCallback(async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      if (!currentUser.growing_zone) {
        setIsLoading(false);
        return;
      }

      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const dayNumber = Math.ceil((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
      const weekNumber = Math.ceil(dayNumber / 7);

      setCurrentWeek(weekNumber);
      setCurrentDay(dayNumber);

      const [allPlants, userPlantsData] = await Promise.all([
        Plant.list(),
        UserPlant.filter({ created_by: currentUser.email })
      ]);

      setUserPlants(userPlantsData);
      const userPlantIds = new Set(userPlantsData.map((p) => p.plant_id));

      // --- Recommendation Logic ---
      // Now favorite_plants contains simplified common names like "Tomato", "Strawberry"
      // We match these against the plant's common_name field (or name as fallback)
      let calculatedRecommendations = [];
      if (currentUser?.favorite_plants && Array.isArray(currentUser.favorite_plants) && currentUser.favorite_plants.length > 0) {
        const favoriteCommonNames = currentUser.favorite_plants.map(f => f.toLowerCase());
        
        // Find all plants that match favorite common names (these are the "base" favorites)
        const matchingFavoritePlants = allPlants.filter(p => {
          const plantCommonName = (p.common_name || p.name).toLowerCase();
          return favoriteCommonNames.includes(plantCommonName);
        });

        // Get categories and companion info from matching plants
        const favoriteCategories = [...new Set(matchingFavoritePlants.map(p => p.category))];
        const allCompanionPlants = new Set();
        matchingFavoritePlants.forEach(p => {
          if (p.companion_plants) {
            p.companion_plants.forEach(comp => allCompanionPlants.add(comp.toLowerCase()));
          }
        });

        const candidates = [];

        allPlants.forEach(candidatePlant => {
          // Skip plants already in garden or not plantable today
          if (userPlantIds.has(candidatePlant.id)) return;
          if (!isPlantableToday(candidatePlant, currentUser.growing_zone, dayNumber)) return;

          const candidateCommonName = (candidatePlant.common_name || candidatePlant.name).toLowerCase();
          
          // Skip if this plant's common_name matches a favorite (we want to recommend NEW things)
          if (favoriteCommonNames.includes(candidateCommonName)) return;

          let score = 0;
          let reasons = [];

          // 1. Companion Plant of a favorite (High Score)
          if (allCompanionPlants.has(candidatePlant.name.toLowerCase()) || 
              allCompanionPlants.has(candidateCommonName)) {
            score += 15;
            reasons.push(`Great companion for your favorites`);
          }

          // 2. Same Category as favorites (Medium Score)
          if (favoriteCategories.includes(candidatePlant.category)) {
            score += 8;
            reasons.push(`You like ${candidatePlant.category}`);
          }

          // 3. Similar growing needs to favorites (Low Score)
          const matchingNeedsPlant = matchingFavoritePlants.find(fav => 
            fav.sun_requirements === candidatePlant.sun_requirements && 
            fav.water_needs === candidatePlant.water_needs
          );
          if (matchingNeedsPlant) {
            score += 4;
            reasons.push(`Similar care needs`);
          }

          if (score > 0) {
            candidates.push({
              ...candidatePlant,
              score,
              reasons: reasons.slice(0, 2)
            });
          }
        });

        // Sort by score and take top 4
        let topRecommendations = candidates.sort((a, b) => b.score - a.score).slice(0, 4);

        // If we have fewer than 2 recommendations, add fallback options
        if (topRecommendations.length < 2) {
          const alreadyRecommendedIds = new Set(topRecommendations.map(p => p.id));

          const fallbackCandidates = [];
          allPlants.forEach(plant => {
            if (alreadyRecommendedIds.has(plant.id)) return;
            if (userPlantIds.has(plant.id)) return;
            if (!isPlantableToday(plant, currentUser.growing_zone, dayNumber)) return;
            
            const plantCommonName = (plant.common_name || plant.name).toLowerCase();
            if (favoriteCommonNames.includes(plantCommonName)) return;

            let fallbackScore = 0;
            let fallbackReasons = [];

            // Boost score for common beginner-friendly plants
            const beginnerFriendly = ['lettuce', 'radish', 'spinach', 'basil', 'cilantro', 'parsley'];
            if (beginnerFriendly.some(friendly => plant.name.toLowerCase().includes(friendly))) {
              fallbackScore += 5;
              fallbackReasons.push(`Easy to grow`);
            }

            if (fallbackScore > 0) {
              fallbackCandidates.push({
                ...plant,
                score: fallbackScore,
                reasons: fallbackReasons
              });
            }
          });

          const sortedFallbacks = fallbackCandidates.sort((a, b) => b.score - a.score);
          const needed = Math.min(2 - topRecommendations.length, sortedFallbacks.length);
          topRecommendations = [...topRecommendations, ...sortedFallbacks.slice(0, needed)];
        }

        calculatedRecommendations = topRecommendations;
      }
      setRecommendations(calculatedRecommendations);
      const recommendationIds = new Set(calculatedRecommendations.map(p => p.id));

      // --- Plant Today/This Week Logic ---
      const plantsForToday = [];
      const plantsForWeek = [];
      const categoryPlantsToday = {
        vegetables: [],
        fruits: [],
        herbs: [],
        flowers: [],
        grains: []
      };

      // Check ALL plants from the library, not just user plants
      allPlants.forEach((plant) => {
        // Skip plants already in recommendations or already added by user
        if (recommendationIds.has(plant.id) || userPlantIds.has(plant.id)) return;

        if (isPlantableToday(plant, currentUser.growing_zone, dayNumber)) {
          // Re-find zone data here for season calculation to avoid duplicate isPlantableToday call
          const zoneData = plant.planting_zones?.find(z => z.zone === currentUser.growing_zone || z.zone === currentUser.growing_zone.substring(0, currentUser.growing_zone.length - 1));
          if (!zoneData) return; // Should not happen if isPlantableToday returned true, but good for safety

          const springStartDay = zoneData.spring_start_week * 7;
          const springEndDay = zoneData.spring_end_week * 7;
          const fallStartDay = zoneData.fall_start_week ? zoneData.fall_start_week * 7 : null;
          const fallEndDay = zoneData.fall_end_week ? zoneData.fall_end_week * 7 : null;

          const isSpringPlantingToday = dayNumber >= springStartDay && dayNumber <= springEndDay;
          const season = isSpringPlantingToday ? 'Spring' : 'Fall';
          const optimalWeeks = isSpringPlantingToday ?
            `Weeks ${zoneData.spring_start_week}-${zoneData.spring_end_week}` :
            `Weeks ${zoneData.fall_start_week}-${zoneData.fall_end_week}`;

          const plantWithSeason = { ...plant, season, optimalWeeks };
          plantsForToday.push(plantWithSeason);

          // Add to category, limiting to 4 per category
          if (categoryPlantsToday[plant.category] && categoryPlantsToday[plant.category].length < 4) {
            categoryPlantsToday[plant.category].push(plantWithSeason);
          }
        }

        const zoneDataForWeek = plant.planting_zones?.find(z => z.zone === currentUser.growing_zone || z.zone === currentUser.growing_zone.substring(0, currentUser.growing_zone.length - 1));
        if (zoneDataForWeek) {
            const isSpringWeek = weekNumber >= zoneDataForWeek.spring_start_week && weekNumber <= zoneDataForWeek.spring_end_week;
            const isFallWeek = zoneDataForWeek.fall_start_week && weekNumber >= zoneDataForWeek.fall_start_week && weekNumber <= zoneDataForWeek.fall_end_week;

            if (isSpringWeek || isFallWeek) {
              const season = isSpringWeek ? 'Spring' : 'Fall';
              const optimalWeeks = isSpringWeek ? `Weeks ${zoneDataForWeek.spring_start_week}-${zoneDataForWeek.spring_end_week}` : `Weeks ${zoneDataForWeek.fall_start_week}-${zoneDataForWeek.fall_end_week}`;
              plantsForWeek.push({ ...plant, season, optimalWeeks });
            }
        }
      });

      setPlantToday(plantsForToday);
      setPlantThisWeek(plantsForWeek);
      setPlantsByCategoryToday(categoryPlantsToday);

    } catch (error) {
      console.error("Error loading planting data:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [isPlantableToday]);

  useEffect(() => {
    loadPlantingData();
  }, [loadPlantingData]);

  const addPlantToGarden = async (plant) => {
    try {
      await UserPlant.create({
        plant_id: plant.id,
        plant_name: plant.name,
        status: 'planned'
      });
      // A full reload ensures all lists (recommendations, plantToday, plantsByCategoryToday) are updated consistently
      // and accurately reflect the user's current garden state.
      loadPlantingData();
    } catch (error) {
      console.error("Error adding plant to garden:", error);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setViewMode('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToShelf = () => {
    setSelectedCategory(null);
    setViewMode('shelf');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 flex items-center justify-center">
        <LoadingSpinner message="Loading planting recommendations..." size="large" />
      </div>
    );
  }

  if (!user) {
    return <LoginPrompt />;
  }

  if (!user?.growing_zone) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 pb-20 md:pb-6 flex items-center justify-center">
        <Card className="w-full max-w-md bg-card border-border text-center">
          <CardContent className="p-8 md:p-10">
            <AlertCircle className="w-12 h-12 md:w-16 md:h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-xl md:text-2xl font-bold text-foreground mb-2">Set Your Location</h1>
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              Please set your location in your profile to see personalized planting recommendations.
            </p>
            <Link to={createPageUrl("Profile")}>
              <Button className="w-full">Set Location</Button>
            </Link>
          </CardContent>
        </Card>
      </div>);
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const hasPlantsToday = Object.values(plantsByCategoryToday).some(p => p.length > 0);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 pb-20 md:pb-6">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">

        {/* Header */}
        <div className="text-center space-y-4 md:space-y-6">
          <div className="relative inline-block">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl scale-150" />
            <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 backdrop-blur-sm rounded-2xl px-8 py-6 md:px-12 md:py-8">
              <div className="flex flex-col items-center gap-3 md:gap-4">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/15 rounded-2xl flex items-center justify-center border border-primary/20">
                  <Sprout className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">Today's Plants</h1>
                  <p className="text-sm md:text-base text-muted-foreground mt-1">
                    Perfect for planting in <span className="text-primary font-semibold">Zone {user.growing_zone}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-1.5 border border-border">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground font-medium">Day {currentDay} • Week {currentWeek}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Weather Card */}
          <PlantingWeatherCard user={user} />
        </div>

        {/* Recommended Plants Section */}
        <RecommendedPlants
          user={user}
          recommendations={recommendations}
          isLoading={isLoading}
          onAddPlant={addPlantToGarden} />

        {/* Category Shelf View */}
        {viewMode === 'shelf' && (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key="shelf-view"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6"
            >
              {hasPlantsToday ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                  {Object.entries(categoryData).map(([key, category]) => {
                    const plantCount = plantsByCategoryToday[key]?.length || 0;
                    if (plantCount === 0) return null;

                    return (
                      <motion.div key={key} variants={itemVariants} layout>
                        <CategoryCard
                          category={category}
                          plantCount={plantCount}
                          onClick={() => handleCategorySelect(key)}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <Card className="bg-card/80 backdrop-blur-sm border-border">
                  <CardContent className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No plants ready for planting today</h3>
                    <p className="text-muted-foreground mb-4">
                      Check back during active planting seasons for your zone.
                    </p>
                    <Link to={createPageUrl("PlantLibrary")}>
                      <Button variant="outline">
                        Browse All Plants
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Individual Category View */}
        {viewMode === 'category' && selectedCategory && (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key="category-view"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-card/80 backdrop-blur-sm border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      {categoryIcons[selectedCategory]}
                      <span className="capitalize">{selectedCategory}</span>
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={handleBackToShelf}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Categories
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
                  >
                    {plantsByCategoryToday[selectedCategory].map((plant) => (
                      <motion.div key={plant.id} variants={itemVariants}>
                        <Card className="bg-muted/30 border-border hover:border-primary/50 transition-all duration-300">
                          <CardHeader className="p-2 md:p-4 pb-2 md:pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground truncate text-xs md:text-sm leading-tight">{plant.name}</h3>
                                <p className="text-[10px] md:text-xs text-muted-foreground italic truncate mt-0.5">{plant.botanical_name}</p>
                              </div>
                              <div className="flex-shrink-0 ml-1 md:ml-2">
                                <div className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
                                  {categoryIcons[plant.category]}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-2 md:p-4 pt-0 space-y-2 md:space-y-3">
                            <div className="flex gap-1 md:gap-2 flex-wrap">
                              <Badge className={`text-[10px] md:text-xs capitalize ${categoryColors[plant.category]} px-1.5 py-0.5`}>
                                {plant.category}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] md:text-xs px-1.5 py-0.5">
                                {plant.season} Planting
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-3 text-[10px] md:text-xs">
                              <div className="flex items-center gap-1">
                                <Sun className="w-2.5 h-2.5 md:w-3 h-3 md:h-3 text-secondary flex-shrink-0" />
                                <span className="text-muted-foreground capitalize truncate">
                                  {plant.sun_requirements?.replace("_", " ")}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Droplets className="w-2.5 h-2.5 md:w-3 h-3 md:h-3 text-secondary flex-shrink-0" />
                                <span className="text-muted-foreground capitalize truncate">
                                  {plant.water_needs} Water
                                </span>
                              </div>
                            </div>

                            {plant.days_to_maturity && (
                              <p className="text-[10px] md:text-xs text-muted-foreground">
                                <span className="font-medium">Harvest:</span> {plant.days_to_maturity} days
                              </p>
                            )}

                            <Button
                              size="sm"
                              className="w-full h-7 md:h-8 text-[10px] md:text-xs"
                              onClick={() => addPlantToGarden(plant)}
                            >
                              <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                              <span className="hidden sm:inline">Add to Garden</span>
                              <span className="sm:hidden">Add</span>
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        )}

        {/* This Week Section - Only show if there are additional weekly plants and in shelf view */}
        {viewMode === 'shelf' && plantThisWeek.filter(p => !plantToday.some(pt => pt.id === p.id)).length > 0 && (
          <Card className="bg-card/80 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Calendar className="w-5 h-5 text-secondary" />
                Also Good This Week ({plantThisWeek.filter(p => !plantToday.some(pt => pt.id === p.id)).length} more options)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plantThisWeek.filter((plant) => !plantToday.some((p) => p.id === plant.id)).map((plant) => (
                  <Card key={plant.id} className="bg-muted/20 border-border hover:border-secondary/50 transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{plant.name}</h3>
                          <p className="text-sm text-muted-foreground italic truncate">{plant.botanical_name}</p>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          {categoryIcons[plant.category]}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex gap-2 flex-wrap">
                        <Badge className={`text-xs capitalize ${categoryColors[plant.category]}`}>
                          {plant.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {plant.season} Planting
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Sun className="w-3 h-3 text-secondary" />
                          <span className="text-muted-foreground capitalize">
                            {plant.sun_requirements?.replace("_", " ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-secondary" />
                          <span className="text-muted-foreground capitalize">
                            {plant.water_needs} Water
                          </span>
                        </div>
                      </div>

                      {plant.days_to_maturity && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Harvest:</span> {plant.days_to_maturity} days
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Optimal window:</span> {plant.optimalWeeks}
                      </p>

                      <Button
                        size="sm"
                        className="w-full"
                        variant="outline"
                        onClick={() => addPlantToGarden(plant)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Garden
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}