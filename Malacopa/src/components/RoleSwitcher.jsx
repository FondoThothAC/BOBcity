/* ============================================================================
   Malacopa - Selector de Roles para Desarrollo (React)
   ============================================================================
   Control flotante para alternar rápidamente entre los 6 niveles de la app
   e interactuar con los diferentes dashboards.
   ============================================================================ */

import React, { useState } from 'react';
import { useAuth, NIVELES_MALACOPA } from '../AuthContext';
import { Shield, Sparkles, User, Users, Music, DollarSign, Settings } from 'lucide-react';

export default function RoleSwitcher() {
  const { user, cambiarNivelRol } = useAuth();
  const [minimizado, setMinimizado] = useState(true);

  if (!user) return null;

  const obtenerIcono = (lvl) => {
    switch (lvl) {
      case 1: return <User size={16} />;
      case 2: return <Sparkles size={16} />;
      case 3: return <Users size={16} />;
      case 4: return <Music size={16} />;
      case 5: return <DollarSign size={16} />;
      case 6: return <Settings size={16} />;
      default: return <Shield size={16} />;
    }
  };

  return (
    <div className="efecto-glass" style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      padding: minimizado ? '10px 14px' : '20px',
      maxWidth: '300px',
      border: '1px solid rgba(0, 243, 255, 0.3)',
      boxShadow: '0 0 20px rgba(0, 243, 255, 0.15)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} color="var(--color-neon-cian)" className="efecto-pulso" />
          <span style={{ fontWeight: '600', fontSize: '14px', letterSpacing: '-0.01em' }}>
            Nivel: {user.roleLevel} - {user.roleName}
          </span>
        </div>
        <button 
          onClick={() => setMinimizado(!minimizado)}
          className="btn-secundario"
          style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px' }}
        >
          {minimizado ? 'Abrir Selector' : 'Cerrar'}
        </button>
      </div>

      {!minimizado && (
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '12px', color: 'var(--color-texto-secundario)', marginBottom: '8px' }}>
            Simular otro nivel de acceso:
          </div>
          {Object.values(NIVELES_MALACOPA).map((n) => (
            <button
              key={n.level}
              onClick={() => cambiarNivelRol(n.level)}
              className={user.roleLevel === n.level ? 'btn-neon' : 'btn-secundario'}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '13px',
                justifyContent: 'flex-start',
                borderRadius: '8px'
              }}
            >
              <span style={{ display: 'inline-flex', marginRight: '8px' }}>
                {obtenerIcono(n.level)}
              </span>
              Nivel {n.level}: {n.name}
            </button>
          ))}
          <div style={{
            fontSize: '10.5px',
            color: 'var(--color-texto-apagado)',
            marginTop: '8px',
            lineHeight: '1.3'
          }}>
            Cambiar de nivel habilitará/deshabilitará los módulos visuales de forma instantánea.
          </div>
        </div>
      )}
    </div>
  );
}
