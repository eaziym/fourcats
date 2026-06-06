/* ============================================================
   Little Lovely Pets — AI Assistant screen
   Profile-aware chat + resizable AI context panel
   ============================================================ */

const SUGGESTIONS = [
  { q: "Best groomer near me for sensitive skin?", kind: "groomer" },
  { q: "Is Acana Adult Dog food safe?", kind: "food" },
  { q: "She's scratching a lot — which vet?", kind: "vet" },
];

function answerFor(kind, pet) {
  if (kind === "food") return {
    text: `I checked Acana Adult against ${pet.name}'s profile. Two ingredients to watch: it contains chicken and lentils — common triggers for ${pet.species === "dog" ? "Shih Tzus" : pet.species + "s"} with sensitive skin. I'd suggest a fish-based, limited-ingredient formula instead.`,
    flag: { tone: "yellow", icon: "warning", title: "Possible trigger", body: "Chicken + lentils may aggravate sensitive skin. Consider salmon-based LID food." },
    sources: [
      { src: "Kohepets Catalogue", icon: "inventory_2", title: "Acana Adult — Ingredients", body: "Chicken, chicken meal, red lentils, pinto beans, whole green peas…" },
      { src: "Vet Knowledge Base", icon: "medical_information", title: "Sensitive skin diet guidance", body: "Limited-ingredient, novel-protein diets reduce flare-ups in humid climates." },
    ],
  };
  if (kind === "vet") return {
    text: `Increased scratching paired with ${pet.name}'s history is worth a dermatology check. Based on reviews near ${pet.area}, here's a well-rated clinic that handles skin & allergy cases.`,
    card: { name: "The Animal Clinic — " + pet.area, sub: "Strong reviews for derm & allergy work.", rating: "4.7", chips: [["HDB-Approved","green"],["1.2 km","neutral"]], icon: "local_hospital" },
    sources: [
      { src: "Google Maps API", icon: "map", title: "The Animal Clinic reviews", body: '"Dr Tan was thorough with our pup\'s skin allergy — clear treatment plan."' },
      { src: "Review Sentiment", icon: "reviews", title: "Derm sentiment: 92% positive", body: "Owners praise allergy diagnosis & follow-up care." },
    ],
  };
  return {
    text: `Based on ${pet.name}'s profile, sensitive skin needs special care. I found a highly-rated groomer in ${pet.area} that specialises in dermatological grooming.`,
    card: { name: "Heartland Paws " + pet.area, sub: "Medicated baths & hypoallergenic styling.", rating: "4.8", chips: [["HDB-Approved","green"],["1.2 km","neutral"]], icon: "content_cut" },
    follow: ["Yes, check Saturday", "Show other options", "Call them"],
    sources: [
      { src: "Google Maps API", icon: "map", title: "Heartland Paws reviews", body: '"Wonderful with my sensitive pup — used a medicated shampoo that didn\'t irritate her skin at all."' },
      { src: "Pet Lovers Centre", icon: "storefront", title: "Oatmeal Medicated Shampoo", body: "Recommended for sensitive skin. Eases itching common in humid SG climates." },
    ],
  };
}

function ResultCard({ card }) {
  return (
    <div style={{ marginTop: 12, border: "1px solid var(--outline)", borderRadius: "var(--r-md)", padding: 12, display: "flex", gap: 12, alignItems: "center", background: "var(--surface-2)" }}>
      <div style={{ width: 46, height: 46, borderRadius: "var(--r-sm)", background: "var(--primary-container)", display: "grid", placeItems: "center", flex: "0 0 auto" }}>
        <Icon name={card.icon} size={22} fill style={{ color: "var(--on-primary-container)" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 14.5 }}>{card.name}</span>
          <Chip tone="yellow" icon="star" sm>{card.rating}</Chip>
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-2)", margin: "3px 0 7px" }}>{card.sub}</div>
        <div style={{ display: "flex", gap: 6 }}>{card.chips.map(([l, t]) => <Chip key={l} tone={t} sm>{l}</Chip>)}</div>
      </div>
    </div>
  );
}

function Bubble({ m, pet }) {
  if (m.role === "user") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, ...m.rv }}>
        <div style={{ maxWidth: "76%", padding: "13px 17px", borderRadius: "var(--r-lg) var(--r-lg) 6px var(--r-lg)",
          background: "var(--primary)", color: "#fff", fontSize: 14.5, lineHeight: 1.5, boxShadow: "0 8px 18px rgba(120,35,56,.18)" }}>
          {m.text}
        </div>
        <div style={{ width: 32, height: 32, borderRadius: 999, background: "var(--secondary-container)", display: "grid", placeItems: "center", flex: "0 0 auto" }}>
          <Icon name="person" size={18} fill style={{ color: "var(--secondary)" }} />
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", gap: 10, ...m.rv }}>
      <div style={{ width: 34, height: 34, borderRadius: 999, background: "var(--primary)", display: "grid", placeItems: "center", flex: "0 0 auto", boxShadow: "var(--sh-1)" }}>
        <Icon name="smart_toy" size={19} fill style={{ color: "#fff" }} />
      </div>
      <div style={{ maxWidth: "82%" }}>
        <div style={{ padding: "14px 18px", borderRadius: "var(--r-lg) var(--r-lg) var(--r-lg) 6px",
          background: "color-mix(in srgb, var(--surface) 78%, var(--primary-container))", border: "1px solid var(--outline)",
          color: "var(--ink)", fontSize: 14.5, lineHeight: 1.55, boxShadow: "var(--sh-1)" }}>
          {m.text}{m.typing && <span style={{ display: "inline-block", width: 8, height: 16, background: "var(--primary)", marginLeft: 2, borderRadius: 2, animation: "blink 1s steps(2) infinite", verticalAlign: "-2px" }} />}
          {m.flag && !m.typing && (
            <div style={{ marginTop: 12, display: "flex", gap: 10, padding: 11, borderRadius: "var(--r-sm)", background: "var(--secondary-container)" }}>
              <Icon name={m.flag.icon} size={20} fill style={{ color: "var(--secondary)", flex: "0 0 auto" }} />
              <div><div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--on-secondary-container)" }}>{m.flag.title}</div>
                <div style={{ fontSize: 13, color: "var(--on-secondary-container)" }}>{m.flag.body}</div></div>
            </div>
          )}
          {m.card && !m.typing && <ResultCard card={m.card} />}
        </div>
        {m.follow && !m.typing && (
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {m.follow.map((f) => <Chip key={f} tone="pink" style={{ cursor: "pointer" }}>{f}</Chip>)}
          </div>
        )}
      </div>
    </div>
  );
}

function ContextPanel({ sources, onGrip, width }) {
  return (
    <aside style={{ width, flex: "0 0 auto", position: "relative", borderLeft: "1px solid var(--outline)", background: "var(--surface)", height: "100%", overflow: "auto" }}>
      {onGrip && <Grip onMouseDown={onGrip} side="left" />}
      <div style={{ padding: "20px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Icon name="hub" size={19} fill style={{ color: "var(--primary)" }} />
          <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-2)" }}>AI Context Sources</span>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--ink-3)", margin: "0 0 16px", lineHeight: 1.45 }}>Grounded in Singapore-specific data, filtered for this pet.</p>
        {sources.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 12px", color: "var(--ink-3)" }}>
            <Mascot species="brand" size={64} style={{ margin: "0 auto 10px" }} />
            <div style={{ fontSize: 13 }}>Ask a question — I'll show exactly which local sources I used.</div>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sources.map((s, i) => (
            <div key={i} style={{ padding: 13, borderRadius: "var(--r-md)", background: "var(--surface-2)", border: "1px solid var(--outline)", animation: "cardIn .45s ease both", animationDelay: `${i * 90}ms` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
                <Icon name={s.icon} size={16} fill style={{ color: "var(--tertiary)" }} />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--tertiary)" }}>{s.src}</span>
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 3 }}>{s.title}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.45 }}>{s.body}</div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function Assistant({ active }) {
  const vp = useViewport();
  const [msgs, setMsgs] = useState([
    { role: "ai", text: `Hi! How is ${active.name} doing today? I can help with grooming, health, diet or local services for your ${SPECIES_LABEL[active.species]}.` },
  ]);
  const [sources, setSources] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [pw, onGrip] = useResizable(312, { min: 240, max: 460, side: "left" });
  const scroller = useRef(null);

  useEffect(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [msgs]);
  useEffect(() => { // reset greeting when pet changes
    setMsgs([{ role: "ai", text: `Hi! How is ${active.name} doing today? I can help with grooming, health, diet or local services for your ${SPECIES_LABEL[active.species]}.` }]);
    setSources([]);
  }, [active.id]);

  const send = (text, kind) => {
    if (busy || !text.trim()) return;
    const k = kind || (/(food|acana|safe|eat|kibble)/i.test(text) ? "food" : /(vet|scratch|itch|sick)/i.test(text) ? "vet" : "groomer");
    const rv = { animation: "cardIn .4s ease both" };
    setMsgs((m) => [...m, { role: "user", text, rv }]);
    setInput("");
    setBusy(true);
    const a = answerFor(k, active);
    const full = a.text;
    setTimeout(() => {
      setMsgs((m) => [...m, { role: "ai", text: "", typing: true, rv }]);
      let i = 0;
      const words = full.split(" ");
      const iv = setInterval(() => {
        i++;
        setMsgs((m) => { const c = [...m]; c[c.length - 1] = { ...c[c.length - 1], text: words.slice(0, i).join(" ") }; return c; });
        if (i >= words.length) {
          clearInterval(iv);
          setMsgs((m) => { const c = [...m]; c[c.length - 1] = { ...c[c.length - 1], typing: false, card: a.card, flag: a.flag, follow: a.follow }; return c; });
          setSources(a.sources);
          if (vp.isTablet) setDrawer(true);
          setBusy(false);
        }
      }, 38);
    }, 480);
  };

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 0 }}>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", height: "100%" }}>
        <div ref={scroller} style={{ flex: 1, overflow: "auto", padding: "26px 30px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ textAlign: "center" }}><Chip tone="neutral" sm>Today</Chip></div>
            {msgs.map((m, i) => <Bubble key={i} m={m} pet={active} />)}
            {msgs.length <= 1 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
                {SUGGESTIONS.map((s) => (
                  <button key={s.q} onClick={() => send(s.q, s.kind)} style={{
                    fontSize: 13, fontWeight: 600, padding: "9px 14px", borderRadius: "var(--r-pill)",
                    background: "var(--surface)", border: "1px solid var(--outline)", color: "var(--ink-2)",
                    boxShadow: "var(--sh-1)", transition: "transform .15s",
                  }} onMouseEnter={(e)=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={(e)=>e.currentTarget.style.transform="none"}>
                    <Icon name="auto_awesome" size={15} fill style={{ verticalAlign: "-3px", marginRight: 5, color: "var(--primary)" }} />{s.q}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* composer */}
        <div style={{ padding: vp.isPhone ? "12px 16px 18px" : "14px 30px 22px", borderTop: "1px solid var(--outline)", background: "var(--bg)" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", gap: 10, background: "var(--surface)", borderRadius: "var(--r-pill)", padding: "7px 7px 7px 18px", boxShadow: "var(--sh-1)", border: "1px solid var(--outline)" }}>
            <Icon name="mic" size={22} style={{ color: "var(--ink-3)" }} />
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder={vp.isPhone ? `Ask about ${active.name}…` : `Ask about ${active.name}'s health, diet, or local services…`}
              style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontSize: 15, color: "var(--ink)" }} />
            {vp.isTablet && sources.length > 0 && (
              <button onClick={() => setDrawer(true)} title="AI sources" style={{ width: 44, height: 44, borderRadius: 999, display: "grid", placeItems: "center", background: "var(--tertiary-container)", flex: "0 0 auto" }}>
                <Icon name="hub" size={20} fill style={{ color: "var(--tertiary)" }} />
              </button>
            )}
            <button onClick={() => send(input)} disabled={busy} style={{
              width: 44, height: 44, borderRadius: 999, display: "grid", placeItems: "center",
              background: busy ? "var(--surface-3)" : "var(--primary)",
              transition: "background .2s", flex: "0 0 auto",
            }}>
              <Icon name="send" size={20} fill style={{ color: busy ? "var(--ink-3)" : "#fff" }} />
            </button>
          </div>
        </div>
      </div>
      {!vp.isTablet && <ContextPanel sources={sources} onGrip={onGrip} width={pw} />}
      {vp.isTablet && drawer && (
        <div onClick={() => setDrawer(false)} style={{ position: "absolute", inset: 0, zIndex: 50, background: "rgba(25,20,23,.35)", display: "flex", justifyContent: "flex-end" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(360px, 86%)", height: "100%", background: "var(--surface)", boxShadow: "var(--sh-pop)", animation: "popIn .22s ease both", overflow: "auto", position: "relative" }}>
            <button onClick={() => setDrawer(false)} style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: 999, background: "var(--surface-2)", display: "grid", placeItems: "center", zIndex: 2 }}>
              <Icon name="close" size={19} style={{ color: "var(--ink-2)" }} />
            </button>
            <ContextPanel sources={sources} width="100%" />
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Assistant });
