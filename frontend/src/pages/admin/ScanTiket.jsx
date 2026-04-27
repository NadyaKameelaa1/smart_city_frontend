import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import AdminLayout from './AdminLayout';
import api from '../../api/axios';

export default function ScanTiket() {
    const [scanning,  setScanning]  = useState(false);
    const [result,    setResult]    = useState(null);
    const [error,     setError]     = useState(null);  // null = tidak ada error
    const [loading,   setLoading]   = useState(false);
    const [validated, setValidated] = useState(false);

    const html5QrRef = useRef(null);
    const isRunning  = useRef(false);

    // ── Cleanup saat unmount ──────────────────────────────
    useEffect(() => {
        return () => {
            if (html5QrRef.current && isRunning.current) {
                html5QrRef.current.stop().catch(() => {});
                isRunning.current = false;
            }
        };
    }, []);

    // ── Start scanner — pakai setTimeout agar DOM #qr-reader ──
    // sudah benar-benar ter-render sebelum Html5Qrcode diinit
    useEffect(() => {
        if (!scanning) return;

        let html5Qr = null;
        let cancelled = false;

        // Beri React waktu 1 frame untuk render #qr-reader ke DOM
        const t = setTimeout(async () => {
            if (cancelled) return;

            const el = document.getElementById('qr-reader');
            if (!el) {
                setError('Elemen kamera tidak ditemukan. Coba refresh halaman.');
                setScanning(false);
                return;
            }

            try {
                html5Qr = new Html5Qrcode('qr-reader');
                html5QrRef.current = html5Qr;

                await html5Qr.start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: { width: 240, height: 240 } },
                    async (decodedText) => {
                        // Berhasil scan → stop, lalu cek tiket
                        if (isRunning.current) {
                            await html5Qr.stop().catch(() => {});
                            isRunning.current = false;
                        }
                        setScanning(false);
                        await cekTiket(decodedText);
                    },
                    () => {} // per-frame error diabaikan
                );

                isRunning.current = true;
            } catch (err) {
                isRunning.current = false;
                setError('Tidak bisa mengakses kamera. Pastikan izin kamera sudah diberikan.');
                setScanning(false);
            }
        }, 120); // 120ms cukup untuk React render DOM

        return () => {
            cancelled = true;
            clearTimeout(t);
            if (html5QrRef.current && isRunning.current) {
                html5QrRef.current.stop().catch(() => {});
                isRunning.current = false;
            }
        };
    }, [scanning]);

    // ─────────────────────────────────────────────────────
    const startScan = () => {
        setResult(null);
        setError(null);
        setValidated(false);
        setScanning(true);
    };

    const stopScan = () => {
        if (html5QrRef.current && isRunning.current) {
            html5QrRef.current.stop().catch(() => {});
            isRunning.current = false;
        }
        setScanning(false);
    };

    const cekTiket = async (kodeOrder) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/admin/tiket/${kodeOrder}`);
            setResult(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Tiket tidak ditemukan.');
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    const handleGunakan = async () => {
        if (!result) return;
        setLoading(true);
        try {
            await api.patch(`/admin/tiket/${result.kode_order}/gunakan`);
            setResult(prev => ({ ...prev, status_tiket: 'Digunakan' }));
            setValidated(true);
            setError(null);
        } catch (err) {
            const status = err.response?.status;
            const msg    = err.response?.data?.message;

            if (status === 403)      setError('WRONG_WISATA');
            else if (status === 422) setError('ALREADY_USED');
            else                     setError(msg || 'Gagal memvalidasi tiket.');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setError(null);
        setValidated(false);
        setScanning(false);
    };

    const isAktif = result?.status_tiket === 'Aktif';

    // ─────────────────────────────────────────────────────
    return (
        <AdminLayout>
            <div style={{ maxWidth: 540, margin: '0 auto', padding: '32px 24px' }}>

                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--teal-600)', marginBottom: 6 }}>
                        <i className="fa-solid fa-qrcode" /> Admin — Validasi Tiket
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>
                        Scan Tiket Wisata
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        Arahkan kamera ke QR code pada e-ticket pengunjung untuk memvalidasi tiket masuk.
                    </p>
                </div>

                {/* ── Area Kamera ── */}
                {scanning && (
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ borderRadius: 16, overflow: 'hidden', border: '2px solid var(--teal-200)', background: '#000', minHeight: 280 }}>
                            {/* #qr-reader harus ada di DOM sebelum Html5Qrcode diinit */}
                            <div id="qr-reader" style={{ width: '100%' }} />
                        </div>
                        <button onClick={stopScan} style={{ marginTop: 12, width: '100%', padding: '11px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                            <i className="fa-solid fa-times" style={{ marginRight: 6 }} /> Batal Scan
                        </button>
                    </div>
                )}

                {/* ── Tombol mulai scan ── */}
                {!scanning && !result && !loading && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: 100, height: 100, margin: '0 auto 24px', borderRadius: 24, background: 'var(--teal-50)', border: '2px dashed var(--teal-300)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fa-solid fa-qrcode" style={{ fontSize: 40, color: 'var(--teal-400)' }} />
                        </div>
                        <button onClick={startScan} style={{ padding: '14px 36px', borderRadius: 50, border: 'none', background: 'var(--teal-600)', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 14px rgba(64,114,175,.3)', fontFamily: 'var(--font-body)' }}>
                            <i className="fa-solid fa-camera" /> Mulai Scan QR Code
                        </button>
                        <p style={{ marginTop: 14, fontSize: 12, color: 'var(--text-muted)' }}>
                            Pastikan izin kamera sudah diberikan di browser
                        </p>
                    </div>
                )}

                {/* ── Loading ── */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: 'var(--teal-500)', marginBottom: 14, display: 'block' }} />
                        <div style={{ fontSize: 14, fontWeight: 600 }}>Memverifikasi tiket...</div>
                    </div>
                )}

                {/* ── Error — hanya render jika error !== null ── */}
                {error !== null && !loading && (
                    <div style={{ marginBottom: 16 }}>

                        {/* Tiket bukan milik wisata ini (403) */}
                        {error === 'WRONG_WISATA' && (
                            <div style={{ padding: '20px 22px', background: '#fff7ed', border: '2px solid #fed7aa', borderRadius: 14, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', border: '1.5px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <i className="fa-solid fa-map-location-dot" style={{ color: '#ea580c', fontSize: 20 }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 15, color: '#c2410c', marginBottom: 5 }}>
                                        Tiket Bukan untuk Wisata Ini
                                    </div>
                                    <div style={{ fontSize: 13, color: '#9a3412', lineHeight: 1.6, marginBottom: 14 }}>
                                        QR code ini adalah tiket untuk destinasi wisata lain. Pastikan pengunjung menunjukkan tiket yang sesuai dengan wisata ini.
                                    </div>
                                    <button onClick={reset} style={{ padding: '8px 18px', borderRadius: 8, border: '1.5px solid #fed7aa', background: 'white', color: '#ea580c', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        <i className="fa-solid fa-qrcode" /> Scan Tiket Lain
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Tiket sudah digunakan (422) */}
                        {error === 'ALREADY_USED' && (
                            <div style={{ padding: '20px 22px', background: '#fef2f2', border: '2px solid #fecaca', borderRadius: 14, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', border: '1.5px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <i className="fa-solid fa-ban" style={{ color: '#dc2626', fontSize: 20 }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 15, color: '#b91c1c', marginBottom: 5 }}>
                                        Tiket Sudah Digunakan
                                    </div>
                                    <div style={{ fontSize: 13, color: '#991b1b', lineHeight: 1.6, marginBottom: 14 }}>
                                        Tiket ini sudah pernah divalidasi dan <strong>tidak dapat digunakan kembali</strong>. Kemungkinan pengunjung mencoba menggunakan tiket lama (PDF/screenshot).
                                    </div>
                                    <button onClick={reset} style={{ padding: '8px 18px', borderRadius: 8, border: '1.5px solid #fecaca', background: 'white', color: '#dc2626', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        <i className="fa-solid fa-rotate-right" /> Scan Tiket Baru
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Error umum — selain kode khusus di atas */}
                        {error !== 'WRONG_WISATA' && error !== 'ALREADY_USED' && (
                            <div style={{ padding: '16px 20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#b91c1c' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, marginBottom: 10 }}>
                                    <i className="fa-solid fa-circle-exclamation" /> {error}
                                </div>
                                <button onClick={reset} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #fecaca', background: 'white', color: '#b91c1c', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)' }}>
                                    <i className="fa-solid fa-rotate-right" style={{ marginRight: 6 }} /> Coba Lagi
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Hasil scan ── */}
                {result && !loading && (
                    <div style={{ border: `2px solid ${validated ? '#bbf7d0' : isAktif ? 'var(--teal-300)' : '#fecaca'}`, borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>

                        <div style={{ padding: '16px 22px', background: validated ? '#16a34a' : isAktif ? 'var(--teal-600)' : '#b91c1c', color: 'white', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <i className={`fa-solid ${validated ? 'fa-circle-check' : isAktif ? 'fa-ticket-alt' : 'fa-ban'}`} style={{ fontSize: 20 }} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 16 }}>
                                    {validated ? 'Tiket Berhasil Divalidasi!' : isAktif ? 'Tiket Valid & Aktif' : 'Tiket Sudah Digunakan'}
                                </div>
                                <div style={{ fontSize: 12, opacity: .8, fontFamily: 'monospace', letterSpacing: 1 }}>{result.kode_order}</div>
                            </div>
                        </div>

                        <div style={{ padding: '20px 22px', background: 'white' }}>
                            {[
                                { label: 'Destinasi',         val: result.wisata?.nama || '-', icon: 'fa-mountain' },
                                { label: 'Tanggal Kunjungan', val: result.tanggal_kunjungan,   icon: 'fa-calendar' },
                                { label: 'Pengunjung',        val: `${result.jumlah_dewasa} Dewasa${result.jumlah_anak > 0 ? `, ${result.jumlah_anak} Anak` : ''}`, icon: 'fa-users' },
                                { label: 'Total Pembayaran',  val: 'Rp ' + Number(result.total_harga).toLocaleString('id-ID'), icon: 'fa-money-bill' },
                            ].map((row, i) => (
                                <div key={row.label} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <i className={`fa-solid ${row.icon}`} style={{ color: 'var(--teal-500)', fontSize: 13 }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{row.label}</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)' }}>{row.val}</div>
                                    </div>
                                </div>
                            ))}

                            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                                {isAktif && !validated && (
                                    <button onClick={handleGunakan} disabled={loading}
                                        style={{ flex: 2, padding: '13px', borderRadius: 10, border: 'none', background: 'var(--teal-600)', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'var(--font-body)' }}>
                                        <i className="fa-solid fa-check" /> Tandai Sudah Digunakan
                                    </button>
                                )}
                                {validated && (
                                    <div style={{ flex: 2, padding: '13px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        <i className="fa-solid fa-circle-check" /> Tiket Tervalidasi
                                    </div>
                                )}
                                {!isAktif && !validated && (
                                    <div style={{ flex: 2, padding: '13px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        <i className="fa-solid fa-ban" /> Tiket Tidak Valid
                                    </div>
                                )}
                                <button onClick={reset}
                                    style={{ flex: 1, padding: '13px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                                    {validated ? 'Selesai' : 'Scan Lagi'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}