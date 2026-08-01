# OSINT Web Application - Implementation Plan

**Codename:** `osint-web` (OSINT Command Center)
**Target IP:** 132.226.114.179 (alongside CivicaOS)
**Stack:** React 19 + TypeScript + Tailwind v4 + Go Fiber Backend
**Team Size:** 5-10 users (simple JWT auth)

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Pages/Views](#2-pagesviews)
3. [Component Architecture](#3-component-architecture)
4. [State Management](#4-state-management)
5. [Go Backend Additions](#5-go-backend-additions)
6. [WebSocket Protocol](#6-websocket-protocol)
7. [Agent Flow](#7-agent-flow)
8. [Report Generation](#8-report-generation)
9. [Deployment](#9-deployment)
10. [Sprint Plan](#10-sprint-plan)

---

## 1. Project Structure

### 1.1 Frontend: `osint-web/`

```
osint-web/
├── public/
│   ├── favicon.ico
│   ├── fonts/
│   │   └── press-start-2p.woff2          # Pixel-art font
│   └── sprites/
│       ├── tool-icons/                    # 16x16 pixel icons per tool
│       └── bg-tiles.png                   # Retro tile background
│
├── src/
│   ├── main.tsx                           # Entry point
│   ├── App.tsx                            # Root with router + auth guard
│   ├── vite-env.d.ts
│   │
│   ├── api/                               # API client layer
│   │   ├── client.ts                      # Axios instance with JWT interceptor
│   │   ├── auth.ts                        # login(), logout(), me()
│   │   ├── investigate.ts                 # startInvestigation(), getInvestigation()
│   │   ├── tools.ts                       # listTools(), runTool(), getToolStatus()
│   │   ├── reports.ts                     # getReport(), generateReport()
│   │   └── ws.ts                          # WebSocket manager (reconnect, heartbeat)
│   │
│   ├── types/                             # TypeScript interfaces
│   │   ├── auth.d.ts                      # User, LoginRequest, LoginResponse
│   │   ├── investigation.d.ts             # Investigation, ToolExecution, AgentPlan
│   │   ├── tool.d.ts                      # OSTool, ToolCategory, ToolResult
│   │   ├── report.d.ts                    # Report, ReportSection
│   │   └── websocket.d.ts                 # WSMessage, WSLogEntry, WSEvent
│   │
│   ├── store/                             # Zustand state stores
│   │   ├── authStore.ts                   # Token, user, isAuthenticated
│   │   ├── investigationStore.ts          # Active investigations, history
│   │   ├── toolStore.ts                   # Tool catalog, categories, statuses
│   │   ├── logStore.ts                    # Real-time log buffer
│   │   └── reportStore.ts                 # Generated reports
│   │
│   ├── hooks/                             # Custom React hooks
│   │   ├── useAuth.ts                     # Auth state + login/logout
│   │   ├── useWebSocket.ts                # WS connection lifecycle
│   │   ├── useInvestigation.ts            # Investigation CRUD
│   │   ├── useToolRunner.ts               # Execute single tool
│   │   └── useAgentChat.ts                # Chat interface logic
│   │
│   ├── components/                        # Shared components
│   │   ├── layout/
│   │   │   ├── AppShell.tsx               # Main layout: sidebar + content
│   │   │   ├── Sidebar.tsx                # Retro-styled navigation
│   │   │   ├── Header.tsx                 # Top bar with user + notifications
│   │   │   └── StatusBar.tsx              # Bottom bar: connection status, uptime
│   │   │
│   │   ├── ui/                            # Design system primitives
│   │   │   ├── PixelButton.tsx            # Retro button with pixel borders
│   │   │   ├── TileCard.tsx               # Windows Start menu tile
│   │   │   ├── RetroPanel.tsx             # Panel with pixel-art border
│   │   │   ├── GlowInput.tsx              # Neon-glow text input
│   │   │   ├── ScanlineOverlay.tsx        # CRT scanline effect
│   │   │   ├── ProgressBar.tsx            # Pixel-art progress bar
│   │   │   ├── Badge.tsx                  # Status badges (online/error/idle)
│   │   │   └── Tooltip.tsx
│   │   │
│   │   ├── chat/                          # Agent chat interface
│   │   │   ├── ChatPanel.tsx              # Main chat container
│   │   │   ├── ChatMessage.tsx            # Single message (user/agent/system)
│   │   │   ├── ChatInput.tsx              # Text input with "Investigate X" prompt
│   │   │   ├── AgentThinking.tsx          # Animated "agent working" indicator
│   │   │   └── ToolSelectionPreview.tsx   # Shows which tools agent will run
│   │   │
│   │   ├── dashboard/                     # Dashboard tiles
│   │   │   ├── InvestigationTile.tsx      # Active investigation card
│   │   │   ├── ToolStatusTile.tsx         # Tool online/offline status
│   │   │   ├── RecentReportsTile.tsx      # Latest reports list
│   │   │   ├── StatsTile.tsx              # Counter: investigations, tools, reports
│   │   │   └── QuickActionsTile.tsx       # Shortcut buttons
│   │   │
│   │   ├── explorer/                      # Tool explorer
│   │   │   ├── ToolGrid.tsx              # Grid of tool tiles
│   │   │   ├── ToolCard.tsx              # Single tool card (icon, name, status)
│   │   │   ├── CategoryFilter.tsx         # Sidebar filter by category
│   │   │   └── ToolDetailModal.tsx        # Tool detail + manual run
│   │   │
│   │   ├── investigation/                 # Investigation views
│   │   │   ├── InvestigationTimeline.tsx  # Chronological event feed
│   │   │   ├── ToolResultsPanel.tsx       # Raw output from each tool
│   │   │   ├── ConsolidatedReport.tsx     # Merged report view
│   │   │   └── InvestigationHeader.tsx    # Target, status, duration
│   │   │
│   │   ├── logs/                          # Real-time log viewer
│   │   │   ├── LogStream.tsx              # Auto-scrolling log terminal
│   │   │   ├── LogEntry.tsx               # Single log line with color coding
│   │   │   └── LogFilter.tsx              # Filter by tool/severity
│   │   │
│   │   └── reports/                       # Report views
│   │       ├── ReportViewer.tsx           # Markdown/HTML report renderer
│   │       ├── ReportExporter.tsx         # PDF/MD export buttons
│   │       └── ReportHistory.tsx          # List of past reports
│   │
│   ├── pages/                             # Route-level page components
│   │   ├── LoginPage.tsx                  # /login - pixel-art login screen
│   │   ├── DashboardPage.tsx              # / - main dashboard (tiles)
│   │   ├── ChatPage.tsx                   # /chat - agent chat interface
│   │   ├── ExplorerPage.tsx               # /explorer - tool catalog
│   │   ├── InvestigationPage.tsx          # /investigation/:id - active case
│   │   ├── ReportsPage.tsx                # /reports - report history
│   │   ├── LogsPage.tsx                   # /logs - live log stream
│   │   └── SettingsPage.tsx               # /settings - user preferences
│   │
│   ├── lib/                               # Utilities
│   │   ├── constants.ts                   # API URLs, tool categories
│   │   ├── formatters.ts                  # Date, file size, truncation
│   │   └── pixelTheme.ts                  # Retro theme constants
│   │
│   └── styles/
│       └── globals.css                    # Tailwind v4 + retro CSS variables
│
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
└── .env                                    # VITE_API_URL=http://132.226.114.179:3001
```

### 1.2 Go Backend Additions: `engine-go/`

```
engine-go/
├── internal/
│   ├── handlers/
│   │   ├── osint_handler.go              # (existing - extend)
│   │   ├── ws_handler.go                 # NEW: WebSocket upgrade + log streaming
│   │   ├── report_handler.go             # NEW: Report generation endpoints
│   │   └── tool_catalog_handler.go       # NEW: Tool catalog API
│   │
│   ├── websocket/
│   │   ├── hub.go                        # NEW: WS connection manager (Hub pattern)
│   │   ├── client.go                     # NEW: Individual WS client
│   │   └── messages.go                   # NEW: WS message types
│   │
│   ├── agent/
│   │   ├── orchestrator.go               # NEW: Agent that decides which tools to run
│   │   ├── ollama_client.go              # NEW: Ollama LLM integration
│   │   └── tool_planner.go               # NEW: Maps natural language → tool list
│   │
│   ├── report/
│   │   ├── generator.go                  # NEW: Consolidated report builder
│   │   ├── markdown.go                   # NEW: Markdown template renderer
│   │   └── pdf.go                        # NEW: PDF export (using Go PDF library)
│   │
│   └── osint/
│       ├── dispatcher.go                 # (existing - extend with WS log hooks)
│       └── tool_registry.go              # NEW: Dynamic tool registry from JSON config
│
├── data/
│   └── tools.json                        # NEW: Tool catalog (106 tools metadata)
│
└── go.mod                                # Add: gorilla/websocket, johnfercher-maroto (PDF)
```

---

## 2. Pages/Views

### 2.1 Login Page (`/login`)
- **Retro pixel-art aesthetic** with CRT scanline overlay
- Simple username/password form (admin/thoth2026)
- Pixel-art logo animation on load
- Stores JWT in localStorage

### 2.2 Dashboard (`/`)
- **Windows Start menu tile grid** layout (2-4 column responsive)
- **Tiles:**
  - `Active Investigations` - count + last 3 investigations
  - `Tool Status` - green/yellow/red indicators for all 106 tools
  - `Recent Reports` - last 5 generated reports
  - `Quick Actions` - "New Investigation", "Browse Tools", "View Logs"
  - `Stats` - total investigations, tools available, reports generated
- **Retro pixel-art icons** on each tile
- Clicking a tile navigates to the relevant page

### 2.3 Chat/Agent Interface (`/chat`)
- **Main feature page** - split into 3 panels:
  - **Left (Chat):** Chat message history + input box
  - **Center (Agent Thinking):** Shows the agent's plan: "I'll run these tools: Sherlock, Harvester, GHunt..."
  - **Right (Live Results):** Real-time tool execution logs streaming via WebSocket
- **Input:** "Investigate [person/company name]" triggers the agent
- **Agent Response:** Shows step-by-step what tools are running and results as they come in

### 2.4 Tool Explorer (`/explorer`)
- **Visual catalog** of all 106 OSINT tools
- **Category sidebar** with 15 categories (from osint_go_forks):
  - Username Recon, Social Media, Email Recon, Domain Recon, IP/Network, etc.
- **Grid of tool cards** with:
  - Tool name, icon (pixel-art)
  - Status badge: `online` / `offline` / `needs-setup`
  - Brief description
  - "Run" button for manual execution
- **Search bar** to filter tools by name

### 2.5 Investigation Detail (`/investigation/:id`)
- **Header:** Target name, status (running/completed), start time, duration
- **Tabbed content:**
  - `Timeline` - Chronological list of tool executions with timestamps
  - `Tool Results` - Raw output from each tool (expandable)
  - `Consolidated Report` - Merged markdown/HTML report
  - `Logs` - Full log stream for this investigation
- **Export buttons:** Download as PDF, Markdown, or JSON

### 2.6 Reports Page (`/reports`)
- **Table/list of all generated reports**
- Each row: report name, target, date, tools used, status
- Click to view in ReportViewer
- Export options per report

### 2.7 Live Logs Page (`/logs`)
- **Full-screen terminal-style log viewer**
- Auto-scrolling with pause/resume
- Color-coded by tool/severity
- Filter by: tool name, investigation ID, log level
- WebSocket-powered real-time updates

### 2.8 Settings Page (`/settings`)
- API connection settings
- Ollama model configuration
- User preferences (theme, notifications)
- Tool configuration (enable/disable tools)

---

## 3. Component Architecture

### 3.1 Key Component Responsibilities

```
┌─────────────────────────────────────────────────────────┐
│                      App.tsx                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Router (react-router-dom v6)                    │   │
│  │  AuthGuard (redirects to /login if no token)     │   │
│  │  WebSocketProvider (manages WS connection)       │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   AppShell.tsx                          │
│  ┌──────────┬──────────────────────────────────────┐   │
│  │          │           Header.tsx                  │   │
│  │ Sidebar  ├──────────────────────────────────────┤   │
│  │          │                                      │   │
│  │ ┌──────┐ │        {children}                    │   │
│  │ │ Nav  │ │        (Page content)                │   │
│  │ │Items │ │                                      │   │
│  │ └──────┘ │                                      │   │
│  │          ├──────────────────────────────────────┤   │
│  │          │         StatusBar.tsx                 │   │
│  └──────────┴──────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Component Hierarchy

```
App
├── LoginPage
│   └── PixelButton, GlowInput, ScanlineOverlay
│
├── AppShell (authenticated routes)
│   ├── Sidebar
│   │   └── NavItem (pixel-art icon + label)
│   ├── Header
│   │   └── Badge, Tooltip
│   ├── StatusBar
│   │   └── Badge (WS connection status)
│   │
│   ├── DashboardPage
│   │   ├── InvestigationTile
│   │   ├── ToolStatusTile
│   │   ├── RecentReportsTile
│   │   ├── StatsTile
│   │   └── QuickActionsTile
│   │
│   ├── ChatPage
│   │   ├── ChatPanel
│   │   │   ├── ChatMessage (user)
│   │   │   ├── ChatMessage (agent)
│   │   │   ├── ChatMessage (system)
│   │   │   └── AgentThinking
│   │   ├── ChatInput
│   │   └── ToolSelectionPreview
│   │
│   ├── ExplorerPage
│   │   ├── CategoryFilter
│   │   ├── ToolGrid
│   │   │   └── ToolCard × N
│   │   └── ToolDetailModal
│   │
│   ├── InvestigationPage
│   │   ├── InvestigationHeader
│   │   ├── InvestigationTimeline
│   │   ├── ToolResultsPanel
│   │   ├── ConsolidatedReport
│   │   └── LogStream
│   │
│   ├── ReportsPage
│   │   ├── ReportHistory
│   │   ├── ReportViewer
│   │   └── ReportExporter
│   │
│   └── LogsPage
│       ├── LogStream
│       └── LogFilter
```

---

## 4. State Management

### 4.1 Zustand Stores

```typescript
// authStore.ts
interface AuthState {
  token: string | null;
  user: { username: string; role: string } | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// investigationStore.ts
interface InvestigationState {
  active: Investigation | null;
  history: Investigation[];
  start: (prompt: string, tier: number) => Promise<string>; // returns ID
  stop: (id: string) => void;
  updateStatus: (id: string, status: InvestigationStatus) => void;
  addToolResult: (id: string, result: ToolResult) => void;
}

// toolStore.ts
interface ToolState {
  tools: OSTool[];
  categories: ToolCategory[];
  selectedTool: OSTool | null;
  fetchCatalog: () => Promise<void>;
  setSelectedTool: (tool: OSTool | null) => void;
}

// logStore.ts
interface LogState {
  logs: LogEntry[];
  maxLogs: number; // 1000 (ring buffer)
  addLog: (entry: LogEntry) => void;
  clearLogs: () => void;
  filterBy: (criteria: LogFilter) => LogEntry[];
}

// reportStore.ts
interface ReportState {
  reports: Report[];
  currentReport: Report | null;
  fetchReports: () => Promise<void>;
  setCurrentReport: (id: string) => void;
  generateReport: (investigationId: string) => Promise<void>;
}
```

### 4.2 Data Flow Diagram

```
User types "Investigate John Doe" in ChatInput
    │
    ▼
useAgentChat hook calls POST /api/v1/agent/investigate
    │
    ▼
Go backend receives request, calls Ollama for tool selection
    │
    ▼
Go backend starts investigation, returns { investigation_id, plan }
    │
    ├──► investigationStore.start() saves to active investigation
    ├──► ChatPanel shows agent's plan as a message
    │
    ▼
Go backend starts running tools in parallel
    │
    ▼
For each tool execution, Go sends WS message:
    { type: "log", tool: "sherlock", message: "Checking GitHub...", investigation_id: "abc" }
    │
    ├──► WS hook receives message
    ├──► logStore.addLog() adds to log buffer
    ├──► LogStream component auto-updates
    │
    ▼
Tool completes, Go sends:
    { type: "tool_complete", tool: "sherlock", result: {...}, investigation_id: "abc" }
    │
    ├──► investigationStore.addToolResult() updates investigation
    ├──► InvestigationTimeline updates
    │
    ▼
All tools done, Go sends:
    { type: "investigation_complete", investigation_id: "abc", report: {...} }
    │
    ├──► reportStore saves new report
    ├──► ChatPanel shows "Investigation complete" message
    └──► InvestigationPage shows full results
```

---

## 5. Go Backend Additions

### 5.1 New Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/api/osint/tools` | List all tools with status | JWT |
| `GET` | `/api/osint/tools/:id` | Get tool details | JWT |
| `POST` | `/api/osint/tools/:id/run` | Run a specific tool manually | JWT |
| `GET` | `/api/v1/investigations` | List all investigations | JWT |
| `GET` | `/api/v1/investigations/:id` | Get investigation details | JWT |
| `DELETE` | `/api/v1/investigations/:id` | Cancel running investigation | JWT |
| `WS` | `/ws/logs` | WebSocket for real-time log streaming | JWT (query param) |
| `WS` | `/ws/investigation/:id` | WebSocket for specific investigation | JWT |
| `GET` | `/api/v1/reports` | List all reports | JWT |
| `GET` | `/api/v1/reports/:id` | Get report content | JWT |
| `POST` | `/api/v1/reports/generate` | Generate report from investigation | JWT |
| `GET` | `/api/v1/reports/:id/pdf` | Download PDF report | JWT |

### 5.2 WebSocket Handler (`ws_handler.go`)

```go
// Hub manages all WebSocket connections
type Hub struct {
    clients    map[*Client]bool
    broadcast  chan []byte
    register   chan *Client
    unregister chan *Client
}

// Client represents a single WebSocket connection
type Client struct {
    hub  *Hub
    conn *websocket.Conn
    send chan []byte
    // Filter: subscribe to specific investigation_id
    investigationID string
}

// WSMessage is the envelope for all WS messages
type WSMessage struct {
    Type            string      `json:"type"` // "log", "tool_start", "tool_complete", "investigation_complete", "error"
    InvestigationID string      `json:"investigation_id"`
    Timestamp       time.Time   `json:"timestamp"`
    Payload         interface{} `json:"payload"`
}
```

### 5.3 Agent Orchestrator (`agent/orchestrator.go`)

```go
// Orchestrator analyzes user input and selects appropriate tools
type Orchestrator struct {
    ollamaClient *OllamaClient
    toolRegistry *ToolRegistry
}

// AgentPlan represents the tools to run for an investigation
type AgentPlan struct {
    TargetName string   `json:"target_name"`
    TargetType string   `json:"target_type"` // "person", "company", "domain", "email"
    Tools      []string `json:"tools"`
    Tier       int      `json:"tier"`
    Reasoning  string   `json:"reasoning"`
}

// PlanInvestigation uses LLM to determine which tools to run
func (o *Orchestrator) PlanInvestigation(ctx context.Context, prompt string) (AgentPlan, error) {
    // 1. Call Ollama with a prompt that describes all available tools
    // 2. LLM returns JSON with tool selections
    // 3. Return the plan
}

// ExecutePlan runs all tools in the plan concurrently
func (o *Orchestrator) ExecutePlan(ctx context.Context, plan AgentPlan, wsHub *Hub) error {
    // 1. Start investigation record
    // 2. Launch goroutine for each tool
    // 3. Stream logs via WS hub
    // 4. Collect results
    // 5. Generate consolidated report
}
```

### 5.4 Tool Registry (`osint/tool_registry.go`)

```go
// ToolRegistry holds metadata about all available tools
type ToolRegistry struct {
    tools []ToolMeta
}

type ToolMeta struct {
    ID          string   `json:"id"`
    Name        string   `json:"name"`
    Category    string   `json:"category"`
    Description string   `json:"description"`
    Type        string   `json:"type"`       // "native_go", "cli_wrapper", "api_only"
    Status      string   `json:"status"`     // "online", "offline", "needs_setup"
    BinaryPath  string   `json:"binary_path,omitempty"`
    TargetTypes []string `json:"target_types"` // ["username", "email", "domain"]
}

// LoadFromJSON loads tool definitions from data/tools.json
func (r *ToolRegistry) LoadFromJSON(path string) error { ... }
```

---

## 6. WebSocket Protocol

### 6.1 Connection

```
ws://132.226.114.179:3001/ws/logs?token=JWT_TOKEN
```

### 6.2 Message Types

#### Server → Client

```json
// Tool execution starts
{
  "type": "tool_start",
  "investigation_id": "inv_abc123",
  "timestamp": "2026-08-01T12:00:00Z",
  "payload": {
    "tool_id": "sherlock",
    "tool_name": "Sherlock Go Native",
    "target": "johndoe"
  }
}

// Real-time log line
{
  "type": "log",
  "investigation_id": "inv_abc123",
  "timestamp": "2026-08-01T12:00:01Z",
  "payload": {
    "tool_id": "sherlock",
    "level": "info",
    "message": "Checking GitHub for username 'johndoe'..."
  }
}

// Tool execution complete
{
  "type": "tool_complete",
  "investigation_id": "inv_abc123",
  "timestamp": "2026-08-01T12:00:05Z",
  "payload": {
    "tool_id": "sherlock",
    "status": "completed",
    "matches_found": 3,
    "execution_time_ms": 4200,
    "results": [
      { "source": "GitHub", "url": "https://github.com/johndoe", "confidence": 0.95 }
    ]
  }
}

// All tools done
{
  "type": "investigation_complete",
  "investigation_id": "inv_abc123",
  "timestamp": "2026-08-01T12:01:30Z",
  "payload": {
    "total_tools": 5,
    "successful": 4,
    "failed": 1,
    "report_id": "rpt_xyz789"
  }
}

// Error
{
  "type": "error",
  "investigation_id": "inv_abc123",
  "timestamp": "2026-08-01T12:00:02Z",
  "payload": {
    "tool_id": "ghunt",
    "error": "Authentication required - set GHUNT_EMAIL env var"
  }
}

// Heartbeat (every 30s)
{
  "type": "heartbeat",
  "timestamp": "2026-08-01T12:00:30Z"
}
```

#### Client → Server

```json
// Subscribe to investigation logs
{
  "action": "subscribe",
  "investigation_id": "inv_abc123"
}

// Unsubscribe
{
  "action": "unsubscribe",
  "investigation_id": "inv_abc123"
}
```

### 6.3 Frontend WebSocket Hook

```typescript
// hooks/useWebSocket.ts
function useWebSocket(investigationId?: string) {
  const { addLog } = useLogStore();
  const { updateInvestigation } = useInvestigationStore();

  useEffect(() => {
    const token = useAuthStore.getState().token;
    const ws = new WebSocket(
      `ws://${API_HOST}/ws/logs?token=${token}`
    );

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      switch (msg.type) {
        case 'log':
          addLog(msg.payload);
          break;
        case 'tool_start':
        case 'tool_complete':
          updateInvestigation(msg.investigation_id, msg);
          break;
        case 'investigation_complete':
          // Refresh investigation data
          break;
      }
    };

    return () => ws.close();
  }, [investigationId]);
}
```

---

## 7. Agent Flow

### 7.1 End-to-End Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. USER INPUT                                              │
│  User types: "Investigate john_doe" in ChatInput            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  2. AGENT PLAN (Go backend)                                 │
│  POST /api/v1/agent/investigate { prompt: "Investigate..." }│
│                                                              │
│  Orchestrator.PlanInvestigation()                            │
│  ├─ Extract target: "john_doe"                              │
│  ├─ Detect type: "username" (looks like a username)         │
│  ├─ Call Ollama: "Which OSINT tools for username 'john_doe'?"│
│  └─ Ollama returns: ["sherlock", "spiderfoot", "osintgram"] │
│                                                              │
│  Response: {                                                 │
│    investigation_id: "inv_abc123",                           │
│    plan: { target: "john_doe", tools: ["sherlock", ...] },   │
│    status: "started"                                         │
│  }                                                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  3. PARALLEL EXECUTION                                      │
│  ExecutePlan() launches goroutines:                         │
│                                                              │
│  Goroutine 1: sherlock.Execute("john_doe")                  │
│  ├─ WS: { type: "tool_start", tool: "sherlock" }           │
│  ├─ WS: { type: "log", message: "Checking GitHub..." }     │
│  ├─ WS: { type: "log", message: "Found profile!" }         │
│  └─ WS: { type: "tool_complete", matches: [...] }          │
│                                                              │
│  Goroutine 2: spiderfoot.Execute("john_doe")                │
│  ├─ WS: { type: "tool_start", tool: "spiderfoot" }         │
│  ├─ WS: { type: "log", message: "Running modules..." }     │
│  └─ WS: { type: "tool_complete", matches: [...] }          │
│                                                              │
│  Goroutine 3: osintgram.Execute("john_doe")                 │
│  ├─ WS: { type: "tool_start", tool: "osintgram" }          │
│  └─ WS: { type: "tool_complete", matches: [...] }          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  4. REPORT GENERATION                                       │
│  After all tools complete:                                   │
│  ├─ Merge all tool results into OSINTReport                │
│  ├─ Call Ollama: "Summarize these OSINT findings for..."    │
│  ├─ Generate markdown report                                 │
│  ├─ Save to civicaos-vault/entities/                        │
│  └─ WS: { type: "investigation_complete", report_id: ... } │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  5. FRONTEND DISPLAY                                        │
│  ChatPanel shows:                                            │
│  ┌──────────────────────────────────────────────────┐       │
│  │ 🤖 Agent: Investigation complete for "john_doe"  │       │
│  │                                                    │       │
│  │ Tools executed:                                    │       │
│  │ ✅ Sherlock Go - 3 profiles found                 │       │
│  │ ✅ SpiderFoot - 12 data points collected          │       │
│  │ ❌ Osintgram - Authentication required             │       │
│  │                                                    │       │
│  │ [View Full Report] [Download PDF]                  │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Target Type Detection

```go
func detectTargetType(input string) string {
    // Email pattern
    if matched, _ := regexp.MatchString(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`, input); matched {
        return "email"
    }
    // Domain pattern
    if matched, _ := regexp.MatchString(`^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`, input); matched {
        return "domain"
    }
    // IP pattern
    if matched, _ := regexp.MatchString(`^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$`, input); matched {
        return "ip"
    }
    // Default: username
    return "username"
}
```

### 7.3 Ollama Prompt for Tool Selection

```
You are an OSINT agent planner. Given the target "{target}" of type "{target_type}",
select the best tools to investigate.

Available tools:
- sherlock: Username search across 300+ social networks (native Go)
- theharvester: Email, subdomain, and name extraction (native Go)
- ghunt: Google account investigation
- spiderfoot: Automated OSINT collection
- osintgram: Instagram investigation
- holehe: Email to social media accounts
- phoneinfoga: Phone number investigation
- subfinder: Subdomain discovery
- amass: Network mapping
- photon: Web crawler
- [list all 106 tools with brief descriptions]

Return a JSON array of tool IDs to run, ordered by relevance.
Target: {target}
Target Type: {target_type}
```

---

## 8. Report Generation

### 8.1 Strategy: **Go Backend** for report generation

Reports are generated on the Go backend because:
1. Access to raw tool output (already in memory/files)
2. Can generate PDF using Go libraries (johnfercher/maroto)
3. Centralized for all users
4. Faster than sending all data to frontend

### 8.2 Report Structure

```markdown
# OSINT Investigation Report
**Target:** john_doe
**Type:** Username
**Date:** 2026-08-01
**Duration:** 1m 30s
**Tools Executed:** 5 (4 successful, 1 failed)

---

## Executive Summary
[AI-generated summary via Ollama]

## Findings by Category

### Social Media Profiles
| Platform | URL | Status |
|----------|-----|--------|
| GitHub | https://github.com/johndoe | Active |
| X (Twitter) | https://x.com/johndoe | Active |

### Email Addresses
| Email | Source | Confidence |
|-------|--------|------------|
| john@example.com | theHarvester | 0.85 |

### Subdomains
| Subdomain | Source |
|-----------|--------|
| api.example.com | crt.sh |

## Raw Tool Output

### Sherlock Go Native
```text
[raw output]
```

### Harvester Go Native
```text
[raw output]
```

## Failed Tools
- **osintgram:** Authentication required (Instagram login needed)

---
*Generated by CivicaOS OSINT Engine*
```

### 8.3 PDF Generation (Go)

```go
// report/pdf.go
func GeneratePDF(report OSINTReport, outputPath string) error {
    // Using github.com/johnfercher/maroto
    // Creates a professional PDF with:
    // - Title page with target info
    // - Table of contents
    // - Findings tables
    // - Raw output sections
    // - Charts (tool execution times)
}
```

---

## 9. Deployment

### 9.1 Architecture on VPS (132.226.114.179)

```
┌─────────────────────────────────────────────────────────────┐
│                    VPS: 132.226.114.179                     │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Nginx (ports 80, 443)                               │    │
│  │                                                       │    │
│  │  / ──────────────► :5001 (CivicaOS Node.js)         │    │
│  │  /go/* ──────────► :3001 (Go Fiber Engine)           │    │
│  │  /osint/* ───────► :3001 (Go Fiber - OSINT Web)      │    │
│  │                                                       │    │
│  │  /ws ────────────► :3001 (WebSocket upgrade)          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  CivicaOS    │  │  Go Engine   │  │  Ollama      │     │
│  │  (Node.js)   │  │  (Go Fiber)  │  │  :11434      │     │
│  │  :5001       │  │  :3001       │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  OSINT Tools (/opt/osint-tools/)                     │    │
│  │  - sherlock, theharvester, ghunt, spiderfoot, etc.   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Deployment Steps

```bash
# 1. Build the frontend
cd osint-web/
npm run build

# 2. Copy dist/ to VPS
scp -r dist/ root@132.226.114.179:/opt/osint-web/dist/

# 3. Build Go backend with new endpoints
cd engine-go/
GOOS=linux GOARCH=amd64 go build -o civicaos-engine-go ./cmd/

# 4. Copy binary to VPS
scp civicaos-engine-go root@132.226.114.179:/opt/engine-go/

# 5. Update Nginx config to serve osint-web
# Add location block for /osint/ → :3001 static files

# 6. Restart services
ssh root@132.226.114.179 "systemctl restart civicaos-engine"
```

### 9.3 Nginx Configuration Addition

```nginx
# OSINT Web App (served by Go engine)
location /osint/ {
    proxy_pass http://127.0.0.1:3001/osint/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 86400;  # WebSocket timeout
}

# WebSocket endpoint
location /ws/ {
    proxy_pass http://127.0.0.1:3001/ws/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 86400;
}
```

---

## 10. Sprint Plan

### Sprint 1: Foundation (Week 1-2)
**Goal:** Skeleton app with auth + login page + basic layout

| Task | Owner | Hours |
|------|-------|-------|
| Create `osint-web/` project with Vite + React 19 + TS + Tailwind v4 | Full Stack | 4 |
| Set up project structure (directories, types, API layer) | Full Stack | 6 |
| Implement Zustand stores (auth, tool, log) | Frontend | 8 |
| Build LoginPage with pixel-art aesthetic | Frontend | 12 |
| Build AppShell layout (Sidebar, Header, StatusBar) | Frontend | 12 |
| Implement useAuth hook + JWT flow | Frontend | 6 |
| Extend Go backend: tool catalog endpoint (`GET /api/osint/tools`) | Backend | 8 |
| Create `data/tools.json` with 106 tools metadata | Backend | 8 |
| Set up Go WebSocket hub pattern (`websocket/hub.go`, `client.go`) | Backend | 12 |
| Deploy skeleton to 132.226.114.179 | Full Stack | 4 |

**Deliverable:** Deployed app with login, sidebar navigation, and tool catalog API.

---

### Sprint 2: Tool Explorer + Manual Run (Week 3-4)
**Goal:** Visual tool catalog + ability to run individual tools

| Task | Owner | Hours |
|------|-------|-------|
| Build ToolGrid + ToolCard components | Frontend | 12 |
| Build CategoryFilter sidebar | Frontend | 6 |
| Build ToolDetailModal | Frontend | 8 |
| Implement ExplorerPage with filtering/search | Frontend | 8 |
| Implement useToolRunner hook | Frontend | 4 |
| Build WebSocket log stream integration | Frontend + Backend | 12 |
| Build LogStream + LogEntry components | Frontend | 8 |
| Extend dispatcher.go to emit WS messages during execution | Backend | 12 |
| Build LogsPage (full terminal view) | Frontend | 8 |
| Deploy + test tool catalog and manual execution | Full Stack | 6 |

**Deliverable:** Users can browse 106 tools, see status, run any tool manually, and watch logs in real-time.

---

### Sprint 3: Agent Chat + Auto-Investigation (Week 5-6)
**Goal:** "Investigate X" chat interface with automatic tool selection

| Task | Owner | Hours |
|------|-------|-------|
| Build ChatPanel, ChatMessage, ChatInput components | Frontend | 12 |
| Build AgentThinking animated indicator | Frontend | 6 |
| Build ToolSelectionPreview component | Frontend | 6 |
| Implement useAgentChat hook | Frontend | 8 |
| Build Agent orchestrator in Go (`agent/orchestrator.go`) | Backend | 16 |
| Integrate Ollama for tool selection (`agent/ollama_client.go`) | Backend | 12 |
| Implement target type detection logic | Backend | 4 |
| Build investigation tracking (in-memory + file) | Backend | 8 |
| Connect frontend chat to backend agent endpoint | Full Stack | 6 |
| Deploy + test full investigation flow | Full Stack | 6 |

**Deliverable:** User types "Investigate John Doe", agent auto-selects and runs tools, logs stream in real-time.

---

### Sprint 4: Investigation Detail + Reports (Week 7-8)
**Goal:** Full investigation view + report generation (PDF/Markdown)

| Task | Owner | Hours |
|------|-------|-------|
| Build InvestigationPage (header, tabs, timeline) | Frontend | 12 |
| Build InvestigationTimeline component | Frontend | 8 |
| Build ToolResultsPanel (raw output viewer) | Frontend | 8 |
| Build ConsolidatedReport component | Frontend | 8 |
| Build ReportsPage (history list) | Frontend | 8 |
| Build ReportViewer + ReportExporter | Frontend | 8 |
| Implement report generation in Go (`report/generator.go`) | Backend | 16 |
| Implement markdown renderer (`report/markdown.go`) | Backend | 6 |
| Implement PDF export (`report/pdf.go`) | Backend | 12 |
| Connect report endpoints to frontend | Full Stack | 6 |
| Deploy + test report generation | Full Stack | 6 |

**Deliverable:** Full investigation detail view, report generation, PDF/Markdown export.

---

### Sprint 5: Dashboard + Polish (Week 9-10)
**Goal:** Main dashboard with tiles + UI polish + retro aesthetic

| Task | Owner | Hours |
|------|-------|──────────|
| Build DashboardPage tile grid layout | Frontend | 8 |
| Build InvestigationTile, ToolStatusTile, StatsTile | Frontend | 12 |
| Build RecentReportsTile, QuickActionsTile | Frontend | 8 |
| Add pixel-art fonts + retro theme CSS | Frontend | 12 |
| Add ScanlineOverlay + CRT effects | Frontend | 6 |
| Add animations (tool running, progress bars) | Frontend | 8 |
| Add SettingsPage | Frontend | 6 |
| Optimize WebSocket reconnection + heartbeat | Backend + Frontend | 8 |
| Performance testing (10 concurrent users) | Full Stack | 6 |
| Deploy final version | Full Stack | 4 |

**Deliverable:** Polished retro-themed dashboard with all tiles, animations, and production-ready performance.

---

### Sprint 6: Hardening + Production (Week 11-12)
**Goal:** Security, monitoring, documentation, production deployment

| Task | Owner | Hours |
|------|-------|-------|
| Rate limiting on API endpoints | Backend | 6 |
| Input sanitization + XSS prevention | Backend | 4 |
| WebSocket authentication validation | Backend | 4 |
| Error boundary + error reporting in React | Frontend | 6 |
| Activity logging (who ran what tool when) | Backend | 8 |
| Systemd service auto-restart configuration | DevOps | 4 |
| Nginx SSL + production config | DevOps | 4 |
| Load testing with k6 | Full Stack | 6 |
| Document API endpoints (Swagger/OpenAPI) | Backend | 8 |
| Final deployment + smoke testing | Full Stack | 8 |

**Deliverable:** Production-hardened application ready for daily use by 5-10 users.

---

## Summary: Total Effort Estimate

| Sprint | Duration | Focus |
|--------|----------|-------|
| Sprint 1 | 2 weeks | Foundation + Auth + Layout |
| Sprint 2 | 2 weeks | Tool Explorer + Manual Run |
| Sprint 3 | 2 weeks | Agent Chat + Auto-Investigation |
| Sprint 4 | 2 weeks | Investigation Detail + Reports |
| Sprint 5 | 2 weeks | Dashboard + Polish |
| Sprint 6 | 2 weeks | Hardening + Production |

**Total:** 12 weeks, ~600-700 hours of development

---

## Key Technical Decisions

1. **Zustand over Redux:** Lightweight, simple, perfect for small team
2. **WebSocket for logs:** Real-time streaming without polling
3. **Go backend for reports:** Centralized, fast, access to raw data
4. **Ollama for agent intelligence:** Local LLM, no API costs
5. **Pixel-art aesthetic:** Unique differentiator, memorable UI
6. **106 tools as catalog:** Even non-integrated tools show status/info
7. **Simple JWT auth:** Single admin user + 5-10 team members
