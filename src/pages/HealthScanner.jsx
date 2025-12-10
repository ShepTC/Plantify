import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Plant } from '@/entities/Plant';
import { UserPlant } from '@/entities/UserPlant';
import { UploadFile, InvokeLLM } from '@/integrations/Core';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, Camera, Upload, AlertCircle, ShieldCheck, Search, Leaf, RefreshCw } from 'lucide-react';
import LoginPrompt from '../components/auth/LoginPrompt';
import PremiumMenu from '../components/premium/PremiumMenu';
import CameraView from '../components/scanner/CameraView';
import DiagnosisResult from '../components/scanner/DiagnosisResult';
import IdentificationResult from '../components/scanner/IdentificationResult';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Helper function to retry failed requests
const retryWithBackoff = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

export default function HealthScanner() {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedImagePreview, setCapturedImagePreview] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [identification, setIdentification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('health');
  const fileInputRef = React.useRef(null);

  // New state variables
  const [userPlants, setUserPlants] = useState([]);
  const [allPlants, setAllPlants] = useState([]);
  const [dataLoadFailed, setDataLoadFailed] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsInitializing(true);
    setDataLoadFailed(false);
    
    try {
      // Try to authenticate user with retry
      const currentUser = await retryWithBackoff(() => User.me(), 2, 500);
      setUser(currentUser);
      
      // Try to load plant data with retry, but don't fail if it doesn't work
      try {
        const [userPlantsData, allPlantsData] = await Promise.all([
          retryWithBackoff(() => UserPlant.filter({ created_by: currentUser.email }), 2, 500),
          retryWithBackoff(() => Plant.list(), 2, 500)
        ]);
        
        setUserPlants(userPlantsData);
        setAllPlants(allPlantsData);
        setDataLoadFailed(false);
      } catch (plantError) {
        console.error("Could not load plant data:", plantError);
        setDataLoadFailed(true);
        setUserPlants([]);
        setAllPlants([]);
      }
    } catch (authError) {
      console.error("Authentication failed:", authError);
      setUser(null);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (isCameraActive) {
      document.body.classList.add('camera-active');
    } else {
      document.body.classList.remove('camera-active');
    }
    
    return () => {
      document.body.classList.remove('camera-active');
    };
  }, [isCameraActive]);

  const handleImageCapture = (imageBlob) => {
    const file = new File([imageBlob], "plant_scan.jpg", { type: "image/jpeg" });
    setCapturedImage(file);
    setCapturedImagePreview(URL.createObjectURL(file));
    setIsCameraActive(false);
  };
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCapturedImage(file);
      setCapturedImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDiagnose = async () => {
    if (!capturedImage) return;
    setIsLoading(true);
    setError(null);
    setDiagnosis(null);

    try {
      const { file_url } = await UploadFile({ file: capturedImage });

      const prompt = `You are a plant pathologist and master gardener. Analyze the provided image of a plant. Identify any diseases, pests, or nutrient deficiencies. Provide a clear diagnosis, list the symptoms visible or likely, and suggest actionable, eco-friendly treatment steps. If the plant appears healthy, state that and provide general care tips.`;
      
      const responseSchema = {
        type: "object",
        properties: {
          is_healthy: { type: "boolean", description: "Is the plant healthy?" },
          issue_name: { type: "string", description: "Common name of the disease, pest, or deficiency. E.g., 'Powdery Mildew' or 'Aphid Infestation'. If healthy, say 'Healthy Plant'." },
          issue_type: { type: "string", enum: ["disease", "pest", "nutrient_deficiency", "healthy"], description: "The category of the issue."},
          confidence: { type: "string", enum: ["High", "Medium", "Low"], description: "Your confidence level in this diagnosis."},
          symptoms: { type: "array", items: { type: "string" }, description: "A list of observed or typical symptoms."},
          treatment_steps: { type: "array", items: { type: "object", properties: { step: {type: "string", description: "A single, actionable step."}, description: { type: "string", description: "A brief explanation of why this step is important."} } }, description: "An ordered list of treatment steps."},
          prevention_tips: { type: "array", items: { type: "string" }, description: "A list of tips to prevent this issue in the future."}
        },
        required: ["is_healthy", "issue_name", "issue_type", "symptoms", "treatment_steps"]
      };

      const result = await InvokeLLM({
        prompt,
        file_urls: [file_url],
        response_json_schema: responseSchema,
      });

      setDiagnosis(result);
    } catch (err) {
      console.error("Diagnosis failed:", err);
      setError("Sorry, the analysis failed. The AI may be experiencing high demand. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIdentify = async () => {
    if (!capturedImage) return;
    setIsLoading(true);
    setError(null);
    setIdentification(null);

    try {
      const { file_url } = await UploadFile({ file: capturedImage });

      const prompt = `You are a professional botanist and plant expert. Identify the plant in this image. Provide detailed information about the plant including its common name, botanical name, family, and key characteristics. Also include care instructions and interesting facts about the plant.`;
      
      const responseSchema = {
        type: "object",
        properties: {
          common_name: { type: "string", description: "The most common name for this plant" },
          botanical_name: { type: "string", description: "The scientific/botanical name" },
          plant_family: { type: "string", description: "The botanical family this plant belongs to" },
          confidence: { type: "string", enum: ["High", "Medium", "Low"], description: "Your confidence level in this identification" },
          characteristics: { type: "array", items: { type: "string" }, description: "Key identifying features of this plant" },
          care_instructions: { type: "object", properties: { 
            sunlight: { type: "string", description: "Sunlight requirements" },
            water: { type: "string", description: "Watering needs" },
            soil: { type: "string", description: "Soil preferences" },
            temperature: { type: "string", description: "Temperature requirements" }
          }},
          interesting_facts: { type: "array", items: { type: "string" }, description: "Interesting facts about this plant" },
          native_habitat: { type: "string", description: "Where this plant naturally grows" }
        },
        required: ["common_name", "botanical_name", "confidence", "characteristics"]
      };

      const result = await InvokeLLM({
        prompt,
        file_urls: [file_url],
        response_json_schema: responseSchema,
      });

      setIdentification(result);
    } catch (err) {
      console.error("Identification failed:", err);
      setError("Sorry, the plant identification failed. The AI may be experiencing high demand. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPlant = async (plant) => {
    if (!user || !user.email) {
      setError("User not logged in or email not available to add plant.");
      return;
    }
    try {
      const newUserPlant = await UserPlant.create({
        plant_id: plant.id,
        plant_name: plant.name,
        status: 'planned',
        created_by: user.email
      });
      setUserPlants(prev => [...prev, newUserPlant]);
      setError(null);
    } catch (error) {
      console.error("Error adding plant to garden:", error);
      setError("Failed to add plant to your garden. Please try again.");
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setCapturedImagePreview(null);
    setDiagnosis(null);
    setIdentification(null);
    setError(null);
  };

  const findMatchingPlant = (identificationResult) => {
    if (!identificationResult || !allPlants.length) return null;
    
    const { common_name, botanical_name } = identificationResult;
    
    let match = allPlants.find(plant => 
      plant.name && plant.name.toLowerCase() === common_name.toLowerCase()
    );
    
    if (!match) {
      match = allPlants.find(plant => 
        plant.name && (plant.name.toLowerCase().includes(common_name.toLowerCase()) ||
        common_name.toLowerCase().includes(plant.name.toLowerCase()))
      );
    }
    
    if (!match && botanical_name) {
      match = allPlants.find(plant => 
        plant.botanical_name && 
        plant.botanical_name.toLowerCase() === botanical_name.toLowerCase()
      );
    }
    
    return match;
  };

  const matchedPlant = identification ? findMatchingPlant(identification) : null;
  const userPlantIds = new Set(userPlants.map(p => p.plant_id));
  const isPlantInGarden = matchedPlant && userPlantIds.has(matchedPlant.id);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner message="Initializing scanner..." size="large" />
      </div>
    );
  }
  
  if (!user) return <LoginPrompt />;
  
  if (!user.is_premium) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <Card className="max-w-md">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
              <Sparkles className="h-8 w-8" />
            </div>
            <CardTitle>Unlock Plant AI Scanner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Plantify Pro feature: Health diagnosis & plant identification with AI.</p>
            <PremiumMenu />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCameraActive) {
    return <CameraView onCapture={handleImageCapture} onClose={() => setIsCameraActive(false)} />;
  }

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Mobile-First Design */}
      <div className="flex flex-col h-screen">
        {/* Header - Conditionally rendered: Hide when viewing results */}
        {!diagnosis && !identification && (
          <div className="flex-shrink-0 bg-gradient-to-b from-primary/5 to-background border-b border-border">
            <div className="px-4 pt-6 pb-4 text-center">
              <div className="relative inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-orange-900/40 border border-purple-400 dark:border-purple-700 rounded-full px-3 py-1.5 mb-3 shadow-[0_0_14px_rgba(168,85,247,0.5)] dark:shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span className="text-xs font-bold text-white">Pro Feature</span>
              </div>
              <h1 className="text-xl font-bold text-foreground mb-1">Plant AI Scanner</h1>
              <p className="text-sm text-muted-foreground">Snap a photo to diagnose or identify</p>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {dataLoadFailed && !diagnosis && !identification && (
              <Alert className="mb-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-800 dark:text-orange-300">Limited Functionality</AlertTitle>
                <AlertDescription className="text-sm text-orange-700 dark:text-orange-400 space-y-2">
                  <p>Unable to load plant library due to a network issue. The scanner will still work, but you won't be able to add identified plants to your garden.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadUserData}
                    className="mt-2 border-orange-300 text-orange-800 hover:bg-orange-100"
                  >
                    <RefreshCw className="w-3 h-3 mr-2" />
                    Try Again
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Tab Selector */}
            {!diagnosis && !identification && (
              <div className="grid w-full grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setActiveTab('health')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    activeTab === 'health' 
                      ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                      : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    activeTab === 'health' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Health Check</span>
                </button>
                <button
                  onClick={() => setActiveTab('identify')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    activeTab === 'identify' 
                      ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                      : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    activeTab === 'identify' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <Search className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Identify Plant</span>
                </button>
              </div>
            )}

            {/* Content based on active tab */}
            {activeTab === 'health' && (
              <div className="space-y-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center space-y-6 py-12 text-center">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <ShieldCheck className="absolute inset-0 m-auto h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground mb-2">Analyzing plant health...</p>
                      <p className="text-sm text-muted-foreground">Looking for signs of disease, pests, and nutrient deficiencies.</p>
                    </div>
                  </div>
                ) : diagnosis ? (
                  <DiagnosisResult diagnosis={diagnosis} onReset={handleReset} imagePreview={capturedImagePreview} />
                ) : capturedImagePreview ? (
                  <div className="space-y-4">
                    <Card className="overflow-hidden border-border">
                      <div className="relative">
                        <img 
                          src={capturedImagePreview} 
                          alt="Captured plant" 
                          className="w-full h-56 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <span className="text-white text-sm font-medium">Ready to analyze</span>
                          <Button 
                            onClick={handleReset} 
                            variant="secondary" 
                            size="sm"
                            className="h-8 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-0"
                          >
                            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                            Retake
                          </Button>
                        </div>
                      </div>
                    </Card>
                    <Button 
                      onClick={handleDiagnose} 
                      size="lg" 
                      className="w-full h-14 text-base font-semibold rounded-xl shadow-lg"
                    >
                      <ShieldCheck className="mr-2 h-5 w-5" /> 
                      Diagnose Plant Health
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Camera/Upload Card */}
                    <Card className="border-2 border-dashed border-primary/30 bg-primary/5 overflow-hidden">
                      <CardContent className="p-0">
                        {/* Mobile Camera Button */}
                        <button 
                          onClick={() => setIsCameraActive(true)} 
                          className="block md:hidden w-full p-8 text-center hover:bg-primary/10 transition-colors"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <Camera className="h-7 w-7" />
                          </div>
                          <p className="text-base font-semibold text-foreground mb-1">Tap to Open Camera</p>
                          <p className="text-xs text-muted-foreground">Take a clear photo of your plant</p>
                        </button>
                        
                        {/* Desktop Upload Button */}
                        <button 
                          onClick={() => fileInputRef.current?.click()} 
                          className="hidden md:block w-full p-8 text-center hover:bg-primary/10 transition-colors"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <Upload className="h-7 w-7" />
                          </div>
                          <p className="text-base font-semibold text-foreground mb-1">Click to Upload Image</p>
                          <p className="text-xs text-muted-foreground">Select a plant photo from your device</p>
                        </button>
                        <input 
                          type="file" 
                          accept="image/jpeg, image/png" 
                          ref={fileInputRef} 
                          onChange={handleFileChange} 
                          className="hidden" 
                        />
                      </CardContent>
                    </Card>
                    
                    {/* Info chips */}
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <div className="inline-flex items-center gap-1.5 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        Diseases
                      </div>
                      <div className="inline-flex items-center gap-1.5 bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        Pests
                      </div>
                      <div className="inline-flex items-center gap-1.5 bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        Nutrients
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'identify' && (
              <div className="space-y-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center space-y-6 py-12 text-center">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <Search className="absolute inset-0 m-auto h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground mb-2">Identifying plant...</p>
                      <p className="text-sm text-muted-foreground">Analyzing characteristics and matching with plant database.</p>
                    </div>
                  </div>
                ) : identification ? (
                  <IdentificationResult 
                    identification={identification} 
                    onReset={handleReset}
                    matchedPlant={matchedPlant}
                    onAddPlant={handleAddPlant}
                    isPlantInGarden={isPlantInGarden}
                    imagePreview={capturedImagePreview}
                  />
                ) : capturedImagePreview ? (
                  <div className="space-y-4">
                    <Card className="overflow-hidden border-border">
                      <div className="relative">
                        <img 
                          src={capturedImagePreview} 
                          alt="Captured plant" 
                          className="w-full h-56 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <span className="text-white text-sm font-medium">Ready to identify</span>
                          <Button 
                            onClick={handleReset} 
                            variant="secondary" 
                            size="sm"
                            className="h-8 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-0"
                          >
                            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                            Retake
                          </Button>
                        </div>
                      </div>
                    </Card>
                    <Button 
                      onClick={handleIdentify} 
                      size="lg" 
                      className="w-full h-14 text-base font-semibold rounded-xl shadow-lg"
                    >
                      <Search className="mr-2 h-5 w-5" /> 
                      Identify This Plant
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Camera/Upload Card */}
                    <Card className="border-2 border-dashed border-primary/30 bg-primary/5 overflow-hidden">
                      <CardContent className="p-0">
                        {/* Mobile Camera Button */}
                        <button 
                          onClick={() => setIsCameraActive(true)} 
                          className="block md:hidden w-full p-8 text-center hover:bg-primary/10 transition-colors"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <Camera className="h-7 w-7" />
                          </div>
                          <p className="text-base font-semibold text-foreground mb-1">Tap to Open Camera</p>
                          <p className="text-xs text-muted-foreground">Take a clear photo of your plant</p>
                        </button>
                        
                        {/* Desktop Upload Button */}
                        <button 
                          onClick={() => fileInputRef.current?.click()} 
                          className="hidden md:block w-full p-8 text-center hover:bg-primary/10 transition-colors"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <Upload className="h-7 w-7" />
                          </div>
                          <p className="text-base font-semibold text-foreground mb-1">Click to Upload Image</p>
                          <p className="text-xs text-muted-foreground">Select a plant photo from your device</p>
                        </button>
                        <input 
                          type="file" 
                          accept="image/jpeg, image/png" 
                          ref={fileInputRef} 
                          onChange={handleFileChange} 
                          className="hidden" 
                        />
                      </CardContent>
                    </Card>
                    
                    {/* Info chips */}
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <div className="inline-flex items-center gap-1.5 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm">
                        <Leaf className="w-3 h-3" />
                        Species ID
                      </div>
                      <div className="inline-flex items-center gap-1.5 bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm">
                        <Search className="w-3 h-3" />
                        Care Guide
                      </div>
                      <div className="inline-flex items-center gap-1.5 bg-purple-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm">
                        <Sparkles className="w-3 h-3" />
                        Fun Facts
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}