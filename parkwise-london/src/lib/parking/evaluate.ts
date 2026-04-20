import {
  findBorough,
  findNearestRestrictionFeature,
  findRestrictionFeature,
  reverseGeocodeRoadName,
} from "@/lib/parking/geo";
import { evaluateRuleByKind, ROADSIDE_SIGNS_WARNING } from "@/lib/parking/rules/tower-hamlets";
import { getLondonTimeSnapshot } from "@/lib/parking/time";
import type {
  ParkingCheckRequest,
  ParkingDecision,
  ParkingEvaluationContext,
  ParkingRestrictionFeature,
  ParkingStatus,
} from "@/types/parking";

type EvaluateParkingOptions = {
  liveRoadName?: string | null;
};

function headlineFromStatus(status: ParkingStatus) {
  if (status === "allowed") {
    return "Parking looks allowed";
  }

  if (status === "limited") {
    return "Parking is limited";
  }

  return "Parking is not allowed";
}

function fallbackDecision(
  request: ParkingCheckRequest,
  status: ParkingStatus,
  checkedAt: string,
  borough: string,
  roadName: string,
  roadNameSource: "live_reverse_geocode" | "mock_feature",
  bayType: string,
  restrictionObjectName: string,
  restrictionTimes: string,
  ruleSource: string,
  matchedZoneName: string,
  summary: string,
  details: string[],
  warningMessages: string[] = [],
): ParkingDecision {
  return {
    status,
    headline: headlineFromStatus(status),
    borough,
    roadName,
    roadNameSource,
    bayType,
    restrictionObjectName,
    restrictionTimes,
    checkedAt,
    ruleSource,
    matchedZoneName,
    vehicleType: request.exemptions.vehicleType,
    hasBlueBadge: request.exemptions.hasBlueBadge,
    explanation: {
      summary,
      details,
      warning: ROADSIDE_SIGNS_WARNING,
    },
    warningMessages: [ROADSIDE_SIGNS_WARNING, ...warningMessages],
  };
}

function isRestrictedNow(
  day: number,
  hour: number,
  restrictions: { days: number[]; startHour: number; endHour: number }[],
) {
  return restrictions.some(
    (restriction) =>
      restriction.days.includes(day) &&
      hour >= restriction.startHour &&
      hour < restriction.endHour,
  );
}

function buildContext(
  request: ParkingCheckRequest,
  checkedAt: string,
  boroughName: string,
  feature: ParkingRestrictionFeature,
  day: number,
  hour: number,
): ParkingEvaluationContext {
  return {
    day,
    hour,
    checkedAt,
    request,
    boroughName,
    feature,
    isRestrictedNow: isRestrictedNow(day, hour, feature.restrictions),
    resolvedRoadName: feature.roadName,
    roadNameSource: "mock_feature",
  };
}
export function evaluateParking(
  request: ParkingCheckRequest,
  options: EvaluateParkingOptions = {},
): ParkingDecision {
  const snapshot = getLondonTimeSnapshot();
  const borough = findBorough(request.lat, request.lng);

  if (!borough) {
    return fallbackDecision(
      request,
      "limited",
      snapshot.label,
      "Outside supported boroughs",
      "Unknown road",
      "mock_feature",
      "Unknown",
      "Unknown restriction object",
      "Unknown",
      "Mock borough coverage",
      "No matched zone",
      "This pin is outside the boroughs currently modeled in ParkWise London.",
      [
        "The road-aware v1 prototype only includes mocked Tower Hamlets restriction features.",
        "Because the point is outside that supported area, the app cannot give a reliable legal parking decision yet.",
      ],
      ["Coverage is incomplete outside Tower Hamlets in this version."],
    );
  }

  const matchedFeature = findRestrictionFeature(request.lat, request.lng, borough.name);
  const nearestFeature = findNearestRestrictionFeature(request.lat, request.lng, borough.name);
  const reverseGeocodedRoad =
    options.liveRoadName ??
    reverseGeocodeRoadName(request.lat, request.lng, borough.name) ??
    "Unknown road";
  const roadNameSource = options.liveRoadName
    ? "live_reverse_geocode"
    : "mock_feature";

  if (!matchedFeature || !nearestFeature) {
    return fallbackDecision(
      request,
      "limited",
      snapshot.label,
      borough.name,
      reverseGeocodedRoad,
      roadNameSource,
      nearestFeature?.bayType ?? "Unknown bay type",
      nearestFeature?.restrictionObjectName ?? "No mapped restriction object",
      nearestFeature?.restrictionTimesLabel ?? "Unknown",
      "Tower Hamlets mock road features",
      nearestFeature?.name ?? "No matched zone",
      "The borough is known, but this exact point does not map to a road-level restriction feature yet.",
      [
        `The pin falls inside ${borough.name}, but not inside a mapped restriction feature.`,
        nearestFeature
          ? `The nearest mocked object is ${nearestFeature.restrictionObjectName} on ${nearestFeature.roadName}.`
          : "No nearby mock feature was found.",
      ],
      ["This road-level match is approximate because live council restriction data is not wired in yet."],
    );
  }

  const context = buildContext(
    request,
    snapshot.label,
    borough.name,
    matchedFeature,
    snapshot.day,
    snapshot.hour,
  );
  context.resolvedRoadName = reverseGeocodedRoad;
  context.roadNameSource = roadNameSource;

  return evaluateRuleByKind(context);
}
