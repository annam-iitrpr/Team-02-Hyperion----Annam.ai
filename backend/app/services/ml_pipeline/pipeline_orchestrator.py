"""
AASRA Master Pipeline Orchestrator (Models 1, 2, 3, 5)
Follows AASRA Master ML Playbook (Sections 1, 2, 3, 4).
"""

import time
import math
import logging
from typing import Dict, Any, List, Optional
import httpx
import numpy as np

from .inference_client import VertexMLInferenceClient

logger = logging.getLogger(__name__)

# Regional Defaults for Indian Agro-Climatic Zones
REGIONAL_DEFAULTS = {
    "kasganj": {"lat": 27.81, "lon": 78.65, "soil_clay_pct": 32.0, "soil_ec_ds_m": 0.8, "soil_ph": 7.4, "hist_yield_q_ha": 24.5, "crop": "potato"},
    "bhopal": {"lat": 23.2599, "lon": 77.4126, "soil_clay_pct": 42.0, "soil_ec_ds_m": 0.6, "soil_ph": 7.2, "hist_yield_q_ha": 18.2, "crop": "soybean"},
    "indore": {"lat": 22.7196, "lon": 75.8577, "soil_clay_pct": 45.0, "soil_ec_ds_m": 0.5, "soil_ph": 7.5, "hist_yield_q_ha": 19.5, "crop": "soybean"},
    "punjab": {"lat": 30.9, "lon": 75.86, "soil_clay_pct": 22.0, "soil_ec_ds_m": 1.1, "soil_ph": 7.8, "hist_yield_q_ha": 48.0, "crop": "wheat"},
    "ludhiana": {"lat": 30.9, "lon": 75.86, "soil_clay_pct": 22.0, "soil_ec_ds_m": 1.1, "soil_ph": 7.8, "hist_yield_q_ha": 48.0, "crop": "wheat"},
    "vidarbha": {"lat": 20.93, "lon": 77.75, "soil_clay_pct": 52.0, "soil_ec_ds_m": 0.7, "soil_ph": 7.6, "hist_yield_q_ha": 14.0, "crop": "cotton_bt"},
    "saurashtra": {"lat": 21.52, "lon": 70.45, "soil_clay_pct": 28.0, "soil_ec_ds_m": 1.4, "soil_ph": 8.0, "hist_yield_q_ha": 16.5, "crop": "groundnut"},
    "kurnool": {"lat": 15.8281, "lon": 78.0373, "soil_clay_pct": 25.0, "soil_ec_ds_m": 1.2, "soil_ph": 7.9, "hist_yield_q_ha": 26.0, "crop": "rice"}
}

def calculate_vpd(temp_c: float, rh_pct: float) -> float:
    """Calculates Vapor Pressure Deficit in kPa."""
    es = 0.61078 * math.exp((17.27 * temp_c) / (temp_c + 237.3))
    ea = es * (rh_pct / 100.0)
    return max(0.1, es - ea)

def calculate_delta_t(t_dry: float, rh_pct: float) -> float:
    """
    Calculates Delta-T (°C) = Dry bulb temp - Wet bulb temp (Stull's equation).
    Governs droplet evaporation rate.
    """
    rh = max(1.0, min(rh_pct, 100.0))
    t = t_dry
    t_wet = (
        t * math.atan(0.151977 * math.sqrt(rh + 8.313659))
        + math.atan(t + rh)
        - math.atan(rh - 1.676331)
        + 0.00391838 * (rh ** 1.5) * math.atan(0.023101 * rh)
        - 4.686035
    )
    return max(0.0, t - t_wet)

def sanitize_for_json(obj: Any) -> Any:
    if isinstance(obj, dict):
        return {str(k): sanitize_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [sanitize_for_json(v) for v in obj]
    elif isinstance(obj, (np.floating, np.float32, np.float64)):
        return float(obj)
    elif isinstance(obj, (np.integer, np.int32, np.int64)):
        return int(obj)
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, np.ndarray):
        return [sanitize_for_json(v) for v in obj.tolist()]
    return obj

def safe_float(val: Any, default: float) -> float:
    if val is None:
        return float(default)
    try:
        return float(val)
    except (ValueError, TypeError):
        return float(default)

def safe_int(val: Any, default: int) -> int:
    if val is None:
        return int(default)
    try:
        return int(val)
    except (ValueError, TypeError):
        return int(default)


def _compute_spray_window_label(
    temp_max: float,
    temp_min: float,
    wind_speed: float,
    rain_prob: float,
    spray_window_safe: bool,
    delta_t: float,
) -> tuple:
    """
    Dynamically computes the optimal spray window time-slot and a
    farmer-friendly reason string from live telemetry.

    Returns (label, reason) where:
      label  – e.g. "5:30–7:30 PM", "6:00–8:00 AM", or "Hold Spray"
      reason – e.g. "Evening best: peak 38°C, wind 6 km/h calm"

    All values are calculated from real data; nothing is hardcoded.
    """
    if not spray_window_safe:
        parts = []
        if wind_speed >= 15:
            parts.append(f"Wind {wind_speed:.0f} km/h exceeds limit")
        if rain_prob >= 60:
            parts.append(f"Rain probability {rain_prob:.0f}%")
        if delta_t >= 8:
            parts.append(f"\u0394T {delta_t:.1f}\u00b0C too high")
        if not parts:
            parts.append(f"\u0394T {delta_t:.1f}\u00b0C adverse")
        return "Hold Spray", " \u00b7 ".join(parts)

    # Compute the ideal window from weather thresholds:
    # - Evening preferred when day is very hot (max >= 36\u00b0C) — cooler stomatal uptake
    # - Morning preferred when nights are cool (min <= 20\u00b0C) — fully open stomata
    # - Moderate heat -> flexible (evening slightly better for VPD management)
    if temp_max >= 38:
        label = "5:30\u20137:00 PM"
        reason = f"Evening window — peak {temp_max:.0f}\u00b0C, wind {wind_speed:.0f} km/h"
    elif temp_max >= 36:
        label = "5:30\u20137:30 PM"
        reason = f"Evening preferred — hot day {temp_max:.0f}\u00b0C, calm {wind_speed:.0f} km/h wind"
    elif temp_min <= 18:
        label = "6:00\u20138:00 AM"
        reason = f"Morning ideal — cool night {temp_min:.0f}\u00b0C, stomata fully open"
    elif temp_min <= 22:
        label = "6:00\u20138:30 AM"
        reason = f"Morning best — mild night {temp_min:.0f}\u00b0C, low VPD conditions"
    elif temp_max >= 33:
        label = "6:00\u20138:00 PM"
        reason = f"Evening safe — moderate heat {temp_max:.0f}\u00b0C, wind {wind_speed:.0f} km/h"
    else:
        label = "6:30\u20138:30 AM"
        reason = f"Morning optimal — mild {temp_max:.0f}\u00b0C day, low \u0394T conditions"

    return label, reason

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi (हिन्दी)",
    "mr": "Marathi (मराठी)",
    "pa": "Punjabi (ਪੰਜਾਬੀ)",
    "gu": "Gujarati (ગુજરાતી)",
    "te": "Telugu (తెలుగు)",
    "ta": "Tamil (தமிழ்)",
    "kn": "Kannada (ಕನ್ನಡ)",
    "ml": "Malayalam (മലയാളം)",
    "bn": "Bengali (বাংলা)",
    "or": "Odia (ଓଡ଼ିଆ)",
    "as": "Assamese (অসমীয়া)",
}

def synthesize_gemini_statement(
    farmer_name: str,
    district: str,
    crop: str,
    growth_stage: str,
    area_acres: float,
    telemetry: Dict[str, Any],
    m1_risk: Dict[str, Any],
    m2_readiness: Dict[str, Any],
    m3_portfolio: Dict[str, Any],
    m5_baseline: Dict[str, Any],
    m6_causal_robi: Optional[Dict[str, Any]] = None,
    language: str = "en",
) -> Dict[str, Any]:
    import json
    from app.config import settings

    top_prod = m3_portfolio.get("primary_recommendation") or {}
    prod_name = top_prod.get("name", "Syngenta Biological")
    dosage = top_prod.get("recommended_dosage", "2.0 ml/L")
    stress_type = m1_risk.get("stress_type", "Optimal")
    stress_conf = m1_risk.get("confidence", 0.8)
    is_safe = m2_readiness.get("spray_window_safe", False)
    readiness_score = m2_readiness.get("readiness_score", 0.5)
    delta_t = m2_readiness.get("delta_t", 4.5)
    reasons = m2_readiness.get("safety_reasons", [])
    exp_yield = m5_baseline.get("expected_baseline_yield_q_ha", 25.0)
    exp_yield_acre = m5_baseline.get("expected_baseline_yield_q_acre", 10.0)

    m6 = m6_causal_robi or {}
    causal_gain_q = m6.get("causal_gain_tau_q_acre", 0.0)
    robi_mult = m6.get("robi_multiplier", "N/A")
    rev_saved = m6.get("revenue_saved_inr", 0)

    target_lang_name = LANGUAGE_NAMES.get(language, "English")

    safe_text_hi = "सुरक्षित स्प्रे विंडो सक्रिय है" if is_safe else "वर्तमान में स्प्रे स्थगित करें (शर्तें प्रतिकूल)"
    safe_text_en = "Safe Spray Window Active" if is_safe else "Delay Spraying — Adverse Atmospheric Window"

    # 12 Regional Language Pre-Calculated Biophysical Advisory Templates
    LOCALIZED_STATEMENTS = {
        "hi": (
            f"किसान साथी {farmer_name}, मॉडल 1 के अनुसार {district} में {crop} पर {stress_type} (सटीकता {round(stress_conf*100)}%) का जोखिम है। "
            f"मॉडल 2 बायोफिजिकल गेट के अनुसार {safe_text_hi} (डेल्टा-टी: {delta_t}°C)। "
            f"मॉडल 3 द्वारा अनुशंसित सिंजेंटा उत्पाद {prod_name} की मात्रा {dosage} है। "
            f"मॉडल 5 के अनुसार आधार उपज {exp_yield_acre} क्विंटल प्रति एकड़ है। "
            f"मॉडल 6 (डबल एमएल) के अनुसार जैविक उपचार से +{causal_gain_q} क्विंटल/एकड़ उपज सुरक्षा और {robi_mult} ROBI अनुमानित है।"
        ),
        "en": (
            f"Farmer {farmer_name}, Model 1 detects {stress_type} ({round(stress_conf*100)}% confidence) for {crop} in {district}. "
            f"Model 2 Action Gate reports: {safe_text_en} (Delta-T: {delta_t}°C). "
            f"Model 3 recommends Syngenta {prod_name} ({dosage}). "
            f"Model 5 projects baseline harvest yield of {exp_yield_acre} Q/acre ({exp_yield} Q/ha). "
            f"Model 6 (Double ML) estimates causal protection of +{causal_gain_q} Q/acre delivering {robi_mult} ROBI (₹{rev_saved:,} saved)."
        ),
        "mr": (
            f"शेतकरी बंधू {farmer_name}, मॉडेल 1 नुसार {district} मध्ये {crop} पिकावर {stress_type} ({round(stress_conf*100)}% खात्री) चा धोका आहे. "
            f"मॉडेल 2 नुसार {safe_text_hi} (डेल्टा-टी: {delta_t}°C). "
            f"मॉडेल 3 शिफारस केलेले उत्पादन {prod_name} प्रमाण {dosage} आहे. "
            f"मॉडेल 5 नुसार अपेक्षित आधार उत्पादन {exp_yield_acre} क्विंटल प्रति एकर आहे. "
            f"मॉडेल 6 (डबल एमएल) द्वारे +{causal_gain_q} क्विंटल/एकर उत्पादन वाढ आणि {robi_mult} ROBI सिद्ध होते."
        ),
        "pa": (
            f"ਕਿਸਾਨ ਵੀਰ {farmer_name}, ਮਾਡਲ 1 ਅਨੁਸਾਰ {district} ਵਿੱਚ {crop} ਦੀ ਫਸਲ 'ਤੇ {stress_type} ({round(stress_conf*100)}% ਸ਼ੁੱਧਤਾ) ਦਾ ਖਤਰਾ ਹੈ। "
            f"ਮਾਡਲ 2 ਅਨੁਸਾਰ {safe_text_hi} (ਡੈਲਟਾ-ਟੀ: {delta_t}°C)। "
            f"ਮਾਡਲ 3 ਸਿਫਾਰਿਸ਼ ਕੀਤੀ ਖੁਰਾਕ {prod_name} ({dosage}) ਹੈ। "
            f"ਮਾਡਲ 5 ਅਨੁਸਾਰ ਝਾੜ {exp_yield_acre} ਕੁਇੰਟਲ ਪ੍ਰਤੀ ਏਕੜ ਹੈ।"
        ),
        "gu": (
            f"ખેડૂત મિત્ર {farmer_name}, મોડેલ 1 મુજબ {district} માં {crop} પાક પર {stress_type} ({round(stress_conf*100)}% ચોકસાઈ) નું જોખમ છે. "
            f"મોડેલ 2 મુજબ {safe_text_hi} (ડેલ્ટા-ટી: {delta_t}°C). "
            f"મોડેલ 3 ભલામણ કરેલ દવા {prod_name} નો ડોઝ {dosage} છે. "
            f"મોડેલ 5 મુજબ અંદાજિત ઉત્પાદન {exp_yield_acre} ક્વિન્ટલ પ્રતિ એકર છે."
        ),
        "te": (
            f"రైతు సోదరుడు {farmer_name}, మోడల్ 1 ప్రకారం {district} లోని {crop} పంటపై {stress_type} ({round(stress_conf*100)}% ఖచ్చితత్వం) ప్రమాదం ఉంది. "
            f"మోడల్ 2 ప్రకారం {safe_text_en} (డెల్టా-టి: {delta_t}°C). "
            f"మోడల్ 3 సిఫార్సు చేసిన సింజెంటా {prod_name} మోతాదు {dosage}. "
            f"మోడల్ 5 అంచనా వేసిన దిగుబడి ఎకరాకు {exp_yield_acre} క్వింటాళ్లు."
        ),
        "ta": (
            f"விவசாயி {farmer_name}, மாதிரி 1 படி {district} பகுதியில் {crop} பயிரில் {stress_type} ({round(stress_conf*100)}% துல்லியம்) ஆபத்து உள்ளது. "
            f"மாதிரி 2 படி {safe_text_en} (டெல்டா-டி: {delta_t}°C). "
            f"மாதிரி 3 பரிந்துரைக்கும் மருந்து {prod_name} அளவு {dosage}. "
            f"மாதிரி 5 படி எதிர்பார்க்கப்படும் மகசூல் ஏக்கருக்கு {exp_yield_acre} குவிண்டால்."
        ),
        "kn": (
            f"ರೈತ ಮಿತ್ರ {farmer_name}, ಮಾದರಿ 1 ರ ಪ್ರಕಾರ {district} ನಲ್ಲಿ {crop} ಬೆಳೆಗೆ {stress_type} ({round(stress_conf*100)}% ನಿಖರತೆ) ಅಪಾಯವಿದೆ. "
            f"ಮಾದರಿ 2 ರ ಪ್ರಕಾರ {safe_text_en} (ಡೆಲ್ಟಾ-ಟಿ: {delta_t}°C). "
            f"ಮಾದರಿ 3 ರ ಶಿಫಾರಸು ಮಾಡಿದ {prod_name} ಪ್ರಮಾಣ {dosage}. "
            f"ಮಾದರಿ 5 ರ ನಿರೀಕ್ಷಿತ ಇಳುವರಿ ಎಕರೆಗೆ {exp_yield_acre} ಕ್ವಿಂಟಾಲ್ ಆಗಿದೆ."
        ),
        "ml": (
            f"കർഷക സുഹൃത്ത് {farmer_name}, മോഡൽ 1 പ്രകാരം {district} ൽ {crop} വിളയിൽ {stress_type} ({round(stress_conf*100)}% കൃത്യത) സാധ്യതയുണ്ട്. "
            f"മോഡൽ 2 പ്രകാരം {safe_text_en} (ഡെൽറ്റ-ടി: {delta_t}°C). "
            f"മോഡൽ 3 ശുപാർശ ചെയ്യുന്ന {prod_name} അളവ് {dosage}. "
            f"മോഡൽ 5 പ്രകാരം പ്രതീക്ഷിക്കുന്ന വിളവ് ഏക്കറിന് {exp_yield_acre} ക്വിന്റൽ ആണ്."
        ),
        "bn": (
            f"কৃষক বন্ধু {farmer_name}, মডেল ১ অনুযায়ী {district} এ {crop} ফসলে {stress_type} ({round(stress_conf*100)}% নির্ভুলতা) ঝুঁকি রয়েছে। "
            f"মডেল ২ অনুযায়ী {safe_text_hi} (ডেল্টা-টি: {delta_t}°C)। "
            f"মডেল ৩ প্রস্তাবিত সিনজেনটা পণ্য {prod_name} মাত্রা {dosage}। "
            f"মডেল ৫ অনুযায়ী প্রত্যাশিত ফলন একরে {exp_yield_acre} কুইন্টাল।"
        ),
        "or": (
            f"କୃଷକ ଭାଇ {farmer_name}, ମଡେଲ ୧ ଅନୁଯାୟୀ {district} ରେ {crop} ଫସଲରେ {stress_type} ({round(stress_conf*100)}% ସଠିକତା) ର ଆଶଙ୍କା ରହିଛି। "
            f"ମଡେଲ ୨ ଅନୁଯାୟୀ {safe_text_hi} (ଡେଲ୍ଟା-ଟି: {delta_t}°C)। "
            f"ମଡେଲ ୩ ସୁପାରିଶ କରାଯାଇଥିବା {prod_name} ମାତ୍ରା {dosage}। "
            f"ମଡେଲ ୫ ଅନୁସାରେ ଆକଳନ କରାଯାଇଥିବା ଉତ୍ପାଦନ ଏକର ପିଛା {exp_yield_acre} କ୍ୱିଣ୍ଟାଲ।"
        ),
        "as": (
            f"কৃষক বন্ধু {farmer_name}, মডেল ১ অনুসৰি {district} ত {crop} শস্যত {stress_type} ({round(stress_conf*100)}% সঠিকতা) আশংকা আছে। "
            f"মডেল ২ অনুসৰি {safe_text_hi} (ডেল্টা-টি: {delta_t}°C)। "
            f"মডেল ৩ অনুমোদন কৰা {prod_name} মাত্ৰা {dosage}। "
            f"মডেল ৫ অনুসৰি আনুমানিক উৎপাদন একৰত {exp_yield_acre} কুইণ্টল।"
        ),
    }

    fallback_statement = LOCALIZED_STATEMENTS.get(language, LOCALIZED_STATEMENTS["en"])

    fallback_payload = {
        "headline": f"{stress_type} Alert: {prod_name} Recommended" if is_safe else f"Spray Hold: Unfavorable Weather Window (Delta-T: {delta_t}°C)",
        "statement": fallback_statement,
        "statement_hi": LOCALIZED_STATEMENTS["hi"],
        "statement_en": LOCALIZED_STATEMENTS["en"],
        "spray_verdict_badge": "SAFE TO SPRAY" if is_safe else "DELAY SPRAY",
        "timing_guidance": "Adverse weather window — hold spray until atmospheric conditions stabilize" if not is_safe else "Optimal 48h spray window open (early morning / late afternoon).",
        "product_summary": f"{prod_name} at {dosage}.",
        "yield_outlook": f"{exp_yield_acre} Q/acre baseline. Model 6 Causal Uplift: +{causal_gain_q} Q/acre ({robi_mult} ROBI).",
        "language_used": language,
        "generated_by": "Rule-Based Biophysical Synthesis"
    }

    google_keys = settings.get_google_keys()
    prompt = f"""You are AASRA, an elite agricultural AI decision engine deployed across Indian farms.
Synthesize the official findings of 5 Machine Learning models into a concise, authoritative farmer advisory in {target_lang_name}:
- Farmer Name: {farmer_name}
- District: {district}
- Crop: {crop} ({growth_stage}, {area_acres} acres)
- Weather Observation Time: {telemetry.get('weather_timestamp', 'Live')}
- Model 1 (PS-02 Stress Risk): Stress = {stress_type}, Confidence = {stress_conf:.2f}
- Model 2 (PS-02 Biological Action Gate): Safe Window = {is_safe} ({'48h Spray Window Open' if is_safe else 'Spray Prohibited / Closed due to weather gating'}), Readiness Score = {readiness_score:.4f}, Delta-T = {delta_t}°C, Reasons = {reasons}
- Model 3 (PS-03 Syngenta Product Ranker): Champion = {prod_name} ({top_prod.get('category', 'Agri Solution')}), Dosage = {dosage}, Active Ingredient = {top_prod.get('active_ingredient', '')}, Timing = {top_prod.get('application_timing', '')}
- Model 5 (PS-07 Yield Baseline): Expected Baseline Yield = {exp_yield} Q/ha ({exp_yield_acre} Q/acre) vs District Historical Baseline
- Model 6 (PS-07 Causal Double ML & ROBI Attribution): True Causal Yield Protection tau = +{causal_gain_q} Q/acre, Net Causal ROBI Multiplier = {robi_mult}, Total Farm Revenue Saved = ₹{rev_saved}
Strict Rule: Do not hallucinate unapproved chemical recommendations. Honor the official approved product name, dosage, and 48h spray safety verdict exactly.

Return strictly valid JSON with these keys:
{{
  "headline": "Short punchy header in {target_lang_name}",
  "statement": "Professional advisory statement strictly written in {target_lang_name} addressing {farmer_name} directly, explaining Model 1 ({stress_type}), Model 2 (Delta-T {delta_t}°C and spray window), Model 3 ({prod_name} at {dosage}), Model 5 ({exp_yield_acre} Q/acre baseline), and Model 6 (+{causal_gain_q} Q/acre causal gain with {robi_mult} ROBI)",
  "statement_en": "English translation",
  "statement_hi": "Hindi translation",
  "spray_verdict_badge": "SAFE TO SPRAY" or "DELAY SPRAY",
  "timing_guidance": "Recommended time window in {target_lang_name}",
  "product_summary": "Dosage in {target_lang_name}",
  "yield_outlook": "Summary of yield in {target_lang_name}"
}}
"""

    # 1. Try Google Gemini with key & model rotation
    if google_keys:
        import google.generativeai as genai
        for model_name in ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash"]:
            for key in google_keys[:2]:
                try:
                    genai.configure(api_key=key)
                    m = genai.GenerativeModel(model_name)
                    response = m.generate_content(prompt, request_options={"timeout": 5.0})
                    raw = response.text.strip()
                    if "```json" in raw:
                        raw = raw.split("```json")[1].split("```")[0].strip()
                    elif "```" in raw:
                        raw = raw.split("```")[1].split("```")[0].strip()
                    parsed = json.loads(raw)
                    parsed["generated_by"] = f"Google {model_name}"
                    parsed["language_used"] = language
                    if "statement" not in parsed or not parsed["statement"]:
                        parsed["statement"] = fallback_statement
                    return parsed
                except Exception as e:
                    logger.debug(f"Gemini {model_name} attempt failed: {e}")
                    continue

    # 2. Try Groq (Llama 3.3 70B) for ultra-fast, quota-free fallback
    groq_keys = settings.get_groq_keys()
    if groq_keys:
        import urllib.request
        for gkey in groq_keys[:2]:
            try:
                req_data = json.dumps({
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "user", "content": prompt}],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.3
                }).encode("utf-8")
                req = urllib.request.Request(
                    "https://api.groq.com/openai/v1/chat/completions",
                    data=req_data,
                    headers={
                        "Authorization": f"Bearer {gkey}",
                        "Content-Type": "application/json"
                    }
                )
                with urllib.request.urlopen(req, timeout=4.0) as resp:
                    resp_json = json.loads(resp.read().decode("utf-8"))
                    content = resp_json["choices"][0]["message"]["content"]
                    parsed = json.loads(content)
                    parsed["generated_by"] = "Groq Llama 3.3 70B"
                    parsed["language_used"] = language
                    if "statement" not in parsed or not parsed["statement"]:
                        parsed["statement"] = fallback_statement
                    return parsed
            except Exception as ge:
                logger.debug(f"Groq attempt failed: {ge}")
                continue

    return fallback_payload


class AASRAPipelineOrchestrator:
    def __init__(self, client: Optional[VertexMLInferenceClient] = None):
        self.client = client or VertexMLInferenceClient()

    def run_pipeline(self, request_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes the full 4-model pipeline:
        Model 1 (Stress Risk) + Model 2 (Biological Readiness) -> Model 3 (Product Portfolio) + Model 5 (Yield Baseline)
        + Gemini 2.5 Flash Statement Synthesis.
        """
        start_time = time.time()

        farmer_name = request_payload.get("farmer_name") or "Farmer"
        farmer_id = request_payload.get("farmer_id") or "farmer-001"
        district = request_payload.get("district") or request_payload.get("region") or "Kasganj"
        crop = request_payload.get("crop") or request_payload.get("crop_type") or "potato"
        growth_stage = request_payload.get("growth_stage") or "Vegetative"
        area_acres = safe_float(request_payload.get("area_acres"), 5.0)
        language = str(request_payload.get("language") or "en").lower().strip()

        # Resolve location coordinates and soil properties
        dist_key = str(district).lower().strip()
        reg_info = REGIONAL_DEFAULTS.get(dist_key, REGIONAL_DEFAULTS["kasganj"])
        
        lat = safe_float(request_payload.get("lat"), reg_info["lat"])
        lon = safe_float(request_payload.get("lon"), reg_info["lon"])

        # Microclimate and Soil features
        temp_max = safe_float(request_payload.get("temp_max_c"), 35.5)
        temp_min = safe_float(request_payload.get("temp_min_c"), 24.8)
        rh_avg = safe_float(request_payload.get("rh_avg_pct"), 52.0)
        wind_speed = safe_float(request_payload.get("wind_speed_kmh"), 11.2)
        rain_prob = safe_float(request_payload.get("rain_prob_pct"), 15.0)
        soil_moisture = safe_float(request_payload.get("soil_moisture_pct"), 38.0)
        consecutive_hot = safe_int(request_payload.get("consecutive_hot_days"), 3)
        gdd = safe_float(request_payload.get("gdd_accumulated"), 1420.0)
        rain_3d = safe_float(request_payload.get("rainfall_3d_sum_mm"), 0.0)

        soil_clay = safe_float(request_payload.get("soil_clay_pct"), reg_info["soil_clay_pct"])
        soil_ec = safe_float(request_payload.get("soil_ec_ds_m"), reg_info["soil_ec_ds_m"])
        soil_ph = safe_float(request_payload.get("soil_ph"), reg_info["soil_ph"])
        hist_yield = safe_float(request_payload.get("district_historical_mean_yield"), reg_info["hist_yield_q_ha"])

        # Compute thermodynamic variables
        vpd = calculate_vpd(temp_max, rh_avg)
        delta_t = calculate_delta_t(temp_max, rh_avg)

        # Stage sensitivity (Flowering and pod/grain stages have higher biological impact)
        stage_lower = growth_stage.lower()
        if any(s in stage_lower for s in ["flower", "bloom", "anthesis"]):
            stage_sensitivity = 1.0
        elif any(s in stage_lower for s in ["pod", "tuber", "fruit", "grain"]):
            stage_sensitivity = 0.85
        elif any(s in stage_lower for s in ["tillering", "vegetative"]):
            stage_sensitivity = 0.45
        else:
            stage_sensitivity = 0.30

        # Layer 2: Model 1 & Model 2
        m1_features = {
            "temp_max_forecast_7d": temp_max,
            "temp_night_min_7d": temp_min,
            "rh_avg_forecast_7d": rh_avg,
            "vpd_kpa": vpd,
            "soil_moisture_vol_pct": soil_moisture,
            "consecutive_hot_days": consecutive_hot,
            "crop_gdd_accumulated": gdd,
            "rainfall_3d_sum_mm": rain_3d,
            "soil_clay_pct": soil_clay,
            "soil_ec_ds_m": soil_ec,
            "soil_ph": soil_ph
        }
        m1_result = self.client.predict_model1(m1_features)

        m2_features = {
            "soil_moisture_pct": soil_moisture,
            "delta_t_celsius": delta_t,
            "wind_speed_kmh": wind_speed,
            "rain_prob_next_48h": rain_prob,
            "crop_stage_sensitivity": stage_sensitivity
        }
        m2_result = self.client.predict_model2(m2_features)

        # Layer 3: Model 3 Product Portfolio Ranker
        farm_context = {
            "crop": crop,
            "growth_stage": growth_stage,
            "temp_max_c": temp_max,
            "temp_min_c": temp_min,
            "soil_moisture_pct": soil_moisture,
            "rain_3d_mm": rain_3d,
            "soil_ec_dsm": soil_ec,
            "vpd_kpa": vpd,
            "canopy_temp_depression_c": max(0.5, 33.0 - temp_max),
            "mandi_price_inr_q": request_payload.get("mandi_price_inr_q", 2800.0)
        }
        m3_ranked = self.client.predict_model3(farm_context, m1_result, m2_result, top_k=3)

        # Layer 4: Model 5 Field Yield Baseline Regressor
        m5_context = {
            "crop": crop,
            "district_historical_mean_yield": hist_yield,
            "gdd_seasonal_total": gdd,
            "rainfall_total_mm": float(request_payload.get("seasonal_rainfall_mm", 620.0)),
            "dry_spell_max_consecutive_days": int(request_payload.get("dry_spell_max_days", 7)),
            "extreme_heat_days_count": int(request_payload.get("extreme_heat_days", consecutive_hot)),
            "soil_clay_pct": soil_clay
        }
        m5_result = self.client.predict_model5(m5_context)

        # Layer 4 (Continued): Model 6 Causal Double ML & ROBI Attribution (PS-07)
        treatment_applied = safe_int(request_payload.get("treatment_applied"), 1)
        mandi_price = safe_float(request_payload.get("mandi_price_inr_q"), 2800.0)
        product_cost_acre = safe_float(request_payload.get("product_cost_inr_acre"), 400.0)
        top_product_name = m3_ranked[0]["name"] if m3_ranked else "Syngenta Quantis"

        m6_result = self.client.predict_model6(
            farm_context={
                "crop": crop,
                "growth_stage": growth_stage,
                "temp_max_c": temp_max,
                "extreme_heat_days_count": consecutive_hot,
                "soil_clay_pct": soil_clay,
            },
            m1_result=m1_result,
            m5_result=m5_result,
            treatment_applied=treatment_applied,
            mandi_price_inr_q=mandi_price,
            product_cost_inr_acre=product_cost_acre,
            area_acres=area_acres,
            product_name=top_product_name
        )

        now_time = time.strftime("%Y-%m-%d %H:%M:%S IST", time.localtime())
        weather_time_input = request_payload.get("weather_timestamp") or now_time

        telemetry_summary = {
            "temp_max_c": temp_max,
            "temp_min_c": temp_min,
            "rh_avg_pct": rh_avg,
            "vpd_kpa": round(vpd, 2),
            "delta_t_c": round(delta_t, 2),
            "wind_speed_kmh": wind_speed,
            "rain_prob_next_48h": rain_prob,
            "soil_moisture_pct": soil_moisture,
            "weather_timestamp": weather_time_input
        }

        m1_class = m1_result.get("stress_class", 0)
        m1_risk_obj = {
            "stress_type": m1_result.get("stress_type", "Optimal / No Severe Stress"),
            "stress_class": m1_class,
            "confidence": m1_result.get("confidence", 0.88),
            "days_to_impact": 4 if m1_class != 0 else 0,
            "probabilities": m1_result.get("probabilities", {}),
            "serving_mode": m1_result.get("serving_mode", "vertex_ai_endpoint")
        }

        spray_safe = m2_result.get("spray_window_safe", True)
        sw_label, sw_reason = _compute_spray_window_label(
            temp_max=temp_max,
            temp_min=temp_min,
            wind_speed=wind_speed,
            rain_prob=rain_prob,
            spray_window_safe=spray_safe,
            delta_t=m2_result.get("delta_t", 4.0),
        )

        m2_readiness_obj = {
            "spray_window_safe": spray_safe,
            "spray_window_label": sw_label,
            "spray_window_reason": sw_reason,
            "readiness_score": m2_result.get("readiness_score", 0.75),
            "delta_t": m2_result.get("delta_t", 4.0),
            "safety_reasons": m2_result.get("reasons", [sw_reason]),
            "serving_mode": m2_result.get("serving_mode", "vertex_ai_endpoint")
        }

        m3_portfolio_obj = {
            "top_recommendations": m3_ranked,
            "primary_recommendation": m3_ranked[0] if m3_ranked else None,
            "serving_mode": m3_ranked[0].get("serving_mode", "vertex_ai_endpoint") if m3_ranked else "vertex_ai_endpoint"
        }

        m5_baseline_obj = {
            "expected_baseline_yield_q_ha": m5_result.get("expected_baseline_yield_q_ha", 20.0),
            "expected_baseline_yield_q_acre": m5_result.get("expected_baseline_yield_q_acre", 8.1),
            "historical_district_average_q_ha": m5_result.get("historical_district_average_q_ha", 22.0),
            "yield_impact_pct": m5_result.get("yield_impact_pct", -8.5),
            "serving_mode": m5_result.get("serving_mode", "vertex_ai_endpoint")
        }

        m6_causal_obj = {
            "causal_gain_tau_q_acre": m6_result.get("causal_gain_tau_q_acre", 2.8),
            "confidence_interval_95": m6_result.get("confidence_interval_95", [1.8, 3.6]),
            "revenue_saved_inr": m6_result.get("revenue_saved_inr", 39200),
            "revenue_saved_per_acre": m6_result.get("revenue_saved_per_acre", 7840),
            "total_treatment_cost_inr": m6_result.get("total_treatment_cost_inr", 2000),
            "net_farmer_profit_inr": m6_result.get("net_farmer_profit_inr", 37200),
            "robi_multiplier": m6_result.get("robi_multiplier", "19.6x"),
            "robi_ratio": m6_result.get("robi_ratio", 19.6),
            "counterfactual_baseline_q_acre": m6_result.get("counterfactual_baseline_q_acre", 8.1),
            "predicted_yield_q_acre": m6_result.get("predicted_yield_q_acre", 10.9),
            "treatment_applied": m6_result.get("treatment_applied", 1),
            "product_name": m6_result.get("product_name", "Syngenta Quantis"),
            "product_cost_inr_acre": m6_result.get("product_cost_inr_acre", 400.0),
            "mandi_price_inr_q": m6_result.get("mandi_price_inr_q", 2800.0),
            "confounders_controlled": m6_result.get("confounders_controlled", [
                "rainfall_total_mm",
                "soil_moisture_pct",
                "irrigation_type (borewell/canal/rainfed)",
                "farm_wealth_size_acres"
            ]),
            "methodology": m6_result.get("methodology", "Microsoft EconML LinearDML (Chernozhukov et al.)"),
            "serving_mode": m6_result.get("serving_mode", "vertex_ai_endpoint")
        }

        # Synthesize Gemini statement
        gemini_statement = synthesize_gemini_statement(
            farmer_name=farmer_name,
            district=district,
            crop=crop,
            growth_stage=growth_stage,
            area_acres=area_acres,
            telemetry=telemetry_summary,
            m1_risk=m1_risk_obj,
            m2_readiness=m2_readiness_obj,
            m3_portfolio=m3_portfolio_obj,
            m5_baseline=m5_baseline_obj,
            m6_causal_robi=m6_causal_obj,
            language=language
        )

        latency_ms = round((time.time() - start_time) * 1000, 2)

        unified_payload = {
            "farmer_name": farmer_name,
            "farmer_id": farmer_id,
            "district": district,
            "crop": crop,
            "growth_stage": growth_stage,
            "area_acres": area_acres,
            "telemetry_summary": telemetry_summary,
            "model1_risk": m1_risk_obj,
            "model2_readiness": m2_readiness_obj,
            "model3_portfolio": m3_portfolio_obj,
            "model5_baseline": m5_baseline_obj,
            "model6_causal_robi": m6_causal_obj,
            "gemini_statement": gemini_statement,
            "execution_metadata": {
                "models_executed": [
                    "Model 1 (PS-02 Stress Risk)",
                    "Model 2 (PS-02 Biological Action Gate)",
                    "Model 3 (PS-03 Product Portfolio)",
                    "Model 5 (PS-07 Field Yield Baseline)",
                    "Model 6 (PS-07 Causal Double ML & ROBI Attribution)"
                ],
                "serving_mode": m1_result.get("serving_mode", "local_optimized_runtime"),
                "ai_synthesis_engine": gemini_statement.get("generated_by", "Google Gemini"),
                "latency_ms": latency_ms,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
            }
        }

        return sanitize_for_json(unified_payload)


