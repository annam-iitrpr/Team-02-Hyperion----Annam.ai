export interface CropGrowthStage {
  stageOrder: number;
  stageName: string;
  stageNameHi: string;
  daysAfterSowing: string; // e.g. "0-10 DAS", "20-40 DAP", "Seasonal"
  minDays: number;
  maxDays: number;
  description?: string;
}

export interface CropMasterData {
  id: string;
  name: string;
  nameHi: string;
  category: "cereal" | "pulse" | "oilseed" | "cash_crop" | "vegetable" | "fruit" | "plantation";
  defaultVariety: string;
  defaultDistrict: string;
  defaultState: string;
  defaultAcres: number;
  stages: CropGrowthStage[];
}

export const MASTER_CROP_GROWTH_STAGES: Record<string, CropMasterData> = {
  rice: {
    id: "rice",
    name: "Rice (Paddy)",
    nameHi: "धान (चावल)",
    category: "cereal",
    defaultVariety: "PR-126 / Pusa Basmati 1121",
    defaultDistrict: "Karnal",
    defaultState: "Haryana",
    defaultAcres: 4.0,
    stages: [
      { stageOrder: 1, stageName: "Germination & Emergence", stageNameHi: "अंकुरण एवं फुटाव", daysAfterSowing: "0-10 DAS", minDays: 0, maxDays: 10 },
      { stageOrder: 2, stageName: "Seedling & Nursery", stageNameHi: "पौधशाला एवं नर्सरी", daysAfterSowing: "10-25 DAS", minDays: 10, maxDays: 25 },
      { stageOrder: 3, stageName: "Tillering", stageNameHi: "कल्ले फूटना (टिलरिंग)", daysAfterSowing: "25-50 DAS", minDays: 25, maxDays: 50 },
      { stageOrder: 4, stageName: "Panicle Initiation & Booting", stageNameHi: "बाली आरंभ व गाभा (बूटिंग)", daysAfterSowing: "50-70 DAS", minDays: 50, maxDays: 70 },
      { stageOrder: 5, stageName: "Heading & Flowering", stageNameHi: "बाली निकलना एवं फूल खिलना", daysAfterSowing: "70-85 DAS", minDays: 70, maxDays: 85 },
      { stageOrder: 6, stageName: "Milk & Dough Stage (Grain Filling)", stageNameHi: "दुग्ध एवं दाना भराव अवस्था", daysAfterSowing: "85-115 DAS", minDays: 85, maxDays: 115 },
      { stageOrder: 7, stageName: "Maturity & Ripening", stageNameHi: "परिपक्वता एवं पकना", daysAfterSowing: "115-135 DAS", minDays: 115, maxDays: 135 },
    ],
  },
  wheat: {
    id: "wheat",
    name: "Wheat",
    nameHi: "गेहूं",
    category: "cereal",
    defaultVariety: "PBW-826 / HD-3086",
    defaultDistrict: "Rupnagar",
    defaultState: "Punjab",
    defaultAcres: 5.0,
    stages: [
      { stageOrder: 1, stageName: "Germination & Emergence", stageNameHi: "अंकुरण एवं जमाव", daysAfterSowing: "0-15 DAS", minDays: 0, maxDays: 15 },
      { stageOrder: 2, stageName: "Crown Root Initiation (CRI)", stageNameHi: "शीर्ष जड़ विकास (CRI अवस्था)", daysAfterSowing: "20-25 DAS", minDays: 20, maxDays: 25 },
      { stageOrder: 3, stageName: "Tillering", stageNameHi: "कल्ले फूटना (टिलरिंग)", daysAfterSowing: "25-45 DAS", minDays: 25, maxDays: 45 },
      { stageOrder: 4, stageName: "Jointing & Stem Extension", stageNameHi: "गांठ बनना व तना बढ़वार", daysAfterSowing: "45-65 DAS", minDays: 45, maxDays: 65 },
      { stageOrder: 5, stageName: "Booting & Flowering (Anthesis)", stageNameHi: "गाभा एवं परागण (एंथेसिस)", daysAfterSowing: "65-85 DAS", minDays: 65, maxDays: 85 },
      { stageOrder: 6, stageName: "Grain Filling (Milk & Dough)", stageNameHi: "दूधिया व दाना भराव अवस्था", daysAfterSowing: "85-110 DAS", minDays: 85, maxDays: 110 },
      { stageOrder: 7, stageName: "Maturity & Ripening", stageNameHi: "परिपक्वता एवं कटाई", daysAfterSowing: "110-130 DAS", minDays: 110, maxDays: 130 },
    ],
  },
  maize: {
    id: "maize",
    name: "Maize (Corn)",
    nameHi: "मक्का",
    category: "cereal",
    defaultVariety: "Syngenta NK-6240",
    defaultDistrict: "Davangere",
    defaultState: "Karnataka",
    defaultAcres: 4.0,
    stages: [
      { stageOrder: 1, stageName: "Germination & Emergence (VE)", stageNameHi: "अंकुरण एवं फुटाव (VE)", daysAfterSowing: "0-10 DAS", minDays: 0, maxDays: 10 },
      { stageOrder: 2, stageName: "Seedling / Early Vegetative", stageNameHi: "प्रारंभिक वानस्पतिक बढ़वार", daysAfterSowing: "10-25 DAS", minDays: 10, maxDays: 25 },
      { stageOrder: 3, stageName: "Knee-High / Rapid Vegetative", stageNameHi: "घुटने तक ऊंचाई व तीव्र बढ़वार", daysAfterSowing: "25-50 DAS", minDays: 25, maxDays: 50 },
      { stageOrder: 4, stageName: "Tasseling (VT)", stageNameHi: "नर मंजरी निकलना (Tasseling VT)", daysAfterSowing: "50-60 DAS", minDays: 50, maxDays: 60 },
      { stageOrder: 5, stageName: "Silking & Pollination (R1)", stageNameHi: "भुट्टे के बाल व परागण (R1)", daysAfterSowing: "60-70 DAS", minDays: 60, maxDays: 70 },
      { stageOrder: 6, stageName: "Blister & Milk Stage (R2-R3)", stageNameHi: "ब्लिस्टर एवं दूधिया अवस्था (R2-R3)", daysAfterSowing: "70-85 DAS", minDays: 70, maxDays: 85 },
      { stageOrder: 7, stageName: "Dough & Dent Stage (R4-R5)", stageNameHi: "दाने सख्त होना (R4-R5)", daysAfterSowing: "85-105 DAS", minDays: 85, maxDays: 105 },
      { stageOrder: 8, stageName: "Physiological Maturity (R6)", stageNameHi: "शारीरिक परिपक्वता (R6)", daysAfterSowing: "105-120 DAS", minDays: 105, maxDays: 120 },
    ],
  },
  cotton: {
    id: "cotton",
    name: "Cotton",
    nameHi: "कपास",
    category: "cash_crop",
    defaultVariety: "Bt RCH-659",
    defaultDistrict: "Rajkot",
    defaultState: "Gujarat",
    defaultAcres: 6.0,
    stages: [
      { stageOrder: 1, stageName: "Germination & Emergence", stageNameHi: "अंकुरण एवं फुटाव", daysAfterSowing: "0-10 DAS", minDays: 0, maxDays: 10 },
      { stageOrder: 2, stageName: "Seedling & Vegetative Growth", stageNameHi: "पौध एवं वानस्पतिक बढ़वार", daysAfterSowing: "10-30 DAS", minDays: 10, maxDays: 30 },
      { stageOrder: 3, stageName: "Squaring (Floral Bud Formation)", stageNameHi: "कली बनना (Squaring Phase)", daysAfterSowing: "30-55 DAS", minDays: 30, maxDays: 55 },
      { stageOrder: 4, stageName: "Flowering & Early Boll Set", stageNameHi: "फूल खिलना एवं टिंडे की शुरुआत", daysAfterSowing: "55-80 DAS", minDays: 55, maxDays: 80 },
      { stageOrder: 5, stageName: "Peak Boll Development & Filling", stageNameHi: "टिंडे का तीव्र विकास व भराव", daysAfterSowing: "80-115 DAS", minDays: 80, maxDays: 115 },
      { stageOrder: 6, stageName: "Boll Opening & Maturation", stageNameHi: "टिंडे खिलना एवं परिपक्वता", daysAfterSowing: "115-150 DAS", minDays: 115, maxDays: 150 },
      { stageOrder: 7, stageName: "Harvesting", stageNameHi: "कपास चुनाई अवस्था", daysAfterSowing: "150-180 DAS", minDays: 150, maxDays: 180 },
    ],
  },
  soybean: {
    id: "soybean",
    name: "Soybean",
    nameHi: "सोयाबीन",
    category: "oilseed",
    defaultVariety: "JS-335 / JS-9560",
    defaultDistrict: "Indore",
    defaultState: "Madhya Pradesh",
    defaultAcres: 5.0,
    stages: [
      { stageOrder: 1, stageName: "Emergence & Cotyledon (VE/VC)", stageNameHi: "अंकुरण एवं बीजपत्र (VE/VC)", daysAfterSowing: "0-10 DAS", minDays: 0, maxDays: 10 },
      { stageOrder: 2, stageName: "Vegetative Leaf Stages (V1-V4)", stageNameHi: "पत्ती विकास (V1-V4 चरण)", daysAfterSowing: "10-30 DAS", minDays: 10, maxDays: 30 },
      { stageOrder: 3, stageName: "Flowering (R1-R2)", stageNameHi: "फूल खिलना (R1-R2)", daysAfterSowing: "30-50 DAS", minDays: 30, maxDays: 50 },
      { stageOrder: 4, stageName: "Pod Development (R3-R4)", stageNameHi: "फली निर्माण (R3-R4)", daysAfterSowing: "50-70 DAS", minDays: 50, maxDays: 70 },
      { stageOrder: 5, stageName: "Seed Filling (R5-R6)", stageNameHi: "दाना भराव अवस्था (R5-R6)", daysAfterSowing: "70-95 DAS", minDays: 70, maxDays: 95 },
      { stageOrder: 6, stageName: "Maturity & Senescence (R7-R8)", stageNameHi: "परिपक्वता एवं पत्तियां गिरना", daysAfterSowing: "95-115 DAS", minDays: 95, maxDays: 115 },
    ],
  },
  groundnut: {
    id: "groundnut",
    name: "Groundnut (Peanut)",
    nameHi: "मूंगफली",
    category: "oilseed",
    defaultVariety: "GG-20 / Kadiri-6",
    defaultDistrict: "Junagadh",
    defaultState: "Gujarat",
    defaultAcres: 4.0,
    stages: [
      { stageOrder: 1, stageName: "Germination & Emergence", stageNameHi: "अंकुरण एवं फुटाव", daysAfterSowing: "0-10 DAS", minDays: 0, maxDays: 10 },
      { stageOrder: 2, stageName: "Vegetative Branching", stageNameHi: "शाखाएं फैलना एवं बढ़वार", daysAfterSowing: "10-30 DAS", minDays: 10, maxDays: 30 },
      { stageOrder: 3, stageName: "Flowering", stageNameHi: "फूल खिलना अवस्था", daysAfterSowing: "30-45 DAS", minDays: 30, maxDays: 45 },
      { stageOrder: 4, stageName: "Pegging (Gynophore Elongation)", stageNameHi: "सूइयां (पेग्स) जमीन में जाना", daysAfterSowing: "40-60 DAS", minDays: 40, maxDays: 60 },
      { stageOrder: 5, stageName: "Pod Formation & Seed Filling", stageNameHi: "फली बनना एवं दाना भराव", daysAfterSowing: "60-90 DAS", minDays: 60, maxDays: 90 },
      { stageOrder: 6, stageName: "Pod Maturation & Harvest", stageNameHi: "फली पकना एवं खुदाई", daysAfterSowing: "90-120 DAS", minDays: 90, maxDays: 120 },
    ],
  },
  chickpea: {
    id: "chickpea",
    name: "Chickpea (Gram)",
    nameHi: "चना",
    category: "pulse",
    defaultVariety: "JG-11 / JAKI-9218",
    defaultDistrict: "Sehore",
    defaultState: "Madhya Pradesh",
    defaultAcres: 3.5,
    stages: [
      { stageOrder: 1, stageName: "Germination & Emergence", stageNameHi: "अंकुरण एवं फुटाव", daysAfterSowing: "0-15 DAS", minDays: 0, maxDays: 15 },
      { stageOrder: 2, stageName: "Vegetative Branching", stageNameHi: "वानस्पतिक शाखाएं फूटना", daysAfterSowing: "15-45 DAS", minDays: 15, maxDays: 45 },
      { stageOrder: 3, stageName: "Flowering", stageNameHi: "फूल खिलना अवस्था", daysAfterSowing: "45-70 DAS", minDays: 45, maxDays: 70 },
      { stageOrder: 4, stageName: "Pod Initiation & Seed Filling", stageNameHi: "घेंटी बनना एवं दाना भराव", daysAfterSowing: "70-95 DAS", minDays: 70, maxDays: 95 },
      { stageOrder: 5, stageName: "Maturity & Senescence", stageNameHi: "परिपक्वता एवं कटाई", daysAfterSowing: "95-120 DAS", minDays: 95, maxDays: 120 },
    ],
  },
  pigeon_pea: {
    id: "pigeon_pea",
    name: "Pigeon Pea (Arhar/Tur)",
    nameHi: "अरहर (तुअर)",
    category: "pulse",
    defaultVariety: "BDN-711 / Asha",
    defaultDistrict: "Gulbarga",
    defaultState: "Karnataka",
    defaultAcres: 4.5,
    stages: [
      { stageOrder: 1, stageName: "Germination & Emergence", stageNameHi: "अंकुरण एवं फुटाव", daysAfterSowing: "0-20 DAS", minDays: 0, maxDays: 20 },
      { stageOrder: 2, stageName: "Early Vegetative Growth", stageNameHi: "प्रारंभिक वानस्पतिक बढ़वार", daysAfterSowing: "20-60 DAS", minDays: 20, maxDays: 60 },
      { stageOrder: 3, stageName: "Canopy Expansion & Branching", stageNameHi: "कैनोपी फैलाव व मुख्य शाखाएं", daysAfterSowing: "60-90 DAS", minDays: 60, maxDays: 90 },
      { stageOrder: 4, stageName: "Flower Bud Initiation & Flowering", stageNameHi: "कलियां बनना एवं फूल खिलना", daysAfterSowing: "90-120 DAS", minDays: 90, maxDays: 120 },
      { stageOrder: 5, stageName: "Pod Development & Seed Setting", stageNameHi: "फली विकास एवं दाना बनना", daysAfterSowing: "120-150 DAS", minDays: 120, maxDays: 150 },
      { stageOrder: 6, stageName: "Pod Maturation & Harvest", stageNameHi: "फली परिपक्वता एवं कटाई", daysAfterSowing: "150-185 DAS", minDays: 150, maxDays: 185 },
    ],
  },
  tomato: {
    id: "tomato",
    name: "Tomato",
    nameHi: "टमाटर",
    category: "vegetable",
    defaultVariety: "Syngenta Saaho-3251",
    defaultDistrict: "Varanasi",
    defaultState: "Uttar Pradesh",
    defaultAcres: 2.5,
    stages: [
      { stageOrder: 1, stageName: "Nursery & Seedling", stageNameHi: "नर्सरी एवं पौध तैयार होना", daysAfterSowing: "0-25 DAS", minDays: 0, maxDays: 25 },
      { stageOrder: 2, stageName: "Transplanting & Vegetative Growth", stageNameHi: "रोपाई एवं वानस्पतिक बढ़वार", daysAfterSowing: "25-45 DAS", minDays: 25, maxDays: 45 },
      { stageOrder: 3, stageName: "Flowering & Fruit Set", stageNameHi: "फूल खिलना एवं फल लगना", daysAfterSowing: "45-70 DAS", minDays: 45, maxDays: 70 },
      { stageOrder: 4, stageName: "Fruit Development & Enlargement", stageNameHi: "फल विकास एवं आकार वृद्धि", daysAfterSowing: "70-95 DAS", minDays: 70, maxDays: 95 },
      { stageOrder: 5, stageName: "Fruit Ripening & Harvesting", stageNameHi: "फल पकना एवं तुड़ाई", daysAfterSowing: "95-140 DAS", minDays: 95, maxDays: 140 },
    ],
  },
  chilli: {
    id: "chilli",
    name: "Chilli",
    nameHi: "मिर्च",
    category: "vegetable",
    defaultVariety: "Syngenta HPH-5531",
    defaultDistrict: "Guntur",
    defaultState: "Andhra Pradesh",
    defaultAcres: 2.0,
    stages: [
      { stageOrder: 1, stageName: "Nursery & Germination", stageNameHi: "नर्सरी एवं अंकुरण", daysAfterSowing: "0-30 DAS", minDays: 0, maxDays: 30 },
      { stageOrder: 2, stageName: "Transplanting & Vegetative Growth", stageNameHi: "रोपाई एवं पौधों का फैलाव", daysAfterSowing: "30-55 DAS", minDays: 30, maxDays: 55 },
      { stageOrder: 3, stageName: "Flowering & Bud Emergence", stageNameHi: "कलियां व फूल खिलना", daysAfterSowing: "55-75 DAS", minDays: 55, maxDays: 75 },
      { stageOrder: 4, stageName: "Fruit Set & Green Pod Growth", stageNameHi: "मिर्च लगना एवं हरी बढ़वार", daysAfterSowing: "75-100 DAS", minDays: 75, maxDays: 100 },
      { stageOrder: 5, stageName: "Pod Ripening & Multiple Pickings", stageNameHi: "मिर्च पकना व निरंतर तुड़ाई", daysAfterSowing: "100-150 DAS", minDays: 100, maxDays: 150 },
    ],
  },
  potato: {
    id: "potato",
    name: "Potato",
    nameHi: "आलू",
    category: "vegetable",
    defaultVariety: "Kufri Pukhraj / Chipsona",
    defaultDistrict: "Kasganj",
    defaultState: "Uttar Pradesh",
    defaultAcres: 3.5,
    stages: [
      { stageOrder: 1, stageName: "Sprout Emergence", stageNameHi: "अंकुरण एवं फुटाव", daysAfterSowing: "0-20 DAP", minDays: 0, maxDays: 20 },
      { stageOrder: 2, stageName: "Vegetative Canopy Growth", stageNameHi: "कैनोपी फैलाव एवं पत्तियां", daysAfterSowing: "20-40 DAP", minDays: 20, maxDays: 40 },
      { stageOrder: 3, stageName: "Tuber Initiation", stageNameHi: "कंद बनने की शुरुआत", daysAfterSowing: "40-55 DAP", minDays: 40, maxDays: 55 },
      { stageOrder: 4, stageName: "Tuber Bulking", stageNameHi: "कंद फुलाव अवस्था (बल्किंग)", daysAfterSowing: "55-85 DAP", minDays: 55, maxDays: 85 },
      { stageOrder: 5, stageName: "Maturation & Skin Hardening", stageNameHi: "परिपक्वता व छिलका सख्त होना", daysAfterSowing: "85-110 DAP", minDays: 85, maxDays: 110 },
    ],
  },
  onion: {
    id: "onion",
    name: "Onion",
    nameHi: "प्याज",
    category: "vegetable",
    defaultVariety: "Bhima Super / N-53",
    defaultDistrict: "Nashik",
    defaultState: "Maharashtra",
    defaultAcres: 3.0,
    stages: [
      { stageOrder: 1, stageName: "Nursery & Seedling Emergence", stageNameHi: "नर्सरी एवं अंकुरण", daysAfterSowing: "0-45 DAS", minDays: 0, maxDays: 45 },
      { stageOrder: 2, stageName: "Transplanting & Vegetative Growth", stageNameHi: "रोपाई एवं वानस्पतिक बढ़वार", daysAfterSowing: "45-80 DAS", minDays: 45, maxDays: 80 },
      { stageOrder: 3, stageName: "Bulb Initiation", stageNameHi: "गांठ बनने की शुरुआत", daysAfterSowing: "80-110 DAS", minDays: 80, maxDays: 110 },
      { stageOrder: 4, stageName: "Bulb Enlargement (Bulking)", stageNameHi: "गांठ का तेजी से बढ़ना (फुलाव)", daysAfterSowing: "110-135 DAS", minDays: 110, maxDays: 135 },
      { stageOrder: 5, stageName: "Neck Fall & Curing", stageNameHi: "पत्ते झुकना (नेक फॉल) एवं सुखाई", daysAfterSowing: "135-150 DAS", minDays: 135, maxDays: 150 },
    ],
  },
  brinjal: {
    id: "brinjal",
    name: "Brinjal (Eggplant)",
    nameHi: "बैंगन",
    category: "vegetable",
    defaultVariety: "Navkiran / Utkal",
    defaultDistrict: "Cuttack",
    defaultState: "Odisha",
    defaultAcres: 2.0,
    stages: [
      { stageOrder: 1, stageName: "Nursery & Seedling", stageNameHi: "नर्सरी एवं पौध तैयार होना", daysAfterSowing: "0-30 DAS", minDays: 0, maxDays: 30 },
      { stageOrder: 2, stageName: "Transplanting & Vegetative Growth", stageNameHi: "रोपाई एवं शाखाएं निकलना", daysAfterSowing: "30-55 DAS", minDays: 30, maxDays: 55 },
      { stageOrder: 3, stageName: "Flowering & Fruit Set", stageNameHi: "फूल खिलना एवं फल लगना", daysAfterSowing: "55-80 DAS", minDays: 55, maxDays: 80 },
      { stageOrder: 4, stageName: "Fruit Growth & Successive Harvests", stageNameHi: "फल विकास एवं निरंतर तुड़ाई", daysAfterSowing: "80-140 DAS", minDays: 80, maxDays: 140 },
      { stageOrder: 5, stageName: "Senescence & Crop Termination", stageNameHi: "परिपक्वता व फसल समाप्ति", daysAfterSowing: "140-160 DAS", minDays: 140, maxDays: 160 },
    ],
  },
  cabbage: {
    id: "cabbage",
    name: "Cabbage",
    nameHi: "पत्ता गोभी",
    category: "vegetable",
    defaultVariety: "Golden Acre / Pusa Mukta",
    defaultDistrict: "Ranchi",
    defaultState: "Jharkhand",
    defaultAcres: 2.0,
    stages: [
      { stageOrder: 1, stageName: "Nursery & Seedling Emergence", stageNameHi: "नर्सरी एवं पौध अंकुरण", daysAfterSowing: "0-25 DAS", minDays: 0, maxDays: 25 },
      { stageOrder: 2, stageName: "Transplanting & Frame Building", stageNameHi: "रोपाई एवं पत्तों का घेरा बनना", daysAfterSowing: "25-45 DAS", minDays: 25, maxDays: 45 },
      { stageOrder: 3, stageName: "Cupping / Hearting Initiation", stageNameHi: "कप बनना (हेड की शुरुआत)", daysAfterSowing: "45-65 DAS", minDays: 45, maxDays: 65 },
      { stageOrder: 4, stageName: "Head Formation & Solidification", stageNameHi: "हेड का ठोस एवं कड़ा होना", daysAfterSowing: "65-90 DAS", minDays: 65, maxDays: 90 },
      { stageOrder: 5, stageName: "Head Maturation & Harvest", stageNameHi: "पूर्ण परिपक्वता एवं कटाई", daysAfterSowing: "90-110 DAS", minDays: 90, maxDays: 110 },
    ],
  },
  grapes: {
    id: "grapes",
    name: "Grapes",
    nameHi: "अंगूर",
    category: "fruit",
    defaultVariety: "Thompson Seedless",
    defaultDistrict: "Nashik",
    defaultState: "Maharashtra",
    defaultAcres: 3.5,
    stages: [
      { stageOrder: 1, stageName: "Dormancy & Bud Burst", stageNameHi: "सुषुप्तावस्था एवं कलियां फूटना", daysAfterSowing: "1-20 Days", minDays: 1, maxDays: 20 },
      { stageOrder: 2, stageName: "Shoot Elongation & Leaf Expansion", stageNameHi: "टहनी की लंबाई व पत्ती फैलाव", daysAfterSowing: "20-50 Days", minDays: 20, maxDays: 50 },
      { stageOrder: 3, stageName: "Flowering & Anthesis", stageNameHi: "फूल खिलना एवं परागण", daysAfterSowing: "50-70 Days", minDays: 50, maxDays: 70 },
      { stageOrder: 4, stageName: "Berry Growth (Set to Pea Stage)", stageNameHi: "दाने बनना (मटर दाना अवस्था)", daysAfterSowing: "70-100 Days", minDays: 70, maxDays: 100 },
      { stageOrder: 5, stageName: "Veraison (Color Change & Softening)", stageNameHi: "वेराइसन (रंग बदलना व मिठास)", daysAfterSowing: "100-120 Days", minDays: 100, maxDays: 120 },
      { stageOrder: 6, stageName: "Berry Ripening & Harvest", stageNameHi: "अंगूर पकना एवं तुड़ाई", daysAfterSowing: "120-150 Days", minDays: 120, maxDays: 150 },
      { stageOrder: 7, stageName: "Post-Harvest & Dormancy Induction", stageNameHi: "तुड़ाई उपरांत विश्राम अवस्था", daysAfterSowing: "Seasonal", minDays: 150, maxDays: 210 },
    ],
  },
  apple: {
    id: "apple",
    name: "Apple",
    nameHi: "सेब",
    category: "fruit",
    defaultVariety: "Royal Delicious / Gala",
    defaultDistrict: "Shimla",
    defaultState: "Himachal Pradesh",
    defaultAcres: 3.0,
    stages: [
      { stageOrder: 1, stageName: "Winter Dormancy", stageNameHi: "सर्दियों की सुषुप्तावस्था", daysAfterSowing: "Winter Period", minDays: 0, maxDays: 30 },
      { stageOrder: 2, stageName: "Bud Break to Green Tip", stageNameHi: "कली फूटना एवं हरी नोक निकलना", daysAfterSowing: "1-15 Days", minDays: 1, maxDays: 15 },
      { stageOrder: 3, stageName: "Tight Cluster to Pink Bud", stageNameHi: "गुच्छा बनना एवं गुलाबी कली", daysAfterSowing: "15-30 Days", minDays: 15, maxDays: 30 },
      { stageOrder: 4, stageName: "Full Bloom (Flowering)", stageNameHi: "पूर्ण फूल खिलना", daysAfterSowing: "30-45 Days", minDays: 30, maxDays: 45 },
      { stageOrder: 5, stageName: "Petal Fall & Fruit Set", stageNameHi: "पंखुड़ियां गिरना व फल लगना", daysAfterSowing: "45-60 Days", minDays: 45, maxDays: 60 },
      { stageOrder: 6, stageName: "Fruit Sizing & Cell Enlargement", stageNameHi: "फल का आकार बढ़ना (सेल विभाजन)", daysAfterSowing: "60-120 Days", minDays: 60, maxDays: 120 },
      { stageOrder: 7, stageName: "Fruit Maturation & Harvest", stageNameHi: "फल पकना एवं तुड़ाई", daysAfterSowing: "120-160 Days", minDays: 120, maxDays: 160 },
      { stageOrder: 8, stageName: "Post-Harvest & Leaf Senescence", stageNameHi: "तुड़ाई पश्चात पत्ती झड़ना", daysAfterSowing: "Post-Harvest", minDays: 160, maxDays: 200 },
    ],
  },
  mango: {
    id: "mango",
    name: "Mango",
    nameHi: "आम",
    category: "fruit",
    defaultVariety: "Dasheri / Alphonso",
    defaultDistrict: "Lucknow",
    defaultState: "Uttar Pradesh",
    defaultAcres: 5.0,
    stages: [
      { stageOrder: 1, stageName: "Vegetative Dormancy & Induction", stageNameHi: "वानस्पतिक विश्राम व बौर प्रेरण", daysAfterSowing: "Seasonal", minDays: 0, maxDays: 30 },
      { stageOrder: 2, stageName: "Panicle Emergence & Elongation", stageNameHi: "बौर निकलना एवं लंबा होना", daysAfterSowing: "1-30 Days", minDays: 1, maxDays: 30 },
      { stageOrder: 3, stageName: "Full Bloom & Anthesis", stageNameHi: "पूर्ण बौर खिलना एवं परागण", daysAfterSowing: "30-50 Days", minDays: 30, maxDays: 50 },
      { stageOrder: 4, stageName: "Fruit Set & Pea Stage", stageNameHi: "फल लगना व मटर दाना आकार", daysAfterSowing: "50-70 Days", minDays: 50, maxDays: 70 },
      { stageOrder: 5, stageName: "Marble Stage to Rapid Bulking", stageNameHi: "गोली (मार्बल) अवस्था व तीव्र फुलाव", daysAfterSowing: "70-100 Days", minDays: 70, maxDays: 100 },
      { stageOrder: 6, stageName: "Maturation & Shoulder Development", stageNameHi: "परिपक्वता व कंधे का विकास", daysAfterSowing: "100-135 Days", minDays: 100, maxDays: 135 },
      { stageOrder: 7, stageName: "Ripening & Harvest", stageNameHi: "पकना एवं आम तुड़ाई", daysAfterSowing: "135-150 Days", minDays: 135, maxDays: 150 },
    ],
  },
  sugarcane: {
    id: "sugarcane",
    name: "Sugarcane",
    nameHi: "गन्ना",
    category: "cash_crop",
    defaultVariety: "Co-0238",
    defaultDistrict: "Muzaffarnagar",
    defaultState: "Uttar Pradesh",
    defaultAcres: 6.0,
    stages: [
      { stageOrder: 1, stageName: "Germination & Sprouting", stageNameHi: "अंकुरण एवं आंखें फूटना", daysAfterSowing: "0-45 DAP", minDays: 0, maxDays: 45 },
      { stageOrder: 2, stageName: "Formative / Tillering", stageNameHi: "कल्ले फूटना (टिलरिंग)", daysAfterSowing: "45-120 DAP", minDays: 45, maxDays: 120 },
      { stageOrder: 3, stageName: "Grand Growth / Stem Elongation", stageNameHi: "तीव्र तना बढ़वार (ग्रैंड ग्रोथ)", daysAfterSowing: "120-270 DAP", minDays: 120, maxDays: 270 },
      { stageOrder: 4, stageName: "Maturation & Ripening", stageNameHi: "शर्करा निर्माण एवं परिपक्वता", daysAfterSowing: "270-360 DAP", minDays: 270, maxDays: 360 },
      { stageOrder: 5, stageName: "Harvesting", stageNameHi: "गन्ना कटाई एवं मिल ढुलाई", daysAfterSowing: "330-360+ DAP", minDays: 330, maxDays: 390 },
    ],
  },
  mustard: {
    id: "mustard",
    name: "Mustard (Sarson)",
    nameHi: "सरसों",
    category: "oilseed",
    defaultVariety: "Pusa Bold / Giriraj",
    defaultDistrict: "Bharatpur",
    defaultState: "Rajasthan",
    defaultAcres: 4.0,
    stages: [
      { stageOrder: 1, stageName: "Germination & Emergence", stageNameHi: "अंकुरण एवं फुटाव", daysAfterSowing: "0-15 DAS", minDays: 0, maxDays: 15 },
      { stageOrder: 2, stageName: "Rosette / Early Vegetative", stageNameHi: "रोज़ेट एवं प्रारंभिक बढ़वार", daysAfterSowing: "15-40 DAS", minDays: 15, maxDays: 40 },
      { stageOrder: 3, stageName: "Stem Elongation & Inflorescence", stageNameHi: "शाखाएं एवं पुष्पगुच्छ निकलना", daysAfterSowing: "40-60 DAS", minDays: 40, maxDays: 60 },
      { stageOrder: 4, stageName: "Flowering", stageNameHi: "पीले फूल खिलना", daysAfterSowing: "60-80 DAS", minDays: 60, maxDays: 80 },
      { stageOrder: 5, stageName: "Siliqua Development & Seed Filling", stageNameHi: "फलियां (सिलिकुआ) व दाना भराव", daysAfterSowing: "80-105 DAS", minDays: 80, maxDays: 105 },
      { stageOrder: 6, stageName: "Physiological Maturity & Harvest", stageNameHi: "परिपक्वता एवं कटाई", daysAfterSowing: "105-125 DAS", minDays: 105, maxDays: 125 },
    ],
  },
  tea: {
    id: "tea",
    name: "Tea",
    nameHi: "चाय",
    category: "plantation",
    defaultVariety: "Assamica / TV-1",
    defaultDistrict: "Golaghat",
    defaultState: "Assam",
    defaultAcres: 8.0,
    stages: [
      { stageOrder: 1, stageName: "Winter Dormancy (Banjhi Phase)", stageNameHi: "शीतकालीन विश्राम (बांझ अवस्था)", daysAfterSowing: "Winter Period", minDays: 0, maxDays: 30 },
      { stageOrder: 2, stageName: "Bud Break & First Flush", stageNameHi: "नई कोपलें व प्रथम चुगाई (First Flush)", daysAfterSowing: "1-25 Days", minDays: 1, maxDays: 25 },
      { stageOrder: 3, stageName: "Active Growth (Two Leaves & a Bud)", stageNameHi: "सक्रिय बढ़वार (दो पत्ती एक कली)", daysAfterSowing: "25-45 Days", minDays: 25, maxDays: 45 },
      { stageOrder: 4, stageName: "Peak Flush & Plucking Cycles", stageNameHi: "तीव्र चुगाई चक्र (Peak Flush)", daysAfterSowing: "Seasonal", minDays: 45, maxDays: 180 },
      { stageOrder: 5, stageName: "Post-Harvest Maintenance", stageNameHi: "चुगाई उपरांत झाड़ी संधारण", daysAfterSowing: "Continuous", minDays: 180, maxDays: 270 },
      { stageOrder: 6, stageName: "Pruning & Bush Rejuvenation", stageNameHi: "झाड़ी छंटाई (प्रूनिंग व कायाकल्प)", daysAfterSowing: "Periodic (3-5 Yrs)", minDays: 270, maxDays: 365 },
    ],
  },
};

/**
 * Helper to normalize crop name to key in MASTER_CROP_GROWTH_STAGES
 */
export function normalizeCropKey(rawCrop: string): string {
  const c = (rawCrop || "").toLowerCase().trim();
  if (c.includes("rice") || c.includes("paddy") || c.includes("dhan") || c.includes("चावल") || c.includes("धान")) return "rice";
  if (c.includes("wheat") || c.includes("gehu") || c.includes("गेहूं") || c.includes("गेहू")) return "wheat";
  if (c.includes("maize") || c.includes("corn") || c.includes("makka") || c.includes("मक्का")) return "maize";
  if (c.includes("cotton") || c.includes("kapas") || c.includes("कपास")) return "cotton";
  if (c.includes("soy") || c.includes("soya") || c.includes("सोयाबीन")) return "soybean";
  if (c.includes("groundnut") || c.includes("peanut") || c.includes("moongfali") || c.includes("मूंगफली")) return "groundnut";
  if (c.includes("chickpea") || c.includes("gram") || c.includes("chana") || c.includes("चना")) return "chickpea";
  if (c.includes("pigeon") || c.includes("arhar") || c.includes("tur") || c.includes("तुअर") || c.includes("अरहर")) return "pigeon_pea";
  if (c.includes("tomato") || c.includes("tamatar") || c.includes("टमाटर")) return "tomato";
  if (c.includes("chilli") || c.includes("chili") || c.includes("mirch") || c.includes("मिर्च")) return "chilli";
  if (c.includes("potato") || c.includes("aloo") || c.includes("आलू")) return "potato";
  if (c.includes("onion") || c.includes("pyaz") || c.includes("प्याज")) return "onion";
  if (c.includes("brinjal") || c.includes("eggplant") || c.includes("baingan") || c.includes("बैंगन")) return "brinjal";
  if (c.includes("cabbage") || c.includes("patta") || c.includes("गोभी") || c.includes("पत्ता गोभी")) return "cabbage";
  if (c.includes("grape") || c.includes("angoor") || c.includes("अंगूर")) return "grapes";
  if (c.includes("apple") || c.includes("seb") || c.includes("सेब")) return "apple";
  if (c.includes("mango") || c.includes("aam") || c.includes("आम")) return "mango";
  if (c.includes("sugarcane") || c.includes("cane") || c.includes("ganna") || c.includes("गन्ना")) return "sugarcane";
  if (c.includes("mustard") || c.includes("sarson") || c.includes("raya") || c.includes("सरसों")) return "mustard";
  if (c.includes("tea") || c.includes("chai") || c.includes("चाय")) return "tea";
  return "wheat"; // robust default
}

/**
 * Get the master crop profile or fallback
 */
export function getCropMasterData(cropName: string): CropMasterData {
  const key = normalizeCropKey(cropName);
  return MASTER_CROP_GROWTH_STAGES[key] || MASTER_CROP_GROWTH_STAGES.wheat;
}

/**
 * Get all growth stages for a crop
 */
export function getCropGrowthStages(cropName: string): CropGrowthStage[] {
  return getCropMasterData(cropName).stages;
}

/**
 * Resolve stage from DAS (days after sowing)
 */
export function resolveCropStageByDas(cropName: string, das: number): CropGrowthStage {
  const stages = getCropGrowthStages(cropName);
  for (const s of stages) {
    if (das >= s.minDays && das <= s.maxDays) {
      return s;
    }
  }
  // If beyond max days, return last stage
  if (das > stages[stages.length - 1].maxDays) {
    return stages[stages.length - 1];
  }
  return stages[0];
}

/**
 * Returns formatted label e.g. "Tillering (25-50 DAS)" or "कल्ले फूटना (25-50 DAS)"
 */
export function formatStageLabel(stage: CropGrowthStage, lang: "en" | "hi" = "en"): string {
  const name = lang === "hi" ? stage.stageNameHi : stage.stageName;
  return `${name} (${stage.daysAfterSowing})`;
}
