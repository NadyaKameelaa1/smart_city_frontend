// src/pages/Event.jsx
import { useState, useMemo, useEffect } from 'react';
import EventCard from '../components/EventCard';
import api from '../api/axios';

const KATEGORI = ['Semua', 'Budaya', 'Olahraga', 'Pemerintahan', 'Pariwisata', 'Pendidikan', 'Hiburan', 'Lainnya'];

const styles = `
    /* ── Hero padding bawah ── */
    .page-hero-v2--event {
        padding-bottom: 48px;
    }

    @media (max-width: 768px) {
        .page-hero-v2--event {
            padding-bottom: 40px;
        }
    }

    @media (max-width: 480px) {
        .page-hero-v2--event {
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
        color: #fff !important;
        border-color: #1e3a5f;
    }

    @media (max-width: 768px) {
        .page-filter-tabs {
            gap: 6px;
        }

        .page-filter-tab {
            padding: 6px 13px;
            font-size: 0.8rem;
        }
    }

    @media (max-width: 480px) {
        .page-filter-tab {
            padding: 5px 11px;
            font-size: 0.76rem;
        }
    }

    /* ── Event Grid Responsive ── */
    .event-grid-full {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
    }

    @media (max-width: 1024px) {
        .event-grid-full {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
        }
    }

    @media (max-width: 600px) {
        .event-grid-full {
            grid-template-columns: 1fr;
            gap: 14px;
        }
    }

    /* ── Event List (view toggle) ── */
    .event-list-full {
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    /* ── Section label ── */
    .page-section-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.88rem;
        font-weight: 600;
        color: #555;
        margin-bottom: 16px;
    }

    .page-section-count {
        background: #1e3a5f;
        color: #fff;
        border-radius: 999px;
        padding: 2px 10px;
        font-size: 0.78rem;
        margin-left: 4px;
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

// ── Normalizer ────────────────────────────────────────────────
function normalizeEvent(e) {
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
        id:              e.id,
        slug:            e.slug,
        nama:            e.nama,
        kategori:        e.kategori,
        penyelenggara:   e.penyelenggara ?? '-',
        tanggal:         e.tanggal_mulai ?? '',
        tanggal_mulai:   e.tanggal_mulai,
        tanggal_selesai: e.tanggal_selesai,
        jam,
        lokasi:          e.lokasi ?? '-',
        gambar,
        status:          e.status,
    };
}

// ── Skeleton card ─────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div style={{
            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            background: 'white', border: '1px solid var(--border)',
            boxShadow: '0 2px 12px rgba(20,80,120,.07)',
        }}>
            <style>{`@keyframes skPulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
            <div style={{ width: '100%', aspectRatio: '4/3', background: '#e2e8f0', animation: 'skPulse 1.4s ease-in-out infinite' }} />
            <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ height: 11, width: '38%', borderRadius: 6, background: '#e2e8f0', animation: 'skPulse 1.4s ease-in-out infinite' }} />
                <div style={{ height: 15, width: '88%', borderRadius: 6, background: '#e2e8f0', animation: 'skPulse 1.4s ease-in-out .08s infinite' }} />
                <div style={{ height: 15, width: '66%', borderRadius: 6, background: '#e2e8f0', animation: 'skPulse 1.4s ease-in-out .08s infinite' }} />
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[80, 65, 55].map((w, i) => (
                        <div key={i} style={{ height: 11, width: `${w}%`, borderRadius: 6, background: '#e2e8f0', animation: `skPulse 1.4s ease-in-out ${i * .1}s infinite` }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Error state ───────────────────────────────────────────────
function ErrorState({ message, onRetry }) {
    return (
        <div style={{ textAlign: 'center', padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-exclamation-triangle" style={{ fontSize: 26, color: '#ef4444' }} />
            </div>
            <div>
                <p style={{ fontWeight: 700, color: 'var(--dark)', marginBottom: 4 }}>Gagal memuat data event</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{message}</p>
            </div>
            <button className="btn btn-outline" onClick={onRetry}>
                <i className="fas fa-redo" /> Coba Lagi
            </button>
        </div>
    );
}

export default function Event() {
    const [events,  setEvents]  = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    const [kategori, setKategori] = useState('Semua');
    const [search,   setSearch]   = useState('');
    const [view,     setView]     = useState('grid');

    const fetchEvents = () => {
        setLoading(true);
        setError(null);

        api.get('/events')
            .then(res => {
                const raw = Array.isArray(res.data) ? res.data : (res.data.data ?? []);
                const now = new Date();

                const normalized = raw
                    .map(normalizeEvent)
                    .filter(e =>
                        e.status === 'published' &&
                        e.tanggal &&
                        new Date(e.tanggal) >= now
                    );

                setEvents(normalized);
            })
            .catch(err => {
                setError(err.response?.data?.message ?? err.message ?? 'Terjadi kesalahan tidak diketahui');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => { fetchEvents(); }, []);

    const filtered = useMemo(() => {
        let data = [...events];
        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter(e =>
                e.nama.toLowerCase().includes(q) ||
                e.lokasi.toLowerCase().includes(q)
            );
        }
        if (kategori !== 'Semua') data = data.filter(e => e.kategori === kategori);
        data.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
        return data;
    }, [events, search, kategori]);

    return (
        <>
            <style>{styles}</style>

            <div className="page-event">
                {/* ── Hero ── */}
                <div className="page-hero-v2 page-hero-v2--event">
                    <div className="page-hero-v2__overlay" />
                    <div className="page-hero-v2__pattern" />
                    <div className="page-hero-v2__deco">
                        {Array.from({ length: 25 }).map((_, i) => <span key={i} />)}
                    </div>
                    <div className="container page-hero-v2__content">
                        <div className="page-hero-v2__label">
                            <i className="fas fa-calendar-alt" /> Agenda Kota
                        </div>
                        <h1 className="page-hero-v2__title">Event & Agenda Purbalingga</h1>
                        <p className="page-hero-v2__desc">
                            Festival budaya, kegiatan olahraga, acara pemerintahan, dan wisata terkini di Purbalingga.
                        </p>
                        <div className="page-hero-v2__search">
                            <i className="fas fa-search page-hero-v2__search-icon" />
                            <input
                                type="text"
                                placeholder="Cari nama event atau lokasi..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="page-hero-v2__search-input"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Body ── */}
                <div style={{ background: 'var(--cream)', position: 'relative', zIndex: 2 }}>
                    <div className="container page-body">

                        {/* Toolbar */}
                        <div className="page-toolbar">
                            <div className="page-filter-tabs">
                                {KATEGORI.map(k => (
                                    <button
                                        key={k}
                                        className={`page-filter-tab${kategori === k ? ' active' : ''}`}
                                        onClick={() => setKategori(k)}
                                        style={{ color: '#1e3c6d' }}
                                    >{k}</button>
                                ))}
                            </div>
                        </div>

                        {/* Loading */}
                        {loading && (
                            <>
                                <div className="page-section-label">
                                    <i className="fas fa-clock" /> Memuat Event…
                                </div>
                                <div className="event-grid-full">
                                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                                </div>
                            </>
                        )}

                        {/* Error */}
                        {!loading && error && (
                            <ErrorState message={error} onRetry={fetchEvents} />
                        )}

                        {/* Empty */}
                        {!loading && !error && filtered.length === 0 && (
                            <div className="page-empty">
                                <i className="fas fa-calendar-times" />
                                <p>
                                    {events.length === 0
                                        ? 'Belum ada event yang akan datang.'
                                        : 'Tidak ada event yang sesuai filter.'}
                                </p>
                                {events.length > 0 && (
                                    <button className="btn btn-outline" onClick={() => { setSearch(''); setKategori('Semua'); }}>
                                        Reset Filter
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Data */}
                        {!loading && !error && filtered.length > 0 && (
                            <>
                                <div className="page-section-label">
                                    <i className="fas fa-clock" /> Total Event
                                    <span className="page-section-count">{filtered.length}</span>
                                </div>
                                <div className={view === 'grid' ? 'event-grid-full' : 'event-list-full'}>
                                    {filtered.map(e => (
                                        <EventCard key={e.id} event={e} showFullDate />
                                    ))}
                                </div>
                            </>
                        )}

                    </div>
                </div>
            </div>
        </>
    );
}
