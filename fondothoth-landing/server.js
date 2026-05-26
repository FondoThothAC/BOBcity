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

// Fallback para SPA (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor DeepTech (Express) corriendo en puerto ${PORT}`);
});
