import type {
  ParkingDecision,
  ParkingEvaluationContext,
  ParkingExplanation,
  ParkingStatus,
  RuleKind,
  VehicleType,
} from "@/types/parking";

const ROADSIDE_SIGNS_WARNING =
  "Roadside signs, kerb markings, and bay plates always override ParkWise guidance.";

function headlineFromStatus(status: ParkingStatus) {
  if (status === "allowed") {
    return "Parking looks allowed";
  }

  if (status === "limited") {
    return "Parking is limited";
  }

  return "Parking is not allowed";
}

function vehicleLabel(vehicleType: VehicleType) {
  switch (vehicleType) {
    case "motorcycle":
      return "motorcycle";
    case "electric":
      return "electric vehicle";
    case "commercial":
      return "commercial vehicle";
    default:
      return "car";
  }
}

function withRoadsideWarning(warningMessages: string[]) {
  return warningMessages.includes(ROADSIDE_SIGNS_WARNING)
    ? warningMessages
    : [ROADSIDE_SIGNS_WARNING, ...warningMessages];
}

function decision(
  context: ParkingEvaluationContext,
  status: ParkingStatus,
  explanation: ParkingExplanation,
  warningMessages: string[] = [],
): ParkingDecision {
  return {
    status,
    headline: headlineFromStatus(status),
    borough: context.boroughName,
    roadName: context.resolvedRoadName,
    roadNameSource: context.roadNameSource,
    bayType: context.feature.bayType,
    restrictionObjectName: context.feature.restrictionObjectName,
    restrictionTimes: context.feature.restrictionTimesLabel,
    checkedAt: context.checkedAt,
    ruleSource: context.feature.name,
    matchedZoneName: context.feature.name,
    vehicleType: context.request.exemptions.vehicleType,
    hasBlueBadge: context.request.exemptions.hasBlueBadge,
    explanation,
    warningMessages: withRoadsideWarning(warningMessages),
  };
}

function alwaysCaution(context: ParkingEvaluationContext, summary: string, details: string[]) {
  return decision(
    context,
    "limited",
    {
      summary,
      details,
      warning: "This road-aware result still uses mocked Tower Hamlets feature data.",
    },
    ["Local signs, temporary suspensions, and permit conditions may change the legal position."],
  );
}

function evaluateResidentBay(context: ParkingEvaluationContext) {
  const isBlueBadge = context.request.exemptions.hasBlueBadge;
  const vehicle = vehicleLabel(context.request.exemptions.vehicleType);

  if (context.isRestrictedNow) {
    return decision(
      context,
      "not_allowed",
      {
        summary: "This resident bay is reserved for permit holders during controlled hours.",
        details: [
          `The selected ${vehicle} does not have a resident permit in this mock Tower Hamlets feature.`,
          isBlueBadge
            ? "Blue Badge does not automatically override resident bay controls in this simplified example."
            : "No Blue Badge exemption is active for this check.",
          `Restriction times for this road segment are ${context.feature.restrictionTimesLabel}.`,
        ],
        warning: "Resident bay controls can vary by sign plate even along the same road.",
      },
      ["Permit zones and resident bay signage may vary within the borough."],
    );
  }

  return decision(context, "allowed", {
    summary: "Outside controlled hours, this resident bay is treated as available in the mock rules.",
    details: [
      `This mapped road feature is outside its control window of ${context.feature.restrictionTimesLabel}.`,
      "The prototype assumes the bay becomes generally available outside those hours.",
    ],
    warning: "Some resident bays stay controlled longer than this prototype models.",
  });
}

function evaluatePayByPhoneBay(context: ParkingEvaluationContext) {
  const isBlueBadge = context.request.exemptions.hasBlueBadge;
  const maxStay = context.feature.maxStayMinutes ?? 240;

  if (context.isRestrictedNow) {
    return decision(
      context,
      "limited",
      {
        summary: isBlueBadge
          ? "Blue Badge may help here, but payment and local conditions should still be checked."
          : "This bay can usually be used during controlled hours if payment is made correctly.",
        details: [
          `The mapped feature on ${context.feature.roadName} is treated as a pay by phone bay.`,
          `Restriction times are ${context.feature.restrictionTimesLabel}.`,
          `The mock rule assumes a maximum stay of ${maxStay} minutes.`,
          isBlueBadge
            ? "Blue Badge is enabled, but local sign plates may still control whether payment is required."
            : "No exemption is applied, so the driver should expect to pay and follow the stay limit.",
        ],
        warning: "The app does not validate payment sessions, tariffs, or cashless provider requirements.",
      },
      ["Payment method, tariff zone, and stay limits must be confirmed on street signage."],
    );
  }

  return decision(context, "allowed", {
    summary: "Outside controlled hours this pay by phone bay is treated as available in the mock rules.",
    details: [
      `The current time falls outside the mapped charging period of ${context.feature.restrictionTimesLabel}.`,
      "This result assumes no extra event-day or overnight controls are in force.",
    ],
    warning: "Charging hours can differ by street and special event restrictions are not modeled.",
  });
}

function evaluateSharedUseBay(context: ParkingEvaluationContext) {
  const isBlueBadge = context.request.exemptions.hasBlueBadge;
  const vehicle = context.request.exemptions.vehicleType;
  const maxStay = context.feature.maxStayMinutes ?? 120;

  if (vehicle === "commercial") {
    return alwaysCaution(context, "Commercial vehicles need extra care in this shared use bay.", [
      `The mapped feature on ${context.feature.roadName} uses a shared use rule with ${context.feature.restrictionTimesLabel} controls.`,
      "This prototype cannot confirm whether loading activity or business permits would apply here.",
      `A general stay limit of ${maxStay} minutes is assumed in the mock data.`,
    ]);
  }

  if (context.isRestrictedNow) {
    return decision(
      context,
      "limited",
      {
        summary: isBlueBadge
          ? "Blue Badge may help here, but the bay still has time and sign-based conditions."
          : "This shared use bay is available only with the right permit or payment during controlled hours.",
        details: [
          `This road feature is restricted during ${context.feature.restrictionTimesLabel}.`,
          `The mock rule applies a ${maxStay}-minute stay limit during controlled hours.`,
          isBlueBadge
            ? "Blue Badge is enabled, but local signing still matters because shared use bays can have extra conditions."
            : "Without an exemption, the driver would need to comply with permit or payment conditions.",
        ],
        warning: "This result is limited because the app does not check payment, permits, or machine instructions.",
      },
      ["Shared use bays often depend on permit zones or payment rules not fully modeled in v1."],
    );
  }

  return decision(context, "allowed", {
    summary: "Outside controlled hours, this shared use bay is treated as available in the mock rules.",
    details: [
      `The selected time is outside this feature's control window of ${context.feature.restrictionTimesLabel}.`,
      "This prototype assumes the bay is unrestricted outside those hours.",
    ],
    warning: "Special event-day, suspended-bay, or overnight controls are not modeled here.",
  });
}

function evaluateSingleYellowLine(context: ParkingEvaluationContext) {
  if (context.isRestrictedNow) {
    return decision(
      context,
      "not_allowed",
      {
        summary: "You should not park on this single yellow line during the controlled period.",
        details: [
          `The mapped line restriction on ${context.feature.roadName} is treated as active ${context.feature.restrictionTimesLabel}.`,
          context.request.exemptions.hasBlueBadge
            ? "Blue Badge is enabled, but this prototype does not confidently model loading bans or local exceptions here."
            : "No exemption is active for this check.",
          "Single yellow line rules depend heavily on nearby plates and any loading restrictions.",
        ],
        warning: "Because line controls can vary street by street, confirm the nearby sign before relying on this result.",
      },
      ["Single yellow lines may also carry loading restrictions that this prototype does not fully map."],
    );
  }

  return decision(context, "allowed", {
    summary: "This single yellow line is treated as outside its restricted hours right now.",
    details: [
      `The current time falls outside the mapped waiting restriction window of ${context.feature.restrictionTimesLabel}.`,
      "This result assumes no additional loading ban or event restriction is active.",
    ],
    warning: "Single yellow lines often need a street sign check because hours are not universal.",
  });
}

function evaluateDoubleYellowLine(context: ParkingEvaluationContext) {
  if (context.request.exemptions.hasBlueBadge) {
    return decision(
      context,
      "limited",
      {
        summary: "Double yellow lines are generally restricted, but Blue Badge can create a narrow exception.",
        details: [
          `This mapped feature on ${context.feature.roadName} is treated as restricted ${context.feature.restrictionTimesLabel}.`,
          "Blue Badge may allow a short stop in some real-world cases, but not where loading bans or other local restrictions apply.",
          "The app does not know whether kerb blips or extra bans are present at this exact point.",
        ],
        warning: "This is intentionally cautious because double yellow line exemptions depend on street-level signs and kerb markings.",
      },
      ["Possible Blue Badge exception is uncertain because loading bans are not modeled."],
    );
  }

  return decision(context, "not_allowed", {
    summary: "This double yellow line is treated as no waiting at any time.",
    details: [
      `The mapped feature on ${context.feature.roadName} is restricted ${context.feature.restrictionTimesLabel}.`,
      "No exemption is active in this check.",
    ],
    warning: "Stopping for loading, picking up, or exemptions is not modeled in this prototype.",
  });
}

function evaluateLoadingBay(context: ParkingEvaluationContext) {
  if (context.request.exemptions.vehicleType === "commercial") {
    return decision(
      context,
      "limited",
      {
        summary: "A commercial vehicle may be able to use this loading bay while actively loading or unloading.",
        details: [
          `The mapped restriction object on ${context.feature.roadName} is a loading bay active ${context.feature.restrictionTimesLabel}.`,
          "The app cannot verify whether loading is genuinely taking place or how long is permitted.",
          "Outside loading activity, waiting or general parking should not be assumed to be allowed.",
        ],
        warning: "Loading bay use usually depends on active loading, vehicle class, and street signs that this prototype does not inspect.",
      },
      ["Active loading requirements and stay limits are uncertain here."],
    );
  }

  if (context.isRestrictedNow) {
    return decision(context, "not_allowed", {
      summary: "This loading bay is reserved for loading activity during its active period.",
      details: [
        "The selected vehicle is not treated as a loading vehicle in this check.",
        `Restriction times for this mapped loading bay are ${context.feature.restrictionTimesLabel}.`,
      ],
      warning: "Some loading bays have exceptions, but this prototype does not model them.",
    });
  }

  return decision(
    context,
    "limited",
    {
      summary: "Outside active loading hours, this loading bay may still have local restrictions.",
      details: [
        `The bay is outside the mapped loading-control window of ${context.feature.restrictionTimesLabel} right now.`,
        "This prototype cannot confirm whether the bay becomes general parking or remains specially signed.",
      ],
      warning: "Loading bays vary widely by sign plate, so this result stays cautious.",
    },
    ["Loading bays often stay restricted or convert to different uses outside core hours."],
  );
}

const evaluators: Record<RuleKind, (context: ParkingEvaluationContext) => ParkingDecision> = {
  resident_bay: evaluateResidentBay,
  pay_by_phone_bay: evaluatePayByPhoneBay,
  shared_use_bay: evaluateSharedUseBay,
  single_yellow_line: evaluateSingleYellowLine,
  double_yellow_line: evaluateDoubleYellowLine,
  loading_bay: evaluateLoadingBay,
};

export function evaluateRuleByKind(context: ParkingEvaluationContext) {
  return evaluators[context.feature.kind](context);
}

export { ROADSIDE_SIGNS_WARNING };
