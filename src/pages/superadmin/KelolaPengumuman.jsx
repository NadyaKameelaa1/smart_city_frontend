import { useState, useEffect, useRef } from "react";
import SuperAdminLayout from "./SuperAdminLayout";
import api from "../../api/axios";

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────
const css = `
  .kp-page { animation: kpFadeUp .4s ease both; }
  @keyframes kpFadeUp { from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)} }

  /* ── Stats ── */
  .kp-stats {
    display: grid; grid-template-columns: repeat(4,1fr);
    gap: 16px; margin-bottom: 28px;
  }
  .kp-stat {
    background: white; border-radius: 16px;
    border: 1px solid var(--border); padding: 18px 20px;
    box-shadow: var(--shadow-sm);
    display: flex; align-items: center; gap: 14px;
    transition: var(--transition);
  }
  .kp-stat:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
  .kp-stat__icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .kp-stat__num {
    font-family: var(--font-display);
    font-size: 26px; font-weight: 700; color: var(--dark); line-height: 1;
  }
  .kp-stat__label { font-size: 12px; color: var(--text-muted); margin-top: 3px; }

  /* ── Toolbar ── */
  .kp-toolbar {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 20px; flex-wrap: wrap;
  }
  .kp-search-wrap { position: relative; flex: 1; max-width: 340px; }
  .kp-search-icon {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    color: var(--teal-400); font-size: 13px; pointer-events: none;
  }
  .kp-search-input {
    width: 100%; padding: 10px 16px 10px 38px;
    border-radius: 50px; border: 1.5px solid var(--border);
    background: white; font-family: var(--font-body);
    font-size: 13.5px; color: var(--dark); outline: none;
    transition: var(--transition);
  }
  .kp-search-input:focus { border-color: var(--teal-500); box-shadow: 0 0 0 3px rgba(64,114,175,.1); }
  .kp-search-input::placeholder { color: var(--text-muted); }

  .kp-filter-tabs { display: flex; gap: 6px; flex-wrap: wrap; flex: 1; }
  .kp-filter-tab {
    padding: 7px 16px; border-radius: 50px;
    border: 1.5px solid var(--border); background: white;
    font-family: var(--font-body); font-size: 12.5px; font-weight: 500;
    color: var(--text-muted); cursor: pointer; transition: var(--transition);
  }
  .kp-filter-tab:hover { border-color: var(--teal-400); color: var(--teal-700); }
  .kp-filter-tab.active { border-color: var(--teal-600); background: var(--teal-600); color: white; font-weight: 600; }

  .kp-add-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 9px 20px; border-radius: 50px;
    background: var(--teal-600); color: white; border: none;
    font-family: var(--font-body); font-size: 13.5px; font-weight: 600;
    cursor: pointer; transition: var(--transition); white-space: nowrap;
    box-shadow: 0 4px 14px rgba(64,114,175,.3);
  }
  .kp-add-btn:hover { background: var(--teal-700); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(64,114,175,.35); }

  /* ── Table card ── */
  .kp-table-card {
    background: white; border-radius: 20px;
    border: 1px solid var(--border); box-shadow: var(--shadow-sm); overflow: hidden;
  }
  .kp-table-head {
    padding: 18px 24px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  .kp-table-head-title {
    font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--dark);
    display: flex; align-items: center; gap: 9px;
  }
  .kp-table-head-title i { color: var(--teal-500); font-size: 15px; }
  .kp-count-badge {
    background: var(--teal-50); color: var(--teal-700);
    padding: 3px 10px; border-radius: 50px; font-size: 12px; font-weight: 700;
  }

  .kp-table-wrap { overflow-x: auto; }
  table.kp-table {
    width: 100%; border-collapse: collapse; font-size: 13px; min-width: 1200px;
  }
  .kp-table thead tr { background: var(--teal-50); }
  .kp-table th {
    padding: 12px 14px; text-align: left;
    font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
    color: var(--teal-700); border-bottom: 1px solid var(--border); white-space: nowrap;
  }
  .kp-table td {
    padding: 13px 14px; border-bottom: 1px solid var(--teal-50);
    color: var(--text-dark); vertical-align: middle;
  }
  .kp-table tbody tr { transition: background .15s; }
  .kp-table tbody tr:hover { background: var(--cream); }
  .kp-table tbody tr:last-child td { border-bottom: none; }

  /* Deskripsi / isi clamp */
  .kp-text-wrap { max-width: 240px; }
  .kp-text-clamp {
    font-size: 12.5px; color: var(--text-muted); line-height: 1.55;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .kp-text-clamp.expanded { display: block; -webkit-line-clamp: unset; overflow: visible; }
  .kp-text-toggle {
    font-size: 11.5px; color: var(--teal-600); font-weight: 600;
    cursor: pointer; background: none; border: none;
    padding: 2px 0; font-family: var(--font-body);
    display: inline-flex; align-items: center; gap: 4px; margin-top: 3px;
  }
  .kp-text-toggle:hover { color: var(--teal-800); }

  /* Prioritas badge */
  .kp-prioritas {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 50px;
    font-size: 11.5px; font-weight: 700; white-space: nowrap;
  }
  .kp-prioritas--mendesak  { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
  .kp-prioritas--sedang    { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
  .kp-prioritas--umum      { background: var(--teal-50); color: var(--teal-700); border: 1px solid var(--teal-100); }

  /* Penting badge */
  .kp-penting {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 50px;
    font-size: 11.5px; font-weight: 700; white-space: nowrap;
  }
  .kp-penting--yes { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
  .kp-penting--no  { background: #f9fafb; color: #6b7280; border: 1px solid #e5e7eb; }

  /* Tanggal */
  .kp-date { font-size: 12.5px; white-space: nowrap; color: var(--text-dark); }
  .kp-date-icon { color: var(--teal-400); margin-right: 5px; }

  /* Link lampiran */
  .kp-link {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 12px; color: var(--teal-600); font-weight: 600;
    text-decoration: none; padding: 4px 10px; border-radius: 8px;
    background: var(--teal-50); border: 1px solid var(--teal-100);
    transition: var(--transition); white-space: nowrap; max-width: 150px;
    overflow: hidden; text-overflow: ellipsis;
  }
  .kp-link:hover { background: var(--teal-600); color: white; border-color: var(--teal-600); }

  /* Publisher */
  .kp-publisher {
    display: flex; align-items: center; gap: 7px;
  }
  .kp-publisher-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    background: linear-gradient(135deg, var(--teal-600), var(--teal-800));
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: white; flex-shrink: 0;
  }
  .kp-publisher-name { font-size: 12.5px; font-weight: 600; color: var(--text-dark); }

  /* Action buttons */
  .kp-actions { display: flex; gap: 7px; }
  .kp-act-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 8px;
    font-size: 12px; font-weight: 600; cursor: pointer;
    border: none; font-family: var(--font-body); transition: var(--transition); white-space: nowrap;
  }
  .kp-act-btn--edit { background: var(--teal-50); color: var(--teal-700); border: 1.5px solid var(--teal-100); }
  .kp-act-btn--edit:hover { background: var(--teal-600); color: white; border-color: var(--teal-600); }
  .kp-act-btn--del  { background: #fef2f2; color: #b91c1c; border: 1.5px solid #fecaca; }
  .kp-act-btn--del:hover  { background: #b91c1c; color: white; border-color: #b91c1c; }

  /* ── Pagination ── */
  .kp-pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 12px;
  }
  .kp-page-info { font-size: 13px; color: var(--text-muted); }
  .kp-page-btns { display: flex; gap: 5px; }
  .kp-page-btn {
    width: 34px; height: 34px; border-radius: 8px;
    border: 1.5px solid var(--border); background: white;
    font-size: 13px; font-weight: 600; color: var(--text-dark);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: var(--transition); font-family: var(--font-body);
  }
  .kp-page-btn:hover { border-color: var(--teal-400); color: var(--teal-700); }
  .kp-page-btn.active { background: var(--teal-600); border-color: var(--teal-600); color: white; }
  .kp-page-btn:disabled { opacity: .35; cursor: not-allowed; }

  /* ── Empty / Skeleton ── */
  .kp-empty {
    text-align: center; padding: 64px 0;
    display: flex; flex-direction: column; align-items: center; gap: 14px;
  }
  .kp-empty i { font-size: 44px; color: var(--teal-200); }
  .kp-empty p { font-size: 14px; color: var(--text-muted); }
  .kp-skel { animation: kpSkel 1.3s ease infinite; }
  @keyframes kpSkel { 0%,100%{opacity:1}50%{opacity:.4} }
  .kp-skel-bar { height: 14px; border-radius: 7px; background: var(--teal-100); }

  /* ══════════ MODAL ══════════ */
  .kp-modal-overlay {
    position: fixed; inset: 0; z-index: 5000;
    background: rgba(10,29,61,.65); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
    animation: kpFadeIn .2s ease;
  }
  @keyframes kpFadeIn { from{opacity:0}to{opacity:1} }
  .kp-modal {
    background: white; border-radius: 24px; width: 100%; max-width: 640px;
    box-shadow: 0 30px 80px rgba(0,0,0,.22);
    animation: kpScaleIn .25s ease; display: flex; flex-direction: column;
    max-height: 92vh;
  }
  @keyframes kpScaleIn { from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)} }

  .kp-modal-header {
    padding: 24px 28px 18px; border-bottom: 1px solid var(--border);
    display: flex; align-items: flex-start; justify-content: space-between; gap: 14px;
    flex-shrink: 0;
  }
  .kp-modal-header-left { display: flex; align-items: center; gap: 14px; }
  .kp-modal-header-icon {
    width: 48px; height: 48px; border-radius: 14px;
    background: var(--teal-50); color: var(--teal-600);
    display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;
  }
  .kp-modal-title { font-family: var(--font-display); font-size: 19px; font-weight: 700; color: var(--dark); margin-bottom: 3px; }
  .kp-modal-sub   { font-size: 13px; color: var(--text-muted); }
  .kp-modal-close {
    width: 34px; height: 34px; border-radius: 50%;
    background: var(--teal-50); border: 1.5px solid var(--border);
    color: var(--text-muted); font-size: 14px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: var(--transition); flex-shrink: 0;
  }
  .kp-modal-close:hover { background: #fef2f2; border-color: #fecaca; color: #b91c1c; transform: rotate(90deg); }

  .kp-modal-body {
    padding: 22px 28px; display: flex; flex-direction: column; gap: 16px;
    overflow-y: auto; flex: 1;
  }
  .kp-modal-body::-webkit-scrollbar { width: 4px; }
  .kp-modal-body::-webkit-scrollbar-thumb { background: var(--teal-200); border-radius: 2px; }

  /* Form elements */
  .kp-field { display: flex; flex-direction: column; gap: 6px; }
  .kp-field-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .kp-field-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .kp-label {
    font-size: 12.5px; font-weight: 700; color: var(--text-dark);
    display: flex; align-items: center; gap: 5px;
  }
  .kp-label i  { color: var(--teal-500); font-size: 11px; }
  .kp-required { color: #e11d48; font-size: 13px; }

  .kp-input, .kp-select, .kp-textarea {
    width: 100%; padding: 10px 14px;
    border-radius: 10px; border: 1.5px solid var(--border);
    background: white; font-family: var(--font-body);
    font-size: 13.5px; color: var(--dark); outline: none;
    transition: var(--transition);
  }
  .kp-input:focus, .kp-select:focus, .kp-textarea:focus {
    border-color: var(--teal-500); box-shadow: 0 0 0 3px rgba(64,114,175,.1);
  }
  .kp-textarea { resize: vertical; min-height: 100px; line-height: 1.65; }
  .kp-input::placeholder, .kp-textarea::placeholder { color: var(--text-muted); }
  .kp-input.error, .kp-select.error, .kp-textarea.error { border-color: #f87171; }
  .kp-error-msg { font-size: 12px; color: #e11d48; display: flex; align-items: center; gap: 5px; }

  .kp-modal-section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    color: var(--teal-600); display: flex; align-items: center; gap: 8px; margin-bottom: 2px;
  }
  .kp-modal-section-label::after { content: ''; flex: 1; height: 1px; background: var(--teal-100); }
  .kp-modal-divider { height: 1px; background: var(--border); margin: 4px 0; }

  /* Toggle switch — untuk field penting */
  .kp-toggle-wrap { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: var(--teal-50); border-radius: 10px; border: 1.5px solid var(--teal-100); cursor: pointer; user-select: none; }
  .kp-toggle-track {
    width: 42px; height: 24px; border-radius: 50px; flex-shrink: 0;
    background: var(--border); position: relative; transition: background .2s;
  }
  .kp-toggle-track.on { background: var(--teal-600); }
  .kp-toggle-thumb {
    position: absolute; top: 3px; left: 3px;
    width: 18px; height: 18px; border-radius: 50%;
    background: white; box-shadow: 0 1px 4px rgba(0,0,0,.2);
    transition: transform .2s;
  }
  .kp-toggle-track.on .kp-toggle-thumb { transform: translateX(18px); }
  .kp-toggle-label { font-size: 13.5px; font-weight: 600; color: var(--text-dark); }
  .kp-toggle-sub   { font-size: 12px; color: var(--text-muted); margin-top: 1px; }

  .kp-modal-footer {
    padding: 18px 28px; border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: flex-end; gap: 10px;
    flex-shrink: 0;
  }
  .kp-modal-cancel {
    padding: 10px 22px; border-radius: 50px;
    border: 1.5px solid var(--border); background: white;
    font-family: var(--font-body); font-size: 13.5px; font-weight: 600;
    color: var(--text-muted); cursor: pointer; transition: var(--transition);
  }
  .kp-modal-cancel:hover { background: var(--cream); border-color: var(--teal-200); }
  .kp-modal-submit {
    padding: 10px 26px; border-radius: 50px;
    background: var(--teal-600); color: white; border: none;
    font-family: var(--font-body); font-size: 13.5px; font-weight: 700;
    cursor: pointer; transition: var(--transition);
    display: flex; align-items: center; gap: 7px;
    box-shadow: 0 4px 14px rgba(64,114,175,.3);
  }
  .kp-modal-submit:hover { background: var(--teal-700); transform: translateY(-1px); }
  .kp-modal-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }

  /* ── Confirm Delete ── */
  .kp-confirm-overlay {
    position: fixed; inset: 0; z-index: 6000;
    background: rgba(10,29,61,.7); backdrop-filter: blur(5px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
    animation: kpFadeIn .2s ease;
  }
  .kp-confirm-box {
    background: white; border-radius: 20px; padding: 32px 28px;
    max-width: 380px; width: 100%;
    box-shadow: 0 24px 60px rgba(0,0,0,.22); animation: kpScaleIn .25s ease;
  }
  .kp-confirm-icon { width: 52px; height: 52px; border-radius: 14px; background: #fef2f2; color: #b91c1c; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 16px; }
  .kp-confirm-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--dark); margin-bottom: 10px; }
  .kp-confirm-desc  { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px; }
  .kp-confirm-btns  { display: flex; gap: 10px; }
  .kp-confirm-btn   { flex: 1; padding: 11px; border-radius: 10px; font-size: 14px; font-weight: 600; font-family: var(--font-body); cursor: pointer; transition: var(--transition); border: none; }
  .kp-confirm-btn--cancel { background: var(--teal-50); color: var(--text-muted); border: 1.5px solid var(--border); }
  .kp-confirm-btn--cancel:hover { background: var(--teal-100); }
  .kp-confirm-btn--del { background: #b91c1c; color: white; }
  .kp-confirm-btn--del:hover { background: #991b1b; }

  /* ── Toast ── */
  .kp-toast {
    position: fixed; bottom: 28px; right: 28px; z-index: 9999;
    padding: 14px 20px; border-radius: 14px; font-size: 13.5px; font-weight: 500;
    display: flex; align-items: center; gap: 10px;
    box-shadow: 0 8px 30px rgba(0,0,0,.22); animation: kpSlideUp .3s ease; max-width: 340px; color: white;
  }
  @keyframes kpSlideUp { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
  .kp-toast--success { background: #15803d; }
  .kp-toast--error   { background: #b91c1c; }

  /* Spinner */
  .kp-spinner {
    width: 15px; height: 15px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,.3); border-top-color: white;
    animation: kpSpin .7s linear infinite; display: inline-block;
  }
  @keyframes kpSpin { to{transform:rotate(360deg)} }

  @media (max-width: 768px) {
    .kp-stats { grid-template-columns: repeat(2,1fr); }
    .kp-field-row, .kp-field-row-3 { grid-template-columns: 1fr; }
    .kp-toolbar { flex-direction: column; align-items: stretch; }
    .kp-search-wrap { max-width: 100%; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const PER_PAGE = 10;

const PRIORITAS_LIST = ["mendesak", "sedang", "umum"];

const PRIORITAS_CONFIG = {
  mendesak: { label: "Mendesak", icon: "fa-solid fa-triangle-exclamation", cls: "kp-prioritas--mendesak" },
  sedang:   { label: "Sedang",   icon: "fa-solid fa-minus-circle",         cls: "kp-prioritas--sedang"   },
  umum:     { label: "Umum",     icon: "fa-solid fa-circle-info",          cls: "kp-prioritas--umum"     },
};

const EMPTY_FORM = {
  judul:          "",
  isi:            "",
  publisher:      "",
  prioritas:      "umum",
  penting:        false,
  tanggal_mulai:  "",
  tanggal_berakhir: "",
  attachment_url: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: TextCell (clamp + toggle)
// ─────────────────────────────────────────────────────────────────────────────
function TextCell({ text, maxWidth = 240 }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>—</span>;
  return (
    <div className="kp-text-wrap" style={{ maxWidth }}>
      <p className={`kp-text-clamp${expanded ? " expanded" : ""}`}>{text}</p>
      <button className="kp-text-toggle" onClick={() => setExpanded((e) => !e)}>
        {expanded ? (
          <><i className="fa-solid fa-chevron-up" style={{ fontSize: 9 }} /> Sembunyikan</>
        ) : (
          <><i className="fa-solid fa-chevron-down" style={{ fontSize: 9 }} /> Lihat selengkapnya...</>
        )}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: ToggleSwitch
// ─────────────────────────────────────────────────────────────────────────────
function ToggleSwitch({ value, onChange }) {
  return (
    <div className="kp-toggle-wrap" onClick={() => onChange(!value)}>
      <div className={`kp-toggle-track${value ? " on" : ""}`}>
        <div className="kp-toggle-thumb" />
      </div>
      <div>
        <div className="kp-toggle-label">{value ? "Penting" : "Tidak Penting"}</div>
        <div className="kp-toggle-sub">
          {value ? "Akan ditandai sebagai pengumuman penting" : "Pengumuman biasa"}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const formatDate = (str) => {
  if (!str) return "—";
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

const publisherInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function KelolaPengumuman() {
  const [list,           setList]           = useState([]);
  const [loading,        setLoading]        = useState(true);

  const [search,         setSearch]         = useState("");
  const [filterPrioritas,setFilterPrioritas]= useState("semua");
  const [page,           setPage]           = useState(1);

  const [modalOpen,      setModalOpen]      = useState(false);
  const [editTarget,     setEditTarget]     = useState(null);
  const [form,           setForm]           = useState(EMPTY_FORM);
  const [formErr,        setFormErr]        = useState({});
  const [submitting,     setSubmitting]     = useState(false);

  const [confirmDel,     setConfirmDel]     = useState(null);
  const [toast,          setToast]          = useState(null);

  // ── Initial load ──
  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await api.get("/super-admin/pengumuman");
      setList(res.data.data || res.data || []);
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
  const filtered = list.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.judul?.toLowerCase().includes(q) ||
      p.publisher?.toLowerCase().includes(q) ||
      p.isi?.toLowerCase().includes(q);
    const matchPrioritas = filterPrioritas === "semua" || p.prioritas === filterPrioritas;
    return matchSearch && matchPrioritas;
  });

  useEffect(() => { setPage(1); }, [search, filterPrioritas]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Stats ──
  const total    = list.length;
  const mendesak = list.filter((p) => p.prioritas === "mendesak").length;
  const penting  = list.filter((p) => p.penting == 1 || p.penting === true).length;
  const aktifHari = (() => {
    const now = new Date();
    return list.filter((p) => {
      const mulai   = p.tanggal_mulai    ? new Date(p.tanggal_mulai)    : null;
      const berakhir = p.tanggal_berakhir ? new Date(p.tanggal_berakhir) : null;
      if (!mulai && !berakhir) return true;
      const afterStart  = !mulai    || now >= mulai;
      const beforeEnd   = !berakhir || now <= berakhir;
      return afterStart && beforeEnd;
    }).length;
  })();

  const stats = [
    { icon: "fa-solid fa-bullhorn",           label: "Total Pengumuman", num: total,     color: "var(--teal-600)", bg: "var(--teal-50)" },
    { icon: "fa-solid fa-circle-check",       label: "Aktif Hari Ini",  num: aktifHari, color: "#15803d",          bg: "#f0fdf4"        },
    { icon: "fa-solid fa-triangle-exclamation",label: "Mendesak",       num: mendesak,  color: "#b91c1c",          bg: "#fef2f2"        },
    { icon: "fa-solid fa-star",               label: "Penting",         num: penting,   color: "#92400e",          bg: "#fffbeb"        },
  ];

  // ── Modal open ──
  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErr({});
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditTarget(item);
    setForm({
      judul:            item.judul            || "",
      isi:              item.isi              || "",
      publisher:        item.publisher        || "",
      prioritas:        item.prioritas        || "umum",
      penting:          item.penting == 1 || item.penting === true,
      tanggal_mulai:    item.tanggal_mulai    ? item.tanggal_mulai.slice(0, 10)    : "",
      tanggal_berakhir: item.tanggal_berakhir ? item.tanggal_berakhir.slice(0, 10) : "",
      attachment_url:   item.attachment_url   || "",
    });
    setFormErr({});
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const handleFormChange = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    setFormErr((e) => ({ ...e, [field]: "" }));
  };

  // ── Validation ──
  const validate = () => {
    const err = {};
    if (!form.judul.trim())     err.judul     = "Judul wajib diisi.";
    if (!form.isi.trim())       err.isi       = "Isi pengumuman wajib diisi.";
    if (!form.publisher.trim()) err.publisher = "Publisher wajib diisi.";
    if (form.tanggal_mulai && form.tanggal_berakhir && form.tanggal_berakhir < form.tanggal_mulai) {
      err.tanggal_berakhir = "Tanggal berakhir tidak boleh sebelum tanggal mulai.";
    }
    return err;
  };

  // ── Submit ──
  const handleSubmit = async () => {
    const err = validate();
    if (Object.keys(err).length) { setFormErr(err); return; }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        penting: form.penting ? 1 : 0,
      };

      if (editTarget) {
        await api.post(`/super-admin/pengumuman/${editTarget.id}`, payload);
        setList((prev) =>
          prev.map((p) => p.id === editTarget.id ? { ...p, ...payload } : p)
        );
        showToast(`Pengumuman "${form.judul}" berhasil diperbarui.`);
      } else {
        const res = await api.post("/super-admin/pengumuman", payload);
        setList((prev) => [res.data.data || res.data, ...prev]);
        showToast(`Pengumuman "${form.judul}" berhasil ditambahkan.`);
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
    const item = confirmDel;
    setConfirmDel(null);
    try {
      await api.delete(`/super-admin/pengumuman/${item.id}`);
      setList((prev) => prev.filter((p) => p.id !== item.id));
      showToast(`Pengumuman "${item.judul}" berhasil dihapus.`);
    } catch {
      showToast("Gagal menghapus data.", "error");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SuperAdminLayout>
      <style>{css}</style>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet" />

      <div className="kp-page">

        {/* ── Page Header ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "var(--teal-600)", display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <i className="fa-solid fa-bullhorn" /> Super Admin — Konten Portal
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "var(--dark)" }}>
            Kelola Pengumuman
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="kp-stats">
          {stats.map((s, i) => (
            <div className="kp-stat" key={i}>
              <div className="kp-stat__icon" style={{ background: s.bg, color: s.color }}>
                <i className={s.icon} />
              </div>
              <div>
                <div className="kp-stat__num">{s.num}</div>
                <div className="kp-stat__label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="kp-toolbar">
          <div className="kp-search-wrap">
            <i className="fa-solid fa-magnifying-glass kp-search-icon" />
            <input
              className="kp-search-input"
              type="text"
              placeholder="Cari judul, publisher, isi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="kp-filter-tabs">
            {["semua", ...PRIORITAS_LIST].map((f) => (
              <button
                key={f}
                className={`kp-filter-tab${filterPrioritas === f ? " active" : ""}`}
                onClick={() => setFilterPrioritas(f)}
              >
                {f === "semua" ? "Semua" : PRIORITAS_CONFIG[f]?.label || f}
              </button>
            ))}
          </div>

          <button className="kp-add-btn" onClick={openAdd}>
            <i className="fa-solid fa-plus" /> Tambah Pengumuman
          </button>
        </div>

        {/* ── Table Card ── */}
        <div className="kp-table-card">
          <div className="kp-table-head">
            <div className="kp-table-head-title">
              <i className="fa-solid fa-table-list" /> Daftar Pengumuman
              <span className="kp-count-badge">{filtered.length}</span>
            </div>
          </div>

          {/* Loading skeleton */}
          {loading ? (
            <div className="kp-table-wrap">
              <table className="kp-table">
                <thead>
                  <tr>{["ID","Judul","Isi","Publisher","Prioritas","Penting","Tgl Mulai","Tgl Berakhir","Lampiran","Aksi"].map((h) => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody className="kp-skel">
                  {[...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(10)].map((_, j) => (
                        <td key={j}><div className="kp-skel-bar" style={{ width: "75%" }} /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          /* Empty */
          ) : filtered.length === 0 ? (
            <div className="kp-empty">
              <i className="fa-solid fa-bullhorn" />
              <p>Tidak ada pengumuman{search ? ` untuk "${search}"` : ""}.</p>
            </div>

          /* Table */
          ) : (
            <div className="kp-table-wrap">
              <table className="kp-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Judul</th>
                    <th>Isi</th>
                    <th>Publisher</th>
                    <th>Prioritas</th>
                    <th>Penting</th>
                    <th>Tgl Mulai</th>
                    <th>Tgl Berakhir</th>
                    <th>Lampiran</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((p) => {
                    const priConf = PRIORITAS_CONFIG[p.prioritas] || PRIORITAS_CONFIG.umum;
                    const isPenting = p.penting == 1 || p.penting === true;

                    return (
                      <tr key={p.id}>

                        {/* ID */}
                        <td>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", fontFamily: "monospace" }}>
                            #{p.id}
                          </span>
                        </td>

                        {/* Judul */}
                        <td style={{ fontWeight: 700, minWidth: 180, maxWidth: 220 }}>
                          <div style={{ fontSize: 13, color: "var(--dark)", lineHeight: 1.4 }}>
                            {p.judul}
                          </div>
                        </td>

                        {/* Isi */}
                        <td><TextCell text={p.isi} /></td>

                        {/* Publisher */}
                        <td>
                          <div className="kp-publisher">
                            <div className="kp-publisher-avatar">
                              {publisherInitials(p.publisher)}
                            </div>
                            <span className="kp-publisher-name">{p.publisher || "—"}</span>
                          </div>
                        </td>

                        {/* Prioritas */}
                        <td>
                          <span className={`kp-prioritas ${priConf.cls}`}>
                            <i className={priConf.icon} style={{ fontSize: 10 }} />
                            {priConf.label}
                          </span>
                        </td>

                        {/* Penting */}
                        <td>
                          <span className={`kp-penting ${isPenting ? "kp-penting--yes" : "kp-penting--no"}`}>
                            <i className={`fa-solid ${isPenting ? "fa-star" : "fa-star"}`} style={{ fontSize: 10, opacity: isPenting ? 1 : .35 }} />
                            {isPenting ? "Penting" : "Tidak Penting"}
                          </span>
                        </td>

                        {/* Tgl Mulai */}
                        <td className="kp-date">
                          {p.tanggal_mulai
                            ? <><i className="fa-regular fa-calendar kp-date-icon" />{formatDate(p.tanggal_mulai)}</>
                            : <span style={{ color: "var(--text-muted)" }}>—</span>
                          }
                        </td>

                        {/* Tgl Berakhir */}
                        <td className="kp-date">
                          {p.tanggal_berakhir
                            ? <><i className="fa-regular fa-calendar-xmark kp-date-icon" style={{ color: "#f87171" }} />{formatDate(p.tanggal_berakhir)}</>
                            : <span style={{ color: "var(--text-muted)" }}>—</span>
                          }
                        </td>

                        {/* Lampiran */}
                        <td>
                          {p.attachment_url ? (
                            <a
                              href={p.attachment_url}
                              target="_blank"
                              rel="noreferrer"
                              className="kp-link"
                              title={p.attachment_url}
                            >
                              <i className="fa-solid fa-paperclip" style={{ fontSize: 11 }} />
                              Lampiran
                            </a>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontSize: 12, fontStyle: "italic" }}>—</span>
                          )}
                        </td>

                        {/* Aksi */}
                        <td>
                          <div className="kp-actions">
                            <button className="kp-act-btn kp-act-btn--edit" onClick={() => openEdit(p)}>
                              <i className="fa-solid fa-pen-to-square" /> Edit
                            </button>
                            <button className="kp-act-btn kp-act-btn--del" onClick={() => setConfirmDel(p)}>
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
            <div className="kp-pagination">
              <div className="kp-page-info">
                Menampilkan {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} dari {filtered.length}
              </div>
              <div className="kp-page-btns">
                <button className="kp-page-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                  <i className="fa-solid fa-chevron-left" style={{ fontSize: 11 }} />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`kp-page-btn${page === i + 1 ? " active" : ""}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button className="kp-page-btn" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
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
        <div className="kp-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="kp-modal">

            {/* Header */}
            <div className="kp-modal-header">
              <div className="kp-modal-header-left">
                <div className="kp-modal-header-icon">
                  <i className={`fa-solid ${editTarget ? "fa-pen-to-square" : "fa-plus"}`} />
                </div>
                <div>
                  <div className="kp-modal-title">{editTarget ? "Edit Pengumuman" : "Tambah Pengumuman"}</div>
                  <div className="kp-modal-sub">
                    {editTarget ? `Mengedit: ${editTarget.judul}` : "Isi data pengumuman baru"}
                  </div>
                </div>
              </div>
              <button className="kp-modal-close" onClick={closeModal}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Body */}
            <div className="kp-modal-body">

              {/* ── Informasi Utama ── */}
              <div className="kp-modal-section-label">Informasi Utama</div>

              <div className="kp-field">
                <label className="kp-label">
                  <i className="fa-solid fa-heading" /> Judul <span className="kp-required">*</span>
                </label>
                <input
                  className={`kp-input${formErr.judul ? " error" : ""}`}
                  placeholder="Judul pengumuman..."
                  value={form.judul}
                  onChange={(e) => handleFormChange("judul", e.target.value)}
                />
                {formErr.judul && (
                  <span className="kp-error-msg">
                    <i className="fa-solid fa-circle-exclamation" />{formErr.judul}
                  </span>
                )}
              </div>

              <div className="kp-field">
                <label className="kp-label">
                  <i className="fa-solid fa-align-left" /> Isi Pengumuman <span className="kp-required">*</span>
                </label>
                <textarea
                  className={`kp-textarea${formErr.isi ? " error" : ""}`}
                  placeholder="Tulis isi pengumuman secara lengkap..."
                  value={form.isi}
                  onChange={(e) => handleFormChange("isi", e.target.value)}
                  rows={5}
                />
                {formErr.isi && (
                  <span className="kp-error-msg">
                    <i className="fa-solid fa-circle-exclamation" />{formErr.isi}
                  </span>
                )}
              </div>

              <div className="kp-field-row">
                <div className="kp-field">
                  <label className="kp-label">
                    <i className="fa-solid fa-user-pen" /> Publisher <span className="kp-required">*</span>
                  </label>
                  <input
                    className={`kp-input${formErr.publisher ? " error" : ""}`}
                    placeholder="Nama instansi / pengirim..."
                    value={form.publisher}
                    onChange={(e) => handleFormChange("publisher", e.target.value)}
                  />
                  {formErr.publisher && (
                    <span className="kp-error-msg">
                      <i className="fa-solid fa-circle-exclamation" />{formErr.publisher}
                    </span>
                  )}
                </div>

                <div className="kp-field">
                  <label className="kp-label">
                    <i className="fa-solid fa-layer-group" /> Prioritas
                  </label>
                  <select
                    className="kp-select"
                    value={form.prioritas}
                    onChange={(e) => handleFormChange("prioritas", e.target.value)}
                  >
                    {PRIORITAS_LIST.map((pr) => (
                      <option key={pr} value={pr}>{PRIORITAS_CONFIG[pr].label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggle penting */}
              <div className="kp-field">
                <label className="kp-label"><i className="fa-solid fa-star" /> Tandai sebagai Penting</label>
                <ToggleSwitch value={form.penting} onChange={(val) => handleFormChange("penting", val)} />
              </div>

              <div className="kp-modal-divider" />
              <div className="kp-modal-section-label">Periode Tayang</div>

              <div className="kp-field-row">
                <div className="kp-field">
                  <label className="kp-label">
                    <i className="fa-regular fa-calendar" /> Tanggal Mulai
                  </label>
                  <input
                    className="kp-input"
                    type="date"
                    value={form.tanggal_mulai}
                    onChange={(e) => handleFormChange("tanggal_mulai", e.target.value)}
                  />
                </div>

                <div className="kp-field">
                  <label className="kp-label">
                    <i className="fa-regular fa-calendar-xmark" /> Tanggal Berakhir
                  </label>
                  <input
                    className={`kp-input${formErr.tanggal_berakhir ? " error" : ""}`}
                    type="date"
                    value={form.tanggal_berakhir}
                    onChange={(e) => handleFormChange("tanggal_berakhir", e.target.value)}
                  />
                  {formErr.tanggal_berakhir && (
                    <span className="kp-error-msg">
                      <i className="fa-solid fa-circle-exclamation" />{formErr.tanggal_berakhir}
                    </span>
                  )}
                </div>
              </div>

              <div className="kp-modal-divider" />
              <div className="kp-modal-section-label">Lampiran</div>

              <div className="kp-field">
                <label className="kp-label">
                  <i className="fa-solid fa-paperclip" /> URL Lampiran
                </label>
                <input
                  className="kp-input"
                  type="url"
                  placeholder="https://example.com/dokumen.pdf"
                  value={form.attachment_url}
                  onChange={(e) => handleFormChange("attachment_url", e.target.value)}
                />
                {form.attachment_url && (
                  <a
                    href={form.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 12, color: "var(--teal-600)", display: "inline-flex", alignItems: "center", gap: 5, marginTop: 4 }}
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square" /> Buka lampiran
                  </a>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="kp-modal-footer">
              <button className="kp-modal-cancel" onClick={closeModal} disabled={submitting}>
                Batal
              </button>
              <button className="kp-modal-submit" onClick={handleSubmit} disabled={submitting}>
                {submitting
                  ? <><span className="kp-spinner" /> Menyimpan...</>
                  : <><i className={`fa-solid ${editTarget ? "fa-floppy-disk" : "fa-plus"}`} /> {editTarget ? "Simpan Perubahan" : "Tambah Pengumuman"}</>
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
        <div className="kp-confirm-overlay">
          <div className="kp-confirm-box">
            <div className="kp-confirm-icon"><i className="fa-solid fa-trash" /></div>
            <div className="kp-confirm-title">Hapus Pengumuman?</div>
            <div className="kp-confirm-desc">
              Pengumuman <strong>"{confirmDel.judul}"</strong> akan dihapus secara permanen dan tidak dapat dikembalikan.
            </div>
            <div className="kp-confirm-btns">
              <button className="kp-confirm-btn kp-confirm-btn--cancel" onClick={() => setConfirmDel(null)}>
                Batal
              </button>
              <button className="kp-confirm-btn kp-confirm-btn--del" onClick={handleDelete}>
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
        <div className={`kp-toast kp-toast--${toast.type}`}>
          <i className={`fa-solid ${toast.type === "success" ? "fa-circle-check" : "fa-triangle-exclamation"}`} />
          {toast.msg}
        </div>
      )}
    </SuperAdminLayout>
  );
}