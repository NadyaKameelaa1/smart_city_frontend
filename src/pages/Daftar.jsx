// src/pages/Daftar.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ─── Base URL API — sesuaikan dengan URL Laravel kamu ────────
const API_BASE = import.meta.env.VITE_API_URL ?? 'https://apismartcity.qode.my.id/api';
const currentYear = new Date().getFullYear();

// ── CSS ───────────────────────────────────────────────────────
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
.auth-input-no-icon { padding-left: 16px; }
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
.auth-btn-google:disabled { opacity: .6; cursor: not-allowed; transform: none; }
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
    opacity: .55; cursor: not-allowed; transform: none; box-shadow: none;
}
.auth-link {
    color: var(--teal-600); font-weight: 600;
    text-decoration: none; transition: color .15s;
}
.auth-link:hover { color: var(--teal-800); text-decoration: underline; }
.show-pass-btn {
    position: absolute; right: 14px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    color: var(--text-muted); font-size: 14px;
    padding: 4px; line-height: 1; transition: color .15s;
}
.show-pass-btn:hover { color: var(--teal-600); }
.pass-strength-bar {
    height: 4px; border-radius: 2px;
    transition: background .3s;
}
/* Alert global error dari server */
.auth-alert-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #b91c1c;
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 13.5px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
}
.auth-alert-success {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #166534;
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 13.5px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
}
`;

function InjectStyle() { return <style>{STYLE}</style>; }

// ── Google Icon ───────────────────────────────────────────────
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

// ── Password strength ─────────────────────────────────────────
function passwordStrength(pw) {
    if (!pw) return { score: 0, label: '', color: 'var(--border)' };
    let s = 0;
    if (pw.length >= 8)          s++;
    if (/[A-Z]/.test(pw))        s++;
    if (/[0-9]/.test(pw))        s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return [
        { score: 0, label: '',            color: 'var(--border)' },
        { score: 1, label: 'Lemah',       color: '#ef4444' },
        { score: 2, label: 'Cukup',       color: '#f59e0b' },
        { score: 3, label: 'Kuat',        color: '#3b82f6' },
        { score: 4, label: 'Sangat Kuat', color: '#16a34a' },
    ][s];
}

// ── Sidebar ───────────────────────────────────────────────────
function AuthSidebar() {
    return (
        <div style={{ background: 'linear-gradient(160deg, var(--teal-900) 0%, var(--teal-950) 100%)', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: .06, backgroundImage: 'radial-gradient(circle at 2px 2px, var(--teal-300) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            <div style={{ position: 'absolute', bottom: -80, right: -80, width: 280, height: 280, borderRadius: '50%', border: '1px solid rgba(255,255,255,.06)' }} />
            <div style={{ position: 'absolute', bottom: -40, right: -40, width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(255,255,255,.08)' }} />
            <div style={{ position: 'absolute', top: 60, left: -60, width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(255,255,255,.05)' }} />

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
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: 14 }}>
                    Bergabung &amp;<br />Akses Semua Fitur
                </h2>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.65)', lineHeight: 1.7, maxWidth: 280 }}>
                    Buat akun gratis dan nikmati kemudahan mengakses layanan digital Kabupaten Purbalingga.
                </p>
            </div>

            <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--teal-300)', marginBottom: 16 }}>Keuntungan daftar</div>
                {[
                    { icon: 'fa-ticket-alt',  text: 'Pesan tiket wisata online' },
                    { icon: 'fa-bell',        text: 'Notifikasi pengumuman penting' },
                    { icon: 'fa-history',     text: 'Riwayat pemesanan tiket' },
                    { icon: 'fa-user-circle', text: 'Profil & identitas digital' },
                    { icon: 'fa-shield-alt',  text: 'Akun aman & terverifikasi' },
                ].map((f) => (
                    <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <i className={`fas ${f.icon}`} style={{ color: 'var(--teal-300)', fontSize: 11 }} />
                        </div>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,.75)' }}>{f.text}</span>
                    </div>
                ))}
                <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,.1)', fontSize: 12, color: 'rgba(255,255,255,.4)' }}>
                    © {currentYear} Purbalingga Smart City
                </div>
            </div>
        </div>
    );
}

// ── Field helper ──────────────────────────────────────────────
function Field({ id, label, icon, type = 'text', placeholder, value, onChange, error, autoComplete, hint, rightSlot }) {
    return (
        <div>
            <label htmlFor={id} style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 5 }}>
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
            {error && (
                <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>
                    <i className="fas fa-exclamation-circle" style={{ marginRight: 4 }} />{error}
                </div>
            )}
            {hint && !error && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{hint}</div>
            )}
        </div>
    );
}

function Divider() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '2px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>atau daftar dengan</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
    );
}

// ── Main Daftar Page ──────────────────────────────────────────
export default function Daftar() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username:   '',
        full_name:  '',
        email:      '',
        password:   '',
        konfirmasi: '',
    });

    // errors bisa berisi pesan dari client-side validate ATAU dari Laravel (422)
    const [errors,      setErrors]      = useState({});
    const [globalError, setGlobalError] = useState('');   // error non-field dari server
    const [showPass,    setShowPass]    = useState(false);
    const [showKonfirm, setShowKonfirm] = useState(false);
    const [loading,     setLoading]     = useState(false);
    const [googleLoad,  setGoogleLoad]  = useState(false);
    const [agreed,      setAgreed]      = useState(false);

    const set = (k) => (e) => {
        setForm((f) => ({ ...f, [k]: e.target.value }));
        // Hapus error field yang sedang diketik
        if (errors[k]) setErrors((err) => ({ ...err, [k]: undefined }));
    };

    const strength = passwordStrength(form.password);

    // ── Validasi sisi klien ──────────────────────────────────
    function validateClient() {
        const e = {};
        if (!form.username.trim())
            e.username = 'Username wajib diisi.';
        else if (!/^[a-z0-9_]{3,30}$/.test(form.username))
            e.username = 'Username: 3–30 karakter, huruf kecil, angka, underscore.';

        if (!form.full_name.trim())
            e.full_name = 'Nama lengkap wajib diisi.';

        if (!form.email.trim())
            e.email = 'Email wajib diisi.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            e.email = 'Format email tidak valid.';

        if (!form.password)
            e.password = 'Password wajib diisi.';
        else if (form.password.length < 8)
            e.password = 'Password minimal 8 karakter.';

        if (form.konfirmasi !== form.password)
            e.konfirmasi = 'Konfirmasi password tidak cocok.';

        if (!agreed)
            e.agreed = 'Anda harus menyetujui syarat & ketentuan.';

        setErrors(e);
        return Object.keys(e).length === 0;
    }

    // ── Memetakan errors dari Laravel (422) ke field ─────────
    function applyServerErrors(serverErrors) {
        // serverErrors: { username: ['...'], email: ['...'], ... }
        // Peta nama field Laravel → nama field form
        const fieldMap = {
            username:          'username',
            name:              'full_name',   // Laravel: 'name', form: 'full_name'
            email:             'email',
            password:          'password',
            'password_confirmation': 'konfirmasi',
        };

        const mapped = {};
        for (const [key, messages] of Object.entries(serverErrors)) {
            const formKey = fieldMap[key] ?? key;
            mapped[formKey] = Array.isArray(messages) ? messages[0] : messages;
        }
        setErrors((prev) => ({ ...prev, ...mapped }));
    }

    // ── Submit register ───────────────────────────────────────
    async function handleSubmit(ev) {
        ev.preventDefault();
        setGlobalError('');
        if (!validateClient()) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    username:              form.username.trim(),
                    name:                  form.full_name.trim(),   // kolom DB: 'name'
                    email:                 form.email.trim(),
                    password:              form.password,
                    password_confirmation: form.konfirmasi,         // required by Confirmed rule
                }),
            });

            const data = await res.json();

            if (res.status === 201) {
                // Simpan token ke localStorage (atau context/store jika pakai state management)
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('auth_user',  JSON.stringify(data.user));

                // Redirect ke halaman utama atau halaman profil
                navigate('/');
                return;
            }

            if (res.status === 422) {
                // Validasi gagal dari Laravel
                applyServerErrors(data.errors ?? {});
                return;
            }

            // Error lain (500, dsb)
            setGlobalError(data.message ?? 'Terjadi kesalahan pada server. Coba beberapa saat lagi.');

        } catch (err) {
            // Network error / server tidak bisa dijangkau
            setGlobalError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
        } finally {
            setLoading(false);
        }
    }

    // ── Google OAuth ──────────────────────────────────────────
    function handleGoogle() {
        setGoogleLoad(true);
        // Arahkan ke endpoint Google OAuth Laravel Socialite
        window.location.href = `${API_BASE.replace('/api', '')}/auth/google/redirect`;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
            <InjectStyle />

            <div style={{ width: '100%', maxWidth: 920, background: 'white', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', display: 'grid', gridTemplateColumns: '1fr 1.2fr' }}>

                <AuthSidebar />

                {/* ── Form kanan ── */}
                <div style={{ padding: '40px 40px', overflowY: 'auto', maxHeight: '92vh' }}>
                    <div style={{ marginBottom: 22 }}>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--dark)', marginBottom: 4 }}>
                            Buat Akun Baru
                        </h1>
                        <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>Daftar gratis, mulai akses semua fitur</p>
                    </div>

                    {/* Global server error */}
                    {globalError && (
                        <div className="auth-alert-error" style={{ marginBottom: 16 }}>
                            <i className="fas fa-exclamation-circle" style={{ flexShrink: 0, marginTop: 1 }} />
                            <span>{globalError}</span>
                        </div>
                    )}

                    {/* Google */}
                    <button
                        className="auth-btn-google"
                        onClick={handleGoogle}
                        disabled={googleLoad || loading}
                        style={{ marginBottom: 18 }}
                    >
                        {googleLoad
                            ? <><i className="fas fa-spinner fa-spin" style={{ fontSize: 14 }} /> Menghubungkan...</>
                            : <><GoogleIcon /> Daftar dengan Google</>
                        }
                    </button>

                    <Divider />

                    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 6 }}>

                        {/* Username + Nama Lengkap */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <Field
                                id="username"
                                label="Username"
                                icon="fa-at"
                                placeholder="contoh_user"
                                value={form.username}
                                onChange={set('username')}
                                error={errors.username}
                                autoComplete="username"
                                hint={!errors.username ? 'Huruf kecil, angka, underscore' : undefined}
                            />
                            <Field
                                id="full_name"
                                label="Nama Lengkap"
                                icon="fa-user"
                                placeholder="Nama sesuai KTP"
                                value={form.full_name}
                                onChange={set('full_name')}
                                error={errors.full_name}
                                autoComplete="name"
                            />
                        </div>

                        <Field
                            id="email"
                            label="Email"
                            icon="fa-envelope"
                            type="email"
                            placeholder="nama@email.com"
                            value={form.email}
                            onChange={set('email')}
                            error={errors.email}
                            autoComplete="email"
                        />

                        {/* Password + strength */}
                        <div>
                            <Field
                                id="password"
                                label="Password"
                                icon="fa-lock"
                                type={showPass ? 'text' : 'password'}
                                placeholder="Min. 8 karakter"
                                value={form.password}
                                onChange={set('password')}
                                error={errors.password}
                                autoComplete="new-password"
                                rightSlot={
                                    <button type="button" className="show-pass-btn" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                                        <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} />
                                    </button>
                                }
                            />
                            {form.password && (
                                <div style={{ marginTop: 6 }}>
                                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                                        {[1,2,3,4].map(i => (
                                            <div
                                                key={i}
                                                className="pass-strength-bar"
                                                style={{ flex: 1, background: i <= strength.score ? strength.color : 'var(--border)' }}
                                            />
                                        ))}
                                    </div>
                                    {strength.label && (
                                        <div style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>{strength.label}</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <Field
                            id="konfirmasi"
                            label="Konfirmasi Password"
                            icon="fa-lock"
                            type={showKonfirm ? 'text' : 'password'}
                            placeholder="Ulangi password"
                            value={form.konfirmasi}
                            onChange={set('konfirmasi')}
                            error={errors.konfirmasi}
                            autoComplete="new-password"
                            rightSlot={
                                <button type="button" className="show-pass-btn" onClick={() => setShowKonfirm(v => !v)} tabIndex={-1}>
                                    <i className={`fas ${showKonfirm ? 'fa-eye-slash' : 'fa-eye'}`} />
                                </button>
                            }
                        />

                        {/* Syarat & ketentuan */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => {
                                        setAgreed(e.target.checked);
                                        if (e.target.checked) setErrors(er => ({ ...er, agreed: undefined }));
                                    }}
                                    style={{ marginTop: 2, accentColor: 'var(--teal-600)', width: 15, height: 15, flexShrink: 0, cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                    Saya menyetujui{' '}
                                    <Link to="/syarat-ketentuan" className="auth-link" style={{ fontSize: 13 }}>Syarat &amp; Ketentuan</Link>
                                    {' '}dan{' '}
                                    <Link to="/kebijakan-privasi" className="auth-link" style={{ fontSize: 13 }}>Kebijakan Privasi</Link>
                                    {' '}Purbalingga Smart City
                                </span>
                            </label>
                            {errors.agreed && (
                                <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>
                                    <i className="fas fa-exclamation-circle" style={{ marginRight: 4 }} />{errors.agreed}
                                </div>
                            )}
                        </div>

                        <button type="submit" className="auth-btn-primary" disabled={loading} style={{ marginTop: 2 }}>
                            {loading
                                ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }} />Membuat Akun...</>
                                : 'Buat Akun'
                            }
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', marginTop: 20 }}>
                        Sudah punya akun?{' '}
                        <Link to="/login" className="auth-link">Masuk di sini</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
