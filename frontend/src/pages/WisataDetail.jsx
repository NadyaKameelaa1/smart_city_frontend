// src/pages/WisataDetail.jsx
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import WisataCard from '../components/WisataCard';
import { getStoredSsoSession, listenSsoSessionChange, rememberReturnTo } from '../lib/ssoSession';

const formatRupiah = (n) => {
    if (n === undefined || n === null) return 'Hubungi Petugas';
    if (n === 0) return 'Gratis';
    return 'Rp ' + n.toLocaleString('id-ID');
};
const formatJam = (jam) => {
    if (!jam) return '';
    return jam.substring(0, 5).replace(':', '.');
};

const BASE_IMAGE_URL = 'http://localhost:8000/storage/';
const SSO_LOGIN_URL = 'http://localhost:8000/auth/sso/redirect';

// ─── Rating Stars Component ──────────────────────────────────
function StarInput({ value, onChange, readonly = false, size = 24 }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, 4, 5].map(star => {
                const filled = star <= (readonly ? value : (hovered || value));
                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => !readonly && onChange(star)}
                        onMouseEnter={() => !readonly && setHovered(star)}
                        onMouseLeave={() => !readonly && setHovered(0)}
                        style={{
                            background: 'none', border: 'none', padding: '2px',
                            cursor: readonly ? 'default' : 'pointer',
                            transform: filled && !readonly ? 'scale(1.15)' : 'scale(1)',
                            transition: 'transform .1s',
                            lineHeight: 1,
                        }}
                    >
                        <i
                            className={filled ? 'fas fa-star' : 'far fa-star'}
                            style={{
                                fontSize: size,
                                color: filled ? '#f59e0b' : '#d1d5db',
                                filter: filled && !readonly ? 'drop-shadow(0 2px 4px rgba(245,158,11,.4))' : 'none',
                                transition: 'color .1s',
                            }}
                        />
                    </button>
                );
            })}
        </div>
    );
}

// ─── Rating Section Component ────────────────────────────────
function RatingSection({ wisata }) {
    const [statusData, setStatusData] = useState(null);
    const [ratingData, setRatingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [myRating, setMyRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [localAvg, setLocalAvg] = useState(null);
    const [localTotal, setLocalTotal] = useState(null);

    const ratingLabels = ['', 'Sangat Buruk', 'Kurang Baik', 'Cukup', 'Baik', 'Sangat Baik!'];

    useEffect(() => {
        if (!wisata?.id) return;
        fetchData();
    }, [wisata?.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statusRes, statsRes] = await Promise.all([
                api.get(`/wisata/${wisata.id}/rating-stats`),
            ]);
            setStatusData(statusRes.data);
            setRatingData(statsRes.data);
        } catch (err) {
            console.error(err);
            setRatingData({ per_bintang: {} });
        } finally {
            setLoading(false);
        }
    };

    const totalUlasan = localTotal ?? wisata?.total_review ?? 0;
    const avgRating   = localAvg   ?? wisata?.average_rating ?? wisata?.rating ?? 0;
    const perBintang  = ratingData?.per_bintang || {};
    const bisaReview  = statusData?.bisa_review ?? false;
    const ratingDiberikan = statusData?.rating_diberikan ?? 0;
    const tiketDigunakan  = statusData?.tiket_digunakan ?? 0;

    const getPercent = (bintang) => {
        if (!totalUlasan) return 0;
        return Math.round(((perBintang[bintang] || 0) / totalUlasan) * 100);
    };

    return (
        <div className="wd-info-card" style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 24 }}>
                <div style={{ textAlign: 'center', minWidth: 80 }}>
                    <div style={{ fontSize: 52, fontWeight: 900, color: 'var(--dark)', lineHeight: 1, fontFamily: 'var(--font-display)' }}>
                        {Number(avgRating).toFixed(1)}
                    </div>
                    <div style={{ margin: '6px 0 4px' }}>
                        <StarInput value={Math.round(avgRating)} readonly size={14} />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {totalUlasan} ulasan
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[5,4,3,2,1].map(n => (
                                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', width: 8 }}>{n}</div>
                                    <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 50, overflow: 'hidden', animation: 'pulse 1.3s ease infinite' }} />
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', width: 24 }}>-</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        [5, 4, 3, 2, 1].map(num => {
                            const pct = getPercent(num);
                            const count = perBintang[num] || 0;
                            return (
                                <div className="wd-rating-bar" key={num}>
                                    <div className="wd-rating-bar__label">{num}</div>
                                    <div className="wd-rating-bar__track">
                                        <div className="wd-rating-bar__fill" style={{ width: `${pct}%`, transition: 'width .6s ease', background: num >= 4 ? '#f59e0b' : num === 3 ? '#fb923c' : '#ef4444' }} />
                                    </div>
                                    <div className="wd-rating-bar__count">{count}</div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        
        </div>
    );
}

// ─── Ticket Card — shared antara sidebar desktop & inline mobile ─
function TicketCard({ w, isLoggedIn, onLoginToBuyTicket }) {
    return (
        <div className="wd-ticket">
            <div className="wd-ticket__head">
                <i className="fas fa-ticket-alt" /> Harga Tiket Masuk
            </div>
            <div className="wd-ticket__prices" style={{ flexDirection: 'column', gap: '10px' }}>
                {w.prices && w.prices.length > 0 ? (
                    w.prices.map((p, idx) => (
                        <div key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', textAlign: 'left' }}>
                            <div style={{ fontSize: '11px', color: 'var(--teal-300)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                {p.day_type === 'weekday' ? 'Senin - Jumat' : p.day_type === 'weekend' ? 'Sabtu - Minggu' : 'Hari Libur'}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                                <span style={{ fontSize: '13px' }}>Dewasa:</span>
                                <span className="wd-ticket__price-val">{formatRupiah(p.harga_dewasa)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '13px' }}>Anak:</span>
                                <span className="wd-ticket__price-val">{formatRupiah(p.harga_anak)}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="wd-ticket__price-val">Harga belum tersedia</div>
                )}
            </div>
            {isLoggedIn ? (
                <Link to={`/tiket?slug=${w.slug}`} className="wd-btn-primary">
                    <i className="fas fa-shopping-cart" /> Beli Tiket Sekarang
                </Link>
            ) : (
                <button type="button" onClick={onLoginToBuyTicket} className="wd-btn-primary">
                    <i className="fas fa-right-to-bracket" /> Login untuk beli tiket
                </button>
            )}
            <Link
                to={`/peta?nama=${encodeURIComponent(w.nama)}&lat=${w.marker?.lat ?? w.lat}&lng=${w.marker?.lng ?? w.lng}&open=1`}
                className="wd-btn-ghost"
            >
                <i className="fas fa-map-marked-alt" /> Lihat di Peta
            </Link>
        </div>
    );
}

export default function WisataDetail() {
    const { slug }   = useParams();
    const navigate   = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getStoredSsoSession()?.token));
    const [imgIdx, setImgIdx] = useState(0);
    const [w, setWisata]   = useState(null);
    const [lainnya, setLainnya] = useState([]);

    useEffect(() => {
        api.get(`/wisata/${slug}`)
            .then(res => {
                setWisata(res.data.data);
                return api.get('/wisata');
            })
            .then(res => {
                const all = res.data.data || res.data;
                setLainnya(all.filter(d => d.slug !== slug).slice(0, 3));
            })
            .catch(err => console.error("Gagal load detail:", err));
        window.scrollTo(0, 0);
    }, [slug]);

    useEffect(() => listenSsoSessionChange(() => {
        setIsLoggedIn(Boolean(getStoredSsoSession()?.token));
    }), []);

    const handleLoginToBuyTicket = () => {
        rememberReturnTo(`${window.location.pathname}${window.location.search}${window.location.hash}`);
        window.location.href = SSO_LOGIN_URL;
    };

    if (!w) {
        return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 90 }} />;
    }

    const galeri  = [w.thumbnail];
    const details = [
        { icon: 'fa-clock',          label: 'Jam Operasional', val: w.jam_buka && w.jam_tutup ? `${formatJam(w.jam_buka)} – ${formatJam(w.jam_tutup)} WIB` : '08.00 – 17.00 WIB' },
        { icon: 'fa-map-marker-alt', label: 'Alamat',          val: w.alamat_lengkap || 'Purbalingga' },
        { icon: 'fa-concierge-bell', label: 'Fasilitas',       val: w.fasilitas || 'Tersedia' },
        { icon: 'fa-phone',          label: 'Kontak',          val: w.kontak || '-' },
    ];

    return (
        <>
            <style>{`
                .wd-page { min-height: 100vh; background: var(--cream); }
                .wd-hero { position: relative; height: 70vh; min-height: 460px; max-height: 680px; overflow: hidden; background: var(--teal-950); }
                .wd-hero__img { width: 100%; height: 100%; object-fit: cover; transition: opacity .4s ease; }
                .wd-hero__overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(10,29,61,.15) 0%, rgba(10,29,61,.1) 40%, rgba(10,29,61,.85) 100%); }
                .wd-hero__back { position: absolute; top: 96px; left: 0; right: 0; z-index: 5; }
                .wd-hero__back-inner { display: flex; align-items: center; }
                .wd-back-btn { display: inline-flex; align-items: center; gap: 8px; padding: 8px 18px; border-radius: 50px; background: rgba(255,255,255,.12); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,.2); color: white; font-size: 13px; font-weight: 600; text-decoration: none; transition: var(--transition); font-family: var(--font-body); cursor: pointer; }
                .wd-back-btn:hover { background: rgba(255,255,255,.22); }
                .wd-hero__info { position: absolute; bottom: 0; left: 0; right: 0; z-index: 4; padding: 32px 0 36px; }
                .wd-hero__badge { display: inline-block; background: var(--teal-500); color: white; padding: 4px 14px; border-radius: 50px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; }
                .wd-hero__title { font-family: var(--font-display); font-size: clamp(28px,5vw,48px); font-weight: 700; color: white; margin-bottom: 10px; line-height: 1.15; }
                .wd-hero__meta { display: flex; align-items: center; gap: 20px; font-size: 14px; color: rgba(255,255,255,.85); flex-wrap: wrap; }
                .wd-hero__meta span { display: flex; align-items: center; gap: 6px; }
                .wd-hero__meta .star { color: #f59e0b; }

                /* ── Layout utama ── */
                .wd-layout {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 32px;
                    padding: 40px 0 80px;
                }
                .wd-main {}

                /* ── Sidebar desktop: tampil kanan ── */
                .wd-sidebar {
                    position: sticky;
                    top: 100px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    align-self: start;
                }

                /* ── Tiket inline (hanya mobile) — tersembunyi di desktop ── */
                .wd-ticket-inline {
                    display: none;
                }

                /* ── Breakpoint ≤ 1024px: jadi 1 kolom, sidebar hilang ── */
                @media (max-width: 1024px) {
                    .wd-layout {
                        grid-template-columns: 1fr;
                    }
                    /* Sembunyikan sidebar kanan */
                    .wd-sidebar {
                        display: none;
                    }
                    /* Tampilkan tiket inline di wd-main */
                    .wd-ticket-inline {
                        display: block;
                        margin-bottom: 32px;
                    }
                    .wd-hero { height: 55vw; min-height: 320px; }
                }

                .wd-section-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--dark); margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid var(--teal-100); display: flex; align-items: center; gap: 10px; }
                .wd-section-title i { color: var(--teal-500); font-size: 16px; }
                .wd-desc { font-size: 15px; color: var(--text-muted); line-height: 1.85; margin-bottom: 32px; }
                .wd-details { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 32px; }
                .wd-detail-item { display: flex; align-items: flex-start; gap: 12px; padding: 16px; background: white; border-radius: var(--radius-md); border: 1px solid var(--border); box-shadow: var(--shadow-sm); }
                .wd-detail-icon { width: 36px; height: 36px; border-radius: 10px; background: var(--teal-50); border: 1px solid var(--teal-100); display: flex; align-items: center; justify-content: center; color: var(--teal-600); font-size: 13px; flex-shrink: 0; }
                .wd-detail-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; color: var(--text-muted); margin-bottom: 4px; }
                .wd-detail-val { font-size: 14px; font-weight: 600; color: var(--dark); line-height: 1.4; }
                .wd-rating-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
                .wd-rating-bar__label { font-size: 13px; color: var(--text-muted); width: 24px; text-align: right; }
                .wd-rating-bar__track { flex: 1; height: 8px; background: var(--teal-50); border-radius: 50px; overflow: hidden; border: 1px solid var(--teal-100); }
                .wd-rating-bar__fill { height: 100%; background: #f59e0b; border-radius: 50px; transition: width .6s ease; }
                .wd-rating-bar__count { font-size: 12px; color: var(--text-muted); width: 32px; }
                .wd-other-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
                .wd-ticket { background: var(--teal-950); border-radius: var(--radius-lg); padding: 24px; color: white; box-shadow: var(--shadow-lg); }
                .wd-ticket__head { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--teal-300); margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,.1); }
                .wd-ticket__prices { display: flex; gap: 0; margin-bottom: 20px; }
                .wd-ticket__price-val { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: white; }
                .wd-btn-primary { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 13px; border-radius: var(--radius-md); background: var(--gold); color: white; font-family: var(--font-body); font-size: 14px; font-weight: 700; border: none; cursor: pointer; transition: var(--transition); text-decoration: none; margin-bottom: 10px; }
                .wd-btn-primary:hover { background: #c49842; transform: translateY(-2px); }
                .wd-btn-ghost { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 11px; border-radius: var(--radius-md); background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15); color: rgba(255,255,255,.8); font-family: var(--font-body); font-size: 13px; font-weight: 600; cursor: pointer; transition: var(--transition); text-decoration: none; }
                .wd-btn-ghost:hover { background: rgba(255,255,255,.15); color: white; }
                .wd-info-card { background: white; border-radius: var(--radius-lg); border: 1px solid var(--border); padding: 20px; box-shadow: var(--shadow-sm); }

                @media (max-width: 640px) {
                    .wd-details { grid-template-columns: 1fr; }
                    .wd-other-grid { grid-template-columns: 1fr; }
                    .wd-hero__title { font-size: 24px; }
                }
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
            `}</style>

            <div className="wd-page">
                {/* Hero */}
                <div className="wd-hero">
                    <img src={`${BASE_IMAGE_URL}${galeri[imgIdx]}`} alt={w.nama} className="wd-hero__img" />
                    <div className="wd-hero__overlay" />
                    <div className="wd-hero__back">
                        <div className="container wd-hero__back-inner">
                            <button className="wd-back-btn" onClick={() => navigate(-1)}>
                                <i className="fas fa-arrow-left" /> Kembali
                            </button>
                        </div>
                    </div>
                    <div className="wd-hero__info">
                        <div className="container">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
                                <div>
                                    <span className="wd-hero__badge">{w.kategori}</span>
                                    <h1 className="wd-hero__title">{w.nama}</h1>
                                    <div className="wd-hero__meta">
                                        <span><i className="fas fa-map-marker-alt" /> {w.alamat_lengkap}</span>
                                        <span>
                                            <i className="fas fa-star star" />
                                            {Number(w.average_rating || w.rating || 0).toFixed(1)}
                                            <span style={{ opacity: .7, fontSize: 13 }}>({w.total_reviews ?? w.total_review ?? 0} ulasan)</span>
                                        </span>
                                        <span>
                                            <i className="fas fa-clock" />
                                            {w.jam_buka && w.jam_tutup ? `${formatJam(w.jam_buka)} – ${formatJam(w.jam_tutup)} WIB` : '08.00 – 17.00 WIB'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container">
                    <div className="wd-layout">

                        {/* ── Konten utama ── */}
                        <div className="wd-main">
                            <h2 className="wd-section-title"><i className="fas fa-info-circle" /> Tentang {w.nama}</h2>
                            <p className="wd-desc">{w.deskripsi}</p>

                            <h2 className="wd-section-title"><i className="fas fa-list-ul" /> Informasi Lengkap</h2>
                            <div className="wd-details">
                                {details.map(d => (
                                    <div className="wd-detail-item" key={d.label}>
                                        <div className="wd-detail-icon"><i className={`fas ${d.icon}`} /></div>
                                        <div>
                                            <div className="wd-detail-label">{d.label}</div>
                                            <div className="wd-detail-val">{d.val}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Ulasan */}
                            <h2 className="wd-section-title" style={{ marginTop: 32 }}>
                                <i className="fas fa-star" /> Ulasan Pengunjung
                            </h2>
                            <RatingSection wisata={w} />

                            {/* ── Tiket inline — hanya tampil di mobile (≤1024px) ── */}
                            <div className="wd-ticket-inline">
                                <h2 className="wd-section-title">
                                    <i className="fas fa-ticket-alt" /> Tiket & Lokasi
                                </h2>
                                <TicketCard
                                    w={w}
                                    isLoggedIn={isLoggedIn}
                                    onLoginToBuyTicket={handleLoginToBuyTicket}
                                />
                            </div>

                            {/* Wisata Lainnya */}
                            <h2 className="wd-section-title" style={{ marginTop: 8 }}>
                                <i className="fas fa-map-marked-alt" /> Wisata Lainnya
                            </h2>
                            <div className="wd-other-grid">
                                {lainnya.map(lain => <WisataCard key={lain.id} w={lain} />)}
                            </div>
                        </div>

                        {/* ── Sidebar — hanya desktop (>1024px) ── */}
                        <div className="wd-sidebar">
                            <TicketCard
                                w={w}
                                isLoggedIn={isLoggedIn}
                                onLoginToBuyTicket={handleLoginToBuyTicket}
                            />
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}
