# Roadmap: CALMGuard v1.2 — GitOps PR Generation

## Overview

v1.2 extends CALMGuard from a file-upload analysis tool to a GitOps-integrated compliance platform. Users can point CALMGuard at a GitHub repo containing a CALM architecture file, run the existing 4-agent analysis, and then generate PRs with both pipeline artifacts and a compliance-remediated architecture file — all from the dashboard.

## Phases

- [x] **Phase 7: GitOps PR Generation** - GitHub repo input, fetch CALM via API, generate pipeline artifact PR, AI-powered compliance remediation PR, dashboard PR status display

## Phase Details

### Phase 7: GitOps PR Generation
**Goal**: User can enter a GitHub repo URL + CALM file path, run analysis, and generate two PRs: one with pipeline artifacts (GitHub Actions, SAST configs, IaC) and one with a compliance-remediated CALM file showing added controls and upgraded protocols.

**Depends on**: v1.1 (all existing analysis infrastructure)

**Requirements**: GIT-01, GIT-02, GIT-03, ANLZ-01, PR-01, PR-02, PR-03, PR-04, FIX-01, FIX-02, FIX-03, FIX-04

**Success Criteria** (what must be TRUE):
  1. User can enter a GitHub repo URL (e.g., `owner/repo`) and path to CALM file (e.g., `calm/payment-gateway.calm.json`) in the dashboard UI
  2. System fetches the CALM file from GitHub using GITHUB_TOKEN and feeds it through existing parser
  3. Existing 4-agent analysis runs on the fetched architecture with full SSE streaming to dashboard
  4. After analysis, user can click "Generate Pipeline PR" and system creates a branch, commits GitHub Actions + SAST + IaC files, and opens a PR
  5. After analysis, user can click "Generate Remediation PR" and system creates a branch with modified CALM file (missing controls added, weak protocols upgraded) and opens a PR with change descriptions
  6. Dashboard shows PR links (clickable to GitHub) and generation status for both PRs
  7. PR descriptions include compliance report summary and specific change explanations

**Plans**: 3 plans

Plans:
- [x] 07-01-PLAN.md — GitHub repo input: Octokit setup, repo URL + path UI fields, fetch CALM via GitHub API, feed into parser (Wave 1)
- [x] 07-02-PLAN.md — Pipeline artifact PR: branch creation, commit pipeline files, open PR with compliance summary, display PR link (Wave 2)
- [x] 07-03-PLAN.md — Compliance remediation: AI agent generates modified CALM JSON, create branch, commit remediated file with change descriptions, open PR, display link (Wave 2)

## Progress

**Execution Order:**
Phase 7 is the only phase in v1.2.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 7. GitOps PR Generation | 3/3 | Complete | 07-01 done 2026-02-24, 07-02 done 2026-02-24, 07-03 done 2026-02-24 |

---

*Roadmap created: 2026-02-24*
*Total phases: 1 | Total plans: 3*
*Ready for: `/gsd:execute-phase 7`*
