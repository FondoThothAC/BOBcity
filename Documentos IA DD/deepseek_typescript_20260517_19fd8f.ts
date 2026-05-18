// /src/components/PainPointsMap.real.tsx
import { MapContainer, TileLayer, GeoJSON, HeatmapLayer } from 'react-leaflet';
import { useEffect, useState } from 'react';

interface PainPointLayer {
  tipo: 'seguridad' | 'agua' | 'transporte' | 'economia' | 'educacion' | 'salud';
  intensidad: number; // 0-100, calculado desde encuestas y NLP
  geometria: GeoJSON.FeatureCollection;
}

export function PainPointsMap() {
  const [capas, setCapas] = useState<PainPointLayer[]>([]);

  useEffect(() => {
    // Carga capas preprocesadas desde API local (nunca externa)
    fetch('/api/gis/pain-points?distrito=D8')
      .then(res => res.json())
      .then(setCapas);
  }, []);

  return (
    <MapContainer center={[29.0892, -110.9613]} zoom={12}>
      {/* Capa base: Marco Geoestadístico INEGI */}
      <TileLayer url="/api/gis/tiles/{z}/{x}/{y}.pbf" />
      
      {/* Capas de dolor ciudadano */}
      {capas.map(capa => (
        <HeatmapLayer
          key={capa.tipo}
          data={capa.geometria}
          intensity={capa.intensidad}
          gradient={{ 0.0: 'green', 0.5: 'yellow', 1.0: 'red' }}
        />
      ))}
    </MapContainer>
  );
}