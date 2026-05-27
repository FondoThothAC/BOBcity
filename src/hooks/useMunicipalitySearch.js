// src/hooks/useMunicipalitySearch.js
import { useState, useMemo, useCallback, useEffect } from "react";
import { searchMunicipalities } from "../utils/catalogUtils";

export function useMunicipalitySearch(catalog, initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);

  const search = useCallback(async (q) => {
    setLoading(true);
    setError(null);
    try {
      // Búsqueda local instantánea (offline-first)
      const localRes = searchMunicipalities(q, catalog);
      setResults(localRes);
      console.info(`[MunicipalitySearch] ${localRes.length} resultados encontrados para "${q}"`);
    } catch (err) {
      setError("Error al filtrar catálogo local.");
      console.error("[MunicipalitySearch] Fallback search failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [catalog]);

  useEffect(() => {
    const timeoutId = setTimeout(() => search(query), 150); // Debounce
    return () => clearTimeout(timeoutId);
  }, [query, search]);

  return { query, setQuery, results, loading, error };
}
