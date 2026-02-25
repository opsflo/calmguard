---
status: pending
area: gitops
created: 2026-02-25
source: conversation
priority: high
---

# Split GitOps into 3 separate PR buttons

## Current State
Two buttons: "Generate Pipeline PR" (bundles GH Actions + security + infra) and "Generate Remediation PR".

## Target State
Three buttons with separate concerns:

1. **DevSecOps Pipeline PR** — GitHub Actions CI workflow + security scanning configs
   - Scope GH Actions to CI only (lint, build, test, security scan, compliance check)
   - Remove deployment stages from generated workflow
   - Include security scanning tool configs (Semgrep, CodeQL, Trivy, npm-audit)

2. **Compliance Remediation PR** — Remediated CALM architecture file (no change from current)

3. **Cloud Infrastructure PR** — Terraform/CloudFormation configs only
   - Separate from CI pipeline
   - Different review audience (infra/SRE team)

## Rationale
- Different review audiences and approval paths for each
- Deployment should not be in the generated CI workflow (separate concern)
- Infrastructure changes have different risk profile and require plan review
