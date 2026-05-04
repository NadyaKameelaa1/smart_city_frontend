import { useEffect, useMemo } from 'react';

export default function Login() {
    const search = useMemo(() => new URLSearchParams(window.location.search), []);
    const error = search.get('error');
    const ssoLoginUrl = useMemo(() => 'https://apismartcity.qode.my.id/auth/sso/redirect', []);

    useEffect(() => {
        if (error) {
            return;
        }

        const timer = window.setTimeout(() => {
            window.location.href = ssoLoginUrl;
        }, 250);

        return () => window.clearTimeout(timer);
    }, [error, ssoLoginUrl]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: 'linear-gradient(135deg, #f7fafc 0%, #eef4fb 100%)',
        }}>
            <div style={{
                width: '100%',
                maxWidth: 520,
                background: 'white',
                borderRadius: 24,
                boxShadow: '0 20px 60px rgba(15, 23, 42, .12)',
                border: '1px solid rgba(64,114,175,.12)',
                padding: 32,
                textAlign: 'center',
            }}>
                <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: 22,
                    margin: '0 auto 18px',
                    background: 'linear-gradient(135deg, var(--teal-600), var(--teal-800))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 28,
                }}>
                    <i className="fas fa-city" />
                </div>

                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--dark)', marginBottom: 10 }}>
                    Masuk dengan SSO
                </h1>

                <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                    Kamu akan diarahkan ke halaman login SSO untuk memasukkan username dan password.
                    Setelah berhasil, sistem akan kembali ke Smart City secara otomatis.
                </p>

                {error ? (
                    <div style={{
                        marginBottom: 20,
                        padding: '12px 14px',
                        borderRadius: 14,
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#b91c1c',
                        fontSize: 13,
                        lineHeight: 1.6,
                    }}>
                        <i className="fas fa-circle-exclamation" style={{ marginRight: 8 }} />
                        Login SSO gagal. Silakan coba lagi.
                    </div>
                ) : (
                    <div style={{ marginBottom: 20, color: 'var(--teal-700)', fontSize: 13 }}>
                        Mengalihkan ke SSO...
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => { window.location.href = ssoLoginUrl; }}
                    style={{
                        width: '100%',
                        border: 'none',
                        borderRadius: 14,
                        padding: '14px 18px',
                        background: 'var(--teal-600)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: 'pointer',
                        boxShadow: '0 10px 24px rgba(64,114,175,.22)',
                    }}
                >
                    Lanjut ke SSO
                </button>

                <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                    Jika kamu sudah login, sistem akan langsung kembali ke halaman Smart City.
                </p>
            </div>
        </div>
    );
}
