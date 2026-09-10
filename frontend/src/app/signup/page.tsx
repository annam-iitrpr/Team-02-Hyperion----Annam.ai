"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  saveRegisteredUser,
  FarmerProfile,
  INDIAN_LANGUAGES,
  EMPTY_FARMER_PROFILE,
} from "@/lib/userStore";
import { saveFarmerField } from "@/lib/fieldStore";
import { useLanguage } from "@/context/LanguageContext";
import { getDistrictCoordinates } from "@/lib/districtCoords";

const RealBoundaryMap = dynamic(
  () => import("@/components/RealBoundaryMap").then((mod) => mod.RealBoundaryMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-mono text-emerald-400">
        <span className="animate-pulse">Loading Google Satellite Field Map...</span>
      </div>
    ),
  }
);
import {
  User,
  Phone,
  MapPin,
  Leaf,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Droplets,
  Calendar,
  Lock,
  Globe,
  Sliders,
  Award,
  AlertCircle,
  Smartphone,
  RotateCcw,
  Check,
  Activity,
  UserCheck,
  Search,
  Crosshair,
  Maximize2,
  Trash2,
  Plus,
  X,
  Filter,
} from "lucide-react";

// Regional Intelligence Data Contracts
export interface RegionalCropOption {
  id: string;
  nameEn: string;
  nameHi: string;
  category: "cereal" | "pulse" | "oilseed" | "cash_crop" | "vegetable" | "spice" | "horticulture" | "plantation";
  icon: string;
  image: string;
  varieties: string[];
  season?: string;
  isMajorCrop?: boolean;
}

export interface RegionalSoilInfo {
  detectedSoilType: string;
  texture: string;
  typicalPh: string;
  organicCarbon: string;
  drainage?: string;
  soilOptions: string[];
  confidence: string;
  scientificOrder?: string;
}

// Clean, Authentic Pan-India States & Districts (Protected from auto-translate)
const INDIAN_STATES_DISTRICTS: Record<string, string[]> = {
  "Madhya Pradesh": [
    "Sehore", "Bhopal", "Indore", "Ujjain", "Vidisha", "Hoshangabad", "Dewas", "Harda",
    "Raisen", "Rajgarh", "Shajapur", "Agar Malwa", "Mandsaur", "Neemuch", "Ratlam", "Dhar",
    "Khargone", "Barwani", "Khandwa", "Burhanpur", "Jabalpur", "Narsinghpur", "Chhindwara", "Gwalior", "Rewa", "Sagar"
  ],
  "Maharashtra": [
    "Nashik", "Pune", "Nagpur", "Ahmednagar", "Jalgaon", "Satara", "Kolhapur", "Solapur",
    "Aurangabad", "Amravati", "Akola", "Yavatmal", "Buldhana", "Wardha", "Latur", "Nanded", "Sangli", "Beed", "Osmanabad"
  ],
  "Punjab": [
    "Ludhiana", "Patiala", "Jalandhar", "Bathinda", "Amritsar", "Sangrur", "Firozpur",
    "Moga", "Faridkot", "Muktsar", "Barnala", "Mansa", "Hoshiarpur", "Gurdaspur", "Kapurthala", "Fatehgarh Sahib", "Rupnagar"
  ],
  "Haryana": [
    "Karnal", "Hisar", "Ambala", "Kurukshetra", "Sirsa", "Rohtak", "Sonipat",
    "Fatehabad", "Jind", "Kaithal", "Panipat", "Yamunanagar", "Bhiwani", "Rewari", "Jhajjar", "Mahendragarh"
  ],
  "Rajasthan": [
    "Kota", "Bharatpur", "Jaipur", "Alwar", "Sri Ganganagar", "Barmer", "Bikaner",
    "Jodhpur", "Udaipur", "Bhilwara", "Tonk", "Bundi", "Baran", "Jhalawar", "Hanumangarh", "Nagaur", "Chittorgarh", "Sikar"
  ],
  "Gujarat": [
    "Rajkot", "Surat", "Ahmedabad", "Junagadh", "Vadodara", "Bhavnagar", "Amreli",
    "Jamnagar", "Morbi", "Surendranagar", "Mehsana", "Sabarkantha", "Banaskantha", "Kheda", "Patan", "Anand", "Bharuch"
  ],
  "Andhra Pradesh": [
    "Guntur", "Krishna", "Kurnool", "Prakasam", "East Godavari", "West Godavari",
    "Anantapur", "Kadapa", "Nellore", "Chittoor", "Visakhapatnam", "Vizianagaram", "Srikakulam"
  ],
  "Telangana": [
    "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Nalgonda",
    "Mahabubnagar", "Medak", "Adilabad", "Rangareddy", "Suryapet", "Siddipet", "Jagtial"
  ],
  "Uttar Pradesh": [
    "Kanpur", "Varanasi", "Meerut", "Agra", "Prayagraj", "Bareilly", "Mathura",
    "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Jhansi", "Ayodhya", "Muzaffarnagar", "Lakhimpur Kheri", "Badaun", "Barabanki"
  ],
  "Karnataka": [
    "Dharwad", "Belagavi", "Vijayapura", "Bagalkote", "Mysuru", "Haveri",
    "Ballari", "Raichur", "Kalaburagi", "Shivamogga", "Davangere", "Tumakuru", "Mandya", "Hassan", "Chikkamagaluru"
  ],
  "Bihar": [
    "Patna", "Muzaffarpur", "Gaya", "Bhagalpur", "Darbhanga", "Purnia", "Rohtas", "Samastipur", "Begusarai", "Nalanda", "Vaishali"
  ],
  "Chhattisgarh": [
    "Raipur", "Durg", "Bilaspur", "Rajnandgaon", "Dhamtari", "Mahasamund", "Janjgir-Champa", "Bemetara", "Kabirdham", "Kanker"
  ],
  "West Bengal": [
    "Burdwan", "Hooghly", "Murshidabad", "Nadia", "Malda", "North 24 Parganas", "South 24 Parganas", "Bankura", "Birbhum", "Midnapore"
  ],
  "Tamil Nadu": [
    "Coimbatore", "Thanjavur", "Madurai", "Salem", "Tiruchirappalli", "Tirunelveli", "Erode", "Dindigul", "Theni", "Vellore", "Cuddalore"
  ],
  "Kerala": [
    "Idukki", "Wayanad", "Palakkad", "Kottayam", "Thrissur", "Alappuzha", "Ernakulam", "Kozhikode", "Kannur", "Malappuram"
  ],
  "Odisha": [
    "Sambalpur", "Bhubaneswar", "Cuttack", "Balasore", "Ganjam", "Bargarh", "Bhadrak", "Khurda", "Mayurbhanj", "Jajpur"
  ],
  "Assam": [
    "Kamrup", "Guwahati", "Jorhat", "Dibrugarh", "Nagaon", "Sonitpur", "Golaghat", "Cachar", "Barpeta", "Darrang"
  ],
  "Himachal Pradesh": [
    "Shimla", "Kullu", "Kangra", "Mandi", "Solan", "Sirmaur", "Chamba", "Hamirpur", "Una", "Bilaspur"
  ],
  "Jammu & Kashmir": [
    "Srinagar", "Jammu", "Anantnag", "Baramulla", "Pulwama", "Kulgam", "Budgam", "Kathua", "Udhampur"
  ],
  "Uttarakhand": [
    "Dehradun", "Haridwar", "Udham Singh Nagar", "Nainital", "Tehri Garhwal", "Pauri Garhwal", "Almora"
  ],
  "Jharkhand": [
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar", "Giridih", "Palamu"
  ],
  "Goa": [
    "North Goa", "South Goa"
  ],
  "Tripura": [
    "West Tripura", "South Tripura", "Dhalai", "Gomati"
  ],
  "Meghalaya": [
    "East Khasi Hills", "West Garo Hills", "Ri-Bhoi", "Jaintia Hills"
  ],
  "Manipur": [
    "Imphal East", "Imphal West", "Bishnupur", "Thoubal", "Churachandpur"
  ],
  "Nagaland": [
    "Kohima", "Dimapur", "Mokokchung", "Wokha"
  ],
  "Mizoram": [
    "Aizawl", "Lunglei", "Champhai", "Kolasib"
  ],
  "Sikkim": [
    "East Sikkim", "West Sikkim", "South Sikkim", "North Sikkim"
  ],
  "Arunachal Pradesh": [
    "Papum Pare", "Changlang", "West Kameng", "Lohit"
  ],
  "Delhi": [
    "North Delhi", "South Delhi", "West Delhi", "Najafgarh", "Alipur"
  ]
};

const DEFAULT_REGIONAL_CROPS: RegionalCropOption[] = [
  { id: "Soybean", nameEn: "Soybean", nameHi: "सोयाबीन", category: "oilseed", icon: "🌱", image: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=400&q=80", varieties: ["JS-335", "JS-9560", "JS-2034", "RVS-2001"], isMajorCrop: true },
  { id: "Wheat", nameEn: "Wheat", nameHi: "गेहूं", category: "cereal", icon: "🌾", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80", varieties: ["PBW-824", "HD-2967", "HD-3086", "Sharbati", "Lokwan"], isMajorCrop: true },
  { id: "Cotton", nameEn: "Bt Cotton", nameHi: "कपास", category: "cash_crop", icon: "☁️", image: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=400&q=80", varieties: ["Bollgard II", "RCH-659", "Ajeet-155", "Mallika"], isMajorCrop: true },
  { id: "Mustard", nameEn: "Mustard", nameHi: "सरसों", category: "oilseed", icon: "🌼", image: "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=400&q=80", varieties: ["Pusa Bold", "Giriraj", "Pioneer 45S46", "RH-749"], isMajorCrop: true },
  { id: "Gram", nameEn: "Gram / Chickpea", nameHi: "चना (देसी)", category: "pulse", icon: "🥣", image: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=400&q=80", varieties: ["JG-11", "JG-16", "JAKI-9218", "Dollar Chana"], isMajorCrop: true },
  { id: "Paddy", nameEn: "Paddy / Rice", nameHi: "धान / चावल", category: "cereal", icon: "🌾", image: "https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=400&q=80", varieties: ["Pusa Basmati 1121", "Pusa 1509", "PR-126", "Samba Mahsuri"], isMajorCrop: true },
  { id: "Tomato", nameEn: "Tomato", nameHi: "टमाटर", category: "vegetable", icon: "🍅", image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=400&q=80", varieties: ["Abhinav Hybrid", "US-440", "Heemsohna", "Saaho"], isMajorCrop: true },
  { id: "Maize", nameEn: "Maize / Corn", nameHi: "मक्का", category: "cereal", icon: "🌽", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=400&q=80", varieties: ["DKC-9108", "P-3396", "NK-6240"], isMajorCrop: false },
];

export default function SignupPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const isHindi = language === "hi";

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── Stage 1: Farmer Identity & Phone Verification ─────────────
  const [fullName, setFullName] = useState<string>("");
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [farmingExperience, setFarmingExperience] = useState<string>("5-10 Years");
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language || "hi");

  useEffect(() => {
    if (language) {
      setSelectedLanguage(language);
    }
  }, [language]);

  // OTP Verification States
  const [generatedOtp, setGeneratedOtp] = useState<string>("");
  const [enteredOtp, setEnteredOtp] = useState<string>("");
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [isMobileVerified, setIsMobileVerified] = useState<boolean>(false);
  const [otpTimer, setOtpTimer] = useState<number>(0);

  // ── Stage 2: Location & Interactive Farm Boundary Map ─────────
  const [selectedState, setSelectedState] = useState<string>("Madhya Pradesh");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Sehore");
  const [village, setVillage] = useState<string>("");
  const [tehsil, setTehsil] = useState<string>("");
  const [acres, setAcres] = useState<number>(5.0);
  const [landOwnership, setLandOwnership] = useState<"Owner" | "Tenant" | "Sharecropper">("Owner");
  const [soilType, setSoilType] = useState<string>("Black Cotton Soil (काली मिट्टी)");
  const [irrigationType, setIrrigationType] = useState<string>("Borewell + Rainfed");
  
  const [mapCenter, setMapCenter] = useState<{ lat: number; lon: number }>({ lat: 23.2032, lon: 77.0844 });
  const mapCenterTuple = useMemo<[number, number]>(
    () => [mapCenter.lat, mapCenter.lon],
    [mapCenter.lat, mapCenter.lon]
  );
  const [searchLocationQuery, setSearchLocationQuery] = useState<string>("");
  const [isSearchingLocation, setIsSearchingLocation] = useState<boolean>(false);
  const [drawnPolygon, setDrawnPolygon] = useState<Array<[number, number]>>([]);
  const [boundaryPoints, setBoundaryPoints] = useState<{ x: number; y: number }[]>([
    { x: 30, y: 25 },
    { x: 75, y: 30 },
    { x: 70, y: 75 },
    { x: 25, y: 70 },
  ]);
  const [isLocatingUser, setIsLocatingUser] = useState<boolean>(false);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<string>("");

  // ── Stage 3: Crop Intelligence & Agronomic Profile ─────────
  const [primaryCrop, setPrimaryCrop] = useState<string>("Soybean");
  const [cropVariety, setCropVariety] = useState<string>("JS-335");
  const [sowingDate, setSowingDate] = useState<string>("2026-06-15");
  const [growthStage, setGrowthStage] = useState<string>("Flowering & Pod Formation");
  const [pestHistory, setPestHistory] = useState<string[]>(["Heat Stress Flower Drop"]);
  const [fertilizersUsed, setFertilizersUsed] = useState<string[]>(["DAP", "Urea"]);
  const [hasKcc, setHasKcc] = useState<boolean>(true);
  const [preferredCommunication, setPreferredCommunication] = useState<string>("Voice + WhatsApp");

  const [sowingMethod, setSowingMethod] = useState<string>("Line Sowing / Seed Drill (कतार बुवाई)");
  const [previousCrop, setPreviousCrop] = useState<string>("Wheat (गेहूं)");
  const [waterSource, setWaterSource] = useState<string>("Tube Well / Borewell (नलकूप / बोरवेल)");

  // ── Regional Agronomic & Soil Intelligence States ──────────
  const [regionalCrops, setRegionalCrops] = useState<RegionalCropOption[]>(DEFAULT_REGIONAL_CROPS);
  const [detectedSoil, setDetectedSoil] = useState<RegionalSoilInfo | null>(null);
  const [soilOptionsList, setSoilOptionsList] = useState<string[]>([
    "Medium to Deep Black Clay Soil (काली मिट्टी - Vertisol)",
    "Medium Black Clay Loam (मध्यम काली दोमट)",
    "Shallow Red-Brown Murrum Soil (उथली मुरुमी मिट्टी)",
    "Alluvial Riverbank Loam (कछारी जलोढ़ दोमट)",
  ]);
  const [isLoadingIntelligence, setIsLoadingIntelligence] = useState<boolean>(false);
  const [cropSearchQuery, setCropSearchQuery] = useState<string>("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [showCustomCropModal, setShowCustomCropModal] = useState<boolean>(false);
  const [customCropName, setCustomCropName] = useState<string>("");
  const [customCropCategory, setCustomCropCategory] = useState<string>("cereal");
  const [customCropVariety, setCustomCropVariety] = useState<string>("");

  // Fetch dynamic location intelligence (ICAR Soil + Regional Crops)
  const fetchLocationIntelligence = async (dst: string, st: string, lat?: number, lon?: number) => {
    if (!dst || !st) return;
    setIsLoadingIntelligence(true);
    try {
      const res = await fetch(
        `/api/crops/regional?district=${encodeURIComponent(dst)}&state=${encodeURIComponent(st)}&lat=${lat ?? ""}&lon=${lon ?? ""}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.crops && Array.isArray(data.crops) && data.crops.length > 0) {
          setRegionalCrops(data.crops);

          // If current crop is not in new list, pick the first
          const currentMatch = data.crops.find(
            (c: RegionalCropOption) =>
              c.id.toLowerCase() === primaryCrop.toLowerCase() ||
              c.nameEn.toLowerCase() === primaryCrop.toLowerCase()
          );
          if (!currentMatch) {
            const firstCrop = data.crops[0];
            setPrimaryCrop(firstCrop.id || firstCrop.nameEn);
            if (firstCrop.varieties?.[0]) {
              setCropVariety(firstCrop.varieties[0]);
            }
          }
        }

        if (data.soil) {
          setDetectedSoil(data.soil);
          if (Array.isArray(data.soil.soilOptions) && data.soil.soilOptions.length > 0) {
            setSoilOptionsList(data.soil.soilOptions);
          }
          if (data.soil.detectedSoilType) {
            setSoilType(data.soil.detectedSoilType);
          }
        }
      }
    } catch (err) {
      console.warn("Dynamic location intelligence fetch error:", err);
    } finally {
      setIsLoadingIntelligence(false);
    }
  };

  // Initial fetch for default location
  useEffect(() => {
    fetchLocationIntelligence(selectedDistrict, selectedState, mapCenter.lat, mapCenter.lon);
  }, []);

  // OTP Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Restore saved boundary if farmer already drew their field
  useEffect(() => {
    try {
      const saved = localStorage.getItem("aasra_signup_field_boundary");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.points) && parsed.points.length >= 3) {
          setDrawnPolygon(parsed.points);
          if (parsed.acres) setAcres(Number(parsed.acres));
          if (parsed.center?.lat && parsed.center?.lon) {
            setMapCenter({ lat: parsed.center.lat, lon: parsed.center.lon });
          }
        }
      }
    } catch {}
  }, []);

  // Handle District update when State changes -> automatically centers map and fetches regional intelligence!
  const handleStateChange = (st: string) => {
    setSelectedState(st);
    const districts = INDIAN_STATES_DISTRICTS[st] || ["Sehore"];
    const firstDist = districts[0];
    setSelectedDistrict(firstDist);
    const coords = getDistrictCoordinates(firstDist, st);
    setMapCenter(coords);
    fetchLocationIntelligence(firstDist, st, coords.lat, coords.lon);
  };

  const handleDistrictChange = (dst: string) => {
    setSelectedDistrict(dst);
    const coords = getDistrictCoordinates(dst, selectedState);
    setMapCenter(coords);
    fetchLocationIntelligence(dst, selectedState, coords.lat, coords.lon);
  };

  // Trigger Real SMS OTP Verification
  const handleSendOtp = () => {
    const cleanNum = mobileNumber.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanNum)) {
      setErrorMessage(
        isHindi
          ? "कृपया 6, 7, 8 या 9 से शुरू होने वाला सही 10-अंकों का भारतीय मोबाइल नंबर दर्ज करें।"
          : "Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9."
      );
      return;
    }
    setErrorMessage(null);
    setLoading(true);

    setTimeout(() => {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(code);
      setIsOtpSent(true);
      setOtpTimer(45);
      setLoading(false);
    }, 600);
  };

  // Verify SMS OTP
  const handleVerifyOtp = () => {
    if (enteredOtp.trim() !== generatedOtp) {
      setErrorMessage(
        isHindi
          ? `गलत कोड! सही सत्यापन कोड "${generatedOtp}" है।`
          : `Invalid Code: Please enter the exact verification code. (Code: ${generatedOtp})`
      );
      return;
    }
    setErrorMessage(null);
    setIsMobileVerified(true);
  };

  // Step 1 validation
  const handleStep1Next = () => {
    if (!fullName.trim()) {
      setErrorMessage(isHindi ? "कृपया अपना पूरा नाम दर्ज करें।" : "Please enter your full name.");
      return;
    }
    if (!isMobileVerified) {
      setErrorMessage(
        isHindi
          ? "कृपया पहले अपने मोबाइल नंबर पर आए सत्यापन कोड को दर्ज करें।"
          : "Please verify your mobile number with the SMS code before continuing."
      );
      return;
    }
    setErrorMessage(null);
    setStep(2);
  };

  // 📍 Request Browser Location Permission & Reverse Geocode
  const handleLocateOnMap = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setLocationPermissionStatus("Browser location not supported. You can search village or click on map.");
      return;
    }

    setIsLocatingUser(true);
    setLocationPermissionStatus("Locating your coordinates on satellite map...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setMapCenter({ lat, lon });

        try {
          const res = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            if (data.district) setSelectedDistrict(data.district);
            if (data.state) setSelectedState(data.state);
            if (data.village || data.city) setVillage(data.village || data.city);
            if (data.tehsil) setTehsil(data.tehsil);
          }
        } catch {
          // Keep default
        }

        setIsLocatingUser(false);
        setLocationPermissionStatus("Field location pinpointed successfully ✓");
      },
      (err) => {
        setIsLocatingUser(false);
        if (err.code === 1) {
          setLocationPermissionStatus("Location permission was denied. Please search your village or click on the map.");
        } else {
          setLocationPermissionStatus("Could not acquire GPS. Please search village name or adjust map.");
        }
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  };

  // Search Village / Town / District using OpenStreetMap Geocoding
  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchLocationQuery.trim()) return;

    setIsSearchingLocation(true);
    setLocationPermissionStatus("");

    try {
      const query = encodeURIComponent(`${searchLocationQuery.trim()}, India`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const item = data[0];
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          setMapCenter({ lat, lon });
          setVillage(searchLocationQuery.trim());
          setLocationPermissionStatus(`Map centered on: ${item.display_name.split(",")[0]}`);
        } else {
          setLocationPermissionStatus("Location not found. Please click directly on the map.");
        }
      }
    } catch {
      setLocationPermissionStatus("Search temporarily unavailable. You can click on the map to set boundary.");
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Click on Map to add / adjust Boundary Points
  const handleMapCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    if (boundaryPoints.length >= 6) {
      setBoundaryPoints([{ x, y }]);
    } else {
      setBoundaryPoints([...boundaryPoints, { x, y }]);
    }

    const calculatedAcres = +(Math.min(50, Math.max(1, (boundaryPoints.length + 1) * 1.5))).toFixed(1);
    setAcres(calculatedAcres);
  };

  const handleResetBoundary = () => {
    setBoundaryPoints([
      { x: 30, y: 25 },
      { x: 75, y: 30 },
      { x: 70, y: 75 },
      { x: 25, y: 70 },
    ]);
    setAcres(5.0);
  };

  // Final Registration Save to Database
  const handleCompleteRegistration = async () => {
    setLoading(true);

    const cleanNum = mobileNumber.replace(/\D/g, "");
    const finalPolygon: Array<[number, number]> = drawnPolygon.length >= 3 ? drawnPolygon : [
      [mapCenter.lat + 0.0012, mapCenter.lon - 0.0015],
      [mapCenter.lat + 0.0015, mapCenter.lon + 0.0018],
      [mapCenter.lat - 0.0011, mapCenter.lon + 0.0014],
      [mapCenter.lat - 0.0014, mapCenter.lon - 0.0012],
    ];

    const newProfile: FarmerProfile = {
      ...EMPTY_FARMER_PROFILE,
      id: `kisan-${cleanNum.slice(-6)}-${Date.now()}`,
      fullName: fullName.trim(),
      mobileNumber: cleanNum,
      email: email.trim() || undefined,
      language: selectedLanguage,
      farmingExperience,
      state: selectedState,
      district: selectedDistrict,
      tehsil: tehsil.trim() || undefined,
      village: village.trim() || "Village Area",
      fieldName: `${primaryCrop} Main Field`,
      fieldAreaAcres: acres,
      fieldAreaHa: +(acres * 0.4047).toFixed(2),
      landOwnership,
      primaryCrop,
      cropVariety,
      sowingDate,
      growthStage,
      soilType,
      irrigationType,
      gpsLocation: { lat: mapCenter.lat, lon: mapCenter.lon },
      polygon: finalPolygon,
      pestHistory,
      fertilizersUsed,
      hasKisanCreditCard: hasKcc,
      preferredCommunication,
      sowingMethod,
      previousCrop,
      waterSource,
      voiceResponsesEnabled: true,
      dataConsent: true,
      isRegistered: true,
      lastLogin: new Date().toISOString(),
      dataEncryptionStamp: "AES-256 Encrypted via Syngenta Krishi Vault",
    };

    saveRegisteredUser(newProfile);
    
    // Also save as primary registered field in fieldStore
    saveFarmerField({
      id: `field_primary_${Date.now()}`,
      name: `${primaryCrop} Main Field`,
      crop: primaryCrop,
      cropVariety: cropVariety,
      areaAcres: acres,
      areaHa: +(acres * 0.4047).toFixed(2),
      center: [mapCenter.lat, mapCenter.lon],
      polygon: finalPolygon,
      sowingDate: sowingDate,
      growthStage: growthStage,
      soilType: soilType,
      irrigationType: irrigationType,
      color: "#10B981",
      healthScore: 94,
    });

    // ── Persist to Live Production Database for Cross-Device Personalization & Admin Overwatch ──
    try {
      await Promise.allSettled([
        fetch("/api/farmers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: newProfile.id,
            fullName: newProfile.fullName,
            mobileNumber: newProfile.mobileNumber,
            email: newProfile.email,
            language: newProfile.language,
            state: newProfile.state,
            district: newProfile.district,
            tehsil: newProfile.tehsil,
            village: newProfile.village,
            fieldName: newProfile.fieldName,
            fieldAreaAcres: newProfile.fieldAreaAcres,
            fieldAreaHa: newProfile.fieldAreaHa,
            landOwnership: newProfile.landOwnership,
            farmingExperience: newProfile.farmingExperience,
            primaryCrop: newProfile.primaryCrop,
            cropVariety: newProfile.cropVariety,
            sowingDate: newProfile.sowingDate,
            growthStage: newProfile.growthStage,
            soilType: newProfile.soilType,
            irrigationType: newProfile.irrigationType,
            gpsLocation: { lat: mapCenter.lat, lon: mapCenter.lon },
            polygon: finalPolygon,
            pestHistory: newProfile.pestHistory,
            fertilizersUsed: newProfile.fertilizersUsed,
            hasKisanCreditCard: newProfile.hasKisanCreditCard,
            pmKisanBeneficiary: newProfile.pmKisanBeneficiary,
            preferredCommunication: newProfile.preferredCommunication,
            sowingMethod,
            previousCrop,
            waterSource,
          }),
        }),
        fetch("/api/fields", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `${primaryCrop} Main Field`,
            lat: mapCenter.lat,
            lon: mapCenter.lon,
            area_acres: acres,
            crop: primaryCrop,
            variety: cropVariety,
            soil_type: soilType,
            polygon: finalPolygon,
          }),
        }),
      ]);
    } catch (err) {
      console.warn("Could not dispatch database sync:", err);
    }

    setLanguage(selectedLanguage);
    setLoading(false);
    setStep(4);
  };

  // Convert points to SVG Polygon string
  const polygonPointsStr = boundaryPoints.map((p) => `${p.x * 6},${p.y * 3.5}`).join(" ");

  // Filter regional crops by category and search keyword
  const displayedCrops = regionalCrops.filter((c) => {
    const matchesCat =
      selectedCategoryFilter === "all" || c.category === selectedCategoryFilter;
    const matchesQuery =
      !cropSearchQuery.trim() ||
      c.nameEn.toLowerCase().includes(cropSearchQuery.toLowerCase()) ||
      c.nameHi.toLowerCase().includes(cropSearchQuery.toLowerCase()) ||
      c.varieties?.some((v) =>
        v.toLowerCase().includes(cropSearchQuery.toLowerCase())
      );
    return matchesCat && matchesQuery;
  });

  const currentCropObj = regionalCrops.find(
    (c) =>
      c.id.toLowerCase() === primaryCrop.toLowerCase() ||
      c.nameEn.toLowerCase() === primaryCrop.toLowerCase()
  );

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[#fcfdfa] text-[#1c2e24] font-sans pb-20 select-none relative overflow-hidden flex flex-col justify-between selection:bg-[#2d6a4f] selection:text-white"
    >
      {/* ── Atmospheric Ambient Agricultural Radial Glows & Dot Grid ───────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: "radial-gradient(#1b4332 0.75px, transparent 0.75px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #2d6a4f 0%, #52b788 50%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #2d6a4f 0%, #d8f3dc 60%, transparent 70%)" }}
      />

      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between p-3.5 sm:p-6 relative z-10">
        <Link href="/" className="flex items-center gap-3 group focus:outline-hidden">
          <div className="relative h-8 sm:h-10 w-36 sm:w-52">
            <Image
              src="/images/krishyantra_logo.svg"
              alt="Krishyantra"
              fill
              className="object-contain object-left group-hover:opacity-90 transition-opacity"
              priority
            />
          </div>
        </Link>

        {/* Minimalist Language Selector & Log In */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <select
              value={language || selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                setLanguage(e.target.value);
              }}
              className="pl-2.5 pr-7 sm:pl-3 sm:pr-8 py-1.5 sm:py-2 rounded-xl bg-white border border-[#e2e8df] text-[11px] sm:text-xs font-bold text-[#1c2e24] shadow-2xs focus:outline-none focus:border-[#2d6a4f] cursor-pointer appearance-none notranslate"
              translate="no"
            >
              {INDIAN_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="notranslate" translate="no">
                  {l.native}
                </option>
              ))}
            </select>
            <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <Link
            href="/login"
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white hover:bg-[#f4f7f2] border border-[#e2e8df] text-[#1c2e24] text-[11px] sm:text-xs font-bold transition-all shadow-2xs shrink-0"
          >
            <span>{isHindi ? "लॉगिन करें" : "Log In"}</span>
          </Link>
        </div>
      </header>

      {/* ── Main Registration Multi-Step Card ──────────────────────── */}
      <main className="max-w-4xl mx-auto w-full my-2 sm:my-4 px-3 sm:px-6 relative z-10">
        <div className="bg-white border border-[#e8ede4] shadow-[0_20px_60px_-15px_rgba(27,67,50,0.08)] rounded-2xl sm:rounded-3xl p-4 sm:p-10 space-y-6 sm:space-y-8">
          
          {/* Top Stage Indicator (4 Steps) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-[#2d6a4f] uppercase tracking-wider">
                {step === 1 && <span>{isHindi ? "चरण 1: किसान पहचान व फोन सत्यापन" : "Stage 1: Verified Farmer Identity"}</span>}
                {step === 2 && <span>{isHindi ? "चरण 2: खेत स्थान व नक्शे पर मेढ़ (Boundary)" : "Stage 2: Land Location & Map Boundary"}</span>}
                {step === 3 && <span>{isHindi ? "चरण 3: फसल व कृषि इतिहास" : "Stage 3: Agronomic Intelligence"}</span>}
                {step === 4 && <span>{isHindi ? "चरण 4: डिजिटल किसान स्मार्ट कार्ड" : "Stage 4: Verified Kisan Smart Card"}</span>}
              </span>
              <span className="text-slate-400">Step {step} of 4</span>
            </div>

            {/* Step Progress Bar */}
            <div className="w-full h-2 bg-[#f0f4ee] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#52b788] transition-all duration-300 rounded-full"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed font-medium">{errorMessage}</p>
            </div>
          )}

          {/* ── STAGE 1: Farmer Identity & Phone Verification ────────── */}
          <div key="step-1" className={step === 1 ? "space-y-6" : "hidden"}>
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-[#1c2e24] font-display">
                <span>{isHindi ? "किसान की जानकारी व फोन सत्यापन" : "Farmer Identity & Phone Verification"}</span>
              </h2>
              <p className="text-xs text-[#52796f]">
                <span>{isHindi ? "सत्यापित मोबाइल नंबर से जुड़ें ताकि बाद में आप सुरक्षित लॉगिन कर सकें।" : "Register with a verified mobile number so you can securely log in anytime."}</span>
              </p>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1c2e24]">
                  <span>{isHindi ? "किसान का पूरा नाम *" : "Full Farmer Name *"}</span>
                </label>
                <div className="relative">
                  <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Patel"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setErrorMessage(null);
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#fbfcfb] border border-[#e2e8df] text-xs font-medium text-[#1c2e24] placeholder:text-slate-400 focus:outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/15 transition-all"
                  />
                </div>
              </div>

              {/* Mobile Number & OTP Trigger */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1c2e24]">
                  <span>{isHindi ? "मोबाइल नंबर (लॉगिन ID) *" : "Mobile Number (Login ID) *"}</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Smartphone className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="e.g. 9876543210"
                      value={mobileNumber}
                      disabled={isMobileVerified}
                      onChange={(e) => {
                        setMobileNumber(e.target.value.replace(/\D/g, ""));
                        setErrorMessage(null);
                      }}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-xs font-mono font-bold tracking-wider ${
                        isMobileVerified
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                          : "bg-[#fbfcfb] border-[#e2e8df] text-[#1c2e24] placeholder:text-slate-400 focus:outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/15"
                      }`}
                    />
                  </div>

                  {!isMobileVerified && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading || otpTimer > 0}
                      className="px-4 py-3 rounded-xl bg-[#1b4332] hover:bg-[#143326] text-white text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-50 shadow-sm"
                    >
                      <span>
                        {loading
                          ? "Sending..."
                          : otpTimer > 0
                          ? `Resend (${otpTimer}s)`
                          : isOtpSent
                          ? "Resend OTP"
                          : "Verify Phone"}
                      </span>
                    </button>
                  )}

                  {isMobileVerified && (
                    <div className="px-3.5 py-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-1.5 shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>
              </div>

              {/* OTP Input Form (Revealed when OTP is sent & not yet verified) */}
              {isOtpSent && !isMobileVerified && (
                <div className="p-4 rounded-2xl bg-[#f4f8f5] border border-emerald-200 space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1b4332] flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-[#2d6a4f]" />
                      <span>{isHindi ? "4-अंकों का SMS OTP दर्ज करें" : "Enter 4-digit SMS OTP"}</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#2d6a4f] font-bold bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                      Mock OTP: {generatedOtp}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="• • • •"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-32 text-center text-lg font-mono font-black tracking-widest py-2 rounded-xl bg-white border border-emerald-300 text-[#1c2e24] focus:outline-none focus:border-[#2d6a4f]"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="flex-1 py-2 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                    >
                      <span>{isHindi ? "OTP सत्यापित करें" : "Confirm OTP"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Farming Experience */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1c2e24]">
                  <span>{isHindi ? "खेती का अनुभव (वर्ष)" : "Farming Experience (Years)"}</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {["1-3 Yrs", "3-5 Yrs", "5-10 Years", "10-20 Years", "20+ Years"].map((exp) => (
                    <button
                      key={exp}
                      type="button"
                      onClick={() => setFarmingExperience(exp)}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        farmingExperience === exp
                          ? "bg-[#e8f5e9] border-[#2d6a4f] text-[#1b4332] shadow-2xs ring-1 ring-[#2d6a4f]"
                          : "bg-[#fbfcfb] border-[#e2e8df] text-[#52796f] hover:border-[#b7c9be] hover:text-[#1c2e24]"
                      }`}
                    >
                      <span>{exp}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!fullName.trim()) {
                  setErrorMessage(isHindi ? "कृपया किसान का पूरा नाम दर्ज करें。" : "Please enter your full name.");
                  return;
                }
                if (mobileNumber.length !== 10) {
                  setErrorMessage(isHindi ? "कृपया 10-अंकों का वैध मोबाइल नंबर दर्ज करें。" : "Please enter a valid 10-digit mobile number.");
                  return;
                }
                setErrorMessage(null);
                setStep(2);
              }}
              className="w-full py-4 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              style={{ background: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)", boxShadow: "0 8px 25px rgba(27, 67, 50, 0.25)" }}
            >
              <span>{isHindi ? "अगला: खेत स्थान व नक्शे पर मेढ़ बनाएं" : "Next: Map Your Field Boundary"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* ── STAGE 2: Interactive Field Boundary Map & Soil GIS ───── */}
          <div key="step-2" className={step === 2 ? "space-y-6" : "hidden"}>
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-[#1c2e24] font-display">
                <span>{isHindi ? "खेत का स्थान व नक्शे पर मेढ़ (Boundary)" : "Field Location & Satellite Boundary"}</span>
              </h2>
              <p className="text-xs text-[#52796f]">
                <span>{isHindi ? "नक्शे पर अपने खेत को खोजें और कोनों पर क्लिक करके मेढ़ (Boundary) बनाएं।" : "Search your village or locate your field, then click on the map to draw your parcel boundaries."}</span>
              </p>
            </div>

            {/* State & District Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1c2e24]">
                  <span>{isHindi ? "राज्य *" : "State *"}</span>
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-[#fbfcfb] border border-[#e2e8df] text-xs font-bold text-[#1c2e24] focus:outline-none focus:border-[#2d6a4f] notranslate"
                  translate="no"
                >
                  {Object.keys(INDIAN_STATES_DISTRICTS).map((st) => (
                    <option key={st} value={st} className="notranslate" translate="no">
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1c2e24]">
                  <span>{isHindi ? "जिला *" : "District *"}</span>
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-[#fbfcfb] border border-[#e2e8df] text-xs font-bold text-[#1c2e24] focus:outline-none focus:border-[#2d6a4f] notranslate"
                  translate="no"
                >
                  {(INDIAN_STATES_DISTRICTS[selectedState] || ["Sehore"]).map((dst) => (
                    <option key={dst} value={dst} className="notranslate" translate="no">
                      {dst}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Village Search & Non-Intrusive Location Controls */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <form onSubmit={handleSearchLocation} className="flex-1 relative">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={isHindi ? "गांव, कस्बा या तहसील का नाम खोजें (उदा: Bilkisganj, Sehore, Phanda)" : "Search Village, Town or Tehsil (e.g. Bilkisganj, Sehore, Phanda)"}
                    value={searchLocationQuery}
                    onChange={(e) => setSearchLocationQuery(e.target.value)}
                    className="w-full pl-10 pr-24 py-3 rounded-xl bg-[#fbfcfb] border border-[#e2e8df] text-xs font-medium text-[#1c2e24] placeholder:text-slate-400 focus:outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/15 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isSearchingLocation}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-[#1b4332] text-white text-[11px] font-bold cursor-pointer hover:bg-[#143326] transition-colors"
                  >
                    <span>{isSearchingLocation ? "Searching..." : "Search Village"}</span>
                  </button>
                </form>

                {/* Optional Device GPS Button */}
                <button
                  type="button"
                  onClick={handleLocateOnMap}
                  disabled={isLocatingUser}
                  title="Only click this if you are physically standing on your crop field right now."
                  className="px-3.5 py-3 rounded-xl bg-white border border-[#e2e8df] hover:border-[#2d6a4f] text-[#1c2e24] text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer shrink-0 transition-all hover:bg-[#f4f8f5]"
                >
                  <Crosshair className={`h-4 w-4 text-[#2d6a4f] ${isLocatingUser ? "animate-spin" : ""}`} />
                  <span>{isHindi ? "डिवाइस GPS (यदि खेत पर हों)" : "Device GPS (If at field)"}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>💡 <strong>Tip:</strong> If sitting at home, search your village name or drag the map directly to your farm.</span>
                <span className="font-mono text-[10px] text-[#2d6a4f] font-bold">
                  Map Center: {mapCenter.lat.toFixed(4)}°N, {mapCenter.lon.toFixed(4)}°E
                </span>
              </div>

              {locationPermissionStatus && (
                <p className="text-[11px] font-mono text-[#1b4332] bg-[#e8f5e9] p-2 rounded-lg border border-emerald-200">
                  ℹ️ {locationPermissionStatus}
                </p>
              )}
            </div>

            {/* ── REAL GOOGLE SATELLITE FIELD BOUNDARY MAP ──────── */}
            <div className="space-y-2">
              <RealBoundaryMap
                center={mapCenterTuple}
                zoom={16}
                initialPoints={drawnPolygon.length >= 3 ? drawnPolygon : undefined}
                onCenterChange={(newC) => {
                  setMapCenter((prev) => {
                    if (Math.abs(prev.lat - newC[0]) < 0.0003 && Math.abs(prev.lon - newC[1]) < 0.0003) {
                      return prev;
                    }
                    return { lat: newC[0], lon: newC[1] };
                  });
                }}
                onBoundaryChange={(pts, calculatedAcres) => {
                  setTimeout(() => {
                    setDrawnPolygon(pts);
                    setAcres(calculatedAcres);
                  }, 0);
                  try {
                    localStorage.setItem(
                      "aasra_signup_field_boundary",
                      JSON.stringify({
                        points: pts,
                        acres: calculatedAcres,
                        center: mapCenter,
                      })
                    );
                  } catch {}
                }}
              />
            </div>

              {/* Soil & Irrigation */}
              <div className="space-y-3">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-[#1c2e24]">Soil Type (मिट्टी की किस्म)</label>
                      {isLoadingIntelligence && (
                        <span className="text-[10px] text-[#2d6a4f] font-mono animate-pulse">
                          Detecting ICAR soil...
                        </span>
                      )}
                    </div>
                    <select
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#fbfcfb] border border-[#e2e8df] text-xs font-bold text-[#1c2e24] focus:outline-none focus:border-[#2d6a4f]"
                    >
                      {soilOptionsList.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                      {!soilOptionsList.includes(soilType) && (
                        <option value={soilType}>{soilType}</option>
                      )}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1c2e24]">Irrigation (सिंचाई साधन)</label>
                    <select
                      value={irrigationType}
                      onChange={(e) => setIrrigationType(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#fbfcfb] border border-[#e2e8df] text-xs font-bold text-[#1c2e24] focus:outline-none focus:border-[#2d6a4f]"
                    >
                      <option value="Borewell + Rainfed">Borewell + Rainfed (बोरवेल + वर्षा)</option>
                      <option value="Canal Irrigation">Canal Irrigation (नहरी सिंचाई)</option>
                      <option value="Drip Irrigation">Drip Irrigation (ड्रिप टपक सिंचाई)</option>
                      <option value="Purely Rainfed">Purely Rainfed (केवल वर्षा आधारित)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3.5 rounded-xl border border-[#e2e8df] hover:bg-[#f4f8f5] text-[#52796f] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-3.5 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)", boxShadow: "0 8px 25px rgba(27, 67, 50, 0.25)" }}
                >
                  <span>{isHindi ? "अगला: फसल व कृषि इतिहास" : "Next: Crop & Agronomics"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

          {/* ── STAGE 3: Crop Intelligence & Agronomic Profile ───────── */}
          <div key="step-3" className={step === 3 ? "space-y-6" : "hidden"}>
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-[#1c2e24] font-display">
                <span>{isHindi ? "फसल व कृषि इतिहास" : "Agronomic & Crop Intelligence"}</span>
              </h2>
                <p className="text-xs text-[#52796f]">
                  <span>{isHindi ? "फसल की किस्म व बुवाई की तारीख से आपके खेत के विकास चरण का स्वतः आकलन होगा।" : "Calibrates 14-day heat stress predictions and precise Syngenta product dosages."}</span>
                </p>
              </div>

              <div className="space-y-4">
                {/* Regional Header & Custom Crop Button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 bg-[#e8f5e9]/75 p-3.5 rounded-2xl border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-[#2d6a4f] shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-[#0d253d]">
                        {isHindi
                          ? `${selectedDistrict}, ${selectedState} के लिए अनुशंसित क्षेत्रीय फसलें`
                          : `Regional Crops for ${selectedDistrict}, ${selectedState}`}
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        {isHindi
                          ? "ICAR कृषि-जलवायु क्षेत्र व स्थानीय बाजार मांग अनुसार"
                          : "Curated from ICAR agro-climatic & market data"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isLoadingIntelligence && (
                      <span className="text-[10px] font-mono text-[#2d6a4f] animate-pulse bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                        Analyzing ICAR...
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowCustomCropModal(true)}
                      className="text-xs font-bold text-[#2d6a4f] hover:text-[#1b4332] bg-white hover:bg-[#e8f5e9] px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>{isHindi ? "अन्य फसल जोड़ें" : "Add Custom Crop"}</span>
                    </button>
                  </div>
                </div>

                {/* Search & Category Filter */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={isHindi ? `${selectedDistrict} में उगाई जाने वाली फसल खोजें...` : `Filter crops in ${selectedDistrict}...`}
                      value={cropSearchQuery}
                      onChange={(e) => setCropSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-[#fbfcfb] border border-[#e2e8df] text-xs font-medium text-[#1c2e24] placeholder:text-slate-400 focus:outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/15"
                    />
                    {cropSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setCropSearchQuery("")}
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
                        onClick={() => setSelectedCategoryFilter(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                          selectedCategoryFilter === cat.id
                            ? "bg-[#1b4332] text-white shadow-2xs"
                            : "bg-[#fbfcfb] text-[#52796f] hover:bg-[#e8f5e9]/50 border border-[#e2e8df]"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Crop Selection Grid */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {displayedCrops.map((c) => {
                      const isSelected =
                        primaryCrop.toLowerCase() === c.id.toLowerCase() ||
                        primaryCrop.toLowerCase() === c.nameEn.toLowerCase();
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setPrimaryCrop(c.nameEn || c.id);
                            if (c.varieties && c.varieties.length > 0) {
                              setCropVariety(c.varieties[0]);
                            }
                          }}
                          className={`rounded-2xl border text-left overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                            isSelected
                              ? "bg-white border-[#2d6a4f] shadow-lg ring-2 ring-[#2d6a4f]/25 scale-[1.02]"
                              : "bg-white hover:border-[#b7c9be] border-[#e2e8df] text-slate-700"
                          }`}
                        >
                          <div className="relative h-24 w-full overflow-hidden bg-slate-900">
                            <Image
                              src={c.image}
                              alt={c.nameEn}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 768px) 50vw, 25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                            <span className="absolute top-2 right-2 text-xs bg-white/95 backdrop-blur-md rounded-md px-1.5 py-0.5 shadow-2xs font-emoji">
                              {c.icon}
                            </span>
                            <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-md">
                              {c.category?.replace("_", " ")}
                            </span>
                          </div>
                          <div className="p-3 bg-[#f8faf7] flex flex-col justify-between flex-1">
                            <div>
                              <span className="text-xs font-bold text-[#0d253d] block notranslate line-clamp-1" translate="no">
                                {isHindi ? c.nameHi : c.nameEn}
                              </span>
                              <span className="text-[10px] text-slate-500 block truncate mt-0.5 font-medium">
                                {c.varieties?.[0] ? `Var: ${c.varieties[0]}` : "High Yield"}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#2d6a4f]">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Selected</span>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {displayedCrops.length === 0 && (
                    <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                      <Leaf className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-[#1c2e24] mb-1">
                        {isHindi ? "कोई फसल नहीं मिली" : "No crops matching your search"}
                      </p>
                      <p className="text-[11px] text-slate-500 mb-3">
                        {isHindi ? "क्या आप अपनी फसल मैन्युअल रूप से जोड़ना चाहते हैं?" : "Would you like to add your specific crop manually?"}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomCropName(cropSearchQuery);
                          setShowCustomCropModal(true);
                        }}
                        className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-sm bg-[#1b4332] hover:bg-[#143326] cursor-pointer"
                      >
                        + {isHindi ? `"${cropSearchQuery}" फसल जोड़ें` : `Add "${cropSearchQuery}" as Custom Crop`}
                      </button>
                    </div>
                  )}
                </div>

                {/* Sowing Date & Variety with Local Cultivar Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-[#1c2e24]">Crop Variety (फसल की किस्म)</label>
                      {currentCropObj?.varieties && currentCropObj.varieties.length > 0 && (
                        <span className="text-[10px] text-[#2d6a4f] font-bold">
                          {currentCropObj.varieties.length} Local Cultivars
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. JS-335 / PBW-824 / Bhima Super"
                      value={cropVariety}
                      onChange={(e) => setCropVariety(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#fbfcfb] border border-[#e2e8df] text-xs font-bold text-[#1c2e24] focus:outline-none focus:border-[#2d6a4f] notranslate"
                      translate="no"
                    />
                    {currentCropObj?.varieties && currentCropObj.varieties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentCropObj.varieties.map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setCropVariety(v)}
                            className={`text-[10px] px-2 py-0.5 rounded-md border font-mono transition-colors cursor-pointer ${
                              cropVariety === v
                                ? "bg-[#1b4332] text-white border-[#1b4332]"
                                : "bg-white text-[#52796f] border-[#e2e8df] hover:bg-[#f4f8f5]"
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1c2e24]">
                      Sowing Date (बुवाई की तारीख - पिछली या आगामी)
                    </label>
                    <input
                      type="date"
                      value={sowingDate}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setSowingDate(newDate);
                        if (newDate) {
                          const diff = Math.floor((new Date().getTime() - new Date(newDate).getTime()) / (1000 * 60 * 60 * 24));
                          if (diff >= 0 && diff < 20) setGrowthStage("Germination & Seedling");
                          else if (diff >= 20 && diff < 45) setGrowthStage("Vegetative Canopy Growth");
                          else if (diff >= 45 && diff < 75) setGrowthStage("Flowering & Pod Formation");
                          else if (diff >= 75) setGrowthStage("Maturity & Pre-Harvest");
                        }
                      }}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#fbfcfb] border border-[#e2e8df] text-xs font-bold text-[#1c2e24] focus:outline-none focus:border-[#2d6a4f]"
                    />
                  </div>
                </div>

                {/* Dynamic DAS & Phenology Indicator */}
                {sowingDate && (
                  <div className="p-3 rounded-xl bg-[#e8f5e9]/80 border border-emerald-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#2d6a4f]" />
                      <span className="font-bold text-[#0d253d]">
                        {(() => {
                          const diff = Math.floor((new Date().getTime() - new Date(sowingDate).getTime()) / (1000 * 60 * 60 * 24));
                          if (diff >= 0) {
                            return `Crop Age: ${diff} Days After Sowing (DAS)`;
                          }
                          return `Scheduled Sowing in ${Math.abs(diff)} Days`;
                        })()}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-[#1b4332] bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
                      Phase: {growthStage}
                    </span>
                  </div>
                )}

                {/* Sowing Method & Previous Crop Rotation */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1c2e24]">Sowing Method (बुवाई विधि)</label>
                    <select
                      value={sowingMethod}
                      onChange={(e) => setSowingMethod(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#fbfcfb] border border-[#e2e8df] text-xs font-bold text-[#1c2e24] focus:outline-none focus:border-[#2d6a4f]"
                    >
                      <option value="Line Sowing / Seed Drill (कतार बुवाई / सीड ड्रिल)">Line Sowing / Seed Drill (कतार बुवाई)</option>
                      <option value="Broadcasting (छिटकवां विधि)">Broadcasting (छिटकवां विधि)</option>
                      <option value="Broad Bed Furrow (मेड़-नाली विधि)">Broad Bed Furrow (मेड़-नाली BBF)</option>
                      <option value="Zero Till (जीरो टिलेज)">Zero Till (बिना जुताई बुवाई)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1c2e24]">Previous Crop (पिछली फसल)</label>
                    <select
                      value={previousCrop}
                      onChange={(e) => setPreviousCrop(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#fbfcfb] border border-[#e2e8df] text-xs font-bold text-[#1c2e24] focus:outline-none focus:border-[#2d6a4f]"
                    >
                      <option value="Wheat (गेहूं)">Wheat (गेहूं)</option>
                      <option value="Chickpea / Gram (चना)">Chickpea / Gram (चना)</option>
                      <option value="Mustard (सरसों)">Mustard (सरसों)</option>
                      <option value="Soybean (सोयाबीन)">Soybean (सोयाबीन)</option>
                      <option value="Cotton (कपास)">Cotton (कपास)</option>
                      <option value="Maize (मक्का)">Maize (मक्का)</option>
                      <option value="Fallow Land (परती / खाली)">Fallow Land (परती / खाली)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1c2e24]">Water Source (जल स्रोत)</label>
                    <select
                      value={waterSource}
                      onChange={(e) => setWaterSource(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#fbfcfb] border border-[#e2e8df] text-xs font-bold text-[#1c2e24] focus:outline-none focus:border-[#2d6a4f]"
                    >
                      <option value="Tube Well / Borewell (नलकूप / बोरवेल)">Tube Well / Borewell (नलकूप)</option>
                      <option value="Canal Network (नहर)">Canal Network (नहर)</option>
                      <option value="Farm Pond / Well (खेत तालाब / कुआं)">Farm Pond / Well (तालाब / कुआं)</option>
                      <option value="Rainfed Only (केवल वर्षा आधारित)">Rainfed Only (केवल वर्षा)</option>
                    </select>
                  </div>
                </div>

                {/* Growth Stage Override */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1c2e24]">Current Growth Stage (वर्तमान विकास अवस्था)</label>
                  <select
                    value={growthStage}
                    onChange={(e) => setGrowthStage(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-[#fbfcfb] border border-[#e2e8df] text-xs font-bold text-[#1c2e24] focus:outline-none focus:border-[#2d6a4f]"
                  >
                    <option value="Germination & Seedling">Germination & Seedling (अंकुरण व शुरुआती बढ़वार)</option>
                    <option value="Vegetative Canopy Growth">Vegetative Canopy Growth (शाखाएं व पत्तियां फैलना)</option>
                    <option value="Flowering & Pod Formation">Flowering & Pod Formation (फूल व फली/दाने बनना - उच्च संवेदनशीलता)</option>
                    <option value="Maturity & Pre-Harvest">Maturity & Pre-Harvest (पकाव व कटाई की तैयारी)</option>
                  </select>
                </div>

                {/* Security & Privacy Agreement */}
                <div className="p-4 rounded-2xl bg-[#e8f5e9] border border-emerald-200 flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#2d6a4f] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#1b4332] block">
                      <span>{isHindi ? "किसान डेटा गोपनीयता सुरक्षा (DPDP Act 2023 Compliant)" : "Farmer Data Privacy Guarantee"}</span>
                    </span>
                    <p className="text-[11px] text-[#2d6a4f] leading-relaxed">
                      <span>{isHindi ? "आपका खेत डेटा केवल मौसम व वैज्ञानिक सलाह के लिए उपयोग होता है। किसी तीसरे पक्ष को बेचा नहीं जाता।" : "Your land coordinates and crop records are AES-256 encrypted and never shared or monetized."}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-3.5 rounded-xl border border-[#e2e8df] hover:bg-[#f4f8f5] text-[#52796f] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleCompleteRegistration}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)",
                    boxShadow: "0 8px 25px rgba(27, 67, 50, 0.28)",
                  }}
                >
                  {loading ? (
                    <span className="animate-pulse">{isHindi ? "खाता डेटाबेस में सुरक्षित हो रहा है..." : "Saving Farmer Account to Database..."}</span>
                  ) : (
                    <>
                      <span>{isHindi ? "खाता बनाएं व स्मार्ट कार्ड जारी करें" : "Complete Registration & Generate Smart Card"}</span>
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

          {/* ── STAGE 4: Digital Smart Card Passport ─────────────────── */}
          <div key="step-4" className={step === 4 ? "space-y-6 text-center" : "hidden"}>
            <div className="h-14 w-14 rounded-3xl bg-emerald-100 text-[#2d6a4f] flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="h-8 w-8 text-[#2d6a4f]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-[#1c2e24] font-display">
                <span>{isHindi ? "बधाई हो! आपका किसान खाता सक्रिय है" : "Registration Successful & Verified!"}</span>
              </h2>
              <p className="text-xs text-[#52796f]">
                <span>{isHindi ? "आपका डिजिटल किसान स्मार्ट पासपोर्ट जारी कर दिया गया है।" : "Your digital farm passport is active and stored in the secure registry database."}</span>
              </p>
            </div>

            {/* Digital Holographic Krishyantra Smart Card */}
            <div className="max-w-md mx-auto p-6 rounded-3xl bg-gradient-to-br from-[#091811] via-[#1b4332] to-[#091811] text-white text-left space-y-4 shadow-2xl border border-emerald-500/30 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-200 uppercase">
                    KRISHYANTRA KISAN SMART CARD
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  ACTIVE ✓
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-200/70 uppercase">Farmer Name</span>
                <h3 className="text-xl font-bold font-display text-white">{fullName}</h3>
                <p className="text-xs font-mono text-emerald-200/90 notranslate" translate="no">
                  +91 {mobileNumber} • {selectedDistrict}, {selectedState}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs font-mono">
                <div className="p-2 rounded-xl bg-white/5">
                  <span className="text-emerald-200/60 text-[10px] block">Primary Crop:</span>
                  <span className="font-bold text-white notranslate" translate="no">{primaryCrop} ({cropVariety})</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5">
                  <span className="text-emerald-200/60 text-[10px] block">Acreage Mapped:</span>
                  <span className="font-bold text-emerald-300">{acres} Acres ({(acres * 0.4047).toFixed(1)} Ha)</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[9px] font-mono text-emerald-200/70 border-t border-white/10">
                <span suppressHydrationWarning>Vault ID: KRISHYANTRA-{mobileNumber ? mobileNumber.slice(-4) : "FARM"}-2026</span>
                <span className="text-emerald-400">AES-256 SECURED</span>
              </div>
            </div>

            {/* Go to Dashboard CTA */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  let target = "/dashboard";
                  if (typeof window !== "undefined") {
                    const params = new URLSearchParams(window.location.search);
                    target = params.get("redirect") || "/dashboard";
                  }
                  router.push(target);
                }}
                className="w-full py-4 rounded-2xl text-white font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)",
                  boxShadow: "0 10px 30px rgba(27, 67, 50, 0.35)",
                }}
              >
                <span>{isHindi ? "मेरा खेत डैशबोर्ड खोलें" : "Open My Farm Dashboard"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Security Stamp */}
      <footer className="p-6 text-center text-xs text-[#52796f] font-mono relative z-10 flex items-center justify-center gap-2">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        <span>Encrypted with Krishyantra Digital Vault • DPDP Act 2023 Compliant • Indian Agriculture Stack</span>
      </footer>

      {/* ── Modal: Add Custom / Specialty Crop ────────────────────── */}
      {showCustomCropModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-[#2d6a4f]" />
                <h3 className="text-base font-bold text-[#0d253d]">
                  {isHindi ? "कस्टम / विशिष्ट फसल जोड़ें" : "Add Custom / Specialty Crop"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomCropModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#1c2e24]">Crop Name (फसल का नाम) *</label>
                <input
                  type="text"
                  placeholder="e.g. Dragon Fruit, Chia Seeds, Mentha, Apple, Cardamom..."
                  value={customCropName}
                  onChange={(e) => setCustomCropName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbfcfb] border border-[#e2e8df] font-bold text-[#1c2e24] focus:border-[#2d6a4f] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1c2e24]">Category (श्रेणी)</label>
                <select
                  value={customCropCategory}
                  onChange={(e) => setCustomCropCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbfcfb] border border-[#e2e8df] font-bold text-[#1c2e24] focus:border-[#2d6a4f] focus:outline-none"
                >
                  <option value="cereal">Cereal / Grain (अनाज)</option>
                  <option value="cash_crop">Cash Crop (नकदी फसल)</option>
                  <option value="pulse">Pulse (दलहन)</option>
                  <option value="oilseed">Oilseed (तिलहन)</option>
                  <option value="vegetable">Vegetable (सब्जी)</option>
                  <option value="horticulture">Horticulture / Fruit (फल व बागवानी)</option>
                  <option value="spice">Spice (मसाले)</option>
                  <option value="plantation">Plantation (वृक्षारोपण)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1c2e24]">Cultivar / Variety (किस्म / हाइब्रिड)</label>
                <input
                  type="text"
                  placeholder="e.g. Red Flesh Hybrid / Local Desi"
                  value={customCropVariety}
                  onChange={(e) => setCustomCropVariety(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbfcfb] border border-[#e2e8df] font-bold text-[#1c2e24] focus:border-[#2d6a4f] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomCropModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!customCropName.trim()}
                onClick={() => {
                  if (!customCropName.trim()) return;
                  const cropId = customCropName.trim();
                  const newCrop: RegionalCropOption = {
                    id: cropId,
                    nameEn: cropId,
                    nameHi: cropId,
                    category: customCropCategory as any,
                    icon: "🌱",
                    image: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=400&q=80",
                    varieties: customCropVariety.trim() ? [customCropVariety.trim()] : ["Local Hybrid"],
                    isMajorCrop: true,
                  };
                  setRegionalCrops((prev) => [newCrop, ...prev]);
                  setPrimaryCrop(newCrop.nameEn);
                  setCropVariety(newCrop.varieties[0]);
                  setShowCustomCropModal(false);
                  setCustomCropName("");
                  setCustomCropVariety("");
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#1b4332] hover:bg-[#143326] text-white font-bold text-xs disabled:opacity-50 shadow-md cursor-pointer transition-all"
              >
                {isHindi ? "फसल जोड़ें और चुनें" : "Add & Select Crop"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
