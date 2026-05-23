/* ============================================================================
   Malacopa - Contexto de Autenticación y Niveles (React)
   ============================================================================
   Gestiona la sesión simulada del usuario, su rol y el nivel de acceso (1-6)
   con persistencia local en el navegador para facilitar el desarrollo.
   ============================================================================ */

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Permisos y configuraciones por defecto para los 6 niveles de Malacopa
export const NIVELES_MALACOPA = {
  1: { level: 1, name: 'Invitado', description: 'Exploración de carteleras, venues y catálogo de artistas.' },
  2: { level: 2, name: 'Cliente / Fan', description: 'Compra de boletos, reseñas de eventos y cotizaciones.' },
  3: { level: 3, name: 'Colaborador / Músico', description: 'Acceso a itinerarios, setlists de canciones y locaciones.' },
  4: { level: 4, name: 'Artista / Banda', description: 'Gestión de shows, playlist, músicos y disponibilidad.' },
  5: { level: 5, name: 'Manager / Empresario', description: 'Dashboard financiero NIF B-3/B-2, contratos y comisiones.' },
  6: { level: 6, name: 'Administrador', description: 'Control de la plataforma, logs y soporte técnico.' }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario inicial desde localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('malacopa_usuario');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // Invitado por defecto
        const defaultUser = {
          uid: 'invitado_temp',
          name: 'Visitante del Entretenimiento',
          email: 'invitado@malacopa.com',
          roleLevel: 1,
          roleName: 'Invitado'
        };
        setUser(defaultUser);
        localStorage.setItem('malacopa_usuario', JSON.stringify(defaultUser));
      }
    } catch (e) {
      console.error('Error al inicializar sesión en localStorage:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cambiar rol para pruebas rápidas
  const cambiarNivelRol = (level) => {
    const levelKey = parseInt(level, 10);
    const nivelMeta = NIVELES_MALACOPA[levelKey] || NIVELES_MALACOPA[1];
    
    const newUser = {
      uid: levelKey === 1 ? 'invitado_temp' : `user_lvl_${levelKey}`,
      name: `Usuario Nivel ${levelKey} (${nivelMeta.name})`,
      email: `${nivelMeta.name.toLowerCase().replace(/\s/g, '')}@malacopa.com`,
      roleLevel: levelKey,
      roleName: nivelMeta.name
    };
    
    setUser(newUser);
    localStorage.setItem('malacopa_usuario', JSON.stringify(newUser));
  };

  const loginCustom = (email, name, level) => {
    const levelKey = parseInt(level, 10);
    const nivelMeta = NIVELES_MALACOPA[levelKey] || NIVELES_MALACOPA[1];
    const loggedUser = {
      uid: `custom_user_${Date.now()}`,
      name: name || 'Usuario Custom',
      email: email || 'usuario@malacopa.com',
      roleLevel: levelKey,
      roleName: nivelMeta.name
    };
    setUser(loggedUser);
    localStorage.setItem('malacopa_usuario', JSON.stringify(loggedUser));
  };

  const logout = () => {
    const defaultUser = {
      uid: 'invitado_temp',
      name: 'Visitante del Entretenimiento',
      email: 'invitado@malacopa.com',
      roleLevel: 1,
      roleName: 'Invitado'
    };
    setUser(defaultUser);
    localStorage.setItem('malacopa_usuario', JSON.stringify(defaultUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, cambiarNivelRol, loginCustom, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
