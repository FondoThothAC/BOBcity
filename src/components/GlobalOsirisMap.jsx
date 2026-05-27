import React, { useState, useMemo } from "react";
import Globe from "react-globe.gl";
import { normalizeWebcams } from "../utils/webcamNormalizer";
import { CameraViewer } from "./CameraViewer";

export function GlobalOsirisMap({ rawWebcams = [], selectedCamera, onSelectCamera }) {
  const webcams = useMemo(() => normalizeWebcams(rawWebcams), [rawWebcams]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="glass-panel" style={{ position: "relative", height: "85vh", overflow: "hidden" }}>
      <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ position: "absolute", top: 12, right: 12, zIndex: 10, background: "rgba(0,0,0,0.5)", border: "1px solid var(--border-subtle)", color: "#fff", padding: 6, borderRadius: 4, cursor: "pointer" }}>
        {sidebarOpen ? "◀" : "▶"} Cámaras
      </button>

      <Globe
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        htmlElementsData={webcams}
        htmlElement={d => {
          const el = document.createElement("div");
          el.innerHTML = d.status === "live" ? "📹" : "⚠️";
          el.style.fontSize = "24px";
          el.style.cursor = "pointer";
          el.style.textShadow = "0 0 8px var(--accent-cyan)";
          el.title = `${d.name} (${d.status})`;
          el.onclick = () => onSelectCamera(d);
          return el;
        }}
        onGlobeClick={() => onSelectCamera(null)}
      />

      {sidebarOpen && (
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 260, background: "var(--glass)", backdropFilter: "blur(10px)", borderRight: "1px solid var(--border-subtle)", padding: 12, overflowY: "auto", zIndex: 5 }}>
          <h4 style={{ margin: "0 0 10px", fontFamily: "var(--font-heading)" }}>Flujo de Cámaras</h4>
          {webcams.map(w => (
            <div key={w.id} onClick={() => onSelectCamera(w)} style={{ padding: 8, marginBottom: 6, background: selectedCamera?.id === w.id ? "rgba(16,185,129,0.2)" : "rgba(0,0,0,0.2)", borderRadius: 6, cursor: "pointer", border: selectedCamera?.id === w.id ? "1px solid var(--accent-emerald)" : "1px solid transparent" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: 13 }}>{w.name}</strong>
                <span className={`badge ${w.status === "live" ? "badge-live" : "badge-offline"}`}>{w.status}</span>
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{w.source} | 👁️ {w.viewers}</div>
            </div>
          ))}
        </div>
      )}

      {selectedCamera && <CameraViewer webcam={selectedCamera} onClose={() => onSelectCamera(null)} />}
    </div>
  );
}
