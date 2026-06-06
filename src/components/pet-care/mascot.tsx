"use client";

import { cn } from "@/lib/utils";

export type MascotSpecies = "brand" | "dog" | "cat" | "rabbit";

type Palette = {
  face: string;
  faceD: string;
  ear: string;
  inner: string;
  nose: string;
};

/** Species palettes from the Little Lovely Pets design system (llp-ds.jsx). */
const SPECIES: Record<MascotSpecies, Palette> = {
  brand: {
    face: "var(--primary-bright, #ff8da1)",
    faceD: "#f06d85",
    ear: "var(--primary, #9c3f53)",
    inner: "#ffd1d9",
    nose: "#7a2336",
  },
  dog: {
    face: "#f1d6b0",
    faceD: "#e6c294",
    ear: "#cf9d68",
    inner: "#e9b98a",
    nose: "#5b4636",
  },
  cat: {
    face: "#f3c98f",
    faceD: "#ecb86e",
    ear: "#dd9d49",
    inner: "#f4b9a0",
    nose: "#9a5a3e",
  },
  rabbit: {
    face: "#efe7e1",
    faceD: "#e4d8cf",
    ear: "#e7dcd4",
    inner: "#f3b9c4",
    nose: "#c98494",
  },
};

function Ears({ species, c }: { species: MascotSpecies; c: Palette }) {
  switch (species) {
    case "dog":
      return (
        <g>
          <ellipse
            cx="22"
            cy="48"
            fill={c.ear}
            rx="13"
            ry="22"
            transform="rotate(12 22 48)"
          />
          <ellipse
            cx="78"
            cy="48"
            fill={c.ear}
            rx="13"
            ry="22"
            transform="rotate(-12 78 48)"
          />
        </g>
      );
    case "cat":
      return (
        <g>
          <path d="M20 40 L26 12 L44 30 Z" fill={c.ear} />
          <path d="M80 40 L74 12 L56 30 Z" fill={c.ear} />
          <path d="M27 33 L29 19 L38 30 Z" fill={c.inner} />
          <path d="M73 33 L71 19 L62 30 Z" fill={c.inner} />
        </g>
      );
    case "rabbit":
      return (
        <g>
          <ellipse
            cx="38"
            cy="20"
            fill={c.ear}
            rx="8"
            ry="22"
            transform="rotate(-8 38 20)"
          />
          <ellipse
            cx="62"
            cy="20"
            fill={c.ear}
            rx="8"
            ry="22"
            transform="rotate(8 62 20)"
          />
          <ellipse
            cx="38"
            cy="20"
            fill={c.inner}
            rx="3.5"
            ry="15"
            transform="rotate(-8 38 20)"
          />
          <ellipse
            cx="62"
            cy="20"
            fill={c.inner}
            rx="3.5"
            ry="15"
            transform="rotate(8 62 20)"
          />
        </g>
      );
    default:
      return (
        <g>
          <ellipse
            cx="30"
            cy="26"
            fill={c.ear}
            rx="13"
            ry="15"
            transform="rotate(-18 30 26)"
          />
          <ellipse
            cx="70"
            cy="26"
            fill={c.ear}
            rx="13"
            ry="15"
            transform="rotate(18 70 26)"
          />
        </g>
      );
  }
}

/** Friendly species-flexible mascot face (dog / cat / rabbit / brand). */
export function Mascot({
  species = "brand",
  size = 56,
  blink = true,
  float = false,
  className,
  label,
}: {
  species?: MascotSpecies;
  size?: number;
  blink?: boolean;
  float?: boolean;
  className?: string;
  label?: string;
}) {
  const c = SPECIES[species] ?? SPECIES.brand;
  const gradId = `llp-mg-${species}`;
  return (
    <svg
      aria-label={label ?? `Little Lovely Pets ${species} mascot`}
      role="img"
      height={size}
      viewBox="0 0 100 100"
      width={size}
      className={cn("shrink-0 overflow-visible", className)}
      style={
        float ? { animation: "llp-float-y 5s ease-in-out infinite" } : undefined
      }
    >
      <Ears species={species} c={c} />
      <ellipse cx="50" cy="58" fill={c.face} rx="36" ry="33" />
      <ellipse cx="50" cy="58" fill={`url(#${gradId})`} rx="36" ry="33" />
      <defs>
        <radialGradient cx="50%" cy="35%" id={gradId} r="70%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="100%" stopColor={c.faceD} stopOpacity="0.25" />
        </radialGradient>
      </defs>
      <ellipse
        cx="30"
        cy="66"
        fill="#ff90a6"
        opacity="calc(0.55 * var(--cute, 0.8))"
        rx="8"
        ry="5"
      />
      <ellipse
        cx="70"
        cy="66"
        fill="#ff90a6"
        opacity="calc(0.55 * var(--cute, 0.8))"
        rx="8"
        ry="5"
      />
      <g
        style={
          blink
            ? {
                transformOrigin: "center",
                animation: "llp-blink 5.5s infinite",
              }
            : undefined
        }
      >
        <circle cx="38" cy="54" fill="#2a2024" r="4.6" />
        <circle cx="62" cy="54" fill="#2a2024" r="4.6" />
        <circle cx="39.6" cy="52.4" fill="#fff" r="1.5" />
        <circle cx="63.6" cy="52.4" fill="#fff" r="1.5" />
      </g>
      <path d="M46 64 Q50 68 54 64 Q50 67 46 64 Z" fill={c.nose} />
      <path
        d="M50 67 Q50 72 45 73 M50 67 Q50 72 55 73"
        fill="none"
        stroke={c.nose}
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

/** Small paw-print glyph for logos / decoration. */
export function Paw({
  size = 26,
  color = "var(--primary, #9c3f53)",
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      role="presentation"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn("block shrink-0", className)}
    >
      <ellipse
        cx="30"
        cy="34"
        fill={color}
        rx="11"
        ry="14"
        transform="rotate(-18 30 34)"
      />
      <ellipse cx="50" cy="26" fill={color} rx="11" ry="15" />
      <ellipse
        cx="70"
        cy="34"
        fill={color}
        rx="11"
        ry="14"
        transform="rotate(18 70 34)"
      />
      <ellipse
        cx="84"
        cy="54"
        fill={color}
        rx="9"
        ry="12"
        transform="rotate(34 84 54)"
      />
      <ellipse
        cx="16"
        cy="54"
        fill={color}
        rx="9"
        ry="12"
        transform="rotate(-34 16 54)"
      />
      <path
        d="M50 50 C66 50 78 62 76 76 C74 88 60 90 50 86 C40 90 26 88 24 76 C22 62 34 50 50 50 Z"
        fill={color}
      />
    </svg>
  );
}

/** Brand mascot (species `brand`), floating — used in the sidebar/header. */
export function BrandMascot({ size = 42 }: { size?: number }) {
  return <Mascot species="brand" size={size} float />;
}
