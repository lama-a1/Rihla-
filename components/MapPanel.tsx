"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { CITY_CENTERS, CITY_NAMES_AR, findNearestCity } from "@/lib/mockData";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

// Real Google Maps (Phase 4) when NEXT_PUBLIC_GOOGLE_MAPS_KEY is configured;
// otherwise the free Leaflet/OpenStreetMap fallback (components/TripMap.tsx)
// so the map always works, even without a Google Maps Platform key.
const GoogleMapView = dynamic(() => import("./GoogleMapView").then((m) => m.GoogleMapView), { ssr: false });
const TripMap = dynamic(() => import("./TripMap").then((m) => m.TripMap), { ssr: false });

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

export function MapPanel() {
  const { lang, t } = useLang();
  const { city, recommendations, selectedPlaceId, userLocation, directions, setUserLocation, selectPlace, setDirections, setCity } =
    useApp();

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        // Default city = real location, unless the user has explicitly
        // named a different city in chat (setCity respects that priority).
        setCity(findNearestCity(loc));
      },
      () => {
        // Permission denied or unavailable — fall back to the city center so
        // route/distance features still work in the demo.
        const center = CITY_CENTERS[city] ?? CITY_CENTERS.Riyadh;
        setUserLocation(center);
      },
      { timeout: 6000 }
    );
  };

  // Fetch route + distance + ETA whenever a destination is selected and we
  // have an origin (real user location or the city-center fallback).
  useEffect(() => {
    const destination = recommendations.find((p) => p.id === selectedPlaceId);
    if (!destination) return;
    const origin = userLocation ?? CITY_CENTERS[city] ?? CITY_CENTERS.Riyadh;

    let cancelled = false;
    fetch("/api/directions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin, destination: { lat: destination.lat, lng: destination.lng }, mode: "driving", lang }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setDirections(data);
      })
      .catch(() => {
        /* non-critical for the map itself */
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlaceId]);

  const effectiveLocation = userLocation ?? null;

  return (
    <Card className="p-5 flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-lg text-ink">{lang === "ar" ? "الخريطة" : "Map"}</h2>
        <Button variant="outline" onClick={useMyLocation} className="px-3 py-1.5 text-xs">
          📍 {t("useMyLocation")}
        </Button>
      </div>
      <p className="text-xs text-ink-faint mb-4">
        {lang === "ar" ? `${CITY_NAMES_AR[city] ?? city}، السعودية` : `${city}, Saudi Arabia`}
      </p>

      {recommendations.length === 0 ? (
        <div className="h-64 sm:h-80 rounded-xl2 border border-dashed border-night-line bg-night-soft flex items-center justify-center text-center px-6">
          <p className="text-sm text-ink-faint">
            {lang === "ar" ? "اسأل رحلة عن مكان لتظهر النقاط هنا" : "Ask Rihla for a place to see pins here"}
          </p>
        </div>
      ) : GOOGLE_MAPS_KEY ? (
        <GoogleMapView
          apiKey={GOOGLE_MAPS_KEY}
          places={recommendations}
          selectedPlaceId={selectedPlaceId}
          userLocation={effectiveLocation}
          onSelect={(p) => selectPlace(p.id)}
        />
      ) : (
        <TripMap
          places={recommendations}
          selectedPlaceId={selectedPlaceId}
          userLocation={effectiveLocation}
          onSelect={(p) => selectPlace(p.id)}
        />
      )}
    </Card>
  );
}
