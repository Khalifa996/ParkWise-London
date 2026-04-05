import { findBorough, findParkingBayRule } from "@/lib/parking/geo";
import { evaluateRuleByKind } from "@/lib/parking/rules/tower-hamlets";
import { getLondonTimeSnapshot } from "@/lib/parking/time";
import type {
  ParkingCheckRequest,
  ParkingDecision,
  ParkingEvaluationContext,
  ParkingStatus,
} from "@/types/parking";

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
  bayType: string,
  ruleSource: string,
  summary: string,
  details: string[],
  warningMessages: string[] = [],
): ParkingDecision {
  return {
    status,
    headline: headlineFromStatus(status),
    borough,
    bayType,
    checkedAt,
    ruleSource,
    vehicleType: request.exemptions.vehicleType,
    hasBlueBadge: request.exemptions.hasBlueBadge,
    explanation: {
      summary,
      details,
      warning: warningMessages[0],
    },
    warningMessages,
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

export function evaluateParking(request: ParkingCheckRequest): ParkingDecision {
  const snapshot = getLondonTimeSnapshot();
  const borough = findBorough(request.lat, request.lng);

  if (!borough) {
    return fallbackDecision(
      request,
      "limited",
      snapshot.label,
      "Outside supported boroughs",
      "Unknown",
      "Mock borough coverage",
      "This pin is outside the boroughs currently modeled in ParkWise London.",
      [
        "The v1 prototype only includes mocked Tower Hamlets coverage.",
        "Because the point is outside that supported area, the app cannot give a reliable legal parking decision yet.",
      ],
      ["Coverage is incomplete outside Tower Hamlets in this version."],
    );
  }

  const bayRule = findParkingBayRule(request.lat, request.lng, borough.name);

  if (!bayRule) {
    return fallbackDecision(
      request,
      "limited",
      snapshot.label,
      borough.name,
      "Unknown bay type",
      "Tower Hamlets mock zones",
      "The borough is known, but this exact point does not map to a parking rule yet.",
      [
        `The pin falls inside ${borough.name}, but not inside one of the mocked rule areas.`,
        "This usually means the prototype does not yet know the exact bay type or line marking for this location.",
      ],
      ["No street-level rule has been mapped for this exact point in v1."],
    );
  }

  const context: ParkingEvaluationContext = {
    day: snapshot.day,
    hour: snapshot.hour,
    checkedAt: snapshot.label,
    request,
    boroughName: borough.name,
    bayRule,
    isRestrictedNow: isRestrictedNow(snapshot.day, snapshot.hour, bayRule.restrictions),
  };

  return evaluateRuleByKind(context);
}
