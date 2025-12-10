import React, { useState, useEffect } from "react";
import { Plant } from "@/entities/Plant";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Plus, Search } from "lucide-react";

export default function FavoritePlantsSelector({ selectedPlants = [], onChange }) {
  const [commonNames, setCommonNames] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    loadPlants();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() && searchQuery.length >= 1) {
      const filtered = commonNames
        .filter(name => 
          name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !selectedPlants.includes(name)
        )
        .slice(0, 8);
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [searchQuery, selectedPlants, commonNames]);

  const loadPlants = async () => {
    try {
      const plants = await Plant.list();
      // Extract unique common_name values, falling back to name if common_name is not set
      const names = new Set();
      plants.forEach(plant => {
        const commonName = plant.common_name || plant.name;
        names.add(commonName);
      });
      // Sort alphabetically
      setCommonNames([...names].sort());
    } catch (error) {
      console.error("Error loading plants:", error);
    }
  };

  const handleAddPlant = (plantName) => {
    if (!selectedPlants.includes(plantName)) {
      onChange([...selectedPlants, plantName]);
    }
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleRemovePlant = (plantName) => {
    onChange(selectedPlants.filter(name => name !== plantName));
  };

  return (
    <div className="space-y-3">
      {/* Selected Plants Display */}
      {selectedPlants.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedPlants.map(plantName => (
            <Badge 
              key={plantName} 
              variant="secondary" 
              className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary border-primary/20"
            >
              {plantName}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive/20"
                onClick={() => handleRemovePlant(plantName)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search and add favorite plants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <Card className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-y-auto bg-card border-border">
            {filteredSuggestions.map(name => (
              <div
                key={name}
                className="px-4 py-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0 flex items-center justify-between"
                onClick={() => handleAddPlant(name)}
              >
                <p className="font-medium text-foreground">{name}</p>
                <Plus className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </Card>
        )}
      </div>

      {selectedPlants.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Start typing to search and add your favorite plants
        </p>
      )}
    </div>
  );
}