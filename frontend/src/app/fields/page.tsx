"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { AppShell } from "@/components/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { useWeather } from "@/context/WeatherContext";
import { useFarm, FarmRecord } from "@/context/FarmContext";
import { FarmerProfile, getStoredProfile, saveProfile } from "@/lib/userStore";
import {
  getSavedFields,
  saveFarmerField,
  deleteFarmerField,
  setActiveField,
  getInitialFarmerField,
  FieldRecord,
} from "@/lib/fieldStore";
import { searchLocation } from "@/lib/api";
import { getDistrictCoordinates } from "@/lib/districtCoords";
import {
  INDIAN_STATES_DISTRICTS,
  DEFAULT_REGIONAL_CROPS,
  RegionalCropOption,
  RegionalSoilInfo,
} from "@/lib/indiaLocations";
import {
  MapPin,
  Plus,
  Trash2,
  Layers,
  CheckCircle2,
  Edit3,
  X,
  Sprout,
  Search,
  Navigation,
  RefreshCw,
  Check,
  User,
  Phone,
  ShieldCheck,
  Calendar,
  Droplets,
  HelpCircle,
  Leaf,
  ArrowRight,
  ArrowLeft,
  Crosshair,
  Sparkles,
  Sliders,
  AlertCircle,
} from "lucide-react";

// Dynamic import for Leaflet-based RealBoundaryMap to avoid SSR hydration issues
const RealBoundaryMap = dynamic(
  () => import("@/components/RealBoundaryMap").then((mod) => mod.RealBoundaryMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[420px] bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-emerald-400 gap-3 border border-slate-800">
        <RefreshCw className="h-7 w-7 animate-spin text-emerald-400" />
        <span className="text-xs font-mono font-bold">Loading Satellite GIS Engine...</span>
      </div>
    ),
  }
);

export default function MyFieldsPage() {
  const { language } = useLanguage();
  const isHindi = language === "hi";
  const { weather } = useWeather();
  const { activeFarm, createFarm, updateActiveFarm, selectFarm, farms } = useFarm();

  const [profile, setProfile] = useState<FarmerProfile>(() => getStoredProfile());
  const [savedFields, setSavedFields] = useState<FieldRecord[]>([]);
  const [activeFieldState, setActiveFieldState] = useState<FieldRecord>(() => getInitialFarmerField());

  // Modals & Flows
  const [showRegisterWizard, setShowRegisterWizard] = useState<boolean>(false);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Success Feedback
  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);
  const [profileSavedSuccess, setProfileSavedSuccess] = useState<boolean>(false);
  const [wizardSuccessMessage, setWizardSuccessMessage] = useState<string | null>(null);

  // Main Page Map State
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    activeFarm.center?.[0] || weather.lat || 23.2599,
    activeFarm.center?.[1] || weather.lon || 77.4126,
  ]);
  const [currentPolygon, setCurrentPolygon] = useState<Array<[number, number]>>(
    activeFarm.polygon?.length >= 3 ? activeFarm.polygon : []
  );
  const [calculatedAcres, setCalculatedAcres] = useState<number>(activeFarm.areaAcres || 5.0);

  // Location Search State on Main Page
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Array<any>>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  // ── Signup-Grade Multi-Step Register Wizard State ───────────────────────────
  const [wizState, setWizState] = useState<string>(profile.state || "Madhya Pradesh");
  const [wizDistrict, setWizDistrict] = useState<string>(profile.district || "Bhopal");
  const [wizVillage, setWizVillage] = useState<string>(profile.village || "");
  const [wizTehsil, setWizTehsil] = useState<string>(profile.tehsil || "");
  const [wizFieldName, setWizFieldName] = useState<string>("");
  const [wizMapCenter, setWizMapCenter] = useState<{ lat: number; lon: number }>({
    lat: activeFarm.center?.[0] || weather.lat || 23.2599,
    lon: activeFarm.center?.[1] || weather.lon || 77.4126,
  });
  const [wizPolygon, setWizPolygon] = useState<Array<[number, number]>>([]);
  const [wizAcres, setWizAcres] = useState<number>(5.0);
  const [wizSoilType, setWizSoilType] = useState<string>("Medium to Deep Black Clay Soil (काली मिट्टी - Vertisol)");
  const [wizIrrigation, setWizIrrigation] = useState<string>("Borewell + Rainfed");
  const [wizLocatingUser, setWizLocatingUser] = useState<boolean>(false);
  const [wizLocationStatus, setWizLocationStatus] = useState<string>("");
  const [wizVillageSearch, setWizVillageSearch] = useState<string>("");
  const [wizIsSearchingLoc, setWizIsSearchingLoc] = useState<boolean>(false);

  // Wizard Step 2: Crop & Agronomics
  const [wizPrimaryCrop, setWizPrimaryCrop] = useState<string>("Soybean");
  const [wizCropVariety, setWizCropVariety] = useState<string>("JS-335");
  const [wizSowingDate, setWizSowingDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [wizGrowthStage, setWizGrowthStage] = useState<string>("Flowering & Pod Formation");
  const [wizSowingMethod, setWizSowingMethod] = useState<string>("Line Sowing / Seed Drill (कतार बुवाई / सीड ड्रिल)");
  const [wizPreviousCrop, setWizPreviousCrop] = useState<string>("Wheat (गेहूं)");
  const [wizWaterSource, setWizWaterSource] = useState<string>("Tube Well / Borewell (नलकूप / बोरवेल)");

  // Wizard Dynamic Regional Crops & ICAR Soil
  const [wizRegionalCrops, setWizRegionalCrops] = useState<RegionalCropOption[]>(DEFAULT_REGIONAL_CROPS);
  const [wizDetectedSoil, setWizDetectedSoil] = useState<RegionalSoilInfo | null>(null);
  const [wizSoilOptions, setWizSoilOptions] = useState<string[]>([
    "Medium to Deep Black Clay Soil (काली मिट्टी - Vertisol)",
    "Medium Black Clay Loam (मध्यम काली दोमट)",
    "Shallow Red-Brown Murrum Soil (उथली मुरुमी मिट्टी)",
    "Alluvial Riverbank Loam (कछारी जलोढ़ दोमट)",
  ]);
  const [wizIsLoadingIntel, setWizIsLoadingIntel] = useState<boolean>(false);
  const [wizCropFilterQuery, setWizCropFilterQuery] = useState<string>("");
  const [wizCropCategoryFilter, setWizCropCategoryFilter] = useState<string>("all");
  const [wizErrorMessage, setWizErrorMessage] = useState<string | null>(null);
  const [wizSaving, setWizSaving] = useState<boolean>(false);

  // Profile Form State
  const [profFullName, setProfFullName] = useState<string>(profile.fullName || "Farmer Friend");
  const [profMobile, setProfMobile] = useState<string>(profile.mobileNumber || "9876543210");
  const [profVillage, setProfVillage] = useState<string>(profile.village || "Kolar");
  const [profTehsil, setProfTehsil] = useState<string>(profile.tehsil || "Huzur");
  const [profDistrict, setProfDistrict] = useState<string>(profile.district || "Bhopal");
  const [profState, setProfState] = useState<string>(profile.state || "Madhya Pradesh");
  const [profOwnership, setProfOwnership] = useState<string>(profile.landOwnership || "Owner");
  const [profExp, setProfExp] = useState<string>(profile.farmingExperience || "10+ Years");
  const [profSoilCard, setProfSoilCard] = useState<boolean>(profile.hasSoilHealthCard ?? true);

  // Clear ML pipeline cache helper to force immediate recalculation across all pages
  const bustPredictionCache = () => {
    if (typeof window !== "undefined") {
      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith("aasra_model_pipeline_cache_") || key.startsWith("nimbooz_prediction_cache_"))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {}
    }
  };

  // Sync profile & fields on mount, and handle ?action=register
  useEffect(() => {
    const p = getStoredProfile();
    if (p) {
      setProfile(p);
      setProfFullName(p.fullName || "");
      setProfMobile(p.mobileNumber || "");
      setProfVillage(p.village || "");
      setProfTehsil(p.tehsil || "");
      setProfDistrict(p.district || "Bhopal");
      setProfState(p.state || "Madhya Pradesh");
      setProfOwnership(p.landOwnership || "Owner");
      setProfExp(p.farmingExperience || "10+ Years");
      setProfSoilCard(p.hasSoilHealthCard ?? true);
    }

    const list = getSavedFields();
    if (list && list.length > 0) {
      setSavedFields(list);
      const match = list.find((f) => f.id === activeFarm.id) || list[0];
      setActiveFieldState(match);
      if (match.center) setMapCenter(match.center);
      else if (activeFarm.center) setMapCenter(activeFarm.center);
      if (match.polygon && match.polygon.length >= 3) setCurrentPolygon(match.polygon);
      else if (activeFarm.polygon?.length >= 3) setCurrentPolygon(activeFarm.polygon);
      if (match.areaAcres) setCalculatedAcres(match.areaAcres);
    } else {
      const initial = getInitialFarmerField();
      setSavedFields([initial]);
      setActiveFieldState(initial);
      if (initial.center) setMapCenter(initial.center);
      if (initial.polygon) setCurrentPolygon(initial.polygon);
      if (initial.areaAcres) setCalculatedAcres(initial.areaAcres);
    }

    // Check if redirected from another page to register a field
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("action") === "register") {
        openCreateFieldWizard();
      }
    }
  }, [activeFarm.id]);

  // Fetch Location Intelligence (ICAR Soil + Regional Crops)
  const fetchLocationIntelligence = async (dst: string, st: string, lat?: number, lon?: number) => {
    if (!dst || !st) return;
    setWizIsLoadingIntel(true);
    try {
      const res = await fetch(
        `/api/crops/regional?district=${encodeURIComponent(dst)}&state=${encodeURIComponent(st)}&lat=${lat ?? ""}&lon=${lon ?? ""}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.crops && Array.isArray(data.crops) && data.crops.length > 0) {
          setWizRegionalCrops(data.crops);

          // If current crop is not in new list, pick the first
          const currentMatch = data.crops.find(
            (c: RegionalCropOption) =>
              c.id.toLowerCase() === wizPrimaryCrop.toLowerCase() ||
              c.nameEn.toLowerCase() === wizPrimaryCrop.toLowerCase()
          );
          if (!currentMatch) {
            const firstCrop = data.crops[0];
            setWizPrimaryCrop(firstCrop.nameEn || firstCrop.id);
            if (firstCrop.varieties?.[0]) {
              setWizCropVariety(firstCrop.varieties[0]);
            }
          }
        }

        if (data.soil) {
          setWizDetectedSoil(data.soil);
          if (Array.isArray(data.soil.soilOptions) && data.soil.soilOptions.length > 0) {
            setWizSoilOptions(data.soil.soilOptions);
          }
          if (data.soil.detectedSoilType) {
            setWizSoilType(data.soil.detectedSoilType);
          }
        }
      }
    } catch (err) {
      console.warn("Dynamic location intelligence fetch error:", err);
    } finally {
      setWizIsLoadingIntel(false);
    }
  };

  // Handle Wizard State Change
  const handleWizStateChange = (st: string) => {
    setWizState(st);
    const districts = INDIAN_STATES_DISTRICTS[st] || ["Bhopal"];
    const firstDist = districts[0];
    setWizDistrict(firstDist);
    const coords = getDistrictCoordinates(firstDist, st);
    setWizMapCenter(coords);
    fetchLocationIntelligence(firstDist, st, coords.lat, coords.lon);
  };

  // Handle Wizard District Change
  const handleWizDistrictChange = (dst: string) => {
    setWizDistrict(dst);
    const coords = getDistrictCoordinates(dst, wizState);
    setWizMapCenter(coords);
    fetchLocationIntelligence(dst, wizState, coords.lat, coords.lon);
  };

  // Wizard GPS Auto-detect
  const handleWizLocateOnMap = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setWizLocationStatus("Browser location not supported. Please search your village or click on the map.");
      return;
    }

    setWizLocatingUser(true);
    setWizLocationStatus("Acquiring GPS coordinates on satellite map...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setWizMapCenter({ lat, lon });

        try {
          const res = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            if (data.district) setWizDistrict(data.district);
            if (data.state) setWizState(data.state);
            if (data.village || data.city) setWizVillage(data.village || data.city);
            if (data.tehsil) setWizTehsil(data.tehsil);
          }
        } catch {}

        setWizLocatingUser(false);
        setWizLocationStatus("Field location acquired successfully ✓");
      },
      (err) => {
        setWizLocatingUser(false);
        if (err.code === 1) {
          setWizLocationStatus("Location permission was denied. You can search village name or zoom on map.");
        } else {
          setWizLocationStatus("Could not acquire GPS. Please search village or select district.");
        }
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  };

  // Wizard Village Search
  const handleWizSearchVillage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wizVillageSearch.trim()) return;

    setWizIsSearchingLoc(true);
    setWizLocationStatus("");

    try {
      const query = encodeURIComponent(`${wizVillageSearch.trim()}, ${wizDistrict}, India`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const item = data[0];
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          setWizMapCenter({ lat, lon });
          setWizVillage(wizVillageSearch.trim());
          setWizLocationStatus(`Map centered on: ${item.display_name.split(",")[0]}`);
        } else {
          setWizLocationStatus("Location not found. Please click directly on the map.");
        }
      }
    } catch {
      setWizLocationStatus("Search service busy. You can click on the map to place boundary.");
    } finally {
      setWizIsSearchingLoc(false);
    }
  };

  // Select Active Field across the entire platform
  const handleSelectField = (field: FieldRecord) => {
    setActiveFieldState(field);
    setActiveField(field.id);
    selectFarm(field.id);

    if (field.center) setMapCenter(field.center);
    if (field.polygon && field.polygon.length >= 3) setCurrentPolygon(field.polygon);
    if (field.areaAcres) setCalculatedAcres(field.areaAcres);

    // Sync active farm in FarmContext
    updateActiveFarm({
      name: field.name,
      primaryCrop: field.crop,
      cropVariety: field.cropVariety,
      areaAcres: field.areaAcres,
      areaHa: field.areaHa,
      growthStage: field.growthStage,
      sowingDate: field.sowingDate,
      soilType: field.soilType,
      irrigationType: field.irrigationType,
      district: field.district || profile.district,
      state: field.state || profile.state,
      center: field.center,
      polygon: field.polygon,
    });

    // Sync profile primaryCrop & acreage
    const p = getStoredProfile();
    if (p) {
      saveProfile({
        ...p,
        fieldName: field.name,
        primaryCrop: field.crop,
        cropVariety: field.cropVariety,
        fieldAreaAcres: field.areaAcres,
        growthStage: field.growthStage,
        soilType: field.soilType,
        irrigationType: field.irrigationType,
      });
      setProfile(getStoredProfile());
    }

    bustPredictionCache();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("aasra_fields_updated"));
    }
  };

  // Main Map Boundary Change
  const handleBoundaryChange = useCallback(
    (points: Array<[number, number]>, acres: number) => {
      setCurrentPolygon(points);
      setCalculatedAcres(acres);
    },
    []
  );

  // Save Map Boundary to Current Active Field
  const handleSaveBoundaryToField = () => {
    if (!activeFieldState) return;
    const updatedField: FieldRecord = {
      ...activeFieldState,
      polygon: currentPolygon,
      areaAcres: calculatedAcres,
      areaHa: +(calculatedAcres * 0.404686).toFixed(2),
      center: mapCenter,
    };

    const updatedList = saveFarmerField(updatedField);
    setSavedFields(updatedList);
    setActiveFieldState(updatedField);

    updateActiveFarm({
      areaAcres: calculatedAcres,
      areaHa: updatedField.areaHa,
      polygon: currentPolygon,
      center: mapCenter,
    });

    const p = getStoredProfile();
    if (p) {
      saveProfile({
        ...p,
        fieldAreaAcres: calculatedAcres,
        polygon: currentPolygon,
      });
      setProfile(getStoredProfile());
    }

    try {
      fetch("/api/fields", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updatedField.id,
          polygon: currentPolygon,
          area_acres: calculatedAcres,
          lat: mapCenter[0],
          lon: mapCenter[1],
        }),
      }).catch(() => {});
    } catch {
      // non-blocking fallback
    }

    bustPredictionCache();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("aasra_fields_updated"));
    }
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 3500);
  };

  // In-App Delete Field Handler
  const confirmDeleteField = () => {
    if (!deleteConfirmId) return;
    if (savedFields.length <= 1) {
      setDeleteConfirmId(null);
      return;
    }
    const updated = deleteFarmerField(deleteConfirmId);
    setSavedFields(updated);
    if (updated.length > 0) {
      handleSelectField(updated[0]);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("aasra_fields_updated"));
    }
    setDeleteConfirmId(null);
  };

  // Location Search on Main Page
  const handleLocationSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      setIsSearching(true);
      setShowDropdown(true);
      const results = await searchLocation(val);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelectLocation = (res: any) => {
    const lat = Number(res.lat);
    const lon = Number(res.lon);
    setMapCenter([lat, lon]);
    setSearchQuery(res.name);
    setShowDropdown(false);

    const newPoly: Array<[number, number]> = [
      [lat + 0.0012, lon - 0.0015],
      [lat + 0.0015, lon + 0.0018],
      [lat - 0.0011, lon + 0.0014],
      [lat - 0.0014, lon - 0.0012],
    ];
    setCurrentPolygon(newPoly);
  };

  const handleAutoDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setMapCenter([lat, lon]);
        setSearchQuery(`GPS Location (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`);

        const newPoly: Array<[number, number]> = [
          [lat + 0.0012, lon - 0.0015],
          [lat + 0.0015, lon + 0.0018],
          [lat - 0.0011, lon + 0.0014],
          [lat - 0.0014, lon - 0.0012],
        ];
        setCurrentPolygon(newPoly);
      },
      () => {
        alert("GPS location access was denied. You can search any city or district instead.");
      }
    );
  };

  // Open Signup-Grade Wizard to Register a New Field
  const openCreateFieldWizard = () => {
    setEditingFieldId(null);
    setWizardStep(1);
    setWizErrorMessage(null);
    setWizardSuccessMessage(null);
    setWizFieldName(`Field Plot ${savedFields.length + 1}`);
    setWizState(profile.state || "Madhya Pradesh");
    setWizDistrict(profile.district || "Bhopal");
    setWizVillage(profile.village || "");
    setWizTehsil(profile.tehsil || "");
    
    const coords = getDistrictCoordinates(profile.district || "Bhopal", profile.state || "Madhya Pradesh");
    setWizMapCenter(coords);
    setWizPolygon([]);
    setWizAcres(5.0);
    setWizSoilType("Medium to Deep Black Clay Soil (काली मिट्टी - Vertisol)");
    setWizIrrigation("Borewell + Rainfed");
    setWizPrimaryCrop("Soybean");
    setWizCropVariety("JS-335");
    setWizSowingDate(new Date().toISOString().split("T")[0]);
    setWizGrowthStage("Flowering & Pod Formation");

    fetchLocationIntelligence(profile.district || "Bhopal", profile.state || "Madhya Pradesh", coords.lat, coords.lon);
    setShowRegisterWizard(true);
  };

  // Open Wizard to Edit an Existing Field
  const openEditFieldWizard = (f: FieldRecord) => {
    setEditingFieldId(f.id);
    setWizardStep(1);
    setWizErrorMessage(null);
    setWizardSuccessMessage(null);
    setWizFieldName(f.name);
    setWizState(f.state || profile.state || "Madhya Pradesh");
    setWizDistrict(f.district || profile.district || "Bhopal");
    setWizVillage(f.village || profile.village || "");
    setWizTehsil(profile.tehsil || "");
    
    const centerLat = f.center?.[0] || 23.2599;
    const centerLon = f.center?.[1] || 77.4126;
    setWizMapCenter({ lat: centerLat, lon: centerLon });
    setWizPolygon(f.polygon || []);
    setWizAcres(f.areaAcres || 5.0);
    setWizSoilType(f.soilType || "Medium to Deep Black Clay Soil (काली मिट्टी - Vertisol)");
    setWizIrrigation(f.irrigationType || "Borewell + Rainfed");
    setWizPrimaryCrop(f.crop || "Soybean");
    setWizCropVariety(f.cropVariety || "JS-335");
    setWizSowingDate(f.sowingDate || new Date().toISOString().split("T")[0]);
    setWizGrowthStage(f.growthStage || "Flowering & Pod Formation");

    fetchLocationIntelligence(f.district || profile.district || "Bhopal", f.state || profile.state || "Madhya Pradesh", centerLat, centerLon);
    setShowRegisterWizard(true);
  };

  // Complete Field Registration Save (Identical to signup persistence)
  const handleCompleteFieldRegistration = async () => {
    if (!wizPrimaryCrop.trim()) {
      setWizErrorMessage(isHindi ? "कृपया फसल चुनें。" : "Please select a primary crop.");
      return;
    }

    setWizSaving(true);
    setWizErrorMessage(null);

    const acres = Number(wizAcres) || 5.0;
    const finalPolygon: Array<[number, number]> = wizPolygon.length >= 3 ? wizPolygon : [
      [wizMapCenter.lat + 0.0012, wizMapCenter.lon - 0.0015],
      [wizMapCenter.lat + 0.0015, wizMapCenter.lon + 0.0018],
      [wizMapCenter.lat - 0.0011, wizMapCenter.lon + 0.0014],
      [wizMapCenter.lat - 0.0014, wizMapCenter.lon - 0.0012],
    ];

    if (editingFieldId) {
      // Edit existing
      const existing = savedFields.find((f) => f.id === editingFieldId);
      const updatedObj: FieldRecord = {
        id: editingFieldId,
        name: wizFieldName.trim() || existing?.name || "Farm Plot",
        crop: wizPrimaryCrop,
        cropVariety: wizCropVariety,
        areaAcres: acres,
        areaHa: +(acres * 0.404686).toFixed(2),
        center: [wizMapCenter.lat, wizMapCenter.lon],
        polygon: finalPolygon,
        sowingDate: wizSowingDate,
        growthStage: wizGrowthStage,
        soilType: wizSoilType,
        irrigationType: wizIrrigation,
        color: existing?.color || "#10B981",
        district: wizDistrict.trim(),
        state: wizState.trim(),
        village: wizVillage.trim(),
        healthScore: existing?.healthScore || 94,
      };

      const updatedList = saveFarmerField(updatedObj);
      setSavedFields(updatedList);
      handleSelectField(updatedObj);

      try {
        await fetch("/api/fields", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: updatedObj.name,
            lat: wizMapCenter.lat,
            lon: wizMapCenter.lon,
            area_acres: acres,
            crop: wizPrimaryCrop,
            variety: wizCropVariety,
            soil_type: wizSoilType,
            polygon: finalPolygon,
          }),
        });
      } catch {}

      bustPredictionCache();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("aasra_fields_updated"));
      }
      setWizardSuccessMessage(isHindi ? "खेत विवरण सफलतापूर्वक अपडेट हो गया!" : "Field plot updated successfully!");
      setTimeout(() => {
        setWizSaving(false);
        setShowRegisterWizard(false);
      }, 1200);
    } else {
      // Register Brand New Farm Field
      const newFarm = createFarm({
        name: wizFieldName.trim() || `Farm Plot ${savedFields.length + 1}`,
        district: wizDistrict.trim(),
        state: wizState.trim(),
        village: wizVillage.trim(),
        primaryCrop: wizPrimaryCrop,
        cropVariety: wizCropVariety,
        areaAcres: acres,
        areaHa: +(acres * 0.404686).toFixed(2),
        growthStage: wizGrowthStage,
        sowingDate: wizSowingDate,
        soilType: wizSoilType,
        irrigationType: wizIrrigation,
        center: [wizMapCenter.lat, wizMapCenter.lon],
        polygon: finalPolygon,
      });

      const newFieldObj: FieldRecord = {
        id: newFarm.id,
        name: newFarm.name,
        crop: wizPrimaryCrop,
        cropVariety: wizCropVariety,
        areaAcres: acres,
        areaHa: +(acres * 0.404686).toFixed(2),
        center: [wizMapCenter.lat, wizMapCenter.lon],
        polygon: finalPolygon,
        sowingDate: wizSowingDate,
        growthStage: wizGrowthStage,
        soilType: wizSoilType,
        irrigationType: wizIrrigation,
        color: "#10B981",
        district: wizDistrict.trim(),
        state: wizState.trim(),
        village: wizVillage.trim(),
        healthScore: 94,
      };

      const updated = saveFarmerField(newFieldObj);
      setSavedFields(updated);
      handleSelectField(newFieldObj);

      try {
        await fetch("/api/fields", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newFieldObj.name,
            lat: wizMapCenter.lat,
            lon: wizMapCenter.lon,
            area_acres: acres,
            crop: wizPrimaryCrop,
            variety: wizCropVariety,
            soil_type: wizSoilType,
            polygon: finalPolygon,
          }),
        });
      } catch {}

      bustPredictionCache();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("aasra_fields_updated"));
      }
      setWizardSuccessMessage(isHindi ? "नया खेत सफलतापूर्वक पंजीकृत व सक्रिय हो गया!" : "New field plot registered & activated!");
      setTimeout(() => {
        setWizSaving(false);
        setShowRegisterWizard(false);
      }, 1200);
    }
  };

  // Save Farmer Profile Details
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: FarmerProfile = {
      ...profile,
      fullName: profFullName.trim() || "Farmer Friend",
      mobileNumber: profMobile.trim(),
      village: profVillage.trim(),
      tehsil: profTehsil.trim(),
      district: profDistrict.trim(),
      state: profState.trim(),
      landOwnership: profOwnership as any,
      farmingExperience: profExp,
      hasSoilHealthCard: profSoilCard,
    };

    saveProfile(updatedProfile);
    setProfile(updatedProfile);
    bustPredictionCache();

    setProfileSavedSuccess(true);
    setTimeout(() => {
      setProfileSavedSuccess(false);
      setShowProfileModal(false);
    }, 1500);
  };

  // Filter regional crops for Step 2 of Wizard
  const displayedRegionalCrops = wizRegionalCrops.filter((c) => {
    const matchesCat =
      wizCropCategoryFilter === "all" || c.category === wizCropCategoryFilter;
    const matchesQuery =
      !wizCropFilterQuery.trim() ||
      c.nameEn.toLowerCase().includes(wizCropFilterQuery.toLowerCase()) ||
      c.nameHi.toLowerCase().includes(wizCropFilterQuery.toLowerCase()) ||
      c.varieties?.some((v) =>
        v.toLowerCase().includes(wizCropFilterQuery.toLowerCase())
      );
    return matchesCat && matchesQuery;
  });

  const currentWizCropObj = wizRegionalCrops.find(
    (c) =>
      c.id.toLowerCase() === wizPrimaryCrop.toLowerCase() ||
      c.nameEn.toLowerCase() === wizPrimaryCrop.toLowerCase()
  );

  const currentField = activeFieldState || savedFields[0] || getInitialFarmerField();

  return (
    <AppShell>
      <div className="min-h-screen bg-[#fbfcf8] bg-[radial-gradient(#1b4332_0.75px,transparent_0.75px)] [background-size:24px_24px] text-slate-900 pb-20">
        <main id="main-content" role="main" className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
          
          {/* ── Top Header with Clean Greeting & Action Buttons ────────────────── */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e8ede4] pb-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-xs font-bold text-[#1b4332] bg-[#e8f5e9] px-3 py-1 rounded-full border border-[#c8e6c9] flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-emerald-700" />
                  <span className="notranslate" translate="no">
                    {(profile.district || activeFarm.district || "Bhopal").toUpperCase()}, {(profile.state || activeFarm.state || "Madhya Pradesh")}
                  </span>
                </span>
                <span className="text-xs font-mono font-bold text-slate-700 bg-white border border-[#e8ede4] px-3 py-1 rounded-full shadow-2xs">
                  {savedFields.length} {savedFields.length === 1 ? (isHindi ? "खेत पंजीकृत" : "Plot Registered") : (isHindi ? "खेत पंजीकृत" : "Plots Registered")}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#11261f] tracking-tight">
                {isHindi ? `नमस्ते, ${profile.fullName || "किसान साथी"} 👋` : `Hello, ${profile.fullName || "Farmer Friend"} 👋`}
              </h1>
              <p className="text-sm text-slate-600 font-medium max-w-3xl mt-1">
                {isHindi
                  ? "यहाँ से आप अपने सभी खेतों को प्रबंधित करें, नया खेत जोड़ें, नक्शे पर सीमा बनाएं और अपनी किसान प्रोफ़ाइल अपडेट करें।"
                  : "Manage your registered field plots, draw satellite boundaries, and update your farmer profile settings."}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Edit Profile Button */}
              <button
                type="button"
                id="btn-edit-farmer-profile"
                onClick={() => setShowProfileModal(true)}
                aria-label="Edit Profile Information"
                className="px-4 py-2.5 rounded-2xl bg-white hover:bg-[#f2f5f0] text-[#1b4332] border border-[#e8ede4] font-bold text-xs shadow-2xs transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <User className="h-4 w-4 text-emerald-700" />
                <span>{isHindi ? "किसान प्रोफ़ाइल बदलें" : "Edit Profile Info"}</span>
              </button>

              {/* Register New Field Button (Opens Signup-Grade Experience) */}
              <button
                type="button"
                id="btn-register-new-field"
                onClick={openCreateFieldWizard}
                aria-label="Register New Field Plot"
                className="px-4 py-2.5 rounded-2xl bg-[#1b4332] hover:bg-[#143326] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                <span>{isHindi ? "नया खेत जोड़ें" : "Register New Field"}</span>
              </button>
            </div>
          </header>

          {/* ── 1. Interactive Satellite Map & Boundary Editor ──────────────── */}
          <section aria-labelledby="heading-boundary-editor" className="bg-white/95 backdrop-blur-md border border-[#e8ede4] rounded-3xl p-6 sm:p-7 shadow-[0_10px_30px_rgba(27,67,50,0.04)] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e8ede4] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-900 bg-[#e8f5e9] px-2.5 py-0.5 rounded-full border border-[#c8e6c9] uppercase">
                    ACTIVE PLOT: {currentField.name}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    {currentField.crop} ({currentField.growthStage})
                  </span>
                </div>
                <h2 id="heading-boundary-editor" className="text-xl font-bold text-[#11261f] font-display">
                  {isHindi ? "सैटेलाइट मैप पर खेत की सीमा निर्धारण" : "Interactive Field Perimeter & Boundary Editor"}
                </h2>
                <p className="text-xs text-slate-500">
                  {isHindi
                    ? "सफेद कोनों को खींचकर अपने खेत की वास्तविक बाड़ से मिलाएं — एकड़ की गणना स्वतः अपडेट होगी।"
                    : "Drag the white corner pins to match your real field boundary. Acreage is calculated automatically."}
                </p>
              </div>

              {/* Search location or auto GPS */}
              <div className="flex items-center gap-2 relative w-full sm:w-auto">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    id="input-search-location-main"
                    name="searchLocation"
                    value={searchQuery}
                    onChange={(e) => handleLocationSearch(e.target.value)}
                    onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                    placeholder="Search village or district..."
                    aria-label="Search village or district"
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[#e8ede4] bg-[#fbfcf8] text-[#11261f] font-bold focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  {isSearching && (
                    <RefreshCw className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-2.5 animate-spin" />
                  )}

                  {/* Dropdown Results */}
                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-[#e8ede4] rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                      {searchResults.map((res) => (
                        <button
                          key={res.id}
                          type="button"
                          onClick={() => handleSelectLocation(res)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-[#e8f5e9] text-[#11261f] font-medium flex items-center justify-between cursor-pointer"
                        >
                          <span className="truncate font-bold">{res.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                            {Number(res.lat).toFixed(2)}°N, {Number(res.lon).toFixed(2)}°E
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  id="btn-auto-detect-gps-main"
                  onClick={handleAutoDetectGPS}
                  aria-label="Detect GPS coordinates"
                  className="px-3 py-2 rounded-xl bg-white hover:bg-[#f2f5f0] text-slate-700 border border-[#e8ede4] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                  title="Detect GPS"
                >
                  <Navigation className="h-3.5 w-3.5 text-emerald-700" />
                  <span className="hidden sm:inline">GPS</span>
                </button>
              </div>
            </div>

            {/* Leaflet Boundary Map */}
            <div className="relative rounded-3xl overflow-hidden border border-[#e8ede4] shadow-sm">
              <RealBoundaryMap
                center={mapCenter}
                zoom={16}
                initialPoints={currentPolygon.length >= 3 ? currentPolygon : profile?.polygon && profile.polygon.length >= 3 ? profile.polygon : undefined}
                onBoundaryChange={handleBoundaryChange}
                onCenterChange={(newC) => {
                  setMapCenter((prev) => {
                    if (Math.abs(prev[0] - newC[0]) < 0.0003 && Math.abs(prev[1] - newC[1]) < 0.0003) return prev;
                    return newC;
                  });
                }}
              />
            </div>

            {/* Calculated Area Bar & Save Boundary Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#fbfcf8] border border-[#e8ede4]">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                  {isHindi ? "नक्शे से मापा गया कुल क्षेत्रफल" : "Calculated Acreage for Active Plot"}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#11261f] font-mono">
                    {calculatedAcres} <span className="text-sm font-semibold text-slate-500">Acres</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-900 bg-[#e8f5e9] border border-[#c8e6c9] px-2.5 py-0.5 rounded-md">
                    {(calculatedAcres * 0.404686).toFixed(2)} Hectares ({(calculatedAcres * 4046.86).toLocaleString("en-IN", { maximumFractionDigits: 0 })} m²)
                  </span>
                </div>
              </div>

              <button
                type="button"
                id="btn-save-boundary-main"
                onClick={handleSaveBoundaryToField}
                aria-label="Save Boundary to Field"
                className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer ${
                  isSavedSuccess
                    ? "bg-[#1b4332] text-white"
                    : "bg-[#1b4332] hover:bg-[#143326] text-white hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {isSavedSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>{isHindi ? "सीमा सुरक्षित हो गई!" : "Boundary Saved to Field!"}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isHindi ? "खेत की सीमा सुरक्षित करें" : "Save Boundary to Field"}</span>
                  </>
                )}
              </button>
            </div>
          </section>

          {/* ── 2. Registered Farm Plots Portfolio & Details ───────────────── */}
          <section aria-labelledby="heading-plots-portfolio" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="heading-plots-portfolio" className="text-xl font-bold text-[#11261f] font-display flex items-center gap-2">
                  <Layers className="h-5 w-5 text-emerald-700" />
                  <span>{isHindi ? "पंजीकृत खेतों की सूची (My Fields Portfolio)" : "Your Registered Farm Plots"}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isHindi
                    ? "किसी भी खेत को सक्रिय बनाने के लिए उस पर क्लिक करें। पूरी वेबसाइट उसी खेत के आधार पर काम करेगी।"
                    : "Click any field to make it active. The entire website recalculates predictions based on the active plot."}
                </p>
              </div>

              <button
                type="button"
                id="btn-add-plot-portfolio"
                onClick={openCreateFieldWizard}
                aria-label="Add Another Field"
                className="px-4 py-2 rounded-xl bg-white hover:bg-[#f2f5f0] text-[#1b4332] border border-[#e8ede4] font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4 text-emerald-700" />
                <span>{isHindi ? "नया खेत जोड़ें" : "Add Another Field"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedFields.map((f) => {
                const isSelected = currentField.id === f.id;
                return (
                  <article
                    key={f.id}
                    onClick={() => handleSelectField(f)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between gap-4 relative ${
                      isSelected
                        ? "bg-white border-2 border-emerald-600 ring-4 ring-emerald-500/10 shadow-md"
                        : "bg-white hover:border-emerald-400 hover:shadow-md border-[#e8ede4] shadow-2xs"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 shrink-0" />
                            )}
                            <h3 className="font-extrabold text-base text-[#11261f] font-display">
                              {f.name}
                            </h3>
                          </div>
                          <span className="text-xs text-emerald-800 font-bold block mt-0.5">
                            🌱 {f.crop} <span className="text-slate-400 font-normal">({f.cropVariety || "Standard"})</span>
                          </span>
                        </div>

                        <span className="text-xs font-mono font-black text-emerald-900 bg-[#e8f5e9] border border-[#c8e6c9] px-2.5 py-1 rounded-full">
                          {f.areaAcres} Acres
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-600 pt-2 border-t border-[#e8ede4]">
                        <div>
                          <span className="text-slate-400 text-[10px] block font-sans uppercase">GROWTH STAGE</span>
                          <span className="font-bold truncate block text-[#11261f]">{f.growthStage || "Flowering"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block font-sans uppercase">LOCATION</span>
                          <span className="font-bold truncate block text-[#11261f]">{f.district || profile.district || "Bhopal"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block font-sans uppercase">SOIL TYPE</span>
                          <span className="font-bold truncate block text-[#11261f]">{f.soilType?.split(" ")[0] || "Black Clay"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block font-sans uppercase">IRRIGATION</span>
                          <span className="font-bold truncate block text-[#11261f]">{f.irrigationType?.split("+")[0] || "Drip"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#e8ede4] text-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditFieldWizard(f);
                        }}
                        className="text-[#1b4332] hover:text-[#143326] font-bold flex items-center gap-1 cursor-pointer py-1 px-2 rounded-lg hover:bg-[#e8f5e9] transition-colors"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-emerald-700" />
                        <span>{isHindi ? "विवरण बदलें" : "Edit Plot Details"}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <span className="text-emerald-900 font-bold flex items-center gap-1 text-[11px] bg-[#e8f5e9] px-2.5 py-0.5 rounded-full border border-[#c8e6c9]">
                            <Check className="h-3 w-3 text-emerald-700" />
                            <span>{isHindi ? "सक्रिय खेत" : "Active Plot"}</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectField(f);
                            }}
                            className="text-emerald-700 hover:text-emerald-900 font-bold text-[11px] underline cursor-pointer"
                          >
                            {isHindi ? "सक्रिय करें" : "Set Active"}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(f.id);
                          }}
                          aria-label={`Delete ${f.name}`}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer ml-1"
                          title="Delete Plot"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

        </main>
      </div>

      {/* ── 3. SIGNUP-GRADE MULTI-STEP FIELD REGISTRATION WIZARD ──────────── */}
      {showRegisterWizard && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto font-sans">
            
            {/* Modal Header & Progress Indicator */}
            <div className="flex justify-between items-start border-b border-[#e8ede4] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#e8f5e9] text-[#1b4332]">
                  <Sprout className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-[#1b4332] font-display tracking-tight">
                    {editingFieldId
                      ? (isHindi ? "खेत विवरण संपादित करें" : "Edit Field Plot Details")
                      : (isHindi ? "नया खेत पंजीकृत करें (Signup-Grade)" : "Register New Field Plot")}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {wizardStep === 1
                      ? (isHindi ? "चरण 1: स्थान, सैटेलाइट मेढ़ व मिट्टी" : "Step 1 of 2: Land Location, Satellite Map & Soil")
                      : (isHindi ? "चरण 2: क्षेत्रीय फसल व कृषि इतिहास" : "Step 2 of 2: Regional Crop & Agronomic Profile")}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRegisterWizard(false)}
                aria-label="Close modal"
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-[#e8f5e9]/50 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Step Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#1b4332] to-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${(wizardStep / 2) * 100}%` }}
              />
            </div>

            {/* Error Alert */}
            {wizErrorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed font-medium">{wizErrorMessage}</p>
              </div>
            )}

            {/* Success Alert */}
            {wizardSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <p className="text-xs font-bold">{wizardSuccessMessage}</p>
              </div>
            )}

            {/* ── STEP 1: Land Location, Satellite Map Boundary & Soil ─────── */}
            {wizardStep === 1 && (
              <div className="space-y-5">
                {/* Field Name */}
                <div className="space-y-1.5">
                  <label htmlFor="input-wiz-field-name" className="text-xs font-bold text-slate-700">
                    {isHindi ? "खेत / प्लॉट का नाम *" : "Field / Plot Name *"}
                  </label>
                  <input
                    type="text"
                    id="input-wiz-field-name"
                    name="fieldName"
                    required
                    value={wizFieldName}
                    onChange={(e) => setWizFieldName(e.target.value)}
                    placeholder="e.g. North Canal Farm Plot"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d] focus:bg-white focus:outline-none focus:border-[#1b4332] focus:ring-1 focus:ring-[#1b4332]/20"
                  />
                </div>

                {/* State & District Dropdown Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="select-wiz-state" className="text-xs font-bold text-slate-700">
                      State (राज्य) *
                    </label>
                    <select
                      id="select-wiz-state"
                      name="state"
                      value={wizState}
                      onChange={(e) => handleWizStateChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d] cursor-pointer"
                    >
                      {Object.keys(INDIAN_STATES_DISTRICTS).map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="select-wiz-district" className="text-xs font-bold text-slate-700">
                      District (जिला) *
                    </label>
                    <select
                      id="select-wiz-district"
                      name="district"
                      value={wizDistrict}
                      onChange={(e) => handleWizDistrictChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d] cursor-pointer"
                    >
                      {(INDIAN_STATES_DISTRICTS[wizState] || ["Bhopal"]).map((dst) => (
                        <option key={dst} value={dst}>
                          {dst}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Village Search & Device GPS */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <form onSubmit={handleWizSearchVillage} className="flex-1 relative">
                      <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        id="input-wiz-village-search"
                        name="villageSearch"
                        value={wizVillageSearch}
                        onChange={(e) => setWizVillageSearch(e.target.value)}
                        placeholder="Search Village, Town or Tehsil..."
                        className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-medium text-[#0d253d] focus:bg-white focus:outline-none focus:border-[#1b4332] focus:ring-1 focus:ring-[#1b4332]/20"
                      />
                      <button
                        type="submit"
                        disabled={wizIsSearchingLoc}
                        className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-[#1b4332] text-white text-[11px] font-bold cursor-pointer hover:bg-[#2d6a4f] transition-colors"
                      >
                        {wizIsSearchingLoc ? "Searching..." : "Search"}
                      </button>
                    </form>

                    <button
                      type="button"
                      id="btn-wiz-gps"
                      onClick={handleWizLocateOnMap}
                      disabled={wizLocatingUser}
                      className="px-3.5 py-2.5 rounded-xl bg-white border border-[#e8ede4] hover:border-[#1b4332] text-[#1b4332] text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer shrink-0 transition-all hover:bg-[#e8f5e9]/60"
                    >
                      <Crosshair className={`h-4 w-4 text-[#1b4332] ${wizLocatingUser ? "animate-spin" : ""}`} />
                      <span>{isHindi ? "GPS खेत खोजें" : "Device GPS"}</span>
                    </button>
                  </div>

                  {wizLocationStatus && (
                    <p className="text-[11px] font-mono text-[#1b4332] bg-[#e8f5e9]/70 p-2 rounded-lg border border-[#c8e6c9]">
                      ℹ️ {wizLocationStatus}
                    </p>
                  )}
                </div>

                {/* Satellite Boundary Map (Interactive polygon boundary editor) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">
                      {isHindi ? "नक्शे पर खेत की मेढ़ (Satellite Boundary Polygon)" : "Interactive Satellite Boundary Polygon"}
                    </span>
                    <span className="text-[10px] font-mono text-[#1b4332] font-bold">
                      Center: {wizMapCenter.lat.toFixed(4)}°N, {wizMapCenter.lon.toFixed(4)}°E
                    </span>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden border border-[#e3e8ee] shadow-sm">
                    <RealBoundaryMap
                      center={[wizMapCenter.lat, wizMapCenter.lon]}
                      zoom={16}
                      initialPoints={wizPolygon.length >= 3 ? wizPolygon : undefined}
                      onCenterChange={(newC) => {
                        setWizMapCenter((prev) => {
                          if (Math.abs(prev.lat - newC[0]) < 0.0003 && Math.abs(prev.lon - newC[1]) < 0.0003) return prev;
                          return { lat: newC[0], lon: newC[1] };
                        });
                      }}
                      onBoundaryChange={(pts, acres) => {
                        setWizPolygon(pts);
                        setWizAcres(acres);
                      }}
                    />
                  </div>
                </div>

                {/* Acreage Controller (Synced with Map) */}
                <div className="p-4 rounded-2xl bg-[#f6f9fc] border border-[#e3e8ee] space-y-2.5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-bold text-[#0d253d]">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span>{isHindi ? "खेत का कुल क्षेत्रफल (Acreage):" : "Total Plot Acreage:"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500">
                        ({(wizAcres * 0.4047).toFixed(2)} Ha)
                      </span>
                      <div className="flex items-center bg-white border border-[#1b4332] rounded-xl px-2.5 py-1 shadow-2xs">
                        <input
                          type="number"
                          id="input-wiz-acres"
                          name="acres"
                          min="0.1"
                          max="500"
                          step="0.1"
                          value={wizAcres}
                          onChange={(e) => setWizAcres(Number(e.target.value))}
                          className="w-16 font-mono text-xs font-black text-[#1b4332] focus:outline-none text-right mr-1"
                        />
                        <span className="font-mono text-xs font-bold text-slate-700">Acres</span>
                      </div>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0.5"
                    max={Math.max(50, Math.ceil(wizAcres + 10))}
                    step="0.1"
                    value={wizAcres}
                    onChange={(e) => setWizAcres(Number(e.target.value))}
                    aria-label="Acreage slider"
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1b4332]"
                  />
                </div>

                {/* ICAR Soil Detection Badge */}
                {wizDetectedSoil && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#f8faf7] border border-[#e2e8df] text-[#11261f] text-xs shadow-2xs">
                    <CheckCircle2 className="h-4 w-4 text-[#2d6a4f] shrink-0" />
                    <div className="flex-1 flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 font-mono">
                        {isHindi ? "पहचानी गई मिट्टी:" : "Auto-Detected Soil:"}
                      </span>
                      <span className="font-bold text-[#11261f]">
                        {wizDetectedSoil.detectedSoilType}
                      </span>
                      {wizDetectedSoil.typicalPh && (
                        <span className="text-[10px] bg-[#e8ede4] text-[#2d6a4f] px-2 py-0.5 rounded-md font-mono font-bold">
                          pH {wizDetectedSoil.typicalPh}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Soil & Irrigation Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="select-wiz-soil-type" className="text-xs font-bold text-slate-700">
                      Soil Type (मिट्टी की किस्म)
                    </label>
                    <select
                      id="select-wiz-soil-type"
                      name="soilType"
                      value={wizSoilType}
                      onChange={(e) => setWizSoilType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d] cursor-pointer"
                    >
                      {wizSoilOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                      {!wizSoilOptions.includes(wizSoilType) && (
                        <option value={wizSoilType}>{wizSoilType}</option>
                      )}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="select-wiz-irrigation" className="text-xs font-bold text-slate-700">
                      Irrigation (सिंचाई साधन)
                    </label>
                    <select
                      id="select-wiz-irrigation"
                      name="irrigation"
                      value={wizIrrigation}
                      onChange={(e) => setWizIrrigation(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d] cursor-pointer"
                    >
                      <option value="Borewell + Rainfed">Borewell + Rainfed (बोरवेल + वर्षा)</option>
                      <option value="Canal Irrigation">Canal Irrigation (नहरी सिंचाई)</option>
                      <option value="Drip Irrigation">Drip Irrigation (ड्रिप टपक सिंचाई)</option>
                      <option value="Purely Rainfed">Purely Rainfed (केवल वर्षा आधारित)</option>
                    </select>
                  </div>
                </div>

                {/* Footer Buttons for Step 1 */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowRegisterWizard(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {isHindi ? "रद्द करें" : "Cancel"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!wizFieldName.trim()) {
                        setWizErrorMessage(isHindi ? "कृपया खेत का नाम दर्ज करें।" : "Please enter a field name.");
                        return;
                      }
                      setWizErrorMessage(null);
                      setWizardStep(2);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{isHindi ? "अगला: फसल व कृषि इतिहास" : "Next: Crop & Agronomics"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Regional Crop Selection & Agronomic Profile ──────── */}
            {wizardStep === 2 && (
              <div className="space-y-5">
                {/* Regional Banner */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-[#e8f5e9]/70 p-3 rounded-2xl border border-[#c8e6c9]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#1b4332] shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-[#1b4332]">
                        {isHindi
                          ? `${wizDistrict}, ${wizState} के लिए अनुशंसित क्षेत्रीय फसलें`
                          : `Regional Crops for ${wizDistrict}, ${wizState}`}
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        {isHindi
                          ? "ICAR कृषि-जलवायु क्षेत्र व स्थानीय बाजार मांग अनुसार"
                          : "Curated from ICAR agro-climatic & market data"}
                      </span>
                    </div>
                  </div>
                  {wizIsLoadingIntel && (
                    <span className="text-[10px] font-mono text-[#1b4332] animate-pulse bg-white px-2 py-0.5 rounded-full border border-[#c8e6c9]">
                      Analyzing ICAR...
                    </span>
                  )}
                </div>

                {/* Search & Category Filter */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      id="input-wiz-crop-search"
                      name="cropSearch"
                      placeholder={isHindi ? `${wizDistrict} में उगाई जाने वाली फसल खोजें...` : `Filter crops in ${wizDistrict}...`}
                      value={wizCropFilterQuery}
                      onChange={(e) => setWizCropFilterQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-medium text-[#0d253d] focus:bg-white focus:outline-none focus:border-[#1b4332] focus:ring-1 focus:ring-[#1b4332]/20"
                    />
                    {wizCropFilterQuery && (
                      <button
                        type="button"
                        onClick={() => setWizCropFilterQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    {[
                      { id: "all", label: isHindi ? "सभी" : "All" },
                      { id: "cereal", label: isHindi ? "अनाज" : "Cereals" },
                      { id: "cash_crop", label: isHindi ? "नकदी" : "Cash" },
                      { id: "pulse", label: isHindi ? "दलहन" : "Pulses" },
                      { id: "oilseed", label: isHindi ? "तिलहन" : "Oilseeds" },
                      { id: "horticulture", label: isHindi ? "बागवानी" : "Horticulture" },
                      { id: "spice", label: isHindi ? "मसाले" : "Spices" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setWizCropCategoryFilter(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                          wizCropCategoryFilter === cat.id
                            ? "bg-[#1b4332] text-white shadow-2xs"
                            : "bg-[#f6f9fc] text-slate-600 hover:bg-slate-200/60 border border-[#e3e8ee]"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Crop Selection Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1">
                  {displayedRegionalCrops.map((c) => {
                    const isSelected =
                      wizPrimaryCrop.toLowerCase() === c.id.toLowerCase() ||
                      wizPrimaryCrop.toLowerCase() === c.nameEn.toLowerCase();
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setWizPrimaryCrop(c.nameEn || c.id);
                          if (c.varieties && c.varieties.length > 0) {
                            setWizCropVariety(c.varieties[0]);
                          }
                        }}
                        className={`rounded-2xl border text-left overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                          isSelected
                            ? "bg-white border-[#1b4332] shadow-md ring-2 ring-[#1b4332]/20 scale-[1.02]"
                            : "bg-white hover:border-slate-300 border-[#e3e8ee] text-slate-700"
                        }`}
                      >
                        <div className="relative h-20 w-full overflow-hidden bg-slate-900">
                          <Image
                            src={c.image}
                            alt={c.nameEn}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                          <span className="absolute top-1.5 right-1.5 text-xs bg-white/95 backdrop-blur-md rounded-md px-1.5 py-0.5 shadow-2xs">
                            {c.icon}
                          </span>
                        </div>
                        <div className="p-2.5 bg-slate-50/70 flex flex-col justify-between flex-1">
                          <div>
                            <span className="text-xs font-bold text-[#0d253d] block line-clamp-1">
                              {isHindi ? c.nameHi : c.nameEn}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                              {c.varieties?.[0] ? `Var: ${c.varieties[0]}` : "High Yield"}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#1b4332]">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Selected</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Variety & Sowing Date with Local Cultivar Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="input-wiz-crop-variety" className="text-xs font-bold text-slate-700">
                        Crop Variety (फसल की किस्म)
                      </label>
                      {currentWizCropObj?.varieties && currentWizCropObj.varieties.length > 0 && (
                        <span className="text-[10px] text-[#1b4332] font-bold">
                          {currentWizCropObj.varieties.length} Local Cultivars
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      id="input-wiz-crop-variety"
                      name="cropVariety"
                      value={wizCropVariety}
                      onChange={(e) => setWizCropVariety(e.target.value)}
                      placeholder="e.g. JS-335 / HD-2967"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d]"
                    />
                    {currentWizCropObj?.varieties && currentWizCropObj.varieties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentWizCropObj.varieties.map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setWizCropVariety(v)}
                            className={`text-[10px] px-2 py-0.5 rounded-md border font-mono transition-colors cursor-pointer ${
                              wizCropVariety === v
                                ? "bg-[#1b4332] text-white border-[#1b4332]"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="input-wiz-sowing-date" className="text-xs font-bold text-slate-700">
                      Sowing Date (बुवाई की तारीख)
                    </label>
                    <input
                      type="date"
                      id="input-wiz-sowing-date"
                      name="sowingDate"
                      value={wizSowingDate}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setWizSowingDate(newDate);
                        if (newDate) {
                          const diff = Math.floor((new Date().getTime() - new Date(newDate).getTime()) / (1000 * 60 * 60 * 24));
                          if (diff >= 0 && diff < 20) setWizGrowthStage("Germination & Seedling");
                          else if (diff >= 20 && diff < 45) setWizGrowthStage("Vegetative Canopy Growth");
                          else if (diff >= 45 && diff < 75) setWizGrowthStage("Flowering & Pod Formation");
                          else if (diff >= 75) setWizGrowthStage("Maturity & Pre-Harvest");
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d]"
                    />
                  </div>
                </div>

                {/* Sowing Method, Previous Crop & Water Source */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="select-wiz-sowing-method" className="text-xs font-bold text-slate-700">
                      Sowing Method (बुवाई विधि)
                    </label>
                    <select
                      id="select-wiz-sowing-method"
                      name="sowingMethod"
                      value={wizSowingMethod}
                      onChange={(e) => setWizSowingMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d] cursor-pointer"
                    >
                      <option value="Line Sowing / Seed Drill (कतार बुवाई / सीड ड्रिल)">Line Sowing (कतार बुवाई)</option>
                      <option value="Broadcasting (छिटकवां विधि)">Broadcasting (छिटकवां)</option>
                      <option value="Broad Bed Furrow (मेड़-नाली विधि)">Broad Bed Furrow (BBF)</option>
                      <option value="Zero Till (जीरो टिलेज)">Zero Till (बिना जुताई)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="select-wiz-prev-crop" className="text-xs font-bold text-slate-700">
                      Previous Crop (पिछली फसल)
                    </label>
                    <select
                      id="select-wiz-prev-crop"
                      name="prevCrop"
                      value={wizPreviousCrop}
                      onChange={(e) => setWizPreviousCrop(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d] cursor-pointer"
                    >
                      <option value="Wheat (गेहूं)">Wheat (गेहूं)</option>
                      <option value="Chickpea / Gram (चना)">Gram / Chickpea (चना)</option>
                      <option value="Mustard (सरसों)">Mustard (सरसों)</option>
                      <option value="Soybean (सोयाबीन)">Soybean (सोयाबीन)</option>
                      <option value="Fallow Land (परती / खाली)">Fallow Land (परती)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="select-wiz-water-source" className="text-xs font-bold text-slate-700">
                      Water Source (जल स्रोत)
                    </label>
                    <select
                      id="select-wiz-water-source"
                      name="waterSource"
                      value={wizWaterSource}
                      onChange={(e) => setWizWaterSource(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d] cursor-pointer"
                    >
                      <option value="Tube Well / Borewell (नलकूप / बोरवेल)">Tube Well (बोरवेल)</option>
                      <option value="Canal Network (नहर)">Canal Network (नहर)</option>
                      <option value="Farm Pond / Well (खेत तालाब / कुआं)">Pond / Well (तालाब/कुआं)</option>
                      <option value="Rainfed Only (केवल वर्षा आधारित)">Rainfed (वर्षा)</option>
                    </select>
                  </div>
                </div>

                {/* Growth Stage Override */}
                <div className="space-y-1.5">
                  <label htmlFor="select-wiz-growth-stage" className="text-xs font-bold text-slate-700">
                    Growth Stage (वर्तमान विकास अवस्था)
                  </label>
                  <select
                    id="select-wiz-growth-stage"
                    name="growthStage"
                    value={wizGrowthStage}
                    onChange={(e) => setWizGrowthStage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#0d253d] cursor-pointer"
                  >
                    <option value="Germination & Seedling">Germination & Seedling (अंकुरण)</option>
                    <option value="Vegetative Canopy Growth">Vegetative Canopy Growth (वानस्पतिक बढ़वार)</option>
                    <option value="Flowering & Pod Formation">Flowering & Pod Formation (फूल व दाने बनना)</option>
                    <option value="Maturity & Pre-Harvest">Maturity & Pre-Harvest (परिपक्वता)</option>
                  </select>
                </div>

                {/* DPDP Act Privacy Notice */}
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    <strong>DPDP Act 2023 Compliant:</strong> {isHindi ? "खेत का डेटा केवल मौसम व वैज्ञानिक सलाह के लिए उपयोग होता है।" : "Your field coordinates and agronomics are encrypted and never monetized."}
                  </p>
                </div>

                {/* Footer Buttons for Step 2 */}
                <div className="flex justify-between gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    id="btn-submit-field-registration"
                    onClick={handleCompleteFieldRegistration}
                    disabled={wizSaving}
                    className="px-6 py-2.5 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {wizSaving ? (
                      <span className="animate-pulse">{isHindi ? "सुरक्षित हो रहा है..." : "Saving Field..."}</span>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                          {editingFieldId
                            ? (isHindi ? "परिवर्तन सुरक्षित करें" : "Update Field Plot")
                            : (isHindi ? "खेत जोड़ें व सक्रिय करें" : "Save & Activate Field Plot")}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── 4. Modal: Edit Farmer Profile Information ──────────────────────── */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex justify-between items-center border-b border-[#e8ede4] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#e8f5e9] text-[#1b4332]">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#1b4332] font-display">
                    {isHindi ? "किसान प्रोफ़ाइल विवरण संपादित करें" : "Edit Farmer Profile & Information"}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {isHindi ? "आपका नाम, फ़ोन, गाँव एवं भूमि स्वामित्व विवरण" : "Personal, contact, and agricultural credentials"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                aria-label="Close profile modal"
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="input-prof-full-name" className="font-bold text-slate-700 block">
                    {isHindi ? "किसान का पूरा नाम *" : "Farmer Full Name *"}
                  </label>
                  <input
                    type="text"
                    id="input-prof-full-name"
                    name="fullName"
                    required
                    value={profFullName}
                    onChange={(e) => setProfFullName(e.target.value)}
                    className="w-full p-2.5 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl font-bold text-xs text-[#0d253d]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="input-prof-mobile" className="font-bold text-slate-700 block">
                    {isHindi ? "मोबाइल नंबर *" : "Mobile Number *"}
                  </label>
                  <input
                    type="tel"
                    id="input-prof-mobile"
                    name="mobile"
                    required
                    value={profMobile}
                    onChange={(e) => setProfMobile(e.target.value)}
                    className="w-full p-2.5 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl font-mono font-bold text-xs text-[#0d253d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="input-prof-village" className="font-bold text-slate-700 block">
                    {isHindi ? "गाँव (Village)" : "Village"}
                  </label>
                  <input
                    type="text"
                    id="input-prof-village"
                    name="village"
                    value={profVillage}
                    onChange={(e) => setProfVillage(e.target.value)}
                    className="w-full p-2.5 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl font-bold text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="input-prof-tehsil" className="font-bold text-slate-700 block">
                    {isHindi ? "तहसील (Tehsil)" : "Tehsil"}
                  </label>
                  <input
                    type="text"
                    id="input-prof-tehsil"
                    name="tehsil"
                    value={profTehsil}
                    onChange={(e) => setProfTehsil(e.target.value)}
                    className="w-full p-2.5 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="input-prof-district" className="font-bold text-slate-700 block">
                    {isHindi ? "जिला (District)" : "District"}
                  </label>
                  <input
                    type="text"
                    id="input-prof-district"
                    name="district"
                    required
                    value={profDistrict}
                    onChange={(e) => setProfDistrict(e.target.value)}
                    className="w-full p-2.5 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl font-bold text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="input-prof-state" className="font-bold text-slate-700 block">
                    {isHindi ? "राज्य (State)" : "State"}
                  </label>
                  <input
                    type="text"
                    id="input-prof-state"
                    name="state"
                    required
                    value={profState}
                    onChange={(e) => setProfState(e.target.value)}
                    className="w-full p-2.5 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="select-prof-ownership" className="font-bold text-slate-700 block">
                    {isHindi ? "भूमि स्वामित्व (Land Ownership)" : "Land Ownership"}
                  </label>
                  <select
                    id="select-prof-ownership"
                    name="ownership"
                    value={profOwnership}
                    onChange={(e) => setProfOwnership(e.target.value)}
                    className="w-full p-2.5 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl font-bold text-xs cursor-pointer"
                  >
                    <option value="Owner">Owner (स्वयं का खेत)</option>
                    <option value="Tenant">Tenant (किरायेदार)</option>
                    <option value="Leaseholder">Leaseholder (पट्टेदार)</option>
                    <option value="Sharecropper">Sharecropper (बटाईदार)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="select-prof-experience" className="font-bold text-slate-700 block">
                    {isHindi ? "खेती का अनुभव (Experience)" : "Farming Experience"}
                  </label>
                  <select
                    id="select-prof-experience"
                    name="experience"
                    value={profExp}
                    onChange={(e) => setProfExp(e.target.value)}
                    className="w-full p-2.5 bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl font-bold text-xs cursor-pointer"
                  >
                    <option value="1-5 Years">1-5 Years</option>
                    <option value="5-10 Years">5-10 Years</option>
                    <option value="10+ Years">10+ Years</option>
                    <option value="20+ Years">20+ Years</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#f6f9fc] rounded-xl border border-[#e8ede4]">
                <input
                  type="checkbox"
                  id="profSoilHealthCard"
                  name="soilHealthCard"
                  checked={profSoilCard}
                  onChange={(e) => setProfSoilCard(e.target.checked)}
                  className="h-4 w-4 text-[#1b4332] accent-[#1b4332] rounded cursor-pointer"
                />
                <label htmlFor="profSoilHealthCard" className="text-xs text-slate-700 font-bold cursor-pointer">
                  {isHindi ? "मृदा स्वास्थ्य कार्ड (Soil Health Card) उपलब्ध है" : "Soil Health Card is Available"}
                </label>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {isHindi ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold shadow transition-all cursor-pointer"
                >
                  {profileSavedSuccess
                    ? (isHindi ? "✓ सुरक्षित हो गया!" : "✓ Saved Successfully!")
                    : (isHindi ? "प्रोफ़ाइल सुरक्षित करें" : "Save Profile Details")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 5. In-App Delete Confirmation Dialog (Non-blocking) ──────────── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4 font-sans text-center">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-[#0d253d]">
                {isHindi ? "क्या आप इस खेत को हटाना चाहते हैं?" : "Delete this Farm Plot?"}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {savedFields.length <= 1
                  ? (isHindi ? "आपके पास कम से कम एक खेत पंजीकृत होना चाहिए।" : "You must keep at least one registered plot in your portfolio.")
                  : (isHindi ? "यह खेत आपके फार्म पोर्टफोलियो से हमेशा के लिए हटा दिया जाएगा।" : "This plot will be permanently removed from your farm portfolio.")}
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {isHindi ? "रद्द करें" : "Cancel"}
              </button>
              {savedFields.length > 1 && (
                <button
                  type="button"
                  onClick={confirmDeleteField}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition-colors cursor-pointer"
                >
                  {isHindi ? "हटाएं" : "Delete"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </AppShell>
  );
}
