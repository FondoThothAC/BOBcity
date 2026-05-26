import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPublicData, saveAdminData } from '../services/api';

export default function AdminDashboard() {
  const [data, setData] = useState({ config: {}, projects: [], posts: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    const dbData = await fetchPublicData();
    if (dbData) {
      setData(dbData);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    const token = localStorage.getItem('adminToken');
    
    try {
      await saveAdminData(data, token);
      setMessage({ type: 'success', text: 'Datos guardados en el VPS correctamente.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      if (error.message.includes('Sesión')) {
        handleLogout();
      }
    }
    setSaving(false);
  };

  // ---- MANEJADORES DE ESTADO ----
  const updateConfig = (key, value) => {
    setData(prev => ({ ...prev, config: { ...prev.config, [key]: value } }));
  };

  const addProject = () => {
    const newProject = { id: Date.now().toString(), title: '', description: '', image: '', tags: [], link: '' };
    setData(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
  };

  const updateProject = (id, field, value) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const removeProject = (id) => {
    setData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  };

  const addPost = () => {
    const newPost = { id: Date.now().toString(), title: '', content: '', date: new Date().toISOString().split('T')[0], type: 'announcement' };
    setData(prev => ({ ...prev, posts: [...prev.posts, newPost] }));
  };

  const updatePost = (id, field, value) => {
    setData(prev => ({
      ...prev,
      posts: prev.posts.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const removePost = (id) => {
    setData(prev => ({ ...prev, posts: prev.posts.filter(p => p.id !== id) }));
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Cargando datos desde el VPS...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'var(--font-body)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h2><span className="accent-gold">PANEL</span> DE CONTROL</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/')}>Ver Sitio</button>
          <button className="btn btn-ghost" onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </header>

      {message.text && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '2rem', 
          borderRadius: '8px',
          background: message.type === 'success' ? 'rgba(0, 245, 228, 0.2)' : 'rgba(255, 45, 120, 0.2)',
          border: `1px solid ${message.type === 'success' ? 'var(--neon-cyan)' : 'var(--plasma)'}`
        }}>
          {message.text}
        </div>
      )}

      {/* --- CONFIGURACIÓN ADS/ANALYTICS --- */}
      <section className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 className="accent-cyan" style={{ marginBottom: '1rem' }}>Configuración Global</h3>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ID Google AdSense</label>
            <input 
              type="text" 
              value={data.config?.adsenseId || ''} 
              onChange={(e) => updateConfig('adsenseId', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ID Google Analytics (GA4)</label>
            <input 
              type="text" 
              value={data.config?.ga4Id || ''} 
              onChange={(e) => updateConfig('ga4Id', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* --- PROYECTOS --- */}
      <section className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 className="accent-purple">Proyectos DeepTech</h3>
          <button className="btn btn-sm btn-ghost" onClick={addProject}>+ Añadir Proyecto</button>
        </div>
        
        {data.projects?.map(p => (
          <div key={p.id} style={{ border: '1px solid rgba(123, 47, 190, 0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', background: 'rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input type="text" placeholder="Título" value={p.title} onChange={e => updateProject(p.id, 'title', e.target.value)} style={{...inputStyle, flex: 1}} />
              <input type="text" placeholder="Link / URL" value={p.link} onChange={e => updateProject(p.id, 'link', e.target.value)} style={{...inputStyle, flex: 1}} />
            </div>
            <textarea placeholder="Descripción" value={p.description} onChange={e => updateProject(p.id, 'description', e.target.value)} style={{...inputStyle, width: '100%', marginBottom: '1rem', minHeight: '80px'}} />
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input type="text" placeholder="Tags (separados por coma)" value={p.tags.join(', ')} onChange={e => updateProject(p.id, 'tags', e.target.value.split(',').map(t=>t.trim()))} style={{...inputStyle, flex: 2}} />
              <input type="text" placeholder="URL Imagen" value={p.image} onChange={e => updateProject(p.id, 'image', e.target.value)} style={{...inputStyle, flex: 2}} />
              <button className="btn btn-sm" style={{ background: 'var(--plasma)', color: 'white' }} onClick={() => removeProject(p.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </section>

      {/* --- PUBLICACIONES --- */}
      <section className="glass-card" style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 className="accent-gold">Publicaciones / Anuncios</h3>
          <button className="btn btn-sm btn-ghost" onClick={addPost}>+ Añadir Publicación</button>
        </div>

        {data.posts?.map(p => (
          <div key={p.id} style={{ border: '1px solid rgba(212, 175, 55, 0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', background: 'rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input type="text" placeholder="Título" value={p.title} onChange={e => updatePost(p.id, 'title', e.target.value)} style={{...inputStyle, flex: 2}} />
              <input type="date" value={p.date} onChange={e => updatePost(p.id, 'date', e.target.value)} style={{...inputStyle, flex: 1}} />
              <select value={p.type} onChange={e => updatePost(p.id, 'type', e.target.value)} style={{...inputStyle, flex: 1}}>
                <option value="announcement">Anuncio</option>
                <option value="news">Noticia</option>
                <option value="event">Evento</option>
              </select>
            </div>
            <textarea placeholder="Contenido de la publicación..." value={p.content} onChange={e => updatePost(p.id, 'content', e.target.value)} style={{...inputStyle, width: '100%', minHeight: '80px', marginBottom: '1rem'}} />
            <div style={{ textAlign: 'right' }}>
              <button className="btn btn-sm" style={{ background: 'var(--plasma)', color: 'white' }} onClick={() => removePost(p.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </section>

      {/* --- GUARDAR --- */}
      <div style={{ position: 'sticky', bottom: '2rem', textAlign: 'center', zIndex: 100 }}>
        <button 
          className="btn btn-primary btn-lg" 
          onClick={handleSave} 
          disabled={saving}
          style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 20px var(--cyan-glow)' }}
        >
          {saving ? 'Sincronizando...' : '💾 GUARDAR CAMBIOS EN VPS'}
        </button>
      </div>

    </div>
  );
}

const inputStyle = {
  padding: '0.75rem',
  background: 'rgba(0,0,0,0.5)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '6px',
  color: 'white',
  fontFamily: 'inherit',
  width: '100%'
};
