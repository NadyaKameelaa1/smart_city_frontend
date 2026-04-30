import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const BACKEND_URL = (import.meta.env.VITE_APP_URL || import.meta.env.VITE_API_URL || "https://apismartcity.qode.my.id").replace(/\/$/, "");
const LOGO_SRC = `https://apismartcity.qode.my.id/storage/logo/logo_smartcity.png`;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  :root {
    --teal-50:#eef3fa; --teal-100:#dae2ef; --teal-200:#b8cce3;
    --teal-300:#7aadd3; --teal-400:#5d93c7; --teal-500:#4f83bf;
    --teal-600:#4072af; --teal-700:#35609a; --teal-800:#284d83;
    --teal-900:#1e3c6d; --teal-950:#102d4d;
    --gold:#d4a853; --cream:#f9f7f8; --dark:#102d4d;
    --text-dark:#102d4d; --text-muted:#4d6888; --border:#dae2ef;
    --font-display:'Playfair Display',Georgia,serif;
    --font-body:'DM Sans',sans-serif;
    --radius-sm:8px; --radius-md:16px; --radius-lg:24px; --radius-xl:32px;
    --shadow-sm:0 2px 8px rgba(64,114,175,.08);
    --shadow-md:0 8px 32px rgba(64,114,175,.12);
    --shadow-lg:0 20px 60px rgba(64,114,175,.16);
    --transition:all .3s cubic-bezier(.4,0,.2,1);
    --sa-sidebar-w: 268px;
    --sa-sidebar-collapsed: 74px;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: var(--font-body); background: var(--cream); color: var(--text-dark); overflow-x: hidden; }
  a { text-decoration: none; color: inherit; }

  /* ── SHELL ── */
  .sa-shell { display: flex; min-height: 100vh; }

  /* ── SIDEBAR ── */
  .sa-sidebar {
    position: fixed; top: 0; left: 0; bottom: 0;
    width: var(--sa-sidebar-w);
    background: var(--teal-950);
    display: flex; flex-direction: column;
    z-index: 300;
    transition: width .3s cubic-bezier(.4,0,.2,1);
    overflow: hidden;
    border-right: 1px solid rgba(255,255,255,.05);
  }
  .sa-sidebar.collapsed { width: var(--sa-sidebar-collapsed); }

  /* Top accent line */
  .sa-sidebar::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--teal-400), var(--gold), var(--teal-400));
  }

  /* Toggle */
  .sa-toggle {
    position: absolute; top: 20px; right: -13px; z-index: 10;
    width: 26px; height: 26px; border-radius: 50%;
    background: var(--teal-600); border: 2px solid white; color: white;
    font-size: 10px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 10px rgba(0,0,0,.25);
    transition: var(--transition);
  }
  .sa-toggle:hover { background: var(--teal-400); transform: scale(1.1); }

  /* Branding */
  .sa-brand {
    padding: 28px 20px 20px;
    display: flex; align-items: center; gap: 12px;
    border-bottom: 1px solid rgba(255,255,255,.06);
    overflow: hidden;
    flex-shrink: 0;
  }
  .sa-brand-logo {
    height: 44px;
    width: auto;
    display: block;
    object-fit: contain;
    flex-shrink: 0;
  }
  .sa-brand-text { overflow: hidden; }
  .sa-brand-badge {
    display: inline-flex; align-items: center; gap: 5px;
    margin-top: 0; padding: 2px 8px; border-radius: 50px;
    background: rgba(212,168,83,.15); border: 1px solid rgba(212,168,83,.3);
    font-size: 10px; font-weight: 700; color: var(--gold);
    letter-spacing: .5px; text-transform: uppercase;
    white-space: nowrap;
  }
  .sa-sidebar.collapsed .sa-brand-text { display: none; }

  /* Nav */
  .sa-nav { flex: 1; padding: 16px 10px; overflow-y: auto; overflow-x: hidden; }
  .sa-nav::-webkit-scrollbar { width: 3px; }
  .sa-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 2px; }

  .sa-nav-group { margin-bottom: 8px; }
  .sa-nav-group-label {
    font-size: 10px; font-weight: 700; letter-spacing: 2px;
    text-transform: uppercase; color: rgba(255,255,255,.25);
    padding: 8px 10px 5px;
    white-space: nowrap; overflow: hidden;
    transition: opacity .2s;
  }
  .sa-sidebar.collapsed .sa-nav-group-label { opacity: 0; }

  .sa-nav-link {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; border-radius: 10px;
    font-size: 13.5px; font-weight: 500;
    color: rgba(255,255,255,.58);
    transition: var(--transition);
    cursor: pointer; white-space: nowrap;
    overflow: hidden; position: relative;
    text-decoration: none;
    margin-bottom: 2px;
  }
  .sa-nav-link i {
    font-size: 15px; width: 20px; text-align: center;
    flex-shrink: 0; transition: color .2s;
  }
  .sa-nav-link .sa-link-text {
    overflow: hidden; transition: opacity .2s, max-width .3s;
    max-width: 200px; opacity: 1;
    display: flex; align-items: center; gap: 8px; flex: 1;
  }
  .sa-sidebar.collapsed .sa-nav-link .sa-link-text { opacity: 0; max-width: 0; }
  .sa-nav-link:hover { background: rgba(255,255,255,.06); color: rgba(255,255,255,.9); }
  .sa-nav-link:hover i { color: var(--teal-300); }
  .sa-nav-link.active {
    background: linear-gradient(90deg, rgba(64,114,175,.25), rgba(64,114,175,.08));
    color: white; font-weight: 600;
    border-left: 3px solid var(--teal-400);
    padding-left: 9px;
  }
  .sa-nav-link.active i { color: var(--teal-300); }
  .sa-sidebar.collapsed .sa-nav-link { justify-content: center; padding: 11px; }
  .sa-sidebar.collapsed .sa-nav-link.active { border-left: none; border-bottom: 2px solid var(--teal-400); }

  /* Nav badge */
  .sa-nav-badge {
    padding: 2px 7px; border-radius: 50px; font-size: 10px;
    font-weight: 700; background: var(--teal-500); color: white;
    flex-shrink: 0;
  }

  /* Footer */
  .sa-sidebar-footer {
    padding: 12px 10px 16px;
    border-top: 1px solid rgba(255,255,255,.06);
    flex-shrink: 0;
  }
  .sa-user-row {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.06);
    margin-bottom: 8px; overflow: hidden;
  }
  .sa-user-avatar {
    width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, var(--teal-400), var(--teal-700));
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: white;
    border: 2px solid rgba(255,255,255,.15);
  }
  .sa-user-info { overflow: hidden; transition: opacity .2s, max-width .3s; max-width: 180px; opacity: 1; }
  .sa-sidebar.collapsed .sa-user-info { opacity: 0; max-width: 0; }
  .sa-user-name { font-size: 13px; font-weight: 600; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sa-user-role { font-size: 10.5px; color: var(--teal-300); font-weight: 600; letter-spacing: .5px; }

  .sa-logout-btn {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; border-radius: 10px;
    font-size: 13px; font-weight: 500;
    color: rgba(255,255,255,.4); background: none; border: none;
    cursor: pointer; width: 100%; font-family: var(--font-body);
    transition: var(--transition); white-space: nowrap; overflow: hidden;
  }
  .sa-logout-btn i { width: 20px; text-align: center; font-size: 14px; flex-shrink: 0; }
  .sa-logout-btn span { transition: opacity .2s, max-width .3s; max-width: 200px; opacity: 1; }
  .sa-sidebar.collapsed .sa-logout-btn { justify-content: center; }
  .sa-sidebar.collapsed .sa-logout-btn span { opacity: 0; max-width: 0; }
  .sa-logout-btn:hover { background: rgba(239,68,68,.1); color: #fca5a5; }

  /* ── MAIN ── */
  .sa-main {
    margin-left: var(--sa-sidebar-w);
    flex: 1; display: flex; flex-direction: column;
    transition: margin-left .3s cubic-bezier(.4,0,.2,1);
    min-width: 0;
  }
  .sa-main.collapsed { margin-left: var(--sa-sidebar-collapsed); }

  /* Topbar */
  .sa-topbar {
    position: sticky; top: 0; z-index: 200;
    background: rgba(255,255,255,.93); backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    height: 62px; padding: 0 32px;
    display: flex; align-items: center; justify-content: space-between;
    box-shadow: var(--shadow-sm);
  }
  .sa-topbar-left { display: flex; align-items: center; gap: 14px; }
  .sa-topbar-title {
    font-family: var(--font-display);
    font-size: 17px; font-weight: 700; color: var(--dark);
  }
  .sa-topbar-breadcrumb {
    font-size: 12px; color: var(--text-muted);
    display: flex; align-items: center; gap: 5px;
  }
  .sa-topbar-breadcrumb i { font-size: 10px; }
  .sa-topbar-right { display: flex; align-items: center; gap: 14px; }
  .sa-topbar-date {
    font-size: 12px; color: var(--text-muted);
    display: flex; align-items: center; gap: 6px;
  }
  .sa-topbar-superadmin-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 12px; border-radius: 50px;
    background: rgba(212,168,83,.1); border: 1px solid rgba(212,168,83,.3);
    font-size: 11px; font-weight: 700; color: #92400e;
    letter-spacing: .5px;
  }

  /* Content */
  .sa-content { flex: 1; padding: 32px; background: var(--cream); }

  /* Mobile overlay */
  .sa-mobile-overlay {
    display: none; position: fixed; inset: 0; z-index: 299;
    background: rgba(10,29,61,.5); backdrop-filter: blur(3px);
  }
  .sa-mobile-menu-btn {
    display: none; width: 36px; height: 36px; border-radius: 9px;
    background: var(--teal-50); border: 1.5px solid var(--border);
    color: var(--teal-700); font-size: 15px; cursor: pointer;
    align-items: center; justify-content: center;
  }

  @media (max-width: 1024px) {
    .sa-sidebar { transform: translateX(-100%); width: var(--sa-sidebar-w) !important; }
    .sa-sidebar.mobile-open { transform: translateX(0); }
    .sa-main { margin-left: 0 !important; }
    .sa-mobile-overlay.visible { display: block; }
    .sa-mobile-menu-btn { display: flex; }
    .sa-content { padding: 20px 16px; }
    .sa-topbar { padding: 0 16px; }
  }
`;

const NAV_GROUPS = [
  {
    label: "Manajemen Pengguna",
    items: [
      { icon: "fa-solid fa-users-gear", label: "Kelola Akun", path: "/super-admin/akun" },
    ],
  },
  {
    label: "Konten Portal",
    items: [
      { icon: "fa-solid fa-mountain-sun", label: "Wisata", path: "/super-admin/wisata" },
      { icon: "fa-solid fa-newspaper", label: "Berita", path: "/super-admin/berita" },
      { icon: "fa-solid fa-bullhorn", label: "Pengumuman", path: "/super-admin/pengumuman" },
      { icon: "fa-solid fa-calendar", label: "Event", path: "/super-admin/event" },
      { icon: "fa-solid fa-building", label: "Bangunan", path: "/super-admin/bangunan" },
      { icon: "fa-solid fa-camera", label: "CCTV", path: "/super-admin/cctv" },
    ],
  },
];

export default function SuperAdminLayout({ children, user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) =>
    path === "/superadmin"
      ? location.pathname === "/superadmin"
      : location.pathname.startsWith(path);

  // Current page title
  const currentNav = NAV_GROUPS.flatMap((g) => g.items).find((i) => isActive(i.path));

  return (
    <>
      <style>{css}</style>
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        rel="stylesheet"
      />

      <div className="sa-shell">
        {/* ── Mobile overlay ── */}
        <div
          className={`sa-mobile-overlay${mobileOpen ? " visible" : ""}`}
          onClick={() => setMobileOpen(false)}
        />

        {/* ── SIDEBAR ── */}
        <aside
          className={`sa-sidebar${collapsed ? " collapsed" : ""}${mobileOpen ? " mobile-open" : ""}`}
        >
          {/* Top accent already via ::before */}
          <button className="sa-toggle" onClick={() => setCollapsed((c) => !c)}>
            <i className={`fa-solid ${collapsed ? "fa-chevron-right" : "fa-chevron-left"}`} />
          </button>

          {/* Brand */}
          <div className="sa-brand">
            <img src={LOGO_SRC} alt="Logo Smart City Purbalingga" className="sa-brand-logo" />
            <div className="sa-brand-text">
              <div className="sa-brand-badge">
                <i className="fa-solid fa-shield-halved" style={{ fontSize: 9 }} />
                Super Admin
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="sa-nav">
            {NAV_GROUPS.map((group) => (
              <div className="sa-nav-group" key={group.label}>
                <div className="sa-nav-group-label">{group.label}</div>
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`sa-nav-link${isActive(item.path) ? " active" : ""}`}
                    title={collapsed ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <i className={item.icon} />
                    <span className="sa-link-text">
                      {item.label}
                      {item.badge && (
                        <span className="sa-nav-badge">{item.badge}</span>
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="sa-sidebar-footer">
            <div className="sa-user-row">
              <div className="sa-user-avatar">
                {(user?.name?.[0] || "S").toUpperCase()}
              </div>
              <div className="sa-user-info">
                <div className="sa-user-name">{user?.name || "Super Admin"}</div>
                <div className="sa-user-role">Super Administrator</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className={`sa-main${collapsed ? " collapsed" : ""}`}>
          {/* Topbar */}
          <header className="sa-topbar">
            <div className="sa-topbar-left">
              <button
                className="sa-mobile-menu-btn"
                onClick={() => setMobileOpen((o) => !o)}
              >
                <i className="fa-solid fa-bars" />
              </button>
              <div>
                <div className="sa-topbar-title">
                  {currentNav?.label || "Dashboard"}
                </div>
                <div className="sa-topbar-breadcrumb">
                  <span>Super Admin</span>
                  <i className="fa-solid fa-chevron-right" />
                  <span style={{ color: "var(--teal-600)", fontWeight: 600 }}>
                    {currentNav?.label || "Ringkasan"}
                  </span>
                </div>
              </div>
            </div>
            <div className="sa-topbar-right">
              <div className="sa-topbar-date">
                <i className="fa-regular fa-calendar" />
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="sa-topbar-superadmin-badge">
                <i className="fa-solid fa-crown" style={{ fontSize: 10 }} />
                Super Admin
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="sa-content">{children}</main>
        </div>
      </div>
    </>
  );
}
