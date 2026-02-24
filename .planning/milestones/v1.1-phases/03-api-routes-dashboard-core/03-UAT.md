---
status: diagnosed
phase: 03-api-routes-dashboard-core
source: [03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md, 03-04-SUMMARY.md, 03-05-SUMMARY.md, 03-06-SUMMARY.md]
started: 2026-02-23T23:10:00Z
updated: 2026-02-24T00:20:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Dev Server and Dark Dashboard
expected: `pnpm dev` starts without errors. Opening http://localhost:3000 shows a dark-themed landing page (slate-900 background) with an architecture selector dropdown.
result: pass

### 2. Select Demo Architecture and Navigate to Dashboard
expected: Select "Trading Platform" or "Payment Gateway" from the dropdown on the landing page. After selection, navigate to the dashboard. The dashboard should load without errors.
result: pass

### 3. Dashboard Layout — Three-Column Structure
expected: Dashboard shows three columns: left sidebar (navigation items + agent list), center main content area, and right column (320px wide) for the agent activity feed.
result: pass

### 4. Sidebar Agent Status Dots
expected: Left sidebar lists 4 agents (Architecture Analyzer, Compliance Mapper, Pipeline Generator, Risk Scorer) each with a gray dot indicating idle status. Navigation items include Overview, Architecture, Compliance, Pipeline, Findings.
result: pass

### 5. Architecture Graph on Overview Page
expected: After selecting a demo architecture, the Overview page shows an architecture graph inside a card panel. Nodes represent CALM components (services, databases, web clients, actors) with different colors per type. Edges show protocol labels (HTTPS, JDBC, etc.). Graph is auto-laid out left-to-right.
result: issue
reported: "yes, but it looks like constrained in that small window that architecture is not navigable. does not do justice right now"
severity: cosmetic

### 6. Architecture Tab — Full-Height Graph
expected: Click "Architecture" in the sidebar. A dedicated page loads showing the architecture graph at near-full viewport height with a title "Architecture" and subtitle. Nodes and edges are the same as Overview but larger.
result: issue
reported: "it looks like this now. make it look cleaner/better. Nodes clustered in center with excess empty space, graph layout needs visual polish"
severity: cosmetic

### 7. Agent Feed — Pre-Analysis Empty State
expected: The right column agent feed panel shows an empty state message (e.g., "Waiting for analysis to begin" or similar) when no analysis has been started. No events are listed.
result: pass

### 8. Analyze Button and SSE Streaming (requires API key)
expected: Click the Analyze button in the header. The button shows a loading state. Agent events begin streaming into the right-column feed with slide-in animations. Each event shows an agent icon, timestamp, and message. "Thinking" events show pulsing dots.
result: skipped
reason: No LLM API key configured

### 9. Agent Dots Update During Analysis
expected: During analysis, sidebar agent dots change from gray (idle) to blue/animated (running) as each agent starts, then to green (complete) when finished. If an agent errors, its dot turns red.
result: issue
reported: "agent activity panel seems half cut (shows on top half of page only)"
severity: minor

### 10. Completion Banner After Analysis
expected: When all agents finish, an emerald-tinted completion banner appears on the Overview page showing agent count and duration. The feed stops receiving new events.
result: skipped
reason: No LLM API key configured

## Summary

total: 10
passed: 5
issues: 3
pending: 0
skipped: 2

## Gaps

- truth: "Architecture graph in overview card should be navigable and appropriately sized"
  status: failed
  reason: "User reported: constrained in small window, not navigable, does not do justice"
  severity: cosmetic
  test: 5
  root_cause: "Card container hardcoded to h-[300px] while graph needs min-h-[400px]. overflow-hidden clips content. MiniMap/Controls waste space in small panel."
  artifacts:
    - path: "src/app/dashboard/page.tsx"
      issue: "h-[300px] too short, overflow-hidden clips graph"
    - path: "src/components/graph/architecture-graph.tsx"
      issue: "MiniMap and Controls rendered in cramped card context"
  missing:
    - "Increase card height to h-[500px] or add compact prop to hide MiniMap/Controls in overview"
  debug_session: ".planning/debug/overview-graph-cramped.md"

- truth: "Architecture tab graph should look clean with well-distributed nodes"
  status: failed
  reason: "User reported: nodes clustered in center with excess empty space, needs visual polish"
  severity: cosmetic
  test: 6
  root_cause: "Dagre ranksep:80 and nodesep:40 too tight, producing ~1300x300px graph in ~888px tall container. fitView padding:0.2 cannot redistribute nodes."
  artifacts:
    - path: "src/components/graph/utils/layout.ts"
      issue: "ranksep:80 and nodesep:40 too tight for visual quality"
    - path: "src/components/graph/architecture-graph.tsx"
      issue: "fitView padding:0.2 insufficient, no maxZoom cap"
  missing:
    - "Increase ranksep to 150-200, nodesep to 80-100"
    - "Increase fitView padding to 0.3-0.4, add maxZoom:1.2"
    - "Increase NODE_WIDTH/NODE_HEIGHT to match actual rendered size"
  debug_session: ".planning/debug/architecture-graph-clustering.md"

- truth: "Agent Activity panel should extend full page height"
  status: failed
  reason: "User reported: agent activity panel seems half cut, shows on top half of page only"
  severity: minor
  test: 9
  root_cause: "Right column div missing h-full, Card missing h-full, ScrollArea hardcoded to h-[400px] instead of h-full."
  artifacts:
    - path: "src/components/layout/dashboard-layout.tsx"
      issue: "Right column div missing h-full (line 31)"
    - path: "src/components/dashboard/agent-feed.tsx"
      issue: "Card missing h-full (line 65), ScrollArea hardcoded h-[400px] (line 89)"
  missing:
    - "Add h-full to right column div in dashboard-layout.tsx"
    - "Add h-full to Card in agent-feed.tsx"
    - "Change ScrollArea from h-[400px] to flex-1"
  debug_session: ""
