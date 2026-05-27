// src/components/MunicipalitySearchDropdown.jsx
import React from "react";
import { useMunicipalitySearch } from "../hooks/useMunicipalitySearch";

export function MunicipalitySearchDropdown({ catalog, onSelect, className = "" }) {
  const { query, setQuery, results, loading, error } = useMunicipalitySearch(catalog);

  return (
    <div className={`search-dropdown ${className}`}>
      <input
        type="text"
        placeholder="Buscar municipio o estado..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Búsqueda de municipios"
        autoComplete="off"
      />
      {loading && <span className="status-msg">Cargando catálogo local...</span>}
      {error && <span className="status-msg error">{error}</span>}
      
      <ul className="results-list" role="listbox">
        {results.length === 0 && !loading && (
          <li className="empty-state">Sin resultados coincidentes</li>
        )}
        {results.map((m) => (
          <li
            key={`${m.state}-${m.id}`}
            role="option"
            tabIndex={0}
            onClick={() => onSelect(m)}
            onKeyDown={(e) => e.key === "Enter" && onSelect(m)}
            className="result-item"
          >
            <strong>{m.name}</strong> <span className="state-tag">({m.state})</span>
            {m.coords ? (
              <span className="coords-badge">📍 Local</span>
            ) : (
              <span className="coords-badge offline">🌐 Requiere Nominatim</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
