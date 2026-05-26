// Servicio para comunicarse con el backend local

export const fetchPublicData = async () => {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('Error de red');
    return await res.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

export const loginAdmin = async (password) => {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    
    if (!res.ok) {
      throw new Error('Contraseña incorrecta');
    }
    
    const data = await res.json();
    return data.token;
  } catch (error) {
    console.error('Error en login:', error);
    return null;
  }
};

export const saveAdminData = async (data, token) => {
  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
         throw new Error('Sesión expirada o token inválido');
      }
      throw new Error('Error al guardar datos');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error guardando datos:', error);
    throw error;
  }
};
