"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isUserLoggedIn } from "@/lib/userStore";
import { ShieldAlert, UserPlus, Lock } from "lucide-react";
import Link from "next/link";

const PUBLIC_ROUTES = [
  "/",
  "/dashboard",
  "/closed-loop",
  "/what-if",
  "/product",
  "/journal",
  "/impact",
  "/impact-story",
  "/how-it-works",
  "/architecture",
  "/plant-intelligence",
  "/assistant",
  "/fields",
  "/settings",
  "/signup",
  "/login",
];

export function AuthGatekeeper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname?.startsWith("/api/")
  );

  useEffect(() => {
    setIsMounted(true);
    const checkAuth = () => {
      const authed = isUserLoggedIn();
      setIsAuthenticated(authed);
      if (!authed && !isPublicRoute) {
        router.replace(`/signup?redirect=${encodeURIComponent(pathname || "/dashboard")}`);
      }
    };

    checkAuth();

    // Listen for cross-tab or profile updates
    const handleProfileUpdate = () => checkAuth();
    window.addEventListener("aasra-profile-updated", handleProfileUpdate);
    window.addEventListener("storage", handleProfileUpdate);

    return () => {
      window.removeEventListener("aasra-profile-updated", handleProfileUpdate);
      window.removeEventListener("storage", handleProfileUpdate);
    };
  }, [pathname, isPublicRoute, router]);

  // Always render public routes without delay
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // During SSR or initial hydration
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#010102] text-[#f7f8f8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-[#5e6ad2] border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-[#8a8f98]">Verifying Farmer Security Vault...</span>
        </div>
      </div>
    );
  }

  // If authenticated, render children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Fallback while redirecting: Linear-style access required gate
  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0f1011] border border-[#23252a] rounded-2xl p-6 text-center space-y-5 shadow-2xl">
        <div className="h-12 w-12 rounded-xl bg-[#5e6ad2]/10 border border-[#5e6ad2]/30 text-[#5e6ad2] flex items-center justify-center mx-auto">
          <Lock className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-[#f7f8f8]">
            Farmer Registration Required
          </h2>
          <p className="text-xs text-[#8a8f98] leading-relaxed">
            AASRA calculates precision agronomic telemetry, weather biophysics, and causal yield protections customized to your exact field coordinates, soil, and crop.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#141516] border border-[#23252a] text-left text-xs font-mono space-y-1 text-[#8a8f98]">
          <div className="flex items-center gap-2 text-[#d0d6e0]">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-semibold">Protected Agronomic Resource</span>
          </div>
          <p className="text-[11px]">Route: <span className="text-[#5e6ad2]">{pathname}</span></p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <Link
            href={`/signup?redirect=${encodeURIComponent(pathname || "/dashboard")}`}
            className="w-full py-3 rounded-xl bg-[#5e6ad2] hover:bg-[#828fff] text-white font-medium text-xs tracking-wide transition-all shadow-lg shadow-[#5e6ad2]/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Complete Farmer Registration</span>
          </Link>

          <Link
            href={`/login?redirect=${encodeURIComponent(pathname || "/dashboard")}`}
            className="w-full py-2.5 rounded-xl bg-transparent hover:bg-[#18191a] text-[#8a8f98] hover:text-[#f7f8f8] border border-[#23252a] font-medium text-xs transition-all cursor-pointer"
          >
            Already Registered? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
