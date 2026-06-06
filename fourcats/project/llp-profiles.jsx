/* ============================================================
   Little Lovely Pets — Pet Profiles screen
   ============================================================ */

const PROFILE_EXTRA = {
  mochi: {
    vax: [
      ["Rabies", "done"],
      ["DHPP", "done"],
      ["Heartworm", "due"],
    ],
    diet: ["Hypoallergenic", "No Chicken"],
    vet: "The Animal Clinic",
  },
  nutmeg: {
    vax: [
      ["Tricat", "done"],
      ["Rabies", "done"],
      ["Deworming", "due"],
    ],
    diet: ["Grain-Free", "Indoor Formula"],
    vet: "Bedok Vet Surgery",
  },
  clover: {
    vax: [
      ["RHDV2", "done"],
      ["Health Check", "due"],
    ],
    diet: ["Unlimited Hay", "Leafy Greens"],
    vet: "Bedok Vet Surgery (Exotics)",
  },
};

function PetMiniCard({ p, active, onClick, i, rv }) {
  return (
    <Card
      onClick={onClick}
      hover
      style={{
        ...rv(i),
        padding: 16,
        borderColor: active ? "var(--primary)" : "var(--outline)",
        borderWidth: active ? 2 : 1,
        borderStyle: "solid",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
        <PetAvatar species={p.species} size={52} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="font-d" style={{ fontWeight: 700, fontSize: 17 }}>
            {p.name}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{p.breed}</div>
        </div>
        {active && (
          <Icon
            name="check_circle"
            size={22}
            fill
            style={{ color: "var(--primary)" }}
          />
        )}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
        <Chip tone="neutral" sm>
          {SPECIES_LABEL[p.species]}
        </Chip>
        <Chip tone="neutral" sm icon="cake">
          {p.age}
        </Chip>
        <Chip tone="neutral" sm icon="location_on">
          {p.area}
        </Chip>
      </div>
    </Card>
  );
}

function Profiles({ active, setActive }) {
  const rv = useReveal();
  const vp = useViewport();
  const x = PROFILE_EXTRA[active.id];
  return (
    <div
      style={{
        padding: vp.isPhone ? "20px 14px" : "28px",
        maxWidth: 1160,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 14,
          flexWrap: "wrap",
          marginBottom: 20,
          ...rv(0),
        }}
      >
        <div>
          <h1
            className="font-d"
            style={{
              fontSize: 30,
              fontWeight: 700,
              margin: 0,
              letterSpacing: "-.02em",
            }}
          >
            Pet Profiles
          </h1>
          <p style={{ fontSize: 15, color: "var(--ink-2)", margin: "5px 0 0" }}>
            Every profile sharpens {active.name === "" ? "the" : "the"} AI's
            recommendations.
          </p>
        </div>
        <Btn variant="primary" icon="add">
          Add a pet
        </Btn>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
          gap: "var(--gap)",
          marginBottom: 26,
        }}
      >
        {PETS.map((p, i) => (
          <PetMiniCard
            key={p.id}
            p={p}
            i={i}
            rv={rv}
            active={p.id === active.id}
            onClick={() => setActive(p)}
          />
        ))}
        <button
          onClick={() => {}}
          style={{
            borderRadius: "var(--r-lg)",
            border: "2px dashed var(--outline-2)",
            background: "transparent",
            display: "grid",
            placeItems: "center",
            minHeight: 116,
            color: "var(--ink-3)",
            ...rv(PETS.length),
          }}
        >
          <div style={{ textAlign: "center" }}>
            <Icon
              name="add_circle"
              size={30}
              style={{ color: "var(--primary)" }}
            />
            <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 4 }}>
              Add a pet
            </div>
          </div>
        </button>
      </div>

      {/* detailed profile */}
      <div
        key={active.id}
        style={{
          display: "grid",
          gridTemplateColumns: vp.isNarrow ? "1fr" : "1fr 1.4fr",
          gap: "var(--gap)",
          animation: "cardIn .4s ease both",
        }}
      >
        <Card pad="0" style={{ overflow: "hidden" }}>
          <div
            style={{
              padding: "26px",
              textAlign: "center",
              background: "var(--primary-container)",
            }}
          >
            <PetAvatar
              species={active.species}
              size={108}
              style={{ margin: "0 auto" }}
            />
            <div
              className="font-d"
              style={{ fontSize: 26, fontWeight: 700, marginTop: 12 }}
            >
              {active.name}
            </div>
            <div style={{ fontSize: 13.5, color: "var(--ink-2)" }}>
              {active.breed} · {SPECIES_LABEL[active.species]}
            </div>
            <div
              style={{
                display: "flex",
                gap: 6,
                justifyContent: "center",
                marginTop: 10,
                flexWrap: "wrap",
              }}
            >
              {active.tags.map((t) => (
                <Chip key={t} tone="yellow" icon="verified" sm>
                  {t}
                </Chip>
              ))}
            </div>
          </div>
          <div
            style={{
              padding: 20,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))",
              gap: 12,
            }}
          >
            <StatTile label="Weight" value={active.weight} />
            <StatTile label="Age" value={active.age} />
            <StatTile label="Area" value={active.area} />
          </div>
          <div style={{ padding: "0 20px 20px" }}>
            <Btn variant="soft" full icon="edit">
              Edit profile
            </Btn>
          </div>
        </Card>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--gap)",
          }}
        >
          <Card>
            <SecTitle icon="vaccines" title="Vaccination & health" />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginTop: 14,
              }}
            >
              {x.vax.map(([name, st]) => (
                <div
                  key={name}
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      display: "grid",
                      placeItems: "center",
                      background:
                        st === "done"
                          ? "var(--success-container)"
                          : "var(--secondary-container)",
                    }}
                  >
                    <Icon
                      name={st === "done" ? "check" : "schedule"}
                      size={18}
                      fill
                      style={{
                        color:
                          st === "done" ? "var(--success)" : "var(--secondary)",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>
                    {name}
                  </div>
                  <Chip tone={st === "done" ? "green" : "yellow"} sm>
                    {st === "done" ? "Up to date" : "Due soon"}
                  </Chip>
                </div>
              ))}
            </div>
          </Card>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: vp.isPhone ? "1fr" : "1fr 1fr",
              gap: "var(--gap)",
            }}
          >
            <Card>
              <SecTitle icon="restaurant" title="Diet" />
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginTop: 12,
                }}
              >
                {x.diet.map((dd) => (
                  <Chip key={dd} tone="pink" sm>
                    {dd}
                  </Chip>
                ))}
              </div>
            </Card>
            <Card>
              <SecTitle icon="local_hospital" title="Primary vet" />
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 12 }}>
                {x.vet}
              </div>
              <Btn
                size="sm"
                variant="ghost"
                iconR="arrow_forward"
                style={{ marginTop: 8, padding: "6px 0" }}
              >
                View on map
              </Btn>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecTitle({ icon, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <Icon name={icon} size={20} fill style={{ color: "var(--primary)" }} />
      <h3
        className="font-d"
        style={{ margin: 0, fontSize: 17, fontWeight: 700 }}
      >
        {title}
      </h3>
    </div>
  );
}

Object.assign(window, { Profiles });
