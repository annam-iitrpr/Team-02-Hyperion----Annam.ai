import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Memory cache for active translations
const memoryLocaleCache = new Map<string, Record<string, string>>();

const BRAND_TOKEN = "XYZKYXYZ";
const BRAND_NAME = "krishyantra";

// Google Translate free public endpoint with brand protection
async function translateWithGoogle(text: string, targetLang: string, sourceLang = "auto"): Promise<string> {
  if (!text || targetLang === "en") return text;

  try {
    // Mask brand name
    const masked = text.replace(/krishyantra/gi, BRAND_TOKEN);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(masked)}`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    if (!res.ok) {
      throw new Error(`Google Translate RPC error: ${res.statusText}`);
    }

    const data = await res.json();
    if (!Array.isArray(data) || !Array.isArray(data[0])) {
      return text;
    }

    let translated = data[0].map((item: any) => item[0]).join("");
    // Restore brand token
    translated = translated.replace(new RegExp(BRAND_TOKEN, "gi"), BRAND_NAME);
    return translated;
  } catch (err) {
    console.warn(`[Translate API] Failed to translate: "${text.substring(0, 30)}..."`, err);
    return text;
  }
}

// Load static file if available
function loadLocaleFromFile(lang: string): Record<string, string> | null {
  try {
    const filePath = path.join(process.cwd(), "public", "locales", `${lang}.json`);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`[Translate API] Failed to read locale file for ${lang}:`, err);
  }
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang") || "en";

  // If cached in memory, return immediately
  if (memoryLocaleCache.has(lang)) {
    return NextResponse.json({
      lang,
      source: "cache",
      translations: memoryLocaleCache.get(lang),
    });
  }

  // Load baseline english dictionary as master schema
  const enDict = loadLocaleFromFile("en") || {};

  if (lang === "en") {
    memoryLocaleCache.set("en", enDict);
    return NextResponse.json({
      lang: "en",
      source: "file",
      translations: enDict,
    });
  }

  // Load existing language file if present
  const existingLangDict = loadLocaleFromFile(lang) || {};
  const merged: Record<string, string> = { ...existingLangDict };

  // Identify any missing keys that need dynamic on-the-fly translation
  const missingKeys = Object.keys(enDict).filter((k) => !merged[k]);

  if (missingKeys.length > 0 && missingKeys.length <= 15) {
    // On-the-fly fill in small missing deltas
    await Promise.all(
      missingKeys.map(async (k) => {
        const enVal = enDict[k];
        if (typeof enVal === "string") {
          merged[k] = await translateWithGoogle(enVal, lang, "en");
        }
      })
    );
  } else if (missingKeys.length > 0) {
    // Fallback missing keys to English if large diff
    for (const k of missingKeys) {
      if (!merged[k]) {
        merged[k] = enDict[k];
      }
    }
  }

  // Always enforce brandName
  merged.brandName = BRAND_NAME;

  // Cache compiled dictionary
  memoryLocaleCache.set(lang, merged);

  return NextResponse.json({
    lang,
    source: existingLangDict ? "hybrid" : "dynamic",
    translations: merged,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, texts, targetLang, sourceLang = "auto" } = body;

    if (!targetLang) {
      return NextResponse.json({ error: "targetLang is required" }, { status: 400 });
    }

    if (text && typeof text === "string") {
      const translated = await translateWithGoogle(text, targetLang, sourceLang);
      return NextResponse.json({ translatedText: translated });
    }

    if (Array.isArray(texts)) {
      const translatedList = await Promise.all(
        texts.map((t: string) => translateWithGoogle(t, targetLang, sourceLang))
      );
      return NextResponse.json({ translatedTexts: translatedList });
    }

    return NextResponse.json({ error: "Missing 'text' or 'texts' field" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Translation error" }, { status: 500 });
  }
}
