"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useFarm } from "@/context/FarmContext";
import { isUserLoggedIn, getStoredProfile, saveProfile, logoutUser, INDIAN_LANGUAGES } from "@/lib/userStore";
import { Footer } from "@/components/Footer";
import { KrishyantraFooter } from "@/components/KrishyantraFooter";
import { ModelServerStatusPill } from "@/components/ModelServerStatusPill";
import {
  Globe,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  MapPin,
  TrendingUp,
  ChevronDown,
  Mic,
  Leaf,
  Settings,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sprout,
  Activity,
  Layers,
  PhoneCall,
  Home,
  UserPlus,
  BookOpen,
  CloudSun,
  FileText,
  Plus,
  CheckCircle2,
  Database,
  AlertTriangle,
  Cpu,
} from "lucide-react";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/how-it-works",
  "/impact-story",
  "/architecture",
  "/product",
  "/impact",
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { farms, activeFarm, selectFarm, createFarm } = useFarm();

  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [profile, setProfile] = useState(getStoredProfile());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [farmDropdownOpen, setFarmDropdownOpen] = useState(false);

  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const farmDropdownRef = useRef<HTMLDivElement>(null);

  // Live website settings & admin broadcast alerts
  const [systemSettings, setSystemSettings] = useState<{
    maintenanceMode: boolean;
    maintenanceMessage: string;
    broadcastAlert: { message: string; createdAt: string; active: boolean } | null;
  } | null>(null);
  const [dismissedAlert, setDismissedAlert] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data?.settings) {
            setSystemSettings(data.settings);
          }
        }
      } catch (e) {
        // Silently continue
      }
    };
    fetchSettings();
    const interval = setInterval(fetchSettings, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const isAuthed = isUserLoggedIn();
    setLoggedIn(isAuthed);
    setProfile(getStoredProfile());
    if (!isAuthed && pathname === "/dashboard") {
      router.replace("/signup?redirect=/dashboard");
    }
  }, [pathname, router]);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target as Node)) {
        setMoreDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (farmDropdownRef.current && !farmDropdownRef.current.contains(e.target as Node)) {
        setFarmDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setLoggedIn(false);
    setProfileDropdownOpen(false);
    router.push("/");
  };

  const isProtectedPath = !PUBLIC_PATHS.includes(pathname);
  const showAuthGate = !loggedIn && isProtectedPath;

  const displayName = profile.fullName && profile.fullName.trim()
    ? profile.fullName
    : (language === "hi" ? "किसान साथी" : "Farmer Friend");
  const displayLocation = activeFarm.district && activeFarm.state
    ? `${activeFarm.district}, ${activeFarm.state}`
    : activeFarm.district || (language === "hi" ? "लाइव क्षेत्र" : "Live Region");

  const currentLangObj = INDIAN_LANGUAGES.find((l) => l.code === language) || INDIAN_LANGUAGES[0];

  const isSecondaryActive = ["/impact", "/journal", "/architecture", "/robi"].includes(pathname);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#111827] selection:bg-[#7C3AED] selection:text-white font-sans pb-20 md:pb-0">
      
      {/* ── Live Admin Broadcast Alert Banner ────────────────── */}
      {systemSettings?.broadcastAlert?.active && !dismissedAlert && (
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-md z-50 border-b border-white/20 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5 max-w-6xl mx-auto flex-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shrink-0 shadow-xs">
              {language === "hi" ? "किसान सलाह" : "Farmer Advisory"}
            </span>
            <span className="leading-snug font-medium text-white">{systemSettings.broadcastAlert.message}</span>
          </div>
          <button
            onClick={() => setDismissedAlert(true)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white shrink-0 cursor-pointer"
            title="Dismiss advisory"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Live Maintenance Mode Banner ─────────────────────── */}
      {systemSettings?.maintenanceMode && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-inner z-50 animate-in slide-in-from-top duration-300">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-200 animate-pulse" />
          <span className="text-center">
            <strong>{language === "hi" ? "सिस्टम सूचना:" : "Maintenance Notice:"}</strong>{" "}
            {systemSettings.maintenanceMessage || (language === "hi" ? "नियमित कृषि डेटाबेस अद्यतन प्रगति पर है।" : "Scheduled platform optimization in progress.")}
          </span>
        </div>
      )}

      {/* ── Precision Glassmorphic Top Navbar ────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e8ede4] shadow-[0_2px_12px_rgba(27,67,50,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Brand Logo & Global Farm Selector */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link href="/" className="flex items-center gap-2 group cursor-pointer shrink-0" title="KrishYantra Home">
              <div className="relative h-7.5 sm:h-9 w-28 sm:w-44">
                <Image
                  src="/images/krishyantra_logo.svg"
                  alt="KrishYantra"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>

            {/* Global Farm & Location Selector */}
            {loggedIn && (
              <div className="relative shrink-0" ref={farmDropdownRef}>
                <button
                  type="button"
                  onClick={() => setFarmDropdownOpen((v) => !v)}
                  className="flex items-center gap-1.5 sm:gap-2 h-9 px-2.5 sm:px-3 rounded-xl bg-[#f8faf6] hover:bg-[#edf2ea] text-[#11261f] transition-all text-xs font-bold shadow-2xs cursor-pointer border border-[#e8ede4]"
                  title="Switch Active Farm or Field"
                >
                  <MapPin className="h-3.5 w-3.5 text-[#2d6a4f] shrink-0" />
                  <div className="flex items-center gap-1.5 text-left max-w-[100px] sm:max-w-[180px] truncate">
                    <span className="text-xs font-extrabold text-[#11261f] truncate">{activeFarm.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono truncate hidden md:inline">({activeFarm.primaryCrop})</span>
                  </div>
                  <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform shrink-0 ${farmDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {farmDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white border border-[#e8ede4] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 text-xs text-slate-800">
                    <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Farm / Portfolio</span>
                      <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">{farms.length} Farm(s)</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto py-1 space-y-1">
                      {farms.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => {
                            selectFarm(f.id);
                            setFarmDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center justify-between transition-colors ${
                            f.id === activeFarm.id
                              ? "bg-emerald-50/80 text-[#1b4332] font-extrabold border-l-4 border-[#2d6a4f]"
                              : "text-slate-700 font-medium"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="font-bold flex items-center gap-1.5">
                              <span>{f.name}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-md">{f.primaryCrop}</span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {f.district ? `${f.district}, ${f.state}` : "GPS Location"} · <strong className="text-slate-800">{f.areaAcres} Acres</strong>
                            </div>
                          </div>
                          {f.id === activeFarm.id && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 ml-2" />}
                        </button>
                      ))}
                    </div>
                    {!pathname?.includes("/prescription") && (
                      <div className="border-t border-slate-100 pt-2 px-2.5">
                        <Link
                          href="/fields?action=register"
                          onClick={() => setFarmDropdownOpen(false)}
                          className="w-full py-2.5 px-3 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Another Farm / Field</span>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Primary Clean Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-700">
            {loggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-2 h-9 px-3.5 rounded-xl whitespace-nowrap shrink-0 transition-all text-xs font-bold ${
                    pathname === "/dashboard"
                      ? "bg-[#e8f5e9] text-[#1b4332] border border-[#cbe5cb] shadow-2xs font-extrabold"
                      : "text-slate-600 font-semibold hover:text-[#1b4332] hover:bg-slate-100/80"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4 text-[#2d6a4f]" />
                  <span>{t.navDashboard || "Dashboard"}</span>
                </Link>

                <Link
                  href="/plant-intelligence"
                  className={`flex items-center gap-2 h-9 px-3.5 rounded-xl whitespace-nowrap shrink-0 transition-all text-xs font-bold ${
                    pathname === "/plant-intelligence"
                      ? "bg-[#e8f5e9] text-[#1b4332] border border-[#cbe5cb] shadow-2xs font-extrabold"
                      : "text-slate-600 font-semibold hover:text-[#1b4332] hover:bg-slate-100/80"
                  }`}
                >
                  <Sprout className="h-4 w-4 text-emerald-600" />
                  <span>{t.navPlantAi || "Plant Health AI"}</span>
                </Link>

                <Link
                  href="/fields"
                  className={`flex items-center gap-2 h-9 px-3.5 rounded-xl whitespace-nowrap shrink-0 transition-all text-xs font-bold ${
                    pathname === "/fields"
                      ? "bg-[#e8f5e9] text-[#1b4332] border border-[#cbe5cb] shadow-2xs font-extrabold"
                      : "text-slate-600 font-semibold hover:text-[#1b4332] hover:bg-slate-100/80"
                  }`}
                >
                  <Layers className="h-4 w-4 text-[#2d6a4f]" />
                  <span>{t.navFields || "My Fields"}</span>
                </Link>

                <Link
                  href="/assistant"
                  className={`flex items-center gap-2 h-9 px-3.5 rounded-xl whitespace-nowrap shrink-0 transition-all text-xs font-bold ${
                    pathname === "/assistant"
                      ? "bg-[#e8f5e9] text-[#1b4332] border border-[#cbe5cb] shadow-2xs font-extrabold"
                      : "text-slate-600 font-semibold hover:text-[#1b4332] hover:bg-slate-100/80"
                  }`}
                >
                  <Mic className="h-4 w-4 text-amber-500" />
                  <span>{t.navAdvisory || "Ask AI"}</span>
                </Link>

                {/* Clean Dropdown for Secondary Tools */}
                <div className="relative shrink-0" ref={moreDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setMoreDropdownOpen((v) => !v)}
                    className={`flex items-center gap-1.5 h-9 px-3 rounded-xl whitespace-nowrap transition-all cursor-pointer text-xs font-bold ${
                      isSecondaryActive
                        ? "bg-[#e8f5e9] text-[#1b4332] border border-[#cbe5cb] font-extrabold"
                        : "text-slate-600 font-semibold hover:text-[#1b4332] hover:bg-slate-100/80"
                    }`}
                  >
                    <span>{language === "hi" ? "अधिक उपकरण" : "More Tools"}</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {moreDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 font-medium text-xs text-slate-700 space-y-1">

                      <Link
                        href="/impact"
                        onClick={() => setMoreDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                      >
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                        <div>
                          <span className="font-bold block">ROBI Causal Impact</span>
                          <span className="text-[10px] text-slate-500">Yield Attribution Proof</span>
                        </div>
                      </Link>

                      <Link
                        href="/what-if"
                        onClick={() => setMoreDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                      >
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        <div>
                          <span className="font-bold block">What-If Simulator</span>
                          <span className="text-[10px] text-slate-500">Counterfactual Stress Modeling</span>
                        </div>
                      </Link>

                      <Link
                        href="/journal"
                        onClick={() => setMoreDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                      >
                        <BookOpen className="h-4 w-4 text-amber-600" />
                        <div>
                          <span className="font-bold block">Intervention Journal</span>
                          <span className="text-[10px] text-slate-500">Farm Spray Records</span>
                        </div>
                      </Link>

                      <div className="border-t border-slate-100 my-1" />

                      <Link
                        href="/architecture"
                        onClick={() => setMoreDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                      >
                        <FileText className="h-4 w-4 text-indigo-600" />
                        <div>
                          <span className="font-bold block">Concept Note & Architecture</span>
                          <span className="text-[10px] text-slate-500">PS-01 to PS-07 Spec</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className={`py-2 px-3 rounded-xl transition-all text-sm font-bold flex items-center gap-1.5 ${
                    pathname === "/dashboard"
                      ? "bg-[#e8f5e9] text-[#1b4332] font-extrabold border border-[#cbe5cb]"
                      : "text-slate-600 font-semibold hover:text-[#1b4332] hover:bg-slate-100"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4 text-[#2d6a4f]" />
                  <span>{language === "hi" ? "डैशबोर्ड" : "Farm Dashboard"}</span>
                </Link>


                <Link
                  href="/how-it-works"
                  className={`py-2 px-3 rounded-xl transition-all text-sm ${
                    pathname === "/how-it-works"
                      ? "bg-indigo-50 text-[#533afd] font-extrabold border border-indigo-200"
                      : "text-slate-600 font-semibold hover:text-[#533afd] hover:bg-indigo-50/50"
                  }`}
                >
                  <span>{language === "hi" ? "हाउ इट वर्क्स" : "How It Works"}</span>
                </Link>

                <Link
                  href="/impact-story"
                  className={`py-2 px-3 rounded-xl transition-all text-sm ${
                    pathname === "/impact-story"
                      ? "bg-indigo-50 text-[#533afd] font-extrabold border border-indigo-200"
                      : "text-slate-600 font-semibold hover:text-[#533afd] hover:bg-indigo-50/50"
                  }`}
                >
                  <span>{language === "hi" ? "सफलता की कहानियाँ" : "Impact Stories"}</span>
                </Link>

                <Link
                  href="/architecture"
                  className={`py-2 px-3 rounded-xl transition-all text-sm ${
                    pathname === "/architecture"
                      ? "bg-indigo-50 text-[#533afd] font-extrabold border border-indigo-200"
                      : "text-slate-600 font-semibold hover:text-[#533afd] hover:bg-indigo-50/50"
                  }`}
                >
                  <span>{language === "hi" ? "आर्किटेक्चर" : "Architecture"}</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Tools: Model Status Pill + Language Selector + User Profile + Mobile Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Live Model Server Status Indicator removed per user request */}

            {/* Language Switcher Dropdown (Desktop/Tablet) */}
            <div className="relative shrink-0 hidden sm:block notranslate" translate="no" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen((v) => !v)}
                className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200 cursor-pointer shrink-0 shadow-2xs"
                translate="no"
              >
                <Globe className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span className="font-bold notranslate" translate="no" lang={currentLangObj.code}>{currentLangObj.native}</span>
                <ChevronDown className="h-3 w-3 text-slate-500 shrink-0" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 font-sans notranslate" translate="no">
                  {INDIAN_LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-purple-50 transition-colors notranslate ${
                        language === l.code ? "bg-purple-50 text-purple-800 font-extrabold" : "text-slate-700 font-medium"
                      }`}
                      translate="no"
                    >
                      <span className="notranslate" translate="no" lang={l.code}>{l.native}</span>
                      <span className="text-[10px] text-slate-400 font-mono font-normal notranslate" translate="no" lang="en">({l.name})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Avatar / User Info */}
            {loggedIn ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 h-9 px-2.5 sm:px-3 rounded-xl bg-[#e8f5e9] hover:bg-[#d8edd9] border border-[#cbe5cb] text-[#1b4332] transition-all cursor-pointer shadow-2xs"
                >
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#1b4332] to-[#2d6a4f] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {displayName[0] || "K"}
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-left text-xs">
                    <span className="font-bold text-[#11261f] truncate max-w-[100px]">{displayName}</span>
                    <span className="text-[10px] text-slate-500 font-medium truncate max-w-[90px] hidden xl:inline">· {displayLocation.split(',')[0]}</span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-slate-500 hidden sm:block shrink-0" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 font-sans text-xs">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <span className="font-bold text-slate-900 block">{displayName}</span>
                      <span className="text-[10px] text-slate-500 block">{profile.primaryCrop} ({profile.fieldAreaAcres || 5} Acres)</span>
                    </div>
                    <Link
                      href="/onboarding"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                    >
                      <Settings className="h-3.5 w-3.5 text-slate-500" />
                      <span>Edit Farm Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-rose-50 text-rose-600 font-bold transition-colors cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-[#533afd] hover:bg-indigo-50/60 border border-slate-200 transition-all cursor-pointer"
                >
                  {language === "hi" ? "लॉगिन" : "Log In"}
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #533afd, #4434d4)" }}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>{language === "hi" ? "मुफ्त शुरू करें" : "Sign Up"}</span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Out Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white/98 backdrop-blur-sm px-4 py-4 space-y-1 animate-in slide-in-from-top-2 text-sm font-semibold text-slate-700">
            {loggedIn ? (
              [
                { href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4 text-emerald-600" />, label: language === "hi" ? "मेरा खेत" : "Dashboard" },
                { href: "/plant-intelligence", icon: <Sprout className="h-4 w-4 text-blue-600" />, label: language === "hi" ? "पौधा स्वास्थ्य AI" : "Plant Health AI" },
                { href: "/fields", icon: <Layers className="h-4 w-4 text-purple-600" />, label: language === "hi" ? "मेरे खेत" : "Fields" },
                { href: "/assistant", icon: <Mic className="h-4 w-4 text-amber-500" />, label: language === "hi" ? "AI सलाह" : "Voice AI" },
                { href: "/impact", icon: <TrendingUp className="h-4 w-4 text-emerald-600" />, label: language === "hi" ? "ROBI प्रभाव" : "ROBI Impact" },
                { href: "/journal", icon: <BookOpen className="h-4 w-4 text-amber-600" />, label: language === "hi" ? "फार्म डायरी" : "Farm Journal" },
                { href: "/architecture", icon: <FileText className="h-4 w-4 text-indigo-600" />, label: language === "hi" ? "आर्किटेक्चर" : "Architecture" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-purple-50 hover:text-purple-700 transition-colors active-press"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))
            ) : (
              [
                { href: "/how-it-works", icon: <Sparkles className="h-4 w-4 text-[#533afd]" />, label: language === "hi" ? "हाउ इट वर्क्स" : "How It Works" },
                { href: "/impact-story", icon: <TrendingUp className="h-4 w-4 text-emerald-600" />, label: language === "hi" ? "सफलता की कहानियाँ" : "Impact Stories" },
                { href: "/architecture", icon: <FileText className="h-4 w-4 text-indigo-600" />, label: language === "hi" ? "आर्किटेक्चर" : "Architecture" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-indigo-50 hover:text-[#533afd] transition-colors active-press"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))
            )}
            {/* Language Selector (Mobile Drawer) */}
            <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between px-2" translate="no">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-[#2d6a4f]" /> Language
              </span>
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  setMobileMenuOpen(false);
                }}
                aria-label="Select Language"
                className="text-xs font-bold text-[#1b4332] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-hidden notranslate"
                translate="no"
              >
                {INDIAN_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="notranslate" translate="no" lang={l.code}>
                    {l.native} ({l.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100 flex gap-2">
              {!loggedIn && (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-800 font-bold text-center text-xs active-press"
                  >
                    <span>{language === "hi" ? "लॉगिन" : "Log In"}</span>
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2.5 px-3 rounded-xl text-white font-bold text-center text-xs shadow-xs active-press"
                    style={{ background: "linear-gradient(135deg, #533afd, #4434d4)" }}
                  >
                    <span>{language === "hi" ? "मुफ्त शुरू करें" : "Sign Up"}</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main App Content Area with Auth Guard */}
      {showAuthGate ? (
        <main className="flex-1 w-full flex items-center justify-center p-4 sm:p-6 py-12 min-h-[calc(100vh-140px)]" style={{ background: "radial-gradient(circle at 50% 0%, #f6f9fc 0%, #ffffff 100%)" }}>
          <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95">
            <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-to-br from-[#533afd] to-[#4434d4] text-white flex items-center justify-center shadow-lg shadow-[#533afd]/25">
              <Lock className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold text-[#533afd] bg-[#533afd]/10 px-3 py-1 rounded-full border border-[#533afd]/20 uppercase">
                {language === "hi" ? "सुरक्षित किसान क्षेत्र" : "Farmer Authentication Required"}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
                {language === "hi" ? "पहले अपना किसान खाता बनाएं या लॉगिन करें" : "Sign Up or Log In to Access This Page"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                {language === "hi"
                  ? "अपने खेत के लाइव टेलीमेट्री सेंसर्स, रोग पहचान, मंडी भाव और व्यक्तिगत AI सलाह को सुरक्षित रूप से देखने के लिए खाता आवश्यक है।"
                  : "To access real-time satellite agro-telemetry, multimodal disease diagnostics, verified APMC prices, and your personal field portfolio, please log in or create a free account."}
              </p>
            </div>
            
            <div className="flex flex-col gap-3 pt-2">
              <Link
                href={`/signup?redirect=${encodeURIComponent(pathname || "/dashboard")}`}
                className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] active-press cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #1b4332, #2d6a4f)",
                }}
              >
                <UserPlus className="h-4 w-4" />
                <span>{language === "hi" ? "नया किसान खाता बनाएं (साइन अप)" : "Register Your Farm (Sign Up)"}</span>
              </Link>

              <Link
                href={`/login?redirect=${encodeURIComponent(pathname || "/dashboard")}`}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all border border-slate-200 flex items-center justify-center gap-2 active-press cursor-pointer"
              >
                <Lock className="h-4 w-4 text-[#533afd]" />
                <span>{language === "hi" ? "पहले से पंजीकृत हैं? लॉगिन करें" : "Already Registered? Log In"}</span>
              </Link>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span>{language === "hi" ? "सुरक्षित एवं सत्यापित किसान पोर्टल" : "100% Free Public Good for Farmers"}</span>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 w-full">{children}</main>
      )}

      {/* ── Mobile Fixed Bottom Nav Bar (1-Tap Fast Web App Switcher) ─────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-[#e8ede4] px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-[0_-4px_16px_rgba(27,67,50,0.08)]">
        {loggedIn ? (
          <>
            <Link
              href="/dashboard"
              className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] gap-0.5 text-[10px] font-bold active-press relative transition-all ${
                pathname === "/dashboard" ? "text-[#1b4332]" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>{language === "hi" ? "डैशबोर्ड" : "Dashboard"}</span>
              {pathname === "/dashboard" && <span className="absolute -bottom-1 h-1 w-4 rounded-full bg-[#1b4332]" />}
            </Link>

            <Link
              href="/plant-intelligence"
              className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] gap-0.5 text-[10px] font-bold active-press relative transition-all ${
                pathname === "/plant-intelligence" ? "text-[#1b4332]" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sprout className="h-4 w-4" />
              <span>{language === "hi" ? "पौधा" : "Plant AI"}</span>
              {pathname === "/plant-intelligence" && <span className="absolute -bottom-1 h-1 w-4 rounded-full bg-[#1b4332]" />}
            </Link>

            <Link
              href="/assistant"
              className="flex flex-col items-center justify-center min-w-[54px] min-h-[44px] gap-0.5 text-[10px] font-bold active-press relative"
            >
              <div className="h-10 w-10 -mt-5 rounded-full text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 animate-pulse-ring" style={{ background: "linear-gradient(135deg, #1b4332, #2d6a4f)" }}>
                <Mic className="h-4 w-4" />
              </div>
              <span className="text-[#1b4332] font-black">{language === "hi" ? "AI साथी" : "Ask AI"}</span>
            </Link>

            <Link
              href="/fields"
              className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] gap-0.5 text-[10px] font-bold active-press relative transition-all ${
                pathname === "/fields" ? "text-[#1b4332]" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>{language === "hi" ? "खेत" : "Fields"}</span>
              {pathname === "/fields" && <span className="absolute -bottom-1 h-1 w-4 rounded-full bg-[#1b4332]" />}
            </Link>

            <Link
              href="/impact"
              className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] gap-0.5 text-[10px] font-bold active-press relative transition-all ${
                pathname === "/impact" ? "text-[#1b4332]" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>{language === "hi" ? "प्रभाव" : "Impact"}</span>
              {pathname === "/impact" && <span className="absolute -bottom-1 h-1 w-4 rounded-full bg-[#1b4332]" />}
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/dashboard"
              className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] gap-0.5 text-[10px] font-bold active-press relative transition-all ${
                pathname === "/dashboard" ? "text-[#1b4332]" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>{language === "hi" ? "डैशबोर्ड" : "Dashboard"}</span>
              {pathname === "/dashboard" && <span className="absolute -bottom-1 h-1 w-4 rounded-full bg-[#1b4332]" />}
            </Link>


            <Link
              href="/assistant"
              className="flex flex-col items-center justify-center min-w-[54px] min-h-[44px] gap-0.5 text-[10px] font-bold active-press relative"
            >
              <div className="h-10 w-10 -mt-5 rounded-full text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95" style={{ background: "linear-gradient(135deg, #1b4332, #2d6a4f)" }}>
                <Mic className="h-4 w-4" />
              </div>
              <span className="text-[#1b4332] font-black">{language === "hi" ? "AI साथी" : "Ask AI"}</span>
            </Link>

            <Link
              href="/plant-intelligence"
              className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] gap-0.5 text-[10px] font-bold active-press relative transition-all ${
                pathname === "/plant-intelligence" ? "text-[#1b4332]" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sprout className="h-4 w-4" />
              <span>{language === "hi" ? "पौधा" : "Plant AI"}</span>
              {pathname === "/plant-intelligence" && <span className="absolute -bottom-1 h-1 w-4 rounded-full bg-[#1b4332]" />}
            </Link>

            <Link
              href="/impact"
              className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] gap-0.5 text-[10px] font-bold active-press relative transition-all ${
                pathname === "/impact" ? "text-[#1b4332]" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>{language === "hi" ? "प्रभाव" : "Impact"}</span>
              {pathname === "/impact" && <span className="absolute -bottom-1 h-1 w-4 rounded-full bg-[#1b4332]" />}
            </Link>
          </>
        )}
      </nav>

      {/* Floating WhatsApp Quick Action Widget */}
      <a
        href="https://wa.me/15556694548?text=Namaste"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-2xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all font-extrabold text-xs sm:text-sm group"
        title="Chat with AASRA AI on WhatsApp (+1 555-669-4548)"
      >
        <div className="relative">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
        </div>
        <span className="hidden sm:inline font-bold tracking-wide">WhatsApp Bot</span>
      </a>

      <KrishyantraFooter />
    </div>
  );
};
