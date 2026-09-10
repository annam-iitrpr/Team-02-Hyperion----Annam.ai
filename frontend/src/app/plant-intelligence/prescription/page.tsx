"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { useFarm } from "@/context/FarmContext";
import { usePipelinePrediction } from "@/lib/usePipelinePrediction";
import { FarmCropSwitcher } from "@/components/FarmCropSwitcher";
import { findCropMandiRate } from "@/lib/mandiEngine";
import { predictCropYield } from "@/lib/yieldPredictionEngine";
import {
  generateFarmerWhyExplanation,
  generateFarmerHowExplanation,
  getSoilTypePersonalization,
  getGeneralCulturalRecommendations,
} from "@/lib/farmerAdvisoryEngine";
import {
  FlaskConical,
  Droplets,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Volume2,
  VolumeX,
  ShieldCheck,
  Package,
  MapPin,
  ExternalLink,
  Layers,
  Thermometer,
  Wind,
  AlertTriangle,
  XCircle,
  Sliders,
  TrendingUp,
  TrendingDown,
  Check,
  Calendar,
  Zap,
  Tag,
  Info,
  Sprout,
  Cloud,
  Lightbulb,
  Sun,
  HelpCircle,
  Compass,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────────────────────────────────────
interface TankMixPartner {
  name: string;
  chemical: string;
  reasonEn: string;
  reasonHi: string;
}

interface CropProduct {
  id: string;
  name: string;
  nameHi: string;
  category: string;
  categoryHi: string;
  activeIngredient: string;
  modeOfAction: string;
  doseAmount: number;
  doseUnit: "ml" | "g" | "kg";
  doseDisplay: string;
  formulationType: "liquid" | "powder" | "granule" | "soluble_granule";
  waterPerAcre: number; // liters, 0 for soil broadcast
  costPerAcre: number;
  rankScore: number;
  efficacyPct: number;
  timing: string;
  timingHi: string;
  whyChoose: string;
  whyChooseHi: string;
  targetPests: string[];
  safeTankMix: TankMixPartner[];
  prohibitedTankMix: TankMixPartner[];
}

interface NormalizedCropInfo {
  key: string;
  nameEn: string;
  nameHi: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalizes any raw crop string from farm or user store
// ─────────────────────────────────────────────────────────────────────────────
function normalizeCrop(rawCrop: string): NormalizedCropInfo {
  const c = (rawCrop || "").toLowerCase();
  if (c.includes("tomato") || c.includes("tamatar") || c.includes("टमाटर")) {
    return { key: "tomato", nameEn: "Tomato", nameHi: "टमाटर" };
  }
  if (c.includes("gram") || c.includes("chana") || c.includes("चना") || c.includes("chickpea")) {
    return { key: "gram", nameEn: "Gram / Chickpea (चना)", nameHi: "चना (Gram / Chana)" };
  }
  if (c.includes("soy") || c.includes("सोया")) {
    return { key: "soybean", nameEn: "Soybean", nameHi: "सोयाबीन" };
  }
  if (c.includes("wheat") || c.includes("gehun") || c.includes("गेहूं")) {
    return { key: "wheat", nameEn: "Wheat", nameHi: "गेहूं" };
  }
  if (c.includes("cotton") || c.includes("kapas") || c.includes("कपास")) {
    return { key: "cotton", nameEn: "Cotton", nameHi: "कपास" };
  }
  if (c.includes("rice") || c.includes("paddy") || c.includes("dhan") || c.includes("धान") || c.includes("चावल")) {
    return { key: "rice", nameEn: "Rice / Paddy", nameHi: "धान / चावल" };
  }
  if (c.includes("maize") || c.includes("corn") || c.includes("makka") || c.includes("मक्का")) {
    return { key: "maize", nameEn: "Maize / Corn", nameHi: "मक्का" };
  }
  if (c.includes("chilli") || c.includes("chili") || c.includes("mirch") || c.includes("मिर्च")) {
    return { key: "chilli", nameEn: "Chilli", nameHi: "मिर्च" };
  }
  if (c.includes("onion") || c.includes("pyaz") || c.includes("प्याज")) {
    return { key: "onion", nameEn: "Onion", nameHi: "प्याज" };
  }
  if (c.includes("potato") || c.includes("aloo") || c.includes("आलू")) {
    return { key: "potato", nameEn: "Potato", nameHi: "आलू" };
  }
  if (c.includes("mustard") || c.includes("sarson") || c.includes("सरसों") || c.includes("raya")) {
    return { key: "mustard", nameEn: "Mustard", nameHi: "सरसों" };
  }
  if (c.includes("sugarcane") || c.includes("ganna") || c.includes("गन्ना")) {
    return { key: "sugarcane", nameEn: "Sugarcane", nameHi: "गन्ना" };
  }
  if (c.includes("groundnut") || c.includes("peanut") || c.includes("moongphali") || c.includes("मूंगफली")) {
    return { key: "groundnut", nameEn: "Groundnut", nameHi: "मूंगफली" };
  }
  if (c.includes("moong") || c.includes("urad") || c.includes("arhar") || c.includes("tur") || c.includes("pulse")) {
    return { key: "pulses", nameEn: "Pulses / Dal", nameHi: "दलहन" };
  }
  return { key: "general", nameEn: rawCrop || "Field Crop", nameHi: rawCrop || "फसल" };
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Commercial Packaging Recommender for Acreage
// ─────────────────────────────────────────────────────────────────────────────
function calculateDoseAndPacks(doseAmount: number, doseUnit: "ml" | "g" | "kg", acres: number) {
  if (doseUnit === "ml") {
    const totalMl = Math.round(doseAmount * acres);
    const totalLiters = +(totalMl / 1000).toFixed(2);
    const displayTotal = totalMl >= 1000 ? `${totalLiters} L (${totalMl.toLocaleString("en-IN")} ml)` : `${totalMl} ml`;

    let rem = totalMl;
    const packs: string[] = [];
    const p1L = Math.floor(rem / 1000);
    if (p1L > 0) {
      packs.push(`${p1L} × 1 Litre`);
      rem %= 1000;
    }
    const p500 = Math.floor(rem / 500);
    if (p500 > 0) {
      packs.push(`${p500} × 500 ml`);
      rem %= 500;
    }
    const p250 = Math.floor(rem / 250);
    if (p250 > 0) {
      packs.push(`${p250} × 250 ml`);
      rem %= 250;
    }
    const p100 = Math.ceil(rem / 100);
    if (p100 > 0) {
      packs.push(`${p100} × 100 ml`);
    }

    return {
      totalDisplay: displayTotal,
      totalVal: totalLiters,
      unitLabel: "Litres",
      recommendedPacks: packs.join(" + ") || "1 × 250 ml",
    };
  } else if (doseUnit === "g") {
    const totalG = Math.round(doseAmount * acres);
    const totalKg = +(totalG / 1000).toFixed(2);
    const displayTotal = totalG >= 1000 ? `${totalKg} kg (${totalG.toLocaleString("en-IN")} g)` : `${totalG} g`;

    let rem = totalG;
    const packs: string[] = [];
    const p1k = Math.floor(rem / 1000);
    if (p1k > 0) {
      packs.push(`${p1k} × 1 kg`);
      rem %= 1000;
    }
    const p500 = Math.floor(rem / 500);
    if (p500 > 0) {
      packs.push(`${p500} × 500 g`);
      rem %= 500;
    }
    const p250 = Math.floor(rem / 250);
    if (p250 > 0) {
      packs.push(`${p250} × 250 g`);
      rem %= 250;
    }
    const p100 = Math.ceil(rem / 100);
    if (p100 > 0) {
      packs.push(`${p100} × 100 g`);
    }

    return {
      totalDisplay: displayTotal,
      totalVal: totalKg,
      unitLabel: "kg",
      recommendedPacks: packs.join(" + ") || "1 × 100 g",
    };
  } else {
    // kg
    const totalKg = +(doseAmount * acres).toFixed(2);
    const displayTotal = `${totalKg} kg`;
    let rem = totalKg;
    const packs: string[] = [];
    const p5 = Math.floor(rem / 5);
    if (p5 > 0) {
      packs.push(`${p5} × 5 kg`);
      rem %= 5;
    }
    const p25 = Math.floor(rem / 2.5);
    if (p25 > 0) {
      packs.push(`${p25} × 2.5 kg`);
      rem %= 2.5;
    }
    const p1 = Math.ceil(rem / 1);
    if (p1 > 0) {
      packs.push(`${p1} × 1 kg`);
    }
    return {
      totalDisplay: displayTotal,
      totalVal: totalKg,
      unitLabel: "kg",
      recommendedPacks: packs.join(" + ") || "1 × 2.5 kg",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Scientific Syngenta Product Catalog (Tailored per Crop)
// ─────────────────────────────────────────────────────────────────────────────
function getCropSolutions(cropKey: string, lang: "en" | "hi"): CropProduct[] {
  const hi = lang === "hi";

  // ── 1. SOYBEAN ─────────────────────────────────────────────────────────────
  if (cropKey === "soybean") {
    return [
      {
        id: "quantis_soy",
        name: "Syngenta Quantis®",
        nameHi: "सिंजेंटा क्वांटिस (Quantis®)",
        category: "Osmoprotectant & Thermal Biostimulant",
        categoryHi: "थर्मल स्ट्रेस व परागकण रक्षक बायोस्टिमुलेंट",
        activeIngredient: "Organic Carbon, Amino Acids, Free Proline, Potassium & Calcium",
        modeOfAction: "Stimulates Heat Shock Proteins (HSP70) & stabilizes cellular osmotic balance",
        doseAmount: 250,
        doseUnit: "ml",
        doseDisplay: "250 ml / acre",
        formulationType: "liquid",
        waterPerAcre: 150,
        costPerAcre: 420,
        rankScore: 96.8,
        efficacyPct: 92.4,
        timing: hi ? "शाम 5:00 बजे के बाद या सुबह 9:00 बजे से पहले (फूल व फली बनते समय)" : "Late Evening (after 5:00 PM) or Early Morning at R1-R3 stage",
        timingHi: "शाम 5:00 बजे के बाद या सुबह 9:00 बजे से पहले (फूल व फली बनते समय)",
        whyChoose: hi
          ? "34°C+ तापमान पर सोयाबीन के फूलों को झड़ने से रोकता है और परागकणों की उर्वरता सुरक्षित रखता है।"
          : "Directly protects pollen fertility and prevents thermal flower abscission when temperatures exceed 34°C.",
        whyChooseHi: "34°C+ तापमान पर सोयाबीन के फूलों को झड़ने से रोकता है और परागकणों की उर्वरता सुरक्षित रखता है।",
        targetPests: ["Heat Abscission", "Nocturnal Respiration Burn", "Drought Wilt"],
        safeTankMix: [
          {
            name: "Syngenta Amistar Top®",
            chemical: "Azoxystrobin + Difenoconazole",
            reasonEn: "Synergistic cellular defense against both Rhizoctonia aerial blight and high heat.",
            reasonHi: "गर्मी व फफूंद दोनों से एक साथ दोहरी सुरक्षा प्रदान करता है।",
          },
          {
            name: "Syngenta Ampligo®",
            chemical: "Chlorantraniliprole + Lambda",
            reasonEn: "Safe tank mix for simultaneous girdle beetle and semilooper eradication.",
            reasonHi: "गर्डल बीटल व सेमीलूपर इल्ली को एक ही स्प्रे में नियंत्रित करता है।",
          },
          {
            name: "Chelated Micronutrients (EDTA Zn/Boron)",
            chemical: "Chelated Trace Elements",
            reasonEn: "Speeds up flower fertilization and pod filling.",
            reasonHi: "फूलों की सेटिंग और दानों के भराव को तेज करता है।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Copper Oxychloride (COC)",
            chemical: "Copper based fungicides",
            reasonEn: "STRICTLY PROHIBITED. Coagulates organic amino peptides, causing acute foliar leaf scorch.",
            reasonHi: "सख्त मना: कॉपर पेप्टाइड्स को जमा देता है जिससे पत्तियां बुरी तरह झुलस जाती हैं।",
          },
          {
            name: "Sulfur WP / Lime Sulfur",
            chemical: "Wettable Sulfur",
            reasonEn: "Do NOT spray sulfur when ambient field temperature exceeds 32°C.",
            reasonHi: "32°C से अधिक तापमान में सल्फर मिलाने पर पत्तियां जल जाती हैं।",
          },
          {
            name: "Alkaline Sprays (pH > 7.5)",
            chemical: "Hard Borewell Water / Basic salts",
            reasonEn: "High pH breaks down bio-stimulant peptide bonds within 30 minutes.",
            reasonHi: "खारा या क्षारीय पानी दवा के जैविक असर को समाप्त कर देता है।",
          },
        ],
      },
      {
        id: "ampligo_soy",
        name: "Syngenta Ampligo®",
        nameHi: "सिंजेंटा एम्प्लिगो (Ampligo®)",
        category: "Dual-Action Systemic Insecticide",
        categoryHi: "गर्डल बीटल व इल्ली नाशक कीटनाशक",
        activeIngredient: "Chlorantraniliprole 9.3% + Lambda-cyhalothrin 4.6% ZC",
        modeOfAction: "Ryanodine Receptor Modulator + Sodium Channel Knockdown (IRAC 28 + 3A)",
        doseAmount: 100,
        doseUnit: "ml",
        doseDisplay: "100 ml / acre",
        formulationType: "liquid",
        waterPerAcre: 150,
        costPerAcre: 720,
        rankScore: 94.2,
        efficacyPct: 93.8,
        timing: hi ? "गर्डल बीटल या सेमीलूपर इल्ली दिखते ही" : "At early vegetative or pod initiation at first sign of pest ETL",
        timingHi: "गर्डल बीटल या सेमीलूपर इल्ली दिखते ही",
        whyChoose: hi
          ? "सोयाबीन में गर्डल बीटल, तना छेदक व हरी सेमीलूपर इल्ली का संपूर्ण सफाया। 15-20 दिनों का लंबा सुरक्षा चक्र।"
          : "Delivers immediate knockdown plus 21-day residual defense against girdle beetle and spodoptera.",
        whyChooseHi: "सोयाबीन में गर्डल बीटल, तना छेदक व हरी सेमीलूपर इल्ली का संपूर्ण सफाया।",
        targetPests: ["Girdle Beetle", "Semilooper", "Spodoptera litura", "Stem Fly"],
        safeTankMix: [
          {
            name: "Syngenta Quantis®",
            chemical: "Osmoprotectant",
            reasonEn: "Restores vigor while eradicating pests.",
            reasonHi: "कीट नियंत्रण के साथ फसल को ऊर्जा व तनाव मुक्ति देता है।",
          },
          {
            name: "Syngenta Amistar Top®",
            chemical: "Fungicide",
            reasonEn: "Complete single-pass pest and disease control.",
            reasonHi: "कीट और फफूंद का एक साथ संपूर्ण समाधान।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Alkaline Bordeaux Mixture",
            chemical: "Copper Sulfate + Lime",
            reasonEn: "Degrades pyrethroid active ingredients instantly.",
            reasonHi: "क्षारीय चूना दवा की मारक क्षमता खत्म कर देता है।",
          },
        ],
      },
      {
        id: "amistar_soy",
        name: "Syngenta Amistar Top®",
        nameHi: "सिंजेंटा एमिस्टार टॉप (Amistar Top®)",
        category: "Broad-Spectrum Systemic Fungicide",
        categoryHi: "फफूंद व झुलसा रोधी कवकनाशी",
        activeIngredient: "Azoxystrobin 18.2% + Difenoconazole 11.4% SC",
        modeOfAction: "Respiration Inhibitor (QoI) + Sterol Demethylation Inhibitor (DMI)",
        doseAmount: 200,
        doseUnit: "ml",
        doseDisplay: "200 ml / acre",
        formulationType: "liquid",
        waterPerAcre: 150,
        costPerAcre: 680,
        rankScore: 91.5,
        efficacyPct: 91.0,
        timing: hi ? "फूल आने के समय या पहली पत्ती पर धब्बे दिखते ही" : "Early flowering or first symptom of Anthracnose / RAB",
        timingHi: "फूल आने के समय या पहली पत्ती पर धब्बे दिखते ही",
        whyChoose: hi
          ? "सोयाबीन में एन्थ्रेक्नोज़, राइजोक्टोनिया एरियल ब्लाइट व अल्टरनेरिया पत्ती धब्बा रोग का अचूक समाधान।"
          : "Systemic translaminar protection preventing premature canopy defoliation and pod discoloration.",
        whyChooseHi: "एन्थ्रेक्नोज़ व पत्ती धब्बा रोग से सम्पूर्ण सुरक्षा।",
        targetPests: ["Anthracnose", "Aerial Blight", "Cercospora Leaf Spot"],
        safeTankMix: [
          {
            name: "Syngenta Quantis®",
            chemical: "Biostimulant",
            reasonEn: "Excellent greening effect and stress resistance.",
            reasonHi: "पत्तियों में हरापन और प्रकाश संश्लेषण बढ़ाता है।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Post-emergence Herbicides",
            chemical: "Sodium acifluorfen / Imazethapyr",
            reasonEn: "Mixing with post-em herbicides causes severe leaf burning.",
            reasonHi: "खरपतवारनाशी के साथ मिलाने पर फसल झुलस सकती है।",
          },
        ],
      },
    ];
  }

  // ── 2. GRAM / CHANA / CHICKPEA ─────────────────────────────────────────────
  if (cropKey === "gram") {
    return [
      {
        id: "ampligo_chana",
        name: "Syngenta Ampligo®",
        nameHi: "सिंजेंटा एम्प्लिगो (Ampligo® — चना घेंटी इल्ली रक्षक)",
        category: "Premier Pod Borer & Caterpillar Specialist",
        categoryHi: "चना घेंटी/इल्ली का सर्वश्रेष्ठ समाधान",
        activeIngredient: "Chlorantraniliprole 9.3% + Lambda-cyhalothrin 4.6% ZC",
        modeOfAction: "Dual-Mode Ryanodine Receptor Agonist & Contact Knockdown (IRAC 28 + 3A)",
        doseAmount: 100,
        doseUnit: "ml",
        doseDisplay: "100 ml / acre",
        formulationType: "liquid",
        waterPerAcre: 150,
        costPerAcre: 720,
        rankScore: 97.4,
        efficacyPct: 94.6,
        timing: hi ? "चना में फूल से घेंटी (Pod) बनते समय इल्ली दिखने से पहले ही" : "Flower termination to early pod development stage before borer penetration",
        timingHi: "चना में फूल से घेंटी (Pod) बनते समय इल्ली दिखने से पहले ही",
        whyChoose: hi
          ? "चने की घेंटी छेदक इल्ली (Helicoverpa armigera) का संपूर्ण नाश। दाना बनने से पहले इल्ली को रोककर 30% तक उपज बचाता है।"
          : "The benchmark solution in India against Gram Pod Borer (Helicoverpa armigera). Stops larval feeding in <2 hours.",
        whyChooseHi: "घेंटी छेदक इल्ली का संपूर्ण नाश और दाना सुरक्षित।",
        targetPests: ["Gram Pod Borer (Helicoverpa)", "Spodoptera exigua", "Cutworm"],
        safeTankMix: [
          {
            name: "Syngenta Isabion®",
            chemical: "Amino Acid Bio-stimulant",
            reasonEn: "Increases branching and prevents cold shock flower drop.",
            reasonHi: "शाखाओं का फुटाव और कड़ाके की ठंड में फूल गिरने से बचाता है।",
          },
          {
            name: "Syngenta Amistar Top®",
            chemical: "Azoxystrobin + Difenoconazole",
            reasonEn: "Prevents Ascochyta blight and Fusarium wilt complex.",
            reasonHi: "एस्कोकाइटा ब्लाइट व उकठा (Wilt) रोग से चने को बचाता है।",
          },
          {
            name: "Boron 20%",
            chemical: "Soluble Boron",
            reasonEn: "Improves pollen grain fertility and uniform pod filling.",
            reasonHi: "चने में परागण व घेंटी में दाना भरने की क्षमता बढ़ाता है।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Copper Fungicides",
            chemical: "Copper Oxychloride",
            reasonEn: "Causes flower burn and phytotoxic droplet rings on tender chickpea leaflets.",
            reasonHi: "चने के नाजुक फूलों को जला देता है।",
          },
          {
            name: "Sulfur Dust",
            chemical: "Elemental Sulfur",
            reasonEn: "May cause leaflet scorching during dry daytime conditions.",
            reasonHi: "सूखे मौसम में चने की पत्तियां झुलसा सकता है।",
          },
        ],
      },
      {
        id: "proclaim_chana",
        name: "Syngenta Proclaim® 5 SG",
        nameHi: "सिंजेंटा प्रोक्लेम (Proclaim® 5 SG)",
        category: "Selective Lepidoptera Caterpillar Control",
        categoryHi: "चने की इल्लियों का लक्षित दानेदार स्प्रे",
        activeIngredient: "Emamectin Benzoate 5% SG (Soluble Granule)",
        modeOfAction: "Chloride Channel Activator causing irreversible caterpillar flaccid paralysis (IRAC 6)",
        doseAmount: 88,
        doseUnit: "g",
        doseDisplay: "88 g / acre",
        formulationType: "soluble_granule",
        waterPerAcre: 150,
        costPerAcre: 490,
        rankScore: 92.1,
        efficacyPct: 91.2,
        timing: hi ? "इल्ली का प्रकोप (1-2 इल्ली प्रति पौधा) दिखते ही" : "At early larval instars (ETL threshold: 1 larva per meter row)",
        timingHi: "इल्ली का प्रकोप दिखते ही",
        whyChoose: hi
          ? "चने की कोमल पत्तियों व घेंटी को खाने वाली इल्ली को 2 घंटे में लकवाग्रस्त कर देता है। सुरक्षित व किफायती विकल्प।"
          : "Rapid translaminar action. Ingested immediately by caterpillars, halting damage within hours.",
        whyChooseHi: "इल्ली को 2 घंटे में लकवाग्रस्त कर खाना बंद कराता है।",
        targetPests: ["Helicoverpa armigera", "Spodoptera litura", "Leaf Webber"],
        safeTankMix: [
          {
            name: "Syngenta Isabion®",
            chemical: "Amino Acid Nutrients",
            reasonEn: "Accelerates chickpea recovery from pest leaf defoliation.",
            reasonHi: "इल्ली द्वारा खाई गई पत्तियों की त्वरित रिकवरी करता है।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Alkaline Water (pH > 8.0)",
            chemical: "High salt waters",
            reasonEn: "Degrades emamectin active ingredient rapidly.",
            reasonHi: "क्षारीय पानी दवा की ताकत घटा देता है।",
          },
        ],
      },
      {
        id: "isabion_chana",
        name: "Syngenta Isabion®",
        nameHi: "सिंजेंटा इसाबियन (Isabion® — चना शाखा व फूल टॉनिक)",
        category: "Pure Animal-Origin Amino Acid & Peptide Bio-Nutrient",
        categoryHi: "चना फुटाव, फूल व घेंटी वर्धक जैव-पोषक",
        activeIngredient: "62.5% Pure Amino Acids + Short & Long Chain Peptides",
        modeOfAction: "Direct peptide absorption boosting proline, nitrogen uptake & root elongation",
        doseAmount: 400,
        doseUnit: "ml",
        doseDisplay: "400 ml / acre",
        formulationType: "liquid",
        waterPerAcre: 150,
        costPerAcre: 460,
        rankScore: 89.8,
        efficacyPct: 88.5,
        timing: hi ? "शाखाएं बनते समय (25-30 दिन) व फूल आने की शुरुआत में" : "Branching stage (25-30 DAS) and pre-bloom flower bud initiation",
        timingHi: "शाखाएं बनते समय व फूल आने की शुरुआत में",
        whyChoose: hi
          ? "चने में अधिक शाखाएं (फुटाव) लाता है, सर्दी के पाले से बचाता है और घेंटी में दानों की संख्या बढ़ाता है।"
          : "Increases primary and secondary branching in chickpea while building frost resilience during cold nights.",
        whyChooseHi: "चने में अधिक फुटाव लाता है और पाले से बचाता है।",
        targetPests: ["Cold Shock Abscission", "Poor Branching", "Shriveled Grains"],
        safeTankMix: [
          {
            name: "Syngenta Ampligo®",
            chemical: "Insecticide",
            reasonEn: "Safe and standard tank mix for simultaneous pest control and growth stimulation.",
            reasonHi: "कीट नियंत्रण व विकास दोनों एक साथ।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Copper Fungicides",
            chemical: "Copper Oxychloride",
            reasonEn: "Copper precipitates pure organic amino acids.",
            reasonHi: "अमीनो एसिड को जमा देता है।",
          },
        ],
      },
    ];
  }

  // ── 3. TOMATO ──────────────────────────────────────────────────────────────
  if (cropKey === "tomato") {
    return [
      {
        id: "ampligo_tomato",
        name: "Syngenta Ampligo®",
        nameHi: "सिंजेंटा एम्प्लिगो (Ampligo® — टमाटर फल छेदक रक्षक)",
        category: "Specialty Fruit Borer & Pinworm Protection",
        categoryHi: "टमाटर फल छेदक व पिनवर्म विशेषज्ञ",
        activeIngredient: "Chlorantraniliprole 9.3% + Lambda-cyhalothrin 4.6% ZC",
        modeOfAction: "Ryanodine Receptor Modulator + Contact Knockdown (IRAC 28 + 3A)",
        doseAmount: 100,
        doseUnit: "ml",
        doseDisplay: "100 ml / acre",
        formulationType: "liquid",
        waterPerAcre: 200,
        costPerAcre: 850,
        rankScore: 97.5,
        efficacyPct: 95.0,
        timing: hi ? "टमाटर में फल बनते ही या फल छेदक इल्ली का पहला पतंगा दिखते ही" : "Early fruit setting stage; repeat at 15-day interval if borer pressure persists",
        timingHi: "टमाटर में फल बनते ही या फल छेदक इल्ली दिखते ही",
        whyChoose: hi
          ? "टमाटर के फल में छेद करने वाली इल्ली (Fruit Borer) और पिनवर्म (Tuta absoluta) का अचूक नाश। टमाटर को दागी होने से बचाकर 'A ग्रेड' भाव दिलाता है।"
          : "CIB&RC approved benchmark for Tomato Fruit Borer & Tuta absoluta. Guarantees blemish-free Grade-A market harvest.",
        whyChooseHi: "टमाटर में छेद करने वाली इल्ली से 100% सुरक्षा व 'A ग्रेड' भाव।",
        targetPests: ["Tomato Fruit Borer (Helicoverpa)", "Tuta absoluta (Pinworm)", "Leaf Miner"],
        safeTankMix: [
          {
            name: "Syngenta Revus® / Ridomil Gold®",
            chemical: "Mandipropamid / Metalaxyl-M",
            reasonEn: "Combats late blight and fruit borer in a single sprayer pass.",
            reasonHi: "लेट ब्लाइट (झुलसा) और फल छेदक दोनों का एक साथ खात्मा।",
          },
          {
            name: "Syngenta Isabion®",
            chemical: "Bio-Nutrient",
            reasonEn: "Increases tomato fruit firmness and reduces blossom end drop.",
            reasonHi: "टमाटर की चमक, वजन और मजबूती बढ़ाता है।",
          },
          {
            name: "Calcium Nitrate 100% Water Soluble",
            chemical: "Foliar Calcium",
            reasonEn: "Prevents blossom-end rot (BER) in high-temperature tomato cultivation.",
            reasonHi: "टमाटर के नीचे काला धब्बा (ब्लॉसम एंड रॉट) पड़ने से रोकता है।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Copper Oxychloride (Blitox)",
            chemical: "Copper Hydroxide / COC",
            reasonEn: "Risk of fruit surface russeting and phytotoxic ring markings on green tomatoes.",
            reasonHi: "हरे टमाटर पर दाग व झुलसा धब्बे बना सकता है।",
          },
        ],
      },
      {
        id: "simodis_tomato",
        name: "Syngenta Simodis®",
        nameHi: "सिंजेंटा सिमोडिस (Simodis® — प्लिनाजोलिन तकनीक)",
        category: "PLINAZOLIN® Technology Insecticide for Thrips & Mites",
        categoryHi: "थ्रिप्स, मकड़ी व रस चूसक कीटों का उन्नत नियंत्रण",
        activeIngredient: "Isocycloseram 9.2% w/w DC",
        modeOfAction: "GABA-gated chloride channel allosteric modulator (IRAC Group 30)",
        doseAmount: 150,
        doseUnit: "ml",
        doseDisplay: "150 ml / acre",
        formulationType: "liquid",
        waterPerAcre: 200,
        costPerAcre: 920,
        rankScore: 95.2,
        efficacyPct: 93.8,
        timing: hi ? "टमाटर में थ्रिप्स, लाल मकड़ी या पत्ती मुड़ने के लक्षण दिखते ही" : "At first appearance of thrips, mites, or leaf curl vector infestation",
        timingHi: "थ्रिप्स, लाल मकड़ी या पत्ती मुड़ने के लक्षण दिखते ही",
        whyChoose: hi
          ? "सिंजेंटा की नई प्लिनाजोलिन तकनीक। जिद्दी थ्रिप्स और लाल मकड़ियों पर 14 दिनों तक बारिश में भी बेअसर रहने वाला सुरक्षा चक्र।"
          : "Revolutionary Group 30 chemistry overcoming organophosphate & pyrethroid resistance in thrips and mites.",
        whyChooseHi: "जिद्दी थ्रिप्स व मकड़ी का 14 दिनों तक अचूक नियंत्रण।",
        targetPests: ["Chilli/Tomato Thrips", "Red Spider Mite", "Tuta absoluta", "Whitefly"],
        safeTankMix: [
          {
            name: "Syngenta Amistar Top®",
            chemical: "Fungicide",
            reasonEn: "Dual knockdown for vector thrips and early blight lesions.",
            reasonHi: "थ्रिप्स और अगेती झुलसा दोनों से एक साथ सुरक्षा।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Wettable Sulfur",
            chemical: "Sulfur WP",
            reasonEn: "Phytotoxic risk above 30°C on tomato foliage.",
            reasonHi: "30°C से अधिक तापमान में पत्तियां जला सकता है।",
          },
        ],
      },
      {
        id: "ridomil_tomato",
        name: "Syngenta Ridomil Gold® / Revus®",
        nameHi: "सिंजेंटा रिडोमिल गोल्ड (Ridomil Gold® — झुलसा रक्षक)",
        category: "Systemic Late Blight & Downy Mildew Fungicide",
        categoryHi: "टमाटर पछेती झुलसा (Late Blight) रक्षक कवकनाशी",
        activeIngredient: "Metalaxyl-M 4% + Mancozeb 64% WG (or Mandipropamid 23.4% SC)",
        modeOfAction: "RNA Polymerase I inhibition + multi-site contact inhibition",
        doseAmount: 1000,
        doseUnit: "g",
        doseDisplay: "1 kg / acre",
        formulationType: "powder",
        waterPerAcre: 200,
        costPerAcre: 880,
        rankScore: 94.0,
        efficacyPct: 93.2,
        timing: hi ? "बादल छाने, बारिश होने या पत्तियों पर काले पानी जैसे धब्बे दिखते ही" : "Cloudy monsoon weather or at first water-soaked lesion of Late Blight",
        timingHi: "बादल छाने या पत्तियों पर काले धब्बे दिखते ही",
        whyChoose: hi
          ? "टमाटर की सबसे घातक बीमारी पछेती झुलसा (Late Blight) को 3 घंटे में रोक देता है। फसल को रातों-रात नष्ट होने से बचाता है।"
          : "Translaminar and systemic mobility protects growing shoots and prevents catastrophic crop defoliation.",
        whyChooseHi: "टमाटर में पछेती झुलसा को 3 घंटे में रोककर फसल नष्ट होने से बचाता है।",
        targetPests: ["Late Blight (Phytophthora)", "Early Blight (Alternaria)", "Buckeye Rot"],
        safeTankMix: [
          {
            name: "Syngenta Ampligo®",
            chemical: "Insecticide",
            reasonEn: "Standard tank mix for simultaneous blight and fruit borer protection.",
            reasonHi: "झुलसा व फल छेदक इल्ली दोनों का एक साथ इलाज।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Foliar Herbicides",
            chemical: "All weedicides",
            reasonEn: "Severe risk of plant burn and leaf necrosis.",
            reasonHi: "खरपतवारनाशी के साथ कदापि न मिलाएं।",
          },
        ],
      },
      {
        id: "isabion_tomato",
        name: "Syngenta Isabion®",
        nameHi: "सिंजेंटा इसाबियन (Isabion® — टमाटर फूल व फल टॉनिक)",
        category: "Pure Amino Acid Bio-Nutrient for Fruit Sizing",
        categoryHi: "टमाटर की चमक, वजन व फल वृद्धि टॉनिक",
        activeIngredient: "62.5% Pure Amino Acids + Short-chain Peptides",
        modeOfAction: "Rapid cellular peptide uptake boosting chlorophyll and flowering retention",
        doseAmount: 400,
        doseUnit: "ml",
        doseDisplay: "400 ml / acre",
        formulationType: "liquid",
        waterPerAcre: 200,
        costPerAcre: 460,
        rankScore: 90.5,
        efficacyPct: 89.0,
        timing: hi ? "फूल आने के समय और फलों की तुड़ाई के बीच" : "Flowering peak and between subsequent picking flushes",
        timingHi: "फूल आने के समय और फलों की तुड़ाई के बीच",
        whyChoose: hi
          ? "फूलों को गिरने से रोकता है, टमाटर का आकार एकसमान बड़ा करता है और छिलके में चमक लाता है।"
          : "Minimizes flower abortion under heat and ensures uniform, export-grade tomato fruit grading.",
        whyChooseHi: "फूल झड़ने से रोकता है और टमाटर का आकार व चमक बढ़ाता है।",
        targetPests: ["Blossom Drop", "Uneven Sizing", "Thermal Stress"],
        safeTankMix: [
          {
            name: "Syngenta Ampligo®",
            chemical: "Insecticide",
            reasonEn: "Safe and synergistic for fruit health and pest control.",
            reasonHi: "कीट नियंत्रण व फल स्वास्थ्य दोनों के लिए सुरक्षित।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Copper Oxychloride",
            chemical: "Copper fungicides",
            reasonEn: "Coagulates pure amino acids.",
            reasonHi: "कॉपर दवा के साथ न मिलाएं।",
          },
        ],
      },
    ];
  }

  // ── 4. WHEAT / GEHUN ───────────────────────────────────────────────────────
  if (cropKey === "wheat") {
    return [
      {
        id: "isabion_wheat",
        name: "Syngenta Isabion®",
        nameHi: "सिंजेंटा इसाबियन (Isabion® — गेहूं दाना भराव टॉनिक)",
        category: "Bio-Stimulant for Grain Fill & Heat Stress Defense",
        categoryHi: "गेहूं दाना भराव व मार्च की गर्मी रक्षक टॉनिक",
        activeIngredient: "62.5% Pure Amino Acids + Animal-Origin Peptides",
        modeOfAction: "Assists starch and gluten protein translocation into the flag leaf and spikes",
        doseAmount: 400,
        doseUnit: "ml",
        doseDisplay: "400 ml / acre",
        formulationType: "liquid",
        waterPerAcre: 150,
        costPerAcre: 460,
        rankScore: 95.2,
        efficacyPct: 91.5,
        timing: hi ? "दूधिया अवस्था (Milk stage) या दाना भरने के समय (Zadoks GS71-GS85)" : "Flag leaf emergence to grain milk/dough stage (Zadoks GS71-GS85)",
        timingHi: "दूधिया अवस्था या दाना भरने के समय",
        whyChoose: hi
          ? "मार्च में अचानक तेज गर्मी से गेहूं का दाना पिचकने से बचाता है। 1000 दानों का वजन (Test Weight) 8-12% बढ़ाता है।"
          : "Crucial defense against terminal heat shock in Central/North India, preventing shriveled grains.",
        whyChooseHi: "मार्च की गर्मी से गेहूं का दाना पिचकने से बचाता है और चमक बढ़ाता है।",
        targetPests: ["Terminal Heat Shock", "Shriveled Grain", "Premature Senescence"],
        safeTankMix: [
          {
            name: "Syngenta Amistar® 25 SC",
            chemical: "Azoxystrobin 25% SC",
            reasonEn: "Protects flag leaf photosynthesis and prevents yellow rust.",
            reasonHi: "पीले रतुए से झंडी पत्ती (Flag leaf) को बचाता है।",
          },
          {
            name: "00:52:34 (MKP)",
            chemical: "Monopotassium Phosphate",
            reasonEn: "Boosts grain plumpness and heavy bushel weight.",
            reasonHi: "दाने को मोटा और चमकदार बनाता है।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Post-emergence Herbicides (Axial / 2,4-D)",
            chemical: "Herbicides",
            reasonEn: "Do not mix biostimulants with post-emergence wheat herbicides.",
            reasonHi: "खरपतवारनाशी के साथ न मिलाएं।",
          },
        ],
      },
      {
        id: "amistar_wheat",
        name: "Syngenta Amistar® 25 SC",
        nameHi: "सिंजेंटा एमिस्टार 25 SC (Amistar® — पीला रतुआ रक्षक)",
        category: "Systemic Strobilurin Fungicide for Rust & Blight",
        categoryHi: "गेहूं पीला रतुआ व पत्ती झुलसा रक्षक कवकनाशी",
        activeIngredient: "Azoxystrobin 25% SC",
        modeOfAction: "Mitochondrial electron transport inhibitor maintaining green canopy leaf area",
        doseAmount: 200,
        doseUnit: "ml",
        doseDisplay: "200 ml / acre",
        formulationType: "liquid",
        waterPerAcre: 150,
        costPerAcre: 540,
        rankScore: 92.4,
        efficacyPct: 92.8,
        timing: hi ? "झंडी पत्ती (Flag leaf) निकलते समय या पीले रतुए के लक्षण दिखते ही" : "Flag leaf emergence (Zadoks GS39) or at first sign of Stripe / Yellow Rust",
        timingHi: "झंडी पत्ती निकलते समय या पीले रतुए के लक्षण दिखते ही",
        whyChoose: hi
          ? "गेहूं में पीले रतुए (Yellow Rust) और पत्ती झुलसा को जड़ से रोकता है। झंडी पत्ती को 3 सप्ताह तक हरा रखता है।"
          : "Delivers the renowned 'Greening Effect', sustaining photosynthesis and boosting grain yield.",
        whyChooseHi: "पीले रतुए को जड़ से रोकता है और झंडी पत्ती को हरा रखता है।",
        targetPests: ["Yellow / Stripe Rust (Puccinia striiformis)", "Karnal Bunt", "Septoria Blotch"],
        safeTankMix: [
          {
            name: "Syngenta Isabion®",
            chemical: "Biostimulant",
            reasonEn: "Synergistic yield uplift and rust eradication.",
            reasonHi: "उपज वृद्धि व रोग नाश दोनों एक साथ।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Copper Oxychloride",
            chemical: "Copper fungicide",
            reasonEn: "Can cause burn marks on wheat flag leaves.",
            reasonHi: "पत्तियों पर झुलसा पैदा कर सकता है।",
          },
        ],
      },
      {
        id: "axial_wheat",
        name: "Syngenta Axial® Herbicide",
        nameHi: "सिंजेंटा एक्सियल (Axial® — मंडूसी व गुल्ली डंडा नाशक)",
        category: "Selective Post-Emergence Grass Weed Control",
        categoryHi: "गेहूं में गुल्ली डंडा व जंगली जई का चयनात्मक नाशक",
        activeIngredient: "Pinoxaden 5.1% EC",
        modeOfAction: "ACCase inhibitor specifically killing grassy weeds with zero crop injury",
        doseAmount: 400,
        doseUnit: "ml",
        doseDisplay: "400 ml / acre",
        formulationType: "liquid",
        waterPerAcre: 150,
        costPerAcre: 580,
        rankScore: 88.0,
        efficacyPct: 91.0,
        timing: hi ? "बुआई के 30-35 दिन बाद, गेहूं में पहले पानी के बाद (2-3 पत्ती अवस्था)" : "30-35 days after sowing (post-first irrigation) at 2-3 leaf stage of weeds",
        timingHi: "बुआई के 30-35 दिन बाद, पहले पानी के बाद",
        whyChoose: hi
          ? "गेहूं में मंडूसी (Phalaris minor / गुल्ली डंडा) और जंगली जई का 100% सफाया, बिना गेहूं को नुकसान पहुंचाए।"
          : "Industry gold standard for Phalaris minor control resistant to traditional ALS inhibitors.",
        whyChooseHi: "मंडूसी व गुल्ली डंडा का सम्पूर्ण सफाया।",
        targetPests: ["Phalaris minor (Gulli danda)", "Avena fatua (Wild oats)", "Ryegrass"],
        safeTankMix: [
          {
            name: "Syngenta Adigor®",
            chemical: "Adjuvant",
            reasonEn: "Increases wax penetration on weed foliage.",
            reasonHi: "खरपतवार की पत्तियों में दवा का अवशोषण बढ़ाता है।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "2,4-D Ethyl Ester",
            chemical: "Broadleaf weedicide",
            reasonEn: "Antagonistic interaction reducing grassy weed mortality.",
            reasonHi: "मंडूसी पर दवा के असर को घटा देता है।",
          },
        ],
      },
    ];
  }

  // ── 5. COTTON / KAPAS ──────────────────────────────────────────────────────
  if (cropKey === "cotton") {
    return [
      {
        id: "alika_cotton",
        name: "Syngenta Alika® ZC",
        nameHi: "सिंजेंटा अलिका (Alika® ZC — कपास रस चूसक व सुंडी रक्षक)",
        category: "Broad-Spectrum Sucking Pest & Bollworm Insecticide",
        categoryHi: "सफेद मक्खी, थ्रिप्स व सुंडी नाशक",
        activeIngredient: "Thiamethoxam 12.6% + Lambda-cyhalothrin 9.5% ZC",
        modeOfAction: "Systemic neonicotinoid + Pyrethroid quick knockdown (IRAC 4A + 3A)",
        doseAmount: 80,
        doseUnit: "ml",
        doseDisplay: "80 ml / acre",
        formulationType: "liquid",
        waterPerAcre: 200,
        costPerAcre: 560,
        rankScore: 96.2,
        efficacyPct: 93.5,
        timing: hi ? "सफेद मक्खी, हरा तेला (Jassids) या सुंडी का प्रकोप दिखते ही" : "At first sign of whitefly, jassids, thrips or early bollworm infestation",
        timingHi: "सफेद मक्खी, हरा तेला या सुंडी दिखते ही",
        whyChoose: hi
          ? "कपास में रस चूसने वाले कीटों (सफेद मक्खी, हरा तेला) और शुरुआती बॉलवर्म का एक साथ सफाया। पत्ती मरोड़ वायरस (CLCV) से सुरक्षा।"
          : "Instant contact knockdown plus systemic sap translocation protecting newly emerged leaves.",
        whyChooseHi: "रस चूसने वाले कीटों व सुंडी का एक साथ सफाया।",
        targetPests: ["Whitefly", "Jassids", "Thrips", "Spotted Bollworm"],
        safeTankMix: [
          {
            name: "Syngenta Quantis®",
            chemical: "Thermal Biostimulant",
            reasonEn: "Prevents heat-induced square shedding above 40°C.",
            reasonHi: "40°C से अधिक गर्मी में फूल व कलियां झड़ने से रोकता है।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Copper Oxychloride",
            chemical: "Copper fungicide",
            reasonEn: "Phytotoxic risk on cotton tender squares.",
            reasonHi: "कपास के कोमल डोडे जला सकता है।",
          },
        ],
      },
      {
        id: "voliam_cotton",
        name: "Syngenta Voliam Flexi®",
        nameHi: "सिंजेंटा वोलियम फ्लेक्सी (Voliam Flexi®)",
        category: "Advanced Bollworm & Sucking Complex Insecticide",
        categoryHi: "गुलाबी सुंडी व बॉलवर्म कॉम्प्लेक्स रक्षक",
        activeIngredient: "Chlorantraniliprole 10% + Thiamethoxam 20% WG",
        modeOfAction: "Ryanodine receptor modulator + Neonicotinoid (IRAC 28 + 4A)",
        doseAmount: 100,
        doseUnit: "g",
        doseDisplay: "100 g / acre",
        formulationType: "powder",
        waterPerAcre: 200,
        costPerAcre: 740,
        rankScore: 93.5,
        efficacyPct: 92.0,
        timing: hi ? "कपास में घेंडी (Boll) बनने की अवस्था में (जुलाई से सितंबर)" : "Squaring to boll formation stage (peak bollworm window)",
        timingHi: "कपास में घेंडी बनने की अवस्था में",
        whyChoose: hi
          ? "अमेरिकन व गुलाबी सुंडी (Pink Bollworm) का सर्वश्रेष्ठ नियंत्रण। डोडे के अंदर इल्ली को जाने से पहले ही खत्म करता है।"
          : "Best-in-class defense against American and pink bollworm entering tender cotton bolls.",
        whyChooseHi: "गुलाबी सुंडी को डोडे के अंदर जाने से पहले ही खत्म करता है।",
        targetPests: ["Pink Bollworm", "American Bollworm", "Tobacco Caterpillar"],
        safeTankMix: [
          {
            name: "NPK 13-00-45 (Potassium Nitrate)",
            chemical: "Foliar Potassium",
            reasonEn: "Accelerates boll sizing and lint fiber elongation.",
            reasonHi: "कपास के डोडे का आकार और रुई की चमक बढ़ाता है।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Alkaline Bordeaux Mixture",
            chemical: "Copper + Lime",
            reasonEn: "Reduces active ingredient efficacy.",
            reasonHi: "दवा की मारक क्षमता कम कर देता है।",
          },
        ],
      },
      {
        id: "quantis_cotton",
        name: "Syngenta Quantis®",
        nameHi: "सिंजेंटा क्वांटिस (Quantis® — कपास कलियां रक्षक)",
        category: "Square Retention & Heat Abscission Biostimulant",
        categoryHi: "कपास में फूल-कलियां झड़ने से रोकने वाला टॉनिक",
        activeIngredient: "Amino Acids, Free Proline, Potassium & Calcium",
        modeOfAction: "Maintains stomatal transpiration cooling during severe dry heat waves",
        doseAmount: 300,
        doseUnit: "ml",
        doseDisplay: "300 ml / acre",
        formulationType: "liquid",
        waterPerAcre: 200,
        costPerAcre: 480,
        rankScore: 89.0,
        efficacyPct: 86.5,
        timing: hi ? "फूल व कलियां बनते समय तेज गर्मी (38°C+) में" : "Pre-bloom squaring and peak summer thermal stress (>38°C)",
        timingHi: "फूल व कलियां बनते समय तेज गर्मी में",
        whyChoose: hi
          ? "तेज गर्मी में कपास के फूल और कलियां (Squares) गिरने से बचाता है। प्रति पौधा 5-8 अतिरिक्त डोडे सुरक्षित रखता है।"
          : "Maintains pollen viability and reduces square abortion under high vapor pressure deficits.",
        whyChooseHi: "तेज गर्मी में कलियां गिरने से बचाता है और डोडे बढ़ाता है।",
        targetPests: ["Heat Induced Square Drop", "Thermal Stress", "Flower Abscission"],
        safeTankMix: [
          {
            name: "Syngenta Alika® ZC",
            chemical: "Insecticide",
            reasonEn: "Safe tank mix.",
            reasonHi: "अलिका के साथ सुरक्षित मिश्रण।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Sulfur WP",
            chemical: "Wettable Sulfur",
            reasonEn: "Severe leaf burn above 32°C.",
            reasonHi: "पत्तियां जल सकती हैं।",
          },
        ],
      },
    ];
  }

  // ── 6. RICE / PADDY / DHAN ─────────────────────────────────────────────────
  if (cropKey === "rice") {
    return [
      {
        id: "virtako_rice",
        name: "Syngenta Virtako®",
        nameHi: "सिंजेंटा विरताको (Virtako® — तना छेदक व पत्ती लपेटक रक्षक)",
        category: "Granular Soil Broadcast Systemic Insecticide",
        categoryHi: "धान तना छेदक व पत्ती लपेटक दानेदार रक्षक",
        activeIngredient: "Thiamethoxam 1% + Chlorantraniliprole 0.5% GR",
        modeOfAction: "Systemic xylem root uptake providing 30+ days continuous defense (IRAC 4A + 28)",
        doseAmount: 2.5,
        doseUnit: "kg",
        doseDisplay: "2.5 kg / acre",
        formulationType: "granule",
        waterPerAcre: 0, // soil broadcast
        costPerAcre: 900,
        rankScore: 97.0,
        efficacyPct: 94.0,
        timing: hi ? "रोपाई के 15-25 दिन बाद (कल्ले फूटते समय) पानी में छिड़कें" : "Tillering stage (15-25 days after transplanting) in standing water",
        timingHi: "रोपाई के 15-25 दिन बाद (कल्ले फूटते समय)",
        whyChoose: hi
          ? "धान में सफेद बाली (White Earhead) और तना छेदक (Stem Borer) का जड़ से खात्मा। जड़ों द्वारा 30 दिनों तक निरंतर सुरक्षा।"
          : "Granular root uptake. Eliminates dead hearts and white ears, guaranteeing maximum fertile tillers.",
        whyChooseHi: "सफेद बाली और तना छेदक का 30 दिनों तक जड़ से खात्मा।",
        targetPests: ["Yellow Stem Borer", "Leaf Folder", "Early Shoot Borer"],
        safeTankMix: [
          {
            name: "Urea Fertilizer",
            chemical: "Nitrogen Fertilizer",
            reasonEn: "Broadcast together uniformly across field.",
            reasonHi: "यूरिया खाद के साथ मिलाकर खेत में आसानी से छिटकें।",
          },
          {
            name: "Dry Sand / DAP",
            chemical: "Carrier material",
            reasonEn: "5-10 kg dry sand ensures uniform broadcast distribution.",
            reasonHi: "रेत के साथ मिलाकर एकसमान छिड़काव करें।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Foliar Sprays",
            chemical: "Liquid foliar chemicals",
            reasonEn: "Virtako is a granular root product. DO NOT dissolve in spray tank.",
            reasonHi: "यह दानेदार उत्पाद है, स्प्रे पंप में घोलकर न छिड़कें।",
          },
        ],
      },
      {
        id: "amistar_rice",
        name: "Syngenta Amistar Top®",
        nameHi: "सिंजेंटा एमिस्टार टॉप (Amistar Top® — शीथ ब्लाइट व ब्लास्ट रक्षक)",
        category: "Sheath Blight & Neck Blast Specialist Fungicide",
        categoryHi: "शीथ ब्लाइट व गर्दन मरोड़ (ब्लास्ट) कवकनाशी",
        activeIngredient: "Azoxystrobin 18.2% + Difenoconazole 11.4% SC",
        modeOfAction: "Dual-systemic inhibition halting mycelial growth within plant tissues",
        doseAmount: 200,
        doseUnit: "ml",
        doseDisplay: "200 ml / acre",
        formulationType: "liquid",
        waterPerAcre: 150,
        costPerAcre: 680,
        rankScore: 93.8,
        efficacyPct: 92.5,
        timing: hi ? "बाली निकलने से ठीक पहले या तने पर धब्बे दिखते ही" : "Pre-panicle initiation or at first water-soaked sheath blight lesion",
        timingHi: "बाली निकलने से ठीक पहले या धब्बे दिखते ही",
        whyChoose: hi
          ? "धान की दो सबसे खतरनाक बीमारियों — शीथ ब्लाइट और गर्दन तोड़ ब्लास्ट से शत-प्रतिशत सुरक्षा। दानों की चमक व वजन बढ़ाता है।"
          : "Dual protection against Sheath Blight and Neck Blast. Prevents empty chalky grains.",
        whyChooseHi: "शीथ ब्लाइट व गर्दन तोड़ ब्लास्ट से शत-प्रतिशत सुरक्षा।",
        targetPests: ["Sheath Blight (Rhizoctonia)", "Neck Blast (Pyricularia)", "Brown Spot"],
        safeTankMix: [
          {
            name: "Syngenta Isabion®",
            chemical: "Amino Acid Nutrients",
            reasonEn: "Improves panicle emergence and grain filling.",
            reasonHi: "बालियां एकसमान निकालने व दाना भरने में सहायक।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Copper Fungicides",
            chemical: "Copper Oxychloride",
            reasonEn: "Can cause grain discoloration at panicle stage.",
            reasonHi: "बाली पर दाग छोड़ सकता है।",
          },
        ],
      },
    ];
  }

  // ── 7. MAIZE / CORN / MAKKA ────────────────────────────────────────────────
  if (cropKey === "maize") {
    return [
      {
        id: "voliam_maize",
        name: "Syngenta Voliam Targo® / Ampligo®",
        nameHi: "सिंजेंटा वोलियम टार्गो / एम्प्लिगो (फॉल आर्मीवर्म रक्षक)",
        category: "Fall Armyworm (FAW) Eradication Specialist",
        categoryHi: "मक्का फॉल आर्मीवर्म इल्ली विशेषज्ञ",
        activeIngredient: "Chlorantraniliprole 9.3% + Abamectin 1.7% w/w",
        modeOfAction: "Deep whorl penetration halting FAW leaf feeding in under 2 hours",
        doseAmount: 100,
        doseUnit: "ml",
        doseDisplay: "100 ml / acre",
        formulationType: "liquid",
        waterPerAcre: 150,
        costPerAcre: 680,
        rankScore: 97.8,
        efficacyPct: 96.0,
        timing: hi ? "मक्के के पोंगे (Whorl) में इल्ली का कचरा दिखते ही (V3-V6 अवस्था)" : "Directed into plant whorl at first pinhole FAW sign (V3-V6 stage)",
        timingHi: "मक्के के पोंगे में इल्ली दिखते ही",
        whyChoose: hi
          ? "मक्का के फॉल आर्मीवर्म (FAW) का संपूर्ण खात्मा। पोंगे में अंदर तक जाकर इल्ली को मारता है और फसल को 80% नुकसान से बचाता है।"
          : "Delivers complete kill of Fall Armyworm larvae hidden deep within the whorl.",
        whyChooseHi: "फॉल आर्मीवर्म का संपूर्ण खात्मा और भुट्टे की सुरक्षा।",
        targetPests: ["Fall Armyworm (Spodoptera frugiperda)", "Stem Borer", "Corn Earworm"],
        safeTankMix: [
          {
            name: "Syngenta Quantis®",
            chemical: "Osmoprotectant",
            reasonEn: "Protects silk filaments from drying during heat waves.",
            reasonHi: "गर्मी में मक्के के सिल्क (बाल) सूखने से बचाता है।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Post-em Herbicides (Callisto)",
            chemical: "Mesotrione",
            reasonEn: "Spray separately at 3-day interval to prevent crop stress.",
            reasonHi: "खरपतवारनाशी के साथ 3 दिन का अंतर रखें।",
          },
        ],
      },
      {
        id: "callisto_maize",
        name: "Syngenta Callisto® 480 SC",
        nameHi: "सिंजेंटा कैलिस्टो (Callisto® 480 SC — मक्का खरपतवार नाशक)",
        category: "Selective Post-Emergence Broad-Leaf Weedicide",
        categoryHi: "मक्का चयनात्मक चौड़ी पत्ती खरपतवार नाशक",
        activeIngredient: "Mesotrione 48% SC",
        modeOfAction: "HPPD inhibitor whitening and degrading target weeds safely",
        doseAmount: 120,
        doseUnit: "ml",
        doseDisplay: "120 ml / acre",
        formulationType: "liquid",
        waterPerAcre: 150,
        costPerAcre: 420,
        rankScore: 91.0,
        efficacyPct: 89.5,
        timing: hi ? "मक्का 3-5 पत्ती अवस्था में, बुआई के 20-25 दिन बाद" : "Post-emergence at V3-V5 stage (20-25 DAS)",
        timingHi: "मक्का 3-5 पत्ती अवस्था में, बुआई के 20-25 दिन बाद",
        whyChoose: hi
          ? "मक्के में चौड़ी पत्ती खरपतवार व गाजर घास (Parthenium) का सुरक्षित व लंबा नियंत्रण। मक्के को रत्ती भर भी नुकसान नहीं।"
          : "Selective weed control without burning maize plants. Exceptional control of Parthenium hysterophorus.",
        whyChooseHi: "चौड़ी पत्ती खरपतवार व गाजर घास का संपूर्ण सफाया।",
        targetPests: ["Parthenium", "Amaranthus", "Chenopodium", "Trianthema"],
        safeTankMix: [
          {
            name: "Syngenta Atrazine 50% WP",
            chemical: "Herbicide synergy",
            reasonEn: "Broadens weed kill spectrum to grassy weeds.",
            reasonHi: "घास व चौड़ी पत्ती दोनों का एक साथ खात्मा।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Organophosphate Insecticides",
            chemical: "Chlorpyrifos",
            reasonEn: "Causes temporary maize leaf stunting.",
            reasonHi: "मक्के की वृद्धि रोक सकता है।",
          },
        ],
      },
    ];
  }

  // ── 8. CHILLI / MIRCH ──────────────────────────────────────────────────────
  if (cropKey === "chilli") {
    return [
      {
        id: "simodis_chilli",
        name: "Syngenta Simodis®",
        nameHi: "सिंजेंटा सिमोडिस (Simodis® — मिर्च थ्रिप्स व मकड़ी रक्षक)",
        category: "PLINAZOLIN® Technology Insecticide for Chilli Thrips",
        categoryHi: "मिर्च थ्रिप्स, लाल मकड़ी व पत्ती मरोड़ विशेषज्ञ",
        activeIngredient: "Isocycloseram 9.2% w/w DC",
        modeOfAction: "GABA-gated chloride channel modulator with 14-day rainfast persistence (IRAC Group 30)",
        doseAmount: 150,
        doseUnit: "ml",
        doseDisplay: "150 ml / acre",
        formulationType: "liquid",
        waterPerAcre: 200,
        costPerAcre: 920,
        rankScore: 97.2,
        efficacyPct: 95.5,
        timing: hi ? "मिर्च में पत्तियां नाव की तरह मुड़ते ही (थ्रिप्स व मकड़ी का पहला लक्षण)" : "At first upward leaf curling indicating thrips or downward curl from mites",
        timingHi: "मिर्च में पत्तियां नाव की तरह मुड़ते ही",
        whyChoose: hi
          ? "मिर्च में पत्ती मरोड़ (Chilli Leaf Curl / मुर्रा रोग) के वाहक थ्रिप्स और लाल मकड़ी का 14 दिनों तक अचूक खात्मा।"
          : "The most advanced Group 30 insecticide breaking chemical resistance in thrips and broad mites.",
        whyChooseHi: "पत्ती मरोड़ व मुर्रा रोग के वाहक थ्रिप्स का 14 दिनों तक सफाया।",
        targetPests: ["Chilli Thrips (Scirtothrips)", "Yellow Mite (Polyphagotarsonemus)", "Whitefly"],
        safeTankMix: [
          {
            name: "Syngenta Amistar Top®",
            chemical: "Fungicide",
            reasonEn: "Prevents die-back while eradicating vector thrips.",
            reasonHi: "डाई-बैक (उल्टा सूखा) और थ्रिप्स दोनों से एक साथ सुरक्षा।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Sulfur WP",
            chemical: "Wettable Sulfur",
            reasonEn: "High risk of leaf burn when temperatures exceed 30°C.",
            reasonHi: "30°C से ऊपर तापमान में मिर्च के पत्ते जल सकते हैं।",
          },
        ],
      },
      {
        id: "amistar_chilli",
        name: "Syngenta Amistar Top®",
        nameHi: "सिंजेंटा एमिस्टार टॉप (मिर्च डाई-बैक व फल सड़न रक्षक)",
        category: "Die-back & Anthracnose Specialist Fungicide",
        categoryHi: "मिर्च डाई-बैक (उल्टा सूखा) व फल सड़न कवकनाशी",
        activeIngredient: "Azoxystrobin 18.2% + Difenoconazole 11.4% SC",
        modeOfAction: "Translaminar & acropetal xylem mobility stopping anthracnose fungal spread",
        doseAmount: 200,
        doseUnit: "ml",
        doseDisplay: "200 ml / acre",
        formulationType: "liquid",
        waterPerAcre: 200,
        costPerAcre: 680,
        rankScore: 93.4,
        efficacyPct: 92.0,
        timing: hi ? "फूल आते समय या मिर्च की टहनियों पर उल्टा सूखा (Die-back) दिखते ही" : "Flowering or at initial drying of twig tips (Die-back symptom)",
        timingHi: "फूल आते समय या उल्टा सूखा दिखते ही",
        whyChoose: hi
          ? "मिर्च की सबसे विनाशकारी बीमारी डाई-बैक (उल्टा सूखा) और लाल मिर्च पर सड़न धब्बों को पूरी तरह रोकता है।"
          : "Stops twig dieback and anthracnose fruit rot, securing export quality red dry chilli yield.",
        whyChooseHi: "डाई-बैक व फल सड़न से सम्पूर्ण सुरक्षा।",
        targetPests: ["Anthracnose / Die-back (Colletotrichum)", "Powdery Mildew", "Fruit Rot"],
        safeTankMix: [
          {
            name: "Syngenta Isabion®",
            chemical: "Bio-Nutrient",
            reasonEn: "Increases flower retention and fruit pungency.",
            reasonHi: "फूलों का झड़ना रोकता है और मिर्च की चमक बढ़ाता है।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Bordeaux Mixture",
            chemical: "Alkaline Copper",
            reasonEn: "Incompatible formulation.",
            reasonHi: "कॉपर मिश्रण के साथ न मिलाएं।",
          },
        ],
      },
    ];
  }

  // ── 9. POTATO / ALOO ───────────────────────────────────────────────────────
  if (cropKey === "potato") {
    return [
      {
        id: "ridomil_potato",
        name: "Syngenta Ridomil Gold® 68 WG",
        nameHi: "सिंजेंटा रिडोमिल गोल्ड (आलू पछेती झुलसा रक्षक)",
        category: "Late Blight Systemic Specialist",
        categoryHi: "आलू पछेती झुलसा (Late Blight) रक्षक कवकनाशी",
        activeIngredient: "Metalaxyl-M 4% + Mancozeb 64% WG",
        modeOfAction: "Systemic xylem uptake preventing Phytophthora mycelial penetration",
        doseAmount: 1000,
        doseUnit: "g",
        doseDisplay: "1 kg / acre",
        formulationType: "powder",
        waterPerAcre: 200,
        costPerAcre: 880,
        rankScore: 96.5,
        efficacyPct: 94.2,
        timing: hi ? "मौसम में कोहरा/बादल छाने पर या पत्तियों पर काले पानीदार धब्बे दिखते ही" : "Foggy/cloudy weather or at first water-soaked lesion of Late Blight",
        timingHi: "कोहरा छाने पर या पत्तियों पर काले धब्बे दिखते ही",
        whyChoose: hi
          ? "आलू में पछेती झुलसा (Late Blight) का 100% अचूक इलाज। पत्तियों के साथ कंदों (Tubers) को सड़ने से बचाता है।"
          : "The gold standard against Phytophthora infestans. Protects both aerial canopy and underground tubers.",
        whyChooseHi: "पछेती झुलसा को रोककर आलू कंदों को सड़ने से बचाता है।",
        targetPests: ["Late Blight (Phytophthora infestans)", "Early Blight", "Tuber Rot"],
        safeTankMix: [
          {
            name: "Syngenta Quantis®",
            chemical: "Biostimulant",
            reasonEn: "Preserves tuber starch bulking during winter heat anomalies.",
            reasonHi: "आलू का आकार बड़ा करने और स्टार्च भरने में मदद करता है।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Herbicide tank mixes",
            chemical: "Weedicides",
            reasonEn: "Causes rapid foliar necrosis.",
            reasonHi: "खरपतवारनाशी के साथ न मिलाएं।",
          },
        ],
      },
      {
        id: "quantis_potato",
        name: "Syngenta Quantis®",
        nameHi: "सिंजेंटा क्वांटिस (आलू कंद फुलाव व तनाव रक्षक)",
        category: "Tuber Bulking & Thermal Shock Biostimulant",
        categoryHi: "आलू कंद फुलाव व कड़ाके की ठंड रक्षक टॉनिक",
        activeIngredient: "Organic Carbon, Amino Acids, Potassium & Calcium",
        modeOfAction: "Stimulates tuber sucrose-to-starch synthase enzymes",
        doseAmount: 400,
        doseUnit: "ml",
        doseDisplay: "400 ml / acre",
        formulationType: "liquid",
        waterPerAcre: 200,
        costPerAcre: 480,
        rankScore: 91.2,
        efficacyPct: 88.0,
        timing: hi ? "कंद बनने की शुरुआत (40-50 दिन) व कंद फुलाव अवस्था में" : "Tuber initiation (40-50 DAS) and during tuber bulking phase",
        timingHi: "कंद बनने की शुरुआत व फुलाव अवस्था में",
        whyChoose: hi
          ? "आलू का आकार बड़ा और एकसमान करता है। कड़ाके की ठंड में पाले के असर से फसल को बचाता है।"
          : "Increases jumbo/table grade tuber percentage and protects against frost injury.",
        whyChooseHi: "आलू का आकार बड़ा करता है और पाले से बचाता है।",
        targetPests: ["Frost Shock", "Small Tuber Ratio", "Heat Bulking Arrest"],
        safeTankMix: [
          {
            name: "Syngenta Ridomil Gold®",
            chemical: "Fungicide",
            reasonEn: "Standard tank mix.",
            reasonHi: "रिडोमिल गोल्ड के साथ सुरक्षित।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Copper Oxychloride",
            chemical: "Copper fungicide",
            reasonEn: "Incompatible with amino acid peptides.",
            reasonHi: "कॉपर दवा के साथ न मिलाएं।",
          },
        ],
      },
    ];
  }

  // ── 10. ONION / PYAZ ───────────────────────────────────────────────────────
  if (cropKey === "onion") {
    return [
      {
        id: "amistar_onion",
        name: "Syngenta Amistar Top®",
        nameHi: "सिंजेंटा एमिस्टार टॉप (प्याज बैंगनी धब्बा रक्षक)",
        category: "Purple Blotch & Stemphylium Specialist Fungicide",
        categoryHi: "प्याज बैंगनी धब्बा (Purple Blotch) कवकनाशी",
        activeIngredient: "Azoxystrobin 18.2% + Difenoconazole 11.4% SC",
        modeOfAction: "Dual-systemic xylem translaminar fungicide stopping sporulation",
        doseAmount: 200,
        doseUnit: "ml",
        doseDisplay: "200 ml / acre",
        formulationType: "liquid",
        waterPerAcre: 150,
        costPerAcre: 680,
        rankScore: 96.0,
        efficacyPct: 93.5,
        timing: hi ? "पत्तियों पर बैंगनी/भूरे धब्बे (Purple Blotch) दिखते ही" : "At first sign of purple blotch or stemphylium blight on onion leaves",
        timingHi: "पत्तियों पर बैंगनी/भूरे धब्बे दिखते ही",
        whyChoose: hi
          ? "प्याज की पत्तियों को सूखने से बचाता है जिससे कंद (गांठ) पूरी बड़ी बनती है। भंडारण में प्याज सड़ने से रोकता है।"
          : "Protects onion leaf greenness ensuring maximum photosynthesis and long storage shelf-life.",
        whyChooseHi: "बैंगनी धब्बा रोग रोककर प्याज की गांठ बड़ी बनाता है।",
        targetPests: ["Purple Blotch (Alternaria porri)", "Stemphylium Leaf Blight", "Downy Mildew"],
        safeTankMix: [
          {
            name: "Syngenta Alika® ZC",
            chemical: "Thiamethoxam + Lambda",
            reasonEn: "Eradicates onion thrips while curing leaf blotch.",
            reasonHi: "प्याज के थ्रिप्स और फफूंद दोनों का एक साथ खात्मा।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Weedicides",
            chemical: "Oxyfluorfen",
            reasonEn: "Do not mix with post-emergence onion herbicides.",
            reasonHi: "खरपतवारनाशी के साथ न मिलाएं।",
          },
        ],
      },
      {
        id: "alika_onion",
        name: "Syngenta Alika® ZC",
        nameHi: "सिंजेंटा अलिका (प्याज थ्रिप्स रक्षक)",
        category: "Onion Thrips & Sucking Pest Knockdown",
        categoryHi: "प्याज थ्रिप्स का अचूक कीटनाशक",
        activeIngredient: "Thiamethoxam 12.6% + Lambda-cyhalothrin 9.5% ZC",
        modeOfAction: "Systemic + Quick contact knockdown (IRAC 4A + 3A)",
        doseAmount: 80,
        doseUnit: "ml",
        doseDisplay: "80 ml / acre",
        formulationType: "liquid",
        waterPerAcre: 150,
        costPerAcre: 560,
        rankScore: 93.0,
        efficacyPct: 92.0,
        timing: hi ? "प्याज की पत्तियों की संधि में पीले/सफेद थ्रिप्स दिखते ही" : "At first sign of thrips hiding between inner leaf sheaths",
        timingHi: "पत्तियों में थ्रिप्स दिखते ही",
        whyChoose: hi
          ? "प्याज की पत्तियों का रस चूसने वाले थ्रिप्स का तत्काल सफाया। पत्तियां चांदी जैसी सफेद होने से बचाता है।"
          : "Penetrates tight onion leaf sheaths providing fast knockdown of resistant thrips.",
        whyChooseHi: "प्याज की पत्तियों का रस चूसने वाले थ्रिप्स का तत्काल सफाया।",
        targetPests: ["Onion Thrips (Thrips tabaci)", "Maggots", "Cutworms"],
        safeTankMix: [
          {
            name: "Syngenta Amistar Top®",
            chemical: "Fungicide",
            reasonEn: "Standard tank mix.",
            reasonHi: "एमिस्टार टॉप के साथ सुरक्षित मिश्रण।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Alkaline Spray Mixes",
            chemical: "High pH solutions",
            reasonEn: "Breaks down formulation.",
            reasonHi: "क्षारीय पानी में न घोलें।",
          },
        ],
      },
    ];
  }

  // ── 11. MUSTARD / SARSON ───────────────────────────────────────────────────
  if (cropKey === "mustard") {
    return [
      {
        id: "alika_mustard",
        name: "Syngenta Alika® ZC / Actara®",
        nameHi: "सिंजेंटा अलिका / एक्टारा (सरसों माहू/चेपा रक्षक)",
        category: "Mustard Aphid (Mahu) Eradication Insecticide",
        categoryHi: "सरसों माहू (चेपा) नाशक कीटनाशक",
        activeIngredient: "Thiamethoxam 12.6% + Lambda-cyhalothrin 9.5% ZC",
        modeOfAction: "Systemic vascular action suffocating aphid colonies instantly (IRAC 4A + 3A)",
        doseAmount: 80,
        doseUnit: "ml",
        doseDisplay: "80 ml / acre",
        formulationType: "liquid",
        waterPerAcre: 150,
        costPerAcre: 540,
        rankScore: 96.5,
        efficacyPct: 95.0,
        timing: hi ? "दिसंबर-जनवरी में सरसों की बालियों पर माहू (चेपा) दिखते ही" : "At first aphid colony on flower twigs during cloudy winter weather",
        timingHi: "सरसों की बालियों पर माहू (चेपा) दिखते ही",
        whyChoose: hi
          ? "सरसों की बालियों का रस चूसने वाले माहू (चेपा) का 100% सफाया। फलियों में तेल की मात्रा और दाना वजन सुरक्षित रखता है।"
          : "Wipes out dense mustard aphid colonies, protecting seed oil content and test weight.",
        whyChooseHi: "माहू (चेपा) का 100% सफाया और तेल की मात्रा सुरक्षित।",
        targetPests: ["Mustard Aphid (Lipaphis erysimi - Mahu)", "Sawfly", "Painted Bug"],
        safeTankMix: [
          {
            name: "Syngenta Quantis®",
            chemical: "Biostimulant",
            reasonEn: "Protects flowers from winter frost shock.",
            reasonHi: "कड़ाके की सर्दी व पाले से फूलों को बचाता है।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Copper Fungicides",
            chemical: "Copper based products",
            reasonEn: "Causes flower desiccation.",
            reasonHi: "फूलों को सुखा सकता है।",
          },
        ],
      },
      {
        id: "amistar_mustard",
        name: "Syngenta Amistar® 25 SC",
        nameHi: "सिंजेंटा एमिस्टार (सरसों सफेद रतुआ रक्षक)",
        category: "White Rust & Alternaria Blight Specialist",
        categoryHi: "सरसों सफेद रतुआ व पत्ती झुलसा कवकनाशी",
        activeIngredient: "Azoxystrobin 25% SC",
        modeOfAction: "Strobilurin mitochondrial respiration block keeping leaves clean",
        doseAmount: 200,
        doseUnit: "ml",
        doseDisplay: "200 ml / acre",
        formulationType: "liquid",
        waterPerAcre: 150,
        costPerAcre: 560,
        rankScore: 92.0,
        efficacyPct: 91.5,
        timing: hi ? "पत्तियों के नीचे सफेद फफोले (White Rust) दिखते ही" : "At first white pustule of White Rust on lower leaf surface",
        timingHi: "पत्तियों के नीचे सफेद फफोले दिखते ही",
        whyChoose: hi
          ? "सरसों में सफेद रतुआ (White Rust) और अल्टरनेरिया झुलसा को रोकता है। फलियों को विकृत होने से बचाता है।"
          : "Stops White Rust from deforming flowering twigs into stagheads.",
        whyChooseHi: "सफेद रतुआ व झुलसा रोककर फलियों को मजबूत बनाता है।",
        targetPests: ["White Rust (Albugo candida)", "Alternaria Blight", "Downy Mildew"],
        safeTankMix: [
          {
            name: "Syngenta Alika® ZC",
            chemical: "Insecticide",
            reasonEn: "Combined aphid and rust defense.",
            reasonHi: "माहू व रतुआ दोनों से एक साथ सुरक्षा।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Alkaline washes",
            chemical: "High pH",
            reasonEn: "Degrades formulation.",
            reasonHi: "क्षारीय पानी से बचें।",
          },
        ],
      },
    ];
  }

  // ── 12. SUGARCANE / GANNA ──────────────────────────────────────────────────
  if (cropKey === "sugarcane") {
    return [
      {
        id: "virtako_cane",
        name: "Syngenta Virtako® / Actara®",
        nameHi: "सिंजेंटा विरताको (गन्ना कंसा व दीमक रक्षक)",
        category: "Early Shoot Borer & Termite Soil Protection",
        categoryHi: "गन्ना कंसा (Shoot Borer) व दीमक दानेदार रक्षक",
        activeIngredient: "Thiamethoxam 1% + Chlorantraniliprole 0.5% GR",
        modeOfAction: "Soil systemic uptake through cane sett roots providing 45-day protection",
        doseAmount: 4,
        doseUnit: "kg",
        doseDisplay: "4 kg / acre",
        formulationType: "granule",
        waterPerAcre: 0,
        costPerAcre: 950,
        rankScore: 96.0,
        efficacyPct: 94.0,
        timing: hi ? "बुआई के समय खूड़ (Furrow) में डालें या पहले पानी पर" : "Soil incorporation at planting or along cane rows before earthing up",
        timingHi: "बुआई के समय खूड़ में डालें या पहले पानी पर",
        whyChoose: hi
          ? "गन्ने में कंसा (Early Shoot Borer), दीमक और सफेद लट (White Grub) का जड़ से सफाया। गन्ने का फुटाव व कल्ले बढ़ाता है।"
          : "Prevents dead hearts during tillering, boosting millable cane count per acre.",
        whyChooseHi: "कंसा, दीमक व सफेद लट का जड़ से सफाया कर कल्ले बढ़ाता है।",
        targetPests: ["Early Shoot Borer", "Termites", "White Grub", "Top Borer"],
        safeTankMix: [
          {
            name: "Urea / DAP fertilizer",
            chemical: "Basal Fertilizer",
            reasonEn: "Broadcast together in furrow.",
            reasonHi: "खाद के साथ मिलाकर खूड़ में डालें।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Foliar sprays",
            chemical: "Liquids",
            reasonEn: "Granular product for soil application only.",
            reasonHi: "स्प्रे में न घोलें, केवल मिट्टी में डालें।",
          },
        ],
      },
      {
        id: "amistar_cane",
        name: "Syngenta Amistar® 25 SC",
        nameHi: "सिंजेंटा एमिस्टार (गन्ना रेड रॉट व स्मट रक्षक)",
        category: "Red Rot & Smut Suppression Fungicide",
        categoryHi: "गन्ना लाल सड़न (Red Rot) व कंडुआ रक्षक कवकनाशी",
        activeIngredient: "Azoxystrobin 25% SC",
        modeOfAction: "Systemic xylem vascular protection suppressing Colletotrichum inside cane stalk",
        doseAmount: 250,
        doseUnit: "ml",
        doseDisplay: "250 ml / acre",
        formulationType: "liquid",
        waterPerAcre: 200,
        costPerAcre: 620,
        rankScore: 90.0,
        efficacyPct: 89.5,
        timing: hi ? "वर्षाकाल में या गन्ने की पत्तियों पर लाल धारियां दिखते ही" : "Monsoon humidity surge or at initial foliar symptom of red rot",
        timingHi: "वर्षाकाल में या लाल धारियां दिखते ही",
        whyChoose: hi
          ? "गन्ने की सबसे घातक बीमारी रेड रॉट (लाल सड़न) को रोकता है। गन्ने के अंदर सुक्रोज (चीनी) की मात्रा सुरक्षित रखता है।"
          : "Suppresses vascular red rot and smut infection, preserving juice sucrose recovery.",
        whyChooseHi: "लाल सड़न रोककर गन्ने में चीनी की रिकवरी बचाता है।",
        targetPests: ["Red Rot (Colletotrichum falcatum)", "Smut", "Wilt"],
        safeTankMix: [
          {
            name: "Syngenta Isabion®",
            chemical: "Biostimulant",
            reasonEn: "Accelerates cane internode elongation.",
            reasonHi: "गन्ने की पोरियों की लंबाई व मोटाई बढ़ाता है।",
          },
        ],
        prohibitedTankMix: [
          {
            name: "Alkaline washes",
            chemical: "High pH chemicals",
            reasonEn: "Incompatible formulation.",
            reasonHi: "क्षारीय रसायनों से बचें।",
          },
        ],
      },
    ];
  }

  // ── DEFAULT / UNIVERSAL SCIENTIFIC FALLBACK ────────────────────────────────
  return [
    {
      id: "isabion_universal",
      name: "Syngenta Isabion®",
      nameHi: "सिंजेंटा इसाबियन (Isabion®)",
      category: "Universal Amino Acid & Peptide Bio-Nutrient",
      categoryHi: "सार्वभौमिक अमीनो एसिड व पेप्टाइड जैव-पोषक",
      activeIngredient: "62.5% Pure Amino Acids + Naturally Derived Animal Peptides",
      modeOfAction: "Direct peptide absorption boosting chlorophyll, root vigor & abiotic stress resilience",
      doseAmount: 400,
      doseUnit: "ml",
      doseDisplay: "400 ml / acre",
      formulationType: "liquid",
      waterPerAcre: 150,
      costPerAcre: 460,
      rankScore: 94.0,
      efficacyPct: 91.0,
      timing: hi ? "वानस्पतिक विकास (Vegetative) व फूल आने की अवस्था में" : "Active vegetative and pre-bloom flowering stages",
      timingHi: "वानस्पतिक विकास व फूल आने की अवस्था में",
      whyChoose: hi
        ? "सभी फसलों में तनाव सहनशीलता, फुटाव व फूल-फलों की संख्या बढ़ाता है। फसल में गहरा हरापन लाता है।"
        : "Universal bio-stimulant proven across 40+ field trials in India for yield enhancement.",
      whyChooseHi: "तनाव सहनशीलता व फूल-फलों की संख्या बढ़ाता है।",
      targetPests: ["Abiotic Climate Stress", "Nutrient Deficiency", "Flower Drop"],
      safeTankMix: [
        {
          name: "Syngenta Amistar Top®",
          chemical: "Fungicide",
          reasonEn: "Synergistic disease prevention and growth promotion.",
          reasonHi: "रोग रोकथाम व फसल वृद्धि दोनों एक साथ।",
        },
        {
          name: "Chelated Micronutrients",
          chemical: "Trace Minerals",
          reasonEn: "Accelerates foliar mineral absorption.",
          reasonHi: "पोषक तत्वों का अवशोषण तेज करता है।",
        },
      ],
      prohibitedTankMix: [
        {
          name: "Copper Oxychloride (COC)",
          chemical: "Copper fungicide",
          reasonEn: "Precipitates organic amino peptides.",
          reasonHi: "अमीनो एसिड को जमा देता है।",
        },
      ],
    },
    {
      id: "quantis_universal",
      name: "Syngenta Quantis®",
      nameHi: "सिंजेंटा क्वांटिस (Quantis®)",
      category: "Extreme Thermal & Drought Stress Osmoprotectant",
      categoryHi: "अत्यधिक गर्मी व सूखा तनाव रक्षक बायोस्टिमुलेंट",
      activeIngredient: "Organic Carbon, Free Proline, Potassium & Calcium",
      modeOfAction: "Cellular osmotic pressure balancing and heat shock protein activation",
      doseAmount: 250,
      doseUnit: "ml",
      doseDisplay: "250 ml / acre",
      formulationType: "liquid",
      waterPerAcre: 150,
      costPerAcre: 420,
      rankScore: 92.5,
      efficacyPct: 89.5,
      timing: hi ? "शाम के समय — तेज धूप व गर्मी के दिनों में" : "Late afternoon during periods of high temperature (>34°C)",
      timingHi: "शाम के समय — तेज धूप व गर्मी में",
      whyChoose: hi
        ? "तेज गर्मी और सूखे में फसल को मुरझाने से बचाता है और पैदावार का नुकसान रोकता है।"
        : "Maintains stomatal conductance and prevents pollen abortion during severe heat waves.",
      whyChooseHi: "तेज गर्मी व सूखे में फसल को मुरझाने से बचाता है।",
      targetPests: ["Heat Abscission", "Drought Desiccation", "VPD Stress"],
      safeTankMix: [
        {
          name: "Syngenta Ampligo®",
          chemical: "Insecticide",
          reasonEn: "Safe tank mix.",
          reasonHi: "कीटनाशक के साथ सुरक्षित।",
        },
      ],
      prohibitedTankMix: [
        {
          name: "Sulfur WP",
          chemical: "Wettable sulfur",
          reasonEn: "Leaf burn above 32°C.",
          reasonHi: "32°C से ऊपर न मिलाएं।",
        },
      ],
    },
    {
      id: "amistar_universal",
      name: "Syngenta Amistar Top®",
      nameHi: "सिंजेंटा एमिस्टार टॉप (Amistar Top®)",
      category: "Broad-Spectrum Preventive Systemic Fungicide",
      categoryHi: "व्यापक फफूंद व झुलसा रोधी कवकनाशी",
      activeIngredient: "Azoxystrobin 18.2% + Difenoconazole 11.4% SC",
      modeOfAction: "Dual translaminar and acropetal protection against Ascomycetes and Basidiomycetes",
      doseAmount: 200,
      doseUnit: "ml",
      doseDisplay: "200 ml / acre",
      formulationType: "liquid",
      waterPerAcre: 150,
      costPerAcre: 680,
      rankScore: 89.0,
      efficacyPct: 91.0,
      timing: hi ? "रोग के लक्षण दिखने से पहले या शुरुआत में ही" : "Preventive application or at first sign of fungal infection",
      timingHi: "रोग के लक्षण दिखने से पहले या शुरुआत में",
      whyChoose: hi
        ? "पत्ती धब्बा, झुलसा व फफूंद जनित रोगों से संपूर्ण सुरक्षा।"
        : "Protects crop foliage, extending active photosynthetic lifespan.",
      whyChooseHi: "पत्ती धब्बा व झुलसा से सम्पूर्ण सुरक्षा।",
      targetPests: ["Leaf Spot", "Blight", "Powdery Mildew", "Rust"],
      safeTankMix: [
        {
          name: "Syngenta Isabion®",
          chemical: "Biostimulant",
          reasonEn: "Greening synergy.",
          reasonHi: "हरापन व सुरक्षा दोनों।",
        },
      ],
      prohibitedTankMix: [
        {
          name: "Alkaline Water",
          chemical: "High pH",
          reasonEn: "Degrades active chemical.",
          reasonHi: "क्षारीय पानी में न मिलाएं।",
        },
      ],
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Prescription Component
// ─────────────────────────────────────────────────────────────────────────────
export default function PrescriptionCategoryPage() {
  const { language } = useLanguage();
  const isHindi = language === "hi";

  // Single Source of Truth: FarmContext
  const { activeFarm, farms, selectFarm } = useFarm();

  // Pipeline ML Telemetry & Risk Data
  const {
    data: pipelineData,
    loading: pipelineLoading,
    error: pipelineError,
    refetch: refetchPipeline,
    isSpeaking,
    speakSummary: speakPipelineSummary,
    stopSpeaking,
  } = usePipelinePrediction();

  // Active Farm Grounded Fields
  const rawCrop = activeFarm?.primaryCrop || "Soybean";
  const cropVariety = activeFarm?.cropVariety || "High Yield Certified";
  const acres = Number(activeFarm?.areaAcres || 5.0);
  const district = activeFarm?.district || "Bhopal";
  const state = activeFarm?.state || "Madhya Pradesh";
  const farmName = activeFarm?.name || "Main Acreage";
  const growthStage = activeFarm?.growthStage || "Flowering & Pod Formation";
  const soilType = activeFarm?.soilType || "Black Cotton Vertisol";
  const sowingDate = activeFarm?.sowingDate || "2026-06-15";

  // Normalize Crop Name for Title & Lookup
  const normalizedCrop = useMemo(() => normalizeCrop(rawCrop), [rawCrop]);

  // Syngenta Product Catalog for Active Crop
  const productOptions = useMemo(
    () => getCropSolutions(normalizedCrop.key, isHindi ? "hi" : "en"),
    [normalizedCrop.key, isHindi]
  );

  // Selected Product Index (defaults to Primary #1)
  const [selectedProductIdx, setSelectedProductIdx] = useState<number>(0);

  // Reset to Primary product when farm or crop changes
  useEffect(() => {
    setSelectedProductIdx(0);
  }, [activeFarm.id, normalizedCrop.key]);

  // Support direct routing from Diagnostics Biotic Issue Reporter (?pest=...)
  useEffect(() => {
    if (typeof window !== "undefined" && productOptions.length > 0) {
      const pestParam = new URLSearchParams(window.location.search).get("pest");
      if (pestParam) {
        const matchIdx = productOptions.findIndex((prod) => {
          const nameLower = (prod.name || "").toLowerCase();
          const targetLower = (prod.targetPests || []).join(" ").toLowerCase();
          if (pestParam === "chewed_leaves" && (nameLower.includes("ampligo") || nameLower.includes("alika") || targetLower.includes("caterpillar") || targetLower.includes("borer"))) return true;
          if (pestParam === "fungal_rust" && (nameLower.includes("ridomil") || nameLower.includes("amistar") || targetLower.includes("rust") || targetLower.includes("blight"))) return true;
          if (pestParam === "weed_choke" && (nameLower.includes("fusiflex") || nameLower.includes("axial") || targetLower.includes("weed"))) return true;
          if (pestParam === "viral_mosaic" && (nameLower.includes("chess") || nameLower.includes("alika") || targetLower.includes("whitefly"))) return true;
          return false;
        });
        if (matchIdx >= 0) {
          setSelectedProductIdx(matchIdx);
        }
      }
    }
  }, [productOptions]);

  const activeProduct = productOptions[selectedProductIdx] || productOptions[0];

  // Tank-Mix view tab: "safe" or "prohibited"
  const [tankMixTab, setTankMixTab] = useState<"safe" | "prohibited">("safe");
  // What-If Simulation Scenario: 0: On-Time (0-48h), 1: Delayed (3-5d), 2: No Action (Untreated)
  const [whatIfScenario, setWhatIfScenario] = useState<number>(0);
  // Spray confirmation state
  const [sprayConfirmed, setSprayConfirmed] = useState<boolean>(false);

  // Synchronize spray confirmation with LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`aasra_spray_confirmed_${activeFarm.id}`);
      setSprayConfirmed(saved === "true");
    } catch {}
  }, [activeFarm.id]);

  const handleConfirmSpray = () => {
    setSprayConfirmed(true);
    try {
      localStorage.setItem(`aasra_spray_confirmed_${activeFarm.id}`, "true");
      localStorage.setItem(`aasra_spray_timestamp_${activeFarm.id}`, new Date().toISOString());
      localStorage.setItem("aasra_spray_confirmed", "true");
    } catch {}
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Dynamic Scientific Calculations for Active Farm Acreage & Crop
  // ───────────────────────────────────────────────────────────────────────────
  // 1. Packaging & Dosage
  const doseCalc = useMemo(
    () => calculateDoseAndPacks(activeProduct.doseAmount, activeProduct.doseUnit, acres),
    [activeProduct, acres]
  );

  // 2. Water & Sprayer Tanks
  const waterPerAcre = activeProduct.waterPerAcre;
  const totalWaterLiters = Math.round(waterPerAcre * acres);
  const knapsackTanks = waterPerAcre > 0 ? Math.ceil(totalWaterLiters / 15) : 0;
  const dosePer15LTank =
    waterPerAcre > 0
      ? Math.round((activeProduct.doseAmount / (waterPerAcre / 15)) * 10) / 10
      : 0;

  // 3. Product Financial Cost
  const totalProductCost = Math.round(activeProduct.costPerAcre * acres);

  // 4. Live APMC Mandi Rate
  const liveMandi = useMemo(
    () => findCropMandiRate(rawCrop, district, state),
    [rawCrop, district, state]
  );
  const mandiPrice = liveMandi.modalPrice;

  // 5. Scientific Yield Estimation Engine
  const yieldEst = useMemo(
    () =>
      predictCropYield({
        crop: rawCrop,
        variety: cropVariety,
        acreage: acres,
        soilType: soilType,
        irrigationType: activeFarm?.irrigationType || "Rainfed",
        sowingDate: sowingDate,
        mandiPricePerQtl: mandiPrice,
      }),
    [rawCrop, cropVariety, acres, soilType, activeFarm?.irrigationType, sowingDate, mandiPrice]
  );

  const baselinePotentialQtlAcre = yieldEst.baselineGeneticPotentialQtlPerAcre;
  const causalGainQtlAcre = yieldEst.yieldGainFromInterventionQtlPerAcre;
  const totalQuintalsProtected = +(causalGainQtlAcre * acres).toFixed(1);
  const totalGrossProtectedCash = Math.round(totalQuintalsProtected * mandiPrice);
  const netProfitOnTime = Math.round(totalGrossProtectedCash - totalProductCost);
  const robiMultiplier =
    totalProductCost > 0
      ? (totalGrossProtectedCash / totalProductCost).toFixed(1) + "x"
      : "6.2x";

  // 6. What-If Scenarios
  const scenarioDelayedGross = Math.round(totalGrossProtectedCash * 0.45);
  const scenarioDelayedProfit = Math.round(scenarioDelayedGross - totalProductCost);
  const scenarioDelayedLoss = Math.round(totalGrossProtectedCash * 0.55);
  const scenarioNoActionLoss = totalGrossProtectedCash;

  // 7. Biophysical Weather Spray Safety
  const deltaT = pipelineData?.model2_readiness?.delta_t || 3.8;
  const spraySafe = pipelineData?.model2_readiness?.spray_window_safe ?? true;

  // 8. Farmer-First Natural Language Advisory (No AI Slop / No Jargon)
  const farmerWhy = useMemo(
    () =>
      generateFarmerWhyExplanation({
        cropName: isHindi ? normalizedCrop.nameHi : normalizedCrop.nameEn,
        cropKey: normalizedCrop.key,
        growthStage,
        productName: isHindi ? activeProduct.nameHi : activeProduct.name,
        productCategory: isHindi ? activeProduct.categoryHi : activeProduct.category,
        activeIngredient: activeProduct.activeIngredient,
        targetPests: activeProduct.targetPests,
        tempMax: pipelineData?.telemetry_summary?.temp_max_c || 35,
        isHindi,
      }),
    [normalizedCrop, growthStage, activeProduct, pipelineData?.telemetry_summary?.temp_max_c, isHindi]
  );

  const farmerHow = useMemo(
    () =>
      generateFarmerHowExplanation({
        productName: isHindi ? activeProduct.nameHi : activeProduct.name,
        doseDisplay: activeProduct.doseDisplay,
        acres,
        totalWaterLiters,
        knapsackTanks,
        dosePerTank: dosePer15LTank,
        doseUnit: activeProduct.doseUnit,
        timingEn: activeProduct.timing,
        timingHi: activeProduct.timingHi,
        isHindi,
      }),
    [activeProduct, acres, totalWaterLiters, knapsackTanks, dosePer15LTank, isHindi]
  );

  const soilGuidance = useMemo(
    () => getSoilTypePersonalization(soilType),
    [soilType]
  );

  const culturalAdvisory = useMemo(
    () =>
      getGeneralCulturalRecommendations({
        cropKey: normalizedCrop.key,
        growthStage,
        tempMax: pipelineData?.telemetry_summary?.temp_max_c || 35,
        rainProb: pipelineData?.telemetry_summary?.rain_prob_next_48h || 10,
        soilTypeRaw: soilType,
        isHindi,
      }),
    [normalizedCrop.key, growthStage, pipelineData?.telemetry_summary?.temp_max_c, pipelineData?.telemetry_summary?.rain_prob_next_48h, soilType, isHindi]
  );

  // Multilingual Speech Readout
  const handleListenPrescription = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      return;
    }

    const firstWhy = isHindi ? farmerWhy.linesHi[0] : farmerWhy.linesEn[0];
    const textToSpeak = isHindi
      ? `राम-राम किसान भाई! आपके ${acres} एकड़ खेत में ${normalizedCrop.nameHi} के लिए अनुशंसित दवा ${activeProduct.nameHi} है। ${firstWhy} आपके खेत के लिए कुल मात्रा ${doseCalc.totalDisplay} है। लगभग ${knapsackTanks} पंप पानी में घोलकर सुबह या शाम छिड़कें।`
      : `Hello! For your ${acres} acres of ${normalizedCrop.nameEn}, recommended solution is ${activeProduct.name}. Total required dosage is ${doseCalc.totalDisplay} mixed across ~${knapsackTanks} sprayer tanks. Apply during morning or evening hours for maximum yield protection.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = isHindi ? "hi-IN" : "en-IN";
    utterance.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [
    isHindi,
    isSpeaking,
    acres,
    normalizedCrop,
    activeProduct,
    doseCalc,
    knapsackTanks,
    farmerWhy,
  ]);

  return (
    <AppShell>
      {/* ── Outer Canvas with Exact Dashboard Dot Matrix Theme ────── */}
      <div className="relative min-h-screen bg-[#fbfcf8] bg-[radial-gradient(#1b4332_0.75px,transparent_0.75px)] [background-size:24px_24px] [background-position:0_0] text-slate-800 pb-24 md:pb-12">
        <div className="max-w-[1240px] w-full mx-auto px-3.5 sm:px-6 py-5 sm:py-10 space-y-5 sm:space-y-8 font-sans">
          
          {/* Navigation Breadcrumbs & Field Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 border-b border-[#e8ede4] pb-5 sm:pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium flex-wrap">
                <Link
                  href="/plant-intelligence"
                  className="hover:text-[#1b4332] flex items-center gap-1 transition-colors text-slate-600 font-semibold"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>{isHindi ? "पादप स्वास्थ्य हब" : "Plant Intelligence"}</span>
                </Link>
                <span>/</span>
                <span className="text-[#11261f] font-bold">
                  {isHindi ? "2 & 3. उत्पाद सिफारिश, टैंक-मिक्स व छिड़काव समय सारणी" : "2 & 3. Product, Tank-Mix & Timeline"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black font-display text-[#11261f] tracking-tight flex items-center gap-2.5">
                <FlaskConical className="h-7 w-7 text-[#2d6a4f] shrink-0" />
                <span>
                  {isHindi
                    ? `उत्पाद सिफारिश व छिड़काव सारणी — ${normalizedCrop.nameHi}`
                    : `Crop Solutions & Application Timeline — ${normalizedCrop.nameEn}`}
                </span>
              </h1>
              
              {/* Grounding Chips Strip */}
              <div className="text-xs sm:text-sm text-slate-600 font-medium flex items-center gap-2 flex-wrap pt-1">
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#e8ede4] text-slate-700">
                  <MapPin className="h-3.5 w-3.5 text-[#2d6a4f] shrink-0" />
                  <span>{district}{state ? `, ${state}` : ""}, India</span>
                </span>
                <span className="bg-white px-2.5 py-1 rounded-lg border border-[#e8ede4] text-slate-700 font-semibold">
                  {acres} Acres
                </span>
                <span className="bg-[#e8f5e9] px-2.5 py-1 rounded-lg border border-[#cbe5cb] text-[#1b4332] font-bold flex items-center gap-1">
                  <Sprout className="h-3 w-3 text-[#2d6a4f]" />
                  <span>{normalizedCrop.nameEn}</span>
                </span>
                <span className="bg-[#f0f5ee] px-2.5 py-1 rounded-lg border border-[#d9e6d4] text-slate-700 font-semibold">
                  {growthStage}
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-[#e8f5e9] px-2.5 py-1 rounded-full border border-[#cbe5cb] flex items-center gap-1">
                  <Cloud className="h-3 w-3 text-emerald-700 shrink-0" />
                  <span>{pipelineData?.execution_source || "Vertex AI Cloud (asia-south1, iitm01)"}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
              <FarmCropSwitcher allowRegister={false} />

              <button
                type="button"
                onClick={handleListenPrescription}
                className="px-3.5 py-2.5 text-xs font-bold rounded-2xl border border-[#cbe5cb] bg-[#e8f5e9] hover:bg-[#d8edd9] text-[#1b4332] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs min-h-[40px]"
              >
                {isSpeaking ? <VolumeX className="h-4 w-4 text-rose-600" /> : <Volume2 className="h-4 w-4 text-[#2d6a4f]" />}
                <span>{isSpeaking ? (isHindi ? "रोकें" : "Stop") : (isHindi ? "बोलकर सुनें" : "Listen")}</span>
              </button>
              <button
                type="button"
                onClick={() => refetchPipeline()}
                disabled={pipelineLoading}
                className="p-2.5 text-xs font-bold rounded-2xl border border-[#e8ede4] bg-white hover:bg-[#f0f5ee] text-slate-700 transition-all flex items-center justify-center cursor-pointer shadow-2xs disabled:opacity-50 min-h-[40px] min-w-[40px]"
                title="Refresh Pipeline Inference"
                aria-label="Refresh Pipeline Inference"
              >
                <RefreshCw className={`h-4 w-4 ${pipelineLoading ? "animate-spin text-[#2d6a4f]" : "text-[#2d6a4f]"}`} />
              </button>
            </div>
          </div>

          {/* ── 1. PRIMARY & ALTERNATIVE PRODUCTS SELECTOR ──────── */}
          <div className="bg-white/95 backdrop-blur-md border border-[#e8ede4] rounded-3xl p-5 sm:p-7 shadow-[0_4px_24px_rgba(27,67,50,0.04)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#2d6a4f]" />
                  <h2 className="text-lg sm:text-xl font-black text-[#11261f] font-display">
                    {isHindi
                      ? `${normalizedCrop.nameHi} हेतु अनुशंसित सिंजेंटा क्रॉपफिट उत्पाद`
                      : `Syngenta CropFit Solution Selection for ${normalizedCrop.nameEn}`}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isHindi
                    ? "मॉडल 3 द्वारा रैंक किया गया। यदि प्राथमिक उत्पाद डीलर के पास न मिले, तो नीचे दिए गए 2-3 वैकल्पिक उत्पाद चुनें।"
                    : "Ranked by Model 3. If primary product is unavailable locally, select verified alternatives below."}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-[#1b4332] bg-[#e8f5e9] px-3 py-1 rounded-xl border border-[#cbe5cb]">
                  {acres} Acres Grounded · {district}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  ₹{mandiPrice}/qtl ({liveMandi.commodity})
                </span>
              </div>
            </div>

          {/* Product Toggle Tabs (Primary + Alternatives) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {productOptions.map((prod, idx) => {
              const isSelected = selectedProductIdx === idx;
              return (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => setSelectedProductIdx(idx)}
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? "bg-[#e8f5e9] border-[#2d6a4f] ring-2 ring-[#2d6a4f]/20 shadow-xs"
                      : "bg-[#fbfcf8] hover:bg-[#f0f5ee] border-[#e8ede4]"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          idx === 0
                            ? "bg-[#1b4332] text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {idx === 0
                          ? isHindi
                            ? "प्राथमिक #1"
                            : "PRIMARY #1"
                          : isHindi
                          ? `वैकल्पिक #${idx}`
                          : `ALTERNATIVE #${idx}`}
                      </span>
                      <span className="text-[11px] font-mono font-black text-[#2d6a4f]">
                        {prod.rankScore} Score
                      </span>
                    </div>
                    <span className="text-base font-extrabold text-[#11261f] block font-display mt-1">
                      {isHindi ? prod.nameHi : prod.name}
                    </span>
                    <span className="text-[11px] text-slate-600 block leading-snug line-clamp-2">
                      {isHindi ? prod.categoryHi : prod.category}
                    </span>
                  </div>

                  <div className="text-xs font-mono pt-2 border-t border-[#e8ede4] flex items-center justify-between text-slate-700">
                    <span className="font-bold">{prod.doseDisplay}</span>
                    <span className="text-[#2d6a4f] font-bold">{prod.efficacyPct}% Efficacy</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── 1. ACTIVE PRODUCT: WHY, HOW, PERSONALIZED DOSAGE & GENERAL ADVISORY ── */}
          <div className="p-5 sm:p-7 rounded-3xl bg-[#f8faf7] border border-[#e8ede4] shadow-xs space-y-6">
            
            {/* Header: Product Identity & Personalized Dosage by Field Size + Soil Type */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-[#e8ede4]">
              
              {/* Left Column: Solution Identity & Plain Layman Translation */}
              <div className="space-y-2.5 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-extrabold text-[#1b4332] bg-[#e8f5e9] px-2.5 py-0.5 rounded-full border border-[#cbe5cb] uppercase tracking-wider">
                    {isHindi ? "अनुशंसित पौध समाधान" : "RECOMMENDED FIELD SOLUTION"}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    {isHindi ? activeProduct.categoryHi : activeProduct.category}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-[#11261f] font-display tracking-tight flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-[#2d6a4f] shrink-0" />
                  <span>{isHindi ? activeProduct.nameHi : activeProduct.name}</span>
                </h3>

                {/* Plain-Language Layman Translation Note */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#e8ede4] text-xs space-y-1.5">
                  <div className="text-slate-600">
                    <span className="font-bold text-slate-800">{isHindi ? "दवा का घटक (Composition):" : "Active Composition:"}</span>{" "}
                    <span className="font-mono text-[11px] text-slate-700">{activeProduct.activeIngredient}</span>
                  </div>
                  {(farmerWhy.jargonTranslationHi || farmerWhy.jargonTranslationEn) && (
                    <div className="text-emerald-900 font-medium pt-1.5 border-t border-slate-100 flex items-start gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#2d6a4f] shrink-0 mt-0.5" />
                      <span>{isHindi ? farmerWhy.jargonTranslationHi : farmerWhy.jargonTranslationEn}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Personalized Dosage Card (Field Size & Soil Type Grounded) */}
              <div className="bg-white p-5 rounded-2xl border border-[#cbe5cb] shadow-xs space-y-3 shrink-0 lg:max-w-md w-full">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <span className="text-[11px] uppercase font-extrabold text-[#1b4332] tracking-wider flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5 text-[#2d6a4f]" />
                    <span>{isHindi ? "आपके खेत व मिट्टी हेतु सही मात्रा" : "Personalized for Your Farm & Soil"}</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-[#e8f5e9] text-[#1b4332] px-2 py-0.5 rounded-full border border-[#cbe5cb]">
                    {acres} Acres
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">
                      {isHindi ? "कुल आवश्यक दवा:" : "Calculated Total Requirement:"}
                    </span>
                    <span className="text-3xl font-mono font-black text-[#1b4332] block tracking-tight">
                      {doseCalc.totalDisplay}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-medium block">
                      {isHindi ? "दुकान से पैक खरीदें:" : "Recommended Retail Pack:"}
                    </span>
                    <span className="text-sm font-extrabold text-[#2d6a4f] font-mono block">
                      {doseCalc.recommendedPacks}
                    </span>
                  </div>
                </div>

                {/* Mixing & Pump Summary */}
                <div className="text-xs text-slate-700 bg-[#fbfcf8] p-2.5 rounded-xl border border-[#e8ede4] flex items-center justify-between">
                  <span className="font-semibold">
                    {totalWaterLiters > 0
                      ? isHindi
                        ? `~${knapsackTanks} पंप (15L टैंक) पानी`
                        : `~${knapsackTanks} Sprayer Tanks (15L)`
                      : isHindi
                      ? "दानेदार छिटकाव"
                      : "Dry Granular Broadcast"}
                  </span>
                  <span className="font-mono font-bold text-[#1b4332]">
                    {totalWaterLiters > 0 ? `${dosePer15LTank} ${activeProduct.doseUnit} / ${isHindi ? "पंप" : "tank"}` : ""}
                  </span>
                </div>

                {/* Soil Guidance Note */}
                <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1">
                  <div className="flex items-center gap-1 font-bold text-slate-800">
                    <Sprout className="h-3.5 w-3.5 text-[#2d6a4f]" />
                    <span>{isHindi ? soilGuidance.soilLabelHi : soilGuidance.soilLabelEn}</span>
                  </div>
                  <p className="text-slate-600 leading-snug">
                    {isHindi ? soilGuidance.guidanceHi : soilGuidance.guidanceEn}
                  </p>
                </div>
              </div>
            </div>

            {/* ── 2 & 3: THE "WHY" AND "HOW" 2-COLUMN DISPLAY ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* THE "WHY" (यह दवा क्यों जरूरी है? - Max 3-4 lines, high trust) */}
              <div className="bg-[#fdfcf7] border border-[#e6ecd8] rounded-2xl p-5 shadow-2xs space-y-3.5">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-[#e8f5e9] flex items-center justify-center text-[#2d6a4f] shrink-0 border border-[#cbe5cb]">
                    <Lightbulb className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 block">
                      {isHindi ? "विश्वास व वैज्ञानिक कारण (WHY)" : "TRUST & AGRONOMIC REASONING (WHY)"}
                    </span>
                    <h4 className="text-base font-black text-[#11261f] font-display">
                      {isHindi ? farmerWhy.headlineHi : farmerWhy.headlineEn}
                    </h4>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
                  {(isHindi ? farmerWhy.linesHi : farmerWhy.linesEn).map((line, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="h-4 w-4 rounded-full bg-[#e8f5e9] text-[#1b4332] font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="flex-1 font-medium">{line}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* THE "HOW" (दवा का सही छिड़काव कैसे करें? - Max 4 clear practical steps) */}
              <div className="bg-[#f4f8f4] border border-[#d4e4d4] rounded-2xl p-5 shadow-2xs space-y-3.5">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-[#e8f5e9] flex items-center justify-center text-[#2d6a4f] shrink-0 border border-[#cbe5cb]">
                    <Droplets className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1b4332] block">
                      {isHindi ? "खेत में सही उपयोग (HOW)" : "FIELD APPLICATION GUIDE (HOW)"}
                    </span>
                    <h4 className="text-base font-black text-[#11261f] font-display">
                      {isHindi ? farmerHow.headlineHi : farmerHow.headlineEn}
                    </h4>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
                  {(isHindi ? farmerHow.stepsHi : farmerHow.stepsEn).map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="h-4 w-4 rounded-full bg-[#1b4332] text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <strong className="text-slate-900 block font-semibold">{step.title}</strong>
                        <p className="text-slate-600 font-medium">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4 Bottom Field Metrics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="p-3.5 rounded-xl bg-white border border-[#e8ede4] shadow-2xs">
                <span className="text-slate-400 font-mono text-[10px] uppercase block font-bold">
                  {isHindi ? "छिड़काव का सही समय" : "Application Timing"}
                </span>
                <span className="font-semibold text-slate-800 mt-1 block">
                  {isHindi ? activeProduct.timingHi : activeProduct.timing}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#e8ede4] shadow-2xs">
                <span className="text-slate-400 font-mono text-[10px] uppercase block font-bold">
                  {isHindi ? "नोजल व स्प्रे टैंक" : "Sprayer & Water Tanks"}
                </span>
                <span className="font-semibold text-slate-800 mt-1 block">
                  {totalWaterLiters > 0
                    ? `~${knapsackTanks} ${isHindi ? "पंप (15L टैंक)" : "Knapsack Tanks (15L)"} @ ${dosePer15LTank} ${activeProduct.doseUnit}/${isHindi ? "टैंक" : "tank"}`
                    : isHindi
                    ? "सीधा दानेदार छिड़काव (बिना पानी)"
                    : "Direct Granular Broadcast"}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#e8ede4] shadow-2xs">
                <span className="text-slate-400 font-mono text-[10px] uppercase block font-bold">
                  {isHindi ? "कुल उत्पाद खर्च" : "Estimated Product Cost"}
                </span>
                <span className="font-bold text-[#1b4332] mt-1 block font-mono text-sm">
                  ₹{totalProductCost.toLocaleString("en-IN")} (@ ₹{activeProduct.costPerAcre}/ac)
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#e8ede4] shadow-2xs">
                <span className="text-slate-400 font-mono text-[10px] uppercase block font-bold">
                  {isHindi ? "लक्षित कीट / रोग" : "Target Pests & Stresses"}
                </span>
                <span className="font-semibold text-slate-800 mt-1 block truncate">
                  {activeProduct.targetPests.join(", ")}
                </span>
              </div>
            </div>

            {/* ── iv. SEPARATE SQUARE BOX FOR GENERAL RECOMMENDATIONS (ZERO-COST CULTURAL PRACTICES) ── */}
            {culturalAdvisory && (
              <div className="mt-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#fbfcf8] via-[#f8faf7] to-[#eef5ee] border-2 border-[#cbe5cb] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#d9e8d9] pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-2xl bg-[#1b4332] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Sprout className="h-5 w-5 text-emerald-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-extrabold bg-[#e8f5e9] text-[#1b4332] px-2.5 py-0.5 rounded-full border border-[#cbe5cb] uppercase tracking-wider">
                          {isHindi ? "देसी खेत प्रबंधन • बिना किसी दवा खर्च के" : "ZERO-COST CULTURAL ADVISORY"}
                        </span>
                        <span className="text-[11px] text-emerald-800 font-semibold">
                          {isHindi ? "सामान्य कृषि सलाह" : "General Agronomic Practices"}
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-[#11261f] font-display mt-0.5">
                        {isHindi ? culturalAdvisory.headlineHi : culturalAdvisory.headlineEn}
                      </h4>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 font-medium sm:text-right">
                    {isHindi ? culturalAdvisory.subtitleHi : culturalAdvisory.subtitleEn}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  {(isHindi ? culturalAdvisory.practicesHi : culturalAdvisory.practicesEn).map((practice, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-4 rounded-2xl border border-[#e8ede4] hover:border-[#cbe5cb] transition-all shadow-2xs space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{practice.icon}</span>
                          <h5 className="font-extrabold text-sm text-[#11261f] font-display">
                            {practice.title}
                          </h5>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {practice.text}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>{isHindi ? "देसी तरीका" : "Field Habit"}</span>
                        <span className="text-emerald-700 font-bold">₹0 Cost</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 2. TANK-MIX COMPATIBILITY MATRIX ── */}
        <div className="bg-white border border-[#e3e8ee] rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-black text-[#0d253d] font-display">
                  {isHindi
                    ? `टैंक-मिक्स अनुकूलता मैट्रिक्स — ${activeProduct.name}`
                    : `Tank-Mix Compatibility Matrix for ${activeProduct.name}`}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isHindi
                  ? `${activeProduct.name} के साथ कौन सी दवा मिलाना सुरक्षित है और कौन सी सख्त मना है (सिंजेंटा प्रयोगशाला प्रमाणित)`
                  : `Certified Syngenta laboratory mixing matrix for ${activeProduct.name}`}
              </p>
            </div>

            {/* Safe vs Prohibited Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setTankMixTab("safe")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tankMixTab === "safe"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ✅ {isHindi ? "सुरक्षित मिश्रण (Safe)" : "Safe to Mix"}
              </button>
              <button
                type="button"
                onClick={() => setTankMixTab("prohibited")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tankMixTab === "prohibited"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ❌ {isHindi ? "सख्त मना (Prohibited)" : "Do NOT Mix"}
              </button>
            </div>
          </div>

          {/* Tank Mix Content */}
          {tankMixTab === "safe" ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-200">
              {activeProduct.safeTankMix.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-xs"
                >
                  <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 block">
                    {item.chemical}
                  </span>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    {isHindi ? item.reasonHi : item.reasonEn}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-200">
              {activeProduct.prohibitedTankMix.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-2 text-xs"
                >
                  <div className="flex items-center gap-1.5 text-rose-800 font-extrabold text-sm">
                    <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold text-rose-700 block">
                    {item.chemical}
                  </span>
                  <p className="text-rose-900 leading-relaxed text-[11px]">
                    {isHindi ? item.reasonHi : item.reasonEn}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* 1-Liter Jar Test Precaution Bar */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-extrabold text-amber-900 block">
                  {isHindi ? "छिड़काव से पहले 1-लीटर जार टेस्ट नियम" : "The 1-Litre Jar Test Precaution Rule"}
                </span>
                <span className="text-amber-800 text-[11px]">
                  {isHindi
                    ? "किसी भी दो दवाओं को बड़े ड्रम में मिलाने से पहले एक बोतल में थोड़ा पानी लेकर दोनों को मिलाएं। यदि 15 मिनट में घोल दूध की तरह फटे, तो कदापि न छिड़कें।"
                    : "Mix proportionate ratios in 1L clean water. Wait 15 mins. If clumping, precipitation, or heat occurs, DO NOT spray."}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-200/80 px-2.5 py-1 rounded-lg shrink-0">
              WALES Order: WP ➔ WG ➔ SC ➔ EC ➔ SL
            </span>
          </div>
        </div>

        {/* ── 3. DYNAMIC WHAT-IF SIMULATION BAR (MODEL 6 + REAL DATA) ─ */}
        <div className="bg-white border border-[#e3e8ee] rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-black text-[#0d253d] font-display">
                  {isHindi
                    ? `गतिशील 'क्या होगा यदि?' सिमुलेशन — ${normalizedCrop.nameHi}`
                    : `Dynamic What-If Intervention Simulation — ${normalizedCrop.nameEn}`}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isHindi
                  ? `मॉडल 6 (Double ML) व वास्तविक मंडी भाव (₹${mandiPrice}/क्विंटल) पर आधारित शुद्ध मुनाफा आकलन`
                  : `Calculated via Model 6 Double ML using your actual ${acres} acres and Mandi price (₹${mandiPrice}/qtl)`}
              </p>
            </div>

            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
              {liveMandi.mandi}: ₹{mandiPrice} / Qtl
            </span>
          </div>

          {/* Interactive Scenario Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setWhatIfScenario(0)}
              className={`p-4 rounded-2xl text-left border transition-all cursor-pointer space-y-1 ${
                whatIfScenario === 0
                  ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                  : "bg-white hover:bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  SCENARIO A
                </span>
                <span className="text-xs font-bold text-emerald-600">100% Protection</span>
              </div>
              <span className="text-sm font-black text-[#0d253d] block font-display">
                {isHindi ? "समय पर छिड़काव (0–48 घंटे)" : "On-Time Spray (0-48h)"}
              </span>
              <p className="text-[11px] text-slate-500 leading-snug">
                {isHindi ? "पूरी फसल सुरक्षित, अधिकतम अतिरिक्त लाभ" : "Full biophysical stress arrest, maximum harvest gain"}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setWhatIfScenario(1)}
              className={`p-4 rounded-2xl text-left border transition-all cursor-pointer space-y-1 ${
                whatIfScenario === 1
                  ? "bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 shadow-xs"
                  : "bg-white hover:bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  SCENARIO B
                </span>
                <span className="text-xs font-bold text-amber-600">45% Efficacy</span>
              </div>
              <span className="text-sm font-black text-[#0d253d] block font-display">
                {isHindi ? "देरी से छिड़काव (3–5 दिन बाद)" : "Delayed Spray (3-5 Days)"}
              </span>
              <p className="text-[11px] text-slate-500 leading-snug">
                {isHindi ? "आंशिक नुकसान पहले ही हो चुका होगा, सीमित रिकवरी" : "Partial permanent damage already occurred, lower gains"}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setWhatIfScenario(2)}
              className={`p-4 rounded-2xl text-left border transition-all cursor-pointer space-y-1 ${
                whatIfScenario === 2
                  ? "bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 shadow-xs"
                  : "bg-white hover:bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                  SCENARIO C
                </span>
                <span className="text-xs font-bold text-rose-600">0% Protection</span>
              </div>
              <span className="text-sm font-black text-[#0d253d] block font-display">
                {isHindi ? "कोई उपचार नहीं (लापरवाही)" : "No Action Taken (Untreated)"}
              </span>
              <p className="text-[11px] text-slate-500 leading-snug">
                {isHindi ? "तनाव से भारी नुकसान, मंडी में सीधा घाटा" : "Irreversible yield drop, heavy direct financial loss"}
              </p>
            </button>
          </div>

          {/* Scenario Result Dynamic Breakdown */}
          <div className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-4">
            {whatIfScenario === 0 && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase font-mono block">
                      {isHindi ? "सिनेरियो A: समय पर स्प्रे का शुद्ध परिणाम" : "SCENARIO A: ON-TIME BIOPHYSICAL RECOVERY"}
                    </span>
                    <h4 className="text-xl font-black text-[#0d253d] font-display">
                      +{causalGainQtlAcre} Q/acre {isHindi ? "सुरक्षित उपज" : "Protected Yield Gain"}
                    </h4>
                    <span className="text-xs text-slate-500">
                      {acres} Acres × +{causalGainQtlAcre} Q ={" "}
                      <strong>+{totalQuintalsProtected} Quintals Harvest Protected</strong>
                    </span>
                  </div>

                  <div className={`text-right shrink-0 px-5 py-3 rounded-2xl border ${
                    netProfitOnTime >= 0
                      ? "bg-emerald-100/70 border-emerald-300"
                      : "bg-rose-100/70 border-rose-300"
                  }`}>
                    <span className={`text-[10px] uppercase font-bold block ${
                      netProfitOnTime >= 0 ? "text-emerald-800" : "text-rose-800"
                    }`}>
                      {netProfitOnTime >= 0
                        ? (isHindi ? "अतिरिक्त शुद्ध मुनाफा (दवा खर्च काटकर)" : "Net Extra Cash In Hand")
                        : (isHindi ? "लागत घाटा (दवा खर्च अधिक)" : "Net Input Deficit")}
                    </span>
                    <span className={`text-2xl sm:text-3xl font-mono font-black ${
                      netProfitOnTime >= 0 ? "text-emerald-900" : "text-rose-900"
                    }`}>
                      {netProfitOnTime >= 0 ? "+" : "-"}₹{Math.abs(netProfitOnTime).toLocaleString("en-IN")}
                    </span>
                    <span className={`text-[10px] font-mono block ${
                      netProfitOnTime >= 0 ? "text-emerald-800" : "text-rose-800"
                    }`}>
                      ({robiMultiplier} {netProfitOnTime >= 0 ? "Return on Investment" : "ROI Deficit"})
                    </span>
                  </div>
                </div>
              </div>
            )}

            {whatIfScenario === 1 && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-amber-800 uppercase font-mono block">
                      {isHindi ? "सिनेरियो B: 4 दिन की देरी का परिणाम" : "SCENARIO B: DELAYED APPLICATION IMPACT"}
                    </span>
                    <h4 className="text-xl font-black text-[#0d253d] font-display">
                      +{(causalGainQtlAcre * 0.45).toFixed(2)} Q/acre {isHindi ? "सीमित लाभ" : "Limited Yield Gain"}
                    </h4>
                    <span className="text-xs text-amber-800 font-medium">
                      ⚠️ {isHindi ? "4 दिन की देरी के कारण 55% सुरक्षा लाभ नष्ट हो चुका है।" : "Delay destroys 55% of the potential protection benefit."}
                    </span>
                  </div>

                  <div className="text-right shrink-0 bg-amber-100/70 px-5 py-3 rounded-2xl border border-amber-300">
                    <span className="text-[10px] uppercase font-bold text-amber-900 block">
                      {isHindi ? "देरी के कारण खोया हुआ मुनाफा" : "Profit Destroyed by Delay"}
                    </span>
                    <span className="text-2xl sm:text-3xl font-mono font-black text-amber-950">
                      -₹{scenarioDelayedLoss.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] font-mono text-amber-800 block">
                      ({isHindi ? "शुद्ध लाभ घटकर" : "Net profit drops to"}{" "}
                      {scenarioDelayedProfit >= 0 ? "+₹" : "-₹"}
                      {Math.abs(scenarioDelayedProfit).toLocaleString("en-IN")})
                    </span>
                  </div>
                </div>
              </div>
            )}

            {whatIfScenario === 2 && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-rose-800 uppercase font-mono block">
                      {isHindi ? "सिनेरियो C: उपचार न करने पर सीधा नुकसान" : "SCENARIO C: CATASTROPHIC UNMITIGATED LOSS"}
                    </span>
                    <h4 className="text-xl font-black text-rose-700 font-display">
                      -{causalGainQtlAcre} Q/acre {isHindi ? "उपज का स्थायी नुकसान" : "Permanent Yield Deficit"}
                    </h4>
                    <span className="text-xs text-slate-500">
                      {acres} Acres × -{causalGainQtlAcre} Q ={" "}
                      <strong>-{totalQuintalsProtected} Quintals Lost at Mandi</strong>
                    </span>
                  </div>

                  <div className="text-right shrink-0 bg-rose-100/80 px-5 py-3 rounded-2xl border border-rose-300">
                    <span className="text-[10px] uppercase font-bold text-rose-800 block">
                      {isHindi ? "कुल फसल मूल्य का नुकसान" : "Direct Cash Loss at Mandi"}
                    </span>
                    <span className="text-2xl sm:text-3xl font-mono font-black text-rose-700">
                      -₹{scenarioNoActionLoss.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] font-mono text-rose-800 block">
                      (Total loss across your {acres} acres)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 4. OPTIMAL TIMELINE & DELAY LOSS CALCULATOR ───────── */}
        <div className="bg-white border border-[#e3e8ee] rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-black text-[#0d253d] font-display">
                  {isHindi ? "अनुकूलतम छिड़काव समय व देरी-हानि कैलकुलेटर" : "Optimal Application Timeline & Delay Loss Calculator"}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isHindi
                  ? `${normalizedCrop.nameHi} हेतु मौसम आधारित सुरक्षित छिड़काव समय व प्रत्येक दिन की देरी पर होने वाले आर्थिक नुकसान का वैज्ञानिक आकलन`
                  : `Model 2 weather-gated spray timing and escalating daily financial penalties for ${normalizedCrop.nameEn}`}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {isHindi ? "लाइव मौसम स्थिति (मॉडल 2)" : "Live Weather Gating (Model 2)"}
                </span>
                <span
                  className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border inline-flex items-center gap-1.5 mt-0.5 ${
                    spraySafe
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : "bg-amber-50 text-amber-900 border-amber-300"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${spraySafe ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                  {spraySafe
                    ? isHindi
                      ? "मौसम अनुकूल: सुरक्षित स्प्रे विंडो खुली है"
                      : "SAFE WEATHER — SPRAY WINDOW OPEN"
                    : isHindi
                    ? "मौसम प्रतिकूल: अभी स्प्रे रोकें (होल्ड करें)"
                    : "ADVERSE WEATHER — HOLD SPRAY RIGHT NOW"}
                </span>
              </div>
            </div>
          </div>

          {/* Transparent Loss Calculation Explanation Banner for Farmers & Judges */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <span className="font-extrabold text-[#0d253d]">
                📊 {isHindi ? "हानि गणना का आधार:" : "Delay Loss Formula:"}
              </span>{" "}
              <span className="font-mono text-slate-600">
                {acres} {isHindi ? "एकड़" : "Acres"} × +{causalGainQtlAcre} Q/ac {isHindi ? "बचाई जाने वाली उपज" : "Protected Yield"} × ₹{mandiPrice}/Qtl ={" "}
                <strong className="text-emerald-800 font-bold">₹{totalGrossProtectedCash.toLocaleString("en-IN")}</strong>{" "}
                {isHindi ? "कुल फसल मूल्य दांव पर है।" : "total harvest value at stake."}
              </span>
            </div>
            <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-lg shrink-0 font-bold ${
              spraySafe ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-950"
            }`}>
              {spraySafe
                ? (isHindi ? "✅ अभी छिड़काव हेतु परिस्थितियां सर्वोत्तम हैं" : "✅ Optimal conditions for cellular absorption now")
                : (isHindi ? "⚠️ दवा बहने/उड़ने का खतरा (शांत मौसम का इंतजार करें)" : "⚠️ High wash-off/drift risk: spray in next calm window")}
            </span>
          </div>

          {/* Hourly / Day-by-Day Escalating Loss Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className={`p-4 rounded-2xl border space-y-2 ${
              spraySafe
                ? "bg-emerald-50/70 border-emerald-200"
                : "bg-amber-50/70 border-amber-200"
            }`}>
              <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md ${
                spraySafe ? "text-emerald-800 bg-emerald-100" : "text-amber-800 bg-amber-100"
              }`}>
                DAY 0 - 2 (GOLDEN)
              </span>
              <span className="text-base font-bold text-[#0d253d] block font-display">
                {spraySafe
                  ? (isHindi ? "सर्वोत्तम समय (अभी स्प्रे करें)" : "Optimal Window (Spray Now)")
                  : (isHindi ? "48 घंटे के भीतर (अगली खिड़की)" : "Within 48h (Next Clear Window)")}
              </span>
              <p className="text-[11px] text-slate-600 leading-snug">
                {spraySafe
                  ? (isHindi
                      ? `Delta-T ${deltaT}°C व अनुकूल हवा। 100% दवा अवशोषण व पत्ती सुरक्षा।`
                      : `Delta-T ${deltaT}°C, safe wind. Maximum cellular absorption and zero wash-off.`)
                  : (isHindi
                      ? `वर्तमान मौसम प्रतिकूल है (Delta-T ${deltaT}°C)। दवा बर्बादी से बचने हेतु सुबह 6-9:30 या शाम को स्प्रे करें।`
                      : `Adverse weather now (Delta-T ${deltaT}°C). Wait for clear morning (6-9:30 AM) or evening window within 48h.`)}
              </p>
              <div className="text-xs font-mono font-bold text-emerald-800 pt-1 border-t border-emerald-200/60">
                ₹0 Loss ({isHindi ? "पूर्ण 100% फसल सुरक्षा" : "100% Protected Yield"})
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                DAY 3 - 4 (WARNING)
              </span>
              <span className="text-base font-bold text-[#0d253d] block font-display">
                {isHindi ? "देरी शुरू (25% नुकसान)" : "Initial Drop (25% Lost)"}
              </span>
              <p className="text-[11px] text-slate-600 leading-snug">
                {isHindi
                  ? "तनाव या कीट प्रकोप से 25% संभावित उपज लाभ स्थायी रूप से नष्ट हो जाता है।"
                  : "Larval feeding or cellular stress begins permanently destroying 25% of potential gain."}
              </p>
              <div className="text-xs font-mono font-bold text-amber-900 pt-1 border-t border-amber-200/60">
                -₹{Math.round(totalGrossProtectedCash * 0.25).toLocaleString("en-IN")} Loss
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase text-orange-800 bg-orange-100 px-2 py-0.5 rounded-md">
                DAY 5 - 6 (CRITICAL)
              </span>
              <span className="text-base font-bold text-[#0d253d] block font-display">
                {isHindi ? "गंभीर क्षति (60% नुकसान)" : "Severe Loss (60% Lost)"}
              </span>
              <p className="text-[11px] text-slate-600 leading-snug">
                {isHindi
                  ? "फलियां/फूल स्थायी रूप से नष्ट। उपचार के बावजूद 60% उपज लाभ नष्ट हो चुका होगा।"
                  : "Severe flower/fruit drop. 60% of potential harvest benefit lost permanently."}
              </p>
              <div className="text-xs font-mono font-bold text-orange-950 pt-1 border-t border-orange-200/60">
                -₹{Math.round(totalGrossProtectedCash * 0.6).toLocaleString("en-IN")} Loss
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md">
                DAY 7+ (PERMANENT)
              </span>
              <span className="text-base font-bold text-[#0d253d] block font-display">
                {isHindi ? "अपरिवर्तनीय (100% नुकसान)" : "Irreversible (100% Lost)"}
              </span>
              <p className="text-[11px] text-slate-600 leading-snug">
                {isHindi
                  ? "कोशिकाएं मृत या तना छिद्रित। रिकवरी नगण्य, पूरा सुरक्षा लाभ नष्ट।"
                  : "Tissue necrosis or systemic damage complete. Zero treatment recovery possible."}
              </p>
              <div className="text-xs font-mono font-bold text-rose-700 pt-1 border-t border-rose-200/60">
                -₹{scenarioNoActionLoss.toLocaleString("en-IN")} Loss
              </div>
            </div>
          </div>

          {/* Confirm Spray Done Action (Grey Farm Journal text removed) */}
          <div className="p-5 rounded-2xl bg-[#f6f9fc] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-sm font-extrabold text-[#0d253d] block">
                {isHindi
                  ? `क्या आपने ${activeProduct.name} का छिड़काव कर लिया है?`
                  : `Have You Applied ${activeProduct.name}?`}
              </span>
            </div>

            <button
              type="button"
              onClick={handleConfirmSpray}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                sprayConfirmed
                  ? "bg-emerald-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              <Check className="h-4 w-4" />
              <span>
                {sprayConfirmed
                  ? isHindi
                    ? "स्प्रे दर्ज हो गया (Confirmed)"
                    : "Spray Confirmed"
                  : isHindi
                  ? "स्प्रे की पुष्टि करें (Confirm Spray)"
                  : "Confirm Spray Done"}
              </span>
            </button>
          </div>
        </div>

        {/* ── Navigation Ribbon: To Economic Impact (/impact) ──── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-[#e8ede4] shadow-xs">
          <Link
            href="/plant-intelligence/diagnostics"
            className="text-xs font-bold text-slate-700 hover:text-[#1b4332] flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isHindi ? "पिछला: 1. समस्या पहचान (14-दिवसीय रडार)" : "Previous: 1. Problem Diagnostics"}</span>
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/impact"
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[44px]"
            >
              <span>
                {isHindi
                  ? "अगला: आर्थिक प्रभाव व 5 मंडी तुलना (/impact)"
                  : "Next: Economic Impact & 5 Mandis Table (/impact)"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        </div>
      </div>
    </AppShell>
  );
}
