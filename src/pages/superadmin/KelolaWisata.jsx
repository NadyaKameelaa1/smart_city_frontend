import { useState, useEffect, useRef } from "react";
import SuperAdminLayout from "./SuperAdminLayout";
import api from "../../api/axios";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";


// Fix default Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────
const css = `
  .kw-page { animation: kwFadeUp .4s ease both; }
  @keyframes kwFadeUp { from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)} }

  /* ── Stats ── */
  .kw-stats {
    display: grid; grid-template-columns: repeat(4,1fr);
    gap: 16px; margin-bottom: 28px;
  }
  .kw-stat {
    background: white; border-radius: 16px;
    border: 1px solid var(--border); padding: 18px 20px;
    box-shadow: var(--shadow-sm);
    display: flex; align-items: center; gap: 14px;
    transition: var(--transition);
  }
  .kw-stat:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
  .kw-stat__icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .kw-stat__num {
    font-family: var(--font-display);
    font-size: 26px; font-weight: 700; color: var(--dark); line-height: 1;
  }
  .kw-stat__label { font-size: 12px; color: var(--text-muted); margin-top: 3px; }

  /* ── Toolbar ── */
  .kw-toolbar {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 20px; flex-wrap: wrap;
  }
  .kw-search-wrap { position: relative; flex: 1; max-width: 340px; }
  .kw-search-icon {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    color: var(--teal-400); font-size: 13px; pointer-events: none;
  }
  .kw-search-input {
    width: 100%; padding: 10px 16px 10px 38px;
    border-radius: 50px; border: 1.5px solid var(--border);
    background: white; font-family: var(--font-body);
    font-size: 13.5px; color: var(--dark); outline: none;
    transition: var(--transition);
  }
  .kw-search-input:focus { border-color: var(--teal-500); box-shadow: 0 0 0 3px rgba(64,114,175,.1); }
  .kw-search-input::placeholder { color: var(--text-muted); }

  .kw-filter-tabs { display: flex; gap: 6px; flex-wrap: wrap; flex: 1; }
  .kw-filter-tab {
    padding: 7px 16px; border-radius: 50px;
    border: 1.5px solid var(--border); background: white;
    font-family: var(--font-body); font-size: 12.5px; font-weight: 500;
    color: var(--text-muted); cursor: pointer; transition: var(--transition);
  }
  .kw-filter-tab:hover { border-color: var(--teal-400); color: var(--teal-700); }
  .kw-filter-tab.active { border-color: var(--teal-600); background: var(--teal-600); color: white; font-weight: 600; }

  .kw-add-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 9px 20px; border-radius: 50px;
    background: var(--teal-600); color: white; border: none;
    font-family: var(--font-body); font-size: 13.5px; font-weight: 600;
    cursor: pointer; transition: var(--transition); white-space: nowrap;
    box-shadow: 0 4px 14px rgba(64,114,175,.3);
  }
  .kw-add-btn:hover { background: var(--teal-700); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(64,114,175,.35); }

  /* ── Table card ── */
  .kw-table-card {
    background: white; border-radius: 20px;
    border: 1px solid var(--border); box-shadow: var(--shadow-sm); overflow: hidden;
  }
  .kw-table-head {
    padding: 18px 24px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  .kw-table-head-title {
    font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--dark);
    display: flex; align-items: center; gap: 9px;
  }
  .kw-table-head-title i { color: var(--teal-500); font-size: 15px; }
  .kw-count-badge {
    background: var(--teal-50); color: var(--teal-700);
    padding: 3px 10px; border-radius: 50px; font-size: 12px; font-weight: 700;
  }

  .kw-table-wrap { overflow-x: auto; }
  table.kw-table {
    width: 100%; border-collapse: collapse; font-size: 13px; min-width: 1100px;
  }
  .kw-table thead tr { background: var(--teal-50); }
  .kw-table th {
    padding: 12px 14px; text-align: left;
    font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
    color: var(--teal-700); border-bottom: 1px solid var(--border); white-space: nowrap;
  }
  .kw-table td {
    padding: 13px 14px; border-bottom: 1px solid var(--teal-50);
    color: var(--text-dark); vertical-align: middle;
  }
  .kw-table tbody tr { transition: background .15s; }
  .kw-table tbody tr:hover { background: var(--cream); }
  .kw-table tbody tr:last-child td { border-bottom: none; }

  /* Thumbnail */
  .kw-thumb {
    width: 64px; height: 48px; border-radius: 8px; object-fit: cover;
    border: 1px solid var(--border); flex-shrink: 0; display: block;
    background: var(--teal-50);
  }
  .kw-thumb-placeholder {
    width: 64px; height: 48px; border-radius: 8px;
    background: var(--teal-50); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    color: var(--teal-300); font-size: 18px;
  }

  /* Deskripsi clamp */
  .kw-desc-wrap { max-width: 220px; }
  .kw-desc-text {
    font-size: 12.5px; color: var(--text-muted); line-height: 1.55;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .kw-desc-text.expanded {
    display: block; -webkit-line-clamp: unset; overflow: visible;
  }
  .kw-desc-toggle {
    font-size: 11.5px; color: var(--teal-600); font-weight: 600;
    cursor: pointer; background: none; border: none;
    padding: 2px 0; font-family: var(--font-body);
    display: inline-flex; align-items: center; gap: 4px; margin-top: 3px;
  }
  .kw-desc-toggle:hover { color: var(--teal-800); }

  /* Status dropdown */
  .kw-status-select {
    padding: 4px 10px; border-radius: 50px;
    border: 1.5px solid; font-size: 11.5px; font-weight: 700;
    font-family: var(--font-body); cursor: pointer;
    outline: none; transition: var(--transition); appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 8px center;
    padding-right: 24px;
  }
  .kw-status-select.aktif   { background-color: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
  .kw-status-select.nonaktif{ background-color: #fef2f2; color: #b91c1c; border-color: #fecaca; }
  .kw-status-select.draft   { background-color: #fffbeb; color: #92400e; border-color: #fde68a; }

  /* Rating */
  .kw-rating {
    display: flex; align-items: center; gap: 5px;
    font-size: 13px; font-weight: 700; color: var(--dark);
  }
  .kw-rating i { color: #f59e0b; font-size: 12px; }
  .kw-review-count { font-size: 11px; color: var(--text-muted); font-weight: 400; }

  /* Kategori badge */
  .kw-kategori {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 50px;
    background: var(--teal-50); color: var(--teal-700);
    border: 1px solid var(--teal-100);
    font-size: 11.5px; font-weight: 600; white-space: nowrap;
  }

  /* Action buttons */
  .kw-actions { display: flex; gap: 7px; }
  .kw-act-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 8px;
    font-size: 12px; font-weight: 600; cursor: pointer;
    border: none; font-family: var(--font-body); transition: var(--transition); white-space: nowrap;
  }
  .kw-act-btn--edit { background: var(--teal-50); color: var(--teal-700); border: 1.5px solid var(--teal-100); }
  .kw-act-btn--edit:hover { background: var(--teal-600); color: white; border-color: var(--teal-600); }
  .kw-act-btn--del { background: #fef2f2; color: #b91c1c; border: 1.5px solid #fecaca; }
  .kw-act-btn--del:hover { background: #b91c1c; color: white; border-color: #b91c1c; }

  /* ── Pagination ── */
  .kw-pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 12px;
  }
  .kw-page-info { font-size: 13px; color: var(--text-muted); }
  .kw-page-btns { display: flex; gap: 5px; }
  .kw-page-btn {
    width: 34px; height: 34px; border-radius: 8px;
    border: 1.5px solid var(--border); background: white;
    font-size: 13px; font-weight: 600; color: var(--text-dark);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: var(--transition); font-family: var(--font-body);
  }
  .kw-page-btn:hover { border-color: var(--teal-400); color: var(--teal-700); }
  .kw-page-btn.active { background: var(--teal-600); border-color: var(--teal-600); color: white; }
  .kw-page-btn:disabled { opacity: .35; cursor: not-allowed; }

  /* ── Empty / Skeleton ── */
  .kw-empty {
    text-align: center; padding: 64px 0;
    display: flex; flex-direction: column; align-items: center; gap: 14px;
  }
  .kw-empty i { font-size: 44px; color: var(--teal-200); }
  .kw-empty p { font-size: 14px; color: var(--text-muted); }
  .kw-skel { animation: kwSkel 1.3s ease infinite; }
  @keyframes kwSkel { 0%,100%{opacity:1}50%{opacity:.4} }
  .kw-skel-bar { height: 14px; border-radius: 7px; background: var(--teal-100); }

  /* ══════════ MODAL ══════════ */
  .kw-modal-overlay {
    position: fixed; inset: 0; z-index: 5000;
    background: rgba(10,29,61,.65); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
    animation: kwFadeIn .2s ease;
  }
  @keyframes kwFadeIn { from{opacity:0}to{opacity:1} }
  .kw-modal {
    background: white; border-radius: 24px; width: 100%; max-width: 620px;
    box-shadow: 0 30px 80px rgba(0,0,0,.22);
    animation: kwScaleIn .25s ease; display: flex; flex-direction: column;
    max-height: 92vh;
  }
  @keyframes kwScaleIn { from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)} }

  .kw-modal-header {
    padding: 24px 28px 18px; border-bottom: 1px solid var(--border);
    display: flex; align-items: flex-start; justify-content: space-between; gap: 14px;
    flex-shrink: 0;
  }
  .kw-modal-header-left { display: flex; align-items: center; gap: 14px; }
  .kw-modal-header-icon {
    width: 48px; height: 48px; border-radius: 14px;
    background: var(--teal-50); color: var(--teal-600);
    display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;
  }
  .kw-modal-title { font-family: var(--font-display); font-size: 19px; font-weight: 700; color: var(--dark); margin-bottom: 3px; }
  .kw-modal-sub { font-size: 13px; color: var(--text-muted); }
  .kw-modal-close {
    width: 34px; height: 34px; border-radius: 50%;
    background: var(--teal-50); border: 1.5px solid var(--border);
    color: var(--text-muted); font-size: 14px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: var(--transition); flex-shrink: 0;
  }
  .kw-modal-close:hover { background: #fef2f2; border-color: #fecaca; color: #b91c1c; transform: rotate(90deg); }

  .kw-modal-body {
    padding: 22px 28px; display: flex; flex-direction: column; gap: 16px;
    overflow-y: auto; flex: 1;
  }
  .kw-modal-body::-webkit-scrollbar { width: 4px; }
  .kw-modal-body::-webkit-scrollbar-thumb { background: var(--teal-200); border-radius: 2px; }

  /* Form elements */
  .kw-field { display: flex; flex-direction: column; gap: 6px; }
  .kw-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .kw-field-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .kw-label {
    font-size: 12.5px; font-weight: 700; color: var(--text-dark);
    display: flex; align-items: center; gap: 5px;
  }
  .kw-label i { color: var(--teal-500); font-size: 11px; }
  .kw-required { color: #e11d48; font-size: 13px; }

  .kw-input, .kw-select, .kw-textarea {
    width: 100%; padding: 10px 14px;
    border-radius: 10px; border: 1.5px solid var(--border);
    background: white; font-family: var(--font-body);
    font-size: 13.5px; color: var(--dark); outline: none;
    transition: var(--transition);
  }
  .kw-input:focus, .kw-select:focus, .kw-textarea:focus {
    border-color: var(--teal-500); box-shadow: 0 0 0 3px rgba(64,114,175,.1);
  }
  .kw-textarea { resize: vertical; min-height: 90px; line-height: 1.6; }
  .kw-input::placeholder, .kw-textarea::placeholder { color: var(--text-muted); }
  .kw-input.error, .kw-select.error, .kw-textarea.error { border-color: #f87171; }
  .kw-error-msg { font-size: 12px; color: #e11d48; display: flex; align-items: center; gap: 5px; }

  .kw-input-wrap { position: relative; }
  .kw-input-icon {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    color: var(--teal-400); font-size: 13px; pointer-events: none;
  }
  .kw-input-wrap .kw-input { padding-left: 36px; }

  .kw-modal-section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    color: var(--teal-600); display: flex; align-items: center; gap: 8px; margin-bottom: 2px;
  }
  .kw-modal-section-label::after { content: ''; flex: 1; height: 1px; background: var(--teal-100); }
  .kw-modal-divider { height: 1px; background: var(--border); margin: 4px 0; }

  /* File input */
  .kw-file-area {
    border: 2px dashed var(--teal-200); border-radius: 12px;
    padding: 20px; text-align: center; cursor: pointer;
    transition: var(--transition); background: var(--teal-50);
    position: relative;
  }
  .kw-file-area:hover { border-color: var(--teal-400); background: rgba(64,114,175,.05); }
  .kw-file-area input[type="file"] { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
  .kw-file-area-icon { font-size: 28px; color: var(--teal-400); margin-bottom: 8px; }
  .kw-file-area-label { font-size: 13px; color: var(--text-muted); }
  .kw-file-area-label strong { color: var(--teal-700); }
  .kw-file-preview {
    width: 100%; max-height: 120px; object-fit: cover;
    border-radius: 8px; margin-top: 8px; border: 1px solid var(--border);
  }

  .kw-modal-footer {
    padding: 18px 28px; border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: flex-end; gap: 10px;
    flex-shrink: 0;
  }
  .kw-modal-cancel {
    padding: 10px 22px; border-radius: 50px;
    border: 1.5px solid var(--border); background: white;
    font-family: var(--font-body); font-size: 13.5px; font-weight: 600;
    color: var(--text-muted); cursor: pointer; transition: var(--transition);
  }
  .kw-modal-cancel:hover { background: var(--cream); border-color: var(--teal-200); }
  .kw-modal-submit {
    padding: 10px 26px; border-radius: 50px;
    background: var(--teal-600); color: white; border: none;
    font-family: var(--font-body); font-size: 13.5px; font-weight: 700;
    cursor: pointer; transition: var(--transition);
    display: flex; align-items: center; gap: 7px;
    box-shadow: 0 4px 14px rgba(64,114,175,.3);
  }
  .kw-modal-submit:hover { background: var(--teal-700); transform: translateY(-1px); }
  .kw-modal-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }

  /* ── Confirm ── */
  .kw-confirm-overlay {
    position: fixed; inset: 0; z-index: 6000;
    background: rgba(10,29,61,.7); backdrop-filter: blur(5px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
    animation: kwFadeIn .2s ease;
  }
  .kw-confirm-box {
    background: white; border-radius: 20px; padding: 32px 28px;
    max-width: 380px; width: 100%;
    box-shadow: 0 24px 60px rgba(0,0,0,.22); animation: kwScaleIn .25s ease;
  }
  .kw-confirm-icon { width: 52px; height: 52px; border-radius: 14px; background: #fef2f2; color: #b91c1c; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 16px; }
  .kw-confirm-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--dark); margin-bottom: 10px; }
  .kw-confirm-desc { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px; }
  .kw-confirm-btns { display: flex; gap: 10px; }
  .kw-confirm-btn { flex: 1; padding: 11px; border-radius: 10px; font-size: 14px; font-weight: 600; font-family: var(--font-body); cursor: pointer; transition: var(--transition); border: none; }
  .kw-confirm-btn--cancel { background: var(--teal-50); color: var(--text-muted); border: 1.5px solid var(--border); }
  .kw-confirm-btn--cancel:hover { background: var(--teal-100); }
  .kw-confirm-btn--del { background: #b91c1c; color: white; }
  .kw-confirm-btn--del:hover { background: #991b1b; }

  /* ── Toast ── */
  .kw-toast {
    position: fixed; bottom: 28px; right: 28px; z-index: 9999;
    padding: 14px 20px; border-radius: 14px; font-size: 13.5px; font-weight: 500;
    display: flex; align-items: center; gap: 10px;
    box-shadow: 0 8px 30px rgba(0,0,0,.22); animation: kwSlideUp .3s ease; max-width: 340px; color: white;
  }
  @keyframes kwSlideUp { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
  .kw-toast--success { background: #15803d; }
  .kw-toast--error { background: #b91c1c; }

  /* Spinner */
  .kw-spinner {
    width: 15px; height: 15px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,.3); border-top-color: white;
    animation: kwSpin .7s linear infinite; display: inline-block;
  }
  @keyframes kwSpin { to{transform:rotate(360deg)} }

  @media (max-width: 768px) {
    .kw-stats { grid-template-columns: repeat(2,1fr); }
    .kw-field-row, .kw-field-row-3 { grid-template-columns: 1fr; }
    .kw-toolbar { flex-direction: column; align-items: stretch; }
    .kw-search-wrap { max-width: 100%; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const PER_PAGE = 10;

const STATUS_LIST = ["Aktif", "Nonaktif", "Draft"];

const EMPTY_FORM = {
  nama: "", slug: "", kategori: "", deskripsi: "",
  kecamatan_id: "", jam_buka: "", jam_tutup: "",
  fasilitas: "", kontak: "", status: "Draft",
  thumbnail: null, latitude: -7.3906, longitude: 109.3647,
  prices: [
    { day_type: "weekday", harga_anak: 0, harga_dewasa: 0 },
    { day_type: "weekend", harga_anak: 0, harga_dewasa: 0 },
  ],
};

const DAY_TYPES = ["weekday", "weekend", "holiday"];

const KATEGORI_LIST = ['Alam', 'Rekreasi', 'Budaya', 'Kuliner', 'Religi', 'Edukasi'];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: DescCell (truncate + toggle)
// ─────────────────────────────────────────────────────────────────────────────
function DescCell({ text }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>—</span>;
  return (
    <div className="kw-desc-wrap">
      <p className={`kw-desc-text${expanded ? " expanded" : ""}`}>{text}</p>
      <button className="kw-desc-toggle" onClick={() => setExpanded((e) => !e)}>
        {expanded ? (
          <><i className="fa-solid fa-chevron-up" style={{ fontSize: 9 }} /> Sembunyikan</>
        ) : (
          <><i className="fa-solid fa-chevron-down" style={{ fontSize: 9 }} /> Lihat selengkapnya...</>
        )}
      </button>
    </div>
  );
}

function LocationMarker({ position, onMove }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onMove(parseFloat(lat.toFixed(7)), parseFloat(lng.toFixed(7)));
    },
  });
  return position ? <Marker position={position} /> : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function KelolaWisata() {
  const [wisataList, setWisataList] = useState([]);
  const [kecamatanList, setKecamatanList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErr, setFormErr] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileRef = useRef();

  const [confirmDel, setConfirmDel] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchAll(); }, []);


  const fetchAll = async () => {
    setLoading(true);
    try {
      const [wRes, kRes] = await Promise.all([
        api.get("/super-admin/wisata"),
        api.get("/super-admin/kecamatan"),
        
      ]);
      setWisataList(wRes.data.data || wRes.data || []);
      setKecamatanList(kRes.data.data || kRes.data || []);
    } catch {
      showToast("Gagal memuat data. Coba refresh.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  // ── Filtering ──
  const filtered = wisataList.filter((w) => {
    const q = search.toLowerCase();
    const matchSearch = !q || w.nama?.toLowerCase().includes(q) || w.kategori?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "semua" || w.status === filterStatus;
    return matchSearch && matchStatus;
  });

  useEffect(() => { setPage(1); }, [search, filterStatus]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Stats
  const total = wisataList.length;
  const Aktif = wisataList.filter((w) => w.status === "Aktif").length;
  const Nonaktif = wisataList.filter((w) => w.status === "Nonaktif").length;
  const Draft = wisataList.filter((w) => w.status === "Draft").length;

  const stats = [
    { icon: "fa-solid fa-mountain-sun", label: "Total Wisata",    num: total,    color: "var(--teal-600)", bg: "var(--teal-50)" },
    { icon: "fa-solid fa-circle-check", label: "Aktif",           num: Aktif,    color: "#15803d",          bg: "#f0fdf4" },
    { icon: "fa-solid fa-circle-xmark", label: "Nonaktif",        num: Nonaktif, color: "#b91c1c",          bg: "#fef2f2" },
    { icon: "fa-solid fa-file-pen",     label: "Draft",           num: Draft,    color: "#92400e",          bg: "#fffbeb" },
  ];

  // ── Modal ──
  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErr({});
    setPreviewUrl(null);
    setModalOpen(true);
  };

  const openEdit = (w) => {
    setEditTarget(w);
    setForm({
      nama: w.nama || "",
      slug: w.slug || "",
      kategori: w.kategori || "",
      deskripsi: w.deskripsi || "",
      kecamatan_id: w.kecamatan_id || "",
      jam_buka: w.jam_buka || "",
      jam_tutup: w.jam_tutup || "",
      fasilitas: w.fasilitas || "",
      kontak: w.kontak || "",
      status: w.status || "Draft",
      thumbnail: null,
      latitude: w.marker?.lat ?? -7.3906,
      longitude: w.marker?.lng ?? 109.3647,
      // Isi prices dari data yang ada (jika ada), jika tidak gunakan default
      prices: w.prices?.length
        ? w.prices.map(p => ({
            day_type: p.day_type,
            harga_anak: p.harga_anak ?? 0,
            harga_dewasa: p.harga_dewasa ?? 0,
          }))
        : [
            { day_type: "weekday", harga_anak: 0, harga_dewasa: 0 },
            { day_type: "weekend", harga_anak: 0, harga_dewasa: 0 },
          ],
    });
    setFormErr({});
    setPreviewUrl(w.thumbnail_url || w.gambar || null);
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditTarget(null); setPreviewUrl(null); };

  const handleFormChange = (field, val) => {
  setForm((prev) => {
    const updated = { ...prev, [field]: val };
    if (field === "nama") {
      const oldSlug = generateSlug(prev.nama || "");
      const currentSlug = prev.slug;
      if (!currentSlug || currentSlug === oldSlug) {
        updated.slug = generateSlug(val);
      }
    }
    return updated;
  });
  setFormErr((e) => ({ ...e, [field]: "" }));
};

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    handleFormChange("thumbnail", file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handlePriceChange = (index, field, value) => {
    const newPrices = [...form.prices];
    newPrices[index][field] = field === 'day_type' ? value : Number(value);
    setForm(prev => ({ ...prev, prices: newPrices }));
  };

  const addPriceRow = () => {
    if (form.prices.length >= DAY_TYPES.length) return;
    setForm(prev => ({
      ...prev,
      prices: [...prev.prices, { day_type: "weekday", harga_anak: 0, harga_dewasa: 0 }],
    }));
  };

  const removePriceRow = (index) => {
    setForm(prev => ({
      ...prev,
      prices: prev.prices.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const err = {};
    if (!form.nama.trim()) err.nama = "Nama wisata wajib diisi.";
    if (!form.kategori.trim())    err.kategori    = "Kategori wajib diisi.";
    if (!form.kecamatan_id)       err.kecamatan_id = "Pilih kecamatan.";
    return err;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (Object.keys(err).length) { setFormErr(err); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v === null || v === undefined) return;
        if (k === 'prices') {
          fd.append(k, JSON.stringify(v));   // kirim sebagai JSON string
        } else {
          fd.append(k, v);
        }
      });

      if (editTarget) {
        await api.post(`/super-admin/wisata/${editTarget.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        const res = await api.post("/super-admin/wisata", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setWisataList(prev => [res.data.data || res.data, ...prev]);
        showToast(`Wisata "${form.nama}" berhasil ditambahkan.`);
      }
      closeModal();
    } catch (e) {
      const message =
        e.response?.data?.message ||
        (e.response?.data?.errors
          ? Object.values(e.response.data.errors).flat().join(', ')
          : 'Gagal menyimpan data.');
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const w = confirmDel; setConfirmDel(null);
    try {
      await api.delete(`/super-admin/wisata/${w.id}`);
      setWisataList((prev) => prev.filter((x) => x.id !== w.id));
      showToast(`Wisata "${w.nama}" berhasil dihapus.`);
    } catch {
      showToast("Gagal menghapus data.", "error");
    }
  };

  // Inline status update
  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/super-admin/wisata/${id}/status`, { status: newStatus });
      setWisataList((prev) => prev.map((w) => w.id === id ? { ...w, status: newStatus } : w));
      showToast("Status berhasil diperbarui.");
    } catch {
      showToast("Gagal mengubah status.", "error");
    }
  };

//   function LocationMarker({ position, onMove }) {
//   useMapEvents({
//     click(e) {
//       const { lat, lng } = e.latlng;
//       onMove(parseFloat(lat.toFixed(7)), parseFloat(lng.toFixed(7)));
//     },
//   });
//   return position ? <Marker position={position} /> : null;
// }

  const statusClass = (s) => s === "Aktif" ? "aktif" : s === "Nonaktif" ? "nonaktif" : "draft";

  const kecamatanName = (id) => kecamatanList.find((k) => k.id == id)?.nama || "—";

  const getCorrectImageUrl = (item) => {
  // 1. Cek apakah sudah ada thumbnail_url dari Accessor Laravel
  if (item.thumbnail_url) return item.thumbnail_url;
  
  let path = item.gambar || item.thumbnail;
  if (!path) return null;

  // 2. Jika path diawali dengan http, langsung kembalikan
  if (path.startsWith("http")) return path;

  // 3. Bersihkan path jika mengandung "/wisata/" atau "/" di awal
  // Kita hanya butuh nama filenya saja atau path relatif setelah storage
  const cleanPath = path.replace(/^\/?wisata\//, "").replace(/^\//, "");

  // 4. Gabungkan dengan URL storage Laravel kamu
  const baseUrl = "https://apismartcity.qode.my.id/storage/wisata"; // Sesuaikan folder simpanmu
  return `${baseUrl}/${cleanPath}`;
};

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SuperAdminLayout>
      <style>{css}</style>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet" />
      <div className="kw-page">

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "var(--teal-600)", display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <i className="fa-solid fa-mountain-sun" /> Super Admin — Konten Portal
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "var(--dark)" }}>
            Kelola Wisata
          </div>
        </div>

        {/* Stats */}
        <div className="kw-stats">
          {stats.map((s, i) => (
            <div className="kw-stat" key={i}>
              <div className="kw-stat__icon" style={{ background: s.bg, color: s.color }}>
                <i className={s.icon} />
              </div>
              <div>
                <div className="kw-stat__num">{s.num}</div>
                <div className="kw-stat__label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="kw-toolbar">
          <div className="kw-search-wrap">
            <i className="fa-solid fa-magnifying-glass kw-search-icon" />
            <input className="kw-search-input" type="text" placeholder="Cari nama wisata, kategori..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="kw-filter-tabs">
            {["semua", "Aktif", "Nonaktif", "Draft"].map((f) => (
              <button key={f} className={`kw-filter-tab${filterStatus === f ? " active" : ""}`} onClick={() => setFilterStatus(f)}>
                {f === "semua" ? "Semua" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button className="kw-add-btn" onClick={openAdd}>
            <i className="fa-solid fa-plus" /> Tambah Wisata
          </button>
        </div>

        {/* Table */}
        <div className="kw-table-card">
          <div className="kw-table-head">
            <div className="kw-table-head-title">
              <i className="fa-solid fa-table-list" /> Daftar Destinasi Wisata
              <span className="kw-count-badge">{filtered.length}</span>
            </div>
          </div>

          {loading ? (
            <div className="kw-table-wrap">
              <table className="kw-table">
                <thead><tr>{["ID","Thumbnail","Nama","Kategori","Deskripsi","Kecamatan","Jam Buka","Jam Tutup","Fasilitas","Kontak","Rating","Status","Aksi"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
                <tbody className="kw-skel">
                  {[...Array(5)].map((_, i) => (
                    <tr key={i}>{[...Array(13)].map((_, j) => <td key={j}><div className="kw-skel-bar" style={{ width: "75%" }} /></td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : filtered.length === 0 ? (
            <div className="kw-empty">
              <i className="fa-solid fa-map-location-dot" />
              <p>Tidak ada data wisata{search ? ` untuk "${search}"` : ""}.</p>
            </div>
          ) : (
            <div className="kw-table-wrap">
              <table className="kw-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Thumbnail</th>
                    <th>Nama Wisata</th>
                    <th>Kategori</th>
                    <th>Deskripsi</th>
                    <th>Kecamatan</th>
                    <th>Jam Buka</th>
                    <th>Jam Tutup</th>
                    <th>Fasilitas</th>
                    <th>Kontak</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((w) => (
                    <tr key={w.id}>
                      <td><span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", fontFamily: "monospace" }}>#{w.id}</span></td>
                      <td>
                        {getCorrectImageUrl(w) ? (
                          <img 
                            src={getCorrectImageUrl(w)} 
                            alt={w.nama} 
                            className="kw-thumb" 
                            onError={(e) => {
                              // Fallback jika gambar tetap tidak ditemukan
                              e.target.src = "https://via.placeholder.com/150?text=No+Image";
                            }}
                          />
                        ) : (
                          <div className="kw-thumb-placeholder">
                            <i className="fa-solid fa-image" />
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: 700, minWidth: 150 }}>{w.nama}</td>
                      <td><span className="kw-kategori"><i className="fa-solid fa-tag" style={{ fontSize: 9 }} />{w.kategori || "—"}</span></td>
                      <td><DescCell text={w.deskripsi} /></td>
                      <td style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{kecamatanName(w.kecamatan_id)}</td>
                      <td style={{ fontSize: 12.5, whiteSpace: "nowrap" }}>
                        {w.jam_buka ? <><i className="fa-regular fa-clock" style={{ color: "var(--teal-400)", marginRight: 5 }} />{w.jam_buka}</> : "—"}
                      </td>
                      <td style={{ fontSize: 12.5, whiteSpace: "nowrap" }}>{w.jam_tutup || "—"}</td>
                      <td><DescCell text={w.fasilitas} /></td>
                      <td style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{w.kontak || "—"}</td>
                      <td>
                        <div className="kw-rating">
                          <i className="fa-solid fa-star" />
                          {Number(w.rating || 0).toFixed(1)}
                          <span className="kw-review-count">({w.total_review || 0})</span>
                        </div>
                      </td>
                      <td>
                        <select
                          className={`kw-status-select ${statusClass(w.status)}`}
                          value={w.status || "Draft"}
                          onChange={(e) => handleStatusChange(w.id, e.target.value)}
                        >
                          {STATUS_LIST.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                      </td>
                      <td>
                        <div className="kw-actions">
                          <button className="kw-act-btn kw-act-btn--edit" onClick={() => openEdit(w)}>
                            <i className="fa-solid fa-pen-to-square" /> Edit
                          </button>
                          <button className="kw-act-btn kw-act-btn--del" onClick={() => setConfirmDel(w)}>
                            <i className="fa-solid fa-trash" /> Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="kw-pagination">
              <div className="kw-page-info">Menampilkan {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} dari {filtered.length}</div>
              <div className="kw-page-btns">
                <button className="kw-page-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 1}><i className="fa-solid fa-chevron-left" style={{ fontSize: 11 }} /></button>
                {[...Array(totalPages)].map((_, i) => <button key={i} className={`kw-page-btn${page === i + 1 ? " active" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>)}
                <button className="kw-page-btn" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}><i className="fa-solid fa-chevron-right" style={{ fontSize: 11 }} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════ MODAL ══════ */}
      {modalOpen && (
        <div className="kw-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="kw-modal">
            <div className="kw-modal-header">
              <div className="kw-modal-header-left">
                <div className="kw-modal-header-icon"><i className={`fa-solid ${editTarget ? "fa-pen-to-square" : "fa-plus"}`} /></div>
                <div>
                  <div className="kw-modal-title">{editTarget ? "Edit Wisata" : "Tambah Wisata Baru"}</div>
                  <div className="kw-modal-sub">{editTarget ? `Mengedit: ${editTarget.nama}` : "Lengkapi data destinasi wisata"}</div>
                </div>
              </div>
              <button className="kw-modal-close" onClick={closeModal}><i className="fa-solid fa-xmark" /></button>
            </div>

            <div className="kw-modal-body">
              <div className="kw-modal-section-label">Informasi Utama</div>

            
                <div className="kw-field">
                  <label className="kw-label"><i className="fa-solid fa-mountain-sun" /> Nama Wisata <span className="kw-required">*</span></label>
                  <input className={`kw-input${formErr.nama ? " error" : ""}`} placeholder="Nama destinasi wisata" value={form.nama} onChange={(e) => handleFormChange("nama", e.target.value)}/>
                  {formErr.nama && <span className="kw-error-msg"><i className="fa-solid fa-circle-exclamation" />{formErr.nama}</span>}
                </div>
             

              <div className="kw-field-row">
              <div className="kw-field">
                  <label className="kw-label"><i className="fa-solid fa-tag" /> Kategori <span className="kw-required">*</span></label>
                  <select
                    className={`kw-select${formErr.kategori ? " error" : ""}`}
                    value={form.kategori}
                    onChange={(e) => handleFormChange("kategori", e.target.value)}
                  >
                    <option value="">— Pilih Kategori —</option>
                    {KATEGORI_LIST.map((kat) => (
                      <option key={kat} value={kat}>{kat}</option>
                    ))}
                  </select>
                  {formErr.kategori && <span className="kw-error-msg"><i className="fa-solid fa-circle-exclamation" />{formErr.kategori}</span>}
                </div>
              <div className="kw-field">
                <label className="kw-label"><i className="fa-solid fa-link" /> Slug URL</label>
                <input
                  className="kw-input"
                  placeholder="slug-url-otomatis"
                  value={form.slug}
                  onChange={(e) => handleFormChange("slug", e.target.value)}
                />
                <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  <i className="fa-solid fa-circle-info" style={{ marginRight: 4, color: "var(--teal-400)" }} />
                  Ubah manual hanya jika diperlukan. Huruf kecil, angka, dan strip (-).
                </span>
              </div>
            </div>

              <div className="kw-field">
                <label className="kw-label"><i className="fa-solid fa-align-left" /> Deskripsi</label>
                <textarea className="kw-textarea" placeholder="Deskripsi lengkap destinasi wisata..." value={form.deskripsi} onChange={(e) => handleFormChange("deskripsi", e.target.value)} rows={4} />
              </div>

              <div className="kw-modal-divider" />
              <div className="kw-modal-section-label">Lokasi & Waktu</div>

              <div className="kw-field-row">
                <div className="kw-field">
                  <label className="kw-label"><i className="fa-solid fa-location-dot" /> Kecamatan <span className="kw-required">*</span></label>
                  <select className={`kw-select${formErr.kecamatan_id ? " error" : ""}`} value={form.kecamatan_id} onChange={(e) => handleFormChange("kecamatan_id", e.target.value)}>
                    <option value="">— Pilih Kecamatan —</option>
                    {kecamatanList.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                  </select>
                  {formErr.kecamatan_id && <span className="kw-error-msg"><i className="fa-solid fa-circle-exclamation" />{formErr.kecamatan_id}</span>}
                </div>
                <div className="kw-field">
                  <label className="kw-label"><i className="fa-solid fa-flag" /> Status</label>
                  <select className="kw-select" value={form.status} onChange={(e) => handleFormChange("status", e.target.value)}>
                    {STATUS_LIST.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div className="kw-field-row">
                <div className="kw-field">
                  <label className="kw-label"><i className="fa-regular fa-clock" /> Jam Buka</label>
                  <input className="kw-input" type="time" value={form.jam_buka} onChange={(e) => handleFormChange("jam_buka", e.target.value)} />
                </div>
                <div className="kw-field">
                  <label className="kw-label"><i className="fa-regular fa-clock" /> Jam Tutup</label>
                  <input className="kw-input" type="time" value={form.jam_tutup} onChange={(e) => handleFormChange("jam_tutup", e.target.value)} />
                </div>
              </div>

              <div className="kw-modal-divider" />
              <div className="kw-modal-section-label">Detail & Kontak</div>

              <div className="kw-field">
                  <label className="kw-label"><i className="fa-solid fa-phone" /> Kontak</label>
                  <textarea className="kw-textarea" placeholder="Nomor telepon / WhatsApp..." value={form.kontak} onChange={(e) => handleFormChange("kontak", e.target.value)} rows={3} />
                </div>

              <div className="kw-modal-divider" />
              <div className="kw-modal-section-label">Koordinat di Peta</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: -8, marginBottom: 4 }}>
                <i className="fa-solid fa-hand-pointer" style={{ color: "var(--teal-500)", marginRight: 6 }} />
                 Tentukan garis bujur (lng) dan garis lintang (lat) :
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <div className="kw-coord-badge" style={{ padding: '5px 12px', borderRadius: 8, background: 'var(--teal-50)', border: '1px solid var(--teal-100)', fontFamily: 'monospace', fontSize: 12 }}>
                  <i className="fa-solid fa-up-down" style={{ marginRight: 5, color: 'var(--teal-400)' }} />
                  Lat: {form.latitude?.toFixed(6)}
                </div>
                <div className="kw-coord-badge" style={{ padding: '5px 12px', borderRadius: 8, background: 'var(--teal-50)', border: '1px solid var(--teal-100)', fontFamily: 'monospace', fontSize: 12 }}>
                  <i className="fa-solid fa-left-right" style={{ marginRight: 5, color: 'var(--teal-400)' }} />
                  Lng: {form.longitude?.toFixed(6)}
                </div>
              </div>

              <div className="kw-field-row" style={{ marginTop: 8 }}>
                <div className="kw-field">
                  <label className="kw-label">Latitude</label>
                  <input
                    type="number"
                    className="kw-input"
                    step="0.0000001"
                    value={form.latitude}
                    onChange={(e) => handleFormChange("latitude", parseFloat(e.target.value))}
                  />
                </div>
                <div className="kw-field">
                  <label className="kw-label">Longitude</label>
                  <input
                    type="number"
                    className="kw-input"
                    step="0.0000001"
                    value={form.longitude}
                    onChange={(e) => handleFormChange("longitude", parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="kw-field-row">
                <div className="kw-field">
                  <label className="kw-label"><i className="fa-solid fa-list-check" /> Fasilitas</label>
                  <textarea className="kw-textarea" placeholder="cth: Toilet, Parkir, Mushola..." value={form.fasilitas} onChange={(e) => handleFormChange("fasilitas", e.target.value)} rows={3} />
                </div>
              </div>

              <div className="kw-modal-divider" />
              <div className="kw-modal-section-label">Harga Tiket</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {form.prices.map((price, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div className="kw-field" style={{ flex: 1 }}>
                      <label className="kw-label">Tipe Hari</label>
                      <select
                        className="kw-select"
                        value={price.day_type}
                        onChange={e => handlePriceChange(idx, 'day_type', e.target.value)}
                      >
                        {DAY_TYPES.map(dt => (
                          <option key={dt} value={dt}>{dt.charAt(0).toUpperCase() + dt.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="kw-field" style={{ flex: 1 }}>
                      <label className="kw-label">Harga Anak (Rp)</label>
                      <input
                        type="number"
                        className="kw-input"
                        step="1000"
                        min="0"
                        value={price.harga_anak}
                        onChange={e => handlePriceChange(idx, 'harga_anak', e.target.value)}
                      />
                    </div>
                    <div className="kw-field" style={{ flex: 1 }}>
                      <label className="kw-label">Harga Dewasa (Rp)</label>
                      <input
                        type="number"
                        className="kw-input"
                        step="1000"
                        min="0"
                        value={price.harga_dewasa}
                        onChange={e => handlePriceChange(idx, 'harga_dewasa', e.target.value)}
                      />
                    </div>
                    {form.prices.length > 1 && (
                      <button
                        type="button"
                        className="kw-modal-close"
                        style={{ alignSelf: 'center', marginTop: 20, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        onClick={() => removePriceRow(idx)}
                        title="Hapus harga ini"
                      >
                        <i className="fa-solid fa-trash" style={{ color: '#b91c1c' }} />
                      </button>
                    )}
                  </div>
                ))}
                {form.prices.length < DAY_TYPES.length && (
                  <button
                    type="button"
                    className="kw-add-btn"
                    style={{ alignSelf: 'flex-start', marginTop: 4 }}
                    onClick={addPriceRow}
                  >
                    <i className="fa-solid fa-plus" /> Tambah Tipe Hari
                  </button>
                )}
              </div>

              <div className="kw-modal-divider" />
              <div className="kw-modal-section-label">Thumbnail</div>

              <div className="kw-field">
                <label className="kw-label"><i className="fa-solid fa-image" /> Gambar Thumbnail</label>
                <div className="kw-file-area" onClick={() => fileRef.current?.click()}>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                  <div className="kw-file-area-icon"><i className="fa-solid fa-cloud-arrow-up" /></div>
                  <div className="kw-file-area-label">
                    <strong>Klik untuk unggah</strong> atau seret gambar ke sini<br />
                    <span style={{ fontSize: 11, opacity: .7 }}>PNG, JPG, WEBP maks. 2MB</span>
                  </div>
                  {previewUrl && <img src={previewUrl} alt="preview" className="kw-file-preview" />}
                </div>
              </div>
            </div>

            <div className="kw-modal-footer">
              <button className="kw-modal-cancel" onClick={closeModal} disabled={submitting}>Batal</button>
              <button className="kw-modal-submit" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <><span className="kw-spinner" /> Menyimpan...</> : <><i className={`fa-solid ${editTarget ? "fa-floppy-disk" : "fa-plus"}`} /> {editTarget ? "Simpan Perubahan" : "Tambah Wisata"}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDel && (
        <div className="kw-confirm-overlay">
          <div className="kw-confirm-box">
            <div className="kw-confirm-icon"><i className="fa-solid fa-trash" /></div>
            <div className="kw-confirm-title">Hapus Wisata?</div>
            <div className="kw-confirm-desc">Wisata <strong>{confirmDel.nama}</strong> akan dihapus secara permanen beserta seluruh data terkait.</div>
            <div className="kw-confirm-btns">
              <button className="kw-confirm-btn kw-confirm-btn--cancel" onClick={() => setConfirmDel(null)}>Batal</button>
              <button className="kw-confirm-btn kw-confirm-btn--del" onClick={handleDelete}><i className="fa-solid fa-trash" style={{ marginRight: 6 }} />Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`kw-toast kw-toast--${toast.type}`}>
          <i className={`fa-solid ${toast.type === "success" ? "fa-circle-check" : "fa-triangle-exclamation"}`} />
          {toast.msg}
        </div>
      )}
    </SuperAdminLayout>
  );
}
