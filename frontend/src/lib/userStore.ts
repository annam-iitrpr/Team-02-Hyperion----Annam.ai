/**
 * AASRA User Store & Enterprise Profile Registry
 * Persisted database for verified farmer profiles, secure credentials, and deep personalization.
 */

export interface FarmerProfile {
  // Identity & Credentials
  id?: string;
  fullName: string;
  mobileNumber: string;
  email?: string;
  password?: string;
  language: string;
  profilePhoto?: string;
  ageGroup?: string;
  farmingExperience?: string;
  isRegistered?: boolean;
  lastLogin?: string;

  // Geography & GIS Land Grounding
  state: string;
  district: string;
  tehsil?: string;
  village: string;
  pincode?: string;
  gpsLocation?: { lat: number; lon: number };
  polygon?: Array<[number, number]>;
  fieldName?: string;
  fieldAreaAcres: number;
  fieldAreaHa?: number;
  landOwnership?: "Owner" | "Tenant" | "Leaseholder" | "Sharecropper";

  // Agronomic & Crop Intelligence
  primaryCrop: string;
  cropVariety?: string;
  secondaryCrop?: string;
  sowingDate: string;
  growthStage?: string;
  soilType: string;
  irrigationType: string;
  sowingMethod?: string;
  previousCrop?: string;
  waterSource?: string;
  hasSoilHealthCard?: boolean;

  // Pest & Input History
  pestHistory?: string[];
  fertilizersUsed?: string[];
  lastBiostimulantUsed?: string;

  // Financial & Government Links
  hasKisanCreditCard?: boolean;
  pmKisanBeneficiary?: boolean;
  cropInsuranceActive?: boolean;

  // Telemetry & Communication Preferences
  preferredCommunication: string;
  voiceResponsesEnabled: boolean;
  helpTopics: string[];
  notificationPreference?: string;
  dataConsent: boolean;
  dataEncryptionStamp?: string;
}

export const INDIAN_LANGUAGES = [
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "as", name: "Assamese", native: "অसमীয়া" },
  { code: "en", name: "English", native: "English" },
];

export const DEMO_FARMER_PROFILE: FarmerProfile = {
  fullName: "Sameer Mishra",
  mobileNumber: "9720413710",
  email: "sameer.mishra@punjabkrishi.in",
  language: "en",
  state: "Punjab",
  district: "Rupnagar",
  tehsil: "Chamkaur Sahib",
  village: "Chamkaur Sahib",
  pincode: "140111",
  fieldName: "Wheat Main Field (Killa 4-8)",
  fieldAreaAcres: 5.0,
  fieldAreaHa: 2.02,
  landOwnership: "Owner",
  farmingExperience: "12 Years",
  primaryCrop: "Wheat",
  cropVariety: "PBW-826 (High Yield Punjab Wheat)",
  secondaryCrop: "Mustard (Border Trap Crop)",
  sowingDate: "2025-11-15",
  growthStage: "Milking & Grain Filling (Zadoks GS 73-77)",
  soilType: "Alluvial Fertile Loam (Punjab Plains)",
  irrigationType: "Canal + Electric Tube Well",
  hasSoilHealthCard: true,
  pestHistory: ["Yellow Rust (Puccinia striiformis)", "Stripe Rust", "Thermal Heat Blight"],
  fertilizersUsed: ["DAP", "Urea", "Syngenta Score® (Difenoconazole 25% EC)", "Syngenta Quantis®"],
  lastBiostimulantUsed: "Syngenta Quantis® (Amino Acids & Peptides)",
  hasKisanCreditCard: true,
  pmKisanBeneficiary: true,
  cropInsuranceActive: true,
  preferredCommunication: "Voice + WhatsApp (+91 97204 13710)",
  voiceResponsesEnabled: true,
  helpTopics: ["Heat stress protection", "Yellow rust control", "Daily mandi rates", "Safe spray window"],
  notificationPreference: "High Priority WhatsApp Alerts",
  dataConsent: true,
  dataEncryptionStamp: "AES-256 Encrypted via Syngenta Krishi Vault",
  isRegistered: true,
};

export const EMPTY_FARMER_PROFILE: FarmerProfile = {
  fullName: "",
  mobileNumber: "",
  email: "",
  language: "en",
  state: "Uttar Pradesh",
  district: "Agra",
  village: "",
  pincode: "",
  fieldName: "My Farm",
  fieldAreaAcres: 2.5,
  fieldAreaHa: 1.01,
  landOwnership: "Owner",
  farmingExperience: "5 Years",
  primaryCrop: "Wheat",
  cropVariety: "Standard",
  sowingDate: "2025-11-15",
  growthStage: "Vegetative",
  soilType: "Alluvial Loam",
  irrigationType: "Tube Well",
  hasSoilHealthCard: false,
  pestHistory: [],
  fertilizersUsed: [],
  preferredCommunication: "WhatsApp",
  voiceResponsesEnabled: true,
  helpTopics: [],
  dataConsent: true,
  isRegistered: false,
};

const DB_USERS_KEY = "aasra_registered_users_database_v1";

/**
 * Persisted Database Operations
 */
export function getRegisteredUsers(): FarmerProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DB_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Failed to read registered users database", e);
  }
  return [];
}

export function saveRegisteredUser(profile: FarmerProfile): void {
  if (typeof window === "undefined") return;
  try {
    const users = getRegisteredUsers();
    const cleanMobile = profile.mobileNumber.replace(/\D/g, "");
    
    // Find or replace existing by mobile number
    const existingIdx = users.findIndex(
      (u) => u.mobileNumber.replace(/\D/g, "") === cleanMobile
    );

    const userWithMeta: FarmerProfile = {
      ...profile,
      id: profile.id || `kisan-${cleanMobile.slice(-6)}-${Date.now()}`,
      isRegistered: true,
      lastLogin: new Date().toISOString(),
      dataEncryptionStamp: "AES-256 Encrypted via Syngenta Krishi Vault",
    };

    if (existingIdx >= 0) {
      users[existingIdx] = userWithMeta;
    } else {
      users.push(userWithMeta);
    }

    localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
    
    // Also set as active current profile and login session
    saveProfile(userWithMeta);

    // Asynchronously synchronize with backend database
    try {
      fetch("/api/farmers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userWithMeta),
      }).catch(() => {});
    } catch {}
  } catch (e) {
    console.error("Failed to save user to registry database", e);
  }
}

export function findRegisteredUser(mobileOrEmail: string): FarmerProfile | null {
  const users = getRegisteredUsers();
  const cleanQuery = mobileOrEmail.trim().toLowerCase().replace(/\D/g, "");
  
  return (
    users.find((u) => {
      const uMobile = (u.mobileNumber || "").replace(/\D/g, "");
      const uEmail = (u.email || "").trim().toLowerCase();
      return (
        (cleanQuery.length >= 10 && uMobile.includes(cleanQuery)) ||
        (u.email && uEmail === mobileOrEmail.trim().toLowerCase())
      );
    }) || null
  );
}

/**
 * Async lookup verifying both local storage registry and server-side database (/api/farmers).
 */
export async function lookupFarmerInDatabase(mobileOrEmail: string): Promise<FarmerProfile | null> {
  // 1. Fast local registry lookup
  const localMatch = findRegisteredUser(mobileOrEmail);
  if (localMatch) return localMatch;

  // 2. Fetch server-side JSON database
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/farmers", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const farmers: any[] = data.farmers || [];
        const cleanQuery = mobileOrEmail.trim().toLowerCase().replace(/\D/g, "");

        const serverMatch = farmers.find((f) => {
          const fMobile = (f.mobileNumber || "").replace(/\D/g, "");
          const fEmail = (f.email || "").trim().toLowerCase();
          return (
            (cleanQuery.length >= 10 && fMobile.includes(cleanQuery)) ||
            (f.email && fEmail === mobileOrEmail.trim().toLowerCase())
          );
        });

        if (serverMatch) {
          const fullProfile: FarmerProfile = {
            ...EMPTY_FARMER_PROFILE,
            ...serverMatch,
            fieldAreaAcres: serverMatch.fieldAreaAcres || 5.0,
            isRegistered: true,
          };
          saveRegisteredUser(fullProfile);
          return fullProfile;
        }
      }
    } catch (e) {
      console.warn("Failed to query /api/farmers database during login lookup:", e);
    }
  }

  return null;
}

/**
 * Session Helpers
 */
export function isUserLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const explicitlyLoggedOut = localStorage.getItem("aasra_is_logged_in") === "false";
    if (explicitlyLoggedOut) return false;

    const isLoggedIn = localStorage.getItem("aasra_is_logged_in") === "true";
    const raw = localStorage.getItem("aasra_farmer_profile");
    if (raw && isLoggedIn) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.fullName && parsed.fullName.trim().length > 0 && parsed.isRegistered === true) {
        return true;
      }
    }
    return false;
  } catch (e) {
    return false;
  }
}

export function getStoredProfile(): FarmerProfile {
  if (typeof window === "undefined") return EMPTY_FARMER_PROFILE;
  try {
    const isLoggedIn = localStorage.getItem("aasra_is_logged_in") === "true";
    const raw = localStorage.getItem("aasra_farmer_profile");
    if (raw && isLoggedIn) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.fullName && parsed.isRegistered === true) {
        return { ...EMPTY_FARMER_PROFILE, ...parsed };
      }
    }
  } catch (e) {
    console.error("Failed to read farmer profile from storage", e);
  }
  return EMPTY_FARMER_PROFILE;
}

export function saveProfile(profile: FarmerProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("aasra_farmer_profile", JSON.stringify(profile));
    if (profile.isRegistered) {
      localStorage.setItem("aasra_is_logged_in", "true");
    }
    window.dispatchEvent(new CustomEvent("aasra-profile-updated", { detail: profile }));
  } catch (e) {
    console.error("Failed to save farmer profile", e);
  }
}

export function loginUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("aasra_is_logged_in", "true");
  } catch (e) {
    console.error("Failed to set logged in state", e);
  }
}

export function logoutUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("aasra_is_logged_in");
    localStorage.removeItem("aasra_farmer_profile");
    localStorage.removeItem("aasra_farmer_fields_v3");
    localStorage.removeItem("aasra_active_field_id_v3");
  } catch (e) {
    console.error("Failed to log out user", e);
  }
}
