// ✅ MEJORA: Sistema de notificaciones toast
function showToast(message, type = 'info', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    background: ${type === 'success' ? 'rgba(0,212,170,0.15)' : 
                   type === 'error' ? 'rgba(255,68,102,0.15)' : 
                   'rgba(147,112,255,0.15)'};
    border: 1px solid ${type === 'success' ? 'rgba(0,212,170,0.3)' : 
                         type === 'error' ? 'rgba(255,68,102,0.3)' : 
                         'rgba(147,112,255,0.3)'};
    padding: 12px 20px; border-radius: 8px;
    font-size: 13px; font-family: var(--font-body);
    color: var(--text-primary);
    animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Reemplazar alerts() por toasts
function openNewProject() {
  const p = prompt('Código del nuevo proyecto (ej. MTY-DIS-04):');
  if (p) showToast(`Proyecto "${p}" creado exitosamente`, 'success');
}

function submitCitizen() {
  // ... validación
  showToast('Propuesta registrada. Cédula digital generada.', 'success');
}