import { useState, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from 'react-leaflet';
import type { LatLngExpression, LatLngTuple } from 'leaflet';
import { Card, Badge } from '@/components/ui';
import type { PainPoint, HeatMapLayer } from '@/models/dataModel';
import { PAIN_POINTS, HERMOSILLO_DISTRICTS } from '@/models/mockData';
import {
  PAIN_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  HERMOSILLO_CENTER
} from '@/models/dataModel';
import 'leaflet/dist/leaflet.css';

// ============================================================
// Custom Hooks
// ============================================================

function MapController({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

// ============================================================
// Pain Points Map Component
// ============================================================

export function PainPointsMap() {
  const [selectedCategories, setSelectedCategories] = useState<PainPoint['category'][]>([
    'security',
    'water',
    'economy',
    'transport',
    'health',
    'education',
    'corruption'
  ]);
  const [intensityThreshold, setIntensityThreshold] = useState(0);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  // Filter pain points based on selections
  const filteredPainPoints = useMemo(() => {
    return PAIN_POINTS.filter(pp => {
      const categoryMatch = selectedCategories.includes(pp.category);
      const intensityMatch = pp.intensity >= intensityThreshold;
      const districtMatch = !selectedDistrict || pp.districtId === selectedDistrict;
      return categoryMatch && intensityMatch && districtMatch;
    });
  }, [selectedCategories, intensityThreshold, selectedDistrict]);

  // Calculate category statistics
  const categoryStats = useMemo(() => {
    return PAIN_CATEGORIES.map(cat => {
      const points = PAIN_POINTS.filter(pp => pp.category === cat);
      const avgIntensity = points.length > 0
        ? points.reduce((sum, pp) => sum + pp.intensity, 0) / points.length
        : 0;
      const maxIntensity = points.length > 0
        ? Math.max(...points.map(pp => pp.intensity))
        : 0;
      return {
        category: cat,
        count: points.length,
        avgIntensity,
        maxIntensity,
        color: CATEGORY_COLORS[cat]
      };
    }).sort((a, b) => b.maxIntensity - a.maxIntensity);
  }, []);

  // Calculate district heat levels
  const districtHeatLevels = useMemo(() => {
    return HERMOSILLO_DISTRICTS.map(district => {
      const districtPoints = PAIN_POINTS.filter(pp => pp.districtId === district.id);
      const avgIntensity = districtPoints.length > 0
        ? districtPoints.reduce((sum, pp) => sum + pp.intensity, 0) / districtPoints.length
        : 0;
      return {
        districtId: district.id,
        districtName: district.name,
        avgIntensity,
        count: districtPoints.length
      };
    }).sort((a, b) => b.avgIntensity - a.avgIntensity);
  }, []);

  const toggleCategory = (category: PainPoint['category']) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Mapa de Puntos de Dolor</h2>
          <p className="text-gray-400">Visualización geoespacial de necesidades ciudadanas</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="danger" className="text-sm px-3 py-1">
            {filteredPainPoints.length} Reportes
          </Badge>
          <Badge variant="success" className="text-sm px-3 py-1">
            Promedio: {Math.round(filteredPainPoints.reduce((s, p) => s + p.intensity, 0) / (filteredPainPoints.length || 1))}%
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Filters Panel */}
        <div className="xl:col-span-1 space-y-4">
          {/* Category Filters */}
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Categorías</h3>
            <div className="space-y-3">
              {categoryStats.map(stat => (
                <button
                  key={stat.category}
                  onClick={() => toggleCategory(stat.category)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                    selectedCategories.includes(stat.category)
                      ? 'bg-white/10 border border-white/20'
                      : 'bg-black/20 hover:bg-black/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stat.color }}
                    />
                    <span className="text-white text-sm">{CATEGORY_LABELS[stat.category]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs">{stat.count}</span>
                    <div
                      className="w-16 h-2 rounded-full bg-gray-700 overflow-hidden"
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${stat.maxIntensity}%`,
                          backgroundColor: stat.color
                        }}
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Intensity Threshold */}
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Intensidad Mínima</h3>
            <input
              type="range"
              min="0"
              max="100"
              value={intensityThreshold}
              onChange={e => setIntensityThreshold(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>0%</span>
              <span className="text-emerald-400 font-semibold">{intensityThreshold}%</span>
              <span>100%</span>
            </div>
          </Card>

          {/* District Filter */}
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Distrito</h3>
            <select
              value={selectedDistrict || ''}
              onChange={e => setSelectedDistrict(e.target.value || null)}
              className="w-full bg-black/30 border border-white/20 rounded-lg p-3 text-white"
            >
              <option value="">Todos los distritos</option>
              {HERMOSILLO_DISTRICTS.map(district => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </Card>

          {/* Heat by District */}
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Ranking de Distritos</h3>
            <div className="space-y-2">
              {districtHeatLevels.slice(0, 5).map((district, index) => (
                <div
                  key={district.districtId}
                  className="p-2 rounded-lg bg-black/20"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400">
                        #{index + 1}
                      </span>
                      <span className="text-white text-sm">{district.districtName}</span>
                    </div>
                    <span className="text-amber-400 font-bold">
                      {Math.round(district.avgIntensity)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500"
                      style={{ width: `${district.avgIntensity}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Map Container */}
        <div className="xl:col-span-3">
          <Card className="overflow-hidden">
            <div className="h-[600px] relative">
              <MapContainer
                center={HERMOSILLO_CENTER as LatLngTuple}
                zoom={13}
                className="h-full w-full"
                style={{ background: '#0f172a' }}
              >
                <MapController center={HERMOSILLO_CENTER as LatLngTuple} zoom={13} />
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">Carto</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Pain Point Markers */}
                {filteredPainPoints.map(pp => (
                  <CircleMarker
                    key={pp.id}
                    center={[pp.coordinates[0], pp.coordinates[1]]}
                    radius={8 + pp.intensity / 15}
                    pathOptions={{
                      color: CATEGORY_COLORS[pp.category],
                      fillColor: CATEGORY_COLORS[pp.category],
                      fillOpacity: 0.6,
                      weight: 2
                    }}
                  >
                    <Popup>
                      <div className="text-gray-900 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="px-2 py-1 rounded text-white text-xs"
                            style={{ backgroundColor: CATEGORY_COLORS[pp.category] }}
                          >
                            {CATEGORY_LABELS[pp.category]}
                          </span>
                          <span className="font-bold">{pp.intensity}%</span>
                        </div>
                        <p className="text-sm mb-2">{pp.description}</p>
                        <div className="text-xs text-gray-500">
                          <p>Fuente: {pp.source.replace('_', ' ')}</p>
                          <p>{pp.timestamp.toLocaleDateString('es-MX')}</p>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>

              {/* Map Legend */}
              <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-xl rounded-lg p-4 z-[1000]">
                <h4 className="text-white text-sm font-semibold mb-3">Leyenda</h4>
                <div className="space-y-2">
                  {PAIN_CATEGORIES.map(cat => (
                    <div key={cat} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                      />
                      <span className="text-gray-300 text-xs">{CATEGORY_LABELS[cat]}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-white/20">
                  <p className="text-gray-400 text-xs">Tamaño = Intensidad</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Pain Points List */}
          <Card className="mt-6 p-5">
            <h3 className="text-lg font-semibold text-white mb-4">
              Detalle de Reportes ({filteredPainPoints.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPainPoints.map(pp => (
                <div
                  key={pp.id}
                  className="p-4 rounded-lg bg-black/20 border border-white/10 hover:border-emerald-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[pp.category] }}
                      />
                      <span className="text-white font-medium">
                        {CATEGORY_LABELS[pp.category]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          pp.intensity >= 80
                            ? 'bg-red-500/20 text-red-400'
                            : pp.intensity >= 60
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {pp.intensity}%
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{pp.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{pp.source.replace('_', ' ')}</span>
                    <span>{pp.timestamp.toLocaleDateString('es-MX')}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PainPointsMap;