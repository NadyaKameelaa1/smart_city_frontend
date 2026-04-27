// src/pages/Wisata.jsx
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import WisataCard from '../components/WisataCard';

const KATEGORI = ['Semua', 'Alam', 'Rekreasi', 'Budaya', 'Religi', 'Kuliner', 'Edukasi'];
const SORT_OPTIONS = [
    { value: 'rating', label: 'Rating Tertinggi' },
    { value: 'harga',  label: 'Harga Terendah'   },
    { value: 'nama',   label: 'Nama A–Z'          },
];

const styles = `
    /* ── Hero padding bawah ── */
    .page-hero-v2--wisata {
        padding-bottom: 48px;
    }

    @media (max-width: 768px) {
        .page-hero-v2--wisata {
            padding-bottom: 40px;
        }
    }

    @media (max-width: 480px) {
        .page-hero-v2--wisata {
            padding-bottom: 32px;
        }
    }

    /* ── Stats Strip Responsive ── */
    .page-stats-strip__inner {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0;
    }

    @media (max-width: 768px) {
        .page-stats-strip__inner {
            grid-template-columns: repeat(2, 1fr);
        }

        .page-stats-strip__item {
            padding: 10px 5px;
        }

        .page-stats-strip__num {
            font-size: 1.4rem;
        }

        .page-stats-strip__label {
            font-size: 0.72rem;
        }
    }

    @media (max-width: 480px) {
        .page-stats-strip__num {
            font-size: 1.25rem;
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

    /* ── Toolbar Responsive ── */
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

    .page-sort {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .page-sort i {
        color: #888;
        font-size: 0.85rem;
    }

    .page-sort-select {
        padding: 7px 12px;
        border-radius: 8px;
        border: 1.5px solid #ddd;
        font-size: 0.82rem;
        background: #fff;
        cursor: pointer;
    }

    @media (max-width: 768px) {
        .page-filter-tabs {
            gap: 6px;
        }
    }

    @media (max-width: 600px) {
        .page-toolbar {
            flex-direction: column;
            align-items: flex-start;
        }

        .page-filter-tab {
            padding: 6px 12px;
            font-size: 0.70rem;

        }

        .page-sort {
            width: 100%;
        }

        .page-sort-select {
            flex: 1;
            width: 100%;
        }
    }

    /* ── Wisata Grid Responsive ── */
    .wisata-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
    }

    @media (max-width: 1024px) {
        .wisata-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
        }
    }

    @media (max-width: 600px) {
        .wisata-grid {
            grid-template-columns: 1fr;
            gap: 14px;
        }
    }

    /* ── Page Count ── */
    .page-count {
        font-size: 0.82rem;
        color: #888;
        margin-bottom: 16px;
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

    /* ── Load More / Outline Button ── */
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

export default function Wisata() {
    const navigate = useNavigate();
    const [wisataData, setWisataData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [kategori, setKategori] = useState('Semua');
    const [sort, setSort] = useState('rating');
    const [search, setSearch] = useState('');

    useEffect(() => {
        api.get('/wisata')
            .then(res => {
                setWisataData(res.data.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Gagal fetch data:", err);
                setLoading(false);
            });
    }, []);

    const filtered = useMemo(() => {
        let data = [...wisataData];
        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter(w =>
                w.nama.toLowerCase().includes(q) || w.alamat_lengkap?.toLowerCase().includes(q)
            );
        }
        if (kategori !== 'Semua') data = data.filter(w => w.kategori === kategori);
        if (sort === 'rating') data.sort((a, b) => b.rating - a.rating);
        if (sort === 'harga')  data.sort((a, b) => a.harga_anak - b.harga_anak);
        if (sort === 'nama')   data.sort((a, b) => a.nama.localeCompare(b.nama));
        return data;
    }, [search, kategori, sort, wisataData]);

    const stats = [
        { num: wisataData.length,                                    label: 'Total Destinasi'  },
        { num: [...new Set(wisataData.map(w => w.kategori))].length, label: 'Kategori Wisata'  },
        { num: '18',                                                 label: 'Kecamatan'        },
        { num: '4.8',                                                label: 'Rata-rata Rating' },
    ];

    if (loading) return (
        <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
            Memuat destinasi wisata...
        </div>
    );

    return (
        <>
            <style>{styles}</style>

            <div className="page-wisata">
                {/* ── Hero ── */}
                <div className="page-hero-v2 page-hero-v2--wisata">
                    <div className="page-hero-v2__overlay" />
                    <div className="page-hero-v2__pattern" />
                    <div className="page-hero-v2__deco">
                        {Array.from({ length: 25 }).map((_, i) => <span key={i} />)}
                    </div>
                    <div className="container page-hero-v2__content">
                        <div className="page-hero-v2__label">
                            <i className="fas fa-mountain" /> Pariwisata
                        </div>
                        <h1 className="page-hero-v2__title">Destinasi Wisata Purbalingga</h1>
                        <p className="page-hero-v2__desc">
                            Jelajahi keindahan alam, budaya, dan kuliner Kabupaten Purbalingga yang memukau.
                        </p>
                        <div className="page-hero-v2__search">
                            <i className="fas fa-search page-hero-v2__search-icon" />
                            <input
                                type="text"
                                placeholder="Cari destinasi atau lokasi..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="page-hero-v2__search-input"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Stats Strip ── */}
                <div className="page-stats-strip">
                    <div className="container">
                        <div className="page-stats-strip__inner">
                            {stats.map(s => (
                                <div className="page-stats-strip__item" key={s.label}>
                                    <div className="page-stats-strip__num">{s.num}</div>
                                    <div className="page-stats-strip__label">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="container page-body">

                    {/* Toolbar */}
                    <div className="page-toolbar">
                        <div className="page-filter-tabs">
                            {KATEGORI.map(k => (
                                <button
                                    key={k}
                                    className={`page-filter-tab${kategori === k ? ' active' : ''}`}
                                    onClick={() => setKategori(k)}
                                >{k}</button>
                            ))}
                        </div>
                        <div className="page-sort">
                            <i className="fas fa-sort-amount-down" />
                            <select
                                value={sort}
                                onChange={e => setSort(e.target.value)}
                                className="page-sort-select"
                            >
                                {SORT_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <p className="page-count">{filtered.length} destinasi ditemukan</p>

                    {filtered.length === 0 ? (
                        <div className="page-empty">
                            <i className="fas fa-mountain" />
                            <p>Tidak ada destinasi yang cocok dengan filter.</p>
                            <button
                                className="btn btn-outline"
                                onClick={() => { setSearch(''); setKategori('Semua'); }}
                            >
                                Reset Filter
                            </button>
                        </div>
                    ) : (
                        <div className="wisata-grid">
                            {filtered.map(w => (
                                <WisataCard key={w.id} w={w} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}