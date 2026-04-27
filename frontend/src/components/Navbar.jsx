// src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

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

const DUMMY_USER = { nama: 'Aizar Faruq Nafiul Umam', loggedIn: false };

function getInitials(name = '') {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function Navbar() {
    const [scrolled,     setScrolled]     = useState(false);
    const [mobileOpen,   setMobileOpen]   = useState(false);
    const [searchOpen,   setSearchOpen]   = useState(false);
    const [searchVal,    setSearchVal]    = useState('');
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    // Track which mobile dropdown is open
    const [mobileDropdown, setMobileDropdown] = useState(null);
    const location = useLocation();

    const user = DUMMY_USER;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Tutup semua menu saat navigasi
    useEffect(() => {
        setMobileOpen(false);
        setUserMenuOpen(false);
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
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    useEffect(() => {
        if (!userMenuOpen) return;
        const handler = (e) => {
            if (!e.target.closest('.user-menu-wrap')) setUserMenuOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [userMenuOpen]);

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

    return (
        <>
            <style>{`
                /* ── User avatar button ── */
                .user-menu-wrap { position: relative; }
                .user-avatar-btn {
                    display: flex; align-items: center; gap: 8px;
                    padding: 4px 12px 4px 4px; border-radius: 50px;
                    border: 1.5px solid var(--border); background: white;
                    cursor: pointer; transition: var(--transition);
                    font-family: var(--font-body);
                }
                .user-avatar-btn:hover { border-color: var(--teal-400); box-shadow: 0 2px 12px rgba(64,114,175,.12); }
                .user-avatar-circle {
                    width: 30px; height: 30px; border-radius: 50%;
                    background: linear-gradient(135deg, var(--teal-600), var(--teal-800));
                    display: flex; align-items: center; justify-content: center;
                    font-family: var(--font-display); font-size: 11px; font-weight: 700;
                    color: white; letter-spacing: 1px; flex-shrink: 0;
                }
                .user-avatar-name {
                    font-size: 13px; font-weight: 600; color: var(--dark);
                    max-width: 90px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                }
                .user-avatar-btn .fa-chevron-down { font-size: 9px; color: var(--text-muted); transition: transform .2s; }
                .user-avatar-btn.open .fa-chevron-down { transform: rotate(180deg); }

                /* ── User dropdown ── */
                .user-dropdown {
                    position: absolute; top: calc(100% + 10px); right: 0;
                    width: 220px; background: white; border-radius: var(--radius-md);
                    box-shadow: var(--shadow-lg); border: 1px solid var(--border); padding: 8px;
                    opacity: 0; visibility: hidden; transform: translateY(-8px);
                    transition: all .25s cubic-bezier(.4,0,.2,1); z-index: 200;
                }
                .user-dropdown.open { opacity: 1; visibility: visible; transform: translateY(0); }
                .user-dropdown-header { padding: 10px 12px 12px; border-bottom: 1px solid var(--border); margin-bottom: 6px; }
                .user-dropdown-name { font-weight: 700; font-size: 14px; color: var(--dark); margin-bottom: 2px; }
                .user-dropdown-email { font-size: 11.5px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .user-dropdown-item {
                    display: flex; align-items: center; gap: 10px; padding: 9px 12px;
                    border-radius: var(--radius-sm); font-size: 13.5px; color: var(--text-dark);
                    transition: var(--transition); text-decoration: none;
                    cursor: pointer; border: none; background: none;
                    width: 100%; font-family: var(--font-body);
                }
                .user-dropdown-item:hover { background: var(--teal-50); color: var(--teal-700); }
                .user-dropdown-item i { width: 16px; color: var(--teal-500); font-size: 13px; }
                .user-dropdown-sep { height: 1px; background: var(--border); margin: 6px 0; }
                .user-dropdown-item.logout { color: #b91c1c; }
                .user-dropdown-item.logout i { color: #ef4444; }
                .user-dropdown-item.logout:hover { background: #fef2f2; color: #991b1b; }

                .btn-login {
                    display: flex; align-items: center; gap: 7px;
                    padding: 8px 18px; border-radius: 50px;
                    background: var(--teal-600); color: white;
                    font-family: var(--font-body); font-size: 13px; font-weight: 600;
                    border: none; cursor: pointer; transition: var(--transition); text-decoration: none;
                }
                .btn-login:hover { background: var(--teal-700); transform: translateY(-1px); }

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
                            {user.loggedIn ? (
                                <div className="user-menu-wrap">
                                    <button
                                        className={`user-avatar-btn${userMenuOpen ? ' open' : ''}`}
                                        onClick={() => setUserMenuOpen((v) => !v)}
                                        aria-label="Menu akun"
                                    >
                                        <div className="user-avatar-circle">
                                            {getInitials(user.nama)}
                                        </div>
                                        <span className="user-avatar-name">{user.nama.split(' ')[0]}</span>
                                        <i className="fas fa-chevron-down" />
                                    </button>
                                    <div className={`user-dropdown${userMenuOpen ? ' open' : ''}`}>
                                        <div className="user-dropdown-header">
                                            <div className="user-dropdown-name">{user.nama}</div>
                                            <div className="user-dropdown-email">nadya.kameela@gmail.com</div>
                                        </div>
                                        <Link to="/profile" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                            <i className="fas fa-user-circle" /> Profil Saya
                                        </Link>
                                        <Link to="/riwayat" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                            <i className="fas fa-ticket-alt" /> Riwayat Tiket
                                        </Link>
                                        <div className="user-dropdown-sep" />
                                        <button className="user-dropdown-item logout" onClick={() => setUserMenuOpen(false)}>
                                            <i className="fas fa-sign-out-alt" /> Keluar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <a href="http://localhost:8000/auth/sso/redirect" className="btn-login">
                                    <i className="fas fa-sign-in-alt" /> Login
                                </a>
                            )}

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
                    {user.loggedIn && (
                        <div className="mobile-user-info">
                            <div className="mobile-avatar">{getInitials(user.nama)}</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark)' }}>{user.nama}</div>
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
                    {user.loggedIn && (
                        <button
                            className="mobile-logout-btn"
                            onClick={() => setMobileOpen(false)}
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