import type {
  ParkingDecision,
  ParkingEvaluationContext,
  ParkingExplanation,
  ParkingStatus,
  RuleKind,
  VehicleType,
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
    bayType: context.bayRule.bayType,
    checkedAt: context.checkedAt,
    ruleSource: context.bayRule.name,
    vehicleType: context.request.exemptions.vehicleType,
    hasBlueBadge: context.request.exemptions.hasBlueBadge,
    explanation,
    warningMessages,
  };
}

function alwaysCaution(context: ParkingEvaluationContext, summary: string, details: string[]) {
  return decision(
    context,
    "limited",
    {
      summary,
      details,
      warning:
        "Street signs and local suspension notices can override this prototype result.",
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
          `The selected ${vehicle} does not have a resident permit in this v1 rule set.`,
          isBlueBadge
            ? "Blue Badge does not automatically override resident bay controls in this simplified Tower Hamlets example."
            : "No Blue Badge exemption is active for this check.",
          "Controlled hours are treated as Monday to Saturday, 08:30 to 17:30.",
        ],
        warning:
          "Resident bay signs can vary by street, so always confirm the nearby sign plate.",
      },
      ["Permit zones and resident bay signage may vary within the borough."],
    );
  }

  return decision(context, "allowed", {
    summary: "Outside controlled hours, this resident bay is treated as available in the mock rules.",
    details: [
      "The check falls outside the mocked Monday to Saturday control window.",
      "This prototype assumes the bay becomes generally available outside those hours.",
    ],
    warning: "Some resident bays stay controlled longer than this prototype models.",
  });
}

function evaluatePayByPhoneBay(context: ParkingEvaluationContext) {
  const isBlueBadge = context.request.exemptions.hasBlueBadge;
  const maxStay = context.bayRule.maxStayMinutes ?? 240;

  if (context.isRestrictedNow) {
    return decision(context, "limited", {
      summary: isBlueBadge
        ? "Blue Badge may allow parking here, but payment and local conditions should still be checked."
        : "This bay can usually be used during controlled hours if payment is made correctly.",
      details: [
        "The bay is modeled as a pay by phone location during controlled hours.",
        `The mock rule assumes a maximum stay of ${maxStay} minutes.`,
        isBlueBadge
          ? "Blue Badge is enabled, but local sign plates may still control whether payment is required."
          : "No exemption is applied, so the driver should expect to pay and follow the stay limit.",
      ],
      warning:
        "The app does not validate payment sessions, tariffs, or cashless provider requirements.",
    }, ["Payment method, tariff zone, and stay limits must be confirmed on street signage."]);
  }

  return decision(context, "allowed", {
    summary: "Outside controlled hours this pay by phone bay is treated as available in the mock rules.",
    details: [
      "The current time falls outside the charging period used in this prototype.",
      "This result assumes no extra event-day or overnight controls are in force.",
    ],
    warning: "Charging hours can differ by street and special event restrictions are not modeled.",
  });
}

function evaluateSharedUseBay(context: ParkingEvaluationContext) {
  const isBlueBadge = context.request.exemptions.hasBlueBadge;
  const vehicle = context.request.exemptions.vehicleType;
  const maxStay = context.bayRule.maxStayMinutes ?? 120;

  if (vehicle === "commercial") {
    return alwaysCaution(context, "Commercial vehicles need extra care in this shared use bay.", [
      "This prototype cannot confirm whether loading activity or business permits would apply here.",
      "Shared use bays often rely on local signs, payment, and permit conditions that vary by street.",
      `A general stay limit of ${maxStay} minutes is assumed in the mock data.`,
    ]);
  }

  if (context.isRestrictedNow) {
    return decision(context, "limited", {
      summary: isBlueBadge
        ? "Blue Badge may help here, but the bay still has time and sign-based conditions."
        : "This shared use bay is available only with the right permit or payment during controlled hours.",
      details: [
        `The mock rule applies a ${maxStay}-minute stay limit during controlled hours.`,
        isBlueBadge
          ? "Blue Badge is enabled, but local signing still matters because shared use bays can have extra conditions."
          : "Without an exemption, the driver would need to comply with pay-and-display or permit conditions.",
        "Controlled hours are modeled as Monday to Saturday, 08:30 to 17:30.",
      ],
      warning:
        "This result is limited because the app does not check payment, permits, or street-specific machine instructions.",
    }, ["Shared use bays often depend on permit zones or payment rules not fully modeled in v1."]);
  }

  return decision(context, "allowed", {
    summary: "Outside controlled hours, this shared use bay is treated as available in the mock rules.",
    details: [
      "The selected time is outside the active shared use control window.",
      "This prototype assumes the bay is unrestricted outside those hours.",
    ],
    warning: "Special event-day, suspended-bay, or overnight controls are not modeled here.",
  });
}

function evaluateSingleYellowLine(context: ParkingEvaluationContext) {
  if (context.isRestrictedNow) {
    return decision(context, "not_allowed", {
      summary: "You should not park on this single yellow line during the controlled period.",
      details: [
        "The line is modeled as active Monday to Saturday, 08:30 to 17:30.",
        context.request.exemptions.hasBlueBadge
          ? "Blue Badge is enabled, but this prototype does not confidently model loading bans or local Blue Badge exceptions here."
          : "No exemption is active for this check.",
        "Single yellow line rules depend heavily on nearby plates and any loading restrictions.",
      ],
      warning:
        "Because line controls can vary street by street, confirm the nearby sign before relying on this result.",
    }, ["Single yellow lines may also carry loading restrictions that this prototype does not fully map."]);
  }

  return decision(context, "allowed", {
    summary: "This single yellow line is treated as outside its restricted hours right now.",
    details: [
      "The current time falls outside the mocked waiting restriction window.",
      "This result assumes no additional loading ban or event restriction is active.",
    ],
    warning: "Single yellow lines often need a street sign check because hours are not universal.",
  });
}

function evaluateDoubleYellowLine(context: ParkingEvaluationContext) {
  if (context.request.exemptions.hasBlueBadge) {
    return decision(context, "limited", {
      summary: "Double yellow lines are generally restricted, but Blue Badge can create a narrow exception.",
      details: [
        "This prototype treats double yellow lines as no waiting at any time.",
        "Blue Badge may allow a short stop in some real-world cases, but not where loading bans or other local restrictions apply.",
        "The app does not know whether kerb blips or extra bans are present at this exact point.",
      ],
      warning:
        "This is intentionally cautious because double yellow line exemptions depend on street-level signs and kerb markings.",
    }, ["Possible Blue Badge exception is uncertain because loading bans are not modeled."]);
  }

  return decision(context, "not_allowed", {
    summary: "This double yellow line is treated as no waiting at any time.",
    details: [
      "The mock rule assumes the restriction runs 24 hours a day, 7 days a week.",
      "No exemption is active in this check.",
    ],
    warning: "Stopping for loading, picking up, or exemptions is not modeled in this prototype.",
  });
}

function evaluateLoadingBay(context: ParkingEvaluationContext) {
  if (context.request.exemptions.vehicleType === "commercial") {
    return decision(context, "limited", {
      summary: "A commercial vehicle may be able to use this loading bay while actively loading or unloading.",
      details: [
        "The bay is modeled as a loading-only space during active hours.",
        "The app cannot verify whether loading is genuinely taking place or how long is permitted.",
        "Outside loading activity, waiting or general parking should not be assumed to be allowed.",
      ],
      warning:
        "Loading bay use usually depends on active loading, vehicle class, and street signs that this prototype does not inspect.",
    }, ["Active loading requirements and stay limits are uncertain here."]);
  }

  if (context.isRestrictedNow) {
    return decision(context, "not_allowed", {
      summary: "This loading bay is reserved for loading activity during its active period.",
      details: [
        "The selected vehicle is not treated as a loading vehicle in this check.",
        "The mock rule applies loading bay controls Monday to Saturday, 07:00 to 19:00.",
      ],
      warning: "Some loading bays have exceptions, but this prototype does not model them.",
    });
  }

  return decision(context, "limited", {
    summary: "Outside active loading hours, this loading bay may still have local restrictions.",
    details: [
      "The bay is outside the mocked loading-control window right now.",
      "This prototype cannot confirm whether the bay becomes general parking or remains specially signed.",
    ],
    warning: "Loading bays vary widely by sign plate, so this result stays cautious.",
  }, ["Loading bays often stay restricted or convert to different uses outside core hours."]);
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
  return evaluators[context.bayRule.kind](context);
}
