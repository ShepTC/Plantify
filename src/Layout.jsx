import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { User } from "@/entities/User";
import {
  Calendar,
  Home,
  Leaf,
  BookOpen,
  Settings,
  Sprout,
  Sun,
  Moon,
  Clock,
  Sparkles } from
"lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger } from
"@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import BottomNavBar from "./components/layout/BottomNavBar";
import PremiumBadge from "./components/premium/PremiumBadge";
import PremiumMenu from "./components/premium/PremiumMenu";
import MobilePremiumUpsell from './components/premium/MobilePremiumUpsell';

const navigationItems = [
{ title: "Dashboard", url: createPageUrl("Dashboard"), icon: Home },
{ title: "Plant Today", url: createPageUrl("PlantingAlerts"), icon: Clock },
{ title: "My Garden", url: createPageUrl("MyGarden"), icon: Sprout },
{ title: "Plant Library", url: createPageUrl("PlantLibrary"), icon: BookOpen },
{ title: "Calendar", url: createPageUrl("Calendar"), icon: Calendar },
{ title: "Profile", url: createPageUrl("Profile"), icon: Settings }];


export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const currentWeek = Math.ceil(
    (new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (
    7 * 24 * 60 * 60 * 1000)
  );

  const [user, setUser] = useState(null);
  // Initialize theme and palette from localStorage immediately to prevent flash
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('user-theme');
    return savedTheme || "light";
  });
  const [colorPalette, setColorPalette] = useState(() => {
    const savedPalette = localStorage.getItem('user-palette');
    return savedPalette || "default";
  });
  const [isUpsellModalOpen, setIsUpsellModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Apply theme immediately on component mount and when theme/palette changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove("light", "dark", "pastel", "ocean", "sunset");
    
    // Apply theme class
    root.classList.add(theme);
    
    // Apply color palette class if different from default
    if (colorPalette && colorPalette !== 'default') {
      root.classList.add(colorPalette);
    }
    
    // Set data attribute for palette, useful for components that need to react to it
    document.documentElement.setAttribute('data-palette', colorPalette || 'default');
    document.documentElement.setAttribute("data-theme", theme);
    
  }, [theme, colorPalette]);

  // Make loadUserAndTheme stable with useCallback
  const loadUserAndTheme = useCallback(async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      if (currentUser?.theme) {
        setTheme(currentUser.theme);
        localStorage.setItem('user-theme', currentUser.theme);
      }
      if (currentUser?.color_palette) {
        setColorPalette(currentUser.color_palette);
        localStorage.setItem('user-palette', currentUser.color_palette);
      }
    } catch (error) {
      console.log("Not logged in");
      setTheme('light');
      setColorPalette('default');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Updated useEffect for loading user and theme, with stable dependency
  useEffect(() => {
    loadUserAndTheme();

    const handleThemeUpdate = () => loadUserAndTheme();
    window.addEventListener("theme-updated", handleThemeUpdate);

    return () => {
      window.removeEventListener("theme-updated", handleThemeUpdate);
    };
  }, [loadUserAndTheme]);

  // New useEffect for the upsell modal logic
  useEffect(() => {
    const checkUpsell = async () => {
      if (user && !user.is_premium) {
        const lastShown = localStorage.getItem('lastPremiumUpsellShown');
        const threeDaysAgo = new Date().getTime() - (3 * 24 * 60 * 60 * 1000);
        
        if (!lastShown || parseInt(lastShown) < threeDaysAgo) {
          setTimeout(() => {
            setIsUpsellModalOpen(true);
          }, 3000);
        }
      }
    };

    checkUpsell();
  }, [user]);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem('user-theme', newTheme);
    if (user) {
      try {
        await User.updateMyUserData({ theme: newTheme });
      } catch (error) {
        console.error("Failed to save theme preference:", error);
      }
    }
  };

  const handleDismissUpsell = () => {
    localStorage.setItem('lastPremiumUpsellShown', new Date().getTime().toString());
    setIsUpsellModalOpen(false);
  };

  const getDesktopLogoUrl = () => {
    // If it's dark mode, switch based on the color palette
    if (theme === 'dark') {
      switch (colorPalette) {
        case 'pastel':
          return "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/09bd409fd_PastelLogoDarkMode.png";
        case 'ocean':
          return "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/107660f36_OceanLogoDarkMode.png";
        case 'sunset':
          return "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/9226768b1_SunsetLogoDarkMode.png";
        case 'default':
        default:
          return "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f2bf2dcc5_PlantifyLogoDarkMode.png";
      }
    }

    // If it's light mode, switch based on the color palette
    switch (colorPalette) {
      case 'pastel':
        return "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/5f86b0ce9_LightmodePastel.png";
      case 'ocean':
        return "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/7ae11be17_LightModeOcean.png";
      case 'sunset':
        return "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/3e4ca99a6_LightModeSunset.png";
      case 'default':
      default:
        return "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/9c3228a56_PlantifyLogoLightMode.png";
    }
  };
  
  const getIconLogoUrl = () => {
    switch (colorPalette) {
      case 'pastel':
        return "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/bee4fbc3e_PlantifyPastelLogo.png";
      case 'ocean':
        return "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/6ff3caca3_PlantifyOceanLogo.png";
      case 'sunset':
        return "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/046b7b36c_PlantifySunsetLogo.png";
      case 'default':
      default:
        return "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/04c895d97_PlantifyGardenLogo.png";
    }
  };

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --background: 42 45% 100%;
          --foreground: 28 25% 8%;
          --card: 42 45% 96%;
          --card-foreground: 28 25% 8%;
          --popover: 42 45% 96%;
          --popover-foreground: 28 25% 8%;
          --primary: 95 60% 40%;
          --primary-foreground: 42 45% 100%;
          --secondary: 35 65% 48%;
          --secondary-foreground: 42 45% 100%;
          --muted: 40 30% 85%;
          --muted-foreground: 28 25% 35%;
          --accent: 110 55% 45%;
          --accent-foreground: 42 45% 100%;
          --destructive: 8 85% 50%;
          --destructive-foreground: 42 45% 100%;
          --border: 40 25% 75%;
          --input: 40 25% 75%;
          --ring: 95 60% 40%;
        }
        .dark {
          --background: 30 18% 5%;
          --foreground: 42 25% 98%;
          --card: 32 20% 10%;
          --card-foreground: 42 25% 98%;
          --popover: 30 18% 5%;
          --popover-foreground: 42 25% 98%;
          --primary: 100 65% 62%;
          --primary-foreground: 30 18% 5%;
          --secondary: 38 75% 65%;
          --secondary-foreground: 30 18% 5%;
          --muted: 30 15% 22%;
          --muted-foreground: 40 12% 75%;
          --accent: 115 58% 60%;
          --accent-foreground: 30 18% 5%;
          --destructive: 8 80% 58%;
          --destructive-foreground: 42 25% 98%;
          --border: 32 15% 28%;
          --input: 32 15% 28%;
          --ring: 100 65% 62%;
        }

        /* --- PASTEL PALETTE --- */
        :root[data-palette="pastel"] {
          --background: 45 35% 100%;
          --foreground: 25 30% 8%;
          --card: 42 30% 96%;
          --card-foreground: 25 30% 8%;
          --popover: 42 30% 96%;
          --popover-foreground: 25 30% 8%;
          --primary: 270 75% 48%;
          --primary-foreground: 0 0% 100%;
          --secondary: 285 70% 56%;
          --secondary-foreground: 0 0% 100%;
          --muted: 40 25% 82%;
          --muted-foreground: 25 20% 30%;
          --accent: 260 80% 50%;
          --accent-foreground: 0 0% 100%;
          --border: 40 20% 72%;
          --input: 40 20% 72%;
          --ring: 270 75% 48%;
        }
        .dark[data-palette="pastel"] {
          --background: 30 22% 5%;
          --foreground: 45 25% 98%;
          --card: 32 20% 11%;
          --card-foreground: 45 25% 98%;
          --popover: 30 22% 5%;
          --popover-foreground: 45 25% 98%;
          --primary: 270 80% 68%;
          --primary-foreground: 0 0% 100%;
          --secondary: 285 75% 70%;
          --secondary-foreground: 0 0% 100%;
          --muted: 30 18% 24%;
          --muted-foreground: 40 12% 80%;
          --accent: 260 85% 65%;
          --accent-foreground: 0 0% 100%;
          --border: 32 15% 32%;
          --input: 32 15% 32%;
          --ring: 270 80% 68%;
        }

        /* --- OCEAN PALETTE --- */
        :root[data-palette="ocean"] {
          --background: 195 35% 100%;
          --foreground: 195 25% 10%;
          --card: 195 30% 96%;
          --card-foreground: 195 25% 10%;
          --popover: 195 30% 96%;
          --popover-foreground: 195 25% 10%;
          --primary: 168 50% 42%;
          --primary-foreground: 195 35% 100%;
          --secondary: 42 65% 50%;
          --secondary-foreground: 195 25% 10%;
          --muted: 195 25% 82%;
          --muted-foreground: 195 15% 32%;
          --accent: 85 50% 45%;
          --accent-foreground: 195 25% 10%;
          --border: 195 22% 72%;
          --input: 195 22% 72%;
          --ring: 168 50% 42%;
        }
        .dark[data-palette="ocean"] {
          --background: 195 22% 6%;
          --foreground: 195 20% 96%;
          --card: 195 20% 12%;
          --card-foreground: 195 20% 96%;
          --popover: 195 22% 6%;
          --popover-foreground: 195 20% 96%;
          --primary: 170 52% 62%;
          --primary-foreground: 195 22% 6%;
          --secondary: 45 72% 68%;
          --secondary-foreground: 195 22% 6%;
          --muted: 195 18% 26%;
          --muted-foreground: 195 10% 78%;
          --accent: 88 52% 62%;
          --accent-foreground: 195 20% 96%;
          --border: 195 18% 32%;
          --input: 195 18% 32%;
          --ring: 170 52% 62%;
        }

        /* --- SUNSET PALETTE --- */
        :root[data-palette="sunset"] {
          --background: 38 48% 100%;
          --foreground: 20 30% 8%;
          --card: 36 45% 96%;
          --card-foreground: 20 30% 8%;
          --popover: 36 45% 96%;
          --popover-foreground: 20 30% 8%;
          --primary: 15 75% 50%;
          --primary-foreground: 38 48% 100%;
          --secondary: 48 78% 55%;
          --secondary-foreground: 20 30% 8%;
          --muted: 38 35% 82%;
          --muted-foreground: 20 20% 32%;
          --accent: 82 55% 48%;
          --accent-foreground: 20 30% 8%;
          --border: 36 30% 72%;
          --input: 36 30% 72%;
          --ring: 15 75% 50%;
        }
        .dark[data-palette="sunset"] {
          --background: 22 24% 6%;
          --foreground: 38 25% 96%;
          --card: 25 22% 11%;
          --card-foreground: 38 25% 96%;
          --popover: 22 24% 6%;
          --popover-foreground: 38 25% 96%;
          --primary: 18 76% 68%;
          --primary-foreground: 22 24% 6%;
          --secondary: 50 78% 70%;
          --secondary-foreground: 22 24% 6%;
          --muted: 22 18% 26%;
          --muted-foreground: 35 10% 78%;
          --accent: 85 56% 66%;
          --accent-foreground: 38 25% 96%;
          --border: 25 18% 32%;
          --input: 25 18% 32%;
          --ring: 18 76% 68%;
        }
        
        body.camera-active .bottom-nav-bar {
          display: none;
        }
      `}</style>

      <div className="min-h-screen flex w-full bg-background text-foreground">
        {/* Sidebar for Desktop */}
        <Sidebar className="hidden md:flex border-r border-border bg-card">
          <SidebarHeader className="flex-col gap-2 border-b border-border p-2 flex justify-center items-center">
            <div className="w-full max-w-[200px]">
              <img
                src={getDesktopLogoUrl()}
                alt="Plantify Logo" 
                className="mx-2 w-[90%] h-auto object-contain" />
            </div>
          </SidebarHeader>

          <SidebarContent className="group-data-[collapsible=icon]:overflow-hidden flex min-h-0 flex-1 flex-col gap-0 overflow-auto p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) =>
                  <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                      asChild
                      className={`hover:bg-muted hover:text-primary transition-all duration-200 rounded-xl mb-1 font-medium ${
                      location.pathname === item.url ?
                      "bg-primary text-primary-foreground shadow-md" :
                      "text-muted-foreground"}`
                      }>

                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Premium / Upgrade Card - Desktop */}
            {user && (
            user.is_premium ?
            <Popover>
                  <PopoverTrigger asChild>
                    <div className="px-3 py-2 mt-4 cursor-pointer">
                      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700 hover:border-primary transition-colors">
                        <PremiumBadge size="large" className="justify-center mb-2" />
                        <p className="text-center text-xs text-muted-foreground">
                          You have access to Plantify Pro features
                        </p>
                      </div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                  side="right"
                  align="start" className="bg-card text-popover-foreground px-6 py-6 z-50 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 w-[380px] rounded-xl shadow-xl border border-border">


                    <PremiumMenu />
                  </PopoverContent>
                </Popover> :

            <Link to={createPageUrl("Upgrade")} className="block px-3 py-2 mt-4">
                  <div className="cursor-pointer">
                    <div className="bg-gradient-to-r from-muted/50 to-muted-foreground/10 rounded-lg p-4 border border-border hover:border-primary transition-colors">
                      <div className="flex justify-center items-center gap-2 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-base bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                          Go Plantify Pro
                        </span>
                      </div>
                      <p className="text-center text-xs text-muted-foreground">
                        Unlock AI tools for your garden!
                      </p>
                    </div>
                  </div>
                </Link>)

            }

            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                This Week
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-2 space-y-3">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <Sun className="w-4 h-4 text-secondary" />
                      <span className="font-medium text-foreground">Week {currentWeek}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Check your dashboard for planting recommendations
                    </p>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-border p-4 bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img
                  src={getIconLogoUrl()}
                  alt="Plantify Logo"
                  className="w-8 h-8 object-contain" />

              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">Happy Gardening!</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.location?.city ?
                  <>📍 {user.location.city} • Zone {user.growing_zone || "?"}</> :
                  "Location not set"}
                </p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-h-0">
          {/* Mobile Header - Hidden on Assistant page */}
          {currentPageName !== "Assistant" &&
                          <header className="bg-card/80 px-4 py-2 backdrop-blur-sm border-b border-border md:hidden flex items-center justify-between flex-shrink-0 z-50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 flex items-center justify-center">
                  <img
                  src={getIconLogoUrl()}
                  alt="Plantify Logo"
                  className="w-9 h-9 object-contain" />

                </div>
                <h1 className="text-xl font-bold">{currentPageName}</h1>
              </div>

              {/* Premium Badge / Upgrade Button - Mobile */}
              {user && (
            user.is_premium ?
            <Popover>
                                    <PopoverTrigger asChild>
                                      <button className="focus:outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full flex items-center gap-2 bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 dark:from-purple-950/50 dark:via-pink-950/50 dark:to-purple-950/50 px-3 py-1.5 border border-purple-200 dark:border-purple-800">
                                                                  <PremiumBadge size="small" showText={false} />
                                                                  <span className="text-xs font-medium bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 dark:from-purple-400 dark:via-pink-400 dark:to-orange-400 bg-clip-text text-transparent">Pro</span>
                                                                </button>
                                    </PopoverTrigger>
                    <PopoverContent className="p-3 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 bg-card text-popover-foreground mr-4 px-4 py-4 z-50 outline-none w-[80vw] max-w-xs rounded-xl shadow-xl border border-border relative overflow-hidden">
                      {/* Diagonal lines background */}
                      <div className="absolute bottom-0 -right-10 left-10 h-[85%] pointer-events-none opacity-25">
                        <img 
                          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/40f73253e_lines.png"
                          alt=""
                          className="w-full h-full object-cover saturate-150"
                        />
                      </div>
                      <div className="relative z-10">
                        <PremiumMenu />
                      </div>
                    </PopoverContent>
                  </Popover> :

            <Link to={createPageUrl("Upgrade")}>
                                                      <button className="focus:outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full flex items-center gap-2 bg-gradient-to-r from-purple-200 via-pink-200 to-orange-200 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20 px-3 py-1.5 border border-purple-300 dark:border-purple-700">
                                                        <div className="w-6 h-6 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 shadow-md rounded-full">
                                                          <Sparkles className="w-3 h-3 text-white" />
                                                        </div>
                                                        <span className="text-xs font-medium bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">Go Pro</span>
                                                      </button>
                                                    </Link>)

            }
            </header>
          }

          <div className="flex-1 overflow-y-auto bg-background pb-24 md:pb-0">{children}</div>
        </main>

        {/* Mobile Bottom Navigation - Hidden on Assistant page */}
        {currentPageName !== "Assistant" &&
        <BottomNavBar navigationItems={navigationItems} location={location} />
        }
      </div>

      {/* Premium Upsell Modal */}
      <MobilePremiumUpsell
        open={isUpsellModalOpen}
        onOpenChange={setIsUpsellModalOpen}
        onDismiss={handleDismissUpsell} />

    </SidebarProvider>);

}