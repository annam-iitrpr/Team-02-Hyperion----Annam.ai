"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Layers,
  Trash2,
  RotateCcw,
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  MapPin,
  Sparkles,
  Tractor,
  Home,
  Navigation,
  X,
  Undo2,
} from "lucide-react";

interface RealBoundaryMapProps {
  center: [number, number];
  zoom?: number;
  initialPoints?: Array<[number, number]>;
  onBoundaryChange: (points: Array<[number, number]>, calculatedAcres: number) => void;
  onCenterChange?: (newCenter: [number, number]) => void;
}

// Precise Geodesic Polygon Area Calculation in Acres and Hectares
export function calculatePolygonAreaAcres(coords: Array<[number, number]>): number {
  if (!coords || coords.length < 3) return 0;

  const R = 6378137; // Earth's mean radius in meters
  let area = 0;

  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    const lat1 = (coords[i][0] * Math.PI) / 180;
    const lat2 = (coords[j][0] * Math.PI) / 180;
    const lon1 = (coords[i][1] * Math.PI) / 180;
    const lon2 = (coords[j][1] * Math.PI) / 180;

    area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = Math.abs((area * R * R) / 2.0); // m²
  const acres = area * 0.000247105; // 1 m² = 0.000247105 acres
  return +acres.toFixed(2);
}

export function RealBoundaryMap({
  center,
  zoom = 16,
  initialPoints,
  onBoundaryChange,
  onCenterChange,
}: RealBoundaryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileGroupRef = useRef<L.LayerGroup | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [mapType, setMapType] = useState<"satellite" | "streets">("satellite");
  const [currentZoom, setCurrentZoom] = useState<number>(zoom);
  const [currentCenter, setCurrentCenter] = useState<[number, number]>(center);

  // Initialize initial points around center if not given
  const [points, setPoints] = useState<Array<[number, number]>>(() => {
    if (initialPoints && initialPoints.length >= 3) return initialPoints;
    return [
      [center[0] + 0.0012, center[1] - 0.0015],
      [center[0] + 0.0015, center[1] + 0.0018],
      [center[0] - 0.0011, center[1] + 0.0014],
      [center[0] - 0.0014, center[1] - 0.0012],
    ];
  });

  const isProgrammaticMoveRef = useRef(false);
  const lastReportedCenterRef = useRef<[number, number]>(center);

  const centerLat = center?.[0] ?? 23.2032;
  const centerLng = center?.[1] ?? 77.0844;

  const onBoundaryChangeRef = useRef(onBoundaryChange);
  onBoundaryChangeRef.current = onBoundaryChange;

  const onCenterChangeRef = useRef(onCenterChange);
  onCenterChangeRef.current = onCenterChange;

  // Safe boundary notifier that always defers to next tick, preventing React cross-component setState-in-render warnings
  const notifyBoundaryChange = (newPts: Array<[number, number]>, calculatedAcres?: number) => {
    const acres = calculatedAcres !== undefined ? calculatedAcres : calculatePolygonAreaAcres(newPts);
    setTimeout(() => {
      onBoundaryChangeRef.current?.(newPts, acres);
    }, 0);
  };

  // Sync when initialPoints changes from outside
  useEffect(() => {
    if (initialPoints && initialPoints.length >= 3) {
      const isIdentical =
        points.length === initialPoints.length &&
        points.every(
          (pt, i) =>
            Math.abs(pt[0] - initialPoints[i][0]) < 0.00001 &&
            Math.abs(pt[1] - initialPoints[i][1]) < 0.00001
        );

      if (!isIdentical) {
        setPoints(initialPoints);
        notifyBoundaryChange(initialPoints);

        const map = mapInstanceRef.current;
        if (map) {
          try {
            isProgrammaticMoveRef.current = true;
            const bounds = L.latLngBounds(initialPoints);
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 18 });
          } catch (e) {
            // ignore
          }
        }
      }
    }
  }, [initialPoints]);

  // 1. Initial Mount: Trigger area sync safely on next tick
  useEffect(() => {
    const activePts = initialPoints && initialPoints.length >= 3 ? initialPoints : points;
    notifyBoundaryChange(activePts);
  }, []);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;

    if ((containerRef.current as any)._leaflet_id) {
      delete (containerRef.current as any)._leaflet_id;
    }

    const safeLat = centerLat;
    const safeLon = centerLng;

    const map = L.map(containerRef.current, {
      center: [safeLat, safeLon],
      zoom: zoom,
      minZoom: 4,
      maxZoom: 20,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;
    tileGroupRef.current = L.layerGroup().addTo(map);
    markersGroupRef.current = L.layerGroup().addTo(map);

    // Track View Movement (when farmer pans/drags map looking for their field from home)
    map.on("moveend", () => {
      const c = map.getCenter();
      const z = map.getZoom();

      // Deduplicate local HUD state updates
      setCurrentCenter((prev) => {
        if (Math.abs(prev[0] - c.lat) < 0.00005 && Math.abs(prev[1] - c.lng) < 0.00005) return prev;
        return [c.lat, c.lng];
      });
      setCurrentZoom((prev) => (prev === z ? prev : z));

      // If move was programmatic (e.g. external prop change, fitBounds), do not echo back to parent
      if (isProgrammaticMoveRef.current) {
        isProgrammaticMoveRef.current = false;
        return;
      }

      // Only notify parent if user drag shifted the center significantly (> 0.0002 deg)
      if (
        Math.abs(lastReportedCenterRef.current[0] - c.lat) > 0.0002 ||
        Math.abs(lastReportedCenterRef.current[1] - c.lng) > 0.0002
      ) {
        lastReportedCenterRef.current = [c.lat, c.lng];
        if (onCenterChangeRef.current) {
          onCenterChangeRef.current([c.lat, c.lng]);
        }
      }
    });

    // Map Click: Add new boundary point
    map.on("click", (e: L.LeafletMouseEvent) => {
      const newPt: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPoints((prev) => {
        let updated: Array<[number, number]>;
        if (prev.length >= 8) {
          updated = [newPt];
        } else {
          updated = [...prev, newPt];
        }
        notifyBoundaryChange(updated);
        return updated;
      });
    });

    // Invalidate size on mount and container visibility changes
    setTimeout(() => map.invalidateSize({ animate: false }), 100);
    setTimeout(() => map.invalidateSize({ animate: false }), 400);

    let resizeObs: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      resizeObs = new ResizeObserver(() => {
        map.invalidateSize({ animate: false });
      });
      resizeObs.observe(containerRef.current);
    }

    return () => {
      if (resizeObs) resizeObs.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 3. Base Tile Layers (Google Satellite Hybrid vs OpenStreetMap)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = tileGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (mapType === "satellite") {
      const googleSat = L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
      });
      group.addLayer(googleSat);
    } else {
      const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      });
      group.addLayer(osm);
    }
  }, [mapType]);

  // 4. Center update from outside (scalar primitive dependency)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const cur = map.getCenter();
    if (Math.abs(cur.lat - centerLat) > 0.0003 || Math.abs(cur.lng - centerLng) > 0.0003) {
      isProgrammaticMoveRef.current = true;
      map.setView([centerLat, centerLng], map.getZoom(), { animate: false });
      map.invalidateSize({ animate: false });
      setCurrentCenter((prev) => {
        if (Math.abs(prev[0] - centerLat) < 0.00005 && Math.abs(prev[1] - centerLng) < 0.00005) return prev;
        return [centerLat, centerLng];
      });
      lastReportedCenterRef.current = [centerLat, centerLng];
    }
  }, [centerLat, centerLng]);

  // Navigation helpers for farmers sitting at home
  const panMapByOffset = (dLat: number, dLon: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const cur = map.getCenter();
    const target: [number, number] = [cur.lat + dLat, cur.lng + dLon];
    map.flyTo(target, map.getZoom(), { duration: 0.8 });
  };

  const handleFlyToFarmlandOutskirts = () => {
    panMapByOffset(0.018, 0.018);
  };

  // ── Individual Pointers Removal & Management ────────
  const handleRemovePoint = (indexToRemove: number) => {
    setPoints((prev) => {
      const next = prev.filter((_, i) => i !== indexToRemove);
      notifyBoundaryChange(next);
      return next;
    });
  };

  const handleUndoLastPoint = () => {
    setPoints((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.slice(0, prev.length - 1);
      notifyBoundaryChange(next);
      return next;
    });
  };

  const handleRemovePointRef = useRef(handleRemovePoint);
  handleRemovePointRef.current = handleRemovePoint;

  // 5. Update Polygon & Vertex Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }

    if (points.length >= 3) {
      const polygon = L.polygon(points, {
        color: "#2d6a4f",
        weight: 3,
        dashArray: "6, 4",
        fillColor: "#52b788",
        fillOpacity: 0.28,
      }).addTo(map);

      polygonLayerRef.current = polygon;
    }

    // Add vertex markers with interactive delete capability
    points.forEach((pt, idx) => {
      const customIcon = L.divIcon({
        className: "custom-field-pin",
        html: `
          <div style="
            background: #1b4332;
            color: #ffffff;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 2.5px solid #ffffff;
            box-shadow: 0 4px 14px rgba(27, 67, 50, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 900;
            font-family: monospace;
            cursor: pointer;
            position: relative;
            transition: transform 0.15s ease;
          " title="Corner P${idx + 1} - Tap to delete or drag to adjust">
            P${idx + 1}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker(pt, {
        icon: customIcon,
        draggable: true,
        title: `Corner P${idx + 1} (Tap to remove or drag to adjust)`,
      });

      marker.on("dragend", (e: any) => {
        const newPos = e.target.getLatLng();
        setPoints((prev) => {
          const next = [...prev];
          next[idx] = [newPos.lat, newPos.lng];
          notifyBoundaryChange(next);
          return next;
        });
      });

      // Interactive popup with Delete button for mobile phones & desktop
      const popupDiv = document.createElement("div");
      popupDiv.style.textAlign = "center";
      popupDiv.style.fontFamily = "system-ui, -apple-system, sans-serif";
      popupDiv.style.padding = "4px 2px";
      popupDiv.style.minWidth = "140px";
      popupDiv.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 4px; margin-bottom: 3px;">
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #2d6a4f;"></span>
          <span style="font-weight: 800; font-size: 13px; color: #0d253d;">Corner P${idx + 1}</span>
        </div>
        <div style="font-size: 10px; color: #64748b; margin-bottom: 8px; font-family: monospace;">
          ${pt[0].toFixed(5)}°N, ${pt[1].toFixed(5)}°E
        </div>
        <button id="del-corner-btn-${idx}" style="
          width: 100%;
          background: #ef4444;
          color: #ffffff;
          border: none;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          box-shadow: 0 2px 6px rgba(239, 68, 68, 0.35);
        ">
          🗑️ Delete Corner P${idx + 1}
        </button>
        <div style="font-size: 9px; color: #94a3b8; margin-top: 4px;">
          (गलती से लगा कोना हटाएं)
        </div>
      `;

      popupDiv.querySelector(`#del-corner-btn-${idx}`)?.addEventListener("click", () => {
        map.closePopup();
        handleRemovePointRef.current(idx);
      });

      marker.bindPopup(popupDiv, { offset: [0, -14], closeButton: true });

      // Right-click directly removes the point on desktop
      marker.on("contextmenu", (e: any) => {
        if (e.originalEvent) {
          e.originalEvent.preventDefault();
          e.originalEvent.stopPropagation();
        }
        map.closePopup();
        handleRemovePointRef.current(idx);
      });

      markersGroup.addLayer(marker);
    });
  }, [points]);

  const calculatedAcres = calculatePolygonAreaAcres(points);

  const handleResetPointsToCurrentView = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const c = map.getCenter();
    const newPts: Array<[number, number]> = [
      [c.lat + 0.0012, c.lng - 0.0015],
      [c.lat + 0.0015, c.lng + 0.0018],
      [c.lat - 0.0011, c.lng + 0.0014],
      [c.lat - 0.0014, c.lng - 0.0012],
    ];
    setPoints(newPts);
    notifyBoundaryChange(newPts);
  };

  const handleClearPoints = () => {
    setPoints([]);
    notifyBoundaryChange([]);
  };

  return (
    <div className="space-y-3 select-none font-sans">
      {/* ── Farm Navigation Toolbar (Clean Stripe / Apple Light Theme) ──── */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#e8f5e9] text-[#2d6a4f] border border-emerald-200 shrink-0">
            <Tractor className="h-5 w-5" />
          </div>
          <div>
            <span className="font-extrabold text-[#0d253d] font-display block text-sm">
              At Home? Fly to Your Farm Land (घर बैठे खेत खोजें)
            </span>
            <span className="text-xs text-slate-500">
              Drag map or use buttons to navigate away from village settlement to green crop fields.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Fly to Outskirts Button */}
          <button
            type="button"
            onClick={handleFlyToFarmlandOutskirts}
            className="px-3.5 py-2 rounded-xl bg-[#1b4332] hover:bg-[#143326] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:opacity-95 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>Fly to Farm Fields (2km)</span>
          </button>

          {/* Directional Nudges */}
          <div className="flex items-center bg-[#f6f9fc] border border-[#e3e8ee] rounded-xl p-0.5 shadow-2xs">
            <button
              type="button"
              title="Pan North"
              onClick={() => panMapByOffset(0.01, 0)}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 hover:text-[#2d6a4f] transition-colors cursor-pointer"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Pan South"
              onClick={() => panMapByOffset(-0.01, 0)}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 hover:text-[#2d6a4f] transition-colors cursor-pointer"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Pan West"
              onClick={() => panMapByOffset(0, -0.01)}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 hover:text-[#2d6a4f] transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Pan East"
              onClick={() => panMapByOffset(0, 0.01)}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 hover:text-[#2d6a4f] transition-colors cursor-pointer"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Place Boundary in Current View */}
          <button
            type="button"
            onClick={handleResetPointsToCurrentView}
            className="px-3 py-2 rounded-xl bg-white border border-[#e3e8ee] hover:bg-slate-50 text-[#0d253d] text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <span>🎯 Place Boundary Here</span>
          </button>
        </div>
      </div>

      {/* Map Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-[#0d253d]">
            Live Satellite Boundary: <span className="text-[#2d6a4f] font-black">{calculatedAcres} Acres</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Map Layer Switcher */}
          <div className="flex bg-[#f6f9fc] p-0.5 rounded-xl border border-[#e3e8ee] text-xs">
            <button
              type="button"
              onClick={() => setMapType("satellite")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                mapType === "satellite"
                  ? "bg-white text-[#2d6a4f] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              🛰️ Satellite
            </button>
            <button
              type="button"
              onClick={() => setMapType("streets")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                mapType === "streets"
                  ? "bg-white text-[#2d6a4f] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              🗺️ Map
            </button>
          </div>

          {/* Undo Point Button */}
          <button
            type="button"
            disabled={points.length === 0}
            onClick={handleUndoLastPoint}
            className="text-xs text-slate-700 hover:text-[#2d6a4f] font-bold flex items-center gap-1 cursor-pointer bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl border border-slate-200 transition-colors disabled:opacity-40"
            title="Undo the last placed corner pin (पिछला कोना हटाएं)"
          >
            <Undo2 className="h-3.5 w-3.5" />
            <span>Undo (हटाएं)</span>
          </button>

          <button
            type="button"
            onClick={handleClearPoints}
            className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer bg-rose-50 px-2.5 py-1.5 rounded-xl border border-rose-200 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Real Map Container */}
      <div className="relative w-full h-[320px] sm:h-[400px] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#e3e8ee] shadow-sm bg-slate-900">
        <div ref={containerRef} className="w-full h-full z-0 cursor-crosshair" />

        {/* HUD Overlay Bar (Clean White Stripe Aesthetic) */}
        <div className="absolute bottom-2.5 sm:bottom-3.5 left-2.5 sm:left-3.5 right-2.5 sm:right-3.5 z-[500] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-white/95 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-[#e3e8ee] text-[#0d253d] text-xs font-mono shadow-xl pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="text-[#2d6a4f] font-extrabold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#2d6a4f]" />
              {points.length} Corners Locked
            </span>
            <span className="text-slate-400 hidden sm:inline">
              | Tap pin or [✕] below to delete accidental point
            </span>
          </div>

          <div className="font-black text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-xl border border-emerald-300 text-xs text-center sm:text-right">
            Calculated: {calculatedAcres} Acres ({(calculatedAcres * 0.4047).toFixed(2)} Ha)
          </div>
        </div>

        {/* GPS Coordinates Top Right */}
        <div className="absolute top-2.5 sm:top-3.5 right-2.5 sm:right-3.5 z-[500] bg-white/95 backdrop-blur-md text-[#0d253d] text-[10px] sm:text-[11px] font-mono font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-[#e3e8ee] shadow-sm pointer-events-none">
          📍 {currentCenter[0].toFixed(4)}°N, {currentCenter[1].toFixed(4)}°E
        </div>
      </div>

      {/* ── Interactive Corner Management Bar (Redesigned Sleek Toolbar) ──── */}
      {points.length > 0 && (
        <div className="px-3.5 py-2.5 bg-[#fbfcf8] border border-[#e8ede4] rounded-xl flex items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-x-auto py-0.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#2d6a4f]" />
              Active Corners ({points.length})
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {points.map((pt, idx) => (
                <div
                  key={`corner-chip-${idx}-${pt[0]}-${pt[1]}`}
                  className="group inline-flex items-center gap-1.5 pl-2 pr-1.5 py-0.5 rounded-lg bg-white border border-[#e2e8df] text-[#1b4332] font-mono text-[11px] font-bold shadow-2xs hover:border-rose-300 hover:bg-rose-50/50 transition-all"
                >
                  <span>P{idx + 1}</span>
                  <button
                    type="button"
                    title={`Delete Corner P${idx + 1}`}
                    onClick={() => handleRemovePoint(idx)}
                    className="p-0.5 rounded text-slate-400 group-hover:text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={points.length === 0}
            onClick={handleUndoLastPoint}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-white border border-[#e2e8df] hover:border-slate-300 text-slate-700 hover:text-[#1b4332] text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-40"
            title="Remove the last added corner point"
          >
            <Undo2 className="h-3.5 w-3.5 text-slate-500" />
            <span>Undo Last</span>
          </button>
        </div>
      )}
    </div>
  );
}
