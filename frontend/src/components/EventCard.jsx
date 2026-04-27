// src/components/EventCard.jsx
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

// ── CSS inject (pakai id di DOM, bukan module-level flag) ─────
const STYLE_ID = 'event-card-styles';
const STYLE = `
/* ── Overlay fullsize poster ── */
.event-poster-overlay {
    position: fixed;
    inset: 0;
    z-index: 99999;
    background: rgba(10,29,61,.88);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    animation: epFadeIn .2s ease;
    cursor: pointer;
}
@keyframes epFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
}
.event-poster-img-wrap {
    position: relative;
    max-width: min(90vw, 720px);
    max-height: 90vh;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 32px 80px rgba(0,0,0,.55);
    animation: epZoomIn .22s ease;
    cursor: default;
}
@keyframes epZoomIn {
    from { transform: scale(.94); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
}
.event-poster-img-wrap img {
    display: block;
    width: 100%;
    height: 100%;
    max-height: 85vh;
    object-fit: contain;
}
.event-poster-close {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: rgba(10,29,61,.8);
    border: 1.5px solid rgba(255,255,255,.25);
    color: white;
    font-size: 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background .15s, transform .15s;
    z-index: 2;
    line-height: 1;
}
.event-poster-close:hover {
    background: #ef4444;
    transform: rotate(90deg);
}
.event-poster-hint {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    color: rgba(255,255,255,.45);
    letter-spacing: .5px;
    pointer-events: none;
    white-space: nowrap;
}

/* ── Card style: putih seperti WisataCard ── */
.event-card-uniform {
    display: flex;
    flex-direction: column;
    border-radius: var(--radius-lg, 24px);
    overflow: hidden;
    transition: all .3s cubic-bezier(.4,0,.2,1);
    height: 100%;
    background: white;
    border: 1px solid var(--border, #dae2ef);
    box-shadow: 0 2px 12px rgba(20,80,120,.07);
}
.event-card-uniform:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 32px rgba(20,80,120,.15);
    border-color: var(--teal-200, #b8cce3);
}

.event-card-uniform .ec-img-wrap {
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
    cursor: pointer;
}
.event-card-uniform .ec-img {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    transition: transform .4s ease;
    display: block;
}
.event-card-uniform:hover .ec-img {
    transform: scale(1.05);
}

.ec-img-hover-hint {
    position: absolute;
    inset: 0;
    background: rgba(10,29,61,0);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background .25s;
}
.event-card-uniform .ec-img-wrap:hover .ec-img-hover-hint {
    background: rgba(10,29,61,.32);
}
.ec-img-hover-hint-icon {
    color: white;
    font-size: 26px;
    opacity: 0;
    transform: scale(.8);
    transition: opacity .2s, transform .2s;
}
.event-card-uniform .ec-img-wrap:hover .ec-img-hover-hint-icon {
    opacity: 1;
    transform: scale(1);
}

.event-card-uniform .ec-body {
    padding: 16px 18px 18px;
    display: flex;
    flex-direction: column;
    flex: 1;
}
.event-card-uniform .ec-category {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--teal-600, #4072af);
    margin-bottom: 6px;
}
.event-card-uniform .ec-title {
    font-family: var(--font-display, 'Playfair Display', serif);
    font-size: 15px;
    color: var(--text-dark, #102d4d);
    margin-bottom: 12px;
    line-height: 1.4;
    font-weight: 700;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.event-card-uniform .ec-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: auto;
}
.event-card-uniform .ec-info-item {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    color: var(--text-muted, #4d6888);
}
.event-card-uniform .ec-info-item i {
    color: var(--teal-500, #4f83bf);
    width: 14px;
    flex-shrink: 0;
}
`;

function InjectStyle() {
    useEffect(() => {
        if (document.getElementById(STYLE_ID)) return;
        const el = document.createElement('style');
        el.id = STYLE_ID;
        el.textContent = STYLE;
        document.head.appendChild(el);
    }, []);
    return null;
}

// ── Poster Overlay ────────────────────────────────────────────
function PosterOverlay({ src, alt, onClose }) {
    const handleKey = useCallback((e) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = prev;
        };
    }, [handleKey]);

    return createPortal(
        <div
            className="event-poster-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="event-poster-img-wrap"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="event-poster-close"
                    onClick={onClose}
                    aria-label="Tutup"
                >
                    <i className="fas fa-times" />
                </button>
                <img src={src} alt={alt} />
            </div>
            <span className="event-poster-hint">
                Klik di luar gambar atau tekan Esc untuk menutup
            </span>
        </div>,
        document.body
    );
}

// ── Helper format tanggal ─────────────────────────────────────
function formatTgl(str) {
    const d = new Date(str);
    return {
        day:   d.getDate(),
        month: d.toLocaleDateString('id-ID', { month: 'short' }),
        full:  d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
}

// ── EventCard ─────────────────────────────────────────────────
export default function EventCard({ event: e, showFullDate = false }) {
    const [showPoster, setShowPoster] = useState(false);
    const { day, month, full } = formatTgl(e.tanggal);

    return (
        <>
            <InjectStyle />

            <div className="event-card-uniform">
                {/* Gambar — klik untuk fullsize */}
                <div
                    className="ec-img-wrap"
                    onClick={() => setShowPoster(true)}
                    title="Klik untuk melihat gambar penuh"
                >
                    <img src={e.gambar} alt={e.nama} className="ec-img" />

                    <div className="event-date-badge">
                        <div className="event-date-day">{day}</div>
                        <div className="event-date-mon">{month}</div>
                    </div>

                    <div className="ec-img-hover-hint">
                        <i className="fas fa-expand-alt ec-img-hover-hint-icon" />
                    </div>
                </div>

                {/* Body */}
                <div className="ec-body">
                    <div className="ec-category">{e.kategori}</div>
                    <h3 className="ec-title">{e.nama}</h3>
                    <div className="ec-info">
                        {showFullDate && (
                            <div className="ec-info-item">
                                <i className="fas fa-calendar" /> {full}
                            </div>
                        )}
                        <div className="ec-info-item">
                            <i className="fas fa-clock" /> {e.jam}
                        </div>
                        <div className="ec-info-item">
                            <i className="fas fa-map-marker-alt" /> {e.lokasi}
                        </div>
                        <div className="ec-info-item">
                            <i className="fas fa-users" /> {e.penyelenggara}
                        </div>
                    </div>
                </div>
            </div>

            {showPoster && (
                <PosterOverlay
                    src={e.gambar}
                    alt={e.nama}
                    onClose={() => setShowPoster(false)}
                />
            )}
        </>
    );
}