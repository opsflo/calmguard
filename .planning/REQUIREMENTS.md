# Requirements: CALMGuard v1.3 — Compliance Intelligence & CI Integration

**Defined:** 2026-02-25
**Core Value:** When a user uploads a CALM architecture JSON (or points to one in a GitHub repo), CALMGuard must analyze it with AI agents and produce a real-time compliance dashboard — and for repo-connected analyses, generate PRs with pipeline artifacts and compliance-remediated architecture files.

## v1.3 Requirements

### Compliance Intelligence

- [x] **COMP-01**: PCI-DSS skill file includes specific Requirement IDs from PCI-DSS 4.0 (e.g., Req 4.2.1, Req 6.2.4) with CALM field mappings
- [x] **COMP-02**: NIST-CSF skill file includes Function/Category/Subcategory IDs from CSF 2.0 (e.g., GV.OC-01, PR.DS-01) with CALM field mappings
- [x] **COMP-03**: SOC2 skill file created with AICPA Trust Service Criteria IDs (CC6.1, CC7.2, A1.1) and CALM field mappings
- [x] **COMP-04**: Protocol security skill file with explicit upgrade mappings (HTTP→HTTPS, FTP→SFTP, LDAP→TLS, TCP→TLS) grounding remediation decisions
- [ ] **COMP-05**: Agent output includes citable control IDs from skill files, not hallucinated identifiers

### Multi-Version CALM

- [ ] **CALM-01**: Parser accepts valid CALM v1.0 documents (no `description` required on flow transitions)
- [ ] **CALM-02**: Parser accepts valid CALM v1.1 documents (current behavior, no regression)
- [ ] **CALM-03**: Parser accepts valid CALM v1.2 documents with optional decorators, timelines, and ADRs fields
- [ ] **CALM-04**: Version detection reports which CALM version a document conforms to

### GitOps Split

- [ ] **GOPS-01**: Dashboard shows 3 separate PR buttons: DevSecOps CI, Compliance Remediation, Cloud Infrastructure
- [ ] **GOPS-02**: DevSecOps CI PR contains GitHub Actions workflow (lint, build, test, security scan) with NO deployment stages
- [ ] **GOPS-03**: Cloud Infrastructure PR contains Terraform/CloudFormation configs only
- [ ] **GOPS-04**: Compliance Remediation PR behavior unchanged from v1.2

### CI Integration

- [ ] **CI-01**: Pipeline generator outputs a `calmguard-check.yml` workflow as part of DevSecOps CI PR
- [ ] **CI-02**: Generated workflow detects CALM file changes in PRs and runs compliance validation

### Documentation

- [ ] **DOCS-01**: README updated with agent profiles (Scout, Ranger, Arsenal, Sniper) including roles and capabilities

## Future Requirements

### CI Platform (post-hackathon)

- **CI-03**: Standalone `calmguard/compliance-check` GitHub Action published to marketplace
- **CI-04**: Headless API route for non-browser compliance analysis
- **CI-05**: PR comment with inline compliance findings

### Advanced Compliance (post-hackathon)

- **COMP-06**: Deterministic pre-checks before LLM analysis (protocol rules, control presence)
- **COMP-07**: Custom organizational policy definitions
- **COMP-08**: Compliance posture trending over time

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full GitHub Action marketplace publish | Generated YAML sufficient for demo; standalone action is post-hackathon |
| Headless API route | Not needed if CI YAML is generated as file in PR |
| Architecture drift detection | Post-hackathon; requires infrastructure integration |
| CALM v1.0-rc1/rc2 support | Release candidates are pre-stable; no production usage |
| Deterministic rules engine | Agentic skills approach chosen for speed; rules engine is post-hackathon |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| COMP-01 | Phase 8 | Complete |
| COMP-02 | Phase 8 | Complete |
| COMP-03 | Phase 8 | Complete |
| COMP-04 | Phase 8 | Complete |
| COMP-05 | Phase 8 | Pending |
| CALM-01 | Phase 9 | Pending |
| CALM-02 | Phase 9 | Pending |
| CALM-03 | Phase 9 | Pending |
| CALM-04 | Phase 9 | Pending |
| GOPS-01 | Phase 10 | Pending |
| GOPS-02 | Phase 10 | Pending |
| GOPS-03 | Phase 10 | Pending |
| GOPS-04 | Phase 10 | Pending |
| CI-01 | Phase 11 | Pending |
| CI-02 | Phase 11 | Pending |
| DOCS-01 | Phase 11 | Pending |

**Coverage:**
- v1.3 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0

---
*Requirements defined: 2026-02-25*
*Last updated: 2026-02-25 after roadmap creation (all 16 requirements mapped to phases 8-11)*
