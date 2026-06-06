"use client";

import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Cross,
  ExternalLink,
  Globe,
  MapPin,
  Phone,
  Quote,
  Radar,
  Scissors,
  Search,
  ShoppingBag,
  Star,
  Store,
  Utensils,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pill, SpotlightCard } from "@/components/pet-care/primitives";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import type {
  DiscoveryData,
  DiscoveryOrigin,
  PlaceDTO,
  ProductDTO,
} from "@/lib/discovery-queries";
import { petAvatarSrc } from "@/lib/pet-data";
import { cn } from "@/lib/utils";
import { loadDiscoveryAtCoords } from "./actions";

const DiscoveryMap = dynamic(() => import("./discovery-map"), {
  ssr: false,
  loading: () => (
    <div className="grid size-full place-items-center bg-muted/40 text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
});

type Tab = "groomer" | "vet" | "pet_store" | "cafe" | "food";
type PetSummary = {
  name: string;
  species: string;
  photoUrl: string | null;
  medicalConditions: string[];
};

const TABS: { id: Tab; label: string; icon: typeof Scissors }[] = [
  { id: "groomer", label: "Groomers", icon: Scissors },
  { id: "vet", label: "Vets", icon: Cross },
  { id: "pet_store", label: "Pet stores", icon: Store },
  { id: "cafe", label: "Cafes", icon: Coffee },
  { id: "food", label: "Food", icon: ShoppingBag },
];

const PAGE_SIZE: Record<Tab, number> = {
  groomer: 30,
  vet: 30,
  pet_store: 30,
  cafe: 30,
  food: 30,
};

function placeIcon(kind: string): typeof Scissors {
  if (kind === "vet") return Cross;
  if (kind === "pet_store") return Store;
  if (kind === "cafe") return Coffee;
  return Scissors;
}

const DEFAULT_RADIUS_KM = 8;
const MIN_RADIUS_KM = 2;
const MAX_RADIUS_KM = 20;
const RADIUS_STEP_KM = 1;

function money(cents: number | null): string | null {
  return cents == null ? null : `S$${(cents / 100).toFixed(2)}`;
}

function priceRange(p: ProductDTO): string {
  const lo = money(p.priceMinCents);
  if (!lo) return "Price on request";
  const hi = money(p.priceMaxCents);
  return hi && p.priceMaxCents !== p.priceMinCents ? `${lo}–${hi}` : lo;
}

function distanceLabel(p: PlaceDTO): string {
  if (p.distanceKm != null) return `${p.distanceKm.toFixed(1)} km away`;
  if (p.neighbourhood) return p.neighbourhood;
  return "Singapore";
}

function ratingLabel(p: PlaceDTO): string | null {
  if (p.rating == null) return null;
  const count = p.userRatingCount ? ` (${p.userRatingCount})` : "";
  return `${p.rating.toFixed(1)}${count}`;
}

function isWithinRadius(place: PlaceDTO, radiusKm: number): boolean {
  return place.distanceKm != null && place.distanceKm <= radiusKm;
}

function sortByDistance(a: PlaceDTO, b: PlaceDTO): number {
  if (a.distanceKm != null && b.distanceKm != null) {
    return a.distanceKm - b.distanceKm;
  }
  if (a.distanceKm != null) return -1;
  if (b.distanceKm != null) return 1;
  return (b.rating ?? 0) - (a.rating ?? 0);
}

function supplierLabel(product: ProductDTO): string {
  return product.source === "kohepets" ? "Kohepets" : product.source;
}

// ---------------------------------------------------------------------------
// Resolve a server-passed promise into local state so each category loads
// independently and the UI shows per-tab loading indicators.
// ---------------------------------------------------------------------------
function usePromise<T>(promise: Promise<T>): T | undefined {
  const [value, setValue] = useState<T | undefined>(undefined);
  useEffect(() => {
    let active = true;
    promise.then((v) => {
      if (active) setValue(v);
    });
    return () => {
      active = false;
    };
  }, [promise]);
  return value;
}

const PANEL_H = "md:h-[calc(100dvh-66px)]";

export function DiscoveryView({
  origin,
  groomers: groomersPromise,
  vets: vetsPromise,
  petStores: petStoresPromise,
  cafes: cafesPromise,
  food: foodPromise,
  pet,
}: {
  origin: DiscoveryOrigin;
  groomers: Promise<PlaceDTO[]>;
  vets: Promise<PlaceDTO[]>;
  petStores: Promise<PlaceDTO[]>;
  cafes: Promise<PlaceDTO[]>;
  food: Promise<ProductDTO[]>;
  pet: PetSummary;
}) {
  const initialGroomers = usePromise(groomersPromise);
  const initialVets = usePromise(vetsPromise);
  const initialPetStores = usePromise(petStoresPromise);
  const initialCafes = usePromise(cafesPromise);
  const initialFood = usePromise(foodPromise);
  const [discoveryData, setDiscoveryData] = useState<DiscoveryData | null>(
    null,
  );
  const [locating, setLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>("groomer");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const currentOrigin = discoveryData?.origin ?? origin;
  const groomers = discoveryData?.groomers ?? initialGroomers;
  const vets = discoveryData?.vets ?? initialVets;
  const petStores = discoveryData?.petStores ?? initialPetStores;
  const cafes = discoveryData?.cafes ?? initialCafes;
  const food = discoveryData?.food ?? initialFood;

  const refreshWithGps = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setLocationNotice("Location isn't available in this browser.");
      setLocating(false);
      return;
    }

    setLocating(true);
    setLocationNotice(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const next = await loadDiscoveryAtCoords(
          pos.coords.latitude,
          pos.coords.longitude,
        );
        if (next) {
          setDiscoveryData(next);
          setPage(1);
          setSelectedId(null);
        } else {
          setDiscoveryData(null);
          setLocationNotice(
            origin
              ? "GPS fix is outside Singapore — showing your pet's saved area instead."
              : "GPS fix is outside Singapore.",
          );
        }
        setLocating(false);
      },
      (geoError) => {
        setLocating(false);
        setDiscoveryData(null);
        const savedLabel = origin?.label;
        if (savedLabel) {
          setLocationNotice(
            geoError.code === 1
              ? `Location access blocked — showing listings ${savedLabel}.`
              : `Couldn't get GPS — showing listings ${savedLabel}.`,
          );
          return;
        }
        setLocationNotice(
          geoError.code === 1
            ? "Allow location access to see nearby services on the map."
            : "Couldn't get your location. Add a postal code in Pet Profiles.",
        );
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60_000 },
    );
  }, [origin]);

  // Pet profile postal code is the default anchor; only fall back to GPS when none is saved.
  useEffect(() => {
    if (origin) return;
    refreshWithGps();
  }, [origin, refreshWithGps]);

  const isFood = tab === "food";

  // Resolved places for the active non-food tab (undefined while loading).
  const activePlaces: PlaceDTO[] | undefined = (() => {
    if (tab === "groomer") return groomers;
    if (tab === "vet") return vets;
    if (tab === "pet_store") return petStores;
    if (tab === "cafe") return cafes;
    return undefined;
  })();

  const activeFood = isFood ? food : undefined;
  const isTabLoading = isFood ? food === undefined : activePlaces === undefined;

  // Count per tab (undefined = still loading).
  function tabCount(t: Tab): number | undefined {
    if (t === "groomer") return groomers?.length;
    if (t === "vet") return vets?.length;
    if (t === "pet_store") return petStores?.length;
    if (t === "cafe") return cafes?.length;
    if (t === "food") return food?.length;
    return undefined;
  }

  const q = query.trim().toLowerCase();

  const filteredPlaces = useMemo(() => {
    if (isFood || !activePlaces) return [];
    const matched = q
      ? activePlaces.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.neighbourhood?.toLowerCase().includes(q) ||
            p.serviceTags.some((t) => t.toLowerCase().includes(q)),
        )
      : activePlaces;
    return [...matched].sort(sortByDistance);
  }, [isFood, activePlaces, q]);

  const filteredFood = useMemo(() => {
    if (!isFood || !activeFood) return [];
    if (!q) return activeFood;
    return activeFood.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.ingredients?.toLowerCase().includes(q),
    );
  }, [isFood, activeFood, q]);

  const pageSize = PAGE_SIZE[tab];
  const totalResults = isFood ? filteredFood.length : filteredPlaces.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = totalResults === 0 ? 0 : (currentPage - 1) * pageSize;
  const pageEnd = Math.min(totalResults, pageStart + pageSize);
  const visiblePlaces = useMemo(
    () => filteredPlaces.slice(pageStart, pageEnd),
    [filteredPlaces, pageStart, pageEnd],
  );
  const visibleFood = useMemo(
    () => filteredFood.slice(pageStart, pageEnd),
    [filteredFood, pageStart, pageEnd],
  );

  const selectedPlace = isFood
    ? null
    : (visiblePlaces.find((p) => p.id === selectedId) ?? null);
  const selectedProduct = isFood
    ? (visibleFood.find((p) => p.id === selectedId) ?? null)
    : null;

  const near = currentOrigin?.label ?? "Singapore";
  const activeLabel = TABS.find((t) => t.id === tab)?.label.toLowerCase() ?? "";
  const resultLabel = isFood ? "food" : activeLabel;
  const inRadiusCount =
    !isFood && currentOrigin && activePlaces
      ? filteredPlaces.filter((p) => isWithinRadius(p, radiusKm)).length
      : 0;

  // Categories still loading, for the status line.
  const loadingLabels = TABS.filter((t) => tabCount(t.id) === undefined).map(
    (t) => t.label.toLowerCase(),
  );

  function changePage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
    setSelectedId(null);
  }

  return (
    <main className="flex min-h-0 flex-col overflow-hidden bg-background md:flex-row">
      {/* List panel */}
      <section
        className={cn(
          "z-10 flex min-h-0 w-full flex-col overflow-hidden border-r border-border bg-card shadow-sm md:w-[480px] md:shrink-0",
          PANEL_H,
        )}
      >
        <div className="shrink-0 border-b border-border p-5 md:p-7">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Local discovery
          </h2>
          <p className="mt-1 text-muted-foreground">
            {isFood
              ? `Food picks for ${pet.name}.`
              : `Trusted ${activeLabel} ${near}.`}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {currentOrigin ? (
              <Pill
                className={cn(
                  currentOrigin.source === "gps" &&
                    "border-primary/30 bg-primary/10 text-primary",
                )}
              >
                <MapPin className="size-3.5" />
                {currentOrigin.label}
              </Pill>
            ) : locating ? (
              <Pill>
                <Radar className="size-3.5 animate-spin" />
                Finding your location…
              </Pill>
            ) : null}
            <Button
              className="h-7 rounded-full px-3 text-xs"
              disabled={locating}
              onClick={refreshWithGps}
              size="sm"
              type="button"
              variant="outline"
            >
              {locating
                ? "Locating…"
                : currentOrigin?.source === "gps"
                  ? "Update location"
                  : "Use current location"}
            </Button>
          </div>
          {locationNotice ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {locationNotice}
            </p>
          ) : null}
          <div className="relative mt-4">
            <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-11 rounded-xl pl-11 pr-4"
              placeholder={`Search ${activeLabel}…`}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
                setSelectedId(null);
              }}
            />
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-primary/25 bg-gradient-to-r from-primary/10 to-card p-2">
            <Avatar className="size-9">
              <AvatarImage alt={pet.name} src={petAvatarSrc(pet)} />
              <AvatarFallback>
                {pet.name.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                Top picks for {pet.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {pet.medicalConditions.length > 0
                  ? `Prioritising: ${pet.medicalConditions.slice(0, 2).join(", ")}`
                  : isFood
                    ? "Matched to your pet's species"
                    : "Ranked by distance & rating"}
              </p>
            </div>
            <Link
              className="ml-auto shrink-0 px-2 text-sm font-semibold text-primary"
              href="/profiles"
            >
              Edit
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {TABS.map((t) => {
              const Icon = t.icon;
              const count = tabCount(t.id);
              const activeTab = tab === t.id;
              return (
                <Button
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    activeTab
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-muted/60 text-foreground hover:bg-muted",
                  )}
                  key={t.id}
                  onClick={() => {
                    setTab(t.id);
                    setSelectedId(null);
                    setQuery("");
                    setPage(1);
                  }}
                  type="button"
                >
                  <Icon className="size-4" />
                  {t.label}
                  <span
                    className={cn(
                      "flex items-center justify-center rounded-full px-1.5 text-xs tabular-nums",
                      activeTab ? "bg-primary-foreground/20" : "bg-background",
                    )}
                  >
                    {count !== undefined ? (
                      count
                    ) : (
                      <Spinner
                        className={cn(
                          "size-3",
                          activeTab
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground",
                        )}
                      />
                    )}
                  </span>
                </Button>
              );
            })}
          </div>

          {loadingLabels.length > 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
              <Spinner className="size-3.5 shrink-0 text-primary" />
              <p className="truncate text-xs text-muted-foreground">
                Loading {loadingLabels.join(", ")}…
              </p>
            </div>
          )}

          {!isFood && currentOrigin ? (
            <RadiusControl
              count={inRadiusCount}
              label={activeLabel}
              radiusKm={radiusKm}
              onRadiusChange={(value) => {
                setRadiusKm(value);
                setSelectedId(null);
              }}
            />
          ) : null}
        </div>

        <div className="grid min-h-0 flex-1 content-start gap-3 overflow-y-auto overflow-x-hidden p-5 md:p-7">
          {isTabLoading ? (
            <TabLoadingSkeleton label={activeLabel} near={near} />
          ) : isFood ? (
            filteredFood.length === 0 ? (
              <EmptyState label="food" />
            ) : (
              visibleFood.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  selected={selectedId === product.id}
                  onSelect={() => setSelectedId(product.id)}
                />
              ))
            )
          ) : filteredPlaces.length === 0 ? (
            <EmptyState label={activeLabel} />
          ) : (
            visiblePlaces.map((place) => (
              <ListingCard
                key={place.id}
                inRadius={isWithinRadius(place, radiusKm)}
                place={place}
                selected={selectedId === place.id}
                onSelect={() => setSelectedId(place.id)}
              />
            ))
          )}
        </div>
        {!isTabLoading && (
          <ResultsPager
            currentPage={currentPage}
            label={resultLabel}
            onPageChange={changePage}
            pageEnd={pageEnd}
            pageStart={pageStart}
            totalPages={totalPages}
            totalResults={totalResults}
          />
        )}
      </section>

      {/* Map panel */}
      <section className={cn("relative h-[55vh] min-w-0 flex-1", PANEL_H)}>
        <DiscoveryMap
          places={isTabLoading ? [] : visiblePlaces}
          origin={currentOrigin}
          radiusKm={radiusKm}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        {!isFood && currentOrigin?.source === "gps" ? (
          <div className="pointer-events-none absolute left-1/2 top-4 z-[1000] -translate-x-1/2 rounded-full bg-card/90 px-4 py-1.5 text-xs font-medium text-primary shadow backdrop-blur">
            Blue dot = your current location
          </div>
        ) : null}
        {isFood ? (
          <div className="pointer-events-none absolute left-1/2 top-4 z-[1000] -translate-x-1/2 rounded-full bg-card/90 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow backdrop-blur">
            Kohepets is online-only; map shows your area
          </div>
        ) : null}
        {selectedPlace ? (
          <PlaceDetail
            key={selectedPlace.id}
            place={selectedPlace}
            onClose={() => setSelectedId(null)}
          />
        ) : null}
        {selectedProduct ? (
          <ProductDetail
            key={selectedProduct.id}
            product={selectedProduct}
            onClose={() => setSelectedId(null)}
          />
        ) : null}
      </section>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Per-tab loading skeleton
// ---------------------------------------------------------------------------

function TabLoadingSkeleton({ label, near }: { label: string; near: string }) {
  return (
    <>
      <div className="flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <Spinner className="size-4 shrink-0 text-primary" />
        <p className="text-sm font-medium text-foreground">
          Loading {label} {near}…
        </p>
      </div>
      {["a", "b", "c", "d"].map((k, i) => (
        <div
          key={k}
          className="h-24 animate-pulse rounded-2xl border border-border bg-muted/30"
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Existing sub-components (unchanged)
// ---------------------------------------------------------------------------

function EmptyState({ label }: { label: string }) {
  return (
    <p className="text-muted-foreground">
      No {label} found. Try a different search.
    </p>
  );
}

function ListingCard({
  inRadius,
  place,
  selected,
  onSelect,
}: {
  inRadius: boolean;
  place: PlaceDTO;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = placeIcon(place.kind);
  const rating = ratingLabel(place);
  return (
    <button
      type="button"
      onClick={onSelect}
      className="block w-full min-w-0 text-left"
    >
      <SpotlightCard
        className={cn(
          "w-full overflow-hidden transition-colors",
          inRadius &&
            "ring-1 ring-primary/40 shadow-[0_10px_28px_rgba(159,58,76,0.14)]",
          selected &&
            "bg-gradient-to-r from-card to-primary/5 ring-1 ring-primary/40",
        )}
      >
        <CardContent className="flex min-w-0 gap-4 p-4">
          <div className="relative flex size-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/30 text-primary">
            <Icon className="size-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 font-semibold leading-snug tracking-tight">
              {place.name}
            </h3>
            <p className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-muted-foreground">
              {rating ? (
                <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                  <Star className="size-3.5 fill-current" />
                  {rating}
                </span>
              ) : null}
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{distanceLabel(place)}</span>
            </p>
            {place.topReview ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                "{place.topReview.text}"
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {place.bookingUrl || place.phone ? (
                <Pill className="rounded-md bg-secondary text-secondary-foreground">
                  Bookable
                </Pill>
              ) : null}
              {inRadius ? (
                <Pill className="rounded-md bg-primary/10 text-primary">
                  In radius
                </Pill>
              ) : null}
            </div>
          </div>
        </CardContent>
      </SpotlightCard>
    </button>
  );
}

function ProductCard({
  product,
  selected,
  onSelect,
}: {
  product: ProductDTO;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="block w-full min-w-0 text-left"
    >
      <SpotlightCard
        className={cn(
          "w-full overflow-hidden transition-colors",
          selected &&
            "bg-gradient-to-r from-card to-primary/5 ring-1 ring-primary/40",
        )}
      >
        <CardContent className="flex min-w-0 gap-4 p-4">
          <div className="relative flex size-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-secondary/40 to-accent/30 text-primary">
            <Utensils className="size-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 font-semibold leading-snug tracking-tight">
              {product.title}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
              {[product.brand, priceRange(product), supplierLabel(product)]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {product.ingredients ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {product.ingredients}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {product.productType ? (
                <Pill className="rounded-md bg-muted text-muted-foreground">
                  {product.productType.replace(/_/g, " ")}
                </Pill>
              ) : null}
              {product.available === false ? (
                <Pill className="rounded-md bg-muted text-muted-foreground">
                  Out of stock
                </Pill>
              ) : null}
              {product.source === "kohepets" ? (
                <>
                  <Pill className="rounded-md bg-primary/10 text-primary">
                    Online only
                  </Pill>
                  <Pill className="rounded-md bg-muted text-muted-foreground">
                    Delivery
                  </Pill>
                </>
              ) : null}
            </div>
          </div>
        </CardContent>
      </SpotlightCard>
    </button>
  );
}

function RadiusControl({
  count,
  label,
  onRadiusChange,
  radiusKm,
}: {
  count: number;
  label: string;
  onRadiusChange: (radiusKm: number) => void;
  radiusKm: number;
}) {
  return (
    <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Radar className="size-4 shrink-0 text-primary" />
          <p className="truncate text-sm font-medium text-foreground">
            Search radius
          </p>
        </div>
        <p className="shrink-0 text-sm font-semibold tabular-nums text-primary">
          {radiusKm} km
        </p>
      </div>
      <Slider
        aria-label="Search radius"
        className="mt-3"
        max={MAX_RADIUS_KM}
        min={MIN_RADIUS_KM}
        onValueChange={(value) => onRadiusChange(value[0] ?? radiusKm)}
        step={RADIUS_STEP_KM}
        value={[radiusKm]}
      />
      <p className="mt-2 text-xs text-muted-foreground">
        {count} {label} glowing within this radius
      </p>
    </div>
  );
}

function ResultsPager({
  currentPage,
  label,
  onPageChange,
  pageEnd,
  pageStart,
  totalPages,
  totalResults,
}: {
  currentPage: number;
  label: string;
  onPageChange: (page: number) => void;
  pageEnd: number;
  pageStart: number;
  totalPages: number;
  totalResults: number;
}) {
  if (totalResults === 0) return null;
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-card px-5 py-3 md:px-7">
      <p className="min-w-0 truncate text-xs text-muted-foreground">
        Showing {pageStart + 1}–{pageEnd} of {totalResults} {label}
      </p>
      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          aria-label="Previous page"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          size="icon-sm"
          type="button"
          variant="outline"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="min-w-10 text-center text-xs font-medium tabular-nums text-muted-foreground">
          {currentPage}/{totalPages}
        </span>
        <Button
          aria-label="Next page"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          size="icon-sm"
          type="button"
          variant="outline"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function FloatingShell({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[1000] md:inset-x-6 md:bottom-6">
      <div className="pointer-events-auto relative mx-auto max-w-xl rounded-2xl border border-border bg-card/95 p-5 shadow-xl backdrop-blur md:p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>
        <div
          className={cn(
            "transition-[max-height] duration-300 ease-in-out",
            expanded
              ? "max-h-[60vh] overflow-y-auto"
              : "max-h-48 overflow-hidden",
          )}
        >
          {children}
        </div>
        {!expanded && (
          <div className="relative">
            <div className="pointer-events-none absolute -top-8 left-0 right-0 h-8 bg-linear-to-t from-card/95 to-transparent" />
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Show more
              <ChevronDown className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PlaceDetail({
  place,
  onClose,
}: {
  place: PlaceDTO;
  onClose: () => void;
}) {
  const rating = ratingLabel(place);
  return (
    <FloatingShell onClose={onClose}>
      <h2 className="pr-8 text-lg font-semibold tracking-tight">
        {place.name}
      </h2>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        {rating ? (
          <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
            <Star className="size-4 fill-current" />
            {rating}
          </span>
        ) : null}
        <span className="flex items-center gap-1">
          <MapPin className="size-4" />
          {distanceLabel(place)}
        </span>
      </div>
      {place.address ? (
        <p className="mt-3 text-sm text-muted-foreground">{place.address}</p>
      ) : null}
      {place.topReview ? (
        <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3">
          <Quote className="size-3.5 text-primary" />
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            {place.topReview.text}
          </p>
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {place.bookingUrl ? (
          <Button asChild size="sm" className="rounded-full">
            <a href={place.bookingUrl} target="_blank" rel="noreferrer">
              <Calendar className="size-4" />
              Book
            </a>
          </Button>
        ) : place.email ? (
          <Button asChild size="sm" className="rounded-full">
            <a href={`mailto:${place.email}`}>
              <Calendar className="size-4" />
              Email
            </a>
          </Button>
        ) : null}
        {place.phone ? (
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="rounded-full"
          >
            <a href={`tel:${place.phone.replace(/\s/g, "")}`}>
              <Phone className="size-4" />
              Call
            </a>
          </Button>
        ) : null}
        {place.websiteUrl ? (
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <a href={place.websiteUrl} target="_blank" rel="noreferrer">
              <Globe className="size-4" />
              Website
            </a>
          </Button>
        ) : null}
        {place.googleMapsUrl ? (
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <a href={place.googleMapsUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" />
              Maps
            </a>
          </Button>
        ) : null}
      </div>
    </FloatingShell>
  );
}

function ProductDetail({
  product,
  onClose,
}: {
  product: ProductDTO;
  onClose: () => void;
}) {
  return (
    <FloatingShell onClose={onClose}>
      <h2 className="pr-8 text-lg font-semibold tracking-tight">
        {product.title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {[
          product.brand,
          priceRange(product),
          product.petType,
          supplierLabel(product),
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
      {product.source === "kohepets" ? (
        <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3">
          <p className="text-sm font-medium text-foreground">
            Kohepets online catalog
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Kohepets does not offer walk-in shopping or self-collection, so this
            product appears as an online delivery option rather than a map
            location.
          </p>
        </div>
      ) : null}
      {product.ingredients ? (
        <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Ingredients
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            {product.ingredients}
          </p>
        </div>
      ) : null}
      {product.url ? (
        <Button asChild size="sm" className="mt-4 rounded-full">
          <a href={product.url} target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" />
            View product
          </a>
        </Button>
      ) : null}
    </FloatingShell>
  );
}
