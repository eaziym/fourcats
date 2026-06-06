/* ============================================================
   Little Lovely Pets — Standardised App Shell
   Resizable sidebar + utility top bar + page chrome.
   Exports: AppFrame, useResizable
   ============================================================ */

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "space_dashboard" },
  { id: "assistant", label: "AI Assistant", icon: "smart_toy" },
  { id: "discovery", label: "Local Discovery", icon: "explore" },
  { id: "profiles", label: "Pet Profiles", icon: "pets" },
];

/* generic drag-to-resize hook for a panel edge */
function useResizable(initial, { min, max, side = "right" }) {
  const [w, setW] = useState(initial);
  const drag = useRef(null);
  const onDown = (e) => {
    drag.current = { x: e.clientX, w };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };
  useEffect(() => {
    const move = (e) => {
      if (!drag.current) return;
      const dx = e.clientX - drag.current.x;
      let next = drag.current.w + (side === "right" ? dx : -dx);
      next = Math.max(min, Math.min(max, next));
      setW(next);
    };
    const up = () => {
      drag.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [min, max, side]);
  return [w, onDown, setW];
}

/* a thin draggable grip */
function Grip({ onMouseDown, side = "right" }) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        [side]: -5,
        width: 10,
        cursor: "col-resize",
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 4,
          height: 46,
          borderRadius: 99,
          background: h ? "var(--primary)" : "var(--outline-2)",
          transition: "background .15s, height .15s",
          opacity: h ? 1 : 0.7,
        }}
      />
    </div>
  );
}

function NavItem({ item, active, onClick, collapsed }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      title={collapsed ? item.label : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 13,
        width: "100%",
        textAlign: "left",
        justifyContent: collapsed ? "center" : "flex-start",
        padding: collapsed ? "11px 0" : "11px 14px",
        borderRadius: "var(--r-md)",
        fontWeight: 600,
        fontSize: 14.5,
        color: active ? "#fff" : "var(--ink-2)",
        background: active
          ? "var(--primary)"
          : h
            ? "var(--surface-2)"
            : "transparent",
        boxShadow: active ? "0 8px 18px rgba(120,35,56,.20)" : "none",
        transition: "background .18s, color .18s, transform .15s",
        transform: h && !active ? "translateX(2px)" : "none",
      }}
    >
      <Icon name={item.icon} size={22} fill={active} />
      {!collapsed && item.label}
    </button>
  );
}

function PetSwitcher({ pets, active, onSelect, collapsed }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        title={collapsed ? active.name : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          width: "100%",
          padding: "8px",
          justifyContent: collapsed ? "center" : "flex-start",
          borderRadius: "var(--r-md)",
          background: open ? "var(--surface-2)" : "transparent",
          transition: "background .15s",
        }}
      >
        <PetAvatar species={active.species} size={collapsed ? 40 : 42} />
        {!collapsed && (
          <React.Fragment>
            <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
              <div
                className="font-d"
                style={{
                  fontWeight: 700,
                  fontSize: 15.5,
                  color: "var(--ink)",
                  lineHeight: 1.1,
                }}
              >
                {active.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--ink-3)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {active.breed} · {active.area}
              </div>
            </div>
            <Icon
              name="unfold_more"
              size={18}
              style={{ color: "var(--ink-3)" }}
            />
          </React.Fragment>
        )}
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: collapsed ? "auto" : 0,
            zIndex: 40,
            width: collapsed ? 220 : "auto",
            background: "var(--surface)",
            borderRadius: "var(--r-md)",
            boxShadow: "var(--sh-pop)",
            border: "1px solid var(--outline)",
            padding: 6,
            animation: "popIn .16s ease both",
          }}
        >
          {pets.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                onSelect(p);
                setOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "8px 9px",
                borderRadius: "var(--r-sm)",
                background:
                  p.id === active.id
                    ? "var(--primary-container)"
                    : "transparent",
              }}
              onMouseEnter={(e) => {
                if (p.id !== active.id)
                  e.currentTarget.style.background = "var(--surface-2)";
              }}
              onMouseLeave={(e) => {
                if (p.id !== active.id)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              <PetAvatar species={p.species} size={34} ring={false} />
              <div style={{ flex: 1, textAlign: "left" }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 13.5,
                    color: "var(--ink)",
                  }}
                >
                  {p.name}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
                  {SPECIES_LABEL[p.species]} · {p.breed}
                </div>
              </div>
              {p.id === active.id && (
                <Icon
                  name="check_circle"
                  size={18}
                  fill
                  style={{ color: "var(--primary)" }}
                />
              )}
            </button>
          ))}
          <button
            onClick={() => setOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "9px",
              borderRadius: "var(--r-sm)",
              color: "var(--primary)",
              fontWeight: 600,
              fontSize: 13,
              marginTop: 2,
              borderTop: "1px solid var(--outline)",
            }}
          >
            <Icon name="add_circle" size={18} /> Add a pet
          </button>
        </div>
      )}
    </div>
  );
}

function Sidebar({
  route,
  setRoute,
  pets,
  active,
  setActive,
  width,
  onGrip,
  collapsed,
}) {
  return (
    <aside
      style={{
        width,
        flex: "0 0 auto",
        position: "relative",
        background: "var(--surface)",
        borderRight: "1px solid var(--outline)",
        display: "flex",
        flexDirection: "column",
        padding: collapsed ? "18px 10px 14px" : "18px 14px 14px",
        gap: 6,
        height: "100%",
      }}
    >
      {/* brand */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? "2px 0 12px" : "2px 6px 12px",
        }}
      >
        <div
          style={{
            position: "relative",
            animation: "floatY 5s ease-in-out infinite",
          }}
        >
          <Mascot species="brand" size={42} />
        </div>
        {!collapsed && (
          <div style={{ minWidth: 0 }}>
            <div
              className="font-d"
              style={{
                fontWeight: 700,
                fontSize: 16.5,
                color: "var(--primary)",
                lineHeight: 1.05,
                letterSpacing: "-.01em",
              }}
            >
              Little Lovely Pets
            </div>
            <div
              style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 500 }}
            >
              Singapore AI Care
            </div>
          </div>
        )}
      </div>

      <PetSwitcher
        pets={pets}
        active={active}
        onSelect={setActive}
        collapsed={collapsed}
      />

      <div
        style={{ height: 1, background: "var(--outline)", margin: "10px 4px" }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV.map((n) => (
          <NavItem
            key={n.id}
            item={n}
            active={route === n.id}
            onClick={() => setRoute(n.id)}
            collapsed={collapsed}
          />
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {collapsed ? (
        <button
          title="Book Vet"
          onClick={() => setRoute("discovery")}
          style={{
            width: 46,
            height: 46,
            margin: "0 auto",
            borderRadius: 999,
            display: "grid",
            placeItems: "center",
            background: "var(--tertiary)",
            color: "#fff",
            boxShadow: "0 8px 20px rgba(58,79,115,.22)",
          }}
        >
          <Icon name="event" size={22} />
        </button>
      ) : (
        <Btn
          variant="navy"
          icon="event"
          full
          onClick={() => setRoute("discovery")}
        >
          Book Vet
        </Btn>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          marginTop: 4,
        }}
      >
        <SideMini
          icon="design_services"
          label="Design System"
          active={route === "designsystem"}
          onClick={() => setRoute("designsystem")}
          collapsed={collapsed}
        />
        <SideMini icon="settings" label="Settings" collapsed={collapsed} />
        <SideMini icon="help" label="Support" collapsed={collapsed} />
      </div>
      {!collapsed && <Grip onMouseDown={onGrip} />}
    </aside>
  );
}

function SideMini({ icon, label, onClick, active, collapsed }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      title={collapsed ? label : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: collapsed ? "9px 0" : "8px 14px",
        width: "100%",
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: "var(--r-sm)",
        fontSize: 13.5,
        fontWeight: 600,
        color: active ? "var(--primary)" : "var(--ink-3)",
        background: h || active ? "var(--surface-2)" : "transparent",
        transition: "all .15s",
      }}
    >
      <Icon name={icon} size={19} fill={active} /> {!collapsed && label}
    </button>
  );
}

function TopBar({ active, title, sub, actions, vp }) {
  const compact = vp && vp.isTablet;
  const phone = vp && vp.isPhone;
  return (
    <header
      style={{
        height: 66,
        flex: "0 0 auto",
        display: "flex",
        alignItems: "center",
        gap: phone ? 8 : 16,
        padding: phone ? "0 16px" : "0 28px",
        background: "color-mix(in srgb, var(--surface) 80%, transparent)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--outline)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div style={{ minWidth: 0, flexShrink: 1, overflow: "hidden" }}>
        <div
          className="font-d"
          style={{
            fontWeight: 700,
            fontSize: 18,
            color: "var(--ink)",
            lineHeight: 1.05,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </div>
        {sub && !phone && (
          <div
            style={{
              fontSize: 12.5,
              color: "var(--ink-3)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {sub}
          </div>
        )}
      </div>
      <div style={{ flex: 1 }} />
      {/* pet context chip */}
      {!phone && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "6px 12px 6px 6px",
            background: "var(--surface-2)",
            borderRadius: "var(--r-pill)",
            border: "1px solid var(--outline)",
          }}
        >
          <PetAvatar species={active.species} size={28} ring={false} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
            {active.name}
          </span>
          {!compact && (
            <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
              · {active.breed}
            </span>
          )}
        </div>
      )}
      {actions}
      {!compact && (
        <button style={iconBtn}>
          <Icon name="search" size={21} style={{ color: "var(--ink-2)" }} />
        </button>
      )}
      <button style={{ ...iconBtn, position: "relative" }}>
        <Icon
          name="notifications"
          size={21}
          style={{ color: "var(--ink-2)" }}
        />
        <span
          style={{
            position: "absolute",
            top: 7,
            right: 7,
            width: 8,
            height: 8,
            borderRadius: 99,
            background: "var(--primary)",
            border: "2px solid var(--surface)",
          }}
        />
      </button>
      <button style={{ ...iconBtn, background: "var(--tertiary-container)" }}>
        <Icon
          name="person"
          size={20}
          fill
          style={{ color: "var(--tertiary)" }}
        />
      </button>
    </header>
  );
}
const iconBtn = {
  width: 40,
  height: 40,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  background: "var(--surface-2)",
  transition: "background .15s",
  flex: "0 0 auto",
};

/* main frame: sidebar + (topbar over scrollable page) */
function AppFrame({
  route,
  setRoute,
  pets,
  active,
  setActive,
  title,
  sub,
  topActions,
  children,
  scroll = true,
}) {
  const vp = useViewport();
  const [w, onGrip] = useResizable(248, { min: 212, max: 340 });
  const sideW = vp.rail ? 72 : w;
  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      <Sidebar
        route={route}
        setRoute={setRoute}
        pets={pets}
        active={active}
        setActive={setActive}
        width={sideW}
        onGrip={onGrip}
        collapsed={vp.rail}
      />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <TopBar
          active={active}
          title={title}
          sub={sub}
          actions={topActions}
          vp={vp}
        />
        <main
          style={{
            flex: 1,
            minHeight: 0,
            overflow: scroll ? "auto" : "hidden",
            position: "relative",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

Object.assign(window, { AppFrame, useResizable, Grip, NAV });
