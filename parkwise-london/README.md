# ParkWise London

ParkWise London is a lightweight full-stack Next.js prototype for checking whether parking is likely allowed at a pinned location in London.

## What v1 does

- Shows an interactive map centered on London
- Detects the user's location when permission is granted
- Lets the user drop a pin anywhere on the map
- Identifies whether the point falls inside mocked Tower Hamlets coverage
- Applies simple mocked parking bay rules for Tower Hamlets only
- Lets the user toggle Blue Badge status and vehicle type
- Returns a decision of Allowed, Not Allowed, or Limited with an explanation

## Tech stack

- Next.js 16 with App Router
- TypeScript
- Tailwind CSS v4
- Leaflet with React Leaflet
- API route for parking decision logic
- Mock data only, no database

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
  lib/
    parking/
      evaluate.ts
      geo.ts
      mock-data.ts
      time.ts
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

## Parking logic notes

- v1 only supports mocked Tower Hamlets data.
- Borough detection and bay matching use simple bounding boxes, not official GIS boundaries.
- The result is guidance for prototyping and UX testing, not legal advice.
- The backend evaluates time using the `Europe/London` timezone.

## Deployment

This app is ready for Vercel deployment as a standard Next.js project.

1. Push the repository to GitHub.
2. Import it into Vercel.
3. Deploy with the default Next.js settings.

## CI

GitHub Actions runs lint and build checks on pushes and pull requests targeting `master`.
