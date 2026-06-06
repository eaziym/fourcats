/* ============================================================
   Little Lovely Pets — Design System spec page
   ============================================================ */

function DSSection({ title, sub, children, i, rv }) {
  return (
    <div style={{ ...rv(i), marginBottom: 30 }}>
      <div style={{ marginBottom: 14 }}>
        <h2 className="font-d" style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{title}</h2>
        {sub && <p style={{ fontSize: 13.5, color: "var(--ink-3)", margin: "3px 0 0" }}>{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function Swatch({ name, varName, fg }) {
  return (
    <div style={{ borderRadius: "var(--r-md)", overflow: "hidden", border: "1px solid var(--outline)" }}>
      <div style={{ height: 64, background: `var(${varName})`, display: "flex", alignItems: "flex-end", padding: 8 }}>
        {fg && <span style={{ fontSize: 11, fontWeight: 700, color: fg }}>Aa</span>}
      </div>
      <div style={{ padding: "8px 10px", background: "var(--surface)" }}>
        <div style={{ fontSize: 12.5, fontWeight: 700 }}>{name}</div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "monospace" }}>{varName}</div>
      </div>
    </div>
  );
}

function DesignSystem() {
  const rv = useReveal();
  const vp = useViewport();
  const types = [
    { label: "Display / Quicksand 700", cls: "font-d", size: 34, w: 700, txt: "Lovely care, tailored." },
    { label: "Headline / Quicksand 700", cls: "font-d", size: 24, w: 700, txt: "Meet your furry friend" },
    { label: "Title / Quicksand 600", cls: "font-d", size: 19, w: 600, txt: "Daily Care Log" },
    { label: "Body / Inter 400", cls: "", size: 16, w: 400, txt: "Grounded in Singapore-specific pet data." },
    { label: "Label / Inter 600", cls: "", size: 13, w: 600, txt: "HDB-APPROVED" },
  ];
  return (
    <div style={{ padding: vp.isPhone ? "20px 14px" : "28px", maxWidth: 1040, margin: "0 auto" }}>
      <div style={{ ...rv(0), marginBottom: 24 }}>
        <Chip tone="pink" icon="palette">Standardised system</Chip>
        <h1 className="font-d" style={{ fontSize: 32, fontWeight: 700, margin: "10px 0 4px", letterSpacing: "-.02em" }}>Modern Warmth</h1>
        <p style={{ fontSize: 15.5, color: "var(--ink-2)", margin: 0, maxWidth: 620 }}>One source of truth across onboarding, dashboard, assistant and discovery. Tokens below respond live to the Tweaks panel.</p>
      </div>

      <DSSection i={1} rv={rv} title="Brand & mascot" sub="A friendly, species-flexible face — dog, cat & small pets all welcome.">
        <Card>
          <div style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
            {["brand", "dog", "cat", "rabbit"].map((sp) => (
              <div key={sp} style={{ textAlign: "center" }}>
                <Mascot species={sp} size={72} />
                <div style={{ fontSize: 12, fontWeight: 700, marginTop: 8, textTransform: "capitalize" }}>{sp}</div>
              </div>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Paw size={40} />
              <div>
                <div className="font-d" style={{ fontWeight: 700, fontSize: 18, color: "var(--primary)" }}>Little Lovely Pets</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Wordmark · Quicksand 700</div>
              </div>
            </div>
          </div>
        </Card>
      </DSSection>

      <DSSection i={2} rv={rv} title="Colour tokens" sub="Petal Pink primary · Tail Wag Yellow · Loyal Navy · warm neutrals.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px,1fr))", gap: 12 }}>
          <Swatch name="Primary" varName="--primary" fg="#fff" />
          <Swatch name="Primary Bright" varName="--primary-bright" fg="#fff" />
          <Swatch name="Primary Container" varName="--primary-container" fg="var(--on-primary-container)" />
          <Swatch name="Secondary" varName="--secondary-container" fg="var(--on-secondary-container)" />
          <Swatch name="Tertiary" varName="--tertiary" fg="#fff" />
          <Swatch name="Tertiary Container" varName="--tertiary-container" fg="var(--on-tertiary-container)" />
          <Swatch name="Success" varName="--success-container" fg="#13633f" />
          <Swatch name="Surface" varName="--surface" fg="var(--ink)" />
        </div>
      </DSSection>

      <DSSection i={3} rv={rv} title="Typography" sub="Quicksand for warmth, Inter for clarity.">
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {types.map((t) => (
              <div key={t.label} style={{ display: "flex", alignItems: "baseline", gap: 18, borderBottom: "1px solid var(--surface-2)", paddingBottom: 14 }}>
                <div style={{ width: 200, fontSize: 12, color: "var(--ink-3)", fontWeight: 600, flex: "0 0 auto" }}>{t.label}</div>
                <div className={t.cls} style={{ fontSize: t.size, fontWeight: t.w, letterSpacing: t.cls ? "-.01em" : 0 }}>{t.txt}</div>
              </div>
            ))}
          </div>
        </Card>
      </DSSection>

      <DSSection i={4} rv={rv} title="Buttons & chips" sub="Pill-shaped, gentle bounce on press.">
        <Card>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
            <Btn variant="primary" icon="auto_awesome">Primary</Btn>
            <Btn variant="tonal">Tonal</Btn>
            <Btn variant="navy" icon="event">Navy</Btn>
            <Btn variant="soft" icon="favorite">Soft</Btn>
            <Btn variant="ghost" iconR="chevron_right">Ghost</Btn>
            <Btn variant="danger" icon="delete">Danger</Btn>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Chip tone="pink" icon="verified">HDB-Approved</Chip>
            <Chip tone="yellow" icon="star">4.8</Chip>
            <Chip tone="navy" icon="location_on">Tampines</Chip>
            <Chip tone="green" icon="check_circle">Up to date</Chip>
            <Chip tone="neutral" icon="pets">Small Pet</Chip>
          </div>
        </Card>
      </DSSection>

      <DSSection i={5} rv={rv} title="Shape & elevation" sub="Rounded everything; soft ambient shadows.">
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {[["xs","--r-xs"],["sm","--r-sm"],["md","--r-md"],["lg","--r-lg"],["xl","--r-xl"],["pill","--r-pill"]].map(([n, v]) => (
            <div key={n} style={{ textAlign: "center" }}>
              <div style={{ width: 76, height: 76, background: "var(--surface)", borderRadius: `var(${v})`, boxShadow: "var(--sh-1)", border: "1px solid var(--outline)" }} />
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6 }}>{n}</div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 14, marginLeft: 8 }}>
            {[["Level 1","--sh-1"],["Level 2","--sh-2"],["Pop","--sh-pop"]].map(([n, v]) => (
              <div key={n} style={{ textAlign: "center" }}>
                <div style={{ width: 76, height: 76, background: "var(--surface)", borderRadius: "var(--r-md)", boxShadow: `var(${v})` }} />
                <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6 }}>{n}</div>
              </div>
            ))}
          </div>
        </div>
      </DSSection>
    </div>
  );
}

Object.assign(window, { DesignSystem });
