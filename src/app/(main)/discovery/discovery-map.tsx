"use client";

import "leaflet/dist/leaflet.css";
import { type DivIcon, divIcon, type LatLngExpression } from "leaflet";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import type { DiscoveryOrigin, PlaceDTO } from "@/lib/discovery-queries";

const SG_CENTER: LatLngExpression = [1.3521, 103.8198];
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';
const TILE_URLS = {
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
};

function mapColors(isDark: boolean) {
  return {
    originFill: isDark ? "#f8fafc" : "#334155",
    originPaw: isDark ? "#334155" : "#ffffff",
    pawShell: isDark ? "#1e293b" : "#ffffff",
    placeFill: isDark ? "#cbd5e1" : "#64748b",
    radiusFill: isDark ? "#fb7185" : "#9f3a4c",
    radiusStroke: isDark ? "#fb7185" : "#9f3a4c",
    selectedFill: isDark ? "#fb7185" : "#9f3a4c",
    shellStroke: isDark ? "#020617" : "#ffffff",
  };
}

type MarkerColors = ReturnType<typeof mapColors>;

function pawSvg(fill: string) {
  return `
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <circle cx="9.2" cy="10.6" r="3.5" fill="${fill}" />
      <circle cx="16" cy="7.8" r="3.7" fill="${fill}" />
      <circle cx="22.8" cy="10.6" r="3.5" fill="${fill}" />
      <circle cx="26" cy="17" r="3.1" fill="${fill}" />
      <path d="M7.8 22.4c0-4.9 3.7-8.4 8.2-8.4s8.2 3.5 8.2 8.4c0 3.1-2.2 4.9-5.1 4.1a11.1 11.1 0 0 0-6.2 0c-2.9.8-5.1-1-5.1-4.1Z" fill="${fill}" />
    </svg>
  `;
}

function pawMarkerIcon({
  colors,
  inRadius = false,
  isOrigin = false,
  isSelected = false,
}: {
  colors: MarkerColors;
  inRadius?: boolean;
  isOrigin?: boolean;
  isSelected?: boolean;
}): DivIcon {
  const size = isSelected ? 40 : isOrigin ? 36 : 32;
  const height = isSelected ? 46 : isOrigin ? 42 : 38;
  const fill = isSelected
    ? colors.selectedFill
    : isOrigin
      ? colors.originFill
      : colors.placeFill;
  const pawFill = isOrigin ? colors.originPaw : colors.pawShell;
  return divIcon({
    className: "discovery-paw-marker",
    html: `
      <span
        class="discovery-paw-pin${isSelected ? " is-selected" : ""}${isOrigin ? " is-origin" : ""}${inRadius ? " is-in-radius" : ""}"
        style="--paw-pin-fill: ${fill}; --paw-pin-shell: ${colors.pawShell}; --paw-pin-stroke: ${colors.shellStroke};"
      >
        <span class="discovery-paw-pin__icon">${pawSvg(pawFill)}</span>
      </span>
    `,
    iconAnchor: [size / 2, height - 3],
    iconSize: [size, height],
    tooltipAnchor: [0, -height + 8],
  });
}

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
      map.setView(points[0], 13);
      return;
    }
    map.fitBounds(points, { padding: [64, 64], maxZoom: 13 });
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
  radiusKm,
  selectedId,
  onSelect,
}: {
  places: PlaceDTO[];
  origin: DiscoveryOrigin;
  radiusKm: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const colors = mapColors(isDark);
  const tileUrl = isDark ? TILE_URLS.dark : TILE_URLS.light;
  const pts = located(places);
  const center: LatLngExpression = origin
    ? [origin.lat, origin.lng]
    : pts[0]
      ? [pts[0].lat, pts[0].lng]
      : SG_CENTER;
  const selected = pts.find((p) => p.id === selectedId) ?? null;
  const fitPoints: [number, number][] = origin
    ? [
        [origin.lat, origin.lng],
        ...pts.map((p) => [p.lat, p.lng] as [number, number]),
      ]
    : pts.map((p) => [p.lat, p.lng] as [number, number]);

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom
      className="discovery-map size-full"
      style={{ background: "var(--muted)" }}
    >
      <TileLayer
        attribution={TILE_ATTRIBUTION}
        detectRetina
        key={tileUrl}
        maxZoom={19}
        url={tileUrl}
      />

      {origin ? (
        <Circle
          center={[origin.lat, origin.lng]}
          pathOptions={{
            color: colors.radiusStroke,
            fillColor: colors.radiusFill,
            fillOpacity: 0.08,
            opacity: 0.32,
            weight: 1.5,
          }}
          radius={radiusKm * 1000}
        />
      ) : null}

      {origin ? (
        <Marker
          icon={pawMarkerIcon({ colors, isOrigin: true })}
          position={[origin.lat, origin.lng]}
        >
          <Tooltip>{origin.label}</Tooltip>
        </Marker>
      ) : null}

      {pts.map((p) => {
        const isSelected = p.id === selectedId;
        const inRadius = p.distanceKm != null && p.distanceKm <= radiusKm;
        return (
          <Marker
            eventHandlers={{ click: () => onSelect(p.id) }}
            icon={pawMarkerIcon({ colors, inRadius, isSelected })}
            key={p.id}
            position={[p.lat, p.lng]}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              {p.name}
              {p.rating != null ? ` · ★${p.rating.toFixed(1)}` : ""}
            </Tooltip>
          </Marker>
        );
      })}

      <FitBounds points={fitPoints} />
      <PanToSelected target={selected ? [selected.lat, selected.lng] : null} />
    </MapContainer>
  );
}
