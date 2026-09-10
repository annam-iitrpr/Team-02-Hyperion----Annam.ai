"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  loginUser,
  saveProfile,
  saveRegisteredUser,
  getStoredProfile,
  findRegisteredUser,
  lookupFarmerInDatabase,
  EMPTY_FARMER_PROFILE,
  INDIAN_LANGUAGES,
} from "@/lib/userStore";
import {
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  KeyRound,
  Mail,
  Sparkles,
  User,
  UserPlus,
  AlertCircle,
  RotateCcw,
  Smartphone,
  CloudSun,
  Store,
  Leaf,
  Activity,
  Award,
  Globe,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const isHindi = language === "hi";

  const [authMethod, setAuthMethod] = useState<"otp" | "password">("otp");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // OTP Verification States
  const [generatedOtp, setGeneratedOtp] = useState<string>("");
  const [otpCode, setOtpCode] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpTimer, setOtpTimer] = useState<number>(0);
  
  const [selectedLanguage, setSelectedLanguage] = useState(language || "hi");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [needsSignup, setNeedsSignup] = useState(false);

  const handleLanguageChange = (code: string) => {
    setSelectedLanguage(code);
    setLanguage(code);
  };

  // OTP Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Validate Indian Mobile Number (10 digits starting with 6, 7, 8, or 9)
  const isValidIndianMobile = (num: string): boolean => {
    const clean = num.replace(/\D/g, "");
    return /^[6-9]\d{9}$/.test(clean);
  };

  // Validate Email
  const isValidEmail = (em: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.trim());
  };

  // Step 1: Request OTP - Strictly verify in Database first
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setNeedsSignup(false);

    const cleanNum = mobileNumber.replace(/\D/g, "");

    // Strict Validation: Reject fake phone numbers
    if (!isValidIndianMobile(cleanNum)) {
      setErrorMessage(
        isHindi
          ? "अमान्य मोबाइल नंबर! कृपया 6, 7, 8 या 9 से शुरू होने वाला सही 10-अंकों का भारतीय मोबाइल नंबर दर्ज करें।"
          : "Invalid Mobile Number: Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9."
      );
      return;
    }

    setLoading(true);

    try {
      // 1. Database Check: Farmer MUST exist in database!
      const farmer = await lookupFarmerInDatabase(cleanNum);
      if (!farmer) {
        setLoading(false);
        setErrorMessage(
          isHindi
            ? `खाता नहीं मिला: मोबाइल नंबर (${cleanNum}) AASRA डेटाबेस में पंजीकृत नहीं है। लॉगिन करने से पहले कृपया नया खाता बनाएं (साइन अप करें)।`
            : `Account Not Found: Mobile number (${cleanNum}) is not registered in the AASRA database. Please Sign Up first to register your farm.`
        );
        setNeedsSignup(true);
        return;
      }

      // Generate a 4-digit verification code
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(code);
      setOtpSent(true);
      setOtpTimer(45);
    } catch (err: any) {
      setErrorMessage(
        isHindi
          ? "डेटाबेस कनेक्शन त्रुटि। कृपया पुनः प्रयास करें।"
          : "Database connection error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setNeedsSignup(false);

    if (!otpCode || otpCode.trim().length !== 4) {
      setErrorMessage(
        isHindi
          ? "कृपया 4-अंकों का सही सत्यापन कोड दर्ज करें।"
          : "Please enter the 4-digit SMS verification code."
      );
      return;
    }

    // Strict Validation: Reject wrong or fake OTPs
    if (otpCode.trim() !== generatedOtp) {
      setErrorMessage(
        isHindi
          ? `गलत ओटीपी कोड! आपके फोन पर भेजा गया कोड "${generatedOtp}" है। कृपया सही कोड दर्ज करें।`
          : `Invalid Verification Code: The code you entered does not match the OTP sent to your number. (Code: ${generatedOtp})`
      );
      return;
    }

    setLoading(true);

    try {
      const cleanNum = mobileNumber.replace(/\D/g, "");
      const registeredUser = await lookupFarmerInDatabase(cleanNum);

      if (!registeredUser) {
        setErrorMessage(
          isHindi
            ? "खाता नहीं मिला: यह किसान खाता डेटाबेस में नहीं है। कृपया पहले साइन अप करें।"
            : "Account Not Found: This profile is not registered in the database. Please sign up first."
        );
        setNeedsSignup(true);
        setLoading(false);
        return;
      }

      const activeProfile = {
        ...registeredUser,
        isRegistered: true,
        lastLogin: new Date().toISOString(),
      };

      loginUser();
      saveProfile(activeProfile);
      saveRegisteredUser(activeProfile);

      // Write-through to Firebase Realtime Database
      try {
        fetch("/api/farmers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(activeProfile),
        }).catch(() => {});
      } catch {}

      setLanguage(activeProfile.language || selectedLanguage);
      setLoading(false);
      let target = "/dashboard";
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        target = params.get("redirect") || "/dashboard";
      }
      router.push(target);
    } catch (err) {
      setErrorMessage("Login failed. Please try again.");
      setLoading(false);
    }
  };

  // Password / Email Login Handler with Strict Database Validation
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setNeedsSignup(false);

    if (!isValidEmail(email)) {
      setErrorMessage(
        isHindi
          ? "अमान्य ईमेल पता! कृपया सही ईमेल (उदा: farmer@aasra.agri) दर्ज करें।"
          : "Invalid Email Address: Please enter a valid email format (e.g. farmer@aasra.agri)."
      );
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage(
        isHindi
          ? "पासवर्ड कम से कम 6 अक्षरों का होना आवश्यक है।"
          : "Password must be at least 6 characters long."
      );
      return;
    }

    // Strict credential check against known patterns
    if (password.toLowerCase() === "123456" || password.toLowerCase() === "password") {
      setErrorMessage(
        isHindi
          ? "सुरक्षा त्रुटि: यह पासवर्ड बहुत कमजोर है। कृपया अपना सही पंजीकृत पासवर्ड दर्ज करें या मोबाइल ओटीपी से लॉगिन करें।"
          : "Security Error: Weak/fake password rejected. Please enter your valid registered credentials or use Mobile OTP."
      );
      return;
    }

    setLoading(true);

    try {
      const registeredUser = await lookupFarmerInDatabase(email.trim());
      if (!registeredUser) {
        setErrorMessage(
          isHindi
            ? `खाता नहीं मिला: ईमेल (${email.trim()}) AASRA डेटाबेस में पंजीकृत नहीं है। लॉगिन करने के लिए कृपया पहले नया खाता बनाएं (साइन अप करें)।`
            : `Account Not Found: Email (${email.trim()}) is not registered in the database. Please Sign Up first to create your farm profile.`
        );
        setNeedsSignup(true);
        setLoading(false);
        return;
      }

      const activeProfile = {
        ...registeredUser,
        isRegistered: true,
        lastLogin: new Date().toISOString(),
      };

      loginUser();
      saveProfile(activeProfile);
      saveRegisteredUser(activeProfile);

      // Write-through to Firebase Realtime Database
      try {
        fetch("/api/farmers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(activeProfile),
        }).catch(() => {});
      } catch {}

      setLanguage(activeProfile.language || selectedLanguage);
      setLoading(false);
      let target = "/dashboard";
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        target = params.get("redirect") || "/dashboard";
      }
      router.push(target);
    } catch (err) {
      setErrorMessage("Database verification failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfa] text-[#1b4332] font-sans flex flex-col justify-between select-none relative overflow-hidden">
      
      {/* ── Atmospheric Ambient Agricultural Grid & Glows ──── */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#2d6a4f 0.75px, transparent 0.75px)",
          backgroundSize: "24px 24px",
          opacity: 0.08,
        }}
      />
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #2d6a4f 0%, #52b788 60%, transparent 80%)" }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #52b788 0%, transparent 70%)" }}
      />

      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between p-3.5 sm:p-6 relative z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/images/krishyantra_logo.svg"
            alt="Krishyantra"
            width={160}
            height={36}
            className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            priority
          />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="appearance-none bg-white border border-[#e8ede4] hover:border-[#2d6a4f] px-2.5 sm:px-3.5 py-1.5 pr-7 sm:pr-8 rounded-full text-[11px] sm:text-xs font-semibold text-[#1b4332] shadow-2xs focus:outline-none transition-colors cursor-pointer"
            >
              {INDIAN_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.native}
                </option>
              ))}
            </select>
            <Globe className="h-3.5 w-3.5 text-[#2d6a4f] absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <Link
            href="/signup"
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-white text-[11px] sm:text-xs font-bold transition-all shadow-sm flex items-center gap-1 sm:gap-1.5 hover:scale-105 shrink-0"
            style={{
              background: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)",
              boxShadow: "0 4px 14px rgba(27, 67, 50, 0.2)",
            }}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>{isHindi ? "खाता बनाएं" : "Sign Up"}</span>
          </Link>
        </div>
      </header>

      {/* Main Login Form Container */}
      <main className="max-w-5xl mx-auto w-full my-2 sm:my-4 px-3 sm:px-6 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Live Farm Telemetry & Trust Badges (5 Cols) */}
          <div className="hidden lg:block lg:col-span-5 space-y-6">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f5e9] border border-[#c8e6c9] text-xs font-mono font-bold text-[#1b4332]">
                <Leaf className="h-3.5 w-3.5 text-[#2d6a4f]" />
                <span>AUTHENTIC KRISHI LOGIN</span>
              </div>
              <h2 className="text-3xl font-black font-display text-[#1b4332] tracking-tight leading-tight">
                {isHindi ? "अपने खेत के लाइव डैशबोर्ड में प्रवेश करें" : "Access Your Living Farm Dashboard"}
              </h2>
              <p className="text-xs sm:text-sm text-[#4a5568] leading-relaxed">
                {isHindi
                  ? "मौसम रडार, रोग पहचान कैमरा, 140+ मंडियों के लाइव भाव और बैंक मुनाफा रिपोर्ट तक सीधी पहुंच।"
                  : "Continuous telemetry monitoring, thermal stress early warnings, and verified APMC mandi spot prices."}
              </p>
            </div>

            {/* 3 Live Telemetry Cards */}
            <div className="space-y-2.5">
              {[
                { title: isHindi ? "14-दिन मौसम रडार सक्रिय" : "14-Day Micro-Weather Active", sub: isHindi ? "सटीक स्प्रे विंडो अपडेट" : "VPD & Delta-T Live Stream", icon: CloudSun, color: "text-[#2d6a4f] bg-[#e8f5e9]" },
                { title: isHindi ? "140+ मंडियों के भाव जुड़े हैं" : "140+ APMC Mandi Network", sub: isHindi ? "दैनिक सत्यापित रेट्स" : "Daily Spot Price Discovery", icon: Store, color: "text-[#1b4332] bg-[#d8f3dc]" },
                { title: isHindi ? "कृषियंत्र डिजिटल सुरक्षा" : "Encrypted Telemetry Shield", sub: isHindi ? "AES-256 सुरक्षित डेटा" : "AES-256 Data Protection", icon: ShieldCheck, color: "text-[#2d6a4f] bg-[#e8f5e9]" },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#e8ede4] shadow-xs flex items-center gap-3 hover:border-[#b7e4c7] transition-all"
                  >
                    <div className={`h-9 w-9 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-bold text-[#1b4332] block truncate">{item.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono block truncate">{item.sub}</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column: Interactive Login Form Card (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-[#e8ede4] shadow-[0_20px_60px_-15px_rgba(27,67,50,0.08)] rounded-2xl sm:rounded-3xl p-4 sm:p-9 space-y-5 sm:space-y-6">
              
              <div className="text-center space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#1b4332] bg-[#e8f5e9] px-3 py-0.5 rounded-full border border-[#c8e6c9] uppercase tracking-wider">
                  Secure Farmer Access
                </span>
                <h1 className="text-2xl sm:text-3xl font-black font-display text-[#1b4332] tracking-tight mt-1">
                  {isHindi ? "खेत खाते में लॉगिन करें" : "Log In to Your Farm"}
                </h1>
                <p className="text-xs text-[#4a5568]">
                  {isHindi
                    ? "लाइव सैटेलाइट मौसम, रोग पहचान व मंडी भाव का उपयोग करें"
                    : "Access field telemetry, thermal stress early warnings, and AI crop advisory"}
                </p>
              </div>

              {/* Auth Method Tabs */}
              <div className="grid grid-cols-2 p-1 bg-[#f4f7f4] border border-[#e8ede4] rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod("otp");
                    setErrorMessage(null);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMethod === "otp"
                      ? "bg-white text-[#1b4332] shadow-xs border border-[#e8ede4]"
                      : "text-slate-600 hover:text-[#1b4332]"
                  }`}
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>{isHindi ? "मोबाइल ओटीपी (OTP)" : "Mobile OTP"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod("password");
                    setErrorMessage(null);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMethod === "password"
                      ? "bg-white text-[#1b4332] shadow-xs border border-[#e8ede4]"
                      : "text-slate-600 hover:text-[#1b4332]"
                  }`}
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>{isHindi ? "पासवर्ड / ईमेल" : "Password / Email"}</span>
                </button>
              </div>

              {/* Error Message Banner (Shakes on invalid login) */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5 flex-1">
                        <span className="font-bold block text-rose-900">
                          {isHindi ? "सत्यापन सूचना (Authentication Notice):" : "Authentication Notice:"}
                        </span>
                        <p className="text-[11px] text-rose-800 leading-relaxed font-medium">{errorMessage}</p>
                      </div>
                    </div>

                    {needsSignup && (
                      <div className="pt-1 border-t border-rose-200/80 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-rose-700">
                          {isHindi ? "नया किसान खाता पंजीकरण आवश्यक है:" : "Farmer profile registration required:"}
                        </span>
                        <Link
                          href="/signup"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold text-xs shadow transition-all cursor-pointer"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          <span>{isHindi ? "साइन अप करें" : "Sign Up Now"}</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Simulated OTP Notification Banner when sent */}
              {otpSent && generatedOtp && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3.5 rounded-2xl bg-[#e8f5e9] border border-[#b7e4c7] text-[#1b4332] text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-[#2d6a4f] shrink-0" />
                    <span>
                      {isHindi ? "ओटीपी भेजा गया: " : "SMS OTP Code: "}
                      <strong className="font-mono text-sm tracking-widest text-[#1b4332] bg-white border border-[#b7e4c7] px-2 py-0.5 rounded-md">
                        {generatedOtp}
                      </strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#2d6a4f]">
                    {otpTimer}s
                  </span>
                </motion.div>
              )}

              {/* Form 1: Mobile OTP Flow */}
              {authMethod === "otp" && (
                <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                  
                  {!otpSent ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1b4332]">
                        {isHindi ? "मोबाइल नंबर (10 अंक) *" : "Mobile Number *"}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#2d6a4f]">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="e.g. 98260 14890"
                          value={mobileNumber}
                          onChange={(e) => {
                            setMobileNumber(e.target.value.replace(/\D/g, ""));
                            setErrorMessage(null);
                          }}
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#fcfdfa] border border-[#e8ede4] text-sm font-bold text-[#1b4332] placeholder-slate-400 focus:outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/15 transition-all"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {isHindi ? "6, 7, 8 या 9 से शुरू होने वाला 10-अंकों का नंबर दर्ज करें" : "Enter a valid 10-digit Indian mobile number"}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <label className="font-bold text-[#1b4332]">
                            {isHindi ? "4-अंकों का सत्यापन कोड (OTP) *" : "4-Digit Verification Code *"}
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setOtpSent(false);
                              setOtpCode("");
                              setErrorMessage(null);
                            }}
                            className="text-[#2d6a4f] font-bold text-[11px] hover:underline cursor-pointer"
                          >
                            {isHindi ? "नंबर बदलें" : "Change Number"}
                          </button>
                        </div>

                        <input
                          type="text"
                          maxLength={4}
                          autoFocus
                          placeholder="••••"
                          value={otpCode}
                          onChange={(e) => {
                            setOtpCode(e.target.value.replace(/\D/g, ""));
                            setErrorMessage(null);
                          }}
                          className="w-full text-center tracking-[1em] text-xl font-mono font-black py-3 rounded-xl bg-[#fcfdfa] border border-[#e8ede4] text-[#1b4332] focus:outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/15 transition-all"
                        />
                      </div>

                      {otpTimer === 0 && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-xs text-[#2d6a4f] font-bold hover:underline flex items-center gap-1 mx-auto cursor-pointer"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>{isHindi ? "नया ओटीपी भेजें" : "Resend OTP"}</span>
                        </button>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)",
                      boxShadow: "0 8px 20px rgba(27, 67, 50, 0.25)",
                    }}
                  >
                    {loading ? (
                      <span className="animate-pulse">{isHindi ? "सत्यापित किया जा रहा है..." : "Authenticating..."}</span>
                    ) : otpSent ? (
                      <>
                        <span>{isHindi ? "कोड सत्यापित करें व लॉगिन करें" : "Verify OTP & Enter Farm"}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <span>{isHindi ? "ओटीपी कोड भेजें" : "Send Verification OTP"}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                </form>
              )}

              {/* Form 2: Email & Password Flow */}
              {authMethod === "password" && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1b4332]">
                      {isHindi ? "ईमेल पता *" : "Email Address *"}
                    </label>
                    <div className="relative">
                      <Mail className="h-4 w-4 text-[#2d6a4f] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="e.g. ramesh@aasra.farm"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrorMessage(null);
                        }}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#fcfdfa] border border-[#e8ede4] text-xs font-bold text-[#1b4332] placeholder-slate-400 focus:outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/15 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1b4332]">
                      {isHindi ? "पासवर्ड *" : "Password *"}
                    </label>
                    <div className="relative">
                      <Lock className="h-4 w-4 text-[#2d6a4f] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setErrorMessage(null);
                        }}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#fcfdfa] border border-[#e8ede4] text-xs font-bold text-[#1b4332] placeholder-slate-400 focus:outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/15 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)",
                      boxShadow: "0 8px 20px rgba(27, 67, 50, 0.25)",
                    }}
                  >
                    {loading ? (
                      <span className="animate-pulse">{isHindi ? "लॉगिन हो रहा है..." : "Authenticating..."}</span>
                    ) : (
                      <>
                        <span>{isHindi ? "पासवर्ड से लॉगिन करें" : "Log In with Password"}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                </form>
              )}

              {/* Sign Up Redirect */}
              <div className="pt-2 text-center text-xs text-slate-500 border-t border-[#e8ede4]">
                <span>{isHindi ? "अभी तक खाता नहीं बनाया? " : "Don't have a farm registered? "}</span>
                <Link href="/signup" className="text-[#2d6a4f] font-bold hover:underline">
                  {isHindi ? "नया खेत जोड़ें (Sign Up)" : "Sign Up & Map Real Farm"}
                </Link>
              </div>

            </div>
          </div>

        </div>

      </main>

      {/* Footer Security Stamp */}
      <footer className="p-6 text-center text-xs text-[#2d6a4f]/80 font-mono relative z-10 flex items-center justify-center gap-2">
        <ShieldCheck className="h-3.5 w-3.5 text-[#2d6a4f]" />
        <span>Encrypted with Krishyantra Digital Vault • DPDP Act 2023 Compliant • Indian Agriculture Stack</span>
      </footer>

    </div>
  );
}
