import { SEEDED_VEHICLE_PROFILES } from "@/lib/parking/mock-data";
import type { SavedVehicleProfile, VehicleType } from "@/types/parking";

export function createVehicleProfile(
  name: string,
  vehicleType: VehicleType,
  hasBlueBadge: boolean,
): SavedVehicleProfile {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim(),
    vehicleType,
    hasBlueBadge,
  };
}

export function getSeededVehicleProfiles(): SavedVehicleProfile[] {
  return SEEDED_VEHICLE_PROFILES.map((profile) => ({ ...profile }));
}
