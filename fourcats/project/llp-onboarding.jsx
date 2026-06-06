/* ============================================================
   Little Lovely Pets — Onboarding flow (pre-app)
   ============================================================ */

const STEPS = ["Basic Info", "Vitals", "Health", "Location"];
const SPECIES_OPTS = [
  { id: "dog", label: "Dog", icon: "sound_detection_dog_barking" },
  { id: "cat", label: "Cat", icon: "pets" },
  { id: "rabbit", label: "Small Pet", icon: "cruelty_free" },
];
const BREEDS = {
  dog: ["Shih Tzu", "Poodle", "Maltese", "Corgi", "Singapore Special"],
  cat: ["Singapura", "British Shorthair", "Ragdoll", "Domestic Shorthair"],
  rabbit: [
    "Holland Lop",
    "Netherland Dwarf",
    "Lionhead",
    "Hamster",
    "Guinea Pig",
  ],
};
const CONDITIONS = [
  "Sensitive Skin",
  "Allergies",
  "Dental Care",
  "Weight Mgmt",
  "Joint Care",
  "Anxiety",
];
const DIETS = [
  "Grain-Free",
  "Hypoallergenic",
  "Limited Ingredient",
  "Hay-Based",
  "No Chicken",
];

function StepDots({ step }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        {STEPS.map((s, i) => (
          <div
            key={s}
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: i <= step ? "var(--primary)" : "var(--ink-3)",
              transition: "color .3s",
            }}
          >
            {s}
          </div>
        ))}
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 99,
          background: "var(--surface-3)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${((step + 1) / STEPS.length) * 100}%`,
            borderRadius: 99,
            background: "var(--primary)",
            transition: "width .45s cubic-bezier(.22,1,.36,1)",
          }}
        />
      </div>
    </div>
  );
}

function PickCard({ active, icon, label, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "18px 14px",
        borderRadius: "var(--r-md)",
        textAlign: "center",
        background: active ? "var(--primary-container)" : "var(--surface-2)",
        border: `2px solid ${active ? "var(--primary)" : "transparent"}`,
        transition: "all .18s",
        transform: active ? "translateY(-2px)" : "none",
        boxShadow: active ? "0 8px 18px rgba(120,35,56,.14)" : "none",
      }}
    >
      <Icon
        name={icon}
        size={30}
        fill={active}
        style={{ color: active ? "var(--primary)" : "var(--ink-2)" }}
      />
      <div
        style={{
          fontWeight: 700,
          fontSize: 14.5,
          marginTop: 6,
          color: active ? "var(--on-primary-container)" : "var(--ink)",
        }}
      >
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{sub}</div>
      )}
    </button>
  );
}

function MultiChips({ options, value, onToggle }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button
            key={o}
            onClick={() => onToggle(o)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "8px 14px",
              borderRadius: "var(--r-pill)",
              fontSize: 13.5,
              fontWeight: 600,
              transition: "background .15s, color .15s, border-color .15s",
              background: on ? "var(--primary-container)" : "var(--surface-2)",
              color: on ? "var(--on-primary-container)" : "var(--ink-2)",
              border: `1.5px solid ${on ? "var(--primary)" : "transparent"}`,
            }}
          >
            <Icon
              name="check"
              size={15}
              style={{
                width: 15,
                opacity: on ? 1 : 0,
                transition: "opacity .15s",
              }}
            />
            {o}
          </button>
        );
      })}
    </div>
  );
}

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState({
    species: "dog",
    name: "",
    breed: "",
    weight: 6.2,
    age: 3,
    conditions: ["Sensitive Skin"],
    diet: ["Hypoallergenic"],
    postal: "",
    area: "Tampines",
    housing: "HDB",
  });
  const set = (k, v) => setD((s) => ({ ...s, [k]: v }));
  const next = () => (step < 3 ? setStep(step + 1) : onComplete(d));

  return (
    <div
      style={{
        height: "100%",
        overflow: "auto",
        background: "var(--primary-container)",
      }}
    >
      {/* minimal top bar (pre-app, intentionally different) */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => (step > 0 ? setStep(step - 1) : null)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              display: "grid",
              placeItems: "center",
              background: "var(--surface)",
              boxShadow: "var(--sh-1)",
            }}
          >
            <Icon name="arrow_back" size={20} />
          </button>
          <Mascot species="brand" size={34} />
          <span
            className="font-d"
            style={{ fontWeight: 700, fontSize: 17, color: "var(--primary)" }}
          >
            Little Lovely Pets
          </span>
        </div>
        <button
          onClick={() => onComplete(d)}
          style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-3)" }}
        >
          Skip setup
        </button>
      </header>

      <div
        style={{ maxWidth: 720, margin: "0 auto", padding: "16px 24px 60px" }}
      >
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <h1
            className="font-d"
            style={{
              fontSize: 34,
              fontWeight: 700,
              margin: 0,
              letterSpacing: "-.02em",
            }}
          >
            Let's meet your furry friend
          </h1>
          <p style={{ fontSize: 16, color: "var(--ink-2)", margin: "8px 0 0" }}>
            Tell us a bit about them so we can tailor the best care in
            Singapore.
          </p>
        </div>

        <StepDots step={step} />

        <Card style={{ marginTop: 26, padding: 28 }}>
          <div key={step} style={{ animation: "cardIn .35s ease both" }}>
            {step === 0 && (
              <div style={{ display: "flex", gap: 26, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 240px" }}>
                  <div
                    style={{
                      height: 168,
                      borderRadius: "var(--r-md)",
                      border: "2px dashed var(--outline-2)",
                      display: "grid",
                      placeItems: "center",
                      background: "var(--surface-2)",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 999,
                          background: "var(--surface)",
                          boxShadow: "var(--sh-1)",
                          display: "grid",
                          placeItems: "center",
                          margin: "0 auto 8px",
                        }}
                      >
                        <Icon
                          name="add_a_photo"
                          size={24}
                          style={{ color: "var(--primary)" }}
                        />
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        Upload Photo
                      </div>
                      <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                        Show off that cute face
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 18 }}>
                    <Field label="Pet's name">
                      <Input
                        value={d.name}
                        onChange={(v) => set("name", v)}
                        placeholder="e.g., Mochi"
                      />
                    </Field>
                  </div>
                </div>
                <div style={{ flex: "1 1 240px" }}>
                  <Field label="Species">
                    <div style={{ display: "flex", gap: 10 }}>
                      {SPECIES_OPTS.map((s) => (
                        <PickCard
                          key={s.id}
                          active={d.species === s.id}
                          icon={s.icon}
                          label={s.label}
                          onClick={() => {
                            set("species", s.id);
                            set("breed", "");
                          }}
                        />
                      ))}
                    </div>
                  </Field>
                  <div style={{ marginTop: 18 }}>
                    <Field
                      label="Breed"
                      hint='Choosing "Singapore Special" helps us tailor local HDB guidelines.'
                    >
                      <select
                        value={d.breed}
                        onChange={(e) => set("breed", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          fontSize: 15,
                          borderRadius: "var(--r-sm)",
                          border: "1.5px solid transparent",
                          background: "var(--surface-2)",
                          color: d.breed ? "var(--ink)" : "var(--ink-3)",
                          appearance: "none",
                        }}
                      >
                        <option value="">Select breed…</option>
                        {BREEDS[d.species].map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div style={{ display: "grid", gap: 24 }}>
                <Field label={`Weight — ${d.weight.toFixed(1)} kg`}>
                  <input
                    type="range"
                    min="0.5"
                    max="40"
                    step="0.1"
                    value={d.weight}
                    onChange={(e) => set("weight", +e.target.value)}
                    style={rangeStyle}
                  />
                </Field>
                <Field
                  label={`Age — ${d.age} ${d.age === 1 ? "year" : "years"}`}
                >
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={d.age}
                    onChange={(e) => set("age", +e.target.value)}
                    style={rangeStyle}
                  />
                </Field>
                <Field label="Activity level">
                  <Seg
                    full
                    options={[
                      { value: "low", label: "Chill" },
                      { value: "med", label: "Balanced" },
                      { value: "high", label: "Zoomies" },
                    ]}
                    value={d.activity || "med"}
                    onChange={(v) => set("activity", v)}
                  />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: "grid", gap: 24 }}>
                <Field
                  label="Health conditions"
                  hint="Select any that apply — we'll personalise food & service recommendations."
                >
                  <MultiChips
                    options={CONDITIONS}
                    value={d.conditions}
                    onToggle={(o) =>
                      set(
                        "conditions",
                        d.conditions.includes(o)
                          ? d.conditions.filter((x) => x !== o)
                          : [...d.conditions, o],
                      )
                    }
                  />
                </Field>
                <Field label="Dietary restrictions">
                  <MultiChips
                    options={DIETS}
                    value={d.diet}
                    onToggle={(o) =>
                      set(
                        "diet",
                        d.diet.includes(o)
                          ? d.diet.filter((x) => x !== o)
                          : [...d.diet, o],
                      )
                    }
                  />
                </Field>
              </div>
            )}

            {step === 3 && (
              <div style={{ display: "grid", gap: 24 }}>
                <Field
                  label="Postal code"
                  hint="We use this to find nearby vets, groomers and services that suit your home."
                >
                  <Input
                    value={d.postal}
                    onChange={(v) => set("postal", v)}
                    placeholder="e.g., 520201"
                  />
                </Field>
                <Field
                  label="Home type"
                  hint="Helps us tailor advice — e.g. HDB pet guidelines, condo by-laws, or landed-garden tips."
                >
                  <Seg
                    full
                    options={["HDB", "Condo", "Landed"]}
                    value={d.housing}
                    onChange={(v) => set("housing", v)}
                  />
                </Field>
                <Field label="Neighbourhood">
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["Tampines", "Bedok", "Punggol", "Jurong", "Bishan"].map(
                      (a) => (
                        <button
                          key={a}
                          onClick={() => set("area", a)}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "var(--r-pill)",
                            fontSize: 13.5,
                            fontWeight: 600,
                            background:
                              d.area === a
                                ? "var(--primary-container)"
                                : "var(--surface-2)",
                            color:
                              d.area === a
                                ? "var(--on-primary-container)"
                                : "var(--ink-2)",
                            border: `1.5px solid ${d.area === a ? "var(--primary)" : "transparent"}`,
                          }}
                        >
                          {a}
                        </button>
                      ),
                    )}
                  </div>
                </Field>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    padding: 14,
                    borderRadius: "var(--r-md)",
                    background: "var(--secondary-container)",
                  }}
                >
                  <Mascot species={d.species} size={44} />
                  <div
                    style={{
                      fontSize: 13.5,
                      color: "var(--on-secondary-container)",
                      fontWeight: 600,
                    }}
                  >
                    All set! {d.name || "Your pet"}'s profile will power every
                    recommendation.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              height: 1,
              background: "var(--outline)",
              margin: "24px -28px 20px",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => step > 0 && setStep(step - 1)}
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: step > 0 ? "var(--ink-2)" : "transparent",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Icon name="arrow_back" size={18} /> Back
            </button>
            <Btn
              variant="primary"
              iconR={step < 3 ? "arrow_forward" : "check_circle"}
              onClick={next}
              size="lg"
            >
              {step < 3
                ? `Next: ${STEPS[step + 1]}`
                : "Finish — meet your dashboard"}
            </Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

const rangeStyle = { width: "100%", accentColor: "var(--primary)", height: 6 };

Object.assign(window, { Onboarding });
