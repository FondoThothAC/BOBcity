import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPublicData, saveAdminData, syncInstagram } from '../services/api';

export default function AdminDashboard() {
  const [data, setData] = useState({ config: {}, projects: [], posts: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncingIg, setSyncingIg] = useState(false);
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

  const handleSyncInstagram = async () => {
    setSyncingIg(true);
    setMessage({ type: '', text: '' });
    const token = localStorage.getItem('adminToken');
    
    try {
      const res = await syncInstagram(token);
      setMessage({ type: 'success', text: res.message || 'Sincronizado con Instagram con éxito.' });
      await loadData();
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      if (error.message && (error.message.includes('Sesión') || error.message.includes('token'))) {
        handleLogout();
      }
    }
    setSyncingIg(false);
  };

  // ---- MANEJADORES DE ESTADO ----
  const updateConfig = (key, value) => {
    setData(prev => ({ ...prev, config: { ...prev.config, [key]: value } }));
  };

  const addProject = () => {
    const newProject = { id: Date.now().toString(), title: '', description: '', image: '', tags: [], link: '', estado: 'Activo', icono: '⬡', acento: 'cyan' };
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
    const newPost = { id: Date.now().toString(), title: '', content: '', date: new Date().toISOString().split('T')[0], type: 'announcement', emoji: '📢', link: '', eventType: 'Evento', acento: 'cyan' };
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
              <input type="text" placeholder="Título" value={p.title} onChange={e => updateProject(p.id, 'title', e.target.value)} style={{...inputStyle, flex: 2}} />
              <input type="text" placeholder="Link / URL" value={p.link} onChange={e => updateProject(p.id, 'link', e.target.value)} style={{...inputStyle, flex: 2}} />
              <input type="text" placeholder="Estado (ej: En Desarrollo)" value={p.estado || ''} onChange={e => updateProject(p.id, 'estado', e.target.value)} style={{...inputStyle, flex: 1}} />
            </div>
            
            <textarea placeholder="Descripción" value={p.description} onChange={e => updateProject(p.id, 'description', e.target.value)} style={{...inputStyle, width: '100%', marginBottom: '1rem', minHeight: '80px'}} />
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <input type="text" placeholder="Emoji / Icono (ej: 🏛️)" value={p.icono || ''} onChange={e => updateProject(p.id, 'icono', e.target.value)} style={{...inputStyle, flex: 1}} />
              
              <div style={{ flex: 1 }}>
                <select value={p.acento || 'cyan'} onChange={e => updateProject(p.id, 'acento', e.target.value)} style={inputStyle}>
                  <option value="cyan">Acento Cyan (Celeste)</option>
                  <option value="purple">Acento Purple (Morado)</option>
                  <option value="gold">Acento Gold (Dorado)</option>
                </select>
              </div>

              <input type="text" placeholder="Tags (separados por coma)" value={p.tags ? p.tags.join(', ') : ''} onChange={e => updateProject(p.id, 'tags', e.target.value.split(',').map(t=>t.trim()))} style={{...inputStyle, flex: 2}} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input type="text" placeholder="URL Imagen" value={p.image} onChange={e => updateProject(p.id, 'image', e.target.value)} style={{...inputStyle, flex: 3}} />
              <button className="btn btn-sm" style={{ background: 'var(--plasma)', color: 'white' }} onClick={() => removeProject(p.id)}>Eliminar Proyecto</button>
            </div>
          </div>
        ))}
      </section>

      {/* --- PUBLICACIONES --- */}
      <section className="glass-card" style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 className="accent-gold">Publicaciones / Anuncios / Redes</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn btn-sm" 
              style={{ background: 'var(--neon-cyan)', color: '#04030d', fontWeight: 'bold' }} 
              onClick={handleSyncInstagram}
              disabled={syncingIg}
            >
              {syncingIg ? '⏳ Sincronizando...' : '📷 Sincronizar Instagram'}
            </button>
            <button className="btn btn-sm btn-ghost" onClick={addPost}>+ Añadir Publicación</button>
          </div>
        </div>

        {data.posts?.map(p => (
          <div key={p.id} style={{ border: '1px solid rgba(212, 175, 55, 0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', background: 'rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input type="text" placeholder="Título / Encabezado" value={p.title} onChange={e => updatePost(p.id, 'title', e.target.value)} style={{...inputStyle, flex: 2}} />
              <input type="text" placeholder="Fecha / Tiempo (ej: Hace 2 días o 2026-05-15)" value={p.date} onChange={e => updatePost(p.id, 'date', e.target.value)} style={{...inputStyle, flex: 1}} />
              <select value={p.type} onChange={e => updatePost(p.id, 'type', e.target.value)} style={{...inputStyle, flex: 1}}>
                <option value="announcement">Anuncio (General)</option>
                <option value="news">Noticia (General)</option>
                <option value="event">Evento (Línea de Tiempo)</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>
            
            <textarea placeholder="Contenido de la publicación..." value={p.content} onChange={e => updatePost(p.id, 'content', e.target.value)} style={{...inputStyle, width: '100%', minHeight: '80px', marginBottom: '1rem'}} />
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '1rem', flex: 3 }}>
                <input type="text" placeholder="Emoji / Icono (ej: 🚀 o 𓁹)" value={p.emoji || ''} onChange={e => updatePost(p.id, 'emoji', e.target.value)} style={{...inputStyle, maxWidth: '180px'}} />
                <input type="text" placeholder="Enlace / URL externa (ej: link de instagram)" value={p.link || ''} onChange={e => updatePost(p.id, 'link', e.target.value)} style={inputStyle} />
                
                {p.type === 'event' && (
                  <>
                    <input type="text" placeholder="Tipo Evento (ej: Hackathon)" value={p.eventType || ''} onChange={e => updatePost(p.id, 'eventType', e.target.value)} style={{...inputStyle, maxWidth: '180px'}} />
                    <select value={p.acento || 'cyan'} onChange={e => updatePost(p.id, 'acento', e.target.value)} style={{...inputStyle, maxWidth: '180px'}}>
                      <option value="cyan">Cyan</option>
                      <option value="purple">Morado</option>
                      <option value="gold">Dorado</option>
                    </select>
                  </>
                )}
              </div>
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
