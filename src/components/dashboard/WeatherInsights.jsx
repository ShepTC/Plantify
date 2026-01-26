import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Cloud,
  Sun,
  Droplets,
  Thermometer,
  Wind
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

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-foreground text-base md:text-lg">
            <Cloud className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
            Weather Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="text-center py-3 md:py-4">
            <p className="text-secondary text-xs md:text-sm">Loading weather...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-foreground text-base md:text-lg">
            <Cloud className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
            Weather Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="text-center py-3 md:py-4">
            <p className="text-secondary text-xs md:text-sm">Unable to fetch weather data.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="flex items-center justify-between text-foreground">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
            <span className="text-base md:text-lg">Weather Insights</span>
          </div>
          {user?.growing_zone && (
            <Badge variant="outline" className="bg-card/50 text-xs md:text-sm">
              Zone {user.growing_zone}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0">
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
            {weatherData.temperature}°F
          </div>
          <p className="text-secondary font-medium text-sm md:text-base">
            {weatherData.condition}
          </p>
          <p className="text-xs text-muted">{weatherData.location}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
            <div>
              <p className="text-xs text-secondary">Humidity</p>
              <p className="font-semibold text-foreground text-sm md:text-base">
                {weatherData.humidity}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
            <div>
              <p className="text-xs text-secondary">Wind</p>
              <p className="font-semibold text-foreground text-sm md:text-base">
                {weatherData.windSpeed} mph
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card/50 rounded-lg p-2 md:p-3 border border-border">
          <p className="text-xs text-secondary mb-1">This Week</p>
          <p className="font-medium text-foreground text-sm md:text-base">
            {weatherData.rainfall}
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-2 md:p-3">
          <div className="flex items-center gap-2 mb-1">
            <Thermometer className="w-3 h-3 md:w-4 md:h-4 text-secondary" />
            <span className="font-medium text-foreground text-xs md:text-sm">
              Planting Advice
            </span>
          </div>
          <p className="text-xs text-secondary">{weatherData.forecast}</p>
        </div>
      </CardContent>
    </Card>
  );
}