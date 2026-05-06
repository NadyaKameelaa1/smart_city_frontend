// src/pages/RiwayatTiket.jsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getStoredSsoSession, rememberReturnTo, listenSsoSessionChange } from '../lib/ssoSession';

const BASE_URL = (import.meta.env.VITE_API_URL || 'https://apismartcity.qode.my.id').replace(/\/$/, '');

const getThumbUrl = (thumbnail) => {
    if (!thumbnail) return null;
    if (thumbnail.startsWith('http')) return thumbnail;
    return `${BASE_URL}/storage/${thumbnail}`;
};

const formatRupiah   = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const formatTanggal  = (str) => new Date(str + 'T12:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
const formatDateTime = (str) => new Date(str).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const STATUS_TIKET = {
    Aktif:     { label: 'Aktif',     color: 'var(--teal-700)', bg: 'var(--teal-50)', border: 'var(--teal-200)', icon: 'fa-ticket-alt' },
    Digunakan: { label: 'Digunakan', color: '#6b7280',         bg: '#f9fafb',        border: '#e5e7eb',         icon: 'fa-check' },
};

const FILTER_OPTIONS = [
    { value: 'semua',     label: 'Semua' },
    { value: 'Aktif',     label: 'Aktif' },
    { value: 'Digunakan', label: 'Digunakan' },
];

const RESPONSIVE_STYLE = `
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
@keyframes fadeInScale {
    from { opacity: 0; transform: scale(.92) translateY(12px); }
    to   { opacity: 1; transform: scale(1)  translateY(0); }
}

.rt-card-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
}
.rt-stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 32px;
}
.rt-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    gap: 12px;
    flex-wrap: wrap;
}
.rt-filter-tabs {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}
.rt-filter-tab {
    padding: 8px 18px;
    border-radius: 50px;
    border: 1.5px solid var(--border);
    background: white;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
    cursor: pointer;
    font-family: var(--font-body);
    transition: all .15s;
    white-space: nowrap;
}
.rt-filter-tab.active,
.rt-filter-tab:hover {
    background: var(--teal-600);
    border-color: var(--teal-600);
    color: white;
}
.rt-detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}
.rt-modal-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding-top: 8px;
    border-top: 1px solid var(--border);
    align-items: center;
    flex-wrap: wrap;
}

/* Rating Modal overlay */
.rating-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.55);
    backdrop-filter: blur(3px);
    z-index: 9998;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}
.rating-modal-box {
    background: white;
    border-radius: 24px;
    box-shadow: 0 24px 80px rgba(0,0,0,.22);
    width: 100%;
    max-width: 420px;
    overflow: hidden;
    animation: fadeInScale .3s cubic-bezier(.34,1.3,.64,1) both;
}

@media (max-width: 900px) {
    .rt-card-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
}
@media (max-width: 560px) {
    .rt-card-grid  { grid-template-columns: 1fr; gap: 14px; }
    .rt-stats-grid { grid-template-columns: repeat(3, 1fr); }
    .rt-detail-grid { grid-template-columns: 1fr; }
    .rt-modal-actions { flex-direction: column-reverse; }
    .rt-modal-actions > * { width: 100%; justify-content: center; }
}
@media (max-width: 480px) {
    .rt-stats-grid { gap: 8px; }
    .rt-stat-value { font-size: 20px !important; }
    .rt-stat-label { font-size: 10px !important; }
    .rt-stat-icon  { width: 36px !important; height: 36px !important; }
}
`;

// ─────────────────────────────────────────────────────────────
// NOT LOGGED IN STATE
// ─────────────────────────────────────────────────────────────
function NotLoggedIn() {
    const handleLogin = () => {
        rememberReturnTo('/riwayat');
        window.location.href = 'https://apismartcity.qode.my.id/auth/sso/redirect';
    };

    return (
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--teal-50)', border: '2px solid var(--teal-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <i className="fas fa-lock" style={{ fontSize: 32, color: 'var(--teal-500)' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--dark)', marginBottom: 10 }}>
                Login untuk Melihat Tiket
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 360, lineHeight: 1.7, marginBottom: 28 }}>
                Kamu perlu login terlebih dahulu untuk melihat riwayat tiket wisata yang pernah kamu pesan.
            </p>
            <button onClick={handleLogin} className="btn btn-primary" style={{ padding: '12px 32px', fontSize: 14, borderRadius: 50 }}>
                <i className="fas fa-sign-in-alt" /> Login Sekarang
            </button>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// RATING MODAL  — popup di tengah layar
// ─────────────────────────────────────────────────────────────
function RatingModal({ order, userId, token, onClose, onSubmitSuccess }) {
    const [rating,    setRating]    = useState(0);
    const [hovered,   setHovered]   = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [loading,   setLoading]   = useState(false);

    const ratingLabels = ['', 'Sangat Buruk', 'Kurang Baik', 'Cukup', 'Baik', 'Sangat Baik!'];

    const handleSubmit = async () => {
        if (rating === 0 || loading) return;
        setLoading(true);
        try {
            await api.post(
                `/wisata/${order.wisata_id}/rating`,
                { rating },
                token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
            );
            setSubmitted(true);
            setTimeout(() => {
                onSubmitSuccess(order.wisata_id, rating);
                onClose();
            }, 1800);
        } catch (err) {
            const msg = err.response?.data?.message || 'Gagal mengirim rating.';
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rating-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="rating-modal-box">
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, var(--teal-700), var(--teal-900))', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <i className="fas fa-star" style={{ color: '#fbbf24', fontSize: 17 }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>Bagaimana kunjunganmu?</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>Beri rating untuk {order.wisata?.nama}</div>
                        </div>
                    </div>
                    <button onClick={onClose}
                        style={{ background: 'rgba(255,255,255,.12)', border: 'none', color: 'rgba(255,255,255,.8)', cursor: 'pointer', width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.22)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.12)'}
                    ><i className="fas fa-times" /></button>
                </div>

                {/* Body */}
                <div style={{ padding: '24px 26px 26px' }}>
                    {!submitted ? (
                        <>
                            {/* Info wisata */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22, padding: '12px 14px', background: 'var(--cream)', borderRadius: 12 }}>
                                {order.wisata?.thumbnail && (
                                    <img src={getThumbUrl(order.wisata.thumbnail)} alt=""
                                        style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                                        onError={e => e.currentTarget.style.display = 'none'} />
                                )}
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.wisata?.nama}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <i className="fas fa-calendar-check" style={{ color: 'var(--teal-500)' }} />
                                        {formatTanggal(order.tanggal_kunjungan)}
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'monospace', letterSpacing: 1 }}>{order.kode_order}</div>
                                </div>
                            </div>

                            {/* Bintang */}
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>Ketuk bintang untuk memberi rating</div>
                                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 10 }}>
                                    {[1,2,3,4,5].map((star) => {
                                        const filled = star <= (hovered || rating);
                                        return (
                                            <button key={star}
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHovered(star)}
                                                onMouseLeave={() => setHovered(0)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 3px', lineHeight: 1, transform: filled ? 'scale(1.2)' : 'scale(1)', transition: 'transform .12s' }}
                                            >
                                                <i className={filled ? 'fas fa-star' : 'far fa-star'}
                                                    style={{ fontSize: 36, color: filled ? '#f59e0b' : '#d1d5db', transition: 'color .12s', filter: filled ? 'drop-shadow(0 2px 6px rgba(245,158,11,.4))' : 'none' }} />
                                            </button>
                                        );
                                    })}
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 700, height: 20, color: rating > 0 ? '#f59e0b' : 'transparent', transition: 'color .2s' }}>
                                    {ratingLabels[hovered || rating] || '\u200e'}
                                </div>
                            </div>

                            {/* Tombol */}
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button onClick={onClose}
                                    style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: '1.5px solid var(--border)', background: 'white', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}>
                                    Batal
                                </button>
                                <button onClick={handleSubmit} disabled={rating === 0 || loading}
                                    style={{ flex: 2, padding: '11px 0', borderRadius: 12, border: 'none', background: rating > 0 ? 'linear-gradient(135deg,var(--teal-600),var(--teal-700))' : '#e5e7eb', fontSize: 14, fontWeight: 700, color: rating > 0 ? 'white' : '#9ca3af', cursor: rating > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: 'inherit', transition: 'background .2s' }}>
                                    {loading
                                        ? <><i className="fas fa-spinner fa-spin" /> Mengirim...</>
                                        : <><i className="fas fa-paper-plane" /> Kirim Ulasan</>}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
                            <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
                            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--dark)', marginBottom: 6 }}>Terima kasih!</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>Ulasanmu membantu wisatawan lain menentukan pilihan terbaik.</div>
                            <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                                {[1,2,3,4,5].map(s => (
                                    <i key={s} className={s <= rating ? 'fas fa-star' : 'far fa-star'}
                                        style={{ color: s <= rating ? '#f59e0b' : '#d1d5db', fontSize: 26 }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// REVIEW TOAST  — muncul otomatis dari bawah kiri
// ─────────────────────────────────────────────────────────────
function ReviewToast({ order, token, onClose, onSubmitSuccess }) {
    const [rating,    setRating]    = useState(0);
    const [hovered,   setHovered]   = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [loading,   setLoading]   = useState(false);
    const [visible,   setVisible]   = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 60);
        return () => clearTimeout(t);
    }, []);

    const doClose = () => { setVisible(false); setTimeout(onClose, 360); };

    const handleSubmit = async () => {
        if (rating === 0 || loading) return;
        setLoading(true);
        try {
            await api.post(
                `/wisata/${order.wisata_id}/rating`,
                { rating },
                token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
            );
            setSubmitted(true);
            setTimeout(() => {
                onSubmitSuccess(order.wisata_id, rating);
                doClose();
            }, 1800);
        } catch (err) {
            const msg = err.response?.data?.message || 'Gagal mengirim rating.';
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const ratingLabels = ['', 'Sangat Buruk', 'Kurang Baik', 'Cukup', 'Baik', 'Sangat Baik!'];

    return (
        <div style={{
            position: 'fixed', bottom: 28, left: 28, zIndex: 9999, width: 316,
            transform: visible ? 'translateY(0)' : 'translateY(110%)',
            opacity:   visible ? 1 : 0,
            transition: 'transform .4s cubic-bezier(.34,1.5,.64,1), opacity .3s ease',
            pointerEvents: visible ? 'auto' : 'none',
        }}>
            <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 10px 48px rgba(0,0,0,.18), 0 2px 10px rgba(0,0,0,.08)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--teal-700), var(--teal-900))', padding: '13px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <i className="fas fa-star" style={{ color: '#fbbf24', fontSize: 15 }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>Bagaimana kunjunganmu?</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginTop: 1 }}>Rating {order.wisata?.nama}</div>
                        </div>
                    </div>
                    <button onClick={doClose} style={{ background: 'rgba(255,255,255,.12)', border: 'none', color: 'rgba(255,255,255,.7)', cursor: 'pointer', width: 26, height: 26, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.22)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.12)'}
                    ><i className="fas fa-times" /></button>
                </div>
                <div style={{ padding: '16px 18px 18px' }}>
                    {!submitted ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '10px 12px', background: 'var(--cream)', borderRadius: 10 }}>
                                {order.wisata?.thumbnail && (
                                    <img src={getThumbUrl(order.wisata.thumbnail)} alt="" style={{ width: 44, height: 44, borderRadius: 9, objectFit: 'cover', flexShrink: 0 }}
                                        onError={e => e.currentTarget.style.display = 'none'} />
                                )}
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.wisata?.nama}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                                        <i className="fas fa-calendar-check" style={{ marginRight: 4, color: 'var(--teal-500)' }} />
                                        {formatTanggal(order.tanggal_kunjungan)}
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'center', marginBottom: 14 }}>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Ketuk bintang untuk memberi rating</div>
                                <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 6 }}>
                                    {[1,2,3,4,5].map((star) => {
                                        const filled = star <= (hovered || rating);
                                        return (
                                            <button key={star} onClick={() => setRating(star)}
                                                onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 2px', lineHeight: 1, transform: filled ? 'scale(1.18)' : 'scale(1)', transition: 'transform .12s' }}>
                                                <i className={filled ? 'fas fa-star' : 'far fa-star'} style={{ fontSize: 30, color: filled ? '#f59e0b' : '#d1d5db', transition: 'color .12s', filter: filled ? 'drop-shadow(0 2px 5px rgba(245,158,11,.4))' : 'none' }} />
                                            </button>
                                        );
                                    })}
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700, height: 18, color: rating > 0 ? '#f59e0b' : 'transparent', transition: 'color .2s' }}>
                                    {ratingLabels[hovered || rating] || '\u200e'}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={doClose} style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: '1.5px solid var(--border)', background: 'white', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}>Nanti</button>
                                <button onClick={handleSubmit} disabled={rating === 0 || loading}
                                    style={{ flex: 2, padding: '9px 0', borderRadius: 10, border: 'none', background: rating > 0 ? 'linear-gradient(135deg,var(--teal-600),var(--teal-700))' : '#e5e7eb', fontSize: 13, fontWeight: 700, color: rating > 0 ? 'white' : '#9ca3af', cursor: rating > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit' }}>
                                    {loading ? <><i className="fas fa-spinner fa-spin" style={{ fontSize: 11 }} /> Mengirim...</> : <><i className="fas fa-paper-plane" style={{ fontSize: 11 }} /> Kirim Ulasan</>}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '6px 0 4px' }}>
                            <div style={{ fontSize: 38, marginBottom: 8 }}>🎉</div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--dark)', marginBottom: 5 }}>Terima kasih!</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>Ulasanmu membantu wisatawan lain menentukan pilihan.</div>
                            <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginTop: 12 }}>
                                {[1,2,3,4,5].map(s => (
                                    <i key={s} className={s <= rating ? 'fas fa-star' : 'far fa-star'} style={{ color: s <= rating ? '#f59e0b' : '#d1d5db', fontSize: 22 }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// E-TICKET MODAL
// ─────────────────────────────────────────────────────────────
export function ETicketModal({ order, token, onClose, onStatusChange }) {
    const isUsed       = order.status_tiket === 'Digunakan';
    const tglFormatted = formatTanggal(order.tanggal_kunjungan);
    const qrCanvasRef  = useRef(null);

    useEffect(() => {
        if (isUsed) return;
        const poll = async () => {
            try {
                const res = await api.get(
                    `/admin/tiket/${order.kode_order}`,
                    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
                );
                const statusBaru = res.data?.data?.status_tiket || res.data?.status;
                if (statusBaru === 'Digunakan' && order.status_tiket !== 'Digunakan') {
                    onStatusChange?.(order.id, 'Digunakan');
                }
            } catch {}
        };
        const t1 = setTimeout(poll, 5000);
        const t2 = setInterval(poll, 30000);
        return () => { clearTimeout(t1); clearInterval(t2); };
    }, [order.kode_order, order.status_tiket, isUsed]);

    const handleDownload = () => {
        const canvas    = qrCanvasRef.current?.querySelector('canvas');
        const qrDataUrl = canvas ? canvas.toDataURL('image/png') : null;
        const rows = [
            ['fa-mountain',    'Destinasi',         order.wisata?.nama || '-'],
            ['fa-calendar',    'Tanggal Kunjungan', tglFormatted],
            ['fa-users',       'Pengunjung',        `${order.jumlah_dewasa} Dewasa${order.jumlah_anak > 0 ? `, ${order.jumlah_anak} Anak` : ''}`],
            ['fa-credit-card', 'Metode Pembayaran', order.metode_pembayaran || '-'],
            ['fa-money-bill',  'Total',             formatRupiah(order.total_harga)],
        ];
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>E-Ticket ${order.kode_order}</title>
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
<style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}@page{size:A5 portrait;margin:0}body{font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;display:flex;flex-direction:column;align-items:center;min-height:100vh;padding:32px 20px}.ticket{background:white;border:2px dashed #0d9488;border-radius:20px;padding:32px 28px 28px;max-width:420px;width:100%;position:relative}.ticket-badge{position:absolute;top:-1px;left:50%;transform:translateX(-50%);background:#0f766e;color:white;font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;padding:5px 22px;border-radius:0 0 12px 12px;white-space:nowrap}.booking-code{text-align:center;margin:22px 0 18px}.booking-label{font-size:10px;color:#94a3b8;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:4px}.booking-val{font-family:'Courier New',monospace;font-size:24px;font-weight:900;letter-spacing:4px;color:#0f766e}.qr-wrap{display:flex;justify-content:center;margin:0 0 20px}.qr-box{padding:12px;background:white;border:2px solid #99f6e4;border-radius:14px;display:inline-block}.qr-box img{display:block;width:150px;height:150px}.divider{height:1px;background:#e2e8f0;margin:0 0 16px}.info-row{display:flex;align-items:center;gap:12px;padding:11px 14px;background:#f0fdf4;border-radius:10px;margin-bottom:8px}.info-icon{width:32px;height:32px;background:white;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}.info-icon i{color:#0d9488;font-size:12px}.info-label{font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px}.info-val{font-size:13px;font-weight:600;color:#1e293b}.status-badge{text-align:center;margin-top:16px}.status-badge span{display:inline-flex;align-items:center;gap:6px;padding:6px 18px;border-radius:50px;font-size:11px;font-weight:700;background:#f0fdf4;color:#0f766e;border:1px solid #6ee7b7}.print-btn{margin-top:28px;display:block;width:100%;max-width:420px;padding:14px 0;background:#0d9488;color:white;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer}@media print{body{background:white;padding:0;display:block}.ticket{border-radius:0;max-width:100%;margin:0 auto}.print-btn{display:none!important}}</style>
</head><body>
<div class="ticket"><div class="ticket-badge">E-TICKET</div>
<div class="booking-code"><div class="booking-label">Kode Booking</div><div class="booking-val">${order.kode_order}</div></div>
${qrDataUrl ? `<div class="qr-wrap"><div class="qr-box"><img src="${qrDataUrl}" alt="QR Code ${order.kode_order}" /></div></div>` : ''}
<div class="divider"></div>
${rows.map(([ico, lbl, val]) => `<div class="info-row"><div class="info-icon"><i class="fas ${ico}"></i></div><div><div class="info-label">${lbl}</div><div class="info-val">${val}</div></div></div>`).join('')}
<div class="status-badge"><span><i class="fas fa-shield-alt"></i> Tiket Aktif — Berlaku Sekali Pakai</span></div></div>
<button class="print-btn" onclick="window.print()">🖨️ Print / Simpan sebagai PDF</button>
</body></html>`);
        win.document.close();
    };

    return (
        <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-wrap" style={{ maxWidth: 500 }}>
                <button className="modal-close-btn" onClick={onClose}><i className="fas fa-times" /></button>
                <div className="modal" style={{ borderRadius: 'var(--radius-xl)' }}>
                    <div style={{ background: 'linear-gradient(135deg, var(--teal-800), var(--teal-950))', padding: '18px 26px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-file-alt" style={{ color: 'white', fontSize: 16 }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--teal-300)', fontWeight: 700 }}>E-Ticket Digital</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'white', fontWeight: 700 }}>{order.wisata?.nama}</div>
                        </div>
                    </div>
                    <div style={{ padding: '22px 26px 26px' }}>
                        <div style={{ background: isUsed ? '#f9fafb' : 'white', border: `2px dashed ${isUsed ? '#d1d5db' : 'var(--teal-300)'}`, borderRadius: 16, padding: '22px 20px', position: 'relative', overflow: 'hidden', marginBottom: 18, opacity: isUsed ? 0.65 : 1 }}>
                            <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: isUsed ? '#9ca3af' : 'var(--teal-600)', color: 'white', fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', padding: '4px 16px', borderRadius: '0 0 10px 10px', whiteSpace: 'nowrap' }}>
                                {isUsed ? 'SUDAH DIGUNAKAN' : 'E-TICKET'}
                            </div>
                            {isUsed && (
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) rotate(-25deg)', fontSize: 44, fontWeight: 900, color: 'rgba(0,0,0,.05)', letterSpacing: 6, userSelect: 'none', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                                    DIGUNAKAN
                                </div>
                            )}
                            <div style={{ textAlign: 'center', marginTop: 10, marginBottom: 18 }}>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>Kode Booking</div>
                                <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 900, letterSpacing: 4, color: isUsed ? '#9ca3af' : 'var(--teal-700)' }}>{order.kode_order}</div>
                                {!isUsed && (
                                    <div ref={qrCanvasRef} style={{ display: 'flex', justifyContent: 'center', marginTop: 16, marginBottom: 4 }}>
                                        <div style={{ padding: 12, background: 'white', border: '2px solid var(--teal-200)', borderRadius: 12, display: 'inline-block' }}>
                                            <QRCodeCanvas value={order.kode_order} size={140} level="H" includeMargin={false} fgColor="#0f766e" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { icon: 'fa-mountain',    label: 'Destinasi',         val: order.wisata?.nama || '-' },
                                    { icon: 'fa-calendar',    label: 'Tanggal Kunjungan', val: tglFormatted },
                                    { icon: 'fa-users',       label: 'Pengunjung',        val: `${order.jumlah_dewasa} Dewasa${order.jumlah_anak > 0 ? `, ${order.jumlah_anak} Anak` : ''}` },
                                    { icon: 'fa-credit-card', label: 'Metode Pembayaran', val: order.metode_pembayaran || '-' },
                                    { icon: 'fa-money-bill',  label: 'Total',             val: formatRupiah(order.total_harga) },
                                ].map((row) => (
                                    <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', background: isUsed ? '#f3f4f6' : 'var(--teal-50)', borderRadius: 9 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 7, background: isUsed ? '#e5e7eb' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <i className={`fas ${row.icon}`} style={{ color: isUsed ? '#9ca3af' : 'var(--teal-600)', fontSize: 11 }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{row.label}</div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: isUsed ? '#6b7280' : 'var(--dark)' }}>{row.val}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: 14, textAlign: 'center' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 14px', borderRadius: 50, fontSize: 11, fontWeight: 700, background: isUsed ? '#f3f4f6' : 'var(--teal-50)', color: isUsed ? '#6b7280' : 'var(--teal-700)', border: `1px solid ${isUsed ? '#e5e7eb' : 'var(--teal-200)'}` }}>
                                    <i className={`fas ${isUsed ? 'fa-ban' : 'fa-shield-alt'}`} />
                                    {isUsed ? 'Tiket telah digunakan' : 'Berlaku sekali pakai'}
                                </span>
                            </div>
                            {isUsed && (
                                <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 12, color: '#b91c1c', display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 12, marginBottom: 0 }}>
                                    <i className="fas fa-ban" style={{ marginTop: 1, flexShrink: 0 }} />
                                    <span>Tiket ini sudah digunakan dan tidak dapat dipakai kembali.</span>
                                </div>
                            )}
                            {!isUsed && (
                                <div style={{ padding: '8px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, fontSize: 11, color: '#2563eb', display: 'flex', gap: 6, alignItems: 'center', marginTop: 12 }}>
                                    <i className="fas fa-rotate" style={{ fontSize: 10 }} />
                                    Status tiket diperbarui otomatis. Tunjukkan QR ke petugas wisata.
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {!isUsed && (
                                <button onClick={handleDownload} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 13, padding: '11px 0' }}>
                                    <i className="fas fa-download" /> Unduh E-Ticket
                                </button>
                            )}
                            <button className="btn btn-outline" style={{ flex: isUsed ? 2 : 1, justifyContent: 'center', fontSize: 13, padding: '11px 0' }} onClick={onClose}>Tutup</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// DETAIL MODAL
// ─────────────────────────────────────────────────────────────
function DetailModal({ order, onClose, onShowETicket, onOpenRating }) {
    if (!order) return null;
    const st      = STATUS_TIKET[order.status_tiket] || STATUS_TIKET.Aktif;
    const isUsed  = order.status_tiket === 'Digunakan';
    const canRate = isUsed && !order.sudah_direview;
    const [showDisabledTip, setShowDisabledTip] = useState(false);

    return (
        <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-wrap" style={{ maxWidth: 680 }}>
                <button className="modal-close-btn" onClick={onClose}><i className="fas fa-times" /></button>
                <div className="modal" style={{ borderRadius: 'var(--radius-xl)' }}>
                    <div style={{ background: 'linear-gradient(135deg, var(--teal-800), var(--teal-950))', padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, opacity: .05, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--teal-300)', fontWeight: 700, marginBottom: 8 }}>
                                <i className="fas fa-ticket-alt" style={{ marginRight: 6 }} />Riwayat Tiket
                            </div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'white', fontWeight: 700, marginBottom: 4 }}>{order.wisata?.nama}</div>
                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', fontFamily: 'monospace', letterSpacing: 1 }}>{order.kode_order}</div>
                        </div>
                    </div>
                    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 50, fontSize: 12, fontWeight: 700, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                                <i className={`fas ${st.icon}`} /> Tiket: {st.label}
                            </span>
                        </div>
                        <div className="rt-detail-grid">
                            {[
                                { icon: 'fa-calendar-check', label: 'Tanggal Kunjungan', value: formatTanggal(order.tanggal_kunjungan) },
                                { icon: 'fa-credit-card',    label: 'Metode Bayar',      value: order.metode_pembayaran || '-' },
                                { icon: 'fa-clock',          label: 'Tanggal Pesan',     value: formatDateTime(order.created_at) },
                                { icon: 'fa-tag',            label: 'Kategori Wisata',   value: order.wisata?.kategori || '-' },
                            ].map((item) => (
                                <div key={item.label} style={{ padding: '14px 16px', background: 'var(--teal-50)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <i className={`fas ${item.icon}`} style={{ color: 'var(--teal-500)' }} />{item.label}
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)' }}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                                <i className="fas fa-list" style={{ color: 'var(--teal-500)', marginRight: 8 }} />Rincian Tiket
                            </div>
                            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                                    <thead>
                                        <tr style={{ background: 'var(--teal-50)' }}>
                                            {['Jenis', 'Jumlah', 'Subtotal'].map((h) => (
                                                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--teal-700)', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.jumlah_dewasa > 0 && (
                                            <tr style={{ borderTop: '1px solid var(--border)' }}>
                                                <td style={{ padding: '12px 14px', fontWeight: 500 }}>Dewasa</td>
                                                <td style={{ padding: '12px 14px' }}>{order.jumlah_dewasa} orang</td>
                                                <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--teal-700)' }}>—</td>
                                            </tr>
                                        )}
                                        {order.jumlah_anak > 0 && (
                                            <tr style={{ borderTop: '1px solid var(--border)' }}>
                                                <td style={{ padding: '12px 14px', fontWeight: 500 }}>Anak</td>
                                                <td style={{ padding: '12px 14px' }}>{order.jumlah_anak} orang</td>
                                                <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--teal-700)' }}>—</td>
                                            </tr>
                                        )}
                                        <tr style={{ borderTop: '2px solid var(--teal-200)', background: 'var(--teal-50)' }}>
                                            <td colSpan={2} style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right' }}>Total</td>
                                            <td style={{ padding: '12px 14px', fontWeight: 900, fontSize: 16, color: 'var(--teal-700)' }}>{formatRupiah(order.total_harga)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {isUsed && order.sudah_direview && (
                            <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, fontSize: 13, color: '#15803d', display: 'flex', gap: 8 }}>
                                <i className="fas fa-star" style={{ color: '#f59e0b', marginTop: 1 }} />
                                <span>Kamu sudah memberikan ulasan untuk kunjungan ke wisata ini.</span>
                            </div>
                        )}
                        <div className="rt-modal-actions">
                            {canRate && (
                                <button
                                    onClick={() => { onClose(); onOpenRating(order); }}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 50, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', border: 'none', boxShadow: '0 2px 10px rgba(245,158,11,.35)' }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '.88'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                >
                                    <i className="fas fa-star" /> Beri Rating
                                </button>
                            )}
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => { if (!isUsed) onShowETicket(order); }}
                                    onMouseEnter={() => isUsed && setShowDisabledTip(true)}
                                    onMouseLeave={() => setShowDisabledTip(false)}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 50, fontSize: 13, fontWeight: 600, cursor: isUsed ? 'not-allowed' : 'pointer', background: isUsed ? '#f3f4f6' : 'var(--teal-600)', color: isUsed ? '#9ca3af' : 'white', border: `1.5px solid ${isUsed ? '#e5e7eb' : 'var(--teal-600)'}` }}>
                                    <i className={`fas ${isUsed ? 'fa-ban' : 'fa-file-alt'}`} />
                                    {isUsed ? 'E-Ticket Tidak Tersedia' : 'Lihat E-Ticket'}
                                </button>
                                {isUsed && showDisabledTip && (
                                    <div style={{ position: 'absolute', bottom: '115%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,.82)', color: 'white', fontSize: 11, padding: '6px 12px', borderRadius: 8, whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 10 }}>
                                        <i className="fas fa-info-circle" style={{ marginRight: 5 }} />Tiket sudah digunakan — tidak dapat dibuka kembali
                                        <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', border: '5px solid transparent', borderTopColor: 'rgba(0,0,0,.82)' }} />
                                    </div>
                                )}
                            </div>
                            <button className="btn btn-outline" style={{ fontSize: 13 }} onClick={onClose}>Tutup</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// ORDER CARD
// ─────────────────────────────────────────────────────────────
function OrderCard({ order, onClick, onOpenRating }) {
    const st         = STATUS_TIKET[order.status_tiket] || STATUS_TIKET.Aktif;
    const totalOrang = (order.jumlah_anak || 0) + (order.jumlah_dewasa || 0);
    const isUsed     = order.status_tiket === 'Digunakan';
    const canRate    = isUsed && !order.sudah_direview;

    return (
        <div
            style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', transition: 'var(--transition)', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
        >
            {/* Thumbnail */}
            <div onClick={onClick} style={{ position: 'relative', height: 140, overflow: 'hidden', flexShrink: 0 }}>
                {order.wisata?.thumbnail ? (
                    <img src={getThumbUrl(order.wisata.thumbnail)} alt={order.wisata?.nama}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isUsed ? 'grayscale(35%)' : 'none' }}
                        onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', background: 'var(--teal-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-mountain" style={{ fontSize: 40, color: 'var(--teal-400)' }} />
                    </div>
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,29,61,.7) 0%, transparent 60%)' }} />
                <div style={{ position: 'absolute', top: 12, right: 12, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 50, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color, border: `1px solid ${st.border}`, backdropFilter: 'blur(8px)' }}>
                    <i className={`fas ${st.icon}`} /> {st.label}
                </div>
                {order.wisata?.kategori && (
                    <div style={{ position: 'absolute', bottom: 12, left: 12, fontSize: 11, fontWeight: 600, color: 'white', background: 'var(--teal-600)', padding: '4px 10px', borderRadius: 50, letterSpacing: 1, textTransform: 'uppercase' }}>
                        {order.wisata.kategori}
                    </div>
                )}
                {isUsed && order.sudah_direview && (
                    <div style={{ position: 'absolute', bottom: 12, right: 12, fontSize: 11, fontWeight: 600, color: 'white', background: 'rgba(245,158,11,.9)', padding: '4px 10px', borderRadius: 50, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <i className="fas fa-star" style={{ fontSize: 10 }} /> Direview
                    </div>
                )}
            </div>

            {/* Info */}
            <div onClick={onClick} style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--dark)', marginBottom: 4, lineHeight: 1.3 }}>{order.wisata?.nama || '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: 1 }}>{order.kode_order}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                        { icon: 'fa-calendar-check', text: formatTanggal(order.tanggal_kunjungan) },
                        { icon: 'fa-users',          text: `${totalOrang} orang` },
                        { icon: 'fa-credit-card',    text: order.metode_pembayaran || '—' },
                    ].map((item) => (
                        <div key={item.icon} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                            <i className={`fas ${item.icon}`} style={{ color: 'var(--teal-400)', width: 14, textAlign: 'center' }} /> {item.text}
                        </div>
                    ))}
                </div>
                <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
                    <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--teal-700)' }}>{formatRupiah(order.total_harga)}</div>
                </div>
            </div>

            {canRate && (
                <div style={{ padding: '0 16px 16px' }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onOpenRating(order); }}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            padding: '10px 0', borderRadius: 12, border: 'none',
                            background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                            color: 'white', fontSize: 13, fontWeight: 700,
                            cursor: 'pointer', fontFamily: 'inherit',
                            transition: 'opacity .15s, transform .15s',
                            boxShadow: '0 3px 12px rgba(245,158,11,.35)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '.88'; e.currentTarget.style.transform = 'scale(.98)'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '1';   e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                        <i className="fas fa-star" style={{ fontSize: 12 }} />
                        Beri Rating Wisata
                    </button>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function RiwayatTiket() {
    // ── Ambil session SSO ──────────────────────────────────────
    const [session, setSession] = useState(() => getStoredSsoSession());

    useEffect(() => listenSsoSessionChange(() => {
        setSession(getStoredSsoSession());
    }), []);

    const token      = session?.token || null;
    const user       = session?.user  || null;
    const userId     = user?.id       || user?.uuid || null;
    const isLoggedIn = Boolean(token);

    // ── State halaman ──────────────────────────────────────────
    const [orders,       setOrders]       = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [error,        setError]        = useState(null);
    const [filter,       setFilter]       = useState('semua');
    const [search,       setSearch]       = useState('');
    const [selected,     setSelected]     = useState(null);
    const [eTicketOrder, setETicketOrder] = useState(null);
    const [reviewToast,  setReviewToast]  = useState(null);
    const [ratingOrder,  setRatingOrder]  = useState(null);
    const [reviewedWisataIds, setReviewedWisataIds] = useState(new Set());

    const handleStatusChange = (orderId, statusBaru) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status_tiket: statusBaru } : o));
        setETicketOrder(prev => prev && prev.id === orderId ? { ...prev, status_tiket: statusBaru } : prev);
    };

    // ── Fetch tiket milik user yang login ──────────────────────
    useEffect(() => {
        // Jika belum login, tidak perlu fetch
        if (!isLoggedIn) {
            setLoading(false);
            return;
        }

        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                // Gunakan endpoint authenticated — token dikirim via Authorization header
                const res = await api.get('/tiket', {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });
                const data = res.data?.data ?? res.data ?? [];
                setOrders(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                // Jika 401, session mungkin kedaluwarsa
                if (err.response?.status === 401) {
                    setError('Sesi kamu telah berakhir. Silakan login ulang.');
                } else {
                    setError('Gagal memuat riwayat tiket. Coba beberapa saat lagi.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [isLoggedIn, token]);

    // ── Review toast otomatis ──────────────────────────────────
    useEffect(() => {
        if (loading || reviewToast || ratingOrder) return;
        const reviewable = orders.find(o =>
            o.status_tiket === 'Digunakan' &&
            !o.sudah_direview &&
            !reviewedWisataIds.has(o.wisata_id)
        );
        if (reviewable) {
            const t = setTimeout(() => setReviewToast(reviewable), 1400);
            return () => clearTimeout(t);
        }
    }, [loading, orders, reviewedWisataIds, ratingOrder]);

    const handleRatingSuccess = (wisataId) => {
        setReviewedWisataIds(prev => new Set([...prev, wisataId]));
        setOrders(prev => prev.map(o => o.wisata_id === wisataId ? { ...o, sudah_direview: true } : o));
        setReviewToast(null);
        setRatingOrder(null);
    };

    const handleReviewClose = () => {
        if (reviewToast) setReviewedWisataIds(prev => new Set([...prev, reviewToast.wisata_id]));
        setReviewToast(null);
    };

    const handleOpenRating = (order) => {
        setReviewToast(null);
        setRatingOrder(order);
    };

    const filtered = useMemo(() => {
        let data = [...orders];
        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter(o =>
                o.wisata?.nama?.toLowerCase().includes(q) ||
                o.kode_order?.toLowerCase().includes(q)
            );
        }
        if (filter !== 'semua') data = data.filter(o => o.status_tiket === filter);
        return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [orders, search, filter]);

    const stats = useMemo(() => ({
        total:          orders.length,
        aktif:          orders.filter(o => o.status_tiket === 'Aktif').length,
        sudahDigunakan: orders.filter(o => o.status_tiket === 'Digunakan').length,
    }), [orders]);

    // ── Render: belum login ────────────────────────────────────
    if (!isLoggedIn) {
        return (
            <div className="page-riwayat" style={{ background: 'var(--cream)', minHeight: '100vh' }}>
                <style>{RESPONSIVE_STYLE}</style>
                <div className="page-hero-v2 page-hero-v2--riwayat" style={{ background: 'linear-gradient(135deg, #102d4d 0%, #1e3c6d 55%, #284d83 100%)' }}>
                    <div className="page-hero-v2__overlay" />
                    <div className="page-hero-v2__pattern" />
                    <div className="page-hero-v2__deco">{Array.from({ length: 25 }).map((_, i) => <span key={i} />)}</div>
                    <div className="container page-hero-v2__content">
                        <div className="page-hero-v2__label"><i className="fas fa-ticket-alt" /> Tiket Saya</div>
                        <h1 className="page-hero-v2__title">Riwayat Tiket</h1>
                        <p className="page-hero-v2__desc">Kelola dan pantau semua tiket wisata yang pernah kamu pesan di Purbalingga Smart City.</p>
                    </div>
                </div>
                <div className="container page-body">
                    <NotLoggedIn />
                </div>
            </div>
        );
    }

    // ── Render: sudah login ────────────────────────────────────
    return (
        <div className="page-riwayat" style={{ background: 'var(--cream)', minHeight: '100vh' }}>
            <style>{RESPONSIVE_STYLE}</style>

            {/* Hero */}
            <div className="page-hero-v2 page-hero-v2--riwayat" style={{ background: 'linear-gradient(135deg, #102d4d 0%, #1e3c6d 55%, #284d83 100%)' }}>
                <div className="page-hero-v2__overlay" />
                <div className="page-hero-v2__pattern" />
                <div className="page-hero-v2__deco">{Array.from({ length: 25 }).map((_, i) => <span key={i} />)}</div>
                <div className="container page-hero-v2__content">
                    <div className="page-hero-v2__label"><i className="fas fa-ticket-alt" /> Tiket Saya</div>
                    <h1 className="page-hero-v2__title">Riwayat Tiket</h1>
                    <p className="page-hero-v2__desc">Kelola dan pantau semua tiket wisata yang pernah kamu pesan di Purbalingga Smart City.</p>
                    <div className="page-hero-v2__search">
                        <i className="fas fa-search page-hero-v2__search-icon" />
                        <input type="text" placeholder="Cari nama wisata atau kode order..."
                            value={search} onChange={(e) => setSearch(e.target.value)}
                            className="page-hero-v2__search-input" />
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="container page-body">

                {/* Stats */}
                <div className="rt-stats-grid">
                    {[
                        { label: 'Total Pesanan',   value: loading ? '...' : stats.total,          icon: 'fa-receipt',      color: 'var(--teal-600)' },
                        { label: 'Tiket Aktif',     value: loading ? '...' : stats.aktif,          icon: 'fa-ticket-alt',   color: '#16a34a' },
                        { label: 'Sudah Digunakan', value: loading ? '...' : stats.sudahDigunakan, icon: 'fa-check-circle', color: '#6b7280' },
                    ].map((s) => (
                        <div key={s.label} style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '16px 14px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'var(--shadow-sm)' }}>
                            <div className="rt-stat-icon" style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <i className={`fas ${s.icon}`} style={{ color: s.color, fontSize: 18 }} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div className="rt-stat-value" style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color: 'var(--dark)', lineHeight: 1 }}>{s.value}</div>
                                <div className="rt-stat-label" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.3 }}>{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div style={{ padding: '16px 20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#b91c1c', fontSize: 14, display: 'flex', gap: 10, marginBottom: 24 }}>
                        <i className="fas fa-exclamation-circle" style={{ marginTop: 2 }} />{error}
                    </div>
                )}

                {/* Toolbar */}
                {!loading && !error && (
                    <div className="rt-toolbar">
                        <div className="rt-filter-tabs">
                            {FILTER_OPTIONS.map((f) => (
                                <button key={f.value} className={`rt-filter-tab${filter === f.value ? ' active' : ''}`} onClick={() => setFilter(f.value)}>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{filtered.length} pesanan ditemukan</div>
                    </div>
                )}

                {/* Loading skeleton */}
                {loading && (
                    <div className="rt-card-grid">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                                <div style={{ height: 140, background: '#e2e8f0', animation: 'pulse 1.4s ease infinite' }} />
                                <div style={{ padding: 20 }}>
                                    {[80, 60, 40].map((w, j) => (
                                        <div key={j} style={{ height: 14, width: `${w}%`, background: '#e2e8f0', borderRadius: 7, marginBottom: 10, animation: 'pulse 1.4s ease infinite' }} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Grid */}
                {!loading && !error && (
                    filtered.length === 0 ? (
                        <div className="page-empty">
                            <i className="fas fa-ticket-alt" />
                            <p>{search || filter !== 'semua' ? 'Tidak ada tiket yang sesuai filter.' : 'Kamu belum pernah memesan tiket.'}</p>
                            {(search || filter !== 'semua') && (
                                <button className="btn btn-outline" onClick={() => { setFilter('semua'); setSearch(''); }}>Reset Filter</button>
                            )}
                        </div>
                    ) : (
                        <div className="rt-card-grid">
                            {filtered.map(order => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    onClick={() => setSelected(order)}
                                    onOpenRating={handleOpenRating}
                                />
                            ))}
                        </div>
                    )
                )}

                {/* CTA */}
                <div style={{ marginTop: 48, background: 'linear-gradient(135deg, var(--teal-700), var(--teal-900))', borderRadius: 'var(--radius-xl)', padding: '36px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, opacity: .05, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--teal-300)', fontWeight: 700, marginBottom: 8 }}><i className="fas fa-map-marked-alt" style={{ marginRight: 6 }} />Destinasi Wisata</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'white', fontWeight: 700, marginBottom: 6 }}>Mau liburan lagi ke Purbalingga?</div>
                        <div style={{ fontSize: 14, color: 'rgba(255,255,255,.7)' }}>Temukan dan pesan tiket wisata favoritmu sekarang.</div>
                    </div>
                    <a href="/wisata" className="btn btn-gold" style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
                        <i className="fas fa-ticket-alt" /> Pesan Tiket Baru
                    </a>
                </div>
            </div>

            {/* ── Modals & Toasts ── */}
            {selected && (
                <DetailModal
                    order={selected}
                    onClose={() => setSelected(null)}
                    onShowETicket={(order) => { setSelected(null); setETicketOrder(order); }}
                    onOpenRating={handleOpenRating}
                />
            )}
            {eTicketOrder && (
                <ETicketModal
                    order={eTicketOrder}
                    token={token}
                    onClose={() => setETicketOrder(null)}
                    onStatusChange={handleStatusChange}
                />
            )}
            {ratingOrder && (
                <RatingModal
                    order={ratingOrder}
                    token={token}
                    onClose={() => setRatingOrder(null)}
                    onSubmitSuccess={handleRatingSuccess}
                />
            )}
            {reviewToast && (
                <ReviewToast
                    order={reviewToast}
                    token={token}
                    onClose={handleReviewClose}
                    onSubmitSuccess={handleRatingSuccess}
                />
            )}
        </div>
    );
}