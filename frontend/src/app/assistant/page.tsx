"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { useWeather } from "@/context/WeatherContext";
import { useFarm } from "@/context/FarmContext";
import { getStoredProfile } from "@/lib/userStore";
import { sendChatMessage, analyzeCropLeafImage } from "@/lib/api";
import { playGoogleNeuralSpeech, stopGoogleSpeech } from "@/lib/googleVoiceEngine";
import { VoiceRecognitionService, VoiceState } from "@/lib/voiceRecognitionService";
import { FormattedAgriResponse } from "@/components/FormattedAgriResponse";
import {
  Mic,
  MicOff,
  Send,
  Loader2,
  Volume2,
  Camera,
  User,
  Sprout,
  MapPin,
  Thermometer,
  Wind,
  X,
  Copy,
  Check,
} from "lucide-react";

// ─── 12 Indian Languages Specification ─────────────────────────────────────────
interface LanguageMeta {
  code: string;
  name: string;
  native: string;
}

const SUPPORTED_12_LANGUAGES: LanguageMeta[] = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "as", name: "Assamese", native: "অসমীয়া" },
];

const LOCALIZED_STRINGS: Record<string, {
  title: string;
  welcome: (name: string, crop: string) => string;
  chips: (crop: string) => string[];
  placeholder: string;
  listening: string;
  thinking: string;
  photoAttached: string;
}> = {
  en: {
    title: "Krishyantra AI Farm Assistant",
    welcome: (name, crop) =>
      `Namaste ${name}! How can I assist you with your ${crop} crop today? Ask about spray dosage, today's APMC mandi rates, disease diagnosis, or weather advisory.`,
    chips: (crop) => [
      `What is today's ${crop} mandi rate?`,
      `Is the weather safe to spray today?`,
      `What does the Krishyantra model predict?`,
      `Show summary of my registered fields`,
    ],
    placeholder: "Ask anything — spray dosage, mandi price, weather, crop stress…",
    listening: "🎙️ Listening…",
    thinking: "Krishyantra is thinking…",
    photoAttached: "Leaf photo attached — type a question or send",
  },
  hi: {
    title: "कृषियंत्र AI फार्म सहायक",
    welcome: (name, crop) =>
      `नमस्ते ${name} जी! आज आपकी ${crop} फसल के लिए मैं क्या सहायता कर सकता हूँ? स्प्रे खुराक, आज का ताजा मंडी भाव, फसल स्वास्थ्य या मौसम सलाह पूछें।`,
    chips: (crop) => [
      `${crop} का आज का ताजा मंडी भाव क्या है?`,
      `क्या आज मेरे खेत में स्प्रे करना सुरक्षित है?`,
      `कृषियंत्र मॉडल की भविष्यवाणी क्या है?`,
      `मेरे सभी पंजीकृत खेतों का विवरण दिखाएं`,
    ],
    placeholder: "कुछ भी पूछें — स्प्रे खुराक, मंडी भाव, मौसम सलाह, बीमारी…",
    listening: "🎙️ सुन रहा है…",
    thinking: "कृषियंत्र सोच रहा है…",
    photoAttached: "पत्ती फोटो संलग्न — प्रश्न लिखें या भेजें",
  },
  pa: {
    title: "ਕ੍ਰਿਸ਼ੀਯੰਤਰ AI ਫ਼ਾਰਮ ਸਹਾਇਕ",
    welcome: (name, crop) =>
      `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ${name} ਜੀ! ਅੱਜ ਤੁਹਾਡੀ ${crop} ਫ਼ਸਲ ਲਈ ਮੈਂ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ? ਸਪਰੇਅ ਖ਼ੁਰਾਕ, ਮੰਡੀ ਭਾਅ, ਰੋਗ ਨਿਦਾਨ ਜਾਂ ਮੌਸਮ ਸਲਾਹ ਪੁੱਛੋ।`,
    chips: (crop) => [
      `${crop} ਦਾ ਅੱਜ ਦਾ ਤਾਜ਼ਾ ਮੰਡੀ ਭਾਅ ਕੀ ਹੈ?`,
      `ਕੀ ਅੱਜ ਮੇਰੇ ਖੇਤ ਵਿੱਚ ਸਪਰੇਅ ਕਰਨਾ ਸੁਰੱਖਿਅਤ ਹੈ?`,
      `ਕ੍ਰਿਸ਼ੀਯੰਤਰ ਮਾਡਲ ਦੀ ਭਵਿੱਖਬਾਣੀ ਕੀ ਹੈ?`,
      `ਮੇਰੇ ਸਾਰੇ ਰਜਿਸਟਰਡ ਖੇਤਾਂ ਦਾ ਵੇਰਵਾ ਦਿਖਾਓ`,
    ],
    placeholder: "ਕੁਝ ਵੀ ਪੁੱਛੋ — ਸਪਰੇਅ ਖ਼ੁਰਾਕ, ਮੰਡੀ ਭਾਅ, ਮੌਸਮ, ਬਿਮਾਰੀ…",
    listening: "🎙️ ਸੁਣ ਰਿਹਾ ਹੈ…",
    thinking: "ਕ੍ਰਿਸ਼ੀਯੰਤਰ ਸੋਚ ਰਿਹਾ ਹੈ…",
    photoAttached: "ਪੱਤੇ ਦੀ ਫ਼ੋਟੋ ਸ਼ਾਮਲ ਕੀਤੀ ਗਈ ਹੈ",
  },
  mr: {
    title: "कृषियंत्र AI शेती सहाय्यक",
    welcome: (name, crop) =>
      `नमस्कार ${name} जी! आज तुमच्या ${crop} पिकासाठी मी काय मदत करू शकतो? फवारणीचे प्रमाण, आजचे बाजारभाव, रोग निदान किंवा हवामान सल्ला विचारा.`,
    chips: (crop) => [
      `${crop} चा आजचा ताजा बाजारभाव काय आहे?`,
      `आज माझ्या शेतात फवारणी करणे सुरक्षित आहे का?`,
      `कृषियंत्र मॉडेलचा अंदाज काय आहे?`,
      `माझ्या नोंदणीकृत शेतांचा सारांश दाखवा`,
    ],
    placeholder: "काहीही विचारा — फवारणी प्रमाण, बाजार भाव, हवामान, रोग…",
    listening: "🎙️ ऐकत आहे…",
    thinking: "कृषियंत्र विचार करत आहे…",
    photoAttached: "पानाचा फोटो जोडला आहे — प्रश्न विचारा किंवा पाठवा",
  },
  gu: {
    title: "કૃષિયંત્ર AI ફાર્મ સહાયક",
    welcome: (name, crop) =>
      `નમસ્તે ${name} જી! આજે તમારા ${crop} પાક માટે હું શું મદદ કરી શકું? દવા છંટકાવ માત્રા, આજના બજાર ભાવ, રોગ નિદાન અથવા હવામાન સલાહ પૂછો.`,
    chips: (crop) => [
      `${crop} નો આજનો તાજો બજાર ભાવ શું છે?`,
      `શું આજે મારા ખેતરમાં દવાનો છંટકાવ સુરક્ષિત છે?`,
      `કૃષિયંત્ર મોડેલની આગાહી શું છે?`,
      `મારા બધા નોંધાયેલા ખેતરોની વિગતો બતાવો`,
    ],
    placeholder: "કંઈપણ પૂછો — છંટકાવ માત્રા, બજાર ભાવ, હવામાન, રોગ…",
    listening: "🎙️ સાંભળી રહ્યું છે…",
    thinking: "કૃષિયંત્ર વિચારી રહ્યું છે…",
    photoAttached: "પાનનો ફોટો જોડાયેલ છે — પ્રશ્ન લખો અથવા મોકલો",
  },
  te: {
    title: "కృషియంత్ర AI ఫార్మ్ అసిస్టెంట్",
    welcome: (name, crop) =>
      `నమస్కారం ${name} గారు! ఈరోజు మీ ${crop} పంట కోసం నేను ఎలా సహాయపడగలను? మందుల మోతాదు, నేటి మార్కెట్ ధరలు, తెగుళ్ల నివారణ లేదా వాతావరణ సలహాలు అడగండి.`,
    chips: (crop) => [
      `${crop} నేటి మార్కెట్ ధర ఎంత?`,
      `ఈరోజు నా పొలంలో స్ప్రే చేయడం సురక్షితమేనా?`,
      `కృషియంత్ర మోడల్ అంచనా ఏమిటి?`,
      `నా నమోదిత పొలాల వివరాలు చూపించండి`,
    ],
    placeholder: "ఏదైనా అడగండి — మందుల మోతాదు, మార్కెట్ ధర, వాతావరణం…",
    listening: "🎙️ వింటున్నాను…",
    thinking: "కృషియంత్ర ఆలోచిస్తోంది…",
    photoAttached: "ఆకు ఫోటో జతచేయబడింది",
  },
  ta: {
    title: "கிருஷியந்திரா AI பண்ணை உதவியாளர்",
    welcome: (name, crop) =>
      `வணக்கம் ${name}! இன்று உங்கள் ${crop} பயிருக்கு நான் எவ்வாறு உதவ முடியும்? மருந்து தெளிக்கும் அளவு, இன்றைய சந்தை விலை, நோய் கண்டறிதல் அல்லது வானிலை ஆலோசனை கேளுங்கள்.`,
    chips: (crop) => [
      `${crop} இன்றைய சந்தை விலை என்ன?`,
      `இன்று என் வயலில் மருந்து தெளிப்பது பாதுகாப்பானதா?`,
      `கிருஷியந்திரா மாதிரியின் கணிப்பு என்ன?`,
      `எனது பதிவு செய்யப்பட்ட வயல்களின் சுருக்கத்தைக் காட்டு`,
    ],
    placeholder: "எதையும் கேளுங்கள் — மருந்து அளவு, சந்தை விலை, வானிலை…",
    listening: "🎙️ கேட்கிறது…",
    thinking: "கிருஷியந்திரா சிந்திக்கிறது…",
    photoAttached: "இலை புகைப்படம் இணைக்கப்பட்டுள்ளது",
  },
  kn: {
    title: "ಕೃಷಿಯಂತ್ರ AI ಕೃಷಿ ಸಹಾಯಕ",
    welcome: (name, crop) =>
      `ನಮಸ್ಕಾರ ${name}! ಇಂದು ನಿಮ್ಮ ${crop} ಬೆಳೆಗೆ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು? ಔಷಧಿ ಪ್ರಮಾಣ, ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ದರ, ರೋಗ ನಿಯಂತ್ರಣ ಅಥವಾ ಹವಾಮಾನ ಸಲಹೆ ಕೇಳಿ.`,
    chips: (crop) => [
      `${crop} ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ದರ ಎಷ್ಟು?`,
      `ಇಂದು ನನ್ನ ಹೊಲದಲ್ಲಿ ಸಿಂಪರಣೆ ಮಾಡುವುದು ಸುರಕ್ಷಿತವೇ?`,
      `ಕೃಷಿಯಂತ್ರ ಮಾದರಿಯ ಮುನ್ಸೂಚನೆ ಏನು?`,
      `ನನ್ನ ನೋಂದಾಯಿತ ಜಮೀನುಗಳ ವಿವರ ತೋರಿಸಿ`,
    ],
    placeholder: "ಏನನ್ನಾದರೂ ಕೇಳಿ — ಔಷಧಿ ಪ್ರಮಾಣ, ಮಾರುಕಟ್ಟೆ ದರ, ಹವಾಮಾನ…",
    listening: "🎙️ ಆಲಿಸುತ್ತಿದೆ…",
    thinking: "ಕೃಷಿಯಂತ್ರ ಯೋಚಿಸುತ್ತಿದೆ…",
    photoAttached: "ಎಲೆಯ ಫೋಟೋ ಲಗತ್ತಿಸಲಾಗಿದೆ",
  },
  ml: {
    title: "കൃഷിയന്ത്ര AI ഫാം അസിസ്റ്റന്റ്",
    welcome: (name, crop) =>
      `നമസ്കാരം ${name}! ഇന്ന് നിങ്ങളുടെ ${crop} കൃഷിക്കായി ഞാൻ എങ്ങനെ സഹായിക്കണം? മരുന്ന് തളിക്കേണ്ട അളവ്, ഇന്നത്തെ മാർക്കറ്റ് നിരക്ക്, രോഗനിർണയം അല്ലെങ്കിൽ കാലാവസ്ഥാ ഉപദേശം ചോദിക്കൂ.`,
    chips: (crop) => [
      `${crop} ഇന്നത്തെ മാർക്കറ്റ് നിരക്ക് എത്രയാണ്?`,
      `ഇന്ന് എന്റെ പാടത്ത് മരുന്ന് തളിക്കുന്നത് സുരക്ഷിതമാണോ?`,
      `കൃഷിയന്ത്ര മോഡൽ പ്രവചനം എന്താണ്?`,
      `എന്റെ രജിസ്റ്റർ ചെയ്ത ഫാമുകളുടെ വിവരങ്ങൾ കാണിക്കുക`,
    ],
    placeholder: "എന്തും ചോദിക്കൂ — മരുന്ന് അളവ്, മാർക്കറ്റ് വില, കാലാവസ്ഥ…",
    listening: "🎙️ കേൾക്കുന്നു…",
    thinking: "കൃഷിയന്ത്ര ചിന്തിക്കുന്നു…",
    photoAttached: "ഇലയുടെ ഫോട്ടോ ചേർത്തിട്ടുണ്ട്",
  },
  bn: {
    title: "কৃষিযন্ত্র AI খামার সহায়ক",
    welcome: (name, crop) =>
      `নমস্কার ${name}! আজ আপনার ${crop} ফসলের জন্য আমি কীভাবে সাহায্য করতে পারি? স্প্রে করার ডোজ, আজকের বাজার দর, রোগ নির্ণয় বা আবহাওয়া পরামর্শ জিজ্ঞাসা করুন।`,
    chips: (crop) => [
      `${crop}-এর আজকের বাজার দর কত?`,
      `আজ কি আমার জমিতে স্প্রে করা নিরাপদ?`,
      `কৃষিযন্ত্র মডেলের পূর্বাভাস কী?`,
      `আমার নিবন্ধিত জমিগুলির সারাংশ দেখান`,
    ],
    placeholder: "কিছু জিজ্ঞাসা করুন — স্প্রে ডোজ, বাজার দর, আবহাওয়া…",
    listening: "🎙️ শুনছে…",
    thinking: "কৃষিযন্ত্র চিন্তা করছে…",
    photoAttached: "পাতার ছবি যুক্ত করা হয়েছে",
  },
  or: {
    title: "କୃଷିଯନ୍ତ୍ର AI ଫାର୍ମ ସହାୟକ",
    welcome: (name, crop) =>
      `ନମସ୍କାର ${name}! ଆଜି ଆପଣଙ୍କ ${crop} ଫସଲ ପାଇଁ ମୁଁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି? ସ୍ପ୍ରେ ମାତ୍ରା, ଆଜିର ମଣ୍ଡି ଦର, ରୋଗ ନିରାକରଣ କିମ୍ବା ପାଣିପାଗ ପରାମର୍ଶ ପଚାରନ୍ତୁ।`,
    chips: (crop) => [
      `${crop} ର ଆଜିର ମଣ୍ଡି ଦର କେତେ?`,
      `ଆଜି ମୋ କ୍ଷେତରେ ସ୍ପ୍ରେ କରିବା ସୁରକ୍ଷିତ କି?`,
      `କୃଷିଯନ୍ତ୍ର ମଡେଲର ପୂର୍ବାନୁମାନ କ'ଣ?`,
      `ମୋର ପଞ୍ଜୀକୃତ ଜମିର ସାରାଂଶ ଦେଖାନ୍ତୁ`,
    ],
    placeholder: "କିଛି ବି ପଚାରନ୍ତୁ — ସ୍ପ୍ରେ ମାତ୍ରା, ମଣ୍ଡି ଦର, ପାଣିପାଗ…",
    listening: "🎙️ ଶୁଣୁଛି…",
    thinking: "କୃଷିଯନ୍ତ୍ର ଚିନ୍ତା କରୁଛି…",
    photoAttached: "ପତ୍ରର ଫଟୋ ସଂଲଗ୍ନ ହୋଇଛି",
  },
  as: {
    title: "কৃষিযন্ত্ৰ AI কৃষি সহায়ক",
    welcome: (name, crop) =>
      `নমস্কাৰ ${name}! আজি আপোনাৰ ${crop} শস্যৰ বাবে মই কেনেকৈ সহায় কৰিব পাৰোঁ? স্প্ৰে'ৰ মাত্ৰা, আজিৰ বজাৰ দৰ, ৰোগ নিৰ্ণয় বা বতৰৰ পৰামৰ্শ সুধক।`,
    chips: (crop) => [
      `${crop}-ৰ আজিৰ বজাৰ দৰ কিমান?`,
      `আজি মোৰ পথাৰত স্প্ৰে' কৰা সুৰক্ষিত নে?`,
      `কৃষিযন্ত্ৰ মডেলৰ পূৰ্বাভাস কি?`,
      `মোৰ পঞ্জীভুক্ত পথাৰসমূহৰ বিৱৰণ দেখুৱাওক`,
    ],
    placeholder: "যিকোনো কথা সোধক — স্প্ৰে'ৰ মাত্ৰা, বজাৰ দৰ, বতৰ…",
    listening: "🎙️ শুনি আছে…",
    thinking: "কৃষিযন্ত্ৰই ভাবিছে…",
    photoAttached: "পাতৰ ছবি সংলগ্ন কৰা হৈছে",
  },
};

// ─── Types ───────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
  imageUrl?: string;
  followUpQuestions?: string[];
  whyRecommendation?: string;
  confidenceScore?: number;
  provider?: string;
}

interface UserFieldSummary {
  name: string;
  crop: string;
  cropVariety?: string;
  areaAcres: number;
  soilType?: string;
  district?: string;
  growthStage?: string;
  sowingDate?: string;
}

// ─── Pure Chat Page ───────────────────────────────────────────────────────────
export default function AssistantPage() {
  const { language, setLanguage } = useLanguage();
  const { weather } = useWeather();
  const { farms, activeFarm } = useFarm();

  const currentLangCode = SUPPORTED_12_LANGUAGES.some((l) => l.code === language) ? language : "en";
  const loc = LOCALIZED_STRINGS[currentLangCode] || LOCALIZED_STRINGS.en;

  // ── State ───────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [voiceState, setVoiceState] = useState<VoiceState>("IDLE");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [micError, setMicError] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const chatRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const voiceRef = useRef<VoiceRecognitionService | null>(null);

  // ── User / farm data ─────────────────────────────────────────────────────
  const profile = typeof window !== "undefined" ? (getStoredProfile() as any) : {};
  const farmerName = (profile?.fullName || activeFarm?.name || "Farmer Friend") as string;
  const district = (activeFarm?.district || profile?.district || weather?.district || "Bhopal") as string;
  const state = (activeFarm?.state || profile?.state || weather?.state || "Madhya Pradesh") as string;
  const activeCrop = ((activeFarm?.primaryCrop || profile?.primaryCrop || "Soybean") as string);
  const activeAcres = Number(activeFarm?.areaAcres || profile?.fieldAreaAcres || 5.0);

  // ── Build user-specific fields for API ──────────────────────────────────
  const userFields: UserFieldSummary[] = farms && (farms as any[]).length > 0
    ? (farms as any[]).map((f: any) => ({
        name: f.name,
        crop: f.primaryCrop || f.crop || "Unknown",
        cropVariety: f.cropVariety || f.variety || "",
        areaAcres: Number(f.areaAcres || 1),
        soilType: f.soilType || "Black Cotton Soil",
        district: f.district || district,
        growthStage: f.growthStage || "",
        sowingDate: f.sowingDate || "",
      }))
    : activeFarm
    ? [{
        name: activeFarm.name,
        crop: activeFarm.primaryCrop,
        cropVariety: (activeFarm as any).cropVariety || "",
        areaAcres: activeFarm.areaAcres,
        soilType: activeFarm.soilType || "Black Cotton Soil",
        district: activeFarm.district || district,
        growthStage: (activeFarm as any).growthStage || "",
        sowingDate: (activeFarm as any).sowingDate || "",
      }]
    : [];

  // ── Build clean, non-bloated welcome message ─────────────────────────────
  const buildWelcome = useCallback((): Message => {
    const lStrings = LOCALIZED_STRINGS[currentLangCode] || LOCALIZED_STRINGS.en;
    return {
      id: "welcome",
      sender: "bot",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      followUpQuestions: lStrings.chips(activeCrop),
      text: lStrings.welcome(farmerName, activeCrop),
    };
  }, [currentLangCode, farmerName, activeCrop]);

  useEffect(() => {
    setMessages((prev) => {
      // If we only have the welcome message or empty, update to the newly selected language
      if (prev.length <= 1) {
        return [buildWelcome()];
      }
      return prev;
    });
  }, [buildWelcome]);

  // ── Voice Service Initialization ─────────────────────────────────────────
  useEffect(() => {
    const svc = new VoiceRecognitionService({
      languageKey: currentLangCode,
      endpointingSilenceMs: 3200,
      maxRecordingDurationMs: 45000,
      onStateChange: setVoiceState,
      onInterimTranscript: (t) => { setLiveTranscript(t); setInput(t); },
      onFinalSpeechPayload: (p) => { setLiveTranscript(""); sendMessage(p.transcript, p.audioBase64, p.audioMimeType); },
      onFinalTranscript: (t) => { setLiveTranscript(""); sendMessage(t); },
      onAudioLevelChange: () => {},
      onError: (type) => { if (type === "permission_denied" || type === "not_allowed") setMicError(true); },
    });
    voiceRef.current = svc;
    return () => svc.cancelListening();
  }, [currentLangCode]);

  // ── Scroll to bottom ─────────────────────────────────────────────────────
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, voiceState, liveTranscript]);

  // ── Copy Message ─────────────────────────────────────────────────────────
  const handleCopyMessage = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMsgId(id);
      setTimeout(() => setCopiedMsgId(null), 2000);
    } catch (e) {
      console.warn("Copy failed:", e);
    }
  };

  // ── Text-to-Speech playback ──────────────────────────────────────────────
  const speakMsg = (id: string, text: string) => {
    if (speakingId === id) {
      stopGoogleSpeech();
      setSpeakingId(null);
      return;
    }
    stopGoogleSpeech();
    setSpeakingId(id);
    setVoiceState("RESPONDING");
    playGoogleNeuralSpeech(text, currentLangCode, {
      onEnd: () => { setSpeakingId(null); setVoiceState("IDLE"); },
      onError: () => { setSpeakingId(null); setVoiceState("IDLE"); },
    });
  };

  // ── Send message ─────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text?: string, audioBase64?: string, audioMime?: string) => {
    const q = (text || "").trim();
    if (!q && !selectedImage && !audioBase64) return;

    voiceRef.current?.cancelListening();
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: q || (audioBase64 ? "🎙️ Voice Query…" : "📷 Leaf Photo Diagnostics"),
      time: timeStr,
      imageUrl: imagePreview || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLiveTranscript("");
    const img = selectedImage;
    setSelectedImage(null);
    setImagePreview(null);
    setVoiceState("PROCESSING");

    let reply = "";
    let why = "";
    let conf = 98;
    let followUps: string[] = [];
    let provider = "Krishyantra AI";

    try {
      if (img) {
        const res = await analyzeCropLeafImage(img, activeCrop.toLowerCase(), currentLangCode, q, district);
        reply = res?.diagnosis || "Leaf analysis complete.";
        why = res?.why_recommendation || "";
        conf = res?.confidence_score || 95;
        followUps = res?.follow_up_questions || [];
        provider = res?.provider || "Krishyantra Vision AI";
      } else {
        const fullContext = [
          `[FARMER PROFILE] Name: ${farmerName}, District: ${district}, State: ${state}`,
          `[ACTIVE FIELD] Crop: ${activeCrop}, Acres: ${activeAcres}, Growth Stage: ${(activeFarm as any)?.growthStage || "Flowering"}`,
          `[LIVE WEATHER] Temp: ${weather?.temperature}°C, Night: ${weather?.nightTemperature}°C, Wind: ${weather?.windSpeed} km/h, Humidity: ${weather?.humidity}%, Soil Moisture: ${weather?.soilMoistureEst}%, Spray Safe: ${(weather?.windSpeed || 0) < 15 && (weather?.temperature || 0) < 33 ? "YES" : "NO"}`,
        ].filter(Boolean).join("\n");

        const farmLat = typeof (activeFarm as any)?.lat === "number" && !isNaN((activeFarm as any).lat) ? (activeFarm as any).lat : weather?.lat;
        const farmLon = typeof (activeFarm as any)?.lon === "number" && !isNaN((activeFarm as any).lon) ? (activeFarm as any).lon : weather?.lon;

        const res = await sendChatMessage(
          q,
          farmLat,
          farmLon,
          activeCrop.toLowerCase(),
          currentLangCode,
          `${district}, ${state}`,
          weather?.nightTemperature || weather?.temperature,
          farmerName,
          activeAcres,
          (activeFarm as any)?.cropVariety || "",
          (activeFarm as any)?.soilType || "Black Cotton Soil",
          district,
          (activeFarm as any)?.village || "",
          audioBase64,
          audioMime,
          messages.map((m) => ({ sender: m.sender, text: m.text })),
          `${district}, ${state}`,
          {
            temperature: weather?.temperature,
            humidity: weather?.humidity ?? 68,
            wind_speed: weather?.windSpeed,
            soil_moisture: weather?.soilMoistureEst,
            state,
            field_name: (activeFarm as any)?.name || "Main Farm",
          },
          userFields,
        );

        if (res && (res.reply || res.response)) {
          reply = res.reply || res.response;
          why = res.why_recommendation || `Verified for ${district}`;
          conf = res.confidence_score || 98;
          followUps = res.follow_up_questions || [];
          provider = "Krishyantra AI";
        }
      }
    } catch {
      reply = currentLangCode === "hi"
        ? "तकनीकी समस्या। कृपया पुनः प्रयास करें।"
        : "Could not connect to advisory engine. Please try again.";
    } finally {
      setVoiceState("IDLE");
    }

    const botMsg: Message = {
      id: `b-${Date.now()}`,
      sender: "bot",
      text: reply,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      provider,
      whyRecommendation: why,
      confidenceScore: conf,
      followUpQuestions: followUps,
    };
    setMessages((prev) => [...prev, botMsg]);
    if (audioBase64) speakMsg(botMsg.id, reply);
  }, [selectedImage, imagePreview, activeCrop, currentLangCode, district, state, farmerName, activeAcres, activeFarm, userFields, weather, messages]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setSelectedImage(f); setImagePreview(URL.createObjectURL(f)); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const handleLanguageSelect = (newLang: string) => {
    setLanguage(newLang);
    stopGoogleSpeech();
    setSpeakingId(null);
    if (voiceRef.current) {
      voiceRef.current.setLanguage(newLang);
    }
  };

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-64px)] bg-[#fbfcf8] bg-[radial-gradient(#1b4332_0.75px,transparent_0.75px)] [background-size:24px_24px] py-3 sm:py-6 px-2 sm:px-6 font-sans">
        <div className="max-w-[920px] mx-auto w-full h-[calc(100dvh-100px)] sm:h-[calc(100dvh-120px)] bg-white/95 backdrop-blur-md rounded-3xl border border-[#e8ede4] shadow-[0_15px_35px_rgba(27,67,50,0.05)] p-3 sm:p-6 flex flex-col">

          {/* ── Top Bar: Clean Header without AI Logo or Clutter Badges ─── */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 pb-3 sm:pb-4 border-b border-[#e8ede4] mb-3 shrink-0">
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-black text-[#11261f] tracking-tight leading-tight truncate font-display">
                {loc.title}
              </h1>

              {/* Clean Status chips — field info & live weather */}
              <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold bg-[#e8f5e9] text-[#1b4332] border border-[#c8e6c9] px-2 py-0.5 rounded-full whitespace-nowrap">
                  <Sprout className="h-3 w-3 text-emerald-600" />
                  {activeFarm?.primaryCrop || "Soybean"} · {activeFarm?.areaAcres || "—"} ac
                </span>
                <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold bg-white text-slate-700 border border-[#e8ede4] px-2 py-0.5 rounded-full whitespace-nowrap shadow-2xs">
                  <MapPin className="h-3 w-3 text-slate-500" />{district}
                </span>
                <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                  <Thermometer className="h-3 w-3 text-blue-600" />{weather?.temperature || "—"}°C
                </span>
                <span className="hidden xs:flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                  <Wind className="h-3 w-3 text-amber-600" />{weather?.windSpeed || "—"} km/h
                </span>
              </div>
            </div>


          </div>

          {/* ── Chat Messages ───────────────────────────────────────────── */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto space-y-4 sm:space-y-5 pr-1 sm:pr-2 pb-2"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#e8ede4 transparent" }}
          >
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 sm:gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {/* User Avatar (only for user) */}
                {msg.sender === "user" && (
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-2xs bg-[#2d6a4f] text-white">
                    <User className="h-4 w-4" />
                  </div>
                )}

                {/* Bubble group */}
                <div className={`max-w-[88%] sm:max-w-[82%] space-y-2 flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="leaf" className="rounded-2xl max-w-[180px] sm:max-w-[220px] border border-[#e8ede4] shadow-sm" />
                  )}

                  <div className={`rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3.5 text-sm leading-relaxed shadow-xs ${
                    msg.sender === "user"
                      ? "bg-[#1b4332] text-white rounded-tr-sm"
                      : "bg-[#fcfdfa] border border-[#e8ede4] text-[#11261f] rounded-tl-sm w-full"
                  }`}>
                    {msg.sender === "bot"
                      ? <FormattedAgriResponse id={msg.id} text={msg.text} language={currentLangCode} hideExtraActions={true} />
                      : <span className="whitespace-pre-wrap">{msg.text}</span>
                    }
                  </div>

                  {/* Clean Bot footer: timestamp, copy, and speaker audio playback */}
                  {msg.sender === "bot" && (
                    <div className="flex items-center gap-2 flex-wrap px-1 pt-0.5">
                      <span className="text-[10px] text-slate-400 font-mono">{msg.time}</span>

                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                        title="Copy advisory"
                      >
                        {copiedMsgId === msg.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => speakMsg(msg.id, msg.text)}
                        className={`p-1 px-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1 text-[10px] font-semibold ${
                          speakingId === msg.id
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs"
                            : "text-slate-400 hover:text-[#1b4332] hover:bg-[#e8f5e9]"
                        }`}
                        title={speakingId === msg.id ? "Stop Voice" : "Listen (बोलकर सुनें)"}
                      >
                        {speakingId === msg.id ? (
                          <>
                            <div className="flex items-center gap-0.5 h-3 px-0.5">
                              <div className="w-0.5 h-2 bg-emerald-700 rounded-full animate-pulse" />
                              <div className="w-0.5 h-3 bg-emerald-700 rounded-full animate-pulse" />
                              <div className="w-0.5 h-2 bg-emerald-700 rounded-full animate-pulse" />
                            </div>
                            <span className="text-emerald-800 font-bold">Playing</span>
                          </>
                        ) : (
                          <Volume2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {msg.sender === "user" && (
                    <span className="text-[10px] text-slate-400 font-mono px-1">{msg.time}</span>
                  )}

                  {/* Follow-up recommendation chips */}
                  {msg.sender === "bot" && msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.followUpQuestions.map((q, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => sendMessage(q)}
                          className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-white border border-[#e8ede4] text-[#1b4332] hover:bg-[#e8f5e9] hover:border-emerald-400 transition-all cursor-pointer shadow-2xs"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Live transcript indicator */}
            {voiceState === "LISTENING" && liveTranscript && (
              <div className="flex gap-2 sm:gap-3 flex-row-reverse">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-[#2d6a4f] flex items-center justify-center shrink-0 mt-1">
                  <Mic className="h-4 w-4 text-white animate-pulse" />
                </div>
                <div className="max-w-[85%] sm:max-w-[78%] bg-emerald-50 border border-emerald-200 rounded-2xl rounded-tr-sm px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-emerald-900 italic">
                  {liveTranscript}
                </div>
              </div>
            )}

            {/* Thinking indicator */}
            {voiceState === "PROCESSING" && (
              <div className="flex gap-2 sm:gap-3">
                <div className="bg-white border border-[#e8ede4] rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 shadow-xs">
                  <Loader2 className="h-4 w-4 text-emerald-700 animate-spin" />
                  <span className="text-sm text-slate-600 font-medium">{loc.thinking}</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Image preview strip ─────────────────────────────────────── */}
          {imagePreview && (
            <div className="flex items-center gap-2 py-2 px-1 shrink-0">
              <div className="relative inline-block">
                <img src={imagePreview} alt="preview" className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl object-cover border border-[#e8ede4]" />
                <button
                  type="button"
                  onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-rose-500 text-white flex items-center justify-center cursor-pointer shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <span className="text-xs text-slate-600 font-medium">
                {loc.photoAttached}
              </span>
            </div>
          )}

          {/* ── Input Bar ──────────────────────────────────────────────── */}
          <div className="shrink-0 mt-2">
            <div className={`flex items-end gap-1.5 sm:gap-2 bg-white border-2 rounded-2xl px-2.5 sm:px-3 py-2 sm:py-2.5 shadow-2xs transition-all ${
              voiceState === "LISTENING"
                ? "border-rose-400 ring-2 ring-rose-200"
                : voiceState === "PROCESSING"
                ? "border-emerald-600"
                : "border-[#e8ede4] focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/15"
            }`}>
              {/* Camera */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="p-1.5 rounded-xl hover:bg-[#f2f5f0] text-slate-400 hover:text-[#1b4332] transition-all cursor-pointer shrink-0"
                title="Attach leaf photo"
              >
                <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

              {/* Text area */}
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  voiceState === "LISTENING"
                    ? loc.listening
                    : loc.placeholder
                }
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm text-[#11261f] placeholder-slate-400 focus:outline-none leading-relaxed min-h-[22px] sm:min-h-[24px] max-h-28 sm:max-h-32"
                style={{ overflowY: "auto" }}
                disabled={voiceState === "PROCESSING"}
              />

              {/* Mic (Speech-to-Text in current language) */}
              {voiceState === "LISTENING" ? (
                <button type="button" onClick={() => voiceRef.current?.stopListening()} className="p-1.5 sm:p-2 rounded-xl bg-rose-500 text-white shadow-sm animate-pulse cursor-pointer shrink-0">
                  <MicOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    setMicError(false);
                    stopGoogleSpeech();
                    setSpeakingId(null);
                    setInput("");
                    setLiveTranscript("");
                    if (voiceRef.current) await voiceRef.current.startListening();
                  }}
                  className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                    micError ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-[#f2f5f0] hover:bg-[#e8f5e9] text-[#1b4332]"
                  }`}
                  disabled={voiceState === "PROCESSING" || micError}
                  title={micError ? "Microphone permission denied" : "Speak to Krishyantra AI"}
                >
                  <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              )}

              {/* Send Button */}
              <button
                type="button"
                onClick={() => sendMessage(input)}
                disabled={voiceState === "PROCESSING" || (!input.trim() && !selectedImage)}
                className="p-1.5 sm:p-2 rounded-xl bg-[#1b4332] hover:bg-[#143326] text-white shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {voiceState === "PROCESSING" ? <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
