import { useState, useEffect, useRef } from "react";
import SuperAdminLayout from "./SuperAdminLayout";
import api from "../../api/axios";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default leaflet icon
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
  .kb-page { animation: kbFadeUp .4s ease both; }
  @keyframes kbFadeUp { from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)} }

  /* ── Stats ── */
  .kb-stats {
    display: grid; grid-template-columns: repeat(4,1fr);
    gap: 16px; margin-bottom: 28px;
  }
  .kb-stat {
    background: white; border-radius: 16px;
    border: 1px solid var(--border); padding: 18px 20px;
    box-shadow: var(--shadow-sm);
    display: flex; align-items: center; gap: 14px;
    transition: var(--transition);
  }
  .kb-stat:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
  .kb-stat__icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .kb-stat__num {
    font-family: var(--font-display);
    font-size: 26px; font-weight: 700; color: var(--dark); line-height: 1;
  }
  .kb-stat__label { font-size: 12px; color: var(--text-muted); margin-top: 3px; }

  /* ── Toolbar ── */
  .kb-toolbar {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 20px; flex-wrap: wrap;
  }
  .kb-search-wrap { position: relative; flex: 1; max-width: 340px; }
  .kb-search-icon {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    color: var(--teal-400); font-size: 13px; pointer-events: none;
  }
  .kb-search-input {
    width: 100%; padding: 10px 16px 10px 38px;
    border-radius: 50px; border: 1.5px solid var(--border);
    background: white; font-family: var(--font-body);
    font-size: 13.5px; color: var(--dark); outline: none;
    transition: var(--transition);
  }
  .kb-search-input:focus { border-color: var(--teal-500); box-shadow: 0 0 0 3px rgba(64,114,175,.1); }
  .kb-search-input::placeholder { color: var(--text-muted); }

  .kb-filter-tabs { display: flex; gap: 6px; flex-wrap: wrap; flex: 1; }
  .kb-filter-tab {
    padding: 7px 16px; border-radius: 50px;
    border: 1.5px solid var(--border); background: white;
    font-family: var(--font-body); font-size: 12.5px; font-weight: 500;
    color: var(--text-muted); cursor: pointer; transition: var(--transition);
  }
  .kb-filter-tab:hover { border-color: var(--teal-400); color: var(--teal-700); }
  .kb-filter-tab.active { border-color: var(--teal-600); background: var(--teal-600); color: white; font-weight: 600; }

  .kb-add-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 9px 20px; border-radius: 50px;
    background: var(--teal-600); color: white; border: none;
    font-family: var(--font-body); font-size: 13.5px; font-weight: 600;
    cursor: pointer; transition: var(--transition); white-space: nowrap;
    box-shadow: 0 4px 14px rgba(64,114,175,.3);
  }
  .kb-add-btn:hover { background: var(--teal-700); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(64,114,175,.35); }

  /* ── Table card ── */
  .kb-table-card {
    background: white; border-radius: 20px;
    border: 1px solid var(--border); box-shadow: var(--shadow-sm); overflow: hidden;
  }
  .kb-table-head {
    padding: 18px 24px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  .kb-table-head-title {
    font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--dark);
    display: flex; align-items: center; gap: 9px;
  }
  .kb-table-head-title i { color: var(--teal-500); font-size: 15px; }
  .kb-count-badge {
    background: var(--teal-50); color: var(--teal-700);
    padding: 3px 10px; border-radius: 50px; font-size: 12px; font-weight: 700;
  }

  .kb-table-wrap { overflow-x: auto; }
  table.kb-table {
    width: 100%; border-collapse: collapse; font-size: 13px; min-width: 1200px;
  }
  .kb-table thead tr { background: var(--teal-50); }
  .kb-table th {
    padding: 12px 14px; text-align: left;
    font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
    color: var(--teal-700); border-bottom: 1px solid var(--border); white-space: nowrap;
  }
  .kb-table td {
    padding: 13px 14px; border-bottom: 1px solid var(--teal-50);
    color: var(--text-dark); vertical-align: middle;
  }
  .kb-table tbody tr { transition: background .15s; }
  .kb-table tbody tr:hover { background: var(--cream); }
  .kb-table tbody tr:last-child td { border-bottom: none; }

  /* Thumbnail */
  .kb-thumb {
    width: 64px; height: 48px; border-radius: 8px; object-fit: cover;
    border: 1px solid var(--border); flex-shrink: 0; display: block;
    background: var(--teal-50);
  }
  .kb-thumb-placeholder {
    width: 64px; height: 48px; border-radius: 8px;
    background: var(--teal-50); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    color: var(--teal-300); font-size: 18px;
  }

  /* Desc clamp */
  .kb-desc-wrap { max-width: 200px; }
  .kb-desc-text {
    font-size: 12.5px; color: var(--text-muted); line-height: 1.55;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .kb-desc-text.expanded { display: block; -webkit-line-clamp: unset; overflow: visible; }
  .kb-desc-toggle {
    font-size: 11.5px; color: var(--teal-600); font-weight: 600;
    cursor: pointer; background: none; border: none;
    padding: 2px 0; font-family: var(--font-body);
    display: inline-flex; align-items: center; gap: 4px; margin-top: 3px;
  }
  .kb-desc-toggle:hover { color: var(--teal-800); }

  /* Status select */
  .kb-status-select {
    padding: 4px 10px; border-radius: 50px;
    border: 1.5px solid; font-size: 11.5px; font-weight: 700;
    font-family: var(--font-body); cursor: pointer;
    outline: none; transition: var(--transition); appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 8px center;
    padding-right: 24px;
  }
  .kb-status-select.aktif    { background-color: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
  .kb-status-select.nonaktif { background-color: #fef2f2; color: #b91c1c; border-color: #fecaca; }

  /* Badges */
  .kb-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 50px;
    font-size: 11.5px; font-weight: 600; white-space: nowrap;
  }
  .kb-badge--category { background: var(--teal-50); color: var(--teal-700); border: 1px solid var(--teal-100); }
  .kb-badge--group { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }

  /* Koordinat */
  .kb-coords {
    font-family: monospace; font-size: 11px;
    color: var(--text-muted); line-height: 1.8;
    background: var(--teal-50); padding: 4px 8px; border-radius: 6px;
    white-space: nowrap;
  }

  /* Action buttons */
  .kb-actions { display: flex; gap: 7px; }
  .kb-act-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 8px;
    font-size: 12px; font-weight: 600; cursor: pointer;
    border: none; font-family: var(--font-body); transition: var(--transition); white-space: nowrap;
  }
  .kb-act-btn--edit { background: var(--teal-50); color: var(--teal-700); border: 1.5px solid var(--teal-100); }
  .kb-act-btn--edit:hover { background: var(--teal-600); color: white; border-color: var(--teal-600); }
  .kb-act-btn--del { background: #fef2f2; color: #b91c1c; border: 1.5px solid #fecaca; }
  .kb-act-btn--del:hover { background: #b91c1c; color: white; border-color: #b91c1c; }

  /* ── Pagination ── */
  .kb-pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 12px;
  }
  .kb-page-info { font-size: 13px; color: var(--text-muted); }
  .kb-page-btns { display: flex; gap: 5px; }
  .kb-page-btn {
    width: 34px; height: 34px; border-radius: 8px;
    border: 1.5px solid var(--border); background: white;
    font-size: 13px; font-weight: 600; color: var(--text-dark);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: var(--transition); font-family: var(--font-body);
  }
  .kb-page-btn:hover { border-color: var(--teal-400); color: var(--teal-700); }
  .kb-page-btn.active { background: var(--teal-600); border-color: var(--teal-600); color: white; }
  .kb-page-btn:disabled { opacity: .35; cursor: not-allowed; }

  /* ── Empty / Skeleton ── */
  .kb-empty {
    text-align: center; padding: 64px 0;
    display: flex; flex-direction: column; align-items: center; gap: 14px;
  }
  .kb-empty i { font-size: 44px; color: var(--teal-200); }
  .kb-empty p { font-size: 14px; color: var(--text-muted); }
  .kb-skel { animation: kbSkel 1.3s ease infinite; }
  @keyframes kbSkel { 0%,100%{opacity:1}50%{opacity:.4} }
  .kb-skel-bar { height: 14px; border-radius: 7px; background: var(--teal-100); }

  /* ══════ MODAL — Step ══════ */
  .kb-modal-overlay {
    position: fixed; inset: 0; z-index: 5000;
    background: rgba(10,29,61,.65); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
    animation: kbFadeIn .2s ease;
  }
  @keyframes kbFadeIn { from{opacity:0}to{opacity:1} }
  .kb-modal {
    background: white; border-radius: 24px; width: 100%; max-width: 680px;
    box-shadow: 0 30px 80px rgba(0,0,0,.22);
    animation: kbScaleIn .25s ease; display: flex; flex-direction: column;
    max-height: 93vh;
  }
  @keyframes kbScaleIn { from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)} }

  .kb-modal-header {
    padding: 22px 28px 16px; border-bottom: 1px solid var(--border);
    display: flex; align-items: flex-start; justify-content: space-between; gap: 14px;
    flex-shrink: 0;
  }
  .kb-modal-header-left { display: flex; align-items: center; gap: 14px; }
  .kb-modal-header-icon {
    width: 48px; height: 48px; border-radius: 14px;
    background: var(--teal-50); color: var(--teal-600);
    display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;
  }
  .kb-modal-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--dark); margin-bottom: 3px; }
  .kb-modal-sub { font-size: 13px; color: var(--text-muted); }
  .kb-modal-close {
    width: 34px; height: 34px; border-radius: 50%;
    background: var(--teal-50); border: 1.5px solid var(--border);
    color: var(--text-muted); font-size: 14px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: var(--transition); flex-shrink: 0;
  }
  .kb-modal-close:hover { background: #fef2f2; border-color: #fecaca; color: #b91c1c; transform: rotate(90deg); }

  /* Step indicator */
  .kb-steps {
    display: flex; align-items: center; padding: 16px 28px;
    border-bottom: 1px solid var(--border); gap: 0; flex-shrink: 0;
  }
  .kb-step {
    display: flex; align-items: center; gap: 8px; flex: 1;
  }
  .kb-step__dot {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; transition: var(--transition);
  }
  .kb-step__dot--done   { background: var(--teal-600); color: white; }
  .kb-step__dot--active { background: var(--teal-600); color: white; box-shadow: 0 0 0 4px rgba(64,114,175,.2); }
  .kb-step__dot--idle   { background: var(--teal-50); color: var(--teal-400); border: 1.5px solid var(--teal-100); }
  .kb-step__label { font-size: 11.5px; font-weight: 600; color: var(--text-muted); white-space: nowrap; }
  .kb-step__label.active { color: var(--teal-700); }
  .kb-step__line { flex: 1; height: 1.5px; background: var(--teal-100); margin: 0 8px; }
  .kb-step__line.done { background: var(--teal-600); }

  .kb-modal-body {
    padding: 22px 28px; display: flex; flex-direction: column; gap: 16px;
    overflow-y: auto; flex: 1;
  }
  .kb-modal-body::-webkit-scrollbar { width: 4px; }
  .kb-modal-body::-webkit-scrollbar-thumb { background: var(--teal-200); border-radius: 2px; }

  /* Form */
  .kb-field { display: flex; flex-direction: column; gap: 6px; }
  .kb-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .kb-field-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .kb-label {
    font-size: 12.5px; font-weight: 700; color: var(--text-dark);
    display: flex; align-items: center; gap: 5px;
  }
  .kb-label i { color: var(--teal-500); font-size: 11px; }
  .kb-required { color: #e11d48; font-size: 13px; }

  .kb-input, .kb-select, .kb-textarea {
    width: 100%; padding: 10px 14px;
    border-radius: 10px; border: 1.5px solid var(--border);
    background: white; font-family: var(--font-body);
    font-size: 13.5px; color: var(--dark); outline: none;
    transition: var(--transition);
  }
  .kb-input:focus, .kb-select:focus, .kb-textarea:focus {
    border-color: var(--teal-500); box-shadow: 0 0 0 3px rgba(64,114,175,.1);
  }
  .kb-input:disabled, .kb-select:disabled { background: var(--teal-50); color: var(--text-muted); cursor: not-allowed; }
  .kb-textarea { resize: vertical; min-height: 88px; line-height: 1.6; }
  .kb-input::placeholder, .kb-textarea::placeholder { color: var(--text-muted); }
  .kb-input.error, .kb-select.error { border-color: #f87171; }
  .kb-error-msg { font-size: 12px; color: #e11d48; display: flex; align-items: center; gap: 5px; }

  /* slug input */
  .kb-slug-wrap { position: relative; }
  .kb-slug-prefix {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    font-size: 12.5px; color: var(--text-muted); pointer-events: none;
    font-family: monospace;
  }
  .kb-slug-wrap .kb-input { padding-left: 80px; font-family: monospace; font-size: 13px; }

  /* Section label */
  .kb-section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    color: var(--teal-600); display: flex; align-items: center; gap: 8px;
  }
  .kb-section-label::after { content: ''; flex: 1; height: 1px; background: var(--teal-100); }

  /* File area */
  .kb-file-area {
    border: 2px dashed var(--teal-200); border-radius: 12px;
    padding: 20px; text-align: center; cursor: pointer;
    transition: var(--transition); background: var(--teal-50); position: relative;
  }
  .kb-file-area:hover { border-color: var(--teal-400); background: rgba(64,114,175,.05); }
  .kb-file-area-icon { font-size: 28px; color: var(--teal-400); margin-bottom: 8px; }
  .kb-file-area-label { font-size: 13px; color: var(--text-muted); }
  .kb-file-area-label strong { color: var(--teal-700); }
  .kb-file-preview { width: 100%; max-height: 120px; object-fit: cover; border-radius: 8px; margin-top: 8px; border: 1px solid var(--border); }

  /* Map */
  .kb-map-wrap {
    border-radius: 12px; overflow: hidden;
    border: 1.5px solid var(--border);
    height: 260px;
  }
  .kb-coords-display {
    display: flex; gap: 10px; margin-top: 8px; flex-wrap: wrap;
  }
  .kb-coord-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--teal-50); border: 1px solid var(--teal-100);
    padding: 5px 12px; border-radius: 8px; font-family: monospace;
    font-size: 12px; color: var(--teal-700);
  }
  .kb-coord-badge i { font-size: 10px; color: var(--teal-400); }

  /* Geocoder search */
  .kb-geocoder { position: relative; margin-bottom: 10px; }
  .kb-geocoder-input-wrap { position: relative; display: flex; gap: 8px; }
  .kb-geocoder-icon {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    color: var(--teal-400); font-size: 13px; pointer-events: none; z-index: 1;
  }
  .kb-geocoder-input {
    flex: 1; padding: 10px 44px 10px 38px;
    border-radius: 10px; border: 1.5px solid var(--border);
    background: white; font-family: var(--font-body);
    font-size: 13.5px; color: var(--dark); outline: none; transition: var(--transition);
  }
  .kb-geocoder-input:focus { border-color: var(--teal-500); box-shadow: 0 0 0 3px rgba(64,114,175,.1); }
  .kb-geocoder-input::placeholder { color: var(--text-muted); }
  .kb-geocoder-clear {
    position: absolute; right: 100px; top: 50%; transform: translateY(-50%);
    width: 20px; height: 20px; border-radius: 50%; background: var(--teal-100);
    color: var(--text-muted); font-size: 10px; cursor: pointer; border: none;
    display: flex; align-items: center; justify-content: center; transition: var(--transition);
  }
  .kb-geocoder-clear:hover { background: #fecaca; color: #b91c1c; }
  .kb-geocoder-btn {
    padding: 10px 16px; border-radius: 10px;
    background: var(--teal-600); color: white; border: none;
    font-family: var(--font-body); font-size: 13px; font-weight: 600;
    cursor: pointer; transition: var(--transition); white-space: nowrap;
    display: flex; align-items: center; gap: 6px;
  }
  .kb-geocoder-btn:hover { background: var(--teal-700); }
  .kb-geocoder-btn:disabled { opacity: .6; cursor: not-allowed; }
  .kb-geocoder-results {
    position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 9999;
    background: white; border-radius: 12px; border: 1.5px solid var(--border);
    box-shadow: 0 12px 40px rgba(0,0,0,.15); overflow: hidden;
    max-height: 220px; overflow-y: auto;
  }
  .kb-geocoder-results::-webkit-scrollbar { width: 4px; }
  .kb-geocoder-results::-webkit-scrollbar-thumb { background: var(--teal-200); border-radius: 2px; }
  .kb-geocoder-item {
    padding: 10px 14px; cursor: pointer; transition: background .12s;
    display: flex; align-items: flex-start; gap: 10px; border-bottom: 1px solid var(--teal-50);
  }
  .kb-geocoder-item:last-child { border-bottom: none; }
  .kb-geocoder-item:hover { background: var(--teal-50); }
  .kb-geocoder-item-icon { color: var(--teal-500); font-size: 12px; margin-top: 2px; flex-shrink: 0; }
  .kb-geocoder-item-name { font-size: 13px; font-weight: 600; color: var(--dark); line-height: 1.3; }
  .kb-geocoder-item-detail { font-size: 11.5px; color: var(--text-muted); margin-top: 2px; line-height: 1.4; }
  .kb-geocoder-empty { padding: 18px; text-align: center; font-size: 13px; color: var(--text-muted); }
  .kb-geocoder-loading { padding: 14px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px; color: var(--text-muted); }
  .kb-geocoder-spinner {
    width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid var(--teal-100); border-top-color: var(--teal-500);
    animation: kbSpin .7s linear infinite; display: inline-block;
  }

  /* Metadata dynamic fields */
  .kb-meta-card {
    background: linear-gradient(135deg, var(--teal-50), #eff6ff);
    border: 1.5px solid var(--teal-100); border-radius: 14px;
    padding: 16px 18px; display: flex; flex-direction: column; gap: 14px;
  }
  .kb-meta-hint {
    font-size: 12px; color: var(--teal-600);
    display: flex; align-items: center; gap: 6px;
    background: white; border: 1px solid var(--teal-100);
    border-radius: 8px; padding: 8px 12px;
  }

  /* Category group card picker */
  .kb-group-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .kb-group-card {
    padding: 14px 16px; border-radius: 12px;
    border: 1.5px solid var(--border); background: white;
    cursor: pointer; transition: var(--transition);
    display: flex; align-items: center; gap: 10px;
  }
  .kb-group-card:hover { border-color: var(--teal-300); background: var(--teal-50); }
  .kb-group-card.selected { border-color: var(--teal-600); background: var(--teal-50); box-shadow: 0 0 0 3px rgba(64,114,175,.1); }
  .kb-group-card__icon { width: 36px; height: 36px; border-radius: 10px; background: var(--teal-100); color: var(--teal-700); display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
  .kb-group-card__name { font-size: 13px; font-weight: 700; color: var(--dark); }
  .kb-group-card__count { font-size: 11px; color: var(--text-muted); margin-top: 1px; }

  .kb-cat-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .kb-cat-chip {
    padding: 6px 14px; border-radius: 50px;
    border: 1.5px solid var(--border); background: white;
    font-size: 12.5px; font-weight: 600; color: var(--text-muted);
    cursor: pointer; transition: var(--transition);
    display: flex; align-items: center; gap: 6px;
  }
  .kb-cat-chip:hover { border-color: var(--teal-400); color: var(--teal-700); }
  .kb-cat-chip.selected { border-color: var(--teal-600); background: var(--teal-600); color: white; }

  /* Modal footer */
  .kb-modal-footer {
    padding: 18px 28px; border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    flex-shrink: 0;
  }
  .kb-modal-footer-right { display: flex; gap: 10px; }
  .kb-modal-cancel {
    padding: 10px 22px; border-radius: 50px;
    border: 1.5px solid var(--border); background: white;
    font-family: var(--font-body); font-size: 13.5px; font-weight: 600;
    color: var(--text-muted); cursor: pointer; transition: var(--transition);
  }
  .kb-modal-cancel:hover { background: var(--cream); border-color: var(--teal-200); }
  .kb-btn-prev {
    padding: 10px 20px; border-radius: 50px;
    border: 1.5px solid var(--border); background: white;
    font-family: var(--font-body); font-size: 13.5px; font-weight: 600;
    color: var(--text-dark); cursor: pointer; transition: var(--transition);
    display: flex; align-items: center; gap: 7px;
  }
  .kb-btn-prev:hover { background: var(--teal-50); border-color: var(--teal-300); }
  .kb-btn-next {
    padding: 10px 22px; border-radius: 50px;
    background: var(--teal-600); color: white; border: none;
    font-family: var(--font-body); font-size: 13.5px; font-weight: 700;
    cursor: pointer; transition: var(--transition);
    display: flex; align-items: center; gap: 7px;
    box-shadow: 0 4px 14px rgba(64,114,175,.3);
  }
  .kb-btn-next:hover { background: var(--teal-700); transform: translateY(-1px); }
  .kb-btn-next:disabled { opacity: .6; cursor: not-allowed; transform: none; }

  /* Confirm */
  .kb-confirm-overlay {
    position: fixed; inset: 0; z-index: 6000;
    background: rgba(10,29,61,.7); backdrop-filter: blur(5px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
    animation: kbFadeIn .2s ease;
  }
  .kb-confirm-box {
    background: white; border-radius: 20px; padding: 32px 28px;
    max-width: 380px; width: 100%;
    box-shadow: 0 24px 60px rgba(0,0,0,.22); animation: kbScaleIn .25s ease;
  }
  .kb-confirm-icon { width: 52px; height: 52px; border-radius: 14px; background: #fef2f2; color: #b91c1c; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 16px; }
  .kb-confirm-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--dark); margin-bottom: 10px; }
  .kb-confirm-desc { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px; }
  .kb-confirm-btns { display: flex; gap: 10px; }
  .kb-confirm-btn { flex: 1; padding: 11px; border-radius: 10px; font-size: 14px; font-weight: 600; font-family: var(--font-body); cursor: pointer; transition: var(--transition); border: none; }
  .kb-confirm-btn--cancel { background: var(--teal-50); color: var(--text-muted); border: 1.5px solid var(--border); }
  .kb-confirm-btn--cancel:hover { background: var(--teal-100); }
  .kb-confirm-btn--del { background: #b91c1c; color: white; }
  .kb-confirm-btn--del:hover { background: #991b1b; }

  /* Toast */
  .kb-toast {
    position: fixed; bottom: 28px; right: 28px; z-index: 9999;
    padding: 14px 20px; border-radius: 14px; font-size: 13.5px; font-weight: 500;
    display: flex; align-items: center; gap: 10px;
    box-shadow: 0 8px 30px rgba(0,0,0,.22); animation: kbSlideUp .3s ease; max-width: 340px; color: white;
  }
  @keyframes kbSlideUp { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
  .kb-toast--success { background: #15803d; }
  .kb-toast--error   { background: #b91c1c; }

  .kb-spinner {
    width: 15px; height: 15px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,.3); border-top-color: white;
    animation: kbSpin .7s linear infinite; display: inline-block;
  }
  @keyframes kbSpin { to{transform:rotate(360deg)} }

  @media (max-width: 768px) {
    .kb-stats { grid-template-columns: repeat(2,1fr); }
    .kb-field-row, .kb-field-row-3 { grid-template-columns: 1fr; }
    .kb-toolbar { flex-direction: column; align-items: stretch; }
    .kb-search-wrap { max-width: 100%; }
    .kb-group-grid { grid-template-columns: 1fr; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const PER_PAGE = 10;
// Nilai status harus cocok dengan enum di backend: 'aktif' | 'nonaktif'
// Controller menggunakan $request->status ?? 'aktif'
const STATUS_LIST = ["aktif", "nonaktif"];

// Kategori yang dikelola di halaman terpisah (bukan di sini)
const EXCLUDED_CATEGORIES = ["CCTV"];

// Skema metadata dinamis berdasarkan nama kategori
const METADATA_SCHEMA = {
  "Taman": [
    { key: "luas_m2", label: "Luas (m²)", type: "number", placeholder: "500" },
    { key: "fasilitas", label: "Fasilitas", type: "text", placeholder: "Bangku, Kolam, dll." },
    { key: "jam_buka", label: "Jam Buka", type: "text", placeholder: "06.00 - 18.00" },
  ],
  "RPTRA": [
    { key: "kapasitas", label: "Kapasitas Pengunjung", type: "number", placeholder: "100" },
    { key: "pengelola", label: "Pengelola", type: "text", placeholder: "Nama pengelola" },
  ],
  "Wifi": [
    { key: "ssid", label: "SSID/Nama Jaringan", type: "text", placeholder: "PBG-FreeWifi" },
    { key: "provider", label: "Provider ISP", type: "text", placeholder: "Telkom, Biznet, dll." },
    { key: "bandwidth", label: "Bandwidth", type: "text", placeholder: "100 Mbps" },
    { key: "jangkauan_m", label: "Jangkauan (meter)", type: "number", placeholder: "50" },
  ],
  "RFH": [
    { key: "jumlah_bed", label: "Jumlah Bed", type: "number", placeholder: "50" },
    { key: "tipe_faskes", label: "Tipe Faskes", type: "select", options: ["Puskesmas", "Pustu", "Posyandu", "Klinik", "RFH"] },
    { key: "igd_24jam", label: "IGD 24 Jam", type: "select", options: ["Tersedia", "Tidak"] },
    { key: "akreditasi", label: "Akreditasi", type: "text", placeholder: "Paripurna, Utama, dll." },
  ],
  "Sarana Olahraga": [
    { key: "jenis_olahraga", label: "Jenis Olahraga", type: "text", placeholder: "Sepakbola, Basket, dll." },
    { key: "kapasitas", label: "Kapasitas (orang)", type: "number", placeholder: "500" },
    { key: "jam_operasional", label: "Jam Operasional", type: "text", placeholder: "07.00 - 21.00" },
  ],
  "Bus Stop": [
    { key: "rute", label: "Rute Dilayani", type: "text", placeholder: "Rute A, B, C" },
    { key: "shelter", label: "Ada Shelter", type: "select", options: ["Tersedia", "Tidak"] },
  ],
  "Halte TJ": [
    { key: "kode_halte", label: "Kode Halte", type: "text", placeholder: "HTJ-001" },
    { key: "rute", label: "Rute Transjakarta", type: "text", placeholder: "1A, 2B, dll." },
    { key: "fasilitas_disabilitas", label: "Fasilitas Disabilitas", type: "select", options: ["Tersedia", "Tidak"] },
  ],
  "Sekolah": [
    { key: "npsn", label: "NPSN", type: "text", placeholder: "12345678" },
    { key: "jenjang", label: "Jenjang", type: "select", options: ["SD", "SMP", "SMA", "SMK", "MI", "MTs", "MA"] },
    { key: "akreditasi", label: "Akreditasi", type: "select", options: ["A", "B", "C", "Belum Terakreditasi"] },
    { key: "jumlah_guru", label: "Jumlah Guru", type: "number", placeholder: "30" },
    { key: "jumlah_siswa", label: "Jumlah Siswa", type: "number", placeholder: "500" },
  ],
  "Rumah Sakit": [
    { 
      key: "kelas_rs", 
      label: "Kelas Rumah Sakit", 
      type: "select", 
      options: ["Kelas A", "Kelas B", "Kelas C", "Kelas D"] 
    },
    { 
      key: "akreditasi_rs", 
      label: "Akreditasi", 
      type: "select", 
      options: ["Paripurna", "Utama", "Madya", "Pratama", "Belum Terakreditasi"] 
    },
    { 
      key: "jumlah_bed", 
      label: "Total Tempat Tidur", 
      type: "number", 
      placeholder: "Contoh: 150" 
    },
    { 
      key: "layanan_unggulan", 
      label: "Layanan Unggulan", 
      type: "text", 
      placeholder: "Misal: Spesialis Anak, Bedah Syaraf" 
    },
    { 
      key: "igd_24_jam", 
      label: "IGD 24 Jam?", 
      type: "select", 
      options: ["Tersedia", "Tidak Tersedia"] 
    },
    { 
      key: "penyelenggara", 
      label: "Pemilik/Penyelenggara", 
      type: "text", 
      placeholder: "Misal: Pemkab Purbalingga / Swasta" 
    },
],
};

// Icon group mapping
const GROUP_ICONS = {
  "Fasilitas Umum": "fa-solid fa-building",
  "Transportasi": "fa-solid fa-bus",
  "Fasilitas Kesehatan": "fa-solid fa-hospital",
  "Destinasi Wisata": "fa-solid fa-mountain-sun",
};

const EMPTY_FORM = {
  group_id: "",       // hanya untuk UI (filter chip kategori), tidak dikirim ke backend
  category_id: "",
  kecamatan_id: "",
  desa_id: "",
  nama: "",
  // slug tidak perlu dikirim — backend auto-generate via Str::slug($request->nama)
  alamat: "",
  deskripsi: "",
  kontak: "",
  website: "",
  status: "aktif",  // default sesuai controller: $request->status ?? 'aktif'
  thumbnail: null,
  latitude: -7.4478,
  longitude: 109.3444,
  metadata: {},
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function generateSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
function DescCell({ text }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>—</span>;
  return (
    <div className="kb-desc-wrap">
      <p className={`kb-desc-text${expanded ? " expanded" : ""}`}>{text}</p>
      <button className="kb-desc-toggle" onClick={() => setExpanded((e) => !e)}>
        {expanded
          ? <><i className="fa-solid fa-chevron-up" style={{ fontSize: 9 }} /> Sembunyikan</>
          : <><i className="fa-solid fa-chevron-down" style={{ fontSize: 9 }} /> Selengkapnya...</>}
      </button>
    </div>
  );
}

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step Components
// ─────────────────────────────────────────────────────────────────────────────

// STEP 1 — Pilih Group & Kategori + Lokasi Administratif
function Step1({ form, setForm, groups, categories, districts, villages, formErr }) {
  const handleFormChange = (field, val) => setForm((f) => ({ ...f, [field]: val }));
  const handleMetadataReset = () => setForm((f) => ({ ...f, metadata: {} }));

  const filteredCategories = categories.filter((c) => c.group_id == form.group_id && !EXCLUDED_CATEGORIES.includes(c.nama?.trim()));
  const filteredVillages = villages.filter((v) => v.kecamatan_id == form.kecamatan_id);
  const selectedGroup = groups.find((g) => g.id == form.group_id);

  return (
    <>
      <div className="kb-section-label">Pilih Kelompok Bangunan</div>

      <div className="kb-group-grid">
        {groups.map((g) => (
          <div
            key={g.id}
            className={`kb-group-card${form.group_id == g.id ? " selected" : ""}`}
            onClick={() => {
              handleFormChange("group_id", g.id);
              handleFormChange("category_id", g.category_id);
              handleMetadataReset();
            }}
          >
            <div className="kb-group-card__icon">
              <i className={GROUP_ICONS[g.nama] || "fa-solid fa-folder"} />
            </div>
            <div>
              <div className="kb-group-card__name">{g.nama}</div>
              <div className="kb-group-card__count">
                {categories.filter((c) => c.group_id == g.id).length - 1} kategori
              </div>
            </div>
          </div>
        ))}
      </div>

      {form.group_id && (
        <>
          <div className="kb-section-label">Pilih Kategori — {selectedGroup?.nama}</div>
          <div className="kb-cat-chips">
            {filteredCategories.map((c) => (
              <div
                key={c.id}
                className={`kb-cat-chip${form.category_id == c.id ? " selected" : ""}`}
                onClick={() => {
                  handleFormChange("category_id", c.id);
                  handleMetadataReset();
                }}
              >
                {c.icon_marker && <i className={`fa-solid ${c.icon_marker}`} style={{ fontSize: 11 }} />}
                {c.nama}
              </div>
            ))}
          </div>
          {formErr.category_id && (
            <span className="kb-error-msg"><i className="fa-solid fa-circle-exclamation" />{formErr.category_id}</span>
          )}
        </>
      )}

      <div className="kb-section-label" style={{ marginTop: 4 }}>Lokasi Administratif</div>

      <div className="kb-field-row">
        <div className="kb-field">
          <label className="kb-label"><i className="fa-solid fa-map" /> Kecamatan <span className="kb-required">*</span></label>
          <select
            className={`kb-select${formErr.kecamatan_id ? " error" : ""}`}
            value={form.kecamatan_id}
            onChange={(e) => {
              handleFormChange("kecamatan_id", e.target.value);
              handleFormChange("desa_id", "");
            }}
          >
            <option value="">— Pilih Kecamatan —</option>
            {districts.map((d) => <option key={d.id} value={d.id}>{d.nama_kecamatan || d.nama}</option>)}
          </select>
          {formErr.kecamatan_id && (
            <span className="kb-error-msg"><i className="fa-solid fa-circle-exclamation" />{formErr.kecamatan_id}</span>
          )}
        </div>
        <div className="kb-field">
          <label className="kb-label"><i className="fa-solid fa-location-dot" /> Desa/Kelurahan</label>
          <select
            className="kb-select"
            value={form.desa_id}
            onChange={(e) => handleFormChange("desa_id", e.target.value)}
            disabled={!form.kecamatan_id}
          >
            <option value="">— Pilih Desa —</option>
            {filteredVillages.map((v) => <option key={v.id} value={v.id}>{v.nama_desa || v.nama}</option>)}
          </select>
        </div>
      </div>
    </>
  );
}

// STEP 2 — Data Utama Bangunan
function Step2({ form, setForm, formErr, previewUrl, setPreviewUrl, fileRef }) {
  const handleFormChange = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    handleFormChange("thumbnail", file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Slug di-generate otomatis oleh backend (Str::slug), jadi di sini hanya tampil preview
  const slugPreview = form.nama
    ? form.nama.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim()
    : "";

  return (
    <>
      <div className="kb-section-label">Informasi Utama</div>

      <div className="kb-field-row">
        <div className="kb-field">
          <label className="kb-label"><i className="fa-solid fa-city" /> Nama Bangunan <span className="kb-required">*</span></label>
          <input
            className={`kb-input${formErr.nama ? " error" : ""}`}
            placeholder="Nama lengkap bangunan..."
            value={form.nama}
            onChange={(e) => handleFormChange("nama", e.target.value)}
          />
          {formErr.nama && <span className="kb-error-msg"><i className="fa-solid fa-circle-exclamation" />{formErr.nama}</span>}
        </div>
        <div className="kb-field">
          <label className="kb-label"><i className="fa-solid fa-link" /> Slug (Auto oleh sistem)</label>
          <div className="kb-slug-wrap">
            <span className="kb-slug-prefix">/b/</span>
            <input
              className="kb-input"
              value={slugPreview}
              readOnly
              placeholder="otomatis dari nama"
              style={{ background: "var(--teal-50)", color: "var(--text-muted)", cursor: "default" }}
            />
          </div>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 4, color: "var(--teal-400)" }} />
            Slug di-generate otomatis oleh sistem dari nama bangunan.
          </span>
        </div>
      </div>

      <div className="kb-field">
        <label className="kb-label"><i className="fa-solid fa-map-marker-alt" /> Alamat Lengkap</label>
        <textarea
          className="kb-textarea"
          placeholder="Jl. Raya ... No. ..."
          value={form.alamat}
          onChange={(e) => handleFormChange("alamat", e.target.value)}
          rows={2}
        />
      </div>

      <div className="kb-field">
        <label className="kb-label"><i className="fa-solid fa-align-left" /> Deskripsi</label>
        <textarea
          className="kb-textarea"
          placeholder="Deskripsi singkat tentang bangunan ini..."
          value={form.deskripsi}
          onChange={(e) => handleFormChange("deskripsi", e.target.value)}
          rows={3}
        />
      </div>

      <div className="kb-field-row">
        <div className="kb-field">
          <label className="kb-label"><i className="fa-solid fa-phone" /> Kontak</label>
          <input
            className="kb-input"
            placeholder="Nomor telepon / WhatsApp"
            value={form.kontak}
            onChange={(e) => handleFormChange("kontak", e.target.value)}
          />
        </div>
        <div className="kb-field">
          <label className="kb-label"><i className="fa-solid fa-globe" /> Website</label>
          <input
            className="kb-input"
            placeholder="https://..."
            value={form.website}
            onChange={(e) => handleFormChange("website", e.target.value)}
          />
        </div>
      </div>

      <div className="kb-field-row">
        <div className="kb-field">
          <label className="kb-label"><i className="fa-solid fa-flag" /> Status</label>
          <select className="kb-select" value={form.status} onChange={(e) => handleFormChange("status", e.target.value)}>
            {STATUS_LIST.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div className="kb-section-label">Foto / Thumbnail</div>
      <div className="kb-field">
        <div className="kb-file-area" onClick={() => fileRef.current?.click()}>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
          <div className="kb-file-area-icon"><i className="fa-solid fa-cloud-arrow-up" /></div>
          <div className="kb-file-area-label">
            <strong>Klik untuk unggah</strong> atau seret gambar ke sini<br />
            <span style={{ fontSize: 11, opacity: .7 }}>PNG, JPG, WEBP maks. 2MB</span>
          </div>
          {previewUrl && <img src={previewUrl} alt="preview" className="kb-file-preview" />}
        </div>
      </div>
    </>
  );
}

// STEP 3 — Metadata Dinamis
function Step3({ form, setForm, categories }) {
  const selectedCategory = categories.find((c) => c.id == form.category_id);
  const metaFields = selectedCategory ? (METADATA_SCHEMA[selectedCategory.nama] || []) : [];

  const handleMetadataChange = (key, val) => {
    setForm((f) => ({ ...f, metadata: { ...f.metadata, [key]: val } }));
  };

  if (!selectedCategory) {
    return (
      <div className="kb-empty" style={{ padding: "32px 0" }}>
        <i className="fa-solid fa-circle-info" style={{ fontSize: 32 }} />
        <p>Kategori belum dipilih. Kembali ke Tahap 1.</p>
      </div>
    );
  }

  if (metaFields.length === 0) {
    return (
      <div className="kb-meta-hint">
        <i className="fa-solid fa-circle-info" />
        Kategori <strong>{selectedCategory.nama}</strong> tidak memiliki data spesifik tambahan.
        Kamu bisa langsung lanjut ke tahap berikutnya.
      </div>
    );
  }

  return (
    <>
      <div className="kb-section-label">Detail Spesifik — {selectedCategory.nama}</div>
      <div className="kb-meta-card">
        <div className="kb-meta-hint">
          <i className="fa-solid fa-circle-info" />
          Field berikut khusus untuk kategori <strong>{selectedCategory.nama}</strong> dan akan tersimpan sebagai metadata.
        </div>
        {metaFields.map((field) => (
          <div className="kb-field" key={field.key}>
            <label className="kb-label"><i className="fa-solid fa-pen-to-square" /> {field.label}</label>
            {field.type === "select" ? (
              <select
                className="kb-select"
                value={form.metadata[field.key] || ""}
                onChange={(e) => handleMetadataChange(field.key, e.target.value)}
              >
                <option value="">— Pilih —</option>
                {field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <input
                type={field.type}
                className="kb-input"
                placeholder={field.placeholder || ""}
                value={form.metadata[field.key] || ""}
                onChange={(e) => handleMetadataChange(field.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// STEP 4 — Map Picker + Koordinat
function Step4({ form, setForm }) {
  const handleFormChange = (field, val) => setForm((f) => ({ ...f, [field]: val }));
  const center = [form.latitude || -7.4478, form.longitude || 109.3444];

  return (
    <>
      <div className="kb-section-label">Titik Koordinat Bangunan</div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: -8, marginBottom: 4 }}>
        <i className="fa-solid fa-hand-pointer" style={{ color: "var(--teal-500)", marginRight: 6 }} />
        Klik di peta untuk menentukan lokasi bangunan secara presisi.
      </div>

      <div className="kb-map-wrap">
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <LocationPicker
            position={[form.latitude, form.longitude]}
            setPosition={(pos) => {
              handleFormChange("latitude", parseFloat(pos[0].toFixed(7)));
              handleFormChange("longitude", parseFloat(pos[1].toFixed(7)));
            }}
          />
        </MapContainer>
      </div>

      <div className="kb-coords-display">
        <div className="kb-coord-badge">
          <i className="fa-solid fa-up-down" /> Latitude: {form.latitude}
        </div>
        <div className="kb-coord-badge">
          <i className="fa-solid fa-left-right" /> Longitude: {form.longitude}
        </div>
      </div>

      <div className="kb-field-row" style={{ marginTop: 4 }}>
        <div className="kb-field">
          <label className="kb-label"><i className="fa-solid fa-up-down" /> Latitude (manual)</label>
          <input
            className="kb-input"
            type="number"
            step="0.0000001"
            value={form.latitude}
            onChange={(e) => handleFormChange("latitude", parseFloat(e.target.value))}
          />
        </div>
        <div className="kb-field">
          <label className="kb-label"><i className="fa-solid fa-left-right" /> Longitude (manual)</label>
          <input
            className="kb-input"
            type="number"
            step="0.0000001"
            value={form.longitude}
            onChange={(e) => handleFormChange("longitude", parseFloat(e.target.value))}
          />
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function KelolaBangunan() {
  const [buildings, setBuildings] = useState([]);
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterGroup, setFilterGroup] = useState("semua");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErr, setFormErr] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileRef = useRef();

  const [confirmDel, setConfirmDel] = useState(null);
  const [toast, setToast] = useState(null);

  const TOTAL_STEPS = 4;
  const STEP_LABELS = ["Kategori & Lokasi", "Informasi Umum", "Data Spesifik", "Pin Peta"];

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bRes, gRes, cRes, dRes, vRes] = await Promise.all([
        api.get("/super-admin/buildings"),
        api.get("/super-admin/building-groups"),
        api.get("/super-admin/building-categories"),
        api.get("/super-admin/kecamatan"),
        api.get("/super-admin/desa"),
      ]);
      setBuildings(bRes.data.data || bRes.data || []);
      setGroups(gRes.data.data || gRes.data || []);
      setCategories(cRes.data.data || cRes.data || []);
      setDistricts(dRes.data.data || dRes.data || []);
      setVillages(vRes.data.data || vRes.data || []);
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
  const filtered = buildings.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.nama?.toLowerCase().includes(q) || b.alamat?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "semua" || b.status === filterStatus;
    const matchGroup = filterGroup === "semua" || String(b.group_id) === String(filterGroup);
    return matchSearch && matchStatus && matchGroup;
  });

  useEffect(() => { setPage(1); }, [search, filterStatus, filterGroup]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Stats
  const total = buildings.length;
  const aktif = buildings.filter((b) => b.status === "aktif").length;
  const nonaktif = buildings.filter((b) => b.status === "nonaktif").length;
  const uniqueCategories = [...new Set(buildings.map((b) => b.category_id))].length;

  const stats = [
    { icon: "fa-solid fa-city",         label: "Total Bangunan",  num: total,           color: "var(--teal-600)", bg: "var(--teal-50)" },
    { icon: "fa-solid fa-circle-check", label: "Aktif",           num: aktif,           color: "#15803d",         bg: "#f0fdf4" },
    { icon: "fa-solid fa-circle-xmark", label: "Nonaktif",        num: nonaktif,        color: "#b91c1c",         bg: "#fef2f2" },
    { icon: "fa-solid fa-layer-group",  label: "Kategori Terdata",num: uniqueCategories,color: "#7c3aed",         bg: "#f5f3ff" },
  ];

  // ── Modal ──
  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErr({});
    setPreviewUrl(null);
    setCurrentStep(1);
    setModalOpen(true);
  };


  const openEdit = (b) => {
    const baseUrl = import.meta.env.VITE_APP_URL || "http://localhost:8000";
    setEditTarget(b);
    const cat = categories.find((c) => c.id == b.category_id);
    setForm({
      group_id: cat?.group_id || "",        // hanya untuk UI
      category_id: b.category_id || "",
      kecamatan_id: b.kecamatan_id || "",
      desa_id: b.desa_id || "",
      nama: b.nama || "",
      // slug tidak dimasukkan ke form — backend re-generate saat update
      alamat: b.alamat || "",
      deskripsi: b.deskripsi || "",
      kontak: b.kontak || "",
      website: b.website || "",
      status: b.status || "aktif",
      thumbnail: null,                       // file baru (opsional saat edit)
      latitude:  b.marker?.lat ?? b.latitude  ?? -7.4478,
      longitude: b.marker?.lng ?? b.longitude ?? 109.3444,
      metadata: (() => {
        try { return typeof b.metadata === "string" ? JSON.parse(b.metadata) : (b.metadata || {}); }
        catch { return {}; }
      })(),
    });
    setFormErr({});
    // thumbnail dari backend: path storage (mis. "buildings/xxx.jpg") → full URL via storage
    const thumbPath = b.thumbnail;
    setPreviewUrl(
      thumbPath
        ? (thumbPath.startsWith("http") ? thumbPath : `${baseUrl}/storage/${thumbPath}`)
        : null
    );
    setCurrentStep(1);
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditTarget(null); setPreviewUrl(null); };

  // ── Step validation ──
  const validateStep = (step) => {
    const err = {};
    if (step === 1) {
      if (!form.group_id)      err.group_id      = "Pilih kelompok bangunan.";
      if (!form.category_id)   err.category_id   = "Pilih kategori bangunan.";
      if (!form.kecamatan_id)  err.kecamatan_id  = "Pilih kecamatan.";
    }
    if (step === 2) {
      if (!form.nama.trim()) err.nama = "Nama bangunan wajib diisi.";
    }
    return err;
  };

  const handleNext = () => {
    const err = validateStep(currentStep);
    if (Object.keys(err).length) { setFormErr(err); return; }
    setFormErr({});
    setCurrentStep((s) => s + 1);
  };

  const handlePrev = () => setCurrentStep((s) => s - 1);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();

      // Field yang TIDAK dikirim ke backend:
      // - group_id  → hanya untuk UI filter kategori, tidak ada di tabel buildings
      // - slug      → di-generate backend via Str::slug($request->nama)
      // - metadata  → dikirim sebagai JSON string (json_decode di controller)
      // - thumbnail → dikirim sebagai File object jika ada gambar baru
      // - latitude/longitude → dikirim terpisah untuk tabel map_markers
      const { group_id, thumbnail, metadata, latitude, longitude, ...textFields } = form;

      // Append semua field teks biasa
      Object.entries(textFields).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") fd.append(k, v);
      });

      // Append thumbnail hanya jika ada file baru dipilih
      if (thumbnail) fd.append("thumbnail", thumbnail);

      // Metadata dikirim sebagai JSON string → backend: json_decode($request->metadata, true)
      fd.append("metadata", JSON.stringify(metadata));

      // Koordinat untuk tabel map_markers
      fd.append("latitude", latitude);
      fd.append("longitude", longitude);

      if (editTarget) {
        // Laravel method spoofing untuk PUT via POST (FormData tidak support PUT native)
        fd.append("_method", "PUT");
        await api.post(`/super-admin/buildings/${editTarget.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast(`Bangunan "${form.nama}" berhasil diperbarui.`);
      } else {
        // Controller store() hanya return { message }, bukan data building
        // Jadi kita refetch semua data agar tabel terupdate dengan benar (termasuk slug, path thumbnail)
        await api.post("/super-admin/buildings", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast(`Bangunan "${form.nama}" berhasil ditambahkan.`);
      }

      closeModal();
      // Refetch untuk mendapatkan data terbaru dari backend (slug, thumbnail path, marker, dll.)
      await fetchAll();

    } catch (e) {
      const errMsg = e.response?.data?.message || e.response?.data?.errors
        ? Object.values(e.response.data.errors || {}).flat().join(", ")
        : "Gagal menyimpan data.";
      showToast(errMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const b = confirmDel; setConfirmDel(null);
    try {
      await api.delete(`/super-admin/buildings/${b.id}`);
      setBuildings((prev) => prev.filter((x) => x.id !== b.id));
      showToast(`Bangunan "${b.nama}" berhasil dihapus.`);
    } catch {
      showToast("Gagal menghapus data.", "error");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/super-admin/buildings/${id}/status`, { status: newStatus });
      setBuildings((prev) => prev.map((b) => b.id === id ? { ...b, status: newStatus } : b));
      showToast("Status berhasil diperbarui.");
    } catch {
      showToast("Gagal mengubah status.", "error");
    }
  };

  // Helpers
  const getCategoryName = (id) => categories.find((c) => c.id == id)?.nama || "—";
  const getGroupName = (id) => groups.find((g) => g.id == id)?.nama || "—";
  const getDistrictName = (id) => districts.find((d) => d.id == id)?.nama_kecamatan || districts.find((d) => d.id == id)?.nama || "—";
  const getVillageName = (id) => villages.find((v) => v.id == id)?.nama_desa || villages.find((v) => v.id == id)?.nama || "—";

  // Konversi path thumbnail dari backend (mis. "buildings/xxx.jpg") ke full URL
  // Controller menyimpan via store('buildings', 'public') → path: "buildings/xxx.jpg"
  const getThumbUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const baseUrl = import.meta.env.VITE_APP_URL || "http://localhost:8000";
    return `${baseUrl}/storage/${path}`;
  };

  // Label status untuk display di tabel
  const statusLabel = (s) => s === "aktif" ? "Aktif" : "Nonaktif";
  const statusClass = (s) => s === "aktif" ? "aktif" : "nonaktif";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SuperAdminLayout>
      <style>{css}</style>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet" />
      <div className="kb-page">

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "var(--teal-600)", display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <i className="fa-solid fa-city" /> Super Admin — Konten Portal
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "var(--dark)" }}>
            Kelola Bangunan
          </div>
        </div>

        {/* Stats */}
        <div className="kb-stats">
          {stats.map((s, i) => (
            <div className="kb-stat" key={i}>
              <div className="kb-stat__icon" style={{ background: s.bg, color: s.color }}>
                <i className={s.icon} />
              </div>
              <div>
                <div className="kb-stat__num">{s.num}</div>
                <div className="kb-stat__label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="kb-toolbar">
          <div className="kb-search-wrap">
            <i className="fa-solid fa-magnifying-glass kb-search-icon" />
            <input className="kb-search-input" type="text" placeholder="Cari nama, alamat bangunan..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="kb-filter-tabs">
            <button className={`kb-filter-tab${filterStatus === "semua" ? " aktif" : ""}`} onClick={() => setFilterStatus("semua")}>Semua</button>
            <button className={`kb-filter-tab${filterStatus === "aktif" ? " aktif" : ""}`} onClick={() => setFilterStatus("aktif")}>Aktif</button>
            <button className={`kb-filter-tab${filterStatus === "nonaktif" ? " aktif" : ""}`} onClick={() => setFilterStatus("nonaktif")}>Nonaktif</button>
            {groups.map((g) => (
              <button key={g.id} className={`kb-filter-tab${filterGroup == g.id ? " aktif" : ""}`} onClick={() => setFilterGroup(filterGroup == g.id ? "semua" : g.id)}>
                {g.nama}
              </button>
            ))}
          </div>
          <button className="kb-add-btn" onClick={openAdd}>
            <i className="fa-solid fa-plus" /> Tambah Bangunan
          </button>
        </div>

        {/* Table */}
        <div className="kb-table-card">
          <div className="kb-table-head">
            <div className="kb-table-head-title">
              <i className="fa-solid fa-table-list" /> Daftar Bangunan
              <span className="kb-count-badge">{filtered.length}</span>
            </div>
          </div>

          {loading ? (
            <div className="kb-table-wrap">
              <table className="kb-table">
                <thead>
                  <tr>{["ID","Foto","Nama","Grup/Kategori","Lokasi","Koordinat","Kontak","Status","Aksi"].map((h) => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody className="kb-skel">
                  {[...Array(5)].map((_, i) => (
                    <tr key={i}>{[...Array(9)].map((_, j) => <td key={j}><div className="kb-skel-bar" style={{ width: "75%" }} /></td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : filtered.length === 0 ? (
            <div className="kb-empty">
              <i className="fa-solid fa-building-circle-exclamation" />
              <p>Tidak ada data bangunan{search ? ` untuk "${search}"` : ""}.</p>
            </div>
          ) : (
            <div className="kb-table-wrap">
              <table className="kb-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Foto</th>
                    <th>Nama Bangunan</th>
                    <th>Grup / Kategori</th>
                    <th>Lokasi</th>
                    <th>Deskripsi</th>
                    <th>Koordinat</th>
                    <th>Kontak</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((b) => (
                    <tr key={b.id}>
                      <td><span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", fontFamily: "monospace" }}>#{b.id}</span></td>
                      <td>
                        {/* thumbnail disimpan backend sebagai path storage, konversi ke full URL */}
                        {getThumbUrl(b.thumbnail)
                          ? <img src={getThumbUrl(b.thumbnail)} alt={b.nama} className="kb-thumb" />
                          : <div className="kb-thumb-placeholder"><i className="fa-solid fa-building" /></div>
                        }
                      </td>
                      <td style={{ fontWeight: 700, minWidth: 160 }}>
                        {b.nama}
                        {/* slug di-generate backend, tampilkan jika ada */}
                        {b.slug && <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-muted)", marginTop: 2 }}>/b/{b.slug}</div>}
                      </td>
                      <td style={{ minWidth: 140 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <span className="kb-badge kb-badge--group">
                            <i className="fa-solid fa-layer-group" style={{ fontSize: 9 }} />
                            {getGroupName(categories.find((c) => c.id == b.category_id)?.group_id)}
                          </span>
                          <span className="kb-badge kb-badge--category">
                            <i className="fa-solid fa-tag" style={{ fontSize: 9 }} />
                            {getCategoryName(b.category_id)}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12.5, color: "var(--text-muted)", minWidth: 130 }}>
                        <div>{getDistrictName(b.kecamatan_id)}</div>
                        {b.desa_id && <div style={{ fontSize: 11 }}>{getVillageName(b.desa_id)}</div>}
                      </td>
                      <td><DescCell text={b.deskripsi} /></td>
                      <td>
                        {(b.marker?.lat || b.latitude) ? (
                          <div className="kb-coords">
                            {Number(b.marker?.lat || b.latitude).toFixed(5)}<br />
                            {Number(b.marker?.lng || b.longitude).toFixed(5)}
                          </div>
                        ) : <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: 12 }}>—</span>}
                      </td>
                      <td style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{b.kontak || "—"}</td>
                      <td>
                        <select
                          className={`kb-status-select ${statusClass(b.status)}`}
                          value={b.status || "aktif"}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                        >
                          {STATUS_LIST.map((s) => (
                            <option key={s} value={s}>
                              {s === "aktif" ? "Aktif" : "Nonaktif"}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="kb-actions">
                          <button className="kb-act-btn kb-act-btn--edit" onClick={() => openEdit(b)}>
                            <i className="fa-solid fa-pen-to-square" /> Edit
                          </button>
                          <button className="kb-act-btn kb-act-btn--del" onClick={() => setConfirmDel(b)}>
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
            <div className="kb-pagination">
              <div className="kb-page-info">Menampilkan {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} dari {filtered.length}</div>
              <div className="kb-page-btns">
                <button className="kb-page-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 1}><i className="fa-solid fa-chevron-left" style={{ fontSize: 11 }} /></button>
                {[...Array(totalPages)].map((_, i) => <button key={i} className={`kb-page-btn${page === i + 1 ? " aktif" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>)}
                <button className="kb-page-btn" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}><i className="fa-solid fa-chevron-right" style={{ fontSize: 11 }} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════ MODAL STEP-BY-STEP ══════ */}
      {modalOpen && (
        <div className="kb-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="kb-modal">
            {/* Header */}
            <div className="kb-modal-header">
              <div className="kb-modal-header-left">
                <div className="kb-modal-header-icon">
                  <i className={`fa-solid ${editTarget ? "fa-pen-to-square" : "fa-city"}`} />
                </div>
                <div>
                  <div className="kb-modal-title">{editTarget ? "Edit Bangunan" : "Tambah Bangunan Baru"}</div>
                  <div className="kb-modal-sub">
                    Tahap {currentStep} dari {TOTAL_STEPS} — {STEP_LABELS[currentStep - 1]}
                  </div>
                </div>
              </div>
              <button className="kb-modal-close" onClick={closeModal}><i className="fa-solid fa-xmark" /></button>
            </div>

            {/* Step Indicator */}
            <div className="kb-steps">
              {STEP_LABELS.map((label, i) => {
                const step = i + 1;
                const done   = currentStep > step;
                const aktif = currentStep === step;
                return (
                  <div className="kb-step" key={step}>
                    <div className={`kb-step__dot ${done ? "kb-step__dot--done" : aktif ? "kb-step__dot--active" : "kb-step__dot--idle"}`}>
                      {done ? <i className="fa-solid fa-check" style={{ fontSize: 10 }} /> : step}
                    </div>
                    <div className={`kb-step__label${aktif ? " aktif" : ""}`}>{label}</div>
                    {step < TOTAL_STEPS && <div className={`kb-step__line${done ? " done" : ""}`} />}
                  </div>
                );
              })}
            </div>

            {/* Body */}
            <div className="kb-modal-body">
              {currentStep === 1 && (
                <Step1
                  form={form} setForm={setForm}
                  groups={groups} categories={categories}
                  districts={districts} villages={villages}
                  formErr={formErr}
                />
              )}
              {currentStep === 2 && (
                <Step2
                  form={form} setForm={setForm}
                  formErr={formErr}
                  previewUrl={previewUrl} setPreviewUrl={setPreviewUrl}
                  fileRef={fileRef}
                />
              )}
              {currentStep === 3 && (
                <Step3
                  form={form} setForm={setForm}
                  categories={categories}
                />
              )}
              {currentStep === 4 && (
                <Step4 form={form} setForm={setForm} />
              )}
            </div>

            {/* Footer */}
            <div className="kb-modal-footer">
              <button className="kb-modal-cancel" onClick={closeModal} disabled={submitting}>Batal</button>
              <div className="kb-modal-footer-right">
                {currentStep > 1 && (
                  <button className="kb-btn-prev" onClick={handlePrev} disabled={submitting}>
                    <i className="fa-solid fa-chevron-left" style={{ fontSize: 11 }} /> Sebelumnya
                  </button>
                )}
                {currentStep < TOTAL_STEPS ? (
                  <button className="kb-btn-next" onClick={handleNext}>
                    Selanjutnya <i className="fa-solid fa-chevron-right" style={{ fontSize: 11 }} />
                  </button>
                ) : (
                  <button className="kb-btn-next" onClick={handleSubmit} disabled={submitting}>
                    {submitting
                      ? <><span className="kb-spinner" /> Menyimpan...</>
                      : <><i className={`fa-solid ${editTarget ? "fa-floppy-disk" : "fa-plus"}`} /> {editTarget ? "Simpan Perubahan" : "Tambah Bangunan"}</>
                    }
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDel && (
        <div className="kb-confirm-overlay">
          <div className="kb-confirm-box">
            <div className="kb-confirm-icon"><i className="fa-solid fa-trash" /></div>
            <div className="kb-confirm-title">Hapus Bangunan?</div>
            <div className="kb-confirm-desc">
              Bangunan <strong>{confirmDel.nama}</strong> beserta data marker peta dan metadata terkait akan dihapus secara permanen.
            </div>
            <div className="kb-confirm-btns">
              <button className="kb-confirm-btn kb-confirm-btn--cancel" onClick={() => setConfirmDel(null)}>Batal</button>
              <button className="kb-confirm-btn kb-confirm-btn--del" onClick={handleDelete}>
                <i className="fa-solid fa-trash" style={{ marginRight: 6 }} />Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`kb-toast kb-toast--${toast.type}`}>
          <i className={`fa-solid ${toast.type === "success" ? "fa-circle-check" : "fa-triangle-exclamation"}`} />
          {toast.msg}
        </div>
      )}
    </SuperAdminLayout>
  );
}