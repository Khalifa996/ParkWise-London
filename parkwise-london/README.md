# ParkWise London

ParkWise London is a lightweight full-stack Next.js prototype for checking whether parking is likely allowed at a pinned location in London.

## What the current version does

- Shows an interactive map centered on London
- Detects the user's location when permission is granted
- Lets the user drop a pin anywhere on the map
- Matches Tower Hamlets pins against mocked road-level restriction features instead of broad generic zones
- Uses live reverse geocoding for the dropped pin when available, then falls back to the nearest mapped mock road name
- Displays road name, nearest restriction object, bay type, and restriction times in the result panel
- Applies mocked Tower Hamlets rule logic for resident bays, pay by phone bays, shared use bays, single yellow lines, double yellow lines, and loading bays
- Lets the user save, edit, and reuse multiple local vehicle profiles in browser storage
- Seeds a few demo profiles for first-time testing
- Includes a collapsible developer testing panel with quick-jump buttons and overlay legend chips for mocked zones
- Returns a decision of Allowed, Not Allowed, or Limited with structured explanations and warnings

## Tech stack

- Next.js 16 with App Router
- TypeScript
- Tailwind CSS v4
- Leaflet with React Leaflet
- API route for parking decision logic
- Live reverse geocoding via OpenStreetMap Nominatim
- Mock Tower Hamlets restriction features, no database yet
- Browser `localStorage` for saved profiles

## Environment requirements

Minimal runtime requirements:

- Node.js 20 or newer
- npm 10 or newer
- No database
- No external API keys
- No required environment variables for local development or Vercel deployment
- Optional: `NEXT_PUBLIC_ENABLE_DEV_TEST_PANEL=true` to force the developer testing panel on in production

## Project structure

```text
src/
  app/
    api/parking-check/route.ts
    globals.css
    layout.tsx
    page.tsx
  components/
    dashboard/
      parking-dashboard.tsx
      status-card.tsx
    map/
      parking-map.tsx
    profiles/
      vehicle-profiles-panel.tsx
    testing/
      developer-test-panel.tsx
  lib/
    config.ts
    parking/
      evaluate.ts
      geo.ts
      mock-data.ts
      time.ts
      rules/
        tower-hamlets.ts
      services/
        reverse-geocode.ts
    profiles/
      helpers.ts
      storage.ts
  types/
    parking.ts
.github/
  workflows/ci.yml
```

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000)

## Road-aware matching notes

- Tower Hamlets matching is attached to mocked road and restriction features rather than only broad test areas
- Reverse geocoding now calls OpenStreetMap Nominatim from the server route when available
- If the live reverse geocode lookup fails or returns no road, the app falls back to the nearest mocked feature road name
- If a pin falls outside a mapped feature but inside Tower Hamlets, the app falls back to the nearest mocked restriction object for guidance
- Roadside signs, kerb markings, and bay plates always override the app result

## Local profile saving

- Saved vehicle profiles are stored in browser `localStorage`
- Profiles are local to the current browser on the current device
- There is no backend sync or login in this version
- Seeded demo profiles are added automatically when the browser has no saved profiles yet

## Developer testing panel

- The app includes a small collapsible testing panel below the map
- It lists each mocked Tower Hamlets restriction feature
- Each button jumps the map and pin directly into that test area
- Colored overlays are drawn on the map for each test zone so the mocked areas are visible before clicking
- Legend chips explain which color maps to each bay or restriction type
- The panel is isolated in `src/components/testing/developer-test-panel.tsx` for easy removal later
- By default, the panel is available in development and hidden in production unless `NEXT_PUBLIC_ENABLE_DEV_TEST_PANEL=true`

## Vercel deployment

Exact deployment steps:

1. Push the project to a GitHub repository.
2. Sign in to [Vercel](https://vercel.com/).
3. Click `Add New...` then `Project`.
4. Import the GitHub repository that contains ParkWise London.
5. Keep the default Next.js framework detection.
6. Leave environment variables empty unless you want the developer testing panel visible in production.
7. If you do want the testing panel in production, add:
   ```text
   NEXT_PUBLIC_ENABLE_DEV_TEST_PANEL=true
   ```
8. Click `Deploy`.
9. After the first deploy finishes, open the production URL and test a few Tower Hamlets road features.

Recommended Vercel settings:

- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: leave blank

## CI

GitHub Actions runs lint and build checks on pushes and pull requests targeting `master`.
