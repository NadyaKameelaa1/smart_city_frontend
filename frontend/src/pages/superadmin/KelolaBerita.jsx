import { useState, useEffect, useRef } from "react";
import SuperAdminLayout from "./SuperAdminLayout";
import api from "../../api/axios";

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────
const css = `
  .kb-page { animation: kbFadeUp .4s ease both; }
  @keyframes kbFadeUp { from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)} }

  .kb-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
  .kb-stat { background:white; border-radius:16px; border:1px solid var(--border); padding:18px 20px; box-shadow:var(--shadow-sm); display:flex; align-items:center; gap:14px; transition:var(--transition); }
  .kb-stat:hover { transform:translateY(-3px); box-shadow:var(--shadow-md); }
  .kb-stat__icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
  .kb-stat__num { font-family:var(--font-display); font-size:26px; font-weight:700; color:var(--dark); line-height:1; }
  .kb-stat__label { font-size:12px; color:var(--text-muted); margin-top:3px; }

  .kb-toolbar { display:flex; align-items:center; gap:12px; margin-bottom:20px; flex-wrap:wrap; }
  .kb-search-wrap { position:relative; flex:1; max-width:340px; }
  .kb-search-icon { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:var(--teal-400); font-size:13px; pointer-events:none; }
  .kb-search-input { width:100%; padding:10px 16px 10px 38px; border-radius:50px; border:1.5px solid var(--border); background:white; font-family:var(--font-body); font-size:13.5px; color:var(--dark); outline:none; transition:var(--transition); }
  .kb-search-input:focus { border-color:var(--teal-500); box-shadow:0 0 0 3px rgba(64,114,175,.1); }
  .kb-search-input::placeholder { color:var(--text-muted); }

  .kb-filter-tabs { display:flex; gap:6px; flex-wrap:wrap; flex:1; }
  .kb-filter-tab { padding:7px 16px; border-radius:50px; border:1.5px solid var(--border); background:white; font-family:var(--font-body); font-size:12.5px; font-weight:500; color:var(--text-muted); cursor:pointer; transition:var(--transition); }
  .kb-filter-tab:hover { border-color:var(--teal-400); color:var(--teal-700); }
  .kb-filter-tab.active { border-color:var(--teal-600); background:var(--teal-600); color:white; font-weight:600; }

  .kb-add-btn { display:inline-flex; align-items:center; gap:8px; padding:9px 20px; border-radius:50px; background:var(--teal-600); color:white; border:none; font-family:var(--font-body); font-size:13.5px; font-weight:600; cursor:pointer; transition:var(--transition); white-space:nowrap; box-shadow:0 4px 14px rgba(64,114,175,.3); }
  .kb-add-btn:hover { background:var(--teal-700); transform:translateY(-2px); }

  .kb-table-card { background:white; border-radius:20px; border:1px solid var(--border); box-shadow:var(--shadow-sm); overflow:hidden; }
  .kb-table-head { padding:18px 24px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; gap:12px; }
  .kb-table-head-title { font-family:var(--font-display); font-size:16px; font-weight:700; color:var(--dark); display:flex; align-items:center; gap:9px; }
  .kb-table-head-title i { color:var(--teal-500); font-size:15px; }
  .kb-count-badge { background:var(--teal-50); color:var(--teal-700); padding:3px 10px; border-radius:50px; font-size:12px; font-weight:700; }

  .kb-table-wrap { overflow-x:auto; }
  table.kb-table { width:100%; border-collapse:collapse; font-size:13px; min-width:1100px; }
  .kb-table thead tr { background:var(--teal-50); }
  .kb-table th { padding:12px 14px; text-align:left; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:var(--teal-700); border-bottom:1px solid var(--border); white-space:nowrap; }
  .kb-table td { padding:13px 14px; border-bottom:1px solid var(--teal-50); color:var(--text-dark); vertical-align:middle; }
  .kb-table tbody tr { transition:background .15s; }
  .kb-table tbody tr:hover { background:var(--cream); }
  .kb-table tbody tr:last-child td { border-bottom:none; }

  /* Thumbnail */
  .kb-thumb { width:72px; height:50px; border-radius:8px; object-fit:cover; border:1px solid var(--border); display:block; }
  .kb-thumb-placeholder { width:72px; height:50px; border-radius:8px; background:var(--teal-50); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; color:var(--teal-300); font-size:18px; }

  /* Konten/judul truncate */
  .kb-desc-wrap { max-width:200px; }
  .kb-desc-text { font-size:12.5px; color:var(--text-muted); line-height:1.55; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .kb-desc-text.expanded { display:block; -webkit-line-clamp:unset; overflow:visible; }
  .kb-desc-toggle { font-size:11.5px; color:var(--teal-600); font-weight:600; cursor:pointer; background:none; border:none; padding:2px 0; font-family:var(--font-body); display:inline-flex; align-items:center; gap:4px; margin-top:3px; }
  .kb-desc-toggle:hover { color:var(--teal-800); }

  /* Featured toggle */
  .kb-featured-toggle { width:36px; height:20px; border-radius:50px; background:var(--border); border:none; cursor:pointer; position:relative; transition:background .2s; flex-shrink:0; }
  .kb-featured-toggle.on { background:var(--teal-500); }
  .kb-featured-toggle::after { content:''; position:absolute; top:2px; left:2px; width:16px; height:16px; border-radius:50%; background:white; box-shadow:0 1px 4px rgba(0,0,0,.2); transition:transform .2s; }
  .kb-featured-toggle.on::after { transform:translateX(16px); }

  /* Status select */
  .kb-status-select { padding:4px 22px 4px 10px; border-radius:50px; border:1.5px solid; font-size:11.5px; font-weight:700; font-family:var(--font-body); cursor:pointer; outline:none; transition:var(--transition); appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 8px center; }
  .kb-status-select.published { background-color:#f0fdf4; color:#15803d; border-color:#bbf7d0; }
  .kb-status-select.draft { background-color:#fffbeb; color:#92400e; border-color:#fde68a; }

  /* Kategori badge */
  .kb-kategori { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:50px; background:var(--teal-50); color:var(--teal-700); border:1px solid var(--teal-100); font-size:11.5px; font-weight:600; white-space:nowrap; }

  .kb-views { display:flex; align-items:center; gap:5px; font-size:12.5px; font-weight:600; color:var(--text-dark); }
  .kb-views i { color:var(--teal-400); font-size:11px; }

  .kb-actions { display:flex; gap:7px; }
  .kb-act-btn { display:inline-flex; align-items:center; gap:5px; padding:6px 12px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; border:none; font-family:var(--font-body); transition:var(--transition); white-space:nowrap; }
  .kb-act-btn--edit { background:var(--teal-50); color:var(--teal-700); border:1.5px solid var(--teal-100); }
  .kb-act-btn--edit:hover { background:var(--teal-600); color:white; border-color:var(--teal-600); }
  .kb-act-btn--del { background:#fef2f2; color:#b91c1c; border:1.5px solid #fecaca; }
  .kb-act-btn--del:hover { background:#b91c1c; color:white; border-color:#b91c1c; }

  /* Pagination */
  .kb-pagination { display:flex; align-items:center; justify-content:space-between; padding:16px 24px; border-top:1px solid var(--border); flex-wrap:wrap; gap:12px; }
  .kb-page-info { font-size:13px; color:var(--text-muted); }
  .kb-page-btns { display:flex; gap:5px; }
  .kb-page-btn { width:34px; height:34px; border-radius:8px; border:1.5px solid var(--border); background:white; font-size:13px; font-weight:600; color:var(--text-dark); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:var(--transition); font-family:var(--font-body); }
  .kb-page-btn:hover { border-color:var(--teal-400); color:var(--teal-700); }
  .kb-page-btn.active { background:var(--teal-600); border-color:var(--teal-600); color:white; }
  .kb-page-btn:disabled { opacity:.35; cursor:not-allowed; }

  .kb-empty { text-align:center; padding:64px 0; display:flex; flex-direction:column; align-items:center; gap:14px; }
  .kb-empty i { font-size:44px; color:var(--teal-200); }
  .kb-empty p { font-size:14px; color:var(--text-muted); }
  .kb-skel { animation:kbSkel 1.3s ease infinite; }
  @keyframes kbSkel { 0%,100%{opacity:1}50%{opacity:.4} }
  .kb-skel-bar { height:14px; border-radius:7px; background:var(--teal-100); }

  /* Modal */
  .kb-modal-overlay { position:fixed; inset:0; z-index:5000; background:rgba(10,29,61,.65); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:24px; animation:kbFadeIn .2s ease; }
  @keyframes kbFadeIn { from{opacity:0}to{opacity:1} }
  .kb-modal { background:white; border-radius:24px; width:100%; max-width:640px; box-shadow:0 30px 80px rgba(0,0,0,.22); animation:kbScaleIn .25s ease; display:flex; flex-direction:column; max-height:92vh; }
  @keyframes kbScaleIn { from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)} }

  .kb-modal-header { padding:24px 28px 18px; border-bottom:1px solid var(--border); display:flex; align-items:flex-start; justify-content:space-between; gap:14px; flex-shrink:0; }
  .kb-modal-header-left { display:flex; align-items:center; gap:14px; }
  .kb-modal-header-icon { width:48px; height:48px; border-radius:14px; background:var(--teal-50); color:var(--teal-600); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
  .kb-modal-title { font-family:var(--font-display); font-size:19px; font-weight:700; color:var(--dark); margin-bottom:3px; }
  .kb-modal-sub { font-size:13px; color:var(--text-muted); }
  .kb-modal-close { width:34px; height:34px; border-radius:50%; background:var(--teal-50); border:1.5px solid var(--border); color:var(--text-muted); font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:var(--transition); flex-shrink:0; }
  .kb-modal-close:hover { background:#fef2f2; border-color:#fecaca; color:#b91c1c; transform:rotate(90deg); }

  .kb-modal-body { padding:22px 28px; display:flex; flex-direction:column; gap:16px; overflow-y:auto; flex:1; }
  .kb-modal-body::-webkit-scrollbar { width:4px; }
  .kb-modal-body::-webkit-scrollbar-thumb { background:var(--teal-200); border-radius:2px; }

  .kb-field { display:flex; flex-direction:column; gap:6px; }
  .kb-field-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .kb-label { font-size:12.5px; font-weight:700; color:var(--text-dark); display:flex; align-items:center; gap:5px; }
  .kb-label i { color:var(--teal-500); font-size:11px; }
  .kb-required { color:#e11d48; font-size:13px; }

  .kb-input,.kb-select,.kb-textarea { width:100%; padding:10px 14px; border-radius:10px; border:1.5px solid var(--border); background:white; font-family:var(--font-body); font-size:13.5px; color:var(--dark); outline:none; transition:var(--transition); box-sizing:border-box; }
  .kb-input:focus,.kb-select:focus,.kb-textarea:focus { border-color:var(--teal-500); box-shadow:0 0 0 3px rgba(64,114,175,.1); }
  .kb-textarea { resize:vertical; min-height:120px; line-height:1.6; }
  .kb-input::placeholder,.kb-textarea::placeholder { color:var(--text-muted); }
  .kb-input.error,.kb-select.error,.kb-textarea.error { border-color:#f87171; }
  .kb-error-msg { font-size:12px; color:#e11d48; display:flex; align-items:center; gap:5px; }

  .kb-modal-section-label { font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--teal-600); display:flex; align-items:center; gap:8px; margin-bottom:2px; }
  .kb-modal-section-label::after { content:''; flex:1; height:1px; background:var(--teal-100); }
  .kb-modal-divider { height:1px; background:var(--border); margin:4px 0; }

  /* Featured row */
  .kb-featured-row { display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-radius:12px; border:1.5px solid var(--border); background:var(--cream); }
  .kb-featured-row-left { display:flex; align-items:center; gap:10px; }
  .kb-featured-row-icon { width:34px; height:34px; border-radius:9px; background:var(--teal-50); color:var(--teal-600); display:flex; align-items:center; justify-content:center; font-size:14px; }
  .kb-featured-row-label { font-size:13px; font-weight:600; color:var(--dark); }
  .kb-featured-row-desc { font-size:11.5px; color:var(--text-muted); margin-top:1px; }
  .kb-switch { position:relative; width:42px; height:23px; }
  .kb-switch input { opacity:0; width:0; height:0; }
  .kb-switch-track { position:absolute; inset:0; border-radius:50px; background:var(--border); cursor:pointer; transition:background .2s; }
  .kb-switch input:checked + .kb-switch-track { background:var(--teal-500); }
  .kb-switch-track::after { content:''; position:absolute; top:3px; left:3px; width:17px; height:17px; border-radius:50%; background:white; box-shadow:0 1px 4px rgba(0,0,0,.2); transition:transform .2s; }
  .kb-switch input:checked + .kb-switch-track::after { transform:translateX(19px); }

  /* File upload */
  .kb-file-area { border:2px dashed var(--teal-200); border-radius:12px; padding:20px; text-align:center; cursor:pointer; transition:var(--transition); background:var(--teal-50); position:relative; }
  .kb-file-area:hover { border-color:var(--teal-400); }
  .kb-file-area input[type="file"] { position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%; }
  .kb-file-preview { width:100%; max-height:130px; object-fit:cover; border-radius:8px; margin-top:10px; border:1px solid var(--border); }

  .kb-modal-footer { padding:18px 28px; border-top:1px solid var(--border); display:flex; align-items:center; justify-content:flex-end; gap:10px; flex-shrink:0; }
  .kb-modal-cancel { padding:10px 22px; border-radius:50px; border:1.5px solid var(--border); background:white; font-family:var(--font-body); font-size:13.5px; font-weight:600; color:var(--text-muted); cursor:pointer; transition:var(--transition); }
  .kb-modal-cancel:hover { background:var(--cream); border-color:var(--teal-200); }
  .kb-modal-submit { padding:10px 26px; border-radius:50px; background:var(--teal-600); color:white; border:none; font-family:var(--font-body); font-size:13.5px; font-weight:700; cursor:pointer; transition:var(--transition); display:flex; align-items:center; gap:7px; box-shadow:0 4px 14px rgba(64,114,175,.3); }
  .kb-modal-submit:hover { background:var(--teal-700); transform:translateY(-1px); }
  .kb-modal-submit:disabled { opacity:.6; cursor:not-allowed; transform:none; }

  /* Confirm */
  .kb-confirm-overlay { position:fixed; inset:0; z-index:6000; background:rgba(10,29,61,.7); backdrop-filter:blur(5px); display:flex; align-items:center; justify-content:center; padding:24px; animation:kbFadeIn .2s ease; }
  .kb-confirm-box { background:white; border-radius:20px; padding:32px 28px; max-width:380px; width:100%; box-shadow:0 24px 60px rgba(0,0,0,.22); animation:kbScaleIn .25s ease; }
  .kb-confirm-icon { width:52px; height:52px; border-radius:14px; background:#fef2f2; color:#b91c1c; display:flex; align-items:center; justify-content:center; font-size:22px; margin-bottom:16px; }
  .kb-confirm-title { font-family:var(--font-display); font-size:18px; font-weight:700; color:var(--dark); margin-bottom:10px; }
  .kb-confirm-desc { font-size:14px; color:var(--text-muted); line-height:1.6; margin-bottom:24px; }
  .kb-confirm-btns { display:flex; gap:10px; }
  .kb-confirm-btn { flex:1; padding:11px; border-radius:10px; font-size:14px; font-weight:600; font-family:var(--font-body); cursor:pointer; transition:var(--transition); border:none; }
  .kb-confirm-btn--cancel { background:var(--teal-50); color:var(--text-muted); border:1.5px solid var(--border); }
  .kb-confirm-btn--cancel:hover { background:var(--teal-100); }
  .kb-confirm-btn--del { background:#b91c1c; color:white; }
  .kb-confirm-btn--del:hover { background:#991b1b; }

  /* Toast */
  .kb-toast { position:fixed; bottom:28px; right:28px; z-index:9999; padding:14px 20px; border-radius:14px; font-size:13.5px; font-weight:500; display:flex; align-items:center; gap:10px; box-shadow:0 8px 30px rgba(0,0,0,.22); animation:kbSlideUp .3s ease; max-width:340px; color:white; }
  @keyframes kbSlideUp { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
  .kb-toast--success { background:#15803d; }
  .kb-toast--error   { background:#b91c1c; }
  .kb-spinner { width:15px; height:15px; border-radius:50%; border:2px solid rgba(255,255,255,.3); border-top-color:white; animation:kbSpin .7s linear infinite; display:inline-block; }
  @keyframes kbSpin { to{transform:rotate(360deg)} }

  @media (max-width:768px) {
    .kb-stats { grid-template-columns:repeat(2,1fr); }
    .kb-field-row { grid-template-columns:1fr; }
    .kb-toolbar { flex-direction:column; align-items:stretch; }
    .kb-search-wrap { max-width:100%; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const PER_PAGE    = 10;
// Kategori sesuai enum di DB: enum('kecamatan','desa')
const KATEGORI_LIST = ["kecamatan", "desa"];
const STATUS_LIST   = ["published", "draft"];

const EMPTY_FORM = {
  judul: "", konten: "", kategori: "kecamatan",
  publisher: "", featured: false, status: "draft", thumbnail: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// DescCell
// ─────────────────────────────────────────────────────────────────────────────
function DescCell({ text }) {
  const [exp, setExp] = useState(false);
  if (!text) return <span style={{ color:"var(--text-muted)", fontStyle:"italic" }}>—</span>;
  // Hapus tag HTML dari konten (konten bisa berupa HTML)
  const plain = text.replace(/<[^>]*>/g, "").trim();
  return (
    <div className="kb-desc-wrap">
      <p className={`kb-desc-text${exp ? " expanded" : ""}`}>{plain}</p>
      <button className="kb-desc-toggle" onClick={() => setExp(e => !e)}>
        {exp
          ? <><i className="fa-solid fa-chevron-up" style={{ fontSize:9 }} /> Sembunyikan</>
          : <><i className="fa-solid fa-chevron-down" style={{ fontSize:9 }} /> Lihat selengkapnya...</>}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
export default function KelolaBerita() {
  const [beritaList,  setBeritaList]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [filterStatus,setFilterStatus]= useState("semua");
  const [page,        setPage]        = useState(1);

  const [modalOpen,   setModalOpen]   = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [formErr,     setFormErr]     = useState({});
  const [submitting,  setSubmitting]  = useState(false);
  const [previewUrl,  setPreviewUrl]  = useState(null);
  const fileRef = useRef();

  const [confirmDel, setConfirmDel] = useState(null);
  const [confirmReplaceFeatured, setConfirmReplaceFeatured] = useState(null);
  const [deleting,   setDeleting]   = useState(false);
  const [toast,      setToast]      = useState(null);

  // ── Fetch ──────────────────────────────────────────────────
  useEffect(() => { fetchBerita(); }, []);

  const fetchBerita = async () => {
    setLoading(true);
    try {
      // GET /api/super-admin/berita → BeritaController@adminIndex
      // Response: { success: true, data: [...] }
      // Setiap item memiliki: id, judul, slug, konten, kategori, publisher,
      //   thumbnail (path), thumbnail_url (full URL), views, featured, status, published_at
      const res = await api.get("/super-admin/berita");
      setBeritaList(res.data.data || res.data || []);
    } catch {
      showToast("Gagal memuat data berita.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  // ── Filtering client-side ──────────────────────────────────
  const filtered = beritaList.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      b.judul?.toLowerCase().includes(q) ||
      b.kategori?.toLowerCase().includes(q) ||
      b.publisher?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "semua" || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  useEffect(() => { setPage(1); }, [search, filterStatus]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Stats ──────────────────────────────────────────────────
  const total     = beritaList.length;
  const published = beritaList.filter(b => b.status === "published").length;
  const draft     = beritaList.filter(b => b.status === "draft").length;
  const featured  = beritaList.filter(b => b.featured == 1 || b.featured === true).length;

  const stats = [
    { icon:"fa-solid fa-newspaper",  label:"Total Berita", num:total,     color:"var(--teal-600)", bg:"var(--teal-50)" },
    { icon:"fa-solid fa-rss",        label:"Published",    num:published, color:"#15803d",          bg:"#f0fdf4" },
    { icon:"fa-solid fa-file-pen",   label:"Draft",        num:draft,     color:"#92400e",          bg:"#fffbeb" },
    { icon:"fa-solid fa-star",       label:"Featured",     num:featured,  color:"#b45309",          bg:"rgba(212,168,83,.12)" },
  ];

  // ── Modal helpers ──────────────────────────────────────────
  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErr({});
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = "";
    setModalOpen(true);
  };

  const openEdit = (b) => {
    setEditTarget(b);
    setForm({
      judul:     b.judul     || "",
      konten:    b.konten    || "",
      kategori:  b.kategori  || "kecamatan",
      publisher: b.publisher || "",
      featured:  b.featured == 1 || b.featured === true,
      status:    b.status    || "draft",
      thumbnail: null,
    });
    setFormErr({});
    // thumbnail_url dari adminIndex sudah full URL
    setPreviewUrl(b.thumbnail_url || null);
    if (fileRef.current) fileRef.current.value = "";
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditTarget(null); setPreviewUrl(null); };

  const handleFormChange = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    setFormErr(e => ({ ...e, [field]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    handleFormChange("thumbnail", file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // ── Validation ─────────────────────────────────────────────
  const validate = () => {
    const err = {};
    if (!form.judul.trim())    err.judul    = "Judul berita wajib diisi.";
    if (!form.konten.trim())   err.konten   = "Konten berita wajib diisi.";
    if (!form.kategori)        err.kategori = "Kategori wajib dipilih.";
    return err;
  };

  // ── Submit (Create / Update) ────────────────────────────────
  const handleSubmit = async () => {
    const err = validate();
    if (Object.keys(err).length) { setFormErr(err); return; }
    setSubmitting(true);
    try {
      // Gunakan FormData karena ada file upload thumbnail
      const fd = new FormData();
      fd.append("judul",     form.judul);
      fd.append("konten",    form.konten);
      fd.append("kategori",  form.kategori);
      fd.append("publisher", form.publisher);
      fd.append("status",    form.status);
      fd.append("featured",  form.featured ? "1" : "0");
      if (form.thumbnail instanceof File) {
        fd.append("thumbnail", form.thumbnail);
      }

      if (editTarget) {
        // PUT via POST + _method=PUT (Laravel method spoofing)
        // POST /api/super-admin/berita/{id}
        fd.append("_method", "PUT");
        const res = await api.post(`/super-admin/berita/${editTarget.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const updated = res.data.data || res.data;
        // Update state lokal tanpa refetch
        setBeritaList(prev => prev.map(b =>
          b.id === editTarget.id
            ? { ...b, ...updated, thumbnail_url: updated.thumbnail_url || previewUrl }
            : b
        ));
        showToast(`Berita berhasil diperbarui.`);
      } else {
        // POST /api/super-admin/berita
        const res = await api.post("/super-admin/berita", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const newItem = res.data.data || res.data;
        setBeritaList(prev => [newItem, ...prev]);
        showToast(`Berita berhasil ditambahkan.`);
      }
      closeModal();
    } catch (e) {
      showToast(e.response?.data?.message || "Gagal menyimpan data.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async () => {
    const b = confirmDel;
    setConfirmDel(null);
    setDeleting(true);
    try {
      // DELETE /api/super-admin/berita/{id}
      await api.delete(`/super-admin/berita/${b.id}`);
      setBeritaList(prev => prev.filter(x => x.id !== b.id));
      showToast(`Berita "${b.judul}" berhasil dihapus.`);
    } catch {
      showToast("Gagal menghapus data.", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ── Status change (dropdown di tabel) ──────────────────────
  const handleStatusChange = async (id, newStatus) => {
    // Optimistic update
    setBeritaList(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    try {
      // PATCH /api/super-admin/berita/{id}/status
      // Body: { status: 'published' | 'draft' }
      await api.patch(`/super-admin/berita/${id}/status`, { status: newStatus });
      showToast("Status berhasil diperbarui.");
    } catch {
      showToast("Gagal mengubah status.", "error");
      fetchBerita(); // rollback
    }
  };

  // ── Featured toggle (toggle di tabel) ──────────────────────
  // ── Featured toggle (di tabel) ─────────────────────────
const applyFeatured = async (item, featured) => {
  // Optimistic update
  setBeritaList((prev) =>
    prev.map((x) => (x.id === item.id ? { ...x, featured } : x))
  );
  try {
    await api.patch(`/super-admin/berita/${item.id}/featured`, { featured });
  } catch {
    showToast("Gagal mengubah featured.", "error");
    fetchBerita(); // rollback
  }
};

const handleFeaturedToggle = async (b) => {
  const currentFeatured = b.featured == 1 || b.featured === true;
  const newVal = !currentFeatured;

  // Hanya ketika mengaktifkan (OFF → ON) cek apakah sudah ada featured lain
  if (newVal) {
    const other = beritaList.find(
      (item) => item.id !== b.id && (item.featured == 1 || item.featured === true)
    );
    if (other) {
      // Tampilkan dialog konfirmasi
      setConfirmReplaceFeatured({ newItem: b, oldItem: other });
      return;
    }
  }

  // Jika tidak ada konflik (atau menonaktifkan), langsung eksekusi
  await applyFeatured(b, newVal);
};

const handleConfirmReplace = async () => {
  const { newItem, oldItem } = confirmReplaceFeatured;
  setConfirmReplaceFeatured(null);

  // Optimistic update: nonaktifkan lama, aktifkan baru
  setBeritaList((prev) =>
    prev.map((x) => {
      if (x.id === oldItem.id) return { ...x, featured: false };
      if (x.id === newItem.id) return { ...x, featured: true };
      return x;
    })
  );

  try {
    await Promise.all([
      api.patch(`/super-admin/berita/${oldItem.id}/featured`, { featured: false }),
      api.patch(`/super-admin/berita/${newItem.id}/featured`, { featured: true }),
    ]);
  } catch {
    showToast("Gagal mengganti featured.", "error");
    fetchBerita();
  }
};

  // ─────────────────────────────────────────────────────────────
  return (
    <SuperAdminLayout>
      <style>{css}</style>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet" />
      <div className="kb-page">

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, textTransform:"uppercase", color:"var(--teal-600)", display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
            <i className="fa-solid fa-newspaper" /> Super Admin — Konten Portal
          </div>
          <div style={{ fontFamily:"var(--font-display)", fontSize:"clamp(22px,3vw,30px)", fontWeight:700, color:"var(--dark)" }}>
            Kelola Berita
          </div>
        </div>

        {/* Stats */}
        <div className="kb-stats">
          {stats.map((s, i) => (
            <div className="kb-stat" key={i}>
              <div className="kb-stat__icon" style={{ background:s.bg, color:s.color }}><i className={s.icon} /></div>
              <div><div className="kb-stat__num">{s.num}</div><div className="kb-stat__label">{s.label}</div></div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="kb-toolbar">
          <div className="kb-search-wrap">
            <i className="fa-solid fa-magnifying-glass kb-search-icon" />
            <input className="kb-search-input" type="text" placeholder="Cari judul, kategori, publisher..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="kb-filter-tabs">
            {["semua","published","draft"].map(f => (
              <button key={f} className={`kb-filter-tab${filterStatus === f ? " active" : ""}`} onClick={() => setFilterStatus(f)}>
                {f === "semua" ? "Semua" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button className="kb-add-btn" onClick={openAdd}>
            <i className="fa-solid fa-plus" /> Tambah Berita
          </button>
        </div>

        {/* Table */}
        <div className="kb-table-card">
          <div className="kb-table-head">
            <div className="kb-table-head-title">
              <i className="fa-solid fa-table-list" /> Daftar Berita
              <span className="kb-count-badge">{filtered.length}</span>
            </div>
          </div>

          {loading ? (
            <div className="kb-table-wrap">
              <table className="kb-table">
                <thead><tr>{["ID","Thumbnail","Judul","Konten","Kategori","Publisher","Views","Featured","Status","Aksi"].map(h => <th key={h}>{h}</th>)}</tr></thead>
                <tbody className="kb-skel">
                  {[...Array(5)].map((_,i) => <tr key={i}>{[...Array(10)].map((_,j) => <td key={j}><div className="kb-skel-bar" style={{ width:"75%" }} /></td>)}</tr>)}
                </tbody>
              </table>
            </div>
          ) : filtered.length === 0 ? (
            <div className="kb-empty">
              <i className="fa-solid fa-newspaper" />
              <p>Tidak ada berita{search ? ` untuk "${search}"` : ""}.</p>
            </div>
          ) : (
            <div className="kb-table-wrap">
              <table className="kb-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Thumbnail</th>
                    <th>Judul</th>
                    <th>Konten</th>
                    <th>Kategori</th>
                    <th>Publisher</th>
                    <th>Views</th>
                    <th>Featured</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(b => (
                    <tr key={b.id}>
                      {/* ID */}
                      <td><span style={{ fontSize:12, fontWeight:600, color:"var(--text-muted)", fontFamily:"monospace" }}>#{b.id}</span></td>

                      {/* Thumbnail — thumbnail_url dari adminIndex sudah full URL */}
                      <td>
                        {b.thumbnail_url ? (
                          <img src={b.thumbnail_url} alt={b.judul} className="kb-thumb"
                            onError={e => e.currentTarget.style.display = "none"} />
                        ) : (
                          <div className="kb-thumb-placeholder"><i className="fa-solid fa-image" /></div>
                        )}
                      </td>

                      {/* Judul */}
                      <td style={{ fontWeight:700, maxWidth:160 }}>
                        <span style={{ display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", fontSize:13 }}>
                          {b.judul}
                        </span>
                      </td>

                      {/* Konten (plain text, truncated) */}
                      <td><DescCell text={b.konten} /></td>

                      {/* Kategori — enum('kecamatan','desa') */}
                      <td>
                        <span className="kb-kategori">
                          <i className="fa-solid fa-tag" style={{ fontSize:9 }} />
                          {b.kategori ? b.kategori.charAt(0).toUpperCase() + b.kategori.slice(1) : "—"}
                        </span>
                      </td>

                      {/* Publisher */}
                      <td style={{ fontSize:12.5 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <div style={{ width:26, height:26, borderRadius:"50%", background:"var(--teal-50)", border:"1px solid var(--teal-100)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--teal-600)", fontSize:11 }}>
                            <i className="fa-solid fa-user" />
                          </div>
                          {b.publisher || "—"}
                        </div>
                      </td>

                      {/* Views */}
                      <td>
                        <div className="kb-views">
                          <i className="fa-solid fa-eye" />
                          {Number(b.views || 0).toLocaleString("id-ID")}
                        </div>
                      </td>

                      {/* Featured toggle — update ke DB via PATCH /featured */}
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <button
                            className={`kb-featured-toggle${(b.featured == 1 || b.featured === true) ? " on" : ""}`}
                            onClick={() => handleFeaturedToggle(b)}
                            title={(b.featured == 1 || b.featured === true) ? "Nonaktifkan Featured" : "Jadikan Featured"}
                          />
                          {(b.featured == 1 || b.featured === true) && (
                            <span style={{ fontSize:11, fontWeight:700, color:"#b45309", display:"flex", alignItems:"center", gap:4 }}>
                              <i className="fa-solid fa-star" style={{ fontSize:10 }} /> Ya
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status select — update ke DB via PATCH /status */}
                      <td>
                        <select
                          className={`kb-status-select ${b.status === "published" ? "published" : "draft"}`}
                          value={b.status || "draft"}
                          onChange={e => handleStatusChange(b.id, e.target.value)}
                        >
                          {STATUS_LIST.map(s => (
                            <option key={s} value={s}>{s === "published" ? "Published" : "Draft"}</option>
                          ))}
                        </select>
                      </td>

                      {/* Aksi */}
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

          {totalPages > 1 && (
            <div className="kb-pagination">
              <div className="kb-page-info">
                Menampilkan {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} dari {filtered.length} berita
              </div>
              <div className="kb-page-btns">
                <button className="kb-page-btn" onClick={() => setPage(p => p-1)} disabled={page===1}>
                  <i className="fa-solid fa-chevron-left" style={{ fontSize:11 }} />
                </button>
                {[...Array(totalPages)].map((_,i) => (
                  <button key={i} className={`kb-page-btn${page===i+1?" active":""}`} onClick={() => setPage(i+1)}>{i+1}</button>
                ))}
                <button className="kb-page-btn" onClick={() => setPage(p => p+1)} disabled={page===totalPages}>
                  <i className="fa-solid fa-chevron-right" style={{ fontSize:11 }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ MODAL TAMBAH / EDIT ══ */}
      {modalOpen && (
        <div className="kb-modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="kb-modal">

            {/* Header */}
            <div className="kb-modal-header">
              <div className="kb-modal-header-left">
                <div className="kb-modal-header-icon">
                  <i className={`fa-solid ${editTarget ? "fa-pen-to-square" : "fa-plus"}`} />
                </div>
                <div>
                  <div className="kb-modal-title">{editTarget ? "Edit Berita" : "Tambah Berita Baru"}</div>
                  <div className="kb-modal-sub">{editTarget ? `Mengedit: ${editTarget.judul}` : "Isi form untuk menambah berita baru"}</div>
                </div>
              </div>
              <button className="kb-modal-close" onClick={closeModal}><i className="fa-solid fa-xmark" /></button>
            </div>

            {/* Body */}
            <div className="kb-modal-body">
              <div className="kb-modal-section-label">Konten Berita</div>

              {/* Judul */}
              <div className="kb-field">
                <label className="kb-label"><i className="fa-solid fa-heading" /> Judul Berita <span className="kb-required">*</span></label>
                <input className={`kb-input${formErr.judul?" error":""}`} placeholder="Judul berita yang menarik..."
                  value={form.judul} onChange={e => handleFormChange("judul", e.target.value)} />
                {formErr.judul && <span className="kb-error-msg"><i className="fa-solid fa-circle-exclamation" />{formErr.judul}</span>}
              </div>

              {/* Konten */}
              <div className="kb-field">
                <label className="kb-label"><i className="fa-solid fa-align-left" /> Konten <span className="kb-required">*</span></label>
                <textarea className={`kb-textarea${formErr.konten?" error":""}`} placeholder="Tulis konten berita di sini..."
                  value={form.konten} onChange={e => handleFormChange("konten", e.target.value)} rows={6} />
                {formErr.konten && <span className="kb-error-msg"><i className="fa-solid fa-circle-exclamation" />{formErr.konten}</span>}
              </div>

              {/* Kategori + Publisher */}
              <div className="kb-field-row">
                <div className="kb-field">
                  <label className="kb-label"><i className="fa-solid fa-tag" /> Kategori <span className="kb-required">*</span></label>
                  {/* Kategori sesuai enum DB: kecamatan | desa */}
                  <select className={`kb-select${formErr.kategori?" error":""}`}
                    value={form.kategori} onChange={e => handleFormChange("kategori", e.target.value)}>
                    {KATEGORI_LIST.map(k => (
                      <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>
                    ))}
                  </select>
                  {formErr.kategori && <span className="kb-error-msg"><i className="fa-solid fa-circle-exclamation" />{formErr.kategori}</span>}
                </div>
                <div className="kb-field">
                  <label className="kb-label"><i className="fa-solid fa-user-pen" /> Publisher</label>
                  <input className="kb-input" placeholder="Nama penulis / sumber..." 
                    value={form.publisher} onChange={e => handleFormChange("publisher", e.target.value)} />
                </div>
              </div>

              {/* Thumbnail upload */}
              <div className="kb-field">
                <label className="kb-label"><i className="fa-solid fa-image" /> Thumbnail</label>
                <div className="kb-file-area">
                  <input ref={fileRef} type="file" accept="image/jpg,image/jpeg,image/png,image/webp" onChange={handleFileChange} />
                  {!previewUrl ? (
                    <>
                      <div style={{ fontSize:28, color:"var(--teal-400)", marginBottom:8 }}><i className="fa-solid fa-cloud-arrow-up" /></div>
                      <div style={{ fontSize:13, color:"var(--text-muted)" }}>
                        <strong style={{ color:"var(--teal-700)" }}>Klik untuk upload</strong> atau drag & drop<br />
                        <span style={{ fontSize:11 }}>JPG, PNG, WEBP · Maks 2MB</span>
                      </div>
                    </>
                  ) : (
                    <img src={previewUrl} alt="preview" className="kb-file-preview"
                      onError={e => e.currentTarget.style.display = "none"} />
                  )}
                </div>
                {previewUrl && (
                  <button type="button" onClick={() => { setPreviewUrl(null); handleFormChange("thumbnail", null); if (fileRef.current) fileRef.current.value = ""; }}
                    style={{ alignSelf:"flex-start", fontSize:12, color:"#b91c1c", background:"none", border:"none", cursor:"pointer", padding:"2px 0", fontFamily:"inherit" }}>
                    <i className="fa-solid fa-trash" style={{ marginRight:4 }} />Hapus thumbnail
                  </button>
                )}
              </div>

              <div className="kb-modal-divider" />
              <div className="kb-modal-section-label">Pengaturan</div>

              {/* Status */}
              <div className="kb-field">
                <label className="kb-label"><i className="fa-solid fa-flag" /> Status Publikasi</label>
                <select className="kb-select" value={form.status} onChange={e => handleFormChange("status", e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {/* Featured toggle */}
              <div className="kb-featured-row">
                <div className="kb-featured-row-left">
                  <div className="kb-featured-row-icon"><i className="fa-solid fa-star" /></div>
                  <div>
                    <div className="kb-featured-row-label">Featured / Unggulan</div>
                    <div className="kb-featured-row-desc">Tampilkan sebagai berita unggulan di halaman depan</div>
                  </div>
                </div>
                <label className="kb-switch">
                  <input type="checkbox" checked={!!form.featured} onChange={e => handleFormChange("featured", e.target.checked)} />
                  <span className="kb-switch-track" />
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="kb-modal-footer">
              <button className="kb-modal-cancel" onClick={closeModal} disabled={submitting}>Batal</button>
              <button className="kb-modal-submit" onClick={handleSubmit} disabled={submitting}>
                {submitting
                  ? <><span className="kb-spinner" /> Menyimpan...</>
                  : <><i className={`fa-solid ${editTarget ? "fa-floppy-disk" : "fa-plus"}`} />{editTarget ? "Simpan Perubahan" : "Tambah Berita"}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDel && (
        <div className="kb-confirm-overlay">
          <div className="kb-confirm-box">
            <div className="kb-confirm-icon"><i className="fa-solid fa-trash" /></div>
            <div className="kb-confirm-title">Hapus Berita?</div>
            <div className="kb-confirm-desc">
              Berita <strong>"{confirmDel.judul}"</strong> akan dihapus secara permanen termasuk thumbnail-nya.
            </div>
            <div className="kb-confirm-btns">
              <button className="kb-confirm-btn kb-confirm-btn--cancel" onClick={() => setConfirmDel(null)}>Batal</button>
              <button className="kb-confirm-btn kb-confirm-btn--del" onClick={handleDelete} disabled={deleting}>
                {deleting ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight:6 }} />Menghapus...</> : <><i className="fa-solid fa-trash" style={{ marginRight:6 }} />Ya, Hapus</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmReplaceFeatured && (
        <div className="kb-confirm-overlay" onClick={() => setConfirmReplaceFeatured(null)}>
          <div className="kb-confirm-box" onClick={e => e.stopPropagation()}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#fef9c3', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>
              <i className="fa-solid fa-star" />
            </div>
            <div className="kb-confirm-title">Ganti Berita Featured?</div>
            <div className="kb-confirm-desc">
              Saat ini <strong>"{confirmReplaceFeatured.oldItem.judul}"</strong> yang menjadi featured. 
              Jika diganti, <strong>"{confirmReplaceFeatured.newItem.judul}"</strong> akan menjadi featured utama.
            </div>
            <div className="kb-confirm-btns">
              <button className="kb-confirm-btn kb-confirm-btn--cancel" onClick={() => setConfirmReplaceFeatured(null)}>Batal</button>
              <button className="kb-confirm-btn kb-confirm-btn--del" onClick={handleConfirmReplace}>Ya, Ganti</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`kb-toast kb-toast--${toast.type}`}>
          <i className={`fa-solid ${toast.type==="success" ? "fa-circle-check" : "fa-triangle-exclamation"}`} />
          {toast.msg}
        </div>
      )}
    </SuperAdminLayout>
  );
}