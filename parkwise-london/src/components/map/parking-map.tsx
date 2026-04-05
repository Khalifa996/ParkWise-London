"use client";

import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";

type ParkingMapProps = {
  center: [number, number];
  pin: [number, number] | null;
  userLocation: [number, number] | null;
  onPinChange: (coords: [number, number]) => void;
};

function MapClickHandler({ onPinChange }: { onPinChange: (coords: [number, number]) => void }) {
  useMapEvents({
    click(event) {
      onPinChange([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

function RecenterMap({ center }: { center: LatLngExpression }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
}

export function ParkingMap({ center, pin, userLocation, onPinChange }: ParkingMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={13}
      minZoom={11}
      className="h-[420px] w-full rounded-[28px]"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onPinChange={onPinChange} />
      <RecenterMap center={pin ?? userLocation ?? center} />
      {userLocation ? (
        <CircleMarker
          center={userLocation}
          radius={10}
          pathOptions={{
            color: "#0f172a",
            fillColor: "#2dd4bf",
            fillOpacity: 0.95,
            weight: 3,
          }}
        >
          <Popup>Your detected location</Popup>
        </CircleMarker>
      ) : null}
      {pin ? (
        <CircleMarker
          center={pin}
          radius={12}
          pathOptions={{
            color: "#ffffff",
            fillColor: "#1d4ed8",
            fillOpacity: 0.95,
            weight: 4,
          }}
        >
          <Popup>Selected parking check point</Popup>
        </CircleMarker>
      ) : null}
    </MapContainer>
  );
}
