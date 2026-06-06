/** Little Lovely Pets — live design tweaks (accent / roundness / density / cuteness / font). */

export type Accent = {
  id: string;
  name: string;
  primary: string;
  bright: string;
  container: string;
  on: string;
};

export const ACCENTS: Accent[] = [
  {
    id: "petal",
    name: "Petal Pink",
    primary: "#9c3f53",
    bright: "#ff8da1",
    container: "#ffe1e6",
    on: "#782338",
  },
  {
    id: "tangerine",
    name: "Tangerine",
    primary: "#b5491f",
    bright: "#ff9b6a",
    container: "#ffe6d6",
    on: "#8a3413",
  },
  {
    id: "sage",
    name: "Sage",
    primary: "#3f7a4f",
    bright: "#86c98f",
    container: "#daeedb",
    on: "#285a36",
  },
  {
    id: "periwinkle",
    name: "Periwinkle",
    primary: "#4a55a8",
    bright: "#98a4ee",
    container: "#e3e6ff",
    on: "#343e86",
  },
  {
    id: "berry",
    name: "Berry",
    primary: "#93408a",
    bright: "#e58fd9",
    container: "#fbe0f6",
    on: "#6e2a68",
  },
];

export const DENSITIES = {
  airy: { pad: "28px", gap: "24px" },
  cozy: { pad: "22px", gap: "20px" },
  compact: { pad: "16px", gap: "14px" },
} as const;
export type DensityId = keyof typeof DENSITIES;

export const HEADLINE_FONTS = ["Quicksand", "Nunito", "Baloo 2"] as const;
export type HeadlineFont = (typeof HEADLINE_FONTS)[number];

export const FONT_STACKS: Record<HeadlineFont, string> = {
  Quicksand: "var(--font-quicksand), ui-sans-serif, system-ui, sans-serif",
  Nunito: "var(--font-nunito), ui-sans-serif, system-ui, sans-serif",
  "Baloo 2": "var(--font-baloo2), ui-sans-serif, system-ui, sans-serif",
};

export type Tweaks = {
  accent: string;
  roundness: number;
  density: DensityId;
  cuteness: number;
  headlineFont: HeadlineFont;
};

export const TWEAK_DEFAULTS: Tweaks = {
  accent: "petal",
  roundness: 1,
  density: "cozy",
  cuteness: 80,
  headlineFont: "Quicksand",
};

export const TWEAKS_STORAGE_KEY = "llp-tweaks";

export function applyTweaks(t: Tweaks): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement.style;
  const accent = ACCENTS.find((a) => a.id === t.accent) ?? ACCENTS[0];

  root.setProperty("--primary", accent.primary);
  root.setProperty("--primary-bright", accent.bright);
  root.setProperty("--primary-container", accent.container);
  root.setProperty("--on-primary-container", accent.on);
  root.setProperty("--primary-foreground", "#ffffff");
  root.setProperty("--ring", accent.primary);
  root.setProperty("--accent", accent.container);
  root.setProperty("--accent-foreground", accent.on);
  root.setProperty("--sidebar-primary", accent.primary);
  root.setProperty("--sidebar-primary-foreground", "#ffffff");
  root.setProperty("--sidebar-ring", accent.primary);
  root.setProperty("--sidebar-accent", accent.container);
  root.setProperty("--sidebar-accent-foreground", accent.on);

  root.setProperty("--radius", `${0.75 * t.roundness}rem`);

  const d = DENSITIES[t.density] ?? DENSITIES.cozy;
  root.setProperty("--pad-card", d.pad);
  root.setProperty("--gap", d.gap);

  root.setProperty("--cute", String((t.cuteness ?? 80) / 100));

  const stack = FONT_STACKS[t.headlineFont] ?? FONT_STACKS.Quicksand;
  root.setProperty("--font-llp-display", stack);
  root.setProperty("--font-brand", stack);
}

/** Inline <head> script that applies saved tweaks before first paint. */
export const TWEAKS_BOOTSTRAP = `(function(){try{
  var A=${JSON.stringify(ACCENTS)};
  var D=${JSON.stringify(DENSITIES)};
  var F=${JSON.stringify(FONT_STACKS)};
  var def=${JSON.stringify(TWEAK_DEFAULTS)};
  var raw=localStorage.getItem(${JSON.stringify(TWEAKS_STORAGE_KEY)});
  var t=Object.assign({},def,raw?JSON.parse(raw):{});
  var a=A.filter(function(x){return x.id===t.accent})[0]||A[0];
  var s=document.documentElement.style;
  s.setProperty('--primary',a.primary);s.setProperty('--primary-bright',a.bright);
  s.setProperty('--primary-container',a.container);s.setProperty('--on-primary-container',a.on);
  s.setProperty('--primary-foreground','#ffffff');s.setProperty('--ring',a.primary);
  s.setProperty('--accent',a.container);s.setProperty('--accent-foreground',a.on);
  s.setProperty('--sidebar-primary',a.primary);s.setProperty('--sidebar-primary-foreground','#ffffff');
  s.setProperty('--sidebar-ring',a.primary);s.setProperty('--sidebar-accent',a.container);
  s.setProperty('--sidebar-accent-foreground',a.on);
  s.setProperty('--radius',(0.75*t.roundness)+'rem');
  var d=D[t.density]||D.cozy;s.setProperty('--pad-card',d.pad);s.setProperty('--gap',d.gap);
  s.setProperty('--cute',String((t.cuteness==null?80:t.cuteness)/100));
  var fs=F[t.headlineFont]||F.Quicksand;s.setProperty('--font-llp-display',fs);s.setProperty('--font-brand',fs);
}catch(e){}})();`;
