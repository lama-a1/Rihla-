"use client";

// App-wide client state for the single-page, chat-driven Rihla experience.
// Kept deliberately separate from the AI (lib/gemini.ts, lib/dna.ts), Maps,
// and Places logic — this file only holds state and simple setters so the
// UI layer can be redesigned freely without touching any of that.

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { DEFAULT_DNA } from "./dna";
import { DirectionsResult, DNAChangeLogEntry, DNASignals, IntentFilters, LatLng, PlaceRating, RecommendedPlace, TravelDNA } from "./types";
import { applyDNASignals as applyDNASignalsPure } from "./dna";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
}

export interface LastIntent {
  category: string;
  filters: IntentFilters;
}

interface AppState {
  dna: TravelDNA;
  messages: ChatMessage[];
  city: string;
  cityManuallySet: boolean;
  recommendations: RecommendedPlace[];
  selectedPlaceId: string | null;
  userLocation: LatLng | null;
  directions: DirectionsResult | null;
  lastDNAChange: DNAChangeLogEntry[] | null;
  lastIntent: LastIntent | null;
  ratedPlaceIds: string[];
  placeRatings: Record<string, PlaceRating>;
  mobilityNeeds: string;
}

interface AppContextValue extends AppState {
  setDNA: (dna: TravelDNA) => void;
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  setRecommendations: (places: RecommendedPlace[]) => void;
  appendRecommendations: (places: RecommendedPlace[]) => void;
  selectPlace: (id: string | null) => void;
  setUserLocation: (loc: LatLng | null) => void;
  setDirections: (d: DirectionsResult | null) => void;
  nudgeDNA: (signals: DNASignals, reason: string) => DNAChangeLogEntry[];
  setLastIntent: (intent: LastIntent | null) => void;
  markPlaceRated: (placeId: string) => void;
  ratePlace: (placeId: string, rating: PlaceRating) => void;
  setMobilityNeeds: (needs: string) => void;
  setCity: (city: string, manual?: boolean) => void;
  reset: () => void;
}

const STORAGE_KEY = "rihla_app_state_v3";

const emptyState: AppState = {
  dna: DEFAULT_DNA,
  messages: [],
  city: "Riyadh",
  cityManuallySet: false,
  recommendations: [],
  selectedPlaceId: null,
  userLocation: null,
  directions: null,
  lastDNAChange: null,
  lastIntent: null,
  ratedPlaceIds: [],
  placeRatings: {},
  mobilityNeeds: "",
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(emptyState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState((s) => ({ ...s, ...JSON.parse(raw) }));
    } catch {
      // ignore corrupt local storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const setDNA = useCallback((dna: TravelDNA) => setState((s) => ({ ...s, dna })), []);

  const addMessage = useCallback((message: Omit<ChatMessage, "id" | "timestamp">) => {
    setState((s) => ({
      ...s,
      messages: [
        ...s.messages,
        { ...message, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, timestamp: Date.now() },
      ],
    }));
  }, []);

  const setRecommendations = useCallback(
    (places: RecommendedPlace[]) => setState((s) => ({ ...s, recommendations: places, selectedPlaceId: null, directions: null })),
    []
  );

  const appendRecommendations = useCallback(
    (places: RecommendedPlace[]) =>
      setState((s) => {
        const existingIds = new Set(s.recommendations.map((p) => p.id));
        const merged = [...s.recommendations, ...places.filter((p) => !existingIds.has(p.id))];
        return { ...s, recommendations: merged };
      }),
    []
  );

  const selectPlace = useCallback((id: string | null) => setState((s) => ({ ...s, selectedPlaceId: id, directions: null })), []);

  const setUserLocation = useCallback((loc: LatLng | null) => setState((s) => ({ ...s, userLocation: loc })), []);

  const setDirections = useCallback((d: DirectionsResult | null) => setState((s) => ({ ...s, directions: d })), []);

  const setLastIntent = useCallback((intent: LastIntent | null) => setState((s) => ({ ...s, lastIntent: intent })), []);

  const markPlaceRated = useCallback(
    (placeId: string) =>
      setState((s) => (s.ratedPlaceIds.includes(placeId) ? s : { ...s, ratedPlaceIds: [...s.ratedPlaceIds, placeId] })),
    []
  );

  // Stores the full rating detail (stars + optional reason) alongside the
  // existing ratedPlaceIds gate — kept as a separate action so callers that
  // only need the quick "already rated?" check don't need to touch this.
  const ratePlace = useCallback(
    (placeId: string, rating: PlaceRating) =>
      setState((s) => ({
        ...s,
        ratedPlaceIds: s.ratedPlaceIds.includes(placeId) ? s.ratedPlaceIds : [...s.ratedPlaceIds, placeId],
        placeRatings: { ...s.placeRatings, [placeId]: rating },
      })),
    []
  );

  const setMobilityNeeds = useCallback((needs: string) => setState((s) => ({ ...s, mobilityNeeds: needs })), []);

  const setCity = useCallback(
    (city: string, manual = false) =>
      setState((s) => (manual ? { ...s, city, cityManuallySet: true } : s.cityManuallySet ? s : { ...s, city })),
    []
  );

  const nudgeDNA = useCallback((signals: DNASignals, reason: string) => {
    let changeLog: DNAChangeLogEntry[] = [];
    setState((s) => {
      const result = applyDNASignalsPure(s.dna, signals, reason);
      changeLog = result.changeLog;
      return { ...s, dna: result.dna, lastDNAChange: result.changeLog.length > 0 ? result.changeLog : s.lastDNAChange };
    });
    return changeLog;
  }, []);

  const reset = useCallback(() => {
    setState(emptyState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AppContext.Provider
      value={{ ...state, setDNA, addMessage, setRecommendations, appendRecommendations, selectPlace, setUserLocation, setDirections, nudgeDNA, setLastIntent, markPlaceRated, ratePlace, setMobilityNeeds, setCity, reset }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
