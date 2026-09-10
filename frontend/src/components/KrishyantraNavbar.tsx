"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Globe, Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { isUserLoggedIn, INDIAN_LANGUAGES } from "@/lib/userStore";

export const KrishyantraNavbar: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<string>("home");
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoggedIn(isUserLoggedIn());
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLangObj = INDIAN_LANGUAGES.find((l) => l.code === language) || INDIAN_LANGUAGES[0];

  const handleNavClick = (id: string) => {
    setActiveNav(id);
    setMobileMenuOpen(false);
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const elem = document.getElementById(id);
    if (elem) {
      const navOffset = 80;
      const elementPosition = elem.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - navOffset, behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e5e7eb] shadow-xs transition-all">
      <div className="max-w-[1240px] mx-auto px-3.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Krishyantra Brand Logo */}
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick("home");
          }}
          className="flex items-center gap-2 sm:gap-3 shrink-0 group focus:outline-hidden"
        >
          <div className="relative h-8.5 sm:h-11 w-36 sm:w-52">
            <Image
              src="/images/krishyantra_logo.svg"
              alt="Krishyantra — Saath Har Kisan Ke Liye"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* Center: Clean Minimal Agricultural Navigation (Desktop) */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-7 text-sm font-medium text-[#2d3748] whitespace-nowrap shrink-1">
          <button
            type="button"
            onClick={() => handleNavClick("home")}
            className={`relative py-2 transition-colors cursor-pointer ${
              activeNav === "home" ? "text-[#1b4332] font-bold" : "text-[#4a5568] hover:text-[#1b4332]"
            }`}
          >
            <span>Home</span>
            {activeNav === "home" && (
              <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#2d6a4f] rounded-full transition-all" />
            )}
          </button>

          <Link
            href="/dashboard"
            className="relative py-2 text-[#1b4332] font-bold hover:text-[#2d6a4f] flex items-center gap-1.5 transition-colors"
          >
            <span>🌾 Farm Dashboard</span>
          </Link>

          <Link
            href="/closed-loop"
            className="relative py-2 text-[#1b4332] font-bold hover:text-[#2d6a4f] flex items-center gap-1.5 transition-colors"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>🔄 48h Follow-Up</span>
          </Link>

          <button
            type="button"
            onClick={() => handleNavClick("features")}
            className={`relative py-2 transition-colors cursor-pointer ${
              activeNav === "features" ? "text-[#1b4332] font-bold" : "text-[#4a5568] hover:text-[#1b4332]"
            }`}
          >
            <span>Features</span>
            {activeNav === "features" && (
              <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#2d6a4f] rounded-full transition-all" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleNavClick("how-it-works")}
            className={`relative py-2 transition-colors cursor-pointer ${
              activeNav === "how-it-works" ? "text-[#1b4332] font-bold" : "text-[#4a5568] hover:text-[#1b4332]"
            }`}
          >
            <span>How It Works</span>
            {activeNav === "how-it-works" && (
              <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#2d6a4f] rounded-full transition-all" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleNavClick("for-farmers")}
            className={`relative py-2 transition-colors cursor-pointer ${
              activeNav === "for-farmers" ? "text-[#1b4332] font-bold" : "text-[#4a5568] hover:text-[#1b4332]"
            }`}
          >
            <span>For Farmers</span>
            {activeNav === "for-farmers" && (
              <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#2d6a4f] rounded-full transition-all" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleNavClick("faq")}
            className={`relative py-2 transition-colors cursor-pointer ${
              activeNav === "faq" ? "text-[#1b4332] font-bold" : "text-[#4a5568] hover:text-[#1b4332]"
            }`}
          >
            <span>FAQ</span>
            {activeNav === "faq" && (
              <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#2d6a4f] rounded-full transition-all" />
            )}
          </button>
        </nav>

        {/* Right: Language Selector & Get Started CTA */}
        <div className="hidden sm:flex items-center gap-3.5 shrink-0">
          {/* Language Selector Dropdown with Fixed Position & Fixed Button Label */}
          <div className="notranslate relative shrink-0" translate="no" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => setLangDropdownOpen((v) => !v)}
              className="notranslate w-[112px] h-9.5 flex items-center justify-between px-3 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs shrink-0"
              title="Select Language"
              aria-label="Select Language"
              translate="no"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Globe className="h-3.5 w-3.5 text-[#2d6a4f] shrink-0" />
                <span className="notranslate font-bold text-slate-800 truncate text-xs" translate="no">
                  {currentLangObj.native}
                </span>
              </div>
              <ChevronDown className={`h-3 w-3 text-slate-400 shrink-0 transition-transform ${langDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {langDropdownOpen && (
              <div className="notranslate absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-50 text-xs text-slate-700 font-medium animate-in fade-in zoom-in-95" translate="no">
                <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between" translate="no">
                  <span className="notranslate" translate="no">Choose Language</span>
                  <span className="font-mono text-[9px] text-[#2d6a4f] notranslate" translate="no">12+ Languages</span>
                </div>
                <div className="py-1 max-h-60 overflow-y-auto">
                  {INDIAN_LANGUAGES.map((l) => {
                    const isSelected = language === l.code;
                    return (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          setLanguage(l.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 hover:bg-[#e8f5e9] hover:text-[#1b4332] flex items-center justify-between transition-colors cursor-pointer notranslate ${
                          isSelected ? "bg-[#e8f5e9] text-[#1b4332] font-bold" : ""
                        }`}
                        translate="no"
                      >
                        <div className="flex items-center gap-2 min-w-0 notranslate" translate="no">
                          <span className="notranslate text-xs font-bold" translate="no" lang={l.code}>{l.native}</span>
                          <span className="text-[10.5px] text-slate-400 font-normal notranslate" translate="no" lang="en">({l.name})</span>
                        </div>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#2d6a4f] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Primary Agricultural CTA */}
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>🌾 Farm Dashboard</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 rounded-full bg-[#1b4332] text-white text-xs font-bold shadow-xs"
          >
            🌾 Dashboard
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200 shadow-xl">
          <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left px-3.5 py-2.5 rounded-xl bg-emerald-50 text-[#1b4332] font-bold flex items-center justify-between shadow-2xs"
            >
              <span>🌾 Live Farm Dashboard</span>
              <span className="text-[10px] bg-[#1b4332] text-white px-2 py-0.5 rounded-full font-mono">PUNJAB DEMO</span>
            </Link>

            <Link
              href="/closed-loop"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left px-3.5 py-2.5 rounded-xl bg-[#f0f7f2] text-[#1b4332] font-bold flex items-center justify-between border border-[#2d6a4f]/20 shadow-2xs"
            >
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>🔄 48h Follow-Up & Closed Loop</span>
              </span>
              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-mono">ACTIVE</span>
            </Link>

            <button
              type="button"
              onClick={() => handleNavClick("home")}
              className={`text-left px-3 py-2 rounded-xl transition-colors ${
                activeNav === "home" ? "bg-[#e8f5e9] text-[#1b4332] font-bold" : "hover:bg-slate-50"
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleNavClick("features")}
              className={`text-left px-3 py-2 rounded-xl transition-colors ${
                activeNav === "features" ? "bg-[#e8f5e9] text-[#1b4332] font-bold" : "hover:bg-slate-50"
              }`}
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => handleNavClick("how-it-works")}
              className={`text-left px-3 py-2 rounded-xl transition-colors ${
                activeNav === "how-it-works" ? "bg-[#e8f5e9] text-[#1b4332] font-bold" : "hover:bg-slate-50"
              }`}
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => handleNavClick("for-farmers")}
              className={`text-left px-3 py-2 rounded-xl transition-colors ${
                activeNav === "for-farmers" ? "bg-[#e8f5e9] text-[#1b4332] font-bold" : "hover:bg-slate-50"
              }`}
            >
              For Farmers
            </button>
            <button
              type="button"
              onClick={() => handleNavClick("faq")}
              className={`text-left px-3 py-2 rounded-xl transition-colors ${
                activeNav === "faq" ? "bg-[#e8f5e9] text-[#1b4332] font-bold" : "hover:bg-slate-50"
              }`}
            >
              FAQ
            </button>
          </div>

          {/* Language Selector (Mobile) */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-2 notranslate" translate="no">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 notranslate" translate="no">
              <Globe className="h-3.5 w-3.5 text-[#2d6a4f]" /> Language
            </span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
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

          <div className="pt-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-full bg-[#1b4332] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md"
            >
              <span>🌾 Go to Live Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
