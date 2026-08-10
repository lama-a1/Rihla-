"use client";

import { useEffect, useRef } from "react";
import { useApp } from "@/lib/store";
import { findNearestCity } from "@/lib/mockData";

// Runs once on mount. If the browser grants location access (or already
// has), the default city becomes wherever the user actually is — not a
// hardcoded "Riyadh". An explicit city mentioned in chat always overrides
// this (see setCity's `manual` flag in lib/store.tsx), and if permission is
// denied or unavailable, the city simply stays at its current value.
// Renders nothing — this is a background effect only.

export function AutoLocateCity() {
  const { setUserLocation, setCity } = useApp();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setCity(findNearestCity(loc)); // non-manual — a chat-mentioned city still wins
      },
      () => {
        /* permission denied or unavailable — keep the default city */
      },
      { timeout: 6000 }
    );
  }, [setUserLocation, setCity]);

  return null;
}
