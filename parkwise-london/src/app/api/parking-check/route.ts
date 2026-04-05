import { NextResponse } from "next/server";
import { evaluateParking } from "@/lib/parking/evaluate";
import { reverseGeocodeWithNominatim } from "@/lib/parking/services/reverse-geocode";
import type { ParkingCheckRequest } from "@/types/parking";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ParkingCheckRequest>;

    if (
      typeof body.lat !== "number" ||
      typeof body.lng !== "number" ||
      !body.exemptions ||
      typeof body.exemptions.hasBlueBadge !== "boolean" ||
      typeof body.exemptions.vehicleType !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 },
      );
    }

    const liveReverseGeocode = await reverseGeocodeWithNominatim(body.lat, body.lng);
    const decision = evaluateParking(body as ParkingCheckRequest, {
      liveRoadName: liveReverseGeocode?.roadName ?? null,
    });

    return NextResponse.json(decision);
  } catch {
    return NextResponse.json(
      { error: "Unable to evaluate parking right now." },
      { status: 500 },
    );
  }
}
