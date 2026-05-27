import React, { useMemo } from "react";
import { GeoJSON } from "react-leaflet";

/**
 * Capa GeoJSON atómica con estilo dinámico por severidad y hover premium (UXDD §4.2).
 * Acepta tanto polígonos de estados como de municipios.
 */
export function GeoBoundaryLayer({ data, onFeatureClick, selectedId, severityKey = "severity" }) {
  const style = useMemo(() => (feature) => {
    const sev = feature.properties?.[severityKey] ?? 0;
    const isSelected = feature.properties?.id === selectedId ||
                       feature.properties?.name === selectedId;
    // Escala cromática: cian → ámbar → coral
    const hue = Math.max(0, 188 - sev * 1.88);
    return {
      fillColor: `hsl(${hue}, 80%, 50%)`,
      fillOpacity: 0.25 + (sev / 300),
      color: isSelected ? "#10b981" : "rgba(255,255,255,0.25)",
      weight: isSelected ? 3 : 1.2,
      className: "geo-boundary",
    };
  }, [selectedId, severityKey]);

  const onEachFeature = (feature, layer) => {
    const p = feature.properties || {};
    layer.bindTooltip(`<strong>${p.name || "—"}</strong>${p.state ? ` · ${p.state}` : ""}`, {
      sticky: true, direction: "top", className: "geo-tooltip",
    });
    layer.on({
      click: () => onFeatureClick?.(p),
      mouseover: (e) => e.target.setStyle({ weight: 3, color: "#22d3ee" }),
      mouseout: (e) => layer.resetStyle(e.target),
    });
  };

  if (!data) return null;
  return <GeoJSON key={selectedId || "base"} data={data} style={style} onEachFeature={onEachFeature} />;
}
