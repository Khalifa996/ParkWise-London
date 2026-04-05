import { BOROUGHS, PARKING_BAY_RULES } from "@/lib/parking/mock-data";
import type { BoroughDefinition, ParkingBayRule } from "@/types/parking";

function pointInBounds(
  lat: number,
  lng: number,
  bounds: { north: number; south: number; east: number; west: number },
) {
  return (
    lat <= bounds.north &&
    lat >= bounds.south &&
    lng <= bounds.east &&
    lng >= bounds.west
  );
}

export function findBorough(lat: number, lng: number): BoroughDefinition | null {
  return BOROUGHS.find((borough) => pointInBounds(lat, lng, borough.bounds)) ?? null;
}

export function findParkingBayRule(
  lat: number,
  lng: number,
  boroughName: string,
): ParkingBayRule | null {
  return (
    PARKING_BAY_RULES.find(
      (rule) =>
        rule.borough === boroughName && pointInBounds(lat, lng, rule.bounds),
    ) ?? null
  );
}
