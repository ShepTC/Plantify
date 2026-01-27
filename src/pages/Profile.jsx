import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { User } from "@/entities/User";
import { UploadFile } from "@/integrations/Core"; // Added UploadFile import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  User as UserIcon,
  MapPin,
  Leaf,
  Sun,
  Moon,
  Settings,
  Loader2,
  CheckCircle,
  Camera,
  Thermometer,
  ChevronRight,
  Cloud,
  LogOut } from
"lucide-react";
// motion is still used for the loading screen, keep it

import LocationSelector from "../components/profile/LocationSelector";
import LoginPrompt from "../components/auth/LoginPrompt";
import FavoritePlantsSelector from "../components/profile/FavoritePlantsSelector";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { syncGoogleCalendar } from "@/functions/syncGoogleCalendar";
import { useToast } from "@/components/ui/use-toast";

export default function Profile() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    location: null,
    growing_zone: '',
    garden_size: '',
    experience_level: '',
    favorite_plants: [],
    garden_goals: '',
    theme: 'light',
    color_palette: 'default',
    temperature_unit: 'celsius',
    profile_picture: null // Added profile_picture to form data
  });
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'success', 'error'
  const [isUploadingImage, setIsUploadingImage] = useState(false); // New state for image upload status
  const isInitialMount = useRef(true); // Ref to prevent useEffect from running on initial mount
  const fileInputRef = useRef(null); // Ref for hidden file input
  const [isSyncing, setIsSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);
  const { toast } = useToast();

  const applyThemeToDocument = (newTheme, newPalette = formData.color_palette) => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.documentElement.setAttribute('data-palette', newPalette);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (location.hash === '#garden-goals') {
      const element = document.getElementById('garden-goals-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [location]);

  const loadUserData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      const loadedTheme = currentUser.theme || 'light';
      const loadedPalette = currentUser.color_palette || 'default';

      setFormData({
        location: currentUser.location || null,
        growing_zone: currentUser.growing_zone || '',
        garden_size: currentUser.garden_size || '',
        experience_level: currentUser.experience_level || '',
        favorite_plants: Array.isArray(currentUser.favorite_plants) ? currentUser.favorite_plants : [],
        garden_goals: currentUser.garden_goals || '',
        theme: loadedTheme,
        color_palette: loadedPalette,
        temperature_unit: currentUser.temperature_unit || 'celsius',
        profile_picture: currentUser.profile_picture || null // Set profile picture from current user
      });
      applyThemeToDocument(loadedTheme, loadedPalette);
    } catch (error) {
      console.error("Error loading user data:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const autoSave = async (data) => {
    setSaveStatus('saving');
    try {
      await User.updateMyUserData(data);

      // Dispatch event if theme or palette changed, so other components can react
      if (data.theme !== user?.theme || data.color_palette !== user?.color_palette) {
        window.dispatchEvent(new CustomEvent('theme-updated'));
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2500); // Show success for 2.5 seconds
    } catch (error) {
      console.error("Error auto-saving profile:", error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 5000); // Show error for 5 seconds
    }
  };

  useEffect(() => {
    // Prevent auto-save from running on the initial render when data is loaded
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Removed 'typing' status as per outline
    const handler = setTimeout(() => {
      autoSave(formData);
    }, 1500); // 1.5 second debounce delay before saving

    // Cleanup function: clear the timeout if formData changes again before the delay
    return () => {
      clearTimeout(handler);
    };
  }, [formData]); // This effect runs whenever formData changes

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB.');
      return;
    }

    setIsUploadingImage(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData((prev) => ({
        ...prev,
        profile_picture: file_url
      }));
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (locationData, detectedZone) => {
    setFormData((prev) => ({
      ...prev,
      location: locationData,
      growing_zone: detectedZone
    }));
  };

  const handleThemeChange = (newTheme) => {
    // Apply theme immediately for visual feedback
    applyThemeToDocument(newTheme, formData.color_palette);
    // Update state, which will trigger auto-save via useEffect
    setFormData((prev) => ({ ...prev, theme: newTheme }));
  };

  const handlePaletteChange = (newPalette) => {
    // Apply palette immediately for visual feedback
    applyThemeToDocument(formData.theme, newPalette);
    // Update state, which will trigger auto-save via useEffect
    setFormData((prev) => ({ ...prev, color_palette: newPalette }));
  };

  const handleSyncGoogleCalendar = async () => {
    setIsSyncing(true);
    try {
      const response = await syncGoogleCalendar({ action: 'sync' });
      
      if (response.data.success) {
        const { created, updated, errors } = response.data.results;
        
        const toastId = toast({
          title: "Google Calendar Synced",
          description: `Created ${created} events, updated ${updated} events${errors.length > 0 ? `, ${errors.length} errors` : ''}`,
        });
        
        // Auto dismiss after 3 seconds
        setTimeout(() => {
          if (toastId?.dismiss) toastId.dismiss();
        }, 3000);
        
        // Hide card after success
        setJustSynced(true);
        setTimeout(() => setJustSynced(false), 3000);
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      const toastId = toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync with Google Calendar",
        variant: "destructive",
      });
      
      setTimeout(() => {
        if (toastId?.dismiss) toastId.dismiss();
      }, 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4 md:p-6 flex items-center justify-center">
        <LoadingSpinner message="Loading your profile..." size="large" />
      </div>
    );
  }

  if (!user) {
    return <LoginPrompt />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-3 md:p-6 pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-8">

        {/* Header Card with Profile Picture */}
        <Card className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border-primary/20 overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-4 md:gap-6">
              {/* Profile Picture */}
              <div className="relative group flex-shrink-0">
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl overflow-hidden bg-primary"
                  onClick={handleProfilePictureClick}>
                  {isUploadingImage ?
                    <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-primary-foreground animate-spin" /> :
                    formData.profile_picture ?
                      <>
                        <img
                          src={formData.profile_picture}
                          alt="Profile"
                          className="w-full h-full object-cover" />
                        <div className="bg-black/40 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-2xl">
                          <Camera className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                      </> :
                      <>
                        <UserIcon className="w-6 h-6 md:w-8 md:h-8 text-primary-foreground" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-2xl">
                          <Camera className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                      </>
                  }
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden" />

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-xl font-bold text-foreground truncate">{user?.full_name || 'Welcome'}</h1>
                <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                {/* Save Status Indicator */}
                <div className="h-4 mt-1">
                  {saveStatus === 'saving' && <p className="text-xs text-muted-foreground flex items-center gap-1.5 animate-pulse"><Loader2 className="w-3 h-3 animate-spin" /> Saving...</p>}
                  {saveStatus === 'success' && <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> Saved</p>}
                  {saveStatus === 'error' && <p className="text-xs text-destructive">Error saving</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Google Calendar Sync */}
        {!justSynced && (
        <Card className="bg-card border-border overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-red-500/5 via-yellow-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 rounded-lg shadow-[inset_0_0_20px_rgba(66,133,244,0.1)] dark:shadow-[inset_0_0_25px_rgba(66,133,244,0.15)] opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-4 md:p-6 relative z-10">
            <button
              onClick={handleSyncGoogleCalendar}
              disabled={isSyncing}
              className="w-full flex items-center justify-between p-3 md:p-4 rounded-xl border-2 border-border hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group/btn">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-red-500/10 to-yellow-500/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-100 flex items-center justify-center flex-shrink-0 shadow-md">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/fe6c37c78_google-logo-g-suite-google-9820d64d83b313b7a901dcc7f6052ee6.png"
                    alt="Google"
                    className={`w-6 h-6 ${isSyncing ? 'animate-pulse' : ''}`}
                  />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-foreground text-sm">Google Calendar</h3>
                  <p className="text-xs text-muted-foreground">
                    {isSyncing ? 'Syncing events...' : 'Sync your plants to calendar'}
                  </p>
                </div>
              </div>
              {isSyncing ? (
                <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0 relative z-10" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 relative z-10" />
              )}
            </button>
          </CardContent>
        </Card>
        )}

        {/* App Settings */}
        <Card className="bg-card border-border">
          <CardHeader className="p-4 md:p-6 pb-2 md:pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground text-base md:text-lg">
              <Settings className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-2 space-y-5">
            {/* Theme Toggle */}
            <div className="space-y-2">
              <Label className="text-xs md:text-sm text-muted-foreground">Theme</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    formData.theme === 'light' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}>
                  <Sun className="w-4 h-4" />
                  <span className="text-sm font-medium">Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    formData.theme === 'dark' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}>
                  <Moon className="w-4 h-4" />
                  <span className="text-sm font-medium">Dark</span>
                </button>
              </div>
            </div>

            {/* Color Palette */}
            <div className="space-y-2">
              <Label className="text-xs md:text-sm text-muted-foreground">Color Palette</Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: 'default', gradient: 'from-green-500 to-emerald-600', label: 'Garden' },
                  { key: 'pastel', gradient: 'from-pink-400 to-purple-500', label: 'Pastel' },
                  { key: 'ocean', gradient: 'from-blue-500 to-teal-500', label: 'Ocean' },
                  { key: 'sunset', gradient: 'from-orange-500 to-red-500', label: 'Sunset' }
                ].map((palette) => (
                  <button
                    key={palette.key}
                    type="button"
                    onClick={() => handlePaletteChange(palette.key)}
                    className={`flex flex-col items-center gap-1.5 p-2 md:p-3 rounded-xl border-2 transition-all ${
                      formData.color_palette === palette.key 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}>
                    <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br ${palette.gradient} shadow-md`} />
                    <span className="text-[10px] md:text-xs font-medium">{palette.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Temperature Unit */}
            <div className="space-y-2">
              <Label className="text-xs md:text-sm text-muted-foreground flex items-center gap-2">
                <Thermometer className="w-3 h-3" />
                Temperature
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleInputChange('temperature_unit', 'celsius')}
                  className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                    formData.temperature_unit === 'celsius' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}>
                  °C Celsius
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('temperature_unit', 'fahrenheit')}
                  className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                    formData.temperature_unit === 'fahrenheit' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}>
                  °F Fahrenheit
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location & Zone */}
        <Card className="bg-card border-border">
          <CardHeader className="p-4 md:p-6 pb-2 md:pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground text-base md:text-lg">
              <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              Location & Growing Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-2">
            <LocationSelector
              currentLocation={formData.location}
              onLocationChange={handleLocationChange} />
          </CardContent>
        </Card>

        {/* Garden Settings */}
        <Card className="bg-card border-border">
          <CardHeader className="p-4 md:p-6 pb-2 md:pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground text-base md:text-lg">
              <Leaf className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              Garden Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-2 space-y-5">
            {/* Favorite Plants */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Favorite Plants</Label>
              <FavoritePlantsSelector
                selectedPlants={formData.favorite_plants}
                onChange={(plants) => handleInputChange('favorite_plants', plants)} />
            </div>

            {/* Garden Goals */}
            <div id="garden-goals-section" className="space-y-2 scroll-mt-24">
              <Label className="text-xs text-muted-foreground">Garden Goals</Label>
              <Textarea
                id="garden_goals"
                placeholder="What do you hope to achieve with your garden this year?"
                value={formData.garden_goals}
                onChange={(e) => handleInputChange('garden_goals', e.target.value)}
                className="h-20 text-sm resize-none rounded-xl" />
            </div>
          </CardContent>
        </Card>

        {/* Request a Plant */}
        <Link to={createPageUrl("RequestPlant")} className="block">
          <Card className="bg-gradient-to-br from-secondary/10 via-primary/5 to-accent/10 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-base">🌱</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm">Missing a plant?</h3>
                  <p className="text-xs text-muted-foreground truncate">Request it to be added</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Location Help - Only shown if no location set */}
        {!formData.location && (
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm">Set Your Location</h3>
                  <p className="text-xs text-muted-foreground">
                    Add your location to get personalized planting recommendations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Logout Button */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <Button
              variant="outline"
              onClick={() => User.logout()}
              className="w-full flex items-center justify-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 hover:border-destructive">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>);
}