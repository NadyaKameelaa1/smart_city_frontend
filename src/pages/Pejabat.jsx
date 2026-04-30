// src/pages/PejabatPage.jsx
import { useEffect, useRef } from 'react';
import { profilData } from '../data/mockData';

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
function FadeIn({ children }) {
    const ref = useFadeIn();
    return <div ref={ref} className="fade-in-up">{children}</div>;
}

// ── Data profil kabupaten ────────────────────────────────────
const PROFIL_PARAGRAF = [
    {
        icon: 'fa-map-marked-alt',
        color: '#0d9488',
        judul: 'Wilayah & Batas Daerah',
        isi: 'Kabupaten Purbalingga memiliki luas wilayah 7.777,64 km². Berbatasan dengan Kabupaten Pemalang di utara, Kabupaten Banjarnegara di timur dan selatan, serta Kabupaten Banyumas di barat. Populasi mencapai 848.952 jiwa berdasarkan Sensus Penduduk 2010.',
    },
    {
        icon: 'fa-industry',
        color: '#2563eb',
        judul: 'Industri & Investasi',
        isi: 'Purbalingga dikenal sebagai kabupaten yang pro-investasi. Puluhan industri PMA, sebagian besar dari Korea Selatan, berkembang di bidang pembuatan rambut dan bulu mata palsu. Ratusan plasma pendukung tumbuh dan meningkatkan pendapatan masyarakat.',
    },
    {
        icon: 'fa-hands',
        color: '#7c3aed',
        judul: 'Kerajinan Lokal',
        isi: 'Masyarakat Purbalingga mengembangkan berbagai kerajinan unggulan: pembuatan knalpot, gula kelapa, dan sapu glagah. Sektor pertanian tetap menjadi kontributor terbesar PDRB sebesar 31,98%, disusul perdagangan/hotel/restoran 18,51%, dan jasa 17,98%.',
    },
    {
        icon: 'fa-leaf',
        color: '#16a34a',
        judul: 'Agrikultur & Wisata',
        isi: 'Purbalingga merupakan sentra cabai dan stroberi di lereng Gunung Slamet. Sektor wisata buatan terus berkembang, ditandai kehadiran destinasi unggulan Owabong Water Park dan Sanggaluri Park yang menarik wisatawan dari berbagai daerah.',
    },
    {
        icon: 'fa-plane',
        color: '#d97706',
        judul: 'Posisi Strategis',
        isi: 'Berada di persimpangan jalan Purwokerto–Banjarnegara dan Purwokerto–Pemalang, posisi Purbalingga sangat strategis. Bersama Banyumas, Kebumen, Banjarnegara, dan Wonosobo, Pemkab mendorong pengembangan Lanud Wirasaba menjadi bandara komersial.',
    },
];

// ── Program kerja ────────────────────────────────────────────
const PROGRAM_KERJA = [
    {
        icon: 'fa-heartbeat',
        warna: '#ef4444',
        bg: '#fef2f2',
        border: '#fecaca',
        judul: 'Purbalingga Sehat',
        desc: 'Meningkatkan akses layanan kesehatan berkualitas bagi seluruh masyarakat melalui penguatan Puskesmas, posyandu, dan jaminan kesehatan daerah.',
    },
    {
        icon: 'fa-graduation-cap',
        warna: '#2563eb',
        bg: '#eff6ff',
        border: '#bfdbfe',
        judul: 'Purbalingga Cerdas',
        desc: 'Mewujudkan pendidikan merata dan berkualitas dengan beasiswa, bantuan sekolah, dan peningkatan sarana-prasarana sekolah di seluruh kecamatan.',
    },
    {
        icon: 'fa-road',
        warna: '#d97706',
        bg: '#fffbeb',
        border: '#fde68a',
        judul: 'Infrastruktur Merata',
        desc: 'Pembangunan dan perbaikan jalan desa, jembatan, irigasi, dan fasilitas publik guna menunjang konektivitas antar wilayah di seluruh Purbalingga.',
    },
    {
        icon: 'fa-store',
        warna: '#7c3aed',
        bg: '#f5f3ff',
        border: '#ddd6fe',
        judul: 'Ekonomi Kerakyatan',
        desc: 'Mendorong pertumbuhan UMKM, koperasi, dan industri rumahan melalui pelatihan, akses permodalan, dan perluasan pasar produk lokal Purbalingga.',
    },
    {
        icon: 'fa-seedling',
        warna: '#16a34a',
        bg: '#f0fdf4',
        border: '#bbf7d0',
        judul: 'Ketahanan Pangan',
        desc: 'Memperkuat sektor pertanian, perikanan, dan perkebunan melalui program modernisasi alsintan, pupuk bersubsidi, dan diversifikasi komoditas unggulan.',
    },
    {
        icon: 'fa-laptop-code',
        warna: '#0d9488',
        bg: '#f0fdfa',
        border: '#99f6e4',
        judul: 'Digitalisasi Layanan',
        desc: 'Transformasi digital layanan pemerintahan melalui Smart City, e-government, dan pemanfaatan teknologi informasi untuk efisiensi birokrasi daerah.',
    },
    {
        icon: 'fa-mountain',
        warna: '#0284c7',
        bg: '#f0f9ff',
        border: '#bae6fd',
        judul: 'Pariwisata Unggulan',
        desc: 'Pengembangan destinasi wisata, infrastruktur pariwisata, dan promosi daya tarik Purbalingga agar menjadi destinasi unggulan di Jawa Tengah.',
    },
    {
        icon: 'fa-shield-alt',
        warna: '#be123c',
        bg: '#fff1f2',
        border: '#fecdd3',
        judul: 'Tata Kelola Bersih',
        desc: 'Mewujudkan pemerintahan yang bersih, transparan, dan akuntabel melalui penguatan sistem pengawasan internal dan reformasi birokrasi daerah.',
    },
];

export default function PejabatPage() {
    const pemimpin = [profilData.bupati, profilData.wakil].filter(Boolean);

    return (
        <div className="page-pejabat">
            <style>{`
                /* ── Profil kabupaten grid ── */
                .profil-kab-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 56px;
                }

                /* ── Program kerja grid ── */
                .program-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 18px;
                    margin-bottom: 56px;
                }

                /* ── Pimpinan grid — selalu 2 kolom ── */
                .pejabat-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 28px;
                }

                /* ── Tablet ≤ 1024px ── */
                @media (max-width: 1024px) {
                    .profil-kab-grid  { grid-template-columns: repeat(2, 1fr); gap: 16px; }
                    .program-grid     { grid-template-columns: repeat(3, 1fr); gap: 16px; }
                }

                /* ── Mobile ≤ 768px ── */
                @media (max-width: 768px) {
                    .section-divider-badge {margin-top: 10px !important;}
                    .profil-kab-grid  { grid-template-columns: repeat(2, 1fr); gap: 12px; }
                    .program-grid     { grid-template-columns: repeat(2, 1fr); gap: 12px; }
                    /* pejabat tetap 2 kolom — tapi lebih compact */
                    .pejabat-grid     { grid-template-columns: repeat(2, 1fr); gap: 16px; }
                    .pejabat-card     { flex-direction: column !important; }
                    .pejabat-photo    { width: 100% !important; min-height: 50px; }
                    .pejabat-name     { font-size: 12px !important; }
                    .pejabat-jabatan  { font-size: 8px !important; }
                    .pejabat-info     { padding: 14px !important; }
                    .program-card-title { font-size: 13px !important; }
                    .program-card-desc  { font-size: 12px !important; }
                    .pejabat-periode {font-size:9px !important;}
                    p{font-size:9px !important;}
                }

                /* ── Small mobile ≤ 480px ── */
                @media (max-width: 480px) {
                    .section-divider-badge {margin-top: 10px !important;}
                    .profil-kab-grid  { grid-template-columns: 1fr; gap: 10px; }
                    .program-grid     { grid-template-columns: repeat(2, 1fr); gap: 10px; }
                    .profil-card-title { font-size: 13px !important; }
                    .profil-card-isi   { font-size: 12px !important; }
                    .program-card-title { font-size: 12px !important; }
                    .program-card-desc  { display: none; } /* hide desc di layar sangat kecil */
                    .program-card-icon-wrap { width: 36px !important; height: 36px !important; }
                    .program-card-icon-wrap i { font-size: 15px !important; }
                }

                /* ── Profil card ── */
                .profil-kab-card {
                    background: white;
                    border-radius: 16px;
                    border: 1px solid var(--border);
                    padding: 22px 20px;
                    box-shadow: var(--shadow-sm);
                    transition: transform .2s, box-shadow .2s;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .profil-kab-card:hover {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-md);
                }

                /* ── Program card ── */
                .program-card {
                    border-radius: 14px;
                    border: 1px solid;
                    padding: 20px 18px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    transition: transform .2s, box-shadow .2s;
                }
                .program-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 24px rgba(0,0,0,.09);
                }

                /* ── Divider label ── */
                .section-divider {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin-bottom: 24px;
                }
                .section-divider-line {
                    flex: 1;
                    height: 1.5px;
                    background: var(--border);
                }
                .section-divider-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 16px;
                    background: var(--teal-50);
                    border: 1px solid var(--teal-200);
                    border-radius: 50px;
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--teal-700);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    white-space: nowrap;
                }
            `}</style>

            {/* ── Hero ── */}
            <div className="page-hero-v2 page-hero-v2--pejabat">
                <div className="page-hero-v2__overlay" />
                <div className="page-hero-v2__pattern" />
                <div className="page-hero-v2__deco">
                    {Array.from({ length: 25 }).map((_, i) => <span key={i} />)}
                </div>
                <div className="container page-hero-v2__content">
                    <div className="page-hero-v2__label">
                        <i className="fas fa-user-tie" /> Pemerintahan
                    </div>
                    <h1 className="page-hero-v2__title">Profil Pejabat Daerah</h1>
                    <p className="page-hero-v2__desc">
                        Pemimpin dan pejabat yang mengabdi untuk Kabupaten Purbalingga yang maju dan sejahtera.
                    </p>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="container page-body">

                {/* ═══ PIMPINAN DAERAH ═══ */}
                <FadeIn>
                    <div className="section-divider">
                        <div className="section-divider-line" />
                        <div className="section-divider-badge">
                            <i className="fas fa-star" /> Pimpinan Daerah
                        </div>
                        <div className="section-divider-line" />
                    </div>
                    <div className="pejabat-grid" style={{ maxWidth: '100%', marginBottom: 56 }}>
                        {pemimpin.map(p => (
                            <div className="pejabat-card" key={p.nama}>
                                <div className="pejabat-photo">
                                    <img
                                        src={p.foto} alt={p.nama}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', aspectRatio: '3/2' }}
                                    />
                                </div>
                                <div className="pejabat-info">
                                    <div className="pejabat-jabatan">{p.jabatan}</div>
                                    <div className="pejabat-name">{p.nama}</div>
                                    <div className="pejabat-periode">{p.periode}</div>
                                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.6 }}>
                                        {p.deskripsi}
                                    </p>
                                    {p.visi && (
                                        <div style={{
                                            marginTop: 16, padding: '12px 16px',
                                            background: 'var(--teal-50)', borderRadius: 'var(--radius-md)',
                                            borderLeft: '3px solid var(--teal-500)'
                                        }}>
                                            <div style={{
                                                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                                                letterSpacing: 1, color: 'var(--teal-700)', marginBottom: 6
                                            }}>Visi</div>
                                            <div style={{ fontSize: 13, color: 'var(--text-dark)', lineHeight: 1.6, fontStyle: 'italic' }}>
                                                "{p.visi}"
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </FadeIn>

                {/* ═══ PROGRAM KERJA ═══ */}
                <FadeIn>
                    <div className="section-divider">
                        <div className="section-divider-line" />
                        <div className="section-divider-badge">
                            <i className="fas fa-tasks" /> Program Kerja
                        </div>
                        <div className="section-divider-line" />
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24, textAlign: 'center', maxWidth: 560, margin: '0 auto 28px' }}>
                        Program prioritas Bupati dan Wakil Bupati Purbalingga dalam mewujudkan Purbalingga yang maju, mandiri, dan berdaya saing.
                    </p>
                    <div className="program-grid">
                        {PROGRAM_KERJA.map((p) => (
                            <div
                                key={p.judul}
                                className="program-card"
                                style={{ background: p.bg, borderColor: p.border }}
                            >
                                <div
                                    className="program-card-icon-wrap"
                                    style={{ width: 44, height: 44, borderRadius: 12, background: p.warna + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                >
                                    <i className={`fas ${p.icon}`} style={{ color: p.warna, fontSize: 18 }} />
                                </div>
                                <div className="program-card-title" style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--dark)', lineHeight: 1.3 }}>
                                    {p.judul}
                                </div>
                                <div className="program-card-desc" style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                    {p.desc}
                                </div>
                            </div>
                        ))}
                    </div>
                </FadeIn>

                {/* ═══ PROFIL KABUPATEN ═══ */}
                <FadeIn>
                    <div className="section-divider">
                        <div className="section-divider-line" />
                        <div className="section-divider-badge">
                            <i className="fas fa-info-circle" /> Profil Kabupaten
                        </div>
                        <div className="section-divider-line" />
                    </div>

                    {/* Banner ringkas di atas kartu */}
                    <div style={{
                        background: 'linear-gradient(135deg, var(--teal-800), var(--teal-950))',
                        borderRadius: 16,
                        padding: '28px 32px',
                        marginBottom: 24,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 28,
                        flexWrap: 'wrap',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        {/* dot pattern */}
                        <div style={{ position: 'absolute', inset: 0, opacity: .05, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                        {[
                            { icon: 'fa-ruler-combined', val: '7.777,64 km²', label: 'Luas Wilayah' },
                            { icon: 'fa-users',           val: '848.952 jiwa', label: 'Jumlah Penduduk' },
                            { icon: 'fa-th-large',        val: '18 Kecamatan', label: 'Kecamatan' },
                            { icon: 'fa-home',            val: '239 Desa/Kel', label: 'Desa & Kelurahan' },
                        ].map((s) => (
                            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1, flex: '1 1 140px' }}>
                                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <i className={`fas ${s.icon}`} style={{ color: 'var(--teal-300)', fontSize: 16 }} />
                                </div>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: 'white', lineHeight: 1.1 }}>{s.val}</div>
                                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', marginTop: 3 }}>{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Kartu paragraf */}
                    <div className="profil-kab-grid">
                        {PROFIL_PARAGRAF.map((p) => (
                            <div className="profil-kab-card" key={p.judul}>
                                {/* Icon + judul */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 10, background: p.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <i className={`fas ${p.icon}`} style={{ color: p.color, fontSize: 15 }} />
                                    </div>
                                    <div
                                        className="profil-card-title"
                                        style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--dark)', lineHeight: 1.3 }}
                                    >
                                        {p.judul}
                                    </div>
                                </div>
                                {/* Garis aksen */}
                                <div style={{ height: 2, borderRadius: 99, background: `linear-gradient(90deg, ${p.color}, transparent)`, marginTop: 2 }} />
                                {/* Isi */}
                                <p className="profil-card-isi" style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                                    {p.isi}
                                </p>
                            </div>
                        ))}
                    </div>
                </FadeIn>

            </div>
        </div>
    );
}