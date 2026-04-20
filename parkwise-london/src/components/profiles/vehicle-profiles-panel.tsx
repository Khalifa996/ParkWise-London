"use client";

import { useState } from "react";
import type { SavedVehicleProfile } from "@/types/parking";

type VehicleProfilesPanelProps = {
  profiles: SavedVehicleProfile[];
  activeProfileId: string | null;
  draftProfileName: string;
  onDraftProfileNameChange: (value: string) => void;
  onSelectProfile: (profileId: string) => void;
  onSaveProfile: () => void;
  onUpdateProfile: (profile: SavedVehicleProfile) => void;
  onDeleteProfile: (profileId: string) => void;
};

function profileSummary(profile: SavedVehicleProfile) {
  return `${profile.vehicleType === "electric" ? "Electric" : profile.vehicleType === "commercial" ? "Commercial" : profile.vehicleType === "motorcycle" ? "Motorcycle" : "Car"} - ${profile.hasBlueBadge ? "Blue Badge" : "No Blue Badge"}`;
}

function EditableProfileCard({
  profile,
  isActive,
  onSelectProfile,
  onUpdateProfile,
  onDeleteProfile,
}: {
  profile: SavedVehicleProfile;
  isActive: boolean;
  onSelectProfile: (profileId: string) => void;
  onUpdateProfile: (profile: SavedVehicleProfile) => void;
  onDeleteProfile: (profileId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [vehicleType, setVehicleType] = useState(profile.vehicleType);
  const [hasBlueBadge, setHasBlueBadge] = useState(profile.hasBlueBadge);

  function resetForm() {
    setName(profile.name);
    setVehicleType(profile.vehicleType);
    setHasBlueBadge(profile.hasBlueBadge);
  }

  function handleCancel() {
    resetForm();
    setIsEditing(false);
  }

  function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    onUpdateProfile({
      ...profile,
      name: trimmedName,
      vehicleType,
      hasBlueBadge,
    });
    setIsEditing(false);
  }

  return (
    <div
      className={`rounded-[22px] border p-4 transition ${isActive ? "border-teal-300/50 bg-teal-400/10 text-white" : "border-white/10 bg-white/5 text-slate-200"}`}
    >
      {isEditing ? (
        <div className="space-y-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-teal-300"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={vehicleType}
              onChange={(event) =>
                setVehicleType(event.target.value as SavedVehicleProfile["vehicleType"])
              }
              className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-teal-300"
            >
              <option value="car">Car</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="electric">Electric</option>
              <option value="commercial">Commercial</option>
            </select>
            <button
              type="button"
              onClick={() => setHasBlueBadge((current) => !current)}
              className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${hasBlueBadge ? "border-teal-300/40 bg-teal-400 text-slate-950" : "border-white/10 bg-slate-900 text-white"}`}
            >
              {hasBlueBadge ? "Blue Badge enabled" : "Blue Badge disabled"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-full border border-white/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-current transition hover:bg-white/10"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-current/80 transition hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">{profile.name}</p>
            <p className="mt-1 text-xs leading-5 text-current/75">{profileSummary(profile)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onSelectProfile(profile.id)}
              className="rounded-full border border-white/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-current transition hover:bg-white/10"
            >
              {isActive ? "Active" : "Use"}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsEditing(true);
              }}
              className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-current/80 transition hover:bg-white/10"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDeleteProfile(profile.id)}
              className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-current/80 transition hover:bg-white/10"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function VehicleProfilesPanel({
  profiles,
  activeProfileId,
  draftProfileName,
  onDraftProfileNameChange,
  onSelectProfile,
  onSaveProfile,
  onUpdateProfile,
  onDeleteProfile,
}: VehicleProfilesPanelProps) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-teal-200/70">Vehicle Profiles</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">Save and reuse common vehicle setups directly in this browser.</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
          {profiles.length} saved
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          value={draftProfileName}
          onChange={(event) => onDraftProfileNameChange(event.target.value)}
          placeholder="Profile name"
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-teal-300"
        />
        <button
          type="button"
          onClick={onSaveProfile}
          className="rounded-2xl border border-teal-300/40 bg-teal-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-300"
        >
          Save current setup
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {profiles.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
            No profiles saved yet. Pick a vehicle type and Blue Badge setting, then save it.
          </div>
        ) : (
          profiles.map((profile) => (
            <EditableProfileCard
              key={profile.id}
              profile={profile}
              isActive={profile.id === activeProfileId}
              onSelectProfile={onSelectProfile}
              onUpdateProfile={onUpdateProfile}
              onDeleteProfile={onDeleteProfile}
            />
          ))
        )}
      </div>
    </section>
  );
}
