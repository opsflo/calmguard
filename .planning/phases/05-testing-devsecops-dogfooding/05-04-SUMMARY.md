---
phase: 05-testing-devsecops-dogfooding
plan: "04"
subsystem: security-and-devex
tags:
  - security
  - documentation
  - pre-commit
  - husky
  - lint-staged
  - threat-model
dependency_graph:
  requires:
    - "05-03: GitHub Actions CI/CD workflow"
  provides:
    - "SECURITY.md with CALMGuard AI-specific threat model"
    - "Husky pre-commit hooks running ESLint via lint-staged"
    - "CONTRIBUTING.md with branch protection and PR workflow"
  affects:
    - "Developer experience on clone/commit"
    - "Security posture documentation for judges"
tech_stack:
  added:
    - "husky 9.1.7 — git hooks management"
    - "lint-staged 16.2.7 — run linters on staged files only"
    - "@eslint/eslintrc 3.3.4 — FlatCompat for ESLint v9 flat config"
  patterns:
    - "ESLint v9 flat config via FlatCompat + next/core-web-vitals"
    - "Husky pre-commit running lint-staged on *.{ts,tsx}"
key_files:
  created:
    - "SECURITY.md — 137-line threat model with 3 AI-specific attack vectors"
    - ".husky/pre-commit — runs pnpm exec lint-staged"
    - "CONTRIBUTING.md — 147-line contributing guide with PR workflow"
    - "eslint.config.mjs — ESLint v9 flat config using FlatCompat"
  modified:
    - "package.json — added lint-staged config, husky/lint-staged devDeps, @eslint/eslintrc"
decisions:
  - "Use FlatCompat to bridge eslint-config-next (legacy extends format) to ESLint v9 flat config — project had no eslint config file; next lint was the only mechanism"
  - "Use eslint --fix --max-warnings=0 in lint-staged (not next lint) — next lint is deprecated in Next.js 15/16 and requires interactive setup when no config exists"
  - "Create CONTRIBUTING.md at project root (separate from .github/CONTRIBUTING.md) — project-specific guidance vs hackathon template"
metrics:
  duration_minutes: 4
  completed_date: "2026-02-24"
  tasks_completed: 2
  files_created: 4
  files_modified: 1
---

# Phase 05 Plan 04: Security Documentation + Pre-commit Hooks Summary

SECURITY.md with CALMGuard-specific threat model covering malicious CALM JSON, LLM prompt injection, and SSE tampering; Husky pre-commit hooks running ESLint via lint-staged; CONTRIBUTING.md with branch protection and PR workflow.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Write SECURITY.md with threat model and vulnerability reporting | `fc3ab46` | `SECURITY.md` |
| 2 | Configure pre-commit hooks and document branch protection | `48e1634` | `.husky/pre-commit`, `package.json`, `CONTRIBUTING.md`, `eslint.config.mjs` |

## What Was Built

### SECURITY.md (137 lines)

Startup-practical security documentation covering:

1. **Security Overview** — honest framing as hackathon project with production-grade security awareness
2. **Vulnerability Reporting** — contact, 48h response commitment, no bug bounty disclosure
3. **Security Practices** — Zod validation, generateObject schema enforcement, no persistence, server-side API keys
4. **Threat Model** — 3 CALMGuard-specific threats:
   - Threat 1: Malicious CALM JSON with oversized/nested payloads → mitigated by Zod schema strict validation
   - Threat 2: LLM Prompt Injection in CALM description fields → mitigated by generateObject with typed Zod schemas (structured output limits attack surface)
   - Threat 3: SSE Stream Tampering via MITM → mitigated by HTTPS + same-origin SSE + read-only blast radius
5. **Dependencies** — pnpm audit in CI, license-checker for financial services

### Pre-commit Hooks

- `husky 9.1.7` + `lint-staged 16.2.7` installed as devDependencies
- `.husky/pre-commit`: runs `pnpm exec lint-staged`
- `package.json` lint-staged config: `eslint --fix --max-warnings=0` on `*.{ts,tsx}`
- `package.json` prepare script: `husky` (runs on `pnpm install` to set up hooks)

**Hook verified:** Pre-commit ran successfully during Task 2 commit — lint-staged processed 3 staged `.ts` files with ESLint and passed.

### CONTRIBUTING.md (147 lines)

Includes all required sections:
- Development Setup (clone → install → env → run)
- Development Workflow (branch naming, commit message conventions)
- Pull Request Process (CI requirements, SAST requirements, PR template)
- Branch Protection Rules (documented rules + `gh api` configuration command)
- Pre-commit Hooks (`pnpm prepare` setup, skip escape hatch documented)
- Code Standards (TypeScript strict, Zod, Tailwind, RSC, generateObject)
- Security (links to SECURITY.md)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed missing ESLint config causing lint-staged failure**
- **Found during:** Task 2, first commit attempt
- **Issue:** Project had `pnpm lint` using `next lint` but no `eslint.config.js`/`.eslintrc` file. ESLint v9 (installed as dependency) requires a flat config file — bare `eslint` CLI failed with "ESLint couldn't find an eslint.config file"
- **Fix:** Created `eslint.config.mjs` using `FlatCompat` from `@eslint/eslintrc` to bridge `eslint-config-next` (which uses legacy `extends` format) to ESLint v9 flat config format. Also installed `@eslint/eslintrc` as devDependency.
- **Files modified:** `eslint.config.mjs` (created), `package.json` (added `@eslint/eslintrc` devDep)
- **Commit:** `48e1634` (included in Task 2 commit)

**Note:** `next lint` is deprecated in Next.js 15/16 and requires interactive setup. Creating a proper `eslint.config.mjs` is the correct forward-looking fix that also enables bare `eslint` CLI to work in lint-staged.

## Self-Check: PASSED

| Item | Status |
|------|--------|
| `SECURITY.md` exists | FOUND |
| `.husky/pre-commit` exists | FOUND |
| `CONTRIBUTING.md` exists | FOUND |
| `eslint.config.mjs` exists | FOUND |
| Commit `fc3ab46` (SECURITY.md) | FOUND |
| Commit `48e1634` (pre-commit + CONTRIBUTING.md) | FOUND |
