"use client";

import "leaflet/dist/leaflet.css";
import type { LatLngExpression } from "leaflet";
import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import type { DiscoveryOrigin, PlaceDTO } from "@/lib/discovery-queries";

const SG_CENTER: LatLngExpression = [1.3521, 103.8198];

type Located = PlaceDTO & { lat: number; lng: number };

function located(places: PlaceDTO[]): Located[] {
  return places.filter((p): p is Located => p.lat != null && p.lng != null);
}

// Fit to the marker set when it changes (e.g. switching groomers <-> vets).
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  const sig = points.map((p) => p.join(",")).join(";");
  // biome-ignore lint/correctness/useExhaustiveDependencies: refit only when the set changes
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }
    map.fitBounds(points, { padding: [48, 48], maxZoom: 15 });
  }, [map, sig]);
  return null;
}

// Pan to the selected place without changing zoom.
function PanToSelected({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.panTo(target, { animate: true });
  }, [map, target?.[0], target?.[1]]);
  return null;
}

export default function DiscoveryMap({
  places,
  origin,
  selectedId,
  onSelect,
}: {
  places: PlaceDTO[];
  origin: DiscoveryOrigin;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const pts = located(places);
  const center: LatLngExpression = origin
    ? [origin.lat, origin.lng]
    : pts[0]
      ? [pts[0].lat, pts[0].lng]
      : SG_CENTER;
  const selected = pts.find((p) => p.id === selectedId) ?? null;

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom
      className="size-full"
      style={{ background: "var(--muted)" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {origin ? (
        <CircleMarker
          center={[origin.lat, origin.lng]}
          radius={9}
          pathOptions={{
            color: "#ffffff",
            weight: 3,
            fillColor: "#1d3557",
            fillOpacity: 1,
          }}
        >
          <Tooltip>{origin.label}</Tooltip>
        </CircleMarker>
      ) : null}

      {pts.map((p) => {
        const isSelected = p.id === selectedId;
        const fill = isSelected
          ? "#e76f51"
          : p.kind === "vet"
            ? "#2a9d8f"
            : "#e9a23b";
        return (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={isSelected ? 11 : 8}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: fill,
              fillOpacity: 0.9,
            }}
            eventHandlers={{ click: () => onSelect(p.id) }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              {p.name}
              {p.rating != null ? ` · ★${p.rating.toFixed(1)}` : ""}
            </Tooltip>
          </CircleMarker>
        );
      })}

      <FitBounds points={pts.map((p) => [p.lat, p.lng])} />
      <PanToSelected target={selected ? [selected.lat, selected.lng] : null} />
    </MapContainer>
  );
}
