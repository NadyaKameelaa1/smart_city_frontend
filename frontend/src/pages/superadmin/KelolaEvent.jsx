import { useState, useEffect, useRef } from "react";
import SuperAdminLayout from "./SuperAdminLayout";
import api from "../../api/axios";

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────
const css = `
  .ke-page { animation: keFadeUp .4s ease both; }
  @keyframes keFadeUp { from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)} }

  /* ── Stats ── */
  .ke-stats {
    display: grid; grid-template-columns: repeat(4,1fr);
    gap: 16px; margin-bottom: 28px;
  }
  .ke-stat {
    background: white; border-radius: 16px;
    border: 1px solid var(--border); padding: 18px 20px;
    box-shadow: var(--shadow-sm);
    display: flex; align-items: center; gap: 14px;
    transition: var(--transition);
  }
  .ke-stat:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
  .ke-stat__icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .ke-stat__num   { font-family: var(--font-display); font-size: 26px; font-weight: 700; color: var(--dark); line-height: 1; }
  .ke-stat__label { font-size: 12px; color: var(--text-muted); margin-top: 3px; }

  /* ── Toolbar ── */
  .ke-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
  .ke-search-wrap { position: relative; flex: 1; max-width: 340px; }
  .ke-search-icon {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    color: var(--teal-400); font-size: 13px; pointer-events: none;
  }
  .ke-search-input {
    width: 100%; padding: 10px 16px 10px 38px;
    border-radius: 50px; border: 1.5px solid var(--border);
    background: white; font-family: var(--font-body);
    font-size: 13.5px; color: var(--dark); outline: none; transition: var(--transition);
  }
  .ke-search-input:focus { border-color: var(--teal-500); box-shadow: 0 0 0 3px rgba(64,114,175,.1); }
  .ke-search-input::placeholder { color: var(--text-muted); }

  .ke-filter-tabs { display: flex; gap: 6px; flex-wrap: wrap; flex: 1; }
  .ke-filter-tab {
    padding: 7px 16px; border-radius: 50px; border: 1.5px solid var(--border);
    background: white; font-family: var(--font-body); font-size: 12.5px; font-weight: 500;
    color: var(--text-muted); cursor: pointer; transition: var(--transition);
  }
  .ke-filter-tab:hover  { border-color: var(--teal-400); color: var(--teal-700); }
  .ke-filter-tab.active { border-color: var(--teal-600); background: var(--teal-600); color: white; font-weight: 600; }

  .ke-add-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 9px 20px; border-radius: 50px; background: var(--teal-600);
    color: white; border: none; font-family: var(--font-body);
    font-size: 13.5px; font-weight: 600; cursor: pointer;
    transition: var(--transition); white-space: nowrap;
    box-shadow: 0 4px 14px rgba(64,114,175,.3);
  }
  .ke-add-btn:hover { background: var(--teal-700); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(64,114,175,.35); }

  /* ── Table card ── */
  .ke-table-card {
    background: white; border-radius: 20px;
    border: 1px solid var(--border); box-shadow: var(--shadow-sm); overflow: hidden;
  }
  .ke-table-head {
    padding: 18px 24px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  .ke-table-head-title {
    font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--dark);
    display: flex; align-items: center; gap: 9px;
  }
  .ke-table-head-title i { color: var(--teal-500); font-size: 15px; }
  .ke-count-badge {
    background: var(--teal-50); color: var(--teal-700);
    padding: 3px 10px; border-radius: 50px; font-size: 12px; font-weight: 700;
  }

  .ke-table-wrap { overflow-x: auto; }
  table.ke-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 1280px; }
  .ke-table thead tr { background: var(--teal-50); }
  .ke-table th {
    padding: 12px 14px; text-align: left;
    font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
    color: var(--teal-700); border-bottom: 1px solid var(--border); white-space: nowrap;
  }
  .ke-table td {
    padding: 13px 14px; border-bottom: 1px solid var(--teal-50);
    color: var(--text-dark); vertical-align: middle;
  }
  .ke-table tbody tr { transition: background .15s; }
  .ke-table tbody tr:hover { background: var(--cream); }
  .ke-table tbody tr:last-child td { border-bottom: none; }

  /* Thumbnail */
  .ke-thumb {
    width: 72px; height: 52px; border-radius: 9px; object-fit: cover;
    border: 1px solid var(--border); display: block; background: var(--teal-50); flex-shrink: 0;
  }
  .ke-thumb-placeholder {
    width: 72px; height: 52px; border-radius: 9px;
    background: var(--teal-50); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    color: var(--teal-300); font-size: 20px;
  }

  /* Nama event */
  .ke-nama { font-weight: 700; font-size: 13px; color: var(--dark); max-width: 180px; line-height: 1.4; }

  /* Kategori badge */
  .ke-kategori {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 50px;
    background: var(--teal-50); color: var(--teal-700);
    border: 1px solid var(--teal-100); font-size: 11.5px; font-weight: 600; white-space: nowrap;
  }

  /* Status dropdown */
  .ke-status-select {
    padding: 5px 10px; border-radius: 50px; border: 1.5px solid;
    font-size: 11.5px; font-weight: 700; font-family: var(--font-body);
    cursor: pointer; outline: none; transition: var(--transition); appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 8px center; padding-right: 24px;
  }
  .ke-status-select.published { background-color: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
  .ke-status-select.draft     { background-color: #fffbeb; color: #92400e; border-color: #fde68a; }
  .ke-status-select.selesai   { background-color: #f9fafb; color: #6b7280; border-color: #e5e7eb; }

  /* Tanggal + jam */
  .ke-date { font-size: 12.5px; white-space: nowrap; color: var(--text-dark); }
  .ke-date-range {
    display: flex; flex-direction: column; gap: 3px; min-width: 110px;
  }
  .ke-date-row { display: flex; align-items: center; gap: 5px; font-size: 12px; white-space: nowrap; }
  .ke-date-row i { color: var(--teal-400); font-size: 11px; width: 12px; }
  .ke-date-sep { font-size: 10px; color: var(--text-muted); padding: 0 2px; }

  /* Lokasi */
  .ke-lokasi { font-size: 12.5px; color: var(--text-muted); max-width: 150px; line-height: 1.45; }

  /* Penyelenggara */
  .ke-penyelenggara { display: flex; align-items: center; gap: 7px; }
  .ke-peny-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    background: linear-gradient(135deg,var(--teal-500),var(--teal-800));
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: white; flex-shrink: 0;
  }
  .ke-peny-name { font-size: 12.5px; font-weight: 600; color: var(--text-dark); }

  /* Action buttons */
  .ke-actions { display: flex; gap: 7px; }
  .ke-act-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 8px;
    font-size: 12px; font-weight: 600; cursor: pointer;
    border: none; font-family: var(--font-body); transition: var(--transition); white-space: nowrap;
  }
  .ke-act-btn--edit { background: var(--teal-50); color: var(--teal-700); border: 1.5px solid var(--teal-100); }
  .ke-act-btn--edit:hover { background: var(--teal-600); color: white; border-color: var(--teal-600); }
  .ke-act-btn--del  { background: #fef2f2; color: #b91c1c; border: 1.5px solid #fecaca; }
  .ke-act-btn--del:hover  { background: #b91c1c; color: white; border-color: #b91c1c; }

  /* ── Pagination ── */
  .ke-pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 12px;
  }
  .ke-page-info { font-size: 13px; color: var(--text-muted); }
  .ke-page-btns { display: flex; gap: 5px; }
  .ke-page-btn {
    width: 34px; height: 34px; border-radius: 8px; border: 1.5px solid var(--border);
    background: white; font-size: 13px; font-weight: 600; color: var(--text-dark);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: var(--transition); font-family: var(--font-body);
  }
  .ke-page-btn:hover  { border-color: var(--teal-400); color: var(--teal-700); }
  .ke-page-btn.active { background: var(--teal-600); border-color: var(--teal-600); color: white; }
  .ke-page-btn:disabled { opacity: .35; cursor: not-allowed; }

  /* ── Empty / Skeleton ── */
  .ke-empty { text-align: center; padding: 64px 0; display: flex; flex-direction: column; align-items: center; gap: 14px; }
  .ke-empty i { font-size: 44px; color: var(--teal-200); }
  .ke-empty p { font-size: 14px; color: var(--text-muted); }
  .ke-skel { animation: keSkel 1.3s ease infinite; }
  @keyframes keSkel { 0%,100%{opacity:1}50%{opacity:.4} }
  .ke-skel-bar { height: 14px; border-radius: 7px; background: var(--teal-100); }

  /* ══════════ MODAL ══════════ */
  .ke-modal-overlay {
    position: fixed; inset: 0; z-index: 5000;
    background: rgba(10,29,61,.65); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
    animation: keFadeIn .2s ease;
  }
  @keyframes keFadeIn { from{opacity:0}to{opacity:1} }
  .ke-modal {
    background: white; border-radius: 24px; width: 100%; max-width: 660px;
    box-shadow: 0 30px 80px rgba(0,0,0,.22);
    animation: keScaleIn .25s ease; display: flex; flex-direction: column; max-height: 92vh;
  }
  @keyframes keScaleIn { from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)} }

  .ke-modal-header {
    padding: 24px 28px 18px; border-bottom: 1px solid var(--border);
    display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; flex-shrink: 0;
  }
  .ke-modal-header-left { display: flex; align-items: center; gap: 14px; }
  .ke-modal-header-icon {
    width: 48px; height: 48px; border-radius: 14px;
    background: var(--teal-50); color: var(--teal-600);
    display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;
  }
  .ke-modal-title { font-family: var(--font-display); font-size: 19px; font-weight: 700; color: var(--dark); margin-bottom: 3px; }
  .ke-modal-sub   { font-size: 13px; color: var(--text-muted); }
  .ke-modal-close {
    width: 34px; height: 34px; border-radius: 50%;
    background: var(--teal-50); border: 1.5px solid var(--border);
    color: var(--text-muted); font-size: 14px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: var(--transition); flex-shrink: 0;
  }
  .ke-modal-close:hover { background: #fef2f2; border-color: #fecaca; color: #b91c1c; transform: rotate(90deg); }

  .ke-modal-body {
    padding: 22px 28px; display: flex; flex-direction: column; gap: 16px;
    overflow-y: auto; flex: 1;
  }
  .ke-modal-body::-webkit-scrollbar { width: 4px; }
  .ke-modal-body::-webkit-scrollbar-thumb { background: var(--teal-200); border-radius: 2px; }

  /* Form */
  .ke-field     { display: flex; flex-direction: column; gap: 6px; }
  .ke-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .ke-field-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .ke-label { font-size: 12.5px; font-weight: 700; color: var(--text-dark); display: flex; align-items: center; gap: 5px; }
  .ke-label i  { color: var(--teal-500); font-size: 11px; }
  .ke-required { color: #e11d48; font-size: 13px; }

  .ke-input, .ke-select, .ke-textarea {
    width: 100%; padding: 10px 14px; border-radius: 10px; border: 1.5px solid var(--border);
    background: white; font-family: var(--font-body); font-size: 13.5px; color: var(--dark);
    outline: none; transition: var(--transition);
  }
  .ke-input:focus, .ke-select:focus, .ke-textarea:focus {
    border-color: var(--teal-500); box-shadow: 0 0 0 3px rgba(64,114,175,.1);
  }
  .ke-textarea { resize: vertical; min-height: 80px; line-height: 1.6; }
  .ke-input::placeholder, .ke-textarea::placeholder { color: var(--text-muted); }
  .ke-input.error, .ke-select.error { border-color: #f87171; }
  .ke-error-msg { font-size: 12px; color: #e11d48; display: flex; align-items: center; gap: 5px; }

  .ke-modal-section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    color: var(--teal-600); display: flex; align-items: center; gap: 8px; margin-bottom: 2px;
  }
  .ke-modal-section-label::after { content: ''; flex: 1; height: 1px; background: var(--teal-100); }
  .ke-modal-divider { height: 1px; background: var(--border); margin: 4px 0; }

  /* File upload */
  .ke-file-area {
    border: 2px dashed var(--teal-200); border-radius: 12px; padding: 20px;
    text-align: center; cursor: pointer; transition: var(--transition);
    background: var(--teal-50); position: relative;
  }
  .ke-file-area:hover { border-color: var(--teal-400); background: rgba(64,114,175,.05); }
  .ke-file-area input[type="file"] { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
  .ke-file-area-icon  { font-size: 26px; color: var(--teal-400); margin-bottom: 8px; }
  .ke-file-area-label { font-size: 13px; color: var(--text-muted); }
  .ke-file-area-label strong { color: var(--teal-700); }
  .ke-file-preview {
    width: 100%; max-height: 120px; object-fit: cover;
    border-radius: 8px; margin-top: 10px; border: 1px solid var(--border);
  }

  .ke-modal-footer {
    padding: 18px 28px; border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: flex-end; gap: 10px; flex-shrink: 0;
  }
  .ke-modal-cancel {
    padding: 10px 22px; border-radius: 50px; border: 1.5px solid var(--border); background: white;
    font-family: var(--font-body); font-size: 13.5px; font-weight: 600;
    color: var(--text-muted); cursor: pointer; transition: var(--transition);
  }
  .ke-modal-cancel:hover { background: var(--cream); border-color: var(--teal-200); }
  .ke-modal-submit {
    padding: 10px 26px; border-radius: 50px; background: var(--teal-600);
    color: white; border: none; font-family: var(--font-body);
    font-size: 13.5px; font-weight: 700; cursor: pointer; transition: var(--transition);
    display: flex; align-items: center; gap: 7px;
    box-shadow: 0 4px 14px rgba(64,114,175,.3);
  }
  .ke-modal-submit:hover { background: var(--teal-700); transform: translateY(-1px); }
  .ke-modal-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }

  /* ── Confirm ── */
  .ke-confirm-overlay {
    position: fixed; inset: 0; z-index: 6000;
    background: rgba(10,29,61,.7); backdrop-filter: blur(5px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
    animation: keFadeIn .2s ease;
  }
  .ke-confirm-box {
    background: white; border-radius: 20px; padding: 32px 28px; max-width: 380px; width: 100%;
    box-shadow: 0 24px 60px rgba(0,0,0,.22); animation: keScaleIn .25s ease;
  }
  .ke-confirm-icon  { width: 52px; height: 52px; border-radius: 14px; background: #fef2f2; color: #b91c1c; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 16px; }
  .ke-confirm-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--dark); margin-bottom: 10px; }
  .ke-confirm-desc  { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px; }
  .ke-confirm-btns  { display: flex; gap: 10px; }
  .ke-confirm-btn   { flex: 1; padding: 11px; border-radius: 10px; font-size: 14px; font-weight: 600; font-family: var(--font-body); cursor: pointer; transition: var(--transition); border: none; }
  .ke-confirm-btn--cancel { background: var(--teal-50); color: var(--text-muted); border: 1.5px solid var(--border); }
  .ke-confirm-btn--cancel:hover { background: var(--teal-100); }
  .ke-confirm-btn--del { background: #b91c1c; color: white; }
  .ke-confirm-btn--del:hover { background: #991b1b; }

  /* ── Toast ── */
  .ke-toast {
    position: fixed; bottom: 28px; right: 28px; z-index: 9999;
    padding: 14px 20px; border-radius: 14px; font-size: 13.5px; font-weight: 500;
    display: flex; align-items: center; gap: 10px;
    box-shadow: 0 8px 30px rgba(0,0,0,.22); animation: keSlideUp .3s ease; max-width: 340px; color: white;
  }
  @keyframes keSlideUp { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
  .ke-toast--success { background: #15803d; }
  .ke-toast--error   { background: #b91c1c; }

  /* Spinner */
  .ke-spinner {
    width: 15px; height: 15px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,.3); border-top-color: white;
    animation: keSpin .7s linear infinite; display: inline-block;
  }
  @keyframes keSpin { to{transform:rotate(360deg)} }

  @media (max-width: 768px) {
    .ke-stats { grid-template-columns: repeat(2,1fr); }
    .ke-field-row, .ke-field-row-3 { grid-template-columns: 1fr; }
    .ke-toolbar { flex-direction: column; align-items: stretch; }
    .ke-search-wrap { max-width: 100%; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const PER_PAGE    = 10;
const STATUS_LIST = ["draft", "published", "selesai"];

const STATUS_CONFIG = {
  published: { label: "Published", cls: "published" },
  draft:     { label: "Draft",     cls: "draft"     },
  selesai:   { label: "Selesai",   cls: "selesai"   },
};

// ─── Kategori ENUM dari database
const KATEGORI_LIST = [
  "Budaya",
  "Olahraga",
  "Pemerintahan",
  "Pariwisata",
  "Pendidikan",
  "Hiburan",
  "Lainnya",
];

const EMPTY_FORM = {
  nama:             "",
  kategori:         "",
  penyelenggara:    "",
  tanggal_mulai:    "",
  tanggal_selesai:  "",
  jam_mulai:        "",
  jam_selesai:      "",
  lokasi:           "",
  kecamatan_id:     "",
  status:           "draft",
  thumbnail:        null,
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const formatDate = (str) => {
  if (!str) return null;
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

const initials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function KelolaEvent() {
  const [eventList,     setEventList]     = useState([]);
  const [kecamatanList, setKecamatanList] = useState([]);
  const [loading,       setLoading]       = useState(true);

  const [search,        setSearch]        = useState("");
  const [filterStatus,  setFilterStatus]  = useState("semua");
  const [page,          setPage]          = useState(1);

  const [modalOpen,     setModalOpen]     = useState(false);
  const [editTarget,    setEditTarget]    = useState(null);
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [formErr,       setFormErr]       = useState({});
  const [submitting,    setSubmitting]    = useState(false);
  const [previewUrl,    setPreviewUrl]    = useState(null);
  const fileRef = useRef();

  const [confirmDel,    setConfirmDel]    = useState(null);
  const [toast,         setToast]         = useState(null);

  // ── Load data ──
  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [eRes, kRes] = await Promise.all([
        api.get("/super-admin/event"),
        api.get("/super-admin/kecamatan"),
      ]);
      setEventList(eRes.data.data || eRes.data || []);
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
  const filtered = eventList.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      e.nama?.toLowerCase().includes(q) ||
      e.kategori?.toLowerCase().includes(q) ||
      e.penyelenggara?.toLowerCase().includes(q) ||
      e.lokasi?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "semua" || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  useEffect(() => { setPage(1); }, [search, filterStatus]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Stats ──
  const total     = eventList.length;
  const published = eventList.filter((e) => e.status === "published").length;
  const draft     = eventList.filter((e) => e.status === "draft").length;
  const selesai   = eventList.filter((e) => e.status === "selesai").length;

  const stats = [
    { icon: "fa-solid fa-calendar-days",  label: "Total Event",  num: total,     color: "var(--teal-600)", bg: "var(--teal-50)" },
    { icon: "fa-solid fa-circle-check",   label: "Published",    num: published, color: "#15803d",          bg: "#f0fdf4"        },
    { icon: "fa-solid fa-file-pen",       label: "Draft",        num: draft,     color: "#92400e",          bg: "#fffbeb"        },
    { icon: "fa-solid fa-flag-checkered", label: "Selesai",      num: selesai,   color: "#6b7280",          bg: "#f9fafb"        },
  ];

  // ── Kecamatan name lookup ──
  const kecamatanName = (id) =>
    kecamatanList.find((k) => k.id == id)?.nama|| "—";

  // ── Modal ──
  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErr({});
    setPreviewUrl(null);
    setModalOpen(true);
  };

  const openEdit = (ev) => {
    setEditTarget(ev);
    setForm({
      nama:            ev.nama            || "",
      kategori:        ev.kategori        || "",
      penyelenggara:   ev.penyelenggara   || "",
      tanggal_mulai:   ev.tanggal_mulai   ? ev.tanggal_mulai.slice(0, 10)   : "",
      tanggal_selesai: ev.tanggal_selesai ? ev.tanggal_selesai.slice(0, 10) : "",
      jam_mulai:       ev.jam_mulai       || "",
      jam_selesai:     ev.jam_selesai     || "",
      lokasi:          ev.lokasi          || "",
      kecamatan_id:    ev.kecamatan_id    || "",
      status:          ev.status          || "draft",
      thumbnail:       null,
    });
    setFormErr({});
    setPreviewUrl(ev.thumbnail_url || ev.gambar || null);
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditTarget(null); setPreviewUrl(null); };

  const handleFormChange = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    setFormErr((e) => ({ ...e, [field]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    handleFormChange("thumbnail", file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // ── Validation ──
  const validate = () => {
    const err = {};
    if (!form.nama.trim())          err.nama          = "Nama event wajib diisi.";
    if (!form.kategori.trim())      err.kategori      = "Kategori wajib diisi.";
    if (!form.penyelenggara.trim()) err.penyelenggara = "Penyelenggara wajib diisi.";
    if (!form.tanggal_mulai)        err.tanggal_mulai = "Tanggal mulai wajib diisi.";
    if (!form.kecamatan_id)         err.kecamatan_id  = "Pilih kecamatan.";
    if (
      form.tanggal_mulai && form.tanggal_selesai &&
      form.tanggal_selesai < form.tanggal_mulai
    ) err.tanggal_selesai = "Tanggal selesai tidak boleh sebelum tanggal mulai.";
    return err;
  };

  // ── Submit ──
  const handleSubmit = async () => {
    const err = validate();
    if (Object.keys(err).length) { setFormErr(err); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") fd.append(k, v);
      });

      if (editTarget) {
        fd.append("_method", "PUT");
        await api.post(`/super-admin/event/${editTarget.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setEventList((prev) =>
          prev.map((ev) =>
            ev.id === editTarget.id
              ? { ...ev, ...form, thumbnail_url: previewUrl }
              : ev
          )
        );
        showToast(`Event "${form.nama}" berhasil diperbarui.`);
      } else {
        const res = await api.post("/super-admin/event", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setEventList((prev) => [res.data.data || res.data, ...prev]);
        showToast(`Event "${form.nama}" berhasil ditambahkan.`);
      }
      closeModal();
    } catch (e) {
      showToast(e.response?.data?.message || "Gagal menyimpan data.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    const ev = confirmDel;
    setConfirmDel(null);
    try {
      await api.delete(`/super-admin/event/${ev.id}`);
      setEventList((prev) => prev.filter((e) => e.id !== ev.id));
      showToast(`Event "${ev.nama}" berhasil dihapus.`);
    } catch {
      showToast("Gagal menghapus data.", "error");
    }
  };

  // ── Inline status update ──
  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/super-admin/event/${id}/status`, { status: newStatus });
      setEventList((prev) =>
        prev.map((ev) => (ev.id === id ? { ...ev, status: newStatus } : ev))
      );
      showToast("Status berhasil diperbarui.");
    } catch {
      showToast("Gagal mengubah status.", "error");
    }
  };

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
    const baseUrl = "http://localhost:8000/storage/event"; // Sesuaikan folder simpanmu
    return `${baseUrl}/${cleanPath}`;
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SuperAdminLayout>
      <style>{css}</style>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet" />

      <div className="ke-page">

        {/* ── Page Header ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "var(--teal-600)", display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <i className="fa-solid fa-calendar-days" /> Super Admin — Konten Portal
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "var(--dark)" }}>
            Kelola Event
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="ke-stats">
          {stats.map((s, i) => (
            <div className="ke-stat" key={i}>
              <div className="ke-stat__icon" style={{ background: s.bg, color: s.color }}>
                <i className={s.icon} />
              </div>
              <div>
                <div className="ke-stat__num">{s.num}</div>
                <div className="ke-stat__label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="ke-toolbar">
          <div className="ke-search-wrap">
            <i className="fa-solid fa-magnifying-glass ke-search-icon" />
            <input
              className="ke-search-input"
              type="text"
              placeholder="Cari nama, kategori, penyelenggara, lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="ke-filter-tabs">
            {["semua", ...STATUS_LIST].map((f) => (
              <button
                key={f}
                className={`ke-filter-tab${filterStatus === f ? " active" : ""}`}
                onClick={() => setFilterStatus(f)}
              >
                {f === "semua" ? "Semua" : STATUS_CONFIG[f]?.label || f}
              </button>
            ))}
          </div>

          <button className="ke-add-btn" onClick={openAdd}>
            <i className="fa-solid fa-plus" /> Tambah Event
          </button>
        </div>

        {/* ── Table Card ── */}
        <div className="ke-table-card">
          <div className="ke-table-head">
            <div className="ke-table-head-title">
              <i className="fa-solid fa-table-list" /> Daftar Event
              <span className="ke-count-badge">{filtered.length}</span>
            </div>
          </div>

          {/* Loading skeleton */}
          {loading ? (
            <div className="ke-table-wrap">
              <table className="ke-table">
                <thead>
                  <tr>
                    {["ID","Thumbnail","Nama","Kategori","Penyelenggara","Tanggal","Jam","Lokasi","Kecamatan","Status","Aksi"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="ke-skel">
                  {[...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(11)].map((_, j) => (
                        <td key={j}><div className="ke-skel-bar" style={{ width: "75%" }} /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          ) : filtered.length === 0 ? (
            <div className="ke-empty">
              <i className="fa-solid fa-calendar-xmark" />
              <p>Tidak ada event{search ? ` untuk "${search}"` : ""}.</p>
            </div>

          ) : (
            <div className="ke-table-wrap">
              <table className="ke-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Thumbnail</th>
                    <th>Nama Event</th>
                    <th>Kategori</th>
                    <th>Penyelenggara</th>
                    <th>Tanggal</th>
                    <th>Jam</th>
                    <th>Lokasi</th>
                    <th>Kecamatan</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((ev) => {
                    const stConf = STATUS_CONFIG[ev.status] || STATUS_CONFIG.draft;
                    const tglMulai   = formatDate(ev.tanggal_mulai);
                    const tglSelesai = formatDate(ev.tanggal_selesai);

                    return (
                      <tr key={ev.id}>

                        {/* ID */}
                        <td>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", fontFamily: "monospace" }}>
                            #{ev.id}
                          </span>
                        </td>

                        {/* Thumbnail */}
                        <td>
                          {getCorrectImageUrl(ev) ? (
                            <img 
                              src={getCorrectImageUrl(ev)} 
                              alt={ev.nama} 
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

                        {/* Nama */}
                        <td>
                          <div className="ke-nama">{ev.nama}</div>
                        </td>

                        {/* Kategori */}
                        <td>
                          <span className="ke-kategori">
                            <i className="fa-solid fa-tag" style={{ fontSize: 9 }} />
                            {ev.kategori || "—"}
                          </span>
                        </td>

                        {/* Penyelenggara */}
                        <td>
                          <div className="ke-penyelenggara">
                            <div className="ke-peny-avatar">{initials(ev.penyelenggara)}</div>
                            <span className="ke-peny-name">{ev.penyelenggara || "—"}</span>
                          </div>
                        </td>

                        {/* Tanggal */}
                        <td>
                          <div className="ke-date-range">
                            <div className="ke-date-row">
                              <i className="fa-regular fa-calendar" />
                              <span>{tglMulai || "—"}</span>
                            </div>
                            {tglSelesai && tglSelesai !== tglMulai && (
                              <>
                                <div className="ke-date-row" style={{ color: "var(--text-muted)", fontSize: 10 }}>
                                  <i className="fa-solid fa-arrow-down" style={{ fontSize: 9 }} />
                                  <span>s.d.</span>
                                </div>
                                <div className="ke-date-row">
                                  <i className="fa-regular fa-calendar-check" style={{ color: "#f87171" }} />
                                  <span>{tglSelesai}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Jam */}
                        <td>
                          <div className="ke-date-range">
                            {ev.jam_mulai ? (
                              <div className="ke-date-row">
                                <i className="fa-regular fa-clock" />
                                <span>{ev.jam_mulai}</span>
                                {ev.jam_selesai && (
                                  <>
                                    <span className="ke-date-sep">–</span>
                                    <span>{ev.jam_selesai}</span>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: "var(--text-muted)", fontSize: 12, fontStyle: "italic" }}>—</span>
                            )}
                          </div>
                        </td>

                        {/* Lokasi */}
                        <td>
                          <div className="ke-lokasi">
                            {ev.lokasi ? (
                              <><i className="fa-solid fa-location-dot" style={{ color: "var(--teal-400)", marginRight: 5, fontSize: 11 }} />{ev.lokasi}</>
                            ) : (
                              <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>—</span>
                            )}
                          </div>
                        </td>

                        {/* Kecamatan */}
                        <td style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                          {kecamatanName(ev.kecamatan_id)}
                        </td>

                        {/* Status */}
                        <td>
                          <select
                            className={`ke-status-select ${stConf.cls}`}
                            value={ev.status || "draft"}
                            onChange={(e) => handleStatusChange(ev.id, e.target.value)}
                          >
                            {STATUS_LIST.map((s) => (
                              <option key={s} value={s}>
                                {STATUS_CONFIG[s].label}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Aksi */}
                        <td>
                          <div className="ke-actions">
                            <button className="ke-act-btn ke-act-btn--edit" onClick={() => openEdit(ev)}>
                              <i className="fa-solid fa-pen-to-square" /> Edit
                            </button>
                            <button className="ke-act-btn ke-act-btn--del" onClick={() => setConfirmDel(ev)}>
                              <i className="fa-solid fa-trash" /> Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="ke-pagination">
              <div className="ke-page-info">
                Menampilkan {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} dari {filtered.length}
              </div>
              <div className="ke-page-btns">
                <button className="ke-page-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                  <i className="fa-solid fa-chevron-left" style={{ fontSize: 11 }} />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`ke-page-btn${page === i + 1 ? " active" : ""}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button className="ke-page-btn" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
                  <i className="fa-solid fa-chevron-right" style={{ fontSize: 11 }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          MODAL TAMBAH / EDIT
      ══════════════════════════════════════ */}
      {modalOpen && (
        <div className="ke-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="ke-modal">

            {/* Header */}
            <div className="ke-modal-header">
              <div className="ke-modal-header-left">
                <div className="ke-modal-header-icon">
                  <i className={`fa-solid ${editTarget ? "fa-pen-to-square" : "fa-plus"}`} />
                </div>
                <div>
                  <div className="ke-modal-title">{editTarget ? "Edit Event" : "Tambah Event Baru"}</div>
                  <div className="ke-modal-sub">
                    {editTarget ? `Mengedit: ${editTarget.nama}` : "Lengkapi data event"}
                  </div>
                </div>
              </div>
              <button className="ke-modal-close" onClick={closeModal}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Body */}
            <div className="ke-modal-body">

              {/* ── Informasi Utama ── */}
              <div className="ke-modal-section-label">Informasi Utama</div>

              <div className="ke-field">
                <label className="ke-label">
                  <i className="fa-solid fa-tag" /> Kategori <span className="ke-required">*</span>
                </label>
                <select
                  className={`ke-select${formErr.kategori ? " error" : ""}`}
                  value={form.kategori}
                  onChange={(e) => handleFormChange("kategori", e.target.value)}
                >
                  <option value="">— Pilih Kategori —</option>
                  {KATEGORI_LIST.map((kat) => (
                    <option key={kat} value={kat}>{kat}</option>
                  ))}
                </select>
                {formErr.kategori && (
                  <span className="ke-error-msg">
                    <i className="fa-solid fa-circle-exclamation" />{formErr.kategori}
                  </span>
                )}
              </div>

              <div className="ke-field-row">
                <div className="ke-field">
                  <label className="ke-label">
                    <i className="fa-solid fa-tag" /> Nama Event <span className="ke-required">*</span>
                  </label>
                  <input
                    className={`ke-input${formErr.nama ? " error" : ""}`}
                    placeholder="Nama event..."
                    value={form.nama}
                    onChange={(e) => handleFormChange("nama", e.target.value)}
                  />
                  {formErr.nama && (
                    <span className="ke-error-msg">
                      <i className="fa-solid fa-circle-exclamation" />{formErr.nama}
                    </span>
                  )}
                </div>

                <div className="ke-field">
                  <label className="ke-label">
                    <i className="fa-solid fa-user-tie" /> Penyelenggara <span className="ke-required">*</span>
                  </label>
                  <input
                    className={`ke-input${formErr.penyelenggara ? " error" : ""}`}
                    placeholder="Nama instansi / organisasi..."
                    value={form.penyelenggara}
                    onChange={(e) => handleFormChange("penyelenggara", e.target.value)}
                  />
                  {formErr.penyelenggara && (
                    <span className="ke-error-msg">
                      <i className="fa-solid fa-circle-exclamation" />{formErr.penyelenggara}
                    </span>
                  )}
                </div>
              </div>

              <div className="ke-modal-divider" />
              <div className="ke-modal-section-label">Waktu Pelaksanaan</div>

              {/* Tanggal */}
              <div className="ke-field-row">
                <div className="ke-field">
                  <label className="ke-label">
                    <i className="fa-regular fa-calendar" /> Tanggal Mulai <span className="ke-required">*</span>
                  </label>
                  <input
                    className={`ke-input${formErr.tanggal_mulai ? " error" : ""}`}
                    type="date"
                    value={form.tanggal_mulai}
                    onChange={(e) => handleFormChange("tanggal_mulai", e.target.value)}
                  />
                  {formErr.tanggal_mulai && (
                    <span className="ke-error-msg">
                      <i className="fa-solid fa-circle-exclamation" />{formErr.tanggal_mulai}
                    </span>
                  )}
                </div>

                <div className="ke-field">
                  <label className="ke-label">
                    <i className="fa-regular fa-calendar-check" /> Tanggal Selesai
                  </label>
                  <input
                    className={`ke-input${formErr.tanggal_selesai ? " error" : ""}`}
                    type="date"
                    value={form.tanggal_selesai}
                    onChange={(e) => handleFormChange("tanggal_selesai", e.target.value)}
                  />
                  {formErr.tanggal_selesai && (
                    <span className="ke-error-msg">
                      <i className="fa-solid fa-circle-exclamation" />{formErr.tanggal_selesai}
                    </span>
                  )}
                </div>
              </div>

              {/* Jam */}
              <div className="ke-field-row">
                <div className="ke-field">
                  <label className="ke-label">
                    <i className="fa-regular fa-clock" /> Jam Mulai
                  </label>
                  <input
                    className="ke-input"
                    type="time"
                    value={form.jam_mulai}
                    onChange={(e) => handleFormChange("jam_mulai", e.target.value)}
                  />
                </div>

                <div className="ke-field">
                  <label className="ke-label">
                    <i className="fa-regular fa-clock" /> Jam Selesai
                  </label>
                  <input
                    className="ke-input"
                    type="time"
                    value={form.jam_selesai}
                    onChange={(e) => handleFormChange("jam_selesai", e.target.value)}
                  />
                </div>
              </div>

              <div className="ke-modal-divider" />
              <div className="ke-modal-section-label">Lokasi & Status</div>

              <div className="ke-field">
                <label className="ke-label">
                  <i className="fa-solid fa-location-dot" /> Lokasi / Venue
                </label>
                <input
                  className="ke-input"
                  placeholder="Nama gedung, jalan, atau tempat..."
                  value={form.lokasi}
                  onChange={(e) => handleFormChange("lokasi", e.target.value)}
                />
              </div>

              <div className="ke-field-row">
                <div className="ke-field">
                  <label className="ke-label">
                    <i className="fa-solid fa-map-pin" /> Kecamatan <span className="ke-required">*</span>
                  </label>
                  <select
                    className={`ke-select${formErr.kecamatan_id ? " error" : ""}`}
                    value={form.kecamatan_id}
                    onChange={(e) => handleFormChange("kecamatan_id", e.target.value)}
                  >
                    <option value="">— Pilih Kecamatan —</option>
                    {kecamatanList.map((k) => (
                      <option key={k.id} value={k.id}>{k.nama}</option>
                    ))}
                  </select>
                  {formErr.kecamatan_id && (
                    <span className="ke-error-msg">
                      <i className="fa-solid fa-circle-exclamation" />{formErr.kecamatan_id}
                    </span>
                  )}
                </div>

                <div className="ke-field">
                  <label className="ke-label">
                    <i className="fa-solid fa-flag" /> Status
                  </label>
                  <select
                    className="ke-select"
                    value={form.status}
                    onChange={(e) => handleFormChange("status", e.target.value)}
                  >
                    {STATUS_LIST.map((s) => (
                      <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ke-modal-divider" />
              <div className="ke-modal-section-label">Thumbnail</div>

              <div className="ke-field">
                <label className="ke-label">
                  <i className="fa-solid fa-image" /> Gambar Thumbnail
                </label>
                <div className="ke-file-area" onClick={() => fileRef.current?.click()}>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <div className="ke-file-area-icon">
                    <i className="fa-solid fa-cloud-arrow-up" />
                  </div>
                  <div className="ke-file-area-label">
                    <strong>Klik untuk unggah</strong> atau seret gambar ke sini<br />
                    <span style={{ fontSize: 11, opacity: .7 }}>PNG, JPG, WEBP maks. 2MB</span>
                  </div>
                  {previewUrl && (
                    <img src={previewUrl} alt="preview" className="ke-file-preview" />
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="ke-modal-footer">
              <button className="ke-modal-cancel" onClick={closeModal} disabled={submitting}>
                Batal
              </button>
              <button className="ke-modal-submit" onClick={handleSubmit} disabled={submitting}>
                {submitting
                  ? <><span className="ke-spinner" /> Menyimpan...</>
                  : <><i className={`fa-solid ${editTarget ? "fa-floppy-disk" : "fa-plus"}`} /> {editTarget ? "Simpan Perubahan" : "Tambah Event"}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          KONFIRMASI HAPUS
      ══════════════════════════════════════ */}
      {confirmDel && (
        <div className="ke-confirm-overlay">
          <div className="ke-confirm-box">
            <div className="ke-confirm-icon"><i className="fa-solid fa-trash" /></div>
            <div className="ke-confirm-title">Hapus Event?</div>
            <div className="ke-confirm-desc">
              Event <strong>"{confirmDel.nama}"</strong> akan dihapus secara permanen dan tidak dapat dikembalikan.
            </div>
            <div className="ke-confirm-btns">
              <button className="ke-confirm-btn ke-confirm-btn--cancel" onClick={() => setConfirmDel(null)}>
                Batal
              </button>
              <button className="ke-confirm-btn ke-confirm-btn--del" onClick={handleDelete}>
                <i className="fa-solid fa-trash" style={{ marginRight: 6 }} />Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          TOAST
      ══════════════════════════════════════ */}
      {toast && (
        <div className={`ke-toast ke-toast--${toast.type}`}>
          <i className={`fa-solid ${toast.type === "success" ? "fa-circle-check" : "fa-triangle-exclamation"}`} />
          {toast.msg}
        </div>
      )}
    </SuperAdminLayout>
  );
}