// ✅ MEJORA: Indicador de estado offline/online
function updateOnlineStatus() {
  const indicator = document.getElementById('online-indicator') || 
    createOnlineIndicator();
  
  if (navigator.onLine) {
    indicator.textContent = '◉ ONLINE · LOCAL-FIRST';
    indicator.style.color = 'var(--accent-cyan)';
  } else {
    indicator.textContent = '◎ OFFLINE · MODO LOCAL';
    indicator.style.color = 'var(--accent-amber)';
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();