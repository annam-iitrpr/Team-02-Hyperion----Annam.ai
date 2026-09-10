"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CloudSun,
  CloudRain,
  Camera,
  Leaf,
  Mic,
  Phone,
  Play,
  ShieldCheck,
  Sparkles,
  Sprout,
  Store,
  TrendingUp,
  UserPlus,
  Compass,
  Cpu,
  Droplets,
  Wind,
  Thermometer,
  Layers,
  MessageCircle,
  Clock,
  Award,
  Globe,
  Check,
  FileText,
  X,
  Smartphone,
  Download,
  Share2,
} from "lucide-react";
import { KrishyantraNavbar } from "@/components/KrishyantraNavbar";
import { KrishyantraFooter } from "@/components/KrishyantraFooter";
import { PhoneMockup } from "@/components/PhoneMockup";
import { useLanguage } from "@/context/LanguageContext";
import { isUserLoggedIn } from "@/lib/userStore";

const KRISHYANTRA_SLOGANS: Record<string, { line1: string; line2: string; line3: string; desc: string }> = {
  en: {
    line1: "Right Information.",
    line2: "Right Decisions.",
    line3: "Better Harvest.",
    desc: "Your AI-powered farming companion that understands your field, weather and crop — and gives simple, actionable advice."
  },
  hi: {
    line1: "सही जानकारी.",
    line2: "सही फ़ैसला.",
    line3: "बेहतर फसल.",
    desc: "आपका AI-संचालित कृषि साथी जो आपके खेत, मौसम और फसल को समझता है — और आपको समय पर सही खेती के फैसले लेने में मदद करता है।"
  },
  mr: {
    line1: "योग्य माहिती.",
    line2: "योग्य निर्णय.",
    line3: "उत्तम पीक.",
    desc: "तुमचा AI-चालित शेती मित्र जो तुमचे शेत, हवामान आणि पीक समजून घेतो — आणि योग्य वेळी अचूक निर्णय घेण्यास मदत करतो."
  },
  pa: {
    line1: "ਸਹੀ ਜਾਣਕਾਰੀ।",
    line2: "ਸਹੀ ਫੈਸਲਾ।",
    line3: "ਬਿਹਤਰ ਫਸਲ।",
    desc: "ਤੁਹਾਡਾ AI-ਸੰਚਾਲਿਤ ਖੇਤੀ ਸਾਥੀ ਜੋ ਤੁਹਾਡੇ ਖੇਤ, ਮੌਸਮ ਅਤੇ ਫਸਲ ਨੂੰ ਸਮਝਦਾ ਹੈ — ਅਤੇ ਸਮੇਂ ਸਿਰ ਸਹੀ ਫੈਸਲੇ ਲੈਣ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹੈ।"
  },
  gu: {
    line1: "સાચી માહિતી.",
    line2: "સાચો નિર્ણય.",
    line3: "બહેતર પાક.",
    desc: "તમારો AI-આધારિત ખેતી સાથી જે તમારા ખેતર, હવામાન અને પાકને સમજે છે — અને સમયસર યોગ્ય નિર્ણય લેવામાં મદદ કરે છે."
  },
  te: {
    line1: "సరైన సమాచారం.",
    line2: "సరైన నిర్ణయం.",
    line3: "మెరుగైన పంట.",
    desc: "మీ పొలం, వాతావరణం మరియు పంటను అర్థం చేసుకునే మీ AI వ్యవసాయ మిత్రుడు — సకాలంలో సరైన నిర్ణయాలు తీసుకోవడంలో సహాయపడుతుంది."
  },
  ta: {
    line1: "சரியான தகவல்.",
    line2: "சரியான முடிவு.",
    line3: "சிறந்த விளைச்சல்.",
    desc: "உங்கள் பண்ணை, வானிலை மற்றும் பயிரைப் புரிந்துகொள்ளும் உங்கள் AI விவசாயத் தோழன் — சரியான நேரத்தில் சரியான முடிவுகளை எடுக்க உதவுகிறது."
  },
  kn: {
    line1: "ಸರಿಯಾದ ಮಾಹಿತಿ.",
    line2: "ಸರಿಯಾದ ನಿರ್ಧಾರ.",
    line3: "ಉತ್ತಮ ಬೆಳೆ.",
    desc: "ನಿಮ್ಮ ಜಮೀನು, ಹವಾಮಾನ ಮತ್ತು ಬೆಳೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವ ನಿಮ್ಮ AI ಕೃಷಿ ಸಂಗಾತಿ — ಸಕಾಲದಲ್ಲಿ ಸರಿಯಾದ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ."
  },
  ml: {
    line1: "ശരിയായ വിവരം.",
    line2: "ശരിയായ തീരുമാനം.",
    line3: "മികച്ച വിളവ്.",
    desc: "നിങ്ങളുടെ കൃഷിയിടവും കാലാവസ്ഥയും വിളയും മനസ്സിലാക്കുന്ന നിങ്ങളുടെ AI കാർഷിക സഹായി — കൃത്യസമയത്ത് ശരിയായ തീരുമാനങ്ങളെടുക്കാൻ സഹായിക്കുന്നു."
  },
  bn: {
    line1: "সঠিক তথ্য.",
    line2: "সঠিক সিদ্ধান্ত.",
    line3: "উন্নত ফসল.",
    desc: "আপনার এআই-চালিত কৃষি সঙ্গী যা আপনার জমি, আবহাওয়া ও ফসল বোঝে — এবং সময়মতো সঠিক সিদ্ধান্ত নিতে সহায়তা করে।"
  },
  or: {
    line1: "ସଠିକ୍ ତଥ୍ୟ.",
    line2: "ସଠିକ୍ ନିଷ୍ପତ୍ତି.",
    line3: "ଉନ୍ନତ ଫସଲ.",
    desc: "ଆପଣଙ୍କ AI-ଚାଳିତ କୃଷି ସାଥୀ ଯାହା ଆପଣଙ୍କ ଜମି, ପାଣିପାଗ ଏବଂ ଫସଲକୁ ବୁଝିଥାଏ — ଏବଂ ସମୟରେ ସଠିକ୍ ନିଷ୍ପତ୍ତି ନେବାରେ ସାହାଯ୍ୟ କରେ।"
  },
  as: {
    line1: "সঠিক তথ্য.",
    line2: "সঠিক সিদ্ধান্ত.",
    line3: "উন্নত শস্য.",
    desc: "আপোনাৰ AI-চালিত কৃষি সংগী যিয়ে আপোনাৰ পथाৰ, বতৰ আৰু শস্য বুজি পায় — আৰু সময়মতে সঠিক সিদ্ধান্ত লোৱাত সহায় কৰে।"
  }
};

export default function LandingPage() {
  const router = useRouter();
  const { language, isChangingLanguage } = useLanguage();
  const slogan = KRISHYANTRA_SLOGANS[language] || (language === "en" ? KRISHYANTRA_SLOGANS.en : KRISHYANTRA_SLOGANS.hi);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [installModalOpen, setInstallModalOpen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [selectedFeature, setSelectedFeature] = useState<{
    id: string;
    icon: React.ReactNode;
    iconBg: string;
    title: string;
    desc: string;
    tag: string;
    summary: string;
    bullets: string[];
    farmerImpact: string;
  } | null>(null);

  useEffect(() => {
    setIsLoggedIn(isUserLoggedIn());
  }, []);

  // Capture PWA beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const triggerPwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstallModalOpen(false);
      }
      setDeferredPrompt(null);
    }
  };

  // Auth Protection: Any action taking user data directs unauthenticated users to signup/login
  const handleActionClick = (target: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isLoggedIn) {
      if (target === "whatsapp") {
        window.open("https://wa.me/15556694548?text=Namaste", "_blank", "noopener,noreferrer");
      } else if (target.startsWith("http")) {
        window.open(target, "_blank", "noopener,noreferrer");
      } else {
        router.push(target);
      }
    } else {
      router.push(`/signup?redirect=${encodeURIComponent(target)}`);
    }
  };

  const isHindi = language === "hi";

  // 6 Core Agricultural Features (Target Reference Faithful — Zero external links, pure in-place short description)
  const features = [
    {
      id: "climate",
      icon: <CloudRain className="w-6 h-6 text-sky-600" />,
      iconBg: "bg-sky-50",
      title: isHindi ? "जलवायु तनाव पूर्व चेतावनी" : "Climate Stress Early Warning",
      desc: isHindi
        ? "नुकसान होने से पहले ही गर्मी, सूखे या भारी बारिश के जोखिम को जानें।"
        : "Know heat, drought or heavy rain risk before damage happens.",
      tag: isHindi ? "1 कदम आगे रहें" : "Stay 1 step ahead",
      summary: isHindi
        ? "उपग्रह और बायोफिजिकल मौसम मॉडल जो फसल में नुकसान होने से 48 से 72 घंटे पहले ही अत्यधिक लू, सूखा और भारी बारिश की सटीक पूर्व चेतावनी देते हैं।"
        : "Advanced biophysical and satellite models that forecast extreme heatwaves, drought dry spells, and heavy rainstorms 48 to 72 hours before visible crop damage occurs.",
      bullets: isHindi
        ? [
            "48-72 घंटे पहले लू (Heatwave) और सूखे का सटीक अलर्ट।",
            "मिट्टी की नमी और वाष्प दबाव (VPD) की 24/7 स्वचालित निगरानी।",
            "सेलुलर शॉक से पहले फसल सुरक्षात्मक स्प्रे की समयबद्ध सिफारिश।"
          ]
        : [
            "48-72h predictive early warning for heatwaves, drought, and heavy downpours.",
            "Monitors real-time soil moisture depletion & Vapor Pressure Deficit (VPD).",
            "Recommends protective foliar osmoprotectants before cellular shock occurs."
          ],
      farmerImpact: isHindi
        ? "फूल झड़ने और पत्तियों के जलने से बचाता है, फसल की 20-25% तक संभावित हानि रोकता है।"
        : "Prevents sudden flower drop and leaf scorch, safeguarding up to 25% of potential harvest loss."
    },
    {
      id: "advisor",
      icon: <Sprout className="w-6 h-6 text-[#2d6a4f]" />,
      iconBg: "bg-[#e8f5e9]",
      title: isHindi ? "व्यक्तिगत जैविक सलाहकार" : "Personalised Biological Advisor",
      desc: isHindi
        ? "अपने खेत के लिए सही उत्पाद, सही मात्रा और सबसे उपयुक्त समय पाएं।"
        : "Get the right product, exact dosage, and best time for your field.",
      tag: isHindi ? "सही इनपुट, सही परिणाम" : "Right input, right result",
      summary: isHindi
        ? "आपकी फसल, उसकी विकास अवस्था (वानस्पतिक/फूल/फल) और वर्तमान तनाव के अनुसार सिंजेंटा के प्रमाणित जैविक उत्पादों की सही मात्रा व उपयोग का समय बताता है।"
        : "Matches verified Syngenta biological products (Quantis, Isabion, Megafol) specifically to your crop, developmental growth stage, and current abiotic stress levels.",
      bullets: isHindi
        ? [
            "जड़ और पत्तियों के स्वास्थ्य के लिए सर्वोत्तम जैविक सक्रिय तत्वों की पहचान।",
            "दवा की बर्बादी रोकने के लिए प्रति एकड़ और प्रति पंप सटीक पानी व घोल का अनुपात।",
            "भारतीय खेतों और फसलों के लिए CIB&RC प्रमाणित सुरक्षित जैविक शेड्यूल।"
          ]
        : [
            "Identifies optimal biological active ingredients for root and shoot health.",
            "Specifies exact dilution ratio per pump and acre to eliminate input wastage.",
            "CIB&RC approved bio-stimulant schedules verified on Indian farms."
          ],
      farmerImpact: isHindi
        ? "सही समय पर सही जैविक दवा डालकर अनावश्यक खर्च घटाता है और फसल की प्रतिरोधक क्षमता बढ़ाता है।"
        : "Saves input costs by applying bio-stimulants at the exact biological moment of maximum uptake."
    },
    {
      id: "diagnostics",
      icon: <Camera className="w-6 h-6 text-emerald-600" />,
      iconBg: "bg-emerald-50",
      title: isHindi ? "पत्ती व रोग पहचान" : "Leaf & Disease Diagnostics",
      desc: isHindi
        ? "एक फोटो लें और तुरंत जानें कि आपके पौधे में क्या समस्या हो सकती है।"
        : "Take a photo and know what might be wrong with your plant.",
      tag: isHindi ? "त्वरित पहचान" : "Instant diagnosis",
      summary: isHindi
        ? "स्मार्टफोन से ली गई पत्ती या पौधे की फोटो का तुरंत AI विश्लेषण, जो सेकंडों में फफूंद, रस चूसक कीट, वायरस या पोषक तत्वों की कमी की पहचान करता है।"
        : "Instant AI visual diagnosis from smartphone photos to detect fungal blights, viral mottling, pest attacks, and micronutrient deficiencies in seconds.",
      bullets: isHindi
        ? [
            "किसी भी साधारण मोबाइल कैमरे से तुरंत तेज और सटीक रोग स्कैनिंग।",
            "पूरे खेत में बीमारी फैलने से पहले शुरुआती दौर में ही सटीक पहचान।",
            "स्थानीय भाषा में जैविक, घरेलू और रासायनिक उपचार के स्पष्ट निर्देश।"
          ]
        : [
            "Instant scan from any mobile camera with high diagnostic accuracy.",
            "Pinpoints early disease stages before widespread field infestation.",
            "Provides immediate organic remedies, tank-mix guidance, and chemical options."
          ],
      farmerImpact: isHindi
        ? "रोग को शुरुआती चरण में रोककर बेवजह कीटनाशक खर्च में ₹3,000–₹8,000 प्रति एकड़ की सीधी बचत।"
        : "Stops pest and disease epidemics early, saving ₹3,000–₹8,000 per acre in unnecessary chemical sprays."
    },
    {
      id: "weather",
      icon: <CloudSun className="w-6 h-6 text-amber-600" />,
      iconBg: "bg-amber-50",
      title: isHindi ? "मौसम व स्प्रे विंडो" : "Weather & Spray Window",
      desc: isHindi
        ? "14-दिन का सटीक खेत पूर्वानुमान और सुरक्षित छिड़काव/सिंचाई का समय।"
        : "Hyperlocal 14-day forecast and safe spray/irrigation timing.",
      tag: isHindi ? "खेत-स्तरीय मौसम" : "Field-level weather",
      summary: isHindi
        ? "14-दिन का सटीक खेत-स्तरीय मौसम पूर्वानुमान और डेल्टा-टी आधारित स्प्रे गेटिंग, जो बताता है कि कब छिड़काव करना सुरक्षित है और कब दवा बहने या उड़ने का खतरा है।"
        : "Hyperlocal 14-day agricultural forecast combined with real-time biophysical Delta-T gating so you spray only when droplets absorb effectively.",
      bullets: isHindi
        ? [
            "दवा उड़ने या वाष्पीकरण से बचाने के लिए डेल्टा-टी (°C) और हवा की गति की जांच।",
            "तेज हवा (>15 किमी/घंटा) में ड्रिफ्ट और दवा बर्बादी रोकने का स्पष्ट अलर्ट।",
            "48 घंटे की बारिश का सटीक पूर्वानुमान ताकि महंगी दवा पानी में न बहे।"
          ]
        : [
            "Monitors live Delta-T (°C) to prevent droplet evaporation or high-humidity runoff.",
            "Wind speed gating (<15 km/h) to eliminate spray drift to non-target areas.",
            "48-hour rain washoff forecast guarantees your expensive sprays stay on the leaf."
          ],
      farmerImpact: isHindi
        ? "छिड़काव का 100% पूरा असर मिलता है, दवा का एक भी रुपया बर्बाद नहीं होता और फसल जलने से बचती है।"
        : "Zero wasted sprays: every rupee spent on foliar inputs delivers 100% absorption without chemical scorch."
    },
    {
      id: "yield",
      icon: <TrendingUp className="w-6 h-6 text-[#2d6a4f]" />,
      iconBg: "bg-[#e8f5e9]",
      title: isHindi ? "पैदावार लाभ व ROBI" : "Yield Impact & ROBI",
      desc: isHindi
        ? "अपेक्षित पैदावार वृद्धि और वास्तविक लाभ प्रभाव का सटीक अनुमान देखें।"
        : "See expected yield improvement and profitability impact.",
      tag: isHindi ? "मुनाफे का सटीक हिसाब" : "Know your returns",
      summary: isHindi
        ? "माइक्रोसॉफ्ट EconML कॉज़ल डबल मशीन लर्निंग मॉडल जो आपकी फसल और खेत के आकार के आधार पर जैविक उपचार से होने वाले शुद्ध मुनाफे (ROBI) का रुपया-दर-रुपया हिसाब दिखाता है।"
        : "Causal Double Machine Learning (Microsoft EconML) benchmarks your baseline yield and calculates the true net Return on Biological Investment (ROBI).",
      bullets: isHindi
        ? [
            "सिंचाई के प्रकार, खेत के आकार और मिट्टी की बनावट के आधार पर सटीक विश्लेषण।",
            "देश की 50+ प्रमुख कृषि मंडियों के वास्तविक लाइव भावों के साथ जुड़ाव।",
            "प्रति एकड़ शुद्ध बचत (₹) और निवेश पर लाभ (ROBI मल्टीप्लायर) का पारदर्शी हिसाब।"
          ]
        : [
            "Controls for irrigation, soil clay %, and farm size confounders.",
            "Live Mandi price integration across 50+ APMC markets in India.",
            "Shows transparent net profit projections (₹/acre) and benefit-to-cost multipliers."
          ],
      farmerImpact: isHindi
        ? "कोई भी कृषि उत्पाद खरीदने से पहले ही किसान को उसके संभावित आर्थिक लाभ का स्पष्ट और प्रामाणिक भरोसा।"
        : "Gives farmers confidence by showing verifiable economic returns before making any input purchase."
    },
    {
      id: "voice",
      icon: <Mic className="w-6 h-6 text-emerald-700" />,
      iconBg: "bg-emerald-50",
      title: isHindi ? "वॉइस सहायक (12+ भारतीय भाषाएं)" : "Voice Assistant (In 12+ Languages)",
      desc: isHindi
        ? "हिंदी, मराठी, तेलुगु व अन्य भाषाओं में बोलकर खेती की सलाह लें।"
        : "Ask anything by voice in Hindi, Marathi, Telugu and more.",
      tag: isHindi ? "केवल बोलें, टाइपिंग नहीं" : "Just speak, no typing",
      summary: isHindi
        ? "गूगल जेमिनी 2.5 और उच्च-गुणवत्ता वॉयस तकनीक से संचालित सहायक — बिना किसी टाइपिंग के सीधे अपनी स्थानीय मातृभाषा में बोलकर खेती के सभी सवालों के जवाब पाएं।"
        : "Interactive multilingual voice AI powered by Google Gemini and Chirp speech technology — speak naturally in your mother tongue without typing.",
      bullets: isHindi
        ? [
            "हिंदी, मराठी, पंजाबी, गुजराती, तेलुगु, तमिल सहित 12+ भाषाओं में स्वाभाविक बातचीत।",
            "मंडी भाव, खाद-कीटनाशक की मात्रा, मौसम और रोग नियंत्रण का तुरंत बोलकर उत्तर।",
            "खेत में काम करते हुए भी बिना हाथ रोके सुविधाजनक और सुलभ हैंड्स-फ्री उपयोग।"
          ]
        : [
            "Conversational audio in Hindi, Marathi, Telugu, Punjabi, Gujarati, and 7+ more.",
            "Ask about mandi prices, fertilizer doses, spray timing, or pest remedies.",
            "Designed for hands-free convenience directly on the field."
          ],
      farmerImpact: isHindi
        ? "हर किसान के लिए उन्नत कृषि विज्ञान को बिना किसी तकनीकी झंझट या टाइपिंग के बेहद सरल और सुलभ बनाता है।"
        : "Makes cutting-edge agricultural science accessible to every farmer, regardless of literacy level or tech familiarity."
    },
  ];

  // 5 Step Process (Target Reference Faithful)
  const steps = [
    {
      num: "01",
      icon: <Phone className="w-5 h-5 text-[#2d6a4f]" />,
      title: isHindi ? "कृषियंत्र खोलें" : "Open Krishyantra",
      desc: isHindi
        ? "बिना ऐप स्टोर डाउनलोड के सीधे अपने फोन ब्राउज़र में खोलें"
        : "Open on your phone (No app store needed)",
    },
    {
      num: "02",
      icon: <UserPlus className="w-5 h-5 text-[#2d6a4f]" />,
      title: isHindi ? "खाता बनाएं" : "Create your account",
      desc: isHindi
        ? "अपने मोबाइल नंबर से 10 सेकंड में निःशुल्क पंजीकरण करें"
        : "Sign up with your mobile number",
    },
    {
      num: "03",
      icon: <Sprout className="w-5 h-5 text-[#2d6a4f]" />,
      title: isHindi ? "अपना खेत जोड़ें" : "Add your farm",
      desc: isHindi
        ? "अपनी फसल, खेत का आकार और स्थान की जानकारी बताएं"
        : "Tell us about your crop, field and location",
    },
    {
      num: "04",
      icon: <Cpu className="w-5 h-5 text-[#2d6a4f]" />,
      title: isHindi ? "डेटा विश्लेषण" : "We analyse your data",
      desc: isHindi
        ? "हमारे AI मॉडल मौसम, मिट्टी व फसल स्थिति का सटीक अध्ययन करते हैं"
        : "Our AI models study weather, soil and crop conditions",
    },
    {
      num: "05",
      icon: <CheckCircle2 className="w-5 h-5 text-[#2d6a4f]" />,
      title: isHindi ? "सरल सलाह पाएं" : "Get simple advice",
      desc: isHindi
        ? "जानें क्या करना है, कब करना है और कितनी मात्रा में दवा डालनी है"
        : "See what to do, when to do and how much to use",
    },
  ];

  // FAQs
  const faqs = [
    {
      q: isHindi ? "कृषियंत्र क्या है?" : "What is Krishyantra?",
      a: isHindi
        ? "कृषियंत्र एक भारतीय किसानों के लिए समर्पित AI कृषि साथी है, जो आपके खेत के वास्तविक स्थान, मौसम और फसल की स्थिति को समझकर आपको सही समय पर सटीक और वैज्ञानिक फैसले लेने में मदद करता है।"
        : "Krishyantra is an AI-powered farming companion tailored for Indian agriculture. It understands your exact field coordinates, crop type, and hyperlocal weather to deliver timely, scientifically-verified guidance.",
    },
    {
      q: isHindi ? "क्या कृषियंत्र किसी भी सामान्य फोन पर काम करता है?" : "Can I use Krishyantra on any phone?",
      a: isHindi
        ? "हाँ! कृषियंत्र को किसी भारी ऐप डाउनलोड की आवश्यकता नहीं है। यह किसी भी स्मार्टफोन के ब्राउज़र में तुरंत खुलता है और कमजोर 2G/3G नेटवर्क पर भी सुचारू रूप से चलता है।"
        : "Yes! Krishyantra requires no bulky app store downloads. It opens instantly in any mobile browser, uses minimal data, and is engineered to perform reliably even on 2G and 3G rural network connections.",
    },
    {
      q: isHindi ? "कृषियंत्र मेरी खेती में कैसे मदद करता है?" : "How does Krishyantra help with my farm?",
      a: isHindi
        ? "यह आपको 14-दिन का सटीक मौसम पूर्वानुमान देता है, कीटनाशक/खाद छिड़कने का सबसे सुरक्षित समय बताता है, पत्ती की फोटो से रोग पहचानता है, और सरकारी APMC मंडियों के ताजा भाव दिखाता है ताकि आपकी लागत घटे और पैदावार सुरक्षित रहे।"
        : "Krishyantra provides a 14-day agrometeorological forecast, alerts you to safe spray windows to avoid chemical drift, diagnoses leaf diseases from photos, and tracks real APMC mandi prices to protect your crop and profit.",
    },
    {
      q: isHindi ? "क्या कृषियंत्र किसानों के लिए पूरी तरह निःशुल्क है?" : "Is Krishyantra free for farmers?",
      a: isHindi
        ? "हाँ, कृषियंत्र के मुख्य कृषि उपकरण—जैसे मौसम रडार, रोग पहचान, मंडी भाव और वॉइस सहायक—किसानों के लिए पूर्णतः निःशुल्क हैं।"
        : "Yes, Krishyantra's foundational agricultural tools—including weather forecasting, spray timing, visual disease detection, APMC mandi prices, and multilingual voice assistance—are completely free for farmers.",
    },
    {
      q: isHindi ? "कृषियंत्र कौन सी जानकारी का उपयोग करता है?" : "What information does Krishyantra use?",
      a: isHindi
        ? "यह आपके द्वारा चुने गए फसल प्रकार, बुआई की तारीख और मौसम उपग्रह डेटा का उपयोग करता है। हम किसी भी निजी जानकारी को सुरक्षित रखते हैं और इसे किसी तीसरे पक्ष को नहीं बेचते।"
        : "Krishyantra relies on your crop type, sowing timeline, and open agrometeorological satellite telemetry. All farmer data is kept confidential and is never shared or sold to third parties.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fcfdfa] text-[#1c2e24] font-sans antialiased selection:bg-[#2d6a4f] selection:text-white">
      
      {/* ── 1. Minimal Agricultural Navbar ───────────────────────────── */}
      <KrishyantraNavbar />

      {/* ── 2. HERO SECTION (Target Composition Faithful) ────────────── */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-16 sm:pb-24 bg-gradient-to-b from-white via-[#f7faf7] to-[#f0f6f1]">
        
        {/* Subtle Decorative Farm Field Texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#1b4332_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-center">
            
            {/* ── Left Column: Headline, Trust Indicators & CTAs ───────── */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-left">
              
              {/* Handwritten Brand Annotation (Faithful to Target) */}
              <div className="inline-block">
                <div className="relative font-serif italic text-sm sm:text-base font-semibold text-[#1b4332] tracking-wide rotate-[-2deg]">
                  <span>Meri Fasal · Mera Saathi · Krishyantra</span>
                  <svg className="absolute -bottom-2 left-0 w-full h-2 text-[#40916c]" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 25 0, 50 6 T 100 4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Large Bold Headline (Target Exact Hierarchy) */}
              <div className="space-y-1">
                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black tracking-[-0.03em] leading-[1.08] text-[#111827]">
                  <span>{slogan.line1}</span>
                  <br />
                  <span>{slogan.line2}</span>
                  <br />
                  <span className="text-[#1b4332] underline decoration-[#52b788]/60 decoration-wavy decoration-2">
                    {slogan.line3}
                  </span>
                </h1>
              </div>

              {/* Approachable, Honest Description */}
              <p className="text-base sm:text-lg text-[#374151] leading-relaxed max-w-xl">
                {slogan.desc}
              </p>

              {/* 5 Lightweight Trust & Capability Badges (Target Exact) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-2 pt-1 text-xs text-[#374151]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#e8f5e9] text-[#2d6a4f] shrink-0">
                    <Sprout className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold">{isHindi ? "भारतीय किसानों के लिए" : "Built for Indian Farmers"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#e8f5e9] text-[#2d6a4f] shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold">{isHindi ? "हर फोन पर उपलब्ध" : "Works on Any Phone"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#e8f5e9] text-[#2d6a4f] shrink-0">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold">{isHindi ? "ऐप डाउनलोड की जरूरत नहीं" : "No App Store File Required"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#e8f5e9] text-[#2d6a4f] shrink-0">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold">{isHindi ? "12+ भारतीय भाषाएं" : "Available in 12+ Languages"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#e8f5e9] text-[#2d6a4f] shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold">{isHindi ? "100% निःशुल्क" : "Free to Use"}</span>
                </div>
              </div>

              {/* Primary & Secondary Hero CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link
                  href={isLoggedIn ? "/dashboard" : "/signup"}
                  className="px-7 py-3.5 rounded-full bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-sm sm:text-base font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>{isLoggedIn ? "Open My Dashboard" : "Get Started Free"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => setInstallModalOpen(true)}
                  className="px-6 py-3.5 rounded-full bg-white hover:bg-[#e8f5e9]/40 border-2 border-[#2d6a4f]/25 hover:border-[#2d6a4f] text-[#1b4332] text-sm sm:text-base font-bold shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[#e8f5e9] text-[#2d6a4f] flex items-center justify-center">
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                  <span>{isHindi ? "वेबऐप इंस्टॉल करें" : "Install WebApp"}</span>
                </button>
              </div>

            </div>

            {/* ── Right Column: Standalone Realistic Smartphone ───── */}
            <div className="lg:col-span-6 relative flex items-center justify-center py-6 sm:py-10">
              
              {/* Soft Ambient Agricultural Glow behind Phone (Zero images, pure CSS glow) */}
              <div
                className="absolute w-72 sm:w-[420px] h-72 sm:h-[420px] rounded-full opacity-35 blur-3xl pointer-events-none -z-10"
                style={{ background: "radial-gradient(circle, #52b788 0%, #2d6a4f 45%, transparent 70%)" }}
              />

              {/* Realistic Krishyantra Phone Mockup */}
              <div className="relative z-10 w-full flex justify-center">
                <PhoneMockup onActionClick={(route) => handleActionClick(route)} />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. FEATURES SECTION (6-Card Agricultural Grid) ──────────── */}
      <section id="features" className="py-16 sm:py-24 bg-white border-y border-[#e5e7eb]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#111827]">
              Everything you need for your farm, in one place
            </h2>
            <p className="text-base text-slate-600">
              From understanding your field to making better farming decisions.
            </p>
          </div>

          {/* 6 Clean White Cards — Zero external links, in-place short description modal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedFeature(item)}
                className="rounded-3xl bg-white border border-[#e5e7eb] p-7 shadow-xs hover:shadow-xl hover:border-[#52b788] transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              >
                <div className="space-y-4">
                  {/* Icon with soft green/accent pill */}
                  <div className={`w-12 h-12 rounded-2xl ${item.iconBg} flex items-center justify-center transition-transform group-hover:scale-110 duration-200`}>
                    {item.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-[#111827] group-hover:text-[#1b4332] transition-colors">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* Bottom Tag Pill */}
                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center text-xs font-bold text-[#2d6a4f] bg-[#e8f5e9] px-3 py-1 rounded-full">
                    {item.tag}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFeature(item);
                    }}
                    className="text-slate-400 group-hover:text-[#1b4332] transition-colors cursor-pointer p-1"
                    aria-label={`View short description for ${item.title}`}
                  >
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 4. HOW IT WORKS (5-Step Visual Process) ───────────────────── */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-[#f8faf8] border-b border-[#e5e7eb]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Section Header with Handwritten Badge */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#111827]">
                How Krishyantra Works
              </h2>
              <p className="text-base text-slate-600">
                Get started in just a few simple steps.
              </p>
            </div>

            <div className="font-serif italic text-base font-bold text-[#2d6a4f] flex items-center gap-1.5">
              <span>Simple Steps · Big Impact</span>
              <svg className="w-14 h-3 text-[#40916c]" viewBox="0 0 60 10" preserveAspectRatio="none">
                <path d="M0 5 Q 30 0, 60 5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* 5 Step Process Grid with Connecting Arrows */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {steps.map((step, idx) => (
              <div
                key={step.num}
                className="relative rounded-2xl bg-white border border-[#e5e7eb] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#2d6a4f] transition-all"
              >
                <div className="space-y-3">
                  {/* Step Number Circle */}
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-full bg-[#1b4332] text-white flex items-center justify-center text-xs font-black font-mono shadow-xs">
                      {idx + 1}
                    </div>
                    <div className="p-2 rounded-xl bg-[#e8f5e9] text-[#2d6a4f]">
                      {step.icon}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[#111827] leading-snug">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Arrow indicator for desktop between items */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-slate-400">
                    <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                      <ArrowRight className="w-3 h-3 text-[#2d6a4f]" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 4.5 VIDEO SHOWCASE: FARMER PROBLEM & KRISHYANTRA SOLUTION ── */}
      <section id="problem-solution-video" className="py-16 sm:py-24 bg-gradient-to-b from-[#f8faf8] via-white to-[#f8faf8] border-b border-[#e5e7eb]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e8f5e9] text-[#2d6a4f] text-xs font-bold shadow-2xs">
              <Sprout className="w-3.5 h-3.5" />
              <span>{isHindi ? "खेत की असली समस्या और समाधान" : "Real Ground Realities & Solutions"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#111827]">
              {isHindi ? "किसान की हर समस्या — कृषियंत्र का समाधान" : "Every Farmer Has a Problem — Krishyantra Has the Solution"}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {isHindi
                ? "देखें कैसे कृषियंत्र भारतीय किसानों को वैज्ञानिक सलाह, सुरक्षित स्प्रे समय और सही फैसले लेने में मदद करता है।"
                : "Watch how Krishyantra solves daily field challenges with precision timing, weather radar, and crop intelligence."}
            </p>
          </div>

          <div className="relative max-w-[340px] sm:max-w-[380px] mx-auto">
            {/* Ambient Back Glow */}
            <div 
              className="absolute -inset-4 sm:-inset-6 rounded-[50px] bg-gradient-to-tr from-[#2d6a4f]/25 via-[#52b788]/20 to-[#e8f5e9]/40 blur-2xl -z-10 pointer-events-none" 
            />

            {/* Portrait Smartphone / Reel Container (Native 9:16) */}
            <div className="relative rounded-[36px] sm:rounded-[44px] overflow-hidden bg-black shadow-[0_30px_70px_-15px_rgba(27,67,50,0.4)] border-[6px] sm:border-[8px] border-slate-900 aspect-[9/16] ring-1 ring-black/10">
              {/* Subtle Camera Dynamic Island Notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full z-20 pointer-events-none flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-black/80 ring-1 ring-slate-800 mr-2" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
              </div>

              <video
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-cover rounded-[28px] sm:rounded-[34px]"
              >
                <source src="/videos/farmer_problem_solution.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-600 px-2 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2d6a4f] shrink-0" />
                <span className="font-semibold text-slate-800">{isHindi ? "वास्तविक कृषि वीडियो" : "Practical Field Demonstration"}</span>
                <span>·</span>
                <span>{isHindi ? "ऑडियो व विजुअल मार्गदर्शन" : "Audio & Visual Field Guide"}</span>
              </div>
              <div className="font-serif italic text-xs font-bold text-[#2d6a4f]">
                Saath Har Kisan Ke Liye
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 5. SEE KRISHYANTRA IN ACTION (Product Experience Walkthrough) ── */}
      <section id="product-experience" className="py-16 sm:py-24 bg-white border-b border-[#e5e7eb]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#111827]">
              See Krishyantra in Action
            </h2>
            <p className="text-base text-slate-600">
              Real insights for real farming decisions.
            </p>
          </div>

          {/* 5 Journey Cards (Target Exact Design) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Step 1: Upload Photo */}
            <div className="rounded-2xl bg-white border border-[#e5e7eb] p-4 shadow-xs space-y-3">
              <span className="text-xs font-black text-[#111827] block">
                1. Upload Photo
              </span>
              <div className="relative h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                <Image
                  src="/images/soybean_r2_flowering.png"
                  alt="Soybean crop leaf analysis"
                  fill
                  className="object-cover"
                />
                {/* Viewfinder Target */}
                <div className="absolute inset-3 border-2 border-dashed border-emerald-400 rounded-lg pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Take photo directly from your phone camera.
              </p>
            </div>

            {/* Step 2: Get Diagnosis */}
            <div className="rounded-2xl bg-white border border-[#e5e7eb] p-4 shadow-xs space-y-3">
              <span className="text-xs font-black text-[#111827] block">
                2. Get Diagnosis
              </span>
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <span>🍃</span>
                  <span>Leaf spot detected</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 block">
                  Model verification ready
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>What this means</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Why it happened</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>What to do next</span>
                </div>
              </div>
            </div>

            {/* Step 3: Check Spray Window */}
            <div className="rounded-2xl bg-white border border-[#e5e7eb] p-4 shadow-xs space-y-3">
              <span className="text-xs font-black text-[#111827] block">
                3. Check Spray Window
              </span>
              <div className="p-2.5 rounded-xl bg-[#e8f5e9] border border-[#cbe5cb] text-center">
                <span className="text-[11px] font-bold text-[#1b4332] block">
                  ✔ Best time to spray:
                </span>
                <span className="text-xs font-black text-[#2d6a4f] block">
                  7:00 AM - 9:00 AM
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Temp: 24-28°C</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Wind: &lt; 15 km/h</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CloudSun className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>No rain expected</span>
                </div>
              </div>
              <div className="pt-1">
                <span className="w-full inline-flex items-center justify-center py-1.5 rounded-lg bg-[#e8f5e9] text-[#1b4332] text-xs font-bold">
                  ✔ Safe to spray
                </span>
              </div>
            </div>

            {/* Step 4: Product & Dosage */}
            <div className="rounded-2xl bg-white border border-[#e5e7eb] p-4 shadow-xs space-y-3">
              <span className="text-xs font-black text-[#111827] block">
                4. Product & Dosage
              </span>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                  🧪
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Quantis®</span>
                  <span className="text-[10px] text-slate-500">Biostimulant</span>
                </div>
              </div>
              <div className="space-y-1 text-xs text-slate-700">
                <div>Dosage: <strong>300 ml/acre</strong></div>
                <div>Mix with: <strong>200 L water</strong></div>
                <div>Application: <strong>Foliar spray</strong></div>
                <div>Best time: <strong>Morning</strong></div>
              </div>
              <button
                type="button"
                onClick={(e) => handleActionClick("/plant-intelligence", e)}
                className="w-full inline-flex items-center justify-center py-1.5 rounded-lg border border-slate-300 hover:border-[#2d6a4f] text-xs font-bold text-[#1b4332] transition-colors cursor-pointer"
              >
                View Full Guide
              </button>
            </div>

            {/* Step 5: Expected Impact */}
            <div className="rounded-2xl bg-white border border-[#e5e7eb] p-4 shadow-xs space-y-3">
              <span className="text-xs font-black text-[#111827] block">
                5. Expected Impact
              </span>
              <div className="p-2.5 rounded-xl bg-[#eef7ee] border border-[#cbe5cb] space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#1b4332]">
                  <span>Yield Benefit:</span>
                  <span className="font-black text-[#2d6a4f] font-mono">+2.8 q/ac</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                  <span>Est. Value:</span>
                  <span className="font-black font-mono">₹4,200/ac</span>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Why this works</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>What to expect</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Track your results</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 6. TRUST & PURPOSE SECTION (No Fake Reviews, Zero Humans) ── */}
      <section id="for-farmers" className="py-16 sm:py-24 bg-[#f8faf8] border-b border-[#e5e7eb]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left 7 Cols: Three Authentic Farmer-First Pillars */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold font-mono text-[#2d6a4f] uppercase tracking-wider">
                  Our Commitment
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#111827]">
                  Built for Real Farming Decisions
                </h2>
                <p className="text-sm text-slate-600">
                  Designed specifically to address the daily ground realities faced by Indian farmers.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-[#e5e7eb] shadow-2xs flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#e8f5e9] text-[#2d6a4f] flex items-center justify-center shrink-0">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[#111827]">
                      Field-Verified Agronomics
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Every advisory rule is strictly bound to certified ICAR agricultural thresholds, local temperature, and humidity—so crop leaves are protected from chemical scorching.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#e5e7eb] shadow-2xs flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#e8f5e9] text-[#2d6a4f] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[#111827]">
                      Universal Smartphone Compatibility
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Engineered to load in under 2 seconds on affordable mobile devices and rural 2G/3G networks, with no app downloads required.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#e5e7eb] shadow-2xs flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#e8f5e9] text-[#2d6a4f] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[#111827]">
                      100% Farmer-First & Independent
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Essential tools remain free for farmers. We do not promote wasteful chemicals or biased inputs—our sole objective is farmer profitability and soil health.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: "Stronger Farmers. Greener Tomorrow." Spotlight */}
            <div className="lg:col-span-5 flex flex-col justify-between p-8 rounded-3xl bg-gradient-to-br from-[#1b4332] via-[#235841] to-[#143326] text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#52b788]/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-6 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-300 border border-white/15">
                  <Leaf className="w-8 h-8 text-[#52b788]" />
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    Stronger Farmers.
                    <br />
                    Greener Tomorrow.
                  </h3>
                  <p className="text-sm text-emerald-100/90 leading-relaxed">
                    Krishyantra is built for real fields, real farmers and a more sustainable agricultural future across India.
                  </p>
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-white/15 flex items-center justify-between text-xs text-emerald-200">
                <span className="font-semibold">Saath Har Kisan Ke Liye</span>
                <span className="font-mono">#VocalForLocal</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 7. FAQ SECTION (Accordion Interaction) ────────────────────── */}
      <section id="faq" className="py-16 sm:py-24 bg-white border-b border-[#e5e7eb]">
        <div className="max-w-[760px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#111827]">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600">
              Clear answers to help you get the most out of Krishyantra.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#e5e7eb] bg-white shadow-2xs overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-bold text-[#111827]">
                      {idx + 1}. {faq.q}
                    </span>
                    <div
                      className={`p-1.5 rounded-full transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 bg-[#e8f5e9] text-[#2d6a4f]" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 8. FINAL CTA BANNER (Authentic Pure Crop Landscape) ─────────── */}
      <section className="relative overflow-hidden py-16 sm:py-24 text-white">
        
        {/* Background Image: Pure Crop Farmland at Sunset (Zero Humans) */}
        <div className="absolute inset-0">
          <Image
            src="/images/krishyantra_landscape_banner.jpg"
            alt="Scenic agricultural farmland landscape at sunset"
            fill
            className="object-cover object-center"
          />
          {/* Deep Forest Green Gradient Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d2319]/90 via-[#1b4332]/85 to-[#0d2319]/90 backdrop-blur-[1px]" />
        </div>

        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Ready to make better farming decisions?
            </h2>
            <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed">
              Start exploring Krishyantra for your farm today.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={isLoggedIn ? "/dashboard" : "/signup"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#52b788] hover:bg-[#40916c] text-[#0d2319] hover:text-white text-sm sm:text-base font-black shadow-xl transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={(e) => handleActionClick("whatsapp", e)}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-slate-100 text-[#1b4332] text-sm sm:text-base font-bold shadow-md transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 text-emerald-600 fill-current" />
              <span>Chat on WhatsApp</span>
            </button>
          </div>

          {/* Authentic Capability Highlights (Zero Fabricated Statistics) */}
          <div className="pt-8 border-t border-white/20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-xs font-semibold text-emerald-100">
            <div className="flex items-center justify-center gap-2">
              <Store className="w-4 h-4 text-[#52b788]" />
              <span>APMC Mandi Rates</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Sprout className="w-4 h-4 text-[#52b788]" />
              <span>Multi-Crop Advisory</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Globe className="w-4 h-4 text-[#52b788]" />
              <span>Vernacular Languages</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#52b788]" />
              <span>100% Free for Farmers</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── 9. Krishyantra Footer ────────────────────────────────────── */}
      <KrishyantraFooter />

      {/* ── Install WebApp PWA Modal ───────────────────────────────── */}
      {installModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-emerald-100 space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#e8f5e9] text-[#2d6a4f] flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#111827]">
                    {isHindi ? "कृषियंत्र वेबऐप इंस्टॉल करें" : "Install Krishyantra WebApp"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isHindi ? "सीधे अपने होमस्क्रीन पर जोड़ें — बिना ऐप स्टोर" : "Fast, lightweight & works on any phone"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInstallModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1-Tap PWA Install Trigger if available */}
            {deferredPrompt && (
              <div className="p-4 rounded-2xl bg-[#e8f5e9] border border-[#cbe5cb] flex items-center justify-between gap-3">
                <div className="text-xs text-[#1b4332]">
                  <span className="font-bold block">1-Tap Install Ready</span>
                  <span className="text-[11px] text-emerald-800">Directly add to your phone launcher</span>
                </div>
                <button
                  type="button"
                  onClick={triggerPwaInstall}
                  className="px-4 py-2 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install Now</span>
                </button>
              </div>
            )}

            {/* Step-by-Step Instructions */}
            <div className="space-y-3 text-xs text-slate-700">
              <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider text-slate-500">
                How to add to Home Screen:
              </span>

              {/* Android / Chrome */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#2d6a4f] flex items-center justify-center font-bold text-xs shrink-0">
                  A
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 block">Android (Google Chrome)</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Tap the <strong>three dots (⋮)</strong> at the top-right corner of Chrome, then tap <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.
                  </p>
                </div>
              </div>

              {/* iOS / Safari */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs shrink-0">
                  i
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 block">iPhone / iPad (Safari)</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Tap the <strong>Share icon ( <Share2 className="inline w-3 h-3 text-sky-700 -mt-0.5" /> )</strong> at the bottom bar, scroll down and select <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="pt-2 grid grid-cols-3 gap-2 text-center text-[10.5px] font-semibold text-[#1b4332]">
                <div className="p-2 rounded-xl bg-[#e8f5e9]/70 border border-[#cbe5cb]/60">
                  ⚡ &lt; 2s Load Time
                </div>
                <div className="p-2 rounded-xl bg-[#e8f5e9]/70 border border-[#cbe5cb]/60">
                  📦 &lt; 1MB Storage
                </div>
                <div className="p-2 rounded-xl bg-[#e8f5e9]/70 border border-[#cbe5cb]/60">
                  📶 Works on 2G/3G
                </div>
              </div>
            </div>

            {/* Footer Button */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setInstallModalOpen(false)}
                className="w-full py-3 rounded-full bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                Got It
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Feature Short Description Modal (In-Place / Theme-Matched) ── */}
      {selectedFeature && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedFeature(null)}
        >
          <div 
            className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-emerald-100 space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Icon, Tag and Close */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl ${selectedFeature.iconBg} flex items-center justify-center shrink-0`}>
                  {selectedFeature.icon}
                </div>
                <div>
                  <span className="inline-flex items-center text-[11px] font-bold text-[#2d6a4f] bg-[#e8f5e9] px-2.5 py-0.5 rounded-full mb-1">
                    {selectedFeature.tag}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-[#111827] leading-snug">
                    {selectedFeature.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFeature(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Short Description Summary */}
            <div className="p-4 rounded-2xl bg-[#f8faf8] border border-slate-200/80 text-sm text-slate-700 leading-relaxed font-normal">
              {selectedFeature.summary}
            </div>

            {/* Practical Field Bullets */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                {isHindi ? "मुख्य विशेषताएं" : "Key Highlights"}
              </span>
              <div className="space-y-2">
                {selectedFeature.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-[#2d6a4f] shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Farmer Impact Callout */}
            <div className="p-3.5 rounded-2xl bg-[#e8f5e9]/70 border border-[#cbe5cb]/70 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#2d6a4f] shrink-0 mt-0.5" />
              <div className="text-xs text-[#1b4332] leading-relaxed">
                <span className="font-bold block text-[11px] uppercase tracking-wide text-[#2d6a4f] mb-0.5">
                  {isHindi ? "किसान लाभ (Farmer Impact)" : "Direct Farmer Impact"}
                </span>
                {selectedFeature.farmerImpact}
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedFeature(null)}
                className="w-full py-3 rounded-full bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-sm font-bold shadow-md cursor-pointer transition-colors"
              >
                {isHindi ? "समझ गए" : "Got It"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
