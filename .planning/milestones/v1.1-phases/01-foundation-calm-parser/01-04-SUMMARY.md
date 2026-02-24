---
phase: 01-foundation-calm-parser
plan: 04
subsystem: UI/UX
tags: [landing-page, dashboard, skeleton-loaders, navigation, user-interface]
dependency-graph:
  requires: [01-01, 01-02, 01-03]
  provides: [demo-selector-ui, dashboard-shell, skeleton-states]
  affects: [phase-2-agent-integration, phase-6-file-upload]
tech-stack:
  added: [shadcn/ui-select, lucide-react-icons, next-navigation]
  patterns: [client-components, zustand-state-binding, skeleton-loading-pattern]
key-files:
  created:
    - src/app/page.tsx
    - src/app/dashboard/layout.tsx
    - src/app/dashboard/page.tsx
    - src/components/calm/architecture-selector.tsx
    - src/components/calm/parse-error-display.tsx
    - src/components/dashboard/sidebar.tsx
    - src/components/dashboard/header.tsx
    - src/components/dashboard/compliance-card-skeleton.tsx
    - src/components/dashboard/architecture-graph-skeleton.tsx
    - src/components/dashboard/agent-feed-skeleton.tsx
    - src/components/dashboard/pipeline-preview-skeleton.tsx
    - src/components/layout/dashboard-layout.tsx
  modified:
    - src/store/analysis-store.ts
decisions:
  - decision: Use relative import path for examples directory instead of path alias
    rationale: tsconfig only has @/* alias for src/ directory; examples/ is at project root
    alternatives: [add-examples-alias-to-tsconfig, move-examples-to-src]
    impact: Components using DEMO_ARCHITECTURES must use relative paths
  - decision: Store full ParseError structure in analysis store instead of string
    rationale: Error display component needs access to issues array for detailed validation feedback
    alternatives: [keep-string-convert-in-component, add-separate-issues-field]
    impact: Better error UX with structured validation issue display
  - decision: Use skeleton loading pattern for all dashboard panels
    rationale: Provides immediate visual feedback while waiting for Phase 2 agent implementation
    alternatives: [blank-placeholders, static-mockups, spinner-only]
    impact: Professional UX that communicates data structure before agents are integrated
metrics:
  duration: 6 minutes
  tasks: 2
  files: 13
  commits: 2
  completed: 2026-02-16
---

# Phase 01 Plan 04: Landing Page & Dashboard Shell Summary

**Complete user-facing UI for Phase 1: demo selection, parsing, navigation, and dashboard skeleton with loading states.**

## What Was Built

### Task 1: Landing Page with Architecture Selector
- **ArchitectureSelector component**: Dropdown showing demo architectures with node counts, parse/navigate flow, file upload placeholder (coming soon badge)
- **ParseErrorDisplay component**: Structured error display with validation issues in red-themed card
- **Landing page**: CALMGuard branding, tagline, architecture selector, error display, hackathon footer
- **Flow**: User selects demo → parses via `parseCalm()` → stores via `setCalmData()` → navigates to `/dashboard`

### Task 2: Dashboard Layout & Skeleton Loaders
- **DashboardLayout**: Two-column layout with fixed sidebar (w-64) and flex content area
- **Sidebar**: 5 navigation items (Overview, Architecture, Compliance, Pipeline, Findings) with icons + 4 agent status dots (all idle/gray)
- **Header**: "Dashboard" title + parse status badge showing node/relationship counts
- **Dashboard page**: 2x2 grid with 4 skeleton cards (compliance gauge, architecture graph, agent feed, pipeline preview)
- **Skeleton components**: Animated placeholders using shadcn/ui Skeleton primitive with realistic structure (circular gauge, scattered nodes, message bars, code lines)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Store error type incompatibility**
- **Found during:** Task 1 (architecture selector integration)
- **Issue:** Analysis store used `error: string | null` but ParseErrorDisplay expected structured error with issues array
- **Fix:** Updated store type to `error: ParseError['error'] | null` and modified selector to pass full error object
- **Files modified:** `src/store/analysis-store.ts`, `src/components/calm/architecture-selector.tsx`
- **Commit:** 287199e

**2. [Rule 1 - Bug] Import path resolution failure**
- **Found during:** Task 1 build verification
- **Issue:** `import { DEMO_ARCHITECTURES } from '@/examples'` failed because tsconfig only aliases `@/*` to `src/*`
- **Fix:** Changed to relative import `from '../../../examples'`
- **Files modified:** `src/components/calm/architecture-selector.tsx`
- **Commit:** 287199e

**3. [Rule 1 - Bug] CalmDocument metadata access**
- **Found during:** Task 2 build verification
- **Issue:** Header tried to access `rawCalmData?.metadata?.name` but CalmDocument schema doesn't have metadata field
- **Fix:** Removed metadata.name access, simplified header to show "Dashboard" title instead
- **Files modified:** `src/components/dashboard/header.tsx`
- **Commit:** a028e4c

## Key Implementation Details

### UI Best Practices Applied
- **Visual hierarchy**: Proper font sizes (text-4xl for hero, text-xl for section headers, text-sm for labels)
- **Spacing**: Consistent Tailwind scale (gap-4, p-6, space-y-4)
- **Color contrast**: Slate-50 on slate-950 (high contrast), slate-400 on slate-900 (medium), emerald-500 accents
- **Semantic HTML**: `<main>`, `<aside>`, `<nav>`, `<header>` elements
- **Accessibility**: `sr-only` labels, keyboard-navigable links, focus states with ring utilities
- **Transitions**: `hover:bg-slate-800/50 transition-colors` on interactive elements
- **Dark theme**: Consistent slate palette (slate-950 bg, slate-900 cards, slate-800 borders)

### Component Architecture
- **Client Components**: All interactive components marked `'use client'` (selector, error display, dashboard pages)
- **Server Components**: Layout wrappers remain server components
- **Zustand binding**: Direct store access via `useAnalysisStore()` hook
- **Skeleton pattern**: Shadcn/ui Skeleton component with bg-slate-800 shimmer effect

### Navigation Flow
1. Landing page (`/`) → Select demo → Parse → "Start Analysis" button
2. Button calls `router.push('/dashboard')` (Next.js App Router navigation)
3. Dashboard checks `analysisInput` in store → show empty state if null, skeleton grid if present
4. Sidebar links prepared for future pages (architecture, compliance, pipeline, findings)

## Testing & Verification

### Build Results
- `pnpm build` passes with zero TypeScript errors
- Static generation: 3 routes (/, /dashboard, /_not-found)
- Bundle sizes: Landing 159 kB, Dashboard 118 kB (both within acceptable range)
- No hydration warnings

### Manual Verification Checklist
- [x] Landing page renders with CALMGuard title, selector, upload placeholder
- [x] Dropdown shows 2 demos (Trading Platform 10 nodes, Payment Gateway 8 nodes)
- [x] Selecting demo triggers loading state then enables "Start Analysis" button
- [x] "Start Analysis" navigates to /dashboard
- [x] Dashboard shows sidebar with 5 nav items + 4 gray agent dots
- [x] Dashboard shows header with parse stats badge
- [x] Dashboard shows 4 skeleton cards in 2x2 grid
- [x] All components use slate-900/950 dark theme
- [x] No TypeScript errors or warnings

## Integration Points for Phase 2

### Ready for Agent Integration
- **Agent status dots**: Already in sidebar, ready to update via Zustand when agents start/complete
- **Skeleton replacement**: Each skeleton component corresponds to a Phase 2+ real component:
  - ComplianceCardSkeleton → ComplianceScoreCard (Phase 3)
  - ArchitectureGraphSkeleton → ArchitectureGraph (Phase 2)
  - AgentFeedSkeleton → AgentActivityFeed (Phase 2)
  - PipelinePreviewSkeleton → PipelinePreview (Phase 4)
- **Store structure**: Already has `status: AnalysisStatus` with states: idle, loading, parsed, analyzing, complete, error

### Next Phase Dependencies
- Phase 2 (Architecture Visualizer) will replace ArchitectureGraphSkeleton with React Flow graph
- Phase 3 (Multi-Agent) will light up agent status dots and replace AgentFeedSkeleton
- Phase 4 (Pipeline) will replace PipelinePreviewSkeleton with actual GitHub Actions YAML
- Phase 5 (Compliance) will replace ComplianceCardSkeleton with circular gauge + scores

## Files Summary

### Created (13 files, 665 lines)
| File | Purpose | Exports |
|------|---------|---------|
| src/app/page.tsx | Landing page with selector | Home (default) |
| src/app/dashboard/layout.tsx | Dashboard layout wrapper | Layout (default) |
| src/app/dashboard/page.tsx | Dashboard overview page | DashboardPage (default) |
| src/components/calm/architecture-selector.tsx | Demo dropdown + parse flow | ArchitectureSelector |
| src/components/calm/parse-error-display.tsx | Validation error display | ParseErrorDisplay |
| src/components/dashboard/sidebar.tsx | Navigation + agent status | Sidebar |
| src/components/dashboard/header.tsx | Header with stats badge | Header |
| src/components/dashboard/compliance-card-skeleton.tsx | Compliance skeleton loader | ComplianceCardSkeleton |
| src/components/dashboard/architecture-graph-skeleton.tsx | Graph skeleton loader | ArchitectureGraphSkeleton |
| src/components/dashboard/agent-feed-skeleton.tsx | Feed skeleton loader | AgentFeedSkeleton |
| src/components/dashboard/pipeline-preview-skeleton.tsx | Pipeline skeleton loader | PipelinePreviewSkeleton |
| src/components/layout/dashboard-layout.tsx | Dashboard shell layout | DashboardLayout |

### Modified (1 file)
| File | Changes |
|------|---------|
| src/store/analysis-store.ts | Updated error type to ParseError['error'] |

## Requirements Satisfied

- **CALM-01** (Parse CALM JSON): ✅ User can select demo architecture from dropdown
- **CALM-02** (Extract analysis input): ✅ Parsing extracts AnalysisInput and stores in Zustand
- **CALM-03** (Validation errors): ✅ ParseErrorDisplay shows structured validation issues
- **INFRA-03** (Loading states): ✅ Dashboard shows skeleton loaders for all component areas

**Phase 1 Foundation & CALM Parser: 100% complete (4/4 plans)**

## Self-Check: PASSED

### Created Files Verification
```
✓ FOUND: src/app/page.tsx
✓ FOUND: src/app/dashboard/layout.tsx
✓ FOUND: src/app/dashboard/page.tsx
✓ FOUND: src/components/calm/architecture-selector.tsx
✓ FOUND: src/components/calm/parse-error-display.tsx
✓ FOUND: src/components/dashboard/sidebar.tsx
✓ FOUND: src/components/dashboard/header.tsx
✓ FOUND: src/components/dashboard/compliance-card-skeleton.tsx
✓ FOUND: src/components/dashboard/architecture-graph-skeleton.tsx
✓ FOUND: src/components/dashboard/agent-feed-skeleton.tsx
✓ FOUND: src/components/dashboard/pipeline-preview-skeleton.tsx
✓ FOUND: src/components/layout/dashboard-layout.tsx
```

### Commits Verification
```
✓ FOUND: 287199e (feat(01-04): landing page with architecture selector and error display)
✓ FOUND: a028e4c (feat(01-04): dashboard layout with sidebar and skeleton loaders)
```

All files created and commits exist as documented.
