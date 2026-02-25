---
area: skills
priority: high
phase-target: 10
created: 2026-02-25
---

# Add DevSecOps Pipeline Skill File

Create `skills/DEVSECOPS-PIPELINE.md` to ground Pipeline Generator agent with:
- CI best practices (lint, build, test, SAST, dependency scan, secret detection)
- Stage ordering and dependency patterns
- Security scanning tool recommendations (CodeQL, Semgrep, Trivy, Gitleaks)
- No deployment stages (CI-only focus per GOPS-02)

Wire into `agents/pipeline-generator.yaml` skills list.
