// src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import {
    clearSsoSession,
    getInitials,
    getStoredSsoSession,
    listenSsoSessionChange,
    rememberReturnTo,
} from '../lib/ssoSession';

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
    const [scrolled,     setScrolled]     = useState(false);
    const [mobileOpen,   setMobileOpen]   = useState(false);
    const [searchOpen,   setSearchOpen]   = useState(false);
    const [searchVal,    setSearchVal]    = useState('');
    // Track which mobile dropdown is open
    const [mobileDropdown, setMobileDropdown] = useState(null);
    const [session, setSession] = useState(() => getStoredSsoSession());
    const location = useLocation();
    const user = session?.user || null;
    const isLoggedIn = Boolean(session?.token);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Tutup semua menu saat navigasi
    useEffect(() => {
        setMobileOpen(false);
        setMobileDropdown(null);
    }, [location]);

    // Lock body scroll saat mobile menu terbuka
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') {
                setSearchOpen(false);
                setMobileOpen(false);
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
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
            window.location.href = 'http://localhost:8000/auth/sso/redirect';
            return;
        }

        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.warn('Logout backend gagal, lanjut membersihkan sesi lokal.', error);
        } finally {
            clearSsoSession();
            setSession(null);
            navigateHome();
        }
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

                /* ── Hamburger animation ── */
                .hamburger { background: none; border: none; }
                .hamburger.is-open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
                .hamburger.is-open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
                .hamburger.is-open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

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
                .mobile-logout-btn {
                    display: flex; align-items: center; gap: 10px;
                    padding: 14px 0; margin-top: 8px;
                    border-top: 1px solid var(--border); border-bottom: none;
                    border-left: none; border-right: none;
                    width: 100%; background: none;
                    color: #b91c1c; font-family: var(--font-body);
                    font-size: 14px; font-weight: 600; cursor: pointer;
                }

                /* Responsive: sembunyikan user name di layar kecil */
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
                            <div className="logo-emblem">
                                <i className="fas fa-city" />
                            </div>
                            <div className="logo-text-group">
                                <span className="logo-title">Purbalingga</span>
                                <span className="logo-subtitle">Smart City</span>
                            </div>
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
                                className={`hamburger${mobileOpen ? ' is-open' : ''}`}
                                onClick={() => setMobileOpen((v) => !v)}
                                aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
                                aria-expanded={mobileOpen}
                            >
                                <span /><span /><span />
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
                                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark)' }}>{user?.name || user?.nama || user?.email}</div>
                                <Link
                                    to="/profile"
                                    style={{ fontSize: 12, color: 'var(--teal-600)', fontWeight: 600, backgroundColor:'#eef3fa', borderRadius: 4, padding: '4px 8px' }}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Lihat Profil
                                </Link>
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
