// src/themeManager.js
// 10 Premium White-Label Themes for CivicPulse / CívicaOS Engine

export const themes = {
  'glass-classic': {
    name: 'Classic Glassmorphism',
    description: 'El estilo icónico de CivicPulse. Sofisticado, translúcido y con gradientes violeta.',
    variables: {
      '--bg-app': 'radial-gradient(circle at 50% 50%, #100b26 0%, #05030f 100%)',
      '--bg-sidebar': 'rgba(12, 8, 30, 0.45)',
      '--bg-card': 'rgba(20, 15, 45, 0.3)',
      '--border-glass': 'rgba(120, 100, 255, 0.15)',
      '--accent-color': '#7864ff',
      '--neon-blue': '#3b82f6',
      '--neon-purple': '#a855f7',
      '--neon-emerald': '#10b981',
      '--neon-amber': '#f59e0b',
      '--neon-red': '#ef4444',
      '--text-primary': '#f3f4f6',
      '--text-secondary': '#9ca3af',
      '--font-family': "'Outfit', sans-serif",
      '--card-glow': '0 8px 32px 0 rgba(120, 100, 255, 0.08)',
      '--accent-glow': 'rgba(120, 100, 255, 0.4)'
    }
  },
  'cyber-neon': {
    name: 'Cyberpunk Brutalist',
    description: 'Contraste extremo, bordes afilados, fondos negro carbón y cian/magenta neón.',
    variables: {
      '--bg-app': 'linear-gradient(180deg, #070709 0%, #0d0d12 100%)',
      '--bg-sidebar': 'rgba(10, 10, 15, 0.9)',
      '--bg-card': '#12121c',
      '--border-glass': '2px solid #ff007f',
      '--accent-color': '#00ffff',
      '--neon-blue': '#00ffff',
      '--neon-purple': '#ff007f',
      '--neon-emerald': '#39ff14',
      '--neon-amber': '#ffea00',
      '--neon-red': '#ff073a',
      '--text-primary': '#00ffff',
      '--text-secondary': '#ff007f',
      '--font-family': "Courier New, 'Courier', monospace",
      '--card-glow': '5px 5px 0px 0px #ff007f',
      '--accent-glow': 'rgba(0, 255, 255, 0.6)'
    }
  },
  'royal-corporate': {
    name: 'Royal Navy & Steel',
    description: 'Ajuste corporativo de alta gama. Profundo azul marino, acentos de acero y geometría limpia.',
    variables: {
      '--bg-app': 'radial-gradient(circle at 10% 20%, #0b132b 0%, #1c2541 90%)',
      '--bg-sidebar': 'rgba(11, 19, 43, 0.8)',
      '--bg-card': 'rgba(28, 37, 65, 0.6)',
      '--border-glass': 'rgba(72, 202, 228, 0.2)',
      '--accent-color': '#48cae4',
      '--neon-blue': '#00b4d8',
      '--neon-purple': '#9b5de5',
      '--neon-emerald': '#06d6a0',
      '--neon-amber': '#ffd166',
      '--neon-red': '#ef476f',
      '--text-primary': '#f8f9fa',
      '--text-secondary': '#adb5bd',
      '--font-family': "'Inter', sans-serif",
      '--card-glow': '0 4px 20px 0 rgba(72, 202, 228, 0.05)',
      '--accent-glow': 'rgba(72, 202, 228, 0.3)'
    }
  },
  'emerald-eco': {
    name: 'Emerald Eco-Governance',
    description: 'Armonía ecológica. Acentos verde menta, esmeralda y detalles en oro.',
    variables: {
      '--bg-app': 'linear-gradient(135deg, #091512 0%, #0d221c 100%)',
      '--bg-sidebar': 'rgba(9, 21, 18, 0.85)',
      '--bg-card': 'rgba(20, 47, 39, 0.3)',
      '--border-glass': 'rgba(0, 245, 212, 0.25)',
      '--accent-color': '#00f5d4',
      '--neon-blue': '#00bbf9',
      '--neon-purple': '#9b5de5',
      '--neon-emerald': '#00f5d4',
      '--neon-amber': '#D4AF37',
      '--neon-red': '#f15bb5',
      '--text-primary': '#e9ecef',
      '--text-secondary': '#a5a5a5',
      '--font-family': "'Roboto', sans-serif",
      '--card-glow': '0 8px 24px rgba(0, 245, 212, 0.08)',
      '--accent-glow': 'rgba(0, 245, 212, 0.4)'
    }
  },
  'sunset-gold': {
    name: 'Sunset Amber',
    description: 'Fondos cálidos chocolate oscuro, gradientes áureos y acentos en naranja sunset.',
    variables: {
      '--bg-app': 'radial-gradient(circle at top left, #1c120c 0%, #0d0806 100%)',
      '--bg-sidebar': 'rgba(28, 18, 12, 0.75)',
      '--bg-card': 'rgba(40, 26, 18, 0.4)',
      '--border-glass': 'rgba(245, 158, 11, 0.2)',
      '--accent-color': '#f59e0b',
      '--neon-blue': '#ff7a00',
      '--neon-purple': '#d946ef',
      '--neon-emerald': '#10b981',
      '--neon-amber': '#f59e0b',
      '--neon-red': '#ef4444',
      '--text-primary': '#fffbeb',
      '--text-secondary': '#d97706',
      '--font-family': "'Outfit', sans-serif",
      '--card-glow': '0 8px 32px 0 rgba(245, 158, 11, 0.05)',
      '--accent-glow': 'rgba(245, 158, 11, 0.35)'
    }
  },
  'midnight-minimal': {
    name: 'Midnight Minimalist',
    description: 'Oscuridad absoluta, bordes ultra delgados blanco plata y tipografía refinada.',
    variables: {
      '--bg-app': '#000000',
      '--bg-sidebar': '#080808',
      '--bg-card': '#050505',
      '--border-glass': '1px solid #1a1a1a',
      '--accent-color': '#ffffff',
      '--neon-blue': '#a3a3a3',
      '--neon-purple': '#737373',
      '--neon-emerald': '#ffffff',
      '--neon-amber': '#e5e5e5',
      '--neon-red': '#404040',
      '--text-primary': '#ffffff',
      '--text-secondary': '#a3a3a3',
      '--font-family': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      '--card-glow': 'none',
      '--accent-glow': 'rgba(255, 255, 255, 0.2)'
    }
  },
  'crimson-cyber': {
    name: 'Crimson Cyber-Vigilance',
    description: 'Diseño militarizado, acentuado con rojos rubí y ciberseguridad avanzada.',
    variables: {
      '--bg-app': 'radial-gradient(circle at 50% 50%, #1f0b0e 0%, #0a0203 100%)',
      '--bg-sidebar': 'rgba(31, 11, 14, 0.8)',
      '--bg-card': 'rgba(45, 15, 20, 0.4)',
      '--border-glass': 'rgba(255, 0, 43, 0.25)',
      '--accent-color': '#ff002b',
      '--neon-blue': '#ef4444',
      '--neon-purple': '#c084fc',
      '--neon-emerald': '#10b981',
      '--neon-amber': '#f59e0b',
      '--neon-red': '#ff002b',
      '--text-primary': '#fee2e2',
      '--text-secondary': '#fca5a5',
      '--font-family': "'Courier New', monospace",
      '--card-glow': '0 8px 30px rgba(255, 0, 43, 0.12)',
      '--accent-glow': 'rgba(255, 0, 43, 0.4)'
    }
  },
  'aero-light': {
    name: 'Aero White Frosted',
    description: 'El único tema claro. Paneles blancos translúcidos esmerilados y sombras tenues.',
    variables: {
      '--bg-app': 'linear-gradient(135deg, #eef2f3 0%, #8e9eab 100%)',
      '--bg-sidebar': 'rgba(255, 255, 255, 0.6)',
      '--bg-card': 'rgba(255, 255, 255, 0.45)',
      '--border-glass': 'rgba(255, 255, 255, 0.5)',
      '--accent-color': '#3d348b',
      '--neon-blue': '#4895ef',
      '--neon-purple': '#7209b7',
      '--neon-emerald': '#2ec4b6',
      '--neon-amber': '#ff9f1c',
      '--neon-red': '#e63946',
      '--text-primary': '#1d3557',
      '--text-secondary': '#457b9d',
      '--font-family': "'Outfit', sans-serif",
      '--card-glow': '0 8px 32px 0 rgba(31, 38, 135, 0.06)',
      '--accent-glow': 'rgba(61, 52, 139, 0.25)'
    }
  },
  'quantum-indigo': {
    name: 'Quantum Indigo Matrix',
    description: 'Fondo índigo profundo y acentos de color cian eléctrico y amatista.',
    variables: {
      '--bg-app': 'radial-gradient(circle at center, #0e0e26 0%, #03030b 100%)',
      '--bg-sidebar': 'rgba(14, 14, 38, 0.85)',
      '--bg-card': 'rgba(25, 25, 60, 0.35)',
      '--border-glass': 'rgba(0, 240, 255, 0.25)',
      '--accent-color': '#00f0ff',
      '--neon-blue': '#00f0ff',
      '--neon-purple': '#d946ef',
      '--neon-emerald': '#06d6a0',
      '--neon-amber': '#ffd166',
      '--neon-red': '#ef476f',
      '--text-primary': '#f0f4f8',
      '--text-secondary': '#93c5fd',
      '--font-family': "'Outfit', sans-serif",
      '--card-glow': '0 0 15px rgba(0, 240, 255, 0.15)',
      '--accent-glow': 'rgba(0, 240, 255, 0.5)'
    }
  },
  'nordic-slate': {
    name: 'Nordic Cold Slate',
    description: 'Estética escandinava. Fondos gris pizarra y sutiles acentos en menta y cian ártico.',
    variables: {
      '--bg-app': 'linear-gradient(180deg, #1c2529 0%, #2f3e46 100%)',
      '--bg-sidebar': 'rgba(28, 37, 41, 0.75)',
      '--bg-card': 'rgba(53, 79, 82, 0.35)',
      '--border-glass': 'rgba(132, 165, 157, 0.25)',
      '--accent-color': '#84a59d',
      '--neon-blue': '#f7b2bd',
      '--neon-purple': '#f5cac3',
      '--neon-emerald': '#84a59d',
      '--neon-amber': '#f6bd60',
      '--neon-red': '#e07a5f',
      '--text-primary': '#f4f1de',
      '--text-secondary': '#f2cc8f',
      '--font-family': "-apple-system, BlinkMacSystemFont, sans-serif",
      '--card-glow': '0 4px 16px rgba(132, 165, 157, 0.05)',
      '--accent-glow': 'rgba(132, 165, 157, 0.3)'
    }
  }
};

// Inject custom CSS variables into the document element root
export const applyTheme = (themeId) => {
  const selectedTheme = themes[themeId] || themes['glass-classic'];
  const root = document.documentElement;

  Object.entries(selectedTheme.variables).forEach(([key, val]) => {
    // If it's border-glass, check if it contains a full 'border' statement or is just a color
    if (key === '--border-glass' && !val.includes('border') && !val.includes('px')) {
      root.style.setProperty(key, `1px solid ${val}`);
    } else {
      root.style.setProperty(key, val);
    }
  });

  // Re-adjust fonts dynamically
  root.style.setProperty('--font-family', selectedTheme.variables['--font-family']);
};
