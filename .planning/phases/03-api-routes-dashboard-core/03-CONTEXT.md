# Phase 3: API Routes & Dashboard Core - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire up backend API routes (SSE streaming for agent events, CALM parsing, pipeline retrieval) and build the real-time dashboard with architecture graph visualization, agent activity feed, and navigation structure. This connects the Phase 2 agent infrastructure to the user's screen.

</domain>

<decisions>
## Implementation Decisions

### Dashboard layout & navigation
- Hybrid approach: Overview tab shows summary grid with key metrics from all sections; other tabs (Architecture, Compliance, Pipeline, Findings) show detailed views per section
- Architecture selector: Landing page for first-time selection, header dropdown to switch without leaving dashboard after initial pick
- Explicit "Analyze" button to start analysis (not auto-start on selection)
- Free tab navigation during analysis — user can switch tabs while agents are running, each tab updates in real-time

### Agent activity feed
- Show every event: started, thinking, finding, completed, error — full visibility into agent reasoning
- Always auto-scroll to latest event during analysis
- Severity-based coloring: green=info, amber=warning, red=critical; agent identity shown via icon/label, not color
- Feed lives in a dedicated right column panel, always visible alongside main content

### Real-time streaming UX
- Pre-analysis: empty state panels with centered "Select an architecture and click Analyze" call-to-action
- Analysis triggered by explicit button click after architecture selection
- Completion: subtle toast/banner ("Analysis complete — 4 agents finished in 12s"), no dramatic overlay

### Claude's Discretion
- Sidebar behavior (collapsible vs fixed, icon-only mode)
- Overview tab layout design (panel arrangement, metrics placement)
- Architecture graph node visual style (icon + shape approach, dark theme optimization)
- Node click interaction (detail panel vs tooltip)
- Trust boundary visualization style
- Graph layout mode (auto-layout only vs draggable)

</decisions>

<specifics>
## Specific Ideas

- User wants to use the ui-ux-pro-max skill for generating dashboard components — include sample prompts in planning for downstream reference
- Feed should feel like a live log pane (right column, always visible, scrolling)
- Dashboard should work as an impressive hackathon demo — design choices should prioritize visual impact on 1920x1080

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-api-routes-dashboard-core*
*Context gathered: 2026-02-23*
