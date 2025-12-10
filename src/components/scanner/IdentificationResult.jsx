import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Sun, Droplets, Thermometer, MapPin, Lightbulb, BrainCircuit, Leaf, Plus, CheckCircle } from 'lucide-react';

const confidenceColors = {
  High: "bg-green-100 text-green-800 border-green-300",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Low: "bg-orange-100 text-orange-800 border-orange-300"
};

export default function IdentificationResult({ identification, onReset, matchedPlant, onAddPlant, isPlantInGarden, imagePreview }) {
  const { common_name, botanical_name, plant_family, confidence, characteristics, care_instructions, interesting_facts, native_habitat } = identification;

  return (
    <div className="space-y-4">
      {/* Scanned Image */}
      {imagePreview && (
        <Card className="overflow-hidden border-border">
          <img 
            src={imagePreview} 
            alt="Scanned plant" 
            className="w-full h-48 object-cover"
          />
        </Card>
      )}

      {/* Main Result Card */}
      <Card className="bg-gradient-to-br from-green-50/50 to-emerald-50/30 border-green-200/50 dark:from-green-900/20 dark:to-emerald-900/10 dark:border-green-800/50">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Search className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl text-foreground mb-1 leading-tight">{common_name}</CardTitle>
              <p className="text-base italic text-muted-foreground mb-2">{botanical_name}</p>
              <div className="flex flex-wrap gap-2">
                {plant_family &&
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    {plant_family} Family
                  </Badge>
                }
                {confidence &&
                <Badge className={`${confidenceColors[confidence]} text-xs`}>
                    <BrainCircuit className="mr-1 h-3 w-3" />
                    {confidence}
                  </Badge>
                }
                {matchedPlant &&
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    In Library
                  </Badge>
                }
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Add to Garden Card */}
      {matchedPlant &&
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <h4 className="font-semibold text-green-800 text-base">Found in Plant Library!</h4>
              <p className="text-sm text-green-700 leading-relaxed">
                This {matchedPlant.category} is available in our library. Add it to your garden to track optimal planting times.
              </p>
              <Button
              onClick={() => onAddPlant(matchedPlant)}
              disabled={isPlantInGarden}
              size="lg"
              className={`w-full h-12 font-semibold ${
              isPlantInGarden ?
              "bg-green-100 text-green-800 cursor-not-allowed hover:bg-green-100" :
              "bg-green-600 hover:bg-green-700"}`
              }>

                {isPlantInGarden ?
              <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Added to Garden
                  </> :

              <>
                    <Plus className="w-5 h-5 mr-2" />
                    Add to My Garden
                  </>
              }
              </Button>
            </div>
          </CardContent>
        </Card>
      }

      {/* Characteristics */}
      {characteristics && characteristics.length > 0 &&
      <Card>
          <CardHeader className="pb-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
              <Leaf className="w-4 h-4 text-primary" /> Key Features
            </h3>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {characteristics.slice(0, 4).map((characteristic, index) =>
            <div key={index} className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{characteristic}</p>
                </div>
            )}
            </div>
          </CardContent>
        </Card>
      }

      {/* Care Instructions */}
      {care_instructions &&
      <Card>
          <CardHeader className="pb-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
              <Sun className="w-4 h-4 text-primary" /> Care Guide
            </h3>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3">
              {care_instructions.sunlight &&
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Sun className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800 text-sm">Light</span>
                  </div>
                  <p className="text-xs text-yellow-700 leading-relaxed">{care_instructions.sunlight}</p>
                </div>
            }
              {care_instructions.water &&
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800 text-sm">Water</span>
                  </div>
                  <p className="text-xs text-blue-700 leading-relaxed">{care_instructions.water}</p>
                </div>
            }
              {care_instructions.soil &&
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Leaf className="w-4 h-4 text-amber-600" />
                    <span className="font-medium text-amber-800 text-sm">Soil</span>
                  </div>
                  <p className="text-xs text-amber-700 leading-relaxed">{care_instructions.soil}</p>
                </div>
            }
              {care_instructions.temperature &&
            <div className="bg-red-50 rounded-lg p-3 border border-red-200/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Thermometer className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-red-800 text-sm">Temp</span>
                  </div>
                  <p className="text-xs text-red-700 leading-relaxed">{care_instructions.temperature}</p>
                </div>
            }
            </div>
          </CardContent>
        </Card>
      }

      {/* Native Habitat */}
      {native_habitat &&
      <Card>
          <CardHeader className="pb-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
              <MapPin className="w-4 h-4 text-primary" /> Natural Habitat
            </h3>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-sm text-muted-foreground leading-relaxed">{native_habitat}</p>
            </div>
          </CardContent>
        </Card>
      }

      {/* Fun Facts */}
      {interesting_facts && interesting_facts.length > 0 &&
      <Card>
          <CardHeader className="pb-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
              <Lightbulb className="w-4 h-4 text-primary" /> Did You Know?
            </h3>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {interesting_facts.slice(0, 3).map((fact, index) =>
            <div key={index} className="flex items-start gap-2 p-2 bg-purple-50/50 rounded-lg border border-purple-100">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-purple-700 leading-relaxed">{fact}</p>
                </div>
            )}
            </div>
          </CardContent>
        </Card>
      }

      {/* Action Button */}
      <div className="pt-2">
        <Button
          onClick={onReset}
          size="lg" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-8 w-full h-12 font-semibold shadow-lg shadow-primary/40 hover:shadow-xl hover:shadow-primary/50 focus:shadow-primary/50 transition-all duration-300 animate-pulse [animation-duration:4s]\n">


          Scan Another Plant
        </Button>
      </div>
    </div>);

}