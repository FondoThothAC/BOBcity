# Component Implementation Templates

## Atom: Button.jsx
```jsx
// src/components/atoms/Button.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-civic-500 text-white hover:bg-civic-600 active:scale-95 shadow-lg shadow-civic-500/25",
        secondary: "bg-surface-200 text-text-primary hover:bg-surface-300 border border-border",
        ghost: "hover:bg-surface-100 text-text-secondary hover:text-text-primary",
        danger: "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/25"
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export const Button = React.forwardRef(({
  className,
  variant,
  size,
  loading = false,
  icon: Icon,
  children,
  ...props
}, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!loading && Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
});

Button.displayName = "Button";
```

## Molecule: AgentNode.jsx
```jsx
// src/components/molecules/AgentNode.jsx
import React from 'react';
import { CheckCircle, AlertTriangle, Database, Brain, Activity, FileText, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap = {
  'SuperAgent': Activity,
  'DataCollector': Database,
  'Analyzer': Brain,
  'Simulator': Activity,
  'Recommender': FileText,
  'Integrator': Send
};

const statusConfig = {
  idle: {
    bg: 'bg-surface-800',
    border: 'border-surface-600',
    glow: '',
    iconColor: 'text-text-muted',
    label: 'Inactivo'
  },
  active: {
    bg: 'bg-civic-900/30',
    border: 'border-civic-500',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-pulse',
    iconColor: 'text-civic-400',
    label: 'Procesando...'
  },
  success: {
    bg: 'bg-green-900/30',
    border: 'border-green-500',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    iconColor: 'text-green-400',
    label: 'Completado'
  },
  error: {
    bg: 'bg-red-900/30',
    border: 'border-red-500',
    glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
    iconColor: 'text-red-400',
    label: 'Error'
  }
};

export const AgentNode = ({ name, status, icon, progress = 0 }) => {
  const IconComponent = iconMap[name] || Database;
  const config = statusConfig[status] || statusConfig.idle;

  return (
    <div className={cn(
      "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-500",
      config.bg,
      config.border,
      config.glow
    )}>
      <div className={cn("mb-2", config.iconColor)}>
        <IconComponent className="h-8 w-8" />
      </div>

      <span className="text-xs font-semibold text-text-primary mb-1">
        {name}
      </span>

      <span className={cn("text-[10px] uppercase tracking-wider", config.iconColor)}>
        {config.label}
      </span>

      {status === 'active' && progress > 0 && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16">
          <div className="h-1 bg-surface-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-civic-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="absolute -top-2 -right-2">
          <CheckCircle className="h-5 w-5 text-green-400 bg-surface-900 rounded-full" />
        </div>
      )}

      {status === 'error' && (
        <div className="absolute -top-2 -right-2">
          <AlertTriangle className="h-5 w-5 text-red-400 bg-surface-900 rounded-full" />
        </div>
      )}
    </div>
  );
};
```

## Organism: TerminalConsole.jsx
```jsx
// src/components/organisms/TerminalConsole.jsx
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const LogEntry = ({ timestamp, agent, message, type }) => {
  const typeStyles = {
    info: 'text-text-secondary',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400'
  };

  return (
    <div className="font-mono text-sm py-1 px-2 hover:bg-surface-800/50 rounded">
      <span className="text-text-muted text-xs mr-2">[{timestamp}]</span>
      <span className="text-civic-400 text-xs mr-2">{agent}:</span>
      <span className={typeStyles[type] || typeStyles.info}>{message}</span>
    </div>
  );
};

export const TerminalConsole = ({ logs = [], autoScroll = true, maxLines = 100 }) => {
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  const visibleLogs = logs.slice(-maxLines);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  return (
    <div className="rounded-lg border border-surface-700 bg-surface-900/80 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-2 border-b border-surface-700">
        <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
          Terminal de Inferencia
        </span>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-text-muted">LIVE</span>
        </div>
      </div>

      <ScrollArea className="h-64" ref={scrollRef}>
        <div className="p-2">
          {visibleLogs.length === 0 ? (
            <div className="text-center text-text-muted text-sm py-8">
              Esperando ejecución...
            </div>
          ) : (
            visibleLogs.map((log, index) => (
              <LogEntry key={index} {...log} />
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
};
```

## Organism: SwarmVisualizer.jsx
```jsx
// src/components/organisms/SwarmVisualizer.jsx
import React from 'react';
import { AgentNode } from '@/components/molecules/AgentNode';
import { cn } from '@/lib/utils';

const agentConfig = [
  { id: 'super', name: 'SuperAgent', icon: 'Activity' },
  { id: 'collector', name: 'DataCollector', icon: 'Database' },
  { id: 'analyzer', name: 'Analyzer', icon: 'Brain' },
  { id: 'simulator', name: 'Simulator', icon: 'Activity' },
  { id: 'recommender', name: 'Recommender', icon: 'FileText' },
  { id: 'integrator', name: 'Integrator', icon: 'Send' }
];

export const SwarmVisualizer = ({ agents = [], activeAgent = null }) => {
  return (
    <div className="relative p-6 rounded-xl border border-surface-700 bg-surface-900/50">
      <h3 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
        Flujo de Agentes
      </h3>

      <div className="flex items-center justify-between gap-4">
        {agentConfig.map((agent, index) => {
          const agentState = agents.find(a => a.id === agent.id);
          const status = agentState?.status || 'idle';
          const progress = agentState?.progress || 0;

          return (
            <React.Fragment key={agent.id}>
              <AgentNode
                name={agent.name}
                status={status}
                icon={agent.icon}
                progress={progress}
              />
              {index < agentConfig.length - 1 && (
                <div className="flex-1 h-px bg-gradient-to-r from-surface-600 via-civic-500/50 to-surface-600" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
```
