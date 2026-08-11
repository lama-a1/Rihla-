"use client";

import { useEffect, useRef } from "react";
import { LatLng, RecommendedPlace } from "@/lib/types";
import { useLang } from "@/lib/i18n";

// Loads the Google Maps JavaScript API via a script tag using the
// browser-exposed key (NEXT_PUBLIC_GOOGLE_MAPS_KEY). That key must be
// restricted by HTTP referrer in Google Cloud Console — see README.md.
// This component is only rendered by MapPanel.tsx when that key is set;
// otherwise the free Leaflet fallback (components/TripMap.tsx) is used.

declare global {
  interface Window {
    google?: any;
    __rihlaGoogleMapsLoading?: Promise<void>;
  }
}

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (window.google?.maps) return Promise.resolve();
  if (window.__rihlaGoogleMapsLoading) return window.__rihlaGoogleMapsLoading;

  window.__rihlaGoogleMapsLoading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps JS API"));
    document.head.appendChild(script);
  });
  return window.__rihlaGoogleMapsLoading;
}

const CATEGORY_COLOR: Record<string, string> = {
  history: "#D4A24C",
  nature: "#2FB8A6",
  food: "#C9714A",
  culture: "#D4A24C",
  photography: "#2FB8A6",
  shopping: "#9BA0B4",
  general: "#9BA0B4",
};

export function GoogleMapView({
  apiKey,
  places,
  selectedPlaceId,
  userLocation,
  onSelect,
}: {
  apiKey: string;
  places: RecommendedPlace[];
  selectedPlaceId?: string | null;
  userLocation?: LatLng | null;
  onSelect?: (place: RecommendedPlace) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const directionsRendererRef = useRef<any>(null);
  const { lang } = useLang();

  useEffect(() => {
    let cancelled = false;
    if (!containerRef.current || places.length === 0) return;

    loadGoogleMaps(apiKey).then(() => {
      if (cancelled || !containerRef.current || !window.google) return;
      const g = window.google;

      if (!mapRef.current) {
        mapRef.current = new g.maps.Map(containerRef.current, {
          center: { lat: places[0].lat, lng: places[0].lng },
          zoom: 12,
          disableDefaultUI: false,
          styles: DARK_MAP_STYLE,
        });
      }
      const map = mapRef.current;

      // Clear old markers before redrawing
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      const bounds = new g.maps.LatLngBounds();

      if (userLocation) {
        const youMarker = new g.maps.Marker({
          position: userLocation,
          map,
          title: lang === "ar" ? "موقعك" : "Your location",
          icon: {
            path: g.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#2FB8A6",
            fillOpacity: 1,
            strokeColor: "#12141C",
            strokeWeight: 3,
          },
        });
        markersRef.current.push(youMarker);
        bounds.extend(userLocation);
      }

      places.forEach((place, i) => {
        const isActive = place.id === selectedPlaceId;
        const marker = new g.maps.Marker({
          position: { lat: place.lat, lng: place.lng },
          map,
          label: {
            text: String(i + 1),
            color: "#12141C",
            fontSize: "11px",
            fontWeight: "700",
          },
          icon: {
            path: g.maps.SymbolPath.CIRCLE,
            scale: isActive ? 15 : 11,
            fillColor: CATEGORY_COLOR[place.category] ?? "#D4A24C",
            fillOpacity: 1,
            strokeColor: "#12141C",
            strokeWeight: 2,
          },
        });
        marker.addListener("click", () => onSelect?.(place));
        markersRef.current.push(marker);
        bounds.extend({ lat: place.lat, lng: place.lng });
      });

      if (!bounds.isEmpty()) map.fitBounds(bounds, 40);

      // Draw a route to the selected destination, if we have both ends.
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
      const destination = places.find((p) => p.id === selectedPlaceId);
      if (userLocation && destination) {
        const directionsService = new g.maps.DirectionsService();
        const renderer = new g.maps.DirectionsRenderer({
          map,
          suppressMarkers: true,
          polylineOptions: { strokeColor: "#2FB8A6", strokeOpacity: 0.8, strokeWeight: 3 },
        });
        directionsRendererRef.current = renderer;
        directionsService.route(
          {
            origin: userLocation,
            destination: { lat: destination.lat, lng: destination.lng },
            travelMode: g.maps.TravelMode.DRIVING,
          },
          (result: any, status: string) => {
            if (status === "OK") renderer.setDirections(result);
          }
        );
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, JSON.stringify(places.map((p) => [p.id, p.lat, p.lng])), selectedPlaceId, JSON.stringify(userLocation), lang]);

 return <div ref={containerRef} className="h-80 sm:h-[28rem] w-full rounded-xl2 overflow-hidden border border-night-line" />;
}

// A muted dark theme so the real Google map matches the rest of the UI.
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1B1E2B" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1B1E2B" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9BA0B4" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2E3346" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#12141C" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
];
