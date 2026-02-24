# Phase 4: Pipeline Generation & Compliance Display - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Compliance score gauge, risk heat map, control matrix, findings table, and pipeline preview — all displaying with real-time updates as agents complete. Framework selector on landing page and error handling with toast notifications, agent error display, and retry logic.

This phase adds the remaining dashboard visualization panels. The architecture graph and agent feed (Phase 3) are already in place. Phase 4 fills in the compliance, findings, and pipeline panels with real data from agent results.

</domain>

<decisions>
## Implementation Decisions

### Compliance Score Display
- Circular SVG gauge for overall score (0-100) — arc/donut style with number in center
- Color gradient on gauge: red (0-40), amber (40-70), green (70-100)
- Per-framework breakdown as horizontal progress bars below the gauge — each bar labeled with framework name, colored by score, showing percentage
- Count-up animation when score arrives from Risk Scorer agent — number counts from 0 to final score with easing, gauge arc fills in sync
- Pre-analysis empty state: skeleton with dashed ring outline and "Run analysis to see score" placeholder text

### Risk Heat Map
- Nodes as rows, compliance domains as columns — reads naturally as "how does each component score across domains"
- Cells fade from gray to their risk color as agent data arrives — subtle transition, not instant pop
- Color intensity: emerald for compliant, amber for partial, red for non-compliant, slate-700 for no data/not applicable
- Hover on cell shows tooltip with node name, domain, and specific finding summary

### Control Matrix
- Full detail columns: Framework, Control ID, Description, CALM Control Mapping, Status badge
- Status badges: filled pill style — emerald "Pass", amber "Partial", red "Fail", slate "N/A"
- Sortable by any column (click header to toggle asc/desc), filterable by framework via dropdown
- Default sort: severity descending (failures first)

### Findings Table
- Compact rows with expandable detail — summary shows severity badge + finding + affected node; click to expand for framework, recommendation, and control references
- Severity as filled badges: red "Critical", orange "High", amber "Medium", blue "Low", emerald "Info"
- Framework + severity filter dropdowns at top of table
- No cross-highlighting with graph for now — keeps implementation focused, can add in Phase 6 polish

### Pipeline Preview
- Tabbed code panels: GitHub Actions, Security Scanning, Infrastructure — one tab visible at a time
- Full YAML/JSON syntax highlighting using a lightweight code block with dark theme colors
- Copy to clipboard + Download as file buttons per tab, top-right of code panel
- Pre-analysis: skeleton code block with gray placeholder lines (reuse existing Phase 1 skeleton pattern)

### Error Handling
- Toast notifications: bottom-right stack, auto-dismiss after 5s, dark styled (slate-800 bg, red/amber border for errors/warnings)
- Agent errors display in the agent feed with red severity badge and error message — same as other events
- Retry button appears in the completion banner when analysis finishes with errors: "Retry Analysis" button next to the completion message
- Graceful degradation: if one agent fails, show partial results in other panels with a warning indicator

### Framework Selector
- Checkbox group on landing page below the architecture selector — all 4 frameworks checked by default (SOX, PCI-DSS, NIST-CSF, FINOS-CCC)
- User can uncheck frameworks to exclude them from analysis
- Compact inline layout: 4 checkboxes in a single row with framework labels

</decisions>

<specifics>
## Specific Ideas

- The compliance gauge should feel premium — similar to Bloomberg Terminal data widgets, not a toy dashboard
- Dark theme consistency: all new panels use the same slate-800 card bg, slate-700 borders established in Phase 3
- Compliance colors locked from Phase 3: emerald (compliant), amber (partial), red (non-compliant), blue (info)
- No emojis anywhere — icons only (lucide-react), text labels
- Style theme: Dark, Elegant, Professional — "Bloomberg Terminal meets modern SaaS"
- Panels should update in real-time as agent events arrive via SSE, not wait for full analysis completion

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-pipeline-generation-compliance-display*
*Context gathered: 2026-02-24*
