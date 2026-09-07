"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { isUserLoggedIn } from "@/lib/userStore";
import {
  ArrowRight,
  Mic,
  ChevronDown,
  CloudSun,
  Store,
  Leaf,
  ShieldAlert,
  Camera,
  CheckCircle2,
  Sparkles,
  UserPlus,
  ShieldCheck,
  TrendingUp,
  Layers,
  FileText,
  MessageCircle,
} from "lucide-react";

import { DynamicHeroHeadline } from "@/components/DynamicHeroHeadline";
import { LiveFarmSimulator } from "@/components/LiveFarmSimulator";

// Scroll reveal hook for buttery smooth entry animations
function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        },
        { threshold }
      );
      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }
  }, [threshold]);
  return { ref, visible };
}

// Count-up hook for high-impact metric digits
function useCountUp(target: number, duration = 1000) {
  const [count, setCount] = useState(target);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

export default function LandingPage() {
  const { language } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    setIsLoggedIn(isUserLoggedIn());
  }, []);

  const statsReveal = useScrollReveal();
  const simReveal = useScrollReveal();
  const toolsReveal = useScrollReveal();

  const mandis = useCountUp(140, 900);
  const crops = useCountUp(60, 800);
  const languages = useCountUp(12, 700);

  const isHindi = ["hi", "mr", "gu", "pa"].includes(language);

  // 4 Streamlined Core Tools (Stripe Design System: High Contrast, Minimal Text)
  const coreTools = [
    {
      id: "weather",
      icon: <CloudSun className="h-6 w-6 text-[#533afd]" />,
      iconBg: "bg-indigo-50",
      badge: "Open-Meteo GPS",
      badgeCls: "bg-indigo-50 text-[#533afd] border-indigo-200/70",
      title: isHindi ? "सूक्ष्म-मौसम रडार" : "Hyperlocal Weather Radar",
      desc: isHindi
        ? "14-दिन का बारिश, तापमान व सुरक्षित स्प्रे विंडो समय।"
        : "14-day agrometeorological forecast, humidity, and safe spray timing.",
      cta: isHindi ? "मौसम देखें" : "Open Weather",
      href: "/weather",
      ctaCls: "text-[#533afd] bg-indigo-50 hover:bg-indigo-100",
    },
    {
      id: "mandi",
      icon: <Store className="h-6 w-6 text-emerald-600" />,
      iconBg: "bg-emerald-50",
      badge: "Agmarknet Live",
      badgeCls: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
      title: isHindi ? "APMC मंडी भाव नेटवर्क" : "140+ Mandi Price Network",
      desc: isHindi
        ? "140+ सरकारी मंडियों के ताजा भाव व सबसे फायदेमंद मंडी।"
        : "Live verified modal rates across 140+ mandis with MSP tracking.",
      cta: isHindi ? "मंडी भाव देखें" : "Check Rates",
      href: "/dashboard",
      ctaCls: "text-emerald-700 bg-emerald-50 hover:bg-emerald-100",
    },
    {
      id: "vision",
      icon: <ShieldAlert className="h-6 w-6 text-violet-600" />,
      iconBg: "bg-violet-50",
      badge: "Gemini 2.5 Vision",
      badgeCls: "bg-violet-50 text-violet-700 border-violet-200/70",
      title: isHindi ? "AI पत्ती रोग पहचान" : "Instant Leaf Disease Scan",
      desc: isHindi
        ? "कैमरे से फोटो लें और 2 सेकंड में पक्का इलाज पाएं।"
        : "Snap a leaf photo for instant lesion diagnosis and certified cure.",
      cta: isHindi ? "पत्ती स्कैन करें" : "Scan Leaf",
      href: "/plant-intelligence",
      ctaCls: "text-violet-700 bg-violet-50 hover:bg-violet-100",
    },
    {
      id: "voice",
      icon: <Mic className="h-6 w-6 text-amber-600" />,
      iconBg: "bg-amber-50",
      badge: "Voice & WhatsApp",
      badgeCls: "bg-amber-50 text-amber-700 border-amber-200/70",
      title: isHindi ? "वॉइस व व्हाट्सएप किसान सहायक" : "Voice & WhatsApp Assistant",
      desc: isHindi
        ? "अपनी भाषा में बोलकर या व्हाट्सएप पर 24/7 सलाह लें।"
        : "Speak naturally in 12 languages or message 24/7 on WhatsApp.",
      cta: isHindi ? "व्हाट्सएप चैट" : "Chat on WhatsApp",
      href: "https://wa.me/15556694548?text=Namaste",
      ctaCls: "text-amber-700 bg-amber-50 hover:bg-amber-100",
      isExternal: true,
    },
  ];

  return (
    <AppShell>
      <div className="bg-[#ffffff] text-[#0d253d] min-h-screen">
        {/* Dynamic Hero Section with 4 Interactive Buttons & Modal Popup */}
        <DynamicHeroHeadline />

        {/* ── 1. Clean High-Impact Metric Numbers ─────────────────────────────── */}
        <section
          ref={statsReveal.ref}
          className="border-y border-[#e3e8ee] bg-[#f6f9fc] py-8 transition-all duration-700"
          style={{
            opacity: statsReveal.visible ? 1 : 0,
            transform: statsReveal.visible ? "translateY(0)" : "translateY(12px)",
          }}
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
              <div className="p-4 rounded-2xl bg-white border border-[#e3e8ee] shadow-xs">
                <p className="text-3xl sm:text-4xl font-black text-[#533afd] font-mono tracking-tight">
                  {mandis}+
                </p>
                <p className="text-xs font-bold text-[#0d253d] mt-1">
                  {isHindi ? "लाइव APMC मंडियां" : "Live APMC Mandis"}
                </p>
                <p className="text-[11px] text-[#64748d]">
                  {isHindi ? "दैनिक सत्यापित भाव" : "Daily Verified Rates"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#e3e8ee] shadow-xs">
                <p className="text-3xl sm:text-4xl font-black text-emerald-600 font-mono tracking-tight">
                  {crops}+
                </p>
                <p className="text-xs font-bold text-[#0d253d] mt-1">
                  {isHindi ? "समर्थित फसलें" : "Supported Crops"}
                </p>
                <p className="text-[11px] text-[#64748d]">
                  {isHindi ? "अनाज, दलहन, तिलहन" : "Cereals, Pulses & Cash"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#e3e8ee] shadow-xs">
                <p className="text-3xl sm:text-4xl font-black text-amber-600 font-mono tracking-tight">
                  {languages}
                </p>
                <p className="text-xs font-bold text-[#0d253d] mt-1">
                  {isHindi ? "भारतीय भाषाएं" : "Indian Languages"}
                </p>
                <p className="text-[11px] text-[#64748d]">
                  {isHindi ? "आवाज व टेक्स्ट दोनों में" : "Voice STT & TTS"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#e3e8ee] shadow-xs">
                <p className="text-3xl sm:text-4xl font-black text-violet-600 font-mono tracking-tight">
                  100%
                </p>
                <p className="text-xs font-bold text-[#0d253d] mt-1">
                  {isHindi ? "निःशुल्क सेवा" : "Free for Farmers"}
                </p>
                <p className="text-[11px] text-[#64748d]">
                  {isHindi ? "सार्वजनिक कृषि नवाचार" : "Public Good Platform"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Interactive Live Farm Simulator (Zero Bars, Minimal Text) ────── */}
        <section
          ref={simReveal.ref}
          className="py-12 sm:py-16 bg-[#ffffff] border-b border-[#e3e8ee]"
          style={{
            opacity: simReveal.visible ? 1 : 0,
            transform: simReveal.visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 600ms ease, transform 600ms ease",
          }}
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="inline-flex items-center gap-1.5 bg-[#533afd]/10 text-[#533afd] border border-[#533afd]/20 rounded-full px-3.5 py-1 text-xs font-bold font-mono uppercase tracking-wider">
                {isHindi ? "सजीव फसल विकास" : "Crop Growth Stages"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0d253d] font-display tracking-tight">
                {isHindi
                  ? "फसल की हर अवस्था का सजीव विकास सिमुलेशन"
                  : "Watch Your Crop Grow Across Every Lifecycle Phase"}
              </h2>
              <p className="text-xs sm:text-sm text-[#64748d]">
                {isHindi
                  ? "अंकुरण से लेकर सुनहरी कटाई तक—प्रत्येक चरण में पौधे का विकास और सुरक्षा:"
                  : "From germination to golden harvest—see what happens to the plant at every stage:"}
              </p>
            </div>

            {/* Zero-Bars Visual Live Farm Simulator Component */}
            <LiveFarmSimulator />
          </div>
        </section>

        {/* ── 3. Four Core Farmer Action Tools (Minimal Text & Clean Cards) ───── */}
        <section
          ref={toolsReveal.ref}
          className="py-12 sm:py-16 bg-[#f6f9fc] border-b border-[#e3e8ee]"
          style={{
            opacity: toolsReveal.visible ? 1 : 0,
            transform: toolsReveal.visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 600ms ease, transform 600ms ease",
          }}
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3.5 py-1 text-xs font-bold font-mono uppercase tracking-wider">
                {isHindi ? "मुख्य सुविधाएं" : "Essential Tools"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0d253d] font-display tracking-tight">
                {isHindi ? "किसान के लिए 4 मुख्य उपकरण" : "Four Everyday Field Tools"}
              </h2>
              <p className="text-xs sm:text-sm text-[#64748d]">
                {isHindi
                  ? "सभी सुविधाएं सीधे आपके मोबाइल पर तुरंत काम करती हैं:"
                  : "Fast, accurate, and completely free on any smartphone:"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {coreTools.map((tool) => (
                <div
                  key={tool.id}
                  className="bg-white border border-[#e3e8ee] rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl ${tool.iconBg} shrink-0`}>
                        {tool.icon}
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${tool.badgeCls}`}>
                        {tool.badge}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[#0d253d] font-display">
                      {tool.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#64748d] leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100">
                    {tool.isExternal ? (
                      <a
                        href={tool.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center justify-between w-full px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${tool.ctaCls}`}
                      >
                        <span>{tool.cta}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <Link
                        href={isLoggedIn ? tool.href : "/signup"}
                        className={`inline-flex items-center justify-between w-full px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${tool.ctaCls}`}
                      >
                        <span>{tool.cta}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. Quick Platform Navigation Links ─────────────────────────────── */}
        <section className="py-10 bg-[#ffffff] border-b border-[#e3e8ee]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {[
                { href: "/how-it-works", label: isHindi ? "हाउ इट वर्क्स" : "How It Works", desc: isHindi ? "प्लेटफॉर्म कार्यप्रणाली" : "Step-by-step tour", icon: Sparkles },
                { href: "/product", label: isHindi ? "उत्पाद विशेषताएँ" : "Product Features", desc: isHindi ? "तकनीकी क्षमताएं" : "System capabilities", icon: Layers },
                { href: "/impact-story", label: isHindi ? "सफलता की कहानियाँ" : "Farmer Stories", desc: isHindi ? "किसानों के अनुभव" : "Attributed field ROI", icon: TrendingUp },
                { href: "/pipeline", label: isHindi ? "6-मॉडल AI इंजन" : "6-Model Pipeline", desc: isHindi ? "वर्टेक्स AI विवरण" : "Vertex ML Engine", icon: FileText },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <Link
                    key={m.href}
                    href={m.href}
                    className="p-4 rounded-xl bg-[#f8fafc] border border-[#e3e8ee] hover:border-[#533afd]/40 shadow-xs hover:shadow-sm transition-all duration-200 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-[#533afd] shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-[#0d253d] group-hover:text-[#533afd] transition-colors truncate">
                          {m.label}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {m.desc}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#533afd] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 5. Minimal 3-Question Farmer FAQ ─────────────────────────────────── */}
        <section className="py-12 sm:py-16 bg-[#f6f9fc] border-b border-[#e3e8ee]">
          <div className="max-w-[760px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs font-mono font-bold text-[#533afd] uppercase tracking-wider">
                {isHindi ? "स्पष्ट जवाब" : "Quick Answers"}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0d253d] font-display">
                {isHindi ? "किसान भाईयों के 3 मुख्य सवाल" : "Frequently Asked Questions"}
              </h3>
            </div>

            <div className="space-y-3">
              {[
                {
                  qHi: "1. क्या AASRA पूरी तरह निःशुल्क है?",
                  qEn: "1. Is AASRA completely free for farmers?",
                  aHi: "हाँ! 14-दिन का मौसम रडार, 140+ सरकारी मंडियों के भाव, पत्ती रोग स्कैनर और वॉइस AI सभी किसानों के लिए आजीवन 100% निःशुल्क हैं।",
                  aEn: "Yes! The 14-day weather radar, 140+ mandi prices, leaf disease scanner, and voice AI are 100% free forever for all farmers.",
                },
                {
                  qHi: "2. क्या खेत में इंटरनेट कमजोर होने पर भी यह काम करता है?",
                  qEn: "2. Does it work with low internet connectivity?",
                  aHi: "हाँ! यह कमजोर इंटरनेट पर भी तेजी से खुलता है और आप हमारे आधिकारिक व्हाट्सएप (+1 555-669-4548) पर 2G/3G में भी मौसम व भाव पा सकते हैं।",
                  aEn: "Yes! It is lightweight and works seamlessly on 2G/3G networks and via direct WhatsApp chat (+1 555-669-4548).",
                },
                {
                  qHi: "3. क्या AI द्वारा बताई गई दवा और मात्रा सुरक्षित है?",
                  qEn: "3. Are the AI chemical doses safe for my crops?",
                  aHi: "हाँ, केवल सरकारी ICAR प्रमाणित दवाइयां और आपके खेत के तापमान-नमी के अनुसार सुरक्षित मात्रा ही बताई जाती है ताकि फसल को कोई नुकसान न हो।",
                  aEn: "Yes, every advisory is strictly bound to certified ICAR agricultural thresholds and current field temperature to prevent scorching.",
                },
              ].map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-[#e3e8ee] rounded-2xl overflow-hidden bg-white shadow-xs transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      <span className="text-sm font-bold text-[#0d253d] font-display">
                        {isHindi ? faq.qHi : faq.qEn}
                      </span>
                      <div
                        className={`p-1.5 rounded-full transition-transform duration-200 shrink-0 ${
                          isOpen
                            ? "rotate-180 bg-indigo-50 text-[#533afd]"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-[#64748d] leading-relaxed border-t border-slate-100 pt-3">
                        {isHindi ? faq.aHi : faq.aEn}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 6. Clean High-Impact Final CTA Showcase ─────────────────────────── */}
        <section className="py-12 sm:py-16 bg-[#ffffff]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl bg-gradient-to-br from-[#0d253d] via-[#112d4e] to-[#0d253d] border border-indigo-500/30 text-white p-7 sm:p-12 text-center space-y-6 shadow-xl overflow-hidden">
              <div className="space-y-2 max-w-2xl mx-auto">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-mono font-bold text-emerald-300 border border-white/15">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{isHindi ? "निःशुल्क डिजिटल कृषि सेवा" : "Public Good Platform"}</span>
                </span>
                <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
                  {isHindi
                    ? "आज ही अपने खेत को दें वैज्ञानिक सुरक्षा और अधिक मुनाफा"
                    : "Protect Your Crops & Maximize Mandi Realizations Today"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                  {isHindi
                    ? "मौसम रडार, 140+ सरकारी मंडियों के भाव और 6-मॉडल AI सलाहकार से अपनी पैदावार सुरक्षित करें।"
                    : "Deploy live weather telemetry, certified mandi price discovery, and multi-crop AI advisory in seconds."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link
                  href={isLoggedIn ? "/dashboard" : "/signup"}
                  className="px-7 py-3.5 rounded-2xl text-white font-bold text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #533afd 0%, #4434d4 100%)",
                    boxShadow: "0 8px 25px rgba(83, 58, 253, 0.4)",
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>
                    {isLoggedIn
                      ? isHindi
                        ? "डैशबोर्ड खोलें"
                        : "Open Dashboard"
                      : isHindi
                      ? "निःशुल्क खाता बनाएं (Free)"
                      : "Create Free Farmer Account"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href="https://wa.me/15556694548?text=Namaste"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-2xl text-white bg-emerald-600 hover:bg-emerald-700 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-emerald-900/30"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{isHindi ? "व्हाट्सएप पर पूछें" : "Chat on WhatsApp"}</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
