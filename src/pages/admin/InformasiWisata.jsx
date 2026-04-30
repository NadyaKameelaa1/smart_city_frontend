import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../api/axios";

// ── Style ──────────────────────────────────────────────────────────────────
const css = `
  .iw-page { animation: fadeInUp .45s ease both; }
  @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

  .iw-hero {
    position: relative; border-radius: 24px; overflow: hidden;
    height: 340px; background: var(--teal-950);
    box-shadow: 0 8px 40px rgba(64,114,175,.18); margin-bottom: 28px;
  }
  .iw-hero__img { width:100%; height:100%; object-fit:cover; opacity:.55; transition:transform .5s ease; }
  .iw-hero:hover .iw-hero__img { transform:scale(1.03); }
  .iw-hero__overlay {
    position:absolute; inset:0;
    background:linear-gradient(to top,rgba(10,29,61,.96) 0%,rgba(10,29,61,.3) 60%,transparent 100%);
  }
  .iw-hero__body {
    position:absolute; bottom:0; left:0; right:0;
    padding:32px 36px;
    display:flex; align-items:flex-end; justify-content:space-between; gap:20px;
  }
  .iw-hero__badge {
    display:inline-flex; align-items:center; gap:6px;
    padding:4px 14px; border-radius:50px;
    background:var(--teal-500); color:white;
    font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase;
    margin-bottom:10px;
  }
  .iw-hero__name {
    font-family:var(--font-display);
    font-size:clamp(22px,3vw,34px); font-weight:700; color:white; line-height:1.2; margin-bottom:8px;
  }
  .iw-hero__loc { display:flex; align-items:center; gap:7px; font-size:13px; color:rgba(255,255,255,.7); }
  .iw-hero__loc i { color:var(--teal-300); }
  .iw-hero__rating {
    display:flex; flex-direction:column; align-items:center; gap:4px;
    background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.15);
    border-radius:16px; padding:16px 22px; text-align:center;
    backdrop-filter:blur(10px); flex-shrink:0;
  }
  .iw-hero__rating-num { font-family:var(--font-display); font-size:28px; font-weight:700; color:white; line-height:1; }
  .iw-hero__rating-stars { color:#f59e0b; font-size:13px; letter-spacing:2px; }
  .iw-hero__rating-label { font-size:11px; color:rgba(255,255,255,.55); margin-top:2px; }

  .iw-info-row { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
  .iw-info-card {
    background:white; border-radius:16px; border:1px solid var(--border);
    padding:20px 18px; box-shadow:var(--shadow-sm);
    display:flex; align-items:flex-start; gap:14px; transition:var(--transition);
  }
  .iw-info-card:hover { transform:translateY(-3px); box-shadow:var(--shadow-md); }
  .iw-info-card__icon {
    width:42px; height:42px; border-radius:12px; background:var(--teal-50);
    display:flex; align-items:center; justify-content:center;
    font-size:17px; color:var(--teal-600); flex-shrink:0;
  }
  .iw-info-card__label { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); margin-bottom:4px; font-weight:600; }
  .iw-info-card__val { font-size:15px; font-weight:700; color:var(--dark); line-height:1.3; }

  .iw-desc-card {
    background:white; border-radius:20px; border:1px solid var(--border);
    padding:28px 30px; box-shadow:var(--shadow-sm); margin-bottom:28px;
  }
  .iw-section-title {
    font-family:var(--font-display); font-size:18px; font-weight:700; color:var(--dark);
    margin-bottom:16px; display:flex; align-items:center; gap:9px;
    padding-bottom:12px; border-bottom:2px solid var(--teal-100);
  }
  .iw-section-title i { color:var(--teal-500); font-size:16px; }
  .iw-desc-text { font-size:14.5px; color:var(--text-muted); line-height:1.8; }

  /* Harga tiket */
  .iw-ticket-section {
    background:linear-gradient(135deg,var(--teal-800),var(--teal-950));
    border-radius:20px; padding:28px 30px;
    box-shadow:var(--shadow-lg); margin-bottom:28px;
  }
  .iw-ticket-section__title {
    font-family:var(--font-display); font-size:17px; font-weight:700; color:white;
    margin-bottom:18px; display:flex; align-items:center; gap:9px;
  }
  .iw-ticket-section__title i { color:var(--teal-300); }

  /* Tab day type */
  .iw-ticket-tabs { display:flex; gap:8px; margin-bottom:18px; flex-wrap:wrap; }
  .iw-ticket-tab {
    padding:6px 16px; border-radius:50px; font-size:12px; font-weight:600;
    border:1.5px solid rgba(255,255,255,.2); color:rgba(255,255,255,.6);
    background:rgba(255,255,255,.06); cursor:pointer; transition:all .2s;
    font-family:var(--font-body);
  }
  .iw-ticket-tab:hover { border-color:rgba(255,255,255,.4); color:white; }
  .iw-ticket-tab.active { background:var(--teal-500); border-color:var(--teal-400); color:white; }

  .iw-ticket-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .iw-ticket-item {
    background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1);
    border-radius:12px; padding:18px 20px;
    display:flex; align-items:center; gap:16px;
  }
  .iw-ticket-item__icon {
    width:40px; height:40px; border-radius:10px;
    background:rgba(255,255,255,.1);
    display:flex; align-items:center; justify-content:center;
    font-size:17px; color:var(--teal-300); flex-shrink:0;
  }
  .iw-ticket-item__label { font-size:11px; color:rgba(255,255,255,.5); margin-bottom:4px; }
  .iw-ticket-item__price { font-family:var(--font-display); font-size:19px; font-weight:700; color:white; }
  .iw-ticket-item__free { font-family:var(--font-display); font-size:16px; font-weight:700; color:#4ade80; }

  /* Fasilitas */
  .iw-fasilitas-wrap { display:flex; flex-wrap:wrap; gap:8px; }
  .iw-fasilitas-tag {
    display:inline-flex; align-items:center; gap:6px;
    padding:6px 14px; border-radius:50px;
    background:var(--teal-50); border:1px solid var(--teal-100);
    font-size:12px; font-weight:600; color:var(--teal-700);
  }

  /* Kontak */
  .iw-kontak-card {
    background:white; border-radius:20px; border:1px solid var(--border);
    padding:28px 30px; box-shadow:var(--shadow-sm); margin-bottom:28px;
    display:flex; align-items:center; gap:20px; flex-wrap:wrap;
  }

  /* Skeleton */
  .iw-skeleton { animation:shimmer 1.4s ease infinite; }
  @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:.4} }
  .iw-skel-block { background:var(--teal-100); border-radius:12px; }

  .iw-empty {
    text-align:center; padding:80px 0;
    display:flex; flex-direction:column; align-items:center; gap:14px;
  }
  .iw-empty i { font-size:48px; color:var(--teal-200); }
  .iw-empty p { font-size:15px; color:var(--text-muted); }

  @media (max-width:768px) {
    .iw-info-row { grid-template-columns:repeat(2,1fr); }
    .iw-ticket-row { grid-template-columns:1fr; }
    .iw-hero { height:240px; }
    .iw-hero__body { padding:20px; flex-direction:column; align-items:flex-start; }
  }
`;

// ── Helpers ────────────────────────────────────────────────────────────────
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://41.216.191.37:8000').replace(/\/$/, '');

const rupiah = (n) => {
  if (!n || Number(n) === 0) return 'Gratis';
  return 'Rp ' + Number(n).toLocaleString('id-ID');
};

const ratingStars = (r) => {
  const val    = parseFloat(r) || 0;
  const full   = Math.floor(val);
  const half   = val - full >= 0.5 ? 1 : 0;
  const empty  = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
};

// Label per day_type
const DAY_TYPE_LABEL = {
  weekday: 'Hari Kerja (Senin–Jumat)',
  weekend: 'Akhir Pekan (Sabtu–Minggu)',
  holiday: 'Hari Libur Nasional',
};
const DAY_TYPE_ICON = {
  weekday: 'fa-briefcase',
  weekend: 'fa-sun',
  holiday: 'fa-star',
};

// ── Component ──────────────────────────────────────────────────────────────
export default function InformasiWisata() {
  const [wisata,       setWisata]       = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [activeTab,    setActiveTab]    = useState(null); // day_type aktif

  useEffect(() => { fetchWisata(); }, []);

  const fetchWisata = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/wisata');
      const data = res.data?.data || res.data;
      setWisata(data);

      // Set tab default ke day_type pertama yang ada
      if (data?.prices?.length > 0) {
        setActiveTab(data.prices[0].day_type);
      }
    } catch (err) {
      setError('Gagal memuat data wisata. Pastikan Anda sudah login sebagai admin.');
    } finally {
      setLoading(false);
    }
  };

  // ── Skeleton ──
  if (loading) {
    return (
      <AdminLayout>
        <style>{css}</style>
        <div className="iw-page iw-skeleton">
          <div className="iw-skel-block" style={{ height: 340, marginBottom: 28 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
            {[...Array(4)].map((_, i) => <div key={i} className="iw-skel-block" style={{ height: 82 }} />)}
          </div>
          <div className="iw-skel-block" style={{ height: 160, marginBottom: 28 }} />
          <div className="iw-skel-block" style={{ height: 180 }} />
        </div>
      </AdminLayout>
    );
  }

  // ── Error ──
  if (error || !wisata) {
    return (
      <AdminLayout>
        <style>{css}</style>
        <div className="iw-empty">
          <i className="fa-solid fa-triangle-exclamation" />
          <p>{error || 'Data wisata tidak ditemukan.'}</p>
          <button onClick={fetchWisata} style={{ padding: '10px 24px', borderRadius: 50, border: '1.5px solid var(--teal-400)', background: 'white', color: 'var(--teal-700)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <i className="fa-solid fa-rotate-right" style={{ marginRight: 7 }} />Coba Lagi
          </button>
        </div>
      </AdminLayout>
    );
  }

  // Thumbnail URL
  const foto = wisata.thumbnail_url
    || (wisata.thumbnail ? `${BASE_URL}/storage/${wisata.thumbnail}` : null)
    || 'https://images.unsplash.com/photo-1570659274893-f8fc88e2d1de?w=1200&q=80';

  // Fasilitas — bisa string "Parkir, Mushola" atau sudah array
  const fasilitasList = wisata.fasilitas
    ? (Array.isArray(wisata.fasilitas)
        ? wisata.fasilitas
        : wisata.fasilitas.split(',').map(f => f.trim()).filter(Boolean))
    : [];

  // Harga aktif berdasarkan tab
  const prices    = wisata.prices || [];
  const activePrice = prices.find(p => p.day_type === activeTab) || prices[0] || null;

  return (
    <AdminLayout>
      <style>{css}</style>
      <div className="iw-page">

        {/* ── Section label ── */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <i className="fa-solid fa-mountain-sun" />Informasi Wisata
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 700, color: 'var(--dark)' }}>
            {wisata.nama}
          </div>
        </div>

        {/* ── Hero Image ── */}
        <div className="iw-hero">
          <img src={foto} alt={wisata.nama} className="iw-hero__img"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1570659274893-f8fc88e2d1de?w=1200&q=80'; }} />
          <div className="iw-hero__overlay" />
          <div className="iw-hero__body">
            <div>
              <div className="iw-hero__badge">
                <i className="fa-solid fa-map-pin" />{wisata.kategori || 'Wisata'}
              </div>
              <div className="iw-hero__name">{wisata.nama}</div>
              <div className="iw-hero__loc">
                <i className="fa-solid fa-location-dot" />
                {wisata.alamat_lengkap || wisata.kecamatan?.nama || 'Purbalingga'}
              </div>
            </div>
            {wisata.rating > 0 && (
              <div className="iw-hero__rating">
                <div className="iw-hero__rating-num">{Number(wisata.rating).toFixed(1)}</div>
                <div className="iw-hero__rating-stars">{ratingStars(wisata.rating)}</div>
                <div className="iw-hero__rating-label">{wisata.total_review || 0} ulasan</div>
              </div>
            )}
          </div>
        </div>

        {/* ── Info cards ── */}
        <div className="iw-info-row">
          <div className="iw-info-card">
            <div className="iw-info-card__icon"><i className="fa-solid fa-tag" /></div>
            <div>
              <div className="iw-info-card__label">Kategori</div>
              <div className="iw-info-card__val">{wisata.kategori || '—'}</div>
            </div>
          </div>
          <div className="iw-info-card">
            <div className="iw-info-card__icon"><i className="fa-solid fa-location-dot" /></div>
            <div>
              <div className="iw-info-card__label">Lokasi</div>
              <div className="iw-info-card__val">{wisata.kecamatan?.nama || 'Purbalingga'}</div>
            </div>
          </div>
          <div className="iw-info-card">
            <div className="iw-info-card__icon"><i className="fa-solid fa-clock" /></div>
            <div>
              <div className="iw-info-card__label">Jam Operasional</div>
              <div className="iw-info-card__val">
                {wisata.jam_buka && wisata.jam_tutup
                  ? `${wisata.jam_buka.slice(0,5)} – ${wisata.jam_tutup.slice(0,5)}`
                  : wisata.jam_buka || '—'}
              </div>
            </div>
          </div>
          <div className="iw-info-card">
            <div className="iw-info-card__icon"><i className="fa-solid fa-phone" /></div>
            <div>
              <div className="iw-info-card__label">Kontak</div>
              <div className="iw-info-card__val">{wisata.kontak || '—'}</div>
            </div>
          </div>
        </div>

        {/* ── Deskripsi ── */}
        <div className="iw-desc-card">
          <div className="iw-section-title">
            <i className="fa-solid fa-align-left" />Tentang Wisata Ini
          </div>
          <p className="iw-desc-text">{wisata.deskripsi || 'Deskripsi wisata belum tersedia.'}</p>
        </div>

        {/* ── Fasilitas ── */}
        {fasilitasList.length > 0 && (
          <div className="iw-desc-card">
            <div className="iw-section-title">
              <i className="fa-solid fa-list-check" />Fasilitas Tersedia
            </div>
            <div className="iw-fasilitas-wrap">
              {fasilitasList.map((f, i) => (
                <span key={i} className="iw-fasilitas-tag">
                  <i className="fa-solid fa-circle-check" style={{ fontSize: 10, color: 'var(--teal-500)' }} />
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Harga Tiket dari wisata_harga ── */}
        <div className="iw-ticket-section">
          <div className="iw-ticket-section__title">
            <i className="fa-solid fa-ticket" />Informasi Harga Tiket
          </div>

          {prices.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
              <i className="fa-solid fa-circle-info" style={{ marginRight: 8 }} />
              Harga tiket belum diatur
            </div>
          ) : (
            <>
              {/* Tab pilih tipe hari */}
              <div className="iw-ticket-tabs">
                {prices.map(p => (
                  <button
                    key={p.day_type}
                    className={`iw-ticket-tab${activeTab === p.day_type ? ' active' : ''}`}
                    onClick={() => setActiveTab(p.day_type)}
                  >
                    <i className={`fa-solid ${DAY_TYPE_ICON[p.day_type] || 'fa-calendar'}`} style={{ marginRight: 6 }} />
                    {DAY_TYPE_LABEL[p.day_type] || p.day_type}
                  </button>
                ))}
              </div>

              {/* Harga aktif */}
              {activePrice && (
                <div className="iw-ticket-row">
                  <div className="iw-ticket-item">
                    <div className="iw-ticket-item__icon"><i className="fa-solid fa-person" /></div>
                    <div>
                      <div className="iw-ticket-item__label">Tiket Dewasa</div>
                      <div className={activePrice.harga_dewasa > 0 ? 'iw-ticket-item__price' : 'iw-ticket-item__free'}>
                        {rupiah(activePrice.harga_dewasa)}
                      </div>
                    </div>
                  </div>
                  <div className="iw-ticket-item">
                    <div className="iw-ticket-item__icon"><i className="fa-solid fa-child" /></div>
                    <div>
                      <div className="iw-ticket-item__label">Tiket Anak</div>
                      <div className={activePrice.harga_anak > 0 ? 'iw-ticket-item__price' : 'iw-ticket-item__free'}>
                        {rupiah(activePrice.harga_anak)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
