// src/components/LoadingScreen.jsx
import { useEffect, useState } from 'react';

export default function LoadingScreen({ isLoading = true, text = 'Memuat data...', minDuration = 800 }) {
    const [visible, setVisible] = useState(isLoading);
    const [progress, setProgress] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);

    /* ── Progress bar animasi ─────────────────────────────── */
    useEffect(() => {
        if (!visible) return;

        setProgress(0);
        let val = 0;

        const phase1 = setInterval(() => {
            val += Math.random() * 8 + 4;
            if (val >= 70) { val = 70; clearInterval(phase1); }
            setProgress(Math.min(val, 70));
        }, 60);

        const phase2 = setInterval(() => {
            val += Math.random() * 1.5 + 0.5;
            if (val >= 90) { val = 90; clearInterval(phase2); }
            setProgress(Math.min(val, 90));
        }, 200);

        return () => { clearInterval(phase1); clearInterval(phase2); };
    }, [visible]);

    useEffect(() => {
        if (isLoading) {
            setVisible(true);
            setFadeOut(false);
            return;
        }

        setProgress(100);
        const timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => setVisible(false), 500);
        }, Math.max(minDuration, 300));

        return () => clearTimeout(timer);
    }, [isLoading, minDuration]);

    if (!visible) return null;

    return (
        <>
            <style>{`
                /* ══════════════════════════════════════════════
                   LOADING SCREEN — Purbalingga Smart City
                   ══════════════════════════════════════════════ */

                .ls-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: #0a1d3d;
                    overflow: hidden;
                    transition: opacity 0.5s ease, visibility 0.5s ease;
                    opacity: 1;
                    visibility: visible;
                }
                .ls-overlay.ls-fade-out {
                    opacity: 0;
                    visibility: hidden;
                }

                /* ── Background layers ── */
                .ls-bg-pattern {
                    position: absolute;
                    inset: 0;
                    opacity: 0.04;
                    background-image: radial-gradient(circle at 2px 2px, #7aadd3 1px, transparent 0);
                    background-size: 36px 36px;
                    pointer-events: none;
                }
                .ls-bg-glow {
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(ellipse 60% 50% at 20% 50%, rgba(64,114,175,0.18) 0%, transparent 70%),
                        radial-gradient(ellipse 50% 60% at 80% 30%, rgba(122,173,211,0.10) 0%, transparent 70%);
                    pointer-events: none;
                }

                /* ── Animated rings behind logo ── */
                .ls-rings {
                    position: relative;
                    width: 148px;
                    height: 148px;
                    margin-bottom: 32px;
                    flex-shrink: 0;
                }
                .ls-ring {
                    position: absolute;
                    border-radius: 50%;
                    border: 1px solid rgba(122,173,211,0.2);
                    animation: ls-pulse 2.4s ease-in-out infinite;
                }
                .ls-ring-1 { inset: 0;        animation-delay: 0s; }
                .ls-ring-2 { inset: -16px;    animation-delay: 0.4s; border-color: rgba(122,173,211,0.12); }
                .ls-ring-3 { inset: -32px;    animation-delay: 0.8s; border-color: rgba(122,173,211,0.07); }

                @keyframes ls-pulse {
                    0%, 100% { transform: scale(1);    opacity: 1; }
                    50%       { transform: scale(1.06); opacity: 0.5; }
                }

                /* ── Logo container ── */
                .ls-logo-wrap {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .ls-logo-img {
                    width: 120px;
                    height: 180px;
                    object-fit: contain;
                    animation: ls-logo-in 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
                    filter: drop-shadow(0 0 20px rgba(122,173,211,0.35));
                }
                @keyframes ls-logo-in {
                    from { transform: scale(0.6); opacity: 0; }
                    to   { transform: scale(1);   opacity: 1; }
                }

                /* ── Fallback emblem (jika logo tidak load) ── */
                .ls-logo-fallback {
                    width: 88px;
                    height: 88px;
                    background: linear-gradient(135deg, #4072af, #1e3c6d);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 36px;
                    color: white;
                    animation: ls-logo-in 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
                    box-shadow: 0 0 24px rgba(64,114,175,0.4);
                }

                /* ── Text block ── */
                .ls-text-block {
                    text-align: center;
                    animation: ls-text-in 0.6s ease 0.2s both;
                    margin-bottom: 36px;
                }
                @keyframes ls-text-in {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .ls-title {
                    font-family: 'Playfair Display', Georgia, serif;
                    font-size: clamp(22px, 4vw, 30px);
                    font-weight: 700;
                    color: white;
                    letter-spacing: 0.5px;
                    line-height: 1.15;
                    margin-bottom: 4px;
                }
                .ls-subtitle {
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    color: #7aadd3;
                }

                /* ── Progress bar ── */
                .ls-bar-wrap {
                    width: clamp(200px, 55vw, 340px);
                    animation: ls-text-in 0.6s ease 0.35s both;
                }
                .ls-bar-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                .ls-bar-label {
                    font-size: 12px;
                    color: rgba(255,255,255,0.5);
                    letter-spacing: 0.3px;
                }
                .ls-bar-pct {
                    font-size: 12px;
                    font-weight: 600;
                    color: #7aadd3;
                    font-variant-numeric: tabular-nums;
                    min-width: 36px;
                    text-align: right;
                }
                .ls-bar-track {
                    width: 100%;
                    height: 4px;
                    background: rgba(255,255,255,0.08);
                    border-radius: 99px;
                    overflow: hidden;
                    position: relative;
                }
                .ls-bar-fill {
                    height: 100%;
                    border-radius: 99px;
                    background: linear-gradient(90deg, #4072af, #7aadd3, #5d93c7);
                    background-size: 200% 100%;
                    transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }
                /* Shimmer di atas bar */
                .ls-bar-fill::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%);
                    background-size: 200% 100%;
                    animation: ls-shimmer 1.4s linear infinite;
                }
                @keyframes ls-shimmer {
                    from { background-position: -200% center; }
                    to   { background-position: 200% center; }
                }

                /* ── Dots (subtle bottom decoration) ── */
                .ls-dots {
                    position: absolute;
                    bottom: 32px;
                    display: flex;
                    gap: 8px;
                    animation: ls-text-in 0.6s ease 0.5s both;
                }
                .ls-dot {
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background: rgba(122,173,211,0.4);
                    animation: ls-dot-bounce 1.4s ease-in-out infinite;
                }
                .ls-dot:nth-child(2) { animation-delay: 0.18s; }
                .ls-dot:nth-child(3) { animation-delay: 0.36s; }
                @keyframes ls-dot-bounce {
                    0%, 80%, 100% { transform: scale(1);   opacity: 0.4; }
                    40%            { transform: scale(1.5); opacity: 1; }
                }

                /* ══ RESPONSIVE ═══════════════════════════════ */
                @media (max-width: 480px) {
                    .ls-rings        { width: 120px; height: 120px; margin-bottom: 24px; }
                    .ls-logo-img,
                    .ls-logo-fallback { width: 68px; height: 68px; }
                    .ls-logo-fallback { border-radius: 16px; font-size: 28px; }
                    .ls-ring-2       { inset: -12px; }
                    .ls-ring-3       { inset: -24px; }
                    .ls-title        { font-size: 20px; }
                    .ls-bar-wrap     { width: calc(100vw - 64px); }
                    .ls-dots         { bottom: 20px; }
                }
                @media (max-width: 360px) {
                    .ls-rings        { width: 100px; height: 100px; margin-bottom: 20px; }
                    .ls-logo-img,
                    .ls-logo-fallback { width: 56px; height: 56px; }
                    .ls-title        { font-size: 18px; }
                    .ls-subtitle     { font-size: 10px; letter-spacing: 2px; }
                }
            `}</style>

            <div className={`ls-overlay${fadeOut ? ' ls-fade-out' : ''}`} role="status" aria-live="polite" aria-label="Memuat halaman">

                {/* Background decorations */}
                <div className="ls-bg-pattern" aria-hidden="true" />
                <div className="ls-bg-glow"    aria-hidden="true" />

                {/* Animated rings + Logo */}
                <div className="ls-rings" aria-hidden="true">
                    <div className="ls-ring ls-ring-1" />
                    <div className="ls-ring ls-ring-2" />
                    <div className="ls-ring ls-ring-3" />
                    <div className="ls-logo-wrap">
                        <img
                            src="img/logo/logo_smartcity.png"
                            alt="Purbalingga Smart City"
                            className="ls-logo-img"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                        {/* Fallback jika gambar gagal load */}
                        <div className="ls-logo-fallback" style={{ display: 'none' }}>
                            <i className="fas fa-city" />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <div className="ls-text-block">
                    <div className="ls-title">Purbalingga</div>
                    <div className="ls-subtitle">Smart City</div>
                </div>

                {/* Progress bar */}
                <div className="ls-bar-wrap">
                    <div className="ls-bar-header">
                        <span className="ls-bar-label">{text}</span>
                        <span className="ls-bar-pct">{Math.round(progress)}%</span>
                    </div>
                    <div className="ls-bar-track">
                        <div className="ls-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                {/* Bottom dots */}
                <div className="ls-dots" aria-hidden="true">
                    <div className="ls-dot" />
                    <div className="ls-dot" />
                    <div className="ls-dot" />
                </div>
            </div>
        </>
    );
}