import React, { useState, useEffect } from "react";
import { PlantRequest } from "@/entities/PlantRequest";
import { Plant } from "@/entities/Plant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Send, CheckCircle, ArrowLeft, AlertCircle, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { motion } from "framer-motion";
import ThemePlantLogo from "../components/common/ThemePlantLogo";

export default function RequestPlant() {
  const [plantName, setPlantName] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [existingPlants, setExistingPlants] = useState([]);
  const [existingRequests, setExistingRequests] = useState([]);
  const [duplicateType, setDuplicateType] = useState(null); // 'library' or 'requested'

  useEffect(() => {
    const loadData = async () => {
      const [plants, requests] = await Promise.all([
        Plant.list(),
        PlantRequest.list()
      ]);
      setExistingPlants(plants.map(p => p.name.toLowerCase()));
      setExistingRequests(requests.map(r => r.plant_name.toLowerCase()));
    };
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!plantName.trim()) return;

    const normalizedName = plantName.trim().toLowerCase();
    
    // Check if plant already exists in library
    if (existingPlants.some(p => p.includes(normalizedName) || normalizedName.includes(p))) {
      setDuplicateType('library');
      return;
    }
    
    // Check if plant was already requested
    if (existingRequests.some(r => r.includes(normalizedName) || normalizedName.includes(r))) {
      setDuplicateType('requested');
      return;
    }

    setIsSubmitting(true);
    await PlantRequest.create({
      plant_name: plantName.trim(),
      details: details.trim(),
      status: "pending"
    });
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleSubmitAnother = () => {
    setPlantName("");
    setDetails("");
    setIsSubmitted(false);
    setDuplicateType(null);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 pb-24">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Back Button */}
        <Link to={createPageUrl("Profile")} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>

        {/* Header */}
        <div className="text-center space-y-2 py-4">
          <div className="w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center mx-auto">
            <ThemePlantLogo className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Request a Plant</h1>
          <p className="text-sm text-muted-foreground">
            Can't find a plant? Let us know and we'll add it!
          </p>
        </div>

        {/* Duplicate Message */}
        {duplicateType ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className={`border-2 ${duplicateType === 'library' ? 'border-primary/30 bg-primary/5' : 'border-amber-500/30 bg-amber-500/5 dark:border-amber-400/30 dark:bg-amber-400/5'}`}>
              <CardContent className="p-6 text-center space-y-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${duplicateType === 'library' ? 'bg-primary/20' : 'bg-amber-500/20 dark:bg-amber-400/20'}`}>
                  {duplicateType === 'library' ? (
                    <BookOpen className="w-8 h-8 text-primary" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-amber-500 dark:text-amber-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {duplicateType === 'library' ? 'Already in Library!' : 'Already Requested!'}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {duplicateType === 'library' 
                      ? `"${plantName}" is already available in our plant library.`
                      : `"${plantName}" has already been requested and is being reviewed.`
                    }
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  {duplicateType === 'library' && (
                    <Link to={createPageUrl("PlantLibrary")}>
                      <Button className="w-full">
                        Browse Plant Library
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={handleSubmitAnother}
                  >
                    Try a Different Plant
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Request Submitted!</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Thanks for your suggestion. We'll review it soon.
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Button onClick={handleSubmitAnother} variant="outline">
                    Request Another Plant
                  </Button>
                  <Link to={createPageUrl("PlantLibrary")}>
                    <Button variant="ghost" className="w-full">
                      Browse Plant Library
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Plant Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="plantName" className="text-sm">Plant Name *</Label>
                  <Input
                    id="plantName"
                    placeholder="e.g., Dragon Fruit, Lemongrass..."
                    value={plantName}
                    onChange={(e) => setPlantName(e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="details" className="text-sm">Additional Details (optional)</Label>
                  <Textarea
                    id="details"
                    placeholder="Any specific variety or notes..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={!plantName.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}