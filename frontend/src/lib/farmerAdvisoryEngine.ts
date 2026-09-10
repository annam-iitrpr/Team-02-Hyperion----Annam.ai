// ─────────────────────────────────────────────────────────────────────────────
// Farmer Advisory Engine
// Generates natural, accessible, non-robotic "Why", "How", and "Soil Guidance"
// written specifically for Indian farmers with no technical jargon.
// ─────────────────────────────────────────────────────────────────────────────

export interface FarmerWhyAdvice {
  headlineEn: string;
  headlineHi: string;
  linesEn: string[];
  linesHi: string[];
  jargonTranslationEn?: string;
  jargonTranslationHi?: string;
}

export interface FarmerHowAdvice {
  headlineEn: string;
  headlineHi: string;
  stepsEn: { title: string; desc: string }[];
  stepsHi: { title: string; desc: string }[];
}

export interface SoilPersonalization {
  soilCategory: "black" | "alluvial" | "sandy" | "red" | "general";
  soilLabelEn: string;
  soilLabelHi: string;
  guidanceEn: string;
  guidanceHi: string;
  waterAdviceEn: string;
  waterAdviceHi: string;
}

export interface GeneralCulturalAdvisory {
  headlineEn: string;
  headlineHi: string;
  subtitleEn: string;
  subtitleHi: string;
  practicesEn: { icon: string; title: string; text: string }[];
  practicesHi: { icon: string; title: string; text: string }[];
}

/**
 * 1. THE "WHY" GENERATOR (3-4 lines maximum)
 * Explains: Crop Stage + Weather Threat + Vulnerability + Why Product Solves It.
 * Never uses robotic jargon without plain Hindi/English translation.
 */
export function generateFarmerWhyExplanation(params: {
  cropName: string;
  cropKey: string;
  growthStage: string;
  productName: string;
  productCategory: string;
  activeIngredient: string;
  targetPests?: string[];
  tempMax?: number;
  isHindi: boolean;
}): FarmerWhyAdvice {
  const {
    cropName,
    cropKey,
    growthStage,
    productName,
    activeIngredient,
    targetPests = [],
    tempMax = 35,
  } = params;

  const crop = cropName || "आपकी फसल";
  const stage = growthStage || "फूल व बढ़वार";
  const pName = productName.replace(/®|™/g, "");
  const pestsStr = targetPests.slice(0, 2).join(" व ") || "हानिकारक कीटों";

  // Translate technical active ingredients into simple farmer language
  let jargonEn = "";
  let jargonHi = "";

  const ingrLower = (activeIngredient || "").toLowerCase();
  if (ingrLower.includes("chlorantraniliprole") || ingrLower.includes("abamectin") || ingrLower.includes("lambda")) {
    jargonEn = "Active ingredient enters leaf veins, paralyzing stem and foliage borers within 2 hours without harming your crop.";
    jargonHi = "यह सुरक्षित कीटनाशक पत्तियों की नसों में जाकर भीतर बैठी इल्लियों को 2 घंटे में भोजन करने से रोक देता है।";
  } else if (ingrLower.includes("amino") || ingrLower.includes("organic carbon") || ingrLower.includes("peptides")) {
    jargonEn = "Pure biological plant energy tonic that keeps cell sap flowing and prevents flower drop under heat.";
    jargonHi = "यह विशुद्ध जैविक टॉनिक है जो पौधों की कोशिकाओं को ताकत देकर तेज धूप में भी फूलों को झड़ने से थामे रखता है।";
  } else if (ingrLower.includes("azoxystrobin") || ingrLower.includes("difenoconazole") || ingrLower.includes("metalaxyl")) {
    jargonEn = "Safe systemic plant medicine that stops fungus and leaf-drying spots from within the plant.";
    jargonHi = "यह फफूंदनाशक दवा पत्तों के आर-पार फैलकर पत्तियों को सूखने और दाग-धब्बों से बचाती है।";
  } else if (ingrLower.includes("mesotrione") || ingrLower.includes("topramezone")) {
    jargonEn = "Selective weed shield that dries out problem grass without causing any yellowing to your main crop.";
    jargonHi = "यह चयनात्मक दवा केवल खरपतवार को सुखाती है और मुख्य फसल को बिना किसी झटके के सुरक्षित रखती है।";
  }

  // Crop & Problem-Specific 3-4 Line Story
  let linesEn: string[] = [];
  let linesHi: string[] = [];

  if (cropKey === "maize") {
    linesHi = [
      `आपकी मक्का इस समय ${stage} अवस्था में है, और इलाके में फॉल आर्मीवर्म इल्ली (FAW) का खतरा सक्रिय है।`,
      `मक्के के पोंगे (दिल) में बैठी यह इल्ली कोमल पत्तों को अंदर ही अंदर छलनी कर भुट्टे के निर्माण को रोक देती है।`,
      `इसलिए ${pName} की सिफारिश की गई है — यह पोंगे में गहराई तक पहुंचकर छिपी इल्लियों को तुरंत समाप्त करती है।`,
      `इससे भुट्टे में पूरे दाने भरेंगे और पैदावार में 25-30% तक की भारी बचत सुनिश्चित होगी।`,
    ];
    linesEn = [
      `Your maize crop is currently in the ${stage} stage, during high risk of Fall Armyworm (FAW) pest attack.`,
      `Hidden deep inside the plant whorl, borer larvae chew tender leaves, preventing healthy cob and grain formation.`,
      `We recommend ${pName} because it penetrates deep into the leaf whorl to halt feeding caterpillars within hours.`,
      `This protects your central plant shoot, ensuring full cob filling and securing your market harvest.`,
    ];
  } else if (cropKey === "sugarcane") {
    linesHi = [
      `आपका गन्ना इस समय ${stage} में है, जहां मौसम के तापमान के उतार-चढ़ाव से गन्ने की बढ़वार धीमी पड़ सकती है।`,
      `इस समय गन्ने की पोरियों (इंटरनोड) की लंबाई व मोटाई बनना सबसे जरूरी है, अन्यथा वजन में भारी कमी आती है।`,
      `इसलिए ${pName} की सिफारिश की गई है — यह जैविक रस गन्ने की कोशिकाओं को लगातार ऊर्जा देकर पोरियों को लंबा व मोटा बनाता है।`,
      `इससे गन्ने में रस व सुक्रोज की मात्रा सुरक्षित रहती है और तौल पर सीधा 15-20 क्विंटल प्रति एकड़ का इजाफा मिलता है।`,
    ];
    linesEn = [
      `Your sugarcane is in the critical ${stage} stage where temperature shifts can slow cane growth.`,
      `At this juncture, internode elongation and cane girth expansion determine your entire harvest weight.`,
      `We recommend ${pName} to fuel natural cane cell division and maintain continuous sap circulation.`,
      `This prevents stunted growth, preserves sucrose levels, and adds substantial tonnage at mill weighment.`,
    ];
  } else if (cropKey === "cotton") {
    linesHi = [
      `आपकी कपास इस समय ${stage} अवस्था में है, और तेज धूप व शुष्क हवा के कारण पौधों में पानी का तनाव बढ़ रहा है।`,
      `दोपहर की तेज गर्मी से कपास के फूल, कलियां और नन्हे टिंडे (Squares & Bolls) असमय पीले पड़कर झड़ने लगते हैं।`,
      `इसलिए ${pName} की सिफारिश की गई है — यह फूलों की डंडी की पकड़ मजबूत कर टिंडों को झड़ने से रोकता है।`,
      `इससे प्रति पौधा 8 से 12 अतिरिक्त टिंडे सुरक्षित पकते हैं, जिससे मंडी में आपको भरपूर कपास की उपज मिलेगी।`,
    ];
    linesEn = [
      `Your cotton is in the delicate ${stage} stage, currently facing high daytime heat and dry atmospheric pull.`,
      `High temperatures cause heavy shedding of squares and young bolls, directly slashing your picking yield.`,
      `We recommend ${pName} because it stabilizes cell moisture and firmly anchors squares to prevent abortion.`,
      `This saves 8–12 additional mature bolls per plant, ensuring a heavier first and second harvest picking.`,
    ];
  } else if (cropKey === "soybean") {
    linesHi = [
      `आपकी सोयाबीन इस समय ${stage} अवस्था में है, और मौसम में 34°C से अधिक तापमान बना हुआ है।`,
      `अधिक गर्मी से सोयाबीन के फूल सूखने लगते हैं और परागकण झुलस जाते हैं, जिससे फलियों में दाना नहीं भर पाता।`,
      `इसलिए ${pName} की सिफारिश की गई है — यह पौधों में प्राकृतिक सुरक्षा कवच सक्रिय कर फूलों को झड़ने से बचाता है।`,
      `इससे फलियों का पूरा भराव होगा और कटाई के समय दाना बोल्ड व चमकदार वजनदार निकलेगा।`,
    ];
    linesEn = [
      `Your soybean is currently in the ${stage} stage while temperatures are crossing 34°C.`,
      `Excessive heat causes fragile soybean blossoms to abort and dries pollen before fertilization can occur.`,
      `We recommend ${pName} because it protects pollen viability and maintains cellular hydration during thermal stress.`,
      `This preserves your flower count, ensuring dense pod clustering and plumper, heavier harvested beans.`,
    ];
  } else if (cropKey === "wheat") {
    linesHi = [
      `आपका गेहूं इस समय ${stage} अवस्था में है, और मौसम में तापमान बढ़ने से बालियों पर गर्मी का दबाव आ सकता है।`,
      `अचानक बढ़ी गर्मी (टर्मिनल हीट) से बालियों में दूधिया दाना समय से पहले सूखकर सिकुड़ (shrivel) जाता है।`,
      `इसलिए ${pName} की सिफारिश की गई है — यह झंडा पत्ती (Flag Leaf) को हरी-भरी रखकर दाने में स्टार्च का भराव जारी रखती है।`,
      `इससे 1000 दानों का वजन (टेस्ट वेट) पूरा बनेगा और मंडी में ग्रेड-1 का भाव मिलेगा।`,
    ];
    linesEn = [
      `Your wheat is in the ${stage} stage where rising seasonal temperatures create terminal heat stress.`,
      `Warm winds can force premature grain dry-down, resulting in shrivelled, lightweight wheat kernels.`,
      `We recommend ${pName} to keep the flag leaf green and prolong active photosynthetic grain filling.`,
      `This ensures plump, heavy grains with optimal test weight for top Mandi valuation.`,
    ];
  } else if (cropKey === "potato") {
    linesHi = [
      `आपके आलू की फसल इस समय ${stage} अवस्था में है, जहां कंदों का आकार तेजी से बढ़ना चाहिए।`,
      `तापमान में उतार-चढ़ाव या फफूंद के असर से कंद छोटे रह जाते हैं और छिलके पर दाग-धब्बे बनने का खतरा रहता है।`,
      `इसलिए ${pName} की सिफारिश की गई है — यह कंदों को समान रूप से फुलाता है और छिलके को मजबूत बनाता है।`,
      `इससे कोल्ड स्टोरेज में रखने पर आलू सड़ता नहीं है और बाजार में ए-ग्रेड का पूरा दाम मिलता है।`,
    ];
    linesEn = [
      `Your potato crop is in the ${stage} stage where underground tubers are actively bulking.`,
      `Fluctuating temperatures and moisture stress can restrict tuber sizing and weaken skin firmness.`,
      `We recommend ${pName} to stimulate balanced tuber expansion and reinforce protective skin set.`,
      `This maximizes uniform marketable tuber size and ensures superior shelf life in storage.`,
    ];
  } else {
    // Universal Field Crop
    linesHi = [
      `आपकी ${crop} इस समय ${stage} अवस्था में है, और वर्तमान मौसम में ${tempMax > 34 ? "तेज गर्मी" : "पर्यावरणीय तनाव"} व ${pestsStr} का जोखिम बना हुआ है।`,
      `इस नाजुक समय में फसल के पत्तों व फूलों को नुकसान पहुंचने से सीधा उत्पादन 20% से 35% तक घट सकता है।`,
      `इसलिए ${pName} की सिफारिश की गई है — यह फसल के प्राकृतिक बचाव तंत्र को सक्रिय कर नुकसान से बचाती है।`,
      `यह दवा आपकी फसल को तरोताजा रखकर कटाई के समय पूरी उपज व उत्तम गुणवत्ता सुनिश्चित करती है।`,
    ];
    linesEn = [
      `Your ${crop} is currently in the ${stage} stage under current ${tempMax > 34 ? "high temperature" : "weather stress"} and ${targetPests[0] || "pest"} risks.`,
      `Unchecked stress at this critical juncture can permanently diminish leaf canopy and final yield potential.`,
      `We recommend ${pName} to reinforce natural plant vigor and halt stress-induced damage.`,
      `This keeps your crop healthy and resilient, securing your harvest weight and farm investment.`,
    ];
  }

  return {
    headlineEn: `Why ${pName} is Recommended for Your Field`,
    headlineHi: `यह दवा (${pName}) आपके खेत के लिए क्यों चुनी गई?`,
    linesEn,
    linesHi,
    jargonTranslationEn: jargonEn,
    jargonTranslationHi: jargonHi,
  };
}

/**
 * 2. THE "HOW" GENERATOR (3-4 lines maximum)
 * Explains: Mixing ratio + Pump counts + Morning/Evening Timing + Technique.
 */
export function generateFarmerHowExplanation(params: {
  productName: string;
  doseDisplay: string;
  acres: number;
  totalWaterLiters: number;
  knapsackTanks: number;
  dosePerTank: number;
  doseUnit: string;
  timingEn: string;
  timingHi: string;
  isHindi: boolean;
}): FarmerHowAdvice {
  const {
    productName,
    acres,
    totalWaterLiters,
    knapsackTanks,
    dosePerTank,
    doseUnit,
  } = params;

  const pName = productName.replace(/®|™/g, "");

  if (totalWaterLiters <= 0) {
    // Granular broadcast product
    return {
      headlineEn: `How to Apply ${pName} on Your Field`,
      headlineHi: `${pName} का खेत में सही उपयोग का तरीका`,
      stepsHi: [
        {
          title: "मात्रा व रेत मिलाव",
          desc: `अपने ${acres} एकड़ खेत के लिए पूरी दवा को 25-30 किलो सूखी भुरभुरी रेत या डीएपी खाद के साथ अच्छी तरह मिला लें।`,
        },
        {
          title: "बिखेरने का समय",
          desc: "सुबह या शाम के समय पौधों की जड़ों के पास समान रूप से छिटकें। तेज हवा में न बिखेरें।",
        },
        {
          title: "सिंचाई की आवश्यकता",
          desc: "दवा डालने के 24 घंटे के भीतर हल्की सिंचाई दें ताकि दाने घुलकर जड़ों तक पहुंच सकें।",
        },
        {
          title: "सावधानी",
          desc: "हाथ में दस्ताने पहनें और दवा बिखेरने के बाद हाथों को साबुन से अच्छी तरह धोएं।",
        },
      ],
      stepsEn: [
        {
          title: "Dosage & Sand Mix",
          desc: `Blend the total product evenly with 25-30 kg of dry fine sand or dry fertilizer for your ${acres} acres.`,
        },
        {
          title: "Application Timing",
          desc: "Broadcast evenly near plant root zones in calm morning or evening hours.",
        },
        {
          title: "Irrigation Requirement",
          desc: "Provide light irrigation within 24 hours of application to dissolve active granules into root zones.",
        },
        {
          title: "Safety Practice",
          desc: "Wear protective gloves during broadcast and wash hands thoroughly with soap afterward.",
        },
      ],
    };
  }

  return {
    headlineEn: `How to Apply ${pName} Correctly on Your Field`,
    headlineHi: `${pName} का सही घोल व छिड़काव का तरीका`,
    stepsHi: [
      {
        title: "पंप में दवा नापें",
        desc: `15 लीटर वाले स्प्रे पंप (टैंकी) में साफ पानी लें और ठीक ${dosePerTank} ${doseUnit} दवा नापकर घोलें। आपके ${acres} एकड़ के लिए कुल ~${knapsackTanks} पंप पानी लगेगा।`,
      },
      {
        title: "छिड़काव का सही समय",
        desc: "हमेशा सुबह 7 से 10 बजे या शाम 4:30 बजे के बाद ही स्प्रे करें। दोपहर की तेज धूप में कभी छिड़काव न करें, क्योंकि धूप में दवा वाष्प बनकर उड़ जाती है।",
      },
      {
        title: "खेत की नमी की जांच",
        desc: "खेत में छिड़काव के समय जमीन में हल्की नमी (ओट) होनी चाहिए। अगर तेज हवा चल रही हो या तुरंत बारिश आने वाली हो, तो स्प्रे रोक दें।",
      },
      {
        title: "स्प्रे करने की तकनीक",
        desc: "स्प्रे नोजल से पौधों के पत्तों के ऊपर व नीचे दोनों तरफ बारीक धुंध (mist) बनाकर तर करें ताकि कोई कोना सूखा न छूटे।",
      },
    ],
    stepsEn: [
      {
        title: "Tank Dilution Ratio",
        desc: `Fill a 15-liter knapsack tank with clean water and mix exactly ${dosePerTank} ${doseUnit} of product. Your ${acres} acres will require ~${knapsackTanks} full tanks (~${totalWaterLiters} L water).`,
      },
      {
        title: "Optimal Spray Window",
        desc: "Spray strictly in the morning (7–10 AM) or late evening (after 4:30 PM). Never spray in harsh midday sun, as heat rapidly evaporates droplets.",
      },
      {
        title: "Field Soil Condition",
        desc: "Ensure adequate root zone soil moisture before spraying. Pause application if high winds or immediate rainfall is expected.",
      },
      {
        title: "Foliar Coverage",
        desc: "Direct a fine hollow-cone mist to cover both upper and underside leaf canopies evenly for complete translaminar absorption.",
      },
    ],
  };
}

/**
 * 3. SOIL TYPE PERSONALIZATION ENGINE
 * Explains how the farmer's specific soil behaves with this treatment.
 */
export function getSoilTypePersonalization(soilTypeRaw: string): SoilPersonalization {
  const s = (soilTypeRaw || "").toLowerCase();

  if (s.includes("black") || s.includes("kali") || s.includes("vertisol") || s.includes("clay")) {
    return {
      soilCategory: "black",
      soilLabelEn: "Medium to Deep Black Clay Soil (Vertisol)",
      soilLabelHi: "काली कपास मिट्टी (रेगुर / वर्टिसोल)",
      guidanceEn:
        "Your heavy black soil holds moisture and nutrients for an extended duration. Focus foliar spray strictly on leaf surfaces without runoff to the soil, as systemic absorption will remain active for up to 14 days.",
      guidanceHi:
        "आपकी भारी काली मिट्टी में पानी व पोषक तत्व लंबे समय तक टिकते हैं। स्प्रे करते समय पत्तियों पर ही ध्यान दें, जमीन पर दवा व्यर्थ न बहाएं। यह खुराक आपके खेत के लिए पूरी तरह पर्याप्त है।",
      waterAdviceEn: "Avoid spraying when soil is sticky mud; apply when soil is in workable moisture condition.",
      waterAdviceHi: "खेत में कीचड़ होने पर स्प्रे न करें; जब मिट्टी में चलने लायक हल्की ओट हो तभी छिड़काव करें।",
    };
  }

  if (s.includes("sand") || s.includes("balui") || s.includes("retili") || s.includes("arid")) {
    return {
      soilCategory: "sandy",
      soilLabelEn: "Sandy / Light Loam Soil",
      soilLabelHi: "बलुई / हल्की दोमट मिट्टी",
      guidanceEn:
        "Your sandy soil dries rapidly and leaches water fast. Apply the full recommended water volume (150–200 L/acre) strictly in the evening so leaves drink the medicine overnight before soil moisture recedes.",
      guidanceHi:
        "आपकी बलुई मिट्टी में नमी जल्दी सूखती है। इसलिए पानी की मात्रा पूरी रखें (150-200 लीटर/एकड़) और शाम को छिड़काव करें ताकि दवा सूखने से पहले पत्तियों द्वारा पूरी सोख ली जाए।",
      waterAdviceEn: "Maintain light regular irrigation so crop roots remain active to transport nutrients.",
      waterAdviceHi: "हल्की सिंचाई जल्दी-जल्दी दें ताकि पौधे की जड़ें दवा को ऊपर तक खींच सकें।",
    };
  }

  if (s.includes("red") || s.includes("lal") || s.includes("laterite") || s.includes("alfisol")) {
    return {
      soilCategory: "red",
      soilLabelEn: "Red / Laterite Soil (Alfisol)",
      soilLabelHi: "लाल / लेटराइट दोमट मिट्टी",
      guidanceEn:
        "Your red soil has low organic carbon and moderate moisture retention. Performing application 24 hours after a light irrigation ensures crop tissues are fully turgid for rapid chemical uptake.",
      guidanceHi:
        "आपकी लाल मिट्टी में नमी प्रतिधारण कम रहता है। हल्की सिंचाई के 24 घंटे बाद छिड़काव करें ताकि पौधे के ऊतक दवा को तेजी से अपना सकें।",
      waterAdviceEn: "Ensure soil is damp around root collars before commencing foliar treatments.",
      waterAdviceHi: "जड़ों के पास मिट्टी में नमी सुनिश्चित करने के बाद ही पत्तियों पर छिड़काव शुरू करें।",
    };
  }

  // Alluvial / Loam (Default for Indo-Gangetic Plains & general agricultural lands)
  return {
    soilCategory: "alluvial",
    soilLabelEn: "Alluvial Fertile Loam Soil (Inceptisol)",
    soilLabelHi: "उपजाऊ जलोढ़ दोमट मिट्टी",
    guidanceEn:
      "Your alluvial loam soil provides optimal balanced aeration and root uptake. Standard dilution provides maximum efficiency with zero risk of leaf phytotoxicity.",
    guidanceHi:
      "आपकी दोमट मिट्टी में फसल की जड़ें व पत्ते दवा को सबसे संतुलित तरीके से सोखते हैं। अनुशंसित खुराक से फसल 48 घंटों में पूरी तरह सुरक्षित हो जाएगी।",
    waterAdviceEn: "Ideal soil structure ensures maximum pesticide translocation with standard water volume.",
    waterAdviceHi: "उत्तम मिट्टी की संरचना दवा के असर को पूरे पौधे में तेजी से पहुंचाती है।",
  };
}

/**
 * 4. GENERAL CULTURAL RECOMMENDATIONS (SQUARE BOX)
 * Pure agricultural / cultural practices — ZERO chemicals, ZERO biological products.
 * Free farming techniques (Irrigation, hoeing, drainage, scouting) that save yield.
 */
export function getGeneralCulturalRecommendations(params: {
  cropKey: string;
  growthStage: string;
  tempMax?: number;
  rainProb?: number;
  soilTypeRaw?: string;
  isHindi: boolean;
}): GeneralCulturalAdvisory | null {
  const { cropKey, growthStage, tempMax = 35, rainProb = 10, soilTypeRaw = "" } = params;

  const isHot = tempMax >= 34;
  const isWet = rainProb >= 60;
  const isSandy = soilTypeRaw.toLowerCase().includes("sand") || soilTypeRaw.toLowerCase().includes("balui");

  // Always produce rich, non-chemical, actionable cultural recommendations
  const practicesHi: { icon: string; title: string; text: string }[] = [];
  const practicesEn: { icon: string; title: string; text: string }[] = [];

  // Practice 1: Irrigation management based on climate
  if (isHot) {
    practicesHi.push({
      icon: "💧",
      title: "शाम की हल्की सिंचाई (ठंडक बनाए रखें)",
      text: "दोपहर की लू से बचाने के लिए शाम 5 बजे के बाद नालियों में हल्की सिंचाई दें (खेत में पानी भरने न दें)। इससे मिट्टी का तापमान 2 से 3°C तक कम रहता है और जड़ें ठंडी रहती हैं।",
    });
    practicesEn.push({
      icon: "💧",
      title: "Evening Furrow Cooling Irrigation",
      text: "Provide light furrow irrigation after 5:00 PM to cool the root canopy zone by 2–3°C during daytime heatwaves. Do not allow water to stand stagnant.",
    });
  } else if (isWet) {
    practicesHi.push({
      icon: "🌊",
      title: "जल निकासी नालियों की सफाई",
      text: "बारिश के बाद खेत की मेड़ों के निकास खोलें ताकि जड़ों के पास 6 घंटे से ज्यादा पानी जमा न रहे। ठहरा हुआ पानी जड़ों को सड़ा देता है।",
    });
    practicesEn.push({
      icon: "🌊",
      title: "Field Drainage Clearance",
      text: "Keep drainage outlets clear so standing water drains within 6 hours of rain, preventing root asphyxiation and collar rot.",
    });
  } else {
    practicesHi.push({
      icon: "💧",
      title: "संतुलित नमी चक्र",
      text: "फूल व फल बनते समय खेत में सूखा न पड़ने दें। जमीन में दरारें दिखने से पहले ही हल्का पानी लगाएं।",
    });
    practicesEn.push({
      icon: "💧",
      title: "Balanced Moisture Scheduling",
      text: "Do not let soil crack during flowering and grain/pod development. Apply light irrigation before surface moisture drops below 20%.",
    });
  }

  // Practice 2: Soil crust breaking or mulching
  if (isSandy || isHot) {
    practicesHi.push({
      icon: "🌾",
      title: "कतारों के बीच मल्चिंग (नमी सुरक्षा)",
      text: "यदि संभव हो तो दो कतारों के बीच में सूखी घास, धान की पराली या गन्ने की सूखी पत्तियां बिछाएं। इससे जमीन की नमी धूप में नहीं उड़ती और खरपतवार भी नहीं उगते।",
    });
    practicesEn.push({
      icon: "🌾",
      title: "Inter-Row Organic Mulching",
      text: "Spread dry straw, leaves, or crop residue between plant rows to shade the soil surface, cutting evaporation loss by up to 40% and suppressing weeds.",
    });
  } else {
    practicesHi.push({
      icon: "⛏️",
      title: "हल्की गुड़ाई (पपड़ी तोड़ना)",
      text: "सिंचाई या बारिश के 3-4 दिन बाद हल्की खुरपी या कल्टीवेटर से मिट्टी की ऊपरी पपड़ी तोड़ दें। इससे जड़ों को खुली हवा मिलती है और केंचुए सक्रिय होते हैं।",
    });
    practicesEn.push({
      icon: "⛏️",
      title: "Soil Surface Aeration",
      text: "Perform shallow hoeing 3–4 days after irrigation to break surface soil crusting, enhancing soil oxygen flow and preserving capillary water.",
    });
  }

  // Practice 3: Crop-specific cultural habit
  if (cropKey === "maize") {
    practicesHi.push({
      icon: "🔍",
      title: "सुबह 8 बजे पोंगा निरीक्षण (W-Pattern)",
      text: "खेत में अंग्रेजी के 'W' आकार में चलकर 20 पौधों के पोंगे को देखें। यदि पत्तों पर सुई जैसे छेद या बुरादा दिखे, तभी तुरंत छिड़काव का फैसला लें।",
    });
    practicesEn.push({
      icon: "🔍",
      title: "Morning Whorl Scouting (W-Pattern)",
      text: "Walk a 'W' path across your field early morning and inspect 20 random whorls. Look for pinhole punctures or fresh sawdust-like frass before caterpillars enter deep.",
    });
  } else if (cropKey === "cotton") {
    practicesHi.push({
      icon: "🌿",
      title: "निचली पीली पत्तियों की छंटाई",
      text: "पौधों के नीचे की सड़ी-गली या जमीन छूने वाली पीली पत्तियों को हटा दें। इससे नीचे हवा और धूप पहुंचेगी और सफेद मक्खी व रसचूसक कीट नहीं पनपेंगे।",
    });
    practicesEn.push({
      icon: "🌿",
      title: "Lower Canopy Airflow Pruning",
      text: "Remove decaying lower leaves touching the ground to improve sunlight penetration and air circulation, deterring whitefly and sucking pests.",
    });
  } else if (cropKey === "sugarcane") {
    practicesHi.push({
      icon: "🎋",
      title: "सूखी पत्तियों की डी-ट्रैशिंग (छिलाई)",
      text: "गन्ने के निचले तने से सूखी पत्तियों को उतारकर कतारों में बिछा दें। इससे तने पर धूप लगती है, कीड़े छिप नहीं पाते और हवा का संचार बेहतर होता है।",
    });
    practicesEn.push({
      icon: "🎋",
      title: "Cane De-Trashing & Light Management",
      text: "Strip dry lower leaves from cane stalks and lay them in furrows as mulch. This exposes lower nodes to sunlight and denies hiding shelter to stem borers.",
    });
  } else {
    practicesHi.push({
      icon: "☀️",
      title: "मित्र कीटों का संरक्षण",
      text: "खेत की मेड़ों पर गेंदा (Marigold) या मक्का की कतारें लगाएं। ये लेडीबर्ड बीटल और परभक्षी कीटों को आकर्षित करते हैं जो नुकसानदेह कीड़ों को प्राकृतिक रूप से खा जाते हैं।",
    });
    practicesEn.push({
      icon: "☀️",
      title: "Beneficial Insect Habitat",
      text: "Plant marigold or border maize rows along field bunds to harbor ladybird beetles and predatory wasps that naturally suppress harmful pest populations.",
    });
  }

  return {
    headlineEn: "Zero-Cost Cultural Farm Practices",
    headlineHi: "खेत प्रबंधन देसी सलाह (बिना किसी दवा के खर्च के)",
    subtitleEn: "Simple agronomic habits that protect yield without spending a single rupee on inputs.",
    subtitleHi: "बिना किसी अतिरिक्त दवा खर्च के अपनी फसल की उपज व जड़ों को मजबूत रखने के आसान देशी तरीके।",
    practicesEn,
    practicesHi,
  };
}
