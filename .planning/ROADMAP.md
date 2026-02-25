# Roadmap: CALMGuard v1.3 — Compliance Intelligence & CI Integration

## Overview

v1.3 transforms CALMGuard from a demo-grade compliance analyzer into a grounded, auditable compliance intelligence platform. Agents cite specific control IDs (PCI-DSS 4.0 Req 4.2.1, NIST CSF 2.0 PR.DS-01, SOC2 CC6.1) instead of vague framework references. The CALM parser accepts architecture files from all stable versions (1.0-1.2). GitOps splits into three targeted PRs for different review audiences. A generated GitHub Action workflow enables continuous compliance checking in customer repos. All within 2 days (Feb 26-27, 2026) with two developers.

## Milestones

- ✅ **v1.1 MVP** - Phases 1-6 (shipped 2026-02-24)
- ✅ **v1.2 GitOps PR Generation** - Phase 7 (shipped 2026-02-25)
- 🚧 **v1.3 Compliance Intelligence & CI Integration** - Phases 8-11 (in progress)

## Phases

**Phase Numbering:**
- Continues from v1.2 (Phase 7 was last)
- Phases 8-9 can execute in parallel (no shared files)
- Phases 10-11 are sequential

- [ ] **Phase 8: Compliance Intelligence** - Grounded skill files with specific control IDs for PCI-DSS, NIST-CSF, SOC2; protocol security rationale; citable agent output
- [ ] **Phase 9: Multi-Version CALM** - Lenient parser accepting CALM 1.0/1.1/1.2 with version detection and dashboard display
- [ ] **Phase 10: GitOps Split** - Three separate PR buttons (DevSecOps CI, Compliance Remediation, Cloud Infra) with CI-only pipeline workflow
- [ ] **Phase 11: CI Integration & Documentation** - GitHub Action workflow for continuous compliance checking; README with agent profiles

## Phase Details

### Phase 8: Compliance Intelligence
**Goal**: Agents produce compliance findings with citable, auditable control IDs from official frameworks — not hallucinated identifiers
**Depends on**: Nothing (pure content and config changes, no code dependencies on other v1.3 phases)
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05
**Success Criteria** (what must be TRUE):
  1. Running analysis on a CALM file produces findings that cite specific PCI-DSS 4.0 requirement IDs (e.g., "Req 4.2.1") instead of generic "PCI-DSS compliance" references
  2. Running analysis produces findings that cite specific NIST CSF 2.0 subcategory IDs (e.g., "PR.DS-01") with function/category context
  3. Running analysis produces findings that reference SOC2 Trust Service Criteria IDs (e.g., "CC6.1", "CC7.2") where relevant to the architecture
  4. The compliance remediator agent cites protocol upgrade rationale (HTTP to HTTPS, FTP to SFTP) with specific regulatory control IDs grounding each recommendation
  5. No compliance finding in agent output contains a control ID that does not exist in the corresponding official framework
**Plans**: TBD

### Phase 9: Multi-Version CALM
**Goal**: Users can analyze CALM architecture files from any stable version (1.0, 1.1, 1.2) without parser failures
**Depends on**: Nothing (parser-layer change, transparent to agents; can run in parallel with Phase 8)
**Requirements**: CALM-01, CALM-02, CALM-03, CALM-04
**Success Criteria** (what must be TRUE):
  1. A valid CALM v1.0 document (without `description` on flow transitions) parses successfully and produces analysis results
  2. All existing CALM v1.1 demo files (trading platform, payment gateway) continue to parse and analyze identically to v1.2 behavior (no regression)
  3. A CALM v1.2 document with optional `decorators`, `timelines`, and `adrs` fields parses successfully without stripping those fields
  4. The dashboard displays the detected CALM version (e.g., "CALM v1.2") after parsing
**Plans**: TBD

### Phase 10: GitOps Split
**Goal**: Users generate three distinct PRs targeting different review audiences: CI/security engineers (DevSecOps CI), compliance officers (Remediation), and infrastructure teams (Cloud Infra)
**Depends on**: Phase 9 (create-pr route calls parseCalm; parser types must be stable before adding third PR branch)
**Requirements**: GOPS-01, GOPS-02, GOPS-03, GOPS-04
**Success Criteria** (what must be TRUE):
  1. The GitOps card shows three separate PR buttons: "DevSecOps CI", "Compliance Remediation", and "Cloud Infrastructure"
  2. Clicking "DevSecOps CI" creates a PR containing GitHub Actions workflows (lint, build, test, security scan) with NO deployment stages
  3. Clicking "Cloud Infrastructure" creates a PR containing Terraform/CloudFormation configs only (no CI workflows, no CALM modifications)
  4. Clicking "Compliance Remediation" creates a PR with modified CALM file identical to v1.2 behavior (controls added, protocols upgraded, change explanations in description)
  5. Clicking any PR button disables all three buttons until generation completes (prevents concurrent PR corruption)
**Plans**: TBD

### Phase 11: CI Integration & Documentation
**Goal**: Users can integrate continuous compliance checking into their own repos via a generated GitHub Action, and understand the agent system through documentation
**Depends on**: Phase 10 (headless API route needs stable PipelineConfig type; CI workflow generator extends Phase 10 pipeline generator)
**Requirements**: CI-01, CI-02, DOCS-01
**Success Criteria** (what must be TRUE):
  1. The DevSecOps CI PR includes a `calmguard-check.yml` workflow file alongside the standard CI pipeline
  2. The generated `calmguard-check.yml` workflow triggers on PRs that modify CALM files (using `paths:` filter) and runs compliance validation
  3. README contains agent profiles for all four agents (Scout/Architecture Analyzer, Ranger/Compliance Mapper, Arsenal/Pipeline Generator, Sniper/Risk Scorer) with their roles and capabilities
**Plans**: TBD

## Progress

**Execution Order:**
Phases 8 and 9 run in parallel (Day 1). Phase 10 follows (Day 2 AM). Phase 11 follows (Day 2 PM).

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 8. Compliance Intelligence | v1.3 | 0/? | Not started | - |
| 9. Multi-Version CALM | v1.3 | 0/? | Not started | - |
| 10. GitOps Split | v1.3 | 0/? | Not started | - |
| 11. CI Integration & Docs | v1.3 | 0/? | Not started | - |

---

*Roadmap created: 2026-02-25*
*Total phases: 4 (8-11) | Total plans: TBD*
*Ready for: `/gsd:plan-phase 8` (parallel with Phase 9)*
