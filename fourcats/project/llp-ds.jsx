/* ============================================================
   Little Lovely Pets — Shared Design System (primitives)
   Exports to window: Icon, Mascot, PetAvatar, Btn, Chip, Card,
   StatTile, Field, Toggle, Seg, useReveal, PETS, fmt
   ============================================================ */

const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ---------- tiny icon wrapper (Material Symbols Rounded) ---------- */
function Icon({
  name,
  size = 22,
  fill = false,
  weight = 400,
  style,
  className = "",
}) {
  return (
    <span
      className={"material-symbols-rounded " + className}
      style={{
        fontSize: size,
        fontVariationSettings: `'opsz' 24,'wght' ${weight},'FILL' ${fill ? 1 : 0},'GRAD' 0`,
        ...style,
      }}
    >
      {name}
    </span>
  );
}

/* ---------- mascot / pet face built from simple shapes ---------- */
const SPECIES = {
  brand: {
    face: "var(--primary-bright)",
    faceD: "#f06d85",
    ear: "var(--primary)",
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

function Mascot({ species = "brand", size = 56, blink = true, style }) {
  const c = SPECIES[species] || SPECIES.brand;
  const ears = {
    brand: (
      <g>
        <ellipse
          cx="30"
          cy="26"
          rx="13"
          ry="15"
          fill={c.ear}
          transform="rotate(-18 30 26)"
        />
        <ellipse
          cx="70"
          cy="26"
          rx="13"
          ry="15"
          fill={c.ear}
          transform="rotate(18 70 26)"
        />
      </g>
    ),
    dog: (
      <g>
        <ellipse
          cx="22"
          cy="48"
          rx="13"
          ry="22"
          fill={c.ear}
          transform="rotate(12 22 48)"
        />
        <ellipse
          cx="78"
          cy="48"
          rx="13"
          ry="22"
          fill={c.ear}
          transform="rotate(-12 78 48)"
        />
      </g>
    ),
    cat: (
      <g>
        <path d="M20 40 L26 12 L44 30 Z" fill={c.ear} />
        <path d="M80 40 L74 12 L56 30 Z" fill={c.ear} />
        <path d="M27 33 L29 19 L38 30 Z" fill={c.inner} />
        <path d="M73 33 L71 19 L62 30 Z" fill={c.inner} />
      </g>
    ),
    rabbit: (
      <g>
        <ellipse
          cx="38"
          cy="20"
          rx="8"
          ry="22"
          fill={c.ear}
          transform="rotate(-8 38 20)"
        />
        <ellipse
          cx="62"
          cy="20"
          rx="8"
          ry="22"
          fill={c.ear}
          transform="rotate(8 62 20)"
        />
        <ellipse
          cx="38"
          cy="20"
          rx="3.5"
          ry="15"
          fill={c.inner}
          transform="rotate(-8 38 20)"
        />
        <ellipse
          cx="62"
          cy="20"
          rx="3.5"
          ry="15"
          fill={c.inner}
          transform="rotate(8 62 20)"
        />
      </g>
    ),
  };
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ display: "block", overflow: "visible", ...style }}
    >
      {ears[species]}
      <ellipse cx="50" cy="58" rx="36" ry="33" fill={c.face} />
      <ellipse cx="50" cy="58" rx="36" ry="33" fill="url(#mg)" />
      <defs>
        <radialGradient id="mg" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="100%" stopColor={c.faceD} stopOpacity="0.25" />
        </radialGradient>
      </defs>
      {/* blush */}
      <ellipse
        cx="30"
        cy="66"
        rx="8"
        ry="5"
        fill="#ff90a6"
        opacity={`calc(0.55 * var(--blush))`}
      />
      <ellipse
        cx="70"
        cy="66"
        rx="8"
        ry="5"
        fill="#ff90a6"
        opacity={`calc(0.55 * var(--blush))`}
      />
      {/* eyes */}
      <g
        style={
          blink
            ? { transformOrigin: "center", animation: "blink 5.5s infinite" }
            : null
        }
      >
        <circle cx="38" cy="54" r="4.6" fill="#2a2024" />
        <circle cx="62" cy="54" r="4.6" fill="#2a2024" />
        <circle cx="39.6" cy="52.4" r="1.5" fill="#fff" />
        <circle cx="63.6" cy="52.4" r="1.5" fill="#fff" />
      </g>
      {/* nose + mouth */}
      <path d="M46 64 Q50 68 54 64 Q50 67 46 64 Z" fill={c.nose} />
      <path
        d="M50 67 Q50 72 45 73 M50 67 Q50 72 55 73"
        stroke={c.nose}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* small paw-print glyph for logo / decoration */
function Paw({ size = 26, color = "var(--primary)", style }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ display: "block", ...style }}
    >
      <ellipse
        cx="30"
        cy="34"
        rx="11"
        ry="14"
        fill={color}
        transform="rotate(-18 30 34)"
      />
      <ellipse cx="50" cy="26" rx="11" ry="15" fill={color} />
      <ellipse
        cx="70"
        cy="34"
        rx="11"
        ry="14"
        fill={color}
        transform="rotate(18 70 34)"
      />
      <ellipse
        cx="84"
        cy="54"
        rx="9"
        ry="12"
        fill={color}
        transform="rotate(34 84 54)"
      />
      <ellipse
        cx="16"
        cy="54"
        rx="9"
        ry="12"
        fill={color}
        transform="rotate(-34 16 54)"
      />
      <path
        d="M50 50 C66 50 78 62 76 76 C74 88 60 90 50 86 C40 90 26 88 24 76 C22 62 34 50 50 50 Z"
        fill={color}
      />
    </svg>
  );
}

/* ---------- pet avatar (mascot in a tinted ring) ---------- */
function PetAvatar({ species = "dog", size = 48, ring = true, style }) {
  const c = SPECIES[species] || SPECIES.dog;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(120% 120% at 50% 20%, ${c.face}, ${c.faceD})`,
        display: "grid",
        placeItems: "center",
        flex: "0 0 auto",
        boxShadow: ring
          ? `0 0 0 3px var(--surface), 0 0 0 5px ${c.ear}55`
          : "none",
        overflow: "hidden",
        ...style,
      }}
    >
      <Mascot
        species={species}
        size={size * 0.92}
        blink={false}
        style={{ marginTop: size * 0.08 }}
      />
    </div>
  );
}

/* ---------- button ---------- */
function Btn({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconR,
  full,
  onClick,
  type,
  style,
  ...rest
}) {
  const [press, setPress] = useState(false);
  const pads = { sm: "8px 14px", md: "11px 20px", lg: "15px 26px" };
  const fs = { sm: 13, md: 14.5, lg: 16 };
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontWeight: 600,
    fontSize: fs[size],
    padding: pads[size],
    borderRadius: "var(--r-pill)",
    fontFamily: "var(--font-b)",
    letterSpacing: ".01em",
    width: full ? "100%" : "auto",
    transition:
      "transform .18s cubic-bezier(.34,1.56,.64,1), box-shadow .2s, filter .2s, background .2s",
    transform: press ? `scale(${1 - 0.04 * 1})` : "scale(1)",
    whiteSpace: "nowrap",
  };
  const variants = {
    primary: {
      background: "var(--primary)",
      color: "#fff",
      boxShadow: "0 8px 20px rgba(120,35,56,.20)",
    },
    tonal: {
      background: "var(--primary-container)",
      color: "var(--on-primary-container)",
    },
    soft: {
      background: "var(--surface)",
      color: "var(--ink)",
      boxShadow: "var(--sh-1)",
      border: "1px solid var(--outline)",
    },
    ghost: { background: "transparent", color: "var(--ink-2)" },
    navy: {
      background: "var(--tertiary)",
      color: "#fff",
      boxShadow: "0 8px 20px rgba(58,79,115,.22)",
    },
    danger: { background: "var(--error-container)", color: "var(--error)" },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      onMouseLeave={() => setPress(false)}
      onMouseEnter={(e) => {
        e.currentTarget.style.filter = "brightness(1.04)";
      }}
      style={{ ...base, ...variants[variant], ...style }}
      {...rest}
    >
      {icon && <Icon name={icon} size={fs[size] + 4} />}
      {children}
      {iconR && <Icon name={iconR} size={fs[size] + 4} />}
    </button>
  );
}

/* ---------- chip / tag ---------- */
const CHIP_TONES = {
  pink: { bg: "var(--primary-container)", fg: "var(--on-primary-container)" },
  yellow: {
    bg: "var(--secondary-container)",
    fg: "var(--on-secondary-container)",
  },
  navy: { bg: "var(--tertiary-container)", fg: "var(--on-tertiary-container)" },
  green: { bg: "var(--success-container)", fg: "#13633f" },
  neutral: { bg: "var(--surface-3)", fg: "var(--ink-2)" },
};
function Chip({ children, tone = "neutral", icon, sm, style }) {
  const t = CHIP_TONES[tone] || CHIP_TONES.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontWeight: 600,
        fontSize: sm ? 11.5 : 12.5,
        padding: sm ? "3px 9px" : "5px 11px",
        borderRadius: "var(--r-pill)",
        background: t.bg,
        color: t.fg,
        lineHeight: 1.2,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={sm ? 13 : 15} fill />}
      {children}
    </span>
  );
}

/* ---------- card ---------- */
function Card({
  children,
  pad = "var(--pad-card)",
  className = "",
  style,
  hover,
  onClick,
  accent,
}) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      className={className}
      style={{
        background: "var(--surface)",
        borderRadius: "var(--r-lg)",
        padding: pad,
        boxShadow: hover && h ? "var(--sh-2)" : "var(--sh-1)",
        border: "1px solid var(--outline)",
        transform: hover && h ? "translateY(-3px)" : "none",
        transition: "transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s",
        cursor: onClick ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
        ...(accent ? { borderTop: `3px solid ${accent}` } : null),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ---------- stat tile ---------- */
function StatTile({ label, value, sub }) {
  return (
    <div
      style={{
        background: "var(--surface-2)",
        borderRadius: "var(--r-md)",
        padding: "14px 16px",
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: ".08em",
          color: "var(--ink-3)",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </div>
      <div
        className="font-d"
        style={{
          fontSize: 23,
          fontWeight: 700,
          color: "var(--ink)",
          marginTop: 3,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontSize: 12,
            color: "var(--ink-2)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

/* ---------- form field ---------- */
function Field({ label, hint, children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} style={{ display: "block" }}>
      <div
        style={{
          fontSize: 13.5,
          fontWeight: 600,
          color: "var(--ink)",
          marginBottom: 7,
        }}
      >
        {label}
      </div>
      {children}
      {hint && (
        <div
          style={{
            fontSize: 12,
            color: "var(--ink-3)",
            marginTop: 6,
            lineHeight: 1.4,
          }}
        >
          {hint}
        </div>
      )}
    </label>
  );
}
function Input({ value, onChange, placeholder, id, type = "text", style }) {
  const [f, setF] = useState(false);
  return (
    <input
      id={id}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange && onChange(e.target.value)}
      onFocus={() => setF(true)}
      onBlur={() => setF(false)}
      style={{
        width: "100%",
        padding: "12px 14px",
        fontSize: 15,
        color: "var(--ink)",
        background: "var(--surface-2)",
        borderRadius: "var(--r-sm)",
        border: `1.5px solid ${f ? "var(--primary)" : "transparent"}`,
        outline: "none",
        transition: "border-color .18s, background .18s",
        boxShadow: f
          ? "0 0 0 4px color-mix(in srgb, var(--primary) 14%, transparent)"
          : "none",
        ...style,
      }}
    />
  );
}

/* ---------- toggle switch ---------- */
function Toggle({ on, onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{ display: "inline-flex", alignItems: "center", gap: 10 }}
    >
      <span
        style={{
          width: 44,
          height: 26,
          borderRadius: 999,
          padding: 3,
          background: on ? "var(--primary)" : "var(--surface-3)",
          transition: "background .2s",
          display: "inline-flex",
        }}
      >
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: 999,
            background: "#fff",
            transform: on ? "translateX(18px)" : "none",
            transition: "transform .22s cubic-bezier(.34,1.56,.64,1)",
            boxShadow: "0 1px 3px rgba(0,0,0,.25)",
          }}
        />
      </span>
      {label && (
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>
          {label}
        </span>
      )}
    </button>
  );
}

/* ---------- segmented control ---------- */
function Seg({ options, value, onChange, full }) {
  return (
    <div
      style={{
        display: "inline-flex",
        background: "var(--surface-2)",
        borderRadius: "var(--r-pill)",
        padding: 4,
        gap: 2,
        width: full ? "100%" : "auto",
      }}
    >
      {options.map((o) => {
        const v = typeof o === "string" ? o : o.value;
        const lbl = typeof o === "string" ? o : o.label;
        const ic = typeof o === "object" ? o.icon : null;
        const active = v === value;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            style={{
              flex: full ? 1 : "0 0 auto",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: "var(--r-pill)",
              fontSize: 13.5,
              fontWeight: 600,
              background: active ? "var(--surface)" : "transparent",
              color: active ? "var(--primary)" : "var(--ink-2)",
              boxShadow: active ? "var(--sh-1)" : "none",
              transition: "all .18s",
              whiteSpace: "nowrap",
            }}
          >
            {ic && <Icon name={ic} size={17} fill={active} />}
            {lbl}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- reveal-on-mount helper (staggered fade-in) ---------- */
function useReveal() {
  // returns a function producing inline style for index i
  return (i = 0) => ({
    animation: "cardIn .55s cubic-bezier(.22,1,.36,1) both",
    animationDelay: `${i * 70}ms`,
  });
}

/* ---------- viewport hook (responsive breakpoints) ---------- */
function useViewport() {
  const [w, setW] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1440,
  );
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener("resize", on);
    on();
    return () => window.removeEventListener("resize", on);
  }, []);
  return {
    w,
    isPhone: w < 680,
    isTablet: w < 1024,
    isNarrow: w < 1240,
    rail: w < 900, // collapse sidebar to icon rail
  };
}

/* ---------- demo data ---------- */
const PETS = [
  {
    id: "mochi",
    name: "Mochi",
    species: "dog",
    breed: "Shih Tzu",
    age: "3 yrs",
    weight: "6.2 kg",
    area: "Tampines",
    tags: ["Sensitive Skin", "HDB-Approved"],
  },
  {
    id: "nutmeg",
    name: "Nutmeg",
    species: "cat",
    breed: "Singapura",
    age: "2 yrs",
    weight: "3.1 kg",
    area: "Bedok",
    tags: ["Indoor-Only", "HDB-Approved"],
  },
  {
    id: "clover",
    name: "Clover",
    species: "rabbit",
    breed: "Holland Lop",
    age: "1 yr",
    weight: "1.6 kg",
    area: "Punggol",
    tags: ["Small Pet", "Hay Diet"],
  },
];
const SPECIES_LABEL = { dog: "Dog", cat: "Cat", rabbit: "Rabbit" };

Object.assign(window, {
  Icon,
  Mascot,
  Paw,
  PetAvatar,
  Btn,
  Chip,
  Card,
  StatTile,
  Field,
  Input,
  Toggle,
  Seg,
  useReveal,
  useViewport,
  PETS,
  SPECIES,
  SPECIES_LABEL,
});
