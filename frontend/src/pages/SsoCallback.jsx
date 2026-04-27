import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SsoCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    const error  = params.get('error');

    if (error) {
      navigate('/login?error=sso_failed');
      return;
    }

    if (token) {
      // Simpan token — sesuaikan dengan cara auth kamu (localStorage, context, dll.)
      localStorage.setItem('auth_token', token);
      navigate('/');   // atau ke dashboard, sesuaikan
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#4072af', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#64748b', fontSize: 14 }}>Sedang memproses login...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}