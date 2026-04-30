// src/pages/Pelayanan.jsx
import { useState, useMemo, useEffect } from 'react';
import PelayananCard from '../components/PelayananCard';
import api from '../api/axios';

const KONTAK = [
    { icon: 'fa-envelope', label: 'Email Resmi',  val: 'info@purbalinggakab.go.id' },
    { icon: 'fa-globe',    label: 'Portal Resmi', val: 'purbalinggakab.go.id'       },
];

export default function Pelayanan() {
    const [pelayananAll, setPelayananAll] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [kategori, setKategori] = useState('Semua');

    useEffect(() => {
        api.get('/pelayanan')
            .then(res => {
                setPelayananAll(res.data.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Gagal fetch pelayanan:", err);
                setLoading(false);
            });
    }, []);

    const kategoriList = useMemo(() => {
        const set = new Set(pelayananAll.map(p => p.kategori));
        return ['Semua', ...Array.from(set).sort()];
    }, [pelayananAll]);

    const filtered = useMemo(() => {
        let data = [...pelayananAll];
        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter(p =>
                p.nama.toLowerCase().includes(q) ||
                p.deskripsi.toLowerCase().includes(q) ||
                p.kategori.toLowerCase().includes(q)
            );
        }
        if (kategori !== 'Semua') data = data.filter(p => p.kategori === kategori);
        return data;
    }, [search, kategori, pelayananAll]);

    const totalKategori = useMemo(() => kategoriList.length - 1, [kategoriList]);

    return (
        <>
            <style>{`
                .pelayanan-page { min-height: 100vh; background: var(--cream); }

                /* ── Hero ── */
                .pelayanan-hero {
                    position: relative;
                    background: linear-gradient(135deg, #102d4d 0%, #284d83 60%, #4072af 100%);
                    min-height: 300px;
                    display: flex; align-items: flex-end;
                    padding-top: 90px; overflow: hidden;
                    /* gap ke body */
                    padding-bottom: 48px;
                }
                @media (max-width: 768px) {
                    .pelayanan-hero { padding-bottom: 40px; }
                }
                @media (max-width: 480px) {
                    .pelayanan-hero { padding-bottom: 32px; }
                }

                .pelayanan-hero__overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(to bottom, rgba(10,29,61,.3) 0%, rgba(10,29,61,.8) 100%);
                }
                .pelayanan-hero__pattern {
                    position: absolute; inset: 0; opacity: .06;
                    background-image: radial-gradient(circle at 2px 2px, var(--teal-300) 1px, transparent 0);
                    background-size: 32px 32px;
                }
                .pelayanan-hero__deco {
                    position: absolute; right: 80px; top: 50%; transform: translateY(-50%);
                    display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; opacity: .15;
                }
                .pelayanan-hero__deco span {
                    width: 8px; height: 8px; border-radius: 50%; background: white; display: block;
                }
                .pelayanan-hero__content {
                    position: relative; z-index: 2; width: 100%;
                }
                .pelayanan-hero__label {
                    display: inline-flex; align-items: center; gap: 8px;
                    font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;
                    color: var(--teal-300); margin-bottom: 10px;
                }
                .pelayanan-hero__title {
                    font-family: var(--font-display);
                    font-size: clamp(22px, 4.5vw, 46px);
                    font-weight: 700; color: white; margin-bottom: 10px; line-height: 1.15;
                }
                .pelayanan-hero__desc {
                    font-size: 15px; color: rgba(255,255,255,.7);
                    line-height: 1.7; max-width: 500px;
                }

                /* ── Stats strip ── */
                .pelayanan-stats-strip {
                    background: white;
                    border-bottom: 1px solid var(--border);
                }
                .pelayanan-stats-inner {
                    display: flex;
                }
                .pelayanan-stat-item {
                    flex: 1; display: flex; flex-direction: column; align-items: center;
                    padding: 20px 16px; border-right: 1px solid var(--border); gap: 2px;
                }
                .pelayanan-stat-item:last-child { border-right: none; }
                .pelayanan-stat-item__num {
                    font-family: var(--font-display);
                    font-size: 26px; font-weight: 700; color: var(--teal-700); line-height: 1;
                }
                .pelayanan-stat-item__label {
                    font-size: 11px; color: var(--text-muted); text-align: center; line-height: 1.4;
                }

                /* ── Body ── */
                .pelayanan-body {
                    padding: 40px 16px 80px;
                }
                @media (max-width: 768px) {
                    .pelayanan-body { padding: 28px 14px 60px; }
                }
                @media (max-width: 600px) {
                    .pelayanan-body { padding: 20px 12px 48px; }
                }

                /* ── Toolbar ── */
                .pelayanan-toolbar {
                    display: flex; align-items: center; gap: 16px;
                    margin-bottom: 28px; flex-wrap: wrap;
                }
                .pelayanan-search-wrap {
                    position: relative; flex: 1; max-width: 360px;
                }
                .pelayanan-search-icon {
                    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
                    color: var(--teal-400); font-size: 13px; pointer-events: none;
                }
                .pelayanan-search-input {
                    width: 100%; padding: 10px 16px 10px 38px;
                    border-radius: 50px; border: 1.5px solid var(--border);
                    background: white; font-family: var(--font-body);
                    font-size: 13.5px; color: var(--dark); outline: none;
                    transition: var(--transition);
                }
                .pelayanan-search-input:focus {
                    border-color: var(--teal-500);
                    box-shadow: 0 0 0 3px rgba(64,114,175,.1);
                }
                .pelayanan-search-input::placeholder { color: var(--text-muted); }

                /* Filter tabs */
                .pelayanan-filter-tabs {
                    display: flex; gap: 6px; flex-wrap: wrap; flex: 1;
                }
                .pelayanan-filter-tab {
                    padding: 7px 16px; border-radius: 50px;
                    border: 1.5px solid var(--border);
                    background: white; font-family: var(--font-body);
                    font-size: 12.5px; font-weight: 500; color: var(--text-muted);
                    cursor: pointer; transition: var(--transition); white-space: nowrap;
                }
                .pelayanan-filter-tab:hover  { border-color: var(--teal-400); color: var(--teal-700); }
                .pelayanan-filter-tab.active {
                    border-color: var(--teal-600); background: var(--teal-600);
                    color: white; font-weight: 600;
                }

                .pelayanan-count {
                    font-size: 13px; color: var(--text-muted);
                    margin-bottom: 20px; font-weight: 500;
                }

                /* ── Main layout ── */
                .pelayanan-layout {
                    display: grid;
                    grid-template-columns: 1fr 280px;
                    gap: 32px; align-items: start;
                }

                /* ── Cards grid ── */
                .pelayanan-cards-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                }

                /* ── Card ── */
                .pelayanan-card-new {
                    display: flex; flex-direction: column;
                    background: white; border-radius: var(--radius-lg);
                    border: 1px solid var(--border);
                    box-shadow: var(--shadow-sm);
                    padding: 22px 20px 18px;
                    text-decoration: none;
                    transition: var(--transition);
                    position: relative; overflow: hidden;
                    cursor: pointer;
                }
                .pelayanan-card-new::before {
                    content: '';
                    position: absolute; top: 0; left: 0; right: 0; height: 3px;
                    background: linear-gradient(90deg, var(--teal-500), var(--teal-700));
                    transform: scaleX(0); transform-origin: left;
                    transition: transform .3s ease;
                }
                .pelayanan-card-new:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--shadow-md);
                    border-color: var(--teal-200);
                }
                .pelayanan-card-new:hover::before { transform: scaleX(1); }

                .pelayanan-card-new__icon-wrap {
                    width: 48px; height: 48px; border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 20px; margin-bottom: 14px;
                    transition: var(--transition); flex-shrink: 0;
                }
                .pelayanan-card-new:hover .pelayanan-card-new__icon-wrap { transform: scale(1.08); }
                .pelayanan-card-new__name {
                    font-weight: 700; font-size: 14.5px;
                    color: var(--dark); margin-bottom: 6px; line-height: 1.3;
                }
                .pelayanan-card-new__desc {
                    font-size: 12.5px; color: var(--text-muted);
                    line-height: 1.55; flex: 1; margin-bottom: 14px;
                }
                .pelayanan-card-new__footer {
                    display: flex; align-items: center; justify-content: space-between; margin-top: auto;
                }
                .pelayanan-card-new__badge {
                    font-size: 10px; font-weight: 700;
                    padding: 3px 9px; border-radius: 50px; letter-spacing: .3px;
                }
                .pelayanan-card-new__arrow {
                    width: 26px; height: 26px; border-radius: 50%;
                    background: var(--teal-50); display: flex;
                    align-items: center; justify-content: center;
                    color: var(--teal-500); font-size: 11px;
                    transition: var(--transition); flex-shrink: 0;
                }
                .pelayanan-card-new:hover .pelayanan-card-new__arrow {
                    background: var(--teal-600); color: white;
                }

                /* ── Empty state ── */
                .pelayanan-empty {
                    grid-column: 1/-1; text-align: center;
                    padding: 64px 0; display: flex; flex-direction: column;
                    align-items: center; gap: 14px;
                }
                .pelayanan-empty i { font-size: 44px; color: var(--teal-200); }
                .pelayanan-empty p  { font-size: 15px; color: var(--text-muted); }

                /* ── Sidebar ── */
                .pelayanan-sidebar {
                    position: sticky; top: 100px;
                    display: flex; flex-direction: column; gap: 16px;
                }
                .pelayanan-sidebar-card {
                    background: white; border-radius: var(--radius-lg);
                    border: 1px solid var(--border); padding: 24px;
                    box-shadow: var(--shadow-sm);
                }
                .pelayanan-sidebar-title {
                    font-size: 13px; font-weight: 700;
                    color: var(--dark); margin-bottom: 16px;
                    padding-bottom: 12px; border-bottom: 1px solid var(--border);
                    display: flex; align-items: center; gap: 8px;
                }
                .pelayanan-sidebar-title i { color: var(--teal-500); }

                .pelayanan-kontak-row {
                    display: flex; align-items: center; gap: 12px; margin-top: 12px;
                }
                .pelayanan-kontak-ico {
                    width: 34px; height: 34px; border-radius: 9px;
                    background: var(--teal-50); border: 1px solid var(--teal-100);
                    display: flex; align-items: center; justify-content: center;
                    color: var(--teal-600); font-size: 12px; flex-shrink: 0;
                }
                .pelayanan-kontak-label { font-size: 11px; color: var(--text-muted); margin-bottom: 2px; }
                .pelayanan-kontak-val   { font-size: 13px; font-weight: 600; color: var(--dark); }

                /* ── CTA card ── */
                .pelayanan-cta-card {
                    background: linear-gradient(135deg, var(--teal-700), var(--teal-950));
                    border-radius: var(--radius-lg);
                    padding: 24px; color: white; border: none;
                }
                .pelayanan-cta-card__icon { font-size: 26px; margin-bottom: 12px; }
                .pelayanan-cta-card__title { font-weight: 700; font-size: 15px; margin-bottom: 8px; }
                .pelayanan-cta-card__desc  { font-size: 13px; opacity: .8; line-height: 1.6; margin-bottom: 18px; }
                .pelayanan-cta-btn {
                    display: flex; align-items: center; justify-content: center;
                    gap: 7px; width: 100%; padding: 9px;
                    border-radius: var(--radius-md);
                    font-family: var(--font-body); font-size: 13px; font-weight: 600;
                    cursor: pointer; transition: var(--transition); text-decoration: none;
                    margin-bottom: 8px;
                }
                .pelayanan-cta-btn:last-child { margin-bottom: 0; }
                .pelayanan-cta-btn--light {
                    background: rgba(255,255,255,.15);
                    color: white; border: 1px solid rgba(255,255,255,.25);
                }
                .pelayanan-cta-btn--light:hover { background: rgba(255,255,255,.25); }
                .pelayanan-cta-btn--wa {
                    background: rgba(37,211,102,.2);
                    color: white; border: 1px solid rgba(37,211,102,.4);
                }
                .pelayanan-cta-btn--wa:hover { background: rgba(37,211,102,.35); }

                /* ── Responsive Breakpoints ── */
                @media (max-width: 1024px) {
                    .pelayanan-layout {
                        grid-template-columns: 1fr;
                    }
                    .pelayanan-sidebar {
                        position: static;
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 16px;
                    }
                    .pelayanan-cta-card {
                        grid-column: 1 / -1;
                    }
                    .pelayanan-cards-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .pelayanan-toolbar {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .pelayanan-search-wrap {
                        max-width: 100%;
                    }
                    .pelayanan-filter-tabs {
                        gap: 5px;
                    }
                    .pelayanan-filter-tab {
                        padding: 6px 13px;
                        font-size: 12px;
                    }
                }

                @media (max-width: 640px) {
                    .pelayanan-stats-inner { flex-wrap: wrap; }
                    .pelayanan-stat-item   { flex: 1 1 50%; border-bottom: 1px solid var(--border); }
                    .pelayanan-cards-grid  { grid-template-columns: 1fr; }
                    .pelayanan-toolbar     { flex-direction: column; align-items: stretch; }
                    .pelayanan-search-wrap { max-width: 100%; }
                    .pelayanan-hero__deco  { display: none; }
                    .pelayanan-sidebar {
                        grid-template-columns: 1fr;
                    }
                    .pelayanan-filter-tab {
                        padding: 5px 11px;
                        font-size: 11.5px;
                    }
                }
            `}</style>

            <div className="pelayanan-page">
                {/* ── Hero ── */}
                <div className="pelayanan-hero">
                    <div className="pelayanan-hero__overlay" />
                    <div className="pelayanan-hero__pattern" />
                    <div className="pelayanan-hero__deco">
                        {Array.from({ length: 25 }).map((_, i) => <span key={i} />)}
                    </div>
                    <div className="container pelayanan-hero__content">
                        <div className="pelayanan-hero__label">
                            <i className="fas fa-hands-helping" /> Layanan Digital
                        </div>
                        <h1 className="pelayanan-hero__title">Pelayanan Publik Digital</h1>
                        <p className="pelayanan-hero__desc">
                            Akses berbagai layanan pemerintah Kabupaten Purbalingga secara online — mudah, cepat, dan transparan.
                        </p>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="container pelayanan-body">
                    <div className="pelayanan-layout">

                        {/* Kiri: toolbar + grid */}
                        <div>
                            <div className="pelayanan-toolbar">
                                <div className="pelayanan-search-wrap">
                                    <i className="fas fa-search pelayanan-search-icon" />
                                    <input
                                        type="text"
                                        className="pelayanan-search-input"
                                        placeholder="Cari nama atau kategori layanan..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="pelayanan-filter-tabs">
                                    {kategoriList.map(k => (
                                        <button
                                            key={k}
                                            className={`pelayanan-filter-tab${kategori === k ? ' active' : ''}`}
                                            onClick={() => setKategori(k)}
                                        >{k}</button>
                                    ))}
                                </div>
                            </div>

                            {loading ? (
                                <div className="loader">Memuat layanan...</div>
                            ) : (
                                <>
                                    <p className="pelayanan-count">{filtered.length} layanan ditemukan</p>
                                    <div className="pelayanan-cards-grid">
                                        {filtered.length === 0 ? (
                                            <div className="pelayanan-empty">
                                                <i className="fas fa-search" />
                                                <p>Tidak ada layanan ditemukan.</p>
                                            </div>
                                        ) : (
                                            filtered.map(p => <PelayananCard key={p.id} data={p} />)
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Kanan: sidebar */}
                        <div className="pelayanan-sidebar">
                            <div className="pelayanan-sidebar-card">
                                <div className="pelayanan-sidebar-title">
                                    <i className="fas fa-phone-alt" /> Kontak Layanan
                                </div>
                                {KONTAK.map(k => (
                                    <div className="pelayanan-kontak-row" key={k.label}>
                                        <div className="pelayanan-kontak-ico">
                                            <i className={`fas ${k.icon}`} />
                                        </div>
                                        <div>
                                            <div className="pelayanan-kontak-label">{k.label}</div>
                                            <div className="pelayanan-kontak-val">{k.val}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pelayanan-cta-card">
                                <div className="pelayanan-cta-card__icon"><i className="fas fa-headset" /></div>
                                <div className="pelayanan-cta-card__title">Pusat Pengaduan</div>
                                <div className="pelayanan-cta-card__desc">
                                    Ada keluhan atau pengaduan terkait layanan? Kami siap membantu Anda 24 jam.
                                </div>
                                <a
                                    href="https://lapor.go.id"
                                    target="_blank" rel="noreferrer"
                                    className="pelayanan-cta-btn pelayanan-cta-btn--light"
                                >
                                    <i className="fas fa-paper-plane" /> Lapor Mas Bupati
                                </a>
                            </div>

                            <div className="pelayanan-sidebar-card">
                                <div className="pelayanan-sidebar-title">
                                    <i className="fas fa-mobile-alt" /> Unduh Aplikasi
                                </div>
                                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 14 }}>
                                    Akses semua layanan lebih mudah melalui aplikasi resmi Purbalingga Smart City.
                                </p>
                                <a href="#" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', marginBottom: 8, fontSize: 13 }}>
                                    <i className="fab fa-google-play" /> Google Play
                                </a>
                                <a href="#" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
                                    <i className="fab fa-apple" /> App Store
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}