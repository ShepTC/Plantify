
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Reminder } from "@/entities/Reminder";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { X, Calendar as CalendarIcon, Leaf, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/components/utils"; // Updated import path
import { motion, AnimatePresence } from "framer-motion";

export default function SeasonalGoalBanner({ user, onUserUpdate }) {
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(false);
  const [currentSeason, setCurrentSeason] = useState(null);
  const [step, setStep] = useState("initial"); // 'initial', 'success', 'reminder'
  const [newGoalText, setNewGoalText] = useState("");
  const [selectedReminderDate, setSelectedReminderDate] = useState(null);

  useEffect(() => {
    checkSeasonalPrompt();
  }, [user]);

  const checkSeasonalPrompt = () => {
    if (!user?.garden_goals) return;

    const now = new Date();
    const currentYear = now.getFullYear();
    const weekNumber = Math.ceil(
      (now.getTime() - new Date(currentYear, 0, 1).getTime()) / (
      7 * 24 * 60 * 60 * 1000)
    );
//week 35 is end of summer and week 48 is end of fall
    let season = null;
    if (weekNumber === 35) {
      season = "summer";
    } else if (weekNumber === 48) {
      season = "fall";
    }

    if (!season) return;

    const hasBeenPrompted =
    user.last_goal_review_year === currentYear &&
    user.last_goal_review_season === season;

    if (!hasBeenPrompted) {
      setCurrentSeason(season);
      setShowBanner(true);
    }
  };

  const handleYes = () => {
    setStep("success");
    setNewGoalText(user.garden_goals || "");
  };

  const handleNo = () => {
    setStep("reminder");
    setSelectedReminderDate(new Date());
  };

  const handleUpdateGoals = async () => {
    try {
      await User.updateMyUserData({
        garden_goals: newGoalText,
        last_goal_review_year: new Date().getFullYear(),
        last_goal_review_season: currentSeason
      });

      if (onUserUpdate) {
        onUserUpdate();
      }

      navigate(`${createPageUrl("Profile")}#garden-goals`);
      setShowBanner(false);
      setStep("initial");
    } catch (error) {
      console.error("Error updating garden goals:", error);
    }
  };

  const handleSetReminder = async () => {
    try {
      await Reminder.create({
        title: "Review Garden Goals",
        description: user.garden_goals,
        due_date: format(selectedReminderDate, "yyyy-MM-dd"),
        type: "seasonal_goal_review"
      });

      await User.updateMyUserData({
        last_goal_review_year: new Date().getFullYear(),
        last_goal_review_season: currentSeason
      });

      if (onUserUpdate) {
        onUserUpdate();
      }

      setShowBanner(false);
      setStep("initial");
    } catch (error) {
      console.error("Error creating reminder:", error);
    }
  };

  const closeBanner = async () => {
    try {
      await User.updateMyUserData({
        last_goal_review_year: new Date().getFullYear(),
        last_goal_review_season: currentSeason
      });

      if (onUserUpdate) {
        onUserUpdate();
      }

      setShowBanner(false);
      setStep("initial");
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const seasonName = currentSeason ?
  currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1) :
  "";

  return (
    <AnimatePresence>
      {showBanner && currentSeason &&
      <motion.div
        key={currentSeason}
        initial={{ opacity: 0, y: -20, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -20, filter: "blur(12px)" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-6 overflow-hidden">

          <Card className="relative bg-white/60 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/60 before:to-transparent before:opacity-60 before:pointer-events-none">
            <CardContent className="bg-slate-200 p-4 md:p-6 relative z-10">
              <div className="flex items-start justify-between gap-3 md:gap-4">
                <div className="flex-1 min-w-0">
                  {step === "initial" &&
                <div className="space-y-3 md:space-y-4">
                      <div className="flex items-start gap-2">
                        <Leaf className="hidden md:block w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <h3 className="text-amber-800 text-base md:text-lg font-semibold leading-tight">
                          Now that the {seasonName} season's almost over, did you
                          complete your garden goals?
                        </h3>
                      </div>

                      {user.garden_goals &&
                  <div className="bg-white/60 rounded-lg p-3 border border-amber-200">
                          <p className="text-amber-900 font-medium text-sm md:text-base">
                            Your Goal:
                          </p>
                          <p className="text-amber-800 italic text-sm md:text-base">
                            "{user.garden_goals}"
                          </p>
                        </div>
                  }

                      <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                        <Button
                      onClick={handleYes}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none">

                          <CheckCircle className="w-4 h-4 mr-2" />
                          Yes
                        </Button>
                        <Button
                      onClick={handleNo}
                      variant="outline"
                      className="bg-background text-amber-600 border border-amber-300 hover:bg-amber-100 flex-1 sm:flex-none">

                          <CalendarIcon className="w-4 h-4 mr-2" />
                          No, remind me later
                        </Button>
                      </div>
                    </div>
                }

                  {step === "success" &&
                <div className="space-y-3 md:space-y-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="hidden md:block w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <h3 className="font-semibold text-green-800 text-base md:text-lg">
                          That's great!
                        </h3>
                      </div>

                      <div className="space-y-3">
                        <Label
                      htmlFor="new-goals"
                      className="text-amber-800 font-medium text-sm md:text-base">

                          Update your garden goals for next season:
                        </Label>
                        <Input
                      id="new-goals"
                      value={newGoalText}
                      onChange={(e) => setNewGoalText(e.target.value)}
                      placeholder="What do you want to achieve in your garden next year?" className="bg-white text-slate-900 px-3 py-2 text-base flex h-10 w-full rounded-md border ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border-amber-200" />


                      </div>

                      <Button
                    onClick={handleUpdateGoals}
                    className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto">

                        Update Goals
                      </Button>
                    </div>
                }

                  {step === "reminder" &&
                <div className="space-y-3 md:space-y-4">
                      <div className="flex items-start gap-2">
                        <CalendarIcon className="hidden md:block w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <h3 className="font-semibold text-amber-800 text-base md:text-lg leading-tight">
                          When would you like to be reminded about your garden
                          goals?
                        </h3>
                      </div>

                      <div className="bg-white/60 rounded-lg p-3 border border-amber-200">
                        <p className="text-amber-900 font-medium mb-2 text-sm md:text-base">
                          Your Goal:
                        </p>
                        <p className="text-amber-800 italic text-sm md:text-base">
                          "{user.garden_goals}"
                        </p>
                      </div>

                      <div className="flex justify-center">
                        <Calendar
                      mode="single"
                      selected={selectedReminderDate}
                      onSelect={setSelectedReminderDate}
                      className="bg-white text-slate-950 p-3 rdp rounded-md border border-amber-200 scale-90 md:scale-100"
                      disabled={(date) => date < new Date()} />

                      </div>

                      {selectedReminderDate &&
                  <div className="text-center space-y-3">
                          <Badge className="bg-amber-600 text-white text-xs md:text-sm">
                            Reminder set for{" "}
                            {format(selectedReminderDate, "MMM d, yyyy")}
                          </Badge>
                          <div>
                            <Button
                        onClick={handleSetReminder}
                        className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto">

                              Set Reminder
                            </Button>
                          </div>
                        </div>
                  }
                    </div>
                }
                </div>

                <Button
                variant="ghost"
                size="icon"
                onClick={closeBanner}
                className="text-amber-600 hover:text-amber-800 hover:bg-amber-100 flex-shrink-0">

                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      }
    </AnimatePresence>);

}
