import { useEffect, useState, useCallback, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  ZoomControl,
  useMap,
  LayersControl,
  LayerGroup
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Flame,
  TrendingUp,
  DollarSign,
  Briefcase,
  ChevronDown,
  Layers,
  Crosshair,
  BarChart3,
  ShieldAlert
} from 'lucide-react';
import './mapa-georeferenciado.css';

/* ───────────────────────────────────────────────
   CívicaOS Engine — Mapa Georeferenciado de Dolores
   React 18.2 + react-leaflet + Glassmorphic/Neón UI
   Reemplaza estrellas/hexágonos por POLÍGONOS REALES
   del INE (Secciones Electorales) servidos vía GeoJSON.
   ─────────────────────────────────────────────── */

const CIUDADES = [
  { id: 'hermosillo', nombre: 'Hermosillo', estado: '26', lat: 29.0729, lon: -110.9559, zoom: 12 },
  { id: 'tijuana',    nombre: 'Tijuana',    estado: '02', lat: 32.5149, lon: -117.0382, zoom: 12 },
  { id: 'monterrey',  nombre: 'Monterrey',  estado: '19', lat: 25.6866, lon: -100.3161, zoom: 12 },
  { id: 'cdmx',       nombre: 'CDMX',       estado: '09', lat: 19.4326, lon: -99.1332,  zoom: 11 },
  { id: 'guadalajara',nombre: 'Guadalajara',estado: '14', lat: 20.6597, lon: -103.3496, zoom: 12 },
  { id: 'queretaro',  nombre: 'Querétaro',  estado: '22', lat: 20.5888, lon: -100.3899, zoom: 12 },
];

const CAPAS_CALOR = [
  { id: 'tension_social',   nombre: '🔥 Tensión Social General', campo: 'indice_dolor' },
  { id: 'poblacional',      nombre: '👥 Densidad Poblacional',   campo: 'poblacion' },
  { id: 'electoral',        nombre: '🗳️ Críticidad Electoral',   campo: 'lista_nominal' },
  { id: 'economica',        nombre: '💰 Vulnerabilidad Económica', campo: 'indice_economico' },
];

/* Paleta neón para los polígonos */
function getNeonColor(valor, max = 100) {
  const pct = Math.min(Math.max(valor / max, 0), 1);
  if (pct > 0.80) return '#ef4444'; // rojo intenso
  if (pct > 0.60) return '#f59e0b'; // naranja neón
  if (pct > 0.40) return '#a855f7'; // morado neón
  if (pct > 0.20) return '#10b981'; // verde neón
  return '#3b82f6';                    // azul eléctrico
}

function getNeonFill(valor, max = 100) {
  const color = getNeonColor(valor, max);
  return { color, fillColor: color, fillOpacity: 0.35, weight: 2, opacity: 0.9 };
}

/* Controlador de vista: flyTo ciudad */
function VistaController({ ciudad }) {
  const map = useMap();
  useEffect(() => {
    if (ciudad) {
      map.flyTo([ciudad.lat, ciudad.lon], ciudad.zoom, { duration: 1.5 });
    }
  }, [ciudad, map]);
  return null;
}

/* Capa de polígonos reales del INE */
function CapaSecciones({ data, capaActiva, onSeccionClick }) {
  const geoJsonRef = useRef(null);

  const onEachFeature = useCallback((feature, layer) => {
    const props = feature.properties || {};
    const valor = props[capaActiva.campo] || 0;
    const color = getNeonColor(valor);

    layer.bindPopup(`
      <div class="civica-popup glass">
        <header class="popup-header" style="border-color:${color}">
          <ShieldAlert size="16" />
          <span>Sección Electoral ${props.seccion || 'N/D'}</span>
        </header>
        <div class="popup-body">
          <div class="popup-row"><span>Distrito:</span><b>${props.distrito || '—'}</b></div>
          <div class="popup-row"><span>Población:</span><b>${(props.poblacion || 0).toLocaleString()}</b></div>
          <div class="popup-row"><span>Lista nominal:</span><b>${(props.lista_nominal || 0).toLocaleString()}</b></div>
          <div class="popup-row"><span>CP:</span><b>${props.cp || '—'}</b></div>
          <div class="popup-row"><span>Índice ${capaActiva.nombre}:</span>
            <b style="color:${color}">${valor.toFixed(1)}%</b>
          </div>
        </div>
        <div class="popup-footer" style="background:${color}22">
          Click para zoom a sección
        </div>
      </div>
    `, { className: 'civica-popup-wrapper', closeButton: false });

    layer.on({
      click: () => {
        if (onSeccionClick) onSeccionClick(feature, layer);
      },
      mouseover: (e) => {
        const lyr = e.target;
        lyr.setStyle({ weight: 4, fillOpacity: 0.55, opacity: 1 });
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) lyr.bringToFront();
      },
      mouseout: (e) => {
        const lyr = e.target;
        lyr.setStyle(getNeonFill(props[capaActiva.campo] || 0));
        geoJsonRef.current?.resetStyle(lyr);
      }
    });
  }, [capaActiva, onSeccionClick]);

  const styleFeature = useCallback((feature) => {
    const v = feature.properties?.[capaActiva.campo] || 0;
    return getNeonFill(v);
  }, [capaActiva]);

  if (!data) return null;
  return (
    <GeoJSON
      ref={geoJsonRef}
      data={data}
      style={styleFeature}
      onEachFeature={onEachFeature}
    />
  );
}

/* Leyenda flotante */
function LeyendaNeon({ capaActiva }) {
  return (
    <div className="leyenda-neon glass">
      <div className="leyenda-title"><BarChart3 size="14" /> {capaActiva.nombre}</div>
      <div className="leyenda-scale">
        <span style={{ background: '#ef4444' }}>80%+</span>
        <span style={{ background: '#f59e0b' }}>60%</span>
        <span style={{ background: '#a855f7' }}>40%</span>
        <span style={{ background: '#10b981' }}>20%</span>
        <span style={{ background: '#3b82f6' }}>0%</span>
      </div>
    </div>
  );
}

/* ─── COMPONENTE PRINCIPAL ─── */
export default function MapaGeoreferenciado() {
  const [ciudadActiva, setCiudadActiva] = useState(CIUDADES[3]); // CDMX default
  const [capaActiva, setCapaActiva] = useState(CAPAS_CALOR[0]);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [indicadores, setIndicadores] = useState({
    inflacion: '4.12%',
    usd: '$18.42',
    minWage: '$248.93'
  });

  /* Carga polígonos reales desde tu API */
  useEffect(() => {
    let cancelled = false;
    async function cargar() {
      setLoading(true);
      try {
        // TODO: reemplaza por tu dominio real
        const res = await fetch(
          `/api/secciones?estado=${ciudadActiva.estado}&ciudad=${ciudadActiva.id}`
        );
        if (!res.ok) throw new Error('Error cargando secciones');
        const data = await res.json();
        if (!cancelled) setGeoJsonData(data);
      } catch (err) {
        console.warn('Fallback: usando datos mock hasta que PostGIS esté listo', err);
        // Datos mock mientras no tengas PostGIS (eliminar después)
        if (!cancelled) setGeoJsonData(generarMock(ciudadActiva));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    cargar();
    return () => { cancelled = true; };
  }, [ciudadActiva]);

  const handleSeccionClick = useCallback((feature, layer) => {
    // Zoom preciso a los límites reales del polígono INE
    const map = layer._map;
    map.fitBounds(layer.getBounds(), { padding: [40, 40], maxZoom: 16, animate: true, duration: 1.2 });
  }, []);

  return (
    <div className="civica-map-container">
      {/* ── HEADER ── */}
      <header className="map-header glass">
        <div className="header-left">
          <h1><MapPin className="header-icon" /> Mapa Georeferenciado de Dolores</h1>
          <p>Visualizando capas de calor de insatisfacción ciudadana con polígonos reales INE</p>
        </div>
        <div className="header-right">
          <span className="badge global"><Crosshair size="12" /> Global</span>
          <span className="badge gemelo">Gemelo Digital Activo</span>
        </div>
      </header>

      {/* ── BARRA DE CONTROLES ── */}
      <div className="map-toolbar glass">
        {/* Selector de Ciudad */}
        <div className="toolbar-group">
          <span className="toolbar-label"><MapPin size="14" /> IR A CIUDAD:</span>
          {CIUDADES.map(c => (
            <button
              key={c.id}
              className={`ciudad-pill ${ciudadActiva.id === c.id ? 'active' : ''}`}
              onClick={() => setCiudadActiva(c)}
            >
              {c.nombre}
            </button>
          ))}
        </div>

        {/* Selector de Capa */}
        <div className="toolbar-group">
          <span className="toolbar-label"><Layers size="14" /> CAPA DE CALOR:</span>
          <div className="dropdown-capas">
            <button className="capa-btn">
              {capaActiva.nombre} <ChevronDown size="14" />
            </button>
            <div className="dropdown-menu glass">
              {CAPAS_CALOR.map(c => (
                <div
                  key={c.id}
                  className={`dropdown-item ${capaActiva.id === c.id ? 'active' : ''}`}
                  onClick={() => setCapaActiva(c)}
                >
                  {c.nombre}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Indicadores Banxico */}
        <div className="toolbar-indicadores">
          <span className="ind-badge"><TrendingUp size="12" /> INFLACIÓN: {indicadores.inflacion}</span>
          <span className="ind-badge"><DollarSign size="12" /> USD/MXN: {indicadores.usd}</span>
          <span className="ind-badge"><Briefcase size="12" /> MIN. WAGE: {indicadores.minWage}</span>
        </div>
      </div>

      {/* ── MAPA ── */}
      <div className="map-wrapper">
        <MapContainer
          center={[ciudadActiva.lat, ciudadActiva.lon]}
          zoom={ciudadActiva.zoom}
          zoomControl={false}
          className="civica-leaflet-map"
        >
          <ZoomControl position="topright" />
          <VistaController ciudad={ciudadActiva} />

          {/* Fondo CARTO (oscuro/neutro) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          />

          {/* Capas de control */}
          <LayersControl position="topright">
            <LayersControl.Overlay checked name="Polígonos INE (Secciones)">
              <LayerGroup>
                <CapaSecciones
                  data={geoJsonData}
                  capaActiva={capaActiva}
                  onSeccionClick={handleSeccionClick}
                />
              </LayerGroup>
            </LayersControl.Overlay>

            <LayersControl.Overlay name="Calles / Vialidad">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                opacity={0.3}
              />
            </LayersControl.Overlay>
          </LayersControl>
        </MapContainer>

        {/* Leyenda flotante */}
        <LeyendaNeon capaActiva={capaActiva} />

        {/* Loading */}
        {loading && (
          <div className="map-loading glass">
            <Flame className="spin" size="24" />
            <span>Cargando polígonos reales del INE…</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── MOCK TEMPORAL (borrar cuando PostGIS esté listo) ─── */
function generarMock(ciudad) {
  // Genera un hexágono aproximado alrededor de la ciudad como placeholder
  const { lat, lon } = ciudad;
  const d = 0.04;
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { seccion: '0001', distrito: 'I', poblacion: 45200, lista_nominal: 28900, cp: '44100', indice_dolor: 72, indice_economico: 45 },
        geometry: { type: 'Polygon', coordinates: [[[lon-d, lat], [lon-d/2, lat+d], [lon+d/2, lat+d], [lon+d, lat], [lon+d/2, lat-d], [lon-d/2, lat-d], [lon-d, lat]]] }
      },
      {
        type: 'Feature',
        properties: { seccion: '0002', distrito: 'II', poblacion: 38100, lista_nominal: 21000, cp: '44110', indice_dolor: 35, indice_economico: 22 },
        geometry: { type: 'Polygon', coordinates: [[[lon+d, lat], [lon+1.5*d, lat+d], [lon+2.5*d, lat+d], [lon+3*d, lat], [lon+2.5*d, lat-d], [lon+1.5*d, lat-d], [lon+d, lat]]] }
      }
    ]
  };
}
