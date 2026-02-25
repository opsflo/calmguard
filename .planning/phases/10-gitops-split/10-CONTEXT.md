# Phase 10: GitOps Split - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Users generate three distinct PRs from a single CALM analysis, each targeting a different review audience: CI/security engineers (DevSecOps CI), compliance officers (Remediation), and infrastructure teams (Cloud Infra). The current single-PR GitOps flow splits into three separate generation paths with independent buttons, branch naming, PR descriptions, and content.

</domain>

<decisions>
## Implementation Decisions

### Button Layout and UX
- **Three side-by-side buttons** in the GitOps card, horizontal row, equal width
- Each button has an **icon + text label** (shield for DevSecOps, file-check for Compliance, cloud for Infra)
- **Disable all three buttons** while any PR is generating — spinner on the active button, others greyed out
- After success, the **clicked button changes to a link** showing the PR URL/number; other two buttons re-enable
- Buttons only appear **after analysis completes** — disabled/hidden until full analysis has run
- User **can click the same type again** after success — creates a new PR on a fresh branch each time (previous link stays visible)

### Cloud Infrastructure PR Content
- Target **AWS** as the cloud provider (most common in financial services)
- **Production-realistic scaffolds** — VPC, subnets, security groups, IAM roles derived from CALM. Not copy-paste-deploy, but realistic enough to show CALM-to-infra mapping
- CALM signals that drive generation: **node types + protocols + relationships** (database nodes → RDS/security groups, service nodes → ECS/ALB, HTTPS → ACM certs + TLS listeners, mTLS → private CA)
- **Arsenal generates it** with a new `CLOUD-INFRASTRUCTURE.md` skill file — extends Arsenal's existing IaC capability with dedicated AWS Terraform knowledge

### PR Descriptions and Branch Naming
- **Type-prefixed branches with timestamp**: `calmguard/devsecops-ci-{timestamp}`, `calmguard/compliance-remediation-{timestamp}`, `calmguard/cloud-infra-{timestamp}`
- PR descriptions contain a **CALM traceability summary** — which nodes/relationships triggered the generated content, plus what was generated
- PRs target the repo's **default branch** (usually `main`)
- **Auto-label each PR**: DevSecOps CI → `ci/cd`, Compliance → `compliance`, Cloud Infra → `infrastructure`. Labels created if they don't exist

### Concurrency and Error Handling
- On failure: **re-enable buttons with error toast** notification. Failed button shows subtle error indicator
- If GitHub token is missing: **prompt to add token in settings** with a clear message and link. Don't attempt the API call
- All three buttons disabled during any generation — **prevents concurrent PR corruption**

### Claude's Discretion
- Internal API route structure (single route with type parameter vs separate routes per PR type)
- Cloud Infrastructure Terraform module organization (single file vs multi-file)
- How to handle the transition from existing single-PR GitOps card to three-button layout
- CLOUD-INFRASTRUCTURE.md skill file content and structure

</decisions>

<specifics>
## Specific Ideas

- The existing GitOps card and create-pr API route already handle DevSecOps CI and Compliance Remediation — Cloud Infrastructure is the new generation path
- Arsenal already generates IaC (Terraform) as part of its pipeline output — the Cloud Infra PR isolates and expands this into a standalone artifact
- The `DEVSECOPS-PIPELINE.md` skill pattern should be followed for the new `CLOUD-INFRASTRUCTURE.md` skill

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 10-gitops-split*
*Context gathered: 2026-02-25*
