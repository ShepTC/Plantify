import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/entities/User";
import { Plant } from "@/entities/Plant";
import { UserPlant } from "@/entities/UserPlant";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Sprout, Loader, ChevronLeft, ChevronRight, Filter, ArrowLeft, Leaf, Flower } from "lucide-react";
import PlantCard from "../components/library/PlantCard";
import PlantCardSkeleton from "../components/library/PlantCardSkeleton";
import CategoryCard from "../components/library/CategoryCard";
import LoginPrompt from "../components/auth/LoginPrompt";
import PlantDetailView from "../components/library/PlantDetailView";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "../components/common/LoadingSpinner";
import PlantLogo from "../components/common/PlantLogo";
import { createPageUrl } from "@/components/utils";
import { Link } from "react-router-dom";

const PLANTS_PER_PAGE = 24;

const categoryData = {
  vegetables: {
    name: "Vegetables",
    icon: Leaf,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-700",
    description: "Fresh, nutritious vegetables for your table"
  },
  fruits: {
    name: "Fruits",
    icon: Sprout,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-700",
    description: "Sweet and delicious fruits to grow"
  },
  herbs: {
    name: "Herbs",
    icon: Leaf,
    color: "from-teal-500 to-teal-600",
    bgColor: "bg-teal-50 dark:bg-teal-900/20",
    borderColor: "border-teal-200 dark:border-teal-700",
    description: "Aromatic herbs for cooking and wellness"
  },
  flowers: {
    name: "Flowers",
    icon: Flower,
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-50 dark:bg-pink-900/20",
    borderColor: "border-pink-200 dark:border-pink-700",
    description: "Beautiful blooms to brighten your garden"
  },
  grains: {
    name: "Grains",
    icon: Sprout,
    color: "from-yellow-500 to-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    borderColor: "border-yellow-200 dark:border-yellow-700",
    description: "Essential grains and cereals"
  }
};

export default function PlantLibrary() {
  const [allPlants, setAllPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [currentPagePlants, setCurrentPagePlants] = useState([]);
  const [userPlants, setUserPlants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filterByZone, setFilterByZone] = useState(false);
  const [viewMode, setViewMode] = useState("shelf"); // "shelf", "category", "search"
  const [categoryPlantCounts, setCategoryPlantCounts] = useState({});
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedPlant, setSelectedPlant] = useState(null);

  const handleSearchAndPagination = useCallback(() => {
    setIsLoadingPage(true);

    // Apply filters
    let processedPlants = allPlants;

    // Apply category filter
    if (selectedCategory !== "all") {
      processedPlants = processedPlants.filter((plant) =>
      plant.category === selectedCategory
      );
    }

    // Apply zone filter
    if (filterByZone && user?.growing_zone) {
      processedPlants = processedPlants.filter((plant) => {
        if (!plant.planting_zones || plant.planting_zones.length === 0) return false;
        return plant.planting_zones.some((z) =>
        z.zone === user.growing_zone ||
        z.zone === user.growing_zone.substring(0, user.growing_zone.length - 1)
        );
      });
    }

    // Apply search filter
    let filtered;
    if (searchTerm === "") {
      filtered = processedPlants;
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = processedPlants.filter((plant) =>
      plant.name.toLowerCase().includes(lowercasedTerm) ||
      plant.category.toLowerCase().includes(lowercasedTerm) ||
      plant.botanical_name.toLowerCase().includes(lowercasedTerm)
      );
    }

    setFilteredPlants(filtered);

    // Calculate total pages
    const pages = Math.ceil(filtered.length / PLANTS_PER_PAGE);
    setTotalPages(pages > 0 ? pages : 1);

    // Reset to page 1 if filters changed and current page would be out of bounds
    let pageToUse = currentPage;
    if (currentPage > pages && pages > 0) {
      pageToUse = 1;
      setCurrentPage(1);
    }

    // Get plants for current page
    const startIndex = (pageToUse - 1) * PLANTS_PER_PAGE;
    const endIndex = startIndex + PLANTS_PER_PAGE;
    const pageData = filtered.slice(startIndex, endIndex);

    setCurrentPagePlants(pageData);
    setIsLoadingPage(false);
  }, [allPlants, currentPage, filterByZone, selectedCategory, searchTerm, user]);

  // Handle search and pagination
  useEffect(() => {
    handleSearchAndPagination();
  }, [handleSearchAndPagination]);

  const loadLibraryData = useCallback(async (isRetry = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      // Add retry logic for network issues
      let plantsData = [];
      let userPlantsData = [];
      
      try {
        const results = await Promise.all([
          Plant.list(),
          UserPlant.filter({ created_by: currentUser.email })
        ]);
        plantsData = results[0];
        userPlantsData = results[1];
      } catch (networkError) {
        console.error("Network error loading data:", networkError);
        
        // If this is the first attempt, try loading them separately
        if (!isRetry && retryCount < 2) {
          console.log("Attempting to retry data loading...");
          setRetryCount(prev => prev + 1);
          
          try {
            plantsData = await Plant.list();
          } catch (plantError) {
            console.error("Failed to load plants:", plantError);
            throw new Error("Unable to load plant library. This may be a temporary network issue.");
          }
          
          try {
            userPlantsData = await UserPlant.filter({ created_by: currentUser.email });
          } catch (userPlantError) {
            console.error("Failed to load user plants:", userPlantError);
            // User plants are less critical, continue with empty array
            userPlantsData = [];
          }
        } else {
          throw networkError;
        }
      }

      setAllPlants(plantsData);
      setUserPlants(userPlantsData);

      // Calculate category counts
      const counts = {};
      plantsData.forEach((plant) => {
        counts[plant.category] = (counts[plant.category] || 0) + 1;
      });
      setCategoryPlantCounts(counts);

    } catch (error) {
      console.error("Error loading plant library:", error);
      setError(error.message || "Failed to load plant library. Please check your internet connection and try again.");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    loadLibraryData();
  }, [loadLibraryData]);

  const handleRetry = () => {
    setRetryCount(0);
    loadLibraryData(true);
  };

  const handleAddPlant = async (plant) => {
    try {
      const newUserPlant = await UserPlant.create({
        plant_id: plant.id,
        plant_name: plant.name,
        status: 'planned'
      });
      setUserPlants((prev) => [...prev, newUserPlant]);
    } catch (error) {
      console.error("Error adding plant to garden:", error);
    }
  };
  
  const handlePlantSelect = (plant) => {
    setSelectedPlant(plant);
  };

  // Get user plant data for selected plant
  const selectedUserPlantData = selectedPlant 
    ? userPlants.find(up => up.plant_id === selectedPlant.id)
    : null;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim()) {
      setViewMode("search");
    } else if (selectedCategory !== "all") {
      setViewMode("category");
    } else {
      setViewMode("shelf");
    }
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setViewMode("category");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleBackToShelf = () => {
    setSelectedCategory("all");
    setViewMode("shelf");
    setSearchTerm("");
    setFilterByZone(false);
    setCurrentPage(1);
  };

  const handleFilterChange = (value) => {
    setSelectedCategory(value);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const userPlantIds = new Set(userPlants.map((p) => p.plant_id));

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
    },
    exit: { y: 20, opacity: 0, filter: 'blur(3px)' }
  };

  // Generate page numbers for pagination UI
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Get filter display text
  const getFilterDisplayText = () => {
    const activeFilters = [];
    if (selectedCategory !== "all") {
      activeFilters.push(selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1));
    }
    if (filterByZone && user?.growing_zone) {
      activeFilters.push(`Zone ${user.growing_zone}`);
    }

    if (activeFilters.length === 0) {
      return "All Plants";
    }
    return activeFilters.join(" • ");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 flex items-center justify-center">
        <LoadingSpinner message="Cultivating the library..." size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Connection Issue
            </h2>
            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
              {error}
            </p>
            <div className="space-y-3">
              <Button onClick={handleRetry} className="w-full">
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return <LoginPrompt />;
  }

  return (
    <div className="min-h-screen bg-background p-3 md:p-6 pb-20 md:pb-6">
      <div className="max-w-7xl mx-auto space-y-3 md:space-y-6">

        {/* Header */}
        {viewMode === "shelf" ? (
          <div className="text-center space-y-3 md:space-y-4 pt-2 md:pt-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl scale-150" />
              <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 backdrop-blur-sm rounded-2xl px-6 py-4 md:px-10 md:py-6">
                <div className="flex flex-col items-center gap-2 md:gap-3">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/15 rounded-2xl flex items-center justify-center border border-primary/20">
                    <PlantLogo className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-3xl font-bold text-foreground">Seed Library</h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">
                      Discover plants perfect for your garden
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 md:text-center md:flex-col md:space-y-4">
            {(() => {
              const CategoryIcon = categoryData[selectedCategory]?.icon || Sprout;
              return (
                <div className={`w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br ${categoryData[selectedCategory]?.color || 'from-primary to-secondary'} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <CategoryIcon className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>
              );
            })()}
            <div>
              <h1 className="text-lg md:text-3xl font-bold text-foreground">
                {viewMode === "category" ? categoryData[selectedCategory]?.name || "Category" : "Search Results"}
              </h1>
              <p className="text-xs md:text-base text-muted-foreground">
                {viewMode === "category" ? categoryData[selectedCategory]?.description : `${filteredPlants.length} plants found`}
              </p>
            </div>
          </div>
        )}

        {/* Navigation and Search Bar */}
        <Card className="bg-card p-2 md:p-3 border-border sticky top-1 md:top-4 z-10 backdrop-blur-sm bg-card/80">
          <div className="flex flex-col gap-1.5">
            {/* Back button for category/search views */}
            {viewMode !== "shelf" &&
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToShelf}
              className="self-start flex items-center gap-1 text-xs h-7">

                <ArrowLeft className="w-3 h-3" />
                Back
              </Button>
            }
            
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search plants..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-8 h-8 md:h-10 text-sm w-full" />
            </div>

            {viewMode !== "shelf" && (
              <div className="flex flex-row gap-2 items-center">
                <Select onValueChange={handleFilterChange}>
                  <SelectTrigger className="h-10 flex-1 text-sm">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder={selectedCategory === "all" ? "Category" : categoryData[selectedCategory]?.name} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                    <SelectItem value="herbs">Herbs</SelectItem>
                    <SelectItem value="flowers">Flowers</SelectItem>
                    <SelectItem value="fruits">Fruits</SelectItem>
                    <SelectItem value="grains">Grains</SelectItem>
                  </SelectContent>
                </Select>
                {user?.growing_zone && (
                  <Button
                    variant={filterByZone ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterByZone(!filterByZone)}
                    className="h-10 text-xs whitespace-nowrap px-3"
                  >
                    Zone {user.growing_zone}
                  </Button>
                )}
              </div>
            )}

            {(searchTerm || selectedCategory !== "all" || filterByZone) && viewMode !== "shelf" &&
            <div className="flex items-center justify-between mt-2 text-xs md:text-sm text-muted-foreground">
                <p>Found {filteredPlants.length} plants matching your criteria.</p>
                <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setFilterByZone(false);
                  setViewMode("shelf");
                }}
                className="text-xs h-6">

                  Clear All
                </Button>
              </div>
            }
          </div>
        </Card>

        {/* Content Area */}
        {viewMode === "shelf" ? (
        /* Seed Shelf View - single column on mobile */
        <motion.div
          layout
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5"
        >
          {Object.entries(categoryData).map(([key, category]) => (
            <motion.div key={key} variants={itemVariants} layout>
              <CategoryCard
                category={{ ...category, key }}
                plantCount={categoryPlantCounts[key] || 0}
                onClick={() => handleCategorySelect(key)}
                compact
              />
            </motion.div>
          ))}
        </motion.div>
        ) : (

        /* Plant Grid View (for category and search) */
        <>
            {isLoadingPage ?
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                {Array.from({ length: 10 }).map((_, index) =>
            <PlantCardSkeleton key={index} />
            )}
              </div> :

          <motion.div
            layout
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">

                <AnimatePresence mode="wait">
                  {currentPagePlants.length > 0 ?
              currentPagePlants.map((plant) =>
              <motion.div key={`${plant.id}-${currentPage}`} variants={itemVariants} layout>
                        <PlantCard
                  plant={plant}
                  onAddPlant={handleAddPlant}
                  isAdded={userPlantIds.has(plant.id)}
                  userZone={user?.growing_zone}
                  onClick={() => handlePlantSelect(plant)}
                  />

                      </motion.div>
              ) :

              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-12 md:py-20">

                      <PlantLogo className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 opacity-50" />
                      <p className="text-sm md:text-lg text-muted-foreground mb-4">No plants found matching your criteria.</p>
                      <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                        <Button
                      variant="outline"
                      onClick={handleBackToShelf}
                      className="text-xs md:text-sm">

                          Browse All Categories
                        </Button>
                        <Link to={createPageUrl("RequestPlant")}>
                          <Button className="text-xs md:text-sm">
                            Request a Plant
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
              }
                </AnimatePresence>
              </motion.div>
          }

            {/* Pagination */}
            {totalPages > 1 &&
          <Card className="bg-card border-border">
                <div className="p-3 md:p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">
                    {/* Results info */}
                    <div className="text-xs md:text-sm text-muted-foreground">
                      Showing {Math.min((currentPage - 1) * PLANTS_PER_PAGE + 1, filteredPlants.length)}-{Math.min(currentPage * PLANTS_PER_PAGE, filteredPlants.length)} of {filteredPlants.length} plants
                    </div>

                    {/* Pagination controls */}
                    <div className="flex items-center gap-1 md:gap-2">
                      {/* Previous button */}
                      <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">

                        <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">Previous</span>
                      </Button>

                      {/* Page numbers */}
                      <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, index) =>
                    <React.Fragment key={index}>
                            {page === '...' ?
                      <span className="px-1 md:px-2 py-1 text-muted-foreground text-xs md:text-sm">...</span> :

                      <Button
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="min-w-[1.75rem] md:min-w-[2.5rem] h-7 md:h-9 text-xs md:text-sm">

                                {page}
                              </Button>
                      }
                          </React.Fragment>
                    )}
                      </div>

                      {/* Next button */}
                      <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">

                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
          }
          </>)
        }
      </div>
      
      <PlantDetailView
        plant={selectedPlant}
        userZone={user?.growing_zone}
        open={!!selectedPlant}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedPlant(null);
          }
        }}
        onAddPlant={handleAddPlant}
        isAdded={selectedPlant ? userPlantIds.has(selectedPlant.id) : false}
        userPlantData={selectedUserPlantData}
      />
    </div>);

}