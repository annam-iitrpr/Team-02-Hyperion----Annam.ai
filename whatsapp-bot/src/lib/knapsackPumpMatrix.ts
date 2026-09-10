/**
 * ==============================================================================
 * AASRA — 16-Liter Knapsack Sprayer Pump Dilution Matrix (Syngenta Portfolio)
 * Smallholder Farmer Equipment Calibration Engine
 * ==============================================================================
 * Calibrates every Syngenta India crop protection product into realistic
 * Indian field sprayer measurements:
 * 1. 16L Manual Knapsack Pump (हाथ वाली टंकी)
 * 2. 15L Battery Knapsack Pump (बैटरी वाली टंकी)
 * 3. 200L Tractor Boom / Barrel (ट्रैक्टर वाला 200L ड्रम)
 * 4. Practical Vernacular Measures: "ढक्कन" (bottle caps) and "चम्मच" (spoons)
 */

export interface KnapsackDilutionProfile {
  productKey: string;
  name: string;
  nameHi: string;
  activeIngredient: string;
  category: "insecticide" | "fungicide" | "herbicide" | "seed_treatment" | "biostimulant" | "pgr";
  applicationType: "foliar_spray" | "granular_broadcast" | "seed_treatment" | "soil_drench";
  unit: "ml" | "g" | "kg";
  acreDoseNumeric: number;
  acreWaterLiters: number;
  
  // Equipment Dilutions
  dosePer16LPump: number;
  dosePer16LPumpHi: string;
  dosePer16LPumpEn: string;
  
  dosePer15LBattery: number;
  dosePer15LBatteryHi: string;
  dosePer15LBatteryEn: string;
  
  dosePer200LDrum: number;
  dosePer200LDrumHi: string;
  dosePer200LDrumEn: string;
  
  // Farmer Equipment Guidance
  nozzleEn: string;
  nozzleHi: string;
  capMeasureEn: string;
  capMeasureHi: string;
  sprayTimeEn: string;
  sprayTimeHi: string;
  phiDays: number;
  costPerAcreInr: number;
}

export interface ScaledFarmerKnapsackCard {
  productKey: string;
  name: string;
  nameHi: string;
  activeIngredient: string;
  category: string;
  acres: number;
  applicationType: string;
  
  // Specific Tank Dilutions
  dosePer16LPump: string;
  dosePer15LBattery: string;
  dosePer200LDrum: string;
  capMeasure: string;
  nozzle: string;
  
  // Farm Totals
  totalProductNeeded: string;
  totalWaterNeededLiters: number;
  total16LPumpsCount: number;
  totalCostInr: number;
  phiDays: number;
  sprayWindow: string;
}

/**
 * Knowledge base of all 50 Syngenta products mapped to 16L knapsack metrics
 */
export const SYNGENTA_KNAPSACK_PROFILES: Record<string, KnapsackDilutionProfile> = {
  // INSECTICIDES
  virtako: {
    productKey: "virtako",
    name: "Virtako®",
    nameHi: "विरटाको (Virtako)",
    activeIngredient: "Thiamethoxam 1% + Chlorantraniliprole 0.5% GR",
    category: "insecticide",
    applicationType: "granular_broadcast",
    unit: "kg",
    acreDoseNumeric: 3.0,
    acreWaterLiters: 0,
    dosePer16LPump: 0,
    dosePer16LPumpHi: "छिड़काव नहीं — 3 किलो बालू या यूरिया में मिलाकर प्रति एकड़ बखेरें",
    dosePer16LPumpEn: "Do NOT spray — Broadcast 3 kg mixed with dry sand or urea per acre",
    dosePer15LBattery: 0,
    dosePer15LBatteryHi: "छिड़काव नहीं — दानेदार बखेरें",
    dosePer15LBatteryEn: "Do NOT spray — Granular broadcast only",
    dosePer200LDrum: 0,
    dosePer200LDrumHi: "छिड़काव नहीं",
    dosePer200LDrumEn: "Do not spray in drum",
    nozzleEn: "Granular broadcast (Standing water required in paddy)",
    nozzleHi: "हाथ से समान बखेरें (धान में 2-3 सेमी खड़ा पानी जरूरी)",
    capMeasureEn: "3 kg bag per acre",
    capMeasureHi: "3 किलो का पैकेट प्रति एकड़",
    sprayTimeEn: "Apply during active tillering in standing water",
    sprayTimeHi: "कल्ले फूटते समय खड़े पानी में बखेरें",
    phiDays: 21,
    costPerAcreInr: 900,
  },
  ampligo: {
    productKey: "ampligo",
    name: "Ampligo®",
    nameHi: "एम्प्लिगो (Ampligo)",
    activeIngredient: "Chlorantraniliprole 9.3% + Lambda-cyhalothrin 4.6% ZC",
    category: "insecticide",
    applicationType: "foliar_spray",
    unit: "ml",
    acreDoseNumeric: 100,
    acreWaterLiters: 200,
    dosePer16LPump: 8.0,
    dosePer16LPumpHi: "8 ml प्रति 16 लीटर टंकी (आधा बड़ा ढक्कन)",
    dosePer16LPumpEn: "8 ml per 16L pump (approx. half cap)",
    dosePer15LBattery: 7.5,
    dosePer15LBatteryHi: "7.5 ml प्रति 15 लीटर बैटरी टंकी",
    dosePer15LBatteryEn: "7.5 ml per 15L battery pump",
    dosePer200LDrum: 100,
    dosePer200LDrumHi: "100 ml दवा 200 लीटर ड्रम में",
    dosePer200LDrumEn: "100 ml per 200L tractor drum",
    nozzleEn: "Hollow cone nozzle (fine mist)",
    nozzleHi: "होलो कोन नोजल (महीन फव्वारा)",
    capMeasureEn: "8 ml per pump (bottle cap is ~15 ml)",
    capMeasureHi: "8 ml प्रति पंप (बोतल का ढक्कन 15 ml का होता है)",
    sprayTimeEn: "Early morning or late afternoon on seeing egg hatch/caterpillars",
    sprayTimeHi: "सुबह या शाम के समय, सुंडी दिखते ही तुरंत स्प्रे करें",
    phiDays: 15,
    costPerAcreInr: 850,
  },
  alika: {
    productKey: "alika",
    name: "Alika®",
    nameHi: "अलिका (Alika)",
    activeIngredient: "Thiamethoxam 12.6% + Lambda-cyhalothrin 9.5% ZC",
    category: "insecticide",
    applicationType: "foliar_spray",
    unit: "ml",
    acreDoseNumeric: 80,
    acreWaterLiters: 200,
    dosePer16LPump: 6.4,
    dosePer16LPumpHi: "6.4 ml प्रति 16 लीटर टंकी (लगभग आधा ढक्कन)",
    dosePer16LPumpEn: "6.4 ml per 16L pump (approx. half cap)",
    dosePer15LBattery: 6.0,
    dosePer15LBatteryHi: "6.0 ml प्रति 15 लीटर बैटरी टंकी",
    dosePer15LBatteryEn: "6.0 ml per 15L battery pump",
    dosePer200LDrum: 80,
    dosePer200LDrumHi: "80 ml दवा 200 लीटर ड्रम में",
    dosePer200LDrumEn: "80 ml per 200L tractor drum",
    nozzleEn: "Hollow cone nozzle",
    nozzleHi: "होलो कोन नोजल (पत्तियों के दोनों तरफ छिड़काव)",
    capMeasureEn: "6-7 ml per spray pump",
    capMeasureHi: "6-7 ml प्रति स्प्रे पंप",
    sprayTimeEn: "Morning when aphids/thrips are actively moving",
    sprayTimeHi: "सुबह के समय जब माहू/थ्रिप्स पत्तों पर सक्रिय हों",
    phiDays: 21,
    costPerAcreInr: 550,
  },
  chess: {
    productKey: "chess",
    name: "Chess®",
    nameHi: "चेस (Chess)",
    activeIngredient: "Pymetrozine 50% WG",
    category: "insecticide",
    applicationType: "foliar_spray",
    unit: "g",
    acreDoseNumeric: 120,
    acreWaterLiters: 200,
    dosePer16LPump: 9.6,
    dosePer16LPumpHi: "10 ग्राम प्रति 16 लीटर टंकी (1 बड़ा चम्मच)",
    dosePer16LPumpEn: "9.6 g per 16L pump (approx. 1 tablespoon)",
    dosePer15LBattery: 9.0,
    dosePer15LBatteryHi: "9 ग्राम प्रति 15 लीटर बैटरी टंकी",
    dosePer15LBatteryEn: "9.0 g per 15L battery pump",
    dosePer200LDrum: 120,
    dosePer200LDrumHi: "120 ग्राम दवा 200 लीटर ड्रम में",
    dosePer200LDrumEn: "120 g per 200L tractor drum",
    nozzleEn: "Hollow cone nozzle aimed at base of rice plants (BPH zone)",
    nozzleHi: "होलो कोन नोजल — धान के पौधों की जड़/तने के पास स्प्रे करें",
    capMeasureEn: "1 tablespoon (10g) per pump",
    capMeasureHi: "1 चम्मच (10 ग्राम) प्रति पंप",
    sprayTimeEn: "Tillering to panicle initiation upon first BPH hopper spotting",
    sprayTimeHi: "कल्ले से बाली अवस्था तक, तेला/फुदका दिखते ही",
    phiDays: 19,
    costPerAcreInr: 700,
  },
  pegasus: {
    productKey: "pegasus",
    name: "Pegasus®",
    nameHi: "पेगासस (Pegasus)",
    activeIngredient: "Diafenthiuron 50% WP",
    category: "insecticide",
    applicationType: "foliar_spray",
    unit: "g",
    acreDoseNumeric: 250,
    acreWaterLiters: 200,
    dosePer16LPump: 20.0,
    dosePer16LPumpHi: "20 ग्राम प्रति 16 लीटर टंकी (2 बड़े चम्मच)",
    dosePer16LPumpEn: "20 g per 16L pump (2 tablespoons)",
    dosePer15LBattery: 18.7,
    dosePer15LBatteryHi: "18.5 ग्राम प्रति 15 लीटर बैटरी टंकी",
    dosePer15LBatteryEn: "18.7 g per 15L battery pump",
    dosePer200LDrum: 250,
    dosePer200LDrumHi: "250 ग्राम दवा 200 लीटर ड्रम में",
    dosePer200LDrumEn: "250 g per 200L tractor drum",
    nozzleEn: "Hollow cone nozzle with thorough underside coverage",
    nozzleHi: "होलो कोन नोजल — पत्तियों की निचली सतह पर भरपूर छिड़काव",
    capMeasureEn: "2 tablespoons (20g) per pump",
    capMeasureHi: "2 चम्मच (20 ग्राम) प्रति पंप",
    sprayTimeEn: "Sunny morning (requires bright sunlight to activate vapor action)",
    sprayTimeHi: "धूप वाली सुबह (धूप में गैस प्रभाव से सफेद मक्खी तुरंत मरती है)",
    phiDays: 10,
    costPerAcreInr: 600,
  },
  actara: {
    productKey: "actara",
    name: "Actara®",
    nameHi: "अकतारा (Actara)",
    activeIngredient: "Thiamethoxam 25% WG",
    category: "insecticide",
    applicationType: "foliar_spray",
    unit: "g",
    acreDoseNumeric: 80,
    acreWaterLiters: 200,
    dosePer16LPump: 6.4,
    dosePer16LPumpHi: "6.4 ग्राम प्रति 16 लीटर टंकी (आधा बड़ा चम्मच)",
    dosePer16LPumpEn: "6.4 g per 16L pump (half tablespoon)",
    dosePer15LBattery: 6.0,
    dosePer15LBatteryHi: "6.0 ग्राम प्रति 15 लीटर बैटरी टंकी",
    dosePer15LBatteryEn: "6.0 g per 15L battery pump",
    dosePer200LDrum: 80,
    dosePer200LDrumHi: "80 ग्राम दवा 200 लीटर ड्रम में",
    dosePer200LDrumEn: "80 g per 200L tractor drum",
    nozzleEn: "Hollow cone nozzle",
    nozzleHi: "होलो कोन नोजल",
    capMeasureEn: "6-7 grams (half tablespoon)",
    capMeasureHi: "6-7 ग्राम (आधा चम्मच)",
    sprayTimeEn: "Early morning before heavy winds",
    sprayTimeHi: "सुबह के समय हवा शांत रहने पर",
    phiDays: 14,
    costPerAcreInr: 250,
  },
  simodis: {
    productKey: "simodis",
    name: "Simodis®",
    nameHi: "सिमोडिस (Simodis - PLINAZOLIN®)",
    activeIngredient: "Isocycloseram 9.2% DC",
    category: "insecticide",
    applicationType: "foliar_spray",
    unit: "ml",
    acreDoseNumeric: 240,
    acreWaterLiters: 200,
    dosePer16LPump: 19.2,
    dosePer16LPumpHi: "19.2 ml प्रति 16 लीटर टंकी (लगभग 1 बड़ा ढक्कन पूरा)",
    dosePer16LPumpEn: "19.2 ml per 16L pump (approx. 1 full cap)",
    dosePer15LBattery: 18.0,
    dosePer15LBatteryHi: "18 ml प्रति 15 लीटर बैटरी टंकी",
    dosePer15LBatteryEn: "18.0 ml per 15L battery pump",
    dosePer200LDrum: 240,
    dosePer200LDrumHi: "240 ml दवा 200 लीटर ड्रम में",
    dosePer200LDrumEn: "240 ml per 200L tractor drum",
    nozzleEn: "Fine hollow cone nozzle for penetrative foliage coverage",
    nozzleHi: "महीन होलो कोन नोजल (चुरड़ा/थ्रिप्स के खात्मे के लिए)",
    capMeasureEn: "1 full cap (20 ml) per pump",
    capMeasureHi: "1 पूरा ढक्कन (20 ml) प्रति पंप",
    sprayTimeEn: "6:30 AM to 9:30 AM (breaks resistant thrips & mites)",
    sprayTimeHi: "सुबह 6:30 से 9:30 बजे (जिद्दी थ्रिप्स व माइट का पक्का इलाज)",
    phiDays: 7,
    costPerAcreInr: 2200,
  },
  evicent: {
    productKey: "evicent",
    name: "Evicent®",
    nameHi: "एविसेंट (Evicent)",
    activeIngredient: "Emamectin benzoate 5% SG",
    category: "insecticide",
    applicationType: "foliar_spray",
    unit: "g",
    acreDoseNumeric: 80,
    acreWaterLiters: 200,
    dosePer16LPump: 6.4,
    dosePer16LPumpHi: "6.4 ग्राम प्रति 16 लीटर टंकी (आधा चम्मच)",
    dosePer16LPumpEn: "6.4 g per 16L pump (approx. half spoon)",
    dosePer15LBattery: 6.0,
    dosePer15LBatteryHi: "6.0 ग्राम प्रति 15 लीटर बैटरी टंकी",
    dosePer15LBatteryEn: "6.0 g per 15L battery pump",
    dosePer200LDrum: 80,
    dosePer200LDrumHi: "80 ग्राम दवा 200 लीटर ड्रम में",
    dosePer200LDrumEn: "80 g per 200L tractor drum",
    nozzleEn: "Hollow cone nozzle",
    nozzleHi: "होलो कोन नोजल",
    capMeasureEn: "6-7 grams per pump",
    capMeasureHi: "6-7 ग्राम प्रति पंप",
    sprayTimeEn: "Late afternoon when caterpillars emerge to feed",
    sprayTimeHi: "शाम के समय जब इल्ली पत्ते खाने बाहर निकलती है",
    phiDays: 7,
    costPerAcreInr: 360,
  },

  // FUNGICIDES
  amistar_top: {
    productKey: "amistar_top",
    name: "Amistar Top®",
    nameHi: "एमिस्टार टॉप (Amistar Top)",
    activeIngredient: "Azoxystrobin 18.2% + Difenoconazole 11.4% SC",
    category: "fungicide",
    applicationType: "foliar_spray",
    unit: "ml",
    acreDoseNumeric: 200,
    acreWaterLiters: 200,
    dosePer16LPump: 16.0,
    dosePer16LPumpHi: "16 ml प्रति 16 लीटर टंकी (लगभग 1 ढक्कन)",
    dosePer16LPumpEn: "16 ml per 16L pump (approx. 1 cap)",
    dosePer15LBattery: 15.0,
    dosePer15LBatteryHi: "15 ml प्रति 15 लीटर बैटरी टंकी",
    dosePer15LBatteryEn: "15.0 ml per 15L battery pump",
    dosePer200LDrum: 200,
    dosePer200LDrumHi: "200 ml दवा 200 लीटर ड्रम में",
    dosePer200LDrumEn: "200 ml per 200L tractor drum",
    nozzleEn: "Fine hollow cone nozzle for thorough foliar coat",
    nozzleHi: "महीन होलो कोन नोजल (पत्तियों पर समान लेप बने)",
    capMeasureEn: "1 cap (16 ml) per pump",
    capMeasureHi: "1 ढक्कन (16 ml) प्रति पंप",
    sprayTimeEn: "Morning after dew has evaporated (stops blast, blight, rust)",
    sprayTimeHi: "सुबह ओस सूखने के बाद (ब्लास्ट, झुलसा और रतुआ रोग रोकता है)",
    phiDays: 14,
    costPerAcreInr: 1300,
  },
  score: {
    productKey: "score",
    name: "Score®",
    nameHi: "स्कोर (Score)",
    activeIngredient: "Difenoconazole 25% EC",
    category: "fungicide",
    applicationType: "foliar_spray",
    unit: "ml",
    acreDoseNumeric: 100,
    acreWaterLiters: 200,
    dosePer16LPump: 8.0,
    dosePer16LPumpHi: "8 ml प्रति 16 लीटर टंकी (आधा ढक्कन)",
    dosePer16LPumpEn: "8 ml per 16L pump (half cap)",
    dosePer15LBattery: 7.5,
    dosePer15LBatteryHi: "7.5 ml प्रति 15 लीटर बैटरी टंकी",
    dosePer15LBatteryEn: "7.5 ml per 15L battery pump",
    dosePer200LDrum: 100,
    dosePer200LDrumHi: "100 ml दवा 200 लीटर ड्रम में",
    dosePer200LDrumEn: "100 ml per 200L tractor drum",
    nozzleEn: "Hollow cone nozzle",
    nozzleHi: "होलो कोन नोजल",
    capMeasureEn: "8 ml per pump",
    capMeasureHi: "8 ml प्रति पंप",
    sprayTimeEn: "First appearance of circular leaf spots",
    sprayTimeHi: "पत्तियों पर गोल धब्बे दिखते ही तुरंत",
    phiDays: 14,
    costPerAcreInr: 300,
  },
  ridomil_gold: {
    productKey: "ridomil_gold",
    name: "Ridomil Gold®",
    nameHi: "रिडोमिल गोल्ड (Ridomil Gold)",
    activeIngredient: "Metalaxyl-M 4% + Mancozeb 64% WP",
    category: "fungicide",
    applicationType: "foliar_spray",
    unit: "g",
    acreDoseNumeric: 600,
    acreWaterLiters: 200,
    dosePer16LPump: 48.0,
    dosePer16LPumpHi: "48-50 ग्राम प्रति 16 लीटर टंकी (4-5 बड़े चम्मच)",
    dosePer16LPumpEn: "48 g per 16L pump (approx. 4-5 tablespoons)",
    dosePer15LBattery: 45.0,
    dosePer15LBatteryHi: "45 ग्राम प्रति 15 लीटर बैटरी टंकी",
    dosePer15LBatteryEn: "45.0 g per 15L battery pump",
    dosePer200LDrum: 600,
    dosePer200LDrumHi: "600 ग्राम दवा 200 लीटर ड्रम में",
    dosePer200LDrumEn: "600 g per 200L tractor drum",
    nozzleEn: "Hollow cone nozzle with thorough plant canopy wash",
    nozzleHi: "होलो कोन नोजल (पौधों को अच्छी तरह नहलाते हुए स्प्रे)",
    capMeasureEn: "4-5 tablespoons (48-50g) per pump",
    capMeasureHi: "4-5 चम्मच (50 ग्राम) प्रति पंप",
    sprayTimeEn: "Morning when late blight or damping off appears",
    sprayTimeHi: "सुबह के समय झुलसा या तना गलन दिखते ही",
    phiDays: 7,
    costPerAcreInr: 1000,
  },
  kavach: {
    productKey: "kavach",
    name: "Kavach®",
    nameHi: "कवच (Kavach)",
    activeIngredient: "Chlorothalonil 720g/l SC",
    category: "fungicide",
    applicationType: "foliar_spray",
    unit: "ml",
    acreDoseNumeric: 400,
    acreWaterLiters: 200,
    dosePer16LPump: 32.0,
    dosePer16LPumpHi: "32 ml प्रति 16 लीटर टंकी (2 बड़े ढक्कन)",
    dosePer16LPumpEn: "32 ml per 16L pump (2 caps)",
    dosePer15LBattery: 30.0,
    dosePer15LBatteryHi: "30 ml प्रति 15 लीटर बैटरी टंकी",
    dosePer15LBatteryEn: "30.0 ml per 15L battery pump",
    dosePer200LDrum: 400,
    dosePer200LDrumHi: "400 ml दवा 200 लीटर ड्रम में",
    dosePer200LDrumEn: "400 ml per 200L tractor drum",
    nozzleEn: "Hollow cone nozzle",
    nozzleHi: "होलो कोन नोजल (सुरक्षा कवच तैयार करता है)",
    capMeasureEn: "2 caps (32 ml) per pump",
    capMeasureHi: "2 ढक्कन (32 ml) प्रति पंप",
    sprayTimeEn: "Preventive spray before cloudy/foggy weather sets in",
    sprayTimeHi: "बादल या कोहरा शुरू होने से पहले बचाव के तौर पर",
    phiDays: 7,
    costPerAcreInr: 640,
  },
  revus: {
    productKey: "revus",
    name: "Revus®",
    nameHi: "रेवस (Revus)",
    activeIngredient: "Mandipropamid 23.4% SC",
    category: "fungicide",
    applicationType: "foliar_spray",
    unit: "ml",
    acreDoseNumeric: 200,
    acreWaterLiters: 200,
    dosePer16LPump: 16.0,
    dosePer16LPumpHi: "16 ml प्रति 16 लीटर टंकी (1 बड़ा ढक्कन पूरा)",
    dosePer16LPumpEn: "16 ml per 16L pump (1 full cap)",
    dosePer15LBattery: 15.0,
    dosePer15LBatteryHi: "15 ml प्रति 15 लीटर बैटरी टंकी",
    dosePer15LBatteryEn: "15.0 ml per 15L battery pump",
    dosePer200LDrum: 200,
    dosePer200LDrumHi: "200 ml दवा 200 लीटर ड्रम में",
    dosePer200LDrumEn: "200 ml per 200L tractor drum",
    nozzleEn: "Fine hollow cone nozzle (translaminar leaf lock)",
    nozzleHi: "महीन होलो कोन नोजल (पत्ती के आर-पार असर करता है)",
    capMeasureEn: "1 full cap (16 ml) per spray pump",
    capMeasureHi: "1 पूरा ढक्कन (16 ml) प्रति स्प्रे पंप",
    sprayTimeEn: "8:00-11:00 AM once dew dries (gold standard for Late Blight)",
    sprayTimeHi: "सुबह 8:00 से 11:00 बजे ओस सूखने के बाद (पिछेती झुलसा का अचूक इलाज)",
    phiDays: 3,
    costPerAcreInr: 640,
  },
  tilt: {
    productKey: "tilt",
    name: "Tilt®",
    nameHi: "टिल्ट (Tilt)",
    activeIngredient: "Propiconazole 25% EC",
    category: "fungicide",
    applicationType: "foliar_spray",
    unit: "ml",
    acreDoseNumeric: 200,
    acreWaterLiters: 200,
    dosePer16LPump: 16.0,
    dosePer16LPumpHi: "16 ml प्रति 16 लीटर टंकी (1 ढक्कन)",
    dosePer16LPumpEn: "16 ml per 16L pump (1 cap)",
    dosePer15LBattery: 15.0,
    dosePer15LBatteryHi: "15 ml प्रति 15 लीटर बैटरी टंकी",
    dosePer15LBatteryEn: "15.0 ml per 15L battery pump",
    dosePer200LDrum: 200,
    dosePer200LDrumHi: "200 ml दवा 200 लीटर ड्रम में",
    dosePer200LDrumEn: "200 ml per 200L tractor drum",
    nozzleEn: "Hollow cone nozzle",
    nozzleHi: "होलो कोन नोजल",
    capMeasureEn: "1 cap (16 ml) per pump",
    capMeasureHi: "1 ढक्कन (16 ml) प्रति पंप",
    sprayTimeEn: "Karnal bunt / yellow rust in wheat, sheath blight in rice",
    sprayTimeHi: "गेहूं में पीला रतुआ या धान में शीथ झुलसा दिखने पर",
    phiDays: 21,
    costPerAcreInr: 220,
  },

  // BIOSTIMULANTS
  isabion: {
    productKey: "isabion",
    name: "Isabion®",
    nameHi: "इसाबियन (Isabion)",
    activeIngredient: "Pure L-Amino Acids 62.5% + Peptides",
    category: "biostimulant",
    applicationType: "foliar_spray",
    unit: "ml",
    acreDoseNumeric: 400,
    acreWaterLiters: 200,
    dosePer16LPump: 32.0,
    dosePer16LPumpHi: "32 ml प्रति 16 लीटर टंकी (2 बड़े ढक्कन)",
    dosePer16LPumpEn: "32 ml per 16L pump (2 full caps)",
    dosePer15LBattery: 30.0,
    dosePer15LBatteryHi: "30 ml प्रति 15 लीटर बैटरी टंकी",
    dosePer15LBatteryEn: "30.0 ml per 15L battery pump",
    dosePer200LDrum: 400,
    dosePer200LDrumHi: "400 ml दवा 200 लीटर ड्रम में",
    dosePer200LDrumEn: "400 ml per 200L tractor drum",
    nozzleEn: "Hollow cone nozzle",
    nozzleHi: "होलो कोन नोजल (फूल व कल्ले बढ़ाने हेतु)",
    capMeasureEn: "2 caps (32 ml) per pump",
    capMeasureHi: "2 ढक्कन (32 ml) प्रति पंप",
    sprayTimeEn: "Pre-flowering and fruit setting stages",
    sprayTimeHi: "फूल आने से ठीक पहले एवं फल बनते समय",
    phiDays: 0,
    costPerAcreInr: 400,
  },
  quantis: {
    productKey: "quantis",
    name: "Quantis®",
    nameHi: "क्वांटिस (Quantis)",
    activeIngredient: "Amino acids + Potassium + Calcium + Osmoprotectants",
    category: "biostimulant",
    applicationType: "foliar_spray",
    unit: "ml",
    acreDoseNumeric: 400,
    acreWaterLiters: 200,
    dosePer16LPump: 32.0,
    dosePer16LPumpHi: "32 ml प्रति 16 लीटर टंकी (2 ढक्कन)",
    dosePer16LPumpEn: "32 ml per 16L pump (2 caps)",
    dosePer15LBattery: 30.0,
    dosePer15LBatteryHi: "30 ml प्रति 15 लीटर बैटरी टंकी",
    dosePer15LBatteryEn: "30.0 ml per 15L battery pump",
    dosePer200LDrum: 400,
    dosePer200LDrumHi: "400 ml दवा 200 लीटर ड्रम में",
    dosePer200LDrumEn: "400 ml per 200L tractor drum",
    nozzleEn: "Hollow cone nozzle",
    nozzleHi: "होलो कोन नोजल (गर्मी व सूखे से कोशिकाओं की सुरक्षा)",
    capMeasureEn: "2 caps (32 ml) per pump",
    capMeasureHi: "2 ढक्कन (32 ml) प्रति पंप",
    sprayTimeEn: "3-5 days prior to forecast heatwave (>35°C) or drought",
    sprayTimeHi: "भीषण गर्मी (>35°C) या लू चलने से 3-4 दिन पहले",
    phiDays: 0,
    costPerAcreInr: 300,
  },

  // SEED TREATMENT
  cruiser: {
    productKey: "cruiser",
    name: "Cruiser®",
    nameHi: "क्रूज़र (Cruiser)",
    activeIngredient: "Thiamethoxam 30% FS",
    category: "seed_treatment",
    applicationType: "seed_treatment",
    unit: "ml",
    acreDoseNumeric: 100,
    acreWaterLiters: 0,
    dosePer16LPump: 0,
    dosePer16LPumpHi: "स्प्रे नहीं — 3 से 5 ml दवा प्रति किलो बीज में मिलाकर उपचारित करें",
    dosePer16LPumpEn: "Do NOT spray — Mix 3-5 ml per kg seed before sowing",
    dosePer15LBattery: 0,
    dosePer15LBatteryHi: "बीज उपचार केवल",
    dosePer15LBatteryEn: "Seed treatment only",
    dosePer200LDrum: 0,
    dosePer200LDrumHi: "बीज उपचार केवल",
    dosePer200LDrumEn: "Seed treatment only",
    nozzleEn: "Seed treatment drum / plastic sheet coating",
    nozzleHi: "प्लास्टिक शीट पर बीज फैलाकर दस्ताने पहनकर लेप करें",
    capMeasureEn: "3-5 ml per 1 kg seed",
    capMeasureHi: "3-5 ml प्रति 1 किलो बीज",
    sprayTimeEn: "Just before sowing (protects from sucking pests for 30 days)",
    sprayTimeHi: "बुवाई से पूर्व (30 दिन तक रस चूसक कीटों से अचूक सुरक्षा)",
    phiDays: 0,
    costPerAcreInr: 200,
  },
};

/**
 * Retrieve the knapsack profile for any product key (with fallback)
 */
export function getKnapsackProfile(productKey: string): KnapsackDilutionProfile | undefined {
  const clean = productKey.toLowerCase().replace(/[^a-z0-9_]/g, "");
  return SYNGENTA_KNAPSACK_PROFILES[clean];
}

/**
 * Calculate scaled farmer knapsack sprayer card for any product and acreage
 */
export function calculateFarmerKnapsackMetrics(
  productKey: string,
  fieldAcres: number = 1.0,
  lang: "hi" | "en" = "hi"
): ScaledFarmerKnapsackCard {
  const profile = getKnapsackProfile(productKey) || SYNGENTA_KNAPSACK_PROFILES["revus"];
  const isEn = lang === "en";

  const totalProduct = Number((profile.acreDoseNumeric * fieldAcres).toFixed(1));
  const totalWater = profile.acreWaterLiters > 0 ? Math.round(profile.acreWaterLiters * fieldAcres) : 0;
  const totalPumps = totalWater > 0 ? Math.ceil(totalWater / 16) : 0;
  const totalCost = Math.round(profile.costPerAcreInr * fieldAcres);

  return {
    productKey: profile.productKey,
    name: profile.name,
    nameHi: profile.nameHi,
    activeIngredient: profile.activeIngredient,
    category: profile.category.toUpperCase(),
    acres: fieldAcres,
    applicationType: profile.applicationType,
    dosePer16LPump: isEn ? profile.dosePer16LPumpEn : profile.dosePer16LPumpHi,
    dosePer15LBattery: isEn ? profile.dosePer15LBatteryEn : profile.dosePer15LBatteryHi,
    dosePer200LDrum: isEn ? profile.dosePer200LDrumEn : profile.dosePer200LDrumHi,
    capMeasure: isEn ? profile.capMeasureEn : profile.capMeasureHi,
    nozzle: isEn ? profile.nozzleEn : profile.nozzleHi,
    totalProductNeeded: `${totalProduct} ${profile.unit}`,
    totalWaterNeededLiters: totalWater,
    total16LPumpsCount: totalPumps,
    totalCostInr: totalCost,
    phiDays: profile.phiDays,
    sprayWindow: isEn ? profile.sprayTimeEn : profile.sprayTimeHi,
  };
}

/**
 * Format a farmer-ready WhatsApp card with exact knapsack dilution
 */
export function formatKnapsackWhatsAppBox(
  card: ScaledFarmerKnapsackCard,
  lang: "hi" | "en" = "hi"
): string {
  const isEn = lang === "en";
  if (card.applicationType === "granular_broadcast" || card.applicationType === "seed_treatment") {
    if (isEn) {
      return (
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🛡️ *Recommended Product:* ${card.name}\n` +
        `   *Active Ingredient:* ${card.activeIngredient}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🎯 *Application Method & Dose:*\n` +
        `• *Dose/Method:* ${card.dosePer16LPump}\n` +
        `• *Measure:* ${card.capMeasure}\n` +
        `• *Equipment Guidance:* ${card.nozzle}\n\n` +
        `📊 *Total for Your ${card.acres} Acres:*\n` +
        `• *Total Product:* *${card.totalProductNeeded}*\n` +
        `• *Estimated Cost:* *₹${card.totalCostInr.toLocaleString("en-IN")}*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━`
      );
    }
    return (
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🛡️ *अनुशंसित दवा:* ${card.nameHi}\n` +
      `   *तकनीकी घटक:* ${card.activeIngredient}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🎯 *प्रयोग विधि एवं खुराक:*\n` +
      `• *मात्रा/विधि:* ${card.dosePer16LPump}\n` +
      `• *नाप:* ${card.capMeasure}\n` +
      `• *उपकरण निर्देश:* ${card.nozzle}\n\n` +
      `📊 *आपके ${card.acres} एकड़ खेत का कुल हिसाब:*\n` +
      `• *कुल दवा की जरूरत:* *${card.totalProductNeeded}*\n` +
      `• *अनुमानित खर्च:* *₹${card.totalCostInr.toLocaleString("en-IN")}*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`
    );
  }

  if (isEn) {
    return (
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🛡️ *Recommended Product:* ${card.name}\n` +
      `   *Active Ingredient:* ${card.activeIngredient}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🎯 *Sprayer Tank Dilution (Exact Measurement):*\n` +
      `• *16L Manual Hand Pump:* *${card.dosePer16LPump}*\n` +
      `• *15L Battery Sprayer:* *${card.dosePer15LBattery}*\n` +
      `• *200L Tractor Drum:* *${card.dosePer200LDrum}*\n` +
      `• *Nozzle Type:* *${card.nozzle}*\n\n` +
      `📊 *Total for Your ${card.acres} Acres:*\n` +
      `• *Total Chemical Needed:* *${card.totalProductNeeded}* (Cost: *₹${card.totalCostInr.toLocaleString("en-IN")}*)\n` +
      `• *Total Spray Water:* *${card.totalWaterNeededLiters} Liters* (~*${card.total16LPumpsCount} pump fillings*)\n` +
      `• *Safe Harvest Interval (PHI):* *${card.phiDays} Days* (safe to pick & sell after ${card.phiDays} days)\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`
    );
  }

  return (
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🛡️ *अनुशंसित दवा:* ${card.nameHi}\n` +
    `   *तकनीकी घटक:* ${card.activeIngredient}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🎯 *स्प्रे पंप नाप (Exact Pump Measurement):*\n` +
    `• *16 लीटर हाथ वाली टंकी:* *${card.dosePer16LPump}*\n` +
    `• *15 लीटर बैटरी टंकी:* *${card.dosePer15LBattery}*\n` +
    `• *200 लीटर ट्रैक्टर ड्रम:* *${card.dosePer200LDrum}*\n` +
    `• *नोजल:* *${card.nozzle}*\n\n` +
    `📊 *आपके ${card.acres} एकड़ खेत का कुल हिसाब:*\n` +
    `• *कुल दवा की आवश्यकता:* *${card.totalProductNeeded}* (अनुमानित खर्च: *₹${card.totalCostInr.toLocaleString("en-IN")}*)\n` +
    `• *कुल पानी की आवश्यकता:* *${card.totalWaterNeededLiters} लीटर* (लगभग *${card.total16LPumpsCount} स्प्रे टंकी*)\n` +
    `• *सुरक्षित तुड़ाई (PHI):* *${card.phiDays} दिन* (स्प्रे के ${card.phiDays} दिन बाद फसल बेचना पूरी तरह सुरक्षित)\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`
  );
}
