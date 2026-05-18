# Storybook Stories - CivicPulse Components

## Atom: Button
```jsx
// atoms/Button.stories.jsx
import { Button } from './Button';

export default {
  title: 'Atoms/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger']
    },
    size: {
      control: 'select', 
      options: ['sm', 'md', 'lg']
    }
  }
};

export const Primary = {
  args: {
    children: 'Ejecutar Simulación',
    variant: 'primary',
    size: 'md'
  }
};

export const WithIcon = {
  args: {
    children: 'Exportar a OBP',
    variant: 'primary',
    size: 'md',
    icon: 'ExternalLink'
  }
};

export const Loading = {
  args: {
    children: 'Procesando...',
    variant: 'primary',
    size: 'md',
    loading: true
  }
};

export const Danger = {
  args: {
    children: 'Detener Simulación',
    variant: 'danger',
    size: 'md',
    icon: 'StopCircle'
  }
};
```

## Molecule: MetricCard
```jsx
// molecules/MetricCard.stories.jsx
import { MetricCard } from './MetricCard';

export default {
  title: 'Molecules/MetricCard',
  component: MetricCard
};

export const SecurityIndex = {
  args: {
    title: 'Índice de Seguridad',
    value: 45.2,
    unit: '%',
    trend: 'down',
    trendValue: -12.3,
    icon: 'Shield',
    color: 'danger'
  }
};

export const EmploymentRate = {
  args: {
    title: 'Desempleo Juvenil',
    value: 23.4,
    unit: '%',
    trend: 'up',
    trendValue: 5.2,
    icon: 'Briefcase',
    color: 'warning'
  }
};

export const LoadingState = {
  args: {
    title: 'Cargando...',
    loading: true
  }
};
```

## Organism: AgentNode
```jsx
// organisms/AgentNode.stories.jsx
import { AgentNode } from './AgentNode';

export default {
  title: 'Organisms/AgentNode',
  component: AgentNode
};

export const Idle = {
  args: {
    name: 'Data Collector',
    status: 'idle',
    icon: 'Database',
    progress: 0
  }
};

export const Active = {
  args: {
    name: 'Analyzer',
    status: 'active',
    icon: 'Brain',
    progress: 67
  }
};

export const Success = {
  args: {
    name: 'Simulator',
    status: 'success',
    icon: 'CheckCircle',
    progress: 100
  }
};

export const Error = {
  args: {
    name: 'Integrator',
    status: 'error',
    icon: 'AlertTriangle',
    progress: 45
  }
};
```

## Organism: TerminalConsole
```jsx
// organisms/TerminalConsole.stories.jsx
import { TerminalConsole } from './TerminalConsole';

export default {
  title: 'Organisms/TerminalConsole',
  component: TerminalConsole
};

const sampleLogs = [
  { timestamp: '10:00:01', agent: 'SuperAgent', message: 'Iniciando flujo #OBP-001', type: 'info' },
  { timestamp: '10:00:03', agent: 'DataCollector', message: 'INE data loaded: 15,234 records', type: 'success' },
  { timestamp: '10:00:15', agent: 'Analyzer', message: 'Clustering complete: 7 pain points identified', type: 'success' },
  { timestamp: '10:00:45', agent: 'Simulator', message: 'ABM running: month 6/120', type: 'info' },
  { timestamp: '10:01:02', agent: 'Simulator', message: 'Warning: Felicidad < 30 in sector joven_gig', type: 'warning' },
  { timestamp: '10:02:30', agent: 'Recommender', message: 'Top 3 recommendations generated', type: 'success' }
];

export const Default = {
  args: {
    logs: sampleLogs,
    autoScroll: true,
    maxLines: 100
  }
};

export const Empty = {
  args: {
    logs: [],
    autoScroll: true,
    maxLines: 100
  }
};

export const Overflow = {
  args: {
    logs: Array(50).fill(null).map((_, i) => ({
      timestamp: `10:${String(i).padStart(2, '0')}:00`,
      agent: 'System',
      message: `Log entry number ${i + 1}`,
      type: i % 3 === 0 ? 'warning' : 'info'
    })),
    autoScroll: true,
    maxLines: 20
  }
};
```
