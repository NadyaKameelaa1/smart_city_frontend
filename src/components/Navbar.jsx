// src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import {
    clearSsoSession,
    getInitials,
    getSsoDashboardUrl,
    getStoredSsoSession,
    listenSsoSessionChange,
    rememberReturnTo,
} from '../lib/ssoSession';

const BACKEND_URL = (import.meta.env.VITE_APP_URL || import.meta.env.VITE_API_URL || 'https://apismartcity.qode.my.id').replace(/\/$/, '');
const LOGO_SRC = `/img/logo/logo_smartcity.png`;

const navLinks = [
    { label: 'Beranda',    href: '/#home',       icon: 'fa-home' },
    { label: 'Profil',     href: '/#profil',     icon: 'fa-city',
      dropdown: [
          { label: 'Tentang Purbalingga', href: '/#profil',  icon: 'fa-info-circle' },
          { label: 'Profil Pejabat',      href: '/pejabat',  icon: 'fa-user-tie' },
      ]
    },
    { label: 'Wisata',     href: '/wisata',      icon: 'fa-mountain' },
    { label: 'Berita',     href: '/berita',      icon: 'fa-newspaper' },
    { label: 'Pelayanan',  href: '/pelayanan',   icon: 'fa-hands-helping' },
    { label: 'Event',      href: '/event',       icon: 'fa-calendar-alt' },
    { label: 'Pengumuman', href: '/pengumuman',  icon: 'fa-bullhorn' },
    { label: 'Peta',       href: '/peta',        icon: 'fa-map-marked-alt' },
];

export default function Navbar() {
    const [scrolled,       setScrolled]       = useState(false);
    const [mobileOpen,     setMobileOpen]     = useState(false);
    const [searchOpen,     setSearchOpen]     = useState(false);
    const [searchVal,      setSearchVal]      = useState('');
    const [mobileDropdown, setMobileDropdown] = useState(null);
    const [profileOpen,    setProfileOpen]    = useState(false);
    const [session,        setSession]        = useState(() => getStoredSsoSession());
    const profileRef = useRef(null);
    const location   = useLocation();

    const user        = session?.user || null;
    const isLoggedIn  = Boolean(session?.token);
    const dashboardUrl = getSsoDashboardUrl(user, session?.token);
    const profileLabel = (user?.name || user?.nama || user?.email || '')
        .replace(/\s+/g, '')
        .slice(0, 5) || 'Profil';

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
        setMobileDropdown(null);
        setProfileOpen(false);
    }, [location]);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') {
                setSearchOpen(false);
                setMobileOpen(false);
                setProfileOpen(false);
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => listenSsoSessionChange(() => {
        setSession(getStoredSsoSession());
    }), []);

    const handleSearch = () => {
        if (!searchVal.trim()) return;
        window.location.href = `/search?q=${encodeURIComponent(searchVal)}`;
        setSearchOpen(false);
        setSearchVal('');
    };

    const handleAnchorClick = (e, href) => {
        if (href.startsWith('/#')) {
            e.preventDefault();
            const id = href.replace('/#', '');
            if (location.pathname !== '/') {
                window.location.href = href;
                return;
            }
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setMobileOpen(false);
    };

    const handleAuthAction = async () => {
        if (!isLoggedIn) {
            rememberReturnTo(`${location.pathname}${location.search}${location.hash}`);
            window.location.href = 'https://apismartcity.qode.my.id/auth/sso/redirect';
            return;
        }
        const ssoToken = session?.token || localStorage.getItem('token') || localStorage.getItem('auth_token');

        try {
            await api.post(
                '/auth/logout',
                null,
                ssoToken ? { headers: { Authorization: `Bearer ${ssoToken}` } } : undefined,
            );
        } catch (error) {
            console.warn('Logout backend gagal, lanjut membersihkan sesi lokal.', error);
        } finally {
            clearSsoSession();
            setSession(null);
            navigateHome();
        }
    };

    const handleProfileClick = () => {
        window.location.href = dashboardUrl;
    };

    const navigateHome = () => {
        window.location.href = '/';
    };

    return (
        <>
            <style>{`
                /* ── User avatar button ── */
                .btn-login {
                    display: flex; align-items: center; gap: 7px;
                    padding: 8px 18px; border-radius: 50px;
                    background: var(--teal-600); color: white;
                    font-family: var(--font-body); font-size: 13px; font-weight: 600;
                    border: none; cursor: pointer; transition: var(--transition); text-decoration: none;
                }
                .btn-login:hover { background: var(--teal-700); transform: translateY(-1px); }
                .btn-login.logout {
                    background: #b91c1c;
                }
                .btn-login.logout:hover {
                    background: #991b1b;
                }

                /* ── Profile dropdown wrapper ── */
                .profile-dropdown-wrapper {
                    position: relative;
                    display: inline-flex;
                }
                .btn-profile {
                    display: flex; align-items: center; gap: 7px;
                    padding: 8px 18px; border-radius: 50px;
                    background: rgba(64,114,175,.1); color: var(--teal-800);
                    font-family: var(--font-body); font-size: 13px; font-weight: 700;
                    border: 1px solid rgba(64,114,175,.18); cursor: pointer;
                    transition: var(--transition); text-decoration: none;
                }
                .btn-profile:hover { background: rgba(64,114,175,.16); transform: translateY(-1px); }
                .btn-profile .profile-chevron {
                    font-size: 9px;
                    color: var(--teal-600);
                    transition: transform .2s ease;
                    margin-left: 2px;
                }
                .btn-profile.open .profile-chevron {
                    transform: rotate(180deg);
                }

                /* ── Profile dropdown menu ── */
                .profile-dropdown-menu {
                    position: absolute;
                    top: calc(100% + 8px);
                    right: 0;
                    min-width: 180px;
                    background: white;
                    border: 1px solid rgba(64,114,175,.15);
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0,0,0,.12), 0 2px 8px rgba(64,114,175,.08);
                    padding: 6px;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-6px);
                    transition: opacity .2s ease, transform .2s ease, visibility .2s;
                    z-index: 1100;
                }
                .profile-dropdown-menu.open {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }
                .profile-dropdown-item {
                    display: flex; align-items: center; gap: 10px;
                    padding: 10px 14px;
                    border-radius: 8px;
                    font-family: var(--font-body); font-size: 13px; font-weight: 600;
                    color: var(--text-dark);
                    text-decoration: none;
                    cursor: pointer;
                    background: none; border: none; width: 100%;
                    transition: background .15s ease, color .15s ease;
                    text-align: left;
                }
                .profile-dropdown-item:hover {
                    background: rgba(64,114,175,.08);
                    color: var(--teal-700);
                }
                .profile-dropdown-item i {
                    width: 16px; font-size: 13px;
                    color: var(--teal-500);
                    flex-shrink: 0;
                }
                .profile-dropdown-divider {
                    height: 1px;
                    background: rgba(64,114,175,.1);
                    margin: 4px 0;
                }

                /* ── Hamburger ── */
                .hamburger {
                    display: none;
                    align-items: center; justify-content: center;
                    width: 40px; height: 40px;
                    border-radius: var(--radius-sm);
                    background: var(--teal-50); border: 1px solid var(--border);
                    color: var(--teal-700); font-size: 16px;
                    cursor: pointer; transition: var(--transition);
                    flex-shrink: 0; padding: 0;
                }
                .hamburger:hover { background: var(--teal-100); color: var(--teal-900); }
                @media (max-width: 1024px) {
                    .hamburger { display: flex; }
                }

                /* ── Mobile menu panel ── */
                .mobile-menu-panel {
                    transform: translateX(100%);
                    transition: transform .32s cubic-bezier(.4,0,.2,1);
                }
                .mobile-menu.active .mobile-menu-panel { transform: translateX(0); }

                /* ── Mobile accordion dropdown ── */
                .mobile-dropdown-btn {
                    width: 100%; display: flex; align-items: center; gap: 12px;
                    padding: 14px 0; border-bottom: 1px solid var(--border);
                    background: none; border-top: none; border-left: none; border-right: none;
                    font-size: 15px; font-weight: 500; color: var(--text-dark);
                    font-family: var(--font-body); cursor: pointer; transition: var(--transition);
                    text-align: left;
                }
                .mobile-dropdown-btn:hover { color: var(--teal-600); }
                .mobile-dropdown-btn .chevron {
                    margin-left: auto; font-size: 10px; color: var(--text-muted);
                    transition: transform .2s;
                }
                .mobile-dropdown-btn.open .chevron { transform: rotate(180deg); }
                .mobile-submenu {
                    max-height: 0; overflow: hidden;
                    transition: max-height .3s ease;
                }
                .mobile-submenu.open { max-height: 300px; }
                .mobile-submenu-item {
                    display: flex; align-items: center; gap: 10px;
                    padding: 11px 0 11px 32px;
                    border-bottom: 1px solid var(--teal-50);
                    font-size: 14px; color: var(--text-muted);
                    text-decoration: none; transition: var(--transition);
                }
                .mobile-submenu-item:hover { color: var(--teal-600); padding-left: 36px; }
                .mobile-submenu-item i { width: 16px; color: var(--teal-400); font-size: 12px; }

                /* ── Mobile user info ── */
                .mobile-user-info {
                    display: flex; align-items: center; gap: 12px;
                    padding: 0 0 20px; margin-bottom: 8px;
                    border-bottom: 1px solid var(--border);
                }
                .mobile-avatar {
                    width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
                    background: linear-gradient(135deg, var(--teal-600), var(--teal-800));
                    display: flex; align-items: center; justify-content: center;
                    font-family: var(--font-display); font-size: 14px; font-weight: 700;
                    color: white; letter-spacing: 1px;
                }

                /* ── Mobile profile quick links ── */
                .mobile-profile-links {
                    display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px;
                }
                .mobile-profile-link {
                    display: inline-flex; align-items: center; gap: 5px;
                    font-size: 12px; color: var(--teal-700); font-weight: 600;
                    background: rgba(64,114,175,.08); border-radius: 4px;
                    padding: 4px 8px; border: none; cursor: pointer; text-decoration: none;
                    transition: background .15s;
                }
                .mobile-profile-link:hover { background: rgba(64,114,175,.16); }
                .mobile-profile-link i { font-size: 11px; }

                .mobile-logout-btn {
                    display: flex; align-items: center; gap: 10px;
                    padding: 14px 0; margin-top: 8px;
                    border-top: 1px solid var(--border); border-bottom: none;
                    border-left: none; border-right: none;
                    width: 100%; background: none;
                    color: #b91c1c; font-family: var(--font-body);
                    font-size: 14px; font-weight: 600; cursor: pointer;
                }

                @media (max-width: 480px) {
                    .user-avatar-name { display: none; }
                    .user-avatar-btn { padding: 4px; }
                }
            `}</style>

            {/* ── NAVBAR ── */}
            <nav className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
                <div className="container">
                    <div className="navbar-inner">
                        {/* Logo */}
                        <Link to="/#home" className="navbar-logo" onClick={(e) => handleAnchorClick(e, '/#home')}>
                            <img
                                src={LOGO_SRC}
                                alt="Logo Smart City Purbalingga"
                                className="logo-image"
                            />
                        </Link>

                        {/* Desktop Menu */}
                        <ul className="navbar-menu">
                            {navLinks.map((link) => (
                                <li className="nav-item" key={link.label}>
                                    {link.dropdown ? (
                                        <>
                                            <span className="nav-link">
                                                {link.label}
                                                <i className="fas fa-chevron-down" />
                                            </span>
                                            <div className="dropdown-menu">
                                                {link.dropdown.map((d) => (
                                                    <Link
                                                        key={d.label}
                                                        to={d.href}
                                                        className="dropdown-item"
                                                        onClick={(e) => handleAnchorClick(e, d.href)}
                                                    >
                                                        <i className={`fas ${d.icon}`} />
                                                        {d.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <Link
                                            to={link.href}
                                            className={`nav-link${location.pathname === link.href ? ' active' : ''}`}
                                            onClick={(e) => handleAnchorClick(e, link.href)}
                                        >
                                            <i className={`fas ${link.icon}`} style={{ fontSize: 12 }} />
                                            {link.label}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {/* Actions */}
                        <div className="navbar-actions">
                            {/* Profile dropdown (only when logged in) */}
                            {isLoggedIn && (
                                <div className="profile-dropdown-wrapper" ref={profileRef}>
                                    <button
                                        type="button"
                                        className={`btn-profile${profileOpen ? ' open' : ''}`}
                                        onClick={() => setProfileOpen((v) => !v)}
                                        aria-haspopup="true"
                                        aria-expanded={profileOpen}
                                    >
                                        <i className="fas fa-user-circle" />
                                        {profileLabel}
                                        <i className="fas fa-chevron-down profile-chevron" />
                                    </button>

                                    <div className={`profile-dropdown-menu${profileOpen ? ' open' : ''}`}>
                                        {/* Profile */}
                                        <button
                                            type="button"
                                            className="profile-dropdown-item"
                                            onClick={() => { setProfileOpen(false); handleProfileClick(); }}
                                        >
                                            <i className="fas fa-user-circle" />
                                            Profil Saya
                                        </button>

                                        <div className="profile-dropdown-divider" />

                                        {/* Riwayat Tiket */}
                                        <Link
                                            to="/riwayat"
                                            className="profile-dropdown-item"
                                            onClick={() => setProfileOpen(false)}
                                        >
                                            <i className="fas fa-ticket-alt" />
                                            Riwayat Tiket
                                        </Link>
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                className={`btn-login${isLoggedIn ? ' logout' : ''}`}
                                onClick={handleAuthAction}
                            >
                                <i className={`fas ${isLoggedIn ? 'fa-sign-out-alt' : 'fa-sign-in-alt'}`} />
                                {isLoggedIn ? 'Keluar' : 'Login'}
                            </button>

                            {/* Hamburger */}
                            <button
                                className="hamburger"
                                onClick={() => setMobileOpen((v) => !v)}
                                aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
                                aria-expanded={mobileOpen}
                            >
                                <i className="fa-solid fa-bars" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── SEARCH OVERLAY ── */}
            <div
                className={`search-overlay${searchOpen ? ' active' : ''}`}
                onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
            >
                <button className="search-close" onClick={() => setSearchOpen(false)}>
                    <i className="fas fa-times" />
                </button>
                <div className="search-overlay-inner">
                    <div className="search-box">
                        <input
                            type="text"
                            className="search-box-input"
                            placeholder="Cari informasi Purbalingga..."
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            autoFocus={searchOpen}
                        />
                    </div>
                    <div className="search-categories">
                        {['Semua', 'Wisata', 'Berita', 'Event', 'Pelayanan', 'Pengumuman'].map((k) => (
                            <span key={k} className="search-cat-tag">{k}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── MOBILE MENU ── */}
            <div
                className={`mobile-menu${mobileOpen ? ' active' : ''}`}
                onClick={(e) => { if (e.target === e.currentTarget) setMobileOpen(false); }}
            >
                <div className="mobile-menu-panel">
                    {/* User info */}
                    {isLoggedIn && (
                        <div className="mobile-user-info">
                            <div className="mobile-avatar">{getInitials(user?.name || user?.nama || user?.email || '')}</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark)', marginBottom: 6 }}>
                                    {user?.name || user?.nama || user?.email}
                                </div>
                                <div className="mobile-profile-links">
                                    <button
                                        type="button"
                                        className="mobile-profile-link"
                                        onClick={() => { setMobileOpen(false); handleProfileClick(); }}
                                    >
                                        <i className="fas fa-user-circle" />
                                        Profil Saya
                                    </button>
                                    <Link
                                        to="/riwayat"
                                        className="mobile-profile-link"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <i className="fas fa-ticket-alt" />
                                        Riwayat Tiket
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Nav links */}
                    <ul className="mobile-nav-links">
                        {navLinks.map((link) => (
                            <li key={link.label}>
                                {link.dropdown ? (
                                    <>
                                        <button
                                            className={`mobile-dropdown-btn${mobileDropdown === link.label ? ' open' : ''}`}
                                            onClick={() => setMobileDropdown(
                                                mobileDropdown === link.label ? null : link.label
                                            )}
                                        >
                                            <i className={`fas ${link.icon}`} style={{ width: 20, color: 'var(--teal-500)' }} />
                                            {link.label}
                                            <i className="fas fa-chevron-down chevron" />
                                        </button>
                                        <div className={`mobile-submenu${mobileDropdown === link.label ? ' open' : ''}`}>
                                            {link.dropdown.map((d) => (
                                                <Link
                                                    key={d.label}
                                                    to={d.href}
                                                    className="mobile-submenu-item"
                                                    onClick={(e) => handleAnchorClick(e, d.href)}
                                                >
                                                    <i className={`fas ${d.icon}`} />
                                                    {d.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <Link
                                        to={link.href}
                                        onClick={(e) => handleAnchorClick(e, link.href)}
                                    >
                                        <i className={`fas ${link.icon}`} />
                                        {link.label}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Logout */}
                    {isLoggedIn && (
                        <button
                            className="mobile-logout-btn"
                            onClick={handleAuthAction}
                        >
                            <i className="fas fa-sign-out-alt" style={{ width: 20, color: '#ef4444' }} />
                            Keluar dari Akun
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}