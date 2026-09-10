"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useWeather } from "@/context/WeatherContext";
import {
  MapPin,
  Mic,
  Camera,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  X,
} from "lucide-react";

interface RealtimePermissionsHubProps {
  onLocationUpdated?: (lat: number, lon: number, district?: string) => void;
}

export function RealtimePermissionsHub({ onLocationUpdated }: RealtimePermissionsHubProps) {
  const { language } = useLanguage();
  const { setCustomCoordinates } = useWeather();
  const isHindi = language === "hi";

  const [locationStatus, setLocationStatus] = useState<"granted" | "prompt" | "denied">("prompt");
  const [micStatus, setMicStatus] = useState<"granted" | "prompt" | "denied">("prompt");
  const [cameraStatus, setCameraStatus] = useState<"granted" | "prompt" | "denied">("prompt");
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("aasra_perm_dismissed") === "true";
    }
    return false;
  });

  // Check initial permissions
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((res) => {
          setLocationStatus(res.state as any);
          res.onchange = () => setLocationStatus(res.state as any);
        })
        .catch(() => {});

      navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((res) => {
          setMicStatus(res.state as any);
          res.onchange = () => setMicStatus(res.state as any);
        })
        .catch(() => {});

      navigator.permissions
        .query({ name: "camera" as PermissionName })
        .then((res) => {
          setCameraStatus(res.state as any);
          res.onchange = () => setCameraStatus(res.state as any);
        })
        .catch(() => {});
    }
  }, []);

  // Request all permissions
  const handleRequestAllPermissions = async () => {
    setIsRequesting(true);

    // 1. Request GPS Geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setLocationStatus("granted");
          setCustomCoordinates(lat, lon);

          try {
            const res = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`);
            if (res.ok) {
              const data = await res.json();
              if (data.district) {
                localStorage.setItem("aasra_user_district", data.district);
                if (onLocationUpdated) onLocationUpdated(lat, lon, data.district);
              }
            }
          } catch {}
        },
        () => setLocationStatus("denied"),
        { timeout: 8000 }
      );
    }

    // 2. Request Mic and Camera Streams
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setMicStatus("granted");
        setCameraStatus("granted");
        stream.getTracks().forEach((track) => track.stop());
      } catch (err: any) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setMicStatus("granted");
          audioStream.getTracks().forEach((track) => track.stop());
        } catch {
          setMicStatus("denied");
        }

        try {
          const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
          setCameraStatus("granted");
          videoStream.getTracks().forEach((track) => track.stop());
        } catch {
          setCameraStatus("denied");
        }
      }
    }

    setIsRequesting(false);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("aasra_perm_dismissed", "true");
    }
  };

  // If permission is already granted or dismissed, automatically hide completely!
  if (locationStatus === "granted" || isDismissed) {
    return null;
  }

  return (
    <div className="p-3 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#e8ede4] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-700 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-emerald-50 text-[#2d6a4f] shrink-0 border border-emerald-100">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <span className="font-bold text-[#11261f] block text-xs">
            {isHindi ? "सटीक खेत मौसम व सेंसर सक्रिय करें" : "Enable Real-Time Farm Sensors & Micro-Weather"}
          </span>
          <span className="text-[11px] text-slate-500">
            {isHindi
              ? "आपके गांव के लिए सटीक वर्षा, तापमान और मिट्टी डेटा प्राप्त करने हेतु अनुमति दें।"
              : "Authorize GPS for village-level telemetry, spray timing, and mandi rates."}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button
          type="button"
          onClick={handleRequestAllPermissions}
          disabled={isRequesting}
          className="px-4 py-2 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-75"
        >
          {isRequesting ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
          )}
          <span>{isHindi ? "सेंसर चालू करें" : "Authorize GPS"}</span>
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
          title={isHindi ? "बंद करें" : "Dismiss"}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
