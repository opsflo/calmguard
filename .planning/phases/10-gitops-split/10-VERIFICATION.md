---
phase: 10-gitops-split
verified: 2026-02-25T16:00:00Z
status: passed
score: 5/5 must-haves verified
re_verification: false
human_verification:
  - test: "Click DevSecOps CI button on dashboard after analysis completes"
    expected: "Button disables alongside the other two; spinner appears; eventually PR link with branch name calmguard/devsecops-ci-{ts} and ci/cd label appears"
    why_human: "SSE streaming, button disable visual state, and real PR creation require a live GitHub token and running app"
  - test: "Click Cloud Infrastructure button on dashboard after analysis completes"
    expected: "Branch named calmguard/cloud-infra-{ts} created; PR contains only .tf files (no .yml workflows, no CALM file modifications); PR description has CALM Traceability section"
    why_human: "Actual file content of PR and GitHub label application require live end-to-end run"
  - test: "Click Compliance Remediation button after analysis"
    expected: "Branch calmguard/compliance-remediation-{ts} created; modified CALM file committed (controls added, protocols upgraded); PR description lists per-change explanations"
    why_human: "CALM agent output and actual diff in remediated CALM JSON require live run"
  - test: "Trigger two PR buttons in rapid succession (requires two browser tabs or mock)"
    expected: "Second button remains greyed out and unclickable while first is generating"
    why_human: "Concurrency lock visual behavior needs manual UI testing"
---

# Phase 10: GitOps Split Verification Report

**Phase Goal:** Users generate three distinct PRs targeting different review audiences: CI/security engineers (DevSecOps CI), compliance officers (Remediation), and infrastructure teams (Cloud Infra)
**Verified:** 2026-02-25T16:00:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth                                                                                                   | Status     | Evidence                                                                                                                      |
|----|----------------------------------------------------------------------------------------------------------|------------|-------------------------------------------------------------------------------------------------------------------------------|
| 1  | The GitOps card shows three separate PR buttons: "DevSecOps CI", "Compliance Remediation", "Cloud Infrastructure" | VERIFIED | `gitops-card.tsx` renders `md:grid-cols-3` grid with three `PRSection` children labelled exactly "DevSecOps CI", "Compliance Remediation", "Cloud Infrastructure" (lines 300-330) |
| 2  | DevSecOps CI PR contains only GitHub Actions workflows and security scan configs, NO IaC                | VERIFIED   | `buildPipelineFiles()` in `create-pr/route.ts` commits only `.github/workflows/calmguard-ci.yml` + security tool `.yml` files; comment at line 81 confirms "IaC REMOVED — now lives in Cloud Infrastructure PR only (GOPS-02)" |
| 3  | Cloud Infrastructure PR contains only Terraform files from `CloudInfraConfig.terraform.modules`         | VERIFIED   | `buildInfraFiles()` maps `infra.terraform.modules.map(mod => ({ path: mod.filename, content: mod.content }))` — no CI workflows, no CALM file commits |
| 4  | Compliance Remediation PR commits modified CALM file with controls added and protocols upgraded          | VERIFIED   | Remediation branch uses `remediateCalm()` agent, commits `remediatedCalm` via GitHub Contents API PUT; PR body lists `changeType === 'protocol-upgrade'` and `'control-added'` per-change explanations |
| 5  | Clicking any PR button disables all three until generation completes                                    | VERIFIED   | `isAnyGenerating` derived from all three PR statuses (lines 152-155); passed as `disabled={isAnyGenerating}` to all three `PRSection` instances; `disabled` prop respected in idle and error branches |

**Score:** 5/5 truths verified

---

### Required Artifacts

| Artifact                                             | Expected                                             | Status     | Details                                                              |
|------------------------------------------------------|------------------------------------------------------|------------|----------------------------------------------------------------------|
| `skills/CLOUD-INFRASTRUCTURE.md`                    | CALM Signal → AWS Resource mapping table             | VERIFIED   | Exists, 8 rows covering network/service/database/webclient/HTTPS/mTLS/deployed-in/controls |
| `agents/cloud-infra-generator.yaml`                 | Agent YAML loadable by registry                      | VERIFIED   | Exists, proper `apiVersion: calmguard/v1`, `kind: Agent`, correct metadata and spec |
| `src/lib/agents/cloud-infra-generator.ts`           | Exports `generateCloudInfra`, `cloudInfraConfigSchema`, `CloudInfraConfig` | VERIFIED | All three exported; function follows pipeline-generator pattern with 3-attempt retry, SSE events, AgentResult return |
| `src/lib/github/globals.ts`                         | Declares `__lastCloudInfraResult: CloudInfraConfig or null or undefined` | VERIFIED | Line 22: `var __lastCloudInfraResult: CloudInfraConfig | null | undefined` |
| `src/lib/agents/orchestrator.ts`                    | Runs `generateCloudInfra` in Phase 1 parallel at index [3] | VERIFIED | Line 179: `generateCloudInfra(input)` in `Promise.allSettled` array; result extracted at `phase1Results[3]`; stored in `globalThis.__lastCloudInfraResult` |
| `src/lib/github/types.ts`                           | `PRRecord.type` union includes `'infra'`             | VERIFIED   | Line 30: `type: 'pipeline' | 'remediation' | 'infra'`               |
| `src/store/analysis-store.ts`                       | `infraPR` state + `setInfraPR` action                | VERIFIED   | `infraPR: { type: 'infra' as const, status: 'idle' as const }` in initialState; `setInfraPR` action merges partial updates |
| `src/components/dashboard/gitops-card.tsx`          | 3-column layout, icons, concurrency lock, infra handler | VERIFIED | `md:grid-cols-3`; Shield/FileCheck2/Cloud icons; `isAnyGenerating` lock; `handleGenerateInfraPR` calls API with `type: 'infra'` |
| `src/lib/github/operations.ts`                      | `ensureLabel()` and `addLabelToPR()` helpers         | VERIFIED   | Both exported; `ensureLabel` ignores 422; `addLabelToPR` logs warn on failure, never throws |
| `src/app/api/github/create-pr/route.ts`             | Handles `type: 'infra'`; IaC removed from pipeline; renamed branches; labels | VERIFIED | Schema: `z.enum(['pipeline', 'remediation', 'infra'])`; `LABEL_MAP` constant; branch names `calmguard/devsecops-ci-{ts}`, `calmguard/compliance-remediation-{ts}`, `calmguard/cloud-infra-{ts}`; `buildPipelineFiles` has no IaC |
| `src/app/api/analyze/route.ts`                      | Stores `result.cloudInfra` in `globalThis.__lastCloudInfraResult` | VERIFIED | Line 94: `globalThis.__lastCloudInfraResult = result.cloudInfra` |

---

### Key Link Verification

| From                         | To                                      | Via                               | Status  | Details                                                                 |
|------------------------------|-----------------------------------------|-----------------------------------|---------|-------------------------------------------------------------------------|
| `gitops-card.tsx` handleGenerateInfraPR | `/api/github/create-pr`    | `fetch` POST with `type: 'infra'` | WIRED   | Lines 266-279; SSE response parsed by shared `readPRStream()` → `setInfraPR` |
| `create-pr/route.ts` infra branch | `globalThis.__lastCloudInfraResult` | Direct global read at line 491   | WIRED   | Throws descriptive error if null; passes to `buildInfraFiles()` and `buildInfraPRBody()` |
| Orchestrator Phase 1          | `globalThis.__lastCloudInfraResult`     | Direct assignment line 268        | WIRED   | `globalThis.__lastCloudInfraResult = cloudInfra` after `phase1Results[3]` extraction |
| `analyze/route.ts`            | `globalThis.__lastCloudInfraResult`     | `result.cloudInfra` assignment    | WIRED   | Line 94 in analyze route stores result after orchestrator completes     |
| `PRSection disabled` prop    | `isAnyGenerating` in GitOpsCard         | Prop passed to all three sections | WIRED   | All three PRSection instances receive `disabled={isAnyGenerating}`; generating branch renders unconditionally |
| Remediation branch            | `remediateCalm()` agent                 | Import + direct call              | WIRED   | `import { remediateCalm } from '@/lib/agents/calm-remediator'`; called at line 336 |

---

### Requirements Coverage

| Requirement | Source Plan | Description                                                                        | Status    | Evidence                                                                                                      |
|-------------|------------|------------------------------------------------------------------------------------|-----------|---------------------------------------------------------------------------------------------------------------|
| GOPS-01     | 10-02, 10-03 | Dashboard shows 3 separate PR buttons: DevSecOps CI, Compliance Remediation, Cloud Infrastructure | SATISFIED | Three `PRSection` components in `gitops-card.tsx` with correct labels, icons, concurrency lock, and API wiring |
| GOPS-02     | 10-03      | DevSecOps CI PR contains GitHub Actions workflow with NO deployment stages          | SATISFIED | `buildPipelineFiles()` contains only `.github/workflows/calmguard-ci.yml` + security tool configs; IaC explicitly removed with code comment referencing GOPS-02 |
| GOPS-03     | 10-01, 10-03 | Cloud Infrastructure PR contains Terraform/CloudFormation configs only             | SATISFIED | `buildInfraFiles()` maps only from `CloudInfraConfig.terraform.modules`; `generateCloudInfra()` agent with CALM-to-Terraform mapping skill |
| GOPS-04     | 10-02, 10-03 | Compliance Remediation PR behavior unchanged from v1.2                             | SATISFIED | Remediation branch is entirely preserved: same `remediateCalm()` agent call, same CALM file PUT commit, same per-change PR body structure — only branch name prefix updated from `calmguard/remediation-` to `calmguard/compliance-remediation-` |

No orphaned requirements — all four GOPS requirements are claimed and satisfied by plans in this phase.

---

### Anti-Patterns Found

| File                                                    | Line | Pattern                                            | Severity | Impact                                                                    |
|---------------------------------------------------------|------|----------------------------------------------------|----------|---------------------------------------------------------------------------|
| `src/app/api/github/create-pr/route.ts`                 | 240  | Stale comment: "Pipeline PR: multi-file commit (GitHub Actions, SAST, IaC)" — IaC was removed | Info | Comment says "IaC" but code explicitly excludes it. Misleading to future readers but does not affect behavior. |
| `src/app/api/github/create-pr/route.ts`                 | 165  | `buildPipelinePRBody` outputs heading "## CALMGuard Pipeline Artifacts" | Info | Minor: PR description still uses "Pipeline Artifacts" heading rather than "DevSecOps CI". No functional impact. |

No blocker or warning anti-patterns found. Both issues are cosmetic comment/heading mismatches that do not affect correctness.

---

### Human Verification Required

The following items require a running application with a valid `GITHUB_TOKEN` to verify:

#### 1. Three-button disable behavior under concurrent generation

**Test:** Start a PR generation by clicking "DevSecOps CI". While it is generating (spinner visible), attempt to click "Compliance Remediation" or "Cloud Infrastructure".
**Expected:** Both non-active buttons are visually greyed out and non-interactive. The active button shows a spinner. After the first PR completes, all buttons re-enable (except the completed one which shows the PR link).
**Why human:** CSS visual disable state and concurrency lock feel require manual UI testing — grep cannot observe rendered disabled state.

#### 2. DevSecOps CI PR content validation

**Test:** Trigger "DevSecOps CI" PR generation against a test repo. Inspect the created PR files on GitHub.
**Expected:** PR contains only `.github/workflows/calmguard-ci.yml` and `.github/*.yml` security scanning files. No `terraform/` or `cloudformation/` files present. Branch named `calmguard/devsecops-ci-{timestamp}`. Label `ci/cd` applied.
**Why human:** Actual PR file list and labels require a live GitHub API call with valid token.

#### 3. Cloud Infrastructure PR content validation

**Test:** Trigger "Cloud Infrastructure" PR generation against a test repo after running analysis.
**Expected:** PR contains only `terraform/*.tf` files. PR description includes "### CALM Traceability" section mapping CALM elements to generated AWS resources. Branch named `calmguard/cloud-infra-{timestamp}`. Label `infrastructure` applied.
**Why human:** Actual Terraform content quality and traceability accuracy depend on LLM output — requires live run.

#### 4. Compliance Remediation PR content validation

**Test:** Trigger "Compliance Remediation" PR generation. Inspect the single changed file on GitHub.
**Expected:** The CALM JSON file is updated with added controls and upgraded protocols. PR description lists each change with Before/After and rationale. Branch named `calmguard/compliance-remediation-{timestamp}`. Label `compliance` applied.
**Why human:** CALM remediator agent output and actual diff correctness require live run.

---

### Gaps Summary

No gaps found. All five observable truths are fully verified against the codebase. The three-PR split is implemented end-to-end:

- **Agent layer (GOPS-03):** `generateCloudInfra()` in `cloud-infra-generator.ts` generates Terraform via `CLOUD-INFRASTRUCTURE.md` skill; runs in Phase 1 parallel; result stored in `globalThis.__lastCloudInfraResult`.
- **UI layer (GOPS-01):** `gitops-card.tsx` renders three distinct buttons with Shield/FileCheck2/Cloud icons; concurrency lock via `isAnyGenerating`; all three buttons call the API with distinct `type` values.
- **API layer (GOPS-02, GOPS-03, GOPS-04):** `create-pr/route.ts` handles all three types; IaC removed from pipeline branch; Cloud Infra branch contains only Terraform; Remediation branch preserves v1.2 behavior; auto-labels applied via non-blocking `ensureLabel`/`addLabelToPR` helpers.

---

_Verified: 2026-02-25T16:00:00Z_
_Verifier: Claude (gsd-verifier)_
