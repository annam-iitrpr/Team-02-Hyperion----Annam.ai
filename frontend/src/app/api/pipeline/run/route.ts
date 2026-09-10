import { NextRequest, NextResponse } from "next/server";

// Vertex AI pipeline is served by the FastAPI backend.
// This route is a lean proxy — no ML logic lives here.

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

// District → coordinates for Open-Meteo live weather enrichment (per PDF spec)
const DISTRICT_COORDS: Record<string, { lat: number; lon: number }> = {
  kasganj:    { lat: 27.81, lon: 78.65 },
  bhopal:     { lat: 23.26, lon: 77.41 },
  indore:     { lat: 22.72, lon: 75.86 },
  punjab:     { lat: 30.90, lon: 75.86 },
  ludhiana:   { lat: 30.90, lon: 75.86 },
  vidarbha:   { lat: 20.93, lon: 77.75 },
  saurashtra: { lat: 21.52, lon: 70.45 },
  kurnool:    { lat: 15.83, lon: 78.04 },
  latur:      { lat: 18.41, lon: 76.56 },
  nashik:     { lat: 20.00, lon: 73.78 },
  pune:       { lat: 18.52, lon: 73.86 },
  nagpur:     { lat: 21.15, lon: 79.09 },
  amravati:   { lat: 20.93, lon: 77.75 },
  kolhapur:   { lat: 16.70, lon: 74.24 },
  jalgaon:    { lat: 21.01, lon: 75.56 },
  aurangabad: { lat: 19.88, lon: 75.34 },
  solapur:    { lat: 17.69, lon: 75.90 },
  sangli:     { lat: 16.86, lon: 74.57 },
  hyderabad:  { lat: 17.39, lon: 78.49 },
  warangal:   { lat: 18.00, lon: 79.59 },
  guntur:     { lat: 16.30, lon: 80.44 },
  mysore:     { lat: 12.30, lon: 76.65 },
  dharwad:    { lat: 15.46, lon: 75.01 },
  bellary:    { lat: 15.15, lon: 76.92 },
  jaipur:     { lat: 26.91, lon: 75.79 },
  jodhpur:    { lat: 26.29, lon: 73.02 },
  kota:       { lat: 25.18, lon: 75.83 },
  bikaner:    { lat: 28.01, lon: 73.32 },
  ahmedabad:  { lat: 23.02, lon: 72.57 },
  rajkot:     { lat: 22.30, lon: 70.80 },
  surat:      { lat: 21.17, lon: 72.83 },
  vadodara:   { lat: 22.31, lon: 73.18 },
  amritsar:   { lat: 31.63, lon: 74.87 },
  patiala:    { lat: 30.34, lon: 76.39 },
  chandigarh: { lat: 30.73, lon: 76.79 },
  agra:       { lat: 27.18, lon: 78.01 },
  varanasi:   { lat: 25.32, lon: 83.00 },
  allahabad:  { lat: 25.44, lon: 81.84 },
  meerut:     { lat: 28.99, lon: 77.71 },
  lucknow:    { lat: 26.85, lon: 80.95 },
  kanpur:     { lat: 26.46, lon: 80.33 },
  bareilly:   { lat: 28.35, lon: 79.42 },
  gorakhpur:  { lat: 26.76, lon: 83.37 },
};

/**
 * Fetch live weather telemetry from Open-Meteo (free, no key required).
 * Extracts exactly the features Model 1 and Model 2 need per the PDF spec.
 */
async function fetchLiveWeather(lat: number, lon: number): Promise<Record<string, number>> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,soil_moisture_0_to_1cm` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&timezone=Asia%2FKolkata&forecast_days=2`;

    const res = await fetch(url, { signal: AbortSignal.timeout(5000), cache: "no-store" });
    if (!res.ok) return {};
    const data = await res.json();

    const daily = data.daily || {};
    const hourly = data.hourly || {};

    const tempMax = daily.temperature_2m_max?.[0] ?? null;
    const tempMin = daily.temperature_2m_min?.[0] ?? null;
    // Use tomorrow's max rain probability for the 48h gate (per PDF spec)
    const rainProb = daily.precipitation_probability_max?.[1] ?? daily.precipitation_probability_max?.[0] ?? null;

    const rhArr: number[] = (hourly.relative_humidity_2m || []).slice(0, 24);
    const rhAvg = rhArr.length ? rhArr.reduce((a: number, b: number) => a + b, 0) / rhArr.length : null;

    const windArr: number[] = (hourly.wind_speed_10m || []).slice(0, 12);
    const windPeak = windArr.length ? Math.max(...windArr) : null;

    const soilArr: number[] = (hourly.soil_moisture_0_to_1cm || []).slice(0, 12);
    const soilMean = soilArr.length ? soilArr.reduce((a: number, b: number) => a + b, 0) / soilArr.length : null;
    // m³/m³ (0–0.5 range) → percent (multiply by 200 to get 0–100%)
    const soilPct = soilMean !== null ? Math.min(100, Math.round(soilMean * 200)) : null;

    const result: Record<string, number> = {};
    if (tempMax !== null)   result.temp_max_c       = Math.round(tempMax * 10) / 10;
    if (tempMin !== null)   result.temp_min_c       = Math.round(tempMin * 10) / 10;
    if (rhAvg !== null)     result.rh_avg_pct       = Math.round(rhAvg);
    if (windPeak !== null)  result.wind_speed_kmh   = Math.round(windPeak * 10) / 10;
    if (rainProb !== null)  result.rain_prob_pct    = Math.round(rainProb);
    if (soilPct !== null)   result.soil_moisture_pct = soilPct;
    return result;
  } catch {
    return {};
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, any> = {};
  try { body = await req.json(); } catch { body = {}; }

  // Resolve coordinates from district name
  const district = (body.district || body.region || "kasganj").toLowerCase().trim();
  const coords = DISTRICT_COORDS[district] || DISTRICT_COORDS.kasganj;
  const lat = typeof body.lat === "number" ? body.lat : coords.lat;
  const lon = typeof body.lon === "number" ? body.lon : coords.lon;

  // Fetch live weather if the caller didn't provide it
  let weatherEnrichment: Record<string, number> = {};
  if (body.temp_max_c == null || body.rh_avg_pct == null) {
    weatherEnrichment = await fetchLiveWeather(lat, lon);
  }

  // Build enriched payload: live weather first, then caller overrides on top
  const enrichedBody = { ...weatherEnrichment, ...body, lat, lon };

  try {
    const response = await fetch(`${FASTAPI_URL}/api/pipeline/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enrichedBody),
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Backend pipeline error ${response.status}`, details: errText },
        { status: response.status }
      );
    }

    const data = await response.json();
    // Annotate so the frontend knows this is a live Vertex AI response
    data.execution_source = "Google Cloud Vertex AI (asia-south1, iitm01)";
    data.weather_live = Object.keys(weatherEnrichment).length > 0;
    data.weather_coords = { lat, lon };
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json(
      {
        error: "FastAPI ML Pipeline unreachable. Start the backend with: python -m uvicorn app.main:app --port 8000",
        details: error?.message,
        fastapi_url: FASTAPI_URL,
      },
      { status: 503 }
    );
  }
}
