"use client";

import type { TestZone } from "@/types/parking";

type DeveloperTestPanelProps = {
  zones: TestZone[];
  matchedZoneName: string;
  onJumpToZone: (zone: TestZone) => void;
};

export function DeveloperTestPanel({
  zones,
  matchedZoneName,
  onJumpToZone,
}: DeveloperTestPanelProps) {
  return (
    <details className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-4 text-slate-700 shadow-[0_18px_50px_rgba(148,163,184,0.14)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold uppercase tracking-[0.22em] text-slate-600">
        Developer Test Zones
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] tracking-[0.18em] text-slate-500">
          collapsible
        </span>
      </summary>

      <div className="mt-4 space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Matched Zone</p>
          <p className="mt-2 text-sm font-medium text-slate-900">{matchedZoneName}</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          {zones.map((zone) => (
            <button
              key={zone.id}
              type="button"
              onClick={() => onJumpToZone(zone)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-slate-300 hover:bg-slate-100"
            >
              <p className="text-sm font-semibold text-slate-900">{zone.name}</p>
              <p className="mt-1 text-xs text-slate-500">{zone.bayType}</p>
            </button>
          ))}
        </div>
      </div>
    </details>
  );
}
