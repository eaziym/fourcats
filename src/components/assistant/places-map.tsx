"use client";

import "leaflet/dist/leaflet.css";
import type { LatLngExpression } from "leaflet";
import {
  CalendarCheck,
  type LucideIcon,
  MapPin,
  Navigation,
  Phone,
  Scissors,
  Star,
  Stethoscope,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { ServicePlaceCard } from "@/lib/pet-data/format";

const SG_CENTER: LatLngExpression = [1.3521, 103.8198];
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';
const TILE_URLS = {
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
};

type LocatedPlace = ServicePlaceCard & { lat: number; lng: number };

function num(value: unknown): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function located(places: ServicePlaceCard[]): LocatedPlace[] {
  return places.flatMap((p) => {
    const lat = num(p.lat);
    const lng = num(p.lng);
    if (lat == null || lng == null) return [];
    return [{ ...p, lat, lng }];
  });
}

function needsCoords(places: ServicePlaceCard[]): boolean {
  return places.some((p) => num(p.lat) == null || num(p.lng) == null);
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  const sig = points.map((p) => p.join(",")).join(";");
  // biome-ignore lint/correctness/useExhaustiveDependencies: refit when marker set changes
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }
    map.fitBounds(points, { padding: [40, 40], maxZoom: 15 });
  }, [map, sig]);
  return null;
}

function PlacePopupContent({
  place,
  icon: Icon,
  onBook,
  bookingBusy,
}: {
  place: ServicePlaceCard;
  icon: LucideIcon;
  onBook?: (placeId: string, placeName: string) => void;
  bookingBusy?: boolean;
}) {
  const tags = place.tags.slice(0, 3);
  return (
    <div className="min-w-[220px] max-w-[280px] space-y-2.5 p-0.5">
      <div className="flex items-start gap-2">
        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/12 text-primary">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold leading-snug text-foreground">
            {place.name}
          </p>
          {place.address ? (
            <p className="text-xs leading-snug text-muted-foreground">
              {place.address}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground">
        {place.rating != null ? (
          <span className="inline-flex items-center gap-1 font-semibold text-foreground">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {place.rating.toFixed(1)}
            {place.reviewCount != null ? (
              <span className="font-normal text-muted-foreground">
                ({place.reviewCount})
              </span>
            ) : null}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <MapPin className="size-3" />
          {place.distanceKm} km
        </span>
      </div>
      {tags.length ? (
        <div className="flex flex-wrap gap-1">
          {tags.map((t) => (
            <span
              className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground/80"
              key={t}
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {place.phone ? (
          <a
            className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-muted"
            href={`tel:${place.phone}`}
          >
            <Phone className="size-3" />
            Call
          </a>
        ) : null}
        {place.googleMapsUrl ? (
          <a
            className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/20 dark:border-transparent dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
            href={place.googleMapsUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Navigation className="size-3" />
            Directions
          </a>
        ) : null}
        {place.websiteUrl ? (
          <a
            className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-muted"
            href={place.websiteUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Website
          </a>
        ) : null}
        {onBook ? (
          <button
            className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary disabled:opacity-50"
            disabled={bookingBusy}
            onClick={() => onBook(place.id, place.name)}
            type="button"
          >
            <CalendarCheck className="size-3" />
            {bookingBusy ? "…" : "Book"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function PlacesMap({
  places,
  variant = "groomer",
  onBookPlace,
  bookingPlaceId,
}: {
  places: ServicePlaceCard[];
  variant?: "groomer" | "vet";
  onBookPlace?: (placeId: string, placeName: string) => void;
  bookingPlaceId?: string | null;
}) {
  const [resolved, setResolved] = useState<ServicePlaceCard[]>(places);
  const [loading, setLoading] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);

  useEffect(() => {
    setResolved(places);
    setFetchFailed(false);
    if (!needsCoords(places)) return;

    let cancelled = false;
    setLoading(true);
    fetch("/api/places/coords", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ places }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load coordinates");
        return res.json() as Promise<{ places: ServicePlaceCard[] }>;
      })
      .then((data) => {
        if (!cancelled) setResolved(data.places);
      })
      .catch(() => {
        if (!cancelled) setFetchFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [places]);

  const pts = located(resolved);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const tileUrl = isDark ? TILE_URLS.dark : TILE_URLS.light;
  const Icon = variant === "vet" ? Stethoscope : Scissors;
  const unmapped = resolved.filter(
    (p) => num(p.lat) == null || num(p.lng) == null,
  );

  const center: LatLngExpression = pts[0]
    ? [pts[0].lat, pts[0].lng]
    : SG_CENTER;

  if (loading) {
    return (
      <div className="grid h-72 place-items-center rounded-2xl border border-border bg-muted/30 text-sm text-muted-foreground">
        Loading map…
      </div>
    );
  }

  if (pts.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        {fetchFailed
          ? "Couldn't load map coordinates — try refreshing or ask for recommendations again."
          : "Map unavailable for these locations — coordinates are missing."}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-border shadow-[var(--llp-sh-1)]">
        <MapContainer
          center={center}
          className="assistant-places-map h-72 w-full"
          scrollWheelZoom={false}
          style={{ background: "var(--muted)" }}
          zoom={13}
        >
          <TileLayer
            attribution={TILE_ATTRIBUTION}
            detectRetina
            key={tileUrl}
            maxZoom={19}
            url={tileUrl}
          />
          {pts.map((p) => {
            const isSelected = p.id === selectedId;
            const fill =
              variant === "vet"
                ? isSelected
                  ? "#e76f51"
                  : "#2a9d8f"
                : isSelected
                  ? "#e76f51"
                  : "#e9a23b";
            return (
              <CircleMarker
                center={[p.lat, p.lng]}
                eventHandlers={{
                  click: () => setSelectedId(p.id),
                }}
                key={p.id}
                pathOptions={{
                  color: "#ffffff",
                  weight: 2,
                  fillColor: fill,
                  fillOpacity: 0.95,
                }}
                radius={isSelected ? 11 : 8}
              >
                <Popup
                  className="llp-place-popup"
                  closeButton
                  maxWidth={300}
                  minWidth={220}
                >
                  <PlacePopupContent
                    bookingBusy={bookingPlaceId === p.id}
                    icon={Icon}
                    onBook={onBookPlace}
                    place={p}
                  />
                </Popup>
              </CircleMarker>
            );
          })}
          <FitBounds points={pts.map((p) => [p.lat, p.lng])} />
        </MapContainer>
      </div>
      <p className="text-xs text-muted-foreground">
        Tap a pin to see details · {pts.length} location
        {pts.length === 1 ? "" : "s"} on map
      </p>
      {unmapped.length > 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-3 text-xs text-muted-foreground">
          {unmapped.length} place{unmapped.length === 1 ? "" : "s"} without map
          coordinates: {unmapped.map((p) => p.name).join(", ")}
        </div>
      ) : null}
    </div>
  );
}
