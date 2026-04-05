import type { BoroughDefinition, ParkingBayRule, TestZone } from "@/types/parking";

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

export const PARKING_BAY_RULES: ParkingBayRule[] = [
  {
    id: "th-resident-bay",
    name: "Bethnal Green Resident Bay",
    borough: "Tower Hamlets",
    bayType: "Resident bay",
    kind: "resident_bay",
    bounds: {
      north: 51.5278,
      south: 51.5228,
      east: -0.046,
      west: -0.062,
    },
    restrictions: [
      {
        days: [1, 2, 3, 4, 5, 6],
        startHour: 8.5,
        endHour: 17.5,
      },
    ],
  },
  {
    id: "th-pay-by-phone-bay",
    name: "Spitalfields Pay By Phone Bay",
    borough: "Tower Hamlets",
    bayType: "Pay by phone bay",
    kind: "pay_by_phone_bay",
    bounds: {
      north: 51.5205,
      south: 51.516,
      east: -0.071,
      west: -0.0795,
    },
    restrictions: [
      {
        days: [1, 2, 3, 4, 5, 6],
        startHour: 8.5,
        endHour: 17.5,
        maxStayMinutes: 240,
      },
    ],
    maxStayMinutes: 240,
  },
  {
    id: "th-shared-use-bay",
    name: "Canary Wharf Shared Use Bay",
    borough: "Tower Hamlets",
    bayType: "Shared use bay",
    kind: "shared_use_bay",
    bounds: {
      north: 51.5085,
      south: 51.5015,
      east: -0.013,
      west: -0.026,
    },
    restrictions: [
      {
        days: [1, 2, 3, 4, 5, 6],
        startHour: 8.5,
        endHour: 17.5,
        maxStayMinutes: 120,
      },
    ],
    maxStayMinutes: 120,
  },
  {
    id: "th-single-yellow-line",
    name: "Whitechapel Single Yellow Line",
    borough: "Tower Hamlets",
    bayType: "Single yellow line",
    kind: "single_yellow_line",
    bounds: {
      north: 51.519,
      south: 51.5142,
      east: -0.0485,
      west: -0.0565,
    },
    restrictions: [
      {
        days: [1, 2, 3, 4, 5, 6],
        startHour: 8.5,
        endHour: 17.5,
      },
    ],
  },
  {
    id: "th-double-yellow-line",
    name: "Limehouse Double Yellow Line",
    borough: "Tower Hamlets",
    bayType: "Double yellow line",
    kind: "double_yellow_line",
    bounds: {
      north: 51.5128,
      south: 51.5082,
      east: -0.0325,
      west: -0.0405,
    },
    restrictions: [
      {
        days: [0, 1, 2, 3, 4, 5, 6],
        startHour: 0,
        endHour: 24,
      },
    ],
  },
  {
    id: "th-loading-bay",
    name: "Poplar Loading Bay",
    borough: "Tower Hamlets",
    bayType: "Loading bay",
    kind: "loading_bay",
    bounds: {
      north: 51.5125,
      south: 51.5078,
      east: -0.0085,
      west: -0.0165,
    },
    restrictions: [
      {
        days: [1, 2, 3, 4, 5, 6],
        startHour: 7,
        endHour: 19,
      },
    ],
  },
];

function zoneCenter(rule: ParkingBayRule): [number, number] {
  return [
    (rule.bounds.north + rule.bounds.south) / 2,
    (rule.bounds.east + rule.bounds.west) / 2,
  ];
}

const TEST_ZONE_COLORS = [
  "#14b8a6",
  "#2563eb",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#f97316",
];

export const TOWER_HAMLETS_TEST_ZONES: TestZone[] = PARKING_BAY_RULES.map((rule, index) => ({
  id: rule.id,
  name: rule.name,
  borough: rule.borough,
  bayType: rule.bayType,
  center: zoneCenter(rule),
  bounds: rule.bounds,
  color: TEST_ZONE_COLORS[index % TEST_ZONE_COLORS.length],
}));
