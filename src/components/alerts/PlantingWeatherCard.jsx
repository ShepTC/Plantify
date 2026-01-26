import React, { useState, useEffect } from "react";
import { Sun, Cloud, CloudRain, Wind, Droplets, CheckCircle2, AlertTriangle, XCircle, Zap, CloudSnow } from "lucide-react";

const weatherCodes = {
  0: { label: "Clear sky", icon: Sun },
  1: { label: "Mainly clear", icon: Sun },
  2: { label: "Partly cloudy", icon: Cloud },
  3: { label: "Overcast", icon: Cloud },
  45: { label: "Foggy", icon: Cloud },
  48: { label: "Foggy", icon: Cloud },
  51: { label: "Light drizzle", icon: CloudRain },
  53: { label: "Drizzle", icon: CloudRain },
  55: { label: "Heavy drizzle", icon: CloudRain },
  61: { label: "Light rain", icon: CloudRain },
  63: { label: "Rain", icon: CloudRain },
  65: { label: "Heavy rain", icon: CloudRain },
  71: { label: "Light snow", icon: CloudSnow },
  73: { label: "Snow", icon: CloudSnow },
  75: { label: "Heavy snow", icon: CloudSnow },
  77: { label: "Snow grains", icon: CloudSnow },
  80: { label: "Rain showers", icon: CloudRain },
  81: { label: "Rain showers", icon: CloudRain },
  82: { label: "Heavy showers", icon: CloudRain },
  85: { label: "Snow showers", icon: CloudSnow },
  86: { label: "Heavy snow showers", icon: CloudSnow },
  95: { label: "Thunderstorm", icon: Zap },
  96: { label: "Thunderstorm with hail", icon: Zap },
  99: { label: "Severe thunderstorm", icon: Zap },
};

export default function PlantingWeatherCard({ user }) {
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        let lat, lon;

        if (user?.location?.lat && user?.location?.lng) {
          lat = user.location.lat;
          lon = user.location.lng;
        } else {
          const geoRes = await fetch("https://ipapi.co/json/");
          const geoData = await geoRes.json();
          lat = geoData.latitude;
          lon = geoData.longitude;
        }

        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&daily=temperature_2m_min,sunshine_duration,precipitation_sum,uv_index_max&timezone=auto`
        );
        const weatherData = await weatherRes.json();

        const tempC = weatherData.current.temperature_2m;
        const humidity = weatherData.current.relative_humidity_2m;
        const windSpeed = weatherData.current.wind_speed_10m;
        const code = weatherData.current.weather_code;
        const precipitation = weatherData.current.precipitation || 0;
        const uvIndex = weatherData.daily?.uv_index_max?.[0] || 0;
        const minTemp = weatherData.daily?.temperature_2m_min?.[0];
        const sunshineHours = weatherData.daily?.sunshine_duration?.[0] ? Math.round(weatherData.daily.sunshine_duration[0] / 3600) : null;
        const dailyPrecipitation = weatherData.daily?.precipitation_sum?.[0] || 0;

        const weatherInfo = weatherCodes[code] || { label: "Unknown", icon: Cloud };

        // Determine planting conditions (always use Celsius for logic)
        let status = "good";
        let message = "Great conditions for planting today!";
        let warnings = [];

        // Severe weather checks (BAD - don't plant)
        const isSevereWeather = [95, 96, 99].includes(code); // Thunderstorms
        const isSnowing = [71, 73, 75, 77, 85, 86].includes(code);
        const frostRisk = minTemp !== undefined && minTemp < 2;
        const isTooCold = tempC < 5;

        // Caution checks
        const isRaining = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code);
        const isHeavyRain = [55, 65, 82].includes(code) || dailyPrecipitation > 10;
        const isTooWindy = windSpeed > 25;
        const isVeryWindy = windSpeed > 40;
        const isTooHot = tempC > 35;
        const isVeryHot = tempC > 40;
        const highUV = uvIndex > 8;
        const lowHumidity = humidity < 30;
        const highHumidity = humidity > 85;
        const lowSunshine = sunshineHours !== null && sunshineHours < 3;

        // Evaluate conditions - worst case first
        if (isSevereWeather) {
          status = "bad";
          message = "Thunderstorm warning - stay indoors, don't plant.";
        } else if (isSnowing) {
          status = "bad";
          message = "Snow conditions - not suitable for planting.";
        } else if (frostRisk) {
          status = "bad";
          message = "Frost risk tonight - protect seedlings or wait.";
        } else if (isTooCold) {
          status = "bad";
          message = "Too cold for planting - wait for warmer temps.";
        } else if (isVeryWindy) {
          status = "bad";
          message = "Dangerous wind conditions - do not plant.";
        } else if (isVeryHot) {
          status = "bad";
          message = "Extreme heat - avoid planting, water existing plants.";
        } else if (isHeavyRain) {
          status = "caution";
          message = "Heavy rain expected - wait for drier conditions.";
          warnings.push("heavy rain");
        } else if (isRaining) {
          status = "caution";
          message = "Rainy conditions - wait for drier weather.";
          warnings.push("rain");
        } else {
          // Check for minor cautions
          if (isTooHot) warnings.push("high heat");
          if (isTooWindy) warnings.push("wind");
          if (highUV) warnings.push("high UV");
          if (lowHumidity) warnings.push("dry air");
          if (highHumidity) warnings.push("high humidity");
          if (lowSunshine) warnings.push("low sunlight");

          if (warnings.length >= 3) {
            status = "caution";
            message = `Multiple concerns: ${warnings.slice(0, 2).join(", ")} - plant with care.`;
          } else if (warnings.length > 0) {
            status = "caution";
            message = `${warnings[0].charAt(0).toUpperCase() + warnings[0].slice(1)} today - plant in early morning or evening.`;
          }
        }

        setWeather({
          tempC: Math.round(tempC),
          humidity,
          windSpeed: Math.round(windSpeed),
          condition: weatherInfo.label,
          icon: weatherInfo.icon,
          status,
          message,
          uvIndex: Math.round(uvIndex),
          sunshineHours,
          precipitation: Math.round(dailyPrecipitation),
        });
      } catch (error) {
        console.error("Failed to fetch weather:", error);
        setWeather({
          tempC: 20,
          humidity: 60,
          windSpeed: 10,
          condition: "Unable to load",
          icon: Cloud,
          status: "caution",
          message: "Unable to fetch weather data",
          uvIndex: 5,
          sunshineHours: null,
          precipitation: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 px-4 bg-muted/30 rounded-xl border border-border animate-pulse">
        <div className="w-5 h-5 bg-muted rounded-full" />
        <div className="h-4 w-48 bg-muted rounded" />
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 px-4 bg-muted/30 rounded-xl border border-border">
        <Cloud className="w-5 h-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Weather unavailable</span>
      </div>
    );
  }

  const WeatherIcon = weather.icon;
  const unit = user?.temperature_unit || 'celsius';
  const displayTemp = unit === 'fahrenheit' 
    ? Math.round((weather.tempC * 9/5) + 32) 
    : weather.tempC;
  const tempSymbol = unit === 'fahrenheit' ? '°F' : '°C';

  const statusConfig = {
    good: {
      icon: CheckCircle2,
      bgColor: "bg-green-500/10 dark:bg-green-500/20",
      borderColor: "border-green-500/30",
      textColor: "text-green-700 dark:text-green-400",
      iconColor: "text-green-500",
    },
    caution: {
      icon: AlertTriangle,
      bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
      borderColor: "border-amber-500/30",
      textColor: "text-amber-700 dark:text-amber-400",
      iconColor: "text-amber-500",
    },
    bad: {
      icon: XCircle,
      bgColor: "bg-red-500/10 dark:bg-red-500/20",
      borderColor: "border-red-500/30",
      textColor: "text-red-700 dark:text-red-400",
      iconColor: "text-red-500",
    },
  };

  const config = statusConfig[weather.status];
  const StatusIcon = config.icon;

  return (
    <div className={`flex flex-col gap-3 py-4 px-5 rounded-xl border ${config.bgColor} ${config.borderColor}`}>
      {/* Status Message */}
      <div className="flex items-center justify-center gap-2">
        <StatusIcon className={`w-5 h-5 ${config.iconColor}`} />
        <span className={`text-sm font-semibold ${config.textColor}`}>{weather.message}</span>
      </div>
      
      {/* Weather Details Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
        {/* Temperature */}
        <div className="flex flex-col items-center gap-1">
          <WeatherIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{displayTemp}{tempSymbol}</span>
          <span className="text-[10px] text-muted-foreground">{weather.condition}</span>
        </div>
        
        {/* Humidity */}
        <div className="flex flex-col items-center gap-1">
          <Droplets className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-foreground">{weather.humidity}%</span>
          <span className="text-[10px] text-muted-foreground">Humidity</span>
        </div>
        
        {/* Wind */}
        <div className="flex flex-col items-center gap-1">
          <Wind className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-foreground">{weather.windSpeed} km/h</span>
          <span className="text-[10px] text-muted-foreground">Wind</span>
        </div>
        
        {/* UV Index */}
        <div className="flex flex-col items-center gap-1">
          <Sun className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-foreground">{weather.uvIndex}</span>
          <span className="text-[10px] text-muted-foreground">UV Index</span>
        </div>
        
        {/* Rain */}
        <div className="flex flex-col items-center gap-1">
          <CloudRain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-foreground">{weather.precipitation}mm</span>
          <span className="text-[10px] text-muted-foreground">Rain Today</span>
        </div>
        
        {/* Sunshine Hours */}
        <div className="flex flex-col items-center gap-1">
          <Sun className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium text-foreground">
            {weather.sunshineHours !== null ? `${weather.sunshineHours}h` : "N/A"}
          </span>
          <span className="text-[10px] text-muted-foreground">Sunshine</span>
        </div>
      </div>
    </div>
  );
}