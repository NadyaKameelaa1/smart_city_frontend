// src/components/MiniMap.jsx
import { useEffect, useRef } from 'react';

export default function MiniMap() {
    const mapRef = useRef(null);
    const instanceRef = useRef(null);

    useEffect(() => {
        // Jangan init dua kali (React StrictMode)
        if (instanceRef.current) return;

        // Pastikan Leaflet sudah tersedia (di-load via index.html CDN)
        const L = window.L;
        if (!L || !mapRef.current) return;

        const map = L.map(mapRef.current, {
            center: [-7.3906, 109.3647],
            zoom: 12,
            zoomControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            touchZoom: false,
            keyboard: false,
            attributionControl: false,
        });

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);

        const dotIcon = L.divIcon({
            html: `<div style="background:#5d93c7;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 0 4px rgba(93,147,199,.3);"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
            className: '',
        });

        L.marker([-7.3906, 109.3647], { icon: dotIcon }).addTo(map);

        instanceRef.current = map;
    }, []);

    return (
        <div
            ref={mapRef}
            style={{ width: '100%', height: '100%', minHeight: 480 }}
        />
    );
}