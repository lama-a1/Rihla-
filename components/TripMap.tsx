"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import { LatLng, RecommendedPlace } from "@/lib/types";
import { useLang } from "@/lib/i18n";

// Free fallback map: Leaflet + OpenStreetMap/CARTO tiles, no API key needed.
// Used automatically when NEXT_PUBLIC_GOOGLE_MAPS_KEY isn't set (see
// components/MapPanel.tsx), so the map always works during judging even
// without a Google Maps Platform key configured.

const CATEGORY_COLOR: Record<string, string> = {
  history: "#D4A24C",
  nature: "#2FB8A6",
  food: "#C9714A",
  culture: "#D4A24C",
  photography: "#2FB8A6",
  shopping: "#9BA0B4",
  general: "#9BA0B4",
};

export function TripMap({
  places,
  selectedPlaceId,
  userLocation,
  onSelect,
}: {
  places: RecommendedPlace[];
  selectedPlaceId?: string | null;
  userLocation?: LatLng | null;
  onSelect?: (place: RecommendedPlace) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const { lang } = useLang();

  useEffect(() => {
    if (!containerRef.current || places.length === 0) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const center: [number, number] = [places[0].lat, places[0].lng];
      const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true }).setView(center, 12);
      mapRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      const bounds: [number, number][] = [];

      if (userLocation) {
        bounds.push([userLocation.lat, userLocation.lng]);
        const youIcon = L.divIcon({
          className: "",
          html: `<div style="width:16px;height:16px;border-radius:9999px;background:#2FB8A6;border:3px solid #12141C;box-shadow:0 0 0 4px rgba(47,184,166,0.3);"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        L.marker([userLocation.lat, userLocation.lng], { icon: youIcon })
          .addTo(map)
          .bindPopup(lang === "ar" ? "موقعك" : "Your location");
      }

      places.forEach((place, i) => {
        bounds.push([place.lat, place.lng]);
        const color = CATEGORY_COLOR[place.category] ?? "#D4A24C";
        const isActive = place.id === selectedPlaceId;

        const icon = L.divIcon({
          className: "",
          html: `<div style="
              width:${isActive ? 30 : 22}px;height:${isActive ? 30 : 22}px;
              border-radius:9999px;background:${color};
              display:flex;align-items:center;justify-content:center;
              font-size:11px;font-weight:700;color:#12141C;
              border:2px solid #12141C;
              box-shadow:0 0 0 ${isActive ? 4 : 2}px rgba(47,184,166,${isActive ? 0.35 : 0.15});
            ">${i + 1}</div>`,
          iconSize: [isActive ? 30 : 22, isActive ? 30 : 22],
          iconAnchor: [isActive ? 15 : 11, isActive ? 15 : 11],
        });

        const name = lang === "ar" && place.nameAr ? place.nameAr : place.name;
        const marker = L.marker([place.lat, place.lng], { icon }).addTo(map).bindPopup(`<strong>${name}</strong>`);
        if (onSelect) marker.on("click", () => onSelect(place));
      });

      if (userLocation && selectedPlaceId) {
        const dest = places.find((p) => p.id === selectedPlaceId);
        if (dest) {
          L.polyline(
            [
              [userLocation.lat, userLocation.lng],
              [dest.lat, dest.lng],
            ],
            { color: "#2FB8A6", weight: 2, opacity: 0.7, dashArray: "4 6" }
          ).addTo(map);
        }
      }

      if (bounds.length > 0) {
        map.fitBounds(bounds as any, { padding: [30, 30], maxZoom: 14 });
      }
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(places.map((p) => [p.id, p.lat, p.lng])), selectedPlaceId, JSON.stringify(userLocation), lang]);

  if (places.length === 0) return null;

  return <div ref={containerRef} className="h-64 sm:h-80 w-full rounded-xl2 overflow-hidden border border-night-line" />;
}
