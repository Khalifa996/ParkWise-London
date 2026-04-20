import type {
  BoroughDefinition,
  ParkingRestrictionFeature,
  SavedVehicleProfile,
  TestZone,
} from "@/types/parking";

export const LONDON_CENTER: [number, number] = [51.5074, -0.1278];

export const BOROUGHS: BoroughDefinition[] = [
  {
    id: "tower-hamlets",
    name: "Tower Hamlets",
    bounds: {
      north: 51.5448,
      south: 51.4862,
      east: -0.0032,
      west: -0.0716,
    },
  },
];

export const PARKING_RESTRICTION_FEATURES: ParkingRestrictionFeature[] = [
  {
    id: "th-resident-bay",
    name: "Bethnal Green Resident Bay",
    borough: "Tower Hamlets",
    roadName: "Roman Road",
    restrictionObjectName: "Resident permit bay outside 402 Roman Road",
    bayType: "Resident bay",
    kind: "resident_bay",
    bounds: {
      north: 51.5278,
      south: 51.5228,
      east: -0.046,
      west: -0.062,
    },
    restrictions: [
      { days: [1, 2, 3, 4, 5, 6], startHour: 8.5, endHour: 17.5 },
    ],
    restrictionTimesLabel: "Mon-Sat 08:30-17:30",
    color: "#14b8a6",
  },
  {
    id: "th-pay-by-phone-bay",
    name: "Spitalfields Pay By Phone Bay",
    borough: "Tower Hamlets",
    roadName: "Commercial Street",
    restrictionObjectName: "Cashless parking bay near Spitalfields Market",
    bayType: "Pay by phone bay",
    kind: "pay_by_phone_bay",
    bounds: {
      north: 51.5205,
      south: 51.516,
      east: -0.071,
      west: -0.0795,
    },
    restrictions: [
      { days: [1, 2, 3, 4, 5, 6], startHour: 8.5, endHour: 17.5, maxStayMinutes: 240 },
    ],
    restrictionTimesLabel: "Mon-Sat 08:30-17:30, max 4 hours",
    maxStayMinutes: 240,
    color: "#2563eb",
  },
  {
    id: "th-shared-use-bay",
    name: "Canary Wharf Shared Use Bay",
    borough: "Tower Hamlets",
    roadName: "West India Avenue",
    restrictionObjectName: "Shared use bay by Canary Wharf estate edge",
    bayType: "Shared use bay",
    kind: "shared_use_bay",
    bounds: {
      north: 51.5085,
      south: 51.5015,
      east: -0.013,
      west: -0.026,
    },
    restrictions: [
      { days: [1, 2, 3, 4, 5, 6], startHour: 8.5, endHour: 17.5, maxStayMinutes: 120 },
    ],
    restrictionTimesLabel: "Mon-Sat 08:30-17:30, max 2 hours",
    maxStayMinutes: 120,
    color: "#f59e0b",
  },
  {
    id: "th-single-yellow-line",
    name: "Whitechapel Single Yellow Line",
    borough: "Tower Hamlets",
    roadName: "Whitechapel Road",
    restrictionObjectName: "Single yellow line eastbound kerb section",
    bayType: "Single yellow line",
    kind: "single_yellow_line",
    bounds: {
      north: 51.519,
      south: 51.5142,
      east: -0.0485,
      west: -0.0565,
    },
    restrictions: [
      { days: [1, 2, 3, 4, 5, 6], startHour: 8.5, endHour: 17.5 },
    ],
    restrictionTimesLabel: "Mon-Sat 08:30-17:30",
    color: "#ec4899",
  },
  {
    id: "th-double-yellow-line",
    name: "Limehouse Double Yellow Line",
    borough: "Tower Hamlets",
    roadName: "Commercial Road",
    restrictionObjectName: "Double yellow line by Limehouse basin access",
    bayType: "Double yellow line",
    kind: "double_yellow_line",
    bounds: {
      north: 51.5128,
      south: 51.5082,
      east: -0.0325,
      west: -0.0405,
    },
    restrictions: [
      { days: [0, 1, 2, 3, 4, 5, 6], startHour: 0, endHour: 24 },
    ],
    restrictionTimesLabel: "At any time",
    color: "#8b5cf6",
  },
  {
    id: "th-loading-bay",
    name: "Poplar Loading Bay",
    borough: "Tower Hamlets",
    roadName: "East India Dock Road",
    restrictionObjectName: "Signed loading bay outside local parade",
    bayType: "Loading bay",
    kind: "loading_bay",
    bounds: {
      north: 51.5125,
      south: 51.5078,
      east: -0.0085,
      west: -0.0165,
    },
    restrictions: [
      { days: [1, 2, 3, 4, 5, 6], startHour: 7, endHour: 19 },
    ],
    restrictionTimesLabel: "Mon-Sat 07:00-19:00",
    color: "#f97316",
  },
];

function featureCenter(feature: ParkingRestrictionFeature): [number, number] {
  return [
    (feature.bounds.north + feature.bounds.south) / 2,
    (feature.bounds.east + feature.bounds.west) / 2,
  ];
}

export const TOWER_HAMLETS_TEST_ZONES: TestZone[] = PARKING_RESTRICTION_FEATURES.map((feature) => ({
  id: feature.id,
  name: feature.name,
  borough: feature.borough,
  roadName: feature.roadName,
  bayType: feature.bayType,
  center: featureCenter(feature),
  bounds: feature.bounds,
  color: feature.color,
}));

export const SEEDED_VEHICLE_PROFILES: SavedVehicleProfile[] = [
  {
    id: "seed-standard-car",
    name: "Standard Car",
    vehicleType: "car",
    hasBlueBadge: false,
  },
  {
    id: "seed-blue-badge-driver",
    name: "Blue Badge Driver",
    vehicleType: "car",
    hasBlueBadge: true,
  },
  {
    id: "seed-delivery-van",
    name: "Delivery Van",
    vehicleType: "commercial",
    hasBlueBadge: false,
  },
];
