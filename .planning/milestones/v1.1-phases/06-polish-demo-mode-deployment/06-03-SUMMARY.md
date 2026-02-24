---
phase: 06-polish-demo-mode-deployment
plan: "03"
subsystem: animations-ui
tags: [animations, odometer, graph-nodes, heat-map, pipeline-typewriter, css-transitions]
dependency_graph:
  requires: [06-01]
  provides: [cinematic-dashboard-animations, odometer-score-component]
  affects: [compliance-card, graph-nodes, risk-heat-map, pipeline-preview]
tech_stack:
  added: []
  patterns:
    - OdometerScore per-digit CSS translateY column animation
    - SVG foreignObject for HTML content inside SVG viewBox
    - Shiki highlight-once split-lines typewriter reveal pattern
    - Row-index stagger delay via inline animationDelay style
    - CSS transition on Tailwind-driven border-color for smooth node color change
key_files:
  created:
    - src/components/ui/odometer-score.tsx
  modified:
    - src/components/dashboard/compliance-card.tsx
    - src/components/graph/nodes/service-node.tsx
    - src/components/graph/nodes/database-node.tsx
    - src/components/graph/nodes/webclient-node.tsx
    - src/components/graph/nodes/actor-node.tsx
    - src/components/graph/nodes/system-node.tsx
    - src/components/graph/nodes/default-node.tsx
    - src/components/dashboard/risk-heat-map.tsx
    - src/components/dashboard/pipeline-preview.tsx
    - src/app/globals.css
    - src/app/dashboard/page.tsx
decisions:
  - OdometerScore uses CSS translateY column with 10x rows — ones=1200ms, tens=1800ms, hundreds=2400ms for slot-machine feel
  - SVG foreignObject embeds OdometerScore inside SVG gauge — only way to run CSS animations inside SVG viewBox
  - useCountUp kept for gauge arc (strokeDashoffset) — OdometerScore replaces only the text display
  - Inline style transition overrides Tailwind transition-shadow on graph nodes — both coexist, inline wins for border-color
  - Shiki HTML split on "<span class=\"line\">" spans — regex extraction preserves syntax highlighting per line
  - getTabHtml builds partial HTML by regex-matching outer pre+code tags from shiki output
  - Compact mode skips typewriter entirely — too small to see line-by-line at overview scale
  - Tab switch resets visibleLineCount to 0 in separate useEffect — triggers typewriter restart for new tab
metrics:
  duration: 340s
  completed: "2026-02-24"
  tasks_completed: 2
  files_modified: 11
---

# Phase 06 Plan 03: Dashboard Cinematic Animations Summary

Implemented four cinematic animation enhancements for the CALMGuard hackathon demo: odometer-style digit rolling for compliance score, smooth CSS border-color transitions on architecture graph nodes, staggered row-cascade fade for the risk heat map, and line-by-line typewriter reveal for pipeline code previews.

## What Was Built

### Task 1: OdometerScore Component + Graph Node Transitions

**OdometerScore** (`src/components/ui/odometer-score.tsx`):
- `OdometerDigit` internal component: a 10-row digit column that CSS-scrolls via `translateY(-N*10%)` to land on the target digit
- Per-digit independent timing: ones=1200ms (fast, slot-machine), tens=1800ms, hundreds=2400ms (slowest)
- Uses `cubic-bezier(0.4, 0, 0.2, 1)` easing for smooth deceleration
- Score clamped 0–100, hundreds digit only renders when score=100

**ComplianceCard integration** (`src/components/dashboard/compliance-card.tsx`):
- Replaced SVG `<text>` element with `<foreignObject>` embedding OdometerScore
- `foreignObject` at `x={CENTER-30} y={CENTER-22} width={60} height={36}` centers the odometer in the SVG gauge
- Color applied via inline `style={{ color }}` matching the gauge arc color
- `useCountUp` hook unchanged — still drives the SVG arc strokeDashoffset animation

**Graph node CSS transitions** (all 6 node components):
- Added `style={{ transition: 'border-color 0.6s ease-out, box-shadow 0.6s ease-out' }}` to each node wrapper div
- Works alongside existing Tailwind classes — inline style overrides Tailwind transition-shadow for border-color
- Nodes now animate smoothly from `border-slate-600` (unknown) to their compliance color when data arrives

### Task 2: Heat Map Stagger + Pipeline Typewriter

**Heat map staggered reveal** (`src/components/dashboard/risk-heat-map.tsx`):
- `HeatMapCell` now accepts `rowIndex` prop
- Each cell gets `animationDelay: ${rowIndex * 80}ms` and `transitionDelay: ${rowIndex * 80}ms`
- `animate-fade-in` class added to cells — fades from opacity 0 to 1 as data cascades top-to-bottom
- Row 0 appears immediately, row 1 after 80ms, row 2 after 160ms, etc.

**Pipeline typewriter reveal** (`src/components/dashboard/pipeline-preview.tsx`):
- `highlightedLines` state stores shiki HTML split into `<span class="line">` line spans
- `visibleLineCount` state tracks how many lines to show per tab
- `setInterval` at 30ms/line increments count until fully revealed
- `getTabHtml()` rebuilds HTML from partial line count by regex-matching shiki's outer `pre+code` wrapper
- Tab switch resets count to 0 in a separate `useEffect` — restarts typewriter for new tab content
- Compact mode (overview page): skips typewriter, shows full content immediately

**globals.css additions**:
- `@keyframes fade-in` for heat map cell reveal
- `.animate-fade-in` utility class
- `--animate-fade-in` custom property in `@theme` block
- ANIM-03 comment marking slide-in-right as verified complete

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TS7030 in dashboard/page.tsx**
- **Found during:** Task 2 typecheck
- **Issue:** `useEffect` callback for demo mode auto-start had `return () => clearTimeout(timer)` inside an `if` block with no explicit return on the else path — TypeScript strict mode flagged TS7030 (not all code paths return a value)
- **Fix:** Added `return undefined;` after the closing brace of the `if` block
- **Files modified:** `src/app/dashboard/page.tsx`
- **Commit:** 3db744a

**2. [Rule 1 - Bug] Removed stale eslint-disable comment in pipeline-preview.tsx**
- **Found during:** Task 2 build
- **Issue:** Build reported "Unused eslint-disable directive" on `// eslint-disable-next-line react-hooks/exhaustive-deps` in the main `pipelineConfig` useEffect — the dependency was valid and lint did not flag it
- **Fix:** Removed the unnecessary comment
- **Files modified:** `src/components/dashboard/pipeline-preview.tsx`
- **Commit:** 3db744a (same commit)

## Verification Results

- `pnpm typecheck`: PASS (0 errors)
- `pnpm build`: PASS (production build succeeds, 11 routes)
- `pnpm test:run`: PASS (22/22 tests, 998ms)
- ANIM-03 (slide-in-right): verified present in globals.css, unchanged

## Self-Check: PASSED

Files verified:
- FOUND: src/components/ui/odometer-score.tsx
- FOUND: src/components/dashboard/compliance-card.tsx
- FOUND: src/components/graph/nodes/service-node.tsx (representative of 6)
- FOUND: src/components/dashboard/risk-heat-map.tsx
- FOUND: src/components/dashboard/pipeline-preview.tsx
- FOUND: src/app/globals.css

Commits verified:
- 54d09ca: feat(06-03): OdometerScore component + graph node CSS transitions
- 3db744a: feat(06-03): heat map staggered fade + pipeline typewriter reveal
