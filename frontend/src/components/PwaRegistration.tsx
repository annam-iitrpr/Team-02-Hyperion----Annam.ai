"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export function PwaRegistration() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Register Service Worker in production/browser reliably
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("AASRA ServiceWorker active:", reg.scope);
            // Check for service worker updates
            reg.onupdatefound = () => {
              const installingWorker = reg.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                    console.log("New AASRA update available. Stale cache bypassed.");
                  }
                };
              }
            };
          })
          .catch((err) => console.log("ServiceWorker registration skipped:", err));
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
        return () => window.removeEventListener("load", registerSW);
      }
    }

    // Capture install prompt
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Only show install banner on mobile viewports (< 768px) and if never dismissed
      if (typeof window !== "undefined") {
        const isDismissed = localStorage.getItem("aasra_pwa_dismissed") === "true";
        const isMobile = window.innerWidth < 768;
        if (!isDismissed && isMobile) {
          setTimeout(() => setShowPrompt(true), 3000);
        }
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
      setInstallPrompt(null);
      if (typeof window !== "undefined") {
        localStorage.setItem("aasra_pwa_dismissed", "true");
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("aasra_pwa_dismissed", "true");
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 md:hidden z-40 bg-[#11261f] text-white p-3.5 rounded-2xl shadow-2xl border border-[#2d6a4f]/50 flex items-center justify-between gap-3 animate-bounce-subtle">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-[#1b4332] border border-[#2d6a4f] flex items-center justify-center shrink-0 p-2">
          <Download className="h-full w-full text-emerald-300" />
        </div>
        <div>
          <h4 className="font-bold text-xs text-white">Install AASRA Web App</h4>
          <p className="text-[10px] text-emerald-100/80">1-tap offline mobile access for farm fields</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold text-xs cursor-pointer transition-all shadow-sm"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg text-emerald-200/60 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
