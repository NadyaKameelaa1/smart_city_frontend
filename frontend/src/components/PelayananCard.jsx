// src/components/PelayananCard.jsx
// Tidak ada <style> di sini — CSS card (.pelayanan-card-new) sudah ada di Pelayanan.jsx

const KATEGORI_COLOR = {
    Pengadaan:    { bg: 'rgba(64,114,175,.1)',  color: 'var(--teal-700)',  border: 'rgba(64,114,175,.2)'  },
    Informasi:    { bg: 'rgba(13,148,136,.08)', color: '#0f766e',          border: 'rgba(13,148,136,.2)'  },
    Hukum:        { bg: 'rgba(124,58,237,.08)', color: '#6d28d9',          border: 'rgba(124,58,237,.2)'  },
    Pemerintahan: { bg: 'rgba(30,58,138,.08)',  color: '#1e3a8a',          border: 'rgba(30,58,138,.2)'   },
    Perizinan:    { bg: 'rgba(212,168,83,.12)', color: '#92400e',          border: 'rgba(212,168,83,.3)'  },
    Keuangan:     { bg: 'rgba(5,150,105,.08)',  color: '#047857',          border: 'rgba(5,150,105,.2)'   },
    Kesehatan:    { bg: 'rgba(220,38,38,.07)',  color: '#b91c1c',          border: 'rgba(220,38,38,.15)'  },
    Sosial:       { bg: 'rgba(236,72,153,.07)', color: '#9d174d',          border: 'rgba(236,72,153,.15)' },
    Pengaduan:    { bg: 'rgba(239,68,68,.07)',  color: '#b91c1c',          border: 'rgba(239,68,68,.15)'  },
};

const defaultColor = { bg: 'var(--teal-50)', color: 'var(--teal-700)', border: 'var(--teal-100)' };

export default function PelayananCard({ data }) {
    const col        = KATEGORI_COLOR[data.kategori] || defaultColor;
    const isExternal = data.url?.startsWith('http');

    return (
        <a
            href={data.url || '#'}
            className="pelayanan-card-new"
            target={isExternal ? '_blank' : '_self'}
            rel={isExternal ? 'noreferrer' : undefined}
        >
            <div
                className="pelayanan-card-new__icon-wrap"
                style={{ background: col.bg, border: `1px solid ${col.border}` }}
            >
                <i className={`fas ${data.icon}`} style={{ color: col.color }} />
            </div>
            <div className="pelayanan-card-new__name">{data.nama}</div>
            <div className="pelayanan-card-new__desc">{data.deskripsi}</div>
            <div className="pelayanan-card-new__footer">
                <span
                    className="pelayanan-card-new__badge"
                    style={{ background: col.bg, color: col.color, border: `1px solid ${col.border}` }}
                >
                    {data.kategori}
                </span>
                <div className="pelayanan-card-new__arrow">
                    <i className={`fas ${isExternal ? 'fa-external-link-alt' : 'fa-arrow-right'}`} />
                </div>
            </div>
        </a>
    );
}