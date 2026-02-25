# Phase 8: Compliance Intelligence - Research

**Researched:** 2026-02-25
**Domain:** Compliance skill file content engineering — PCI-DSS 4.0, NIST CSF 2.0, SOC2 TSC, protocol security grounding for LLM agents
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| COMP-01 | PCI-DSS skill file includes specific Requirement IDs from PCI-DSS 4.0 (e.g., Req 4.2.1, Req 6.2.4) with CALM field mappings | Existing `skills/PCI-DSS.md` partially covers this — lacks closed ID list appendix with granular sub-requirement IDs (4.2.1.1, 4.2.1.2, 6.2.4, 8.4.2, etc.) required to prevent hallucination |
| COMP-02 | NIST-CSF skill file includes Function/Category/Subcategory IDs from CSF 2.0 (e.g., GV.OC-01, PR.DS-01) with CALM field mappings | Existing `skills/NIST-CSF.md` already contains function/subcategory structure — needs a closed ID table appendix to guide agent toward exact citable IDs |
| COMP-03 | SOC2 skill file created with AICPA Trust Service Criteria IDs (CC6.1, CC7.2, A1.1) and CALM field mappings | `skills/SOC2.md` does NOT exist — must be created from scratch with AICPA 2017 TSC structure |
| COMP-04 | Protocol security skill file with explicit upgrade mappings (HTTP→HTTPS, FTP→SFTP, LDAP→TLS, TCP→TLS) grounding remediation decisions | `skills/PROTOCOL-SECURITY.md` does NOT exist — `calm-remediator.yaml` currently has `skills: []`, meaning remediator operates blind |
| COMP-05 | Agent output includes citable control IDs from skill files, not hallucinated identifiers | Requires: closed ID tables in skill files + `calm-remediator.yaml` skill injection + `compliance-mapper.ts` framework enum extension for SOC2 |
</phase_requirements>

## Summary

Phase 8 is a pure content and configuration change phase — no structural TypeScript code changes required except one: adding `'SOC2'` to the `framework` enum in `src/lib/agents/compliance-mapper.ts` (Zod schema). The primary deliverables are two new Markdown skill files (`skills/SOC2.md`, `skills/PROTOCOL-SECURITY.md`), control ID appendix tables added to existing skill files (`skills/PCI-DSS.md`, `skills/NIST-CSF.md`), and YAML config updates to wire the new skills into both the compliance mapper and the CALM remediator agents.

The critical insight is that both the compliance mapper and the CALM remediator currently have a hallucination risk: the compliance mapper has no closed list of valid control IDs in the skill files — it relies on LLM knowledge of the framework — and the remediator has `skills: []` so it generates protocol upgrade rationale from memory alone. Phase 8 fixes both gaps by injecting authoritative, closed-form control ID tables into agent prompts.

The implementation pattern is already proven and operational: `loadSkillsForAgent()` reads paths from `agents/*.yaml` and concatenates them verbatim into the LLM prompt. No loader changes are needed. Adding a skill is a two-step operation: write the Markdown file, add the path to the YAML config.

**Primary recommendation:** Write `skills/SOC2.md` and `skills/PROTOCOL-SECURITY.md` first (highest value, cleanest deliverable), then add closed-ID appendices to PCI-DSS.md and NIST-CSF.md, then wire the new skills into YAML configs and extend the compliance-mapper Zod enum. The entire phase is safe to execute without risking regressions to existing functionality.

## Standard Stack

### Core (unchanged from v1.2 — zero new dependencies)

| Component | Version | Purpose | Phase 8 Touch |
|-----------|---------|---------|---------------|
| `skills/*.md` | N/A (Markdown content) | LLM knowledge injection via skill loader | Primary change surface — 4 edits, 2 new files |
| `agents/*.yaml` | N/A (YAML config) | Skill path wiring for each agent | 2 files updated: `compliance-mapper.yaml`, `calm-remediator.yaml` |
| `src/lib/skills/loader.ts` | Existing | Reads skill paths from agent config, concatenates, returns string | **No changes** — already handles arbitrary skill paths |
| `src/lib/agents/compliance-mapper.ts` | Existing | Zod schema + `generateObject` call | One change: add `'SOC2'` to `framework` enum |
| `src/lib/agents/calm-remediator.ts` | Existing | Protocol upgrade + control injection agent | **No changes** — benefits automatically when skills added to YAML config |
| Zod 3.24+ | Installed | Runtime validation | Enum extension only |
| Vercel AI SDK | Installed | `generateObject` with skill-enriched prompts | No changes |

### Skill File Structure Pattern

All skill files follow a consistent format that the loader handles transparently:

```markdown
# [Framework Name] Compliance Knowledge

## Framework Overview
[narrative + applicability]

## [Control Categories/Functions]
[hierarchical breakdown with IDs]

**CALM Mapping:**
[control → CALM field mapping table]

## Closed Control ID Reference (REQUIRED FOR PHASE 8)
| Control ID | Description | CALM Field | Citability |
|------------|-------------|------------|------------|
| [Req 4.2.1] | [text] | [connects.protocol] | CITE EXACTLY AS SHOWN |

## Notes for LLM Analysis
[behavioral instructions — what to look for, how to cite]
```

## Architecture Patterns

### Pattern 1: Skill Injection Pipeline (as-built)

**What:** `agents/*.yaml` lists skill file paths → `loadAgentConfig()` reads YAML → `loadSkillsForAgent(config)` reads and concatenates Markdown files → content inserted verbatim into LLM prompt between `**COMPLIANCE FRAMEWORK KNOWLEDGE:**` and `**INPUT:**` markers.

**Current flow in `compliance-mapper.ts` line 105-136:**
```typescript
// Source: src/lib/agents/compliance-mapper.ts (existing)
const skillsContent = loadSkillsForAgent(config);  // reads from YAML spec.skills[]

const prompt = `${config.spec.role}
...
**COMPLIANCE FRAMEWORK KNOWLEDGE:**
${skillsContent}          // ← skill files injected here verbatim

**INPUT:**
${JSON.stringify(input, null, 2)}

**TASK:**
...use the compliance framework knowledge above to identify required controls
`;
```

**Implication for Phase 8:** Skill file content IS the control ID source of truth. Whatever IDs appear in the skill files are what the LLM will cite. A "Closed Control ID Reference" table at the end of each skill file — formatted with `CITE EXACTLY AS SHOWN` guidance — is the minimal intervention that grounds agent output.

### Pattern 2: Calm Remediator Has No Skills (Gap)

**Current state — `calm-remediator.yaml`:**
```yaml
skills: []   # ← remediator has no skill injection
```

**Current prompt in `calm-remediator.ts` line 119:**
```
**TASK:**
1. **Protocol Upgrades** — Upgrade weak protocols to their secure equivalents:
   - HTTP → HTTPS
   - LDAP → TLS (LDAPS is not in the CALM enum; use TLS as the protocol...)
   - TCP → TLS
   - FTP → SFTP
```

The rationale is hard-coded in the TypeScript prompt string. Protocol citations like "PCI-DSS Req 4.2.1" or "NIST CSF PR.DS-02" appear nowhere in remediator output because there's no skill file to source them from.

**Fix:** Add `skills/PROTOCOL-SECURITY.md` path to `calm-remediator.yaml`. The skill loader already calls `loadSkillsForAgent(config)` — but since `skills: []`, it returns empty string. Wire it up and the remediator's `rationale` field in `changes[]` will have regulatory grounding.

**Note:** The remediator does NOT call `loadSkillsForAgent`. Looking at `calm-remediator.ts`, skills are never loaded — there is no `loadSkillsForAgent` call in that file. This means adding to the YAML config alone is insufficient: the remediator TypeScript code must also be updated to load and inject skills into its prompt, analogous to the pattern in `compliance-mapper.ts`.

### Pattern 3: SOC2 Enum Extension (Code Change Required)

The `complianceMappingSchema` in `compliance-mapper.ts` has a closed `framework` enum:

```typescript
// Source: src/lib/agents/compliance-mapper.ts line 18
framework: z.enum(['SOX', 'PCI-DSS', 'CCC', 'NIST-CSF']),
```

`'SOC2'` is not in this enum. If the LLM tries to emit a SOC2 finding, Zod will reject it and retry. Adding SOC2 requires:
1. Adding `'SOC2'` to the `z.enum(...)` array
2. Adding `SOC2` to the `frameworkScores` array schema (same location, lines 27-36)
3. Updating the compliance mapper prompt instructions to say "Map the CALM controls to SOX, PCI-DSS, CCC, NIST-CSF, and SOC2 frameworks"
4. Updating the completed event message to say "5 frameworks" instead of "4 frameworks"

### Recommended Project Structure (additions only)

```
skills/
  PCI-DSS.md          # MODIFY — add closed ID appendix (Req 4.2.1, 8.4.2, etc.)
  NIST-CSF.md         # MODIFY — add closed ID appendix (PR.DS-01, PR.DS-02, etc.)
  SOX.md              # MODIFY — add PCAOB/COBIT5 ITGC control reference IDs
  SOC2.md             # NEW — AICPA TSC 2017 with CC6.x, CC7.x, A1.x IDs
  PROTOCOL-SECURITY.md # NEW — HTTP→HTTPS, FTP→SFTP, LDAP→TLS upgrade rationale
agents/
  compliance-mapper.yaml  # MODIFY — add skills/SOC2.md to skills list
  calm-remediator.yaml    # MODIFY — add skills/PROTOCOL-SECURITY.md to skills list
src/lib/agents/
  compliance-mapper.ts    # MODIFY — extend framework enum + update prompt + update count msg
  calm-remediator.ts      # MODIFY — add loadSkillsForAgent call + inject into prompt
```

### Anti-Patterns to Avoid

- **Open-ended ID instructions:** Telling the LLM "cite the PCI-DSS requirement ID" without providing a closed list. The LLM will invent plausible IDs like "Req 4.3.7" that don't exist. Always provide a closed reference table.
- **Skill context bloat:** Loading all 5+ skill files when a user selects one framework. The `_selectedFrameworks` parameter in `mapCompliance()` is intentionally unused (underscore prefix). Phase 8 should NOT wire it yet — it's deferred optimization. Load all skills; target under 3,000 tokens per framework file.
- **Modifying the skill loader:** The `loadSkillsForAgent()` function is correct and complete. Do not change it. Only change the YAML config files and Markdown content.
- **Skipping the remediator code change:** The YAML config change alone for `calm-remediator.yaml` will have no effect because `calm-remediator.ts` never calls `loadSkillsForAgent`. Both the YAML and TS files must be updated.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Control ID validation | Custom Zod enum with every valid PCI/NIST/SOC2 ID | Closed reference tables in skill Markdown files with explicit citation format instructions | Maintaining 106 NIST subcategory IDs + 51 PCI-DSS sub-requirements as Zod enums is brittle maintenance burden; skill file approach leverages existing LLM reasoning with grounding |
| Protocol upgrade logic | Code that parses CALM JSON and swaps protocols | Skill file instructions + existing remediator agent | The remediator already modifies protocol values in the CALM JSON; skill file just adds regulatory rationale |
| SOC2 framework parser | Programmatic mapping of CALM fields to SOC2 controls | Skill file content injection (same pattern as all other frameworks) | All 4 existing frameworks use skill file injection — SOC2 is the same pattern, not a special case |
| Skill file schema validator | JSON schema or lint rules for Markdown format | Consistent Markdown authoring convention | Skill files are prompts, not schemas. The LLM handles structure naturally. |

**Key insight:** The skill file system is the entire compliance intelligence mechanism. "Compliance intelligence" in CALMGuard means high-quality content in `skills/*.md` — the infrastructure is already correct and complete.

## Common Pitfalls

### Pitfall 1: Hallucinated Control IDs (Critical Risk)
**What goes wrong:** LLM generates `"PCI-DSS Req 4.3.7"` or `"NIST CSF PR.AC-9"` — plausible-looking IDs that don't exist in official frameworks. Passes Zod validation (`controlId: z.string()`). Appears in the compliance dashboard. A compliance-literate judge will catch this immediately.
**Why it happens:** No closed reference list in the skill file. LLM fills the gap with pattern-matched invention.
**How to avoid:** Every skill file MUST include a "Closed Control ID Reference" section formatted as a Markdown table with a "CITE EXACTLY AS SHOWN" instruction. The LLM will follow explicit formatting cues in context.
**Warning signs:** Control IDs with decimal depths beyond the official specification (PCI-DSS goes to N.N.N.N max; NIST CSF subcategories use only Function.Category-NN format).

### Pitfall 2: Remediator Skill Wiring Incomplete
**What goes wrong:** Developer adds `skills/PROTOCOL-SECURITY.md` to `calm-remediator.yaml` but forgets that `calm-remediator.ts` never calls `loadSkillsForAgent`. The skill file is silently ignored. Remediator output continues to have no regulatory citations.
**Why it happens:** The YAML config change alone is misleading — it looks correct but has no effect without the corresponding TypeScript change.
**How to avoid:** The remediator TS file needs the same three-line pattern used in compliance-mapper: `const config = loadAgentConfig(agentName)` (already there) → `const skillsContent = loadSkillsForAgent(config)` (missing) → inject into prompt (missing). Add both.
**Warning signs:** No `loadSkillsForAgent` import in `calm-remediator.ts`.

### Pitfall 3: SOC2 Partial Implementation
**What goes wrong:** Developer creates `skills/SOC2.md` and adds it to `compliance-mapper.yaml` but forgets to add `'SOC2'` to the Zod `framework` enum in `compliance-mapper.ts`. The LLM tries to emit SOC2 findings, Zod rejects them, the retry logic exhausts, and the compliance mapping either fails or returns with no SOC2 content.
**Why it happens:** Three separate files must be updated atomically for SOC2 support: skill file, YAML config, TypeScript enum.
**How to avoid:** The definition-of-done for COMP-03 must explicitly list all three changes. Test by running analysis on a CALM file with payment flows and verifying SOC2 appears in `frameworkScores`.

### Pitfall 4: Skill File Size / Context Window Overflow
**What goes wrong:** All four skill files (PCI-DSS.md at 18.6K, NIST-CSF.md at 23.4K, SOX.md at 10.8K, FINOS-CCC.md at 18.6K) plus new SOC2.md and PROTOCOL-SECURITY.md = roughly 100K+ characters injected into a single prompt. Gemini 2.5 Flash has a large context window but the LLM starts summarizing and pattern-matching rather than citing precisely.
**Why it happens:** Skills are loaded and concatenated unconditionally. No framework filtering in v1.2.
**How to avoid:** Keep each NEW skill file under 3,000 tokens (~12,000 characters). SOC2.md and PROTOCOL-SECURITY.md should be concise and structured, not exhaustive. The closed reference table format is inherently concise. Do NOT duplicate content from PCI-DSS.md into PROTOCOL-SECURITY.md — the protocol security file should be additive.
**Warning signs:** Prompt length warnings in Gemini API logs, or agent output that cites only "PCI-DSS" without specific requirement IDs.

### Pitfall 5: SOX.md PCAOB Reference IDs Are Not Official IT Control IDs
**What goes wrong:** Adding PCAOB/COBIT5 IDs to SOX.md that don't follow a stable, citable format. PCAOB auditing standard AS 2201 sections don't have the same granular ID format as PCI-DSS or NIST CSF.
**Why it happens:** SOX compliance is process/control-design oriented, not prescriptive-ID oriented. The existing SOX.md already correctly references "Section 302", "Section 404", "PCAOB AS 2201" — these ARE the citable IDs.
**How to avoid:** Keep SOX improvements minimal. Add an ITGC control reference table using COSO framework control activity numbers (CA.1 through CA.5 mapped to ITGC categories) rather than inventing PCAOB sub-requirement IDs. The research summary noted SOX.md updates as "should have" not "must have."

## Code Examples

### Adding SOC2 to Compliance Mapper Enum

```typescript
// Source: src/lib/agents/compliance-mapper.ts — BEFORE (line 18)
framework: z.enum(['SOX', 'PCI-DSS', 'CCC', 'NIST-CSF']),

// AFTER
framework: z.enum(['SOX', 'PCI-DSS', 'CCC', 'NIST-CSF', 'SOC2']),
```

```typescript
// Same file, frameworkScores section (lines 27-36) — BEFORE
framework: z.enum(['SOX', 'PCI-DSS', 'CCC', 'NIST-CSF']),

// AFTER
framework: z.enum(['SOX', 'PCI-DSS', 'CCC', 'NIST-CSF', 'SOC2']),
```

### Adding Skill Loading to CALM Remediator

```typescript
// Source: src/lib/agents/calm-remediator.ts — add after loadAgentConfig call

// Add import at top of file:
import { loadSkillsForAgent } from '@/lib/skills/loader';

// Add after line 66 (const config = loadAgentConfig(agentName)):
const skillsContent = loadSkillsForAgent(config);

// Modify prompt (after config.spec.role):
const prompt = `${config.spec.role}

**PROTOCOL SECURITY KNOWLEDGE:**
${skillsContent}

You are remediating a CALM v1.1 architecture document...
`;
```

### Closed Control ID Reference Table Pattern (for skill files)

```markdown
## Closed Control ID Reference

> Use ONLY the IDs in this table when citing controls. Do not invent or extrapolate IDs.

| Control ID | Full Name | CALM Field | Citation Format |
|------------|-----------|------------|----------------|
| Req 4.2.1 | PAN protected with strong cryptography over public networks | connects[].protocol | "PCI-DSS 4.0 Req 4.2.1" |
| Req 4.2.1.1 | Inventory of trusted keys/certificates for PAN transmission | node.controls | "PCI-DSS 4.0 Req 4.2.1.1" |
| Req 8.4.2 | MFA for all access into CDE | node.controls.multi-factor-authentication | "PCI-DSS 4.0 Req 8.4.2" |
| Req 10.2.1 | Audit log events required | node.controls.audit-logging | "PCI-DSS 4.0 Req 10.2.1" |
```

### SOC2 Trust Service Criteria Structure (for new SOC2.md)

The AICPA 2017 TSC structure to implement in SOC2.md:

```markdown
## Common Criteria (CC) — Security Trust Service Category

### CC1: Control Environment (CC1.1 – CC1.5)
- CC1.1: COSO Principle 1 — Commitment to integrity and ethical values
- CC1.2: COSO Principle 2 — Board oversight responsibilities
- CC1.3: COSO Principle 3 — Organizational structure
- CC1.4: COSO Principle 4 — Commitment to competence
- CC1.5: COSO Principle 5 — Accountability enforcement

### CC6: Logical and Physical Access Controls (CC6.1 – CC6.8)
- CC6.1: Logical access security software/infrastructure/architectures implemented
- CC6.2: Access credentials authenticated prior to granting access
- CC6.3: Role-based access controls implemented
- CC6.6: Logical access restrictions on network connections established
- CC6.7: Transmission/movement of information restricted to authorized users
- CC6.8: Unauthorized/malicious software prevented or detected

### CC7: System Operations (CC7.1 – CC7.5)
- CC7.1: Infrastructure monitored for deviations from baseline
- CC7.2: Environmental threats monitored
- CC7.3: Vulnerabilities assessed, risks evaluated, controls adjusted
- CC7.4: Security events identified and responded to
- CC7.5: Recovery plan components communicated and tested

## Additional Criteria (A — Availability, C — Confidentiality, P — Privacy)
- A1.1: Current processing capacity/usage are maintained, monitored, evaluated
- A1.2: Environmental/technical threats monitored and evaluated
- A1.3: Recovery plan components communicated, maintained, tested
- C1.1: Confidential information identified and classified
- C1.2: Confidential information destroyed per defined policies
```

### Protocol Security Skill File Structure (for new PROTOCOL-SECURITY.md)

```markdown
# Protocol Security Knowledge — CALM Architecture Remediation

## Upgrade Mapping Reference

| Insecure Protocol | Secure Replacement | CALM enum value | PCI-DSS Grounding | NIST CSF Grounding |
|-------------------|--------------------|-----------------|-------------------|-------------------|
| HTTP | HTTPS | `HTTPS` | Req 4.2.1 (CHD in transit) | PR.DS-02 |
| FTP | SFTP | `SFTP` | Req 4.2.1, Req 2.2.7 | PR.DS-02 |
| LDAP | TLS (with LDAP+TLS note) | `TLS` | Req 2.2.7 | PR.AA-03, PR.DS-02 |
| TCP | TLS | `TLS` | Req 4.2.1 | PR.DS-02 |
| WebSocket | WebSocket over TLS | `TLS` | Req 4.2.1 | PR.DS-02 |

## Rationale Citation Template

When documenting a protocol upgrade change, use this rationale format:

"Upgraded [PROTOCOL] to [SECURE] per PCI-DSS 4.0 Req 4.2.1 (cardholder data must be protected
with strong cryptography during transmission) and NIST CSF 2.0 PR.DS-02 (data in transit
is protected). Unencrypted [PROTOCOL] fails both controls."
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Vague framework names ("PCI-DSS compliance") | Specific requirement IDs ("PCI-DSS 4.0 Req 4.2.1") | Phase 8 (2026-02-25) | Auditable, citable output; eliminates judge credibility risk |
| Remediator with no skill grounding (`skills: []`) | Remediator with PROTOCOL-SECURITY.md skill injection | Phase 8 (2026-02-25) | Change `rationale` fields cite regulatory framework, not just technical rationale |
| 4 supported frameworks (SOX, PCI-DSS, CCC, NIST-CSF) | 5 supported frameworks (+ SOC2) | Phase 8 (2026-02-25) | SOC2 Type II is the most common enterprise compliance requirement; absence was a visible gap |
| LLM relies on training knowledge for framework IDs | Closed reference tables in skill files constrain ID space | Phase 8 (2026-02-25) | Eliminates hallucination of non-existent control IDs |

**Deprecated/outdated:**
- `calm-remediator.yaml` with `skills: []` — functional but produces regulatory-blind rationale. Phase 8 replaces.
- Prompt instructions with hard-coded protocol upgrade list in `calm-remediator.ts` — preserved (still needed for structural constraints), supplemented with skill-file rationale.

## Open Questions

1. **SOC2 Sub-criteria Numbering Depth**
   - What we know: AICPA publishes CC1.1–CC1.5, CC6.1–CC6.8, CC7.1–CC7.5, etc. (verified via multiple secondary sources). The official AICPA TSC 2017 document (paywalled) is the primary source.
   - What's unclear: Whether sub-criteria like CC6.4, CC6.5 exist between CC6.3 and CC6.6 in the official document. Secondary sources show gaps in numbering.
   - Recommendation: Author SOC2.md using confirmed IDs only (CC1.x through CC9.x, A1.x, C1.x). Flag any gap in numbering as "consult AICPA TSC 2017 document." This is low risk — the LLM citing "CC6.6" when "CC6.4" exists is not catastrophically wrong; the framework itself is not uniformly prescriptive.

2. **Remediator Prompt Reconstruction**
   - What we know: The remediator prompt is a single large string in `calm-remediator.ts` (line 92–131). It contains hard-coded protocol upgrade instructions that must remain (they specify valid CALM enum values).
   - What's unclear: Whether the skill content should go before or after the hard-coded TASK instructions.
   - Recommendation: Inject skill content BEFORE the `**ORIGINAL CALM DOCUMENT:**` section, as a `**PROTOCOL SECURITY KNOWLEDGE:**` block. Hard-coded TASK instructions come after and can reference the knowledge block. Pattern matches compliance-mapper exactly.

3. **PCI-DSS 4.0.1 Sub-requirement Coverage Depth**
   - What we know: PCI-DSS 4.0.1 has sub-requirements going to N.N.N level (e.g., Req 4.2.1.1, 4.2.1.2). Requirement 4.2.1.1 (trusted keys/certificates inventory) became mandatory March 31, 2025.
   - What's unclear: Whether to include all 51 new 4.0 requirements in the closed ID table or only the 10-15 most relevant to CALM architecture analysis.
   - Recommendation: Include only CALM-relevant requirements in the closed reference table (roughly 20-25 IDs covering encryption, access control, logging, network segmentation, scanning). A 51-row table adds context window weight with diminishing return on CALM-specific analysis.

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection — `src/lib/agents/compliance-mapper.ts`, `src/lib/agents/calm-remediator.ts`, `src/lib/skills/loader.ts`, `agents/*.yaml`, `skills/*.md` (82 TypeScript files reviewed in SUMMARY.md, confirmed by direct reading above)
- `skills/PCI-DSS.md` (18.6K, read above) — PCI-DSS framework structure already present; identifies gap: no closed ID appendix
- `skills/NIST-CSF.md` (23.4K, read above) — NIST CSF 2.0 structure already present including subcategory IDs in prose; identifies gap: no closed reference table for citation grounding
- `skills/SOX.md` (10.8K, read above) — SOX ITGC structure present; PCAOB AS 2201 and Section 302/404 are correctly cited as the reference IDs
- `agents/compliance-mapper.yaml` (read above) — confirms 4 frameworks currently, `skills:` list has 4 entries, no SOC2
- `agents/calm-remediator.yaml` (read above) — confirms `skills: []` gap
- NIST CSWP 29 (February 2024) — NIST CSF 2.0 complete subcategory list (PR.DS-01, PR.DS-02, PR.AA-03, etc.) — HIGH confidence from official NIST publication
- AICPA TSC 2017 (secondary sources confirmed) — CC1-CC9, A1, C1, P1 structure with sub-criteria numbering (CC6.1–CC6.8, CC7.1–CC7.5)
- PCI SSC v4.0.1 — Req 4.2.1, 4.2.1.1, 4.2.1.2, 8.4.2, 10.2.1 etc. confirmed via secondary sources; mandatory March 31, 2025 deadline passed

### Secondary (MEDIUM confidence)
- [SOC2 CC6 subcriteria explanation](https://www.designcs.net/soc-2-cc6-common-criteria-related-to-logical-and-physical-access/) — CC6.1, CC6.2, CC6.3, CC6.6, CC6.7 structure confirmed across multiple sources
- [Secureframe SOC2 Common Criteria](https://secureframe.com/hub/soc-2/common-criteria) — CC1-CC9 breakdown verified
- [PCI-DSS v4.0.1 sub-requirements](https://www.securitymetrics.com/blog/a-guide-to-new-requirements-in-pci-dss-4-0-1) — Req 4.2.1.1, 4.2.1.2 sub-requirements confirmed
- SUMMARY.md (`.planning/research/SUMMARY.md`) — project-level research synthesis with pitfall catalog and architecture approach — HIGH confidence for project-specific findings

### Tertiary (LOW confidence)
- Secondary SOC2 sources for sub-criteria CC6.4, CC6.5 numbering — gap in official numbering not fully confirmed from secondary sources; recommend conservative authoring (cite only confirmed IDs)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — confirmed by direct codebase inspection; zero new packages
- Architecture: HIGH — skill injection pipeline traced through actual source files (loader.ts, compliance-mapper.ts, calm-remediator.ts)
- Pitfalls: HIGH — remediator `skills: []` gap confirmed by direct file read; hallucination risk is documented in SUMMARY.md as Pitfall 9
- Control ID accuracy: MEDIUM — official AICPA TSC 2017 document is paywalled; sub-criteria confirmed through multiple secondary sources

**Research date:** 2026-02-25
**Valid until:** 2026-03-25 (frameworks are stable; NIST CSF 2.0 released Feb 2024, PCI-DSS 4.0.1 released Jun 2024, AICPA TSC 2017 unchanged for SOC2 audits through 2026)
