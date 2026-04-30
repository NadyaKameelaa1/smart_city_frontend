// src/components/PengumumanCard.jsx
import { Link } from 'react-router-dom';

const formatTanggal = (str) => {
    if (!str) return null;
    return new Date(str).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const PRIORITAS_LABEL = { mendesak: 'Mendesak', sedang: 'Sedang', umum: 'Umum' };
const PRIORITAS_COLOR = {
    mendesak: { bg: '#fee2e2', text: '#991b1b', border: '#f87171' },
    sedang:   { bg: '#fef3c7', text: '#92400e', border: '#fbbf24' },
    umum:     { bg: '#dcfce7', text: '#166534', border: '#4ade80' },
};

const isExpired = (tanggal_berakhir) => {
    if (!tanggal_berakhir) return false;
    return new Date(tanggal_berakhir) < new Date();
};

// ── Prioritas bar color ───────────────────────────────────────
const PRIORITAS_BAR = {
    mendesak: '#ef4444',
    sedang:   '#f59e0b',
    umum:     '#10b981',
};

export default function PengumumanCard({ p, index }) {
    const expired = isExpired(p.tanggal_berakhir);
    const color   = PRIORITAS_COLOR[p.prioritas] || PRIORITAS_COLOR.umum;
    const barColor = expired ? '#9ca3af' : (PRIORITAS_BAR[p.prioritas] || PRIORITAS_BAR.umum);

    return (
        <Link
            to={`/pengumuman/${p.slug}`}
            className="pengumuman-full-item"
            style={{
                opacity:     expired ? 0.5 : 1,
                background:  expired ? '#fcfcfc' : 'white',
                borderStyle: expired ? 'dashed' : 'solid',
                textDecoration: 'none',
            }}
        >
            {/* Bar kiri warna prioritas */}
            <div
                className="pengumuman-priority-bar"
                style={{ background: barColor }}
            />

            {/* Nomor urut */}
            <div className="pengumuman-full-num">
                {String(index + 1).padStart(2, '0')}
            </div>

            {/* Konten */}
            <div className="pengumuman-full-content">
                <div className="pengumuman-full-top">
                    <h3 className="pengumuman-full-title">{p.judul}</h3>

                    <div className="pengumuman-full-badges">
                        {expired ? (
                            <span style={{
                                fontSize: 10, fontWeight: 700, padding: '3px 10px',
                                borderRadius: 50, letterSpacing: .5,
                                background: '#f3f4f6', color: '#6b7280',
                                border: '1px solid #e5e7eb',
                                display: 'flex', alignItems: 'center', gap: 5,
                            }}>
                                <i className="fas fa-clock" /> Sudah Berakhir
                            </span>
                        ) : (
                            <span
                                className="prio-badge"
                                style={{
                                    backgroundColor: color.bg,
                                    color:           color.text,
                                    border:          `1px solid ${color.border}`,
                                    padding:         '2px 10px',
                                    borderRadius:    '50px',
                                    fontWeight:      700,
                                    textTransform:   'capitalize',
                                    fontSize:        10,
                                }}
                            >
                                {PRIORITAS_LABEL[p.prioritas] || p.prioritas}
                            </span>
                        )}

                        {Number(p.penting) === 1 && !expired && (
                            <span className="penting-badge">
                                <i className="fas fa-exclamation-circle" /> Penting
                            </span>
                        )}
                    </div>
                </div>

                <p className="pengumuman-full-isi">{p.isi}</p>

                <div className="pengumuman-full-meta">
                    {p.tanggal_mulai && (
                        <span style={{ color: expired ? '#9ca3af' : 'var(--teal-600)', fontWeight: 500 }}>
                            <i className="fas fa-hourglass-half" />
                            {' '}{formatTanggal(p.tanggal_mulai)}
                            {p.tanggal_berakhir && <> – {formatTanggal(p.tanggal_berakhir)}</>}
                        </span>
                    )}
                    <span><i className="fas fa-building" /> {p.publisher}</span>
                </div>
            </div>

            <i className="fas fa-chevron-right pengumuman-full-arrow" />
        </Link>
    );
}