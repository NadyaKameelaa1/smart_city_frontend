import { useState, useEffect, useCallback } from "react";
import SuperAdminLayout from "./SuperAdminLayout";
import api from "../../api/axios";

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────
const css = `
  .ka-page { animation: kaFadeUp .4s ease both; }
  @keyframes kaFadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }

  /* ── Stats strip ── */
  .ka-stats {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 16px; margin-bottom: 28px;
  }
  .ka-stat {
    background: white; border-radius: 16px;
    border: 1px solid var(--border); padding: 18px 20px;
    box-shadow: var(--shadow-sm);
    display: flex; align-items: center; gap: 14px;
    transition: var(--transition);
  }
  .ka-stat:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
  .ka-stat__icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .ka-stat__num {
    font-family: var(--font-display);
    font-size: 26px; font-weight: 700; color: var(--dark); line-height: 1;
  }
  .ka-stat__label { font-size: 12px; color: var(--text-muted); margin-top: 3px; }

  /* ── Toolbar ── */
  .ka-toolbar {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 20px; flex-wrap: wrap;
  }
  .ka-search-wrap { position: relative; flex: 1; max-width: 360px; }
  .ka-search-icon {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    color: var(--teal-400); font-size: 13px; pointer-events: none;
  }
  .ka-search-input {
    width: 100%; padding: 10px 16px 10px 38px;
    border-radius: 50px; border: 1.5px solid var(--border);
    background: white; font-family: var(--font-body);
    font-size: 13.5px; color: var(--dark); outline: none;
    transition: var(--transition);
  }
  .ka-search-input:focus {
    border-color: var(--teal-500);
    box-shadow: 0 0 0 3px rgba(64,114,175,.1);
  }
  .ka-search-input::placeholder { color: var(--text-muted); }

  /* Filter tabs */
  .ka-filter-tabs { display: flex; gap: 6px; flex-wrap: wrap; flex: 1; }
  .ka-filter-tab {
    padding: 7px 16px; border-radius: 50px;
    border: 1.5px solid var(--border); background: white;
    font-family: var(--font-body); font-size: 12.5px; font-weight: 500;
    color: var(--text-muted); cursor: pointer; transition: var(--transition);
  }
  .ka-filter-tab:hover { border-color: var(--teal-400); color: var(--teal-700); }
  .ka-filter-tab.active {
    border-color: var(--teal-600); background: var(--teal-600);
    color: white; font-weight: 600;
  }

  /* Add button */
  .ka-add-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 9px 20px; border-radius: 50px;
    background: var(--teal-600); color: white; border: none;
    font-family: var(--font-body); font-size: 13.5px; font-weight: 600;
    cursor: pointer; transition: var(--transition); white-space: nowrap;
    box-shadow: 0 4px 14px rgba(64,114,175,.3);
  }
  .ka-add-btn:hover {
    background: var(--teal-700); transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(64,114,175,.35);
  }

  /* ── Table card ── */
  .ka-table-card {
    background: white; border-radius: 20px;
    border: 1px solid var(--border); box-shadow: var(--shadow-sm);
    overflow: hidden;
  }
  .ka-table-head {
    padding: 18px 24px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  .ka-table-head-title {
    font-family: var(--font-display); font-size: 16px;
    font-weight: 700; color: var(--dark);
    display: flex; align-items: center; gap: 9px;
  }
  .ka-table-head-title i { color: var(--teal-500); font-size: 15px; }
  .ka-count-badge {
    background: var(--teal-50); color: var(--teal-700);
    padding: 3px 10px; border-radius: 50px;
    font-size: 12px; font-weight: 700;
  }

  .ka-table-wrap { overflow-x: auto; }
  table.ka-table {
    width: 100%; border-collapse: collapse;
    font-size: 13px; min-width: 860px;
  }
  .ka-table thead tr { background: var(--teal-50); }
  .ka-table th {
    padding: 12px 16px; text-align: left;
    font-size: 11px; font-weight: 700;
    letter-spacing: 1px; text-transform: uppercase;
    color: var(--teal-700); border-bottom: 1px solid var(--border);
    white-space: nowrap;
  }
  .ka-table td {
    padding: 13px 16px; border-bottom: 1px solid var(--teal-50);
    color: var(--text-dark); vertical-align: middle;
  }
  .ka-table tbody tr { transition: background .15s; }
  .ka-table tbody tr:hover { background: var(--cream); }
  .ka-table tbody tr:last-child td { border-bottom: none; }

  /* Role badge */
  .ka-role {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 50px;
    font-size: 11px; font-weight: 700; letter-spacing: .3px; white-space: nowrap;
  }
  .ka-role--superadmin { background: rgba(212,168,83,.15); color: #92400e; border: 1px solid rgba(212,168,83,.35); }
  .ka-role--admin      { background: var(--teal-50); color: var(--teal-700); border: 1px solid var(--teal-100); }
  .ka-role--staff      { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }

  /* Action buttons */
  .ka-actions { display: flex; gap: 7px; }
  .ka-act-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 8px;
    font-size: 12px; font-weight: 600; cursor: pointer;
    border: none; font-family: var(--font-body);
    transition: var(--transition); white-space: nowrap;
  }
  .ka-act-btn--edit {
    background: var(--teal-50); color: var(--teal-700);
    border: 1.5px solid var(--teal-100);
  }
  .ka-act-btn--edit:hover { background: var(--teal-600); color: white; border-color: var(--teal-600); }
  .ka-act-btn--del {
    background: #fef2f2; color: #b91c1c;
    border: 1.5px solid #fecaca;
  }
  .ka-act-btn--del:hover { background: #b91c1c; color: white; border-color: #b91c1c; }

  /* ── Pagination ── */
  .ka-pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 12px;
  }
  .ka-page-info { font-size: 13px; color: var(--text-muted); }
  .ka-page-btns { display: flex; gap: 5px; }
  .ka-page-btn {
    width: 34px; height: 34px; border-radius: 8px;
    border: 1.5px solid var(--border); background: white;
    font-size: 13px; font-weight: 600; color: var(--text-dark);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: var(--transition); font-family: var(--font-body);
  }
  .ka-page-btn:hover { border-color: var(--teal-400); color: var(--teal-700); }
  .ka-page-btn.active { background: var(--teal-600); border-color: var(--teal-600); color: white; }
  .ka-page-btn:disabled { opacity: .35; cursor: not-allowed; }

  /* ── Empty ── */
  .ka-empty {
    text-align: center; padding: 64px 0;
    display: flex; flex-direction: column; align-items: center; gap: 14px;
  }
  .ka-empty i { font-size: 44px; color: var(--teal-200); }
  .ka-empty p { font-size: 14px; color: var(--text-muted); }

  /* ── Skeleton ── */
  .ka-skel { animation: kaSkel 1.3s ease infinite; }
  @keyframes kaSkel { 0%,100%{opacity:1} 50%{opacity:.4} }
  .ka-skel-row td { padding: 14px 16px; }
  .ka-skel-bar { height: 14px; border-radius: 7px; background: var(--teal-100); }

  /* ══════════════════════════════════════════════
     MODAL
  ══════════════════════════════════════════════ */
  .ka-modal-overlay {
    position: fixed; inset: 0; z-index: 5000;
    background: rgba(10,29,61,.65); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
    animation: kaFadeIn .2s ease;
  }
  @keyframes kaFadeIn { from{opacity:0} to{opacity:1} }
  .ka-modal {
    background: white; border-radius: 24px;
    width: 100%; max-width: 540px;
    box-shadow: 0 30px 80px rgba(0,0,0,.22);
    animation: kaScaleIn .25s ease;
    overflow: hidden;
  }
  @keyframes kaScaleIn { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }

  /* Modal header */
  .ka-modal-header {
    padding: 26px 28px 20px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: flex-start; justify-content: space-between; gap: 14px;
  }
  .ka-modal-header-left { display: flex; align-items: center; gap: 14px; }
  .ka-modal-header-icon {
    width: 48px; height: 48px; border-radius: 14px;
    background: var(--teal-50); color: var(--teal-600);
    display: flex; align-items: center; justify-content: center; font-size: 20px;
    flex-shrink: 0;
  }
  .ka-modal-title {
    font-family: var(--font-display); font-size: 19px;
    font-weight: 700; color: var(--dark); margin-bottom: 3px;
  }
  .ka-modal-sub { font-size: 13px; color: var(--text-muted); }
  .ka-modal-close {
    width: 34px; height: 34px; border-radius: 50%;
    background: var(--teal-50); border: 1.5px solid var(--border);
    color: var(--text-muted); font-size: 14px;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: var(--transition); flex-shrink: 0;
  }
  .ka-modal-close:hover { background: #fef2f2; border-color: #fecaca; color: #b91c1c; transform: rotate(90deg); }

  /* Modal body */
  .ka-modal-body { padding: 24px 28px; display: flex; flex-direction: column; gap: 18px; max-height: 60vh; overflow-y: auto; }
  .ka-modal-body::-webkit-scrollbar { width: 4px; }
  .ka-modal-body::-webkit-scrollbar-thumb { background: var(--teal-200); border-radius: 2px; }

  /* Form group */
  .ka-field { display: flex; flex-direction: column; gap: 6px; }
  .ka-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .ka-label {
    font-size: 12.5px; font-weight: 700;
    color: var(--text-dark); display: flex; align-items: center; gap: 5px;
  }
  .ka-label i { color: var(--teal-500); font-size: 11px; }
  .ka-required { color: #e11d48; font-size: 13px; }

  .ka-input, .ka-select {
    width: 100%; padding: 10px 14px;
    border-radius: 10px; border: 1.5px solid var(--border);
    background: white; font-family: var(--font-body);
    font-size: 13.5px; color: var(--dark); outline: none;
    transition: var(--transition);
  }
  .ka-input:focus, .ka-select:focus {
    border-color: var(--teal-500);
    box-shadow: 0 0 0 3px rgba(64,114,175,.1);
  }
  .ka-input::placeholder { color: var(--text-muted); }
  .ka-input.error { border-color: #f87171; }
  .ka-error-msg { font-size: 12px; color: #e11d48; display: flex; align-items: center; gap: 5px; }

  .ka-input-wrap { position: relative; }
  .ka-input-icon {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    color: var(--teal-400); font-size: 13px; pointer-events: none;
  }
  .ka-input-wrap .ka-input { padding-left: 36px; }
  .ka-pass-toggle {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: var(--text-muted);
    font-size: 13px; padding: 0;
  }

  /* Divider in modal */
  .ka-modal-divider {
    height: 1px; background: var(--border);
    margin: 4px 0;
  }
  .ka-modal-section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 2px;
    text-transform: uppercase; color: var(--teal-600);
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 2px;
  }
  .ka-modal-section-label::after {
    content: ''; flex: 1; height: 1px; background: var(--teal-100);
  }

  /* Modal footer */
  .ka-modal-footer {
    padding: 18px 28px;
    border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: flex-end; gap: 10px;
  }
  .ka-modal-cancel {
    padding: 10px 22px; border-radius: 50px;
    border: 1.5px solid var(--border); background: white;
    font-family: var(--font-body); font-size: 13.5px;
    font-weight: 600; color: var(--text-muted);
    cursor: pointer; transition: var(--transition);
  }
  .ka-modal-cancel:hover { background: var(--cream); border-color: var(--teal-200); }
  .ka-modal-submit {
    padding: 10px 26px; border-radius: 50px;
    background: var(--teal-600); color: white; border: none;
    font-family: var(--font-body); font-size: 13.5px; font-weight: 700;
    cursor: pointer; transition: var(--transition);
    display: flex; align-items: center; gap: 7px;
    box-shadow: 0 4px 14px rgba(64,114,175,.3);
  }
  .ka-modal-submit:hover { background: var(--teal-700); transform: translateY(-1px); }
  .ka-modal-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }

  /* ── Confirm dialog ── */
  .ka-confirm-overlay {
    position: fixed; inset: 0; z-index: 6000;
    background: rgba(10,29,61,.7); backdrop-filter: blur(5px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
    animation: kaFadeIn .2s ease;
  }
  .ka-confirm-box {
    background: white; border-radius: 20px;
    padding: 32px 28px; max-width: 380px; width: 100%;
    box-shadow: 0 24px 60px rgba(0,0,0,.22);
    animation: kaScaleIn .25s ease;
  }
  .ka-confirm-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: #fef2f2; color: #b91c1c;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; margin-bottom: 16px;
  }
  .ka-confirm-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--dark); margin-bottom: 10px; }
  .ka-confirm-desc { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px; }
  .ka-confirm-btns { display: flex; gap: 10px; }
  .ka-confirm-btn {
    flex: 1; padding: 11px; border-radius: 10px;
    font-size: 14px; font-weight: 600; font-family: var(--font-body); cursor: pointer; transition: var(--transition); border: none;
  }
  .ka-confirm-btn--cancel { background: var(--teal-50); color: var(--text-muted); border: 1.5px solid var(--border); }
  .ka-confirm-btn--cancel:hover { background: var(--teal-100); }
  .ka-confirm-btn--del { background: #b91c1c; color: white; }
  .ka-confirm-btn--del:hover { background: #991b1b; }

  /* ── Toast ── */
  .ka-toast {
    position: fixed; bottom: 28px; right: 28px; z-index: 9999;
    padding: 14px 20px; border-radius: 14px;
    font-size: 13.5px; font-weight: 500;
    display: flex; align-items: center; gap: 10px;
    box-shadow: 0 8px 30px rgba(0,0,0,.22);
    animation: kaSlideUp .3s ease; max-width: 340px; color: white;
  }
  @keyframes kaSlideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .ka-toast--success { background: #15803d; }
  .ka-toast--error   { background: #b91c1c; }
  .ka-toast--info    { background: var(--teal-700); }

  /* Spinner */
  .ka-spinner {
    width: 15px; height: 15px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,.3);
    border-top-color: white;
    animation: spin .7s linear infinite; display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 768px) {
    .ka-stats { grid-template-columns: repeat(2, 1fr); }
    .ka-field-row { grid-template-columns: 1fr; }
    .ka-toolbar { flex-direction: column; align-items: stretch; }
    .ka-search-wrap { max-width: 100%; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const ROLES = ["admin"];
const PER_PAGE = 10;

const EMPTY_FORM = {
  email: "", username: "", name: "", password: "", role: "admin", wisata_id: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function KelolaAkun() {
  // Data
  const [accounts, setAccounts] = useState([]);
  const [wisataList, setWisataList] = useState([]);
  const [loading, setLoading]     = useState(true);

  // UI state
  const [search, setSearch]       = useState("");
  const [filterRole, setFilter]   = useState("semua");
  const [page, setPage]           = useState(1);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = tambah, obj = edit
  const [form, setForm]           = useState(EMPTY_FORM);
  const [formErr, setFormErr]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass]   = useState(false);

  // Confirm delete
  const [confirmDel, setConfirmDel] = useState(null);
  const [deleting, setDeleting]     = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [accRes, wisRes] = await Promise.all([
        api.get("/super-admin/akun"),    // GET semua akun
        api.get("/super-admin/wisata"),  // GET semua wisata untuk dropdown
      ]);
      setAccounts(accRes.data.data || accRes.data || []);
      setWisataList(wisRes.data.data || wisRes.data || []);
    } catch {
      showToast("Gagal memuat data. Coba refresh halaman.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Toast helper ───────────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = accounts.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.email?.toLowerCase().includes(q) ||
      a.username?.toLowerCase().includes(q) ||
      a.name?.toLowerCase().includes(q);
    const matchRole =
      filterRole === "semua" || a.role === filterRole;
    return matchSearch && matchRole;
  });

  useEffect(() => { setPage(1); }, [search, filterRole]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const total      = accounts.length;
  const superCount = accounts.filter((a) => a.role === "superadmin").length;
  const userCount = accounts.filter((a) => a.role === "user").length;
  const staffCount = accounts.filter((a) => a.role === "admin").length;

  const stats = [
    { icon: "fa-solid fa-users", label: "Total Akun",     num: total,      color: "var(--teal-600)", bg: "var(--teal-50)" },
    { icon: "fa-solid fa-crown", label: "Super Admin",    num: superCount, color: "#92400e",          bg: "rgba(212,168,83,.12)" },
    { icon: "fa-solid fa-user-tie", label: "User",       num: userCount, color: "var(--teal-700)", bg: "var(--teal-100)" },
    { icon: "fa-solid fa-mountain-sun", label: "Staff Wisata", num: staffCount, color: "#15803d",    bg: "#f0fdf4" },
  ];

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErr({});
    setShowPass(false);
    setModalOpen(true);
  };

  const openEdit = (acc) => {
    setEditTarget(acc);
    setForm({
      email: acc.email || "",
      username: acc.username || "",
      name: acc.name || "",
      password: "",
      role: acc.role || "admin",
      wisata_id: acc.wisata_id || "",
    });
    setFormErr({});
    setShowPass(false);
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const handleFormChange = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    setFormErr((e) => ({ ...e, [field]: "" }));
  };

  // Validate
  const validate = () => {
    const err = {};
    if (!form.email.trim())    err.email    = "Email wajib diisi.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) err.email = "Format email tidak valid.";
    if (!form.username.trim()) err.username = "Username wajib diisi.";
    if (!form.name.trim())     err.name     = "Nama lengkap wajib diisi.";
    if (!editTarget) {
        if (!form.password.trim()) {
            err.password = "Password wajib diisi untuk akun baru.";
        } else if (form.password.trim().length < 8) {
            err.password = "Password minimal 8 karakter.";
        }
    } else if (form.password.trim() && form.password.trim().length < 8) {
        err.password = "Password minimal 8 karakter.";
    }
    if (form.role === "admin" && !form.wisata_id) err.wisata_id = "Pilih destinasi wisata.";
    return err;
  };

  // Submit
  const handleSubmit = async () => {
    const err = validate();
    if (Object.keys(err).length) { setFormErr(err); return; }
    setSubmitting(true);
    try {
      const payload = { ...form, role: 'admin' };
      if (!payload.password) delete payload.password;
      if (payload.role !== "admin") delete payload.wisata_id;

      if (editTarget) {
        // PUT /api/superadmin/akun/{id}
        await api.post(`/super-admin/akun/${editTarget.id}`, payload);
        setAccounts((prev) =>
          prev.map((a) => (a.id === editTarget.id ? { ...a, ...payload, wisata: wisataList.find((w) => w.id == payload.wisata_id) } : a))
        );
        showToast(`Akun "${payload.name}" berhasil diperbarui.`);
      } else {
        // POST /api/superadmin/akun
        const res = await api.post("/super-admin/akun", payload);
        const newAcc = res.data.data || res.data;
        setAccounts((prev) => [newAcc, ...prev]);
        showToast(`Akun "${payload.name}" berhasil ditambahkan.`);
      }
      closeModal();
    } catch (e) {
      const msg = e.response?.data?.message || "Gagal menyimpan data.";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    const acc = confirmDel;
    setConfirmDel(null);
    setDeleting(true);
    try {
      await api.delete(`/super-admin/akun/${acc.id}`);
      setAccounts((prev) => prev.filter((a) => a.id !== acc.id));
      showToast(`Akun "${acc.name}" berhasil dihapus.`);
    } catch {
      showToast("Gagal menghapus akun.", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ── Role helpers ───────────────────────────────────────────────────────────
  const roleLabel = (r) =>
    r === "superadmin" ? "Super Admin" : r === "user" ? "User" : "Admin";

  const roleCls = (r) =>
    r === "superadmin" ? "ka-role--superadmin" : r === "user" ? "ka-role--admin" : "ka-role--staff";

  const roleIcon = (r) =>
    r === "superadmin" ? "fa-crown" : r === "user" ? "fa-user-tie" : "fa-mountain-sun";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SuperAdminLayout>
      <style>{css}</style>
      <div className="ka-page">

        {/* ── Page header ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "var(--teal-600)", display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <i className="fa-solid fa-users-gear" />
            Super Admin — Kelola Akun
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "var(--dark)" }}>
            Manajemen Akun Pengguna
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="ka-stats">
          {stats.map((s, i) => (
            <div className="ka-stat" key={i}>
              <div className="ka-stat__icon" style={{ background: s.bg, color: s.color }}>
                <i className={s.icon} />
              </div>
              <div>
                <div className="ka-stat__num">{s.num}</div>
                <div className="ka-stat__label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="ka-toolbar">
          <div className="ka-search-wrap">
            <i className="fa-solid fa-magnifying-glass ka-search-icon" />
            <input
              className="ka-search-input"
              type="text"
              placeholder="Cari nama, email, username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="ka-add-btn" onClick={openAdd}>
            <i className="fa-solid fa-plus" />
            Tambah Akun
          </button>
        </div>

        {/* ── Table ── */}
        <div className="ka-table-card">
          <div className="ka-table-head">
            <div className="ka-table-head-title">
              <i className="fa-solid fa-table-list" />
              Daftar Akun
              <span className="ka-count-badge">{filtered.length}</span>
            </div>
          </div>

          {loading ? (
            <div className="ka-table-wrap">
              <table className="ka-table">
                <thead>
                  <tr>
                    {["ID","Email","Username","Nama Lengkap","Role","Nama Wisata","Aksi"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="ka-skel">
                  {[...Array(6)].map((_, i) => (
                    <tr className="ka-skel-row" key={i}>
                      {[...Array(7)].map((_, j) => (
                        <td key={j}>
                          <div className="ka-skel-bar" style={{ width: j === 6 ? 80 : "80%", opacity: 1 - j * 0.05 }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : filtered.length === 0 ? (
            <div className="ka-empty">
              <i className="fa-solid fa-user-slash" />
              <p>Tidak ada akun{search ? ` untuk pencarian "${search}"` : ""}.</p>
            </div>
          ) : (
            <div className="ka-table-wrap">
              <table className="ka-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Username</th>
                    <th>Nama Lengkap</th>
                    <th>Role</th>
                    <th>Nama Wisata</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((acc) => (
                    <tr key={acc.id}>
                      <td>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", fontFamily: "monospace" }}>
                          #{acc.id}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{acc.email}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: "var(--teal-800)", fontSize: 13 }}>
                          @{acc.username}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{acc.name}</td>
                      <td>
                        <span className={`ka-role ${roleCls(acc.role)}`}>
                          <i className={`fa-solid ${roleIcon(acc.role)}`} style={{ fontSize: 10 }} />
                          {roleLabel(acc.role)}
                        </span>
                      </td>
                      <td style={{ color: acc.wisata?.nama? "var(--text-dark)" : "var(--text-muted)", fontSize: 13 }}>
                        {acc.wisata?.nama || <span style={{ fontStyle: "italic", opacity: .6 }}>—</span>}
                      </td>
                      <td>
                        <div className="ka-actions">
                          <button className="ka-act-btn ka-act-btn--edit" onClick={() => openEdit(acc)}>
                            <i className="fa-solid fa-pen-to-square" />
                            Edit
                          </button>
                          <button className="ka-act-btn ka-act-btn--del" onClick={() => setConfirmDel(acc)}>
                            <i className="fa-solid fa-trash" />
                            Hapus
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
            <div className="ka-pagination">
              <div className="ka-page-info">
                Menampilkan {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} dari {filtered.length} akun
              </div>
              <div className="ka-page-btns">
                <button className="ka-page-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                  <i className="fa-solid fa-chevron-left" style={{ fontSize: 11 }} />
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    className={`ka-page-btn${page === idx + 1 ? " active" : ""}`}
                    onClick={() => setPage(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button className="ka-page-btn" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
                  <i className="fa-solid fa-chevron-right" style={{ fontSize: 11 }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════ MODAL TAMBAH / EDIT ══════════════ */}
      {modalOpen && (
        <div className="ka-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="ka-modal">
            {/* Header */}
            <div className="ka-modal-header">
              <div className="ka-modal-header-left">
                <div className="ka-modal-header-icon">
                  <i className={`fa-solid ${editTarget ? "fa-user-pen" : "fa-user-plus"}`} />
                </div>
                <div>
                  <div className="ka-modal-title">
                    {editTarget ? "Edit Akun" : "Tambah Akun Baru"}
                  </div>
                  <div className="ka-modal-sub">
                    {editTarget
                      ? `Mengedit akun: ${editTarget.name}`
                      : "Lengkapi data untuk membuat akun baru"}
                  </div>
                </div>
              </div>
              <button className="ka-modal-close" onClick={closeModal}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Body */}
            <div className="ka-modal-body">
              {/* Informasi Akun */}
              <div className="ka-modal-section-label">Informasi Akun</div>

              <div className="ka-field">
                <label className="ka-label">
                  <i className="fa-solid fa-envelope" />
                  Email <span className="ka-required">*</span>
                </label>
                <div className="ka-input-wrap">
                  <i className="ka-input-icon fa-solid fa-envelope" />
                  <input
                    className={`ka-input${formErr.email ? " error" : ""}`}
                    type="email"
                    placeholder="contoh@email.com"
                    value={form.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                  />
                </div>
                {formErr.email && <span className="ka-error-msg"><i className="fa-solid fa-circle-exclamation" />{formErr.email}</span>}
              </div>

              <div className="ka-field-row">
                <div className="ka-field">
                  <label className="ka-label">
                    <i className="fa-solid fa-at" />
                    Username <span className="ka-required">*</span>
                  </label>
                  <div className="ka-input-wrap">
                    <i className="ka-input-icon fa-solid fa-at" />
                    <input
                      className={`ka-input${formErr.username ? " error" : ""}`}
                      type="text"
                      placeholder="username"
                      value={form.username}
                      onChange={(e) => handleFormChange("username", e.target.value)}
                    />
                  </div>
                  {formErr.username && <span className="ka-error-msg"><i className="fa-solid fa-circle-exclamation" />{formErr.username}</span>}
                </div>

                <div className="ka-field">
                  <label className="ka-label">
                    <i className="fa-solid fa-user" />
                    Nama Lengkap <span className="ka-required">*</span>
                  </label>
                  <div className="ka-input-wrap">
                    <i className="ka-input-icon fa-solid fa-user" />
                    <input
                      className={`ka-input${formErr.name ? " error" : ""}`}
                      type="text"
                      placeholder="Nama Lengkap"
                      value={form.name}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                    />
                  </div>
                  {formErr.name && <span className="ka-error-msg"><i className="fa-solid fa-circle-exclamation" />{formErr.name}</span>}
                </div>
              </div>

              <div className="ka-field">
                <label className="ka-label">
                  <i className="fa-solid fa-lock" />
                  Password {editTarget && <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>— kosongkan jika tidak ingin mengubah</span>}
                  {!editTarget && <span className="ka-required">*</span>}
                </label>
                <div className="ka-input-wrap">
                  <i className="ka-input-icon fa-solid fa-lock" />
                  <input
                    className={`ka-input${formErr.password ? " error" : ""}`}
                    type={showPass ? "text" : "password"}
                    placeholder={editTarget ? "Biarkan kosong jika tidak diubah" : "Minimal 8 karakter"}
                    value={form.password}
                    onChange={(e) => handleFormChange("password", e.target.value)}
                  />
                  <button type="button" className="ka-pass-toggle" onClick={() => setShowPass((s) => !s)}>
                    <i className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`} />
                  </button>
                </div>
                {formErr.password && <span className="ka-error-msg"><i className="fa-solid fa-circle-exclamation" />{formErr.password}</span>}
                {!formErr.password && form.password.length > 0 && (
                    <div style={{
                        fontSize: 11,
                        color: form.password.length >= 8 ? '#15803d' : '#e11d48',
                        display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                        <i className={`fa-solid ${form.password.length >= 8 ? 'fa-circle-check' : 'fa-circle-exclamation'}`} />
                        {form.password.length >= 8
                            ? 'Password memenuhi syarat'
                            : `Kurang ${8 - form.password.length} karakter lagi (minimal 8)`
                        }
                    </div>
                )}
              </div>

              <div className="ka-modal-divider" />
              {/* Role & Wisata */}
              <div className="ka-modal-section-label">Peran & Destinasi</div>

              <div className="ka-field">
                <label className="ka-label">
                  <i className="fa-solid fa-id-badge" />
                  Role
                </label>
                <div className="ka-input-wrap">
                  <i className="ka-input-icon fa-solid fa-id-badge" />
                  <input
                    className="ka-input"
                    type="text"
                    value="Admin"
                    disabled
                    style={{
                      background: 'var(--teal-50)',
                      color: 'var(--teal-700)',
                      fontWeight: 600,
                      cursor: 'not-allowed',
                      opacity: 1,
                    }}
                  />
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-lock" style={{ marginRight: 4 }} />
                  Role tidak dapat diubah — akun ini adalah Staff Admin Wisata
                </span>
              </div>

              {/* Nama Wisata — tampil hanya kalau role admin */}
              {form.role === "admin" && (
                <div className="ka-field">
                  <label className="ka-label">
                    <i className="fa-solid fa-mountain-sun" />
                    Nama Wisata <span className="ka-required">*</span>
                  </label>
                  <select
                    className={`ka-select${formErr.wisata_id ? " error" : ""}`}
                    value={form.wisata_id}
                    onChange={(e) => handleFormChange("wisata_id", e.target.value)}
                  >
                    <option value="">— Pilih Destinasi Wisata —</option>
                    {wisataList.map((w) => (
                      <option key={w.id} value={w.id}>{w.nama}</option>
                    ))}
                  </select>
                  {formErr.wisata_id && (
                    <span className="ka-error-msg">
                      <i className="fa-solid fa-circle-exclamation" />{formErr.wisata_id}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="ka-modal-footer">
              <button className="ka-modal-cancel" onClick={closeModal} disabled={submitting}>
                Batal
              </button>
              <button className="ka-modal-submit" onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="ka-spinner" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <i className={`fa-solid ${editTarget ? "fa-floppy-disk" : "fa-plus"}`} />
                    {editTarget ? "Simpan Perubahan" : "Tambah Akun"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ CONFIRM DELETE ══════════════ */}
      {confirmDel && (
        <div className="ka-confirm-overlay">
          <div className="ka-confirm-box">
            <div className="ka-confirm-icon">
              <i className="fa-solid fa-trash" />
            </div>
            <div className="ka-confirm-title">Hapus Akun?</div>
            <div className="ka-confirm-desc">
              Akun <strong>{confirmDel.name}</strong> ({confirmDel.email}) akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.
            </div>
            <div className="ka-confirm-btns">
              <button className="ka-confirm-btn ka-confirm-btn--cancel" onClick={() => setConfirmDel(null)}>
                Batal
              </button>
              <button className="ka-confirm-btn ka-confirm-btn--del" onClick={handleDelete}>
                <i className="fa-solid fa-trash" style={{ marginRight: 6 }} />
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ TOAST ══════════════ */}
      {toast && (
        <div className={`ka-toast ka-toast--${toast.type}`}>
          <i className={`fa-solid ${toast.type === "success" ? "fa-circle-check" : "fa-triangle-exclamation"}`} />
          {toast.msg}
        </div>
      )}
    </SuperAdminLayout>
  );
}