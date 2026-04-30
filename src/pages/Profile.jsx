// src/pages/Profile.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getStoredSsoUser } from '../lib/ssoSession';

// Helper: ambil inisial maks 2 huruf dari nama
function getInitials(name = '') {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

// Data dummy — ganti dengan data dari API/context
const dummyUser = {
    username: 'nadnad',
    nama: 'Nadya Kameela',
    email: 'nadya.kameela@gmail.com',
    no_telp: null,
    kota_asal: null,
    kecamatan: null,
    desa: null,
    tanggal_lahir: null,
    jenis_kelamin: null,
    email_verified: true,
    created_at: '2025-04-12',
};

const checklistItems = [
    { key: 'username',          label: 'Username',      optional: false, check: (u) => !!u.username },
    { key: 'nama',          label: 'Nama lengkap',      optional: false, check: (u) => !!u.nama },
    { key: 'email',         label: 'Email',             optional: false, check: (u) => !!u.email },
    { key: 'email_verified',label: 'Email terverifikasi',optional: false, check: (u) => u.email_verified },
    { key: 'no_telp',           label: 'No Telp',               optional: true,  check: (u) => !!u.no_telp },
    { key: 'tanggal_lahir', label: 'Tanggal lahir',     optional: true,  check: (u) => !!u.tanggal_lahir },
    { key: 'jenis_kelamin', label: 'Jenis kelamin',     optional: true,  check: (u) => !!u.jenis_kelamin },
    { key: 'kota_asal',        label: 'Kota Asal',            optional: true,  check: (u) => !!u.kota_asal },
];

function EmptyField() {
    return (
        <span className="profile-field-empty">
            <i className="fas fa-minus" style={{ fontSize: 10 }} /> Belum diisi
        </span>
    );
}

export default function Profile() {
    const storedUser = getStoredSsoUser();
    const user = storedUser
        ? {
            ...dummyUser,
            username: storedUser.username || dummyUser.username,
            nama: storedUser.name || dummyUser.nama,
            email: storedUser.email || dummyUser.email,
            no_telp: storedUser.no_hp || storedUser.phone || dummyUser.no_telp,
            kota_asal: storedUser.kecamatan || storedUser.city || dummyUser.kota_asal,
            kecamatan: storedUser.kecamatan || dummyUser.kecamatan,
            tanggal_lahir: storedUser.tanggal_lahir || storedUser.birthDate || dummyUser.tanggal_lahir,
            jenis_kelamin: storedUser.jenis_kelamin || storedUser.gender || dummyUser.jenis_kelamin,
        }
        : dummyUser;
    const initials = getInitials(user.nama);

    const doneCount = checklistItems.filter((i) => i.check(user)).length;
    const pct = Math.round((doneCount / checklistItems.length) * 100);

    const formatTgl = (str) => {
        if (!str) return null;
        return new Date(str).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <>
            <style>{`
                .profile-page {
                    min-height: 100vh;
                    background: var(--cream);
                    padding: 100px 0 64px;
                }
                .profile-container {
                    max-width: 960px;
                    margin: 0 auto;
                    padding: 0 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                /* ── Header Card ── */
                .profile-header-card {
                    background: white;
                    border-radius: var(--radius-xl);
                    border: 1px solid var(--border);
                    box-shadow: var(--shadow-card);
                    padding: 40px 32px 32px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                .profile-header-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 6px;
                    background: linear-gradient(90deg, var(--teal-600), var(--teal-400), var(--teal-800));
                }
                .profile-avatar {
                    width: 84px;
                    height: 84px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--teal-600), var(--teal-800));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: var(--font-display);
                    font-size: 28px;
                    font-weight: 700;
                    color: white;
                    letter-spacing: 2px;
                    margin-bottom: 16px;
                    box-shadow: 0 8px 24px rgba(64,114,175,.25);
                    flex-shrink: 0;
                }
                .profile-name {
                    font-family: var(--font-display);
                    font-size: 22px;
                    font-weight: 700;
                    color: var(--dark);
                    margin-bottom: 4px;
                }
                .profile-email {
                    font-size: 14px;
                    color: var(--text-muted);
                    margin-bottom: 14px;
                }
                .profile-badges {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                .profile-badge {
                    padding: 4px 12px;
                    border-radius: 50px;
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: .5px;
                }
                .badge-citizen {
                    background: rgba(64,114,175,.1);
                    color: var(--teal-700);
                    border: 1px solid rgba(64,114,175,.2);
                }
                .badge-verified {
                    background: rgba(13,148,136,.08);
                    color: #0f766e;
                    border: 1px solid rgba(13,148,136,.2);
                }

                /* ── Layout ── */
                .profile-grid {
                    display: grid;
                    grid-template-columns: 1fr 300px;
                    gap: 24px;
                }
                .profile-col {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                /* ── Card generic ── */
                .pcard {
                    background: white;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border);
                    box-shadow: var(--shadow-card);
                    padding: 28px;
                }
                .pcard-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: var(--teal-700);
                    margin-bottom: 20px;
                    padding-bottom: 14px;
                    border-bottom: 1px solid var(--border);
                }
                .pcard-title i {
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    background: var(--teal-50);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--teal-600);
                    font-size: 12px;
                    flex-shrink: 0;
                }

                /* ── Fields ── */
                .profile-field-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }
                .profile-field-grid.full {
                    grid-template-columns: 1fr;
                }
                .profile-field {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .profile-field.span2 { grid-column: 1 / -1; }
                .profile-field label {
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    color: var(--text-muted);
                }
                .profile-field-val {
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--dark);
                }
                .profile-field-empty {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    color: var(--text-muted);
                    font-style: italic;
                }
                .profile-sep {
                    height: 1px;
                    background: var(--border);
                    margin: 20px 0;
                }

                /* ── Completion card ── */
                .completion-label-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }
                .completion-label {
                    font-size: 13px;
                    color: var(--text-muted);
                }
                .completion-pct {
                    font-family: var(--font-display);
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--teal-700);
                }
                .completion-track {
                    height: 8px;
                    background: var(--teal-50);
                    border-radius: 50px;
                    overflow: hidden;
                    border: 1px solid var(--teal-100);
                    margin-bottom: 20px;
                }
                .completion-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--teal-500), var(--teal-700));
                    border-radius: 50px;
                    transition: width .6s ease;
                }
                .checklist {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                .check-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 13px;
                }
                .check-item-done { color: var(--dark); font-weight: 500; }
                .check-item-todo { color: var(--text-muted); }
                .check-opt { font-size: 11px; color: var(--text-muted); margin-left: 2px; }
                .dot-done {
                    width: 20px; height: 20px; border-radius: 50%;
                    background: rgba(13,148,136,.1);
                    border: 1px solid rgba(13,148,136,.3);
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0; color: #0f766e; font-size: 9px;
                }
                .dot-todo {
                    width: 20px; height: 20px; border-radius: 50%;
                    background: var(--teal-50);
                    border: 1px dashed var(--teal-200);
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0; color: var(--teal-300); font-size: 9px;
                }
                .btn-complete {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 11px;
                    border-radius: var(--radius-md);
                    border: 2px dashed var(--teal-300);
                    background: var(--teal-50);
                    color: var(--teal-700);
                    font-family: var(--font-body);
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--transition);
                }
                .btn-complete:hover {
                    background: var(--teal-100);
                    border-color: var(--teal-500);
                }

                /* ── Kontak ── */
                .contact-rows { display: flex; flex-direction: column; gap: 12px; }
                .contact-row { display: flex; align-items: center; gap: 12px; }
                .contact-ico {
                    width: 34px; height: 34px;
                    border-radius: 10px;
                    background: var(--teal-50);
                    border: 1px solid var(--teal-100);
                    display: flex; align-items: center; justify-content: center;
                    color: var(--teal-600); font-size: 12px;
                    flex-shrink: 0;
                }
                .contact-val { font-size: 13px; font-weight: 500; color: var(--dark); }
                .contact-empty { font-size: 13px; color: var(--text-muted); font-style: italic; }

                /* ── Alert ── */
                .profile-alert {
                    display: flex;
                    gap: 10px;
                    align-items: flex-start;
                    background: rgba(64,114,175,.06);
                    border: 1px solid rgba(64,114,175,.15);
                    border-radius: var(--radius-md);
                    padding: 14px;
                    margin-top: 16px;
                }
                .profile-alert i { color: var(--teal-600); font-size: 13px; margin-top: 2px; flex-shrink: 0; }
                .profile-alert-text { font-size: 12.5px; color: var(--teal-800); line-height: 1.6; }
                .profile-alert-link { color: var(--teal-600); font-weight: 600; text-decoration: underline; cursor: pointer; }

                /* ── Aktivitas ── */
                .activity-list { display: flex; flex-direction: column; gap: 12px; }
                .activity-item { display: flex; align-items: center; gap: 12px; }
                .activity-dot {
                    width: 34px; height: 34px; border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 12px; flex-shrink: 0;
                }
                .activity-dot.green { background: rgba(13,148,136,.1); color: #0f766e; border: 1px solid rgba(13,148,136,.2); }
                .activity-dot.blue  { background: rgba(64,114,175,.1);  color: var(--teal-600); border: 1px solid rgba(64,114,175,.2); }
                .activity-dot.gray  { background: var(--teal-50); color: var(--text-muted); border: 1px solid var(--border); }
                .activity-info-title { font-size: 13px; font-weight: 600; color: var(--dark); margin-bottom: 2px; }
                .activity-info-sub   { font-size: 11px; color: var(--text-muted); }

                /* ── Logout btn ── */
                .btn-logout {
                    display: flex; align-items: center; justify-content: center;
                    gap: 8px; width: 100%; padding: 10px;
                    border-radius: var(--radius-md);
                    border: 1px solid #fee2e2;
                    background: #fef2f2;
                    color: #b91c1c;
                    font-family: var(--font-body);
                    font-size: 13px; font-weight: 600;
                    cursor: pointer; transition: var(--transition);
                    margin-top: 4px;
                }
                .btn-logout:hover { background: #fee2e2; }

                /* ── Responsive ── */
                @media (max-width: 768px) {
                    .profile-page { padding: 86px 0 48px; }
                    .profile-grid { grid-template-columns: 1fr; }
                    .profile-field-grid { grid-template-columns: 1fr; }
                }
            `}</style>

            <div className="profile-page">
                <div className="profile-container">

                    {/* ── Header ── */}
                    <div className="profile-header-card">
                        <div className="profile-avatar">{initials}</div>
                        <div className="profile-name">{user.nama}</div>
                        <div className="profile-email">@{user.username}</div>
                        <div className="profile-badges">
                            {/* <span className="profile-badge badge-citizen">
                                <i className="fas fa-map-marker-alt" style={{ marginRight: 5 }} />
                                Warga Purbalingga
                            </span> */}
                            {user.email_verified && (
                                <span className="profile-badge badge-verified">
                                    <i className="fas fa-check-circle" style={{ marginRight: 5 }} />
                                    Email Terverifikasi
                                </span>
                            )}
                        </div>
                    </div>

                    {/* ── Grid ── */}
                    <div className="profile-grid">

                        {/* Kiri: data */}
                        <div className="profile-col">

                            {/* Data Pribadi */}
                            <div className="pcard">
                                <div className="pcard-title">
                                    <i className="fas fa-user" />
                                    Data Pribadi
                                </div>
                                <div className="profile-field-grid">
                                    <div className="profile-field">
                                        <label>Nama Lengkap</label>
                                        <div className="profile-field-val">{user.nama}</div>
                                    </div>
                                    <div className="profile-field">
                                        <label>Username</label>
                                        {user.username ? <div className="profile-field-val">@{user.username}</div> : <EmptyField />}
                                    </div>
                                    <div className="profile-field">
                                        <label>Tanggal Lahir</label>
                                        {user.tanggal_lahir
                                            ? <div className="profile-field-val">{formatTgl(user.tanggal_lahir)}</div>
                                            : <EmptyField />
                                        }
                                    </div>
                                    <div className="profile-field">
                                        <label>Jenis Kelamin</label>
                                        {user.jenis_kelamin
                                            ? <div className="profile-field-val">{user.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                                            : <EmptyField />
                                        }
                                    </div>
                                </div>

                                <div className="profile-sep" />

                                <div className="pcard-title" style={{ marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                                    <i className="fas fa-map-marker-alt" />
                                    Asal
                                </div>
                                <div className="profile-field-grid">
                                    <div className="profile-field span2">
                                        <label>Kota Asal</label>
                                        {user.kota_asal ? <div className="profile-field-val">{user.kota_asal}</div> : <EmptyField />}
                                    </div>
                                </div>
                            </div>

                            {/* Kontak */}
                            <div className="pcard">
                                <div className="pcard-title">
                                    <i className="fas fa-address-book" />
                                    Kontak
                                </div>
                                <div className="contact-rows">
                                    <div className="contact-row">
                                        <div className="contact-ico"><i className="fas fa-envelope" /></div>
                                        <span className="contact-val">{user.email}</span>
                                    </div>
                                    <div className="contact-row">
                                        <div className="contact-ico"><i className="fas fa-phone" /></div>
                                        <span className="contact-empty">Nomor HP belum diisi</span>
                                    </div>
                                </div>
                                <div className="profile-alert">
                                    <i className="fas fa-info-circle" />
                                    <div className="profile-alert-text">
                                        Lengkapi profil Anda agar bisa mengakses layanan publik digital seperti e-KTP, perizinan, dan pembelian tiket wisata.
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Kanan: sidebar */}
                        <div className="profile-col">

                            {/* Kelengkapan */}
                            <div className="pcard">
                                <div className="pcard-title">
                                    <i className="fas fa-tasks" />
                                    Kelengkapan Profil
                                </div>
                                <div className="completion-label-row">
                                    <span className="completion-label">{doneCount} dari {checklistItems.length} diisi</span>
                                    <span className="completion-pct">{pct}%</span>
                                </div>
                                <div className="completion-track">
                                    <div className="completion-fill" style={{ width: `${pct}%` }} />
                                </div>
                                <div className="checklist">
                                    {checklistItems.map((item) => {
                                        const done = item.check(user);
                                        return (
                                            <div className="check-item" key={item.key}>
                                                <div className={done ? 'dot-done' : 'dot-todo'}>
                                                    <i className={done ? 'fas fa-check' : 'fas fa-plus'} />
                                                </div>
                                                <span className={done ? 'check-item-done' : 'check-item-todo'}>
                                                    {item.label}
                                                    {item.optional && <span className="check-opt"> (opsional)</span>}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <Link to="/profile/edit" className="btn-complete">
                                    <i className="fas fa-pen" /> Lengkapi Profil
                                </Link>
                            </div>

                            {/* Aktivitas */}
                            <div className="pcard">
                                <div className="pcard-title">
                                    <i className="fas fa-history" />
                                    Riwayat Aktivitas
                                </div>
                                <div className="activity-list">
                                    <div className="activity-item">
                                        <div className="activity-dot green">
                                            <i className="fas fa-user-plus" />
                                        </div>
                                        <div>
                                            <div className="activity-info-title">Akun dibuat</div>
                                            <div className="activity-info-sub">12 Apr 2025</div>
                                        </div>
                                    </div>
                                    <div className="activity-item">
                                        <div className="activity-dot blue">
                                            <i className="fas fa-envelope-open" />
                                        </div>
                                        <div>
                                            <div className="activity-info-title">Email diverifikasi</div>
                                            <div className="activity-info-sub">12 Apr 2025</div>
                                        </div>
                                    </div>
                                    <div className="activity-item">
                                        <div className="activity-dot gray">
                                            <i className="fas fa-ticket-alt" />
                                        </div>
                                        <div>
                                            <div className="activity-info-title" style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Belum ada tiket wisata</div>
                                            <div className="activity-info-sub">
                                                <Link to="/#wisata" style={{ color: 'var(--teal-600)', fontWeight: 600 }}>Jelajahi wisata →</Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Logout */}
                            <button className="btn-logout">
                                <i className="fas fa-sign-out-alt" /> Keluar dari Akun
                            </button>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
