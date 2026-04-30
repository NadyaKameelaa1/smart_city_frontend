// src/components/Footer.jsx
import { Link } from 'react-router-dom';

const BACKEND_URL = (import.meta.env.VITE_APP_URL || import.meta.env.VITE_API_URL || 'https://apismartcity.qode.my.id').replace(/\/$/, '');
const LOGO_SRC = `/img/logo/logo_smartcity.png`;

const footerLinks = {
    layanan: [
        { label: 'LPSE',             href: 'https://lpse.purbalinggakab.go.id' },
        { label: 'PPID',             href: 'https://ppid.purbalinggakab.go.id' },
        { label: 'Open Data',        href: 'https://data.purbalinggakab.go.id' },
        { label: 'JDIH',             href: 'https://jdih.purbalinggakab.go.id' },
        { label: 'Lapor Mas Bupati', href: 'https://lapor.go.id' },
    ],
    informasi: [
        { label: 'Profil Daerah',  href: '/#profil' },
        { label: 'Berita Terkini', href: '/berita' },
        { label: 'Pengumuman',     href: '/pengumuman' },
        { label: 'Event & Agenda', href: '/event' },
    ],
    wisata: [
        { label: 'Destinasi Wisata',  href: '/#wisata' },
        { label: 'Peta Wisata',       href: '/peta' },
        { label: 'Beli Tiket',        href: '/tiket' },
        { label: 'Kuliner Lokal',     href: '/#wisata' },
        { label: 'Kampung Wisata',    href: '/#wisata' },
    ],
};

const socials = [
    { icon: 'fa-facebook-f',  href: '#', label: 'Facebook' },
    { icon: 'fa-instagram',   href: '#', label: 'Instagram' },
    { icon: 'fa-twitter',     href: '#', label: 'Twitter' },
    { icon: 'fa-youtube',     href: '#', label: 'YouTube' },
    { icon: 'fa-tiktok',      href: '#', label: 'TikTok' },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <>
            <style>{`
                /* ── Footer base ── */
                .footer {
                    background: var(--teal-950, #102d4d);
                    color: rgba(255,255,255,.75);
                    padding: 60px 0 0;
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                }

                /* ── Grid: 4 kolom di desktop ── */
                .footer-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1.4fr;
                    gap: 40px;
                    padding-bottom: 48px;
                    border-bottom: 1px solid rgba(255,255,255,.08);
                }

                /* ── Brand / logo ── */
                .footer-logo {
                    display: flex;
                    align-items: center;
                    gap: 0;
                    margin-bottom: 14px;
                }
                .footer-logo-image {
                    height: 120px;
                    width: auto;
                    display: block;
                    object-fit: contain;
                }
                .footer-brand-desc {
                    font-size: 13px;
                    line-height: 1.75;
                    color: rgba(255,255,255,.55);
                    margin-bottom: 20px;
                }

                /* ── Socials ── */
                .footer-socials {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                .footer-social {
                    width: 36px; height: 36px;
                    border-radius: 50%;
                    background: rgba(255,255,255,.08);
                    border: 1px solid rgba(255,255,255,.12);
                    color: rgba(255,255,255,.65);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 13px;
                    transition: background .2s, color .2s, transform .2s;
                    text-decoration: none;
                }
                .footer-social:hover {
                    background: var(--teal-600, #4072af);
                    color: white;
                    transform: translateY(-2px);
                }

                /* ── Column title ── */
                .footer-col-title {
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: var(--teal-300, #7aadd3);
                    margin-bottom: 18px;
                }

                /* ── Nav links ── */
                .footer-links {
                    list-style: none;
                    padding: 0; margin: 0;
                    display: flex; flex-direction: column; gap: 10px;
                }
                .footer-links li a {
                    display: flex; align-items: center; gap: 8px;
                    font-size: 13px;
                    color: rgba(255,255,255,.6);
                    text-decoration: none;
                    transition: color .2s, gap .2s;
                }
                .footer-links li a:hover {
                    color: white;
                    gap: 11px;
                }

                /* ── Contact ── */
                .footer-contact-items {
                    display: flex; flex-direction: column; gap: 12px;
                }
                .footer-contact-item {
                    display: flex; align-items: flex-start; gap: 10px;
                    font-size: 13px;
                    color: rgba(255,255,255,.6);
                    line-height: 1.55;
                }
                .footer-contact-item i {
                    margin-top: 2px;
                    color: var(--teal-400, #5d93c7);
                    font-size: 13px;
                    flex-shrink: 0;
                    width: 14px;
                    text-align: center;
                }

                /* ── Bottom bar ── */
                .footer-bottom {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 10px;
                    padding: 18px 0;
                    font-size: 12px;
                    color: rgba(255,255,255,.35);
                }
                .footer-bottom-links {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px 16px;
                }
                .footer-bottom-links a {
                    color: rgba(255,255,255,.35);
                    text-decoration: none;
                    transition: color .2s;
                    font-size: 12px;
                }
                .footer-bottom-links a:hover { color: rgba(255,255,255,.75); }

                /* ══════ TABLET (641px – 1024px): 2 kolom ══════ */
                @media (max-width: 1024px) {
                    .footer { padding-top: 44px; }
                    .footer-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 28px 32px;
                        padding-bottom: 36px;
                    }
                    .footer-logo-image { height: 115px; }
                    .footer-brand-desc { font-size: 12.5px; }
                    .footer-col-title  { font-size: 10.5px; margin-bottom: 14px; }
                    .footer-links li a,
                    .footer-contact-item { font-size: 12.5px; }
                }

                /* ══════ MOBILE (≤ 640px): 1 kolom, compact ══════ */
                @media (max-width: 640px) {
                    .footer { padding-top: 32px; }

                    .footer-grid {
                        grid-template-columns: 1fr;
                        gap: 24px;
                        padding-bottom: 28px;
                    }

                    /* Brand lebih kecil */
                    .footer-logo-image { height: 100px; }
                    .footer-brand-desc  { font-size: 12px; line-height: 1.65; margin-bottom: 14px; }

                    /* Social icons lebih kecil */
                    .footer-social { width: 32px; height: 32px; font-size: 12px; }

                    /* Col titles */
                    .footer-col-title { font-size: 10px; margin-bottom: 10px; }

                    /* Links lebih compact */
                    .footer-links { gap: 7px; }
                    .footer-links li a { font-size: 12px; }

                    /* Contact */
                    .footer-contact-item { font-size: 12px; gap: 8px; }
                    .footer-contact-item i { font-size: 12px; }

                    /* Bottom bar: stack vertikal, tengah */
                    .footer-bottom {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                        gap: 8px;
                        padding: 16px 0;
                        font-size: 11px;
                    }
                    .footer-bottom-links { justify-content: center; gap: 6px 12px; }
                    .footer-bottom-links a { font-size: 11px; }
                }

                /* ══════ SMALL MOBILE (≤ 380px): lebih compact lagi ══════ */
                @media (max-width: 380px) {
                    .footer { padding-top: 24px; }
                    .footer-grid { gap: 20px; padding-bottom: 22px; }
                    .footer-logo-image  { height: 95px; }
                    .footer-brand-desc  { font-size: 11.5px; }
                    .footer-links li a,
                    .footer-contact-item { font-size: 11.5px; }
                    .footer-bottom,
                    .footer-bottom-links a { font-size: 10.5px; }
                }
            `}</style>

            <footer className="footer">
                <div className="container">
                    <div className="footer-grid">
                        {/* Brand */}
                        <div>
                            <div className="footer-logo">
                                <img src={LOGO_SRC} alt="Logo Smart City Purbalingga" className="footer-logo-image" />
                            </div>
                            <p className="footer-brand-desc">
                                Portal resmi informasi publik Kabupaten Purbalingga. Melayani masyarakat dengan informasi yang akurat, transparan, dan mudah diakses.
                            </p>
                            <div className="footer-socials">
                                {socials.map((s) => (
                                    <a
                                        key={s.label}
                                        href={s.href}
                                        className="footer-social"
                                        aria-label={s.label}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <i className={`fab ${s.icon}`} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Layanan */}
                        <div>
                            <div className="footer-col-title">Layanan</div>
                            <ul className="footer-links">
                                {footerLinks.layanan.map((l) => (
                                    <li key={l.label}>
                                        <a href={l.href} target={l.href.startsWith('http') ? '_blank' : '_self'} rel="noreferrer">
                                            <i className="fas fa-chevron-right" style={{ fontSize: 9 }} />
                                            {l.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Informasi */}
                        {/* <div>
                            <div className="footer-col-title">Informasi</div>
                            <ul className="footer-links">
                                {footerLinks.informasi.map((l) => (
                                    <li key={l.label}>
                                        <Link to={l.href}>
                                            <i className="fas fa-chevron-right" style={{ fontSize: 9 }} />
                                            {l.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div> */}

                        {/* Kontak */}
                        <div>
                            <div className="footer-col-title">Kontak</div>
                            <div className="footer-contact-items">
                                {[
                                    { icon: 'fa-map-marker-alt', text: 'Jl. Lets Jend. S. Parman No.1, Purbalingga, Jawa Tengah 53316' },
                                    { icon: 'fa-phone',          text: '(0281) 891016' },
                                    { icon: 'fa-envelope',       text: 'info@purbalinggakab.go.id' },
                                    { icon: 'fa-globe',          text: 'www.purbalinggakab.go.id' },
                                ].map((item) => (
                                    <div className="footer-contact-item" key={item.icon}>
                                        <i className={`fas ${item.icon}`} />
                                        <span>{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="footer-bottom">
                        <span>© {currentYear} Purbalingga Smart City. All rights reserved.</span>
                        <div className="footer-bottom-links">
                            <Link to="/privasi">Kebijakan Privasi</Link>
                            <Link to="/syarat">Syarat & Ketentuan</Link>
                            <Link to="/peta">Sitemap</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
