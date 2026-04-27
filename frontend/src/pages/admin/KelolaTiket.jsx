import { useState, useEffect, useCallback } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../api/axios"; // sesuaikan path axios kamu

// ── Style ──────────────────────────────────────────────────────────────────
const css = `
  .kt-page { animation: fadeInUp .45s ease both; }
  @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

  /* Stats row */
  .kt-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }
  .kt-stat {
    background: white;
    border-radius: 16px;
    border: 1px solid var(--border);
    padding: 20px 20px 18px;
    box-shadow: var(--shadow-sm);
    display: flex; align-items: center; gap: 14px;
    transition: var(--transition);
  }
  .kt-stat:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
  .kt-stat__icon {
    width: 46px; height: 46px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 19px; flex-shrink: 0;
  }
  .kt-stat__num {
    font-family: var(--font-display);
    font-size: 26px; font-weight: 700; color: var(--dark); line-height: 1;
  }
  .kt-stat__label { font-size: 12px; color: var(--text-muted); margin-top: 3px; }

  /* Toolbar */
  .kt-toolbar {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 20px; flex-wrap: wrap;
  }
  .kt-search-wrap {
    position: relative; flex: 1; max-width: 360px;
  }
  .kt-search-icon {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    color: var(--teal-400); font-size: 13px; pointer-events: none;
  }
  .kt-search-input {
    width: 100%; padding: 10px 16px 10px 38px;
    border-radius: 50px; border: 1.5px solid var(--border);
    background: white; font-family: var(--font-body);
    font-size: 13.5px; color: var(--dark); outline: none;
    transition: var(--transition);
  }
  .kt-search-input:focus {
    border-color: var(--teal-500);
    box-shadow: 0 0 0 3px rgba(64,114,175,.1);
  }
  .kt-search-input::placeholder { color: var(--text-muted); }

  /* Filter tabs */
  .kt-filter-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
  .kt-filter-tab {
    padding: 7px 16px; border-radius: 50px;
    border: 1.5px solid var(--border);
    background: white; font-family: var(--font-body);
    font-size: 12.5px; font-weight: 500; color: var(--text-muted);
    cursor: pointer; transition: var(--transition);
  }
  .kt-filter-tab:hover { border-color: var(--teal-400); color: var(--teal-700); }
  .kt-filter-tab.active {
    border-color: var(--teal-600); background: var(--teal-600);
    color: white; font-weight: 600;
  }

  /* Table card */
  .kt-table-card {
    background: white;
    border-radius: 20px;
    border: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }
  .kt-table-head {
    padding: 18px 24px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  .kt-table-head-title {
    font-family: var(--font-display);
    font-size: 16px; font-weight: 700; color: var(--dark);
    display: flex; align-items: center; gap: 9px;
  }
  .kt-table-head-title i { color: var(--teal-500); font-size: 15px; }
  .kt-count-badge {
    background: var(--teal-50); color: var(--teal-700);
    padding: 3px 10px; border-radius: 50px;
    font-size: 12px; font-weight: 700;
  }

  /* Table */
  .kt-table-wrap { overflow-x: auto; }
  table.kt-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    min-width: 900px;
  }
  .kt-table thead tr {
    background: var(--teal-50);
  }
  .kt-table th {
    padding: 12px 16px;
    text-align: left;
    font-size: 11px; font-weight: 700;
    letter-spacing: 1px; text-transform: uppercase;
    color: var(--teal-700);
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
  }
  .kt-table td {
    padding: 13px 16px;
    border-bottom: 1px solid var(--teal-50);
    color: var(--text-dark);
    vertical-align: middle;
  }
  .kt-table tbody tr { transition: background .15s; }
  .kt-table tbody tr:hover { background: var(--cream); }
  .kt-table tbody tr:last-child td { border-bottom: none; }

  /* Kode order */
  .kt-kode {
    font-family: 'DM Mono', 'Courier New', monospace;
    font-size: 12px; font-weight: 600;
    color: var(--teal-700);
    background: var(--teal-50);
    padding: 3px 9px; border-radius: 6px;
    letter-spacing: .5px;
  }

  /* Status badge */
  .kt-status {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 12px; border-radius: 50px;
    font-size: 11.5px; font-weight: 700; letter-spacing: .3px;
    white-space: nowrap;
  }
  .kt-status--aktif {
    background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;
  }
  .kt-status--digunakan {
    background: var(--teal-50); color: var(--teal-700); border: 1px solid var(--teal-100);
  }
  .kt-status--aktif i { color: #16a34a; }
  .kt-status--digunakan i { color: var(--teal-500); }

  /* Aksi button */
  .kt-aksi-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 8px;
    font-size: 12px; font-weight: 600;
    cursor: pointer; border: none;
    font-family: var(--font-body);
    transition: var(--transition);
    white-space: nowrap;
  }
  .kt-aksi-btn--use {
    background: var(--teal-600); color: white;
  }
  .kt-aksi-btn--use:hover { background: var(--teal-700); transform: translateY(-1px); }
  .kt-aksi-btn--used {
    background: var(--teal-50); color: var(--text-muted);
    border: 1px solid var(--border); cursor: default;
  }
  .kt-aksi-btn:disabled { opacity: .6; cursor: not-allowed; transform: none !important; }

  /* Loading spinner */
  .kt-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin .7s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Pagination */
  .kt-pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px;
    border-top: 1px solid var(--border);
    flex-wrap: wrap; gap: 12px;
  }
  .kt-page-info { font-size: 13px; color: var(--text-muted); }
  .kt-page-btns { display: flex; gap: 6px; }
  .kt-page-btn {
    width: 34px; height: 34px; border-radius: 8px;
    border: 1.5px solid var(--border); background: white;
    font-size: 13px; font-weight: 600; color: var(--text-dark);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: var(--transition); font-family: var(--font-body);
  }
  .kt-page-btn:hover { border-color: var(--teal-400); color: var(--teal-700); }
  .kt-page-btn.active { background: var(--teal-600); border-color: var(--teal-600); color: white; }
  .kt-page-btn:disabled { opacity: .4; cursor: not-allowed; }

  /* Empty */
  .kt-empty {
    text-align: center; padding: 64px 0;
    display: flex; flex-direction: column; align-items: center; gap: 12px;
  }
  .kt-empty i { font-size: 44px; color: var(--teal-200); }
  .kt-empty p { font-size: 14px; color: var(--text-muted); }

  /* Toast */
  .kt-toast {
    position: fixed; bottom: 28px; right: 28px; z-index: 9999;
    background: var(--teal-800); color: white;
    padding: 14px 20px; border-radius: 14px;
    font-size: 13.5px; font-weight: 500;
    display: flex; align-items: center; gap: 10px;
    box-shadow: 0 8px 30px rgba(0,0,0,.25);
    animation: slideUp .3s ease;
    max-width: 340px;
  }
  .kt-toast--success { background: #15803d; }
  .kt-toast--error   { background: #b91c1c; }
  @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

  /* Confirm dialog */
  .kt-confirm-overlay {
    position: fixed; inset: 0; z-index: 4000;
    background: rgba(10,29,61,.65); backdrop-filter: blur(5px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
    animation: fadeIn .2s ease;
  }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  .kt-confirm-box {
    background: white; border-radius: 20px;
    padding: 32px 28px; max-width: 400px; width: 100%;
    box-shadow: 0 24px 60px rgba(0,0,0,.2);
    animation: scaleIn .25s ease;
  }
  @keyframes scaleIn { from { opacity:0; transform:scale(.95); } to { opacity:1; transform:scale(1); } }
  .kt-confirm-icon {
    width: 54px; height: 54px; border-radius: 16px;
    background: var(--teal-50); color: var(--teal-600);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; margin-bottom: 18px;
  }
  .kt-confirm-title {
    font-family: var(--font-display);
    font-size: 19px; font-weight: 700; color: var(--dark);
    margin-bottom: 10px;
  }
  .kt-confirm-desc { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px; }
  .kt-confirm-btns { display: flex; gap: 10px; }
  .kt-confirm-btn {
    flex: 1; padding: 11px; border-radius: 10px;
    font-size: 14px; font-weight: 600;
    font-family: var(--font-body);
    cursor: pointer; transition: var(--transition); border: none;
  }
  .kt-confirm-btn--cancel {
    background: var(--teal-50); color: var(--text-muted);
    border: 1.5px solid var(--border);
  }
  .kt-confirm-btn--cancel:hover { background: var(--teal-100); }
  .kt-confirm-btn--confirm {
    background: var(--teal-600); color: white;
  }
  .kt-confirm-btn--confirm:hover { background: var(--teal-700); }

  @media (max-width: 768px) {
    .kt-stats { grid-template-columns: repeat(2, 1fr); }
    .kt-toolbar { flex-direction: column; align-items: stretch; }
    .kt-search-wrap { max-width: 100%; }
  }
`;

// ── Helpers ────────────────────────────────────────────────────────────────
const rupiah = (n) => "Rp " + Number(n).toLocaleString("id-ID");

const PER_PAGE = 10;

// ── Component ──────────────────────────────────────────────────────────────
export default function KelolaTicket() {
  const [tickets, setTickets]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilter] = useState("semua");
  const [page, setPage]           = useState(1);
  const [updating, setUpdating]   = useState(null); // id tiket yg sedang diproses
  const [toast, setToast]         = useState(null);
  const [confirm, setConfirm]     = useState(null); // { ticket }

  useEffect(() => { fetchTickets(); }, []);

const fetchTickets = async () => {
    setLoading(true);
    try {
        const res = await api.get('/admin/tiket');
        setTickets(res.data.data || res.data || []);
    } catch (err) {
        showToast('Gagal memuat data tiket.', 'error');
    } finally {
        setLoading(false);
    }
};

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const handleGunakanTicket = async (ticket) => {
    setConfirm(ticket);
  };

  const confirmGunakanTicket = async () => {
    const ticket = confirm;
    setConfirm(null);
    setUpdating(ticket.id);
    try {
        await api.patch(`/admin/tiket/${ticket.kode_order}/gunakan`);
        setTickets((prev) =>
            prev.map((t) =>
                t.id === ticket.id ? { ...t, status_tiket: 'Digunakan' } : t
            )
        );
        showToast(`Tiket ${ticket.kode_order} berhasil ditandai digunakan.`, 'success');
    } catch (err) {
        const msg = err.response?.data?.message || 'Gagal memperbarui status tiket.';
        showToast(msg, 'error');
    } finally {
        setUpdating(null);
    }
};

  // ── Filter & Search ──
  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      t.kode_order?.toLowerCase().includes(q) ||
      t.user?.name?.toLowerCase().includes(q) ||
      t.metode_pembayaran?.toLowerCase().includes(q);

    const matchStatus =
      filterStatus === "semua" ||
      (filterStatus === "aktif" && t.status_tiket?.toLowerCase() === "aktif") ||
      (filterStatus === "digunakan" && t.status_tiket?.toLowerCase() === "digunakan");

    return matchSearch && matchStatus;
  });

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, filterStatus]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Stats ──
  const total    = tickets.length;
  const aktif    = tickets.filter((t) => t.status_tiket?.toLowerCase() === "aktif").length;
  const digunakan = tickets.filter((t) => t.status_tiket?.toLowerCase() === "digunakan").length;
  const revenue  = tickets.reduce((sum, t) => sum + Number(t.total_harga || 0), 0);

  const stats = [
    { icon: "fa-solid fa-ticket", label: "Total Tiket",  num: total,  color: "var(--teal-600)", bg: "var(--teal-50)" },
    { icon: "fa-solid fa-circle-check", label: "Tiket Aktif",  num: aktif,  color: "#16a34a", bg: "#dcfce7" },
    { icon: "fa-solid fa-check-double", label: "Sudah Digunakan", num: digunakan, color: "var(--teal-700)", bg: "var(--teal-100)" },
    { icon: "fa-solid fa-money-bill-wave", label: "Total Pendapatan", num: rupiah(revenue), color: "#92400e", bg: "#fffbeb", wide: true },
  ];

  return (
    <AdminLayout>
      <style>{css}</style>
      <div className="kt-page">

        {/* ── Page header ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "var(--teal-600)", display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <i className="fa-solid fa-ticket" />
            Kelola Tiket
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "var(--dark)" }}>
            Manajemen Tiket Pengunjung
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="kt-stats">
          {stats.map((s, i) => (
            <div className="kt-stat" key={i}>
              <div className="kt-stat__icon" style={{ background: s.bg, color: s.color }}>
                <i className={s.icon} />
              </div>
              <div>
                <div className="kt-stat__num" style={{ fontSize: s.wide ? 17 : undefined }}>{s.num}</div>
                <div className="kt-stat__label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="kt-toolbar">
          <div className="kt-search-wrap">
            <i className="fa-solid fa-magnifying-glass kt-search-icon" />
            <input
              className="kt-search-input"
              type="text"
              placeholder="Cari kode order, nama user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="kt-filter-tabs">
            {["semua", "aktif", "digunakan"].map((f) => (
              <button
                key={f}
                className={`kt-filter-tab${filterStatus === f ? " active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "semua" ? "Semua" : f === "aktif" ? "Aktif" : "Digunakan"}
              </button>
            ))}
          </div>
          <button
            onClick={fetchTickets}
            style={{
              padding: "8px 16px", borderRadius: 50, border: "1.5px solid var(--border)",
              background: "white", color: "var(--teal-700)", fontFamily: "var(--font-body)",
              fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
              transition: "var(--transition)"
            }}
          >
            <i className="fa-solid fa-rotate-right" />
            Refresh
          </button>
        </div>

        {/* ── Table ── */}
        <div className="kt-table-card">
          <div className="kt-table-head">
            <div className="kt-table-head-title">
              <i className="fa-solid fa-list" />
              Daftar Tiket
              <span className="kt-count-badge">{filtered.length}</span>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: "48px 0", textAlign: "center" }}>
              <div className="kt-spinner" style={{ width: 30, height: 30, borderWidth: 3, borderTopColor: "var(--teal-600)", borderColor: "var(--teal-100)", margin: "0 auto" }} />
              <p style={{ marginTop: 14, fontSize: 13, color: "var(--text-muted)" }}>Memuat data tiket...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="kt-empty">
              <i className="fa-solid fa-ticket-slash" />
              <p>Tidak ada tiket{search ? ` untuk "${search}"` : ""}.</p>
            </div>
          ) : (
            <div className="kt-table-wrap">
              <table className="kt-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Kode Order</th>
                    <th>Nama Pengunjung</th>
                    <th>Tgl Kunjungan</th>
                    <th>Dewasa</th>
                    <th>Anak</th>
                    <th>Total Harga</th>
                    <th>Metode Bayar</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((t, i) => {
                    const isAktif = t.status_tiket?.toLowerCase() === "aktif";
                    const isUpdating = updating === t.id;
                    return (
                      <tr key={t.id}>
                        <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                          {(page - 1) * PER_PAGE + i + 1}
                        </td>
                        <td><span className="kt-kode">{t.kode_order}</span></td>
                        <td style={{ fontWeight: 600 }}>
                          {t.user?.name || "—"}
                        </td>
                        <td style={{ color: "var(--text-muted)" }}>
                          {t.tanggal_kunjungan
                            ? new Date(t.tanggal_kunjungan).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                            : "—"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span style={{ fontWeight: 600 }}>{t.jumlah_dewasa}</span>
                          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 3 }}>org</span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span style={{ fontWeight: 600 }}>{t.jumlah_anak}</span>
                          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 3 }}>org</span>
                        </td>
                        <td style={{ fontWeight: 700, color: "var(--teal-700)" }}>
                          {rupiah(t.total_harga)}
                        </td>
                        <td style={{ color: "var(--text-muted)", fontSize: 12.5 }}>
                          {t.metode_pembayaran || "—"}
                        </td>
                        <td>
                          <span className={`kt-status kt-status--${isAktif ? "aktif" : "digunakan"}`}>
                            <i className={`fa-solid ${isAktif ? "fa-circle-dot" : "fa-circle-check"}`} />
                            {isAktif ? "Aktif" : "Digunakan"}
                          </span>
                        </td>
                        <td>
                          {isAktif ? (
                            <button
                              className="kt-aksi-btn kt-aksi-btn--use"
                              onClick={() => handleGunakanTicket(t)}
                              disabled={isUpdating}
                            >
                              {isUpdating ? (
                                <span className="kt-spinner" />
                              ) : (
                                <i className="fa-solid fa-stamp" />
                              )}
                              Tandai Digunakan
                            </button>
                          ) : (
                            <button className="kt-aksi-btn kt-aksi-btn--used" disabled>
                              <i className="fa-solid fa-check" />
                              Sudah Digunakan
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="kt-pagination">
              <div className="kt-page-info">
                Menampilkan {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} dari {filtered.length} tiket
              </div>
              <div className="kt-page-btns">
                <button
                  className="kt-page-btn"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                >
                  <i className="fa-solid fa-chevron-left" style={{ fontSize: 11 }} />
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    className={`kt-page-btn${page === idx + 1 ? " active" : ""}`}
                    onClick={() => setPage(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  className="kt-page-btn"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                >
                  <i className="fa-solid fa-chevron-right" style={{ fontSize: 11 }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm Dialog ── */}
      {confirm && (
        <div className="kt-confirm-overlay">
          <div className="kt-confirm-box">
            <div className="kt-confirm-icon">
              <i className="fa-solid fa-stamp" />
            </div>
            <div className="kt-confirm-title">Tandai Tiket Digunakan?</div>
            <div className="kt-confirm-desc">
              Tiket <strong>{confirm.kode_order}</strong> atas nama <strong>{confirm.user?.name || "pengunjung"}</strong> akan ditandai sebagai <strong>Digunakan</strong>. Tindakan ini tidak dapat dibatalkan.
            </div>
            <div className="kt-confirm-btns">
              <button className="kt-confirm-btn kt-confirm-btn--cancel" onClick={() => setConfirm(null)}>
                Batal
              </button>
              <button className="kt-confirm-btn kt-confirm-btn--confirm" onClick={confirmGunakanTicket}>
                <i className="fa-solid fa-check" style={{ marginRight: 6 }} />
                Ya, Tandai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`kt-toast kt-toast--${toast.type}`}>
          <i className={`fa-solid ${toast.type === "success" ? "fa-circle-check" : "fa-triangle-exclamation"}`} />
          {toast.msg}
        </div>
      )}
    </AdminLayout>
  );
}