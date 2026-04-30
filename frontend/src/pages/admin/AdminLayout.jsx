import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const BACKEND_URL = (import.meta.env.VITE_APP_URL || import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
const LOGO_SRC = `${BACKEND_URL}/storage/logo/logo_smartcity.png`;

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [now, setNow] = useState(new Date());

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("admin_user")) || null;
    } catch {
      return null;
    }
  });

  // Detect mobile breakpoint
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setCollapsed(false);
        setMobileOpen(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token && location.pathname !== "/admin/login") {
      navigate("/admin/login", { replace: true });
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/admin/logout");
    } catch (_) {}
    finally {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      navigate("/admin/login");
    }
  };

  const formattedDate = now.toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    timeZone: "Asia/Jakarta",
  });
  const formattedTime = now.toLocaleTimeString("id-ID", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    timeZone: "Asia/Jakarta", hour12: false,
  });

  const navLinks = [
    { key: "informasi", label: "Informasi Wisata", icon: "fa-solid fa-mountain-sun", path: "/admin/" },
    { key: "tiket",     label: "Kelola Tiket",     icon: "fa-solid fa-ticket",        path: "/admin/kelola-tiket" },
    { key: "scan",      label: "Scan Tiket",        icon: "fa-solid fa-qrcode",        path: "/admin/scan-tiket" },
  ];

  const isActive = (path) => location.pathname === path;

  const adminName    = user?.name   || "Admin Wisata";
  const avatarLetter = adminName[0]?.toUpperCase() || "A";

  // Sidebar state classes
  const sidebarClass = [
    "adm-sidebar",
    !isMobile && collapsed ? "collapsed" : "",
    isMobile && mobileOpen ? "mobile-open" : "",
  ].filter(Boolean).join(" ");

  const mainClass = [
    "adm-main",
    !isMobile && collapsed ? "collapsed" : "",
  ].filter(Boolean).join(" ");

  const topbarClass = [
    "adm-topbar",
    !isMobile && collapsed ? "collapsed" : "",
  ].filter(Boolean).join(" ");

  return (
    <>
      <style>{`
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
          --radius-sm:8px; --radius-md:16px; --radius-lg:24px;
          --shadow-sm:0 2px 8px rgba(64,114,175,.08);
          --shadow-md:0 8px 32px rgba(64,114,175,.12);
          --shadow-lg:0 20px 60px rgba(64,114,175,.16);
          --transition:all .3s cubic-bezier(.4,0,.2,1);
          --sidebar-w: 260px;
          --sidebar-w-collapsed: 72px;
          --topbar-h: 64px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--font-body); background: var(--cream); color: var(--text-dark); }

        .adm-shell { display: flex; min-height: 100vh; }

        /* ══════ OVERLAY (mobile only) ══════ */
        .adm-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(10,29,61,.55);
          backdrop-filter: blur(2px);
          z-index: 250;
          opacity: 0;
          transition: opacity .3s ease;
          pointer-events: none;
        }
        .adm-overlay.visible {
          display: block;
          opacity: 1;
          pointer-events: all;
        }

        /* ══════ SIDEBAR ══════ */
        .adm-sidebar {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: var(--sidebar-w);
          background: linear-gradient(180deg, var(--teal-900) 0%, var(--teal-950) 100%);
          display: flex;
          flex-direction: column;
          z-index: 300;
          transition: width .3s cubic-bezier(.4,0,.2,1), transform .3s cubic-bezier(.4,0,.2,1);
        }
        .adm-sidebar.collapsed { width: var(--sidebar-w-collapsed); }

        /* ── Toggle button (desktop only) ── */
        .adm-toggle {
          position: absolute;
          top: calc(var(--topbar-h) / 3.5);
          right: -13px;
          width: 26px; height: 26px;
          border-radius: 50%;
          background: var(--teal-600);
          border: 2px solid white;
          color: white; font-size: 10px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          z-index: 10;
          transition: var(--transition);
          box-shadow: 0 2px 8px rgba(0,0,0,.25);
        }
        .adm-toggle:hover { background: var(--teal-500); transform: scale(1.1); }

        /* ── Profile ── */
        .adm-profile {
          padding: calc(var(--topbar-h) + 20px) 20px 20px;
          border-bottom: 1px solid rgba(255,255,255,.08);
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          overflow: hidden; flex-shrink: 0;
        }
        .adm-sidebar.collapsed .adm-profile {
          padding-top: calc(var(--topbar-h) + 16px);
          padding-bottom: 16px;
        }
        .adm-avatar {
          width: 60px; height: 60px; border-radius: 50%;
          background: linear-gradient(135deg, var(--teal-400), var(--teal-600));
          border: 3px solid rgba(255,255,255,.2);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-size: 22px; font-weight: 700; color: white;
          flex-shrink: 0; overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,.3);
          transition: var(--transition);
        }
        .adm-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .adm-avatar:hover { transform: scale(1.05); border-color: var(--teal-300); }

        .adm-profile-info {
          text-align: center; overflow: hidden;
          transition: opacity .2s, max-height .3s;
          max-height: 120px; opacity: 1;
          white-space: nowrap; width: 100%;
        }
        .adm-sidebar.collapsed .adm-profile-info { opacity: 0; max-height: 0; pointer-events: none; }
        .adm-profile-name {
          font-family: var(--font-display); font-size: 15px; font-weight: 700;
          color: white; margin-bottom: 3px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .adm-profile-role {
          font-size: 10px; font-weight: 700; letter-spacing: 1.8px;
          text-transform: uppercase; color: var(--teal-300); margin-bottom: 2px;
        }
        .adm-profile-badge {
          display: inline-flex; align-items: center; gap: 5px;
          margin-top: 8px; padding: 3px 10px; border-radius: 50px;
          background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12);
          font-size: 11px; color: rgba(255,255,255,.6);
        }

        .adm-divider { margin: 0 16px; height: 1px; background: rgba(255,255,255,.07); flex-shrink: 0; }

        /* ── Nav ── */
        .adm-nav {
          flex: 1; padding: 14px 10px;
          display: flex; flex-direction: column; gap: 3px;
          overflow-y: auto; overflow-x: hidden;
        }
        .adm-nav-label {
          font-size: 10px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; color: rgba(255,255,255,.3);
          padding: 8px 10px 6px; white-space: nowrap; overflow: hidden;
          transition: opacity .2s;
        }
        .adm-sidebar.collapsed .adm-nav-label { opacity: 0; }

        .adm-nav-link {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 12px; border-radius: var(--radius-sm);
          font-size: 13.5px; font-weight: 500;
          color: rgba(255,255,255,.65); text-decoration: none;
          transition: var(--transition); white-space: nowrap; overflow: hidden;
          position: relative;
        }
        .adm-nav-link i { width: 20px; text-align: center; font-size: 15px; flex-shrink: 0; transition: var(--transition); }
        .adm-nav-link span { overflow: hidden; transition: opacity .2s, max-width .3s; max-width: 200px; opacity: 1; }
        .adm-sidebar.collapsed .adm-nav-link span { opacity: 0; max-width: 0; }
        .adm-nav-link:hover { background: rgba(255,255,255,.08); color: white; }
        .adm-nav-link.active {
          background: rgba(93,147,199,.2); color: var(--teal-300);
          font-weight: 600; border-left: 3px solid var(--teal-400); padding-left: 9px;
        }
        .adm-nav-link.active i { color: var(--teal-300); }
        .adm-sidebar.collapsed .adm-nav-link { justify-content: center; padding: 12px; }
        .adm-sidebar.collapsed .adm-nav-link.active { border-left: none; border-bottom: 2px solid var(--teal-400); }

        /* ── Sidebar footer ── */
        .adm-sidebar-footer { padding: 14px 10px; border-top: 1px solid rgba(255,255,255,.07); flex-shrink: 0; }
        .adm-logout-btn {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 12px; border-radius: var(--radius-sm);
          font-size: 13px; font-weight: 500; color: rgba(255,255,255,.45);
          background: none; border: none; cursor: pointer; width: 100%;
          transition: var(--transition); white-space: nowrap; overflow: hidden;
          font-family: var(--font-body);
        }
        .adm-logout-btn i { width: 20px; text-align: center; font-size: 14px; flex-shrink: 0; }
        .adm-logout-btn span { transition: opacity .2s, max-width .3s; max-width: 200px; opacity: 1; }
        .adm-sidebar.collapsed .adm-logout-btn { justify-content: center; }
        .adm-sidebar.collapsed .adm-logout-btn span { opacity: 0; max-width: 0; }
        .adm-logout-btn:hover { background: rgba(239,68,68,.12); color: #fca5a5; }

        /* ══════ TOPBAR ══════ */
        .adm-topbar {
          position: fixed; top: 0;
          left: var(--sidebar-w); right: 0;
          height: var(--topbar-h); z-index: 200;
          background: rgba(255,255,255,.94);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
          padding: 0 28px;
          display: flex; align-items: center; justify-content: space-between;
          box-shadow: var(--shadow-sm);
          transition: left .3s cubic-bezier(.4,0,.2,1);
        }
        .adm-topbar.collapsed { left: var(--sidebar-w-collapsed); }

        .adm-topbar-left { display: flex; align-items: center; gap: 10px; }
        .adm-topbar-right { display: flex; align-items: center; gap: 18px; }

        /* Hamburger button — hanya mobile */
        .adm-hamburger {
          display: none;
          align-items: center; justify-content: center;
          width: 40px; height: 40px;
          border-radius: var(--radius-sm);
          background: var(--teal-50); border: 1px solid var(--border);
          color: var(--teal-700); font-size: 16px;
          cursor: pointer; transition: var(--transition);
          flex-shrink: 0;
        }
        .adm-hamburger:hover { background: var(--teal-100); color: var(--teal-900); }

        .adm-brand { display: flex; align-items: center; gap: 12px; }
        .adm-brand-text { text-align: right; }
        .adm-brand-row2 {
          display: flex; justify-content: flex-end;
        }
        .adm-brand-logo {
          height: 100px;
          width: auto;
          display: block;
          object-fit: contain;
        }
        .adm-brand-row3 {
          font-size: 10.5px; color: var(--text-muted); margin-top: 1px;
          display: flex; align-items: center; gap: 5px; justify-content: flex-end;
          background-color:#ffffff;
          padding:5px;
          marin:5px;
          border-radius:5px;
        }

        /* ══════ MAIN CONTENT ══════ */
        .adm-main {
          margin-left: var(--sidebar-w);
          padding-top: var(--topbar-h);
          flex: 1; display: flex; flex-direction: column;
          transition: margin-left .3s cubic-bezier(.4,0,.2,1);
          min-width: 0;
        }
        .adm-main.collapsed { margin-left: var(--sidebar-w-collapsed); }
        .adm-content { flex: 1; padding: 32px; background: var(--cream); }

        /* ══════ RESPONSIVE — TABLET (769px – 1024px) ══════ */
        @media (min-width: 769px) and (max-width: 1024px) {
          :root { --sidebar-w: 220px; }
          .adm-content { padding: 24px 20px; }
          .adm-brand-logo { height: 100px; }
          .adm-brand-row3 { display: none; }
        }

        /* ══════ RESPONSIVE — MOBILE (≤ 768px) ══════ */
        @media (max-width: 768px) {
          /* Sidebar: sembunyikan ke kiri, muncul saat mobile-open */
          .adm-sidebar {
            transform: translateX(-100%);
            width: var(--sidebar-w) !important; /* selalu full width saat drawer */
            box-shadow: none;
          }
          .adm-sidebar.mobile-open {
            transform: translateX(0);
            box-shadow: 4px 0 40px rgba(10,29,61,.35);
          }
          /* Sembunyikan toggle desktop */
          .adm-toggle { display: none; }

          /* Hamburger tampil */
          .adm-hamburger { display: flex; }

          /* Topbar mulai dari kiri */
          .adm-topbar { left: 0 !important; padding: 0 16px; }

          /* Main tidak geser */
          .adm-main { margin-left: 0 !important; }

          .adm-content { padding: 20px 16px; }
          .adm-brand-logo { height: 100px; }
          .adm-brand-row3 { display: none; }

          /* Profile: selalu tampil (tidak collapsed di mobile) */
          .adm-sidebar .adm-profile {
            padding-top: calc(var(--topbar-h) + 16px);
          }
          .adm-sidebar .adm-profile-info {
            opacity: 1 !important; max-height: 120px !important;
          }
          .adm-sidebar .adm-nav-label { opacity: 1 !important; }
          .adm-sidebar .adm-nav-link { justify-content: flex-start !important; padding: 11px 12px !important; }
          .adm-sidebar .adm-nav-link span { opacity: 1 !important; max-width: 200px !important; }
          .adm-sidebar .adm-nav-link.active {
            border-left: 3px solid var(--teal-400) !important;
            border-bottom: none !important;
            padding-left: 9px !important;
          }
          .adm-sidebar .adm-logout-btn { justify-content: flex-start !important; }
          .adm-sidebar .adm-logout-btn span { opacity: 1 !important; max-width: 200px !important; }

          /* Close button di dalam sidebar mobile */
          .adm-mobile-close {
            position: absolute;
            top: 16px; right: 16px;
            width: 32px; height: 32px;
            border-radius: 50%;
            background: rgba(255,255,255,.1);
            border: 1px solid rgba(255,255,255,.15);
            color: rgba(255,255,255,.7);
            font-size: 13px;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: var(--transition);
            z-index: 5;
          }
          .adm-mobile-close:hover { background: rgba(255,255,255,.2); color: white; }
        }

        /* ══════ RESPONSIVE — SMALL MOBILE (≤ 400px) ══════ */
        @media (max-width: 400px) {
          :root { --sidebar-w: 85vw; }
          .adm-content { padding: 16px 12px; }
        }
      `}</style>

      <div className="adm-shell">

        {/* ── Overlay (mobile) ── */}
        <div
          className={`adm-overlay${isMobile && mobileOpen ? " visible" : ""}`}
          onClick={() => setMobileOpen(false)}
        />

        {/* ── SIDEBAR ── */}
        <aside className={sidebarClass}>
          {/* Desktop collapse toggle */}
          {!isMobile && (
            <button className="adm-toggle" onClick={() => setCollapsed(!collapsed)}>
              <i className={`fa-solid ${collapsed ? "fa-chevron-right" : "fa-chevron-left"}`} />
            </button>
          )}

          {/* Mobile close button */}
          {isMobile && (
            <button className="adm-mobile-close" onClick={() => setMobileOpen(false)}>
              <i className="fa-solid fa-xmark" />
            </button>
          )}

          {/* Profile */}
          <div className="adm-profile">
            <div className="adm-avatar">
              {user?.avatar ? <img src={user.avatar} alt={user?.name} /> : avatarLetter}
            </div>
            <div className="adm-profile-info">
              <div className="adm-profile-name">{adminName}</div>
              <div className="adm-profile-role">Staff Wisata</div>
              <div className="adm-profile-badge">
                <i className="fa-solid fa-circle" style={{ fontSize: 6, color: "#4ade80" }} />
                Online
              </div>
            </div>
          </div>

          <div className="adm-divider" />

          {/* Nav */}
          <nav className="adm-nav">
            <div className="adm-nav-label">Menu Utama</div>
            {navLinks.map((link) => (
              <Link
                key={link.key}
                to={link.path}
                className={`adm-nav-link${isActive(link.path) ? " active" : ""}`}
                title={!isMobile && collapsed ? link.label : undefined}
              >
                <i className={link.icon} />
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="adm-sidebar-footer">
            <button className="adm-logout-btn" onClick={handleLogout} title={!isMobile && collapsed ? "Keluar" : undefined}>
              <i className="fa-solid fa-right-from-bracket" />
              <span>Keluar</span>
            </button>
          </div>
        </aside>

        {/* ══════ TOPBAR ══════ */}
        <header className={topbarClass}>
          <div className="adm-topbar-left">
            {/* Hamburger — mobile only */}
            {isMobile && (
              <button className="adm-hamburger" onClick={() => setMobileOpen(true)}>
                <i className="fa-solid fa-bars" />
              </button>
            )}
          </div>

          <div className="adm-topbar-right">
            <div className="adm-brand">
              <div className="adm-brand-text">
                <div className="adm-brand-row2">
                  <img src={LOGO_SRC} alt="Logo Smart City Purbalingga" className="adm-brand-logo" />
                </div>
                <div className="adm-brand-row3">
                  <i className="fa-regular fa-clock" style={{ fontSize: 10 }} />
                  {formattedDate} &nbsp;·&nbsp; {formattedTime} WIB
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ══════ MAIN ══════ */}
        <div className={mainClass}>
          <main className="adm-content">
            {children}
          </main>
        </div>

      </div>
    </>
  );
}
