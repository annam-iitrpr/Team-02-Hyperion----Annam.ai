"use client";

/**
 * Nimbooz Centralized Single Source of Truth — Farm & Crop Context
 * Ensures ALL pages (Dashboard, Map, AI Studio, CropFit, ROI, Predictions, Simulator, Diary)
 * consume and reflect the EXACT same active farm, field, location, and crop state.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { calculatePolygonArea, calculatePolygonCentroid } from "@/lib/calculations/geospatial";
import { SoilTestValues } from "@/lib/calculations/fertilizerCalc";
import { useWeather } from "./WeatherContext";
import { getStoredProfile, saveProfile } from "@/lib/userStore";

export interface FieldRecord {
  id: string;
  farmId: string;
  name: string;
  crop: string;
  cropVariety: string;
  areaAcres: number;
  areaHa: number;
  areaM2: number;
  center: [number, number];
  polygon: Array<[number, number]>;
  sowingDate: string;
  growthStage: string;
  soilType: string;
  irrigationType: string;
  color: string;
  healthScore?: number;
  isCustomCrop?: boolean;
}

export interface FarmRecord {
  id: string;
  name: string;
  district: string;
  state: string;
  village?: string;
  country?: string;
  center: [number, number];
  polygon: Array<[number, number]>;
  areaAcres: number;
  areaHa: number;
  areaM2: number;
  primaryCrop: string;
  cropVariety: string;
  sowingDate: string;
  growthStage: string;
  soilType: string;
  irrigationType: string;
  soilTest?: SoilTestValues | null;
  fields?: FieldRecord[];
  color?: string;
  healthScore?: number;
  isDemoFarm?: boolean;
}

export interface InterventionRecord {
  id: string;
  farmId: string;
  fieldId?: string;
  date: string;
  actionType: "spray" | "fertilizer" | "irrigation" | "scouting" | "harvest";
  productName: string;
  dosage: string;
  quantityPerAcre: number;
  totalCostRs: number;
  cropStage: string;
  reason: string;
  notes?: string;
  timestamp: string;
}

interface FarmContextType {
  farms: FarmRecord[];
  activeFarm: FarmRecord;
  activeField: FieldRecord;
  interventions: InterventionRecord[];
  isLoading: boolean;
  selectFarm: (farmId: string) => void;
  selectField: (fieldId: string) => void;
  createFarm: (farm: Partial<FarmRecord>) => FarmRecord;
  updateActiveFarm: (updates: Partial<FarmRecord>) => void;
  deleteFarm: (farmId: string) => void;
  updateFarmPolygon: (polygon: Array<[number, number]>) => void;
  saveSoilReport: (soilTest: SoilTestValues) => void;
  addIntervention: (entry: Omit<InterventionRecord, "id" | "timestamp">) => void;
  logIntervention: (entry: any) => void;
}

const STORAGE_KEY_FARMS = "nimbooz_farms_v5";
const STORAGE_KEY_ACTIVE_FARM_ID = "nimbooz_active_farm_id_v5";
const STORAGE_KEY_INTERVENTIONS = "nimbooz_interventions_v5";
const STORAGE_KEY_REAL_FIELDS = "aasra_farmer_real_fields_v4";
const STORAGE_KEY_ACTIVE_FIELD = "aasra_active_field_id_v4";

function mapFieldToFarm(field: any): FarmRecord {
  return {
    id: field.id,
    name: field.name || "Farm Plot",
    district: field.district || "Bhopal",
    state: field.state || "Madhya Pradesh",
    village: field.village || "Local Village",
    country: "India",
    center: field.center || [23.2599, 77.4126],
    polygon: field.polygon || [],
    areaAcres: field.areaAcres || 5.0,
    areaHa: field.areaHa || +( (field.areaAcres || 5.0) * 0.404686 ).toFixed(2),
    areaM2: Math.round((field.areaAcres || 5.0) * 4046.86),
    primaryCrop: field.crop || "Soybean",
    cropVariety: field.cropVariety || "JS-335",
    sowingDate: field.sowingDate || new Date().toISOString().split("T")[0],
    growthStage: field.growthStage || "Flowering & Pod Formation",
    soilType: field.soilType || "Black Cotton Soil",
    irrigationType: field.irrigationType || "Rainfed + Borewell",
    color: field.color || "#10B981",
    healthScore: field.healthScore || 92,
    soilTest: null,
  };
}

export function createDefaultFarm(profile?: any): FarmRecord {
  const p = profile || getStoredProfile();
  const lat = p.gpsLocation?.lat || 23.2599;
  const lon = p.gpsLocation?.lon || 77.4126;
  const offset = 0.0015;
  const poly: Array<[number, number]> = [
    [lat + offset, lon - offset],
    [lat + offset, lon + offset],
    [lat - offset, lon + offset],
    [lat - offset, lon - offset],
  ];
  const area = calculatePolygonArea(poly);

  return {
    id: "farm_primary_main",
    name: p.fieldName || `${p.fullName ? p.fullName + "'s " : "My "}Main Farm`,
    district: p.district || "Bhopal",
    state: p.state || "Madhya Pradesh",
    village: p.village || "Local Village",
    country: "India",
    center: [lat, lon],
    polygon: poly,
    areaAcres: p.fieldAreaAcres || area.acres || 5.0,
    areaHa: p.fieldAreaHa || area.hectares || 2.0,
    areaM2: area.squareMeters || 20234,
    primaryCrop: p.primaryCrop || "Soybean",
    cropVariety: p.cropVariety || "JS-335 (Certified)",
    sowingDate: p.sowingDate || "2026-06-15",
    growthStage: "R2 Flowering Stage",
    soilType: p.soilType || "Black Cotton Vertisol",
    irrigationType: p.irrigationType || "Rainfed + Borewell",
    color: "#10B981",
    healthScore: 92,
    soilTest: null,
  };
}

function createFieldFromFarm(farm: FarmRecord): FieldRecord {
  return {
    id: `field_${farm.id}_1`,
    farmId: farm.id,
    name: `${farm.name} - Plot 1`,
    crop: farm.primaryCrop,
    cropVariety: farm.cropVariety,
    areaAcres: farm.areaAcres,
    areaHa: farm.areaHa,
    areaM2: farm.areaM2,
    center: farm.center,
    polygon: farm.polygon,
    sowingDate: farm.sowingDate,
    growthStage: farm.growthStage,
    soilType: farm.soilType,
    irrigationType: farm.irrigationType,
    color: farm.color || "#10B981",
    healthScore: farm.healthScore || 90,
  };
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setCustomCoordinates } = useWeather();
  const [farms, setFarms] = useState<FarmRecord[]>([]);
  const [activeFarmId, setActiveFarmId] = useState<string>("");
  const [interventions, setInterventions] = useState<InterventionRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const syncFarmsFromStorage = useCallback(() => {
    try {
      const storedRealFields = localStorage.getItem(STORAGE_KEY_REAL_FIELDS);
      const storedFarms = localStorage.getItem(STORAGE_KEY_FARMS);
      const storedActiveFieldId = localStorage.getItem(STORAGE_KEY_ACTIVE_FIELD);
      const storedActiveFarmId = localStorage.getItem(STORAGE_KEY_ACTIVE_FARM_ID);

      const profile = getStoredProfile();
      let loadedFarms: FarmRecord[] = [];

      if (profile && profile.isRegistered && profile.fullName) {
        const userFarm = createDefaultFarm(profile);
        loadedFarms.push(userFarm);
      }

      if (storedRealFields) {
        try {
          const parsed = JSON.parse(storedRealFields);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const mapped = parsed.map(mapFieldToFarm);
            // Deduplicate with userFarm
            mapped.forEach((f: FarmRecord) => {
              if (!loadedFarms.some((existing) => existing.id === f.id || existing.name === f.name)) {
                loadedFarms.push(f);
              }
            });
          }
        } catch (_) {}
      }

      if (loadedFarms.length === 0 && storedFarms) {
        try {
          const parsed = JSON.parse(storedFarms);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loadedFarms = parsed;
          }
        } catch (_) {}
      }

      if (loadedFarms.length === 0) {
        const initial = createDefaultFarm();
        loadedFarms = [initial];
      }

      let activeId = storedActiveFieldId || storedActiveFarmId || loadedFarms[0]?.id || "";
      if (!loadedFarms.some((f) => f.id === activeId)) {
        activeId = loadedFarms[0]?.id || "";
      }

      setFarms(loadedFarms);
      setActiveFarmId(activeId);
      localStorage.setItem(STORAGE_KEY_FARMS, JSON.stringify(loadedFarms));
      localStorage.setItem(STORAGE_KEY_ACTIVE_FARM_ID, activeId);

      // Also trigger Weather sync if active farm has coordinates
      const currentActive = loadedFarms.find((f) => f.id === activeId) || loadedFarms[0];
      if (currentActive && currentActive.center && setCustomCoordinates) {
        setCustomCoordinates(
          currentActive.center[0],
          currentActive.center[1],
          currentActive.name,
          currentActive.district,
          currentActive.state
        );
      }
    } catch (e) {
      console.error("[FarmContext] sync error:", e);
    }
  }, [setCustomCoordinates]);

  // Initialize from LocalStorage on mount & listen to updates
  useEffect(() => {
    syncFarmsFromStorage();

    try {
      const storedInterventions = localStorage.getItem(STORAGE_KEY_INTERVENTIONS);
      if (storedInterventions) {
        setInterventions(JSON.parse(storedInterventions));
      }
    } catch (_) {}
    setIsLoading(false);

    const handleUpdate = () => syncFarmsFromStorage();
    window.addEventListener("aasra_fields_updated", handleUpdate);
    window.addEventListener("aasra-profile-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("aasra_fields_updated", handleUpdate);
      window.removeEventListener("aasra-profile-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [syncFarmsFromStorage]);

  const activeFarm = farms.find((f) => f.id === activeFarmId) || farms[0] || createDefaultFarm();
  const activeField = activeFarm.fields?.[0] || createFieldFromFarm(activeFarm);

  // Sync GPS Coordinates with WeatherContext whenever active farm changes
  const selectFarm = useCallback(
    (farmId: string) => {
      const target = farms.find((f) => f.id === farmId);
      if (target) {
        setActiveFarmId(farmId);
        try {
          localStorage.setItem(STORAGE_KEY_ACTIVE_FARM_ID, farmId);
          localStorage.setItem(STORAGE_KEY_ACTIVE_FIELD, farmId);
        } catch (_) {}

        // Update WeatherContext GPS and telemetry immediately
        if (setCustomCoordinates && target.center) {
          setCustomCoordinates(target.center[0], target.center[1], target.name, target.district, target.state);
        }

        // Update profile store for legacy compatibility
        const p = getStoredProfile();
        saveProfile({
          ...p,
          fieldName: target.name,
          district: target.district,
          state: target.state,
          village: target.village || p.village,
          primaryCrop: target.primaryCrop,
          cropVariety: target.cropVariety,
          fieldAreaAcres: target.areaAcres,
          fieldAreaHa: target.areaHa,
          gpsLocation: { lat: target.center[0], lon: target.center[1] },
        });
      }
    },
    [farms, setCustomCoordinates]
  );

  const selectField = useCallback(
    (fieldId: string) => {
      console.log(`[FarmContext] Selected field ${fieldId}`);
    },
    []
  );

  const createFarm = useCallback(
    (data: Partial<FarmRecord>): FarmRecord => {
      const lat = data.center?.[0] || 23.2599;
      const lon = data.center?.[1] || 77.4126;
      const poly: Array<[number, number]> = (data.polygon && data.polygon.length >= 3)
        ? (data.polygon as Array<[number, number]>)
        : [
            [lat + 0.0015, lon - 0.0015],
            [lat + 0.0015, lon + 0.0015],
            [lat - 0.0015, lon + 0.0015],
            [lat - 0.0015, lon - 0.0015],
          ];
      const area = calculatePolygonArea(poly);

      const newFarm: FarmRecord = {
        id: `farm_${Date.now()}`,
        name: data.name || `Farm #${farms.length + 1}`,
        district: data.district || "Your District",
        state: data.state || "Your State",
        village: data.village || "Local Village",
        country: data.country || "India",
        center: [lat, lon],
        polygon: poly,
        areaAcres: area.acres || data.areaAcres || 5.0,
        areaHa: area.hectares || data.areaHa || 2.0,
        areaM2: area.squareMeters || 20234,
        primaryCrop: data.primaryCrop || "Soybean",
        cropVariety: data.cropVariety || "Standard Farm Variety",
        sowingDate: data.sowingDate || new Date().toISOString().split("T")[0],
        growthStage: data.growthStage || "Vegetative Stage",
        soilType: data.soilType || "Black Cotton Soil",
        irrigationType: data.irrigationType || "Rainfed + Borewell",
        color: data.color || "#10B981",
        healthScore: 92,
        soilTest: null,
      };

      const updated = [newFarm, ...farms];
      setFarms(updated);
      setActiveFarmId(newFarm.id);
      try {
        localStorage.setItem(STORAGE_KEY_FARMS, JSON.stringify(updated));
        localStorage.setItem(STORAGE_KEY_ACTIVE_FARM_ID, newFarm.id);
      } catch (_) {}

      if (setCustomCoordinates) {
        setCustomCoordinates(lat, lon, newFarm.name, newFarm.district, newFarm.state);
      }

      return newFarm;
    },
    [farms, setCustomCoordinates]
  );

  const updateActiveFarm = useCallback(
    (updates: Partial<FarmRecord>) => {
      setFarms((prev) => {
        const next = prev.map((f) => {
          if (f.id === activeFarmId) {
            return { ...f, ...updates };
          }
          return f;
        });
        try {
          localStorage.setItem(STORAGE_KEY_FARMS, JSON.stringify(next));
        } catch (_) {}
        return next;
      });
    },
    [activeFarmId]
  );

  const updateFarmPolygon = useCallback(
    (polygon: Array<[number, number]>) => {
      if (!polygon || polygon.length < 3) return;
      const area = calculatePolygonArea(polygon);
      const centroid = calculatePolygonCentroid(polygon);
      updateActiveFarm({
        polygon,
        center: centroid,
        areaAcres: area.acres,
        areaHa: area.hectares,
        areaM2: area.squareMeters,
      });

      if (setCustomCoordinates) {
        setCustomCoordinates(centroid[0], centroid[1]);
      }
    },
    [updateActiveFarm, setCustomCoordinates]
  );

  const deleteFarm = useCallback(
    (farmId: string) => {
      if (farms.length <= 1) {
        alert("You must retain at least one registered farm.");
        return;
      }
      const updated = farms.filter((f) => f.id !== farmId);
      setFarms(updated);
      const nextActive = updated[0]?.id || "";
      setActiveFarmId(nextActive);
      try {
        localStorage.setItem(STORAGE_KEY_FARMS, JSON.stringify(updated));
        localStorage.setItem(STORAGE_KEY_ACTIVE_FARM_ID, nextActive);
      } catch (_) {}
    },
    [farms]
  );

  const saveSoilReport = useCallback(
    (soilTest: SoilTestValues) => {
      updateActiveFarm({ soilTest });
    },
    [updateActiveFarm]
  );

  const addIntervention = useCallback(
    (entry: Omit<InterventionRecord, "id" | "timestamp">) => {
      const record: InterventionRecord = {
        ...entry,
        id: `interv_${Date.now()}`,
        farmId: activeFarmId,
        timestamp: new Date().toISOString(),
      };
      setInterventions((prev) => {
        const next = [record, ...prev];
        try {
          localStorage.setItem(STORAGE_KEY_INTERVENTIONS, JSON.stringify(next));
        } catch (_) {}
        return next;
      });
    },
    [activeFarmId]
  );

  const logIntervention = useCallback(
    (entry: any) => {
      addIntervention({
        farmId: entry.farmId || activeFarmId,
        date: entry.date || new Date().toISOString().split("T")[0],
        actionType: entry.type || "spray",
        productName: entry.product || "Syngenta Quantis",
        dosage: entry.dosePerAcre || "250 ml/acre",
        quantityPerAcre: entry.quantityPerAcre || 0.25,
        totalCostRs: entry.costINR || 600,
        cropStage: entry.stage || "Flowering Stage",
        reason: entry.targetPestOrStress || entry.reason || "Heat stress mitigation",
        notes: entry.notes || "",
      });
    },
    [addIntervention, activeFarmId]
  );

  return (
    <FarmContext.Provider
      value={{
        farms,
        activeFarm,
        activeField,
        interventions,
        isLoading,
        selectFarm,
        selectField,
        createFarm,
        updateActiveFarm,
        deleteFarm,
        updateFarmPolygon,
        saveSoilReport,
        addIntervention,
        logIntervention,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const ctx = useContext(FarmContext);
  if (!ctx) {
    throw new Error("useFarm must be used within a FarmProvider");
  }
  return ctx;
};
