// src/pages/Home.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WisataCard from '../components/WisataCard';
import SmartSearchBar from '../components/SmartSearchBar';
import PengumumanCard from '../components/PengumumanCard';
import PelayananCard from '../components/PelayananCard';
import EventCard from '../components/EventCard';
import {
    wisataData,
    beritaData,
    pengumumanData,
    eventData,
    pelayananData,
    statistikData,
    profilData,
} from '../data/mockData';
import MiniMap from '../components/MiniMap';
import api from '../api/axios';

// ─── Helpers ────────────────────────────────────────────────
const formatRupiah = (n) => 'Rp ' + n.toLocaleString('id-ID');
const formatTanggal = (str) => {
    const d = new Date(str);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};
const formatTanggalEvent = (str) => {
    const d = new Date(str);
    return {
        day: d.getDate(),
        month: d.toLocaleDateString('id-ID', { month: 'short' }),
    };
};

// ─── Fade-in hook ────────────────────────────────────────────
function useFadeIn() {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); } },
            { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return ref;
}

// ─── Section wrapper with fade ───────────────────────────────
function FadeIn({ children, className = '' }) {
    const ref = useFadeIn();
    return <div ref={ref} className={`fade-in-up ${className}`}>{children}</div>;
}

// src/pages/Home.jsx — ganti fungsi HeroSection dengan ini

function HeroSection() {
    const navigate  = useNavigate();
    const [keyword, setKeyword]   = useState('');
    const [activeKat, setActiveKat] = useState('semua');

    const handleSearch = () => {
        if (!keyword.trim()) return;
        navigate(`/search?q=${encodeURIComponent(keyword)}&cat=${activeKat}`);
    };

    return (
        <>
            <style>{`
                .hero {
                    position: relative;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    overflow: hidden;
                }
                .hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    padding: 6px 18px;
                    border-radius: 50px;
                    background: rgba(255,255,255,.12);
                    border: 1px solid rgba(255,255,255,.2);
                    color: #c7d5df;
                    font-size: 13px;
                    font-weight: 600;
                    letter-spacing: .5px;
                    text-transform: capitalize;
                }
                .hero-title {
                    font-family: var(--font-display, 'Playfair Display', Georgia, serif);
                    font-size: clamp(40px, 8vw, 80px);
                    letter-spacing: 1px;
                    color: white;
                    margin: 0 0 8px;
                    line-height: 1.1;
                }
                .title-sub-row {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 14px;
                    position: relative;
                }
                .title-city {
                    font-family: var(--font-display, 'Playfair Display', Georgia, serif);
                    font-size: clamp(18px, 4vw, 32px);
                    color: var(--teal-300, #ffffff);
                    font-weight: 600;
                    letter-spacing: 2px;
                    white-space: nowrap;
                }
                .title-line {
                    flex: 1;
                    height: 1px;
                    max-width: 120px;
                    background: linear-gradient(to right, transparent, rgba(255,255,255,.3));
                }
                .title-line-left { transform: scaleX(-1); }
                .hero-inner {
                    text-align: center;
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 0 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                }
                .hero-titles-wrap { display: flex; flex-direction: column; gap: 10px; }

                /* CTA — selalu horizontal, selalu tengah */
                .hero-actions {
                    display: flex;
                    gap: 16px;
                    justify-content: center;
                    flex-wrap: wrap;
                    margin-top: 8px;
                }
                .hero-cta-primary {
                    background: var(--teal-600, #4072af);
                    color: white;
                    padding: 13px 28px;
                    border-radius: 50px;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    text-decoration: none;
                    font-size: 15px;
                    transition: background .2s, transform .2s;
                    border: none;
                    cursor: pointer;
                    white-space: nowrap;
                }
                .hero-cta-primary:hover { background: var(--teal-700, #35609a); transform: translateY(-2px); }
                .hero-cta-ghost {
                    background: rgba(255,255,255,.12);
                    color: white;
                    border: 1px solid rgba(255,255,255,.2);
                    padding: 13px 28px;
                    border-radius: 50px;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    text-decoration: none;
                    font-size: 15px;
                    transition: background .2s, transform .2s;
                    white-space: nowrap;
                }
                .hero-cta-ghost:hover { background: rgba(255,255,255,.22); transform: translateY(-2px); }

                @media (max-width: 1024px) {
                    .hero-inner { gap: 26px; }
                }
                @media (max-width: 640px) {
                    .hero        { min-height: 100svh; align-items: flex-start; padding-top: 90px; }
                    .hero-inner  { gap: 20px; padding: 0 12px; }
                    .hero-badge  { font-size: 10px; padding: 5px 13px; }
                    .hero-title  { font-size: clamp(32px, 9vw, 52px); letter-spacing: .5px; }
                    .title-city  { font-size: clamp(14px, 4.5vw, 22px); letter-spacing: 1.5px; }
                    .title-line  { max-width: 60px; }
                    /* Tombol tetap horizontal dan tengah, ukuran tidak berubah */
                    .hero-actions {
                        gap: 12px;
                        margin-top: 4px;
                        justify-content: center;
                        flex-direction: row;
                    }
                }
                @media (max-width: 380px) {
                    .hero       { padding-top: 80px; }
                    .hero-inner { gap: 16px; }
                    .hero-title { font-size: 30px; }
                    .title-city { font-size: 14px; }
                    .hero-badge { font-size: 9.5px; padding: 4px 11px; }
                    .hero-actions {
                        flex-direction: row;
                        justify-content: center;
                        gap: 10px;
                    }
                    .hero-cta-primary,
                    .hero-cta-ghost { padding: 11px 18px; font-size: 13px; }
                }
            `}</style>

            <section className="hero" id="home">
                <div className="hero-video-container">
                    <video className="hero-video" autoPlay muted loop playsInline>
                        <source src="/videos/Purbalingga.mp4" type="video/mp4" />
                    </video>
                    <div className="hero-video-overlay" />
                </div>
                <div className="hero-gradient" />
                <div className="hero-pattern" />

                <div className="container" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
                    <div className="hero-content" style={{ textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
                        <FadeIn>
                        <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: 20 }}>
                            <i className="fas fa-star" /> Purbalingga untuk semua
                        </div>

                        <div style={{ marginBottom: 40 }}>
                            <h1 className="hero-title" style={{ fontSize: 'clamp(40px,8vw,80px)', letterSpacing: 1 }}>
                                Purbalingga
                            </h1>
                            <div className="title-sub-row" style={{ position: 'relative' }}>
                                <div className="title-line title-line-left" />
                                <span className="title-city" style={{color:'#a4cae6', marginTop:'-10px'}}>Smart City</span>
                                <div className="title-line title-line-right" />
                            </div>
                        </div>

                            {/* Search bar + pills icon kategori */}
                            <SmartSearchBar />

                            {/* CTA — selalu tengah, selalu horizontal, ukuran dipertahankan */}
                            <div className="hero-actions">
                                <a href="#profil" className="hero-cta-primary">
                                    <i className="fas fa-compass" /> Jelajahi Purbalingga
                                </a>
                                <a href="#wisata" className="hero-cta-ghost">
                                    <i className="fas fa-map-marked-alt" /> Destinasi Wisata
                                </a>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>
        </>
    );
}

// ═══════════════════════════════════════════════════════════════
// PROFIL
// ═══════════════════════════════════════════════════════════════
function ProfilSection() {
    const [activeTab, setActiveTab] = useState('tentang');
    const tabs = [
        { key: 'tentang',  label: 'Tentang Purbalingga', icon: 'fa-info-circle' },
        { key: 'sejarah',  label: 'Sejarah',             icon: 'fa-scroll' },
        { key: 'visimisi', label: 'Visi & Misi',         icon: 'fa-bullseye' },
        { key: 'pejabat',  label: 'Profil Pejabat',      icon: 'fa-user-tie' },
    ];

    return (
        <section className="profil-section section" id="profil">
            <div className="container">
                <FadeIn>
                    <div className="section-header">
                        <div className="section-label"><i className="fas fa-city" /> Profil Kota</div>
                        <h2 className="section-title">Mengenal Kabupaten Purbalingga</h2>
                        <p className="section-desc">Informasi lengkap tentang Kabupaten Purbalingga, mulai dari sejarah, visi misi, hingga profil pejabat daerah.</p>
                    </div>
                </FadeIn>

                <FadeIn>
                    <div className="profil-tabs">
                        {tabs.map((t) => (
                            <button
                                key={t.key}
                                className={`profil-tab${activeTab === t.key ? ' active' : ''}`}
                                onClick={() => setActiveTab(t.key)}
                            >
                                <i className={`fas ${t.icon}`} /> {t.label}
                            </button>
                        ))}
                    </div>
                </FadeIn>

                {activeTab === 'tentang'  && <TabTentang />}
                {activeTab === 'sejarah'  && <TabSejarah />}
                {activeTab === 'visimisi' && <TabVisiMisi />}
                {activeTab === 'pejabat'  && <TabPejabat />}
            </div>
        </section>
    );
}

// Ganti fungsi TabTentang dengan ini

function TabTentang() {
    const facts = [
        { label: 'Ibu Kota',         value: 'Kota Purbalingga',     icon: 'fa-map-marker-alt' },
        { label: 'Luas Wilayah',     value: '777,65 km²',           icon: 'fa-ruler-combined' },
        { label: 'Jumlah Kecamatan', value: '18 Kecamatan',         icon: 'fa-building' },
        { label: 'Jumlah Desa/Kel.', value: '239 Desa/Kelurahan',   icon: 'fa-flag' },
        { label: 'Kode Pos',         value: '53300–53392',          icon: 'fa-mail-bulk' },
        { label: 'Bahasa',           value: 'Banyumasan, Indonesia', icon: 'fa-language' },
    ];

    return (
        <>
            <style>{`
                /* ─── Content wrapper: 2 kolom di desktop ─── */
                .tentang-content-wrapper {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 40px;
                    position: relative;
                    z-index: 2;
                    padding: 48px;
                }

                /* ─── Teks kiri ─── */
                .tentang-left h2 {
                    font-family: var(--font-display, 'Playfair Display', Georgia, serif);
                    font-size: 32px;
                    color: white;
                    margin: 12px 0 16px;
                    line-height: 1.2;
                }
                .tentang-left p {
                    font-size: 14px;
                    color: rgba(255,255,255,.75);
                    line-height: 1.8;
                    margin-bottom: 12px;
                }
                .tentang-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    padding: 5px 14px;
                    border-radius: 50px;
                    background: rgba(255,255,255,.1);
                    border: 1px solid rgba(255,255,255,.18);
                    color: var(--teal-300, #7aadd3);
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }

                /* ─── Facts grid: 2 kolom ─── */
                .tentang-facts-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 20px;
                }
                .tentang-fact-item {
                    background: rgba(255,255,255,.06);
                    border: 1px solid rgba(255,255,255,.1);
                    border-radius: 10px;
                    padding: 12px 14px;
                }
                .tentang-fact-label {
                    font-size: 11px;
                    color: rgba(255,255,255,.5);
                    margin-bottom: 5px;
                    text-transform: uppercase;
                    letter-spacing: .5px;
                }
                .tentang-fact-value {
                    font-size: 14px;
                    font-weight: 700;
                    color: white;
                    line-height: 1.3;
                }

                /* ─── Quote bawah ─── */
                .tentang-description {
                    font-size: 13px;
                    color: rgba(255,255,255,.6);
                    font-style: italic;
                    line-height: 1.65;
                    padding: 14px 16px;
                    border-left: 3px solid var(--teal-400, #5d93c7);
                    background: rgba(255,255,255,.04);
                    border-radius: 0 8px 8px 0;
                }

                /* ════════ TABLET (≤ 1024px): stack vertikal ════════ */
                @media (max-width: 1024px) {
                    .tentang-content-wrapper {
                        grid-template-columns: 1fr;
                        gap: 28px;
                        padding: 36px;
                    }
                    .tentang-left h2   { font-size: 26px; }
                    .tentang-left p    { font-size: 13.5px; }
                }

                /* ════════ MOBILE (≤ 640px) ════════ */
                @media (max-width: 640px) {
                    .tentang-content-wrapper {
                        grid-template-columns: 1fr;
                        gap: 20px;
                        padding: 20px 16px;
                    }
                    .tentang-badge     { font-size: 10px; padding: 4px 11px; }
                    .tentang-left h2   { font-size: 22px; margin: 8px 0 12px; }
                    .tentang-left p    { font-size: 13px; line-height: 1.7; margin-bottom: 8px; }

                    /* Facts: tetap 2 kolom tapi lebih compact */
                    .tentang-facts-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 8px;
                        margin-bottom: 14px;
                    }
                    .tentang-fact-item  { padding: 10px 11px; border-radius: 8px; }
                    .tentang-fact-label { font-size: 10px; margin-bottom: 3px; }
                    .tentang-fact-value { font-size: 12.5px; }

                    /* Header fakta singkat */
                    .tentang-fakta-head { gap: 8px !important; margin-bottom: 14px !important; }
                    .tentang-fakta-head > div { width: 32px !important; height: 32px !important; border-radius: 8px !important; }
                    .tentang-fakta-head h3  { font-size: 16px !important; }

                    .tentang-description { font-size: 12px; padding: 11px 13px; }
                }

                /* ════════ SMALL MOBILE (≤ 380px) ════════ */
                @media (max-width: 380px) {
                    .tentang-content-wrapper { padding: 16px 12px; gap: 16px; }
                    .tentang-left h2   { font-size: 20px; }
                    .tentang-left p    { font-size: 12.5px; }
                    .tentang-fact-item { padding: 8px 9px; }
                    .tentang-fact-label { font-size: 9.5px; }
                    .tentang-fact-value { font-size: 12px; }
                }
            `}</style>

            <FadeIn>
                <div className="tentang-hero-style">
                    <div className="tentang-hero-bg" style={{ backgroundImage: "url('/img/tentang/tentang-pbg.jpg')" }} />
                    <div className="tentang-hero-gradient" />
                    <div className="tentang-hero-pattern" />
                    <div className="tentang-content-wrapper">

                        {/* Kiri — deskripsi */}
                        <div className="tentang-left">
                            <div className="tentang-badge">
                                <i className="fas fa-info-circle" /> Tentang Kabupaten Purbalingga
                            </div>
                            <h2>Kota Purbalingga</h2>
                            <p>Kabupaten Purbalingga adalah sebuah kabupaten di Provinsi Jawa Tengah, Indonesia. Berbatasan dengan Kabupaten Banjarnegara di selatan dan timur, Kabupaten Pemalang di utara, Kabupaten Banyumas di barat.</p>
                            <p>Purbalingga dikenal dengan berbagai produk unggulan seperti bulu mata palsu, knalpot, dan rambut palsu yang dipasarkan ke mancanegara.</p>
                            <p>Kota ini berkembang pesat dengan berbagai infrastruktur modern, termasuk Bandara Jenderal Besar Soedirman.</p>
                        </div>

                        {/* Kanan — fakta singkat */}
                        <div className="tentang-right">
                            <div className="tentang-fakta-head" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                <div style={{ width: 40, height: 40, background: 'var(--teal-500)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <i className="fas fa-chart-pie" style={{ color: 'white' }} />
                                </div>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'white', margin: 0 }}>Fakta Singkat</h3>
                            </div>
                            <div className="tentang-facts-grid">
                                {facts.map((f) => (
                                    <div className="tentang-fact-item" key={f.label}>
                                        <div className="tentang-fact-label">
                                            <i className={`fas ${f.icon}`} style={{ marginRight: 5 }} />{f.label}
                                        </div>
                                        <div className="tentang-fact-value">{f.value}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="tentang-description">
                                <i className="fas fa-quote-left" style={{ color: 'var(--teal-300)', marginRight: 8 }} />
                                Purbalingga terus berkembang menjadi kota smart city dengan tetap mempertahankan kearifan lokal dan budaya Banyumasan.
                            </div>
                        </div>

                    </div>
                </div>
            </FadeIn>
        </>
    );
}

function TabSejarah() {
    const items = [
        { tahun: '1740-1760',     judul: 'Masa Kyai Arsantaka',              desc: 'Kyai Arsantaka menjadi Demang di Kademangan Pagendolan, berjasa dalam Perang Jenar.' },
        { tahun: 'Akhir Abad 18', judul: 'Kyai Arsayuda Menjadi Tumenggung', desc: 'Kyai Arsayuda diangkat menjadi Tumenggung Karanglewas bergelar Raden Tumenggung Dipayuda III.' },
        { tahun: '18 Des 1830',   judul: 'Hari Jadi Kabupaten Purbalingga',  desc: 'Pusat pemerintahan dipindah ke Desa Purbalingga. Ditetapkan melalui Perda No. 15 Tahun 1996.' },
        { tahun: '1831',          judul: 'Era Kolonial Belanda',             desc: 'Purbalingga ditetapkan sebagai kabupaten resmi dengan sistem pemerintahan terstruktur.' },
        { tahun: '1945',          judul: 'Kemerdekaan Indonesia',            desc: 'Purbalingga menjadi bagian dari Republik Indonesia.' },
        { tahun: '1980-an',       judul: 'Perkembangan Industri',            desc: 'Industri bulu mata palsu, knalpot, dan rambut palsu mulai berkembang pesat.' },
        { tahun: '2016',          judul: 'Bandara Jend. Besar Soedirman',   desc: 'Peresmian bandara pertama untuk wilayah Jawa Tengah bagian selatan.' },
    ];

    return (
        <FadeIn>
            {/* Timeline — tanpa item "Kini" */}
            <div className="sejarah-timeline">
                {items.map((item, i) => (
                    <div className="timeline-item" key={i}>
                        {i % 2 === 0 ? (
                            <>
                                <div className="timeline-content">
                                    <div className="timeline-year">{item.tahun}</div>
                                    <div className="timeline-title">{item.judul}</div>
                                    <div className="timeline-desc">{item.desc}</div>
                                </div>
                                <div className="timeline-dot"><div className="timeline-dot-inner" /></div>
                                <div className="timeline-spacer" />
                            </>
                        ) : (
                            <>
                                <div className="timeline-spacer" />
                                <div className="timeline-dot"><div className="timeline-dot-inner" /></div>
                                <div className="timeline-content">
                                    <div className="timeline-year">{item.tahun}</div>
                                    <div className="timeline-title">{item.judul}</div>
                                    <div className="timeline-desc">{item.desc}</div>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Titik penutup timeline */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '-12px 0 28px', position: 'relative', zIndex: 2 }}>
                <div style={{
                    width: 24, height: 24, background: 'var(--teal-600)',
                    borderRadius: '50%', border: '4px solid white',
                    boxShadow: '0 0 0 4px var(--teal-200)',
                }} />
            </div>

            {/* Closing banner "Kini" */}
            <div style={{
                background: 'var(--teal-950)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px 36px',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 32,
                alignItems: 'center',
            }}>
                <div>
                    <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--teal-300)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 6, height: 6, background: 'var(--teal-400)', borderRadius: '50%' }} />
                        Kini · Kota Smart &amp; Berbudaya
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'white', marginBottom: 10 }}>
                        Purbalingga Hari Ini
                    </h3>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,.7)', lineHeight: 1.7, maxWidth: 460 }}>
                        Purbalingga terus bertransformasi menjadi kota modern berbasis smart city, dengan tetap mempertahankan kearifan lokal dan budaya Banyumasan yang kaya.
                    </p>
                </div>

                {/* Stats ringkas */}
                <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
                    {[
                        { num: '18',   label: 'Kecamatan' },
                        { num: '239',  label: 'Desa' },
                        { num: '920rb', label: 'Penduduk' },
                    ].map((s) => (
                        <div key={s.label} style={{
                            textAlign: 'center', padding: '14px 18px',
                            background: 'rgba(255,255,255,.07)',
                            border: '1px solid rgba(255,255,255,.1)',
                            borderRadius: 12,
                        }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--teal-300)', lineHeight: 1 }}>
                                {s.num}
                            </div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 6 }}>
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </FadeIn>
    );
}

function TabVisiMisi() {
    const misi = [
        'Pemberdayaan Ekonomi Lokal Melalui Pengembangan UMKM dan Modernisasi Sektor Pertanian',
        'Peningkatan Infrastruktur untuk Meningkatkan Konektivitas Ekonomi',
        'Digitalisasi Pelayanan Publik untuk Meningkatkan Efisiensi dan Transparansi',
        'Peningkatan Kualitas Pendidikan dan Kesehatan untuk Membangun SDM yang Unggul',
    ];
    return (
        <FadeIn>
            <div className="visi-misi-grid">
                <div className="visi-card visi-bg">
                    <div className="visi-card-icon"><i className="fas fa-eye" /></div>
                    <h3>Visi</h3>
                    <p className="visi-text"><b>"Akselerasi Pembangunan Kolaboratif untuk Purbalingga Mandiri dan Sejahtera"</b></p>
                    <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.15)' }}>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', lineHeight: 1.7 }}>Visi ini mencerminkan tekad Kabupaten Purbalingga untuk mewujudkan masyarakat yang sejahtera secara materiil dan spiritual.</p>
                    </div>
                </div>
                <div className="visi-card misi-bg">
                    <div className="visi-card-icon"><i className="fas fa-tasks" /></div>
                    <h3>Misi</h3>
                    <ul className="misi-list">
                        {misi.map((m, i) => (
                            <li key={i}><i className="fas fa-check-circle" /> {m}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </FadeIn>
    );
}

function TabPejabat() {
    const pejabat = [profilData.bupati, profilData.wakil];

    return (
        <>
            <style>{`
                /* ─── Grid: 2 kolom sejajar ─── */
                .pejabat-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }

                .pejabat-card {
                    background: white;
                    border-radius: var(--radius-lg, 24px);
                    overflow: hidden;
                    border: 1px solid var(--border, #dae2ef);
                    box-shadow: var(--shadow-md, 0 8px 32px rgba(64,114,175,.12));
                    transition: transform .2s, box-shadow .2s;
                }
                .pejabat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-lg, 0 20px 60px rgba(64,114,175,.16));
                }

                .pejabat-photo {
                    width: 100%;
                    aspect-ratio: 3/4;
                    overflow: hidden;
                    background: var(--teal-50, #eef3fa);
                }
                .pejabat-photo img {
                    width: 100%; height: 100%;
                    object-fit: cover;
                    display: block;
                    transition: transform .4s;
                }
                .pejabat-card:hover .pejabat-photo img { transform: scale(1.04); }

                .pejabat-info {
                    padding: 20px;
                }
                .pejabat-jabatan {
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    color: var(--teal-600, #4072af);
                    margin-bottom: 6px;
                }
                .pejabat-name {
                    font-family: var(--font-display, 'Playfair Display', Georgia, serif);
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--dark, #102d4d);
                    margin-bottom: 4px;
                    line-height: 1.2;
                }
                .pejabat-periode {
                    font-size: 12px;
                    color: var(--text-muted, #4d6888);
                    margin-bottom: 0;
                }
                .pejabat-desc {
                    font-size: 13px;
                    color: var(--text-muted, #4d6888);
                    margin-top: 12px;
                    line-height: 1.6;
                }

                /* ════════ TABLET (≤ 1024px) ════════ */
                @media (max-width: 1024px) {
                    .pejabat-grid { gap: 16px; }
                    .pejabat-name { font-size: 18px; }
                    .pejabat-info { padding: 16px; }
                }

                /* ════════ MOBILE (≤ 640px): tetap 2 kolom, lebih compact ════════ */
                @media (max-width: 640px) {
                    .pejabat-grid  { grid-template-columns: 1fr 1fr; gap: 12px; }
                    .pejabat-info  { padding: 12px; }
                    .pejabat-jabatan { font-size: 9.5px; letter-spacing: 1px; margin-bottom: 4px; }
                    .pejabat-name  { font-size: 10px; margin-bottom: 3px; }
                    .pejabat-periode { font-size: 7px; }
                    .pejabat-desc  { font-size: 8px; margin-top: 8px; line-height: 1.5;
                                     /* batasi baris agar tidak terlalu panjang di layar kecil */
                                     display: -webkit-box; -webkit-line-clamp: 4;
                                     -webkit-box-orient: vertical; overflow: hidden; }
                }

                /* ════════ SMALL MOBILE (≤ 380px) ════════ */
                @media (max-width: 380px) {
                    .pejabat-grid  { gap: 8px; }
                    .pejabat-info  { padding: 10px; }
                    .pejabat-jabatan { font-size: 9px; }
                    .pejabat-name  { font-size: 10px; }
                    .pejabat-periode { font-size: 7px; }
                    .pejabat-desc  { font-size: 8px; -webkit-line-clamp: 3; }
                }
            `}</style>

            <FadeIn>
                <div className="pejabat-grid">
                    {pejabat.map((p) => (
                        <div className="pejabat-card" key={p.nama}>
                            <div className="pejabat-photo">
                                <img src={p.foto} alt={p.nama} />
                            </div>
                            <div className="pejabat-info">
                                <div className="pejabat-jabatan">{p.jabatan}</div>
                                <div className="pejabat-name">{p.nama}</div>
                                <div className="pejabat-periode">{p.periode}</div>
                                <p className="pejabat-desc">{p.deskripsi}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </FadeIn>
        </>
    );
}

function MengenalSection() {
    return (
        <section className="mengenal-section section" id="mengenal">
            <div className="container">
                <FadeIn>
                    <div className="mengenal-card">
                        {/* Kiri: Mini Map */}
                        <div className="mengenal-left" style={{ padding: 0, overflow: 'hidden', position: 'relative', minHeight: 480 }}>
                            <MiniMap />
                            <div style={{ 
                                position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 500, 
                                background: 'linear-gradient(to top, rgba(10,29,61,.95) 0%, rgba(10,29,61,.6) 50%, transparent 100%)', 
                                padding: '40px 28px 24px' 
                            }}>
                                <div style={{ 
                                    fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', 
                                    color: 'white', fontWeight: 700, marginBottom: 8,
                                    display: 'flex', alignItems: 'center', gap: 8
                                }}>
                                    <div style={{ width: 20, height: 1, background: 'white' }} />
                                    Smart City
                                    <div style={{ width: 20, height: 1, background: 'white' }} />
                                </div>
                                <div style={{ 
                                    fontFamily: 'var(--font-display)', 
                                    fontSize: 'clamp(16px, 2.5vw, 22px)',  // ← responsive, tidak nabrak
                                    color: 'white', fontWeight: 700, marginBottom: 12,
                                    lineHeight: 1.3,
                                    textShadow: '0 2px 12px rgba(0,0,0,.5)'  // ← shadow biar lebih terbaca
                                }}>
                                    Purbalingga Digital & Terhubung
                                </div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                                    {[['fa-video','CCTV Live'],['fa-map','Peta Informasi'],['fa-bell','Notifikasi']].map(([ico, lbl]) => (
                                        <div key={lbl} style={{ 
                                            display: 'flex', alignItems: 'center', gap: 6, 
                                            background: 'rgba(255,255,255,.1)', 
                                            padding: '6px 10px', borderRadius: 6, 
                                            backdropFilter: 'blur(8px)',
                                            border: '1px solid rgba(255,255,255,.12)'
                                        }}>
                                            <i className={`fas ${ico}`} style={{ color: 'var(--teal-300)', fontSize: 11 }} />
                                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.85)', fontWeight: 500 }}>{lbl}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Link to="/peta" style={{ position: 'absolute', inset: 0, zIndex: 600, cursor: 'pointer' }} title="Buka Peta Selengkapnya" />
                        </div>

                        {/* Kanan: Teks */}
                        <div className="mengenal-right">
                            <div className="section-label"><i className="fas fa-map-marked-alt" /> Kenali Lebih Dekat</div>
                            <h2 className="mengenal-right-title">Purbalingga<br />Smart City</h2>
                            <p className="mengenal-right-desc">Platform Smart City Purbalingga mengintegrasikan berbagai layanan dan informasi kota dalam satu ekosistem digital yang cerdas dan mudah diakses.</p>
                            <p className="mengenal-right-desc" style={{ marginBottom: 32 }}>Dari Gua Lawa yang eksotis hingga Owabong yang populer, dari kuliner soto kriyik hingga industri bulu mata kelas dunia, semua ada di Purbalingga.</p>
                            <Link to="/peta" className="btn btn-primary"><i className="fas fa-map" /> Lihat Peta Selengkapnya</Link>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}

function WisataSection() {
    const [wisataPreview, setWisataPreview] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Karena kamu pakai 'api' dari axios.js, baseURL biasanya sudah ada /api
        // Jadi cukup tulis '/wisata' saja
        api.get('/wisata')
            .then(res => {
                // Pastikan struktur response Laravel kamu benar (res.data atau res.data.data)
                const data = res.data.data || res.data;
                setWisataPreview(data.slice(0, 6));
                setLoading(false);
            })
            .catch(err => {
                console.error("Gagal ambil data wisata:", err);
                setLoading(false);
            });
    }, []);

    return (
        <section className="wisata-section section" id="wisata">
            <div className="container">
                <FadeIn>
                    <div className="section-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
                        <div>
                            <div className="section-label"><i className="fas fa-mountain" /> Pariwisata</div>
                            <h2 className="section-title">Destinasi Wisata Unggulan</h2>
                            <p className="section-desc">Jelajahi keindahan alam dan budaya Purbalingga.</p>
                        </div>
                        <Link to="/wisata" className="btn btn-outline" style={{ flexShrink: 0 }}>
                            Lihat Semua <i className="fas fa-arrow-right" />
                        </Link>
                    </div>
                </FadeIn>

                <div className="wisata-grid">
                    {loading ? (
                        <p>Memuat data wisata...</p>
                    ) : wisataPreview.length > 0 ? (
                        // GANTI 'wisataData' MENJADI 'wisataPreview'
                        wisataPreview.map((w) => (
                            <FadeIn key={w.id}>
                                <WisataCard w={w} />
                            </FadeIn>
                        ))
                    ) : (
                        <p>Tidak ada data wisata.</p>
                    )}
                </div>
            </div>
        </section>
    );
}

// ═══════════════════════════════════════════════════════════════
// BERITA
// ═══════════════════════════════════════════════════════════════
function BeritaSection() {
    const [berita, setBerita] = useState([]);
    const [filter, setFilter] = useState('semua');
    const [loading, setLoading] = useState(true);
    const BASE_IMAGE_URL = 'https://apismartcity.qode.my.id/storage/';

    useEffect(() => {
        api.get('/berita')
            .then(res => {
                setBerita(res.data.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filters = [
        { key: 'semua',     label: 'Semua Berita' },
        { key: 'kecamatan', label: 'Berita Kecamatan' },
        { key: 'desa',      label: 'Berita Desa' },
    ];

    const featured = berita.find((b) => b.featured === 1 || b.featured === true);
    const filtered = berita.filter((b) => {
        const isFeatured = Number(b.featured) === 1;
        return !isFeatured && (filter === 'semua' || b.kategori === filter);
    });
    return (
        <section className="berita-section section" id="berita">
            <div className="container">
                <FadeIn>
                    <div className="section-header">
                        <div className="section-label"><i className="fas fa-newspaper" /> Informasi Terkini</div>
                        <h2 className="section-title">Berita Purbalingga</h2>
                    </div>
                </FadeIn>

                <FadeIn>
                    <div className="berita-filter">
                        {filters.map((f) => (
                            <button key={f.key} className={`filter-btn${filter === f.key ? ' active' : ''}`} onClick={() => setFilter(f.key)}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                </FadeIn>

                <div className="berita-grid">
                    {featured && (
                        <FadeIn>
                            <Link to={`/berita/${featured.slug}`} className="berita-featured" style={{ textDecoration: 'none', display: 'block' }}>
                                {/* ↓ Ubah aspect ratio gambar jadi lebih kecil */}
                                <img
                                    src={`${BASE_IMAGE_URL}${featured.thumbnail}`}
                                    alt={featured.judul}
                                    className="berita-featured-img"
                                    style={{ aspectRatio: '16/5', objectFit: 'cover' }}
                                />
                                <div className="berita-featured-body">
                                    <span className={`berita-tag tag-${featured.kategori}`}>
                                        <i className="fas fa-tag" /> {featured.kategori}
                                    </span>
                                    <h3 className="berita-featured-title">{featured.judul}</h3>
                                    <p className="berita-featured-desc">
                                        {featured.konten.substring(0, 150)}...
                                    </p>
                                    <div className="berita-meta">
                                        <div className="berita-meta-item">
                                            <i className="fas fa-calendar" /> {new Date(featured.published_at).toLocaleDateString('id-ID')}
                                        </div>
                                        <div className="berita-meta-item"><i className="fas fa-user" /> {featured.penulis}</div>
                                        <div className="berita-meta-item"><i className="fas fa-eye" /> {featured.views.toLocaleString('id-ID')} dibaca</div>
                                    </div>
                                </div>
                            </Link>
                        </FadeIn>
                    )}

                    <FadeIn>
                        <div className="berita-list">
                            {/* ↓ Maksimal 3 berita di sidebar */}
                            {filtered.slice(0, 3).map((b) => (
                                <Link to={`/berita/${b.slug}`} key={b.id} className="berita-item" style={{ textDecoration: 'none' }}>
                                    <img src={`${BASE_IMAGE_URL}${b.thumbnail}`} alt={b.judul} className="berita-item-img" />
                                    <div className="berita-item-body">
                                        <span className={`berita-tag tag-${b.kategori}`} style={{ display: 'inline-flex', marginBottom:'5px' }}>
                                            {b.kategori}
                                        </span>
                                        <div className="berita-item-title" style={{marginBottom:'10px'}}>{b.judul}</div>
                                        <div className="berita-item-meta">
                                            <i className="fas fa-calendar" /> {new Date(b.published_at).toLocaleDateString('id-ID')}
                                            &nbsp;·&nbsp;
                                            <i className="fas fa-eye" /> {b.views.toLocaleString('id-ID')} dibaca
                                        </div>
                                    </div>
                                </Link>
                            ))}

                            {/* ↓ Tombol full width dengan hover effect */}
                            <Link
                                to="/berita"
                                className="berita-lihat-semua-btn"
                            >
                                <i className="fas fa-newspaper" />
                                Lihat Semua Berita
                                <i className="fas fa-arrow-right" style={{ marginLeft: 'auto' }} />
                            </Link>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
}

// ═══════════════════════════════════════════════════════════════
// PELAYANAN
// ═══════════════════════════════════════════════════════════════
function PelayananSection() {
    const [pelayananList, setPelayananList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/pelayanan')
            .then(res => {
                setPelayananList(res.data.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Gagal fetch pelayanan di Home:', err);
                setLoading(false);
            });
    }, []);

    // ✅ Fix: pakai pelayananList (dari API), bukan pelayananData (mock)
    const visible = pelayananList.slice(0, 8);

    return (
        <section className="pelayanan-section section" id="pelayanan">
            <div className="container">
                <FadeIn>
                    <div className="section-header centered">
                        <div className="section-label" style={{ justifyContent: 'center' }}>
                            <i className="fas fa-hands-helping" /> Layanan Digital
                        </div>
                        <h2 className="section-title">Pelayanan Publik Digital</h2>
                        <p className="section-desc">
                            Akses berbagai layanan pemerintah Purbalingga secara online, mudah, cepat, dan transparan.
                        </p>
                    </div>
                </FadeIn>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        <i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }} />
                        Memuat layanan...
                    </div>
                ) : (
                    <>
                        <div className="pelayanan-grid">
                            {visible.map(p => (
                                <FadeIn key={p.id}>
                                    <PelayananCard data={p} />
                                </FadeIn>
                            ))}
                        </div>

                        {pelayananList.length > 8 && (
                            <FadeIn>
                                <div style={{ textAlign: 'center', marginTop: 36 }}>
                                    <Link to="/pelayanan" className="btn btn-outline">
                                        Lihat Semua Layanan ({pelayananList.length})&nbsp;
                                        <i className="fas fa-arrow-right" />
                                    </Link>
                                </div>
                            </FadeIn>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}

// ═══════════════════════════════════════════════════════════════
// EVENT
// ═══════════════════════════════════════════════════════════════
function EventSection() {
    const [eventList, setEventList] = useState([]);
    const [loading,   setLoading]   = useState(true);
    
    useEffect(() => {
        api.get('/events')
            .then(res => {
                const raw = Array.isArray(res.data) ? res.data : (res.data.data ?? []);
                const now = new Date();
 
                // Hanya event published yang belum lewat, max 4 card
                const normalized = raw
                    .filter(e =>
                        e.status === 'published' &&
                        e.tanggal_mulai &&
                        new Date(e.tanggal_mulai) >= now
                    )
                    .sort((a, b) => new Date(a.tanggal_mulai) - new Date(b.tanggal_mulai))
                    .slice(0, 4)
                    .map(e => {
                        const jam = [e.jam_mulai, e.jam_selesai]
                            .filter(Boolean)
                            .map(t => t.slice(0, 5).replace(':', '.'))
                            .join(' - ') + ' WIB';
 
                        const gambar = e.thumbnail
                            ? e.thumbnail.startsWith('http')
                                ? e.thumbnail
                                : `${import.meta.env.VITE_APP_URL ?? 'https://apismartcity.qode.my.id'}/storage/event/${e.thumbnail}`
                            : 'https://placehold.co/640x480?text=No+Image';
 
                        return {
                            id:            e.id,
                            slug:          e.slug,
                            nama:          e.nama,
                            kategori:      e.kategori,
                            penyelenggara: e.penyelenggara ?? '-',
                            tanggal:       e.tanggal_mulai,
                            jam,
                            lokasi:        e.lokasi ?? '-',
                            gambar,
                        };
                    });
 
                setEventList(normalized);
            })
            .catch(err => {
                console.error('Gagal fetch event di Home:', err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);
    
    return (
        <section className="event-section section" id="event">
            <div className="container">
                <FadeIn>
                    <div className="section-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
                        <div>
                            <div className="section-label"><i className="fas fa-calendar-alt" /> Agenda Kota</div>
                            <h2 className="section-title">Event & Agenda Purbalingga</h2>
                            <p className="section-desc">Festival budaya, acara pemerintahan, dan kegiatan wisata terkini.</p>
                        </div>
                        <Link to="/event" className="btn btn-outline" style={{ flexShrink: 0, borderColor: 'rgba(255,255,255,.3)', color: 'rgba(255,255,255,.8)' }}>
                            Kalender Lengkap <i className="fas fa-arrow-right" />
                        </Link>
                    </div>
                </FadeIn>

                {loading ? (
                    /* Skeleton 4 card */
                    <div className="event-grid">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} style={{
                                borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                                background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                                animation: 'skPulse 1.4s ease-in-out infinite',
                                animationDelay: `${i * .1}s`,
                            }}>
                                <div style={{ width: '100%', aspectRatio: '4/3', background: 'rgba(255,255,255,.08)' }} />
                                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div style={{ height: 11, width: '35%', borderRadius: 6, background: 'rgba(255,255,255,.1)' }} />
                                    <div style={{ height: 15, width: '85%', borderRadius: 6, background: 'rgba(255,255,255,.1)' }} />
                                    <div style={{ height: 15, width: '65%', borderRadius: 6, background: 'rgba(255,255,255,.1)' }} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
                                        {[80, 65, 55].map((w, j) => (
                                            <div key={j} style={{ height: 10, width: `${w}%`, borderRadius: 6, background: 'rgba(255,255,255,.08)' }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <style>{`@keyframes skPulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
                    </div>
                ) : eventList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,.5)' }}>
                        <i className="fas fa-calendar-times" style={{ fontSize: 36, marginBottom: 12, display: 'block' }} />
                        Belum ada event yang akan datang.
                    </div>
                ) : (
                    <div className="event-grid">
                        {eventList.map(e => (
                            <FadeIn key={e.id}>
                                <EventCard event={e} />
                            </FadeIn>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

// ═══════════════════════════════════════════════════════════════
// PENGUMUMAN
// ═══════════════════════════════════════════════════════════════
// Ganti seluruh fungsi PengumumanSection di Home.jsx dengan ini
// Pastikan sudah import PengumumanCard di bagian atas Home.jsx:
//   import PengumumanCard from '../components/PengumumanCard';

// Ganti fungsi PengumumanSection di Home.jsx dengan kode ini.
// Import di bagian atas Home.jsx sudah benar (PengumumanCard & api sudah ada).

function PengumumanSection() {
    const [pengumumanList, setPengumumanList] = useState([]);
    const [loading, setLoading] = useState(true);

    const isExpired = (tanggal_berakhir) => {
        if (!tanggal_berakhir) return false;
        return new Date(tanggal_berakhir) < new Date();
    };

    useEffect(() => {
        api.get('/pengumuman')
            .then(res => {
                const data = res.data.data;
                const sorted = [...data].sort((a, b) => {
                    const aExpired = isExpired(a.tanggal_berakhir);
                    const bExpired = isExpired(b.tanggal_berakhir);
                    if (!aExpired && bExpired) return -1;
                    if (aExpired && !bExpired) return 1;
                    const tA = new Date(a.tanggal || a.tanggal_mulai);
                    const tB = new Date(b.tanggal || b.tanggal_mulai);
                    if (tB - tA !== 0) return tB - tA;
                    const weight = { mendesak: 3, sedang: 2, umum: 1 };
                    return (weight[b.prioritas] || 0) - (weight[a.prioritas] || 0);
                });
                setPengumumanList(sorted.slice(0, 3));
                setLoading(false);
            })
            .catch(err => {
                console.error("Gagal fetch pengumuman di Home:", err);
                setLoading(false);
            });
    }, []);

    return (
        <section className="pengumuman-section section" id="pengumuman">
            <div className="container">
                <FadeIn>
                    <div className="section-header" style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 16,
                        marginBottom: 40,
                    }}>
                        <div>
                            <div className="section-label"><i className="fas fa-bullhorn" /> Informasi Penting</div>
                            <h2 className="section-title">Pengumuman Terbaru</h2>
                            <p className="section-desc">
                                Informasi resmi dari Pemerintah Kabupaten Purbalingga yang perlu Anda ketahui.
                            </p>
                        </div>
                        <Link to="/pengumuman" className="btn btn-outline" style={{ flexShrink: 0 }}>
                            Semua Pengumuman <i className="fas fa-arrow-right" />
                        </Link>
                    </div>
                </FadeIn>

                {/* Layout: list kiri + sidebar kanan, collapse 1 kolom di mobile */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) 300px',
                    gap: 28,
                    alignItems: 'start',
                }}>
                    {/* ── Daftar pengumuman ── */}
                    <FadeIn>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                                <i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }} />
                                Memuat pengumuman...
                            </div>
                        ) : pengumumanList.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                                <i className="fas fa-bullhorn" style={{ fontSize: 32, marginBottom: 12, display: 'block', color: 'var(--teal-200)' }} />
                                Belum ada pengumuman.
                            </div>
                        ) : (
                            <div className="pengumuman-full-list">
                                {pengumumanList.map((p, i) => (
                                    <PengumumanCard key={p.id} p={p} index={i} />
                                ))}
                            </div>
                        )}
                    </FadeIn>

                    {/* ── Sidebar ── */}
                    <FadeIn>
                        <div style={{
                            background: 'linear-gradient(135deg, var(--teal-600), var(--teal-800))',
                            padding: 24,
                            borderRadius: 16,
                            color: 'white',
                        }}>
                            <i className="fas fa-headset" style={{ fontSize: 24, marginBottom: 12, display: 'block' }} />
                            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Pusat Pengaduan</div>
                            <p style={{ fontSize: 13, opacity: 0.9, marginBottom: 20 }}>
                                Ada laporan atau pengaduan? Kami siap membantu 24 jam.
                            </p>
                            <a
                                href="https://lapor.go.id"
                                target="_blank"
                                rel="noreferrer"
                                className="btn"
                                style={{ background: 'white', color: 'var(--teal-700)', width: '100%', justifyContent: 'center' }}
                            >
                                Lapor Sekarang
                            </a>
                        </div>
                    </FadeIn>
                </div>
            </div>

            {/* ── Responsive inline style ── */}
            <style>{`
                @media (max-width: 768px) {
                    #pengumuman .container > div:last-child {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </section>
    );
}

// ═══════════════════════════════════════════════════════════════
// STATISTIK
// ═══════════════════════════════════════════════════════════════
function StatistikSection() {
    const [ringkasan, setRingkasan] = useState([]);
    const [visual, setVisual] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/statistik-purbalingga')
            .then(res => {
                if (res.data.success) {
                    setRingkasan(res.data.data.statistik_ringkasan);
                    setVisual(res.data.data.statistik_visual);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Gagal mengambil data statistik:", err);
                setLoading(false);
            });
    }, []);

    const getVal = (label) => {
        const item = ringkasan.find(i => i.label === label);
        return item ? `${item.nilai}` : '-';
    };

    const cards = [
        { icon: 'fa-users',          num: getVal('Jumlah Penduduk'),       label: 'Jumlah Penduduk' },
        { icon: 'fa-map',            num: getVal('Kepadatan Penduduk'),     label: 'Kepadatan Penduduk' },
        { icon: 'fa-th-large',       num: getVal('Jumlah Kecamatan'),      label: 'Jumlah Kecamatan' },
        { icon: 'fa-home',           num: getVal('Jumlah Desa/Kelurahan'), label: 'Jumlah Desa/Kelurahan' },
        { icon: 'fa-ruler-combined', num: getVal('Luas Wilayah'),          label: 'Luas Wilayah' },
        { icon: 'fa-chart-line',     num: getVal('IPM Purbalingga'),       label: 'IPM Purbalingga' },
        { icon: 'fa-coins',          num: getVal('PDRB Per Kapita'),       label: 'PDRB Per Kapita' },
        { icon: 'fa-briefcase',      num: getVal('Angkatan Kerja'),        label: 'Angkatan Kerja' },
    ];

    const getChartData = (judul) => {
        const chart = visual.find(v => v.judul === judul);
        return chart ? chart.data_json : [];
    };

    if (loading) {
        return <div className="text-center py-20 text-white">Memuat data statistik...</div>;
    }

    return (
        <section className="statistik-section section" id="statistik">
            <style>{`
                .statistik-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 32px;
                }

                /* Tablet: 4 kolom tetap, tapi card lebih compact */
                @media (max-width: 900px) {
                    .statistik-grid {
                        grid-template-columns: repeat(4, 1fr);
                        gap: 12px;
                    }
                }

                /* Mobile: 3 kolom */
                @media (max-width: 640px) {
                    .statistik-grid {
                        grid-template-columns: repeat(3, 1fr);
                        gap: 10px;
                    }

                    .statistik-card {
                        padding: 14px 8px !important;
                    }

                    .statistik-icon {
                        
                        width: 36px !important;
                        height: 36px !important;
                        font-size: 14px !important;
                        margin-bottom: 8px !important;
                    }

                    .statistik-icon i {
                        margin-right:-60px;
                        font-size: 14px !important;
                    }

                    .statistik-num {
                        font-size: 15px !important;
                        margin-bottom: 4px !important;
                    }

                    .statistik-label {
                        font-size: 10px !important;
                        line-height: 1.3 !important;
                    }

                    .statistik-charts {
                        grid-template-columns: 1fr !important;
                        gap: 16px !important;
                    }
                }

                /* Sangat kecil: tetap 3 kolom tapi lebih mungil */
                @media (max-width: 380px) {
                    .statistik-grid {
                        gap: 8px;
                    }
                    .statistik-num {
                        font-size: 13px !important;
                    }
                    .statistik-label {
                        font-size: 9px !important;
                    }
                    .statistik-icon i{
                        margin-right:-35px;}
                    }
            `}</style>

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <FadeIn>
                    <div className="section-header">
                        <div className="section-label"><i className="fas fa-chart-bar" /> Data BPS & Pemkab</div>
                        <h2 className="section-title">Statistik Kota Purbalingga</h2>
                        <p className="section-desc">Data dan statistik resmi berdasarkan Badan Pusat Statistik dan sumber pemerintah.</p>
                    </div>
                </FadeIn>

                <div className="statistik-grid">
                    {cards.map((c) => (
                        <FadeIn key={c.label}>
                            <div className="statistik-card">
                                <div className="statistik-icon"><i className={`fas ${c.icon}`} /></div>
                                <div className="statistik-num">{c.num}</div>
                                <div className="statistik-label">{c.label}</div>
                            </div>
                        </FadeIn>
                    ))}
                </div>

                <FadeIn>
                    <div className="statistik-charts">
                        {[
                            { title: 'Tingkat Pendidikan',   icon: 'fa-graduation-cap', data: getChartData('Tingkat Pendidikan') },
                            { title: 'Sektor Ekonomi Utama', icon: 'fa-industry',        data: getChartData('Sektor Ekonomi Utama') }
                        ].map((chart) => (
                            <div className="statistik-chart-card" key={chart.title}>
                                <div className="chart-title">
                                    <i className={`fas ${chart.icon}`} style={{ color: 'var(--teal-300)', marginRight: 8 }} />
                                    {chart.title}
                                </div>
                                <div className="chart-bar-list">
                                    {chart.data.length > 0 ? chart.data.map((row, idx) => (
                                        <div className="chart-bar-item" key={idx}>
                                            <div className="chart-bar-header">
                                                <span>{row.label}</span>
                                                <span>{row.pct}%</span>
                                            </div>
                                            <div className="chart-bar-track">
                                                <div
                                                    className="chart-bar-fill"
                                                    style={{ width: `${row.pct}%`, background: row.color }}
                                                />
                                            </div>
                                        </div>
                                    )) : <p className="text-white opacity-50">Data tidak tersedia</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </FadeIn>

                <FadeIn>
                    <div style={{ textAlign: 'center', marginTop: 40 }}>
                        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, marginBottom: 16 }}>
                            <i className="fas fa-info-circle" /> Data diperbarui berdasarkan BPS Kabupaten Purbalingga — Realtime 2026
                        </p>
                        <a href="https://purbalinggakab.bps.go.id" target="_blank" rel="noreferrer" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,.3)', color: 'rgba(255,255,255,.8)' }}>
                            <i className="fas fa-chart-line" /> Lihat Data Lengkap BPS
                        </a>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}

// ═══════════════════════════════════════════════════════════════
// HOME (compose semua section)
// ═══════════════════════════════════════════════════════════════
export default function Home() {
    return (
        <>
            <HeroSection />
            <ProfilSection />
            <MengenalSection />
            <WisataSection />
            <BeritaSection />
            <PelayananSection />
            <EventSection />
            <PengumumanSection />
            <StatistikSection />
        </>
    );
}
