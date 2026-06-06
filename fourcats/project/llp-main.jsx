/* ============================================================
   Little Lovely Pets — Root app: router + tweaks  (v1)
   ============================================================ */

const ACCENTS = [
  { primary: "#9c3f53", bright: "#ff8da1", container: "#ffe1e6", on: "#782338", name: "Petal Pink" },
  { primary: "#b5491f", bright: "#ff9b6a", container: "#ffe6d6", on: "#8a3413", name: "Tangerine" },
  { primary: "#3f7a4f", bright: "#86c98f", container: "#daeedb", on: "#285a36", name: "Sage" },
  { primary: "#4a55a8", bright: "#98a4ee", container: "#e3e6ff", on: "#343e86", name: "Periwinkle" },
  { primary: "#93408a", bright: "#e58fd9", container: "#fbe0f6", on: "#6e2a68", name: "Berry" },
];
const DENSITY = {
  airy:    { pad: "28px", gap: "24px" },
  cozy:    { pad: "22px", gap: "20px" },
  compact: { pad: "16px", gap: "14px" },
};
const FONTS = {
  "Quicksand": "'Quicksand'", "Nunito": "'Nunito'", "Baloo 2": "'Baloo 2'",
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#9c3f53",
  "roundness": 1,
  "density": "cozy",
  "cuteness": 80,
  "headlineFont": "Quicksand"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useState("onboarding");
  const [pets, setPets] = useState(PETS);
  const [active, setActive] = useState(PETS[0]);

  // apply tweaks -> CSS variables
  useEffect(() => {
    const r = document.documentElement.style;
    const a = ACCENTS.find((x) => x.primary === t.accent) || ACCENTS[0];
    r.setProperty("--primary", a.primary);
    r.setProperty("--primary-bright", a.bright);
    r.setProperty("--primary-container", a.container);
    r.setProperty("--on-primary-container", a.on);
    r.setProperty("--r-mult", String(t.roundness));
    const d = DENSITY[t.density] || DENSITY.cozy;
    r.setProperty("--pad-card", d.pad);
    r.setProperty("--gap", d.gap);
    r.setProperty("--cute", String((t.cuteness ?? 80) / 100));
    r.setProperty("--font-d", `${FONTS[t.headlineFont] || "'Quicksand'"},system-ui,sans-serif`);
  }, [t]);

  const finishOnboarding = (d) => {
    if (d && d.name) {
      const homeTag = d.housing === "Condo" ? "Condo-Friendly" : d.housing === "Landed" ? "Landed Home" : "HDB-Approved";
      const np = { id: "new-" + Date.now(), name: d.name, species: d.species, breed: d.breed || "Mixed",
        age: `${d.age} ${d.age === 1 ? "yr" : "yrs"}`, weight: `${(+d.weight).toFixed(1)} kg`, area: d.area,
        tags: (d.conditions && d.conditions.length ? [d.conditions[0]] : ["Lovely"]).concat(homeTag) };
      setPets((p) => [np, ...p.filter((x) => x.id !== np.id)]);
      setActive(np);
    }
    setRoute("dashboard");
  };

  // ensure active stays valid if pets change
  useEffect(() => { if (!pets.find((p) => p.id === active.id)) setActive(pets[0]); }, [pets]);

  const META = {
    dashboard: { title: "Dashboard", sub: "Thursday, 6 June 2026" },
    assistant: { title: "AI Assistant", sub: "Profile-aware · grounded in SG data" },
    discovery: { title: "Local Discovery", sub: `Services near ${active.area}` },
    profiles:  { title: "Pet Profiles", sub: `${pets.length} lovely pet${pets.length > 1 ? "s" : ""}` },
    designsystem: { title: "Design System", sub: "Modern Warmth · standardised" },
  };

  let body;
  if (route === "onboarding") {
    body = <Onboarding onComplete={finishOnboarding} />;
  } else {
    const screens = {
      dashboard: <Dashboard active={active} />,
      assistant: <Assistant active={active} />,
      discovery: <Discovery active={active} />,
      profiles: <Profiles active={active} setActive={setActive} />,
      designsystem: <DesignSystem />,
    };
    const scroll = !(route === "assistant" || route === "discovery");
    body = (
      <AppFrame route={route} setRoute={setRoute} pets={pets} active={active} setActive={setActive}
        title={META[route].title} sub={META[route].sub} scroll={scroll}>
        {screens[route]}
      </AppFrame>
    );
  }

  return (
    <React.Fragment>
      {body}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Brand colour" />
        <TweakColor label="Accent" value={t.accent} options={ACCENTS.map((a) => a.primary)} onChange={(v) => setTweak("accent", v)} />
        <TweakSection label="Shape & density" />
        <TweakSlider label="Roundness" value={t.roundness} min={0.4} max={1.7} step={0.1} onChange={(v) => setTweak("roundness", v)} />
        <TweakRadio label="Density" value={t.density} options={["airy", "cozy", "compact"]} onChange={(v) => setTweak("density", v)} />
        <TweakSection label="Personality" />
        <TweakSlider label="Cuteness" value={t.cuteness} min={0} max={100} step={10} unit="%" onChange={(v) => setTweak("cuteness", v)} />
        <TweakSelect label="Headline font" value={t.headlineFont} options={["Quicksand", "Nunito", "Baloo 2"]} onChange={(v) => setTweak("headlineFont", v)} />
        <TweakSection label="Navigate" />
        <TweakButton label="Replay onboarding" onClick={() => setRoute("onboarding")} />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
