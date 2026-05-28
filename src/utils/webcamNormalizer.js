// src/utils/webcamNormalizer.js
import { validateStreamUrl } from "./catalogUtils";

export function normalizeWebcams(rawWebcams = []) {
  if (!Array.isArray(rawWebcams)) return [];
  
  return rawWebcams.map((w, idx) => {
    const sourceUrl = w.stream_url || w.embedUrl || w.embed_url || w.url || "";
    const validUrl = validateStreamUrl(sourceUrl);
    return {
      id: w.id || `cam-${idx}`,
      name: w.name || `Cámara ${idx + 1}`,
      lat: Number(w.lat) || null,
      lng: Number(w.lng) || null,
      stream_url: validUrl,
      status: validUrl ? "live" : "no_feed",
      source: w.source || "unknown",
      viewers: Number(w.viewers) || 0,
      thumbnail_url: w.thumbnail_url || w.thumbnailUrl || null,
      embed_url: sourceUrl || null
    };
  });
}
