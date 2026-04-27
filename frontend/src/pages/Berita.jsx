// src/pages/Berita.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const formatTanggal = (str) => {
    if (!str) return '---';
    return new Date(str).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const KATEGORI = ['Semua', 'kecamatan', 'desa'];
const SORT_OPTIONS = [
    { value: 'terbaru',    label: 'Terbaru'    },
    { value: 'terpopuler', label: 'Terpopuler' },
];

const styles = `
    /* ── Responsive Grid ── */
    .berita-grid-full {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
    }

    /* Tablet: 2 kolom */
    @media (max-width: 1024px) {
        .berita-grid-full {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
        }
    }

    /* Mobile: 1 kolom */
    @media (max-width: 600px) {
        .berita-grid-full {
            grid-template-columns: 1fr;
            gap: 14px;
        }
    }

    /* ── Card Lebih Compact ── */
    .berita-card-full {
        display: flex;
        flex-direction: column;
        border-radius: 10px;
        overflow: hidden;
        background: #fff;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        text-decoration: none;
        color: inherit;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .berita-card-full:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.13);
    }

    .berita-card-full__img-wrap {
        position: relative;
        overflow: hidden;
        height: 170px;
    }

    @media (max-width: 600px) {
        .berita-card-full__img-wrap {
            height: 190px;
        }
    }

    .berita-card-full__img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }

    .berita-card-full:hover .berita-card-full__img {
        transform: scale(1.05);
    }

    .berita-card-full__body {
        padding: 14px 16px 16px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1;
    }

    .berita-card-full__title {
        font-size: 0.92rem;
        font-weight: 700;
        line-height: 1.4;
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .berita-card-full__excerpt {
        font-size: 0.78rem;
        color: #666;
        line-height: 1.5;
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .berita-card-full__meta {
        display: flex;
        gap: 12px;
        font-size: 0.72rem;
        color: #999;
        margin-top: auto;
        padding-top: 6px;
    }

    /* ── Toolbar Responsive ── */
    .page-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 28px;
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

    .page-sort-select {
        padding: 7px 12px;
        border-radius: 8px;
        border: 1.5px solid #ddd;
        font-size: 0.82rem;
        background: #fff;
        cursor: pointer;
    }

    @media (max-width: 600px) {
        .page-toolbar {
            flex-direction: column;
            align-items: flex-start;
        }

        .page-filter-tab {
            padding: 6px 12px;
            font-size: 0.78rem;
        }

        .page-sort-select {
            width: 100%;
        }
    }

    /* ── Featured Card Responsive ── */
    .berita-featured-full {
        position: relative;
        display: block;
        border-radius: 14px;
        overflow: hidden;
        text-decoration: none;
        color: inherit;
        height: 400px;
    }

    @media (max-width: 768px) {
        .berita-featured-full {
            height: 300px;
        }
    }

    @media (max-width: 480px) {
        .berita-featured-full {
            height: 240px;
        }
    }

    .berita-featured-full__img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .berita-featured-full__overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, transparent 100%);
    }

    .berita-featured-full__body {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 24px;
        color: #fff;
    }

    @media (max-width: 480px) {
        .berita-featured-full__body {
            padding: 16px;
        }
    }

    .berita-featured-full__title {
        font-size: 1.4rem;
        font-weight: 800;
        line-height: 1.3;
        margin: 8px 0;
    }

    @media (max-width: 768px) {
        .berita-featured-full__title {
            font-size: 1.1rem;
        }
    }

    @media (max-width: 480px) {
        .berita-featured-full__title {
            font-size: 0.98rem;
        }
    }

    .berita-featured-full__excerpt {
        font-size: 0.88rem;
        opacity: 0.88;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    @media (max-width: 480px) {
        .berita-featured-full__excerpt {
            display: none;
        }
    }

    .berita-featured-full__meta {
        display: flex;
        gap: 14px;
        font-size: 0.78rem;
        opacity: 0.8;
        margin-top: 10px;
    }

    /* ── Hero padding bawah agar ada jarak ke container ── */
    .page-hero-v2--berita {
        padding-bottom: 48px;
    }

    @media (max-width: 768px) {
        .page-hero-v2--berita {
            padding-bottom: 40px;
        }
    }

    @media (max-width: 480px) {
        .page-hero-v2--berita {
            padding-bottom: 32px;
        }
    }

    /* ── Container ── */
    .page-body {
        padding: 32px 16px 64px;
        margin-top: 0;
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

    /* ── Empty State ── */
    .page-empty {
        text-align: center;
        padding: 60px 20px;
        color: #aaa;
        font-size: 0.95rem;
    }

    /* ── Load More Button ── */
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

export default function Berita() {
    const [beritaList, setBeritaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [kategori, setKategori] = useState('Semua');
    const [sort, setSort] = useState('terbaru');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const PER_PAGE = 9;
    const BASE_IMAGE_URL = 'http://localhost:8000/storage/';

    useEffect(() => {
        setLoading(true);
        api.get('/berita')
            .then(res => {
                setBeritaList(res.data.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Gagal ambil berita:", err);
                setLoading(false);
            });
    }, []);

    const filtered = useMemo(() => {
        let data = [...beritaList];

        if (search.trim())
            data = data.filter(b => b.judul.toLowerCase().includes(search.toLowerCase()));

        if (kategori !== 'Semua')
            data = data.filter(b => b.kategori === kategori);

        if (sort === 'terbaru')
            data.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

        if (sort === 'terpopuler')
            data.sort((a, b) => (b.views || 0) - (a.views || 0));

        return data;
    }, [search, kategori, sort, beritaList]);

    const featured = filtered.find(b => b.featured == 1 || b.featured === true);
    const rest = featured ? filtered.filter(b => b.id !== featured.id) : filtered;
    const paginated = rest.slice(0, page * PER_PAGE);
    const hasMore = paginated.length < rest.length;

    if (loading) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loader">Memuat daftar berita...</div>
            </div>
        );
    }

    return (
        <>
            {/* Inject responsive styles */}
            <style>{styles}</style>

            <div className="page-berita">
                {/* ── Hero ── */}
                <div className="page-hero-v2 page-hero-v2--berita">
                    <div className="page-hero-v2__overlay" />
                    <div className="page-hero-v2__pattern" />
                    <div className="container page-hero-v2__content">
                        <div className="page-hero-v2__label">
                            <i className="fas fa-newspaper" /> Informasi Terkini
                        </div>
                        <h1 className="page-hero-v2__title">Berita Purbalingga</h1>
                        <div className="page-hero-v2__search">
                            <i className="fas fa-search page-hero-v2__search-icon" />
                            <input
                                type="text"
                                placeholder="Cari judul berita..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                                className="page-hero-v2__search-input"
                            />
                        </div>
                    </div>
                </div>

                <div className="container page-body">
                    {/* Toolbar */}
                    <div className="page-toolbar">
                        <div className="page-filter-tabs">
                            {KATEGORI.map(k => (
                                <button
                                    key={k}
                                    className={`page-filter-tab${kategori === k ? ' active' : ''}`}
                                    onClick={() => { setKategori(k); setPage(1); }}
                                >
                                    {k === 'Semua' ? 'Semua Berita' : `Berita ${k.charAt(0).toUpperCase() + k.slice(1)}`}
                                </button>
                            ))}
                        </div>
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

                    {/* Featured card */}
                    {featured && (
                        <Link
                            to={`/berita/${featured.slug}`}
                            className="berita-featured-full"
                            style={{ marginBottom: '32px', display: 'block' }}
                        >
                            <img
                                src={`${BASE_IMAGE_URL}${featured.thumbnail}`}
                                alt={featured.judul}
                                className="berita-featured-full__img"
                            />
                            <div className="berita-featured-full__overlay" />
                            <div className="berita-featured-full__body">
                                <span
                                    className={`berita-tag tag-${featured.kategori}`}
                                    style={{ background: 'white', fontWeight: 'bold' }}
                                >
                                    {featured.kategori}
                                </span>
                                <h2 className="berita-featured-full__title">{featured.judul}</h2>
                                <p className="berita-featured-full__excerpt">
                                    {featured.konten?.substring(0, 150)}...
                                </p>
                                <div className="berita-featured-full__meta">
                                    <span><i className="fas fa-calendar" /> {formatTanggal(featured.published_at)}</span>
                                    <span><i className="fas fa-eye" /> {featured.views?.toLocaleString('id-ID')} dibaca</span>
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* Grid */}
                    {filtered.length === 0 ? (
                        <div className="page-empty">
                            <p>Tidak ada berita ditemukan.</p>
                        </div>
                    ) : (
                        <>
                            <div className="berita-grid-full">
                                {paginated.map(b => (
                                    <Link to={`/berita/${b.slug}`} key={b.id} className="berita-card-full">
                                        <div className="berita-card-full__img-wrap">
                                            <img
                                                src={`${BASE_IMAGE_URL}${b.thumbnail}`}
                                                alt={b.judul}
                                                className="berita-card-full__img"
                                            />
                                            <span
                                                className={`berita-tag tag-${b.kategori}`}
                                                style={{ position: 'absolute', top: 10, left: 10, background: 'white', fontWeight: 'bold' }}
                                            >
                                                {b.kategori}
                                            </span>
                                        </div>
                                        <div className="berita-card-full__body">
                                            <h3 className="berita-card-full__title">{b.judul}</h3>
                                            <p className="berita-card-full__excerpt">
                                                {b.konten?.substring(0, 100)}...
                                            </p>
                                            <div className="berita-card-full__meta">
                                                <span><i className="fas fa-calendar" /> {formatTanggal(b.published_at)}</span>
                                                <span><i className="fas fa-eye" /> {b.views?.toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {hasMore && (
                                <div style={{ textAlign: 'center', marginTop: 40 }}>
                                    <button className="btn btn-outline" onClick={() => setPage(p => p + 1)}>
                                        Muat Lebih Banyak
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}