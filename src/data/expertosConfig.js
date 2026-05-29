// src/data/expertosConfig.js
// CDD: Configuración de roles de la Mesa de Expertos IA Local
// Cada experto tiene un modelo asignado, color temático y descripción de su rol

/**
 * Configuración de los agentes de la Mesa de Expertos MoE.
 * Los modelos se agrupan para minimizar swaps de RAM:
 *   - Grupo 1 (qwen3.5:4b-mlx): Router, Analista, Sintetizador
 *   - Grupo 2 (gemma4:e4b-mlx):  Estratega, Redactor
 */
export const EXPERTOS_CONFIG = {
  router: {
    id: 'router',
    nombre: 'Clasificador Thoth',
    modelo: 'qwen3.5:4b-mlx',
    modeloCorto: 'Qwen 3.5 4B',
    tamaño: '4.0 GB',
    emoji: '🧠',
    color: '#3b82f6',
    colorSuave: 'rgba(59, 130, 246, 0.15)',
    colorBorde: 'rgba(59, 130, 246, 0.35)',
    descripcion: 'Clasifica la consulta y genera el plan de ejecución multi-agente.',
    grupo: 1,
  },
  analista: {
    id: 'analista',
    nombre: 'Analista de Microdatos',
    modelo: 'qwen3.5:4b-mlx',
    modeloCorto: 'Qwen 3.5 4B',
    tamaño: '4.0 GB',
    emoji: '📊',
    color: '#10b981',
    colorSuave: 'rgba(16, 185, 129, 0.15)',
    colorBorde: 'rgba(16, 185, 129, 0.35)',
    descripcion: 'Procesa datos demográficos INEGI/INE y extrae métricas cuantitativas.',
    grupo: 1,
  },
  estratega: {
    id: 'estratega',
    nombre: 'Estratega Político',
    modelo: 'gemma4:e4b-mlx',
    modeloCorto: 'Gemma 4 E4B',
    tamaño: '9.6 GB',
    emoji: '🗳️',
    color: '#8b5cf6',
    colorSuave: 'rgba(139, 92, 246, 0.15)',
    colorBorde: 'rgba(139, 92, 246, 0.35)',
    descripcion: 'Análisis profundo de impacto político-social y proyecciones electorales.',
    grupo: 2,
  },
  redactor: {
    id: 'redactor',
    nombre: 'Redactor Ejecutivo',
    modelo: 'gemma4:e4b-mlx',
    modeloCorto: 'Gemma 4 E4B',
    tamaño: '9.6 GB',
    emoji: '📝',
    color: '#f59e0b',
    colorSuave: 'rgba(245, 158, 11, 0.15)',
    colorBorde: 'rgba(245, 158, 11, 0.35)',
    descripcion: 'Genera reportes ejecutivos premium y planes de acción estructurados.',
    grupo: 2,
  },
  sintetizador: {
    id: 'sintetizador',
    nombre: 'Sintetizador Final',
    modelo: 'qwen3.5:4b-mlx',
    modeloCorto: 'Qwen 3.5 4B',
    tamaño: '4.0 GB',
    emoji: '🔄',
    color: '#ef4444',
    colorSuave: 'rgba(239, 68, 68, 0.15)',
    colorBorde: 'rgba(239, 68, 68, 0.35)',
    descripcion: 'Consolida las respuestas de todos los expertos en un JSON estructurado.',
    grupo: 1,
  },
};

/**
 * Modos de ejecución de la Mesa de Expertos.
 */
export const MODOS_MESA = {
  rapido: {
    id: 'rapido',
    nombre: '⚡ Rápido',
    descripcion: 'Solo usa Qwen 3.5 (sin swap). ~30s.',
    modelos: ['qwen3.5:4b-mlx'],
    agentes: ['router', 'analista', 'sintetizador'],
    swaps: 0,
  },
  profundo: {
    id: 'profundo',
    nombre: '🔬 Profundo',
    descripcion: 'Ambos modelos con swap inteligente. ~90s.',
    modelos: ['qwen3.5:4b-mlx', 'gemma4:e4b-mlx'],
    agentes: ['router', 'analista', 'estratega', 'redactor', 'sintetizador'],
    swaps: 2,
  },
  debate: {
    id: 'debate',
    nombre: '⚔️ Debate',
    descripcion: 'Expertos debaten y refutan. ~150s.',
    modelos: ['qwen3.5:4b-mlx', 'gemma4:e4b-mlx'],
    agentes: ['router', 'analista', 'estratega', 'redactor', 'sintetizador'],
    swaps: 3,
  },
};

/**
 * Orden de ejecución secuencial optimizado para minimizar swaps.
 * Agrupa tareas del mismo modelo juntas.
 */
export const FLUJO_SECUENCIAL = [
  { fase: 1, agente: 'router',       grupoModelo: 1, tipo: 'inferencia' },
  { fase: 2, agente: 'analista',     grupoModelo: 1, tipo: 'inferencia' },
  { fase: 2.5, agente: 'swap',      grupoModelo: 0, tipo: 'swap', de: 'qwen3.5:4b-mlx', a: 'gemma4:e4b-mlx' },
  { fase: 3, agente: 'estratega',   grupoModelo: 2, tipo: 'inferencia' },
  { fase: 4, agente: 'redactor',    grupoModelo: 2, tipo: 'inferencia' },
  { fase: 4.5, agente: 'swap',      grupoModelo: 0, tipo: 'swap', de: 'gemma4:e4b-mlx', a: 'qwen3.5:4b-mlx' },
  { fase: 5, agente: 'sintetizador', grupoModelo: 1, tipo: 'inferencia' },
];
