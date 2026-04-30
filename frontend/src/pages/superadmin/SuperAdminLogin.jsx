import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const BACKEND_URL = (import.meta.env.VITE_APP_URL || import.meta.env.VITE_API_URL || "https://apismartcity.qode.my.id").replace(/\/$/, "");
const LOGO_SRC = `${BACKEND_URL}/storage/logo/logo_smartcity.png`;

export default function SuperAdminLogin() {
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
      const res = await api.post("/superadmin/login", form);
      localStorage.setItem("superadmin_token", res.data.token);
      navigate("/superadmin");
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal. Periksa kredensial Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f2952 0%, #1a3a6e 50%, #1e4080 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Libre+Baskerville:wght@700&display=swap" rel="stylesheet" />

      {/* BG Decorations */}
      <div style={{
        position: "absolute", width: "500px", height: "500px",
        borderRadius: "50%", background: "rgba(37,99,235,0.12)",
        top: "-150px", right: "-100px", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: "300px", height: "300px",
        borderRadius: "50%", background: "rgba(37,99,235,0.08)",
        bottom: "-80px", left: "-80px", pointerEvents: "none",
      }} />

      <div style={{
        display: "flex",
        background: "white",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
        width: "900px",
        maxWidth: "95vw",
        minHeight: "500px",
      }}>
        {/* Left Panel */}
        <div style={{
          background: "linear-gradient(160deg, #0f2952 0%, #1a3a6e 100%)",
          flex: "0 0 380px",
          padding: "48px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" }}>
              <img
                src={LOGO_SRC}
                alt="Logo Smart City Purbalingga"
                style={{ width: "64px", height: "64px", objectFit: "contain", display: "block" }}
              />
            </div>

            <h2 style={{ color: "white", fontSize: "26px", fontWeight: 700, marginBottom: "12px", lineHeight: 1.3, fontFamily: "'Libre Baskerville', serif" }}>
              Panel Super Administrator
            </h2>
            <p style={{ color: "#93bbf5", fontSize: "14px", lineHeight: 1.7, marginBottom: "32px" }}>
              Akses penuh untuk mengelola seluruh data portal informasi Kabupaten Purbalingga.
            </p>

            {[
              { icon: "fa-users-gear", text: "Manajemen Akun Admin" },
              { icon: "fa-mountain-sun", text: "Data Wisata & Event" },
              { icon: "fa-newspaper", text: "Berita & Pengumuman" },
              { icon: "fa-chart-bar", text: "Statistik Kota" },
              { icon: "fa-building", text: "Infrastruktur Smart City" },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{
                  width: "32px", height: "32px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <i className={`fa-solid ${f.icon}`} style={{ color: "#93bbf5", fontSize: "13px" }} />
                </div>
                <span style={{ color: "#cbd5e1", fontSize: "13px" }}>{f.text}</span>
              </div>
            ))}
          </div>

          <div style={{ color: "#5e8fd4", fontSize: "12px" }}>
            © {currentYear} Purbalingga Smart City
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ flex: 1, padding: "48px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ marginBottom: "8px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "20px",
              padding: "4px 12px",
              marginBottom: "20px",
            }}>
              <i className="fa-solid fa-shield-halved" style={{ color: "#2563eb", fontSize: "11px" }} />
              <span style={{ color: "#2563eb", fontSize: "12px", fontWeight: 600 }}>Super Admin Access</span>
            </div>
          </div>

          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#0f172a", marginBottom: "6px", fontFamily: "'Libre Baskerville', serif" }}>
            Selamat Datang
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "32px" }}>
            Masuk ke panel administrator untuk melanjutkan
          </p>

          {error && (
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "10px",
              padding: "12px 16px",
              marginBottom: "20px",
              color: "#ef4444",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <i className="fa-solid fa-circle-exclamation" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Email atau Username
              </label>
              <div style={{ position: "relative" }}>
                <i className="fa-solid fa-user" style={{
                  position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                  color: "#94a3b8", fontSize: "14px",
                }} />
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Masukkan username atau email"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 40px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "10px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                  onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <i className="fa-solid fa-lock" style={{
                  position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                  color: "#94a3b8", fontSize: "14px",
                }} />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Masukkan password"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 40px 12px 40px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "10px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                  onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#94a3b8",
                  }}
                >
                  <i className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`} style={{ fontSize: "14px" }} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                background: loading ? "#94a3b8" : "linear-gradient(135deg, #1e3a6e, #2563eb)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.3px",
                boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}
            >
              {loading ? (
                <span><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: "8px" }} />Memproses...</span>
              ) : (
                <span><i className="fa-solid fa-right-to-bracket" style={{ marginRight: "8px" }} />Masuk sebagai Admin</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
