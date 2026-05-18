# IDD - Documento de Diseño de Interfaces
## CívicaOS: Sistema de Inteligencia Cívica Multi-Nivel

**Versión:** 1.0.0
**Fecha:** 2026-05-18
**Autor:** MiniMax Agent
**Estado:** Especificación正式

---

## 1. Sistema de Diseño de CívicaOS

### 1.1 Fundamentos del Diseño

El sistema de diseño de cívicaOS se fundamenta en una filosofía de claridad instrumental donde cada elemento de la interfaz existe para servir un propósito funcional específico. La interfaz está diseñada para comunicar información compleja de manera accesible, permitiendo que usuarios con diferentes niveles de expertise técnico naveguen el sistema sin dificultad. El estilo visual adopta un enfoque de glassmorphism oscuro premium que proporciona profundidad visual y jerarquía clara sin sacrificar legibilidad.

La paleta de colores se construye sobre una base neutra oscura que sirve como lienzo para elementos de datos y gráficos. Los colores semánticos comunican estados y categorías de manera intuitiva: verde para éxito y datos positivos, rojo para alertas y problemas críticos, amarillo para advertencias y datos en revisión, y cian para elementos interactivos y navegación. Los colores neón proporcionan acentos que guían la atención hacia elementos importantes sin crear ruido visual.

### 1.2 Tokens de Diseño

```typescript
// src/design-system/tokens/design-tokens.ts

export const DesignTokens = {
  // Espaciado
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },

  // Sombras
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    glow: '0 0 20px rgba(16, 185, 129, 0.3)',
    glowCyan: '0 0 20px rgba(6, 182, 212, 0.3)',
  },

  // Transiciones
  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },

  // Z-index
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    modal: 300,
    tooltip: 400,
    toast: 500,
  },
} as const;

export const ColorTokens = {
  // Colores base
  base: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Colores de texto
  text: {
    primary: '#ffffff',
    secondary: '#a1a1aa',
    tertiary: '#71717a',
    disabled: '#52525b',
    inverse: '#09090b',
  },

  // Colores de superficie
  surface: {
    background: '#0a0a0a',
    card: 'rgba(255, 255, 255, 0.05)',
    cardHover: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.1)',
    borderHover: 'rgba(255, 255, 255, 0.2)',
  },

  // Colores semánticos
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
  },

  // Colores de categoría
  categories: {
    security: '#ef4444',
    water: '#3b82f6',
    economy: '#f59e0b',
    transport: '#8b5cf6',
    health: '#ec4899',
    education: '#06b6d4',
    corruption: '#6b7280',
  },

  // Colores de agente
  agents: {
    orchestrator: '#10b981',
    dataCollector: '#3b82f6',
    analyzer: '#8b5cf6',
    simulator: '#f59e0b',
    recommender: '#ec4899',
    integrator: '#06b6d4',
  },
} as const;
```

---

## 2. Componentes UI Core

### 2.1 Sistema de Cards

Las cards constituyen el componente fundamental para la organización de contenido en cívicaOS. Cada card puede contener título, descripción, indicadores de estado, y acciones específicas. El diseño glassmorphism utiliza backdrop-blur para crear efecto de profundidad sobre fondos oscuros.

```tsx
// src/components/ui/Card.tsx

interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  status?: 'default' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  size = 'md',
  status = 'default',
  children,
  onClick,
  className = '',
}) => {
  const baseStyles = `
    rounded-xl transition-all duration-250
    ${variant === 'default' ? 'bg-white/5 backdrop-blur-md border border-white/10' : ''}
    ${variant === 'elevated' ? 'bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg' : ''}
    ${variant === 'outlined' ? 'bg-transparent border border-white/20' : ''}
    ${status === 'success' ? 'border-emerald-500/30' : ''}
    ${status === 'warning' ? 'border-amber-500/30' : ''}
    ${status === 'error' ? 'border-red-500/30' : ''}
    ${onClick ? 'cursor-pointer hover:bg-white/10 hover:border-white/30' : ''}
  `;

  const sizeStyles = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={`${baseStyles} ${sizeStyles[size]} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-4">{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; icon?: React.ReactNode }> = ({
  children,
  icon,
}) => (
  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
    {icon && <span className="text-emerald-400">{icon}</span>}
    {children}
  </h3>
);

export const CardDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-zinc-400 mt-1">{children}</p>
);

export const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-white">{children}</div>
);

export const CardFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
    {children}
  </div>
);
```

### 2.2 Componente de Indicadores de Estado

Los indicadores de estado comunican el progreso y estado de operaciones en el sistema. El diseño incluye animaciones sutiles que proporcionan feedback visual sin ser intrusivas.

```tsx
// src/components/ui/StatusIndicator.tsx

interface StatusIndicatorProps {
  status: 'idle' | 'processing' | 'completed' | 'error';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  size = 'md',
  pulse = true,
}) => {
  const statusColors = {
    idle: 'bg-zinc-500',
    processing: 'bg-cyan-400',
    completed: 'bg-emerald-400',
    error: 'bg-red-400',
  };

  const sizeMap = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div
          className={`${sizeMap[size]} rounded-full ${statusColors[status]} ${
            pulse && status === 'processing' ? 'animate-pulse' : ''
          }`}
        />
        {status === 'processing' && (
          <div
            className={`absolute inset-0 rounded-full ${statusColors[status]} opacity-50 ${
              pulse ? 'animate-ping' : ''
            }`}
          />
        )}
      </div>
      {label && (
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
};

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  variant = 'default',
  size = 'md',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const variantColors = {
    default: 'bg-emerald-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-400',
    error: 'bg-red-400',
  };

  const heightMap = {
    sm: 'h-1',
    md: 'h-2',
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-zinc-400">{label}</span>}
          {showPercentage && (
            <span className="text-xs font-mono text-zinc-300">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-white/10 rounded-full overflow-hidden ${heightMap[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ${variantColors[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
```

### 2.3 Sistema de Terminal Consola

El componente de terminal simula la interfaz de línea de comandos que muestra la ejecución de los agentes de IA. El diseño incluye scroll automático, timestamps, y colores diferenciados para tipos de mensajes.

```tsx
// src/components/ui/Terminal.tsx

interface TerminalEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error' | 'agent' | 'model';
  content: string;
  agent?: string;
}

interface TerminalProps {
  entries: TerminalEntry[];
  autoScroll?: boolean;
  maxHeight?: string;
  onScrollToBottom?: () => void;
}

export const Terminal: React.FC<TerminalProps> = ({
  entries,
  autoScroll = true,
  maxHeight = '400px',
  onScrollToBottom,
}) => {
  const terminalRef = React.useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [entries, autoScroll]);

  const handleScroll = () => {
    if (terminalRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = terminalRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setIsScrolled(!isAtBottom);
    }
  };

  const typeColors = {
    info: 'text-zinc-400',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    error: 'text-red-400',
    agent: 'text-cyan-400',
    model: 'text-violet-400',
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="relative">
      <div
        ref={terminalRef}
        onScroll={handleScroll}
        className="bg-black/80 rounded-lg p-4 font-mono text-sm overflow-y-auto"
        style={{ maxHeight }}
      >
        <div className="space-y-1">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3">
              <span className="text-zinc-500 shrink-0 text-xs">
                [{formatTimestamp(entry.timestamp)}]
              </span>
              {entry.agent && (
                <span className="text-cyan-400 shrink-0 font-medium">
                  [{entry.agent.toUpperCase()}]
                </span>
              )}
              <span className={`${typeColors[entry.type]} break-words`}>
                {entry.content}
              </span>
            </div>
          ))}
        </div>
      </div>

      {!isScrolled && (
        <button
          onClick={() => {
            if (terminalRef.current) {
              terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
            }
            onScrollToBottom?.();
          }}
          className="absolute bottom-2 right-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full p-1 transition-colors"
        >
          <ChevronDownIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
```

### 2.4 Componente de Mapa de Calor

El componente de mapa de calor muestra la distribución geográfica de problemas ciudadanos utilizando Leaflet con tiles personalizados.

```tsx
// src/components/ui/HeatMap.tsx

interface HeatMapMarker {
  id: string;
  position: [number, number];
  intensity: number;
  category: PainCategory;
  title: string;
  description?: string;
}

interface HeatMapProps {
  markers: HeatMapMarker[];
  center: [number, number];
  zoom?: number;
  intensityThreshold?: number;
  onMarkerClick?: (marker: HeatMapMarker) => void;
}

export const HeatMap: React.FC<HeatMapProps> = ({
  markers,
  center,
  zoom = 12,
  intensityThreshold = 0,
  onMarkerClick,
}) => {
  const filteredMarkers = markers.filter(
    (m) => m.intensity >= intensityThreshold
  );

  const getMarkerColor = (intensity: number): string => {
    if (intensity >= 80) return '#ef4444';
    if (intensity >= 60) return '#f97316';
    if (intensity >= 40) return '#f59e0b';
    if (intensity >= 20) return '#eab308';
    return '#22c55e';
  };

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-white/10">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        style={{ background: '#0a0a0a' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {filteredMarkers.map((marker) => (
          <CircleMarker
            key={marker.id}
            center={marker.position}
            radius={8 + marker.intensity / 10}
            pathOptions={{
              color: getMarkerColor(marker.intensity),
              fillColor: getMarkerColor(marker.intensity),
              fillOpacity: 0.6,
              weight: 2,
            }}
            eventHandlers={{
              click: () => onMarkerClick?.(marker),
            }}
          >
            <Popup>
              <div className="text-black">
                <h4 className="font-bold">{marker.title}</h4>
                <p>Intensidad: {marker.intensity}%</p>
                <p>Categoría: {marker.category}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};
```

---

## 3. Diseño de Vistas Principales

### 3.1 Vista: Consola de Orquestador

La consola del orquestador es la vista principal para la interacción con el sistema de agentes. Esta vista integra el selector de iniciativas, el diagrama de flujo de agentes, la consola de logs, y el panel de resultados.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Orquestador OpenClaw                                              [Terminal] │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Iniciativas Céntrales                                                 │   │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐           │   │
│  │  │ 🔵 Crisis de    │ │ 🔵 Movilidad    │ │ 🔵 Corredor     │           │   │
│  │  │    Agua D8      │ │    Estudiantil  │ │    Pyme Centro  │           │   │
│  │  │   Hermosillo    │ │    D6 Hermosillo│ │    D9 Hermosillo│           │   │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────┘           │   │
│  │                                                                         │   │
│  │  Consulta Personalizada                                                 │   │
│  │  ┌─────────────────────────────────────────────────────────────┐       │   │
│  │  │ Analizar problema de...                                      │       │   │
│  │  └─────────────────────────────────────────────────────────────┘       │   │
│  │                                                    [Ejecutar Análisis] │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌───────────────────────────────┐ ┌────────────────────────────────────────┐  │
│  │     Diagrama de Agentes       │ │         Consola de Logs                 │  │
│  │                               │ │                                        │  │
│  │   ┌─────────┐                 │ │ [10:30:15] SUPER_AGENT: Iniciando...    │  │
│  │   │Orquesta.│ (idle)         │ │ [10:30:16] DATA_COLLECTOR: Procesando  │  │
│  │   └────┬────┘                 │ │ [10:30:18] ANALYZER: Analizando...     │  │
│  │        │                     │ │ [10:30:22] SIMULATOR: Simulando...      │  │
│  │   ┌────┴────┐                │ │ [10:30:28] RECOMMENDER: Generando...     │  │
│  │   │         │                │ │ [10:30:32] INTEGRATOR: Exportando...    │  │
│  │ ┌─┴─┐   ┌─┴─┐  ┌─┐         │ │                                        │  │
│  │ │ D │   │ A │  │I│         │ │                                        │  │
│  │ │ C │   │ N │  │N│         │ │                                        │  │
│  │ └───┘   └───┘  └─┘         │ │                                        │  │
│  │                               │ └────────────────────────────────────────┘  │
│  └───────────────────────────────┘                                           │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Plan de Acción - Crisis de Agua D8                         [Exportar] │   │
│  │  ┌──────────┬──────────┬──────────┬──────────┐                         │   │
│  │  │ Impacto  │ Prioridad │ Tiempo   │ Presupuesto │                      │   │
│  │  │ Alta     │ 1        │ 18 meses │ $45M MXN   │                      │   │
│  │  └──────────┴──────────┴──────────┴──────────┘                         │   │
│  │  Recomendación 1: Construir planta desaladora                          │   │
│  │  Recomendación 2: Red de distribución moderna                          │   │
│  │  Recomendación 3: Programa de ahorro doméstico                        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Vista: Simulador ABM

La vista del simulador ABM muestra el gemelo digital social con controles para configurar políticas y visualizar resultados.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Sandbox ABM - Gemelo Digital Social                              [Config]    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────────────────────┐ ┌────────────────────────────────────────┐    │
│  │     Población Sintética       │ │        Políticas a Simular            │    │
│  │                               │ │                                        │    │
│  │  ┌─────┐                     │ │  ┌──────────────────────────────────┐   │    │
│  │  │     │ 1000 agentes        │ │  │ Políticas Seleccionadas:        │   │    │
│  │  │ 👥  │                     │ │  │                                  │   │    │
│  │  │     │                     │ │  │ ✓ Subsidio Transporte ($50M)     │   │    │
│  │  └─────┘                     │ │  │ ✓ Seguridad Urbana ($80M)       │   │    │
│  │                               │ │  │ ✓ Infraestructura Hídrica ($120M)│  │    │
│  │  Distribución por Sector:     │ │  │                                  │   │    │
│  │  ┌─────────────────────────┐  │ │  └──────────────────────────────────┘   │    │
│  │  │  Peq. Empresa   25% ████ │  │ │                                        │    │
│  │  │  Profesional   20% ███   │  │ │  [ + Agregar Política ]                │    │
│  │  │  Industrial    25% ████ │  │ │                                        │    │
│  │  │  Estudiante    15% ██    │  │ │                                        │    │
│  │  │  Jubilado      15% ██    │  │ │  Configuración de Simulación:          │    │
│  │  └─────────────────────────┘  │ │  Horizonte: [10 años ▼]               │    │
│  └──────────────────────────────┘ │  Iteraciones: [100 ▼]                 │    │
│                                     │                                        │    │
│                                     │       [ Ejecutar Simulación ]          │    │
│                                     └────────────────────────────────────────┘    │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    Trayectorias de Simulación                           │   │
│  │                                                                         │   │
│  │  Felicidad      Year 0      Year 5      Year 10                        │   │
│  │  100% -         ┌──────┐                                          ███   │   │
│  │                 │      │                                      █████      │   │
│  │   50% -         │      │                                  █████          │   │
│  │                 │      │                              █████              │   │
│  │    0% - ────────┴──────┴──────────────────────────────█─────────────    │   │
│  │                 Año 0      Año 5      Año 10                         │   │
│  │                                                                         │   │
│  │  PIB            Baseline      Con Políticas                           │   │
│  │  $150B -                                                ████████████  │   │
│  │  $100B -                   ████████████████                            │   │
│  │   $50B - ───────────────────────────────────────────────────────────   │   │
│  │                 Año 0      Año 5      Año 10                         │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Resumen de Resultados                                    Confianza: 87% │   │
│  │  ┌────────────┬────────────┬────────────┬────────────┐                  │   │
│  │  │ Felicidad  │ PIB        │ Empleo    │ Votación   │                  │   │
│  │  │   +12%     │   +2.3%    │  -0.8%    │ Candid D   │                  │   │
│  │  └────────────┴────────────┴────────────┴────────────┘                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Especificación de Componentes UI

### 4.1 Tabla de Componentes Core

| Componente | Descripción | Estados | Props Principales |
|------------|-------------|---------|-------------------|
| Button | Botón interactivo primario | default, hover, active, disabled, loading | variant, size, leftIcon, rightIcon, isLoading |
| Input | Campo de entrada de texto | default, focus, error, disabled | label, placeholder, error, helperText |
| Select | Selector desplegable | default, open, selected, disabled | options, value, onChange, placeholder |
| Badge | Etiqueta de estado | info, success, warning, error | variant, children |
| Card | Contenedor de contenido | default, hover, selected | variant, status, onClick |
| Modal | Ventana modal | open, closed | isOpen, onClose, title, children |
| Tooltip | Información flotante | visible, hidden | content, position, children |
| Table | Tabla de datos | default, loading, empty | columns, data, onRowClick |
| Tabs | Navegación por pestañas | default, active | tabs, activeTab, onChange |
| Avatar | Imagen de usuario | default, loading, error | src, name, size |

### 4.2 Especificación de Animaciones

| Animación | Duración | Easing | Descripción |
|-----------|----------|--------|-------------|
| fadeIn | 200ms | ease-out | Entrada suave de elementos |
| fadeOut | 150ms | ease-in | Salida suave de elementos |
| slideUp | 250ms | cubic-bezier(0.16, 1, 0.3, 1) | Deslizamiento hacia arriba |
| slideDown | 200ms | cubic-bezier(0.16, 1, 0.3, 1) | Deslizamiento hacia abajo |
| scaleIn | 200ms | cubic-bezier(0.16, 1, 0.3, 1) | Escala de 0.95 a 1 |
| pulse | 1.5s | ease-in-out | Pulso suave repetitivo |
| spin | 1s | linear | Rotación continua |

### 4.3 Especificación de Breakpoints

| Breakpoint | Ancho | Dispositivo | Columns |
|------------|-------|-------------|---------|
| mobile | < 640px | Teléfono | 1 |
| tablet | 640px - 1024px | Tablet | 2 |
| desktop | 1024px - 1440px | Desktop | 3 |
| wide | 1440px - 1920px | Wide | 4 |
| ultra | > 1920px | 4K | 6 |

---

*Documento IDD actualizado: 2026-05-18*
*Próxima revisión programada: 2026-06-18*