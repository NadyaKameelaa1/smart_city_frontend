// src/pages/Tiket.jsx
import { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../api/axios';

// ─── Helpers ─────────────────────────────────────────────────
const formatRupiah = (n) => {
    if (!n || n === 0) return 'Gratis';
    return 'Rp ' + Number(n).toLocaleString('id-ID');
};

const getTodayString = () => new Date().toISOString().split('T')[0];

const isWeekend = (dateStr) => {
    if (!dateStr) return false;
    const day = new Date(dateStr + 'T12:00:00').getDay();
    return day === 0 || day === 6;
};

const getHargaByDate = (prices, dateStr) => {
    if (!prices || prices.length === 0) return { harga_dewasa: 0, harga_anak: 0 };
    const dayType = isWeekend(dateStr) ? 'weekend' : 'weekday';
    const found = prices.find(p => p.day_type === dayType);
    return found || prices[0];
};

const BASE_IMAGE_URL = (import.meta.env.VITE_API_URL || 'https://apismartcity.qode.my.id')
    .replace(/\/api\/?$/, '')
    .replace(/\/$/, '') + '/storage/';
const PAYMENT_APP_URL = (import.meta.env.VITE_PURBALINGGA_PAY_URL || 'https://smartpay.qode.my.id').replace(/\/$/, '');
const PAYMENT_APP_ORIGIN = new URL(PAYMENT_APP_URL).origin;
const PAYMENT_MESSAGE_TYPE = 'PURBALINGGA_PAY_QRIS_SUCCESS';

const makePaymentSessionId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return `qris-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const buildQrisPayload = ({ sessionId, wisata, qty, form, tanggal, total }) => JSON.stringify({
    paymentType: 'ticket_qris',
    payment_type: 'ticket_qris',
    cardId: sessionId,
    card_id: sessionId,
    sessionId,
    session_id: sessionId,
    wisataId: wisata?.id,
    wisataName: wisata?.nama,
    wisata_name: wisata?.nama,
    merchantName: 'Purbalingga Smart City',
    merchant_name: 'Purbalingga Smart City',
    saldo: total,
    nominal: total,
    amount: total,
    description: `Pembayaran tiket ${wisata?.nama || 'wisata'} untuk ${form.nama}`,
    title: `Pembayaran tiket ${wisata?.nama || 'wisata'}`,
    customerName: form.nama,
    customerPhone: form.hp,
    travelDate: tanggal,
    adultQty: qty.dewasa,
    childQty: qty.anak,
});

// ─── CSS ─────────────────────────────────────────────────────
const STYLE = `
.tiket-input {
    width: 100%; padding: 13px 18px;
    border-radius: var(--radius-md);
    border: 1.5px solid var(--border);
    font-size: 14px; font-family: var(--font-body);
    outline: none; background: white; box-sizing: border-box;
    transition: border-color .2s, box-shadow .2s; color: var(--text-dark);
}
.tiket-input:focus {
    border-color: var(--teal-500);
    box-shadow: 0 0 0 3px rgba(79,131,191,.15);
}
.tiket-input.error { border-color: #ef4444; }
.tiket-input.error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,.12); }
.tiket-select {
    width: 100%; padding: 13px 18px;
    border-radius: var(--radius-md);
    border: 1.5px solid var(--border);
    font-size: 14px; font-family: var(--font-body);
    outline: none; background: white; box-sizing: border-box;
    transition: border-color .2s, box-shadow .2s; color: var(--text-dark);
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 16px center;
    padding-right: 42px;
    cursor: pointer;
}
.tiket-select:focus {
    border-color: var(--teal-500);
    box-shadow: 0 0 0 3px rgba(79,131,191,.15);
}
.tiket-select.error { border-color: #ef4444; }

/* ── Responsive layout ── */
.tiket-body {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 40px;
    align-items: start;
}
.tiket-form-card {
    background: white;
    border-radius: var(--radius-xl);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-card);
    padding: 36px 40px;
}

/* Order summary inline — hanya tampil di mobile */
.order-summary-inline {
    display: none;
}

@media (max-width: 900px) {
    .tiket-body {
        grid-template-columns: 1fr;
        gap: 24px;
    }
    /* Sembunyikan sidebar kanan di mobile */
    .tiket-sidebar {
        display: none;
    }
    /* Tampilkan order summary inline di atas form */
    .order-summary-inline {
        display: block;
        margin-bottom: 0;
    }
    .tiket-form-card {
        padding: 24px 20px;
    }
}

@media (max-width: 600px) {
    .tiket-form-card {
        padding: 20px 16px;
        border-radius: var(--radius-lg);
    }
}

/* Step indicator responsive */
.step-indicator-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    margin-bottom: 48px;
    overflow-x: auto;
    padding-bottom: 4px;
}
.step-connector {
    width: 80px;
    height: 2px;
    margin: 0 8px;
    margin-bottom: 28px;
    transition: background .3s;
    flex-shrink: 0;
}
@media (max-width: 600px) {
    .step-label { display: none !important; }
    .step-connector { width: 32px; margin: 0 4px; margin-bottom: 28px; }
    .step-circle { width: 36px !important; height: 36px !important; }
    .step-indicator-wrap { margin-bottom: 28px; }
}

@keyframes successPulse {
    0%   { transform: scale(0.5); opacity: 0; }
    60%  { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
}
@keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
}
.success-icon { animation: successPulse .5s ease forwards; }
.success-card { animation: fadeSlideUp .4s ease .2s both; }
.success-steps { animation: fadeSlideUp .4s ease .35s both; }
.success-actions { animation: fadeSlideUp .4s ease .5s both; }
.step-card:hover { background: var(--teal-50) !important; border-color: var(--teal-300) !important; }
`;

// ─── Step Indicator ──────────────────────────────────────────
const STEPS = [
    { num: 1, label: 'Pilih Tiket',     icon: 'fa-ticket-alt' },
    { num: 2, label: 'Data Pengunjung', icon: 'fa-user-edit' },
    { num: 3, label: 'Pembayaran',      icon: 'fa-credit-card' },
    { num: 4, label: 'Selesai',         icon: 'fa-check-circle' },
];

function StepIndicator({ current }) {
    return (
        <div className="step-indicator-wrap">
            {STEPS.map((s, i) => {
                const done   = current > s.num;
                const active = current === s.num;
                return (
                    <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <div
                                className="step-circle"
                                style={{
                                    width: 44, height: 44, borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: done || active ? 'var(--teal-600)' : 'white',
                                    border: done || active ? '2px solid var(--teal-600)' : '2px solid var(--border)',
                                    color: done || active ? 'white' : 'var(--text-muted)',
                                    fontSize: 16, fontWeight: 700, transition: 'all .3s',
                                    boxShadow: active ? '0 0 0 4px rgba(64,114,175,.15)' : 'none',
                                    flexShrink: 0,
                                }}
                            >
                                {done
                                    ? <i className="fas fa-check" style={{ fontSize: 14 }} />
                                    : <i className={`fas ${s.icon}`} style={{ fontSize: 14 }} />}
                            </div>
                            <div
                                className="step-label"
                                style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? 'var(--teal-700)' : done ? 'var(--teal-600)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}
                            >
                                {s.label}
                            </div>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div
                                className="step-connector"
                                style={{ background: current > s.num ? 'var(--teal-500)' : 'var(--border)' }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Order Summary ────────────────────────────────────────────
// compact=true → versi ringkas untuk inline mobile
function OrderSummary({ wisata, qty, tanggal, compact = false }) {
    if (!wisata) return null;

    const harga = getHargaByDate(wisata.prices, tanggal);
    const total = qty.dewasa * (harga.harga_dewasa || 0) + qty.anak * (harga.harga_anak || 0);
    const dayType = isWeekend(tanggal) ? 'Weekend' : 'Weekday';
    const thumb = wisata.thumbnail
        ? (wisata.thumbnail.startsWith('http') ? wisata.thumbnail : BASE_IMAGE_URL + wisata.thumbnail)
        : null;

    if (compact) {
        // Versi ringkas untuk mobile — horizontal card, tanpa gambar besar
        return (
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: 14, padding: '14px 16px', alignItems: 'center' }}>
                    {thumb
                        ? <img src={thumb} alt={wisata.nama} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
                        : <div style={{ width: 60, height: 60, background: 'var(--teal-100)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <i className="fas fa-mountain" style={{ fontSize: 22, color: 'var(--teal-400)' }} />
                          </div>
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{wisata.nama}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                            {tanggal
                                ? new Date(tanggal + 'T12:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                : 'Pilih tanggal'}
                            {tanggal && <span style={{ marginLeft: 6, padding: '1px 7px', borderRadius: 50, fontSize: 10, fontWeight: 600, background: isWeekend(tanggal) ? '#fef9c3' : '#dcfce7', color: isWeekend(tanggal) ? '#713f12' : '#15803d' }}>{dayType}</span>}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{qty.dewasa + qty.anak} tiket</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--teal-700)' }}>{formatRupiah(total)}</div>
                    </div>
                </div>
                {/* Rincian kecil */}
                {(qty.dewasa > 0 || qty.anak > 0) && (
                    <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', background: 'var(--teal-50)', display: 'flex', gap: 16, fontSize: 12, color: 'var(--teal-700)' }}>
                        {qty.dewasa > 0 && <span>Dewasa ×{qty.dewasa}: <strong>{formatRupiah(qty.dewasa * (harga.harga_dewasa || 0))}</strong></span>}
                        {qty.anak > 0 && <span>Anak ×{qty.anak}: <strong>{formatRupiah(qty.anak * (harga.harga_anak || 0))}</strong></span>}
                    </div>
                )}
            </div>
        );
    }

    // Versi lengkap untuk sidebar desktop
    return (
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', overflow: 'hidden', position: 'sticky', top: 100 }}>
            {thumb
                ? <img src={thumb} alt={wisata.nama} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: 160, background: 'var(--teal-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-mountain" style={{ fontSize: 40, color: 'var(--teal-400)' }} />
                  </div>
            }
            <div style={{ padding: 24 }}>
                <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--teal-600)', fontWeight: 600, marginBottom: 4 }}>{wisata.kategori}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--dark)', marginBottom: 8 }}>{wisata.nama}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 16 }}>
                    <i className="fas fa-map-marker-alt" style={{ color: 'var(--teal-500)' }} />
                    {wisata.alamat_lengkap || 'Purbalingga'}
                </div>
                {tanggal && (
                    <div style={{ padding: '8px 12px', background: isWeekend(tanggal) ? '#fef9c3' : '#f0fdf4', border: `1px solid ${isWeekend(tanggal) ? '#fde047' : '#bbf7d0'}`, borderRadius: 8, fontSize: 12, color: isWeekend(tanggal) ? '#713f12' : '#14532d', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <i className={`fas ${isWeekend(tanggal) ? 'fa-sun' : 'fa-briefcase'}`} />
                        Harga {dayType} berlaku untuk tanggal ini
                    </div>
                )}
                <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Rincian Tiket</div>
                    {qty.dewasa > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                            <span>Dewasa × {qty.dewasa}</span>
                            <span style={{ fontWeight: 600 }}>{formatRupiah(qty.dewasa * (harga.harga_dewasa || 0))}</span>
                        </div>
                    )}
                    {qty.anak > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                            <span>Anak-anak × {qty.anak}</span>
                            <span style={{ fontWeight: 600 }}>{formatRupiah(qty.anak * (harga.harga_anak || 0))}</span>
                        </div>
                    )}
                    {(qty.dewasa + qty.anak) === 0 && (
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>Belum ada tiket dipilih</div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, paddingTop: 12, borderTop: '1px solid var(--border)', marginTop: 8, color: 'var(--dark)' }}>
                        <span>Total</span>
                        <span style={{ color: 'var(--teal-700)' }}>{formatRupiah(total)}</span>
                    </div>
                </div>
                <div style={{ marginTop: 20, padding: 12, background: 'var(--teal-50)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--teal-700)', display: 'flex', gap: 8 }}>
                    <i className="fas fa-shield-alt" style={{ marginTop: 1, flexShrink: 0 }} />
                    <span>Tiket dijamin resmi dan dapat digunakan langsung di lokasi wisata.</span>
                </div>
            </div>
        </div>
    );
}

// ─── Step 1: Pilih Tiket ──────────────────────────────────────
function Step1({ wisata, qty, setQty, tanggal, setTanggal, onNext }) {
    const today   = getTodayString();
    const harga   = getHargaByDate(wisata?.prices, tanggal);
    const canNext = wisata && tanggal && (qty.dewasa + qty.anak) > 0;

    const Counter = ({ label, subLabel, value, price, type }) => (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px',
            border: `1.5px solid ${value > 0 ? 'var(--teal-300)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            background: value > 0 ? 'var(--teal-50)' : 'white',
            transition: 'all .2s', gap: 12,
        }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--dark)' }}>{label}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{subLabel}</div>
                <div style={{ fontWeight: 700, color: 'var(--teal-600)', marginTop: 4 }}>
                    {formatRupiah(price)}<span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 12 }}>/orang</span>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <button
                    onClick={() => setQty(q => ({ ...q, [type]: Math.max(0, q[type] - 1) }))}
                    disabled={value === 0}
                    style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid', borderColor: value > 0 ? 'var(--teal-500)' : 'var(--border)', background: 'white', color: value > 0 ? 'var(--teal-600)' : 'var(--text-muted)', fontSize: 18, cursor: value > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
                >−</button>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--dark)', minWidth: 24, textAlign: 'center' }}>{value}</span>
                <button
                    onClick={() => setQty(q => ({ ...q, [type]: q[type] + 1 }))}
                    style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--teal-500)', background: 'var(--teal-600)', color: 'white', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
                >+</button>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 14, color: 'var(--text-dark)', marginBottom: 8 }}>
                    <i className="fas fa-calendar" style={{ color: 'var(--teal-500)', marginRight: 8 }} />Tanggal Kunjungan
                </label>
                <input type="date" min={today} value={tanggal} onChange={e => setTanggal(e.target.value)} className="tiket-input" />
                {tanggal && (
                    <div style={{ marginTop: 8, fontSize: 12, color: isWeekend(tanggal) ? '#d97706' : '#16a34a', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <i className={`fas ${isWeekend(tanggal) ? 'fa-sun' : 'fa-briefcase'}`} />
                        {isWeekend(tanggal) ? 'Weekend — harga akhir pekan berlaku' : 'Weekday — harga hari kerja berlaku'}
                    </div>
                )}
            </div>
            <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-dark)', marginBottom: 12 }}>
                    <i className="fas fa-users" style={{ color: 'var(--teal-500)', marginRight: 8 }} />Jumlah Pengunjung
                </div>
                {wisata ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <Counter label="Dewasa" subLabel="Usia 13 tahun ke atas" price={harga.harga_dewasa || 0} value={qty.dewasa} type="dewasa" />
                        <Counter label="Anak-anak" subLabel="Usia 3–12 tahun" price={harga.harga_anak || 0} value={qty.anak} type="anak" />
                    </div>
                ) : (
                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>Data wisata tidak ditemukan</div>
                )}
                {!tanggal && (qty.dewasa + qty.anak) > 0 && (
                    <div style={{ marginTop: 10, padding: '10px 14px', background: '#fffbeb', border: '1px solid #fbbf24', borderRadius: 8, fontSize: 13, color: '#92400e', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <i className="fas fa-exclamation-triangle" /> Pilih tanggal kunjungan terlebih dahulu.
                    </div>
                )}
            </div>
            <button onClick={onNext} disabled={!canNext} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16, opacity: canNext ? 1 : .5, cursor: canNext ? 'pointer' : 'not-allowed' }}>
                Lanjut ke Data Pengunjung <i className="fas fa-arrow-right" />
            </button>
        </div>
    );
}

// ─── Step 2: Data Pengunjung ──────────────────────────────────
function Step2({ form, setForm, onNext, onBack, userProfile }) {
  // state controlled untuk field wajib
  const [nama, setNama] = useState(form.nama || userProfile?.nama || '');
  const [hp, setHp] = useState(form.hp || userProfile?.no_hp || '');
  const [email, setEmail] = useState(form.email || userProfile?.email || '');
  const [kecamatanId, setKecamatanId] = useState(
    form.kecamatan_id || userProfile?.kecamatan_id || ''
  );

  const [kecamatans, setKecamatans] = useState([]);
  const [loadingKec, setLoadingKec] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (userProfile) {
      if (!nama) setNama(userProfile.nama || '');
      if (!hp) setHp(userProfile.no_hp || '');
      if (!email) setEmail(userProfile.email || '');
      if (!kecamatanId) setKecamatanId(userProfile.kecamatan_id || '');
    }
  }, [userProfile]);

  // ambil data kecamatan
  useEffect(() => {
    api
      .get('/kecamatan')
      .then((res) => setKecamatans(res.data?.data || res.data || []))
      .catch(() => setKecamatans([]))
      .finally(() => setLoadingKec(false));
  }, []);

  // validasi real‑time saat nama / hp berubah
  useEffect(() => {
    const e = {};
    if (!nama.trim()) e.nama = 'Nama wajib diisi';
    if (!hp.trim()) {
      e.hp = 'Nomor HP wajib diisi';
    } else if (!/^0[0-9]{8,13}$/.test(hp.replace(/\s/g, ''))) {
      e.hp = 'Format nomor HP tidak valid (contoh: 08xxxxxxxxxx)';
    }
    setErrors(e);
  }, [nama, hp]);

  // tombol hanya bisa diklik jika tidak ada error
  const canNext = Object.keys(errors).length === 0;

  const handleLanjut = () => {
    if (!canNext) return;
    setForm({
      nama: nama.trim(),
      hp: hp.trim(),
      email: email.trim(),
      kecamatan_id: kecamatanId,
    });
    onNext();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* NAMA */}
      <div>
        <label
          style={{
            display: 'block',
            fontWeight: 600,
            fontSize: 14,
            color: 'var(--text-dark)',
            marginBottom: 6,
          }}
        >
          <i className="fas fa-user" style={{ color: 'var(--teal-500)', marginRight: 6 }} />
          Nama Lengkap <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          placeholder="Masukkan nama lengkap Anda"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className={`tiket-input${errors.nama ? ' error' : ''}`}
          autoComplete="name"
        />
        {errors.nama && (
          <div style={{ fontSize: 12, color: '#ef4444', marginTop: 5 }}>
            <i className="fas fa-exclamation-circle" /> {errors.nama}
          </div>
        )}
      </div>

      {/* NOMOR HP */}
      <div>
        <label
          style={{
            display: 'block',
            fontWeight: 600,
            fontSize: 14,
            color: 'var(--text-dark)',
            marginBottom: 6,
          }}
        >
          <i className="fas fa-phone" style={{ color: 'var(--teal-500)', marginRight: 6 }} />
          Nomor HP / WA <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="tel"
          placeholder="08xxxxxxxxxx"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          className={`tiket-input${errors.hp ? ' error' : ''}`}
          autoComplete="tel"
        />
        {errors.hp ? (
          <div style={{ fontSize: 12, color: '#ef4444', marginTop: 5 }}>
            <i className="fas fa-exclamation-circle" /> {errors.hp}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            contoh: 08xxxxxxxxxx
          </div>
        )}
      </div>

      {/* EMAIL */}
      <div>
        <label
          style={{
            display: 'block',
            fontWeight: 600,
            fontSize: 14,
            color: 'var(--text-dark)',
            marginBottom: 6,
          }}
        >
          <i className="fas fa-envelope" style={{ color: 'var(--teal-500)', marginRight: 6 }} />
          Email{' '}
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
            (opsional)
          </span>
        </label>
        <input
          type="email"
          placeholder="nama@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="tiket-input"
          autoComplete="email"
        />
      </div>

      {/* KECAMATAN */}
      <div>
        <label
          style={{
            display: 'block',
            fontWeight: 600,
            fontSize: 14,
            color: 'var(--text-dark)',
            marginBottom: 6,
          }}
        >
          <i className="fas fa-map-marker-alt" style={{ color: 'var(--teal-500)', marginRight: 6 }} />
          Kecamatan Asal{' '}
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
            (opsional)
          </span>
        </label>
        <div style={{ position: 'relative' }}>
          <select
            value={kecamatanId}
            onChange={(e) => setKecamatanId(e.target.value)}
            className="tiket-select"
            disabled={loadingKec}
          >
            <option value="">
              {loadingKec ? 'Memuat kecamatan...' : '— Pilih Kecamatan —'}
            </option>
            {kecamatans.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </select>
          {loadingKec && (
            <div
              style={{
                position: 'absolute',
                right: 44,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <i
                className="fas fa-spinner fa-spin"
                style={{ color: 'var(--teal-500)', fontSize: 13 }}
              />
            </div>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          Pilih kecamatan tempat tinggal Anda di Purbalingga
        </div>
      </div>

      {/* info profil */}
      {userProfile && (
        <div
          style={{
            padding: '10px 14px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 8,
            fontSize: 12,
            color: '#15803d',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <i className="fas fa-check-circle" /> Data diisi otomatis dari profil akun Anda. Ubah jika
          perlu.
        </div>
      )}

      {/* tombol aksi */}
      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
        <button
          onClick={onBack}
          className="btn btn-outline"
          style={{ flex: 1, justifyContent: 'center', padding: '14px' }}
        >
          <i className="fas fa-arrow-left" /> Kembali
        </button>
        <button
          onClick={handleLanjut}
          disabled={!canNext}
          className="btn btn-primary"
          style={{
            flex: 2,
            justifyContent: 'center',
            padding: '14px',
            fontSize: 15,
            opacity: canNext ? 1 : 0.5,
            cursor: canNext ? 'pointer' : 'not-allowed',
          }}
        >
          Lanjut ke Pembayaran <i className="fas fa-arrow-right" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Pembayaran ───────────────────────────────────────
function Step3({ wisata, qty, form, tanggal, onNext, onBack }) {
    const [qrisOpen, setQrisOpen] = useState(false);
    const [qrisSessionId, setQrisSessionId] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('idle');
    const [paymentMessage, setPaymentMessage] = useState('Klik metode QRIS untuk menampilkan kode pembayaran.');
    const [paymentError, setPaymentError] = useState('');
    const [openingApp, setOpeningApp] = useState(false);
    const [submittingOrder, setSubmittingOrder] = useState(false);
    const handlingSuccessRef = useRef(false);

    const harga = getHargaByDate(wisata?.prices, tanggal);
    const total = wisata ? qty.dewasa * (harga.harga_dewasa || 0) + qty.anak * (harga.harga_anak || 0) : 0;
    const tglFormatted = tanggal
        ? new Date(tanggal + 'T12:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        : '-';

    const qrisPayload = useMemo(() => {
        if (!qrisSessionId) return '';
        return buildQrisPayload({
            sessionId: qrisSessionId,
            wisata,
            qty,
            form,
            tanggal,
            total,
        });
    }, [form, qrisSessionId, qty, tanggal, total, wisata]);

    const resetPaymentState = () => {
        setPaymentStatus('idle');
        setPaymentMessage('Klik metode QRIS untuk menampilkan kode pembayaran.');
        setPaymentError('');
        handlingSuccessRef.current = false;
    };

    const openQrisPayment = () => {
        const sessionId = makePaymentSessionId();
        setQrisSessionId(sessionId);
        setQrisOpen(true);
        setPaymentStatus('waiting');
        setPaymentError('');
        setPaymentMessage('Tunjukkan QR ini ke aplikasi Purbalingga Pay untuk dipindai.');
    };

    const openPaymentApp = () => {
        setOpeningApp(true);

        const popup = window.open(`${PAYMENT_APP_URL}/qr?tab=qr`, '_blank', 'width=430,height=760');

        if (!popup) {
            setOpeningApp(false);
            setPaymentError('Popup diblokir browser. Izinkan popup lalu tekan tombol ini lagi.');
            return;
        }

        popup.focus();
        setOpeningApp(false);
    };

    useEffect(() => {
        if (!qrisSessionId) return undefined;

        const handleMessage = async (event) => {
            if (event.origin !== PAYMENT_APP_ORIGIN) return;

            const payload = event.data;
            if (!payload || payload.type !== PAYMENT_MESSAGE_TYPE) return;
            if (handlingSuccessRef.current) return;

            let sessionId = payload.sessionId || payload.cardId || '';
            if (!sessionId && payload.rawValue) {
                try {
                    const parsed = JSON.parse(payload.rawValue);
                    sessionId = parsed.sessionId || parsed.cardId || parsed.session_id || parsed.card_id || '';
                } catch {
                    const raw = String(payload.rawValue).trim();
                    const match = raw.match(/(?:^|[&;\n])(?:session_id|sessionid|card_id|cardid|sessionId|cardId)\s*[:=]\s*([^&;\n]+)/i);
                    sessionId = match ? match[1].trim() : '';
                }
            }

            if (sessionId !== qrisSessionId) return;

            handlingSuccessRef.current = true;
            setSubmittingOrder(true);
            setPaymentStatus('processing');
            setPaymentMessage('Pembayaran terdeteksi. Menyimpan tiket...');
            setPaymentError('');

            try {
                await api.post('/tiket', {
                    wisata_id: wisata.id,
                    tanggal_kunjungan: tanggal,
                    jumlah_dewasa: qty.dewasa,
                    jumlah_anak: qty.anak,
                    total_harga: total,
                    metode_pembayaran: 'QRIS',
                    kode_order: payload.kodeOrder || undefined,
                });

                setPaymentStatus('success');
                setPaymentMessage('Pembayaran QRIS berhasil. Mengarahkan ke tahap selesai...');
                setQrisOpen(false);
                onNext();
            } catch (err) {
                handlingSuccessRef.current = false;
                setPaymentStatus('error');
                setPaymentError(err.response?.data?.message || 'Pembayaran berhasil, tetapi penyimpanan tiket gagal.');
                setPaymentMessage('Ada kendala saat menyimpan tiket. Silakan coba lagi.');
            } finally {
                setSubmittingOrder(false);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onNext, qrisSessionId, tanggal, total, wisata, qty.dewasa, qty.anak]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ padding: 20, background: 'var(--teal-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--teal-100)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal-700)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Ringkasan Pemesanan</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <i className="fas fa-user" style={{ color: 'var(--teal-500)', width: 16 }} />
                    <span style={{ fontSize: 14, color: 'var(--text-dark)', fontWeight: 600 }}>{form.nama}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>· {form.hp}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, fontSize: 13, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <i className="fas fa-calendar" style={{ color: 'var(--teal-500)', width: 16 }} />
                    {tglFormatted}
                    <span style={{ padding: '1px 8px', borderRadius: 50, fontSize: 11, fontWeight: 600, background: isWeekend(tanggal) ? '#fef9c3' : '#dcfce7', color: isWeekend(tanggal) ? '#713f12' : '#15803d' }}>
                        {isWeekend(tanggal) ? 'Weekend' : 'Weekday'}
                    </span>
                </div>
                {qty.dewasa > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                        <span>Tiket Dewasa × {qty.dewasa}</span>
                        <span style={{ fontWeight: 600 }}>{formatRupiah(qty.dewasa * (harga.harga_dewasa || 0))}</span>
                    </div>
                )}
                {qty.anak > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                        <span>Tiket Anak × {qty.anak}</span>
                        <span style={{ fontWeight: 600 }}>{formatRupiah(qty.anak * (harga.harga_anak || 0))}</span>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 800, paddingTop: 12, borderTop: '1px dashed var(--teal-200)', marginTop: 4, color: 'var(--dark)' }}>
                    <span>Total Pembayaran</span>
                    <span style={{ color: 'var(--teal-700)' }}>{formatRupiah(total)}</span>
                </div>
            </div>
            <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-dark)', marginBottom: 12 }}>
                    <i className="fas fa-credit-card" style={{ color: 'var(--teal-500)', marginRight: 8 }} />Metode Pembayaran
                </div>
                <button
                    type="button"
                    onClick={openQrisPayment}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '16px 20px',
                        border: '2px solid var(--teal-500)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, var(--teal-50), #ecfeff)',
                        transition: 'all .15s',
                        textAlign: 'left',
                    }}
                >
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className="fas fa-qrcode" style={{ color: 'white', fontSize: 15 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            QRIS
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 50, background: '#dcfce7', color: '#16a34a' }}>✓ Direkomendasikan</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                            Klik untuk menampilkan QR dan langkah pembayaran melalui Purbalingga Pay.
                        </div>
                    </div>
                    <i className="fas fa-check-circle" style={{ color: 'var(--teal-500)', fontSize: 18, flexShrink: 0 }} />
                </button>
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Setelah QR dipindai dan pembayaran sukses di aplikasi payment, halaman ini akan otomatis lanjut ke tahap selesai.
                </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={onBack} disabled={submittingOrder} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '14px' }}>
                    <i className="fas fa-arrow-left" /> Kembali
                </button>
                <button onClick={openQrisPayment} disabled={submittingOrder} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '14px', fontSize: 15 }}>
                    {submittingOrder ? <><i className="fas fa-spinner fa-spin" /> Memproses...</> : <><i className="fas fa-qrcode" /> Buka QRIS {formatRupiah(total)}</>}
                </button>
            </div>

            {qrisOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(15,23,42,.58)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 60,
                    padding: 20,
                }}>
                    <div style={{
                        width: 'min(620px, 100%)',
                        background: 'white',
                        borderRadius: 24,
                        boxShadow: '0 24px 60px rgba(15,23,42,.25)',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            padding: '20px 22px',
                            background: 'linear-gradient(135deg, var(--teal-700), var(--teal-900))',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 12,
                            alignItems: 'center',
                        }}>
                            <div>
                                <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', opacity: .8 }}>QRIS Payment</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>Scan untuk bayar tiket</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setQrisOpen(false);
                                    resetPaymentState();
                                }}
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    border: 'none',
                                    background: 'rgba(255,255,255,.15)',
                                    color: 'white',
                                    cursor: 'pointer',
                                }}
                            >
                                <i className="fas fa-times" />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 0 }}>
                            <div style={{ padding: 24, borderRight: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                                    <div style={{ padding: 16, borderRadius: 20, background: 'white', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
                                        {qrisPayload ? (
                                            <QRCodeCanvas
                                                value={qrisPayload}
                                                size={240}
                                                level="M"
                                                includeMargin
                                                style={{ display: 'block' }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: 240,
                                                height: 240,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'var(--text-muted)',
                                                fontSize: 13,
                                                textAlign: 'center',
                                            }}>
                                                QR belum siap
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 }}>
                                    <span style={{ padding: '6px 10px', borderRadius: 999, background: 'var(--teal-50)', color: 'var(--teal-700)', fontSize: 12, fontWeight: 700 }}>
                                        {formatRupiah(total)}
                                    </span>
                                    <span style={{ padding: '6px 10px', borderRadius: 999, background: '#f0fdf4', color: '#15803d', fontSize: 12, fontWeight: 700 }}>
                                        {wisata?.nama}
                                    </span>
                                </div>

                                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, textAlign: 'center' }}>
                                    Tunjukkan QR ini ke aplikasi <strong>Purbalingga Pay</strong>, lalu ikuti konfirmasi pembayaran di sana.
                                </div>

                                {paymentError && (
                                    <div style={{
                                        marginTop: 16,
                                        padding: '12px 14px',
                                        background: '#fef2f2',
                                        border: '1px solid #fecaca',
                                        borderRadius: 12,
                                        color: '#b91c1c',
                                        fontSize: 13,
                                    }}>
                                        {paymentError}
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: 24, background: '#f8fafc' }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
                                    Langkah Pembayaran
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {[
                                        'Klik tombol "Buka Purbalingga Pay" agar aplikasi payment terbuka dalam tab baru.',
                                        'Di aplikasi payment, buka menu QR dan scan kode ini.',
                                        'Konfirmasi nominal pembayaran yang muncul sesuai total tiket.',
                                        'Setelah pembayaran sukses, halaman ini akan otomatis lanjut ke tahap selesai.',
                                    ].map((text, index) => (
                                        <div key={text} style={{
                                            display: 'flex',
                                            gap: 12,
                                            padding: '12px 14px',
                                            borderRadius: 14,
                                            background: 'white',
                                            border: '1px solid var(--border)',
                                        }}>
                                            <div style={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: '50%',
                                                background: 'var(--teal-600)',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                                fontSize: 12,
                                                fontWeight: 800,
                                            }}>
                                                {index + 1}
                                            </div>
                                            <div style={{ fontSize: 13, color: 'var(--text-dark)', lineHeight: 1.6 }}>{text}</div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                    <button
                                        type="button"
                                        onClick={openPaymentApp}
                                        className="btn btn-primary"
                                        style={{ flex: 1, justifyContent: 'center', minWidth: 200 }}
                                        disabled={openingApp}
                                    >
                                        {openingApp ? <><i className="fas fa-spinner fa-spin" /> Membuka...</> : <><i className="fas fa-external-link-alt" /> Buka Purbalingga Pay</>}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setQrisOpen(false);
                                            resetPaymentState();
                                        }}
                                        className="btn btn-outline"
                                        style={{ flex: 1, justifyContent: 'center', minWidth: 160 }}
                                        disabled={submittingOrder}
                                    >
                                        Tutup
                                    </button>
                                </div>

                                <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                    Status: <strong>{paymentStatus === 'waiting' ? 'Menunggu scan' : paymentStatus === 'processing' ? 'Memproses' : paymentStatus === 'success' ? 'Berhasil' : paymentStatus === 'error' ? 'Gagal' : 'Siap'}</strong>
                                    <div style={{ marginTop: 4 }}>{paymentMessage}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Step 4: Selesai ──────────────────────────────────────────
function Step4({ wisata, qty, form, tanggal }) {
    const harga = getHargaByDate(wisata?.prices, tanggal);
    const total = wisata ? qty.dewasa * (harga.harga_dewasa || 0) + qty.anak * (harga.harga_anak || 0) : 0;
    const tglFormatted = tanggal
        ? new Date(tanggal + 'T12:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        : '-';

    const steps = [
        { icon: 'fa-mobile-alt', color: 'var(--teal-600)', bg: 'var(--teal-50)', title: 'Buka Riwayat Tiket', desc: 'Masuk ke halaman Riwayat Tiket di akun kamu untuk menemukan tiket yang baru saja dipesan.' },
        { icon: 'fa-file-alt', color: '#7c3aed', bg: '#f5f3ff', title: 'Tampilkan E-Ticket', desc: 'Klik tiket wisata, lalu tekan tombol "Lihat E-Ticket" untuk membuka atau mengunduh tiket digital kamu.' },
        { icon: 'fa-user-check', color: '#d97706', bg: '#fffbeb', title: 'Tunjukkan ke Staff', desc: 'Saat tiba di lokasi wisata, tunjukkan e-ticket kepada petugas di pintu masuk. E-ticket hanya berlaku sekali pakai.' },
        { icon: 'fa-star', color: '#16a34a', bg: '#f0fdf4', title: 'Beri Ulasan', desc: 'Setelah berkunjung, staff akan memvalidasi tiket. Kamu akan mendapat notifikasi untuk memberikan ulasan wisata.' },
    ];

    return (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div className="success-icon" style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 0 10px rgba(22,163,74,.1), 0 0 0 20px rgba(22,163,74,.05)' }}>
                <i className="fas fa-check" style={{ fontSize: 32, color: 'white' }} />
            </div>
            <div className="success-card">
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,4vw,26px)', color: 'var(--dark)', marginBottom: 8 }}>Pembayaran Berhasil!</h2>
                <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 8 }}>Tiket kamu sudah aktif dan siap digunakan.</p>
                <div style={{ display: 'inline-flex', gap: 16, background: 'var(--teal-50)', border: '1px solid var(--teal-100)', borderRadius: 'var(--radius-md)', padding: '12px 20px', margin: '0 auto 28px', fontSize: 13, color: 'var(--teal-700)', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <span><i className="fas fa-mountain" style={{ marginRight: 5 }} />{wisata?.nama}</span>
                    <span><i className="fas fa-calendar" style={{ marginRight: 5 }} />{tglFormatted}</span>
                    <span><i className="fas fa-users" style={{ marginRight: 5 }} />{qty.dewasa + qty.anak} orang</span>
                    <span style={{ fontWeight: 700 }}><i className="fas fa-money-bill-wave" style={{ marginRight: 5 }} />{formatRupiah(total)}</span>
                </div>
            </div>
            <div className="success-steps" style={{ textAlign: 'left', marginBottom: 28 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <i className="fas fa-info-circle" style={{ color: 'var(--teal-500)' }} />Cara Menggunakan Tiket
                    </span>
                    <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {steps.map((s, i) => (
                        <div key={i} className="step-card" style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 18px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'white', transition: 'all .2s' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className={`fas ${s.icon}`} style={{ color: s.color, fontSize: 16 }} />
                                </div>
                                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 1 }}>0{i + 1}</span>
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark)', marginBottom: 4 }}>{s.title}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{s.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 14, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', fontSize: 13, color: '#b91c1c', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <i className="fas fa-exclamation-triangle" style={{ marginTop: 1, flexShrink: 0 }} />
                    <span><strong>Perhatian:</strong> E-ticket hanya berlaku <strong>sekali pakai</strong>. Setelah divalidasi oleh staff, tiket tidak dapat digunakan kembali.</span>
                </div>
            </div>
            <div className="success-actions" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/riwayat" className="btn btn-primary" style={{ fontSize: 15, padding: '13px 28px' }}>
                    <i className="fas fa-ticket-alt" /> Lihat Riwayat Tiket
                </Link>
                <Link to="/#wisata" className="btn btn-outline" style={{ padding: '13px 24px' }}>
                    <i className="fas fa-compass" /> Destinasi Lainnya
                </Link>
            </div>
        </div>
    );
}

// ─── Main Tiket Page ──────────────────────────────────────────
export default function Tiket() {
    const { slug: slugFromPath } = useParams();
    const [searchParams] = useSearchParams();
    const wisataSlug = slugFromPath || searchParams.get('slug') || searchParams.get('id');

    const [wisata,      setWisata]      = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading,     setLoading]     = useState(true);
    const [notFound,    setNotFound]    = useState(false);

    const [step,    setStep]    = useState(1);
    const [tanggal, setTanggal] = useState('');
    const [qty,     setQty]     = useState({ dewasa: 1, anak: 0 });
    const [form,    setForm]    = useState({});

    useEffect(() => {
        if (!wisataSlug) {
            setWisata(null);
            setNotFound(true);
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setNotFound(false);
            try {
                // Detail wisata by slug (kompatibel juga jika legacy value masih di query id)
                const wisataRes = await api.get(`/wisata/${encodeURIComponent(wisataSlug)}`);
                const wisataData = wisataRes.data?.data || null;
                setWisata(wisataData);

                if (!wisataData) {
                    setNotFound(true);
                    setLoading(false);
                    return;
                }
            } catch {
                setWisata(null);
                setNotFound(true);
                setLoading(false);
                return;
            }

            // Fetch profil user — opsional, jangan crash kalau belum login / 404
            try {
                const profileRes = await api.get('/auth/me');
                setUserProfile(profileRes.data?.user || profileRes.data || null);
            } catch {
                // Belum login atau endpoint tidak tersedia — biarkan null
                setUserProfile(null);
            }

            setLoading(false);
        };

        fetchData();
    }, [wisataSlug]);

    if (loading) {
        return (
            <div style={{ paddingTop: 90, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: 32, color: 'var(--teal-500)', marginBottom: 16 }} />
                    <div>Memuat data wisata...</div>
                </div>
            </div>
        );
    }

    if (notFound || !wisata) {
        return (
            <div style={{ paddingTop: 90, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <i className="fas fa-exclamation-triangle" style={{ fontSize: 48, color: '#f59e0b', marginBottom: 16 }} />
                    <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--dark)', marginBottom: 8 }}>Wisata Tidak Ditemukan</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Destinasi wisata yang Anda cari tidak tersedia.</p>
                    <Link to="/wisata" className="btn btn-primary"><i className="fas fa-compass" /> Jelajahi Wisata Lainnya</Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: 90, paddingBottom: 80, background: 'var(--cream)', minHeight: '100vh' }}>
            <style>{STYLE}</style>

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, var(--teal-800), var(--teal-950))', padding: '40px 0 36px' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--teal-300)', fontWeight: 600, marginBottom: 8 }}>
                        <i className="fas fa-ticket-alt" style={{ marginRight: 6 }} />Pembelian Tiket
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,4vw,36px)', color: 'white', marginBottom: 4 }}>{wisata.nama}</h1>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <i className="fas fa-map-marker-alt" />{wisata.alamat_lengkap || 'Purbalingga'}
                    </div>
                </div>
            </div>

            <div className="container" style={{ paddingTop: 40 }}>
                <StepIndicator current={step} />

                <div className="tiket-body">
                    {/* Kolom kiri: ringkasan mobile + form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Order summary ringkas — hanya muncul di mobile (≤900px), kecuali step 4 */}
                        {step < 4 && (
                            <div className="order-summary-inline">
                                <OrderSummary wisata={wisata} qty={qty} tanggal={tanggal} compact />
                            </div>
                        )}

                        {/* Form card */}
                        <div className="tiket-form-card">
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px,3vw,22px)', color: 'var(--dark)', marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: step === 4 ? '#16a34a' : 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <i className={`fas ${STEPS[step - 1].icon}`} style={{ color: 'white', fontSize: 14 }} />
                                </div>
                                {STEPS[step - 1].label}
                            </h2>

                            {step === 1 && <Step1 wisata={wisata} qty={qty} setQty={setQty} tanggal={tanggal} setTanggal={setTanggal} onNext={() => setStep(2)} />}
                            {step === 2 && <Step2 form={form} setForm={setForm} onNext={() => setStep(3)} onBack={() => setStep(1)} userProfile={userProfile} />}
                            {step === 3 && <Step3 wisata={wisata} qty={qty} form={form} tanggal={tanggal} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
                            {step === 4 && <Step4 wisata={wisata} qty={qty} form={form} tanggal={tanggal} />}
                        </div>
                    </div>

                    {/* Sidebar desktop (>900px) */}
                    <div className="tiket-sidebar">
                        {step < 4 && <OrderSummary wisata={wisata} qty={qty} tanggal={tanggal} />}
                        {step === 4 && (
                            <div style={{ background: 'linear-gradient(135deg,var(--teal-600),var(--teal-800))', borderRadius: 'var(--radius-lg)', padding: 24, color: 'white' }}>
                                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>
                                    <i className="fas fa-headset" style={{ marginRight: 8 }} />Butuh Bantuan?
                                </div>
                                <p style={{ fontSize: 13, opacity: .85, lineHeight: 1.7, marginBottom: 16 }}>Hubungi kami jika ada kendala dengan tiket Anda.</p>
                                <a href="tel:02818901016" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(255,255,255,.15)', borderRadius: 8, color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                                    <i className="fas fa-phone" /> (0281) 891016
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
