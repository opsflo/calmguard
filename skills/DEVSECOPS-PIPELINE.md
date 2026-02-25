# DevSecOps Pipeline Generation — Skill Guide

## Philosophy

Generate **focused, compliance-first CI/CD pipelines**. Keep them concise and auditable — not sprawling enterprise deployments. Judges and auditors should read the YAML and immediately see the security gates.

## GitHub Actions Workflow — Keep It Tight

Generate a SINGLE workflow file with these stages ONLY:

```
1. lint        — code quality gate
2. test        — unit tests
3. security    — SAST/dependency scanning (the compliance-critical step)
4. build       — build artifacts
```

DO NOT generate:
- Deployment stages (staging, production, canary)
- Environment gates or approval workflows
- Docker build/push steps
- Kubernetes/ECS deploy steps
- Notification/Slack integration steps
- Matrix builds across multiple OS/versions
- Caching steps (nice-to-have but clutters the demo)

The workflow should be 30-50 lines of YAML, NOT 100+.

## Security Scanning — Focus on 2 Tools Max

Pick the 2 most relevant tools for the architecture:

| Architecture Pattern | Recommended Tools |
|---------------------|-------------------|
| Web services + APIs | Semgrep + Trivy |
| Database-heavy | CodeQL + Trivy |
| Node.js/frontend | npm-audit + Semgrep |

Keep each tool config to 10-20 lines. No elaborate custom rules.

## Infrastructure as Code — Minimal Terraform

Generate a small, representative Terraform config showing:
- Provider block
- 1-2 key resources matching CALM node types (e.g., VPC + security group)
- Security group rules that map to CALM protocol requirements

Keep to 20-40 lines. DO NOT generate full cloud architectures with dozens of resources.

## Recommendations — 3-4 Max

Provide 3-4 high-impact recommendations, not exhaustive lists. Each should be:
- Specific to the architecture analyzed
- Tied to a compliance framework finding
- Actionable (not generic advice like "use monitoring")

## Formatting Rules

- All YAML/HCL strings MUST contain real newline characters
- Use 2-space indentation
- Include brief comments on security-critical lines only
- No markdown fencing in the output strings
