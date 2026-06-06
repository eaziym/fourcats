/* ============================================================
   Little Lovely Pets — Dashboard screen
   ============================================================ */

function CareRow({ item, onToggle, i, rv }) {
  const done = item.done;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "12px 0", borderBottom: "1px solid var(--surface-2)", ...rv(i) }}>
      <button onClick={onToggle} style={{
        width: 36, height: 36, borderRadius: 999, flex: "0 0 auto", display: "grid", placeItems: "center",
        background: done ? "var(--success-container)" : item.tint || "var(--surface-2)",
        border: done ? "none" : "1.5px solid var(--outline)", transition: "all .2s",
      }}>
        <Icon name={done ? "check" : item.icon} size={19} fill style={{ color: done ? "#13633f" : (item.fg || "var(--ink-2)") }} />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: done ? "var(--ink-3)" : "var(--ink)", textDecoration: done ? "line-through" : "none" }}>{item.title}</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{item.sub}</div>
      </div>
      {done
        ? <span style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>{item.time}</span>
        : (item.action
            ? <Btn size="sm" variant="tonal" onClick={onToggle}>{item.action}</Btn>
            : <span style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>{item.time}</span>)}
    </div>
  );
}

function Dashboard({ active }) {
  const rv = useReveal();
  const vp = useViewport();
  const [log, setLog] = useState([
    { id: 1, title: "Morning feeding", sub: "1/2 cup hypoallergenic kibble", time: "08:00 AM", icon: "restaurant", done: true, tint: "var(--primary-container)", fg: "var(--on-primary-container)" },
    { id: 2, title: "Heartworm medication", sub: "Monthly chewable", action: "Mark done", icon: "medication", done: false, tint: "var(--primary-container)", fg: "var(--on-primary-container)" },
    { id: 3, title: "Evening walk", sub: "East Coast Park · 30 min", time: "06:30 PM", icon: "directions_walk", done: false, tint: "var(--tertiary-container)", fg: "var(--tertiary)" },
  ]);
  const toggle = (id) => setLog((l) => l.map((x) => x.id === id ? { ...x, done: !x.done } : x));
  const doneCount = log.filter((x) => x.done).length;

  return (
    <div style={{ padding: vp.isPhone ? "20px 14px" : "28px", maxWidth: 1160, margin: "0 auto" }}>
      <div style={{ ...rv(0), marginBottom: 22 }}>
        <h1 className="font-d" style={{ fontSize: vp.isPhone ? 26 : 34, fontWeight: 700, margin: 0, letterSpacing: "-.02em" }}>Good morning, Sarah! <span style={{ display: "inline-block", animation: "wag 2.5s ease-in-out infinite", transformOrigin: "70% 90%" }}>👋</span></h1>
        <p style={{ fontSize: 16, color: "var(--ink-2)", margin: "6px 0 0" }}>Here's {active.name}'s care summary for today.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: vp.isNarrow ? "1fr" : "minmax(300px, 0.85fr) 1.15fr", gap: "var(--gap)" }}>
        {/* pet hero */}
        <Card style={rv(1)} pad="0">
          <div style={{ padding: "22px 22px 18px", background: "var(--primary-container)", display: "flex", alignItems: "center", gap: 16 }}>
            <PetAvatar species={active.species} size={72} />
            <div>
              <div className="font-d" style={{ fontSize: 26, fontWeight: 700, color: "var(--ink)" }}>{active.name}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                {active.tags.map((t) => <Chip key={t} tone="yellow" icon="verified" sm>{t}</Chip>)}
              </div>
            </div>
          </div>
          <div style={{ padding: "18px 22px 22px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))", gap: 12 }}>
              <StatTile label="Weight" value={active.weight} />
              <StatTile label="Age" value={active.age} />
              <StatTile label="Breed" value={active.species === "rabbit" ? "Lop" : active.breed.split(" ")[0]} sub={active.breed} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
              <div style={{ width: 44, height: 44, borderRadius: 999, background: "var(--success-container)", display: "grid", placeItems: "center" }}>
                <Icon name="favorite" size={22} fill style={{ color: "var(--success)" }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Health: All good</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>Next check-up in 4 months</div>
              </div>
            </div>
          </div>
        </Card>

        {/* right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
          {/* AI care alert */}
          <div style={{ ...rv(2), borderRadius: "var(--r-lg)", padding: 20, color: "#fff", position: "relative", overflow: "hidden",
            background: "var(--primary)", boxShadow: "0 14px 30px rgba(120,35,56,.18)" }}>
            <Paw size={150} color="rgba(255,255,255,.13)" style={{ position: "absolute", right: -20, bottom: -34, transform: "rotate(18deg)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Icon name="wb_sunny" size={22} fill />
              <span className="font-d" style={{ fontWeight: 700, fontSize: 16 }}>AI Care Alert</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: "rgba(255,255,255,.25)" }}>High Priority</span>
            </div>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5, position: "relative", maxWidth: "92%" }}>
              Hot day in SG — reaching <b>32°C</b>. Keep {active.name} hydrated and avoid hot pavement between <b>12–4pm</b>.
            </p>
          </div>

          {/* care log */}
          <Card style={rv(3)}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <div>
                <h3 className="font-d" style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>Daily Care Log</h3>
                <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{doneCount} of {log.length} done today</div>
              </div>
              <Btn size="sm" variant="ghost" iconR="chevron_right">View all</Btn>
            </div>
            <div>
              {log.map((it, i) => <CareRow key={it.id} item={it} i={i} rv={rv} onToggle={() => toggle(it.id)} />)}
            </div>
            <button style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--primary)", fontWeight: 600, fontSize: 13.5, marginTop: 12 }}>
              <Icon name="add_circle" size={19} fill /> Add a check-in
            </button>
          </Card>
        </div>
      </div>

      {/* bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: vp.isPhone ? "1fr" : vp.isTablet ? "1fr 1fr" : "1fr 1fr 1fr", gap: "var(--gap)", marginTop: "var(--gap)" }}>
        <Card style={rv(4)} hover>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 46, height: 46, borderRadius: "var(--r-md)", background: "var(--secondary-container)", display: "grid", placeItems: "center", flex: "0 0 auto" }}>
              <Icon name="shopping_bag" size={22} fill style={{ color: "var(--secondary)" }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Low on kibble?</div>
              <p style={{ margin: "4px 0 10px", fontSize: 13, color: "var(--ink-2)", lineHeight: 1.45 }}>Time to reorder {active.name}'s hypo-allergenic food from Kohepets.</p>
              <Btn size="sm" variant="tonal" iconR="arrow_forward">Order now</Btn>
            </div>
          </div>
        </Card>

        <Card style={rv(5)} hover>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Icon name="location_on" size={20} fill style={{ color: "var(--tertiary)" }} />
            <span style={{ fontWeight: 700, fontSize: 14.5 }}>Nearby in {active.area}</span>
          </div>
          <MapMini />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>The Animal Clinic</span>
            <span style={{ fontSize: 13, color: "var(--ink-3)" }}>1.2 km away</span>
          </div>
        </Card>

        {/* fun meme moment */}
        <Card style={{ ...rv(6), background: "var(--tertiary-container)" }} hover>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Icon name="sentiment_very_satisfied" size={20} fill style={{ color: "var(--tertiary)" }} />
            <span style={{ fontWeight: 700, fontSize: 14.5, color: "var(--tertiary)" }}>Daily Smile</span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Mascot species={active.species === "cat" ? "cat" : "cat"} size={56} />
            <p className="font-d" style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--on-tertiary-container)", lineHeight: 1.35 }}>
              "I'm not fat, I'm just HDB-sized." — every cat in Singapore 🐾
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MapMini() {
  return (
    <div style={{ height: 96, borderRadius: "var(--r-md)", overflow: "hidden", position: "relative",
      background: "#e6efe8", border: "1px solid var(--outline)" }}>
      <svg viewBox="0 0 300 100" width="100%" height="100%" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, opacity: .5 }}>
        {[18, 44, 70].map((y, i) => <line key={i} x1="0" y1={y} x2="300" y2={y + 8} stroke="#fff" strokeWidth="3" />)}
        {[60, 140, 220].map((x, i) => <line key={i} x1={x} y1="0" x2={x + 12} y2="100" stroke="#fff" strokeWidth="3" />)}
      </svg>
      <div style={{ position: "absolute", left: "46%", top: "40%", transform: "translate(-50%,-50%)" }}>
        <div style={{ width: 26, height: 26, borderRadius: 999, background: "var(--primary)", display: "grid", placeItems: "center", boxShadow: "var(--sh-2)" }}>
          <Icon name="local_hospital" size={15} fill style={{ color: "#fff" }} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
