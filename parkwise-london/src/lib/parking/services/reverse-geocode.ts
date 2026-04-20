const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/reverse";
const REQUEST_TIMEOUT_MS = 5000;

export type ReverseGeocodeLookup = {
  roadName: string | null;
  displayName: string | null;
  source: "live_reverse_geocode" | "mock_feature";
};

type NominatimReverseResponse = {
  display_name?: string;
  address?: {
    road?: string;
    pedestrian?: string;
    footway?: string;
    cycleway?: string;
    path?: string;
    residential?: string;
    suburb?: string;
    neighbourhood?: string;
  };
};

function pickRoadName(address: NominatimReverseResponse["address"]) {
  if (!address) {
    return null;
  }

  return (
    address.road ??
    address.pedestrian ??
    address.footway ??
    address.cycleway ??
    address.path ??
    address.residential ??
    address.suburb ??
    address.neighbourhood ??
    null
  );
}

export async function reverseGeocodeWithNominatim(
  lat: number,
  lng: number,
): Promise<ReverseGeocodeLookup | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const searchParams = new URLSearchParams({
      format: "jsonv2",
      lat: String(lat),
      lon: String(lng),
      zoom: "18",
      addressdetails: "1",
    });

    const response = await fetch(`${NOMINATIM_ENDPOINT}?${searchParams.toString()}`, {
      headers: {
        "Accept": "application/json",
        "Accept-Language": "en-GB,en;q=0.9",
        "User-Agent": "ParkWiseLondon/0.1 (Tower Hamlets prototype)",
      },
      signal: controller.signal,
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as NominatimReverseResponse;
    const roadName = pickRoadName(data.address);

    if (!roadName) {
      return null;
    }

    return {
      roadName,
      displayName: data.display_name ?? null,
      source: "live_reverse_geocode",
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
