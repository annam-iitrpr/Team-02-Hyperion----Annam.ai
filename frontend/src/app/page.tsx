"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLandingTranslation, LandingTranslation } from "@/lib/landingTranslations";
import {
  Sprout,
  ArrowRight,
  Globe,
  Smartphone,
  CheckCircle2,
  CloudRain,
  Camera,
  Sun,
  BarChart3,
  Mic,
  Settings,
  ShieldCheck,
  Check,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  X,
  ChevronDown,
  Download,
  Share2,
  Layers,
  MapPin,
  Clock,
  Wind,
  Droplets,
  Thermometer,
  Shield,
  HelpCircle,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Zap,
  Building2,
  FileCheck
} from "lucide-react";

// 12 Supported Indian Languages
const INDIAN_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া" },
];

export default function LandingPage() {
  const router = useRouter();

  // 12-Language state (persisted in localStorage if available)
  const [language, setLanguage] = useState<string>("en");
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Translation bundle
  const t: LandingTranslation = getLandingTranslation(language);

  // Video State for the farmer problem video
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoMuted, setVideoMuted] = useState(true);

  // Install WebApp / PWA Modal state
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Phone Mockup Active Tab simulation
  const [phoneActiveTab, setPhoneActiveTab] = useState<"check" | "weather" | "ask" | "mandi">("check");
  const [phoneScanActive, setPhoneScanActive] = useState(true);

  // Load language preference & listen for PWA prompt
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("preferred_language");
      if (savedLang && INDIAN_LANGUAGES.some((l) => l.code === savedLang)) {
        setLanguage(savedLang);
      }
    } catch {}

    const checkMobile = () => {
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
      setIsMobile(/android|iphone|ipad|ipod/i.test(ua));
    };
    checkMobile();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Close language dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (code: string) => {
    setLanguage(code);
    setLangDropdownOpen(false);
    try {
      localStorage.setItem("preferred_language", code);
    } catch {}
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else {
      setInstallModalOpen(true);
    }
  };

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setVideoPlaying(true);
    } else {
      videoRef.current.pause();
      setVideoPlaying(false);
    }
  };

  const toggleVideoMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoMuted;
    setVideoMuted(!videoMuted);
  };

  const currentLangObj = INDIAN_LANGUAGES.find((l) => l.code === language) || INDIAN_LANGUAGES[0];

  const faqs = [
    { q: t.faq.q1, a: t.faq.a1 },
    { q: t.faq.q2, a: t.faq.a2 },
    { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 },
    { q: t.faq.q5, a: t.faq.a5 },
  ];

  return (
    <div className="min-h-screen bg-[#FBFDF9] text-[#111827] selection:bg-[#15803d] selection:text-white flex flex-col font-sans">
      
      {/* ═══════════════════════════════════════════════════════════════════════
          HEADER & NAVIGATION BAR
      ═══════════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Logo & Slogan */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#15803d]/10 flex items-center justify-center text-[#15803d]">
              <Sprout className="w-5 h-5 text-[#15803d]" />
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight text-[#111827] leading-none flex items-center gap-1">
                <span>krishyantra</span>
              </div>
              <span className="text-[10px] font-medium text-[#6B7280] leading-none tracking-wide">
                Saath Har Kisan Ke Liye
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-[14px] font-medium text-[#374151]">
            <a href="#hero" className="text-[#15803d] font-semibold transition-colors">
              {t.nav.home}
            </a>
            <a href="#features" className="hover:text-[#15803d] transition-colors">
              {t.nav.features}
            </a>
            <a href="#how-it-works" className="hover:text-[#15803d] transition-colors">
              {t.nav.howItWorks}
            </a>
            <a href="#in-action" className="hover:text-[#15803d] transition-colors">
              {t.nav.forFarmers}
            </a>
            <a href="#video-story" className="hover:text-[#15803d] transition-colors">
              {t.nav.successStories}
            </a>
            <a href="#faq" className="hover:text-[#15803d] transition-colors">
              {t.nav.faq}
            </a>
          </nav>

          {/* Right Controls: 12-Language Selector & Get Started */}
          <div className="flex items-center gap-3">
            
            {/* 12-Language Dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#D1D5DB] bg-white text-xs font-semibold text-[#374151] hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                title="Change Website Language (12 Languages)"
              >
                <Globe className="w-3.5 h-3.5 text-[#15803d]" />
                <span>{currentLangObj.nativeName}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${langDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Choose Language (12 Languages)
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {INDIAN_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                          language === lang.code ? "font-bold text-[#15803d] bg-green-50/70" : "text-[#374151]"
                        }`}
                      >
                        <span>{lang.nativeName}</span>
                        <span className="text-[10px] text-slate-400">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Get Started Button */}
            <button
              onClick={() => router.push("/signup")}
              className="px-5 py-2 rounded-full bg-[#166534] hover:bg-[#14532d] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>{t.nav.getStarted}</span>
            </button>
          </div>

        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1: HERO SECTION matching the reference image
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="hero" className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Headlines & Call to Actions */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Handwritten Script Tag */}
              <div className="inline-block transform -rotate-2">
                <span className="font-handwriting text-xl sm:text-2xl text-[#166534] font-bold block whitespace-pre-line leading-tight">
                  {t.hero.scriptAnnotation}
                </span>
              </div>

              {/* Main 3-line Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#111827] leading-[1.08]">
                <span className="block">{t.hero.headlineLine1}</span>
                <span className="block">{t.hero.headlineLine2}</span>
                <span className="block text-[#166534]">{t.hero.headlineLine3}</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#4B5563] max-w-xl leading-relaxed">
                {t.hero.subtitle}
              </p>

              {/* 5 Feature Badges Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#E5E7EB] shadow-2xs text-[11px] font-semibold text-[#374151]">
                  <Sprout className="w-4 h-4 text-[#15803d] shrink-0" />
                  <span>{t.hero.badge1}</span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#E5E7EB] shadow-2xs text-[11px] font-semibold text-[#374151]">
                  <Smartphone className="w-4 h-4 text-[#15803d] shrink-0" />
                  <span>{t.hero.badge2}</span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#E5E7EB] shadow-2xs text-[11px] font-semibold text-[#374151]">
                  <FileCheck className="w-4 h-4 text-[#15803d] shrink-0" />
                  <span>{t.hero.badge3}</span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#E5E7EB] shadow-2xs text-[11px] font-semibold text-[#374151]">
                  <Globe className="w-4 h-4 text-[#15803d] shrink-0" />
                  <span>{t.hero.badge4}</span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#E5E7EB] shadow-2xs text-[11px] font-semibold text-[#374151]">
                  <ShieldCheck className="w-4 h-4 text-[#15803d] shrink-0" />
                  <span>{t.hero.badge5}</span>
                </div>
              </div>

              {/* Buttons Row: Get Started + Install WebApp */}
              <div className="pt-3 flex flex-wrap items-center gap-3.5">
                
                {/* Get Started Free */}
                <button
                  onClick={() => router.push("/signup")}
                  className="px-6 py-3 rounded-full bg-[#166534] hover:bg-[#14532d] text-white text-sm sm:text-base font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <span>{t.hero.ctaPrimary}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Install WebApp (replacing Watch 1 min video per instruction) */}
                <button
                  onClick={handleInstallClick}
                  className="px-5 py-3 rounded-full bg-white hover:bg-slate-50 text-[#166534] border-2 border-[#166534] text-sm sm:text-base font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  title="Install WebApp on your phone"
                >
                  <Download className="w-4 h-4 text-[#166534]" />
                  <span>{t.hero.ctaInstallApp || "Install WebApp"}</span>
                </button>
              </div>

            </div>

            {/* Right Column: Smiling Farmer + Animated Phone Mockup */}
            <div className="lg:col-span-6 relative flex items-center justify-center min-h-[460px] sm:min-h-[520px]">
              
              {/* Background Farmer Image */}
              <div className="relative w-full h-[380px] sm:h-[480px] rounded-3xl overflow-hidden shadow-xl border border-slate-200">
                <Image
                  src="/images/krishyantra_hero_farmer.jpg"
                  alt="Indian Farmer in field using Krishyantra"
                  fill
                  priority
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Floating Animated Phone Mockup */}
              <div className="absolute -right-2 sm:right-4 md:right-8 -bottom-6 sm:bottom-0 w-[240px] sm:w-[270px] bg-white rounded-[36px] p-2.5 shadow-2xl border-4 border-slate-900 animate-phone-float z-20">
                
                {/* Phone Speaker & Dynamic Island */}
                <div className="w-16 h-3 bg-slate-900 rounded-full mx-auto mb-1.5" />

                {/* Inner Phone Screen */}
                <div className="bg-[#F8FAFC] rounded-[28px] p-3 text-slate-800 space-y-2.5 text-xs font-sans border border-slate-100 overflow-hidden relative">
                  
                  {/* Phone Header */}
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <div className="flex items-center gap-1">
                      <Sprout className="w-3.5 h-3.5 text-[#15803d]" />
                      <span className="font-extrabold text-[11px] text-slate-900 tracking-tight">krishyantra</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">11:51</span>
                  </div>

                  {/* Farmer Greeting */}
                  <div>
                    <h5 className="font-extrabold text-[12px] text-slate-900 leading-tight">
                      {t.phone.greeting}
                    </h5>
                    <div className="flex items-center gap-1 text-[9px] text-slate-500">
                      <MapPin className="w-2.5 h-2.5 text-[#15803d]" />
                      <span>{t.phone.location}</span>
                    </div>
                  </div>

                  {/* Crop Health Card with Scan Animation */}
                  <div className="p-2 rounded-xl bg-white border border-green-200 shadow-2xs relative overflow-hidden">
                    {phoneScanActive && (
                      <div className="absolute inset-x-0 h-0.5 bg-green-400/80 animate-scan z-10" />
                    )}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center text-green-700 shrink-0">
                        <Sprout className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] text-slate-500 block truncate">{t.phone.cropName}</span>
                        <span className="text-[11px] font-bold text-green-700 block truncate leading-none">
                          {t.phone.cropStatus}
                        </span>
                      </div>
                    </div>
                    <span className="text-[8px] text-slate-400 block mt-1">
                      {t.phone.cropChecked}
                    </span>
                  </div>

                  {/* Today's Advice Widget */}
                  <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200">
                    <span className="text-[9px] font-bold text-amber-900 block">
                      {t.phone.adviceHeader}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Sun className="w-4 h-4 text-amber-600 shrink-0 animate-spin-slow" />
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-900 block leading-tight">
                          {t.phone.adviceAction}
                        </span>
                        <span className="text-[8px] text-slate-600 block">
                          {t.phone.adviceWindow} · {t.phone.adviceMetrics}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4 Interactive App Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setPhoneActiveTab("check")}
                      className={`p-1.5 rounded-lg border text-center transition-all ${
                        phoneActiveTab === "check" ? "bg-green-50 border-green-300 font-bold" : "bg-white border-slate-200"
                      }`}
                    >
                      <Camera className="w-3 h-3 text-green-600 mx-auto mb-0.5" />
                      <span className="text-[8px] text-slate-700 block">{t.phone.btnCheckPlant}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPhoneActiveTab("weather")}
                      className={`p-1.5 rounded-lg border text-center transition-all ${
                        phoneActiveTab === "weather" ? "bg-amber-50 border-amber-300 font-bold" : "bg-white border-slate-200"
                      }`}
                    >
                      <Sun className="w-3 h-3 text-amber-500 mx-auto mb-0.5" />
                      <span className="text-[8px] text-slate-700 block">{t.phone.btnWeather}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPhoneActiveTab("ask")}
                      className={`p-1.5 rounded-lg border text-center transition-all ${
                        phoneActiveTab === "ask" ? "bg-indigo-50 border-indigo-300 font-bold" : "bg-white border-slate-200"
                      }`}
                    >
                      <Mic className="w-3 h-3 text-indigo-500 mx-auto mb-0.5" />
                      <span className="text-[8px] text-slate-700 block">{t.phone.btnAsk}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPhoneActiveTab("mandi")}
                      className={`p-1.5 rounded-lg border text-center transition-all ${
                        phoneActiveTab === "mandi" ? "bg-emerald-50 border-emerald-300 font-bold" : "bg-white border-slate-200"
                      }`}
                    >
                      <Building2 className="w-3 h-3 text-emerald-600 mx-auto mb-0.5" />
                      <span className="text-[8px] text-slate-700 block">{t.phone.btnMandi}</span>
                    </button>
                  </div>

                </div>
              </div>

              {/* Handwritten Note pointing to Phone */}
              <div className="absolute -right-4 sm:-right-8 top-12 hidden md:block transform rotate-6 z-30">
                <span className="font-handwriting text-xl text-slate-800 font-bold block max-w-[130px] leading-tight drop-shadow-sm">
                  {t.hero.pocketAnnotation}
                </span>
                <span className="text-2xl text-slate-800 block text-right -mt-1">⤵</span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2: "Everything you need for your farm, in one place"
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-16 bg-white border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827]">
              {t.features.title}
            </h2>
            <p className="text-sm sm:text-base text-[#4B5563]">
              {t.features.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#15803d]/40 transition-all hover:shadow-md flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <CloudRain className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#111827]">
                  {t.features.card1Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                  {t.features.card1Desc}
                </p>
              </div>
              <div className="pt-4">
                <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  {t.features.card1Badge}
                </span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#15803d]/40 transition-all hover:shadow-md flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center text-green-700">
                  <Sprout className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#111827]">
                  {t.features.card2Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                  {t.features.card2Desc}
                </p>
              </div>
              <div className="pt-4">
                <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  {t.features.card2Badge}
                </span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#15803d]/40 transition-all hover:shadow-md flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#111827]">
                  {t.features.card3Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                  {t.features.card3Desc}
                </p>
              </div>
              <div className="pt-4">
                <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  {t.features.card3Badge}
                </span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#15803d]/40 transition-all hover:shadow-md flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <Sun className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#111827]">
                  {t.features.card4Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                  {t.features.card4Desc}
                </p>
              </div>
              <div className="pt-4">
                <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  {t.features.card4Badge}
                </span>
              </div>
            </div>

            {/* Card 5 */}
            <div className="p-6 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#15803d]/40 transition-all hover:shadow-md flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#111827]">
                  {t.features.card5Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                  {t.features.card5Desc}
                </p>
              </div>
              <div className="pt-4">
                <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  {t.features.card5Badge}
                </span>
              </div>
            </div>

            {/* Card 6 */}
            <div className="p-6 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#15803d]/40 transition-all hover:shadow-md flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                  <Mic className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#111827]">
                  {t.features.card6Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                  {t.features.card6Desc}
                </p>
              </div>
              <div className="pt-4">
                <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  {t.features.card6Badge}
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3: "How Krishyantra Works"
      ═════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-16 bg-[#FBFDF9] border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-wrap items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827]">
                {t.howItWorks.title}
              </h2>
              <p className="text-sm sm:text-base text-[#4B5563] mt-1">
                {t.howItWorks.subtitle}
              </p>
            </div>

            <div className="transform -rotate-2 hidden sm:block">
              <span className="font-handwriting text-2xl text-[#166534] font-bold">
                {t.howItWorks.scriptBadge}
              </span>
            </div>
          </div>

          {/* 5 Connected Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
            
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-2xs space-y-3 relative">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#166534] text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <Smartphone className="w-5 h-5 text-[#15803d]" />
              </div>
              <h4 className="text-sm font-bold text-[#111827]">
                {t.howItWorks.step1Title}
              </h4>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                {t.howItWorks.step1Desc}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-2xs space-y-3 relative">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#166534] text-white flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <Shield className="w-5 h-5 text-[#15803d]" />
              </div>
              <h4 className="text-sm font-bold text-[#111827]">
                {t.howItWorks.step2Title}
              </h4>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                {t.howItWorks.step2Desc}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-2xs space-y-3 relative">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#166534] text-white flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <Sprout className="w-5 h-5 text-[#15803d]" />
              </div>
              <h4 className="text-sm font-bold text-[#111827]">
                {t.howItWorks.step3Title}
              </h4>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                {t.howItWorks.step3Desc}
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-2xs space-y-3 relative">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#166534] text-white flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <Settings className="w-5 h-5 text-[#15803d]" />
              </div>
              <h4 className="text-sm font-bold text-[#111827]">
                {t.howItWorks.step4Title}
              </h4>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                {t.howItWorks.step4Desc}
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-2xs space-y-3 relative">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#166534] text-white flex items-center justify-center text-xs font-bold">
                  5
                </div>
                <CheckCircle2 className="w-5 h-5 text-[#15803d]" />
              </div>
              <h4 className="text-sm font-bold text-[#111827]">
                {t.howItWorks.step5Title}
              </h4>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                {t.howItWorks.step5Desc}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 4: "See Krishyantra in Action"
      ═════════════════════════════════════════════ */}
      <section id="in-action" className="py-16 bg-white border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827]">
              {t.inAction.title}
            </h2>
            <p className="text-sm sm:text-base text-[#4B5563] mt-1">
              {t.inAction.subtitle}
            </p>
          </div>

          {/* 5-Step Workflow Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            
            {/* Step 1: Upload Photo */}
            <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{t.inAction.step1Title}</span>
                <Camera className="w-4 h-4 text-slate-500" />
              </div>
              <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-200">
                <img
                  src="/images/krishyantra_leaf_spot.jpg"
                  alt="Soybean crop leaf with spot"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Step 2: Get Diagnosis */}
            <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-3">
              <span className="text-xs font-bold text-slate-900 block">{t.inAction.step2Title}</span>
              <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200">
                <span className="text-xs font-bold text-amber-900 block">
                  {t.inAction.leafSpotDetected}
                </span>
                <span className="text-[10px] text-amber-700 font-mono">
                  {t.inAction.confidence}
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <span>{t.inAction.whatMeans}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <span>{t.inAction.whyHappened}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <span>{t.inAction.whatNext}</span>
                </div>
              </div>
            </div>

            {/* Step 3: Check Spray Window */}
            <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-3">
              <span className="text-xs font-bold text-slate-900 block">{t.inAction.step3Title}</span>
              <div className="p-2.5 rounded-xl bg-green-50 border border-green-200">
                <span className="text-xs font-bold text-green-900 block">
                  {t.inAction.sprayWindow}
                </span>
                <span className="text-[10px] text-green-700 block mt-0.5">
                  {t.inAction.safeToSpray}
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-600">
                <div>{t.inAction.temp}</div>
                <div>{t.inAction.wind}</div>
                <div>{t.inAction.rain}</div>
              </div>
            </div>

            {/* Step 4: Product & Dosage */}
            <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-3">
              <span className="text-xs font-bold text-slate-900 block">{t.inAction.step4Title}</span>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-xs font-bold text-slate-900 block">{t.inAction.productName}</span>
                <span className="text-[10px] text-slate-500 block">{t.inAction.productCategory}</span>
              </div>
              <div className="space-y-1 text-xs text-slate-600">
                <div>{t.inAction.dosageLabel}: {t.inAction.dosageVal}</div>
                <div>{t.inAction.mixLabel}: {t.inAction.mixVal}</div>
                <div>{t.inAction.appLabel}: {t.inAction.appVal}</div>
              </div>
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="w-full py-1 text-[11px] font-semibold text-[#15803d] border border-[#15803d]/30 rounded-lg hover:bg-green-50 transition-colors"
              >
                {t.inAction.viewGuide}
              </button>
            </div>

            {/* Step 5: Expected Impact */}
            <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-3">
              <span className="text-xs font-bold text-slate-900 block">{t.inAction.step5Title}</span>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs font-extrabold text-emerald-800 block">
                  {t.inAction.yieldUplift}
                </span>
                <span className="text-xs font-extrabold text-[#111827] block mt-0.5">
                  {t.inAction.netBenefit}
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <span>{t.inAction.whyWorks}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <span>{t.inAction.whatExpect}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <span>{t.inAction.trackResults}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 5: REAL FARMER CHALLENGE VIDEO SECTION
          (Replaces "Trusted by Farmers" per user request with video from F:\Downloads\FARMER_HAS_A_PROBLEM_...mp4)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="video-story" className="py-16 bg-[#FBFDF9] border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left: Custom Video Player playing farmer video */}
            <div className="lg:col-span-8 space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#15803d]">
                  {language === "hi" ? "जमीनी हकीकत" : "Field Reality"}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mt-1">
                  {language === "hi" ? "किसान की वास्तविक समस्या — कृषि यंत्र क्यों जरूरी है" : "The Farmer's Challenge — Why Krishyantra Exists"}
                </h2>
                <p className="text-xs sm:text-sm text-[#4B5563] mt-1">
                  {language === "hi" 
                    ? "देखें कैसे गलत समय पर छिड़काव और जलवायु तनाव से फसल का नुकसान होता है।"
                    : "Watch how untimely chemical spraying and unpredicted climate shocks damage crops without real telemetry."}
                </p>
              </div>

              {/* Video Player Frame */}
              <div className="relative rounded-3xl overflow-hidden bg-black shadow-2xl border-4 border-white aspect-video max-h-[440px]">
                <video
                  ref={videoRef}
                  src="/videos/farmer_problem.mp4"
                  autoPlay
                  loop
                  muted={videoMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Floating Video Controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-90 transition-opacity flex flex-col justify-between p-4 sm:p-6">
                  
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/20">
                      Real Field Documentation
                    </span>
                    <button
                      onClick={toggleVideoMute}
                      className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer"
                      title={videoMuted ? "Unmute Audio" : "Mute Audio"}
                    >
                      {videoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Bottom Bar: Play/Pause button */}
                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={toggleVideoPlay}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      {videoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{videoPlaying ? "Pause Video" : "Play Story"}</span>
                    </button>

                    <button
                      onClick={() => router.push("/signup")}
                      className="text-xs font-semibold text-white/90 hover:text-white underline"
                    >
                      {language === "hi" ? "अपनी फसल बचाएं →" : "Protect Your Crop →"}
                    </button>
                  </div>

                </div>
              </div>
            </div>

            {/* Right: "Stronger Farmers. Greener Tomorrow." manifesto card */}
            <div className="lg:col-span-4 p-8 rounded-3xl bg-white border border-[#E5E7EB] shadow-md space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-700">
                  <Sprout className="w-8 h-8" />
                </div>

                <h3 className="text-2xl font-extrabold text-[#111827] leading-tight">
                  {t.testimonials.sideCardTitle}
                </h3>

                <p className="text-sm text-[#4B5563] leading-relaxed">
                  {t.testimonials.sideCardDesc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E5E7EB]">
                <button
                  onClick={() => router.push("/signup")}
                  className="w-full py-3 rounded-full bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t.nav.getStarted}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 6: FAQ ACCORDION
      ═════════════════════════════════════════════ */}
      <section id="faq" className="py-16 bg-white border-t border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827]">
              {t.faq.title}
            </h2>
            <p className="text-sm text-[#6B7280]">
              {t.faq.subtitle}
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#E5E7EB] bg-[#FBFDF9] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-bold text-[#111827]">
                      {faq.q}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-[#4B5563] leading-relaxed border-t border-[#E5E7EB] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 7: CTA BANNER with sunset farm background & WhatsApp redirect
      ═════════════════════════════════════════════ */}
      <section className="relative py-20 overflow-hidden text-white">
        
        {/* Background Sunset Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/krishyantra_sunset_banner.jpg"
            alt="Sunset over lush green farm"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/70" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              {t.ctaBanner.title}
            </h2>
            <p className="text-base sm:text-lg text-slate-200">
              {t.ctaBanner.subtitle}
            </p>
          </div>

          {/* Action Buttons: Get Started + Chat on WhatsApp (redirects to signup per user instruction) */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            
            <button
              onClick={() => router.push("/signup")}
              className="px-8 py-3.5 rounded-full bg-[#15803d] hover:bg-[#166534] text-white text-sm sm:text-base font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <span>{t.ctaBanner.btnGetStarted}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* WhatsApp button redirects to signup/login per user instruction */}
            <button
              onClick={() => router.push("/signup")}
              className="px-7 py-3.5 rounded-full bg-white hover:bg-slate-100 text-[#111827] text-sm sm:text-base font-bold transition-all shadow-lg flex items-center gap-2.5 cursor-pointer"
              title="Connect via WhatsApp (Redirects to Login/Signup)"
            >
              <MessageCircle className="w-5 h-5 text-emerald-600 fill-emerald-500" />
              <span>{t.ctaBanner.btnWhatsApp}</span>
            </button>

          </div>

          {/* 4 Trust Badges */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left sm:text-center">
            
            <div className="p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/15">
              <span className="text-xl sm:text-2xl font-black text-white block">140+</span>
              <span className="text-xs text-slate-300">{t.ctaBanner.stat1Label}</span>
            </div>

            <div className="p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/15">
              <span className="text-xl sm:text-2xl font-black text-white block">60+</span>
              <span className="text-xs text-slate-300">{t.ctaBanner.stat2Label}</span>
            </div>

            <div className="p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/15">
              <span className="text-xl sm:text-2xl font-black text-white block">12+</span>
              <span className="text-xs text-slate-300">{t.ctaBanner.stat3Label}</span>
            </div>

            <div className="p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/15">
              <span className="text-xl sm:text-2xl font-black text-white block">100%</span>
              <span className="text-xs text-slate-300">{t.ctaBanner.stat4Label}</span>
            </div>

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FOOTER matching reference screenshot
      ═══════════════════════════════════════════════════════════════════════ */}
      <footer className="bg-white border-t border-[#E5E7EB] py-8 text-xs text-[#6B7280]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-[#15803d]" />
            <span className="font-extrabold text-slate-900">krishyantra</span>
            <span className="text-slate-400">·</span>
            <span>Saath Har Kisan Ke Liye</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-medium">
            <a href="#hero" className="hover:text-[#15803d]">About</a>
            <a href="#features" className="hover:text-[#15803d]">Features</a>
            <a href="#how-it-works" className="hover:text-[#15803d]">How It Works</a>
            <a href="#in-action" className="hover:text-[#15803d]">For Farmers</a>
            <a href="#faq" className="hover:text-[#15803d]">FAQ</a>
            <a href="#video-story" className="hover:text-[#15803d]">Privacy</a>
            <a href="#video-story" className="hover:text-[#15803d]">Terms</a>
            <a href="#video-story" className="hover:text-[#15803d]">Contact</a>
          </div>

          <div>
            © {new Date().getFullYear()} krishyantra. All rights reserved.
          </div>

        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════════════════════
          PWA INSTALL MODAL (Guides user when clicking "Install WebApp")
      ═══════════════════════════════════════════════════════════════════════ */}
      {installModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setInstallModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 mx-auto">
                <Smartphone className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Install Krishyantra WebApp
              </h3>
              <p className="text-xs text-slate-500">
                Open in 1-tap from your home screen. No App Store or APK download needed!
              </p>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#166534] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </div>
                <span>Tap the <strong>Share</strong> or <strong>Three Dots ⋮</strong> icon in your mobile browser.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#166534] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </div>
                <span>Select <strong>Add to Home Screen</strong> or <strong>Install App</strong>.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#166534] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </div>
                <span>Krishyantra icon will appear on your phone like a native app!</span>
              </div>
            </div>

            <button
              onClick={() => setInstallModalOpen(false)}
              className="w-full py-3 rounded-full bg-[#166534] hover:bg-[#14532d] text-white font-bold text-sm transition-colors cursor-pointer"
            >
              Got It!
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
