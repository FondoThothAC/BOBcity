/* ============================================================================
   Malacopa - App Principal Integrador (React)
   ============================================================================
   Orquesta los 6 niveles de roles y módulos del sistema de entretenimiento.
   Integra de manera responsive los dashboards de Clientes, Músicos, Artistas
   y Empresarios/Managers, junto al Asistente Bob Bot y el selector de roles.
   ============================================================================ */

import React, { useState, Suspense } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { CartProvider } from './CartContext';
import RoleSwitcher from './components/RoleSwitcher';
import BobBot from './components/BobBot';

// Lazy loading de Dashboards para optimización de recursos (MoE Architecture)
const ClientDashboard = React.lazy(() => import('./components/ClientDashboard'));
const MusicianView = React.lazy(() => import('./components/MusicianView'));
const ArtistDashboard = React.lazy(() => import('./components/ArtistDashboard'));
const ManagerDashboard = React.lazy(() => import('./components/ManagerDashboard'));

// Iconos premium
import { Music, Radio, Users, DollarSign, Shield, LogOut, Loader, Heart } from 'lucide-react';
import './App.css';

function MainApp() {
  const { user, logout } = useAuth();
  const [showBobBot, setShowBobBot] = useState(false);

  // Cargador de módulos lazy
  const LoadingModule = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '60px',
      color: 'var(--color-texto-secundario)',
      gap: '12px'
    }}>
      <Loader className="cargador" size={32} />
      <span>Cargando Módulo de Malacopa...</span>
    </div>
  );

  // Renderizado condicional según nivel de rol
  const renderDashboardByRole = () => {
    switch (user.roleLevel) {
      case 1:
      case 2:
        return (
          <Suspense fallback={<LoadingModule />}>
            <ClientDashboard />
          </Suspense>
        );
      case 3:
        return (
          <Suspense fallback={<LoadingModule />}>
            <MusicianView />
          </Suspense>
        );
      case 4:
        return (
          <Suspense fallback={<LoadingModule />}>
            <ArtistDashboard />
          </Suspense>
        );
      case 5:
        return (
          <Suspense fallback={<LoadingModule />}>
            <ManagerDashboard />
          </Suspense>
        );
      case 6:
        return (
          <div className="tarjeta-premium" style={{ textAlign: 'center', padding: '40px' }}>
            <Shield size={48} color="var(--color-neon-cian)" style={{ margin: '0 auto 16px auto' }} />
            <h2>Consola de Administración de Malacopa</h2>
            <p style={{ color: 'var(--color-texto-secundario)', marginTop: '8px' }}>
              Eres el Administrador General de la Plataforma. Tienes acceso a todos los dashboards simulando los roles con el selector flotante en la parte inferior derecha.
            </p>
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              marginTop: '24px',
              flexWrap: 'wrap'
            }}>
              <div className="efecto-glass" style={{ padding: '16px 24px', minWidth: '150px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-texto-apagado)' }}>Usuarios Totales</span>
                <strong style={{ display: 'block', fontSize: '24px', color: 'var(--color-neon-cian)' }}>1,245</strong>
              </div>
              <div className="efecto-glass" style={{ padding: '16px 24px', minWidth: '150px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-texto-apagado)' }}>Bandas Registradas</span>
                <strong style={{ display: 'block', fontSize: '24px', color: 'var(--color-neon-magenta)' }}>84</strong>
              </div>
              <div className="efecto-glass" style={{ padding: '16px 24px', minWidth: '150px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-texto-apagado)' }}>Tickets Vendidos</span>
                <strong style={{ display: 'block', fontSize: '24px', color: 'var(--color-neon-morado)' }}>4,890</strong>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Nivel no soportado. Por favor, selecciona un rol válido.</div>;
    }
  };

  return (
    <div className="contenedor-principal">
      {/* Cabecera superior premium */}
      <header className="cabecera-app">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Radio size={24} color="var(--color-neon-magenta)" className="efecto-pulso" />
          <h1 style={{ fontSize: '22px', background: 'var(--degradado-neon)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            MALACOPA
          </h1>
          <span style={{
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '2px 6px',
            borderRadius: '4px',
            color: 'var(--color-texto-secundario)',
            marginLeft: '4px'
          }}>
            Backstage v1.0
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Botón flotante del Asistente Bob Bot */}
          <button 
            onClick={() => setShowBobBot(!showBobBot)} 
            className="btn-secundario"
            style={{ 
              borderColor: showBobBot ? 'var(--color-neon-magenta)' : 'var(--color-borde-glass)',
              background: showBobBot ? 'rgba(255, 0, 127, 0.05)' : 'none'
            }}
          >
            💬 Asistente Bob Bot
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', display: 'block' }}>{user.name}</span>
              <span style={{ fontSize: '11px', color: 'var(--color-texto-secundario)' }}>{user.roleName} (Nivel {user.roleLevel})</span>
            </div>
            <button 
              onClick={logout} 
              className="btn-secundario" 
              style={{ padding: '8px', borderRadius: '50%' }}
              title="Cerrar sesión"
            >
              <LogOut size={14} color="var(--color-neon-magenta)" />
            </button>
          </div>
        </div>
      </header>

      {/* Cuerpo principal de la aplicación */}
      <main className="cuerpo-app">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '28px', letterSpacing: '-0.02em' }}>
              Panel de {user.roleName}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-texto-secundario)', marginTop: '4px' }}>
              {NIVELES_MALACOPA[user.roleLevel]?.description}
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '24px',
          alignItems: 'start',
          // Si el chat está abierto y estamos en modo cliente, hacemos un grid de dos columnas
          gridTemplateColumns: (showBobBot && (user.roleLevel === 1 || user.roleLevel === 2)) ? '1fr 350px' : '1fr'
        }}>
          {/* Columna Dashboard */}
          <div>
            {renderDashboardByRole()}
          </div>

          {/* Columna Lateral de Chat con Bob Bot */}
          {showBobBot && (user.roleLevel === 1 || user.roleLevel === 2) && (
            <div style={{ position: 'sticky', top: '90px' }}>
              <BobBot />
            </div>
          )}
        </div>

        {/* Si no estamos en modo cliente pero abrimos a Bob Bot, lo mostramos en un overlay flotante */}
        {showBobBot && !(user.roleLevel === 1 || user.roleLevel === 2) && (
          <div style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '360px',
            zIndex: 999,
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
          }}>
            <BobBot />
          </div>
        )}
      </main>

      {/* Pie de página */}
      <footer style={{
        padding: '24px',
        textAlign: 'center',
        borderTop: '1px solid var(--color-borde-glass)',
        fontSize: '12px',
        color: 'var(--color-texto-apagado)',
        marginTop: 'auto'
      }}>
        <p>Malacopa Entertainment & Backstage System — Open Source Platform</p>
        <p style={{ marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          Desarrollado para Fondo Thoth AC con <Heart size={10} color="var(--color-neon-magenta)" /> en Hermosillo, Sonora.
        </p>
      </footer>

      {/* Control selector de roles para depuración y revisión */}
      <RoleSwitcher />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
