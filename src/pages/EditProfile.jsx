// src/pages/EditProfile.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getSsoDashboardUrl, getStoredSsoToken, getStoredSsoUser } from '../lib/ssoSession';

// ── Data kecamatan & desa Purbalingga (sesuaikan dengan API/DB kamu) ──────────
const kecamatanData = [
    { id: 1, nama: 'Purbalingga' },
    { id: 2, nama: 'Kalimanah' },
    { id: 3, nama: 'Padamara' },
    { id: 4, nama: 'Kutasari' },
    { id: 5, nama: 'Mrebet' },
    { id: 6, nama: 'Bobotsari' },
    { id: 7, nama: 'Karangreja' },
    { id: 8, nama: 'Karangjambu' },
    { id: 9, nama: 'Bukateja' },
    { id: 10, nama: 'Kejobong' },
    { id: 11, nama: 'Kaligondang' },
    { id: 12, nama: 'Pengadegan' },
    { id: 13, nama: 'Rembang' },
    { id: 14, nama: 'Kertanegara' },
    { id: 15, nama: 'Karanganyar' },
    { id: 16, nama: 'Kemangkon' },
    { id: 17, nama: 'Mandiraja' },
    { id: 18, nama: 'Karangtengah' },
];

const desaData = {
    1: ['Purbalingga Lor', 'Purbalingga Kidul', 'Purbalingga Wetan', 'Purbalingga Kulon', 'Kembaran Kulon', 'Kembaran Wetan', 'Bojong', 'Mewek', 'Penican', 'Bancar', 'Kandanggampang', 'Selabaya'],
    2: ['Kalimanah', 'Kalimanah Wetan', 'Kalimanah Kulon', 'Kedungmenjangan', 'Penaruban', 'Babakan', 'Dagan', 'Brecek', 'Karangkemiri', 'Selarak', 'Grecol', 'Kaligondang'],
    3: ['Padamara', 'Prigi', 'Kalitinggar', 'Kalitinggar Kidul', 'Bojanegara', 'Gemuruh', 'Linggapura', 'Panunggalan', 'Karangpule', 'Pegalongan'],
    4: ['Kutasari', 'Karangaren', 'Cendana', 'Candinata', 'Meri', 'Karangcegak', 'Limbangan', 'Karanggintung', 'Candiwulan', 'Karangklesem', 'Kalijaran', 'Siwarak'],
    5: ['Mrebet', 'Selaganggeng', 'Pengadegan', 'Sindang', 'Mangunegara', 'Onje', 'Larangan', 'Cipaku', 'Sangkanayu', 'Lambur', 'Rajawana', 'Pagerandong', 'Karangnangka'],
    6: ['Bobotsari', 'Banjaran', 'Karangduren', 'Talagening', 'Palumbungan', 'Majasari', 'Tlagayasa', 'Karangjengkol', 'Pekalongan', 'Limbasari'],
    7: ['Karangreja', 'Tlahab Lor', 'Tlahab Kidul', 'Siwarak', 'Gondang', 'Sunyalangu', 'Serang'],
    8: ['Karangjambu', 'Tanalum', 'Sarageni', 'Sanguwatang', 'Sirau', 'Danasari'],
    9: ['Bukateja', 'Majatengah', 'Karangsari', 'Cipawon', 'Jumanda', 'Kembangan', 'Kedungjati', 'Wirasana', 'Pelumutan', 'Timbang', 'Bajong'],
    10: ['Kejobong', 'Nangkasawit', 'Langgar', 'Bedagas', 'Pangempon', 'Blater', 'Sipadang', 'Sokanegara', 'Gumiwang', 'Tunjungmuli'],
    11: ['Kaligondang', 'Sinduraja', 'Tejasari', 'Penolih', 'Mlati', 'Cilapar', 'Pagerandong', 'Krangean', 'Sempor Lor', 'Sempor Kidul', 'Sidanegara'],
    12: ['Pengadegan', 'Nangkasawit', 'Tumanggal', 'Brecek', 'Tegalpingen', 'Semaken', 'Karangmanyar', 'Karangcengis', 'Bedagas'],
    13: ['Rembang', 'Losari', 'Makam', 'Wlahar', 'Sumampir', 'Karanglewas', 'Bantarbarang', 'Karanggambas', 'Wanogara Kulon', 'Wanogara Wetan', 'Panusupan'],
    14: ['Kertanegara', 'Purbayasa', 'Pekuncen', 'Rajawana', 'Pagergunung', 'Tamansari', 'Karangsari'],
    15: ['Karanganyar', 'Karangtengah', 'Purbadana', 'Panunggalan', 'Bedagas', 'Arenan', 'Depok'],
    16: ['Kemangkon', 'Bokol', 'Jetis', 'Gambarsari', 'Pegandekan', 'Kalialang', 'Kedungbenda', 'Muntang', 'Plumutan', 'Majatengah', 'Karangkemiri', 'Toyareka'],
    17: ['Mandirancan', 'Binangun', 'Sindang', 'Karangpucung', 'Karanggedang'],
    18: ['Karangtengah', 'Depok', 'Sumpinghayu', 'Karangjati'],
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function getInitials(name = '') {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

// Data awal user (nanti dari API)
const initialUser = {
    nama: 'Nadya Kameela',
    email: 'nadya.kameela@gmail.com',
    no_telp: '',
    alamat: '',
    kota_asal: '',
    desa_id: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
};

export default function EditProfile() {
    const dashboardUrl = getSsoDashboardUrl(getStoredSsoUser(), getStoredSsoToken());
    const [form, setForm] = useState(initialUser);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [errors, setErrors] = useState({});

    const desaList = form.kota_asal ? (desaData[form.kota_asal] || []) : [];

    const set = (field, value) => {
        setForm((prev) => {
            const next = { ...prev, [field]: value };
            if (field === 'kota_asal') next.desa_id = ''; // reset desa saat kecamatan berubah
            return next;
        });
        setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const e = {};
        // if (form.nik && !/^\d{16}$/.test(form.nik)) e.nik = 'NIK harus 16 digit angka';
        if (form.tanggal_lahir) {
            const tgl = new Date(form.tanggal_lahir);
            if (isNaN(tgl.getTime())) e.tanggal_lahir = 'Format tanggal tidak valid';
            else if (tgl > new Date()) e.tanggal_lahir = 'Tanggal lahir tidak boleh di masa depan';
        }
        if (form.kota_asal && !form.desa_id) e.desa_id = 'Pilih desa / kelurahan';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const e2 = validate();
        if (Object.keys(e2).length) { setErrors(e2); return; }

        setSaving(true);
        // Simulasi API call — ganti dengan fetch/axios ke backend Laravel kamu
        await new Promise((r) => setTimeout(r, 900));
        setSaving(false);
        setSaved(true);
        setTimeout(() => { setSaved(false); window.location.href = dashboardUrl; }, 1800);
    };

    return (
        <>
            <style>{`
                .ep-page {
                    min-height: 100vh;
                    background: var(--cream);
                    padding: 100px 0 64px;
                }
                .ep-container {
                    max-width: 760px;
                    margin: 0 auto;
                    padding: 0 24px;
                }

                /* ── Breadcrumb ── */
                .ep-breadcrumb {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: var(--text-muted);
                    margin-bottom: 28px;
                }
                .ep-breadcrumb a { color: var(--teal-600); font-weight: 600; text-decoration: none; }
                .ep-breadcrumb a:hover { text-decoration: underline; }
                .ep-breadcrumb i { font-size: 10px; }

                /* ── Header ── */
                .ep-header {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    background: white;
                    border-radius: var(--radius-xl);
                    border: 1px solid var(--border);
                    box-shadow: var(--shadow-card);
                    padding: 28px 32px;
                    margin-bottom: 24px;
                    position: relative;
                    overflow: hidden;
                }
                .ep-header::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, var(--teal-600), var(--teal-400), var(--teal-800));
                }
                .ep-avatar {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--teal-600), var(--teal-800));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: var(--font-display);
                    font-size: 22px;
                    font-weight: 700;
                    color: white;
                    letter-spacing: 2px;
                    flex-shrink: 0;
                    box-shadow: 0 6px 20px rgba(64,114,175,.22);
                }
                .ep-header-info h2 {
                    font-family: var(--font-display);
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--dark);
                    margin-bottom: 4px;
                }
                .ep-header-info p {
                    font-size: 13px;
                    color: var(--text-muted);
                    line-height: 1.5;
                }

                /* ── Card ── */
                .ep-card {
                    background: white;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border);
                    box-shadow: var(--shadow-card);
                    margin-bottom: 20px;
                    overflow: hidden;
                }
                .ep-card-head {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 18px 24px;
                    border-bottom: 1px solid var(--border);
                    background: var(--teal-50);
                }
                .ep-card-head-icon {
                    width: 30px;
                    height: 30px;
                    border-radius: 8px;
                    background: white;
                    border: 1px solid var(--teal-100);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--teal-600);
                    font-size: 12px;
                    flex-shrink: 0;
                }
                .ep-card-head-title {
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--teal-800);
                    letter-spacing: .5px;
                    text-transform: uppercase;
                }
                .ep-card-head-badge {
                    margin-left: auto;
                    font-size: 11px;
                    padding: 3px 10px;
                    border-radius: 50px;
                    background: rgba(64,114,175,.1);
                    color: var(--teal-700);
                    border: 1px solid rgba(64,114,175,.15);
                    font-weight: 600;
                }
                .ep-card-body {
                    padding: 24px;
                }

                /* ── Field grid ── */
                .ep-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 20px;
                }
                .ep-row.single { grid-template-columns: 1fr; }
                .ep-row:last-child { margin-bottom: 0; }

                .ep-field {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .ep-field.full { grid-column: 1 / -1; }

                .ep-label {
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: .5px;
                    text-transform: uppercase;
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .ep-label-opt {
                    font-size: 10px;
                    font-weight: 500;
                    color: var(--teal-400);
                    text-transform: none;
                    letter-spacing: 0;
                    padding: 1px 7px;
                    border-radius: 50px;
                    background: var(--teal-50);
                    border: 1px solid var(--teal-100);
                }

                /* ── Input ── */
                .ep-input, .ep-select, .ep-textarea {
                    width: 100%;
                    padding: 11px 14px;
                    border-radius: var(--radius-md);
                    border: 1.5px solid var(--border);
                    background: white;
                    font-family: var(--font-body);
                    font-size: 14px;
                    color: var(--dark);
                    transition: var(--transition);
                    outline: none;
                    appearance: none;
                    -webkit-appearance: none;
                }
                .ep-input:focus, .ep-select:focus, .ep-textarea:focus {
                    border-color: var(--teal-500);
                    box-shadow: 0 0 0 3px rgba(64,114,175,.1);
                }
                .ep-input.error, .ep-select.error {
                    border-color: #ef4444;
                    box-shadow: 0 0 0 3px rgba(239,68,68,.08);
                }
                .ep-input:disabled, .ep-select:disabled {
                    background: var(--teal-50);
                    color: var(--text-muted);
                    cursor: not-allowed;
                }
                .ep-textarea {
                    resize: vertical;
                    min-height: 90px;
                    line-height: 1.6;
                }
                .ep-input-wrap {
                    position: relative;
                }
                .ep-input-wrap .ep-input { padding-left: 38px; }
                .ep-input-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--teal-400);
                    font-size: 13px;
                    pointer-events: none;
                }
                .ep-error {
                    font-size: 11.5px;
                    color: #ef4444;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    margin-top: 2px;
                }

                /* ── Select wrapper (custom arrow) ── */
                .ep-select-wrap {
                    position: relative;
                }
                .ep-select-wrap::after {
                    content: '\f078';
                    font-family: 'Font Awesome 5 Free';
                    font-weight: 900;
                    position: absolute;
                    right: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--teal-400);
                    font-size: 10px;
                    pointer-events: none;
                }
                .ep-select { padding-right: 36px; cursor: pointer; }
                .ep-select:disabled { cursor: not-allowed; }

                /* ── Gender toggle ── */
                .gender-group {
                    display: flex;
                    gap: 12px;
                }
                .gender-option {
                    flex: 1;
                    position: relative;
                }
                .gender-option input { position: absolute; opacity: 0; width: 0; height: 0; }
                .gender-label {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 11px 16px;
                    border-radius: var(--radius-md);
                    border: 1.5px solid var(--border);
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: var(--transition);
                    background: white;
                    user-select: none;
                }
                .gender-label:hover {
                    border-color: var(--teal-300);
                    color: var(--teal-700);
                    background: var(--teal-50);
                }
                .gender-option input:checked + .gender-label {
                    border-color: var(--teal-600);
                    background: rgba(64,114,175,.07);
                    color: var(--teal-800);
                    font-weight: 600;
                }
                .gender-option input:checked + .gender-label i {
                    color: var(--teal-600);
                }

                /* ── Info box ── */
                .ep-info {
                    display: flex;
                    gap: 10px;
                    align-items: flex-start;
                    background: rgba(64,114,175,.05);
                    border: 1px solid rgba(64,114,175,.15);
                    border-radius: var(--radius-md);
                    padding: 14px;
                    margin-bottom: 20px;
                }
                .ep-info i { color: var(--teal-500); font-size: 13px; margin-top: 2px; flex-shrink: 0; }
                .ep-info-text { font-size: 12.5px; color: var(--teal-800); line-height: 1.6; }

                /* ── Readonly field ── */
                .ep-readonly {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 11px 14px;
                    border-radius: var(--radius-md);
                    border: 1.5px solid var(--border);
                    background: var(--teal-50);
                    font-size: 14px;
                    color: var(--text-muted);
                }
                .ep-readonly i { color: var(--teal-400); font-size: 12px; }

                /* ── Submit bar ── */
                .ep-submit-bar {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 12px;
                    background: white;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border);
                    box-shadow: var(--shadow-card);
                    padding: 20px 24px;
                }
                .btn-cancel {
                    display: flex; align-items: center; gap: 7px;
                    padding: 10px 22px;
                    border-radius: 50px;
                    border: 1.5px solid var(--border);
                    background: white;
                    color: var(--text-muted);
                    font-family: var(--font-body);
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--transition);
                    text-decoration: none;
                }
                .btn-cancel:hover { border-color: var(--teal-300); color: var(--text-dark); }
                .btn-save {
                    display: flex; align-items: center; gap: 8px;
                    padding: 10px 28px;
                    border-radius: 50px;
                    background: var(--teal-600);
                    color: white;
                    font-family: var(--font-body);
                    font-size: 14px;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    transition: var(--transition);
                    position: relative;
                    min-width: 130px;
                    justify-content: center;
                }
                .btn-save:hover:not(:disabled) { background: var(--teal-700); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(64,114,175,.25); }
                .btn-save:disabled { opacity: .7; cursor: not-allowed; transform: none; }
                .btn-save.saved { background: #0f766e; }

                /* ── Spinner ── */
                @keyframes spin { to { transform: rotate(360deg); } }
                .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.3); border-top-color: white; border-radius: 50%; animation: spin .6s linear infinite; }

                /* ── Progress indicator ── */
                .ep-progress-wrap { margin-bottom: 20px; }
                .ep-progress-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
                .ep-progress-label { font-size: 12px; color: var(--text-muted); }
                .ep-progress-val { font-size: 12px; font-weight: 700; color: var(--teal-700); }
                .ep-progress-track { height: 6px; background: var(--teal-50); border-radius: 50px; overflow: hidden; border: 1px solid var(--teal-100); }
                .ep-progress-fill { height: 100%; background: linear-gradient(90deg, var(--teal-500), var(--teal-700)); border-radius: 50px; transition: width .4s ease; }

                @media (max-width: 640px) {
                    .ep-page { padding: 86px 0 48px; }
                    .ep-row { grid-template-columns: 1fr; }
                    .ep-header { flex-direction: column; text-align: center; }
                }
            `}</style>

            <div className="ep-page">
                <div className="ep-container">

                    {/* Breadcrumb */}
                    <div className="ep-breadcrumb">
                        <Link to="/"><i className="fas fa-home" /></Link>
                        <i className="fas fa-chevron-right" />
                        <a href={dashboardUrl}>Profil</a>
                        <i className="fas fa-chevron-right" />
                        <span>Lengkapi Profil</span>
                    </div>

                    {/* Header */}
                    <div className="ep-header">
                        <div className="ep-avatar">{getInitials(form.nama)}</div>
                        <div className="ep-header-info">
                            <h2>Lengkapi Profil Anda</h2>
                            <p>Semua data bersifat opsional, namun diperlukan untuk mengakses layanan publik digital Purbalingga secara penuh.</p>
                        </div>
                    </div>

                    {/* Progress */}
                    <ProgressBar form={form} />

                    <form onSubmit={handleSubmit}>

                        {/* ── DATA PRIBADI ── */}
                        <div className="ep-card">
                            <div className="ep-card-head">
                                <div className="ep-card-head-icon"><i className="fas fa-user" /></div>
                                <span className="ep-card-head-title">Data Pribadi</span>
                                <span className="ep-card-head-badge">Opsional</span>
                            </div>
                            <div className="ep-card-body">

                                {/* Nama & email readonly */}
                                <div className="ep-row">
                                    <div className="ep-field">
                                        <div className="ep-label">Nama Lengkap</div>
                                        <div className="ep-readonly">
                                            <i className="fas fa-lock" /> {form.nama}
                                        </div>
                                    </div>
                                    <div className="ep-field">
                                        <div className="ep-label">Email</div>
                                        <div className="ep-readonly">
                                            <i className="fas fa-lock" /> {form.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="ep-info">
                                    <i className="fas fa-info-circle" />
                                    <div className="ep-info-text">Nama dan email tidak dapat diubah di sini. Hubungi admin jika ada kesalahan data.</div>
                                </div>

                                {/* NIK */}
                                <div className="ep-row single">
                                    <div className="ep-field">
                                        <label className="ep-label" htmlFor="no_telp">
                                            NO HP <span className="ep-label-opt">opsional</span>
                                        </label>
                                        <div className="ep-input-wrap">
                                            <i className="fas fa-id-card ep-input-icon" />
                                            <input
                                                id="no_telp"
                                                type="text"
                                                className={`ep-input${errors.no_telp ? ' error' : ''}`}
                                                placeholder="08XXXXXXXXXX"
                                                value={form.no_telp}
                                                onChange={(e) => set('no_telp', e.target.value.replace(/\D/g, '').slice(0, 12))}
                                                maxLength={16}
                                                inputMode="numeric"
                                            />
                                        </div>
                                        {errors.no_telp && <div className="ep-error"><i className="fas fa-exclamation-circle" />{errors.no_telp}</div>}
                                    </div>
                                </div>

                                {/* Tgl lahir & Jenis kelamin */}
                                <div className="ep-row">
                                    <div className="ep-field">
                                        <label className="ep-label" htmlFor="tanggal_lahir">
                                            Tanggal Lahir <span className="ep-label-opt">opsional</span>
                                        </label>
                                        <div className="ep-input-wrap">
                                            <i className="fas fa-calendar ep-input-icon" />
                                            <input
                                                id="tanggal_lahir"
                                                type="date"
                                                className={`ep-input${errors.tanggal_lahir ? ' error' : ''}`}
                                                value={form.tanggal_lahir}
                                                onChange={(e) => set('tanggal_lahir', e.target.value)}
                                                max={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                        {errors.tanggal_lahir && <div className="ep-error"><i className="fas fa-exclamation-circle" />{errors.tanggal_lahir}</div>}
                                    </div>

                                    <div className="ep-field">
                                        <div className="ep-label">
                                            Jenis Kelamin <span className="ep-label-opt">opsional</span>
                                        </div>
                                        <div className="gender-group">
                                            <div className="gender-option">
                                                <input
                                                    type="radio" id="gender-l" name="jenis_kelamin"
                                                    value="L"
                                                    checked={form.jenis_kelamin === 'L'}
                                                    onChange={() => set('jenis_kelamin', 'L')}
                                                />
                                                <label htmlFor="gender-l" className="gender-label">
                                                    <i className="fas fa-mars" /> Laki-laki
                                                </label>
                                            </div>
                                            <div className="gender-option">
                                                <input
                                                    type="radio" id="gender-p" name="jenis_kelamin"
                                                    value="P"
                                                    checked={form.jenis_kelamin === 'P'}
                                                    onChange={() => set('jenis_kelamin', 'P')}
                                                />
                                                <label htmlFor="gender-p" className="gender-label">
                                                    <i className="fas fa-venus" /> Perempuan
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* ── ALAMAT ── */}
                        <div className="ep-card">
                            <div className="ep-card-head">
                                <div className="ep-card-head-icon"><i className="fas fa-map-marker-alt" /></div>
                                <span className="ep-card-head-title">Kota Asal</span>
                                <span className="ep-card-head-badge">Opsional</span>
                            </div>
                            <div className="ep-card-body">

                                <div className="ep-row">
                                    {/* <div className="ep-field">
                                        <label className="ep-label" htmlFor="kecamatan">
                                            Kecamatan <span className="ep-label-opt">opsional</span>
                                        </label>
                                        <div className="ep-select-wrap">
                                            <select
                                                id="kecamatan"
                                                className="ep-select"
                                                value={form.kecamatan_id}
                                                onChange={(e) => set('kecamatan_id', e.target.value)}
                                            >
                                                <option value="">— Pilih Kecamatan —</option>
                                                {kecamatanData.map((k) => (
                                                    <option key={k.id} value={k.id}>{k.nama}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div> */}

                                    <div className="ep-field">
                                        <label className="ep-label" htmlFor="desa">
                                            Desa / Kelurahan <span className="ep-label-opt">opsional</span>
                                        </label>
                                        <div className="ep-select-wrap">
                                            <select
                                                id="desa"
                                                className={`ep-select${errors.desa_id ? ' error' : ''}`}
                                                value={form.desa_id}
                                                onChange={(e) => set('desa_id', e.target.value)}
                                                // disabled={!form.kota_asal}
                                                
                                            >
                                                <option value="">
                                                    {/* {form.kota_asal ?? '— Pilih Kota —'} */}
                                                    {form.kota_asal ? '— Pilih Kota —' : '— Pilih Kota —'}
                                                </option>
                                                {desaList.map((d) => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.desa_id && <div className="ep-error"><i className="fas fa-exclamation-circle" />{errors.desa_id}</div>}
                                    </div>
                                </div>

                                {/* <div className="ep-row single">
                                    <div className="ep-field">
                                        <label className="ep-label" htmlFor="alamat">
                                            Alamat Lengkap <span className="ep-label-opt">opsional</span>
                                        </label>
                                        <textarea
                                            id="alamat"
                                            className="ep-textarea"
                                            placeholder="Contoh: Jl. Raya Purbalingga No. 12, RT 03/RW 04"
                                            value={form.alamat}
                                            onChange={(e) => set('alamat', e.target.value)}
                                        />
                                    </div>
                                </div> */}

                            </div>
                        </div>

                        {/* ── Submit ── */}
                        <div className="ep-submit-bar">
                            <a href={dashboardUrl} className="btn-cancel">
                                <i className="fas fa-arrow-left" /> Batal
                            </a>
                            <button
                                type="submit"
                                className={`btn-save${saved ? ' saved' : ''}`}
                                disabled={saving || saved}
                            >
                                {saving ? (
                                    <><div className="spinner" /> Menyimpan...</>
                                ) : saved ? (
                                    <><i className="fas fa-check" /> Tersimpan!</>
                                ) : (
                                    <><i className="fas fa-save" /> Simpan Profil</>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </>
    );
}

// ── Sub-component: progress bar ────────────────────────────────────────────────
function ProgressBar({ form }) {
    const fields = [
        // { key: 'nik',           check: (f) => !!f.nik },
        { key: 'tanggal_lahir', check: (f) => !!f.tanggal_lahir },
        { key: 'jenis_kelamin', check: (f) => !!f.jenis_kelamin },
        // { key: 'alamat',        check: (f) => !!f.alamat },
        { key: 'kota_asal',  check: (f) => !!f.kota_asal },
        { key: 'desa_id',       check: (f) => !!f.desa_id },
    ];
    const done = fields.filter((f) => f.check(form)).length;
    const pct = Math.round((done / fields.length) * 100);

    return (
        <div className="ep-progress-wrap">
            <div className="ep-progress-top">
                <span className="ep-progress-label">{done} dari {fields.length} data opsional diisi</span>
                <span className="ep-progress-val">{pct}%</span>
            </div>
            <div className="ep-progress-track">
                <div className="ep-progress-fill" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}
