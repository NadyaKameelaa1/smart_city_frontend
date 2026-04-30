import React from 'react';
import { useNavigate } from 'react-router-dom';

// Helper format rupiah
const formatRupiah = (n) => 'Rp ' + (n || 0).toLocaleString('id-ID');

// Base URL untuk gambar dari Laravel
const BASE_IMAGE_URL = 'https://apismartcity.qode.my.id/storage/';

export default function WisataCard({ w }) {
    const navigate = useNavigate();

    // Fungsi navigasi
    const handleNavigate = () => {
        navigate(`/wisata/${w.slug || w.id}`);
    };

    return (
        <div 
            className="wisata-card" 
            onClick={handleNavigate}
            style={{ cursor: 'pointer' }}
        >
            <div className="wisata-card-img-wrap">
                {/* Pastikan menggunakan path storage Laravel */}
                <img 
                    src={w.thumbnail?.startsWith('http') ? w.thumbnail : `${BASE_IMAGE_URL}${w.thumbnail}`} 
                    alt={w.nama} 
                    onError={(e) => { e.target.src = 'https://placehold.co/300x200?text=No+Image'; }}
                    className="wisata-card-img" 
                />
                <span className="wisata-card-badge">{w.kategori || 'Wisata'}</span>
                <span className="wisata-card-ticket">
                    <i className="fas fa-arrow-right" /> Lihat Detail
                </span>
            </div>
            <div className="wisata-card-body">
                <h3 className="wisata-card-name">{w.nama}</h3>
                <div className="wisata-card-location">
                    <i className="fas fa-map-marker-alt" style={{ color: 'var(--teal-500)' }} /> {w.alamat_lengkap || 'Purbalingga'}
                </div>
                <p className="wisata-card-desc">
                    {w.deskripsi?.length > 100 ? w.deskripsi.substring(0, 100) + '...' : w.deskripsi}
                </p>
                <div className="wisata-card-footer">
                    <div className="wisata-rating">
                        <i className="fas fa-star" style={{ color: '#f59e0b' }} />
                        {' '}{Number(w.rating || 0).toFixed(1)}
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 4 }}>
                            ({w.total_review || 0} ulasan)
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
