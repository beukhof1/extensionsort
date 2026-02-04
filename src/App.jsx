import { useMemo, useState } from "react";
import clsx from "clsx";

const kpis = [
  { label: "Total Vehicles", value: 214, trend: "+6% MoM" },
  { label: "Vehicles Requiring Action", value: 18, trend: "7 overdue" },
  { label: "Healthy Vehicles", value: 183, trend: "Stable" },
  { label: "APK Deadlines < 60d", value: 23, trend: "4 critical" },
];

const vehicles = [
  {
    id: "NL-TS-204",
    brand: "Tesla",
    model: "Model Y Long Range",
    status: "ok",
    mileage: 84230,
    apk: "2025-02-21",
    image:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "EV-119-B",
    brand: "Volkswagen",
    model: "ID. Buzz Cargo",
    status: "warning",
    mileage: 112580,
    apk: "2024-11-11",
    image:
      "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "XF-880-K",
    brand: "Mercedes",
    model: "Sprinter 316",
    status: "critical",
    mileage: 188420,
    apk: "2024-08-04",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "GL-334-T",
    brand: "Volvo",
    model: "V60 Plug-in",
    status: "ok",
    mileage: 63210,
    apk: "2025-05-17",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
  },
];

const drivers = [
  {
    name: "Sanne de Groot",
    license: "NL-4529-AX",
    phone: "+31 6 4821 3320",
    email: "sanne.groot@theiner.nl",
  },
  {
    name: "Yusuf Kadir",
    license: "NL-8831-KQ",
    phone: "+31 6 4409 1234",
    email: "y.kadir@theiner.nl",
  },
  {
    name: "Mila Vermeer",
    license: "NL-9934-HB",
    phone: "+31 6 5090 9930",
    email: "m.vermeer@theiner.nl",
  },
];

const checklists = {
  common: [
    "Lights & Indicators",
    "Brake performance",
    "Fluid levels",
    "Safety equipment",
  ],
  ev: ["Battery health", "Charging port", "Regenerative braking"],
  diesel: ["Exhaust system", "AdBlue level", "Fuel filter"],
  petrol: ["Spark plugs", "Fuel injectors", "Emission levels"],
};

const themes = [
  "Midnight",
  "Corporate",
  "Cyberpunk",
  "Aurora",
  "Forest",
  "Arctic",
  "Solar",
  "Nebula",
  "Slate",
  "Noir",
  "Crimson",
];

const statusLabels = {
  ok: "OK",
  warning: "Warning",
  critical: "Critical",
};

const statusBadge = {
  ok: "badge-ok",
  warning: "badge-warning",
  critical: "badge-critical",
};

export default function App() {
  const [viewMode, setViewMode] = useState("grid");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("status");
  const [showArchived, setShowArchived] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [vehicleType, setVehicleType] = useState("ev");
  const [theme, setTheme] = useState("Midnight");

  const filteredVehicles = useMemo(() => {
    const results = vehicles.filter((vehicle) => {
      const matches =
        vehicle.id.toLowerCase().includes(query.toLowerCase()) ||
        vehicle.brand.toLowerCase().includes(query.toLowerCase());
      return matches;
    });

    const sorted = [...results].sort((a, b) => {
      if (sortKey === "mileage") return b.mileage - a.mileage;
      if (sortKey === "apk") return a.apk.localeCompare(b.apk);
      if (sortKey === "status") {
        const order = { critical: 0, warning: 1, ok: 2 };
        return order[a.status] - order[b.status];
      }
      return 0;
    });

    return sorted;
  }, [query, sortKey]);

  const checklistItems = [
    ...checklists.common,
    ...checklists[vehicleType],
  ];

  return (
    <div className="min-h-screen bg-cyber-dark ambient-ring">
      <div className="flex">
        <aside className="glass-panel m-6 hidden w-64 shrink-0 rounded-3xl p-6 lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyber-glow/20 text-cyber-glow">
              TF
            </div>
            <div>
              <p className="text-sm text-cyber-glow">Theiner</p>
              <h1 className="text-lg font-semibold text-white">Fleetmaster</h1>
            </div>
          </div>

          <nav className="mt-10 space-y-2 text-sm text-slate-300">
            {[
              "Command Center",
              "Mijn Wagenpark",
              "Vehicle Profiles",
              "Inspections",
              "Drivers",
              "Settings",
            ].map((item) => (
              <button
                key={item}
                className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-white/10"
              >
                <span>{item}</span>
                <span className="text-xs text-cyber-glow">●</span>
              </button>
            ))}
          </nav>

          <div className="mt-10 rounded-2xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Live Alerts
            </p>
            <p className="mt-3 text-sm text-slate-200">
              5 APKs expire within 30 days and 2 vehicles have critical
              maintenance.
            </p>
            <button className="mt-4 w-full rounded-xl bg-cyber-glow/20 px-3 py-2 text-xs font-semibold text-cyber-glow">
              Open Notifications
            </button>
          </div>
        </aside>

        <main className="flex-1 space-y-10 px-6 py-6 lg:px-10">
          <header className="glass-panel flex flex-wrap items-center justify-between gap-6 rounded-3xl px-6 py-5">
            <div>
              <p className="text-sm text-slate-300">Welcome back, Sofia</p>
              <h2 className="text-2xl font-semibold text-white">
                Command Center Overview
              </h2>
              <p className="text-sm text-slate-400">
                Premium fleet insights • Theme: {theme}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
                <span className="text-cyber-glow">●</span>
                Live Sync Enabled
              </div>
              <button className="rounded-full bg-cyber-accent/30 px-4 py-2 text-sm font-semibold text-cyber-accent">
                Create Report
              </button>
            </div>
          </header>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="glass-panel card-hover rounded-3xl p-5">
                <p className="text-sm text-slate-400">{kpi.label}</p>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-3xl font-semibold text-white">
                    {kpi.value}
                  </span>
                  <span className="text-xs text-cyber-glow">{kpi.trend}</span>
                </div>
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            <div className="glass-panel rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <h3 className="section-title">Fleet Status Overview</h3>
                <span className="text-xs text-slate-400">Updated 2 min ago</span>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-slate-300">Status Pie</p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="h-24 w-24 rounded-full border-8 border-emerald-400/60 border-t-amber-400/70 border-l-rose-500/70" />
                    <div className="space-y-2 text-sm text-slate-200">
                      <p className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        OK: 168
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                        Warning: 32
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                        Critical: 14
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-slate-300">Top Mileage</p>
                  <div className="mt-4 space-y-3 text-sm text-slate-200">
                    {[188, 173, 166, 154, 142].map((value, index) => (
                      <div key={value} className="space-y-1">
                        <div className="flex justify-between">
                          <span>Vehicle {index + 1}</span>
                          <span>{value}k km</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5">
                          <div
                            className="h-2 rounded-full bg-cyber-glow/60"
                            style={{ width: `${100 - index * 12}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <h3 className="section-title">Notifications</h3>
                <button className="text-xs text-cyber-glow">View all</button>
              </div>
              <div className="mt-5 space-y-4 text-sm text-slate-200">
                {[
                  "APK expired for XF-880-K",
                  "Brake pads due on EV-119-B",
                  "New driver assigned to NL-TS-204",
                ].map((note) => (
                  <div
                    key={note}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    {note}
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl bg-gradient-to-r from-cyber-glow/20 to-cyber-accent/20 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                  Gemini AI
                </p>
                <p className="mt-2 text-sm text-slate-100">
                  "Critical inspections reduced by 12% with the new checklist
                  automation."
                </p>
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-3xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="section-title">Mijn Wagenpark</h3>
                <p className="text-sm text-slate-400">
                  Search, filter, and manage your fleet in real-time.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by plate or brand"
                  className="rounded-full bg-white/10 px-4 py-2 text-sm text-white placeholder:text-slate-400"
                />
                <select
                  value={sortKey}
                  onChange={(event) => setSortKey(event.target.value)}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm text-white"
                >
                  <option value="status">Sort: Status</option>
                  <option value="mileage">Sort: Mileage</option>
                  <option value="apk">Sort: APK date</option>
                </select>
                <button
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  className="rounded-full bg-cyber-glow/20 px-4 py-2 text-sm text-cyber-glow"
                >
                  View: {viewMode === "grid" ? "Grid" : "List"}
                </button>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={showArchived}
                    onChange={(event) => setShowArchived(event.target.checked)}
                  />
                  Show archived
                </label>
              </div>
            </div>

            <div
              className={clsx(
                "mt-6 gap-4",
                viewMode === "grid" ? "grid md:grid-cols-2 xl:grid-cols-3" : "space-y-4"
              )}
            >
              {filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={clsx(
                    "card-hover overflow-hidden rounded-3xl border border-white/10 bg-white/5",
                    viewMode === "list" && "flex flex-col md:flex-row"
                  )}
                >
                  <img
                    src={vehicle.image}
                    alt={vehicle.model}
                    className={clsx(
                      "h-44 w-full object-cover",
                      viewMode === "list" && "md:h-auto md:w-56"
                    )}
                  />
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-white">
                            {vehicle.brand} {vehicle.model}
                          </h4>
                          <p className="text-sm text-slate-400">{vehicle.id}</p>
                        </div>
                        <span className={clsx("badge", statusBadge[vehicle.status])}>
                          {statusLabels[vehicle.status]}
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-300">
                        <div>
                          <p className="text-xs uppercase text-slate-500">Mileage</p>
                          <p className="text-base text-white">{vehicle.mileage} km</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-slate-500">APK date</p>
                          <p className="text-base text-white">{vehicle.apk}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-300">
                      <button className="rounded-full bg-cyber-glow/20 px-3 py-2 text-cyber-glow">
                        Start inspection
                      </button>
                      <button className="rounded-full bg-white/10 px-3 py-2">
                        View details
                      </button>
                      <button className="rounded-full bg-white/10 px-3 py-2">
                        Archive
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {showArchived && (
              <div className="mt-6 rounded-2xl border border-dashed border-white/20 p-4 text-sm text-slate-300">
                Archived vehicles are now visible in this view. (Demo state)
              </div>
            )}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <div className="glass-panel rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="section-title">Vehicle Profile</h3>
                  <p className="text-sm text-slate-400">
                    Detailed view for XF-880-K • Mercedes Sprinter 316
                  </p>
                </div>
                <button className="rounded-full bg-cyber-glow/20 px-4 py-2 text-sm text-cyber-glow">
                  Upload new photo
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  "overview",
                  "damage",
                  "maintenance",
                  "documents",
                  "photos",
                ].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={clsx(
                      "rounded-full px-4 py-2 text-sm capitalize",
                      activeTab === tab
                        ? "bg-cyber-accent/30 text-cyber-accent"
                        : "bg-white/10 text-slate-300"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
                {activeTab === "overview" && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 text-sm text-slate-200">
                      <p>VIN: WDB-XY316-99231</p>
                      <p>Driver: Sanne de Groot</p>
                      <p>Fuel: Diesel</p>
                      <p>Last inspection: 14 days ago</p>
                    </div>
                    <div className="space-y-3 text-sm text-slate-300">
                      <button className="w-full rounded-xl bg-cyber-glow/20 px-4 py-3 text-cyber-glow">
                        Start inspection
                      </button>
                      <button className="w-full rounded-xl bg-white/10 px-4 py-3">
                        Schedule service
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "damage" && (
                  <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
                    <div className="rounded-2xl bg-white/5 p-4">
                      <p className="text-sm text-slate-300">Damage selector</p>
                      <svg
                        viewBox="0 0 240 420"
                        className="mt-4 w-full text-cyber-glow"
                      >
                        <rect
                          x="70"
                          y="20"
                          width="100"
                          height="380"
                          rx="50"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <circle
                          cx="120"
                          cy="120"
                          r="30"
                          fill="currentColor"
                          opacity="0.2"
                        />
                        <circle
                          cx="120"
                          cy="280"
                          r="30"
                          fill="currentColor"
                          opacity="0.2"
                        />
                      </svg>
                      <p className="mt-3 text-xs text-slate-400">
                        Click zones to log visual damage.
                      </p>
                    </div>
                    <div className="space-y-4 text-sm text-slate-200">
                      <div className="rounded-2xl bg-white/5 p-4">
                        Front bumper scratch - logged 2 days ago.
                      </div>
                      <div className="rounded-2xl bg-white/5 p-4">
                        Roof dent noted by driver.
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "maintenance" && (
                  <div className="space-y-4 text-sm text-slate-200">
                    {[
                      "21-07-2024 • Brake pads replacement • €640",
                      "02-06-2024 • Annual service • €1,200",
                      "14-04-2024 • Tire rotation • €180",
                    ].map((entry) => (
                      <div
                        key={entry}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                      >
                        {entry}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "documents" && (
                  <div className="space-y-4 text-sm text-slate-200">
                    {[
                      "Registration.pdf",
                      "Insurance_2024.pdf",
                      "Lease_agreement.pdf",
                    ].map((doc) => (
                      <div
                        key={doc}
                        className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3"
                      >
                        <span>{doc}</span>
                        <button className="text-xs text-cyber-glow">Open</button>
                      </div>
                    ))}
                    <button className="w-full rounded-xl border border-dashed border-white/20 px-4 py-3 text-xs text-slate-300">
                      Upload new document
                    </button>
                  </div>
                )}

                {activeTab === "photos" && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {["Front", "Side"].map((photo) => (
                      <div
                        key={photo}
                        className="rounded-2xl bg-white/5 p-4 text-sm text-slate-300"
                      >
                        {photo} photo placeholder
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6">
              <h3 className="section-title">Inspection System</h3>
              <p className="text-sm text-slate-400">
                Dynamic checklists powered by vehicle type.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                {["ev", "diesel", "petrol"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setVehicleType(type)}
                    className={clsx(
                      "rounded-full px-3 py-2 text-xs uppercase",
                      vehicleType === type
                        ? "bg-cyber-glow/20 text-cyber-glow"
                        : "bg-white/10 text-slate-300"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <ul className="mt-4 space-y-2 text-sm text-slate-200">
                {checklistItems.map((item) => (
                  <li
                    key={item}
                    className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-2"
                  >
                    <span>{item}</span>
                    <div className="flex gap-2 text-xs">
                      <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-emerald-300">
                        OK
                      </span>
                      <span className="rounded-full bg-amber-400/20 px-2 py-1 text-amber-200">
                        Warning
                      </span>
                      <span className="rounded-full bg-rose-500/20 px-2 py-1 text-rose-300">
                        Critical
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-300">Visual Tire Widget</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-200">
                  {[
                    { label: "FL", pressure: 2.3, tread: 6.2 },
                    { label: "FR", pressure: 2.2, tread: 5.8 },
                    { label: "RL", pressure: 2.0, tread: 4.2 },
                    { label: "RR", pressure: 2.4, tread: 6.8 },
                  ].map((tire) => (
                    <div
                      key={tire.label}
                      className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3"
                    >
                      <div className="flex items-center justify-between">
                        <span>{tire.label}</span>
                        <span
                          className={clsx(
                            "rounded-full px-2 py-1",
                            tire.tread < 5
                              ? "bg-rose-500/20 text-rose-300"
                              : "bg-emerald-400/20 text-emerald-300"
                          )}
                        >
                          {tire.tread}mm
                        </span>
                      </div>
                      <p className="mt-2 text-slate-300">
                        {tire.pressure} Bar
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl bg-gradient-to-r from-cyber-glow/20 to-cyber-accent/20 p-3 text-xs text-slate-200">
                  Gemini AI summary ready — 3 warnings detected, recommended
                  action plan generated.
                </div>
                <button className="mt-4 w-full rounded-xl bg-cyber-accent/30 px-4 py-2 text-sm text-cyber-accent">
                  Export PDF Report
                </button>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
            <div className="glass-panel rounded-3xl p-6">
              <h3 className="section-title">Driver Database</h3>
              <p className="text-sm text-slate-400">
                Manage personnel and vehicle assignments.
              </p>
              <div className="mt-4 space-y-3 text-sm text-slate-200">
                {drivers.map((driver) => (
                  <div
                    key={driver.email}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{driver.name}</p>
                        <p className="text-xs text-slate-400">
                          License: {driver.license}
                        </p>
                      </div>
                      <button className="text-xs text-cyber-glow">Edit</button>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-slate-300">
                      <span>{driver.phone}</span>
                      <span>{driver.email}</span>
                      <span>Assigned: XF-880-K</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full rounded-xl border border-dashed border-white/20 px-4 py-2 text-xs text-slate-300">
                Add new driver
              </button>
            </div>

            <div className="glass-panel rounded-3xl p-6">
              <h3 className="section-title">Settings & Customization</h3>
              <p className="text-sm text-slate-400">
                Control theming, branding, and data tools.
              </p>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs uppercase text-slate-400">Theming</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    {themes.map((item) => (
                      <button
                        key={item}
                        onClick={() => setTheme(item)}
                        className={clsx(
                          "rounded-full px-3 py-2",
                          theme === item
                            ? "bg-cyber-glow/20 text-cyber-glow"
                            : "bg-white/10 text-slate-300"
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-200">
                  <p className="text-xs uppercase text-slate-400">Branding</p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                      <span>App Name</span>
                      <span className="text-xs text-cyber-glow">Theiner Fleetmaster</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                      <span>Subtitle</span>
                      <span className="text-xs text-slate-300">Wagenparkbeheer Suite</span>
                    </div>
                    <button className="w-full rounded-xl border border-dashed border-white/20 px-3 py-2 text-xs text-slate-300">
                      Upload logo
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-200">
                  <p className="text-xs uppercase text-slate-400">
                    Checklist configuration
                  </p>
                  <div className="mt-3 space-y-2 text-xs text-slate-300">
                    <p>Common list includes:</p>
                    <ul className="list-disc space-y-1 pl-4">
                      <li>Check first aid kit</li>
                      <li>Emergency triangle</li>
                      <li>Cleanliness</li>
                    </ul>
                    <button className="mt-2 rounded-full bg-cyber-glow/20 px-3 py-2 text-xs text-cyber-glow">
                      Add checklist item
                    </button>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-200">
                  <p className="text-xs uppercase text-slate-400">
                    Data management
                  </p>
                  <div className="mt-3 space-y-2 text-xs text-slate-300">
                    <button className="w-full rounded-xl bg-white/10 px-3 py-2">
                      Export JSON
                    </button>
                    <button className="w-full rounded-xl bg-white/10 px-3 py-2">
                      Import JSON
                    </button>
                    <button className="w-full rounded-xl border border-rose-500/40 px-3 py-2 text-rose-300">
                      Reset demo data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer className="pb-10 text-center text-xs text-slate-500">
            Theiner Fleetmaster • Cyber-Corporate Fleet Management Suite
          </footer>
        </main>
      </div>
    </div>
  );
}
