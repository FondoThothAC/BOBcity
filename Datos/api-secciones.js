// api/secciones.js  —  Endpoint Express para servir GeoJSON del INE
// CívicaOS Engine

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || 'civicaos',
  user: process.env.PGUSER || 'civica',
  password: process.env.PGPASSWORD || 'civica123',
});

/**
 * GET /api/secciones?estado=14&ciudad=guadalajara
 * Devuelve FeatureCollection GeoJSON con polígonos reales del INE.
 */
async function getSecciones(req, res) {
  const { estado, ciudad } = req.query;

  if (!estado) {
    return res.status(400).json({ error: 'Parámetro "estado" requerido (ej: 14 para Jalisco)' });
  }

  try {
    const query = `
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', COALESCE(jsonb_agg(feature), '[]'::jsonb)
      ) AS geojson
      FROM (
        SELECT jsonb_build_object(
          'type', 'Feature',
          'geometry', ST_AsGeoJSON(geom)::jsonb,
          'properties', jsonb_build_object(
            'seccion', id_seccion,
            'distrito', distrito,
            'estado', estado,
            'municipio', municipio,
            'poblacion', COALESCE(poblacion_total, 0),
            'lista_nominal', COALESCE(lista_nominal, 0),
            'cp', COALESCE(codigo_postal, ''),
            'indice_dolor', COALESCE(indice_dolor, 0),
            'indice_economico', COALESCE(indice_economico, 0)
          )
        ) AS feature
        FROM secciones_electorales
        WHERE estado = $1
          AND ($2::text IS NULL OR municipio = $2)
      ) features;
    `;

    const result = await pool.query(query, [estado.padStart(2, '0'), ciudad || null]);
    const geojson = result.rows[0]?.geojson || { type: 'FeatureCollection', features: [] };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=300'); // cache 5 min
    res.json(geojson);

  } catch (err) {
    console.error('[PostGIS Error]', err);
    res.status(500).json({ error: 'Error consultando polígonos', detail: err.message });
  }
}

module.exports = { getSecciones };

/* ─── En tu server principal (app.js / index.js) ───
const express = require('express');
const { getSecciones } = require('./api/secciones');
const app = express();

app.get('/api/secciones', getSecciones);

// Opcional: endpoint para actualizar indicadores desde Banxico
app.get('/api/indicadores', async (req, res) => {
  // Integra aquí tu clave Banxico para inflación/USD/salario
  res.json({ inflacion: '4.12%', usd: 18.42, minWage: 248.93 });
});
*/
