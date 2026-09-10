"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export const KrishyantraFooter: React.FC = () => {
  const scrollToSection = (id: string) => {
    const elem = document.getElementById(id);
    if (elem) {
      const navOffset = 80;
      const elementPosition = elem.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - navOffset, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-white border-t border-[#e5e7eb] py-12 text-slate-600 text-sm">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top / Main Navigation Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative h-10 w-44">
              <Image
                src="/images/krishyantra_logo.svg"
                alt="KrishYantra"
                fill
                className="object-contain object-left"
              />
            </div>
          </div>

          {/* Quick Section Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => scrollToSection("for-farmers")}
              className="hover:text-[#1b4332] transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("features")}
              className="hover:text-[#1b4332] transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("how-it-works")}
              className="hover:text-[#1b4332] transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("for-farmers")}
              className="hover:text-[#1b4332] transition-colors cursor-pointer"
            >
              For Farmers
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("faq")}
              className="hover:text-[#1b4332] transition-colors cursor-pointer"
            >
              FAQ
            </button>
            <Link href="/privacy" className="hover:text-[#1b4332] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#1b4332] transition-colors">
              Terms
            </Link>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  const logged = document.cookie.includes("auth=") || localStorage.getItem("krishyantra_user");
                  if (logged) {
                    window.open("https://wa.me/15556694548?text=Namaste", "_blank", "noopener,noreferrer");
                  } else {
                    window.location.href = "/signup?redirect=whatsapp";
                  }
                }
              }}
              className="hover:text-[#1b4332] transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Tagline */}
          <div className="flex items-center gap-2 text-xs font-bold text-[#2d6a4f]">
            <span>Saath Har Kisan Ke Liye</span>
          </div>
        </div>

        {/* Bottom Legal & Ethics Note */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} KrishYantra. Built for Indian agriculture, empowering farmers with real-time field intelligence.
          </p>
          <p className="font-mono text-[11px] text-slate-500">
            100% Farmer-First · ICAR Aligned · Deterministic Agronomics
          </p>
        </div>

      </div>
    </footer>
  );
};
