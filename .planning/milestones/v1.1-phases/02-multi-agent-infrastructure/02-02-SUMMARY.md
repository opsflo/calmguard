---
phase: 02-multi-agent-infrastructure
plan: 02
subsystem: multi-agent-ai
tags: [agent-config, compliance-knowledge, yaml, skill-injection, aof-inspired]
dependency-graph:
  requires: []
  provides:
    - agent-configurations
    - compliance-framework-knowledge
  affects:
    - compliance-mapper-agent
    - agent-registry
    - skill-loader
tech-stack:
  added:
    - yaml-agent-configs
    - markdown-skill-files
  patterns:
    - AOF-inspired agent definitions
    - Skill-based knowledge injection
    - Multi-framework compliance mapping
key-files:
  created:
    - agents/orchestrator.yaml
    - agents/architecture-analyzer.yaml
    - agents/compliance-mapper.yaml
    - agents/pipeline-generator.yaml
    - agents/risk-scorer.yaml
    - skills/SOX.md
    - skills/PCI-DSS.md
    - skills/FINOS-CCC.md
    - skills/NIST-CSF.md
  modified: []
decisions:
  - Use AOF-inspired YAML schema for agent configurations (apiVersion, kind, metadata, spec)
  - Use Markdown format for compliance knowledge files (better for LLM prompt injection)
  - Reference all 4 compliance frameworks in Compliance Mapper agent skills array
  - Use Gemini 2.5 Flash as default model across all agents (provider flexibility via AI SDK)
  - Set temperature 0.1-0.2 for analytical agents (analyzer, scorer), 0.3 for creative agent (pipeline generator)
  - Include substantive content in SKILL.md files (186-468 lines each) for meaningful LLM analysis
metrics:
  duration: 7 minutes
  tasks: 2
  files: 9
  lines: 1505
  commits: 2
  completed: 2026-02-16
---

# Phase 02 Plan 02: Agent Configuration & Compliance Knowledge Summary

**One-liner:** Created 5 AOF-inspired YAML agent configurations and 4 substantive compliance framework SKILL.md files (SOX, PCI-DSS, FINOS-CCC, NIST-CSF) for multi-agent compliance analysis.

## Objective

Create all agent YAML configuration files and SKILL.md compliance knowledge files that agents will load at runtime. Agents need configuration (model, role, skills) and compliance knowledge (framework controls, requirements, mapping guidance) to produce meaningful analysis.

## What Was Built

### Agent YAML Configurations (5 files, 126 lines)

Created AOF-inspired agent definition files in `agents/` directory with consistent schema:

1. **orchestrator.yaml** - Coordinates parallel Phase 1 (analyzer, mapper, generator) and sequential Phase 2 (scorer) execution. Violet (#8b5cf6), brain icon, temp 0.1.

2. **architecture-analyzer.yaml** - Extracts structural insights: components, data flows, trust boundaries, security zones, communication patterns. Blue (#3b82f6), network icon, temp 0.2. No skills (structural analysis).

3. **compliance-mapper.yaml** - Maps CALM controls to regulatory frameworks. Green (#22c55e), shield-check icon, temp 0.2. **References 4 skill files:** SOX.md, PCI-DSS.md, FINOS-CCC.md, NIST-CSF.md. maxTokens: 8192 (largest due to multi-framework analysis).

4. **pipeline-generator.yaml** - Generates GitHub Actions workflows, security scanning configs (Semgrep, CodeQL), and Terraform IaC templates. Amber (#f59e0b), git-branch icon, temp 0.3 (creative generation). maxTokens: 8192.

5. **risk-scorer.yaml** - Aggregates all Phase 1 results into overall compliance score (0-100), per-framework scores, and node-level risk heat map. Red (#ef4444), gauge icon, temp 0.1 (precise scoring). Inputs: architecture-analysis, compliance-mapping, pipeline-config.

**Schema consistency:**
- All use `apiVersion: calmguard/v1`, `kind: Agent`
- Metadata includes: name (kebab-case), displayName, icon (lucide-react), color (hex)
- Spec includes: role (multi-line description), model (provider, model, temperature), skills (array), inputs/outputs (typed), maxTokens

### Compliance Knowledge SKILL.md Files (4 files, 1379 lines)

Created substantive compliance framework knowledge in `skills/` directory for LLM prompt injection:

1. **SOX.md** (186 lines) - Sarbanes-Oxley Act compliance:
   - 5 ITGC categories: Access Controls, Change Management, Operations, Software Development, Data Management
   - CALM control mappings (audit-logging → SOX ITGC, data-encryption → SOX data integrity)
   - Section 302 (Corporate Responsibility), Section 404 (Internal Controls)
   - Common findings: missing audit logging, unencrypted DB connections, no separation of duties
   - 7-year data retention requirement (SEC Rule 17a-4)

2. **PCI-DSS.md** (346 lines) - Payment Card Industry Data Security Standard v4.0:
   - All 12 requirements across 6 goals (Build Secure Networks, Protect Account Data, Vulnerability Management, Access Control, Monitoring, Security Policy)
   - Critical v4.0 requirements: MFA mandatory for all CDE access (Req 8.4), TLS 1.0/1.1 prohibited
   - Protocol mappings: HTTPS/TLS/mTLS = compliant, HTTP/FTP/Telnet = critical failure
   - Never store sensitive authentication data (CVV2, PIN) post-authorization
   - Quarterly ASV scans, annual penetration testing requirements

3. **FINOS-CCC.md** (379 lines) - FINOS Common Cloud Controls:
   - 8 control categories: IAM, Data Protection, Network Security, Logging & Monitoring, Resilience, Secure Development, Cloud Infrastructure, Compliance & Governance
   - Cloud-agnostic controls for financial services (AWS, Azure, GCP)
   - CCC control IDs (CCC-IAM-01 through CCC-CGO-10) mapped to CALM controls
   - Multi-zone deployment patterns, secrets management (never in environment variables)
   - Common cloud misconfigurations: single-zone DB, missing SIEM, plain-text secrets

4. **NIST-CSF.md** (468 lines) - NIST Cybersecurity Framework 2.0:
   - 6 functions: **GOVERN (new in 2.0)**, Identify, Protect, Detect, Respond, Recover
   - 23 categories, 106 subcategories with CALM mappings
   - GOVERN function emphasizes policy, risk management, supply chain risk (critical for financial services)
   - Comprehensive control-to-subcategory mapping table (e.g., data-encryption → PR.DS-01/02, audit-logging → PR.PS-04)
   - CSF as meta-framework: maps to PCI-DSS, SOX, ISO 27001 for unified compliance
   - Incident response is binary: documented plan or high-risk gap

**Content design principles:**
- Framework overview (purpose, applicability, structure)
- Key control areas with CALM architecture mapping guidance
- Node-level and relationship-level control mappings
- Common findings categorized by severity (Critical, High, Medium)
- Assessment criteria with score ranges (Compliant 90-100, Partial 60-89, Non-Compliant 0-59)
- LLM-specific notes for analysis guidance

## Tasks Completed

### Task 1: Create agent YAML configuration files ✓

**Status:** Complete
**Commit:** `b319903` - feat(02-02): create agent YAML configurations
**Files:** 5 agent YAML files (126 lines total)

Created all 5 agent definitions with consistent AOF-inspired schema. Each agent has clear role, model configuration (Gemini 2.5 Flash default), skill references (compliance-mapper only), and typed I/O specifications. Icons use lucide-react names, colors match project's compliance color scheme (violet, blue, green, amber, red).

**Verification passed:**
- All 5 YAML files exist in `agents/` directory
- Each has `apiVersion`, `kind`, `metadata`, `spec` fields
- `compliance-mapper.yaml` references all 4 skill files
- Valid YAML syntax (no parse errors)

### Task 2: Create SKILL.md compliance knowledge files ✓

**Status:** Complete
**Commit:** `f746a08` - feat(02-02): create compliance knowledge SKILL.md files
**Files:** 4 SKILL.md files (1379 lines total)

Created all 4 compliance framework knowledge files with substantive content (186-468 lines each). Each provides framework overview, key control areas, CALM-specific mapping guidance, common findings in financial services architectures, and assessment criteria. Content designed for LLM prompt injection into Compliance Mapper agent.

**Verification passed:**
- All 4 SKILL.md files exist in `skills/` directory
- Each contains framework overview, control areas, mapping guidance, common findings
- Total content is substantive (1379 lines across 4 files, avg 345 lines/file)
- All files include "Sarbanes-Oxley", "Payment Card", "Common Cloud Controls", and "NIST" respectively

## Deviations from Plan

None - plan executed exactly as written.

## Technical Decisions

1. **AOF-inspired YAML schema over JSON configs**
   - Rationale: Human-readable, supports comments, multi-line strings for role descriptions
   - Impact: Easier to maintain and version-control agent definitions
   - Alternative considered: JSON configs (less readable, no comments)

2. **Markdown format for compliance knowledge**
   - Rationale: Natural language format optimized for LLM consumption, better than structured YAML/JSON for knowledge injection
   - Impact: Compliance Mapper agent gets rich context without parsing overhead
   - Alternative considered: Structured YAML (harder to express nuanced guidance)

3. **Gemini 2.5 Flash as default across all agents**
   - Rationale: Fast, cost-effective, good structured output quality, API keys available
   - Impact: Consistent performance across agents, easy to swap providers via AI SDK
   - Alternative considered: Mix of models (adds complexity, inconsistent behavior)

4. **Temperature variation by agent type**
   - Rationale: Analytical tasks (analyzer, scorer) need precision (0.1-0.2), creative tasks (pipeline generator) benefit from higher temp (0.3)
   - Impact: Optimized output quality per agent function
   - Alternative considered: Uniform temperature (suboptimal for creative generation)

5. **Substantive SKILL.md content (186-468 lines each)**
   - Rationale: LLM needs sufficient context for meaningful compliance analysis, not just bullet points
   - Impact: Higher quality compliance mapping with specific findings and remediation guidance
   - Alternative considered: Brief summaries (insufficient for nuanced compliance assessment)

## Verification Results

All verification criteria passed:

1. ✓ `ls agents/` shows 5 .yaml files
2. ✓ `ls skills/` shows 4 .md files
3. ✓ Each YAML file parses cleanly (valid YAML syntax)
4. ✓ Each SKILL.md has 100+ lines of substantive content (range: 186-468 lines)
5. ✓ compliance-mapper.yaml references all 4 skill files

## Success Criteria Met

- [x] 5 agent YAML configs with consistent AOF-inspired schema
- [x] 4 SKILL.md files with substantive compliance framework knowledge
- [x] Agent configs reference correct skill files
- [x] Content is detailed enough to produce meaningful LLM analysis

## Files Created/Modified

### Created (9 files)

**Agent Configurations:**
- `agents/orchestrator.yaml` (23 lines) - Fleet coordination
- `agents/architecture-analyzer.yaml` (23 lines) - Structural analysis
- `agents/compliance-mapper.yaml` (28 lines) - Regulatory mapping with 4 skill references
- `agents/pipeline-generator.yaml` (25 lines) - DevSecOps pipeline generation
- `agents/risk-scorer.yaml` (27 lines) - Risk aggregation and scoring

**Compliance Knowledge:**
- `skills/SOX.md` (186 lines) - Sarbanes-Oxley Act ITGC compliance
- `skills/PCI-DSS.md` (346 lines) - Payment Card Industry DSS v4.0
- `skills/FINOS-CCC.md` (379 lines) - FINOS Common Cloud Controls
- `skills/NIST-CSF.md` (468 lines) - NIST Cybersecurity Framework 2.0

### Modified

None

## Impact on System

**Immediate:**
- Agent registry can now load agent configurations from YAML files
- Compliance Mapper agent can inject substantive framework knowledge into prompts
- All 5 agents have defined I/O contracts for orchestration

**Next steps enabled:**
- Implement agent registry (loads YAML configs)
- Implement skill loader (reads and concatenates SKILL.md files)
- Implement individual agent logic (calls AI SDK with loaded config + skills)
- Implement orchestrator (coordinates parallel/sequential agent execution)

**Dependencies satisfied:**
- No dependencies (standalone content files)

**Dependencies created:**
- Agent implementations will depend on these config files
- Skill loader will read SKILL.md files at runtime

## Commits

1. **b319903** - feat(02-02): create agent YAML configurations
   - 5 agent YAML files created
   - 126 lines total
   - Consistent AOF-inspired schema

2. **f746a08** - feat(02-02): create compliance knowledge SKILL.md files
   - 4 SKILL.md files created
   - 1379 lines total
   - Substantive compliance framework content

## Performance

- **Duration:** 7 minutes
- **Tasks completed:** 2/2
- **Files created:** 9
- **Lines of code/content:** 1505
- **Commits:** 2

## Self-Check: PASSED

### Files Created
```
✓ FOUND: agents/orchestrator.yaml
✓ FOUND: agents/architecture-analyzer.yaml
✓ FOUND: agents/compliance-mapper.yaml
✓ FOUND: agents/pipeline-generator.yaml
✓ FOUND: agents/risk-scorer.yaml
✓ FOUND: skills/SOX.md
✓ FOUND: skills/PCI-DSS.md
✓ FOUND: skills/FINOS-CCC.md
✓ FOUND: skills/NIST-CSF.md
```

### Commits Verified
```
✓ FOUND: b319903 (feat(02-02): create agent YAML configurations)
✓ FOUND: f746a08 (feat(02-02): create compliance knowledge SKILL.md files)
```

### Content Verification
```
✓ compliance-mapper.yaml references all 4 skill files
✓ SOX.md contains "Sarbanes-Oxley" (186 lines)
✓ PCI-DSS.md contains "Payment Card" (346 lines)
✓ FINOS-CCC.md contains "Common Cloud Controls" (379 lines)
✓ NIST-CSF.md contains "NIST" (468 lines)
```

All files and commits verified successfully.
