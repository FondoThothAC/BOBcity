# Wireframes & UI Specifications - CivicPulse

## Design System: "Civic Glass"

### Color Palette (Dark Mode Default)
```css
:root {
  --bg-primary: #0a0e17;        /* Fondo principal */
  --bg-secondary: #111827;      /* Cards, panels */
  --bg-tertiary: #1f2937;       /* Hover states */
  --border-glow: rgba(59, 130, 246, 0.3);  /* Azul cívico */
  --accent-civic: #3b82f6;      /* Primary action */
  --accent-success: #10b981;    /* Success, completion */
  --accent-warning: #f59e0b;    /* Warning, attention */
  --accent-danger: #ef4444;     /* Critical, danger */
  --accent-purple: #8b5cf6;     /* AI/ML features */
  --text-primary: #f9fafb;      /* Headings */
  --text-secondary: #9ca3af;    /* Body, descriptions */
  --text-muted: #6b7280;        /* Timestamps, metadata */
  --glass-bg: rgba(17, 24, 39, 0.7);
  --glass-border: rgba(255, 255, 255, 0.1);
}
```

### Typography
```css
--font-heading: 'Outfit', sans-serif;    /* Títulos, números grandes */
--font-body: 'Inter', sans-serif;         /* Body text, descripciones */
--font-mono: 'JetBrains Mono', monospace; /* Terminal, logs, código */

/* Scale */
--text-xs: 0.75rem;    /* 12px - timestamps, badges */
--text-sm: 0.875rem;   /* 14px - body secondary */
--text-base: 1rem;     /* 16px - body primary */
--text-lg: 1.125rem;   /* 18px - lead text */
--text-xl: 1.25rem;    /* 20px - card titles */
--text-2xl: 1.5rem;    /* 24px - section titles */
--text-3xl: 1.875rem;  /* 30px - page titles */
--text-4xl: 2.25rem;   /* 36px - hero numbers */
```

### Spacing & Layout
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */

--radius-sm: 0.375rem;   /* 6px - buttons, inputs */
--radius-md: 0.5rem;     /* 8px - cards */
--radius-lg: 0.75rem;    /* 12px - panels */
--radius-xl: 1rem;       /* 16px - modals */
```

## Wireframe: Dashboard Principal

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  CÍVICAOS                        [🔍 Search] [🔔 3] [👤 Roberto Celis ▼]  │
├────────┬──────────────────────────────────────────────────────────────────┤
│        │  ┌────────────────────────────────────────────────────────────┐  │
│  🏠    │  │  PULSO CÍVICO - Hermosillo, Sonora                        │  │
│  Dashboard│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐            │  │
│        │  │  │ 45.2%  │ │ 23.4   │ │ 67%    │ │ 12.3%  │            │  │
│  🗺️    │  │  │ Segur. │ │ Homic. │ │ Apoyo  │ │ Desempl│            │  │
│  Mapa  │  │  └────────┘ └────────┘ └────────┘ └────────┘            │  │
│        │  └────────────────────────────────────────────────────────────┘  │
│  🤖    │                                                                  │
│  Orquest│  ┌──────────────────────────────┐ ┌────────────────────────┐  │
│        │  │  MAPA DE CALOR                 │ │  ALERTAS Y TENDENCIAS   │  │
│  📊    │  │                                │ │                         │  │
│  Predic│  │    [    MAPA INTERACTIVO     ] │ │  ⚠️ Crisis agua D8      │  │
│        │  │    [    Leaflet + Heatmap    ] │ │  📈 +15% menciones      │  │
│  📋    │  │                                │ │     seguridad           │  │
│  Report│  │  [Seguridad] [Economía] [Empl]│ │  🎯 Nuevo candidato     │  │
│        │  │  [Transporte] [Salud] [Corrup]│ │     independiente       │  │
│  ⚙️    │  └──────────────────────────────┘ └────────────────────────┘  │
│  Config│                                                                  │
│        │  ┌────────────────────────────────────────────────────────────┐  │
│        │  │  ACCESO RÁPIDO                                             │  │
│        │  │  [🧪 Simular Política]  [🔮 Predecir Elección]  [📤 OBP]   │  │
│        │  └────────────────────────────────────────────────────────────┘  │
│        │                                                                  │
└────────┴──────────────────────────────────────────────────────────────────┘
```

## Wireframe: Orquestador OpenClaw

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ORQUESTADOR OPENCLAW                                          [⏹ Stop]    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │ INICIATIVAS CÍVICAS         │  │ DIAGRAMA DE FLUJO DE AGENTES           │ │
│  │                             │  │                                         │ │
│  │ ○ Crisis Agua Palo Verde D8 │  │     ┌─────────┐                         │ │
│  │ ● Plan Movilidad D6        │  │     │ Super   │                         │ │
│  │ ○ Corredor Pyme Centro D9  │  │     │ Agent   │◄── pulsing blue         │ │
│  │                             │  │     └───┬─────┘                         │ │
│  │ [✏️ Consulta personalizada] │  │         │                               │ │
│  │                             │  │     ┌───┴───┐                         │ │
│  │ [▶️ Ejecutar Flujo]        │  │     ▼       ▼                         │ │
│  │                             │  │ ┌──────┐ ┌──────┐                      │ │
│  └─────────────────────────────┘  │ │ Data │ │Analyz│◄── active green    │ │
│                                     │ │ Coll │ │ er   │                      │ │
│  ┌─────────────────────────────┐  │ └──┬───┘ └──┬───┘                      │ │
│  │ CONSOLA DE INFERENCIA       │  │    │      │                          │ │
│  │                             │  │    ▼      ▼                          │ │
│  │ > [10:00:01] SuperAgent:   │  │ ┌──────┐ ┌──────┐                    │ │
│  │   Iniciando flujo #OBP-001 │  │ │ Simul│ │Recomm│                    │ │
│  │ > [10:00:03] DataCollector:│  │ │ ator │ │ ender│                    │ │
│  │   INE data loaded: 15k rec │  │ └──┬───┘ └──┬───┘                    │ │
│  │ > [10:00:15] Analyzer:     │  │    │      │                          │ │
│  │   Clustering complete: 7   │  │    ▼      ▼                          │ │
│  │   pain points identified   │  │ ┌──────┐ ┌──────┐                    │ │
│  │ > [10:00:45] Simulator:    │  │ │Integr│ │Report│                    │ │
│  │   ABM running: month 6/120 │  │ │ ator │ │Writer│                    │ │
│  │ ...                        │  │ └──────┘ └──────┘                    │ │
│  │                             │  │                                         │ │
│  └─────────────────────────────┘  └─────────────────────────────────────────┘│
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ LEDGER DE AUDITORÍA LOCAL                                              ││
│  │ Timestamp          | Operation          | Hash       | Compliance    ││
│  │ 2026-05-17 10:00:01 | superagent.init    | a3f5c2...   | GDPR,LGPD     ││
│  │ 2026-05-17 10:00:03 | data.load_ine      | 9e8d1a...   | GDPR,LGPD     ││
│  │ 2026-05-17 10:00:15 | analysis.cluster   | 7b2c4f...   | GDPR,LGPD     ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ RESULTADO Y EXPORTACIÓN                                               ││
│  │                                                                         ││
│  │ 📋 RESUMEN DE RECOMENDACIONES                                          ││
│  │ • Prioridad 1: Infraestructura de agua en D8 (ROI: 78%)               ││
│  │ • Prioridad 2: Transporte seguro para estudiantes (ROI: 65%)           ││
│  │ • Prioridad 3: Iluminación corredor comercial (ROI: 52%)                ││
│  │                                                                         ││
│  │ 💰 PRESUPUESTO ESTIMADO: $45.2M MXN (3 años)                          ││
│  │                                                                         ││
│  │ [📤 EXPORTAR A OPEN BUSINESS PLAN]  [📥 DESCARGAR PDF]                  ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Library Specs

### Card - Metric
```
Props:
- title: string
- value: number | string
- unit: string ("%", "pts", "MXN", etc.)
- trend: "up" | "down" | "neutral"
- trendValue: number
- icon: LucideIcon
- color: "civic" | "success" | "warning" | "danger" | "purple"

States:
- Default: glass background, border glow
- Hover: intensify glow, subtle lift (translateY -2px)
- Loading: skeleton pulse animation
```

### Node - Agent Flow
```
Props:
- name: string
- status: "idle" | "active" | "success" | "error"
- icon: LucideIcon
- progress: number (0-100, optional)

Animation:
- Idle: static, opacity 0.7
- Active: pulse glow (box-shadow animation), opacity 1
- Success: green glow, checkmark icon fade in
- Error: red glow, shake animation
```

### Log Entry - Terminal
```
Props:
- timestamp: string
- agent: string
- message: string
- type: "info" | "success" | "warning" | "error"

Style:
- Font: JetBrains Mono, 13px
- Info: text-secondary
- Success: text-green-400
- Warning: text-yellow-400
- Error: text-red-400
- Timestamp: text-muted, 11px
```
