/* ============================================================
   Little Lovely Pets — Local Discovery screen
   ============================================================ */

const CATS = [
  { id: "groomers", label: "Groomers", icon: "content_cut" },
  { id: "vets", label: "Vets", icon: "local_hospital" },
  { id: "cafes", label: "Pet Cafés", icon: "local_cafe" },
  { id: "supplies", label: "Supplies", icon: "storefront" },
];

const LISTINGS = {
  groomers: [
    {
      name: "Fluffy Paws Spa",
      area: "Tampines Hub",
      km: "1.2",
      rating: "4.9",
      price: "$$$",
      tags: [
        ["Sensitive Skin Expert", "yellow"],
        ["HDB-Approved", "green"],
      ],
      top: true,
    },
    {
      name: "Urban Tails Grooming",
      area: "Bedok Mall",
      km: "3.5",
      rating: "4.7",
      price: "$$",
      tags: [
        ["Organic Shampoos", "neutral"],
        ["Cat Friendly", "navy"],
      ],
    },
    {
      name: "Snip & Snuggle",
      area: "Pasir Ris",
      km: "4.1",
      rating: "4.6",
      price: "$$",
      tags: [["Small Pets OK", "pink"]],
    },
  ],
  vets: [
    {
      name: "The Animal Clinic",
      area: "Tampines",
      km: "1.2",
      rating: "4.7",
      price: "$$",
      tags: [
        ["Dermatology", "navy"],
        ["Open Now", "green"],
      ],
      top: true,
    },
    {
      name: "Bedok Vet Surgery",
      area: "Bedok North",
      km: "2.8",
      rating: "4.8",
      price: "$$$",
      tags: [["Exotics & Rabbits", "pink"]],
    },
  ],
  cafes: [
    {
      name: "Meow Parlour Café",
      area: "Bugis",
      km: "9.0",
      rating: "4.5",
      price: "$$",
      tags: [
        ["Cat Friendly", "navy"],
        ["Reservations", "neutral"],
      ],
    },
    {
      name: "The Dog Bakery",
      area: "East Coast",
      km: "5.2",
      rating: "4.6",
      price: "$$",
      tags: [["Outdoor Seating", "green"]],
    },
  ],
  supplies: [
    {
      name: "Pet Lovers Centre",
      area: "Tampines Mall",
      km: "1.4",
      rating: "4.4",
      price: "$$",
      tags: [["Hypoallergenic Food", "yellow"]],
      top: true,
    },
    {
      name: "Kohepets Warehouse",
      area: "Ubi",
      km: "6.7",
      rating: "4.7",
      price: "$",
      tags: [
        ["Free Delivery", "green"],
        ["Hay & Small Pet", "pink"],
      ],
    },
  ],
};

function ListingCard({ item, fav, onFav, i, rv }) {
  return (
    <Card style={{ ...rv(i), padding: 14 }} hover>
      <div style={{ display: "flex", gap: 14 }}>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: "var(--r-md)",
            flex: "0 0 auto",
            overflow: "hidden",
            position: "relative",
            background:
              "repeating-linear-gradient(135deg, var(--surface-2), var(--surface-2) 9px, var(--surface-3) 9px, var(--surface-3) 18px)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
            }}
          >
            <Icon name="image" size={22} style={{ color: "var(--ink-3)" }} />
          </div>
          <span
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: 99,
              background: "var(--surface)",
              boxShadow: "var(--sh-1)",
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Icon name="star" size={12} fill style={{ color: "#e8a200" }} />
            {item.rating}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 15.5 }}>{item.name}</div>
            <button onClick={onFav}>
              <Icon
                name="favorite"
                size={20}
                fill={fav}
                style={{ color: fav ? "var(--primary)" : "var(--ink-3)" }}
              />
            </button>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12.5,
              color: "var(--ink-2)",
              margin: "3px 0 8px",
            }}
          >
            <Icon
              name="location_on"
              size={14}
              fill
              style={{ color: "var(--ink-3)" }}
            />
            {item.area} · {item.km} km
          </div>
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              marginBottom: 10,
            }}
          >
            {item.tags.map(([l, t]) => (
              <Chip key={l} tone={t} sm>
                {l}
              </Chip>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{ fontWeight: 700, color: "var(--primary)", fontSize: 14 }}
            >
              {item.price}
            </span>
            <Btn size="sm" variant="tonal">
              Book now
            </Btn>
          </div>
        </div>
      </div>
    </Card>
  );
}

function BigMap({ width, onGrip, listings }) {
  return (
    <aside
      style={{
        width,
        flex: "0 0 auto",
        position: "relative",
        height: "100%",
        overflow: "hidden",
        background: "#dde7e1",
      }}
    >
      {onGrip && <Grip onMouseDown={onGrip} side="left" />}
      <svg
        viewBox="0 0 400 700"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, opacity: 0.55 }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <line
            key={"h" + i}
            x1="0"
            y1={i * 80 + 20}
            x2="400"
            y2={i * 80 - 10}
            stroke="#fff"
            strokeWidth="3"
          />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line
            key={"v" + i}
            x1={i * 80 + 30}
            y1="0"
            x2={i * 80 - 10}
            y2="700"
            stroke="#fff"
            strokeWidth="3"
          />
        ))}
        <circle cx="200" cy="300" r="120" fill="#fff" opacity=".18" />
      </svg>
      {/* search-this-area */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <Btn size="sm" variant="soft" icon="refresh">
          Search this area
        </Btn>
      </div>
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {["my_location", "add", "remove"].map((ic) => (
          <button
            key={ic}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "var(--surface)",
              boxShadow: "var(--sh-1)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Icon name={ic} size={19} style={{ color: "var(--ink-2)" }} />
          </button>
        ))}
      </div>
      {/* pins */}
      <Pin
        x="46%"
        y="38%"
        active
        label={listings[0]?.name}
        rating={listings[0]?.rating}
      />
      <Pin x="28%" y="56%" />
      <Pin x="66%" y="62%" />
      <Pin x="58%" y="30%" />
    </aside>
  );
}

function Pin({ x, y, active, label, rating }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%,-100%)",
      }}
    >
      {active && label && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            background: "var(--surface)",
            borderRadius: "var(--r-sm)",
            boxShadow: "var(--sh-2)",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700 }}>{label}</span>
          <Chip tone="yellow" icon="star" sm>
            {rating}
          </Chip>
        </div>
      )}
      <div
        style={{
          width: active ? 38 : 30,
          height: active ? 38 : 30,
          borderRadius: 999,
          display: "grid",
          placeItems: "center",
          background: active ? "var(--primary)" : "var(--surface)",
          boxShadow: active ? "var(--sh-pop)" : "var(--sh-1)",
          animation: active ? "floatY 3s ease-in-out infinite" : "none",
        }}
      >
        <Icon
          name="content_cut"
          size={active ? 19 : 15}
          fill
          style={{ color: active ? "#fff" : "var(--primary)" }}
        />
      </div>
    </div>
  );
}

function Discovery({ active }) {
  const rv = useReveal();
  const vp = useViewport();
  const [cat, setCat] = useState("groomers");
  const [favs, setFavs] = useState({});
  const [mw, onGrip] = useResizable(440, { min: 300, max: 640, side: "left" });
  const listings = LISTINGS[cat];

  if (vp.isTablet) {
    return (
      <div style={{ height: "100%", overflow: "auto" }}>
        <div style={{ padding: vp.isPhone ? "20px 16px" : "26px 28px" }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <DiscoveryList
              active={active}
              rv={rv}
              cat={cat}
              setCat={setCat}
              favs={favs}
              setFavs={setFavs}
              listings={listings}
            />
          </div>
        </div>
        <div
          style={{
            height: 320,
            position: "relative",
            borderTop: "1px solid var(--outline)",
          }}
        >
          <BigMap width="100%" onGrip={null} listings={listings} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 0 }}>
      <div
        style={{ flex: 1, minWidth: 0, overflow: "auto", padding: "26px 28px" }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <DiscoveryList
            active={active}
            rv={rv}
            cat={cat}
            setCat={setCat}
            favs={favs}
            setFavs={setFavs}
            listings={listings}
          />
        </div>
      </div>
      <BigMap width={mw} onGrip={onGrip} listings={listings} />
    </div>
  );
}

function DiscoveryList({ active, rv, cat, setCat, favs, setFavs, listings }) {
  return (
    <React.Fragment>
      <h1
        className="font-d"
        style={{
          fontSize: 30,
          fontWeight: 700,
          margin: 0,
          letterSpacing: "-.02em",
          ...rv(0),
        }}
      >
        Local Discovery
      </h1>
      <p
        style={{
          fontSize: 15,
          color: "var(--ink-2)",
          margin: "5px 0 18px",
          ...rv(0),
        }}
      >
        Trusted, AI-vetted services near {active.area}.
      </p>

      {/* search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "var(--surface)",
          borderRadius: "var(--r-md)",
          padding: "12px 16px",
          boxShadow: "var(--sh-1)",
          border: "1px solid var(--outline)",
          ...rv(1),
        }}
      >
        <Icon name="search" size={21} style={{ color: "var(--ink-3)" }} />
        <input
          placeholder={`Find services near ${active.area}…`}
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 15,
          }}
        />
        <button
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "var(--surface-2)",
            display: "grid",
            placeItems: "center",
            flex: "0 0 auto",
          }}
        >
          <Icon name="tune" size={19} style={{ color: "var(--ink-2)" }} />
        </button>
      </div>

      {/* top picks banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "var(--secondary-container)",
          borderRadius: "var(--r-md)",
          padding: "12px 14px",
          margin: "14px 0",
          ...rv(2),
        }}
      >
        <PetAvatar species={active.species} size={38} ring={false} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: "var(--on-secondary-container)",
            }}
          >
            Top picks for {active.name}
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "var(--on-secondary-container)",
              opacity: 0.85,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Filtered for {active.tags[0].toLowerCase()} expertise
          </div>
        </div>
        <button
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: "var(--secondary)",
            flex: "0 0 auto",
          }}
        >
          Edit
        </button>
      </div>

      {/* categories */}
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 6,
          marginBottom: 16,
          ...rv(2),
        }}
      >
        {CATS.map((c) => {
          const on = c.id === cat;
          return (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 16px",
                borderRadius: "var(--r-pill)",
                fontWeight: 600,
                fontSize: 13.5,
                whiteSpace: "nowrap",
                transition: "all .18s",
                flex: "0 0 auto",
                background: on ? "var(--primary)" : "var(--surface)",
                color: on ? "#fff" : "var(--ink-2)",
                border: on ? "none" : "1px solid var(--outline)",
                boxShadow: on ? "0 8px 16px rgba(120,35,56,.2)" : "none",
              }}
            >
              <Icon name={c.icon} size={17} fill={on} />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* listings */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {listings.map((it, i) => (
          <ListingCard
            key={it.name}
            item={it}
            i={i}
            rv={rv}
            fav={!!favs[it.name]}
            onFav={() => setFavs((f) => ({ ...f, [it.name]: !f[it.name] }))}
          />
        ))}
        {/* special offer */}
        <div
          style={{
            borderRadius: "var(--r-lg)",
            padding: 20,
            position: "relative",
            overflow: "hidden",
            background: "var(--tertiary)",
            color: "#fff",
            ...rv(listings.length),
          }}
        >
          <Icon
            name="sell"
            size={120}
            fill
            style={{
              position: "absolute",
              right: -16,
              bottom: -22,
              opacity: 0.14,
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: ".08em",
              padding: "4px 10px",
              borderRadius: 99,
              background: "rgba(255,255,255,.22)",
            }}
          >
            SPECIAL OFFER
          </span>
          <div
            className="font-d"
            style={{ fontSize: 22, fontWeight: 700, margin: "12px 0 4px" }}
          >
            First Grooming 20% Off
          </div>
          <p style={{ margin: "0 0 14px", fontSize: 13.5, opacity: 0.9 }}>
            Available at selected partners near {active.area}.
          </p>
          <Btn size="sm" variant="soft" style={{ color: "var(--tertiary)" }}>
            Claim offer
          </Btn>
        </div>
      </div>
    </React.Fragment>
  );
}

Object.assign(window, { Discovery });
