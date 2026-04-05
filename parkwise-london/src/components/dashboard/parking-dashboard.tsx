"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { LONDON_CENTER } from "@/lib/parking/mock-data";
import { StatusCard } from "@/components/dashboard/status-card";
import type {
  ParkingDecision,
  ParkingCheckRequest,
  VehicleType,
} from "@/types/parking";

const DynamicParkingMap = dynamic(
  () => import("@/components/map/parking-map").then((mod) => mod.ParkingMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-[28px] border border-white/10 bg-slate-950/60 text-slate-200">
        Loading map...
      </div>
    ),
  },
);

const vehicleOptions: { value: VehicleType; label: string }[] = [
  { value: "car", label: "Car" },
  { value: "motorcycle", label: "Motorcycle" },
  { value: "electric", label: "Electric" },
  { value: "commercial", label: "Commercial" },
];

export function ParkingDashboard() {
  const [pin, setPin] = useState<[number, number] | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [hasBlueBadge, setHasBlueBadge] = useState(false);
  const [vehicleType, setVehicleType] = useState<VehicleType>("car");
  const [result, setResult] = useState<ParkingDecision | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationMessage, setLocationMessage] = useState("Use your location or drop a pin anywhere in London.");

  const mapCenter = useMemo<[number, number]>(() => {
    return pin ?? userLocation ?? LONDON_CENTER;
  }, [pin, userLocation]);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocationMessage("Geolocation is not available in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setUserLocation(coords);
        setLocationMessage("Location detected. You can still click anywhere on the map to check a different spot.");
      },
      () => {
        setLocationMessage("Location permission was skipped, so the map is staying centered on central London.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  useEffect(() => {
    if (!pin) {
      return;
    }

    const controller = new AbortController();
    const [lat, lng] = pin;

    async function checkParking() {
      setLoading(true);
      setError(null);

      try {
        const payload: ParkingCheckRequest = {
          lat,
          lng,
          exemptions: {
            hasBlueBadge,
            vehicleType,
          },
        };

        const response = await fetch("/api/parking-check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("The parking check failed.");
        }

        const data = (await response.json()) as ParkingDecision;
        setResult(data);
      } catch (fetchError) {
        if ((fetchError as Error).name === "AbortError") {
          return;
        }

        setError("We could not evaluate this location right now.");
      } finally {
        setLoading(false);
      }
    }

    checkParking();

    return () => controller.abort();
  }, [pin, hasBlueBadge, vehicleType]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.22),_transparent_32%),linear-gradient(135deg,_rgba(15,23,42,0.96),_rgba(15,23,42,0.84)_45%,_rgba(10,37,64,0.96))] p-8 shadow-[0_28px_100px_rgba(15,23,42,0.38)]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.34em] text-teal-200/80">ParkWise London</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              Quick parking guidance for a pinned spot in London.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200/82 sm:text-lg">
              Drop a pin, detect your current position, and get a simple parking decision based on mocked borough rules, bay type, and basic exemptions.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:w-[380px]">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-100 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.22em] text-teal-200/75">Coverage</p>
              <p className="mt-2 text-sm leading-6">Tower Hamlets rules only in v1, designed to expand borough by borough.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-100 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.22em] text-teal-200/75">Time Basis</p>
              <p className="mt-2 text-sm leading-6">Checks use current London time, not the browser&apos;s local timezone.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-4 rounded-[32px] border border-slate-200/70 bg-white/85 p-4 shadow-[0_24px_80px_rgba(148,163,184,0.22)] backdrop-blur sm:p-5">
          <div className="flex flex-col gap-3 px-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">Interactive parking map</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{locationMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (userLocation) {
                  setPin(userLocation);
                }
              }}
              className="rounded-full border border-slate-300 bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:border-slate-950 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!userLocation}
            >
              Use my location
            </button>
          </div>
          <DynamicParkingMap
            center={LONDON_CENTER}
            pin={pin}
            userLocation={userLocation}
            onPinChange={setPin}
          />
          <div className="grid gap-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Map Center</p>
              <p className="mt-2 font-medium text-slate-900">{mapCenter[0].toFixed(5)}, {mapCenter[1].toFixed(5)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pinned Spot</p>
              <p className="mt-2 font-medium text-slate-900">{pin ? `${pin[0].toFixed(5)}, ${pin[1].toFixed(5)}` : "No pin yet"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">How To Use</p>
              <p className="mt-2 font-medium text-slate-900">Click anywhere on the map to run a check.</p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <section className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
            <p className="text-sm uppercase tracking-[0.24em] text-teal-200/70">User Context</p>
            <div className="mt-5 space-y-5">
              <label className="flex items-center justify-between gap-4 rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-slate-100">
                <span>
                  <span className="block text-sm font-medium">Blue Badge</span>
                  <span className="mt-1 block text-xs text-slate-300">Apply the basic exemption logic used in the mock rules.</span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={hasBlueBadge}
                  onClick={() => setHasBlueBadge((current) => !current)}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition ${hasBlueBadge ? "bg-teal-400" : "bg-slate-700"}`}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white transition ${hasBlueBadge ? "translate-x-8" : "translate-x-1"}`}
                  />
                </button>
              </label>

              <label className="block rounded-[22px] border border-white/10 bg-white/5 p-4 text-slate-100">
                <span className="text-sm font-medium">Vehicle Type</span>
                <span className="mt-1 block text-xs text-slate-300">Choose the rule variant to apply.</span>
                <select
                  value={vehicleType}
                  onChange={(event) => setVehicleType(event.target.value as VehicleType)}
                  className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-teal-300"
                >
                  {vehicleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <StatusCard result={result} loading={loading} error={error} />

          <section className="rounded-[32px] border border-slate-200/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(148,163,184,0.18)]">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Mock Logic Notes</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              <li>Checks only include mocked Tower Hamlets coverage for v1.</li>
              <li>Supported rule types now include resident, pay by phone, shared use, single yellow, double yellow, and loading bays.</li>
              <li>Borough and bay matching still use simple bounding boxes instead of precise GIS data.</li>
              <li>Allowed, Limited, and Not Allowed are guidance states, not legal advice.</li>
            </ul>
          </section>
        </div>
      </section>
    </main>
  );
}
