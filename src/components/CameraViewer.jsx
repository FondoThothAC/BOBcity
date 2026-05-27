// src/components/CameraViewer.jsx
import React, { useState, useEffect, useRef } from "react";

export function CameraViewer({ webcam, onClose }) {
  const [loadState, setLoadState] = useState("idle"); // idle | loading | success | error
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!webcam?.stream_url) {
      setLoadState("error");
      return;
    }
    setLoadState("loading");
  }, [webcam]);

  const handleIframeLoad = () => setLoadState("success");
  const handleIframeError = () => setLoadState("error");

  return (
    <div className="camera-viewer-modal" role="dialog" aria-modal="true">
      <div className="viewer-header">
        <h3>{webcam.name}</h3>
        <button onClick={onClose} aria-label="Cerrar visor">✕</button>
      </div>
      <div className="viewer-content">
        {webcam.status === "no_feed" ? (
          <p className="fallback-msg">⚠️ Sin feed validado. La cámara está fuera de línea o no configurada.</p>
        ) : loadState === "error" ? (
          <p className="fallback-msg">❌ Error al cargar el stream. Verifique conectividad o política de iframe.</p>
        ) : (
          <iframe
            ref={iframeRef}
            src={webcam.stream_url}
            allow="autoplay; encrypted-media"
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={`Feed de ${webcam.name}`}
          />
        )}
        {loadState === "loading" && <div className="spinner" aria-label="Cargando feed..." />}
      </div>
      <div className="viewer-meta">
        <span>📍 {webcam.lat}, {webcam.lng}</span>
        <span>👁️ {webcam.viewers} espectadores</span>
        <span>📡 {webcam.source}</span>
      </div>
    </div>
  );
}
