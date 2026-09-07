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
  VolumeX,
  Camera,
  Sparkles,
  User,
  Sprout,
  MapPin,
  Thermometer,
  Wind,
  X,
} from "lucide-react";

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

// Lightweight field shape sent to the API (no polygons / heavy data)
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
  const isHindi = language === "hi";

  // ── State ───────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [voiceState, setVoiceState] = useState<VoiceState>("IDLE");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [micError, setMicError] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const voiceRef = useRef<VoiceRecognitionService | null>(null);

  // ── User / farm data ─────────────────────────────────────────────────────
  const profile = typeof window !== "undefined" ? (getStoredProfile() as any) : {};
  const farmerName = (profile?.fullName || activeFarm?.name || "Farmer Friend") as string;
  const district = (activeFarm?.district || profile?.district || weather?.district || "Bhopal") as string;
  const state = (activeFarm?.state || profile?.state || weather?.state || "Madhya Pradesh") as string;
  const activeCrop = ((activeFarm?.primaryCrop || profile?.primaryCrop || "Soybean") as string).toLowerCase();
  const activeAcres = Number(activeFarm?.areaAcres || profile?.fieldAreaAcres || 5.0);

  // ── Build user-specific fields for API — ONLY the logged-in user's farms ──
  // We pass these to the backend so the AI never sees other users' fields.
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

  // Human-readable summary for the welcome message (uses real user data)
  const fieldCount = userFields.length;
  const fieldListDisplay = userFields.length > 0
    ? userFields.map((f) => `${f.name} (${f.crop}, ${f.areaAcres} ${isHindi ? "एकड़" : "ac"})`).join(", ")
    : activeFarm?.name || "Main Farm";

  // ── Welcome message ──────────────────────────────────────────────────────
  const buildWelcome = useCallback((): Message => {
    const hi = language === "hi";

    return {
      id: "welcome",
      sender: "bot",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      provider: "Google Gemini 2.5 Flash",
      confidenceScore: 99,
      followUpQuestions: hi
        ? [
            `${activeFarm?.primaryCrop || "फसल"} का आज मंडी भाव क्या है?`,
            `मेरे खेत में स्प्रे करना सुरक्षित है?`,
            `AASRA मॉडल की भविष्यवाणी क्या है?`,
            `सभी पंजीकृत खेतों का सारांश दें`,
          ]
        : [
            `What is today's ${activeFarm?.primaryCrop || "crop"} mandi rate?`,
            `Is weather safe to spray on my field today?`,
            `What does the AASRA model predict for my field?`,
            `Show summary of all my registered fields`,
          ],
      text: hi
        ? `नमस्ते ${farmerName} जी! मैं आपका AASRA AI फार्म सहायक हूँ।\n\nआपके ${fieldCount} पंजीकृत खेत — ${fieldListDisplay}\n\nमौसम: ${weather?.temperature || "—"}°C · हवा: ${weather?.windSpeed || "—"} km/h · ${district}\n\nआप कुछ भी पूछें — स्प्रे खुराक, मंडी भाव, मौसम सलाह, AASRA मॉडल आउटपुट, या पत्ती की बीमारी।`
        : `Namaste ${farmerName}! I am your AASRA AI Farm Companion.\n\nYour ${fieldCount} registered field${fieldCount !== 1 ? "s" : ""} — ${fieldListDisplay}\n\nLive weather: ${weather?.temperature || "—"}°C · Wind: ${weather?.windSpeed || "—"} km/h · ${district}\n\nAsk me anything — spray dosage, mandi price, weather advice, AASRA model predictions, or disease diagnosis.`,
    };
  }, [language, activeFarm, farmerName, district, weather, fieldCount, fieldListDisplay]);

  useEffect(() => {
    setMessages([buildWelcome()]);
  }, [buildWelcome]);

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
    let provider = "Google Gemini 2.5 Flash";

    try {
      if (img) {
        const res = await analyzeCropLeafImage(img, activeCrop, language, q, district);
        reply = res?.diagnosis || "Leaf analysis complete.";
        why = res?.why_recommendation || "";
        conf = res?.confidence_score || 95;
        followUps = res?.follow_up_questions || [];
        provider = res?.provider || "Google Gemini 2.5 Flash Vision";
      } else {
        const fullContext = [
          `[FARMER PROFILE] Name: ${farmerName}, District: ${district}, State: ${state}`,
          `[ACTIVE FIELD] Crop: ${activeCrop}, Acres: ${activeAcres}, Growth Stage: ${(activeFarm as any)?.growthStage || "Flowering"}`,
          `[LIVE WEATHER] Temp: ${weather?.temperature}°C, Night: ${weather?.nightTemperature}°C, Wind: ${weather?.windSpeed} km/h, Humidity: ${weather?.humidity}%, Soil Moisture: ${weather?.soilMoistureEst}%, Spray Safe: ${(weather?.windSpeed || 0) < 15 && (weather?.temperature || 0) < 33 ? "YES" : "NO"}`,
        ].filter(Boolean).join("\n");

        const res = await sendChatMessage(
          `${fullContext}\n\n[USER QUESTION] ${q}`,
          weather?.lat,
          weather?.lon,
          activeCrop,
          language,
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
          // ✅ Pass only the logged-in user's fields — ensures personalized AI responses
          userFields,
        );

        if (res && (res.reply || res.response)) {
          reply = res.reply || res.response;
          why = res.why_recommendation || `Verified for ${district}`;
          conf = res.confidence_score || 98;
          followUps = res.follow_up_questions || [];
          provider = res.model_used ? `Google ${res.model_used}` : "Google Gemini 2.5 Flash";
        }
      }
    } catch {
      reply = isHindi
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
  }, [selectedImage, imagePreview, activeCrop, language, district, state, farmerName, activeAcres, activeFarm, userFields, weather, messages, isHindi]);

  useEffect(() => {
    const svc = new VoiceRecognitionService({
      languageKey: language,
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
  }, [language]);

  // ── Scroll to bottom ─────────────────────────────────────────────────────
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, voiceState, liveTranscript]);

  const speakMsg = (id: string, text: string) => {
    if (speakingId === id) { stopGoogleSpeech(); setSpeakingId(null); return; }
    stopGoogleSpeech();
    setSpeakingId(id);
    setVoiceState("RESPONDING");
    playGoogleNeuralSpeech(text, language, {
      onEnd: () => { setSpeakingId(null); setVoiceState("IDLE"); },
      onError: () => { setSpeakingId(null); setVoiceState("IDLE"); },
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setSelectedImage(f); setImagePreview(URL.createObjectURL(f)); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  // ── Languages ────────────────────────────────────────────────────────────
  const LANGS = [
    { code: "hi", label: "हिंदी", name: "Hindi" },
    { code: "mr", label: "मराठी", name: "Marathi" },
    { code: "pa", label: "ਪੰਜਾਬੀ", name: "Punjabi" },
    { code: "gu", label: "ગુજરાતી", name: "Gujarati" },
    { code: "te", label: "తెలుగు", name: "Telugu" },
    { code: "ta", label: "தமிழ்", name: "Tamil" },
    { code: "kn", label: "ಕನ್ನಡ", name: "Kannada" },
    { code: "ml", label: "മലയാളം", name: "Malayalam" },
    { code: "bn", label: "বাংলা", name: "Bengali" },
    { code: "en", label: "English", name: "English" },
  ];
  const currentLang = LANGS.find((l) => l.code === language) || LANGS[LANGS.length - 1];

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100dvh-64px)] max-w-[880px] mx-auto w-full px-3 sm:px-5 py-3 font-sans">

        {/* ── Top Bar ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3 shrink-0">
          {/* Single AI logo — only one Sparkles icon on the whole page header */}
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shrink-0">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm sm:text-base font-extrabold text-[#0d253d] leading-tight truncate">
              {isHindi ? "AASRA AI फार्म सहायक" : "AASRA AI Farm Assistant"}
            </h1>
            {/* Status chips — wrap gracefully on small screens */}
            <div className="flex items-center gap-1 flex-wrap mt-0.5">
              <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                <Sprout className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                {activeFarm?.primaryCrop || "—"} · {activeFarm?.areaAcres || "—"} ac
              </span>
              <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />{district}
              </span>
              <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                <Thermometer className="h-2.5 w-2.5 sm:h-3 sm:w-3" />{weather?.temperature || "—"}°C
              </span>
              <span className="hidden xs:flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                <Wind className="h-2.5 w-2.5 sm:h-3 sm:w-3" />{weather?.windSpeed || "—"} km/h
              </span>
            </div>
          </div>


        </div>

        {/* ── Chat Messages ───────────────────────────────────────────── */}
        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto space-y-4 sm:space-y-5 pr-0.5 sm:pr-1 pb-2"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2 sm:gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar */}
              <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                msg.sender === "bot"
                  ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white"
                  : "bg-[#0d253d] text-white"
              }`}>
                {/* Bot uses a plain icon (no extra logo) — User icon for user messages */}
                {msg.sender === "bot" ? <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              </div>

              {/* Bubble group */}
              <div className={`max-w-[85%] sm:max-w-[78%] space-y-2 flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="leaf" className="rounded-2xl max-w-[180px] sm:max-w-[220px] border border-slate-200 shadow-sm" />
                )}

                <div className={`rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm leading-relaxed shadow-xs ${
                  msg.sender === "user"
                    ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-sm"
                    : "bg-white border border-[#e3e8ee] text-[#0d253d] rounded-tl-sm"
                }`}>
                  {msg.sender === "bot"
                    ? <FormattedAgriResponse id={msg.id} text={msg.text} language={currentLang.code} />
                    : <span className="whitespace-pre-wrap">{msg.text}</span>
                  }
                </div>

                {/* Bot footer */}
                {msg.sender === "bot" && (
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap px-1">
                    <span className="text-[10px] text-slate-400 font-mono">{msg.time}</span>
                    {msg.provider && (
                      <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md">
                        {msg.provider}
                      </span>
                    )}
                    {msg.confidenceScore && msg.confidenceScore > 0 && (
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                        {msg.confidenceScore}% confidence
                      </span>
                    )}
                    <button type="button" onClick={() => speakMsg(msg.id, msg.text)} className="p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer" title="Listen">
                      {speakingId === msg.id
                        ? <VolumeX className="h-3.5 w-3.5 text-rose-500" />
                        : <Volume2 className="h-3.5 w-3.5 text-slate-400 hover:text-indigo-600" />
                      }
                    </button>
                  </div>
                )}

                {msg.sender === "user" && (
                  <span className="text-[10px] text-slate-400 font-mono px-1">{msg.time}</span>
                )}

                {/* Follow-up chips */}
                {msg.sender === "bot" && msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                  <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-1">
                    {msg.followUpQuestions.map((q, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => sendMessage(q)}
                        className="text-[10px] sm:text-[11px] font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 transition-all cursor-pointer shadow-2xs"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Live transcript */}
          {voiceState === "LISTENING" && liveTranscript && (
            <div className="flex gap-2 sm:gap-3 flex-row-reverse">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-[#0d253d] flex items-center justify-center shrink-0 mt-1">
                <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white animate-pulse" />
              </div>
              <div className="max-w-[85%] sm:max-w-[78%] bg-indigo-600/10 border border-indigo-200 rounded-2xl rounded-tr-sm px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-indigo-800 italic">
                {liveTranscript}
              </div>
            </div>
          )}

          {/* Thinking */}
          {voiceState === "PROCESSING" && (
            <div className="flex gap-2 sm:gap-3">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shrink-0 mt-1">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white animate-spin" />
              </div>
              <div className="bg-white border border-[#e3e8ee] rounded-2xl rounded-tl-sm px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 shadow-xs">
                <Loader2 className="h-4 w-4 text-indigo-600 animate-spin" />
                <span className="text-sm text-slate-500">{isHindi ? "AASRA सोच रहा है…" : "AASRA is thinking…"}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Image preview strip ─────────────────────────────────────── */}
        {imagePreview && (
          <div className="flex items-center gap-2 py-2 px-1 shrink-0">
            <div className="relative inline-block">
              <img src={imagePreview} alt="preview" className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl object-cover border border-slate-200" />
              <button
                type="button"
                onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-rose-500 text-white flex items-center justify-center cursor-pointer shadow-sm"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {isHindi ? "पत्ती फोटो संलग्न — प्रश्न लिखें या भेजें" : "Leaf photo attached — type a question or send"}
            </span>
          </div>
        )}

        {/* ── Input Bar ──────────────────────────────────────────────── */}
        <div className="shrink-0 mt-2">
          <div className={`flex items-end gap-1.5 sm:gap-2 bg-white border-2 rounded-2xl px-2.5 sm:px-3 py-2 sm:py-2.5 shadow-sm transition-all ${
            voiceState === "LISTENING"
              ? "border-rose-400 ring-2 ring-rose-200"
              : voiceState === "PROCESSING"
              ? "border-indigo-400"
              : "border-[#e3e8ee] focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100"
          }`}>
            {/* Camera */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-all cursor-pointer shrink-0"
              title={isHindi ? "पत्ती फोटो जोड़ें" : "Attach leaf photo"}
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
                  ? (isHindi ? "🎙️ सुन रहा है…" : "🎙️ Listening…")
                  : isHindi
                  ? "कुछ भी पूछें — स्प्रे खुराक, मंडी भाव, मौसम सलाह…"
                  : "Ask anything — spray dosage, mandi price, weather, AASRA model…"
              }
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-[#0d253d] placeholder-slate-400 focus:outline-none leading-relaxed min-h-[22px] sm:min-h-[24px] max-h-28 sm:max-h-32"
              style={{ overflowY: "auto" }}
              disabled={voiceState === "PROCESSING"}
            />

            {/* Mic */}
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
                  micError ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700"
                }`}
                disabled={voiceState === "PROCESSING" || micError}
                title={micError ? "Microphone permission denied" : (isHindi ? "बोलकर पूछें" : "Ask by voice")}
              >
                <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            )}

            {/* Send */}
            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={voiceState === "PROCESSING" || (!input.trim() && !selectedImage)}
              className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {voiceState === "PROCESSING" ? <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            </button>
          </div>

          {/* Hint */}
          <p className="text-center text-[10px] text-slate-400 font-mono mt-1.5 sm:mt-2">
            {isHindi
              ? `AASRA · ${fieldCount} पंजीकृत खेत · Gemini 2.5 Flash · Enter भेजें`
              : `AASRA · ${fieldCount} registered field${fieldCount !== 1 ? "s" : ""} · Gemini 2.5 Flash · Enter to send`
            }
          </p>
        </div>
      </div>
    </AppShell>
  );
}
