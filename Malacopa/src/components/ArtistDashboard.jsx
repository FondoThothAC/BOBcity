/* ============================================================================
   Malacopa - Dashboard del Artista / Banda (React)
   ============================================================================
   Permite al líder de la banda o artista gestionar sus shows, coordinar a los
   músicos colaboradores y armar el setlist/playlist de canciones para cada evento.
   ============================================================================ */

import React, { useState, useEffect } from 'react';
import { Users, Music, Calendar, Plus, Trash2, Edit2, Play, Save } from 'lucide-react';

const INTEGRANTES_DEFAULT = [
  { id: 'mus_1', nombre: 'Carlos Rivera', instrumento: 'Guitarra Principal', backup: 'Teclado' },
  { id: 'mus_2', nombre: 'Laura Martínez', instrumento: 'Bajo', backup: 'Coros' },
  { id: 'mus_3', nombre: 'Eduardo Celis', instrumento: 'Batería', backup: 'Percusiones' }
];

const SETLIST_DEFAULT = [
  { id: 'song_1', orden: 1, titulo: 'Intro / Obertura Eléctrica', tono: 'Mi Menor (Em)', notas: 'Solo de guitarra extendido en la intro.' },
  { id: 'song_2', orden: 2, titulo: 'Espejismos de Neón', tono: 'La Mayor (A)', notas: 'Entrar directamente con el bajo.' },
  { id: 'song_3', orden: 3, titulo: 'Malacopa Blues', tono: 'Do Mayor (C)', notas: 'Ritmo shuffle lento. Solo de saxofón al medio.' },
  { id: 'song_4', orden: 4, titulo: 'Catarasis Audiovisual', tono: 'Re Menor (Dm)', notas: 'Sincronizar las luces estroboscópicas en el coro.' }
];

export default function ArtistDashboard() {
  const [integrantes, setIntegrantes] = useState([]);
  const [setlist, setSetlist] = useState([]);
  const [activeTab, setActiveTab] = useState('musicos');

  // Estados para nuevo músico
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoInstrumento, setNuevoInstrumento] = useState('Guitarra');
  const [nuevoBackup, setNuevoBackup] = useState('');

  // Estados para nueva canción
  const [nuevaCancion, setNuevaCancion] = useState('');
  const [nuevoTono, setNuevoTono] = useState('Sol Mayor (G)');
  const [nuevasNotas, setNuevasNotas] = useState('');

  // Cargar datos desde localStorage o usar defaults
  useEffect(() => {
    try {
      const storedMusicos = localStorage.getItem('malacopa_integrantes');
      const storedSetlist = localStorage.getItem('malacopa_setlist');

      if (storedMusicos) {
        setIntegrantes(JSON.parse(storedMusicos));
      } else {
        setIntegrantes(INTEGRANTES_DEFAULT);
        localStorage.setItem('malacopa_integrantes', JSON.stringify(INTEGRANTES_DEFAULT));
      }

      if (storedSetlist) {
        setSetlist(JSON.parse(storedSetlist));
      } else {
        setSetlist(SETLIST_DEFAULT);
        localStorage.setItem('malacopa_setlist', JSON.stringify(SETLIST_DEFAULT));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const guardarMusicos = (lista) => {
    setIntegrantes(lista);
    localStorage.setItem('malacopa_integrantes', JSON.stringify(lista));
  };

  const guardarSetlist = (lista) => {
    setSetlist(lista);
    localStorage.setItem('malacopa_setlist', JSON.stringify(lista));
  };

  const handleAgregarMusico = (e) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    const nuevo = {
      id: `mus_${Date.now()}`,
      nombre: nuevoNombre,
      instrumento: nuevoInstrumento,
      backup: nuevoBackup || 'Ninguno'
    };

    const actualizada = [...integrantes, nuevo];
    guardarMusicos(actualizada);
    
    // Limpiar inputs
    setNuevoNombre('');
    setNuevoBackup('');
  };

  const handleEliminarMusico = (id) => {
    const filtrado = integrantes.filter((m) => m.id !== id);
    guardarMusicos(filtrado);
  };

  const handleAgregarCancion = (e) => {
    e.preventDefault();
    if (!nuevaCancion.trim()) return;

    const nueva = {
      id: `song_${Date.now()}`,
      orden: setlist.length + 1,
      titulo: nuevaCancion,
      tono: nuevoTono,
      notas: nuevasNotas || 'Sin observaciones.'
    };

    const actualizada = [...setlist, nueva];
    guardarSetlist(actualizada);

    // Limpiar inputs
    setNuevaCancion('');
    setNuevasNotas('');
  };

  const handleEliminarCancion = (id) => {
    const filtrado = setlist.filter((s) => s.id !== id);
    // Reordenar las canciones restantes
    const reordenada = filtrado.map((s, index) => ({ ...s, orden: index + 1 }));
    guardarSetlist(reordenada);
  };

  return (
    <div className="panel-contenido">
      {/* Tabs */}
      <div className="tabs-navegacion">
        <button 
          onClick={() => setActiveTab('musicos')} 
          className={`tab-link ${activeTab === 'musicos' ? 'activo' : ''}`}
        >
          <Users size={16} style={{ marginRight: '6px' }} />
          Músicos / Colaboradores ({integrantes.length})
        </button>
        <button 
          onClick={() => setActiveTab('playlist')} 
          className={`tab-link ${activeTab === 'playlist' ? 'activo' : ''}`}
        >
          <Music size={16} style={{ marginRight: '6px' }} />
          Playlist / Repertorio del Show ({setlist.length})
        </button>
        <button 
          onClick={() => setActiveTab('shows')} 
          className={`tab-link ${activeTab === 'shows' ? 'activo' : ''}`}
        >
          <Calendar size={16} style={{ marginRight: '6px' }} />
          Agenda de Shows
        </button>
      </div>

      {/* SECCIÓN MÚSICOS */}
      {activeTab === 'musicos' && (
        <div className="grid-dashboard">
          {/* Listado de integrantes */}
          <div className="tarjeta-premium">
            <h3>Integrantes Activos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {integrantes.map((m) => (
                <div key={m.id} style={{
                  display: 'flex',
                  justifyContent: 'between',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.02)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--color-borde-glass)'
                }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>{m.nombre}</h4>
                    <span className="badge-neon badge-morado" style={{ marginTop: '4px', fontSize: '11px' }}>
                      {m.instrumento}
                    </span>
                    <span className="badge-neon badge-cian" style={{ marginLeft: '8px', fontSize: '11px' }}>
                      Resp: {m.backup}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleEliminarMusico(m.id)} 
                    className="btn-secundario" 
                    style={{ padding: '8px', borderRadius: '50%', color: 'var(--color-neon-magenta)' }}
                    title="Eliminar músico"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Formulario Agregar Músico */}
          <div className="tarjeta-premium">
            <h3>Registrar Colaborador / Músico</h3>
            <form onSubmit={handleAgregarMusico} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--color-texto-secundario)', display: 'block', marginBottom: '6px' }}>
                  Nombre Completo:
                </label>
                <input 
                  type="text" 
                  placeholder="Ej: Sofía Méndez" 
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="input-premium" 
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-texto-secundario)', display: 'block', marginBottom: '6px' }}>
                    Instrumento Principal:
                  </label>
                  <select 
                    value={nuevoInstrumento}
                    onChange={(e) => setNuevoInstrumento(e.target.value)}
                    className="input-premium"
                  >
                    <option value="Voz / Cantante">Voz / Cantante</option>
                    <option value="Guitarra Eléctrica">Guitarra Eléctrica</option>
                    <option value="Guitarra Acústica">Guitarra Acústica</option>
                    <option value="Bajo Eléctrico">Bajo Eléctrico</option>
                    <option value="Batería / Percusión">Batería / Percusión</option>
                    <option value="Teclado / Sintetizador">Teclado / Sintetizador</option>
                    <option value="Saxofón / Metales">Saxofón / Metales</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', color: 'var(--color-texto-secundario)', display: 'block', marginBottom: '6px' }}>
                    Instrumento Resp. (Backup):
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ej: Coros / Percusión" 
                    value={nuevoBackup}
                    onChange={(e) => setNuevoBackup(e.target.value)}
                    className="input-premium" 
                  />
                </div>
              </div>

              <button type="submit" className="btn-neon" style={{ justifyContent: 'center' }}>
                <Plus size={16} />
                Agregar a la Banda
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SECCIÓN PLAYLIST */}
      {activeTab === 'playlist' && (
        <div className="grid-dashboard">
          {/* Lista del Setlist */}
          <div className="tarjeta-premium">
            <h3>Setlist / Repertorio Ordenado</h3>
            <p style={{ fontSize: '12px', color: 'var(--color-texto-secundario)', marginBottom: '16px' }}>
              Este orden se sincroniza automáticamente con el panel del músico en el escenario para coordinar tonalidades.
            </p>
            <div className="setlist-lista">
              {setlist.map((s) => (
                <div key={s.id} className="setlist-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--degradado-neon)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '800'
                    }}>
                      {s.orden}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px' }}>{s.titulo}</h4>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                        <span className="badge-neon badge-cian" style={{ fontSize: '10px', padding: '2px 6px' }}>{s.tono}</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-texto-apagado)' }}>{s.notas}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleEliminarCancion(s.id)} 
                    className="btn-secundario" 
                    style={{ padding: '6px', borderRadius: '50%', color: 'var(--color-neon-magenta)' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Formulario Agregar Canción */}
          <div className="tarjeta-premium">
            <h3>Añadir Canción / Set</h3>
            <form onSubmit={handleAgregarCancion} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--color-texto-secundario)', display: 'block', marginBottom: '6px' }}>
                  Nombre de la Canción / Pista:
                </label>
                <input 
                  type="text" 
                  placeholder="Ej: Welcome to the Jungle / Solo de Batería" 
                  value={nuevaCancion}
                  onChange={(e) => setNuevaCancion(e.target.value)}
                  className="input-premium" 
                  required 
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', color: 'var(--color-texto-secundario)', display: 'block', marginBottom: '6px' }}>
                  Tonalidad de Referencia:
                </label>
                <select 
                  value={nuevoTono}
                  onChange={(e) => setNuevoTono(e.target.value)}
                  className="input-premium"
                >
                  <option value="Do Mayor (C)">Do Mayor (C)</option>
                  <option value="Re Mayor (D)">Re Mayor (D)</option>
                  <option value="Mi Mayor (E)">Mi Mayor (E)</option>
                  <option value="Mi Menor (Em)">Mi Menor (Em)</option>
                  <option value="Fa Mayor (F)">Fa Mayor (F)</option>
                  <option value="Sol Mayor (G)">Sol Mayor (G)</option>
                  <option value="La Mayor (A)">La Mayor (A)</option>
                  <option value="La Menor (Am)">La Menor (Am)</option>
                  <option value="Si Menor (Bm)">Si Menor (Bm)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '13px', color: 'var(--color-texto-secundario)', display: 'block', marginBottom: '6px' }}>
                  Notas / Observaciones del Show:
                </label>
                <input 
                  type="text" 
                  placeholder="Ej: Solo de bajo de 16 compases." 
                  value={nuevasNotas}
                  onChange={(e) => setNuevasNotas(e.target.value)}
                  className="input-premium" 
                />
              </div>

              <button type="submit" className="btn-neon" style={{ justifyContent: 'center' }}>
                <Plus size={16} />
                Añadir al Repertorio
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SECCIÓN SHOWS */}
      {activeTab === 'shows' && (
        <div className="tarjeta-premium">
          <h3>Próximos Espectáculos Programados</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <div style={{
              background: 'rgba(138, 43, 226, 0.05)',
              border: '1px solid rgba(138, 43, 226, 0.2)',
              padding: '16px',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'between',
              alignItems: 'center'
            }}>
              <div>
                <span className="badge-neon badge-morado" style={{ marginBottom: '6px' }}>Confirmado</span>
                <h4 style={{ fontSize: '16px', margin: '4px 0' }}>Concierto del Sol - Foro del Sol</h4>
                <div style={{ fontSize: '13px', color: 'var(--color-texto-secundario)' }}>
                  🗓️ 2026-06-15 a las 21:00 hs | 📍 Hermosillo, Sonora
                </div>
              </div>
              <span style={{ color: 'var(--color-neon-cian)', fontWeight: '700', fontSize: '15px' }}>
                Músicos: {integrantes.length} Asignados
              </span>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--color-borde-glass)',
              padding: '16px',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'between',
              alignItems: 'center'
            }}>
              <div>
                <span className="badge-neon badge-cian" style={{ marginBottom: '6px' }}>En Ensayos</span>
                <h4 style={{ fontSize: '16px', margin: '4px 0' }}>Show Privado: Boda Sofía y Carlos</h4>
                <div style={{ fontSize: '13px', color: 'var(--color-texto-secundario)' }}>
                  🗓️ 2026-06-25 a las 19:30 hs | 📍 Quinta La Ruina
                </div>
              </div>
              <span style={{ color: 'var(--color-neon-magenta)', fontWeight: '700', fontSize: '15px' }}>
                Músicos: {integrantes.length} Asignados
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
