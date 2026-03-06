<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright 2026 FINOS -->

# CALMGuard — Production Dependencies

All 32 production dependencies with purpose, justification, and replaceability notes.
Audience: FINOS technical reviewers evaluating supply-chain risk.

Last updated: 2026-03-06

## LLM Providers (5)

| Package | Version | Purpose | Replaceable? |
|---------|---------|---------|-------------|
| `ai` | ^6.0.86 | Vercel AI SDK core — `generateObject` with Zod schema, streaming | Yes, with significant rework |
| `@ai-sdk/google` | ^3.0.29 | Google Gemini provider (default LLM) | Yes — swap via env var |
| `@ai-sdk/anthropic` | ^3.0.44 | Anthropic Claude provider (optional) | Yes — optional provider |
| `@ai-sdk/openai` | ^3.0.29 | OpenAI GPT provider (optional) | Yes — optional provider |
| `@ai-sdk/xai` | ^3.0.57 | xAI Grok provider (optional) | Yes — optional provider |

**Note:** Only one provider's API key is required at runtime. The others are tree-shaken if not used.

## FINOS / Domain (1)

| Package | Version | Purpose | Replaceable? |
|---------|---------|---------|-------------|
| `@finos/calm-cli` | ^1.33.0 | CALM schema validation and CLI tooling | No — canonical FINOS library |

## UI Framework (8)

| Package | Version | Purpose | Replaceable? |
|---------|---------|---------|-------------|
| `next` | ^15.5.0 | Next.js — App Router, API routes, SSE streaming | No — core framework |
| `react` | ^19.0.0 | React core | No — core framework |
| `react-dom` | ^19.0.0 | React DOM renderer | No — required by React |
| `next-themes` | ^0.4.6 | Dark/light theme switching | Yes — small utility |
| `@xyflow/react` | ^12.10.1 | React Flow — architecture graph visualization | Likely — large dep, niche |
| `recharts` | ^3.7.0 | Chart library — compliance gauges, heat maps | Yes — Chart.js is alternative |
| `shiki` | ^3.22.0 | Syntax highlighting for pipeline YAML preview | Yes — Prism is alternative |
| `sonner` | ^2.0.7 | Toast notification library | Yes — react-hot-toast alternative |

## UI Components / Styling (10)

| Package | Version | Purpose | Replaceable? |
|---------|---------|---------|-------------|
| `@radix-ui/react-checkbox` | ^1.3.3 | Accessible checkbox primitive (shadcn/ui) | Yes — as a group |
| `@radix-ui/react-dialog` | ^1.1.15 | Accessible dialog/modal primitive | Yes — as a group |
| `@radix-ui/react-dropdown-menu` | ^2.1.16 | Accessible dropdown primitive | Yes — as a group |
| `@radix-ui/react-scroll-area` | ^1.2.10 | Cross-browser scroll area | Yes — as a group |
| `@radix-ui/react-select` | ^2.2.6 | Accessible select primitive | Yes — as a group |
| `@radix-ui/react-separator` | ^1.1.8 | Visual separator primitive | Yes — as a group |
| `@radix-ui/react-slot` | ^1.2.4 | Slot composition primitive (shadcn/ui internal) | Yes — as a group |
| `@radix-ui/react-tabs` | ^1.1.13 | Accessible tabs primitive | Yes — as a group |
| `@radix-ui/react-tooltip` | ^1.2.8 | Accessible tooltip primitive | Yes — as a group |
| `@tailwindcss/postcss` | ^4.1.18 | PostCSS plugin for Tailwind CSS v4 | Yes — if switching CSS systems |

**Note:** All Radix UI packages are peer dependencies of shadcn/ui. They could be replaced as a group if the shadcn/ui component library is replaced.

## Styling Utilities (3)

| Package | Version | Purpose | Replaceable? |
|---------|---------|---------|-------------|
| `class-variance-authority` | ^0.7.1 | Type-safe variant styling (shadcn/ui internal) | Yes — with shadcn/ui replacement |
| `clsx` | ^2.1.1 | Conditional className merging | Yes — `classnames` package |
| `tailwind-merge` | ^3.4.1 | Merge conflicting Tailwind class strings | Yes — manual logic |

## Data / State / Validation (4)

| Package | Version | Purpose | Replaceable? |
|---------|---------|---------|-------------|
| `zod` | ^3.24.1 | Runtime schema validation and TypeScript inference | No — integrated with AI SDK |
| `zustand` | ^5.0.3 | Client state management | Yes — Jotai or Redux Toolkit |
| `yaml` | ^2.8.2 | YAML parser for agent config loading | Yes — js-yaml alternative |
| `@dagrejs/dagre` | ^2.0.4 | Graph layout algorithm for architecture visualization | Yes — ELKjs alternative |

## Icons (1)

| Package | Version | Purpose | Replaceable? |
|---------|---------|---------|-------------|
| `lucide-react` | ^0.564.0 | Icon library (600+ SVG icons) | Yes — heroicons alternative |

## Supply Chain Notes

- All packages are published to npm under their respective organizations
- No packages have GPL or AGPL licenses (verified via `pnpm audit`)
- The only FINOS-specific package is `@finos/calm-cli` — this is intentional and required
- `@ai-sdk/*` packages are published by Vercel (publicly traded company, stable supply chain)
- Radix UI packages are maintained by WorkOS (stable, widely used in enterprise)
- All packages are used in production by major Next.js applications
