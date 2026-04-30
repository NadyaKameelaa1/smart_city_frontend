import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  clearReturnToPath,
  getReturnToPath,
  saveSsoSession,
} from '../lib/ssoSession';

export default function SsoCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Sedang memproses login...');

  const resolvePostLoginTarget = (returnTo) => {
    const fallbackPath = '/';

    if (!returnTo) {
      return fallbackPath;
    }

    try {
      const pathname = new URL(returnTo, window.location.origin).pathname;
      const authPages = new Set(['/login', '/daftar', '/callback', '/sso-callback']);

      if (authPages.has(pathname) || pathname === '/') {
        return fallbackPath;
      }

      return returnTo;
    } catch {
      return fallbackPath;
    }
  };

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const error = params.get('error');

      if (error) {
        navigate('/login?error=sso_failed', { replace: true });
        return;
      }

      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      setMessage('Menyimpan sesi dan mengambil data pengguna...');

      localStorage.setItem('token', token);
      localStorage.setItem('auth_token', token);

      try {
        const profileResponse = await api.get('/auth/me');
        const user = profileResponse.data?.user ?? profileResponse.data;

        saveSsoSession({
          token,
          user,
        });
      } catch (profileError) {
        console.warn('Gagal mengambil profil user SSO', profileError);
        saveSsoSession({ token });
      }

      const returnTo = getReturnToPath();
      clearReturnToPath();
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate(resolvePostLoginTarget(returnTo), { replace: true });
    };

    run();
  }, [navigate]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#4072af', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#64748b', fontSize: 14 }}>{message}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
