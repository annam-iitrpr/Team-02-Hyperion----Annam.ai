"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X, Sparkles, Activity } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-[#e3e8ee] shadow-[0_1px_3px_rgba(0,55,112,0.06)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-extrabold text-xl tracking-tight text-[#0d253d] group-hover:text-[#533afd] transition-colors">
              krishyantra
            </span>
            <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-[#533afd]/10 text-[#533afd]">
              AASRA Core
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-[14px] font-medium text-[#273951]">
          <a
            href="#models"
            className="hover:text-[#533afd] transition-colors"
          >
            Intelligence Models
          </a>
          <a
            href="#simulator"
            className="hover:text-[#533afd] transition-colors"
          >
            Live Simulator
          </a>
          <a
            href="#architecture"
            className="hover:text-[#533afd] transition-colors"
          >
            Architecture
          </a>
          <a
            href="#impact"
            className="hover:text-[#533afd] transition-colors"
          >
            Field Evidence
          </a>
          <a
            href="#faq"
            className="hover:text-[#533afd] transition-colors"
          >
            FAQ
          </a>
        </nav>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Vertex AI Ready</span>
          </div>

          <a
            href="#simulator"
            className="stripe-pill-button"
          >
            <span>Launch Console</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#0d253d] hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#e3e8ee] px-6 py-5 space-y-4 shadow-xl">
          <div className="flex flex-col gap-3 font-medium text-sm text-[#0d253d]">
            <a
              href="#models"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#533afd]"
            >
              Intelligence Models
            </a>
            <a
              href="#simulator"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#533afd]"
            >
              Live Simulator
            </a>
            <a
              href="#architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#533afd]"
            >
              Architecture
            </a>
            <a
              href="#impact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#533afd]"
            >
              Field Evidence
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#533afd]"
            >
              FAQ
            </a>
          </div>

          <div className="pt-2 border-t border-[#e3e8ee]">
            <a
              href="#simulator"
              onClick={() => setMobileMenuOpen(false)}
              className="stripe-pill-button w-full"
            >
              Launch Live Console
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
