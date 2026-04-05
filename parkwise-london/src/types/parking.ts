export type ParkingStatus = "allowed" | "not_allowed" | "limited";

export type VehicleType = "car" | "motorcycle" | "electric" | "commercial";

export type RuleKind =
  | "resident_bay"
  | "pay_by_phone_bay"
  | "shared_use_bay"
  | "single_yellow_line"
  | "double_yellow_line"
  | "loading_bay";

export type UserExemptions = {
  hasBlueBadge: boolean;
  vehicleType: VehicleType;
};

export type ParkingCheckRequest = {
  lat: number;
  lng: number;
  exemptions: UserExemptions;
};

export type TimeRule = {
  days: number[];
  startHour: number;
  endHour: number;
  maxStayMinutes?: number;
};

export type ParkingBayRule = {
  id: string;
  name: string;
  borough: string;
  bayType: string;
  kind: RuleKind;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  restrictions: TimeRule[];
  maxStayMinutes?: number;
};

export type BoroughDefinition = {
  id: string;
  name: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
};

export type ParkingExplanation = {
  summary: string;
  details: string[];
  warning?: string;
};

export type ParkingDecision = {
  status: ParkingStatus;
  headline: string;
  borough: string;
  bayType: string;
  checkedAt: string;
  ruleSource: string;
  vehicleType: VehicleType;
  hasBlueBadge: boolean;
  explanation: ParkingExplanation;
  warningMessages: string[];
};

export type ParkingEvaluationContext = {
  day: number;
  hour: number;
  checkedAt: string;
  request: ParkingCheckRequest;
  boroughName: string;
  bayRule: ParkingBayRule;
  isRestrictedNow: boolean;
};
