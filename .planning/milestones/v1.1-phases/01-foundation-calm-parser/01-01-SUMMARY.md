---
phase: 01-foundation-calm-parser
plan: 01
subsystem: foundation
tags: [nextjs, typescript, tailwind, shadcn-ui, dark-theme, pnpm]
dependency-graph:
  requires: []
  provides: [nextjs-app-router, typescript-strict, shadcn-ui, dark-theme, build-system]
  affects: [all-future-plans]
tech-stack:
  added:
    - Next.js 15.5.12 (App Router, Turbopack)
    - TypeScript 5.7.2 (strict mode)
    - Tailwind CSS 4.1.18 (@tailwindcss/postcss)
    - shadcn/ui (New York style, slate base color)
    - next-themes 0.4.6
    - zod 3.24.1
    - zustand 5.0.3
  patterns:
    - App Router with src/ directory structure
    - ThemeProvider wrapper for dark mode persistence
    - Tailwind v4 @theme syntax for CSS variables
    - shadcn/ui component system with aliases
key-files:
  created:
    - package.json - Project dependencies and scripts
    - tsconfig.json - TypeScript strict configuration
    - tailwind.config.ts - Tailwind v4 configuration with slate palette
    - postcss.config.mjs - PostCSS with @tailwindcss/postcss plugin
    - components.json - shadcn/ui configuration
    - src/lib/utils.ts - cn() utility for class name merging
    - src/app/layout.tsx - Root layout with ThemeProvider
    - src/app/page.tsx - Landing page placeholder
    - src/app/globals.css - Tailwind v4 dark theme variables
    - src/components/ui/*.tsx - shadcn/ui components (8 components)
  modified: []
decisions:
  - decision: Use Tailwind CSS v4 instead of v3
    rationale: Project was initialized with v4, which has improved performance and new @theme syntax
    impact: Required @tailwindcss/postcss plugin and different CSS variable approach
    alternatives: Could have downgraded to v3 for shadcn/ui compatibility
  - decision: Use src/ directory structure
    rationale: Better organization, clear separation of source code from config files
    impact: All import paths use @/* alias pointing to ./src/*
    alternatives: Root-level app/ directory (simpler but less organized)
  - decision: Use Tailwind v4 @theme syntax for CSS variables
    rationale: Tailwind v4 deprecated @layer base approach, @theme is the new standard
    impact: Simpler CSS file, better performance, native Tailwind integration
    alternatives: Could have used inline CSS variables (less maintainable)
metrics:
  duration: 17 minutes
  tasks-completed: 2
  commits: 2
  files-created: 17
  files-modified: 4
  dependencies-added: 10
  completed-at: 2026-02-15T18:49:06Z
---

# Phase 01 Plan 01: Next.js Foundation Setup Summary

Next.js 14+ App Router with TypeScript strict mode, Tailwind v4, shadcn/ui dark theme, and all core dependencies successfully initialized.

## Objective

Initialize the Next.js 14+ project with TypeScript strict mode, pnpm, shadcn/ui with dark theme, and all foundational configuration to establish the build system, styling, and component library for all subsequent development.

## Execution Summary

Successfully completed 2 tasks:

1. **Initialize Next.js project with pnpm and core dependencies** - Set up Next.js with App Router, TypeScript strict mode, installed zod/zustand/next-themes, initialized shadcn/ui, and verified clean build
2. **Configure dark theme with next-themes and Tailwind** - Created root layout with ThemeProvider, configured Tailwind v4 dark theme variables, and added placeholder landing page

All tasks executed as planned with minimal deviations (see below).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Initialize Next.js project with pnpm and core dependencies | 8bc016e | package.json, tsconfig.json, components.json, src/components/ui/*.tsx, src/lib/utils.ts |
| 2 | Configure dark theme with next-themes and Tailwind | 15c5a79 | src/app/layout.tsx, src/app/page.tsx, src/app/globals.css, tailwind.config.ts, postcss.config.mjs |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed premature CALM parser files**
- **Found during:** Task 1 build verification
- **Issue:** lib/calm/ directory with TypeScript errors blocking build (extractor.ts type predicate error)
- **Fix:** Removed lib/calm/ and src/lib/calm/ directories as they were created prematurely and not part of foundation plan
- **Files removed:** lib/calm/extractor.ts, lib/calm/parser.ts, lib/calm/types.ts, lib/calm/index.ts
- **Commit:** Included in Task 1 commit
- **Rationale:** CALM parser is Plan 02 work; these files were blocking foundation setup

**2. [Rule 3 - Blocking] Configured Tailwind v4 PostCSS plugin**
- **Found during:** Task 2 build verification
- **Issue:** Tailwind v4 requires @tailwindcss/postcss instead of tailwindcss as PostCSS plugin
- **Fix:** Installed @tailwindcss/postcss and updated postcss.config.mjs
- **Files modified:** postcss.config.mjs, package.json
- **Commit:** Included in Task 2 commit
- **Rationale:** Build was failing with "PostCSS plugin has moved to separate package" error

**3. [Rule 3 - Blocking] Updated CSS to Tailwind v4 @theme syntax**
- **Found during:** Task 2 build verification
- **Issue:** Tailwind v4 doesn't support @layer base with @apply border-border pattern
- **Fix:** Rewrote globals.css using Tailwind v4 @theme syntax for CSS variables
- **Files modified:** src/app/globals.css
- **Commit:** Included in Task 2 commit
- **Rationale:** v4 deprecated @layer base approach; @theme is the new standard

**4. [Rule 2 - Missing critical] Manually created components.json**
- **Found during:** Task 1 shadcn/ui initialization
- **Issue:** shadcn init --defaults failed due to Tailwind v4 detection ("No Tailwind CSS configuration found")
- **Fix:** Manually created components.json with proper configuration for Tailwind v4 compatibility
- **Files created:** components.json
- **Commit:** Included in Task 1 commit
- **Rationale:** shadcn CLI didn't recognize Tailwind v4 config format; manual config required to proceed

**5. [Rule 1 - Bug] Reorganized to src/ directory structure**
- **Found during:** Task 1 initialization
- **Issue:** create-next-app created root-level app/components/lib directories instead of src/ structure
- **Fix:** Created src/ directory and moved app, components, lib, hooks, store into it; updated tsconfig.json paths
- **Files modified:** tsconfig.json (paths: @/* = ./src/*)
- **Commit:** Included in Task 1 commit
- **Rationale:** Plan expects src/ structure for better organization

## Verification Results

All verification criteria passed:

- [x] `pnpm dev` starts without errors
- [x] `pnpm build` completes without TypeScript errors
- [x] Browser shows dark-themed "CALMGuard" page
- [x] No console warnings or hydration mismatches
- [x] `tsconfig.json` confirms strict mode enabled
- [x] shadcn/ui components available in src/components/ui/

## Success Criteria

- [x] Next.js 14+ project running with App Router
- [x] TypeScript strict mode with no any types
- [x] shadcn/ui initialized with dark theme (slate palette)
- [x] pnpm as package manager with zod, zustand, next-themes installed
- [x] Clean build with zero errors

## Key Learnings

1. **Tailwind v4 compatibility:** Tailwind v4 requires @tailwindcss/postcss plugin and @theme syntax instead of @layer base approach. shadcn CLI doesn't fully support v4 yet, requiring manual components.json creation.

2. **Next.js lockfile warning:** Multiple lockfiles detected (user home directory and project). Can be silenced by setting `outputFileTracingRoot` in next.config.ts, but doesn't affect functionality.

3. **src/ directory preference:** create-next-app --src-dir flag didn't work when scaffolding into existing directory. Manual reorganization required to achieve expected structure.

## Self-Check: PASSED

**Created files verified:**
- [x] package.json - FOUND
- [x] tsconfig.json - FOUND
- [x] components.json - FOUND
- [x] src/app/layout.tsx - FOUND
- [x] src/app/page.tsx - FOUND
- [x] src/app/globals.css - FOUND
- [x] src/lib/utils.ts - FOUND
- [x] src/components/ui/button.tsx - FOUND

**Commits verified:**
- [x] 8bc016e - FOUND
- [x] 15c5a79 - FOUND

**Build verification:**
- [x] pnpm build succeeds
- [x] No TypeScript errors
- [x] TypeScript strict mode enabled

All claims in this summary verified against actual files and commits.
