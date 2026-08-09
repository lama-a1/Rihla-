import { NextRequest, NextResponse } from "next/server";
import { estimateDirections } from "@/lib/mockData";
import { DirectionsResult, LatLng } from "@/lib/types";

interface Body {
  origin: LatLng;
  destination: LatLng;
  mode?: "walking" | "driving";
  lang?: "en" | "ar";
}

// MVP scope: route + distance + estimated travel time only — no turn-by-turn
// navigation. Falls back to a straight-line + speed estimate (lib/mockData.ts)
// if the Directions API key is missing or the call fails. Both paths return
// distance/duration text already localized to `lang`.

export async function POST(req: NextRequest) {
  const { origin, destination, mode = "driving", lang = "en" }: Body = await req.json();
  const serverKey = process.env.GOOGLE_MAPS_SERVER_KEY;

  if (serverKey) {
    try {
      const result = await fetchGoogleDirections(origin, destination, mode, lang, serverKey);
      return NextResponse.json(result);
    } catch (err) {
      console.error("Google Directions failed, using estimate fallback:", err);
    }
  }

  return NextResponse.json(estimateDirections(origin, destination, mode, lang));
}

async function fetchGoogleDirections(
  origin: LatLng,
  destination: LatLng,
  mode: "walking" | "driving",
  lang: "en" | "ar",
  key: string
): Promise<DirectionsResult> {
  const url =
    `https://maps.googleapis.com/maps/api/directions/json?` +
    `origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}` +
    `&mode=${mode}&language=${lang}&key=${key}`;

  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== "OK" || !data.routes?.[0]?.legs?.[0]) {
    throw new Error(`Directions API status: ${data.status}`);
  }

  const leg = data.routes[0].legs[0];
  return {
    distanceText: leg.distance.text,
    durationText: leg.duration.text,
    distanceMeters: leg.distance.value,
    durationSeconds: leg.duration.value,
    mode,
    source: "google",
  };
}
