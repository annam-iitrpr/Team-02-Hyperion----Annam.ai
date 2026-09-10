"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getStoredProfile, saveProfile } from "@/lib/userStore";
import { getTranslation, TranslationDict } from "@/lib/translations";

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: TranslationDict;
  isChangingLanguage: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: getTranslation("en"),
  isChangingLanguage: false,
});

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement?: new (options: any, elementId: string) => void;
      };
    };
  }
}

let pollTimer: any = null;

/** Drives Google Translate to switch language rapidly without page reload */
export const applyGoogleTranslate = (lang: string) => {
  if (typeof window === "undefined") return;

  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }

  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const domainAttr = isLocal ? "" : `; domain=${window.location.hostname}`;

  // If English is selected: restore original page content
  if (lang === "en") {
    // 1. Clear the googtrans cookies across all domain paths
    const hostname = window.location.hostname;
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
    const domains = [
      "",
      hostname,
      `.${hostname}`,
      isLocal ? "" : hostname.split(".").slice(-2).join("."),
    ];

    domains.forEach((d) => {
      const dAttr = d ? `; domain=${d}` : "";
      document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${dAttr}`;
      document.cookie = `googtrans=/auto/en; path=/${dAttr}`;
    });

    // 2. Search all iframes for Google Translate restore button
    let restored = false;
    try {
      const iframes = Array.from(document.querySelectorAll("iframe"));
      for (const iframe of iframes) {
        try {
          const doc: any = iframe.contentDocument || (iframe as any).contentWindow?.document;
          if (doc) {
            const restoreBtn =
              (doc.querySelector(
                "#\\:1\\.restore, #\\:2\\.restore, button[id*='restore'], .goog-te-banner-frame-restore"
              ) as HTMLElement | null) ||
              (Array.from(doc.querySelectorAll("button, a")) as HTMLElement[]).find(
                (el: any) => el.innerText?.trim().toLowerCase().includes("show original") || el.id?.includes("restore")
              );

            if (restoreBtn) {
              restoreBtn.click();
              restored = true;
              break;
            }
          }
        } catch (_) {}
      }
    } catch (_) {}

    // 3. Drive combo to English / default option
    const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (combo) {
      combo.value = "";
      combo.dispatchEvent(new Event("change", { bubbles: true }));
      if (typeof combo.onchange === "function") combo.onchange(new Event("change") as any);
    }

    // 4. If page was translated and restore button didn't clean it up, reload to render clean native English
    const wasTranslated = document.querySelectorAll("font").length > 0 || !!document.querySelector(".goog-te-banner-frame");
    if (wasTranslated && !restored) {
      setTimeout(() => {
        window.location.reload();
      }, 80);
    }
    return;
  }

  // Non-English target language
  const cookieValue = `/auto/${lang}`;
  document.cookie = `googtrans=${cookieValue}; path=/;${domainAttr}`;
  document.cookie = `googtrans=${cookieValue}; path=/;`;

  const driveCombo = (): boolean => {
    const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (!combo) return false;

    const opt = Array.from(combo.options).find(
      (o) => o.value.toLowerCase() === lang.toLowerCase()
    );

    if (opt) {
      if (combo.value !== opt.value) {
        combo.value = opt.value;
        combo.dispatchEvent(new Event("change", { bubbles: true }));
        if (typeof combo.onchange === "function") {
          combo.onchange(new Event("change") as any);
        }
      }
      return true;
    }
    return false;
  };

  // Immediate attempt
  if (driveCombo()) return;

  // Rapid polling every 25ms up to 80 attempts (2 seconds max) without page reload
  let attempts = 0;
  pollTimer = setInterval(() => {
    attempts++;
    if (driveCombo() || attempts > 80) {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    }
  }, 25);
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>("en");
  const [isChangingLanguage, setIsChangingLanguage] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Restore from saved profile immediately
    const profile = getStoredProfile();
    const activeLang = profile?.language || "en";
    setLanguageState(activeLang);

    // Inject Google Translate widget
    window.googleTranslateElementInit = () => {
      try {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,hi,mr,pa,gu,te,ta,kn,ml,bn,or,as",
              autoDisplay: false,
              layout: 0,
            },
            "google_translate_element"
          );

          if (activeLang && activeLang !== "en") {
            applyGoogleTranslate(activeLang);
          }
        }
      } catch (_) {}
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else if (activeLang && activeLang !== "en") {
      applyGoogleTranslate(activeLang);
    }
  }, []);

  // Sync HTML lang attribute and SEO metadata dynamically
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.setAttribute("lang", language);

      let metaLang = document.querySelector<HTMLMetaElement>('meta[name="language"]');
      if (!metaLang) {
        metaLang = document.createElement("meta");
        metaLang.name = "language";
        document.head.appendChild(metaLang);
      }
      metaLang.content = language;

      let metaContentLang = document.querySelector<HTMLMetaElement>('meta[http-equiv="content-language"]');
      if (!metaContentLang) {
        metaContentLang = document.createElement("meta");
        metaContentLang.httpEquiv = "content-language";
        document.head.appendChild(metaContentLang);
      }
      metaContentLang.content = language;
    }
  }, [language]);

  const setLanguage = (lang: string) => {
    // 1. Instant React state update (0ms latency for all React components)
    setLanguageState(lang);
    setIsChangingLanguage(true);
    setTimeout(() => setIsChangingLanguage(false), 300);

    // 2. Persist in profile
    const profile = getStoredProfile();
    saveProfile({ ...profile, language: lang });

    // 3. Drive Google Translate rapidly
    applyGoogleTranslate(lang);
  };

  const t = getTranslation(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isChangingLanguage }}>
      {/* Hidden GT widget container positioned off-screen (not display:none so browser constructs it instantly) */}
      <div
        id="google_translate_element"
        className="notranslate"
        translate="no"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
