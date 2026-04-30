// src/pages/BeritaDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const formatTanggal = (str) => {
    if (!str) return '---';
    return new Date(str).toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
};

const BASE_IMAGE_URL = import.meta.env.VITE_STORAGE_URL || 'https://apismartcity.qode.my.id/storage/';

export default function BeritaDetail() {
    const { slug } = useParams();
    const [berita,  setBerita]  = useState(null);
    const [lainnya, setLainnya] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get(`/berita/${slug}`)
            .then(res => {
                setBerita(res.data.data);
                return api.get('/berita');
            })
            .then(res => {
                setLainnya(res.data.data.filter(b => b.slug !== slug).slice(0, 4));
                setLoading(false);
            })
            .catch(err => {
                console.error("Gagal memuat berita:", err);
                setLoading(false);
            });
    }, [slug]);

    if (loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loader">Memuat berita...</div>
            </div>
        );
    }

    if (!berita) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 100 }}>
                <i className="fas fa-newspaper" style={{ fontSize: 48, color: 'var(--teal-300)' }} />
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Berita tidak ditemukan</h2>
                <Link to="/berita" className="btn btn-primary">Kembali ke Berita</Link>
            </div>
        );
    }

    const fullContent   = berita.konten || '';
    const firstDot      = fullContent.indexOf('.');
    const highlightText    = firstDot !== -1 ? fullContent.substring(0, firstDot + 1) : fullContent;
    const remainingContent = firstDot !== -1 ? fullContent.substring(firstDot + 1).trim() : '';

    const handleWhatsAppShare = () => {
        const text = `Baca berita terbaru: *${berita.judul}*\n\nCek selengkapnya di sini:\n${window.location.href}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div style={{ paddingTop: 90, paddingBottom: 80, background: 'var(--cream)', minHeight: '100vh' }}>
            {/* ── Responsive styles ── */}
            <style>{`
                .bd-grid {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 40px;
                    align-items: start;
                }
                .bd-article-pad {
                    padding: 40px 48px;
                }
                .bd-highlight {
                    font-size: 17px;
                    padding: 20px 24px 20px 32px;
                }
                .bd-content {
                    font-size: 15px;
                }
                .bd-aside {
                    position: sticky;
                    top: 100px;
                }

                /* Tablet */
                @media (max-width: 900px) {
                    .bd-grid {
                        grid-template-columns: 1fr 280px;
                        gap: 24px;
                    }
                    .bd-article-pad {
                        padding: 28px 32px;
                    }
                    .bd-highlight {
                        font-size: 15px;
                        padding: 16px 20px 16px 24px;
                    }
                    .bd-content {
                        font-size: 14px;
                    }
                }

                /* Mobile — sidebar turun ke bawah */
                @media (max-width: 680px) {
                    .bd-grid {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                    .bd-aside {
                        position: static;
                        top: auto;
                    }
                    .bd-article-pad {
                        padding: 20px 16px;
                    }
                    .bd-highlight {
                        font-size: clamp(13px, 3.5vw, 15px);
                        padding: 14px 16px 14px 20px;
                    }
                    .bd-content {
                        font-size: clamp(13px, 3.2vw, 15px);
                    }
                    .bd-breadcrumb {
                        font-size: 12px;
                        margin-bottom: 20px;
                    }
                    .bd-breadcrumb span:last-child {
                        display: none; /* judul terlalu panjang di mobile */
                    }
                }

                @media (max-width: 400px) {
                    .bd-article-pad {
                        padding: 16px 12px;
                    }
                }
            `}</style>

            <div className="container">
                {/* Breadcrumb */}
                <div className="bd-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', marginBottom: 32, flexWrap: 'wrap' }}>
                    <Link to="/" style={{ color: 'var(--teal-600)' }}>Beranda</Link>
                    <i className="fas fa-chevron-right" style={{ fontSize: 9 }} />
                    <Link to="/berita" style={{ color: 'var(--teal-600)' }}>Berita</Link>
                    <i className="fas fa-chevron-right" style={{ fontSize: 9 }} />
                    <span style={{ color: 'var(--text-dark)', fontWeight: 500 }}>{berita.judul}</span>
                </div>

                <div className="bd-grid">
                    {/* ── Artikel utama ── */}
                    <article>
                        <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)' }}>
                            <img
                                src={`${BASE_IMAGE_URL}${berita.thumbnail}`}
                                alt={berita.judul}
                                style={{ width: '100%', aspectRatio: '16/7', objectFit: 'cover', display: 'block' }}
                                onError={e => { e.target.src = 'https://placehold.co/800x350?text=No+Image'; }}
                            />

                            <div className="bd-article-pad">
                                {/* Meta */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
                                    <span className={`berita-tag tag-${berita.kategori}`}>
                                        <i className="fas fa-tag" /> {berita.kategori}
                                    </span>
                                    <span style={{ fontSize: 'clamp(11px,2.5vw,13px)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <i className="fas fa-calendar" /> {formatTanggal(berita.published_at)}
                                    </span>
                                    <span style={{ fontSize: 'clamp(11px,2.5vw,13px)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <i className="fas fa-user" /> {berita.publisher}
                                    </span>
                                </div>

                                {/* Judul */}
                                <h1 style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: 'clamp(18px, 4vw, 32px)',
                                    color: 'var(--dark)', lineHeight: 1.3, marginBottom: 24,
                                }}>
                                    {berita.judul}
                                </h1>

                                {/* Highlight kalimat pertama */}
                                <p className="bd-highlight" style={{
                                    color: 'var(--text-dark)', lineHeight: 1.8, fontWeight: 500,
                                    borderLeft: '4px solid var(--teal-500)',
                                    marginBottom: 24,
                                    background: 'var(--teal-50)',
                                    borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                                    textAlign: 'justify',
                                }}>
                                    {highlightText}
                                </p>

                                {/* Konten */}
                                <div className="bd-content" style={{
                                    color: 'var(--text-muted)', lineHeight: 1.9,
                                    whiteSpace: 'pre-line', textAlign: 'justify',
                                }}>
                                    {remainingContent}
                                </div>

                                {/* Share */}
                                <div style={{
                                    marginTop: 36, paddingTop: 24,
                                    borderTop: '1px solid var(--border)',
                                    display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                                }}>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>
                                        Bagikan berita:
                                    </span>
                                    <button
                                        onClick={handleWhatsAppShare}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            padding: '10px 20px', borderRadius: 12, border: 'none',
                                            background: '#25D366', color: 'white',
                                            cursor: 'pointer', fontSize: 14, fontWeight: 600,
                                            transition: 'all .25s',
                                            boxShadow: '0 4px 12px rgba(37,211,102,.2)',
                                        }}
                                        onMouseOver={e => { e.currentTarget.style.background = '#128C7E'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseOut={e => { e.currentTarget.style.background = '#25D366'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        <i className="fab fa-whatsapp" style={{ fontSize: 17 }} />
                                        WhatsApp
                                    </button>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* ── Sidebar ── */}
                    <aside className="bd-aside">
                        <div style={{
                            background: 'white', borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)',
                            padding: 24, marginBottom: 16,
                        }}>
                            <div style={{
                                fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
                                color: 'var(--dark)', marginBottom: 18, paddingBottom: 12,
                                borderBottom: '2px solid var(--border)',
                            }}>
                                <i className="fas fa-newspaper" style={{ color: 'var(--teal-500)', marginRight: 8 }} />
                                Berita Lainnya
                            </div>

                            {/* Di mobile tampilkan horizontal scroll grid */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {lainnya.map(b => (
                                    <Link
                                        key={b.id}
                                        to={`/berita/${b.slug}`}
                                        style={{ display: 'flex', gap: 12, textDecoration: 'none' }}
                                    >
                                        <img
                                            src={`${BASE_IMAGE_URL}${b.thumbnail}`}
                                            alt={b.judul}
                                            style={{ width: 72, height: 54, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                                            onError={e => { e.target.src = 'https://placehold.co/72x54?text=No+Img'; }}
                                        />
                                        <div>
                                            <div style={{
                                                fontSize: 13, fontWeight: 600, color: 'var(--text-dark)',
                                                lineHeight: 1.4, marginBottom: 4,
                                                display: '-webkit-box', WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                            }}>
                                                {b.judul}
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                <i className="fas fa-calendar" /> {new Date(b.published_at).toLocaleDateString('id-ID')}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <Link to="/berita" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                            <i className="fas fa-arrow-left" /> Semua Berita
                        </Link>
                    </aside>
                </div>
            </div>
        </div>
    );
}
