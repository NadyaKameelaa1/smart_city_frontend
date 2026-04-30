import { useState, useEffect, useRef } from "react";
import SuperAdminLayout from "./SuperAdminLayout";
import api from "../../api/axios";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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
  .cc-page { animation: ccFadeUp .4s ease both; }
  @keyframes ccFadeUp { from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)} }

  /* Stats */
  .cc-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 28px; }
  .cc-stat {
    background: white; border-radius: 16px; border: 1px solid var(--border);
    padding: 18px 20px; box-shadow: var(--shadow-sm);
    display: flex; align-items: center; gap: 14px; transition: var(--transition);
  }
  .cc-stat:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
  .cc-stat__icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .cc-stat__num { font-family: var(--font-display); font-size: 26px; font-weight: 700; color: var(--dark); line-height: 1; }
  .cc-stat__label { font-size: 12px; color: var(--text-muted); margin-top: 3px; }

  /* Toolbar */
  .cc-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
  .cc-search-wrap { position: relative; flex: 1; max-width: 340px; }
  .cc-search-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--teal-400); font-size: 13px; pointer-events: none; }
  .cc-search-input {
    width: 100%; padding: 10px 16px 10px 38px; border-radius: 50px; border: 1.5px solid var(--border);
    background: white; font-family: var(--font-body); font-size: 13.5px; color: var(--dark); outline: none; transition: var(--transition);
  }
  .cc-search-input:focus { border-color: var(--teal-500); box-shadow: 0 0 0 3px rgba(64,114,175,.1); }
  .cc-search-input::placeholder { color: var(--text-muted); }

  .cc-filter-tabs { display: flex; gap: 6px; }
  .cc-filter-tab {
    padding: 7px 16px; border-radius: 50px; border: 1.5px solid var(--border); background: white;
    font-family: var(--font-body); font-size: 12.5px; font-weight: 500; color: var(--text-muted); cursor: pointer; transition: var(--transition);
  }
  .cc-filter-tab:hover { border-color: var(--teal-400); color: var(--teal-700); }
  .cc-filter-tab.active { border-color: var(--teal-600); background: var(--teal-600); color: white; font-weight: 600; }

  .cc-add-btn {
    display: inline-flex; align-items: center; gap: 8px; padding: 9px 20px; border-radius: 50px;
    background: var(--teal-600); color: white; border: none; font-family: var(--font-body);
    font-size: 13.5px; font-weight: 600; cursor: pointer; transition: var(--transition); white-space: nowrap;
    box-shadow: 0 4px 14px rgba(64,114,175,.3);
  }
  .cc-add-btn:hover { background: var(--teal-700); transform: translateY(-2px); }

  /* Table card */
  .cc-table-card { background: white; border-radius: 20px; border: 1px solid var(--border); box-shadow: var(--shadow-sm); overflow: hidden; }
  .cc-table-head {
    padding: 18px 24px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  .cc-table-head-title { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--dark); display: flex; align-items: center; gap: 9px; }
  .cc-table-head-title i { color: var(--teal-500); font-size: 15px; }
  .cc-count-badge { background: var(--teal-50); color: var(--teal-700); padding: 3px 10px; border-radius: 50px; font-size: 12px; font-weight: 700; }

  .cc-table-wrap { overflow-x: auto; }
  table.cc-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 900px; }
  .cc-table thead tr { background: var(--teal-50); }
  .cc-table th {
    padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700;
    letter-spacing: 1px; text-transform: uppercase; color: var(--teal-700);
    border-bottom: 1px solid var(--border); white-space: nowrap;
  }
  .cc-table td { padding: 14px 16px; border-bottom: 1px solid var(--teal-50); color: var(--text-dark); vertical-align: middle; }
  .cc-table tbody tr { transition: background .15s; }
  .cc-table tbody tr:hover { background: var(--cream); }
  .cc-table tbody tr:last-child td { border-bottom: none; }

  /* Stream Preview cell */
  .cc-stream-cell { display: flex; align-items: center; gap: 12px; }
  .cc-stream-thumb {
    width: 140px; height: 80px; border-radius: 10px; overflow: hidden;
    border: 1.5px solid var(--border); flex-shrink: 0; background: #0f172a;
    position: relative; cursor: pointer;
  }
  .cc-stream-thumb iframe {
    width: 100%; height: 100%; border: none; pointer-events: none;
    transform: scale(1); transform-origin: top left;
  }
  .cc-stream-thumb-placeholder {
    width: 140px; height: 80px; border-radius: 10px; flex-shrink: 0;
    background: #0f172a; border: 1.5px solid var(--border);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 5px; color: #475569;
  }
  .cc-stream-thumb-placeholder i { font-size: 20px; }
  .cc-stream-thumb-placeholder span { font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
  .cc-stream-url-text {
    font-size: 12px; color: var(--text-muted); font-family: monospace;
    max-width: 180px; word-break: break-all; line-height: 1.5;
  }
  .cc-stream-url-copy {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 11px; color: var(--teal-600); font-weight: 600;
    cursor: pointer; background: none; border: none;
    font-family: var(--font-body); padding: 2px 0; margin-top: 4px;
  }
  .cc-stream-url-copy:hover { color: var(--teal-800); }

  /* Status badge */
  .cc-status-select {
    padding: 4px 10px; border-radius: 50px; border: 1.5px solid;
    font-size: 11.5px; font-weight: 700; font-family: var(--font-body);
    cursor: pointer; outline: none; transition: var(--transition); appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 8px center; padding-right: 24px;
  }
  .cc-status-select.online  { background-color: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
  .cc-status-select.offline { background-color: #fef2f2; color: #b91c1c; border-color: #fecaca; }

  /* Live dot */
  .cc-live-dot {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
  }
  .cc-live-dot::before {
    content: ''; width: 7px; height: 7px; border-radius: 50%;
    background: #22c55e; display: inline-block;
    animation: ccPulse 1.5s ease infinite;
  }
  @keyframes ccPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.3)} }
  .cc-live-dot.offline::before { background: #ef4444; animation: none; }

  /* Actions */
  .cc-actions { display: flex; gap: 7px; }
  .cc-act-btn {
    display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 8px;
    font-size: 12px; font-weight: 600; cursor: pointer; border: none;
    font-family: var(--font-body); transition: var(--transition); white-space: nowrap;
  }
  .cc-act-btn--edit { background: var(--teal-50); color: var(--teal-700); border: 1.5px solid var(--teal-100); }
  .cc-act-btn--edit:hover { background: var(--teal-600); color: white; border-color: var(--teal-600); }
  .cc-act-btn--preview { background: #1e1b4b; color: #a5b4fc; border: 1.5px solid #312e81; }
  .cc-act-btn--preview:hover { background: #312e81; color: white; }
  .cc-act-btn--del { background: #fef2f2; color: #b91c1c; border: 1.5px solid #fecaca; }
  .cc-act-btn--del:hover { background: #b91c1c; color: white; border-color: #b91c1c; }

  /* Pagination */
  .cc-pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 12px;
  }
  .cc-page-info { font-size: 13px; color: var(--text-muted); }
  .cc-page-btns { display: flex; gap: 5px; }
  .cc-page-btn {
    width: 34px; height: 34px; border-radius: 8px; border: 1.5px solid var(--border); background: white;
    font-size: 13px; font-weight: 600; color: var(--text-dark); cursor: pointer;
    display: flex; align-items: center; justify-content: center; transition: var(--transition); font-family: var(--font-body);
  }
  .cc-page-btn:hover { border-color: var(--teal-400); color: var(--teal-700); }
  .cc-page-btn.active { background: var(--teal-600); border-color: var(--teal-600); color: white; }
  .cc-page-btn:disabled { opacity: .35; cursor: not-allowed; }

  /* Empty / Skeleton */
  .cc-empty { text-align: center; padding: 64px 0; display: flex; flex-direction: column; align-items: center; gap: 14px; }
  .cc-empty i { font-size: 44px; color: var(--teal-200); }
  .cc-empty p { font-size: 14px; color: var(--text-muted); }
  .cc-skel { animation: ccSkel 1.3s ease infinite; }
  @keyframes ccSkel { 0%,100%{opacity:1}50%{opacity:.4} }
  .cc-skel-bar { height: 14px; border-radius: 7px; background: var(--teal-100); }

  /* ══════ MODAL ══════ */
  .cc-modal-overlay {
    position: fixed; inset: 0; z-index: 5000;
    background: rgba(10,29,61,.65); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
    animation: ccFadeIn .2s ease;
  }
  @keyframes ccFadeIn { from{opacity:0}to{opacity:1} }
  .cc-modal {
    background: white; border-radius: 24px; width: 100%; max-width: 640px;
    box-shadow: 0 30px 80px rgba(0,0,0,.22);
    animation: ccScaleIn .25s ease; display: flex; flex-direction: column; max-height: 93vh;
  }
  @keyframes ccScaleIn { from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)} }

  .cc-modal-header {
    padding: 22px 28px 18px; border-bottom: 1px solid var(--border);
    display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; flex-shrink: 0;
  }
  .cc-modal-header-left { display: flex; align-items: center; gap: 14px; }
  .cc-modal-header-icon {
    width: 48px; height: 48px; border-radius: 14px; background: #1e1b4b; color: #a5b4fc;
    display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;
  }
  .cc-modal-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--dark); margin-bottom: 3px; }
  .cc-modal-sub { font-size: 13px; color: var(--text-muted); }
  .cc-modal-close {
    width: 34px; height: 34px; border-radius: 50%; background: var(--teal-50); border: 1.5px solid var(--border);
    color: var(--text-muted); font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: var(--transition); flex-shrink: 0;
  }
  .cc-modal-close:hover { background: #fef2f2; border-color: #fecaca; color: #b91c1c; transform: rotate(90deg); }

  .cc-modal-body {
    padding: 22px 28px; display: flex; flex-direction: column; gap: 16px;
    overflow-y: auto; flex: 1;
  }
  .cc-modal-body::-webkit-scrollbar { width: 4px; }
  .cc-modal-body::-webkit-scrollbar-thumb { background: var(--teal-200); border-radius: 2px; }

  /* Form */
  .cc-field { display: flex; flex-direction: column; gap: 6px; }
  .cc-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .cc-label { font-size: 12.5px; font-weight: 700; color: var(--text-dark); display: flex; align-items: center; gap: 5px; }
  .cc-label i { color: var(--teal-500); font-size: 11px; }
  .cc-required { color: #e11d48; font-size: 13px; }
  .cc-input, .cc-select {
    width: 100%; padding: 10px 14px; border-radius: 10px; border: 1.5px solid var(--border);
    background: white; font-family: var(--font-body); font-size: 13.5px; color: var(--dark); outline: none; transition: var(--transition);
  }
  .cc-input:focus, .cc-select:focus { border-color: var(--teal-500); box-shadow: 0 0 0 3px rgba(64,114,175,.1); }
  .cc-input::placeholder { color: var(--text-muted); }
  .cc-input.error, .cc-select.error { border-color: #f87171; }
  .cc-error-msg { font-size: 12px; color: #e11d48; display: flex; align-items: center; gap: 5px; }

  .cc-section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    color: var(--teal-600); display: flex; align-items: center; gap: 8px;
  }
  .cc-section-label::after { content: ''; flex: 1; height: 1px; background: var(--teal-100); }

  /* Stream preview di modal */
  .cc-stream-preview-box {
    background: #0f172a; border-radius: 12px; overflow: hidden;
    border: 1.5px solid #1e293b; aspect-ratio: 16/9; position: relative;
    display: flex; align-items: center; justify-content: center;
  }
  .cc-stream-preview-box iframe { width: 100%; height: 100%; border: none; }
  .cc-stream-preview-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 10px; color: #475569; text-align: center;
  }
  .cc-stream-preview-empty i { font-size: 36px; }
  .cc-stream-preview-empty p { font-size: 13px; line-height: 1.5; }
  .cc-url-hint {
    background: #f8fafc; border: 1px solid var(--border); border-radius: 10px;
    padding: 10px 14px; font-size: 12px; color: var(--text-muted); line-height: 1.6;
    display: flex; gap: 8px;
  }
  .cc-url-hint i { color: var(--teal-500); flex-shrink: 0; margin-top: 1px; }

  /* Map di modal */
  .cc-map-wrap { border-radius: 12px; overflow: hidden; border: 1.5px solid var(--border); height: 220px; }
  .cc-coord-row { display: flex; gap: 10px; margin-top: 8px; }
  .cc-coord-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--teal-50); border: 1px solid var(--teal-100);
    padding: 5px 12px; border-radius: 8px; font-family: monospace; font-size: 12px; color: var(--teal-700);
  }

  /* Modal footer */
  .cc-modal-footer {
    padding: 18px 28px; border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: flex-end; gap: 10px; flex-shrink: 0;
  }
  .cc-modal-cancel {
    padding: 10px 22px; border-radius: 50px; border: 1.5px solid var(--border); background: white;
    font-family: var(--font-body); font-size: 13.5px; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: var(--transition);
  }
  .cc-modal-cancel:hover { background: var(--cream); border-color: var(--teal-200); }
  .cc-modal-submit {
    padding: 10px 26px; border-radius: 50px; background: var(--teal-600); color: white; border: none;
    font-family: var(--font-body); font-size: 13.5px; font-weight: 700; cursor: pointer; transition: var(--transition);
    display: flex; align-items: center; gap: 7px; box-shadow: 0 4px 14px rgba(64,114,175,.3);
  }
  .cc-modal-submit:hover { background: var(--teal-700); transform: translateY(-1px); }
  .cc-modal-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }

  /* ══════ PREVIEW FULLSCREEN MODAL ══════ */
  .cc-preview-overlay {
    position: fixed; inset: 0; z-index: 7000;
    background: rgba(0,0,0,.92); backdrop-filter: blur(8px);
    display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px;
    animation: ccFadeIn .2s ease;
  }
  .cc-preview-header {
    width: 100%; max-width: 900px; display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 14px;
  }
  .cc-preview-title { color: white; font-family: var(--font-display); font-size: 18px; font-weight: 700; display: flex; align-items: center; gap: 10px; }
  .cc-preview-close {
    width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,.1); border: 1.5px solid rgba(255,255,255,.2);
    color: white; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: var(--transition);
  }
  .cc-preview-close:hover { background: rgba(239,68,68,.8); border-color: transparent; transform: rotate(90deg); }
  .cc-preview-frame-wrap {
    width: 100%; max-width: 900px; aspect-ratio: 16/9;
    background: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,.1);
  }
  .cc-preview-frame-wrap iframe { width: 100%; height: 100%; border: none; }
  .cc-preview-no-stream {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 100%; gap: 12px; color: #64748b;
  }
  .cc-preview-no-stream i { font-size: 48px; }
  .cc-preview-no-stream p { font-size: 14px; }
  .cc-preview-meta {
    margin-top: 14px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap;
  }
  .cc-preview-meta-item { display: flex; align-items: center; gap: 7px; color: #94a3b8; font-size: 13px; }
  .cc-preview-meta-item i { color: #64748b; font-size: 12px; }

  /* Confirm */
  .cc-confirm-overlay {
    position: fixed; inset: 0; z-index: 6000; background: rgba(10,29,61,.7); backdrop-filter: blur(5px);
    display: flex; align-items: center; justify-content: center; padding: 24px; animation: ccFadeIn .2s ease;
  }
  .cc-confirm-box {
    background: white; border-radius: 20px; padding: 32px 28px; max-width: 380px; width: 100%;
    box-shadow: 0 24px 60px rgba(0,0,0,.22); animation: ccScaleIn .25s ease;
  }
  .cc-confirm-icon { width: 52px; height: 52px; border-radius: 14px; background: #fef2f2; color: #b91c1c; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 16px; }
  .cc-confirm-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--dark); margin-bottom: 10px; }
  .cc-confirm-desc { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px; }
  .cc-confirm-btns { display: flex; gap: 10px; }
  .cc-confirm-btn { flex: 1; padding: 11px; border-radius: 10px; font-size: 14px; font-weight: 600; font-family: var(--font-body); cursor: pointer; transition: var(--transition); border: none; }
  .cc-confirm-btn--cancel { background: var(--teal-50); color: var(--text-muted); border: 1.5px solid var(--border); }
  .cc-confirm-btn--cancel:hover { background: var(--teal-100); }
  .cc-confirm-btn--del { background: #b91c1c; color: white; }
  .cc-confirm-btn--del:hover { background: #991b1b; }

  /* Toast */
  .cc-toast {
    position: fixed; bottom: 28px; right: 28px; z-index: 9999;
    padding: 14px 20px; border-radius: 14px; font-size: 13.5px; font-weight: 500;
    display: flex; align-items: center; gap: 10px;
    box-shadow: 0 8px 30px rgba(0,0,0,.22); animation: ccSlideUp .3s ease; max-width: 340px; color: white;
  }
  @keyframes ccSlideUp { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
  .cc-toast--success { background: #15803d; }
  .cc-toast--error   { background: #b91c1c; }

  .cc-spinner {
    width: 15px; height: 15px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,.3); border-top-color: white;
    animation: ccSpin .7s linear infinite; display: inline-block;
  }
  @keyframes ccSpin { to{transform:rotate(360deg)} }

  @media (max-width: 768px) {
    .cc-stats { grid-template-columns: repeat(2,1fr); }
    .cc-field-row { grid-template-columns: 1fr; }
    .cc-toolbar { flex-direction: column; align-items: stretch; }
    .cc-search-wrap { max-width: 100%; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const PER_PAGE = 10;
const STATUS_LIST = ["online", "offline"];

const EMPTY_FORM = {
  nama: "",
  stream_url: "",
  status: "online",
  latitude: -7.4478,
  longitude: 109.3444,
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ubah berbagai format URL YouTube ke format embed yang bisa ditampilkan di iframe.
 * Mendukung: youtube.com/watch?v=, youtu.be/, youtube.com/embed/, dan RTSP (tidak di-embed).
 */
function toEmbedUrl(url) {
  if (!url) return null;
  const trimmed = url.trim();

  if (trimmed.includes("youtube.com/embed/")) {
    // Bersihkan param autoplay kalau sudah ada
    return trimmed.split("?")[0]; // ← ambil base URL saja
  }

  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`; // ← tanpa autoplay

  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`; // ← tanpa autoplay

  return null;
}

function isRtsp(url) {
  return url?.trim().toLowerCase().startsWith("rtsp://");
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Preview thumbnail kecil di tabel */
function StreamThumb({ url, onClick }) {
  const [hovered, setHovered] = useState(false);
  const embedUrl = toEmbedUrl(url);
  if (isRtsp(url)) {
    return (
      <div className="cc-stream-thumb-placeholder" onClick={onClick} style={{ cursor: "pointer" }}>
        <i className="fa-solid fa-satellite-dish" />
        <span>RTSP</span>
      </div>
    );
  }
  if (!embedUrl) {
    return (
      <div className="cc-stream-thumb-placeholder" onClick={onClick} style={{ cursor: "pointer" }}>
        <i className="fa-solid fa-video-slash" />
        <span>No URL</span>
      </div>
    );
  }
  if (!hovered) {
    return (
      <div
        className="cc-stream-thumb"
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        title="Hover untuk preview, klik untuk fullscreen"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
      >
        <i className="fa-solid fa-play" style={{ color: "#94a3b8", fontSize: 22 }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 1 }} />
      </div>
    );
  }
  return (
    <div className="cc-stream-thumb" onClick={onClick} title="Klik untuk preview fullscreen">
      <iframe
        src={embedUrl}
        allow="encrypted-media"
        allowFullScreen
        title="CCTV Stream"
      />
      {/* overlay tipis agar klik terdeteksi div, bukan iframe */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }} />
    </div>
  );
}

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) { setPosition([e.latlng.lat, e.latlng.lng]); },
  });
  return position ? <Marker position={position} /> : null;
}

function MapUpdater({ center }) {
  const map = useMap();
  const prevCenter = useRef(null);
  
  useEffect(() => {
    // Hanya update jika koordinat benar-benar berubah signifikan
    const [lat, lng] = center;
    if (
      prevCenter.current === null ||
      Math.abs(prevCenter.current[0] - lat) > 0.0001 ||
      Math.abs(prevCenter.current[1] - lng) > 0.0001
    ) {
      prevCenter.current = center;
      map.setView(center, map.getZoom(), { animate: false });
    }
  }, [center, map]);
  
  return null;
}

// Tambahkan komponen ini setelah MapUpdater
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []); // <-- [] kosong! Hanya saat mount
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function KelolaCCTV() {
  const [cctvList, setCctvList]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [page, setPage]             = useState(1);

  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formErr, setFormErr]       = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Preview fullscreen
  const [previewCctv, setPreviewCctv] = useState(null);

  const [confirmDel, setConfirmDel] = useState(null);
  const [toast, setToast]           = useState(null);

  // ── Fetch ──
  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await api.get("/super-admin/cctv");
      setCctvList(res.data.data || res.data || []);
    } catch {
      showToast("Gagal memuat data CCTV.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  // ── Filter ──
  const filtered = cctvList.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.nama?.toLowerCase().includes(q) || c.stream_url?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "semua" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  useEffect(() => { setPage(1); }, [search, filterStatus]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Stats
  const total   = cctvList.length;
  const online  = cctvList.filter((c) => c.status === "online").length;
  const offline = cctvList.filter((c) => c.status === "offline").length;
  const withStream = cctvList.filter((c) => !!c.stream_url).length;

  const stats = [
    { icon: "fa-solid fa-video",         label: "Total CCTV",      num: total,      color: "#7c3aed", bg: "#f5f3ff" },
    { icon: "fa-solid fa-circle-dot",    label: "Online",          num: online,     color: "#15803d", bg: "#f0fdf4" },
    { icon: "fa-solid fa-circle-xmark",  label: "Offline",         num: offline,    color: "#b91c1c", bg: "#fef2f2" },
    { icon: "fa-solid fa-satellite-dish",label: "Punya Stream URL",num: withStream, color: "#0369a1", bg: "#f0f9ff" },
  ];

  // ── Modal ──
  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErr({});
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditTarget(c);
    setForm({
      nama: c.nama || "",
      stream_url: c.stream_url || "",
      status: c.status || "online",
      latitude:  c.marker?.lat ?? c.latitude  ?? -7.4478,
      longitude: c.marker?.lng ?? c.longitude ?? 109.3444,
    });
    setFormErr({});
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const handleChange = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    setFormErr((e) => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const err = {};
    if (!form.nama.trim()) err.nama = "Nama CCTV wajib diisi.";
    return err;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (Object.keys(err).length) { setFormErr(err); return; }
    setSubmitting(true);
    try {
        const payload = {
            nama:       form.nama,
            stream_url: form.stream_url || '',
            status:     form.status,
            latitude:   form.latitude,
            longitude:  form.longitude,
        };

        if (editTarget) {
            const res = await api.post(`/super-admin/cctv/${editTarget.id}`, payload);
            const updated = res.data.data || { ...editTarget, ...payload, marker: { lat: payload.latitude, lng: payload.longitude } };
            setCctvList((prev) => prev.map((c) => c.id === editTarget.id ? updated : c));
            showToast(`CCTV "${form.nama}" berhasil diperbarui.`);
        } else {
            const res = await api.post('/super-admin/cctv', payload);
            const newCctv = res.data.data || res.data;
            setCctvList((prev) => [newCctv, ...prev]);
            showToast(`CCTV "${form.nama}" berhasil ditambahkan.`);
        }
        closeModal();
    } catch (e) {
        showToast(e.response?.data?.message || 'Gagal menyimpan data.', 'error');
    } finally {
        setSubmitting(false);
    }
};

  // ── Delete ──
  const handleDelete = async () => {
      const c = confirmDel;
      setConfirmDel(null);
      try {
          await api.delete(`/super-admin/cctv/${c.id}`);
          setCctvList((prev) => prev.filter((x) => x.id !== c.id));
          showToast(`CCTV "${c.nama}" berhasil dihapus.`);
      } catch {
          showToast('Gagal menghapus data.', 'error');
      }
  };

  const handleStatusChange = async (id, newStatus) => {
      setCctvList((prev) => prev.map((c) => c.id === id ? { ...c, status: newStatus } : c));
      try {
          await api.patch(`/super-admin/cctv/${id}/status`, { status: newStatus });
          showToast('Status berhasil diperbarui.');
      } catch {
          setCctvList((prev) => prev.map((c) => c.id === id ? { ...c, status: c.status === 'online' ? 'offline' : 'online' } : c));
          showToast('Gagal mengubah status.', 'error');
      }
  };

  // ── Copy URL ──
  const copyUrl = (url) => {
    navigator.clipboard.writeText(url).then(() => showToast("URL berhasil disalin!")).catch(() => {});
  };

  // ── Preview embed URL (live di modal) ──
  const liveEmbedUrl = toEmbedUrl(form.stream_url);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SuperAdminLayout>
      <style>{css}</style>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet" />

      <div className="cc-page">

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "var(--teal-600)", display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <i className="fa-solid fa-video" /> Super Admin — Infrastruktur
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "var(--dark)" }}>
            Kelola CCTV
          </div>
        </div>

        {/* Stats */}
        <div className="cc-stats">
          {stats.map((s, i) => (
            <div className="cc-stat" key={i}>
              <div className="cc-stat__icon" style={{ background: s.bg, color: s.color }}>
                <i className={s.icon} />
              </div>
              <div>
                <div className="cc-stat__num">{s.num}</div>
                <div className="cc-stat__label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="cc-toolbar">
          <div className="cc-search-wrap">
            <i className="fa-solid fa-magnifying-glass cc-search-icon" />
            <input className="cc-search-input" type="text" placeholder="Cari nama CCTV..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="cc-filter-tabs">
            {["semua", "online", "offline"].map((f) => (
              <button key={f} className={`cc-filter-tab${filterStatus === f ? " active" : ""}`} onClick={() => setFilterStatus(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button className="cc-add-btn" onClick={openAdd}>
            <i className="fa-solid fa-plus" /> Tambah CCTV
          </button>
        </div>

        {/* Table */}
        <div className="cc-table-card">
          <div className="cc-table-head">
            <div className="cc-table-head-title">
              <i className="fa-solid fa-table-list" /> Daftar Kamera CCTV
              <span className="cc-count-badge">{filtered.length}</span>
            </div>
          </div>

          {loading ? (
            <div className="cc-table-wrap">
              <table className="cc-table">
                <thead><tr>{["ID","Stream / URL","Nama","Koordinat","Status","Aksi"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
                <tbody className="cc-skel">
                  {[...Array(5)].map((_, i) => (
                    <tr key={i}>{[...Array(6)].map((_, j) => <td key={j}><div className="cc-skel-bar" style={{ width: "75%" }} /></td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : filtered.length === 0 ? (
            <div className="cc-empty">
              <i className="fa-solid fa-video-slash" />
              <p>Tidak ada data CCTV{search ? ` untuk "${search}"` : ""}.</p>
            </div>
          ) : (
            <div className="cc-table-wrap">
              <table className="cc-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Stream Video</th>
                    <th>Nama CCTV</th>
                    <th>Koordinat</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", fontFamily: "monospace" }}>#{c.id}</span>
                      </td>
                      <td>
                        <div className="cc-stream-cell">
                          <StreamThumb url={c.stream_url} onClick={() => setPreviewCctv(c)} />
                          <div>
                            {c.stream_url ? (
                              <>
                                <div className="cc-stream-url-text">
                                  {c.stream_url.length > 50 ? c.stream_url.slice(0, 50) + "…" : c.stream_url}
                                </div>
                                <button className="cc-stream-url-copy" onClick={() => copyUrl(c.stream_url)}>
                                  <i className="fa-regular fa-copy" style={{ fontSize: 10 }} /> Salin URL
                                </button>
                              </>
                            ) : (
                              <span style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>Belum ada URL</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, minWidth: 160 }}>{c.nama}</td>
                      <td>
                        {(c.marker?.lat || c.latitude) ? (
                          <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)", background: "var(--teal-50)", padding: "4px 8px", borderRadius: 6, whiteSpace: "nowrap", lineHeight: 1.8 }}>
                            {Number(c.marker?.lat || c.latitude).toFixed(5)}<br />
                            {Number(c.marker?.lng || c.longitude).toFixed(5)}
                          </div>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td>
                        <select
                          className={`cc-status-select ${c.status === "online" ? "online" : "offline"}`}
                          value={c.status || "offline"}
                          onChange={(e) => handleStatusChange(c.id, e.target.value)}
                        >
                          {STATUS_LIST.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                      </td>
                      <td>
                        <div className="cc-actions">
                          <button className="cc-act-btn cc-act-btn--preview" onClick={() => setPreviewCctv(c)}>
                            <i className="fa-solid fa-expand" /> Preview
                          </button>
                          <button className="cc-act-btn cc-act-btn--edit" onClick={() => openEdit(c)}>
                            <i className="fa-solid fa-pen-to-square" /> Edit
                          </button>
                          <button className="cc-act-btn cc-act-btn--del" onClick={() => setConfirmDel(c)}>
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
            <div className="cc-pagination">
              <div className="cc-page-info">Menampilkan {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} dari {filtered.length}</div>
              <div className="cc-page-btns">
                <button className="cc-page-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 1}><i className="fa-solid fa-chevron-left" style={{ fontSize: 11 }} /></button>
                {[...Array(totalPages)].map((_, i) => <button key={i} className={`cc-page-btn${page === i + 1 ? " active" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>)}
                <button className="cc-page-btn" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}><i className="fa-solid fa-chevron-right" style={{ fontSize: 11 }} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════ MODAL TAMBAH / EDIT ══════ */}
      {modalOpen && (
        <div className="cc-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="cc-modal">
            <div className="cc-modal-header">
              <div className="cc-modal-header-left">
                <div className="cc-modal-header-icon"><i className={`fa-solid ${editTarget ? "fa-pen-to-square" : "fa-video"}`} /></div>
                <div>
                  <div className="cc-modal-title">{editTarget ? "Edit CCTV" : "Tambah CCTV Baru"}</div>
                  <div className="cc-modal-sub">{editTarget ? `Mengedit: ${editTarget.nama}` : "Daftarkan kamera CCTV ke sistem"}</div>
                </div>
              </div>
              <button className="cc-modal-close" onClick={closeModal}><i className="fa-solid fa-xmark" /></button>
            </div>

            <div className="cc-modal-body">

              {/* Info Dasar */}
              <div className="cc-section-label">Informasi Kamera</div>

              <div className="cc-field-row">
                <div className="cc-field">
                  <label className="cc-label"><i className="fa-solid fa-video" /> Nama CCTV <span className="cc-required">*</span></label>
                  <input
                    className={`cc-input${formErr.nama ? " error" : ""}`}
                    placeholder="Cth: Alun-alun Purbalingga"
                    value={form.nama}
                    onChange={(e) => handleChange("nama", e.target.value)}
                  />
                  {formErr.nama && <span className="cc-error-msg"><i className="fa-solid fa-circle-exclamation" />{formErr.nama}</span>}
                </div>
                <div className="cc-field">
                  <label className="cc-label"><i className="fa-solid fa-flag" /> Status</label>
                  <select className="cc-select" value={form.status} onChange={(e) => handleChange("status", e.target.value)}>
                    {STATUS_LIST.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              {/* Stream URL */}
              <div className="cc-section-label">Stream URL</div>

              <div className="cc-field">
                <label className="cc-label"><i className="fa-solid fa-satellite-dish" /> URL Stream / Embed</label>
                <input
                  className="cc-input"
                  placeholder="https://www.youtube.com/embed/... atau rtsp://..."
                  value={form.stream_url}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const embed = toEmbedUrl(raw);
                    handleChange("stream_url", embed || raw);
                  }}
                />
                {/* <div className="cc-url-hint">
                  <i className="fa-solid fa-circle-info" />
                  <div>
                    Gunakan URL <strong>YouTube Embed</strong> (<code>youtube.com/embed/ID</code>) atau URL <strong>YouTube Watch</strong> biasa (<code>youtube.com/watch?v=ID</code>). Untuk CCTV live stream, masukkan URL RTSP.
                  </div>
                </div> */}
              </div>

              {/* Live Preview */}
              {/* <div className="cc-stream-preview-box">
                {liveEmbedUrl ? (
                  <iframe
                    key={liveEmbedUrl}
                    src={liveEmbedUrl}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title="Preview Stream"
                  />
                ) : isRtsp(form.stream_url) ? (
                  <div className="cc-stream-preview-empty">
                    <i className="fa-solid fa-satellite-dish" />
                    <p>URL RTSP tidak dapat dipreview langsung di browser.<br />Akan ditampilkan via player terpisah.</p>
                  </div>
                ) : (
                  <div className="cc-stream-preview-empty">
                    <i className="fa-solid fa-video" />
                    <p>Preview stream akan muncul di sini<br />setelah kamu memasukkan URL yang valid.</p>
                  </div>
                )}
              </div> */}

              <div className="cc-section-label">Koordinat Kamera di Peta</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: -8, marginBottom: 4 }}>
                <i className="fa-solid fa-hand-pointer" style={{ color: "var(--teal-500)", marginRight: 6 }} />
                Tentukan garis bujur (lng) dan garis lintang (lat) :
              </div>

              <div className="cc-coord-row">
                <div className="cc-coord-badge"><i className="fa-solid fa-up-down" /> Lat: {form.latitude}</div>
                <div className="cc-coord-badge"><i className="fa-solid fa-left-right" /> Lng: {form.longitude}</div>
              </div>

              <div className="cc-field-row">
                <div className="cc-field">
                  <label className="cc-label"><i className="fa-solid fa-up-down" /> Latitude (manual)</label>
                  <input className="cc-input" type="number" step="0.0000001" value={form.latitude} onChange={(e) => handleChange("latitude", parseFloat(e.target.value))} />
                </div>
                <div className="cc-field">
                  <label className="cc-label"><i className="fa-solid fa-left-right" /> Longitude (manual)</label>
                  <input className="cc-input" type="number" step="0.0000001" value={form.longitude} onChange={(e) => handleChange("longitude", parseFloat(e.target.value))} />
                </div>
              </div>

            </div>

            <div className="cc-modal-footer">
              <button className="cc-modal-cancel" onClick={closeModal} disabled={submitting}>Batal</button>
              <button className="cc-modal-submit" onClick={handleSubmit} disabled={submitting}>
                {submitting
                  ? <><span className="cc-spinner" /> Menyimpan...</>
                  : <><i className={`fa-solid ${editTarget ? "fa-floppy-disk" : "fa-plus"}`} /> {editTarget ? "Simpan Perubahan" : "Tambah CCTV"}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ FULLSCREEN PREVIEW MODAL ══════ */}
      {previewCctv && (
        <div className="cc-preview-overlay" onClick={(e) => e.target === e.currentTarget && setPreviewCctv(null)}>
          <div className="cc-preview-header">
            <div className="cc-preview-title">
              <i className="fa-solid fa-video" style={{ color: "#a5b4fc" }} />
              {previewCctv.nama}
              <span className={`cc-live-dot${previewCctv.status === "offline" ? " offline" : ""}`}>
                {previewCctv.status === "online" ? "Live" : "Offline"}
              </span>
            </div>
            <button className="cc-preview-close" onClick={() => setPreviewCctv(null)}>
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          <div className="cc-preview-frame-wrap">
            {toEmbedUrl(previewCctv.stream_url) ? (
              <iframe
                src={toEmbedUrl(previewCctv.stream_url)}
                allow="autoplay; encrypted-media"
                allowFullScreen
                title={previewCctv.nama}
              />
            ) : isRtsp(previewCctv.stream_url) ? (
              <div className="cc-preview-no-stream">
                <i className="fa-solid fa-satellite-dish" style={{ color: "#7c3aed" }} />
                <p style={{ color: "#94a3b8" }}>Stream RTSP tidak dapat diputar langsung di browser.</p>
                <code style={{ background: "rgba(255,255,255,.05)", padding: "6px 12px", borderRadius: 8, fontSize: 12, color: "#a5b4fc" }}>
                  {previewCctv.stream_url}
                </code>
              </div>
            ) : (
              <div className="cc-preview-no-stream">
                <i className="fa-solid fa-video-slash" />
                <p style={{ color: "#94a3b8" }}>Tidak ada URL stream untuk kamera ini.</p>
              </div>
            )}
          </div>

          <div className="cc-preview-meta">
            {previewCctv.stream_url && (
              <div className="cc-preview-meta-item">
                <i className="fa-solid fa-satellite-dish" />
                <code style={{ fontSize: 12, color: "#94a3b8", maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {previewCctv.stream_url}
                </code>
              </div>
            )}
            {(previewCctv.marker?.lat || previewCctv.latitude) && (
              <div className="cc-preview-meta-item">
                <i className="fa-solid fa-location-dot" />
                <span>{Number(previewCctv.marker?.lat || previewCctv.latitude).toFixed(5)}, {Number(previewCctv.marker?.lng || previewCctv.longitude).toFixed(5)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDel && (
        <div className="cc-confirm-overlay">
          <div className="cc-confirm-box">
            <div className="cc-confirm-icon"><i className="fa-solid fa-trash" /></div>
            <div className="cc-confirm-title">Hapus CCTV?</div>
            <div className="cc-confirm-desc">
              CCTV <strong>{confirmDel.nama}</strong> beserta data marker peta terkait akan dihapus secara permanen.
            </div>
            <div className="cc-confirm-btns">
              <button className="cc-confirm-btn cc-confirm-btn--cancel" onClick={() => setConfirmDel(null)}>Batal</button>
              <button className="cc-confirm-btn cc-confirm-btn--del" onClick={handleDelete}>
                <i className="fa-solid fa-trash" style={{ marginRight: 6 }} />Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`cc-toast cc-toast--${toast.type}`}>
          <i className={`fa-solid ${toast.type === "success" ? "fa-circle-check" : "fa-triangle-exclamation"}`} />
          {toast.msg}
        </div>
      )}
    </SuperAdminLayout>
  );
}