import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { HERMOSILLO_DISTRICTS } from '../models/dataModel';
import { Filter, Droplet, Shield, Landmark, Flame } from 'lucide-react';

export default function PainPointsMap({ agents }) {
  const [activeLayer, setActiveLayer] = useState("ALL_PAIN"); // ALL_PAIN, WATER, SECURITY, TAX
  const [activeSector, setActiveSector] = useState("ALL_SECTORS"); // ALL_SECTORS, jovenes, comerciantes, asalariados

  // Hermosillo center coordinate
  const hermosilloCenter = [29.075, -110.968];

  // Función para calcular métricas por distrito basadas en los agentes simulados
  const getDistrictStats = (districtId) => {
    const districtAgents = agents.filter(a => a.districtId === districtId);
    const filteredAgents = activeSector === "ALL_SECTORS" 
      ? districtAgents 
      : districtAgents.filter(a => a.sector === activeSector);

    if (filteredAgents.length === 0) return { avgHappiness: 50, complaintCount: 0 };

    const avgHappiness = Math.round(filteredAgents.reduce((acc, curr) => acc + curr.happiness, 0) / filteredAgents.length);
    
    // Contar quejas de forma simulada basadas en la felicidad
    const complaintCount = filteredAgents.filter(a => a.happiness < 45).length * 8; 

    return { avgHappiness, complaintCount };
  };

  // Determinar color del marcador según felicidad del distrito
  const getMarkerColor = (happiness) => {
    if (happiness > 60) return "var(--neon-emerald)";
    if (happiness > 45) return "var(--neon-blue)";
    return "var(--neon-rose)";
  };

  return (
    <div style={{ position: 'relative' }}>
      
      {/* Selector de Filtros de Capas sobre el mapa (Glass Overlay) */}
      <div className="map-overlay-controls">
        
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.85)', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', backdropFilter: 'blur(8px)' }}>
          <select 
            className="overlay-select" 
            value={activeLayer}
            onChange={(e) => setActiveLayer(e.target.value)}
          >
            <option value="ALL_PAIN">🔥 Tensión Social General</option>
            <option value="WATER">💧 Puntos de Dolor: Agua</option>
            <option value="SECURITY">🛡️ Puntos de Dolor: Seguridad</option>
            <option value="TAX">💼 Puntos de Dolor: Impuestos</option>
          </select>

          <select 
            className="overlay-select"
            value={activeSector}
            onChange={(e) => setActiveSector(e.target.value)}
          >
            <option value="ALL_SECTORS">👥 Todos los Sectores</option>
            <option value="jovenes">🎓 Jóvenes (Gig Economy)</option>
            <option value="comerciantes">🏬 Pequeños Comerciantes</option>
            <option value="asalariados">🏭 Hogares Asalariados</option>
          </select>
        </div>

      </div>

      {/* Grid del Mapa y Panel Lateral de Datos */}
      <div className="workspace-grid-2">
        
        {/* Contenedor del Mapa GIS */}
        <div className="glass-card" style={{ padding: '0.5rem' }}>
          <div className="map-container">
            <MapContainer 
              center={hermosilloCenter} 
              zoom={12} 
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              {/* Capa de mosaico oscuro de CartoDB (perfecto para estética Dark Mode) */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />

              {/* Renderizar los marcadores para cada distrito de Hermosillo */}
              {Object.values(HERMOSILLO_DISTRICTS).map((district) => {
                const stats = getDistrictStats(district.id);
                const markerColor = getMarkerColor(stats.avgHappiness);

                return (
                  <CircleMarker
                    key={district.id}
                    center={district.coords}
                    radius={18 + stats.complaintCount / 10} // Radio aumenta según cantidad de quejas
                    fillColor={markerColor}
                    color={markerColor}
                    weight={2}
                    fillOpacity={0.4}
                  >
                    <Popup>
                      <div style={{ minWidth: '220px', fontFamily: 'Inter, sans-serif' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {district.name}
                        </h3>
                        
                        <div className="info-list" style={{ marginTop: '0.5rem' }}>
                          <div className="info-row">
                            <span>Ingreso Promedio</span>
                            <span>${district.averageIncome.toLocaleString()} MXN</span>
                          </div>
                          <div className="info-row">
                            <span>Felicidad Cívica</span>
                            <span style={{ color: markerColor }}>{stats.avgHappiness}%</span>
                          </div>
                          <div className="info-row">
                            <span>Quejas Reportadas</span>
                            <span style={{ color: 'var(--neon-rose)' }}>{stats.complaintCount} incidentes</span>
                          </div>
                        </div>

                        <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          * Datos sintéticos calibrados con tandeos de agua e incidencia delictiva local de Hermosillo.
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Panel Lateral de Resumen de Dolores */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={18} color="var(--neon-blue)" />
              Diagnóstico Territorial
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Analizando Hermosillo, Sonora. Se visualizan las quejas y el clima de descontento agrupado espacialmente.
            </p>

            <div className="info-list">
              <div className="info-row">
                <span>Distrito Activo</span>
                <span>Hermosillo Completo</span>
              </div>
              <div className="info-row">
                <span>Capa de Dolor</span>
                <span>
                  {activeLayer === "ALL_PAIN" && "Tensión Social General"}
                  {activeLayer === "WATER" && "💧 Problemas de Agua"}
                  {activeLayer === "SECURITY" && "🛡️ Inseguridad"}
                  {activeLayer === "TAX" && "💼 Regulación fiscal"}
                </span>
              </div>
              <div className="info-row">
                <span>Sector Filtrado</span>
                <span style={{ textTransform: 'capitalize' }}>
                  {activeSector === "ALL_SECTORS" ? "Todos los Sectores" : activeSector}
                </span>
              </div>
            </div>
          </div>

          {/* Tarjeta de Dolores Críticos Específicos por Zona */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Zonas de Máxima Tensión</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--neon-rose)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifycontent: 'center', flexShrink: 0 }}>
                  <Droplet size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '700' }}>Distrito 8: Crisis Hídrica</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Falta de presión en red urbana (Palo Verde).</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--neon-amber)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifycontent: 'center', flexShrink: 0 }}>
                  <Shield size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '700' }}>Distrito 9: Robos al Comercio</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Incidencia en locales pequeños del Centro.</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--neon-purple)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifycontent: 'center', flexShrink: 0 }}>
                  <Flame size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '700' }}>Distrito 6: Tensión de Transporte</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Quejas de jóvenes por baja frecuencia de rutas.</p>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
