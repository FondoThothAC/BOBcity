import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../services/api';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = await loginAdmin(password);
    
    if (token) {
      localStorage.setItem('adminToken', token);
      navigate('/admin');
    } else {
      setError('Contraseña incorrecta o error de conexión');
    }
    
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="glass-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'neonPulse 3s infinite' }}>𓁹</div>
        <h2 style={{ marginBottom: '2rem' }} className="accent-cyan">ACCESO CLASIFICADO</h2>
        
        {error && <p style={{ color: '#ff2d78', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <input 
              type="password" 
              placeholder="Código de acceso..." 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(0, 245, 228, 0.3)',
                borderRadius: '8px',
                color: '#fff',
                fontFamily: 'var(--font-mono)'
              }}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'AUTENTICANDO...' : 'INICIAR ENLACE'}
          </button>
          
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
            ← VOLVER
          </button>
        </form>
      </div>
    </div>
  );
}
