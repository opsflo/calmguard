# Architecture Research

**Domain:** Multi-Agent AI Compliance Analysis — v1.3 Integration Architecture
**Researched:** 2026-02-25
**Confidence:** HIGH (direct codebase inspection of 82 TypeScript files)

> **Scope note:** This document supersedes the pre-build v2015 research and focuses specifically on how v1.3 features integrate with the existing running codebase. It answers four targeted questions: (1) How do enhanced compliance skills integrate, (2) how does multi-version CALM work, (3) how does the 3-button GitOps split work, and (4) how does the GitHub Action work.

---

## Existing System Architecture (As-Built, v1.2)

### System Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────────────┐  │
│  │  React Dashboard │  │   React Flow     │  │  Zustand Store        │  │
│  │  (Components)    │  │  (Arch Graph)    │  │  analysis-store.ts    │  │
│  │                  │  │                  │  │  pipelinePR           │  │
│  │  GitOpsCard      │  │  Custom Nodes    │  │  remediationPR        │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬──────────────┘  │
│           │                     │                     │                  │
│           └─────────────────────┴─────────────────────┘                  │
│                          SSE EventSource                                  │
├──────────────────────────────────────────────────────────────────────────┤
│                         API LAYER (Next.js App Router)                    │
│  ┌──────────────────────┐  ┌────────────────────────────────────────┐   │
│  │  POST /api/analyze   │  │  POST /api/github/create-pr            │   │
│  │  SSE ReadableStream  │  │  SSE ReadableStream                    │   │
│  │  → runAnalysis()     │  │  type: 'pipeline' | 'remediation'      │   │
│  └──────────┬───────────┘  └─────────────────┬──────────────────────┘   │
│             │                                │                           │
│             ↓                                ↓                           │
│       globalThis.__lastPipelineResult, __lastAnalysisResult,             │
│       __lastCalmDocument  (server-side globals for cross-route state)    │
├──────────────────────────────────────────────────────────────────────────┤
│                      ORCHESTRATION LAYER                                  │
│  ┌───────────────────────────────────────────────────────────────────┐   │
│  │  orchestrator.ts — runAnalysis()                                  │   │
│  │  Phase 1 (Promise.allSettled parallel):                           │   │
│  │    analyzeArchitecture() + mapCompliance() + generatePipeline()   │   │
│  │  Phase 2 (sequential, requires Phase 1):                          │   │
│  │    scoreRisk(architecture, compliance, pipeline)                  │   │
│  └───────────────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────────┤
│                         AGENT LAYER                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │  arch-       │  │  compliance- │  │  pipeline-   │  │  risk-     │  │
│  │  analyzer    │  │  mapper      │  │  generator   │  │  scorer    │  │
│  │              │  │              │  │              │  │            │  │
│  │  (loadAgent  │  │  (loadAgent  │  │  (loadAgent  │  │ (loadAgent │  │
│  │   Config +   │  │   Config +   │  │   Config +   │  │  Config +  │  │
│  │   loadSkills │  │   loadSkills │  │   loadSkills)│  │ loadSkills)│  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────┬───────┘  │
│         └─────────────────┴──────────────────┴───────────────┘          │
│                         generateObject() — Vercel AI SDK                  │
├──────────────────────────────────────────────────────────────────────────┤
│                CALM PARSING / EXTRACTION LAYER                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐   │
│  │  calm/types.ts   │  │  calm/parser.ts  │  │  calm/extractor.ts   │   │
│  │  calmDocument-   │  │  parseCalm()     │  │  extractAnalysis-    │   │
│  │  Schema (Zod)    │  │  strict Zod.safe │  │  Input()             │   │
│  │  v1.1 only now   │  │  Parse           │  │  → AnalysisInput     │   │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities (As-Built)

| Component | File | Responsibility |
|-----------|------|----------------|
| **calmDocumentSchema** | `src/lib/calm/types.ts` | Zod schema enforcing CALM v1.1 structure. Currently strict — rejects v1.0/v1.2 fields. |
| **parseCalm()** | `src/lib/calm/parser.ts` | Calls `calmDocumentSchema.safeParse()`. Returns discriminated ParseResult. |
| **extractAnalysisInput()** | `src/lib/calm/extractor.ts` | Transforms CalmDocument into AnalysisInput with pre-computed metadata for agents. |
| **loadAgentConfig()** | `src/lib/agents/registry.ts` | Reads `agents/{name}.yaml`, validates with agentConfigSchema, caches result. |
| **loadSkillsForAgent()** | `src/lib/skills/loader.ts` | Reads skill paths from agent config.spec.skills[], concatenates with `---` separators. |
| **agentEventEmitter** | `src/lib/ai/streaming.ts` | Global singleton. Agents push events; /api/analyze SSE route subscribes to pull them. |
| **runAnalysis()** | `src/lib/agents/orchestrator.ts` | Phase 1 parallel + Phase 2 sequential. Stores results in globalThis globals. |
| **remediateCalm()** | `src/lib/agents/calm-remediator.ts` | Called from create-pr route (NOT from runAnalysis). Reads globals for analysis context. |
| **create-pr route** | `src/app/api/github/create-pr/route.ts` | Two branches: `type=pipeline` (multi-file commit) and `type=remediation` (single-file PUT). |
| **GitOpsCard** | `src/components/dashboard/gitops-card.tsx` | Two PRSection components for pipeline and remediation. Both call create-pr route. |
| **Zustand store** | `src/store/analysis-store.ts` | pipelinePR, remediationPR state. No infraPR state yet. |
| **PRRecord** | `src/lib/github/types.ts` | `type: 'pipeline' | 'remediation'` — needs 'infra' added for 3-button split. |

---

## v1.3 Integration Architecture

### Feature 1: Enhanced Compliance Skills

**What changes:** Add specific control IDs (PCI-DSS Req 4.1, SOC2 CC6.x, NIST CSF PR.AC-x), protocol security grounding, and SOC2 framework to existing skill files. Potentially add new skill files.

**Integration path (no structural changes needed):**

```
skills/*.md  (existing files, add control IDs)
    ↓ loaded by
src/lib/skills/loader.ts  (loadSkillsForAgent — NO changes)
    ↓ read by
agents/compliance-mapper.yaml  (spec.skills array — add SOC2 if new file)
    ↓ config loaded by
src/lib/agents/registry.ts  (loadAgentConfig — NO changes)
    ↓ skills injected into prompt in
src/lib/agents/compliance-mapper.ts  (skillsContent in prompt — NO changes)
    ↓ output schema validated by
complianceMappingSchema (Zod) — may need controlId pattern tightened
```

**What to add/modify:**

| File | Change Type | What |
|------|-------------|------|
| `skills/PCI-DSS.md` | MODIFY | Add explicit control ID table: Req 4.1 (TLS in transit), Req 6.4 (vuln scanning), Req 10.x (audit logging) |
| `skills/NIST-CSF.md` | MODIFY | Add explicit control ID table: PR.AC-1 (identity), PR.DS-1 (data at rest), DE.CM-1 (network monitoring) |
| `skills/SOC2.md` | NEW FILE | SOC2 CC6.x (logical access), CC7.x (system operations), CC8.x (change management) |
| `skills/PROTOCOL-SECURITY.md` | NEW FILE | Protocol grounding: which protocols are insecure and what to upgrade to (HTTP→HTTPS, LDAP→TLS, FTP→SFTP, TCP→TLS). This grounds the remediator agent's decisions. |
| `agents/compliance-mapper.yaml` | MODIFY | Add `skills/SOC2.md` and `skills/PROTOCOL-SECURITY.md` to spec.skills array |
| `agents/calm-remediator.yaml` | MODIFY | Add `skills/PROTOCOL-SECURITY.md` to spec.skills array |
| `src/lib/agents/compliance-mapper.ts` | MODIFY | Add 'SOC2' to framework enum in complianceMappingSchema if added |
| `src/store/analysis-store.ts` | MINOR | Add 'SOC2' to selectedFrameworks default array if added |

**Key insight:** The skill loader pattern is the entire integration point. Adding a new skill file and referencing it in an agent YAML is all that's required. No changes to loader.ts, registry.ts, or any agent's core execution logic.

**Data flow unchanged:**
```
YAML skills[] → loadSkillsForAgent() → skillsContent string → LLM prompt injection
```

---

### Feature 2: Multi-Version CALM Support (v1.0, v1.1, v1.2)

**What changes:** Parser currently rejects v1.0/v1.2 documents. Need version detection + lenient parsing that accepts field aliases and optional v1.2 additions (decorators, timelines).

**Current parser (strict):**
```typescript
// src/lib/calm/parser.ts
export function parseCalm(json: unknown): ParseResult {
  const result = calmDocumentSchema.safeParse(json);  // v1.1 schema only
  ...
}
```

**Integration path:**

```
src/lib/calm/version-detector.ts  (NEW — detect version from $schema or field patterns)
    ↓
src/lib/calm/types.ts  (MODIFY — add optional v1.2 fields, lenient aliases)
    ↓
src/lib/calm/parser.ts  (MODIFY — add parseCalmMultiVersion() or update parseCalm())
    ↓
src/lib/calm/extractor.ts  (POTENTIALLY MODIFY — handle v1.2 decorators in metadata)
    ↓
src/app/api/calm/parse/route.ts  (uses parseCalm — transparent if parseCalm updated)
src/app/api/analyze/route.ts  (uses parseCalm — transparent if parseCalm updated)
```

**Version detection logic:**

```typescript
// src/lib/calm/version-detector.ts  (NEW)
export type CalmVersion = '1.0' | '1.1' | '1.2' | 'unknown';

export function detectCalmVersion(json: unknown): CalmVersion {
  if (!json || typeof json !== 'object') return 'unknown';
  const doc = json as Record<string, unknown>;

  // Check $schema field if present
  const schema = doc['$schema'];
  if (typeof schema === 'string') {
    if (schema.includes('1.2')) return '1.2';
    if (schema.includes('1.1')) return '1.1';
    if (schema.includes('1.0')) return '1.0';
  }

  // Check for v1.2-specific fields
  if (doc['decorators'] !== undefined || doc['timelines'] !== undefined) return '1.2';

  // Default assumption: v1.1 (core schema stable across 1.0-1.2)
  return '1.1';
}
```

**Schema changes in types.ts (lenient approach):**

```typescript
// Extend calmDocumentSchema with optional v1.2 fields
export const calmDocumentSchema = z.object({
  nodes: z.array(calmNodeSchema).min(1),
  relationships: z.array(calmRelationshipSchema),
  controls: z.record(z.string(), controlDefinitionSchema).optional(),
  flows: z.array(calmFlowSchema).optional(),
  // v1.2 additions (optional, ignored if absent)
  decorators: z.array(z.unknown()).optional(),   // NEW
  timelines: z.array(z.unknown()).optional(),    // NEW
  $schema: z.string().optional(),               // NEW — for version detection
}).passthrough();  // Accept unknown top-level fields from future versions
```

**Key decision: use `.passthrough()` not strict mode.** CALM core schema is stable across 1.0-1.2. The only safe change is accepting unknown top-level keys. Do NOT use `.strip()` — preserve original data for PR commits.

**What files change:**

| File | Change Type | What |
|------|-------------|------|
| `src/lib/calm/version-detector.ts` | NEW | Version detection logic |
| `src/lib/calm/types.ts` | MODIFY | Add optional `$schema`, `decorators`, `timelines`; add `.passthrough()` |
| `src/lib/calm/parser.ts` | MODIFY | Add version detection; expose `detectedVersion` in ParseSuccess result |
| `src/lib/calm/extractor.ts` | MINOR | Handle new optional fields in metadata output |
| `src/app/api/analyze/route.ts` | NO CHANGE | Transparent via parseCalm() |
| `src/app/api/github/create-pr/route.ts` | NO CHANGE | Uses globalThis.__lastCalmDocument |

**ParseSuccess extended:**
```typescript
export interface ParseSuccess {
  success: true;
  data: CalmDocument;
  version: CalmVersion;  // NEW — for dashboard display
}
```

---

### Feature 3: 3-Button GitOps Split

**What changes:** The current GitOpsCard has 2 PRSection buttons (Pipeline Artifacts, Compliance Remediation). The requirement splits Pipeline Artifacts into two: "DevSecOps CI" (CI-only GitHub Actions, no deployment stages) and "Cloud Infra" (IaC only: Terraform/CloudFormation).

**Current state:**
- 2 sections: Pipeline Artifacts + Compliance Remediation
- `PRRecord.type`: `'pipeline' | 'remediation'`
- `createPRRequestSchema.type`: `z.enum(['pipeline', 'remediation'])`
- `globalThis.__lastPipelineResult` holds full PipelineConfig (includes both CI and IaC)

**Target state:**
- 3 sections: DevSecOps CI + Compliance Remediation + Cloud Infra
- `PRRecord.type`: `'devsecops-ci' | 'remediation' | 'cloud-infra'`
- `createPRRequestSchema.type`: `z.enum(['devsecops-ci', 'remediation', 'cloud-infra'])`
- `buildPipelineFiles()` splits into `buildCIFiles()` and `buildInfraFiles()`

**Integration path:**

```
src/lib/github/types.ts  (MODIFY — add 'cloud-infra' to PRRecord.type)
    ↓
src/store/analysis-store.ts  (MODIFY — add infraPR: PRRecord, setInfraPR action)
    ↓
src/app/api/github/create-pr/route.ts  (MODIFY — add 'cloud-infra' branch, split buildPipelineFiles)
    ↓
src/components/dashboard/gitops-card.tsx  (MODIFY — add 3rd PRSection, new handler)
```

**File-by-file changes:**

| File | Change Type | What |
|------|-------------|------|
| `src/lib/github/types.ts` | MODIFY | `type: 'pipeline' \| 'remediation'` → `'devsecops-ci' \| 'remediation' \| 'cloud-infra'` |
| `src/store/analysis-store.ts` | MODIFY | Add `infraPR: PRRecord`, `setInfraPR` action, reset initial state |
| `src/app/api/github/create-pr/route.ts` | MODIFY | Add `'cloud-infra'` to schema enum; add cloud-infra branch in POST handler; split `buildPipelineFiles` into `buildCIFiles` + `buildInfraFiles` |
| `src/components/dashboard/gitops-card.tsx` | MODIFY | Add 3rd `PRSection` for infraPR; add `handleGenerateInfraPR` handler; update grid from 2-col to 3-col or stacked |

**create-pr route split:**

```typescript
// Currently: buildPipelineFiles(pipeline) commits everything
// After split:

function buildCIFiles(pipeline: PipelineConfig): Array<{path: string; content: string}> {
  const files = [];
  // CI workflow only — no deployment stages
  files.push({ path: '.github/workflows/calmguard-ci.yml', content: pipeline.githubActions.yaml });
  // Security scanning configs
  for (const tool of pipeline.securityScanning.tools) {
    files.push({ path: `.github/${tool.name}.yml`, content: tool.config });
  }
  return files;
}

function buildInfraFiles(pipeline: PipelineConfig): Array<{path: string; content: string}> {
  // IaC only
  if (pipeline.infrastructureAsCode.provider === 'terraform') {
    return [{ path: 'terraform/main.tf', content: pipeline.infrastructureAsCode.config }];
  }
  return [{ path: 'cloudformation/template.yaml', content: pipeline.infrastructureAsCode.config }];
}
```

**CI-only GitHub Actions:** The pipeline-generator agent currently produces a full CI/CD YAML including deployment stages. For the DevSecOps CI button, either: (a) strip deployment stages from the generated YAML in `buildCIFiles`, or (b) add a separate CI-only prompt variant to the pipeline-generator. Option (a) is simpler for the hackathon timeline — post-process the YAML to remove deploy jobs.

**Zustand store additions:**
```typescript
// analysis-store.ts additions
infraPR: PRRecord;  // initial: { type: 'cloud-infra', status: 'idle' }
setInfraPR: (pr: Partial<PRRecord>) => void;
```

**GitOps card layout:** 3-column grid on desktop (`grid-cols-3`), stacking to 1 on mobile. Each column is a PRSection with its own state.

---

### Feature 4: GitHub Action for Continuous Compliance

**What this is:** A reusable GitHub Action (`.github/workflows/` YAML definition + `action.yml`) that organizations can add to their repos to automatically run CALMGuard compliance checking when PRs touch CALM files.

**Architecture decision: GitHub Action needs a headless API or CLI wrapper.**

The existing CALMGuard system is browser-driven (file upload or GitHub URL input → dashboard analysis). A GitHub Action runs in CI, with no browser. Two viable approaches:

**Option A: Headless API call (recommended for hackathon)**
The GitHub Action calls CALMGuard's deployed API directly with curl/node:
```yaml
# action.yml (what we ship)
runs:
  using: composite
  steps:
    - name: Run CALMGuard Analysis
      shell: bash
      run: |
        curl -X POST https://calmguard.vercel.app/api/analyze \
          -H "Content-Type: application/json" \
          -d "{\"calm\": $(cat ${{ inputs.calm-file }}), \"frameworks\": [\"PCI-DSS\",\"NIST-CSF\"]}" \
          --no-buffer | node ${{ github.action_path }}/scripts/parse-sse.js
```

**Option B: New Next.js API route for headless analysis**
A new `/api/analyze/headless` route that returns JSON (not SSE), suitable for CI consumption. This avoids SSE parsing complexity in the action script.

**Recommended approach: Option B (headless route) + Option A (curl call).**

Create `/api/analyze/headless` as a thin wrapper:
```typescript
// src/app/api/analyze/headless/route.ts  (NEW)
export async function POST(req: NextRequest): Promise<Response> {
  // Same as /api/analyze but:
  // - Returns JSON (not SSE stream)
  // - Waits for runAnalysis() to complete
  // - Returns { result: AnalysisResult, version: string } as JSON
  // - Returns HTTP 422 if compliance score < threshold (exits CI)
}
```

**GitHub Action files (placed in repo root):**

```
.github/actions/calmguard-check/
├── action.yml              # Action metadata and inputs/outputs
└── scripts/
    └── check-calm.sh       # Shell script calling headless API
```

**action.yml structure:**
```yaml
name: 'CALMGuard Compliance Check'
description: 'Runs CALMGuard CALM compliance analysis and fails PR if below threshold'
inputs:
  calm-file:
    description: 'Path to CALM JSON file'
    required: true
  frameworks:
    description: 'Comma-separated compliance frameworks'
    required: false
    default: 'PCI-DSS,NIST-CSF,SOX'
  fail-threshold:
    description: 'Minimum compliance score (0-100)'
    required: false
    default: '70'
  calmguard-url:
    description: 'CALMGuard deployment URL'
    required: false
    default: 'https://calmguard.vercel.app'
outputs:
  compliance-score:
    description: 'Overall compliance score (0-100)'
  report-url:
    description: 'Link to full CALMGuard dashboard report'
runs:
  using: 'composite'
  steps:
    - name: Check CALM compliance
      shell: bash
      run: ${{ github.action_path }}/scripts/check-calm.sh
```

**Trigger pattern (what orgs add to their repos):**
```yaml
# .github/workflows/calm-compliance.yml (generated by DevSecOps CI PR button)
on:
  pull_request:
    paths:
      - '**/*.calm.json'
      - '**/architecture.json'
jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: finos-labs/calmguard@v1
        with:
          calm-file: architecture/trading-platform.calm.json
          frameworks: PCI-DSS,SOX,NIST-CSF
          fail-threshold: '70'
```

**What new files this requires:**

| File | Change Type | What |
|------|-------------|------|
| `src/app/api/analyze/headless/route.ts` | NEW | JSON-returning version of /api/analyze, no SSE |
| `.github/actions/calmguard-check/action.yml` | NEW | GitHub Action definition |
| `.github/actions/calmguard-check/scripts/check-calm.sh` | NEW | Shell script doing the API call |
| `src/lib/agents/orchestrator.ts` | NO CHANGE | headless route reuses runAnalysis() |

---

## Component Boundary Map (New vs Modified vs Unchanged)

```
src/lib/calm/
  types.ts              MODIFY — .passthrough(), $schema, decorators, timelines
  parser.ts             MODIFY — expose version in ParseSuccess, call detectCalmVersion
  version-detector.ts   NEW — CalmVersion type + detectCalmVersion()
  extractor.ts          MINOR — pass version in metadata if needed

skills/
  PCI-DSS.md            MODIFY — add explicit control IDs
  NIST-CSF.md           MODIFY — add explicit control IDs
  SOX.md                MODIFY — add explicit control IDs (or may already have)
  SOC2.md               NEW — full SOC2 CC framework knowledge
  PROTOCOL-SECURITY.md  NEW — protocol grounding (HTTP→HTTPS, etc.)

agents/
  compliance-mapper.yaml  MODIFY — add SOC2.md + PROTOCOL-SECURITY.md to skills
  calm-remediator.yaml    MODIFY — add PROTOCOL-SECURITY.md to skills

src/lib/agents/
  compliance-mapper.ts    MODIFY — add 'SOC2' to framework enum if adding SOC2
  orchestrator.ts         NO CHANGE
  architecture-analyzer.ts  NO CHANGE
  pipeline-generator.ts   NO CHANGE
  risk-scorer.ts          NO CHANGE
  calm-remediator.ts      NO CHANGE

src/lib/github/
  types.ts                MODIFY — PRRecord.type add 'cloud-infra'
  operations.ts           NO CHANGE
  client.ts               NO CHANGE
  globals.ts              NO CHANGE

src/store/
  analysis-store.ts       MODIFY — add infraPR state + setInfraPR action

src/app/api/
  analyze/route.ts        NO CHANGE — parseCalm() changes are transparent
  analyze/headless/route.ts  NEW — JSON response version for CI
  github/create-pr/route.ts  MODIFY — add cloud-infra branch, split file builders

src/components/dashboard/
  gitops-card.tsx         MODIFY — add 3rd PRSection, 3-col grid, infraPR handler

.github/actions/
  calmguard-check/action.yml  NEW
  calmguard-check/scripts/check-calm.sh  NEW
```

---

## Data Flow Changes (v1.3)

### Compliance Skills Flow (unchanged structure, enriched content)

```
YAML agent config (spec.skills[])
    ↓ loadSkillsForAgent()
Concatenated Markdown with control IDs
    ↓ injected into LLM prompt
complianceMappingSchema output with grounded controlIds
    ↓ frameworkMappings[].controlId now has specific ID (e.g. "PCI-DSS-4.1")
Compliance report UI — more actionable findings
```

### Multi-Version CALM Flow

```
User uploads CALM file (v1.0, v1.1, or v1.2)
    ↓ parseCalm() → detectCalmVersion() → lenient schema parse
ParseSuccess { data: CalmDocument, version: '1.2' }
    ↓ extractAnalysisInput()
AnalysisInput (version-normalized, decorators/timelines in metadata)
    ↓ agents receive same AnalysisInput interface — NO agent changes needed
Dashboard displays CALM version badge next to filename
```

### 3-Button GitOps Flow

```
Analysis completes → globalThis.__lastPipelineResult (PipelineConfig) stored
    ↓ user sees 3 buttons
[Generate DevSecOps CI PR]    [Generate Remediation PR]    [Generate Cloud Infra PR]
    ↓                               ↓                              ↓
POST create-pr type='devsecops-ci'  type='remediation'     type='cloud-infra'
    ↓                               ↓                              ↓
buildCIFiles(pipeline)         remediateCalm()              buildInfraFiles(pipeline)
  .github/workflows/            originalCalm modified         terraform/main.tf OR
  .github/*.yml (SAST)          PUT to GitHub Contents API   cloudformation/template.yaml
    ↓                               ↓                              ↓
Zustand: pipelinePR             remediationPR                infraPR
  .status = 'open'               .status = 'open'             .status = 'open'
```

### GitHub Action Flow

```
PR opened touching *.calm.json in customer repo
    ↓ GitHub Actions workflow triggers
action uses: finos-labs/calmguard@v1
    ↓ check-calm.sh
POST /api/analyze/headless { calm: <file contents>, frameworks: [...] }
    ↓ server runs runAnalysis() synchronously
JSON response { result: AnalysisResult }
    ↓ shell script checks overall compliance score
score < fail-threshold? → exit 1 (PR check fails with annotation)
score >= threshold? → exit 0 (PR check passes)
    ↓ GitHub PR check status posted
```

---

## Build Order

This order is driven by dependency constraints and the 2-day timeline constraint (Feb 26-27).

### Step 1: Compliance Skills (4-6 hours, no risk, zero deps)

**Why first:** Zero dependencies. Pure Markdown + YAML edits. No TypeScript changes. Immediately improves the quality of all agent outputs. Demonstrates value fast. Safe to merge alone.

```
1a. Enhance skills/PCI-DSS.md — add control ID table (Req 1.x, 4.x, 6.x, 8.x, 10.x)
1b. Enhance skills/NIST-CSF.md — add control ID table (PR.AC, PR.DS, DE.CM, RS.RP)
1c. Enhance skills/SOX.md — add control ID table (ITGC, access controls, change mgmt)
1d. Create skills/SOC2.md — CC6 (logical access), CC7 (system ops), CC8 (change mgmt)
1e. Create skills/PROTOCOL-SECURITY.md — protocol grounding table
1f. Update agents/compliance-mapper.yaml — add SOC2.md + PROTOCOL-SECURITY.md to skills
1g. Update agents/calm-remediator.yaml — add PROTOCOL-SECURITY.md to skills
1h. Update compliance-mapper.ts — add 'SOC2' to framework enum in Zod schema
1i. Update analysis-store.ts — add 'SOC2' to selectedFrameworks default
```

### Step 2: Multi-Version CALM (2-3 hours, low risk)

**Why second:** Affects parser and types only. No UI changes. Transparent to agents and API routes. Must complete before other features rely on version field.

```
2a. Create src/lib/calm/version-detector.ts — detectCalmVersion()
2b. Modify src/lib/calm/types.ts — add optional v1.2 fields + .passthrough()
2c. Modify src/lib/calm/parser.ts — call detectCalmVersion, expose version in ParseSuccess
2d. Minor update to src/lib/calm/extractor.ts if needed (pass version through)
2e. Dashboard: display CALM version badge (minor UI touch)
```

### Step 3: 3-Button GitOps Split (3-4 hours, medium complexity)

**Why third:** Depends on nothing new. Requires coordinated changes across types, store, route, and component. The largest single change surface area in v1.3.

```
3a. Modify src/lib/github/types.ts — add 'cloud-infra' to PRRecord type union
3b. Modify src/store/analysis-store.ts — add infraPR state + setInfraPR
3c. Modify src/app/api/github/create-pr/route.ts:
    - Update Zod enum to include 'cloud-infra'
    - Add 'cloud-infra' branch in POST handler
    - Split buildPipelineFiles into buildCIFiles + buildInfraFiles
    - Rename 'pipeline' type to 'devsecops-ci' (or alias both)
3d. Modify src/components/dashboard/gitops-card.tsx:
    - Add infraPR selector from store
    - Add handleGenerateInfraPR handler
    - Add 3rd PRSection component
    - Update grid to 3-col
```

### Step 4: GitHub Action (3-4 hours, medium complexity)

**Why fourth:** Requires headless API route. Sequenced last because it's the least demo-critical for the live dashboard (it's a CI integration artifact). The action YAML can be demo'd by showing it generated in a PR rather than live execution.

```
4a. Create src/app/api/analyze/headless/route.ts — JSON-returning analysis endpoint
4b. Create .github/actions/calmguard-check/action.yml — action definition
4c. Create .github/actions/calmguard-check/scripts/check-calm.sh — shell runner
4d. Update pipeline-generator to include calm-compliance.yml in generated CI workflow
    (so the DevSecOps CI PR commits the trigger workflow too)
```

**Dependency graph:**
```
Step 1 (skills)      — no deps — start immediately
Step 2 (multi-ver)   — no deps — can parallelize with Step 1
Step 3 (3-button)    — no deps on 1 or 2 — can parallelize
Step 4 (GH Action)   — depends on Step 3 complete (needs headless route design stable)
```

**Practical two-developer split:**
- Dev A: Steps 1 + 2 (skills + CALM parsing — pure lib work)
- Dev B: Step 3 (GitOps split — UI + route + store)
- Both: Step 4 together (headless route + action.yml)

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| GitHub REST API | Octokit-style direct fetch via `githubFetch()` wrapper | GITHUB_TOKEN env var. Already integrated in create-pr route. |
| LLM Providers | Vercel AI SDK provider registry (`google:gemini-2.5-flash` default) | Multi-provider support exists. Headless route inherits. |
| Vercel Fluid Compute | `maxDuration=300` on SSE routes | Headless route needs same — analysis can take 60-120s. |

### Internal Boundaries

| Boundary | Communication | v1.3 Change |
|----------|---------------|-------------|
| skills/*.md → agents | File read + string concatenation via loader | Add new skill files, update YAML refs |
| parser → API routes | Return value (ParseResult) | Add `version` field to ParseSuccess |
| create-pr route → Zustand | SSE frame `type:'done'` → component reads prUrl/branchName | Add infraPR path |
| Zustand infraPR → GitOpsCard | `useAnalysisStore((s) => s.infraPR)` | New selector |
| headless route → GitHub Action | HTTP POST/JSON response | New route, new shell script |
| globalThis globals → create-pr route | Server-side globals (NOT client state) | Add no new globals — cloud-infra reuses `__lastPipelineResult` |

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Adding a New PR Type Without Updating All Three Layers

**What people do:** Add 'cloud-infra' to the create-pr Zod schema but forget to update PRRecord type in types.ts or infraPR in the Zustand store.

**Why it's wrong:** TypeScript will catch the Zod mismatch, but the Zustand store omission causes silent undefined state, rendering the 3rd button invisible or with no state tracking.

**Do this instead:** Change types.ts first (PRRecord.type union), then store (infraPR state), then route (enum + handler), then component (selector + PRSection). Types-first order.

### Anti-Pattern 2: Strict Schema Rejection of v1.2 Fields

**What people do:** Add explicit `z.never()` or no-passthrough enforcement on unknown CALM document fields to be "safe."

**Why it's wrong:** Legitimate CALM v1.2 files with `decorators` or `timelines` will be silently dropped or rejected, even though the core nodes/relationships are valid. Users with v1.2 files can't use the platform.

**Do this instead:** Use `.passthrough()` on `calmDocumentSchema` at the document level. The agents receive `AnalysisInput` (nodes/relationships only) — they never see the raw document anyway.

### Anti-Pattern 3: SSE-Only Analysis Route for GitHub Action

**What people do:** Try to parse SSE in the shell script of a GitHub Action, processing the event stream to extract the final result.

**Why it's wrong:** Shell SSE parsing is fragile (buffering, partial frames, multiline data). GitHub Action timeout behavior with long SSE connections is unpredictable. The 300s maxDuration is a Vercel constraint, not GitHub's.

**Do this instead:** Create a dedicated `/api/analyze/headless` that awaits `runAnalysis()` and returns JSON. Clean JSON response is trivially shell-parseable with `jq`.

### Anti-Pattern 4: Duplicating Pipeline Data in Globals

**What people do:** Store separate `__lastCIPipelineResult` and `__lastInfraPipelineResult` globals instead of reusing `__lastPipelineResult`.

**Why it's wrong:** The existing `PipelineConfig` already contains both CI and IaC sections. Splitting the global means `buildCIFiles` and `buildInfraFiles` are extracting subsets of the same data. Two globals add confusion and stale-state risk.

**Do this instead:** Keep single `__lastPipelineResult`. `buildCIFiles()` and `buildInfraFiles()` are just different lenses on the same data.

### Anti-Pattern 5: Injecting Version Check into Every Agent

**What people do:** Pass `version: '1.2'` into each agent's prompt explicitly, expecting agents to handle version differences.

**Why it's wrong:** Agents receive `AnalysisInput`, which is version-normalized at extraction time. They should not need version awareness — that's the parser's concern. Adding version logic to agent prompts adds complexity and token waste.

**Do this instead:** Keep version detection in the CALM layer (parser + extractor). Agents receive normalized `AnalysisInput` regardless of source version. The version can appear in the dashboard as metadata, not in agent logic.

---

## Scaling Considerations

> Note: CALMGuard is a hackathon demo. Scaling is not a primary concern. These notes are for post-hackathon evolution.

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-100 users (hackathon) | Current architecture: monolith Next.js, globalThis globals, in-process agents. Fine for demo. |
| 100-1K users | Replace globalThis globals with Redis per-session storage. Rate limit headless API. |
| 1K+ users | Extract orchestrator to dedicated service. Redis pub/sub for SSE. Queue LLM calls. |

### Specific Concerns for v1.3

1. **Headless route under CI load:** Every PR to repos using the GitHub Action calls `/api/analyze/headless`. At scale this becomes a high-volume endpoint. Vercel Fluid Compute handles bursts; add caching by CALM content hash for repeated identical files.

2. **globalThis globals and parallel requests:** The `__lastPipelineResult` / `__lastAnalysisResult` / `__lastCalmDocument` globals are a concurrency hazard if multiple users analyze different CALM files simultaneously and then all hit create-pr. For the hackathon this is acceptable. For production, use per-session storage (Redis or DB).

---

## Sources

- Direct codebase inspection: 82 TypeScript files, 46,800 lines (2026-02-25)
- `src/lib/calm/types.ts` — v1.1 Zod schema, base for multi-version changes
- `src/lib/calm/parser.ts` — current strict-parse behavior
- `src/lib/agents/registry.ts` + `src/lib/skills/loader.ts` — skill injection pattern
- `src/app/api/github/create-pr/route.ts` — existing 2-type PR creation flow
- `src/components/dashboard/gitops-card.tsx` — existing 2-button GitOps UI
- `src/store/analysis-store.ts` — PRRecord state structure
- `agents/compliance-mapper.yaml` — agent YAML format confirming skill reference pattern
- FINOS CALM spec: https://github.com/finos/architecture-as-code/tree/main/calm/release/1.1 (v1.1 schema base)
- CALM v1.2 overview: decorators + timelines additions per PROJECT.md context
- GitHub Actions custom actions: https://docs.github.com/en/actions/creating-actions/creating-a-composite-action

---

*Architecture research for: CALMGuard v1.3 — Compliance Intelligence & CI Integration*
*Researched: 2026-02-25*
*Confidence: HIGH — all integration points verified against actual source files*
