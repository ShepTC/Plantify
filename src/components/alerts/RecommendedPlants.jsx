
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Plus,
  Sun,
  Droplets,
  Sprout,
  Star } from
"lucide-react";

const categoryColors = {
  vegetables: "bg-green-100 text-green-800 border-green-300",
  herbs: "bg-teal-100 text-teal-800 border-teal-300",
  flowers: "bg-pink-100 text-pink-800 border-pink-300",
  fruits: "bg-red-100 text-red-800 border-red-300",
  grains: "bg-yellow-100 text-yellow-800 border-yellow-300"
};

const categoryIcons = {
  vegetables: <Sprout className="w-4 h-4" />,
  herbs: <Sprout className="w-4 h-4" />,
  flowers: <Sprout className="w-4 h-4" />,
  fruits: <Sprout className="w-4 h-4" />,
  grains: <Sprout className="w-4 h-4" />
};

export default function RecommendedPlants({
  user,
  recommendations,
  isLoading,
  onAddPlant
}) {
  if (isLoading) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-r from-pink-50/90 to-purple-50/90 backdrop-blur-sm border-pink-200/50">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-pink-300/30 via-purple-300/30 via-blue-300/30 to-pink-300/30 opacity-60 animate-pulse">
          <div className="absolute inset-[1px] rounded-lg bg-gradient-to-r from-pink-50/95 to-purple-50/95 backdrop-blur-sm"></div>
        </div>
        <div className="absolute inset-0 rounded-lg">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-pink-200/20 to-transparent animate-shimmer"></div>
        </div>
        <CardContent className="relative p-6">
          <div className="flex items-center justify-center py-4">
            <div className="w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin mr-3" />
            <span className="text-pink-700 font-medium">Generating personalized recommendations...</span>
          </div>
        </CardContent>
        <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
        `}</style>
      </Card>);

  }

  if (recommendations.length === 0) {
    const hasFavorites = user?.favorite_plants && Array.isArray(user.favorite_plants) && user.favorite_plants.length > 0;

    return (
      <Card className="relative overflow-hidden bg-gradient-to-r from-pink-50/90 to-purple-50/90 backdrop-blur-sm border-pink-200/50">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-pink-200/20 via-purple-200/20 to-pink-200/20 animate-pulse"></div>
        <CardHeader className="flex flex-col space-y-1.5 p-6 relative">
          <CardTitle className="flex items-center gap-2 text-pink-800">
            <Heart className="w-5 h-5 text-pink-600" />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-center py-6">
            <Star className="w-12 h-12 text-pink-400 mx-auto mb-3" />
            {hasFavorites ?
            <>
                <p className="text-pink-700 mb-2">No personalized recommendations available today</p>
                <p className="text-pink-600 text-sm">
                  Based on your favorite plants: {user.favorite_plants.join(', ')}
                </p>
              </> :

            <>
                <p className="text-pink-700 font-semibold mb-2">Get personalized recommendations!</p>
                <p className="text-pink-600 text-sm mb-4">
                  Set your favorite plants in your profile to get AI suggestions tailored to you.
                </p>
                <Link to={createPageUrl("Profile")}>
                  <Button variant="outline" className="bg-slate-50 text-pink-700 px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border h-10 border-pink-300 hover:bg-pink-100 hover:text-pink-800">
                    Set Favorites
                  </Button>
                </Link>
              </>
            }
          </div>
        </CardContent>
      </Card>);

  }

  return (
    <>
      <Card className="relative overflow-hidden liquid-glass-card">
        {/* liquid glass effect background layers */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-pink-300/40 via-purple-400/40 via-blue-400/40 via-teal-300/40 to-pink-300/40 animate-spin-slow opacity-80"></div>
        <div className="absolute inset-[2px] rounded-lg bg-gradient-to-r from-pink-50/95 to-purple-50/95 backdrop-blur-sm"></div>
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-pink-200/30 via-purple-200/30 to-transparent animate-shimmer"></div>

        <CardHeader className="relative">
          <CardTitle className="flex items-center justify-between text-pink-800">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600 animate-pulse" />
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent font-bold">
                Recommended for You
              </span>
            </div>
            <Badge variant="outline" className="bg-pink-100/80 text-pink-700 border-pink-300/50 backdrop-blur-sm">
              {recommendations.length} AI suggestions
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {recommendations.map((plant) =>
            <Card key={plant.id} className="bg-white/80 border-pink-200 hover:border-pink-400 transition-all duration-300">
                <CardHeader className="p-2 md:p-4 pb-2 md:pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate text-xs md:text-sm leading-tight">{plant.name}</h3>
                      <p className="text-[10px] md:text-xs text-gray-600 italic truncate mt-0.5">{plant.botanical_name}</p>
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
                    {plant.score >= 10 &&
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] md:text-xs px-1.5 py-0.5">
                        <Star className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" />
                        Companion
                      </Badge>
                  }
                  </div>
                  <div className="space-y-1">
                    {plant.reasons.map((reason, index) =>
                  <p key={index} className="text-[10px] md:text-xs text-pink-700 bg-pink-100/50 rounded px-1.5 py-1">
                        • {reason}
                      </p>
                  )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-3 text-[10px] md:text-xs">
                    <div className="flex items-center gap-1">
                      <Sun className="w-2.5 h-2.5 md:w-3 md:h-3 text-amber-600" />
                      <span className="text-gray-600 capitalize truncate">
                        {plant.sun_requirements?.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Droplets className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-600" />
                      <span className="text-gray-600 capitalize truncate">
                        {plant.water_needs} Water
                      </span>
                    </div>
                  </div>
                  {plant.days_to_maturity &&
                <p className="text-[10px] md:text-xs text-gray-600">
                      <span className="font-medium">Harvest:</span> {plant.days_to_maturity} days
                    </p>
                }
                  <Button
                  size="sm"
                  className="w-full h-7 md:h-8 text-[10px] md:text-xs bg-pink-600 hover:bg-pink-700"
                  onClick={() => onAddPlant(plant)}>

                    <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    <span className="hidden sm:inline">Add to Garden</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>

      <style jsx global>{`
        :root {
          --liquid-glass-blur-min: 12px;
          --liquid-glass-blur-max: 18px;
          --liquid-glass-opacity-min: 0.4;
          --liquid-glass-opacity-max: 0.7;
          --liquid-glass-float-distance: 8px;
          --liquid-glass-float-duration: 6s;
          --liquid-glass-blur-duration: 4s;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes liquidGlassBlurPulse {
          0%, 100% {
            opacity: var(--liquid-glass-opacity-min);
          }
          50% {
            opacity: var(--liquid-glass-opacity-max);
          }
        }
        @keyframes floatUpDown {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(calc(-1 * var(--liquid-glass-float-distance)));
          }
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        /* Main liquid glass card */
        .liquid-glass-card {
          background: rgba(255 255 255 / 0.15);
          border: 1px solid rgba(255 255 255 / 0.3);
          backdrop-filter: blur(var(--liquid-glass-blur-min));
          box-shadow:
            inset 0 0 15px 5px rgba(255 255 255 / 0.2),
            0 4px 30px rgba(255 255 255 / 0.1);
          transition: backdrop-filter 0.3s ease;
          animation: liquidGlassBlurPulse var(--liquid-glass-blur-duration) ease-in-out infinite,
                     floatUpDown var(--liquid-glass-float-duration) ease-in-out infinite;
          border-radius: 1rem;
          position: relative;
          overflow: hidden;
        }
      `}</style>
      </Card>
    </>);

}
