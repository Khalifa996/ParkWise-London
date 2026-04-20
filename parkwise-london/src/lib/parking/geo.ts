import { BOROUGHS, PARKING_RESTRICTION_FEATURES } from "@/lib/parking/mock-data";
import type { BoroughDefinition, ParkingRestrictionFeature } from "@/types/parking";

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

function featureCenter(feature: ParkingRestrictionFeature): [number, number] {
  return [
    (feature.bounds.north + feature.bounds.south) / 2,
    (feature.bounds.east + feature.bounds.west) / 2,
  ];
}

function distanceSquared(a: [number, number], b: [number, number]) {
  const latDelta = a[0] - b[0];
  const lngDelta = a[1] - b[1];
  return latDelta * latDelta + lngDelta * lngDelta;
}

export function findBorough(lat: number, lng: number): BoroughDefinition | null {
  return BOROUGHS.find((borough) => pointInBounds(lat, lng, borough.bounds)) ?? null;
}

export function findRestrictionFeature(
  lat: number,
  lng: number,
  boroughName: string,
): ParkingRestrictionFeature | null {
  return (
    PARKING_RESTRICTION_FEATURES.find(
      (feature) =>
        feature.borough === boroughName && pointInBounds(lat, lng, feature.bounds),
    ) ?? null
  );
}

export function findNearestRestrictionFeature(
  lat: number,
  lng: number,
  boroughName: string,
): ParkingRestrictionFeature | null {
  const features = PARKING_RESTRICTION_FEATURES.filter(
    (feature) => feature.borough === boroughName,
  );

  if (features.length === 0) {
    return null;
  }

  return features.reduce((nearest, feature) => {
    const target: [number, number] = [lat, lng];
    return distanceSquared(featureCenter(feature), target) < distanceSquared(featureCenter(nearest), target)
      ? feature
      : nearest;
  });
}

export function reverseGeocodeRoadName(
  lat: number,
  lng: number,
  boroughName: string,
): string | null {
  return findRestrictionFeature(lat, lng, boroughName)?.roadName ??
    findNearestRestrictionFeature(lat, lng, boroughName)?.roadName ??
    null;
}
