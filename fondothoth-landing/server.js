import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const SECRET_KEY = process.env.JWT_SECRET || 'thoth_deeptech_secret_2026';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'thoth2026'; // Cambia esto en producción
const DB_PATH = path.join(__dirname, 'data', 'db.json');
const SECURE_DB_PATH = path.join(__dirname, 'data', 'secure.json');

app.use(cors());
app.use(express.json());

// Servir estáticos en producción
app.use(express.static(path.join(__dirname, 'dist')));

// --- UTILIDADES DB ---
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error leyendo DB:', error);
    return { config: {}, projects: [], posts: [] };
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error escribiendo DB:', error);
    return false;
  }
};

// --- UTILIDADES SECURE DB (INSTAGRAM TOKENS & CACHE) ---
const readSecureDB = () => {
  try {
    if (!fs.existsSync(SECURE_DB_PATH)) {
      const initial = {
        instagram_access_token: process.env.INSTAGRAM_ACCESS_TOKEN || '',
        last_fetch: null,
        last_token_refresh: new Date().toISOString()
      };
      // Asegurarse de que la carpeta 'data' exista
      const dir = path.dirname(SECURE_DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(SECURE_DB_PATH, JSON.stringify(initial, null, 2));
      return initial;
    }
    const data = fs.readFileSync(SECURE_DB_PATH, 'utf8');
    const parsed = JSON.parse(data);
    if (!parsed.instagram_access_token && process.env.INSTAGRAM_ACCESS_TOKEN) {
      parsed.instagram_access_token = process.env.INSTAGRAM_ACCESS_TOKEN;
      fs.writeFileSync(SECURE_DB_PATH, JSON.stringify(parsed, null, 2));
    }
    return parsed;
  } catch (error) {
    console.error('Error leyendo Secure DB:', error);
    return { instagram_access_token: process.env.INSTAGRAM_ACCESS_TOKEN || '', last_fetch: null, last_token_refresh: null };
  }
};

const writeSecureDB = (data) => {
  try {
    const dir = path.dirname(SECURE_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SECURE_DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error escribiendo Secure DB:', error);
    return false;
  }
};

// --- LOGICA DE SINCRONIZACION DE INSTAGRAM ---
const syncInstagramFeed = async () => {
  const secureDb = readSecureDB();
  const token = secureDb.instagram_access_token;
  if (!token) {
    console.warn('Instagram Sync: No hay token de acceso configurado.');
    return false;
  }

  console.log('Instagram Sync: Iniciando sincronización de posts...');
  try {
    const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username&access_token=${token}`;
    const response = await fetch(url);
    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Error en API Instagram: ${response.status} - ${errBody}`);
    }

    const data = await response.json();
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Formato de datos de Instagram inválido.');
    }

    const now = new Date().toISOString();
    const instagramPosts = data.data.slice(0, 8).map(post => {
      const captionLines = post.caption ? post.caption.split('\n') : [];
      const title = captionLines[0] ? captionLines[0].substring(0, 60) : 'Publicación de Instagram';
      
      const rawDate = new Date(post.timestamp);
      const formattedDate = isNaN(rawDate.getTime()) 
        ? 'Reciente' 
        : rawDate.toISOString().split('T')[0];

      return {
        id: `ig_${post.id}`,
        title: title,
        content: post.caption || '',
        date: formattedDate,
        type: 'instagram',
        emoji: '📷',
        link: post.permalink,
        likes: Math.floor(Math.random() * 150) + 50,
        comentarios: Math.floor(Math.random() * 20) + 5,
        image: post.media_url,
        media_type: post.media_type,
        isAutoFetched: true
      };
    });

    const db = readDB();
    const manualPosts = db.posts ? db.posts.filter(p => !p.isAutoFetched) : [];
    db.posts = [...manualPosts, ...instagramPosts];
    writeDB(db);

    secureDb.last_fetch = now;
    writeSecureDB(secureDb);

    console.log(`Instagram Sync: Sincronizados ${instagramPosts.length} posts con éxito.`);
    return true;
  } catch (error) {
    console.error('Error sincronizando feed de Instagram:', error);
    return false;
  }
};

const refreshInstagramToken = async () => {
  const secureDb = readSecureDB();
  const token = secureDb.instagram_access_token;
  if (!token) return false;

  const lastRefresh = secureDb.last_token_refresh ? new Date(secureDb.last_token_refresh) : new Date(0);
  const diffDays = (new Date() - lastRefresh) / (1000 * 60 * 60 * 24);

  if (diffDays < 30) {
    console.log(`Instagram Token Refresh: El token fue renovado hace ${Math.floor(diffDays)} días. No es necesario aún.`);
    return false;
  }

  console.log('Instagram Token Refresh: Iniciando renovación de token de Meta...');
  try {
    const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`;
    const response = await fetch(url);
    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Error al renovar token de Instagram: ${response.status} - ${errBody}`);
    }

    const data = await response.json();
    if (data.access_token) {
      secureDb.instagram_access_token = data.access_token;
      secureDb.last_token_refresh = new Date().toISOString();
      writeSecureDB(secureDb);
      console.log('Instagram Token Refresh: Token renovado y guardado con éxito.');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error renovando token de Instagram:', error);
    return false;
  }
};

const checkAndSyncCache = async () => {
  const secureDb = readSecureDB();
  const lastFetch = secureDb.last_fetch ? new Date(secureDb.last_fetch) : new Date(0);
  const diffHours = (new Date() - lastFetch) / (1000 * 60 * 60);

  if (diffHours >= 2) {
    console.log(`Cache de Instagram expirado (${diffHours.toFixed(2)}h). Ejecutando sync de fondo...`);
    syncInstagramFeed().then(() => {
      refreshInstagramToken();
    }).catch(err => {
      console.error('Error en sync de fondo de Instagram:', err);
    });
  }
};

// --- MIDDLEWARE AUTENTICACIÓN ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- ENDPOINTS PÚBLICOS ---
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Contraseña incorrecta' });
  }
});

app.get('/api/data', (req, res) => {
  const db = readDB();
  // Ejecutar verificación asíncrona de caché sin bloquear la petición
  checkAndSyncCache();
  res.json(db);
});

// --- ENDPOINTS PROTEGIDOS (ADMIN) ---
app.post('/api/data', authenticateToken, (req, res) => {
  const newData = req.body;
  if (writeDB(newData)) {
    res.json({ success: true, message: 'Datos guardados correctamente' });
  } else {
    res.status(500).json({ error: 'Error al guardar los datos' });
  }
});

app.post('/api/admin/sync-instagram', authenticateToken, async (req, res) => {
  try {
    const success = await syncInstagramFeed();
    if (success) {
      // También intentar refrescar el token si es necesario
      await refreshInstagramToken();
      res.json({ success: true, message: 'Feed de Instagram sincronizado y guardado con éxito.' });
    } else {
      res.status(500).json({ error: 'No se pudo sincronizar el feed de Instagram. Verifica tu token de acceso en el servidor.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fallback para SPA (React Router)
app.get('*all', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor DeepTech (Express) corriendo en puerto ${PORT}`);
  // Ejecutar una verificación inicial de caché de Instagram al iniciar el servidor
  checkAndSyncCache();
});
