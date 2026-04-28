// src/components/PWAInstallPrompt.jsx
import { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt,     setShowPrompt]     = useState(false);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Tampilkan setelah 3 detik
            setTimeout(() => setShowPrompt(true), 3000);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowPrompt(false);
        }
        setDeferredPrompt(null);
    };

    if (!showPrompt) return null;

    return (
        <div style={{
            position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            zIndex: 9999, background: '#0f2952', color: 'white',
            borderRadius: 16, padding: '14px 20px',
            display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: '0 8px 32px rgba(0,0,0,.3)',
            maxWidth: 360, width: 'calc(100% - 32px)',
            border: '1px solid rgba(255,255,255,.15)',
            animation: 'slideUp .3s ease',
        }}>
            <style>{`@keyframes slideUp{from{opacity:0;transform:translate(-50%,20px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="fas fa-mobile-alt" style={{ fontSize: 18, color: '#5eead4' }} />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Install Aplikasi</div>
                <div style={{ fontSize: 12, opacity: .7, lineHeight: 1.4 }}>
                    Pasang di layar utama untuk akses lebih cepat
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button onClick={handleInstall} style={{
                    padding: '6px 14px', borderRadius: 8,
                    background: '#5eead4', color: '#0f2952',
                    border: 'none', fontWeight: 700, fontSize: 12,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                }}>
                    Install
                </button>
                <button onClick={() => setShowPrompt(false)} style={{
                    padding: '4px 14px', borderRadius: 8,
                    background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.7)',
                    border: '1px solid rgba(255,255,255,.15)', fontSize: 11,
                    cursor: 'pointer',
                }}>
                    Nanti
                </button>
            </div>
        </div>
    );
}