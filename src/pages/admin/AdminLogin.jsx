import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const BACKEND_URL = (import.meta.env.VITE_APP_URL || import.meta.env.VITE_API_URL || "https://apismartcity.qode.my.id").replace(/\/$/, "");
const LOGO_SRC = `/img/logo/logo_smartcity.png`;

const STYLE = `
  .al-wrap {
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
  .al-deco1 {
    position: absolute; width: 500px; height: 500px;
    border-radius: 50%; background: rgba(37,99,235,0.12);
    top: -150px; right: -100px; pointer-events: none;
  }
  .al-deco2 {
    position: absolute; width: 300px; height: 300px;
    border-radius: 50%; background: rgba(37,99,235,0.08);
    bottom: -80px; left: -80px; pointer-events: none;
  }
  .al-card {
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
  .al-left {
    background: linear-gradient(160deg, #0f2952 0%, #1a3a6e 100%);
    flex: 0 0 360px;
    padding: 48px 40px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .al-right {
    flex: 1;
    padding: 48px 44px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .al-input {
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
  .al-input:focus { border-color: #2563eb; }
  .al-btn {
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

  /* ── mobile ── */
  @media (max-width: 680px) {
    .al-wrap { padding: 16px; align-items: flex-start; padding-top: 32px; }
    .al-card { flex-direction: column; min-height: unset; border-radius: 16px; }
    .al-left {
      flex: none;
      padding: 28px 24px 24px;
    }
    .al-left-features { display: none; }
    .al-left-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 0 !important;
    }
    .al-left-title { font-size: 18px !important; margin-bottom: 4px !important; }
    .al-left-desc { font-size: 13px !important; margin-bottom: 0 !important; }
    .al-left-footer { display: none; }
    .al-right { padding: 24px 20px 32px; }
    .al-right-badge { margin-bottom: 14px !important; }
    .al-right-title { font-size: 22px !important; margin-bottom: 4px !important; }
    .al-right-sub { margin-bottom: 22px !important; }
  }

  @media (max-width: 380px) {
    .al-wrap { padding: 12px; padding-top: 20px; }
    .al-right { padding: 20px 16px 28px; }
    .al-left { padding: 22px 18px 20px; }
  }
`;

export default function AdminLogin() {
  const currentYear = new Date().getFullYear();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/admin/login", form);
      localStorage.setItem("admin_token", res.data.token);
      localStorage.setItem("admin_user", JSON.stringify(res.data.user));
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal. Periksa kredensial Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="al-wrap">
      <style>{STYLE}</style>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Libre+Baskerville:wght@700&display=swap" rel="stylesheet" />

      <div className="al-deco1" />
      <div className="al-deco2" />

      <div className="al-card">
        {/* ── Left panel ── */}
        <div className="al-left">
          <div>
            {/* Header: logo + title — pada mobile tampil horizontal */}
            <div className="al-left-header" style={{ marginBottom: 40 }}>
              <img
                src={LOGO_SRC}
                alt="Logo Smart City Purbalingga"
                style={{ width: 56, height: 56, objectFit: "contain", flexShrink: 0 }}
              />
              <div>
                <h2
                  className="al-left-title"
                  style={{ color: "white", fontSize: 26, fontWeight: 700, marginBottom: 8, lineHeight: 1.3, fontFamily: "'Libre Baskerville', serif" }}
                >
                  Panel Admin
                </h2>
                <p
                  className="al-left-desc"
                  style={{ color: "#93bbf5", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}
                >
                  Kelola tiket & wisata Purbalingga
                </p>
              </div>
            </div>

            {/* Feature list — hidden on mobile */}
            <div className="al-left-features">
              {[
                { icon: "fa-mountain-sun", text: "Informasi Wisata" },
                { icon: "fa-ticket",       text: "Kelola Tiket" },
                { icon: "fa-qrcode",       text: "Scan Tiket" },
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className={`fa-solid ${f.icon}`} style={{ color: "#93bbf5", fontSize: 13 }} />
                  </div>
                  <span style={{ color: "#cbd5e1", fontSize: 13 }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="al-left-footer" style={{ color: "#5e8fd4", fontSize: 12 }}>
            © {currentYear} Purbalingga Smart City
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="al-right">
          <div
            className="al-right-badge"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 20, padding: "4px 12px", marginBottom: 20, alignSelf: "flex-start" }}
          >
            <i className="fa-solid fa-shield-halved" style={{ color: "#2563eb", fontSize: 11 }} />
            <span style={{ color: "#2563eb", fontSize: 12, fontWeight: 600 }}>Admin Access</span>
          </div>

          <h1
            className="al-right-title"
            style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", marginBottom: 6, fontFamily: "'Libre Baskerville', serif" }}
          >
            Selamat Datang
          </h1>
          <p
            className="al-right-sub"
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
                Email atau Username
              </label>
              <div style={{ position: "relative" }}>
                <i className="fa-solid fa-user" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14 }} />
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Masukkan username atau email"
                  required
                  className="al-input"
                  style={{ padding: "12px 14px 12px 40px" }}
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
                  className="al-input"
                  style={{ padding: "12px 40px 12px 40px" }}
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
              className="al-btn"
              style={{ background: loading ? "#94a3b8" : "linear-gradient(135deg, #1e3a6e, #2563eb)", cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading
                ? <span><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Memproses...</span>
                : <span><i className="fa-solid fa-right-to-bracket" style={{ marginRight: 8 }} />Masuk sebagai Admin</span>
              }
            </button>
          </form>

          {/* Copyright — hanya muncul di mobile sebagai pengganti left panel footer */}
          <p style={{ marginTop: 24, fontSize: 11, color: "#94a3b8", textAlign: "center", display: "none" }} className="al-mobile-footer">
            © {currentYear} Purbalingga Smart City
          </p>
        </div>
      </div>
    </div>
  );
}