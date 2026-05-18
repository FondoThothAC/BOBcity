# Component Inventory - CivicPulse React

## Atomic Design Hierarchy

### Atoms (Building Blocks)
| Component | File | Props | Used By |
|-----------|------|-------|---------|
| Button | atoms/Button.jsx | variant, size, icon, loading, disabled | Molecules, Organisms |
| Badge | atoms/Badge.jsx | color, label, dot | Cards, Lists |
| Icon | atoms/Icon.jsx | name (Lucide), size, color | Buttons, Nav |
| Avatar | atoms/Avatar.jsx | src, fallback, size | UserMenu, Comments |
| ProgressBar | atoms/ProgressBar.jsx | value, max, color, animated | Loaders, Simulations |
| Tooltip | atoms/Tooltip.jsx | content, position, delay | Icons, Metrics |
| Skeleton | atoms/Skeleton.jsx | width, height, circle | Loading states |

### Molecules (Simple Composites)
| Component | File | Props | Used By |
|-----------|------|-------|---------|
| MetricCard | molecules/MetricCard.jsx | title, value, trend, icon | DashboardHeader |
| AgentNode | molecules/AgentNode.jsx | name, status, icon, progress | SwarmVisualizer |
| LogEntry | molecules/LogEntry.jsx | timestamp, agent, message, type | TerminalConsole |
| LedgerRow | molecules/LedgerRow.jsx | timestamp, operation, hash, compliance | AuditTable |
| FilterChip | molecules/FilterChip.jsx | label, active, count | FilterBar |
| SearchInput | molecules/SearchInput.jsx | placeholder, value, onSearch | Header, MapSearch |

### Organisms (Complex UI Sections)
| Component | File | Props | Used By |
|-----------|------|-------|---------|
| DashboardHeader | organisms/DashboardHeader.jsx | territory, dateRange, kpis | DashboardView |
| PainPointsMap | organisms/PainPointsMap.jsx | territoryId, layers, filters | DashboardView |
| ABMSimulator | organisms/ABMSimulator.jsx | territoryId, policies, horizon | SimulationView |
| PredictorEngine | organisms/PredictorEngine.jsx | candidate, context, onResult | PredictionView |
| SwarmVisualizer | organisms/SwarmVisualizer.jsx | agents, activeAgent, progress | OrchestratorConsole |
| TerminalConsole | organisms/TerminalConsole.jsx | logs, autoScroll, maxLines | OrchestratorConsole |
| AuditTable | organisms/AuditTable.jsx | entries, onExport, onVerify | OrchestratorConsole |
| OBPExportModal | organisms/OBPExportModal.jsx | payload, status, onConfirm, onCancel | OrchestratorConsole |
| SidebarNav | organisms/SidebarNav.jsx | items, activeItem, onNavigate | AppShell |
| HeaderBar | organisms/HeaderBar.jsx | user, notifications, onSearch | AppShell |

### Templates (Page Layouts)
| Component | File | Slots | Used By |
|-----------|------|-------|---------|
| AppShell | templates/AppShell.jsx | sidebar, header, content, footer | App.jsx |
| DashboardLayout | templates/DashboardLayout.jsx | header, map, alerts, quickAccess | DashboardView |
| SimulationLayout | templates/SimulationLayout.jsx | controls, sandbox, results | SimulationView |
| OrchestratorLayout | templates/OrchestratorLayout.jsx | initiatives, swarm, terminal, ledger, results | OrchestratorConsole |

### Pages (Route-level Views)
| Component | File | Route | Templates Used |
|-----------|------|-------|----------------|
| DashboardView | pages/DashboardView.jsx | /dashboard | DashboardLayout |
| MapView | pages/MapView.jsx | /mapa | DashboardLayout |
| SimulationView | pages/SimulationView.jsx | /simulacion | SimulationLayout |
| PredictionView | pages/PredictionView.jsx | /predictor | DashboardLayout |
| OrchestratorView | pages/OrchestratorView.jsx | /orquestador | OrchestratorLayout |
| SettingsView | pages/SettingsView.jsx | /configuracion | AppShell |

## Component Dependency Graph

```
App.jsx
├── AppShell (template)
│   ├── SidebarNav (organism)
│   │   ├── NavItem (molecule)
│   │   │   ├── Icon (atom)
│   │   │   └── Badge (atom)
│   ├── HeaderBar (organism)
│   │   ├── SearchInput (molecule)
│   │   ├── NotificationBell (molecule)
│   │   │   └── Badge (atom)
│   │   └── UserMenu (molecule)
│   │       ├── Avatar (atom)
│   │       └── Dropdown (molecule)
│   └── Content (slot)
│       ├── DashboardView (page)
│       │   └── DashboardLayout (template)
│       │       ├── DashboardHeader (organism)
│       │       │   └── MetricCard (molecule)
│       │       │       ├── Skeleton (atom) [loading]
│       │       │       ├── Icon (atom)
│       │       │       └── Badge (atom)
│       │       ├── PainPointsMap (organism)
│       │       │   ├── FilterBar (molecule)
│       │       │   │   └── FilterChip (molecule)
│       │       │   └── LeafletMap (3rd party)
│       │       ├── AlertPanel (organism)
│       │       │   └── AlertCard (molecule)
│       │       └── QuickAccess (organism)
│       │           └── ActionCard (molecule)
│       ├── SimulationView (page)
│       │   └── SimulationLayout (template)
│       │       ├── PolicyControls (organism)
│       │       ├── ABMSandbox (organism)
│       │       │   └── ChartArea (molecule)
│       │       │       └── Recharts (3rd party)
│       │       └── ResultsPanel (organism)
│       └── OrchestratorView (page)
│           └── OrchestratorLayout (template)
│               ├── InitiativePanel (organism)
│               ├── SwarmVisualizer (organism)
│               │   └── AgentNode (molecule)
│               ├── TerminalConsole (organism)
│               │   └── LogEntry (molecule)
│               ├── AuditTable (organism)
│               │   └── LedgerRow (molecule)
│               └── ResultsExport (organism)
│                   └── OBPExportModal (organism)
```
