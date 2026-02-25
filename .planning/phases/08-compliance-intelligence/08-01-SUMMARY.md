---
phase: 08-compliance-intelligence
plan: "01"
subsystem: skills
tags: [compliance, skills, PCI-DSS, NIST-CSF, SOC2, protocol-security, control-IDs]
dependency_graph:
  requires: []
  provides: [skills/SOC2.md, skills/PROTOCOL-SECURITY.md, "PCI-DSS.md Closed Control ID Reference", "NIST-CSF.md Closed Control ID Reference"]
  affects: [agents/compliance-mapper.yaml, agents/calm-remediator.yaml]
tech_stack:
  added: []
  patterns: [closed-form-control-IDs, cite-exactly-as-shown, CALM-field-mapping]
key_files:
  created:
    - skills/SOC2.md
    - skills/PROTOCOL-SECURITY.md
  modified:
    - skills/PCI-DSS.md
    - skills/NIST-CSF.md
decisions:
  - "SOC2 skill file focuses on CC6/CC7 as highest CALM-signal criteria; CC1-CC5 flagged as organizational-only"
  - "PROTOCOL-SECURITY.md uses cross-framework grounding (PCI-DSS + NIST CSF + SOC2) per upgrade for maximum rationale authority"
  - "Closed Control ID Reference tables use 'CITE EXACTLY AS SHOWN' instruction to prevent LLM hallucination of control IDs"
  - "LDAP->TLS upgrade uses CALM TLS enum value with prose note about port 636 (no LDAPS enum in CALM spec)"
metrics:
  duration: "3min"
  completed: "2026-02-25"
  tasks_completed: 3
  files_created: 2
  files_modified: 2
---

# Phase 8 Plan 01: Compliance Intelligence Skill Files Summary

Authored four compliance skill files with closed-form control ID reference tables — two new files (SOC2.md, PROTOCOL-SECURITY.md) and two appendices to existing files (PCI-DSS.md, NIST-CSF.md) — that ground LLM agent output in specific, citable, non-hallucinated control IDs.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create SOC2 Trust Service Criteria skill file | 1874daa | skills/SOC2.md (created, 149 lines) |
| 2 | Create PROTOCOL-SECURITY skill file | bee1192 | skills/PROTOCOL-SECURITY.md (created, 67 lines) |
| 3 | Add closed control ID appendices to PCI-DSS.md and NIST-CSF.md | cc475e5 | skills/PCI-DSS.md (19 IDs appended), skills/NIST-CSF.md (21 IDs appended) |

## What Was Built

### skills/SOC2.md (NEW)
- AICPA 2017 Trust Service Criteria with CC1-CC9, A1, C1, PI1, P categories
- CC6.x (Logical/Physical Access) and CC7.x (System Operations) tables with CALM field mappings — highest CALM-signal criteria
- LLM notes to focus on CC6/CC7 and treat CC1-CC5 as "organizational only" (not CALM-observable)
- Closed Control ID Reference with 21 IDs (CC6.1-CC6.8, CC7.1-CC7.5, CC8.1, CC9.1-CC9.2, A1.1-A1.3, C1.1-C1.2)
- Citation format: `"SOC2 TSC CC6.1"` etc.

### skills/PROTOCOL-SECURITY.md (NEW)
- Upgrade Mapping table: HTTP→HTTPS, FTP→SFTP, LDAP→TLS, TCP→TLS, WebSocket→TLS, AMQP→TLS
- Three-framework grounding (PCI-DSS + NIST CSF + SOC2) per upgrade
- Rationale Citation Template with three filled examples (HTTP, FTP, LDAP)
- Closed Control ID Reference with 7 cross-framework IDs (Req 2.2.7, Req 4.2.1, PR.AA-03, PR.DS-02, CC6.1, CC6.6, CC6.7)
- LDAP decision: use CALM `TLS` enum + "port 636" prose note (no LDAPS enum in CALM spec)

### skills/PCI-DSS.md (APPENDED — no existing content modified)
- Closed Control ID Reference table with 19 CALM-relevant PCI-DSS 4.0 Requirement IDs
- Covers: network (Req 1.2.1, Req 1.3), encryption (Req 2.2.7, Req 3.5.1, Req 4.2.1, Req 4.2.1.1, Req 4.2.1.2), access (Req 7.2, Req 8.3.1, Req 8.4.2), app security (Req 6.2.4, Req 6.4.2), logging (Req 10.2.1, Req 10.2.2, Req 10.5.1), testing (Req 11.3.1, Req 11.4.1, Req 11.5.1), IR (Req 12.10.1)

### skills/NIST-CSF.md (APPENDED — no existing content modified)
- Closed Control ID Reference table with 21 CALM-relevant NIST CSF 2.0 subcategory IDs
- Covers all 6 CSF functions: GV (4 IDs), ID (4 IDs), PR (9 IDs), DE (2 IDs), RS (1 ID), RC (1 ID)

## Deviations from Plan

None — plan executed exactly as written.

## Success Criteria Verification

- [x] Four skill files contain closed-form control ID reference tables — verified via grep
- [x] SOC2.md covers CC6.x, CC7.x, A1.x, C1.x with CALM field mappings — 21 IDs
- [x] PROTOCOL-SECURITY.md covers HTTP/FTP/LDAP/TCP/WebSocket upgrade mappings with PCI-DSS + NIST CSF + SOC2 grounding
- [x] PCI-DSS.md and NIST-CSF.md have new appendices without existing content modification
- [x] SOC2.md: 149 lines (above 80-line minimum), PROTOCOL-SECURITY.md: 67 lines (above 40-line minimum)

## Self-Check: PASSED

Files verified:
- skills/SOC2.md — FOUND
- skills/PROTOCOL-SECURITY.md — FOUND
- skills/PCI-DSS.md — contains "Closed Control ID Reference"
- skills/NIST-CSF.md — contains "Closed Control ID Reference"

Commits verified:
- 1874daa — FOUND (SOC2.md)
- bee1192 — FOUND (PROTOCOL-SECURITY.md)
- cc475e5 — FOUND (PCI-DSS.md + NIST-CSF.md appendices)
