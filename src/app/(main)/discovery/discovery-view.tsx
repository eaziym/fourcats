"use client";

import {
  Calendar,
  Cross,
  ExternalLink,
  Globe,
  MapPin,
  Phone,
  Quote,
  Scissors,
  Search,
  ShoppingBag,
  Star,
  Utensils,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Pill, SpotlightCard } from "@/components/pet-care/primitives";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  DiscoveryData,
  PlaceDTO,
  ProductDTO,
} from "@/lib/discovery-queries";
import { petPlaceholderImage } from "@/lib/pet-data";
import { cn } from "@/lib/utils";

const DiscoveryMap = dynamic(() => import("./discovery-map"), {
  ssr: false,
  loading: () => (
    <div className="grid size-full place-items-center bg-muted/40 text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
});

type Tab = "groomer" | "vet" | "food";
type PetSummary = {
  name: string;
  species: string;
  medicalConditions: string[];
};

const TABS: { id: Tab; label: string; icon: typeof Scissors }[] = [
  { id: "groomer", label: "Groomers", icon: Scissors },
  { id: "vet", label: "Vets", icon: Cross },
  { id: "food", label: "Food", icon: ShoppingBag },
];

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

const PANEL_H = "md:h-[calc(100dvh-66px)]";

export function DiscoveryView({
  data,
  pet,
}: {
  data: DiscoveryData;
  pet: PetSummary;
}) {
  const [tab, setTab] = useState<Tab>("groomer");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const isFood = tab === "food";
  const places = tab === "vet" ? data.vets : data.groomers;
  const q = query.trim().toLowerCase();

  const filteredPlaces = useMemo(() => {
    if (isFood) return [];
    if (!q) return places;
    return places.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.neighbourhood?.toLowerCase().includes(q) ||
        p.serviceTags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [isFood, places, q]);

  const filteredFood = useMemo(() => {
    if (!isFood) return [];
    if (!q) return data.food;
    return data.food.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.ingredients?.toLowerCase().includes(q),
    );
  }, [isFood, data.food, q]);

  const selectedPlace = isFood
    ? null
    : (filteredPlaces.find((p) => p.id === selectedId) ?? null);
  const selectedProduct = isFood
    ? (filteredFood.find((p) => p.id === selectedId) ?? null)
    : null;

  const near = data.origin?.label ?? "Singapore";
  const activeLabel = TABS.find((t) => t.id === tab)?.label.toLowerCase() ?? "";

  return (
    <main className="flex min-h-0 flex-col bg-background md:flex-row">
      {/* List panel */}
      <section
        className={cn(
          "z-10 flex min-h-0 w-full flex-col border-r border-border bg-card shadow-sm md:w-[460px] md:shrink-0",
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
          <div className="relative mt-4">
            <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-11 rounded-xl pl-11 pr-4"
              placeholder={`Search ${activeLabel}…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-primary/25 bg-gradient-to-r from-primary/10 to-card p-2">
            <Avatar className="size-9">
              <AvatarImage
                alt={pet.name}
                src={petPlaceholderImage(pet.species)}
              />
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
              const count =
                t.id === "food"
                  ? data.food.length
                  : (t.id === "vet" ? data.vets : data.groomers).length;
              const activeTab = tab === t.id;
              return (
                <button
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
                  }}
                  type="button"
                >
                  <Icon className="size-4" />
                  {t.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-xs tabular-nums",
                      activeTab ? "bg-primary-foreground/20" : "bg-background",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid min-h-0 flex-1 content-start gap-3 overflow-y-auto p-5 md:p-7">
          {isFood ? (
            filteredFood.length === 0 ? (
              <EmptyState label="food" />
            ) : (
              filteredFood.map((product) => (
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
            filteredPlaces.map((place) => (
              <ListingCard
                key={place.id}
                place={place}
                selected={selectedId === place.id}
                onSelect={() => setSelectedId(place.id)}
              />
            ))
          )}
        </div>
      </section>

      {/* Map panel */}
      <section className={cn("relative h-[55vh] flex-1", PANEL_H)}>
        <DiscoveryMap
          places={filteredPlaces}
          origin={data.origin}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        {isFood ? (
          <div className="pointer-events-none absolute left-1/2 top-4 z-[1000] -translate-x-1/2 rounded-full bg-card/90 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow backdrop-blur">
            Showing food products — map shows your area
          </div>
        ) : null}
        {selectedPlace ? (
          <PlaceDetail
            place={selectedPlace}
            onClose={() => setSelectedId(null)}
          />
        ) : null}
        {selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            onClose={() => setSelectedId(null)}
          />
        ) : null}
      </section>
    </main>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <p className="text-muted-foreground">
      No {label} found. Try a different search.
    </p>
  );
}

function ListingCard({
  place,
  selected,
  onSelect,
}: {
  place: PlaceDTO;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = place.kind === "vet" ? Cross : Scissors;
  const rating = ratingLabel(place);
  return (
    <button type="button" onClick={onSelect} className="text-left">
      <SpotlightCard
        className={cn(
          "transition-colors",
          selected &&
            "bg-gradient-to-r from-card to-primary/5 ring-1 ring-primary/40",
        )}
      >
        <CardContent className="flex gap-4 p-4">
          <div className="relative flex size-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/30 text-primary">
            <Icon className="size-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold tracking-tight">
              {place.name}
            </h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              {rating ? (
                <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                  <Star className="size-3.5 fill-current" />
                  {rating}
                </span>
              ) : null}
              <MapPin className="size-3.5 shrink-0" />
              {distanceLabel(place)}
            </p>
            {place.topReview ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                “{place.topReview.text}”
              </p>
            ) : null}
            {place.bookingUrl || place.phone ? (
              <Pill className="mt-2 rounded-md bg-secondary text-secondary-foreground">
                Bookable
              </Pill>
            ) : null}
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
    <button type="button" onClick={onSelect} className="text-left">
      <SpotlightCard
        className={cn(
          "transition-colors",
          selected &&
            "bg-gradient-to-r from-card to-primary/5 ring-1 ring-primary/40",
        )}
      >
        <CardContent className="flex gap-4 p-4">
          <div className="relative flex size-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-secondary/40 to-accent/30 text-primary">
            <Utensils className="size-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold tracking-tight">
              {product.title}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {[product.brand, priceRange(product)].filter(Boolean).join(" · ")}
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
            </div>
          </div>
        </CardContent>
      </SpotlightCard>
    </button>
  );
}

function FloatingShell({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[1000] md:inset-x-6 md:bottom-6">
      <div className="pointer-events-auto relative mx-auto max-h-[60%] max-w-xl overflow-y-auto rounded-2xl border border-border bg-card/95 p-5 shadow-xl backdrop-blur md:p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>
        {children}
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
          <p className="mt-1 line-clamp-4 text-sm leading-relaxed text-foreground">
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
        {[product.brand, priceRange(product), product.petType]
          .filter(Boolean)
          .join(" · ")}
      </p>
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
