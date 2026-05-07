import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const LOGO_SRC = `/img/logo/logo_smartcity.png`;

const STYLE = `
  .sal-wrap {
    min-height: 100vh;
    background: linear-gradient(135deg, #0f2952 0%, #1a3a6e 50%, #1e4080 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
    position: relative;
    overflow: hidden;
    padding: 20px;
    box-sizing: border-box;
  }
  .sal-deco1 {
    position: absolute; width: 500px; height: 500px;
    border-radius: 50%; background: rgba(37,99,235,0.12);
    top: -150px; right: -100px; pointer-events: none;
  }
  .sal-deco2 {
    position: absolute; width: 300px; height: 300px;
    border-radius: 50%; background: rgba(37,99,235,0.08);
    bottom: -80px; left: -80px; pointer-events: none;
  }
  .sal-card {
    display: flex;
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 25px 60px rgba(0,0,0,0.3);
    width: 900px;
    max-width: 100%;
    min-height: 500px;
    position: relative;
    z-index: 1;
  }
  .sal-left {
    background: linear-gradient(160deg, #0f2952 0%, #1a3a6e 100%);
    flex: 0 0 380px;
    padding: 48px 40px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .sal-right {
    flex: 1;
    padding: 48px 44px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .sal-input {
    width: 100%;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;
    font-family: inherit;
    background: white;
    color: #0f172a;
  }
  .sal-input:focus { border-color: #2563eb; }
  .sal-btn {
    width: 100%;
    padding: 13px;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.3px;
    box-shadow: 0 4px 14px rgba(37,99,235,0.35);
    transition: all 0.2s;
    font-family: inherit;
    cursor: pointer;
  }

  @media (max-width: 680px) {
    .sal-wrap { padding: 16px; align-items: flex-start; padding-top: 32px; }
    .sal-card { flex-direction: column; min-height: unset; border-radius: 16px; }
    .sal-left { flex: none; padding: 28px 24px 24px; }
    .sal-left-features { display: none; }
    .sal-left-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 0 !important;
    }
    .sal-left-title { font-size: 17px !important; margin-bottom: 3px !important; }
    .sal-left-desc  { font-size: 13px !important; margin-bottom: 0 !important; }
    .sal-left-footer { display: none; }
    .sal-right { padding: 24px 20px 32px; }
    .sal-badge { margin-bottom: 14px !important; }
    .sal-title { font-size: 22px !important; margin-bottom: 4px !important; }
    .sal-sub   { margin-bottom: 22px !important; }
  }

  @media (max-width: 380px) {
    .sal-wrap  { padding: 12px; padding-top: 20px; }
    .sal-right { padding: 20px 16px 28px; }
    .sal-left  { padding: 22px 18px 20px; }
  }
`;

const FEATURES = [
  { icon: "fa-users-gear",   text: "Manajemen Akun Admin" },
  { icon: "fa-mountain-sun", text: "Data Wisata & Event" },
  { icon: "fa-newspaper",    text: "Berita & Pengumuman" },
  { icon: "fa-chart-bar",    text: "Statistik Kota" },
  { icon: "fa-building",     text: "Infrastruktur Smart City" },
];

export default function SuperAdminLogin() {
  const currentYear = new Date().getFullYear();
  const [form,     setForm]     = useState({ username: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("superadmin_token")) {
      navigate("/super-admin", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/super-admin/login", form);
      localStorage.setItem("superadmin_token", res.data.token);
      localStorage.setItem("superadmin_user", JSON.stringify(res.data.user || null));
      navigate("/super-admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal. Periksa kredensial Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sal-wrap">
      <style>{STYLE}</style>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Libre+Baskerville:wght@700&display=swap" rel="stylesheet" />

      <div className="sal-deco1" />
      <div className="sal-deco2" />

      <div className="sal-card">

        {/* ── Left panel ── */}
        <div className="sal-left">
          <div>
            <div className="sal-left-header" style={{ marginBottom: 40 }}>
              <img
                src={LOGO_SRC}
                alt="Logo Smart City Purbalingga"
                style={{ width: 56, height: 56, objectFit: "contain", flexShrink: 0 }}
              />
              <div>
                <h2
                  className="sal-left-title"
                  style={{ color: "white", fontSize: 26, fontWeight: 700, marginBottom: 10, lineHeight: 1.3, fontFamily: "'Libre Baskerville', serif" }}
                >
                  Panel Super Administrator
                </h2>
                <p
                  className="sal-left-desc"
                  style={{ color: "#93bbf5", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}
                >
                  Kelola seluruh data portal Purbalingga
                </p>
              </div>
            </div>

            <div className="sal-left-features">
              {FEATURES.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className={`fa-solid ${f.icon}`} style={{ color: "#93bbf5", fontSize: 13 }} />
                  </div>
                  <span style={{ color: "#cbd5e1", fontSize: 13 }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sal-left-footer" style={{ color: "#5e8fd4", fontSize: 12 }}>
            © {currentYear} Purbalingga Smart City
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="sal-right">
          <div
            className="sal-badge"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 20, padding: "4px 12px", marginBottom: 20, alignSelf: "flex-start" }}
          >
            <i className="fa-solid fa-shield-halved" style={{ color: "#2563eb", fontSize: 11 }} />
            <span style={{ color: "#2563eb", fontSize: 12, fontWeight: 600 }}>Super Admin Access</span>
          </div>

          <h1
            className="sal-title"
            style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", marginBottom: 6, fontFamily: "'Libre Baskerville', serif" }}
          >
            Selamat Datang
          </h1>
          <p
            className="sal-sub"
            style={{ color: "#64748b", fontSize: 14, marginBottom: 32 }}
          >
            Masuk ke panel administrator untuk melanjutkan
          </p>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#ef4444", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <i className="fa-solid fa-circle-exclamation" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Username
              </label>
              <div style={{ position: "relative" }}>
                <i className="fa-solid fa-user" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14 }} />
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Masukkan username"
                  required
                  className="sal-input"
                  style={{ padding: "12px 14px 12px 40px" }}
                  onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                  onBlur={(e)  => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <i className="fa-solid fa-lock" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14 }} />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Masukkan password"
                  required
                  className="sal-input"
                  style={{ padding: "12px 40px 12px 40px" }}
                  onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                  onBlur={(e)  => e.target.style.borderColor = "#e2e8f0"}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0 }}
                >
                  <i className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`} style={{ fontSize: 14 }} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="sal-btn"
              style={{ background: loading ? "#94a3b8" : "linear-gradient(135deg, #1e3a6e, #2563eb)", cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading
                ? <span><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Memproses...</span>
                : <span><i className="fa-solid fa-right-to-bracket" style={{ marginRight: 8 }} />Masuk sebagai Super Admin</span>
              }
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}