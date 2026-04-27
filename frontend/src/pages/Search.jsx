// src/pages/Search.jsx
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
const formatTanggal = (str) => {
    if (!str) return '';
    return new Date(str).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const CAT_META = {
    wisata:     { label: 'Wisata',      icon: 'fa-mountain',      color: 'var(--teal-600)' },
    berita:     { label: 'Berita',      icon: 'fa-newspaper',     color: '#4072af'         },
    event:      { label: 'Event',       icon: 'fa-calendar-alt',  color: '#16a34a'         },
    pengumuman: { label: 'Pengumuman',  icon: 'fa-bullhorn',      color: '#d4a853'         },
    pelayanan:  { label: 'Pelayanan',   icon: 'fa-hands-helping', color: '#7c3aed'         },
};

// ─────────────────────────────────────────────────────────────────
// Normalizers
// ─────────────────────────────────────────────────────────────────
function normalizeWisata(items = []) {
    return items.map((w) => ({
        type: 'wisata', typeLabel: 'Wisata', icon: 'fa-mountain', color: 'var(--teal-600)',
        id: w.id, title: w.nama, desc: w.deskripsi, href: `/wisata/${w.slug || w.id}`,
        img: w.thumbnail, meta: w.kategori || '',
        keywords: [w.nama, w.deskripsi, w.kategori].filter(Boolean).map((s) => s.toLowerCase()),
    }));
}
function normalizeBerita(items = []) {
    return items.map((b) => ({
        type: 'berita', typeLabel: 'Berita', icon: 'fa-newspaper', color: '#4072af',
        id: b.id, title: b.judul,
        desc: b.konten ? b.konten.replace(/<[^>]*>/g, '').slice(0, 160) : '',
        href: `/berita/${b.slug || b.id}`, img: b.thumbnail,
        meta: formatTanggal(b.published_at || b.created_at),
        keywords: [b.judul, b.konten, b.kategori, b.publisher].filter(Boolean).map((s) => s.replace(/<[^>]*>/g, '').toLowerCase()),
    }));
}
function normalizeEvent(items = []) {
    return items.map((e) => ({
        type: 'event', typeLabel: 'Event', icon: 'fa-calendar-alt', color: '#16a34a',
        id: e.id, title: e.nama,
        desc: [e.lokasi, e.jam_mulai].filter(Boolean).join(' · '),
        href: `/event`, img: e.thumbnail, meta: formatTanggal(e.tanggal_mulai),
        keywords: [e.nama, e.kategori, e.lokasi, e.penyelenggara].filter(Boolean).map((s) => s.toLowerCase()),
    }));
}
function normalizePengumuman(items = []) {
    return items.map((p) => ({
        type: 'pengumuman', typeLabel: 'Pengumuman', icon: 'fa-bullhorn', color: '#d4a853',
        id: p.id, title: p.judul,
        desc: p.isi ? p.isi.replace(/<[^>]*>/g, '').slice(0, 160) : '',
        href: `/pengumuman/${p.slug || p.id}`, img: null,
        meta: formatTanggal(p.tanggal_mulai || p.created_at),
        keywords: [p.judul, p.isi, p.publisher].filter(Boolean).map((s) => s.replace(/<[^>]*>/g, '').toLowerCase()),
    }));
}
function normalizePelayanan(items = []) {
    return items.map((p) => ({
        type: 'pelayanan', typeLabel: 'Pelayanan', icon: p.icon || 'fa-hands-helping', color: '#7c3aed',
        id: p.id, title: p.nama, desc: p.deskripsi, href: p.url, img: null, meta: null,
        keywords: [p.nama, p.deskripsi].filter(Boolean).map((s) => s.toLowerCase()),
    }));
}

function filterItems(allItems, query, kategori) {
    const q = query.toLowerCase().trim();
    return allItems.filter((item) => {
        if (kategori !== 'semua' && item.type !== kategori) return false;
        if (q) return item.keywords.some((k) => k.includes(q));
        return true;
    });
}

// ─────────────────────────────────────────────────────────────────
// Highlight
// ─────────────────────────────────────────────────────────────────
function Highlight({ text = '', query = '' }) {
    if (!query.trim() || !text) return <>{text}</>;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, i) =>
                regex.test(part)
                    ? <mark key={i} style={{ background: '#fef08a', color: 'var(--dark)', borderRadius: 3, padding: '0 2px' }}>{part}</mark>
                    : part
            )}
        </>
    );
}

// ─────────────────────────────────────────────────────────────────
// Result Card
// ─────────────────────────────────────────────────────────────────
function ResultCard({ result, query }) {
    const inner = (
        <div
            style={{
                display: 'flex', gap: 16, padding: '16px 20px',
                background: 'white', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
                transition: 'all .2s',
                cursor: result.href ? 'pointer' : 'default',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
        >
            {result.img ? (
                <img
                    src={result.img} alt={result.title}
                    style={{ width: 80, height: 64, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
            ) : (
                <div style={{ width: 80, height: 64, borderRadius: 8, background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`fas ${result.icon}`} style={{ fontSize: 22, color: result.color }} />
                </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                    <span style={{
                        fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1,
                        color: result.color, background: result.color + '18',
                        padding: '3px 10px', borderRadius: 50,
                        display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                        <i className={`fas ${result.icon}`} style={{ fontSize: 9 }} /> {result.typeLabel}
                    </span>
                    {result.meta && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{result.meta}</span>}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--dark)', marginBottom: 5, lineHeight: 1.3 }}>
                    <Highlight text={result.title} query={query} />
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    <Highlight text={result.desc} query={query} />
                </div>
            </div>
            {result.href && (
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--teal-500)', flexShrink: 0 }}>
                    <i className="fas fa-arrow-right" />
                </div>
            )}
        </div>
    );

    if (!result.href) return inner;
    const isExternal = result.href.startsWith('http');
    return isExternal
        ? <a href={result.href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>{inner}</a>
        : <Link to={result.href} style={{ textDecoration: 'none' }}>{inner}</Link>;
}

// ─────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div style={{ display: 'flex', gap: 16, padding: '16px 20px', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ width: 80, height: 64, borderRadius: 8, background: '#e2e8f0', flexShrink: 0, animation: 'pulse 1.4s ease infinite' }} />
            <div style={{ flex: 1 }}>
                <div style={{ height: 12, width: '30%', background: '#e2e8f0', borderRadius: 6, marginBottom: 10, animation: 'pulse 1.4s ease infinite' }} />
                <div style={{ height: 18, width: '70%', background: '#e2e8f0', borderRadius: 6, marginBottom: 8, animation: 'pulse 1.4s ease infinite' }} />
                <div style={{ height: 13, width: '90%', background: '#f1f5f9', borderRadius: 6, animation: 'pulse 1.4s ease infinite' }} />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────
function EmptyState({ query, kategori }) {
    const catLabel = CAT_META[kategori]?.label || '';
    return (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <i className="fas fa-search-minus" style={{ fontSize: 44, color: 'var(--teal-200)', marginBottom: 14, display: 'block' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--dark)', marginBottom: 8 }}>Tidak ada hasil</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                {query
                    ? `Tidak ada hasil untuk "${query}"${catLabel ? ` di kategori ${catLabel}` : ''}. Coba kata kunci lain.`
                    : `Belum ada data untuk kategori ${catLabel}.`}
            </p>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// Filter Kategori Panel (shared between sidebar & mobile sheet)
// ─────────────────────────────────────────────────────────────────
const kategoriList = [
    { key: 'semua',      label: 'Semua',      icon: 'fa-th' },
    { key: 'wisata',     label: 'Wisata',      icon: 'fa-mountain' },
    { key: 'berita',     label: 'Berita',      icon: 'fa-newspaper' },
    { key: 'event',      label: 'Event',       icon: 'fa-calendar-alt' },
    { key: 'pelayanan',  label: 'Pelayanan',   icon: 'fa-hands-helping' },
    { key: 'pengumuman', label: 'Pengumuman',  icon: 'fa-bullhorn' },
];

function FilterList({ kategori, filteredCounts, dataReady, onSelect }) {
    return (
        <>
            {kategoriList.map((k) => {
                const isActive = kategori === k.key;
                const count = filteredCounts[k.key] ?? 0;
                return (
                    <button
                        key={k.key}
                        onClick={() => onSelect(k.key)}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            width: '100%', padding: '12px 20px',
                            background: isActive ? 'var(--teal-50)' : 'transparent',
                            borderLeft: isActive ? '3px solid var(--teal-500)' : '3px solid transparent',
                            border: 'none', borderBottom: '1px solid var(--border)',
                            cursor: 'pointer', transition: 'all .15s', textAlign: 'left',
                            fontFamily: 'var(--font-body)',
                        }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--teal-700)' : 'var(--text-dark)' }}>
                            <i className={`fas ${k.icon}`} style={{ width: 16, color: isActive ? 'var(--teal-600)' : 'var(--text-muted)', fontSize: 13 }} />
                            {k.label}
                        </span>
                        <span style={{
                            fontSize: 11, fontWeight: 700,
                            background: isActive ? 'var(--teal-600)' : 'var(--border)',
                            color: isActive ? 'white' : 'var(--text-muted)',
                            borderRadius: 50, padding: '2px 8px', minWidth: 24, textAlign: 'center',
                        }}>
                            {dataReady ? count : '...'}
                        </span>
                    </button>
                );
            })}
        </>
    );
}

// ─────────────────────────────────────────────────────────────────
// useBreakpoint — deteksi mobile (< 768px)
// ─────────────────────────────────────────────────────────────────
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
    return isMobile;
}

// ─────────────────────────────────────────────────────────────────
// Main Search Page
// ─────────────────────────────────────────────────────────────────
export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [inputVal, setInputVal]         = useState(() => searchParams.get('q') || '');
    const [allItems, setAllItems]         = useState([]);
    const [dataReady, setDataReady]       = useState(false);
    const [fetchError, setFetchError]     = useState(false);
    const [filterOpen, setFilterOpen]     = useState(false); // mobile filter panel
    const isMobile = useIsMobile();

    const query    = searchParams.get('q') || '';
    const kategori = searchParams.get('cat') || 'semua';

    // Tutup panel filter saat resize ke desktop
    useEffect(() => { if (!isMobile) setFilterOpen(false); }, [isMobile]);

    // Fetch data
    useEffect(() => {
        let cancelled = false;
        setDataReady(false);
        setFetchError(false);

        const fetchAll = async () => {
            try {
                const [wisataRes, beritaRes, pengumumanRes, pelayananRes, eventRes] = await Promise.allSettled([
                    api.get('/wisata'),
                    api.get('/berita'),
                    api.get('/pengumuman'),
                    api.get('/pelayanan'),
                    api.get('/events'),
                ]);
                if (cancelled) return;

                const unwrap = (res) => {
                    if (res.status !== 'fulfilled') return [];
                    const d = res.value?.data;
                    if (Array.isArray(d)) return d;
                    if (Array.isArray(d?.data)) return d.data;
                    return [];
                };

                const wisata     = normalizeWisata(unwrap(wisataRes));
                const berita     = normalizeBerita(unwrap(beritaRes));
                const pengumuman = normalizePengumuman(unwrap(pengumumanRes));
                const pelayanan  = normalizePelayanan(unwrap(pelayananRes));
                const event      = normalizeEvent(unwrap(eventRes));

                const merged = [...wisata, ...berita, ...event, ...pengumuman, ...pelayanan];
                setAllItems(merged);
                setDataReady(true);
            } catch (err) {
                if (!cancelled) { console.error('Search fetch error:', err); setFetchError(true); setDataReady(true); }
            }
        };
        fetchAll();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => { setInputVal(query); }, [query]);

    const results = dataReady ? filterItems(allItems, query, kategori) : [];

    const filteredCounts = dataReady
        ? {
            semua:      filterItems(allItems, query, 'semua').length,
            wisata:     filterItems(allItems, query, 'wisata').length,
            berita:     filterItems(allItems, query, 'berita').length,
            event:      filterItems(allItems, query, 'event').length,
            pengumuman: filterItems(allItems, query, 'pengumuman').length,
            pelayanan:  filterItems(allItems, query, 'pelayanan').length,
        }
        : { semua: 0, wisata: 0, berita: 0, event: 0, pengumuman: 0, pelayanan: 0 };

    function doSearch() {
        const params = { cat: kategori };
        if (inputVal.trim()) params.q = inputVal.trim();
        setSearchParams(params);
    }

    function setKat(kat) {
        const params = { cat: kat };
        if (query) params.q = query;
        setSearchParams(params);
        if (isMobile) setFilterOpen(false); // tutup panel setelah pilih
    }

    const headingText = () => {
        const catLabel = CAT_META[kategori]?.label;
        if (query && catLabel)  return <>Hasil "<span style={{ color: 'var(--teal-300)' }}>{query}</span>" di {catLabel}</>;
        if (query)              return <>Hasil pencarian untuk "<span style={{ color: 'var(--teal-300)' }}>{query}</span>"</>;
        if (catLabel)           return <>Semua {catLabel}</>;
        return 'Cari Informasi Purbalingga';
    };

    const summaryText = () => {
        const catLabel = CAT_META[kategori]?.label;
        if (query && catLabel)  return `Ditemukan ${results.length} hasil untuk "${query}" di ${catLabel}`;
        if (query)              return `Ditemukan ${results.length} hasil untuk "${query}"`;
        if (catLabel)           return `Menampilkan ${results.length} ${catLabel.toLowerCase()} tersedia`;
        return `Menampilkan ${results.length} konten`;
    };

    const activeLabel = kategoriList.find((k) => k.key === kategori)?.label || 'Semua';
    const activeIcon  = kategoriList.find((k) => k.key === kategori)?.icon  || 'fa-th';

    return (
        <div style={{ paddingTop: 90, paddingBottom: 80, background: 'var(--cream)', minHeight: '100vh' }}>
            <style>{`
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
                @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
                .search-body {
                    display: grid;
                    grid-template-columns: 220px 1fr;
                    gap: 32px;
                    align-items: start;
                }
                @media (max-width: 767px) {
                    .search-body {
                        grid-template-columns: 1fr;
                        gap: 0;
                    }
                    .desktop-sidebar { display: none !important; }
                }
                @media (min-width: 768px) {
                    .mobile-filter-bar { display: none !important; }
                }
            `}</style>

            {/* ── Search Header ── */}
            <div style={{ background: 'linear-gradient(135deg, var(--teal-800), var(--teal-950))', padding: '48px 0 40px' }}>
                <div className="container">
                    <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
                        <div style={{ fontSize: 13, color: 'var(--teal-300)', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
                            <i className="fas fa-search" style={{ marginRight: 6 }} />Pencarian
                        </div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,4vw,34px)', color: 'white', marginBottom: 28, lineHeight: 1.3 }}>
                            {headingText()}
                        </h1>
                        {/* Search box */}
                        <div style={{ background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 60, padding: 5, display: 'flex', alignItems: 'center' }}>
                            <input
                                type="text"
                                value={inputVal}
                                onChange={(e) => setInputVal(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && doSearch()}
                                placeholder="Ketik kata kunci..."
                                style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px 20px', fontSize: 15, outline: 'none', color: 'white', minWidth: 0 }}
                            />
                            {inputVal && (
                                <button
                                    onClick={() => { setInputVal(''); setSearchParams({ cat: kategori }); }}
                                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer', padding: '0 8px', fontSize: 16 }}
                                >
                                    <i className="fas fa-times" />
                                </button>
                            )}
                            <button
                                onClick={doSearch}
                                style={{ background: 'var(--teal-500)', border: 'none', borderRadius: 50, padding: '10px 22px', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginRight: 4, fontSize: 14, whiteSpace: 'nowrap' }}
                            >
                                <i className="fas fa-search" /> Cari
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Mobile Filter Bar (muncul di bawah hero, di atas hasil) ── */}
            <div className="mobile-filter-bar container" style={{ marginTop: 16 }}>
                {/* Tombol toggle filter */}
                <button
                    onClick={() => setFilterOpen((v) => !v)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        width: '100%', padding: '12px 18px',
                        background: 'white', border: '1px solid var(--border)',
                        borderRadius: filterOpen ? '12px 12px 0 0' : 12,
                        cursor: 'pointer', fontFamily: 'var(--font-body)',
                        boxShadow: 'var(--shadow-sm)', transition: 'border-radius .2s',
                    }}
                >
                    <i className="fas fa-filter" style={{ color: 'var(--teal-500)', fontSize: 14 }} />
                    <span style={{ flex: 1, textAlign: 'left', fontSize: 14, fontWeight: 600, color: 'var(--dark)' }}>
                        Filter Kategori
                    </span>
                    {/* Badge aktif */}
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--teal-700)', background: 'var(--teal-50)', border: '1px solid var(--teal-200)', borderRadius: 50, padding: '2px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <i className={`fas ${activeIcon}`} style={{ fontSize: 10 }} /> {activeLabel}
                        {dataReady && (
                            <span style={{ marginLeft: 4, background: 'var(--teal-600)', color: 'white', borderRadius: 50, padding: '1px 6px', fontSize: 10 }}>
                                {filteredCounts[kategori]}
                            </span>
                        )}
                    </span>
                    <i className={`fas fa-chevron-${filterOpen ? 'up' : 'down'}`} style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 4 }} />
                </button>

                {/* Panel dropdown filter */}
                {filterOpen && (
                    <div style={{
                        background: 'white', border: '1px solid var(--border)', borderTop: 'none',
                        borderRadius: '0 0 12px 12px', overflow: 'hidden',
                        animation: 'slideDown .2s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,.08)',
                    }}>
                        <FilterList
                            kategori={kategori}
                            filteredCounts={filteredCounts}
                            dataReady={dataReady}
                            onSelect={setKat}
                        />
                    </div>
                )}

                {fetchError && (
                    <div style={{ marginTop: 10, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 13, color: '#dc2626', display: 'flex', gap: 8 }}>
                        <i className="fas fa-exclamation-circle" style={{ marginTop: 2 }} />
                        Gagal memuat data dari server.
                    </div>
                )}
            </div>

            {/* ── Body ── */}
            <div className="container search-body" style={{ marginTop: 24 }}>

                {/* ── Desktop Sidebar ── */}
                <aside className="desktop-sidebar" style={{ position: 'sticky', top: 100 }}>
                    <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14, color: 'var(--dark)' }}>
                            <i className="fas fa-filter" style={{ color: 'var(--teal-500)', marginRight: 8 }} />Filter Kategori
                        </div>
                        <FilterList
                            kategori={kategori}
                            filteredCounts={filteredCounts}
                            dataReady={dataReady}
                            onSelect={setKat}
                        />
                    </div>
                    {fetchError && (
                        <div style={{ marginTop: 12, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 13, color: '#dc2626', display: 'flex', gap: 8 }}>
                            <i className="fas fa-exclamation-circle" style={{ marginTop: 2 }} />
                            Gagal memuat data dari server.
                        </div>
                    )}
                </aside>

                {/* ── Hasil ── */}
                <div>
                    {dataReady && results.length > 0 && (
                        <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <i className="fas fa-info-circle" style={{ color: 'var(--teal-500)' }} />
                            {summaryText()}
                        </div>
                    )}

                    {!dataReady && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    )}

                    {dataReady && (
                        results.length === 0
                            ? <EmptyState query={query} kategori={kategori} />
                            : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {results.map((r, i) => (
                                        <ResultCard key={`${r.type}-${r.id ?? i}`} result={r} query={query} />
                                    ))}
                                </div>
                            )
                    )}
                </div>
            </div>
        </div>
    );
}