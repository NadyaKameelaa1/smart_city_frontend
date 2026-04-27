// src/pages/PengumumanDetail.jsx
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useEffect, useState } from 'react';

const formatTanggal = (str) => {
    if (!str) return '-';
    const date = new Date(str);
    if (isNaN(date.getTime())) return str;
    return date.toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
};

const prioritasConfig = {
    mendesak: { label: 'Prioritas Mendesak', color: '#f87171', bg: '#fef2f2' },
    sedang:   { label: 'Prioritas Sedang',   color: '#fbbf24', bg: '#fffbeb' },
    umum:     { label: 'Prioritas Umum',     color: '#4ade80', bg: 'var(--teal-50)' },
};

const styles = `
    /* ── Layout utama ── */
    .pengumuman-detail-wrap {
        padding-top: 90px;
        padding-bottom: 80px;
        background: var(--cream);
        min-height: 100vh;
    }

    .pengumuman-detail-grid {
        display: grid;
        grid-template-columns: 1fr 340px;
        gap: 40px;
        align-items: start;
    }

    /* ── Artikel header ── */
    .pengumuman-detail-header {
        background: linear-gradient(135deg, var(--teal-700), var(--teal-900));
        padding: 40px 48px;
    }

    .pengumuman-detail-body {
        padding: 40px 48px;
    }

    /* ── Sidebar ── */
    .pengumuman-detail-sidebar {
        position: sticky;
        top: 100px;
    }

    /* ── Breadcrumb ── */
    .pengumuman-breadcrumb {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--text-muted);
        margin-bottom: 32px;
        flex-wrap: wrap;
    }

    /* ── Tablet: sidebar pindah ke bawah ── */
    @media (max-width: 1024px) {
        .pengumuman-detail-grid {
            grid-template-columns: 1fr;
            gap: 28px;
        }

        .pengumuman-detail-sidebar {
            position: static;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            align-items: start;
        }

        /* Tombol kembali span full width */
        .pengumuman-back-btn {
            grid-column: 1 / -1;
        }
    }

    /* ── Mobile ── */
    @media (max-width: 768px) {
        .pengumuman-detail-header {
            padding: 28px 24px;
        }

        .pengumuman-detail-body {
            padding: 28px 24px;
        }

        .pengumuman-breadcrumb {
            margin-bottom: 20px;
            font-size: 12px;
        }
    }

    @media (max-width: 600px) {
        .pengumuman-detail-wrap {
            padding-top: 80px;
            padding-bottom: 48px;
        }

        .pengumuman-detail-grid {
            gap: 20px;
        }

        .pengumuman-detail-header {
            padding: 22px 18px;
        }

        .pengumuman-detail-body {
            padding: 22px 18px;
        }

        .pengumuman-detail-sidebar {
            grid-template-columns: 1fr;
        }

        .pengumuman-breadcrumb {
            font-size: 11px;
            gap: 6px;
        }
    }

    /* ── Instansi info box ── */
    .pengumuman-instansi-box {
        margin-top: 36px;
        padding: 20px;
        background: var(--teal-50);
        border-radius: var(--radius-md);
        border: 1px solid var(--teal-100);
        display: flex;
        align-items: center;
        gap: 16px;
    }

    @media (max-width: 480px) {
        .pengumuman-instansi-box {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }
    }

    /* ── Sidebar cards ── */
    .pengumuman-sidebar-block {
        background: white;
        border-radius: var(--radius-lg);
        border: 1px solid var(--border);
        box-shadow: var(--shadow-card);
        padding: 24px;
    }

    .pengumuman-sidebar-block-title {
        font-family: var(--font-display);
        font-size: 17px;
        font-weight: 700;
        color: var(--dark);
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 2px solid var(--border);
    }
`;

export default function PengumumanDetail() {
    const { slug } = useParams();
    const [pengumuman, setPengumuman] = useState(null);
    const [lainnya, setLainnya] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        api.get(`/pengumuman/${slug}`)
            .then(res => {
                if (isMounted) {
                    setPengumuman(res.data.data);
                    return api.get('/pengumuman');
                }
            })
            .then(res => {
                if (isMounted && res) {
                    const list = res.data.data.filter(p => p.slug !== slug).slice(0, 4);
                    setLainnya(list);
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error("Gagal mengambil detail:", err);
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, [slug]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loader">Memuat informasi...</div>
            </div>
        );
    }

    if (!pengumuman) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 100 }}>
                <i className="fas fa-bullhorn" style={{ fontSize: 48, color: 'var(--teal-300)' }} />
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Pengumuman tidak ditemukan</h2>
                <Link to="/pengumuman" className="btn btn-primary">Kembali ke Pengumuman</Link>
            </div>
        );
    }

    const prio = prioritasConfig[pengumuman.prioritas] || prioritasConfig.umum;

    return (
        <>
            <style>{styles}</style>

            <div className="pengumuman-detail-wrap">
                <div className="container">

                    {/* Breadcrumb */}
                    <div className="pengumuman-breadcrumb">
                        <Link to="/" style={{ color: 'var(--teal-600)' }}>Beranda</Link>
                        <i className="fas fa-chevron-right" style={{ fontSize: 9 }} />
                        <Link to="/pengumuman" style={{ color: 'var(--teal-600)' }}>Pengumuman</Link>
                        <i className="fas fa-chevron-right" style={{ fontSize: 9 }} />
                        <span style={{ color: 'var(--text-dark)', fontWeight: 500 }}>{pengumuman.judul}</span>
                    </div>

                    <div className="pengumuman-detail-grid">

                        {/* ── KONTEN UTAMA ── */}
                        <article>
                            <div style={{
                                background: 'white',
                                borderRadius: 'var(--radius-xl)',
                                overflow: 'hidden',
                                boxShadow: 'var(--shadow-card)',
                                border: '1px solid var(--border)',
                            }}>
                                {/* Header */}
                                <div className="pengumuman-detail-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                                        <span style={{ background: prio.bg, color: prio.color, padding: '5px 14px', borderRadius: 50, fontSize: 12, fontWeight: 600 }}>
                                            <i className="fas fa-circle" style={{ fontSize: 8, marginRight: 5 }} />{prio.label}
                                        </span>
                                        {Number(pengumuman.penting) === 1 && (
                                            <span style={{ background: '#fef2f2', color: '#ef4444', padding: '5px 14px', borderRadius: 50, fontSize: 12, fontWeight: 600 }}>
                                                <i className="fas fa-exclamation-circle" style={{ marginRight: 5 }} />Penting
                                            </span>
                                        )}
                                    </div>

                                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px,3vw,28px)', color: 'white', lineHeight: 1.3, marginBottom: 16 }}>
                                        {pengumuman.judul}
                                    </h1>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'rgba(255,255,255,.65)', flexWrap: 'wrap' }}>
                                        <span><i className="fas fa-calendar" style={{ marginRight: 5 }} />{formatTanggal(pengumuman.tanggal_mulai)}</span>
                                        <span><i className="fas fa-building" style={{ marginRight: 5 }} />{pengumuman.publisher}</span>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="pengumuman-detail-body">
                                    <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.9, textAlign: 'justify' }}>
                                        <p style={{ marginBottom: 16, fontSize: 16, color: 'var(--text-dark)' }}>{pengumuman.isi}</p>
                                        <p style={{ marginBottom: 16 }}>
                                            Demikian pengumuman ini disampaikan untuk diketahui dan diindahkan oleh seluruh pihak yang berkepentingan. Apabila ada pertanyaan lebih lanjut, dapat menghubungi instansi terkait.
                                        </p>
                                        <p>Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.</p>
                                    </div>

                                    {/* Informasi Instansi */}
                                    <div className="pengumuman-instansi-box">
                                        <div style={{ width: 48, height: 48, background: 'var(--teal-600)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <i className="fas fa-building" style={{ color: 'white', fontSize: 20 }} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--dark)' }}>Diterbitkan oleh: {pengumuman.publisher}</div>
                                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                                                Pemerintah Kabupaten Purbalingga · {pengumuman.tanggal_mulai}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lampiran */}
                                    {pengumuman.attachment_url && (
                                        <div style={{ marginTop: 28 }}>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 12 }}>
                                                <i className="fas fa-paperclip" style={{ color: 'var(--teal-500)', marginRight: 6 }} />Lampiran
                                            </div>
                                            <a
                                                href={pengumuman.attachment_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600, color: 'var(--teal-700)', textDecoration: 'none', transition: 'all .2s' }}
                                            >
                                                <i className="fas fa-file-pdf" style={{ color: '#ef4444' }} />
                                                Unduh Dokumen Pengumuman
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </article>

                        {/* ── SIDEBAR ── */}
                        <aside className="pengumuman-detail-sidebar">

                            {/* Pengumuman Lainnya */}
                            <div className="pengumuman-sidebar-block">
                                <div className="pengumuman-sidebar-block-title">
                                    <i className="fas fa-bullhorn" style={{ color: 'var(--teal-500)', marginRight: 8 }} />
                                    Pengumuman Lainnya
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                    {lainnya.map((p, i) => {
                                        const pc = prioritasConfig[p.prioritas] || prioritasConfig.umum;
                                        return (
                                            <Link
                                                key={p.id}
                                                to={`/pengumuman/${p.slug}`}
                                                style={{
                                                    display: 'flex', gap: 12,
                                                    padding: '12px 0',
                                                    borderBottom: i < lainnya.length - 1 ? '1px solid var(--border)' : 'none',
                                                    textDecoration: 'none',
                                                    alignItems: 'flex-start',
                                                }}
                                            >
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: pc.color, flexShrink: 0, marginTop: 6 }} />
                                                <div>
                                                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-dark)', lineHeight: 1.4, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                        {p.judul}
                                                    </div>
                                                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                                                        <span><i className="fas fa-building" /> {p.publisher}</span>
                                                        <span><i className="fas fa-calendar" /> {new Date(p.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Pusat Pengaduan */}
                            <div style={{ background: 'linear-gradient(135deg, var(--teal-600), var(--teal-800))', borderRadius: 'var(--radius-lg)', padding: 24, color: 'white' }}>
                                <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 16 }}>
                                    <i className="fas fa-headset" style={{ marginRight: 8 }} />Butuh Bantuan?
                                </div>
                                <p style={{ fontSize: 13, opacity: .85, lineHeight: 1.7, marginBottom: 16 }}>
                                    Hubungi kami untuk pertanyaan seputar pengumuman ini.
                                </p>
                                <a href="tel:02818901016" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(255,255,255,.15)', borderRadius: 8, color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                                    <i className="fas fa-phone" /> (0281) 891016
                                </a>
                                <a href="mailto:info@purbalinggakab.go.id" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(255,255,255,.15)', borderRadius: 8, color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                                    <i className="fas fa-envelope" /> Email Kami
                                </a>
                            </div>

                            {/* Tombol kembali */}
                            <Link to="/pengumuman" className="btn btn-outline pengumuman-back-btn" style={{ width: '100%', justifyContent: 'center' }}>
                                <i className="fas fa-arrow-left" /> Semua Pengumuman
                            </Link>

                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
}