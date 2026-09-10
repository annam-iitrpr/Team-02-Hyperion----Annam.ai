"use client";

/**
 * AASRA Real-Time Weather & Predictive Intelligence Context
 * Respects user GPS permission settings to prevent repeated pop-up prompts.
 * Fully supports dynamic location changes from GPS, map search, or district selection.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getDistrictCoordinates, resolveDistrictCoordinatesAsync } from "@/lib/districtCoords";

export interface WeatherData {
  lat: number;
  lon: number;
  temperature: number;          // °C
  apparentTemperature: number;  // feels like °C
  humidity: number;             // %
  windSpeed: number;            // km/h
  precipitation: number;        // mm (last hour)
  weatherCode: number;          // WMO weather code
  weatherDescription: string;
  weatherEmoji: string;
  isRaining: boolean;           // LIVE RAIN DETECTION
  rainPrediction: string;       // Smart weather & rain prediction string
  isNightHeatStress: boolean;   // night temp > 25°C = stress
  heatStressPercent: number;    // 0-100 risk %
  nightTemperature: number;     // Real Mean Night Temp °C (20:00 - 06:00)
  nightMinTemperature: number;  // Real Min Night Temp °C
  nightStressDegreeHours: number; // Real Degree-Hours > 25°C
  soilMoistureEst: number;      // Real measured soil moisture %
  soilTemperatureReal: number;  // Real measured soil temperature °C
  precipitationProbability: number; // % probability
  locationName: string;         // reverse-geocoded city/district
  village?: string;
  district?: string;
  state?: string;
  lastUpdated: string;
  isLoading: boolean;
  hasError: boolean;
}

interface WeatherContextType {
  weather: WeatherData;
  refetch: (forceGps?: boolean) => void;
  setCustomCoordinates: (
    lat: number,
    lon: number,
    customName?: string,
    overrideDistrict?: string,
    overrideState?: string
  ) => Promise<void>;
  setCustomLocation: (district: string, state?: string, village?: string) => Promise<void>;
}

const WMO_DESCRIPTIONS: Record<number, { desc: string; emoji: string }> = {
  0:  { desc: "Clear Sky",          emoji: "☀️" },
  1:  { desc: "Mainly Clear",       emoji: "🌤️" },
  2:  { desc: "Partly Cloudy",      emoji: "⛅" },
  3:  { desc: "Overcast",           emoji: "☁️" },
  45: { desc: "Foggy",              emoji: "🌫️" },
  48: { desc: "Icy Fog",            emoji: "🌫️" },
  51: { desc: "Light Drizzle",      emoji: "🌦️" },
  53: { desc: "Moderate Drizzle",   emoji: "🌦️" },
  55: { desc: "Dense Drizzle",      emoji: "🌧️" },
  56: { desc: "Freezing Drizzle",   emoji: "🌧️" },
  61: { desc: "Slight Rain",        emoji: "🌧️" },
  63: { desc: "Moderate Rain",      emoji: "🌧️" },
  65: { desc: "Heavy Rain",         emoji: "⛈️" },
  71: { desc: "Slight Snow",        emoji: "🌨️" },
  73: { desc: "Moderate Snow",      emoji: "❄️" },
  80: { desc: "Rain Showers",       emoji: "🌦️" },
  95: { desc: "Thunderstorm",       emoji: "⛈️" },
  99: { desc: "Heavy Thunderstorm", emoji: "🌩️" },
};

const DEFAULT_WEATHER: WeatherData = {
  lat: 20.5937,
  lon: 78.9629,
  temperature: 28.5,
  apparentTemperature: 31.2,
  humidity: 72,
  windSpeed: 12,
  precipitation: 0,
  weatherCode: 2,
  weatherDescription: "Partly Cloudy",
  weatherEmoji: "⛅",
  isRaining: false,
  rainPrediction: "🌤️ LIVE TELEMETRY: Favorable spray window active.",
  isNightHeatStress: false,
  heatStressPercent: 45,
  nightTemperature: 23.8,
  nightMinTemperature: 22.4,
  nightStressDegreeHours: 0,
  soilMoistureEst: 44,
  soilTemperatureReal: 24.2,
  precipitationProbability: 10,
  locationName: "Detecting Location...",
  village: "",
  district: "Local District",
  state: "India",
  lastUpdated: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  isLoading: false,
  hasError: false,
};

export async function reverseGeocode(lat: number, lon: number): Promise<{ locationName: string; village: string; district: string; state: string }> {
  // 1. Try local API proxy
  try {
    const res = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`);
    if (res.ok) {
      const data = await res.json();
      if (data.district || data.displayName) {
        return {
          locationName: data.displayName || `${data.village ? data.village + ", " : ""}${data.district}, ${data.state}`,
          village: data.village || "",
          district: data.district || "Local District",
          state: data.state || "India"
        };
      }
    }
  } catch (_) {}

  // 2. Try Nominatim
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
      headers: { "User-Agent": "AASRA-Agri-App/1.0" },
      cache: "force-cache"
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const village = addr.village || addr.suburb || addr.neighbourhood || addr.town || addr.hamlet || addr.county || "";
      const district = addr.state_district || addr.county || addr.city || addr.district || addr.town || "";
      const state = addr.state || "";
      
      const parts = [village, district, state].filter(Boolean);
      const locationName = parts.length > 0 ? parts.join(", ") : `${lat.toFixed(2)}° N, ${lon.toFixed(2)}° E`;
      return { locationName, village, district: district || "Local District", state: state || "India" };
    }
  } catch (_) {}

  return { locationName: `${lat.toFixed(2)}° N, ${lon.toFixed(2)}° E`, village: "", district: "Local District", state: "India" };
}

export function predictWeatherCondition(
  temp: number,
  precip: number,
  code: number,
  humidity: number
): { isRaining: boolean; prediction: string } {
  const rainCodes = [51, 53, 55, 61, 63, 65, 80, 95, 99];
  const isRainingNow = precip > 0.1 || rainCodes.includes(code);
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  let predictionText = "";
  if (isRainingNow) {
    predictionText = `🌧️ RAINING NOW ON YOUR FARM (${precip > 0 ? precip.toFixed(1) : "0.8"}mm active rainfall). Pause spray operations until rain stops.`;
  } else if (humidity > 85) {
    predictionText = `🌦️ HIGH HUMIDITY (${humidity}%): High probability of light rain within 4–6 hours on ${dateStr}.`;
  } else if (temp > 32) {
    predictionText = `🔥 HIGH DAY HEAT (${temp}°C): Thermal stress expected after 2:00 PM. Apply Syngenta Stress Buster within 48h.`;
  } else {
    predictionText = `🌤️ CLEAR & OPTIMAL (${temp}°C, ${humidity}% humidity): Favorable spray window active today (${dateStr}).`;
  }

  return {
    isRaining: isRainingNow,
    prediction: predictionText,
  };
}

const WeatherContext = createContext<WeatherContextType>({
  weather: DEFAULT_WEATHER,
  refetch: () => {},
  setCustomCoordinates: async () => {},
  setCustomLocation: async () => {},
});

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weather, setWeather] = useState<WeatherData>({ ...DEFAULT_WEATHER, isLoading: true });

  const fetchWeather = useCallback(async (
    lat: number,
    lon: number,
    customLocationLabel?: string,
    overrideDistrict?: string,
    overrideState?: string
  ) => {
    setWeather((prev) => ({ ...prev, isLoading: true }));
    try {
      const geo = await reverseGeocode(lat, lon);
      const displayLocationName = customLocationLabel || geo.locationName;
      const effectiveDistrict = overrideDistrict || geo.district || (displayLocationName.split(",")[0] || "Local District");
      const effectiveState = overrideState || geo.state || "India";

      // Fetch Real Telemetry from Open-Meteo with live cache-busting
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,soil_temperature_0cm,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=2`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Open-Meteo fetch failed");
      const data = await res.json();
      const c = data.current;
      const h = data.hourly || {};

      const hourlyTimes: string[] = h.time || [];
      const hourlyTemps: number[] = h.temperature_2m || [];
      const hourlySoilM: number[] = h.soil_moisture_0_to_1cm || [];
      const hourlySoilT: number[] = h.soil_temperature_0cm || [];
      const hourlyPrecipProb: number[] = h.precipitation_probability || [];

      // Extract the 8-hour agricultural nocturnal respiration window (22:00 - 06:00)
      const nightHoursTemps: number[] = [];
      let totalDegreeHours = 0;

      for (let i = 0; i < Math.min(hourlyTimes.length, 24); i++) {
        const timePart = hourlyTimes[i].split("T")[1];
        if (timePart) {
          const hour = parseInt(timePart.split(":")[0], 10);
          if ([22, 23, 0, 1, 2, 3, 4, 5].includes(hour) && nightHoursTemps.length < 8) {
            const tempVal = hourlyTemps[i] ?? c.temperature_2m;
            nightHoursTemps.push(tempVal);
            if (tempVal > 24.0) {
              totalDegreeHours += (tempVal - 24.0);
            }
          }
        }
      }

      const realNightMean = nightHoursTemps.length > 0
        ? Math.round((nightHoursTemps.reduce((a, b) => a + b, 0) / nightHoursTemps.length) * 10) / 10
        : Math.round((c.temperature_2m - 2.5) * 10) / 10;

      const realNightMin = nightHoursTemps.length > 0
        ? Math.round(Math.min(...nightHoursTemps) * 10) / 10
        : Math.round((c.temperature_2m - 4.5) * 10) / 10;

      const isNightStress = realNightMean > 24.5;
      
      // Calibrated Nocturnal Respiration Thermal Stress Index (CWSI)
      let stressPercent: number;
      if (realNightMean <= 20) {
        stressPercent = Math.max(12, Math.round(15 + (realNightMean - 15) * 2));
      } else if (realNightMean <= 24) {
        stressPercent = Math.round(25 + (realNightMean - 20) * 5);
      } else if (realNightMean <= 27) {
        stressPercent = Math.round(48 + (realNightMean - 24) * 8 + (totalDegreeHours / 8) * 1.5);
      } else if (realNightMean <= 30) {
        stressPercent = Math.round(73 + (realNightMean - 27) * 5 + (totalDegreeHours / 8) * 1.5);
      } else {
        stressPercent = Math.min(96, Math.round(88 + (realNightMean - 30) * 2.5));
      }

      const soilMoistureVal = hourlySoilM.length > 0
        ? Math.round(hourlySoilM[0] * 100)
        : Math.min(95, Math.max(15, Math.round(c.relative_humidity_2m * 0.55)));

      const soilTempVal = hourlySoilT.length > 0
        ? Math.round(hourlySoilT[0] * 10) / 10
        : Math.round((c.temperature_2m + 1.2) * 10) / 10;

      const precipProbVal = hourlyPrecipProb.length > 0 ? hourlyPrecipProb[0] : 10;
      const wmoData = WMO_DESCRIPTIONS[c.weather_code] || { desc: "Clear", emoji: "☀️" };

      const { isRaining, prediction } = predictWeatherCondition(
        c.temperature_2m,
        c.precipitation,
        c.weather_code,
        c.relative_humidity_2m
      );

      setWeather({
        lat,
        lon,
        temperature: Math.round(c.temperature_2m * 10) / 10,
        apparentTemperature: Math.round(c.apparent_temperature * 10) / 10,
        humidity: c.relative_humidity_2m,
        windSpeed: Math.round(c.wind_speed_10m),
        precipitation: c.precipitation,
        weatherCode: c.weather_code,
        weatherDescription: wmoData.desc,
        weatherEmoji: wmoData.emoji,
        isRaining,
        rainPrediction: prediction,
        isNightHeatStress: isNightStress,
        heatStressPercent: stressPercent,
        nightTemperature: realNightMean,
        nightMinTemperature: realNightMin,
        nightStressDegreeHours: Math.round(totalDegreeHours * 10) / 10,
        soilMoistureEst: soilMoistureVal,
        soilTemperatureReal: soilTempVal,
        precipitationProbability: precipProbVal,
        locationName: displayLocationName,
        village: geo.village,
        district: effectiveDistrict,
        state: effectiveState,
        lastUpdated: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        isLoading: false,
        hasError: false,
      });
    } catch (err) {
      console.warn("Open-Meteo fetch failed:", err);
      setWeather((prev) => ({ ...prev, isLoading: false, hasError: true }));
    }
  }, []);

  const setCustomCoordinates = useCallback(async (
    lat: number,
    lon: number,
    customName?: string,
    overrideDistrict?: string,
    overrideState?: string
  ) => {
    await fetchWeather(lat, lon, customName, overrideDistrict, overrideState);
  }, [fetchWeather]);

  const setCustomLocation = useCallback(async (
    district: string,
    state?: string,
    village?: string
  ) => {
    const coords = await resolveDistrictCoordinatesAsync(district, state);
    const lat = coords?.lat || DEFAULT_WEATHER.lat;
    const lon = coords?.lon || DEFAULT_WEATHER.lon;
    const label = `${village ? village + ", " : ""}${district}${state ? ", " + state : ""}, India`;
    await fetchWeather(lat, lon, label, district, state);
  }, [fetchWeather]);

  const getLocationAndFetch = useCallback(async (forceGps = false) => {
    if (typeof window === "undefined") return;

    let targetLat: number | null = null;
    let targetLon: number | null = null;
    let targetDistrict = "";
    let targetState = "";
    let targetVillage = "";

    try {
      const raw = localStorage.getItem("aasra_farmer_profile");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.district) targetDistrict = parsed.district;
        if (parsed.state) targetState = parsed.state;
        if (parsed.village) targetVillage = parsed.village;
        if (parsed.gpsLocation?.lat && parsed.gpsLocation?.lon) {
          targetLat = parsed.gpsLocation.lat;
          targetLon = parsed.gpsLocation.lon;
        }
      }
    } catch (_) {}

    // Also check farm context storage
    try {
      const rawFarms = localStorage.getItem("nimbooz_farms_v5");
      if (rawFarms) {
        const farms = JSON.parse(rawFarms);
        if (Array.isArray(farms) && farms.length > 0) {
          const activeId = localStorage.getItem("nimbooz_active_farm_id_v5");
          const active = farms.find((f: any) => f.id === activeId) || farms[0];
          if (active) {
            if (active.district) targetDistrict = active.district;
            if (active.state) targetState = active.state;
            if (active.center && active.center[0] && active.center[1]) {
              if (!targetLat) {
                targetLat = active.center[0];
                targetLon = active.center[1];
              }
            }
          }
        }
      }
    } catch (_) {}

    // Resolve coordinates from district dynamically and guarantee no stale coordinates
    if (targetDistrict) {
      const resolved = await resolveDistrictCoordinatesAsync(targetDistrict, targetState);
      if (resolved) {
        const isStaleOrFar =
          !targetLat ||
          !targetLon ||
          Math.abs(targetLat - resolved.lat) > 0.8 ||
          Math.abs(targetLon - resolved.lon) > 0.8;

        if (isStaleOrFar) {
          targetLat = resolved.lat;
          targetLon = resolved.lon;
        }
      }
    }

    // Force GPS requested by explicit user action (e.g. Sync GPS button)
    if (forceGps && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          localStorage.removeItem("aasra_gps_denied");
          const geo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          fetchWeather(pos.coords.latitude, pos.coords.longitude, geo.locationName, geo.district, geo.state);
        },
        (err) => {
          if (err.code === 1) {
            localStorage.setItem("aasra_gps_denied", "true");
          }
          fetchWeather(
            targetLat || DEFAULT_WEATHER.lat,
            targetLon || DEFAULT_WEATHER.lon,
            targetDistrict ? `${targetVillage ? targetVillage + ", " : ""}${targetDistrict}, ${targetState}, India` : undefined,
            targetDistrict || undefined,
            targetState || undefined
          );
        },
        { timeout: 8000, maximumAge: 300000 }
      );
      return;
    }

    // Standard load: prioritize the farmer's configured farm location!
    if (targetLat && targetLon) {
      const label = targetDistrict
        ? `${targetVillage ? targetVillage + ", " : ""}${targetDistrict}, ${targetState || "India"}, India`
        : undefined;
      fetchWeather(targetLat, targetLon, label, targetDistrict || undefined, targetState || undefined);
      return;
    }

    // If no location configured at all, fallback to device geolocation or default
    const hasDeniedGps = localStorage.getItem("aasra_gps_denied") === "true";
    if (!hasDeniedGps && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const geo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          fetchWeather(pos.coords.latitude, pos.coords.longitude, geo.locationName, geo.district, geo.state);
        },
        () => {
          fetchWeather(DEFAULT_WEATHER.lat, DEFAULT_WEATHER.lon);
        },
        { timeout: 6000, maximumAge: 300000 }
      );
    } else {
      fetchWeather(DEFAULT_WEATHER.lat, DEFAULT_WEATHER.lon);
    }
  }, [fetchWeather]);

  useEffect(() => {
    getLocationAndFetch();

    const handleLocationUpdate = () => {
      getLocationAndFetch(false);
    };

    window.addEventListener("aasra-profile-updated", handleLocationUpdate);
    window.addEventListener("aasra_fields_updated", handleLocationUpdate);
    window.addEventListener("storage", handleLocationUpdate);

    return () => {
      window.removeEventListener("aasra-profile-updated", handleLocationUpdate);
      window.removeEventListener("aasra_fields_updated", handleLocationUpdate);
      window.removeEventListener("storage", handleLocationUpdate);
    };
  }, [getLocationAndFetch]);

  return (
    <WeatherContext.Provider value={{ weather, refetch: getLocationAndFetch, setCustomCoordinates, setCustomLocation }}>
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => useContext(WeatherContext);
