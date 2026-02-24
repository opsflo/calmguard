# Phase 4: Pipeline Generation & Compliance Display - Research

**Researched:** 2026-02-24
**Domain:** React dashboard visualization — SVG gauges, data tables, syntax highlighting, toast notifications, framework-filtered agent orchestration
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Compliance Score Display
- Circular SVG gauge for overall score (0-100) — arc/donut style with number in center
- Color gradient on gauge: red (0-40), amber (40-70), green (70-100)
- Per-framework breakdown as horizontal progress bars below the gauge — each bar labeled with framework name, colored by score, showing percentage
- Count-up animation when score arrives from Risk Scorer agent — number counts from 0 to final score with easing, gauge arc fills in sync
- Pre-analysis empty state: skeleton with dashed ring outline and "Run analysis to see score" placeholder text

#### Risk Heat Map
- Nodes as rows, compliance domains as columns — reads naturally as "how does each component score across domains"
- Cells fade from gray to their risk color as agent data arrives — subtle transition, not instant pop
- Color intensity: emerald for compliant, amber for partial, red for non-compliant, slate-700 for no data/not applicable
- Hover on cell shows tooltip with node name, domain, and specific finding summary

#### Control Matrix
- Full detail columns: Framework, Control ID, Description, CALM Control Mapping, Status badge
- Status badges: filled pill style — emerald "Pass", amber "Partial", red "Fail", slate "N/A"
- Sortable by any column (click header to toggle asc/desc), filterable by framework via dropdown
- Default sort: severity descending (failures first)

#### Findings Table
- Compact rows with expandable detail — summary shows severity badge + finding + affected node; click to expand for framework, recommendation, and control references
- Severity as filled badges: red "Critical", orange "High", amber "Medium", blue "Low", emerald "Info"
- Framework + severity filter dropdowns at top of table
- No cross-highlighting with graph for now

#### Pipeline Preview
- Tabbed code panels: GitHub Actions, Security Scanning, Infrastructure — one tab visible at a time
- Full YAML/JSON syntax highlighting using a lightweight code block with dark theme colors
- Copy to clipboard + Download as file buttons per tab, top-right of code panel
- Pre-analysis: skeleton code block with gray placeholder lines (reuse existing Phase 1 skeleton pattern)

#### Error Handling
- Toast notifications: bottom-right stack, auto-dismiss after 5s, dark styled (slate-800 bg, red/amber border for errors/warnings)
- Agent errors display in the agent feed with red severity badge and error message — same as other events
- Retry button appears in the completion banner when analysis finishes with errors: "Retry Analysis" button next to the completion message
- Graceful degradation: if one agent fails, show partial results in other panels with a warning indicator

#### Framework Selector
- Checkbox group on landing page below the architecture selector — all 4 frameworks checked by default (SOX, PCI-DSS, NIST-CSF, FINOS-CCC)
- User can uncheck frameworks to exclude them from analysis
- Compact inline layout: 4 checkboxes in a single row with framework labels

### Claude's Discretion
None specified — all decisions locked.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LLM-06 | User can select which frameworks to analyze against (SOX, PCI-DSS, CCC, NIST) before starting analysis | Framework selector state in Zustand + `selectedFrameworks` passed through `analyzeRequestSchema` + orchestrator filters agents |
| COMP-01 | Circular SVG compliance gauge shows overall score (0-100) with color gradient (red/amber/green) | Pure SVG with `strokeDasharray`/`strokeDashoffset` — no library required, full control over colors |
| COMP-02 | Gauge animates with counting effect as score arrives | `useEffect` + `requestAnimationFrame` with linear easing; triggered when `analysisResult.risk` becomes non-null |
| COMP-03 | Per-framework breakdown (SOX, PCI-DSS, CCC, NIST) shown as horizontal bars below gauge | Tailwind `div` bars with `width` CSS transition — reads from `analysisResult.risk.frameworkScores` |
| COMP-04 | Risk heat map shows grid of nodes x compliance domains with color-coded cells (green/amber/red/gray) | Pure Tailwind grid — reads from `analysisResult.risk.nodeRiskMap` and `analysisResult.compliance.frameworkMappings` |
| COMP-05 | Control matrix table maps regulatory framework controls to CALM controls with status badges, sortable by severity, filterable by framework | `useState` for sort/filter; reads from `analysisResult.compliance.frameworkMappings` |
| COMP-06 | Findings table is sortable/filterable with columns: Severity, Finding, Node, Framework, Recommendation | `useState` for sort/filter/expand state; reads from `analysisResult.risk.topFindings` |
| PIPE-01 | Tabbed interface shows GitHub Actions, Security Scanning, and Infrastructure tabs | shadcn `Tabs` component via `pnpm dlx shadcn@latest add tabs` |
| PIPE-02 | Code blocks have syntax highlighting | `shiki` package — `codeToHtml` in async Server Component or `shiki/bundle/web` in Client Component |
| PIPE-03 | Copy-to-clipboard and download buttons per tab | `navigator.clipboard.writeText()` + `URL.createObjectURL(new Blob(...))` — both native browser APIs |
| INFRA-04 | Error handling with toast notifications for API errors, agent error display in feed, and retry button | shadcn `Sonner` via `pnpm dlx shadcn@latest add sonner`; `toast()` from `sonner` package |
| INFRA-05 | Graceful degradation if individual agent fails (show partial results) | Orchestrator already uses `Promise.allSettled`; UI reads nullable agent results and shows warning badge |
</phase_requirements>

---

## Summary

Phase 4 replaces the four skeleton panels in the dashboard (`ComplianceCardSkeleton`, `PipelinePreviewSkeleton`, and two empty spots) with live data panels fed from `AnalysisResult` in the Zustand store. All data is already produced by the existing agents — this phase is entirely a **data consumption and visualization** phase. No agent logic changes are needed except adding `selectedFrameworks` filtering to the orchestrator (LLM-06).

The primary complexity is in (1) the animated SVG gauge (requires pure SVG + RAF animation, no library), (2) the tabbed pipeline code preview with syntax highlighting (requires adding `shiki` + shadcn `Tabs`), and (3) the toast notification system (requires adding shadcn `Sonner`). The tables (Control Matrix, Findings) are standard React `useState` sort/filter patterns — no library needed.

The framework selector (LLM-06) requires a small schema change: `analyzeRequestSchema` gains an optional `frameworks` array field, and `runAnalysis` receives it, passing down to the compliance mapper and risk scorer so they only evaluate selected frameworks. The store gains a `selectedFrameworks` field initialized to all four frameworks.

**Primary recommendation:** Build all five panels (`ComplianceCard`, `RiskHeatMap`, `ControlMatrix`, `FindingsTable`, `PipelinePreview`) as separate `'use client'` components in `src/components/dashboard/`. Add the three new packages (`shiki`, `sonner` via shadcn, `tabs` via shadcn) before starting component work. Add `selectedFrameworks` to the Zustand store and propagate through the API before wiring the UI.

---

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | ^5.0.3 | State (analysisResult, selectedFrameworks) | Already the store |
| lucide-react | ^0.564.0 | Icons (Copy, Download, ChevronUp/Down, AlertTriangle) | Already in project |
| tailwindcss | ^4.1.0 | Styling all panels | Already in project |
| zod | ^3.24.1 | Schema for selectedFrameworks, API request update | Already in project |

### New Packages to Add
| Library | Install Command | Purpose | Why |
|---------|----------------|---------|-----|
| sonner (via shadcn) | `pnpm dlx shadcn@latest add sonner` | Toast notifications | Official shadcn component; wraps `sonner` npm pkg; auto-dismiss, dark theme, stacking |
| tabs (via shadcn) | `pnpm dlx shadcn@latest add tabs` | Pipeline preview tab switcher | Official shadcn component; wraps `@radix-ui/react-tabs`; keyboard accessible |
| shiki | `pnpm add shiki` | YAML/JSON syntax highlighting | Industry standard, tree-shakable, excellent dark themes, 0 runtime overhead with server component |
| @radix-ui/react-checkbox | `pnpm add @radix-ui/react-checkbox` | Framework selector checkboxes | Radix primitive; shadcn checkbox will install this |
| checkbox (via shadcn) | `pnpm dlx shadcn@latest add checkbox` | Framework selector checkboxes | Consistent with project's shadcn component style |
| tooltip (via shadcn) | `pnpm dlx shadcn@latest add tooltip` | Heat map cell hover tooltips | Radix tooltip; consistent with shadcn style |

**Installation order:**
```bash
pnpm dlx shadcn@latest add sonner tabs checkbox tooltip
pnpm add shiki
```

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shiki | highlight.js, prism.js | highlight.js lacks YAML theme quality; prism.js requires manual CSS import. Shiki has native `github-dark` and `vitesse-dark` themes that match slate palette. Both are heavier for tree-shaking. |
| sonner (shadcn) | react-hot-toast, radix toast | react-hot-toast lacks dark variant matching slate palette without CSS override. Radix toast requires more boilerplate. Sonner is the current shadcn recommendation (2025). |
| Pure SVG gauge | recharts, react-circular-gauge | recharts is 120KB+ and overkill for a single gauge. react-circular-gauge is not in shadcn ecosystem. Pure SVG is 30 lines, gives full control over colors/animation, zero dependency. |
| Tailwind grid (heat map) | recharts HeatMap | No recharts in project. Tailwind grid + CSS transitions achieves the exact fade-in effect specified. Full control over cell sizing and tooltip placement. |

---

## Architecture Patterns

### Recommended File Structure for Phase 4
```
src/
  components/
    dashboard/
      compliance-card.tsx          # SVG gauge + framework bars (replaces skeleton)
      risk-heat-map.tsx            # Node x domain grid with tooltips
      control-matrix.tsx           # Sortable/filterable framework control table
      findings-table.tsx           # Expandable findings with severity filter
      pipeline-preview.tsx         # Tabbed code preview with copy/download
      completion-banner.tsx        # Updated: includes retry button on failure
    calm/
      architecture-selector.tsx    # Updated: add framework checkbox group
    ui/
      tabs.tsx                     # New: shadcn add tabs
      sonner.tsx                   # New: shadcn add sonner
      checkbox.tsx                 # New: shadcn add checkbox
      tooltip.tsx                  # New: shadcn add tooltip
  store/
    analysis-store.ts              # Updated: add selectedFrameworks + setSelectedFrameworks
  lib/
    api/
      schemas.ts                   # Updated: analyzeRequestSchema gains frameworks[]
    agents/
      orchestrator.ts              # Updated: accepts selectedFrameworks, passes to agents
      compliance-mapper.ts         # Updated: accepts frameworks filter in prompt
      risk-scorer.ts               # Updated: accepts frameworks filter
  hooks/
    use-agent-stream.ts            # Updated: pass selectedFrameworks in POST body
  app/
    layout.tsx                     # Updated: add <Toaster /> from sonner
    page.tsx                       # Updated: show framework checkboxes below selector
    api/
      analyze/
        route.ts                   # Updated: parse frameworks from body, pass to runAnalysis
```

### Pattern 1: SVG Circular Gauge with Count-Up Animation
**What:** Pure SVG arc (`stroke-dasharray`, `stroke-dashoffset`) animated with `requestAnimationFrame`
**When to use:** Gauge components where score arrives asynchronously and should animate in
**Key insight:** The gauge arc is drawn as a circle where `stroke-dasharray = circumference` and `stroke-dashoffset = circumference * (1 - score/100)`. Animating from `offset = circumference` (empty) to the final offset fills the arc.

```typescript
// Source: LogRocket SVG circular progress pattern (verified)
// Circumference = 2 * Math.PI * radius
// For radius 56: circumference = 351.86

const RADIUS = 56;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getGaugeColor(score: number): string {
  if (score < 40) return '#ef4444'; // red-500
  if (score < 70) return '#f59e0b'; // amber-500
  return '#10b981'; // emerald-500
}

function getStrokeOffset(score: number): number {
  return CIRCUMFERENCE * (1 - score / 100);
}

// Animation hook pattern
function useCountUp(targetScore: number, duration = 1200) {
  const [displayScore, setDisplayScore] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (targetScore === 0) return;
    const startTime = performance.now();
    const startScore = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(startScore + (targetScore - startScore) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [targetScore, duration]);

  return displayScore;
}
```

### Pattern 2: Shiki Syntax Highlighting in Client Component
**What:** `shiki/bundle/web` for client-side use; avoids server component async constraint
**When to use:** Pipeline preview tabs where content changes dynamically (user switches tabs)
**Key insight:** In a `'use client'` component with dynamic tab content, use `shiki/bundle/web` which works client-side. Pre-highlight all three tab contents together when `pipelineConfig` arrives.

```typescript
// Source: shiki docs, shiki/bundle/web client usage
import { codeToHtml } from 'shiki/bundle/web';

// Pre-compute all three highlighted strings when data arrives
useEffect(() => {
  if (!pipelineConfig) return;

  async function highlight() {
    const [ghHtml, secHtml, infraHtml] = await Promise.all([
      codeToHtml(pipelineConfig.githubActions.yaml, {
        lang: 'yaml',
        theme: 'github-dark',
      }),
      codeToHtml(
        pipelineConfig.securityScanning.tools.map((t) => t.config).join('\n---\n'),
        { lang: 'yaml', theme: 'github-dark' }
      ),
      codeToHtml(pipelineConfig.infrastructureAsCode.config, {
        lang: pipelineConfig.infrastructureAsCode.provider === 'terraform' ? 'hcl' : 'yaml',
        theme: 'github-dark',
      }),
    ]);
    setHighlightedHtml({ github: ghHtml, security: secHtml, infra: infraHtml });
  }

  void highlight();
}, [pipelineConfig]);

// Render: dangerouslySetInnerHTML on a pre-styled container
<div
  className="text-xs font-mono overflow-auto max-h-96 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:bg-transparent [&_code]:leading-relaxed"
  dangerouslySetInnerHTML={{ __html: highlightedHtml[activeTab] ?? '' }}
/>
```

### Pattern 3: Sonner Toast Integration
**What:** `<Toaster />` in root layout + `toast()` calls from anywhere
**When to use:** API errors, agent failures, completion notifications

```typescript
// Source: shadcn/ui sonner documentation
// In src/app/layout.tsx (Server Component — Toaster is client-side only)
import { Toaster } from '@/components/ui/sonner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: 'bg-slate-800 border-slate-700 text-slate-100',
              error: 'border-red-500/50',
              warning: 'border-amber-500/50',
            },
          }}
          duration={5000}
        />
      </body>
    </html>
  );
}

// Usage in use-agent-stream.ts or dashboard page:
import { toast } from 'sonner';

toast.error('Analysis failed', { description: errorMessage });
toast.warning(`Agent failed: ${agentName}`);
```

### Pattern 4: Tabbed Pipeline Preview with shadcn Tabs
**What:** `<Tabs>` + `<TabsList>` + `<TabsTrigger>` + `<TabsContent>` from shadcn
**When to use:** Pipeline preview panel with 3 code views

```typescript
// Source: shadcn/ui tabs documentation
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs defaultValue="github" className="w-full">
  <div className="flex items-center justify-between mb-3">
    <TabsList className="bg-slate-900 border border-slate-700">
      <TabsTrigger value="github" className="data-[state=active]:bg-slate-700 text-slate-400 data-[state=active]:text-slate-100">
        GitHub Actions
      </TabsTrigger>
      <TabsTrigger value="security" className="data-[state=active]:bg-slate-700 text-slate-400 data-[state=active]:text-slate-100">
        Security Scanning
      </TabsTrigger>
      <TabsTrigger value="infra" className="data-[state=active]:bg-slate-700 text-slate-400 data-[state=active]:text-slate-100">
        Infrastructure
      </TabsTrigger>
    </TabsList>
    {/* Copy + Download buttons — rendered per active tab */}
    <div className="flex gap-2">
      <Button size="sm" variant="ghost" onClick={handleCopy}>
        <Copy className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={handleDownload}>
        <Download className="h-4 w-4" />
      </Button>
    </div>
  </div>
  <TabsContent value="github">
    {/* Shiki highlighted HTML */}
  </TabsContent>
  ...
</Tabs>
```

### Pattern 5: Framework Selector Checkbox Group
**What:** Inline checkbox group on landing page; state persists in Zustand `selectedFrameworks`
**When to use:** Filtering which compliance frameworks agents analyze against

```typescript
// In analysis-store.ts — new state field
selectedFrameworks: ['SOX', 'PCI-DSS', 'NIST-CSF', 'CCC'] as Framework[],
setSelectedFrameworks: (frameworks: Framework[]) => set({ selectedFrameworks: frameworks }),
toggleFramework: (framework: Framework) =>
  set((state) => ({
    selectedFrameworks: state.selectedFrameworks.includes(framework)
      ? state.selectedFrameworks.filter((f) => f !== framework)
      : [...state.selectedFrameworks, framework],
  })),

// In architecture-selector.tsx — add below the demo dropdown:
const FRAMEWORKS = ['SOX', 'PCI-DSS', 'NIST-CSF', 'CCC'] as const;

<div className="flex items-center gap-4">
  <span className="text-sm text-slate-400">Frameworks:</span>
  {FRAMEWORKS.map((fw) => (
    <label key={fw} className="flex items-center gap-1.5 cursor-pointer">
      <Checkbox
        checked={selectedFrameworks.includes(fw)}
        onCheckedChange={() => toggleFramework(fw)}
        className="border-slate-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
      />
      <span className="text-sm text-slate-300">{fw}</span>
    </label>
  ))}
</div>
```

### Pattern 6: Sort/Filter Table State
**What:** Local `useState` for sort column + direction + active filters
**When to use:** Control Matrix and Findings Table — no global state needed

```typescript
// Source: standard React sort/filter pattern
const [sortField, setSortField] = useState<'severity' | 'framework' | 'status'>('severity');
const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
const [frameworkFilter, setFrameworkFilter] = useState<string>('all');

const sortedFiltered = useMemo(() => {
  let rows = [...data];
  if (frameworkFilter !== 'all') {
    rows = rows.filter((r) => r.framework === frameworkFilter);
  }
  rows.sort((a, b) => {
    const order = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    return sortDir === 'desc' ? order : -order;
  });
  return rows;
}, [data, sortField, sortDir, frameworkFilter]);
```

### Pattern 7: LLM-06 Framework Filtering — API + Agent Changes
**What:** `selectedFrameworks` flows from store → POST body → route → orchestrator → agents
**Key change points:**

1. `analyzeRequestSchema` (src/lib/api/schemas.ts): add optional `frameworks` field
```typescript
export const analyzeRequestSchema = z.object({
  calm: z.unknown(),
  frameworks: z.array(z.enum(['SOX', 'PCI-DSS', 'CCC', 'NIST-CSF'])).optional(),
});
```

2. `use-agent-stream.ts`: include `selectedFrameworks` in POST body
```typescript
body: JSON.stringify({ calm: calmData, frameworks: selectedFrameworks }),
```

3. `POST /api/analyze/route.ts`: extract `frameworks` and pass to `runAnalysis`
```typescript
const result = await runAnalysis(analysisInput, bodyResult.data.frameworks);
```

4. `runAnalysis` in orchestrator.ts: accept `selectedFrameworks` and inject into agent prompts via a `frameworkFilter` parameter
5. `mapCompliance` prompt: prepend "Only analyze the following frameworks: SOX, PCI-DSS" when filtered

### Anti-Patterns to Avoid
- **Storing highlighted HTML in Zustand:** Keep shiki output in local component state — it's ephemeral display data, not analysis state
- **Highlighting on every render:** Use `useEffect` with `pipelineConfig` as dependency, compute once and store in local state
- **Triggering count-up animation on every re-render:** Bind the RAF animation to `useEffect` with `riskScore` as the dep, cleanup with `cancelAnimationFrame`
- **Blocking the framework filter on zero selected:** Always enforce minimum 1 framework selected (disable the last checked checkbox)
- **Using table library:** Standard `useMemo` + `Array.sort`/`.filter` is sufficient; no `@tanstack/react-table` needed for these small datasets

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toast notifications | Custom portal + animation | `sonner` (shadcn add sonner) | Stacking, auto-dismiss, dark theme, accessibility all handled |
| Tab switching UI | Custom state + CSS | `@radix-ui/react-tabs` (shadcn add tabs) | Keyboard nav, ARIA, focus management |
| YAML/JSON syntax highlighting | Manual token regex | `shiki` | Language grammars are 10K+ lines each; shiki bundles TextMate grammars correctly |
| Framework checkboxes | Custom div + onClick | `@radix-ui/react-checkbox` (shadcn add checkbox) | Indeterminate state, keyboard, ARIA |
| Cell tooltips on heat map | `title` attribute | `@radix-ui/react-tooltip` (shadcn add tooltip) | Proper positioning, delay, dark theme consistent |

**Key insight:** All custom UI primitives in this phase are already solved by Radix UI primitives exposed via shadcn. The only genuinely custom code is the SVG gauge and the table sort/filter logic.

---

## Common Pitfalls

### Pitfall 1: Shiki Bundle Size in Client Component
**What goes wrong:** Importing `import { codeToHtml } from 'shiki'` in a `'use client'` component adds the full shiki bundle (~1MB) to the client bundle.
**Why it happens:** The full shiki package includes all language grammars.
**How to avoid:** Use `shiki/bundle/web` which tree-shakes to only included languages, or use `createHighlighter` with explicit `langs: ['yaml', 'hcl']`. The `shiki` package documentation recommends this for client-side use.
**Warning signs:** `next build` output shows unexpectedly large `chunks/` file.

### Pitfall 2: RAF Animation Memory Leak
**What goes wrong:** Count-up animation continues after component unmounts, causing React state update warnings.
**Why it happens:** `requestAnimationFrame` callback references component state.
**How to avoid:** Always return `() => cancelAnimationFrame(rafRef.current)` from the `useEffect` cleanup.

### Pitfall 3: SVG `stroke-dashoffset` on Initial Render
**What goes wrong:** The gauge arc briefly shows 100% filled before animating from 0 (flicker).
**Why it happens:** React renders with the final value, then the animation starts.
**How to avoid:** Initialize the SVG `strokeDashoffset` to `CIRCUMFERENCE` (fully hidden) before the RAF starts. Controlled via the `displayScore` state which starts at `0`.

### Pitfall 4: Sonner `<Toaster />` in Server Component
**What goes wrong:** `<Toaster />` from sonner uses client hooks — placing it in a pure Server Component fails.
**Why it happens:** `src/app/layout.tsx` is a Server Component by default.
**How to avoid:** The shadcn `sonner` component wrapper is already `'use client'`. Import `Toaster` from `@/components/ui/sonner` (the shadcn wrapper, not directly from `sonner`). This is safe to import in a Server Component because Next.js handles the client boundary at the component level.

### Pitfall 5: `selectedFrameworks` Empty Array Breaks Agent Prompts
**What goes wrong:** If user unchecks all frameworks and runs analysis, the compliance mapper receives an empty list and produces an empty result, confusing the risk scorer.
**Why it happens:** No minimum enforcement in the UI.
**How to avoid:** In the `toggleFramework` action, prevent removing the last framework: `if (state.selectedFrameworks.length === 1 && state.selectedFrameworks.includes(framework)) return state;`. Also show a tooltip/hint that at least one framework is required.

### Pitfall 6: Heat Map Transition Firing Before Data Is Set
**What goes wrong:** Cells flash to their color immediately then back to gray (transition fires on mount, not on data arrival).
**Why it happens:** CSS `transition` applies when className changes, but if the initial render already has the final color class, there's no transition.
**How to avoid:** Initialize cell state as `'loading'` (slate-700) and update to the actual compliance status when `analysisResult` becomes available. This ensures the transition fires after data arrives.

### Pitfall 7: Download Button Blob URL Memory Leak
**What goes wrong:** `URL.createObjectURL` URLs are not automatically revoked, accumulating in memory.
**Why it happens:** Browsers do not GC object URLs until the document is destroyed.
**How to avoid:**
```typescript
const handleDownload = (content: string, filename: string) => {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url); // revoke immediately after click
};
```

---

## Code Examples

Verified patterns from codebase and official sources:

### Reading analysisResult from Zustand (existing pattern)
```typescript
// Source: src/app/dashboard/page.tsx (existing)
const analysisResult = useAnalysisStore((state) => state.analysisResult);
const status = useAnalysisStore((state) => state.status);

const riskData = analysisResult?.risk ?? null;
const complianceData = analysisResult?.compliance ?? null;
const pipelineData = analysisResult?.pipeline ?? null;
```

### Conditional render for partial results (graceful degradation)
```typescript
// Source: analysis pattern from orchestrator.ts
// analysisResult.risk is null if risk scorer failed
// analysisResult.compliance is null if compliance mapper failed

if (!complianceData && status === 'complete') {
  return (
    <div className="flex items-center gap-2 text-amber-400 text-sm">
      <AlertTriangle className="h-4 w-4" />
      Compliance data unavailable — agent failed
    </div>
  );
}
```

### Status badge utility function
```typescript
// Source: design system decisions — reusable across Control Matrix + Findings Table
function getStatusBadgeClass(status: 'compliant' | 'partial' | 'non-compliant' | 'not-applicable'): string {
  switch (status) {
    case 'compliant':    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'partial':      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'non-compliant': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'not-applicable': return 'bg-slate-700/50 text-slate-500 border-slate-600/30';
  }
}

function getSeverityBadgeClass(severity: 'critical' | 'high' | 'medium' | 'low' | 'info'): string {
  switch (severity) {
    case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'high':     return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'medium':   return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'low':      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'info':     return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  }
}
```

### Severity ordering for default sort
```typescript
// Source: decisions — "Default sort: severity descending (failures first)"
const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

// Status ordering for control matrix default sort
const STATUS_ORDER: Record<string, number> = {
  'non-compliant': 0,
  partial: 1,
  compliant: 2,
  'not-applicable': 3,
};
```

### Copy to clipboard
```typescript
// Source: Navigator Clipboard API (MDN, standard)
const [copied, setCopied] = useState(false);

const handleCopy = async (text: string) => {
  await navigator.clipboard.writeText(text);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-hot-toast for toasts | sonner (shadcn) | 2024 | shadcn now recommends sonner; handles dark theme natively |
| prism.js for highlighting | shiki | 2024-2025 | shiki uses TextMate grammars, superior dark themes, tree-shakable |
| recharts for gauges | pure SVG + RAF | Always best for single metrics | 0 dependencies, full control |
| EventSource for SSE | fetch() + ReadableStream | Already in project (Phase 3) | EventSource doesn't support POST bodies |
| Zustand `shallow` compare | Individual primitive selectors | Zustand v5 | v5 promotes atomic selectors; already used in project |

**Already in project and should NOT be changed:**
- shadcn `Select` for dropdown filters (use same pattern for framework + severity dropdowns in tables)
- shadcn `Badge` for status/severity pills (use with custom className for color variants)
- shadcn `ScrollArea` for scrollable table bodies
- shadcn `Card` with `bg-slate-800 border-slate-700` pattern for all new panels
- shadcn `Skeleton` for loading states already established

---

## Open Questions

1. **Dashboard layout for new panels**
   - What we know: Current overview has a 2-column grid with `ComplianceCardSkeleton` (top-left) and `ArchitectureGraph` (top-right), `PipelinePreviewSkeleton` (bottom-left).
   - What's unclear: Where do Risk Heat Map, Control Matrix, and Findings Table live? They are large tables that won't fit in the 2-column grid without scrolling.
   - Recommendation: Add new dashboard sub-pages via the existing `src/app/dashboard/` routing. Route `/dashboard` = overview (gauge + graph). Add `/dashboard/compliance` for heat map + control matrix + findings table. The existing sidebar already has navigation slots. Or add the tables below the 2-column grid on the overview page with full-width rows.

2. **Heat map domain columns: what are the "compliance domains"?**
   - What we know: The `nodeRiskMap` has `riskLevel`, `riskFactors`, `complianceGaps` per node. The `frameworkMappings` has per-framework controls. There is no explicit "domain" field.
   - What's unclear: The heat map spec says "nodes as rows, compliance domains as columns" — but the agent output uses `framework` (SOX, PCI-DSS, etc.), not sub-domains.
   - Recommendation: Use `framework` as the column axis (4 columns: SOX, PCI-DSS, NIST-CSF, CCC). The cell value for `[nodeId][framework]` is derived by filtering `frameworkMappings` for mappings that reference this node (via `affectedNodes` in findings or `calmControlId`). Alternatively, the heat map columns represent the 4 frameworks and each cell shows the aggregate compliance status for that node across that framework's controls. This is the most implementable interpretation.

3. **Retry Analysis UX flow**
   - What we know: The retry button appears in the completion banner when `failedAgents.length > 0`.
   - What's unclear: Does "retry" re-run all 4 agents from scratch, or only the failed ones?
   - Recommendation: Re-run all agents (simplest — call `startStream` again with same `calmData` and `selectedFrameworks`). The orchestrator already resets state via `startAnalysis()`.

---

## Sources

### Primary (HIGH confidence)
- Codebase inspection — `src/lib/agents/`, `src/store/analysis-store.ts`, `src/app/dashboard/page.tsx`, `src/app/api/analyze/route.ts`, `package.json` — Current state of Phase 3 output
- shadcn/ui official docs (verified via WebSearch) — tabs, sonner, checkbox, tooltip components
- Shiki official docs: https://shiki.style/packages/next — Next.js integration patterns
- Radix UI tabs docs: https://www.radix-ui.com/primitives/docs/components/tabs

### Secondary (MEDIUM confidence)
- LogRocket blog (2024): SVG circular progress with React hooks — `stroke-dasharray`/`stroke-dashoffset` pattern
- shadcn/ui sonner integration — medium.com Stackademic article Jan 2026 — confirms `Toaster` in root layout pattern
- Shiki GitHub README — `shiki/bundle/web` for client-side use
- MDN Navigator Clipboard API — `writeText()` + `URL.createObjectURL` patterns (standard, HIGH confidence)

### Tertiary (LOW confidence)
- None — all critical claims verified with official docs or codebase inspection

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified via package.json + official docs
- Architecture: HIGH — all data schemas read directly from source files; UI patterns match existing project conventions
- Pitfalls: MEDIUM-HIGH — RAF cleanup and shiki bundle size verified with official docs; others from general React best practices

**Research date:** 2026-02-24
**Valid until:** 2026-03-24 (30 days — shadcn and shiki are stable, Next.js 15 APIs stable)
