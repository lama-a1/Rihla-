# Rihla — AI Tourism & Map Assistant for Saudi Arabia

> "Rihla doesn't ask what kind of traveler you are. It learns it."

A single-page AI travel assistant: chat naturally, get real place
recommendations on a real map, see a route + distance + ETA, give quick
feedback — and your Travel DNA quietly evolves in the background so the
*next* suggestion is better than the last.

This replaces the earlier questionnaire-based MVP. See "What changed" below
for the full diff if you used the previous version.

## Architecture

Still a single Next.js 14 (App Router) app — no separate backend. API routes
are the AI/Maps/Places layer; the frontend is React + Tailwind, all state in
one React Context (`lib/store.tsx`) + `localStorage`.

```
rihla/
├─ app/
│  ├─ page.tsx                 The single page: chat + map + cards + DNA + feedback
│  └─ api/
│     ├─ intent/                POST message -> IntentResult (Gemini, JSON mode)
│     ├─ places/                POST intent+DNA -> RecommendedPlace[] (Google Places)
│     ├─ directions/            POST origin+destination -> route/distance/ETA (Directions)
│     └─ trip-context/          GET city -> weather + prayer times
├─ lib/
│  ├─ gemini.ts                 Server-side Gemini client (JSON-mode helper) — unchanged
│  ├─ dna.ts                    Travel DNA update math — capped nudges, kept separate from UI/API
│  ├─ mockData.ts               Real Saudi places catalog + DNA-aware fallback scoring
│  ├─ store.tsx                 App state: dna, messages, recommendations, location, directions
│  ├─ i18n.tsx                  en/ar + RTL — unchanged
│  └─ types.ts                  TravelDNA, IntentResult, RecommendedPlace, DirectionsResult, ...
└─ components/
   ├─ ChatPanel.tsx              Chat UI -> /api/intent -> DNA nudge -> /api/places
   ├─ MapPanel.tsx                Switches between GoogleMapView and the free TripMap fallback
   ├─ GoogleMapView.tsx           Real Google Maps JS API (markers + route)
   ├─ TripMap.tsx                 Free Leaflet/OpenStreetMap fallback map
   ├─ RecommendationCards.tsx     Renders RecommendedPlace[] from the store
   ├─ RecommendationCard.tsx      One card: reason, cost, crowd, "select"/"show route"
   ├─ DNAPanel.tsx                Live Travel DNA visual (DNAHelix)
   ├─ FeedbackSection.tsx         Feedback -> DNA nudge -> re-fetch recommendations
   └─ TripContextWidget.tsx       Weather + prayer times — unchanged
```

## How the AI works (Phase 2/3)

1. User types a message (e.g. "I want a quiet historical place nearby").
2. `/api/intent` calls Gemini with the message + current Travel DNA, asking
   for **structured JSON only**: `{ intentSummary, category, filters,
   dnaSignals, replyText }`. `dnaSignals` are small deltas (roughly -8 to 8
   per trait), never a full profile rewrite.
3. `lib/dna.ts#applyDNASignals` clamps and applies those deltas client-side —
   a single message can only move any trait a little, so the profile evolves
   gradually across a session, exactly as specified.
4. `/api/places` takes the resulting category/filters + the (now slightly
   updated) DNA and returns ranked `RecommendedPlace[]`.
5. Cards + map pins render from that array. Selecting one fetches
   `/api/directions` for route + distance + ETA.
6. Feedback taps/voice go through `lib/dna.ts#feedbackToDNASignals`, nudge
   the DNA again, and re-run step 4 so you can see the *next* recommendation
   change — "Your Travel DNA evolved" is shown inline in the chat with the
   exact trait deltas.

**Gemini never invents coordinates.** `/api/places` only returns Places-API
or mock-catalog coordinates; Gemini only ever produces category/filter/DNA
JSON, never place data itself.

## What's real vs. mock (fallback is automatic, not a separate mode)

| Feature | Real | Fallback (no key / call fails) |
|---|---|---|
| Intent understanding | Gemini (JSON mode) | Keyword matcher, EN + AR (`app/api/intent/route.ts`) |
| Place recommendations | Google Places Text Search | DNA-scored local Saudi catalog (`lib/mockData.ts`) |
| Map | Google Maps JavaScript API | Leaflet + OpenStreetMap (free, no key) |
| Route / distance / ETA | Google Directions API | Straight-line distance × 1.35 + speed estimate |
| Weather / prayer times | — (still mocked, Phase 8) | `lib/mockData.ts` |

Every fallback path was tested and works out of the box — you can demo the
full loop (chat → DNA update → recommendation → map → route → feedback →
DNA evolves → better recommendation) with **zero API keys** configured.

## Environment variables

```
GEMINI_API_KEY=                 # server-only, secret
GEMINI_MODEL=gemini-2.0-flash   # optional
NEXT_PUBLIC_GOOGLE_MAPS_KEY=    # browser-exposed, HTTP-referrer restricted
GOOGLE_MAPS_SERVER_KEY=         # server-only, secret — Places + Directions
```

**Never commit real keys.** Copy `.env.example` to `.env.local` (already
gitignored) and fill in values there.

---

## Google Maps Platform setup (step by step, for beginners)

You need **two separate keys** — one safe to expose in the browser, one that
must stay secret on the server. Here's exactly how to get both.

### Step 1 — Create/select a Google Cloud project

1. Go to **[console.cloud.google.com](https://console.cloud.google.com)**
   and sign in with any Google account.
2. Top-left, click the project dropdown → **New Project**.
3. Name it something like `rihla-hackathon` → **Create**.
4. Make sure that project is selected (check the dropdown again).

### Step 2 — Enable billing (required, but free tier covers a hackathon easily)

Google requires a billing account to use Maps Platform, but gives **$200/month
free credit**, which is far more than a hackathon demo will use.

1. Left sidebar → **Billing** → **Link a billing account** (or **Create
   billing account** if you don't have one).
2. Follow the prompts to add a card. You won't be charged unless you go
   drastically over the free credit.

### Step 3 — Enable the three APIs you need

1. Left sidebar → **APIs & Services** → **Library**.
2. Search for and click **Enable** on each of these, one at a time:
   - **Maps JavaScript API**
   - **Places API**
   - **Directions API**

### Step 4 — Create the browser key (`NEXT_PUBLIC_GOOGLE_MAPS_KEY`)

1. **APIs & Services** → **Credentials** → **Create Credentials** → **API key**.
2. A key appears — click **Edit API key** (or find it in the list and click it).
3. Under **Application restrictions**, choose **HTTP referrers (web sites)**.
4. Under **Website restrictions**, add:
   - `http://localhost:3000/*` (for local testing)
   - `https://your-project.vercel.app/*` (your real Vercel domain — add this
     after you deploy once and know the URL)
5. Under **API restrictions**, choose **Restrict key** and check only
   **Maps JavaScript API**.
6. Click **Save**. Copy this key.
7. Paste it as `NEXT_PUBLIC_GOOGLE_MAPS_KEY` in `.env.local` (and later in
   Vercel — see below). This key **will** be visible in your page's source
   code — that's expected and safe *only because* of the referrer + API
   restrictions above, which stop anyone else from using it on their own site.

### Step 5 — Create the server key (`GOOGLE_MAPS_SERVER_KEY`)

1. Same page, **Create Credentials** → **API key** again (a second, separate key).
2. Click **Edit API key** on this new one.
3. Under **Application restrictions**, choose **None** (server keys aren't
   restricted by referrer since there's no browser involved) — or **IP
   addresses** if you know Vercel's static IPs (optional, advanced).
4. Under **API restrictions**, choose **Restrict key** and check only
   **Places API** and **Directions API**.
5. Click **Save**. Copy this key.
6. Paste it as `GOOGLE_MAPS_SERVER_KEY` in `.env.local`. **Never** put this
   one in any `NEXT_PUBLIC_` variable or client-side code — it must only be
   read inside `app/api/*/route.ts` files (server-side), which is exactly
   how this project uses it.

### Step 6 — Add both keys to Vercel

1. Go to your project on [vercel.com](https://vercel.com) → **Settings** →
   **Environment Variables**.
2. Add `NEXT_PUBLIC_GOOGLE_MAPS_KEY` and `GOOGLE_MAPS_SERVER_KEY` (and
   `GEMINI_API_KEY` if not already there) with the same values as your
   `.env.local`.
3. Go to **Deployments** → redeploy the latest one (or push a new commit).

### Step 7 — Verify it's working

- **Locally:** run `npm run dev`, ask Rihla for a place, and once
  recommendations appear you should see a real interactive **Google Map**
  (not the dashed-border free map) in the Map panel. If you instead see a
  small note saying "Free fallback map," the key isn't being picked up —
  double check `.env.local` and restart `npm run dev`.
- **On Vercel:** same check on your live URL. If the map area shows nothing
  or a Google "For development purposes only" watermark, your API/billing
  setup or referrer restriction needs another look — the browser console
  (F12 → Console tab) will show the exact Google error.

If anything in Places/Directions fails at any point (quota, wrong key,
API not enabled), the app **automatically** falls back to the free map and
mock data — nothing breaks, you just lose the "real" data for that call.

---

## How to test locally

```powershell
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`:
1. Type a request in **Ask Rihla**, e.g. "I want a quiet historical place."
2. Watch the **Travel DNA** panel shift slightly and recommendation cards
   appear.
3. Click **📍 Use my location** (or allow the browser prompt) to enable
   route/distance.
4. Click **Select a destination** on a card, then **Show route** to see
   distance + ETA.
5. Tap a feedback button (or the mic) about that place — watch the chat log
   "Your Travel DNA evolved" message and the recommendations update.

## What changed from the previous project

- **Removed:** the questionnaire wizard (`app/questionnaire`,
  `app/dna-results`, `app/trip-setup`, `app/itinerary`, `app/active-trip`,
  `components/QuestionCard.tsx`) and the routes tied to it
  (`generate-dna`, `generate-itinerary`, `process-feedback`).
- **Redefined:** `TravelDNA` now uses the natural-interaction field set
  (`quietPreference`, `walkingTolerance`, `budgetSensitivity`,
  `indoorPreference`, `hiddenGemsPreference`, etc.) instead of the
  questionnaire-derived shape.
- **New:** `/api/intent`, `/api/places`, `/api/directions`, `lib/dna.ts`,
  `ChatPanel`, `MapPanel`, `GoogleMapView`, `RecommendationCard(s)`.
- **Kept unchanged:** `lib/gemini.ts`, `lib/i18n.tsx`,
  `components/ui/*`, `FeedbackBar.tsx`, `VoiceFeedbackButton.tsx`,
  `lib/voiceCommands.ts`, `TripContextWidget.tsx`, `app/api/trip-context`.
- **Adapted, not rewritten:** `lib/mockData.ts` (same real Saudi places
  catalog, new DNA-aware scoring), `DNAHelix.tsx` (new trait list, same
  visual), `TripMap.tsx` (now takes `RecommendedPlace[]` instead of
  itinerary stops), `lib/store.tsx` (same Context + `localStorage` pattern,
  new fields).
