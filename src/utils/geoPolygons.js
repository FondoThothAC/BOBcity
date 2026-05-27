/**
 * Genera un polígono orgánico de N lados alrededor de un centroide.
 * Usa una semilla determinista para jitter reproducible (evita parpadeo entre renders).
 */
export function getInterlockingPolygon(center, sides = 14, baseRadius = 0.08, seed = 1) {
  if (!Array.isArray(center) || center.length !== 2) {
    throw new TypeError("center debe ser [lat, lng]");
  }
  const [lat, lng] = center;
  // PRNG determinista (mulberry32)
  let t = seed >>> 0;
  const rand = () => {
    t = (t + 0x6D2B79F5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };

  const ring = [];
  for (let i = 0; i < sides; i++) {
    const angle = (2 * Math.PI * i) / sides;
    const jitter = 0.7 + rand() * 0.6; // radio varía ±30%
    const r = baseRadius * jitter;
    // Corrección por latitud para que se vea circular en proyección Mercator
    const dLng = (r * Math.cos(angle)) / Math.cos((lat * Math.PI) / 180);
    const dLat = r * Math.sin(angle);
    ring.push([lng + dLng, lat + dLat]);
  }
  ring.push(ring[0]); // cierre
  return ring;
}

/**
 * Convierte un array de municipios en FeatureCollection GeoJSON.
 */
export function municipalitiesToGeoJSON(municipalities) {
  return {
    type: "FeatureCollection",
    features: municipalities.map((m, i) => ({
      type: "Feature",
      properties: { id: m.id, name: m.name, state: m.state, severity: m.severity ?? 0 },
      geometry: {
        type: "Polygon",
        coordinates: [getInterlockingPolygon(
          m.coords ?? [m.lat, m.lng],
          14,
          0.06,
          (m.id || i) + 7919 // seed estable por municipio
        )],
      },
    })),
  };
}
