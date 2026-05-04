// src/App.jsx
import { BrowserRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar    from './components/Navbar';
import Footer    from './components/Footer';
import ScrollTop from './components/ScrollTop';
import EventCard from './components/EventCard';

import Home             from './pages/Home';
import Wisata           from './pages/Wisata';
import Berita           from './pages/Berita';
import BeritaDetail     from './pages/BeritaDetail';
import Event            from './pages/Event';
import Pengumuman       from './pages/Pengumuman';
import PengumumanDetail from './pages/PengumumanDetail';
import Pejabat      from './pages/Pejabat';
import Search           from './pages/Search';
import Tiket            from './pages/Tiket';
import Peta             from './pages/Peta';
import EditProfile      from './pages/EditProfile';
import Pelayanan from './pages/Pelayanan';
import RiwayatTiket from './pages/RiwayatTiket';
import WisataDetail from './pages/WisataDetail';
import Login from './pages/Login';
import Daftar from './pages/Daftar';

// -----------------------------------------------------------
import InformasiWisata from './pages/admin/InformasiWisata';
import KelolaTiket from './pages/admin/KelolaTiket';
import SuperAdminLogin from './pages/superadmin/SuperAdminLogin';
import SuperAdminLayout from './pages/superadmin/SuperAdminLayout';
import KelolaAkun from './pages/superadmin/KelolaAkun';
import AdminLogin from './pages/admin/AdminLogin';
import KelolaWisata from './pages/superadmin/KelolaWisata';
import KelolaBerita from './pages/superadmin/KelolaBerita';
import KelolaPengumuman from './pages/superadmin/KelolaPengumuman';
import KelolaEvent from './pages/superadmin/KelolaEvent';
import KelolaBangunan from './pages/superadmin/KelolaBangunan';
import KelolaCCTV from './pages/superadmin/KelolaCCTV';
import ScanTiket from './pages/admin/ScanTiket';
import SsoCallback from './pages/SsoCallback';

function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
} 

// Halaman yang tidak pakai Navbar/Footer
const FULLSCREEN_PAGES = [
    '/peta', 
    '/login', 
    '/daftar', 
    '/callback',
    '/sso-callback',
    '/admin', 
    '/admin/', 
    '/admin/informasi-wisata', 
    '/admin/login', 
    '/admin/kelola-tiket', 
    '/admin/scan-tiket',
    '/super-admin/login', 
    '/super-admin/dashboard', 
    '/super-admin', 
    '/super-admin/',
    '/super-admin/akun', 
    '/super-admin/wisata', 
    '/super-admin/berita',
    '/super-admin/pengumuman',
    '/super-admin/event',
    '/super-admin/pengaturan',
    '/super-admin/statistik',
    '/super-admin/bangunan',
    '/super-admin/cctv',
    ];

function Layout() {
    const { pathname } = useLocation();
    const isFullscreen = FULLSCREEN_PAGES.includes(pathname);

    function ProtectedAdminRoute() {
        const token = localStorage.getItem("admin_token");
        if (!token) {
            return <Navigate to="/admin/login" replace />;
        }
        return <Outlet />;
    }

    function ProtectedSuperAdminRoute() {
        const token = localStorage.getItem("superadmin_token");
        if (!token) {
            return <Navigate to="/super-admin/login" replace />;
        }
        return <Outlet />;
    }
    
    return (
        <>
            <ScrollToTop />
                
            {!isFullscreen && <Navbar />}
            <main>
                
                <Routes>
                    <Route path="/login"                  element={<Login />} />
                    <Route path="/daftar"                  element={<Daftar />} />

                    <Route path="/callback" element={<SsoCallback />} />
                    <Route path="/sso-callback" element={<SsoCallback />} />

                    <Route path="/"                  element={<Home />} />
                    <Route path="/wisata"              element={<Wisata />} />
                    <Route path="/wisata/:slug"              element={<WisataDetail />} />

                    <Route path="/berita"              element={<Berita />} />
                    <Route path="/berita/:slug"       element={<BeritaDetail />} />

                    <Route path="/event"               element={<Event />} />

                    <Route path="/pengumuman"          element={<Pengumuman />} />
                    <Route path="/pengumuman/:slug"     element={<PengumumanDetail />} />

                    <Route path="/pejabat"             element={<Pejabat />} />

                    <Route path="/pelayanan"             element={<Pelayanan />} />
                    <Route path="/search"             element={<Search />} />

                    <Route path="/riwayat"              element={<RiwayatTiket />} />

                    
                    <Route path="/tiket"              element={<Tiket />} />
                    <Route path="/peta"               element={<Peta />} />
                    <Route path="/profile/edit" element={<EditProfile />} />

                    {/* -------------------------------------------------------------- */}
                    {/* Admin */}

                    <Route path="/admin/*" element={<InformasiWisata />} />
                    <Route path="/admin/kelola-tiket" element={<KelolaTiket />} />
                    <Route path="/admin/scan-tiket" element={<ScanTiket />} />
                    <Route path="/admin/login" element={<AdminLogin />} />

                    {/* -------------------------------------------------------------- */}
                    {/* Super Admin */}

                    <Route path="/super-admin/login" element={<SuperAdminLogin />} />
                    <Route element={<ProtectedSuperAdminRoute />}>
                        <Route path="/super-admin" element={<KelolaAkun />} />
                        <Route path="/super-admin/akun" element={<KelolaAkun />} />
                        <Route path="/super-admin/wisata" element={<KelolaWisata />} />
                        <Route path="/super-admin/berita" element={<KelolaBerita />} />
                        <Route path="/super-admin/pengumuman" element={<KelolaPengumuman />} />
                        <Route path="/super-admin/event" element={<KelolaEvent />} />
                        <Route path="/super-admin/bangunan" element={<KelolaBangunan />} />
                        <Route path="/super-admin/cctv" element={<KelolaCCTV />} />
                    </Route>
                    

                    {/* -------------------------------------------------------------- */}
                    {/* 404 fallback */}
                    <Route path="*"                   element={<NotFound />} />
                </Routes>
            </main>
            {!isFullscreen && <Footer />}
            {!isFullscreen && <ScrollTop />}
        </>
    );
}

function NotFound() {
    return (
        <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 90 }}>
            <i className="fas fa-map-signs" style={{ fontSize: 56, color: 'var(--teal-300)' }} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: 'var(--dark)' }}>404</h1>
            <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>Halaman tidak ditemukan</p>
            <a href="/" className="btn btn-primary"><i className="fas fa-home" /> Kembali ke Beranda</a>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Layout />
        </BrowserRouter>
    );
}
