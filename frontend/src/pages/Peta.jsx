// src/pages/Peta.jsx
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';

// ─── Koordinat & zoom ─────────────────────────────────────────
const CENTER       = [-7.3906, 109.3647];
const ZOOM_DEFAULT = 15;
const ZOOM_FLY     = 17;

// ─── Kategori Wisata (hardcoded, sesuai enum DB) ──────────────
const WISATA_CATEGORIES = [
    { id: 'wisata-alam',     nama: 'Alam',     icon_marker: 'fa-tree',         color_theme: '#16a34a', key: 'Alam'     },
    { id: 'wisata-rekreasi', nama: 'Rekreasi', icon_marker: 'fa-map-location-dot', color_theme: '#0ea5e9', key: 'Rekreasi' },
    { id: 'wisata-budaya',   nama: 'Budaya',   icon_marker: 'fa-masks-theater', color_theme: '#a855f7', key: 'Budaya'   },
    { id: 'wisata-kuliner',  nama: 'Kuliner',  icon_marker: 'fa-utensils',     color_theme: '#f59e0b', key: 'Kuliner'  },
    { id: 'wisata-religi',   nama: 'Religi',   icon_marker: 'fa-mosque',       color_theme: '#ec4899', key: 'Religi'   },
    { id: 'wisata-edukasi',  nama: 'Edukasi',  icon_marker: 'fa-graduation-cap', color_theme: '#06b6d4', key: 'Edukasi'  },
];

const WISATA_GROUP = { id: 'wisata-group', nama: 'Destinasi Wisata' };

// ─── Helper: URL thumbnail ────────────────────────────────────
const thumbUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
    return `${base}/storage/${path}`;
};

// ─── Highlight teks pencarian ──────────────────────────────────
function Highlight({ text = '', query = '' }) {
    if (!query.trim()) return <span>{text}</span>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    return (
        <span>
            {text.slice(0, idx)}
            <mark style={{ background: '#0d9488', color: 'white', borderRadius: 3, padding: '0 2px' }}>
                {text.slice(idx, idx + query.length)}
            </mark>
            {text.slice(idx + query.length)}
        </span>
    );
}

// ─── Badge kategori ───────────────────────────────────────────
function CategoryBadge({ category }) {
    if (!category) return null;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', borderRadius: 50, fontSize: 10, fontWeight: 600,
            background: category.color_theme + '28', color: category.color_theme,
            border: `1px solid ${category.color_theme}55`,
            flexShrink: 0, whiteSpace: 'nowrap',
        }}>
            <i className={`fas ${category.icon_marker}`} style={{ fontSize: 9 }} />
            {category.nama}
        </span>
    );
}

// ─── Skeleton loading ─────────────────────────────────────────
function SidebarSkeleton() {
    return (
        <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3, 4, 5].map(g => (
                <div key={g}>
                    <div style={{ height: 10, width: 80, borderRadius: 6, background: 'rgba(255,255,255,.08)', marginBottom: 10 }} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4 }}>
                        {[1, 2, 3, 4].map(c => (
                            <div key={c} style={{ height: 60, borderRadius: 10, background: 'rgba(255,255,255,.05)', animation: 'petaSkel 1.2s ease infinite' }} />
                        ))}
                    </div>
                </div>
            ))}
            <style>{`@keyframes petaSkel{0%,100%{opacity:1}50%{opacity:.35}}`}</style>
        </div>
    );
}

// ════════════════════════════════════════════════════════════
export default function Peta() {
    const [searchParams]  = useSearchParams();
    const mapRef          = useRef(null);
    const instanceRef     = useRef(null);
    const bldMarkersRef   = useRef([]);   // { marker, building, _type:'building' }[]
    const wisataMarkersRef= useRef([]);   // { marker, wisata, wisataCatId }[]
    const cctvMarkersRef  = useRef([]);
    const searchWrapRef   = useRef(null);

    // ── UI state ──────────────────────────────────────────────
    const [sidebarOpen,      setSidebarOpen]      = useState(true);
    const [query,            setQuery]            = useState('');
    const [searchFocused,    setSearchFocused]    = useState(false);
    const [activeCategories, setActiveCategories] = useState([]);
    const [showAll,          setShowAll]          = useState(false);

    // ── Data dari API ─────────────────────────────────────────
    const [groups,      setGroups]      = useState([]);
    const [categories,  setCategories]  = useState([]);
    const [buildings,   setBuildings]   = useState([]);
    const [wisataData,  setWisataData]  = useState([]);
    const [cctvData,    setCctvData]    = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [dataError,   setDataError]   = useState(null);

    // ── Helpers ───────────────────────────────────────────────
    const getCategoryById    = useCallback((id) => categories.find(c => c.id === id), [categories]);
    const getGroupById       = useCallback((id) => groups.find(g => g.id === id), [groups]);
    const getWisataCatByKey  = useCallback((key) => WISATA_CATEGORIES.find(c => c.key === key), []);

    // ── Fetch data ────────────────────────────────────────────
    useEffect(() => {
        const fetchAll = async () => {
            setDataLoading(true);
            setDataError(null);
            try {
                const [gRes, cRes, bRes, cctvRes, wisataRes] = await Promise.all([
                    api.get('/building-groups'),
                    api.get('/building-categories'),
                    api.get('/super-admin/buildings'),
                    api.get('/super-admin/cctv'),
                    api.get('/wisata'),
                ]);

                const groupsData     = gRes.data?.data    || gRes.data    || [];
                const categoriesData = cRes.data?.data    || cRes.data    || [];
                const buildingsData  = bRes.data?.data    || bRes.data    || [];
                const cctvRaw        = cctvRes.data?.data || cctvRes.data || [];
                const wisataRaw      = wisataRes.data?.data || wisataRes.data || [];

                setGroups(groupsData);
                setCategories(categoriesData);

                // Normalize buildings
                const normalized = buildingsData
                    .filter(b => b.status === 'aktif')
                    .map(b => ({
                        ...b,
                        _type: 'building',
                        category: b.category || categoriesData.find(c => c.id === b.category_id) || null,
                        lat: b.marker?.lat ?? null,
                        lng: b.marker?.lng ?? null,
                    }))
                    .filter(b => b.lat !== null && b.lng !== null);
                setBuildings(normalized);

                // Normalize wisata
                const wisataNorm = wisataRaw
                    .filter(w => w.status === 'Aktif')
                    .map(w => ({
                        ...w,
                        _type: 'wisata',
                        lat: w.marker?.lat ?? null,
                        lng: w.marker?.lng ?? null,
                        // Mapping kategori wisata ke id virtual
                        wisataCatId: `wisata-${(w.kategori || '').toLowerCase()}`,
                    }))
                    .filter(w => w.lat !== null && w.lng !== null);
                setWisataData(wisataNorm);

                // Normalize CCTV
                const cctvWithCoords = cctvRaw
                    .map(c => ({
                        ...c,
                        _type: 'cctv',
                        lat: c.lat ?? c.marker?.lat ?? null,
                        lng: c.lng ?? c.marker?.lng ?? null,
                    }))
                    .filter(c => c.lat !== null && c.lng !== null);
                setCctvData(cctvWithCoords);

            } catch (err) {
                console.error('Peta: gagal fetch data', err);
                setDataError('Gagal memuat data peta.');
            } finally {
                setDataLoading(false);
            }
        };
        fetchAll();
    }, []);

    // ── Sidebar groups (CCTV dikecualikan) ───────────────────
    const sidebarGroups = useMemo(() => {
        const buildingGroups = groups.map(g => ({
            ...g,
            _type: 'building-group',
            categories: categories.filter(c => c.group_id === g.id && c.nama.toLowerCase() !== 'cctv'),
        }));

        // Tambahkan wisata group virtual di akhir
        const wisataGroup = {
            ...WISATA_GROUP,
            _type: 'wisata-group',
            categories: WISATA_CATEGORIES,
        };

        return [...buildingGroups, wisataGroup];
    }, [groups, categories]);

    // ── Badge count per kategori ──────────────────────────────
    const countByCategory = useMemo(() => {
        const map = {};
        // Buildings
        buildings.forEach(b => { map[b.category_id] = (map[b.category_id] || 0) + 1; });
        // Wisata per kategori virtual
        wisataData.forEach(w => { map[w.wisataCatId] = (map[w.wisataCatId] || 0) + 1; });
        return map;
    }, [buildings, wisataData]);

    // ── Semua category_id yang ada data-nya ──────────────────
    const allCategoryIds = useMemo(() => {
        const bldCats    = [...new Set(buildings.map(b => b.category_id))];
        const wisataCats = [...new Set(wisataData.map(w => w.wisataCatId))];
        return [...bldCats, ...wisataCats];
    }, [buildings, wisataData]);

    // ── Live search (buildings + wisata + cctv) ───────────────
    const searchResults = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];

        const blds = buildings.filter(b => {
            const cat   = b.category || getCategoryById(b.category_id);
            const group = cat ? getGroupById(cat.group_id) : null;
            return (
                b.nama.toLowerCase().includes(q) ||
                (b.alamat || '').toLowerCase().includes(q) ||
                (b.deskripsi || '').toLowerCase().includes(q) ||
                (cat   && cat.nama.toLowerCase().includes(q)) ||
                (group && group.nama.toLowerCase().includes(q))
            );
        });

        const wisatas = wisataData.filter(w =>
            w.nama.toLowerCase().includes(q) ||
            (w.kategori || '').toLowerCase().includes(q) ||
            (w.deskripsi || '').toLowerCase().includes(q) ||
            (w.alamat_lengkap || '').toLowerCase().includes(q)
        );

        const cctvs = cctvData.filter(c =>
            c.nama.toLowerCase().includes(q) ||
            (c.status || '').toLowerCase().includes(q) ||
            (c.alamat || '').toLowerCase().includes(q)
        );

        return [
            ...blds.map(b => ({ ...b, _type: 'building' })),
            ...wisatas.map(w => ({ ...w, _type: 'wisata' })),
            ...cctvs.map(c => ({ ...c, _type: 'cctv' })),
        ];
    }, [query, buildings, wisataData, cctvData, categories, groups]);

    const showDropdown = searchFocused && query.trim().length > 0;

    // ── flyToItem ─────────────────────────────────────────────
    const flyToItem = useCallback((item) => {
        const map = instanceRef.current;
        if (!map) return;

        setQuery('');
        setSearchFocused(false);

        if (item._type === 'building') {
            const catId = item.category_id;
            setActiveCategories(prev => prev.includes(catId) ? prev : [...prev, catId]);
            map.flyTo([item.lat, item.lng], ZOOM_FLY, { duration: 0.9 });
            window._petaPendingPopup = { id: item.id, catId, type: 'building' };

        } else if (item._type === 'wisata') {
            const catId = item.wisataCatId;
            setActiveCategories(prev => prev.includes(catId) ? prev : [...prev, catId]);
            map.flyTo([item.lat, item.lng], ZOOM_FLY, { duration: 0.9 });
            window._petaPendingPopup = { id: item.id, catId, type: 'wisata' };

        } else if (item._type === 'cctv') {
            map.flyTo([item.lat, item.lng], ZOOM_FLY, { duration: 0.9 });
            setTimeout(() => {
                const found = cctvMarkersRef.current.find(m => m.cctv.id === item.id);
                if (found) found.marker.openPopup();
            }, 1100);
        }
    }, []);

    // ── Tampilkan semua lokasi ────────────────────────────────
    const handleShowAll = useCallback(() => {
        setShowAll(true);
        setActiveCategories(allCategoryIds);

        const map = instanceRef.current;
        const L   = window.L;
        if (!map || !L) return;

        const allLatLngs = [
            ...buildings.filter(b => b.lat && b.lng).map(b => [b.lat, b.lng]),
            ...wisataData.filter(w => w.lat && w.lng).map(w => [w.lat, w.lng]),
        ];
        if (allLatLngs.length > 0) {
            map.fitBounds(L.latLngBounds(allLatLngs), { padding: [48, 48], maxZoom: 14 });
        }
    }, [allCategoryIds, buildings, wisataData]);

    const handleHideAll = useCallback(() => {
        setShowAll(false);
        setActiveCategories([]);
    }, []);

    const toggleCategory = useCallback((catId) => {
        setShowAll(false);
        setActiveCategories(prev =>
            prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
        );
    }, []);

    // ─────────────────────────────────────────────────────────
    // Init Leaflet
    // ─────────────────────────────────────────────────────────
    useEffect(() => {
        const L = window.L;
        if (!L || !mapRef.current || instanceRef.current) return;

        const map = L.map(mapRef.current, {
            center: CENTER,
            zoom: ZOOM_DEFAULT,
            zoomControl: false,
        });

        L.control.zoom({ position: 'bottomleft' }).addTo(map);

        // Custom control: Pusat Kota
        const PusatKotaControl = L.Control.extend({
            options: { position: 'bottomleft' },
            onAdd() {
                const btn = L.DomUtil.create('button', '');
                btn.innerHTML = '<i class="fas fa-crosshairs"></i>';
                btn.title     = 'Pusat Kota Purbalingga';
                Object.assign(btn.style, {
                    width: '36px', height: '36px',
                    background: 'rgba(10,29,61,.85)', color: 'white',
                    border: '1px solid rgba(255,255,255,.15)', borderRadius: '8px',
                    cursor: 'pointer', fontSize: '15px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(6px)', boxShadow: '0 2px 8px rgba(0,0,0,.3)',
                    position: 'relative', marginTop: '6px', transition: 'background .2s',
                });
                const tooltipEl = document.createElement('span');
                tooltipEl.textContent = 'Pusat Kota Purbalingga';
                Object.assign(tooltipEl.style, {
                    position: 'absolute', left: '44px', top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(10,29,61,.92)', color: 'white',
                    fontSize: '12px', fontWeight: '600', padding: '5px 10px',
                    borderRadius: '7px', whiteSpace: 'nowrap', pointerEvents: 'none',
                    opacity: '0', transition: 'opacity .2s',
                    border: '1px solid rgba(255,255,255,.12)', boxShadow: '0 4px 14px rgba(0,0,0,.3)',
                });
                btn.appendChild(tooltipEl);
                btn.addEventListener('mouseenter', () => { btn.style.background = 'rgba(13,148,136,.85)'; tooltipEl.style.opacity = '1'; });
                btn.addEventListener('mouseleave', () => { btn.style.background = 'rgba(10,29,61,.85)'; tooltipEl.style.opacity = '0'; });
                btn.addEventListener('click', (e) => { L.DomEvent.stopPropagation(e); map.flyTo(CENTER, ZOOM_DEFAULT, { duration: 0.8 }); });
                const container = L.DomUtil.create('div');
                container.style.cssText = 'position:relative;';
                container.appendChild(btn);
                return container;
            },
        });
        new PusatKotaControl().addTo(map);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

        fetch('/geojson/batas_purbalingga.geojson')
            .then(res => { if (!res.ok) throw new Error(); return res.json(); })
            .then(geojson => {
                L.geoJSON(geojson, {
                    style: { color: '#4072af', weight: 3, opacity: 0.8, fillOpacity: 0.05, fillColor: '#78b0ff', dashArray: '6, 4' },
                }).addTo(map);
            })
            .catch(() => {});

        // Inject CSS
        if (!document.getElementById('peta-style')) {
            const style = document.createElement('style');
            style.id = 'peta-style';
            style.textContent = `
                @keyframes ping { 0%{transform:scale(1);opacity:.8;} 75%,100%{transform:scale(2);opacity:0;} }
                .bld-popup .leaflet-popup-content-wrapper {
                    padding:0; border-radius:14px; overflow:hidden;
                    border:1px solid rgba(255,255,255,.12);
                    box-shadow:0 12px 40px rgba(0,0,0,.55);
                    background:#0f1f3d; min-width:240px; max-width:280px;
                }
                .bld-popup .leaflet-popup-tip-container { display:none; }
                .bld-popup .leaflet-popup-content { margin:0; }
                .bld-popup .leaflet-popup-close-button { color:rgba(255,255,255,.6)!important; font-size:18px!important; top:8px!important; right:8px!important; z-index:10; }
                .bld-popup .leaflet-popup-close-button:hover { color:white!important; }
                .wisata-popup .leaflet-popup-content-wrapper {
                    padding:0; border-radius:14px; overflow:hidden;
                    border:1px solid rgba(255,255,255,.12);
                    box-shadow:0 12px 40px rgba(0,0,0,.55);
                    background:#0f1f3d; min-width:240px; max-width:300px;
                }
                .wisata-popup .leaflet-popup-tip-container { display:none; }
                .wisata-popup .leaflet-popup-content { margin:0; }
                .wisata-popup .leaflet-popup-close-button { color:rgba(255,255,255,.6)!important; font-size:18px!important; top:8px!important; right:8px!important; z-index:10; }
                .wisata-popup .leaflet-popup-close-button:hover { color:white!important; }
                .cctv-popup .leaflet-popup-content-wrapper {
                    padding:0; border-radius:14px; overflow:hidden;
                    border:1px solid rgba(255,255,255,.12);
                    box-shadow:0 12px 40px rgba(0,0,0,.55);
                    background:#0f1f3d; min-width:280px; max-width:320px;
                }
                .cctv-popup .leaflet-popup-tip-container { display:none; }
                .cctv-popup .leaflet-popup-content { margin:0; }
                .cctv-popup .leaflet-popup-close-button { color:rgba(255,255,255,.6)!important; font-size:18px!important; top:8px!important; right:8px!important; z-index:10; }
                .cctv-popup .leaflet-popup-close-button:hover { color:white!important; }
                .leaflet-bottom.leaflet-left { bottom:24px; left:16px; }
                .leaflet-control-zoom { border:none!important; }
                .leaflet-control-zoom a {
                    background:rgba(10,29,61,.85)!important; color:white!important;
                    border:1px solid rgba(255,255,255,.15)!important; backdrop-filter:blur(6px);
                    margin-bottom:4px!important; border-radius:8px!important;
                    width:36px!important; height:36px!important;
                    line-height:36px!important; font-size:18px!important;
                }
            `;
            document.head.appendChild(style);
        }

        // Helper: buat pin marker
        const makePin = (color, iconClass) => {
            const size = 30, half = size / 2;
            return L.divIcon({
                html: `<div style="position:relative;width:${size}px;height:${size + 10}px;">
                    <div style="width:${size}px;height:${size}px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 3px 12px ${color}88;position:absolute;top:0;left:0;"></div>
                    <div style="position:absolute;top:${half - 9}px;left:${half - 8}px;color:white;font-size:12px;z-index:2;text-shadow:0 1px 3px rgba(0,0,0,.4);">
                        <i class="fas ${iconClass}"></i>
                    </div>
                </div>`,
                iconSize:    [size, size + 10],
                iconAnchor:  [half, size + 8],
                popupAnchor: [0, -(size + 8)],
                className: '',
            });
        };

        window._petaMakePin = makePin;
        instanceRef.current = map;
        setTimeout(() => map.invalidateSize(), 100);
    }, []);

    // ─────────────────────────────────────────────────────────
    // Render building markers
    // ─────────────────────────────────────────────────────────
    useEffect(() => {
        const L = window.L;
        if (!L || !instanceRef.current || dataLoading) return;

        bldMarkersRef.current.forEach(({ marker }) => marker.remove());
        bldMarkersRef.current = [];

        const makePin = window._petaMakePin;
        if (!makePin) return;

        buildings.forEach((b) => {
            const cat   = b.category || getCategoryById(b.category_id);
            if (!cat) return;

            const COLOR   = cat.color_theme || '#2ecc71';
            const ICON    = cat.icon_marker  || 'fa-building';
            const IS_GRP4 = cat.group_id === 4;
            const thumb   = thumbUrl(b.thumbnail);

            const meta        = b.metadata && typeof b.metadata === 'object' ? b.metadata : {};
            const metaEntries = Object.entries(meta).slice(0, 3);
            const metaHtml    = metaEntries.length > 0
                ? `<div style="display:flex;gap:6px;flex-wrap:wrap;padding-top:8px;border-top:1px solid rgba(255,255,255,.08);margin-bottom:10px;">
                    ${metaEntries.map(([k, v]) => `
                        <div style="padding:3px 8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:5px;font-size:10px;color:rgba(255,255,255,.6);">
                            <span style="opacity:.6;">${k.replace(/_/g, ' ')}:</span>
                            <span style="font-weight:600;color:rgba(255,255,255,.85);margin-left:3px;">${v}</span>
                        </div>`).join('')}
                   </div>` : '';

            const popupHtml = `
                <div>
                    <div style="position:relative;height:130px;overflow:hidden;background:#1a2f5e;">
                        ${thumb
                            ? `<img src="${thumb}" alt="${b.nama}" style="width:100%;height:100%;object-fit:cover;opacity:.85;" onerror="this.style.display='none'"/>`
                            : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;"><i class="fas ${ICON}" style="font-size:32px;color:${COLOR};opacity:.5;"></i></div>`
                        }
                        <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(10,29,61,.9) 0%,transparent 60%);"></div>
                        <div style="position:absolute;top:10px;left:10px;display:inline-flex;align-items:center;gap:5px;background:${COLOR};color:${IS_GRP4 ? '#1a1a1a' : 'white'};font-size:10px;font-weight:700;padding:3px 10px;border-radius:50px;letter-spacing:.5px;text-transform:uppercase;">
                            <i class="fas ${ICON}" style="font-size:9px;"></i>${cat.nama}
                        </div>
                        <div style="position:absolute;bottom:8px;left:12px;right:12px;font-size:13px;font-weight:700;color:white;line-height:1.3;">${b.nama}</div>
                    </div>
                    <div style="padding:12px 14px;">
                        ${b.alamat ? `<div style="display:flex;gap:6px;margin-bottom:8px;"><i class="fas fa-map-marker-alt" style="color:${COLOR};font-size:11px;margin-top:2px;flex-shrink:0;"></i><span style="font-size:11.5px;color:rgba(255,255,255,.65);line-height:1.4;">${b.alamat}</span></div>` : ''}
                        ${b.deskripsi ? `<p style="font-size:11.5px;color:rgba(255,255,255,.55);line-height:1.55;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${b.deskripsi}</p>` : ''}
                        ${b.kontak && b.kontak !== '-' ? `<div style="display:flex;gap:6px;align-items:center;margin-bottom:10px;"><i class="fas fa-phone" style="color:${COLOR};font-size:10px;"></i><span style="font-size:11px;color:rgba(255,255,255,.6);">${b.kontak}</span></div>` : ''}
                        ${metaHtml}
                       
                    </div>
                </div>`;

            const marker = L.marker([b.lat, b.lng], { icon: makePin(COLOR, ICON) })
                .bindPopup(popupHtml, { className: 'bld-popup', maxWidth: 280, minWidth: 240 });

            if (activeCategories.includes(b.category_id)) {
                marker.addTo(instanceRef.current);
            }
            bldMarkersRef.current.push({ marker, building: b });
        });
    }, [buildings, dataLoading]);

    // ─────────────────────────────────────────────────────────
    // Render WISATA markers
    // ─────────────────────────────────────────────────────────
    useEffect(() => {
        const L = window.L;
        if (!L || !instanceRef.current || dataLoading) return;

        wisataMarkersRef.current.forEach(({ marker }) => marker.remove());
        wisataMarkersRef.current = [];

        const makePin = window._petaMakePin;
        if (!makePin) return;

        wisataData.forEach((w) => {
            const wisataCat = WISATA_CATEGORIES.find(c => c.key === w.kategori);
            if (!wisataCat) return;

            const COLOR = wisataCat.color_theme;
            const ICON  = wisataCat.icon_marker;
            const thumb = thumbUrl(w.thumbnail);

            // Rating bintang HTML
            const ratingVal  = parseFloat(w.rating) || 0;
            const starsFull  = Math.floor(ratingVal);
            const starsHalf  = ratingVal - starsFull >= 0.5 ? 1 : 0;
            const starsEmpty = 5 - starsFull - starsHalf;
            const starsHtml  = `
                ${'<i class="fas fa-star" style="color:#f59e0b;font-size:10px;"></i>'.repeat(starsFull)}
                ${'<i class="fas fa-star-half-alt" style="color:#f59e0b;font-size:10px;"></i>'.repeat(starsHalf)}
                ${'<i class="far fa-star" style="color:rgba(255,255,255,.3);font-size:10px;"></i>'.repeat(starsEmpty)}
            `;

            // Harga
            const hargaHtml = (w.harga_dewasa || w.harga_anak)
                ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
                    ${w.harga_dewasa ? `<div style="padding:3px 8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:5px;font-size:10px;color:rgba(255,255,255,.6);"><span style="opacity:.6;">Dewasa:</span><span style="font-weight:600;color:rgba(255,255,255,.85);margin-left:3px;">Rp ${parseInt(w.harga_dewasa).toLocaleString('id-ID')}</span></div>` : ''}
                    ${w.harga_anak  ? `<div style="padding:3px 8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:5px;font-size:10px;color:rgba(255,255,255,.6);"><span style="opacity:.6;">Anak:</span><span style="font-weight:600;color:rgba(255,255,255,.85);margin-left:3px;">Rp ${parseInt(w.harga_anak).toLocaleString('id-ID')}</span></div>` : ''}
                   </div>` : '';

            // Jam buka
            const jamHtml = (w.jam_buka || w.jam_tutup)
                ? `<div style="display:flex;gap:6px;align-items:center;margin-bottom:8px;">
                    <i class="fas fa-clock" style="color:${COLOR};font-size:10px;"></i>
                    <span style="font-size:11px;color:rgba(255,255,255,.6);">${w.jam_buka || '--:--'} – ${w.jam_tutup || '--:--'}</span>
                   </div>` : '';

            const popupHtml = `
                <div>
                    <div style="position:relative;height:130px;overflow:hidden;background:#1a2f5e;">
                        ${thumb
                            ? `<img src="${thumb}" alt="${w.nama}" style="width:100%;height:100%;object-fit:cover;opacity:.85;" onerror="this.style.display='none'"/>`
                            : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;"><i class="fas ${ICON}" style="font-size:32px;color:${COLOR};opacity:.5;"></i></div>`
                        }
                        <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(10,29,61,.9) 0%,transparent 60%);"></div>
                        <div style="position:absolute;top:10px;left:10px;display:inline-flex;align-items:center;gap:5px;background:${COLOR};color:white;font-size:10px;font-weight:700;padding:3px 10px;border-radius:50px;letter-spacing:.5px;text-transform:uppercase;">
                            <i class="fas ${ICON}" style="font-size:9px;"></i>${wisataCat.nama}
                        </div>
                        <div style="position:absolute;bottom:8px;left:12px;right:12px;font-size:13px;font-weight:700;color:white;line-height:1.3;">${w.nama}</div>
                    </div>
                    <div style="padding:12px 14px;">
                        ${ratingVal > 0 ? `<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">${starsHtml}<span style="font-size:11px;color:rgba(255,255,255,.5);">${ratingVal.toFixed(1)} (${w.total_review || 0} ulasan)</span></div>` : ''}
                        ${w.alamat_lengkap ? `<div style="display:flex;gap:6px;margin-bottom:8px;"><i class="fas fa-map-marker-alt" style="color:${COLOR};font-size:11px;margin-top:2px;flex-shrink:0;"></i><span style="font-size:11.5px;color:rgba(255,255,255,.65);line-height:1.4;">${w.alamat_lengkap}</span></div>` : ''}
                        ${w.deskripsi ? `<p style="font-size:11.5px;color:rgba(255,255,255,.55);line-height:1.55;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${w.deskripsi}</p>` : ''}
                        ${jamHtml}
                        ${hargaHtml}
                        ${w.kontak && w.kontak !== '-' ? `<div style="display:flex;gap:6px;align-items:center;margin-bottom:10px;"><i class="fas fa-phone" style="color:${COLOR};font-size:10px;"></i><span style="font-size:11px;color:rgba(255,255,255,.6);">${w.kontak}</span></div>` : ''}
                        <div style="display:flex;gap:6px;">
                            <a href="/wisata/${w.slug}" style="flex:1;padding:7px 0;text-align:center;background:${COLOR};color:white;border-radius:8px;font-size:11px;font-weight:700;text-decoration:none;display:block;"><i class="fas fa-info-circle" style="margin-right:4px;"></i>Detail</a>
                        </div>
                    </div>
                </div>`;

            const marker = L.marker([w.lat, w.lng], { icon: makePin(COLOR, ICON) })
                .bindPopup(popupHtml, { className: 'wisata-popup', maxWidth: 300, minWidth: 240 });

            if (activeCategories.includes(w.wisataCatId)) {
                marker.addTo(instanceRef.current);
            }
            wisataMarkersRef.current.push({ marker, wisata: w, wisataCatId: w.wisataCatId });
        });
    }, [wisataData, dataLoading]);

    // ─────────────────────────────────────────────────────────
    // Render CCTV markers
    // ─────────────────────────────────────────────────────────
    useEffect(() => {
        const L = window.L;
        if (!L || !instanceRef.current || dataLoading) return;

        cctvMarkersRef.current.forEach(({ marker }) => marker.remove());
        cctvMarkersRef.current = [];

        const makePin = window._petaMakePin;
        if (!makePin) return;

        const CCTV_COLOR = '#ef4444';
        const CCTV_ICON  = 'fa-video';

        cctvData.forEach((c) => {
            const isOnline    = c.status === 'online';
            const statusColor = isOnline ? '#16a34a' : '#94a3b8';
            const statusText  = c.status === 'online' ? 'Online' : 'Offline';
            const videoSrc    = c.stream_url
                ? `${c.stream_url}${c.stream_url.includes('?') ? '&' : '?'}autoplay=1&mute=1`
                : null;

            const offlinePlaceholder = `
            <div style="width:100%;height:100%;display:flex;flex-direction:column;
                align-items:center;justify-content:center;gap:10px;background:#0a0f1e;">
                <div style="width:52px;height:52px;border-radius:50%;
                    background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);
                    display:flex;align-items:center;justify-content:center;">
                    <i class="fas fa-video-slash" style="font-size:20px;color:#ef4444;opacity:.7;"></i>
                </div>
                <div style="text-align:center;">
                    <div style="font-size:12px;font-weight:700;color:rgba(255,255,255,.5);
                        letter-spacing:.5px;">CCTV Tidak Aktif</div>
                    <div style="font-size:10px;color:rgba(255,255,255,.25);margin-top:3px;">
                        Stream tidak tersedia</div>
                </div>
            </div>`;

            const popupHtml = `
                <div>
                    <div style="position:relative;height:180px;overflow:hidden;background:#000;">
                        ${isOnline && videoSrc       
                            ? `<iframe src="${videoSrc}" allow="autoplay; encrypted-media" frameborder="0" allowfullscreen style="width:100%;height:100%;border:none;"></iframe>`
                            : offlinePlaceholder
                        }
                        <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(10,29,61,.6) 0%,transparent 70%);pointer-events:none;"></div>
                        <div style="position:absolute;top:10px;left:10px;display:inline-flex;align-items:center;gap:5px;background:${CCTV_COLOR};color:white;font-size:10px;font-weight:700;padding:3px 10px;border-radius:50px;">
                            <i class="fas ${CCTV_ICON}" style="font-size:9px;"></i>CCTV
                        </div>
                    </div>
                    <div style="padding:12px 14px;">
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                            <span style="font-size:13px;font-weight:700;color:white;">${c.nama}</span>
                            <span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:50px;font-size:10px;font-weight:600;background:${statusColor}22;color:${statusColor};border:1px solid ${statusColor}44;">
                                <span style="width:6px;height:6px;border-radius:50%;background:${statusColor};display:inline-block;"></span>${statusText}
                            </span>
                        </div>
                        ${c.alamat ? `<div style="font-size:11px;color:rgba(255,255,255,.5);margin-bottom:10px;"><i class="fas fa-map-marker-alt" style="color:${CCTV_COLOR};font-size:10px;margin-right:4px;"></i>${c.alamat}</div>` : ''}
                    </div>
                </div>`;

            const marker = L.marker([c.lat, c.lng], { icon: makePin(CCTV_COLOR, CCTV_ICON) })
                .bindPopup(popupHtml, { className: 'cctv-popup', maxWidth: 340, minWidth: 280 });

            marker.addTo(instanceRef.current);
            cctvMarkersRef.current.push({ marker, cctv: c });
        });
    }, [cctvData, dataLoading]);

    // ─────────────────────────────────────────────────────────
    // Kontrol visibilitas marker berdasarkan activeCategories
    // ─────────────────────────────────────────────────────────
    useEffect(() => {
        // Buildings
        bldMarkersRef.current.forEach(({ marker, building }) => {
            if (activeCategories.includes(building.category_id)) {
                if (instanceRef.current && !instanceRef.current.hasLayer(marker)) marker.addTo(instanceRef.current);
            } else {
                marker.remove();
            }
        });

        // Wisata
        wisataMarkersRef.current.forEach(({ marker, wisataCatId }) => {
            if (activeCategories.includes(wisataCatId)) {
                if (instanceRef.current && !instanceRef.current.hasLayer(marker)) marker.addTo(instanceRef.current);
            } else {
                marker.remove();
            }
        });
    }, [activeCategories]);

    // ─────────────────────────────────────────────────────────
    // Auto-buka popup setelah kategori diaktifkan lewat search
    // ─────────────────────────────────────────────────────────
    useEffect(() => {
        const pending = window._petaPendingPopup;
        if (!pending) return;
        if (!activeCategories.includes(pending.catId)) return;

        const t = setTimeout(() => {
            if (pending.type === 'building') {
                const found = bldMarkersRef.current.find(m => m.building.id === pending.id);
                if (found && instanceRef.current) found.marker.openPopup();
            } else if (pending.type === 'wisata') {
                const found = wisataMarkersRef.current.find(m => m.wisata.id === pending.id);
                if (found && instanceRef.current) found.marker.openPopup();
            }
            delete window._petaPendingPopup;
        }, 1100);

        return () => clearTimeout(t);
    }, [activeCategories]);

    // ── Resize peta saat sidebar toggle ──────────────────────
    useEffect(() => {
    if (dataLoading) return;
    if (searchParams.get('open') !== '1') return;

    const lat  = parseFloat(searchParams.get('lat'));
    const lng  = parseFloat(searchParams.get('lng'));
    const nama = searchParams.get('nama') || '';

    if (isNaN(lat) || isNaN(lng)) return;

    const map = instanceRef.current;
    if (!map) return;

    // Cari wisata yang cocok berdasarkan nama atau koordinat
    const targetWisata = wisataData.find(w =>
        w.nama === nama ||
        (Math.abs(w.lat - lat) < 0.0001 && Math.abs(w.lng - lng) < 0.0001)
    );

    if (targetWisata) {
        // Aktifkan kategorinya dulu
        const catId = targetWisata.wisataCatId;
        setActiveCategories(prev => prev.includes(catId) ? prev : [...prev, catId]);

        // Fly ke lokasi
        map.flyTo([targetWisata.lat, targetWisata.lng], ZOOM_FLY, { duration: 1.2 });

        // Buka popup setelah fly + marker aktif
        window._petaPendingPopup = { id: targetWisata.id, catId, type: 'wisata' };

    } else {
        // Wisata tidak ditemukan di data (mungkin belum ada marker),
        // tetap fly ke koordinat yang dikirim
        map.flyTo([lat, lng], ZOOM_FLY, { duration: 1.2 });
    }
}, [dataLoading, wisataData]);

    // ── Cleanup ───────────────────────────────────────────────
    useEffect(() => {
        return () => {
            if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null; }
            delete window._petaMakePin;
            delete window._petaPendingPopup;
        };
    }, []);

    // ── Tutup dropdown saat klik luar ─────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
                setSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const SIDEBAR_W = 300;
    const allActive = allCategoryIds.length > 0 && allCategoryIds.every(id => activeCategories.includes(id));

    // ──────────────────────────────────────────────────────────
    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', display: 'flex' }}>

            {/* Map */}
            <div ref={mapRef} style={{ flex: 1, height: '100%' }} />

            {/* Header pill */}
            <div style={{
                position: 'absolute', top: 16, left: 16, zIndex: 1000,
                background: 'rgba(10,29,61,.85)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,.12)', borderRadius: 50,
                padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 14,
                color: 'white', boxShadow: '0 4px 20px rgba(0,0,0,.4)',
            }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.7)', textDecoration: 'none', fontSize: 13 }}>
                    <i className="fas fa-arrow-left" /> Kembali
                </Link>
                <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.2)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className="fas fa-map-marked-alt" style={{ color: '#5eead4' }} />
                    <span style={{ fontWeight: 700, fontSize: 14 }}>Smart City</span>
                </div>
            </div>

            {/* Toggle sidebar */}
            <button
                onClick={() => setSidebarOpen(o => !o)}
                style={{
                    position: 'absolute', top: '50%', zIndex: 1001,
                    right: sidebarOpen ? SIDEBAR_W : 0,
                    transform: 'translateY(-50%)',
                    width: 28, height: 56,
                    background: 'rgba(10,29,61,.9)',
                    border: '1px solid rgba(255,255,255,.15)',
                    borderRadius: '8px 0 0 8px',
                    color: 'rgba(255,255,255,.8)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, transition: 'right .3s ease', backdropFilter: 'blur(8px)',
                }}
            >
                <i className={`fas fa-chevron-${sidebarOpen ? 'right' : 'left'}`} />
            </button>

            {/* ════════════ SIDEBAR ════════════ */}
            <div style={{
                position: 'absolute', top: 0, zIndex: 1000,
                right: sidebarOpen ? 0 : -SIDEBAR_W,
                width: SIDEBAR_W, height: '100%',
                background: 'rgba(10,29,61,.93)', backdropFilter: 'blur(14px)',
                borderLeft: '1px solid rgba(255,255,255,.1)',
                display: 'flex', flexDirection: 'column',
                transition: 'right .3s ease', color: 'white',
            }}>

                {/* Search header */}
                <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,.08)', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#5eead4', marginBottom: 12 }}>
                        Jelajahi Peta
                    </div>

                    <div ref={searchWrapRef} style={{ position: 'relative' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: searchFocused ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.07)',
                            border: `1px solid ${searchFocused ? '#0d9488' : 'rgba(255,255,255,.1)'}`,
                            borderRadius: showDropdown ? '10px 10px 0 0' : 10,
                            padding: '9px 12px', transition: 'all .2s',
                        }}>
                            <i className="fas fa-search" style={{ color: searchFocused ? '#5eead4' : 'rgba(255,255,255,.35)', fontSize: 12 }} />
                            <input
                                type="text"
                                placeholder="Cari bangunan, wisata, CCTV..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                style={{ background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: 13, width: '100%' }}
                            />
                            {query && (
                                <button onClick={() => { setQuery(''); setSearchFocused(false); }}
                                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', padding: 0, fontSize: 12 }}>
                                    <i className="fas fa-times" />
                                </button>
                            )}
                        </div>

                        {/* Dropdown hasil pencarian */}
                        {showDropdown && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 500,
                                background: 'rgba(7,18,44,.98)',
                                border: '1px solid rgba(255,255,255,.1)',
                                borderTop: '1px solid rgba(13,148,136,.3)',
                                borderRadius: '0 0 12px 12px',
                                boxShadow: '0 16px 40px rgba(0,0,0,.6)',
                                maxHeight: 380, overflowY: 'auto',
                            }}>
                                {searchResults.length === 0 ? (
                                    <div style={{ padding: '28px 16px', textAlign: 'center' }}>
                                        <div style={{ fontSize: 28, color: 'rgba(255,255,255,.1)', marginBottom: 10 }}>
                                            <i className="fas fa-search-minus" />
                                        </div>
                                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', lineHeight: 1.5 }}>
                                            Tidak ditemukan untuk<br />
                                            <strong style={{ color: 'rgba(255,255,255,.7)' }}>"{query}"</strong>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ padding: '7px 14px', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span>Hasil pencarian</span>
                                            <span style={{ background: 'rgba(255,255,255,.08)', padding: '1px 8px', borderRadius: 50 }}>
                                                {searchResults.length} lokasi
                                            </span>
                                        </div>

                                        {searchResults.map(item => {
                                            let isActive = false;
                                            let iconEl   = null;
                                            let badgeEl  = null;

                                            if (item._type === 'building') {
                                                const cat = item.category || getCategoryById(item.category_id);
                                                isActive  = activeCategories.includes(item.category_id);
                                                iconEl    = (
                                                    <div style={{ width: 38, height: 38, borderRadius: 8, flexShrink: 0, background: cat ? cat.color_theme + '22' : 'rgba(255,255,255,.06)', border: cat ? `1px solid ${cat.color_theme}33` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <i className={`fas ${cat?.icon_marker || 'fa-building'}`} style={{ color: cat?.color_theme || 'white', fontSize: 15 }} />
                                                    </div>
                                                );
                                                badgeEl = cat ? <CategoryBadge category={cat} /> : null;

                                            } else if (item._type === 'wisata') {
                                                const wcat = WISATA_CATEGORIES.find(c => c.key === item.kategori);
                                                isActive   = activeCategories.includes(item.wisataCatId);
                                                iconEl     = (
                                                    <div style={{ width: 38, height: 38, borderRadius: 8, flexShrink: 0, background: wcat ? wcat.color_theme + '22' : 'rgba(255,255,255,.06)', border: wcat ? `1px solid ${wcat.color_theme}33` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <i className={`fas ${wcat?.icon_marker || 'fa-map-pin'}`} style={{ color: wcat?.color_theme || 'white', fontSize: 15 }} />
                                                    </div>
                                                );
                                                badgeEl = wcat ? <CategoryBadge category={wcat} /> : null;

                                            } else if (item._type === 'cctv') {
                                                isActive = true;
                                                iconEl   = (
                                                    <div style={{ width: 38, height: 38, borderRadius: 8, flexShrink: 0, background: '#ef444422', border: '1px solid #ef444433', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <i className="fas fa-video" style={{ color: '#ef4444', fontSize: 15 }} />
                                                    </div>
                                                );
                                                badgeEl = <span style={{ fontSize: 10, color: '#ef4444', background: '#ef444415', border: '1px solid #ef444433', borderRadius: 50, padding: '2px 8px' }}>CCTV</span>;
                                            }

                                            return (
                                                <button
                                                    key={`${item._type}-${item.id}`}
                                                    onClick={() => flyToItem(item)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: 10,
                                                        width: '100%', padding: '8px 14px',
                                                        background: 'transparent', border: 'none',
                                                        cursor: 'pointer', textAlign: 'left',
                                                        borderBottom: '1px solid rgba(255,255,255,.04)',
                                                        transition: 'background .12s',
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    {iconEl}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: 13, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                                                            <Highlight text={item.nama} query={query} />
                                                        </div>
                                                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
                                                            {item._type === 'cctv' ? (
                                                                <>
                                                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.status === 'online' ? '#16a34a' : '#94a3b8', flexShrink: 0, display: 'inline-block' }} />
                                                                    {item.status === 'online' ? 'Online' : 'Offline'}
                                                                </>
                                                            ) : item._type === 'wisata' ? (
                                                                <>
                                                                    <i className="fas fa-map-marker-alt" style={{ fontSize: 9 }} />
                                                                    <Highlight text={item.alamat_lengkap || item.kategori || ''} query={query} />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="fas fa-map-marker-alt" style={{ fontSize: 9 }} />
                                                                    <Highlight text={item.alamat || ''} query={query} />
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                                                        {badgeEl}
                                                        {!isActive && (
                                                            <span style={{ fontSize: 9, color: '#f59e0b', background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.3)', borderRadius: 50, padding: '1px 6px', display: 'flex', alignItems: 'center', gap: 3 }}>
                                                                <i className="fas fa-eye" style={{ fontSize: 8 }} /> Aktifkan
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}

                                        <div style={{ padding: '7px 14px', borderTop: '1px solid rgba(255,255,255,.05)', fontSize: 10, color: 'rgba(255,255,255,.2)', textAlign: 'center' }}>
                                            <i className="fas fa-mouse-pointer" style={{ marginRight: 4 }} />
                                            Klik untuk menuju lokasi & membuka popup
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tombol Tampilkan Semua Lokasi */}
                    {!dataLoading && (buildings.length > 0 || wisataData.length > 0) && (
                        <button
                            onClick={allActive ? handleHideAll : handleShowAll}
                            style={{
                                marginTop: 10, width: '100%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                padding: '8px 12px', borderRadius: 10,
                                border: `1.5px solid ${allActive ? 'rgba(239,68,68,.35)' : 'rgba(13,148,136,.4)'}`,
                                background: allActive ? 'rgba(239,68,68,.1)' : 'rgba(13,148,136,.12)',
                                color: allActive ? '#fca5a5' : '#5eead4',
                                cursor: 'pointer', fontSize: 12, fontWeight: 600,
                                transition: 'all .2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '.8'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                            <i className={`fas ${allActive ? 'fa-eye-slash' : 'fa-layer-group'}`} style={{ fontSize: 11 }} />
                            {allActive ? 'Sembunyikan Semua Lokasi' : 'Tampilkan Semua Lokasi'}
                        </button>
                    )}
                </div>

                {/* Kategori grid */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
                    {dataError && (
                        <div style={{ margin: '0 12px 12px', padding: '10px 12px', background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, fontSize: 11, color: '#fca5a5', lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <i className="fas fa-exclamation-triangle" /> {dataError}
                        </div>
                    )}
                    {dataLoading && !dataError && <SidebarSkeleton />}
                    {!dataLoading && activeCategories.length === 0 && (
                        <div style={{ margin: '0 12px 12px', padding: '8px 12px', background: 'rgba(255,255,255,.04)', borderRadius: 8, fontSize: 11, color: 'rgba(255,255,255,.35)', lineHeight: 1.5 }}>
                            <i className="fas fa-info-circle" style={{ marginRight: 5, color: '#5eead4' }} />
                            Klik ikon di bawah untuk menampilkan marker di peta
                        </div>
                    )}

                    {!dataLoading && sidebarGroups
                    .filter(group => group.id !== 4)
                    .map((group) => (
                        <div key={group.id} style={{ marginBottom: 4 }}>
                            <div style={{ padding: '8px 16px 6px', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: group._type === 'wisata-group' ? '#5eead4' : 'rgba(255,255,255,.3)' }}>
                                {group.nama}
                                {group._type === 'wisata-group' && (
                                    <span style={{ marginLeft: 6, fontSize: 8, background: '#5eead422', border: '1px solid #5eead444', borderRadius: 50, padding: '1px 6px', verticalAlign: 'middle' }}>
                                        {wisataData.length} lokasi
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, padding: '0 12px 12px' }}>
                                {group.categories.map((cat) => {
                                    const isActive = activeCategories.includes(cat.id);
                                    const count    = countByCategory[cat.id] || 0;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => toggleCategory(cat.id)}
                                            title={cat.nama}
                                            style={{
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                                                padding: '10px 4px 8px', borderRadius: 10,
                                                border: `1.5px solid ${isActive ? cat.color_theme : 'rgba(255,255,255,.09)'}`,
                                                background: isActive ? cat.color_theme + '28' : 'rgba(255,255,255,.04)',
                                                color: isActive ? cat.color_theme : 'rgba(255,255,255,.6)',
                                                cursor: 'pointer', transition: 'all .18s', outline: 'none',
                                                position: 'relative',
                                                opacity: count === 0 ? 0.4 : 1,
                                            }}
                                            disabled={count === 0}
                                        >
                                            {count > 0 && (
                                                <div style={{
                                                    position: 'absolute', top: -5, right: -5,
                                                    width: 16, height: 16, borderRadius: '50%',
                                                    background: isActive ? cat.color_theme : 'rgba(255,255,255,.18)',
                                                    color: isActive ? 'white' : 'rgba(255,255,255,.8)',
                                                    fontSize: 9, fontWeight: 700,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    {count}
                                                </div>
                                            )}
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 8,
                                                background: isActive ? cat.color_theme + '44' : 'rgba(255,255,255,.07)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 13, transition: 'all .18s',
                                            }}>
                                                <i className={`fas ${cat.icon_marker}`} />
                                            </div>
                                            <span style={{ fontSize: 9, textAlign: 'center', lineHeight: 1.3, fontWeight: isActive ? 600 : 400 }}>
                                                {cat.nama}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div style={{ height: 1, background: 'rgba(255,255,255,.06)', margin: '0 12px' }} />
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,.07)',
                    fontSize: 11, color: 'rgba(255,255,255,.3)', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    {dataLoading ? (
                        <span style={{ opacity: .5 }}>Memuat data...</span>
                    ) : (
                        <>
                            <span><span style={{ color: '#5eead4' }}>{buildings.length}</span> bangunan</span>
                            <span><span style={{ color: '#f59e0b' }}>{wisataData.length}</span> wisata</span>
                            <span><span style={{ color: '#ef4444' }}>{cctvData.length}</span> CCTV</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}