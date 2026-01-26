import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Droplets,
  Wind,
  Thermometer
} from "lucide-react";

export default function WeatherInsights({ user }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        let latitude, longitude, city, region;

        // Try to get location from user's saved location first
        if (user?.location?.lat && user?.location?.lng) {
          latitude = user.location.lat;
          longitude = user.location.lng;
          city = user.location.city || "Your Location";
          region = user.location.state || "";
        } else {
          // Fallback to IP-based geolocation
          try {
            const locRes = await fetch("https://ipapi.co/json/", { 
              signal: AbortSignal.timeout(5000) 
            });
            if (!locRes.ok) throw new Error("Location fetch failed");
            const locData = await locRes.json();
            latitude = locData.latitude;
            longitude = locData.longitude;
            city = locData.city;
            region = locData.region;
          } catch (locError) {
            // Use a default location (US center) if geolocation fails
            console.warn("Could not detect location, using default");
            latitude = 39.8283;
            longitude = -98.5795;
            city = "United States";
            region = "";
          }
        }

        // Get weather from Open-Meteo
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_min,precipitation_sum,windspeed_10m_max&past_days=7&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=auto`,
          { signal: AbortSignal.timeout(10000) }
        );
        if (!weatherRes.ok) throw new Error("Weather API error");
        const weatherJson = await weatherRes.json();

        const current = weatherJson.current_weather;
        const daily = weatherJson.daily;

        // Rainfall in the last week
        const rainWeek = daily.precipitation_sum
          .slice(0, 7)
          .reduce((a, b) => a + b, 0);

        // Planting condition checks
        const goodTemp = current.temperature >= 60 && current.temperature <= 80;
        const lowWind = current.windspeed <= 15;
        const notTooWet = rainWeek <= 2;
        const noFrostRisk = daily.temperature_2m_min[0] > 40;

        let forecast;
        if (goodTemp && lowWind && notTooWet && noFrostRisk) {
          forecast = "Perfect planting conditions";
        } else if (!goodTemp) {
          forecast = "Temperature not ideal for planting";
        } else if (!noFrostRisk) {
          forecast = "Possible frost risk — wait before planting";
        } else if (!lowWind) {
          forecast = "Too windy for planting young seedlings";
        } else {
          forecast = "Check soil moisture before planting";
        }

        setWeatherData({
          temperature: current.temperature,
          condition: current.weathercode === 0 ? "Clear" : "Cloudy",
          humidity: "--", // Open-Meteo free tier doesn’t provide humidity in current_weather
          rainfall: `${rainWeek.toFixed(2)} inches this week`,
          windSpeed: current.windspeed,
          forecast,
          location: `${city}, ${region}`
        });
      } catch (error) {
        console.error("Error fetching weather:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [user?.location]);

  if (loading || !weatherData) return null;

  // Only show if there's a weather risk
  const hasRisk = !weatherData.forecast.includes("Perfect") && 
                  (weatherData.forecast.includes("frost") || 
                   weatherData.forecast.includes("windy") || 
                   weatherData.forecast.includes("not ideal"));

  if (!hasRisk) return null;

  return (
    <Card className="bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 backdrop-blur-sm">
      <CardContent className="p-4 md:p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-orange-500 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-orange-800 dark:text-orange-200 text-sm md:text-base mb-1">
                Weather Alert
              </h3>
              <p className="text-xs md:text-sm text-orange-700 dark:text-orange-300">
                {weatherData.forecast}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 pt-2">
            <div className="flex items-center gap-2 bg-orange-100/50 dark:bg-orange-900/30 rounded-lg p-2 md:p-3">
              <Thermometer className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-orange-700 dark:text-orange-300">Temp</p>
                <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">{weatherData.temperature}°F</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-orange-100/50 dark:bg-orange-900/30 rounded-lg p-2 md:p-3">
              <Wind className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-orange-700 dark:text-orange-300">Wind</p>
                <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">{weatherData.windSpeed} mph</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-orange-100/50 dark:bg-orange-900/30 rounded-lg p-2 md:p-3">
              <Droplets className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-orange-700 dark:text-orange-300">Rain</p>
                <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">{weatherData.rainfall}"</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-orange-100/50 dark:bg-orange-900/30 rounded-lg p-2 md:p-3">
              <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-orange-700 dark:text-orange-300">Min Temp</p>
                <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">{weatherData.minTemp}°F</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}