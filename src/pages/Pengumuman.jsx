// src/pages/Pengumuman.jsx
import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import PengumumanCard from '../components/PengumumanCard';

const PRIORITAS_LABEL  = { mendesak: 'Mendesak', sedang: 'Sedang', umum: 'Umum' };
const PRIORITAS_FILTER = ['Semua', 'mendesak', 'sedang', 'umum'];

const isExpired = (tanggal_berakhir) => {
    if (!tanggal_berakhir) return false;
    return new Date(tanggal_berakhir) < new Date();
};

const styles = `
    /* ── Hero padding bawah ── */
    .page-hero-v2--pengumuman {
        padding-bottom: 48px;
    }

    @media (max-width: 768px) {
        .page-hero-v2--pengumuman {
            padding-bottom: 40px;
        }
    }

    @media (max-width: 480px) {
        .page-hero-v2--pengumuman {
            padding-bottom: 32px;
        }
    }

    /* ── Container / page-body ── */
    .page-body {
        padding: 32px 16px 64px;
    }

    @media (max-width: 768px) {
        .page-body {
            padding: 24px 14px 56px;
        }
    }

    @media (max-width: 600px) {
        .page-body {
            padding: 20px 12px 48px;
        }
    }

    /* ── Toolbar ── */
    .page-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 20px;
    }

    .page-filter-tabs {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    .page-filter-tab {
        padding: 7px 16px;
        border-radius: 999px;
        border: 1.5px solid #ddd;
        background: transparent;
        font-size: 0.82rem;
        cursor: pointer;
        transition: all 0.18s;
        white-space: nowrap;
    }

    .page-filter-tab.active {
        background: #1e3a5f;
        color: #fff;
        border-color: #1e3a5f;
    }

    @media (max-width: 768px) {
        .page-filter-tab {
            padding: 6px 13px;
            font-size: 0.8rem;
        }
    }

    @media (max-width: 600px) {
        .page-toolbar {
            flex-direction: column;
            align-items: flex-start;
        }

        .page-filter-tab {
            padding: 5px 11px;
            font-size: 0.76rem;
        }
    }

    /* ── Toggle pills (Semua / Aktif / Berakhir) responsive ── */
    .pengumuman-toggle-wrap {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
    }

    @media (max-width: 600px) {
        .pengumuman-toggle-wrap {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
        }

        .pengumuman-toggle-wrap > div {
            width: 100%;
            justify-content: stretch;
        }

        .pengumuman-toggle-wrap > div button {
            flex: 1;
            text-align: center;
        }

        .penting-toggle {
            font-size: 0.8rem;
        }
    }

    /* ── Pengumuman layout (list + sidebar) ── */
    .pengumuman-full-grid {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 28px;
        align-items: start;
    }

    @media (max-width: 1024px) {
        .pengumuman-full-grid {
            grid-template-columns: 1fr;
        }

        .pengumuman-full-sidebar {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
        }
    }

    @media (max-width: 600px) {
        .pengumuman-full-grid {
            gap: 20px;
        }

        .pengumuman-full-sidebar {
            grid-template-columns: 1fr;
        }
    }

    /* ── Sidebar card ── */
    .pengumuman-sidebar-card {
        background: white;
        border-radius: 12px;
        border: 1px solid var(--border);
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }

    .pengumuman-sidebar-title {
        font-size: 13px;
        font-weight: 700;
        color: var(--dark);
        margin-bottom: 12px;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--border);
    }

    /* ── Page count ── */
    .page-count {
        font-size: 0.82rem;
        color: #888;
        margin-bottom: 16px;
        font-weight: 500;
    }

    /* ── Empty state ── */
    .page-empty {
        text-align: center;
        padding: 60px 20px;
        color: #aaa;
    }

    .page-empty i {
        font-size: 2.5rem;
        margin-bottom: 12px;
        display: block;
    }

    .page-empty p {
        font-size: 0.92rem;
        margin-bottom: 16px;
    }

    /* ── Button ── */
    .btn-outline {
        padding: 10px 32px;
        border: 2px solid #1e3a5f;
        border-radius: 999px;
        background: transparent;
        color: #1e3a5f;
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-outline:hover {
        background: #1e3a5f;
        color: #fff;
    }
`;

export default function Pengumuman() {
    const [pengumumanList, setPengumumanList] = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [prioritas,  setPrioritas]  = useState('Semua');
    const [search,     setSearch]     = useState('');
    const [penting,    setPenting]    = useState(false);
    const [tampilkan,  setTampilkan]  = useState('semua');

    useEffect(() => {
        setLoading(true);
        api.get('/pengumuman')
            .then(res => {
                setPengumumanList(res.data.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Gagal ambil pengumuman:", err);
                setLoading(false);
            });
    }, []);

    const filtered = useMemo(() => {
        let data = [...pengumumanList];

        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter(p =>
                (p.judul?.toLowerCase() || '').includes(q) ||
                (p.publisher?.toLowerCase() || '').includes(q)
            );
        }

        if (prioritas !== 'Semua') data = data.filter(p => p.prioritas === prioritas);
        if (penting) data = data.filter(p => Number(p.penting) === 1);

        if (tampilkan === 'aktif')    data = data.filter(p => !isExpired(p.tanggal_berakhir));
        if (tampilkan === 'berakhir') data = data.filter(p =>  isExpired(p.tanggal_berakhir));

        data.sort((a, b) => {
            const aExpired = isExpired(a.tanggal_berakhir);
            const bExpired = isExpired(b.tanggal_berakhir);
            if (!aExpired && bExpired) return -1;
            if (aExpired && !bExpired) return 1;
            const tA = new Date(a.tanggal);
            const tB = new Date(b.tanggal);
            if (tB - tA !== 0) return tB - tA;
            const weight = { mendesak: 3, sedang: 2, umum: 1 };
            return (weight[b.prioritas] || 0) - (weight[a.prioritas] || 0);
        });

        return data;
    }, [search, prioritas, penting, tampilkan, pengumumanList]);

    const jumlahAktif    = pengumumanList.filter(p => !isExpired(p.tanggal_berakhir)).length;
    const jumlahBerakhir = pengumumanList.filter(p =>  isExpired(p.tanggal_berakhir)).length;

    return (
        <>
            <style>{styles}</style>

            <div className="page-pengumuman">
                {/* ── Hero ── */}
                <div className="page-hero-v2 page-hero-v2--pengumuman">
                    <div className="page-hero-v2__overlay" />
                    <div className="page-hero-v2__pattern" />
                    <div className="page-hero-v2__deco">
                        {Array.from({ length: 25 }).map((_, i) => <span key={i} />)}
                    </div>
                    <div className="container page-hero-v2__content">
                        <div className="page-hero-v2__label">
                            <i className="fas fa-bullhorn" /> Informasi Resmi
                        </div>
                        <h1 className="page-hero-v2__title">Pengumuman Purbalingga</h1>
                        <p className="page-hero-v2__desc">
                            Informasi dan pengumuman resmi terbaru dari Pemerintah Kabupaten Purbalingga.
                        </p>
                        <div className="page-hero-v2__search">
                            <i className="fas fa-search page-hero-v2__search-icon" />
                            <input
                                type="text"
                                placeholder="Cari judul atau instansi..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="page-hero-v2__search-input"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="container page-body">

                    {/* Toolbar */}
                    <div className="page-toolbar">
                        <div className="page-filter-tabs">
                            {PRIORITAS_FILTER.map(p => (
                                <button
                                    key={p}
                                    className={`page-filter-tab${prioritas === p ? ' active' : ''}`}
                                    onClick={() => setPrioritas(p)}
                                >
                                    {p === 'Semua' ? 'Semua' : PRIORITAS_LABEL[p]}
                                </button>
                            ))}
                        </div>

                        <div className="pengumuman-toggle-wrap">
                            {/* Toggle Semua / Aktif / Berakhir */}
                            <div style={{
                                display: 'flex', background: 'var(--teal-50)', borderRadius: 50,
                                padding: 3, border: '1px solid var(--border)', gap: 2,
                            }}>
                                {[
                                    { key: 'semua',    label: 'Semua',          count: pengumumanList.length },
                                    { key: 'aktif',    label: 'Aktif',          count: jumlahAktif           },
                                    { key: 'berakhir', label: 'Sudah Berakhir', count: jumlahBerakhir        },
                                ].map(opt => (
                                    <button
                                        key={opt.key}
                                        onClick={() => setTampilkan(opt.key)}
                                        style={{
                                            padding: '6px 14px', borderRadius: 50, border: 'none',
                                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                            transition: 'all .2s', fontFamily: 'var(--font-body)',
                                            background: tampilkan === opt.key ? 'white' : 'transparent',
                                            color: tampilkan === opt.key ? 'var(--teal-700)' : 'var(--text-muted)',
                                            boxShadow: tampilkan === opt.key ? 'var(--shadow-sm)' : 'none',
                                        }}
                                    >
                                        {opt.label}
                                        <span style={{
                                            marginLeft: 5, fontSize: 10, fontWeight: 700,
                                            background: tampilkan === opt.key ? 'var(--teal-100)' : 'transparent',
                                            color: 'var(--teal-700)', borderRadius: 50, padding: '1px 6px',
                                        }}>{opt.count}</span>
                                    </button>
                                ))}
                            </div>

                            <label className="penting-toggle">
                                <input type="checkbox" checked={penting} onChange={e => setPenting(e.target.checked)} />
                                <span className="penting-toggle__track">
                                    <span className="penting-toggle__thumb" />
                                </span>
                                <span className="penting-toggle__label">
                                    <i className="fas fa-exclamation-circle" /> Hanya yang penting
                                </span>
                            </label>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                            <i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }} />
                            Memuat pengumuman...
                        </div>
                    ) : (
                        <>
                            <p className="page-count">{filtered.length} pengumuman ditemukan</p>

                            {filtered.length === 0 ? (
                                <div className="page-empty">
                                    <i className="fas fa-bullhorn" />
                                    <p>Tidak ada pengumuman yang sesuai.</p>
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => { setSearch(''); setPrioritas('Semua'); setPenting(false); setTampilkan('semua'); }}
                                    >Reset Filter</button>
                                </div>
                            ) : (
                                <div className="pengumuman-full-grid">
                                    <div className="pengumuman-full-list">
                                        {filtered.map((p, i) => (
                                            <PengumumanCard key={p.id} p={p} index={i} />
                                        ))}
                                    </div>

                                    <div className="pengumuman-full-sidebar">
                                        <div className="pengumuman-sidebar-card" style={{
                                            background: 'linear-gradient(135deg,var(--teal-600),var(--teal-800))',
                                            color: 'white', borderColor: 'transparent',
                                        }}>
                                            <div style={{ fontSize: 28, marginBottom: 16 }}><i className="fas fa-headset" /></div>
                                            <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 18 }}>Pusat Pengaduan</div>
                                            <p style={{ fontSize: 14, opacity: .85, lineHeight: 1.7, marginBottom: 24 }}>
                                                Ada laporan atau pengaduan? Kami siap membantu Anda 24 jam.
                                            </p>
                                            <a href="https://lapor.go.id" target="_blank" rel="noreferrer" className="btn" style={{
                                                background: 'rgba(255,255,255,.15)', color: 'white',
                                                border: '1px solid rgba(255,255,255,.3)', width: '100%',
                                                justifyContent: 'center',
                                            }}>
                                                <i className="fas fa-paper-plane" /> Lapor Mas Bupati
                                            </a>
                                        </div>

                                        <div className="pengumuman-sidebar-card">
                                            <div className="pengumuman-sidebar-title">
                                                <i className="fas fa-info-circle" style={{ color: 'var(--teal-500)', marginRight: 8 }} />
                                                Info Layanan
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
                                                <div style={{
                                                    width: 40, height: 40, background: 'var(--teal-50)',
                                                    borderRadius: 10, display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', flexShrink: 0,
                                                }}>
                                                    <i className="fas fa-envelope" style={{ color: 'var(--teal-600)' }} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>Email</div>
                                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>info@purbalinggakab.go.id</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}