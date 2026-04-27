// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const currentYear = new Date().getFullYear();

// ── Inject CSS sekali — pakai class untuk focus, bukan onFocus inline ──
const STYLE = `
.auth-input {
    width: 100%;
    padding: 13px 16px 13px 44px;
    border-radius: 12px;
    border: 1.5px solid var(--border);
    font-size: 14px;
    font-family: var(--font-body);
    outline: none;
    background: white;
    box-sizing: border-box;
    transition: border-color .2s, box-shadow .2s;
    color: var(--text-dark);
}
.auth-input:focus {
    border-color: var(--teal-500);
    box-shadow: 0 0 0 3px rgba(79,131,191,.15);
}
.auth-input.error {
    border-color: #ef4444;
}
.auth-input.error:focus {
    box-shadow: 0 0 0 3px rgba(239,68,68,.12);
}
.auth-input-no-icon {
    padding-left: 16px;
}
.auth-btn-google {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 13px 20px;
    border-radius: 12px;
    border: 1.5px solid var(--border);
    background: white;
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 600;
    color: var(--text-dark);
    cursor: pointer;
    transition: border-color .2s, background .2s, transform .15s;
    box-sizing: border-box;
}
.auth-btn-google:hover {
    border-color: var(--teal-400);
    background: var(--teal-50);
    transform: translateY(-1px);
}
.auth-btn-primary {
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    border: none;
    background: var(--teal-600);
    color: white;
    font-family: var(--font-body);
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: background .2s, transform .15s, box-shadow .2s;
    letter-spacing: .3px;
}
.auth-btn-primary:hover {
    background: var(--teal-700);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(64,114,175,.3);
}
.auth-btn-primary:disabled {
    opacity: .55;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}
.auth-link {
    color: var(--teal-600);
    font-weight: 600;
    text-decoration: none;
    transition: color .15s;
}
.auth-link:hover {
    color: var(--teal-800);
    text-decoration: underline;
}
.show-pass-btn {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-muted);
    font-size: 14px;
    padding: 4px;
    line-height: 1;
    transition: color .15s;
}
.show-pass-btn:hover { color: var(--teal-600); }
`;

function InjectStyle() {
    return <style>{STYLE}</style>;
}

// ── Google Icon SVG ──────────────────────────────────────────
function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
            <path d="M6.3 14.7l7 5.1C15.2 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z" fill="#FF3D00"/>
            <path d="M24 46c5.5 0 10.5-2 14.3-5.2l-6.6-5.6C29.7 36.8 27 37.8 24 37.8c-6.1 0-11.3-4.1-13.1-9.7l-7 5.4C7.5 41.4 15.2 46 24 46z" fill="#4CAF50"/>
            <path d="M44.5 20H24v8.5h11.8c-.9 2.6-2.7 4.7-5 6.1l6.6 5.6C41.6 36.7 45 31 45 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
        </svg>
    );
}

// ── Purbalingga emblem kiri ──────────────────────────────────
function AuthSidebar() {
    return (
        <div style={{
            background: 'linear-gradient(160deg, var(--teal-900) 0%, var(--teal-950) 100%)',
            padding: '48px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Pattern dot */}
            <div style={{ position: 'absolute', inset: 0, opacity: .06, backgroundImage: 'radial-gradient(circle at 2px 2px, var(--teal-300) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            {/* Dekorasi lingkaran */}
            <div style={{ position: 'absolute', bottom: -80, right: -80, width: 280, height: 280, borderRadius: '50%', border: '1px solid rgba(255,255,255,.06)' }} />
            <div style={{ position: 'absolute', bottom: -40, right: -40, width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(255,255,255,.08)' }} />
            <div style={{ position: 'absolute', top: 60, left: -60, width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(255,255,255,.05)' }} />

            {/* Logo */}
            <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
                    <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,var(--teal-500),var(--teal-700))', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white', flexShrink: 0 }}>
                        <i className="fas fa-city" />
                    </div>
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'white', lineHeight: 1 }}>Purbalingga</div>
                        <div style={{ fontSize: 10, color: 'var(--teal-300)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>Smart City</div>
                    </div>
                </div>

                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: 16 }}>
                    Portal Informasi<br />Kabupaten Purbalingga
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.65)', lineHeight: 1.7, maxWidth: 280 }}>
                    Akses informasi wisata, berita, pengumuman, pelayanan publik, dan agenda kota dalam satu platform.
                </p>
            </div>

            {/* Feature list */}
            <div style={{ position: 'relative', zIndex: 2 }}>
                {[
                    { icon: 'fa-mountain',      text: 'Destinasi Wisata & Tiket Online' },
                    { icon: 'fa-newspaper',     text: 'Berita & Pengumuman Terkini' },
                    { icon: 'fa-hands-helping', text: 'Pelayanan Publik Digital' },
                    { icon: 'fa-calendar-alt',  text: 'Event & Agenda Kota' },
                ].map((f) => (
                    <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <i className={`fas ${f.icon}`} style={{ color: 'var(--teal-300)', fontSize: 12 }} />
                        </div>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,.75)' }}>{f.text}</span>
                    </div>
                ))}

                <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.1)', fontSize: 12, color: 'rgba(255,255,255,.4)', lineHeight: 1.6 }}>
                    © {currentYear} Purbalingga Smart City<br />Jawa Tengah, Indonesia
                </div>
            </div>
        </div>
    );
}

// ── Input field helper ───────────────────────────────────────
function Field({ id, label, icon, type = 'text', placeholder, value, onChange, error, autoComplete, hint, rightSlot }) {
    return (
        <div>
            <label htmlFor={id} style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 6 }}>
                {label}
            </label>
            <div style={{ position: 'relative' }}>
                {icon && (
                    <i className={`fas ${icon}`} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 13, pointerEvents: 'none' }} />
                )}
                <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    autoComplete={autoComplete}
                    className={`auth-input${error ? ' error' : ''}${!icon ? ' auth-input-no-icon' : ''}`}
                    style={rightSlot ? { paddingRight: 44 } : {}}
                />
                {rightSlot}
            </div>
            {error && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}><i className="fas fa-exclamation-circle" style={{ marginRight: 4 }} />{error}</div>}
            {hint && !error && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{hint}</div>}
        </div>
    );
}

// ── Divider "atau" ───────────────────────────────────────────
function Divider() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>atau masuk dengan</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
    );
}

// ── Main Login Page ──────────────────────────────────────────
export default function Login() {
    const navigate = useNavigate();

    const [form,      setForm]      = useState({ identifier: '', password: '' });
    const [errors,    setErrors]    = useState({});
    const [showPass,  setShowPass]  = useState(false);
    const [loading,   setLoading]   = useState(false);
    const [googleLoad, setGoogleLoad] = useState(false);

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const validate = () => {
        const e = {};
        if (!form.identifier.trim()) e.identifier = 'Email atau username wajib diisi';
        if (!form.password.trim())   e.password   = 'Password wajib diisi';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (ev) => {
        ev.preventDefault();
        if (!validate()) return;
        setLoading(true);
        // Simulasi — ganti dengan API call ke Laravel
        setTimeout(() => {
            setLoading(false);
            navigate('/');
        }, 1500);
    };

    const handleGoogle = () => {
        setGoogleLoad(true);
        // Arahkan ke endpoint Google OAuth Laravel
        // window.location.href = '/auth/google/redirect';
        setTimeout(() => setGoogleLoad(false), 2000);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
            <InjectStyle />

            <div style={{ width: '100%', maxWidth: 900, background: 'white', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 560 }}>

                {/* Sidebar kiri */}
                <AuthSidebar />

                {/* Form kanan */}
                <div style={{ padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ marginBottom: 28 }}>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>
                            Selamat Datang
                        </h1>
                        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                            Masuk ke akun Anda untuk melanjutkan
                        </p>
                    </div>

                    {/* Google */}
                    <button className="auth-btn-google" onClick={handleGoogle} disabled={googleLoad} style={{ marginBottom: 20 }}>
                        {googleLoad
                            ? <><i className="fas fa-spinner fa-spin" style={{ fontSize: 14 }} /> Menghubungkan...</>
                            : <><GoogleIcon /> Lanjutkan dengan Google</>
                        }
                    </button>

                    <Divider />

                    {/* Form manual */}
                    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 }}>
                        <Field
                            id="identifier"
                            label="Email atau Username"
                            icon="fa-user"
                            placeholder="nama@email.com atau username"
                            value={form.identifier}
                            onChange={set('identifier')}
                            error={errors.identifier}
                            autoComplete="username"
                        />

                        <Field
                            id="password"
                            label="Password"
                            icon="fa-lock"
                            type={showPass ? 'text' : 'password'}
                            placeholder="Masukkan password"
                            value={form.password}
                            onChange={set('password')}
                            error={errors.password}
                            autoComplete="current-password"
                            rightSlot={
                                <button
                                    type="button"
                                    className="show-pass-btn"
                                    onClick={() => setShowPass((v) => !v)}
                                    tabIndex={-1}
                                    aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
                                >
                                    <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} />
                                </button>
                            }
                        />

                        {/* Lupa password */}
                        <div style={{ textAlign: 'right', marginTop: -8 }}>
                            <Link to="/lupa-password" className="auth-link" style={{ fontSize: 13 }}>
                                Lupa password?
                            </Link>
                        </div>

                        <button type="submit" className="auth-btn-primary" disabled={loading} style={{ marginTop: 4 }}>
                            {loading
                                ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }} />Masuk...</>
                                : 'Masuk'
                            }
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', marginTop: 24 }}>
                        Belum punya akun?{' '}
                        <Link to="/daftar" className="auth-link">Daftar sekarang</Link>
                    </p>

                    {/* Akses admin */}
                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                        <Link to="/admin/login" style={{ fontSize: 12, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none', transition: 'color .15s' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--teal-600)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                            <i className="fas fa-shield-alt" style={{ fontSize: 10 }} /> Masuk sebagai Admin / Staff
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}