// ✅ MEJORA: Guardar estado entre sesiones
function saveAppState() {
  const state = {
    currentView: AppState.currentView,
    theme: document.documentElement.getAttribute('data-theme') || 'default',
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem('civicaos_state', JSON.stringify(state));
}

function loadAppState() {
  const saved = localStorage.getItem('civicaos_state');
  if (saved) {
    const state = JSON.parse(saved);
    setView(state.currentView);
    // Aplicar tema guardado
    if (state.theme && state.theme !== 'default') {
      document.documentElement.setAttribute('data-theme', state.theme);
    }
  }
}

// Llamar al cargar
document.addEventListener('DOMContentLoaded', loadAppState);

// Guardar al cambiar vista
const originalSetView = setView;
setView = function(v) {
  originalSetView(v);
  AppState.currentView = v;
  saveAppState();
};