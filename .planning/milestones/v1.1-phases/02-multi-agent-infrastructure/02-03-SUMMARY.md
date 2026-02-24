---
phase: 02-multi-agent-infrastructure
plan: 03
subsystem: multi-agent-ai
tags: [agent-registry, skill-loader, yaml-parser, caching, validation]
dependency-graph:
  requires:
    - phase: 02-multi-agent-infrastructure
      plan: 01
      provides: AgentConfig type and agentConfigSchema
    - phase: 02-multi-agent-infrastructure
      plan: 02
      provides: YAML agent configs and SKILL.md files
  provides:
    - loadAgentConfig with YAML parsing and validation
    - loadSkills for SKILL.md file concatenation
    - Module-level caching for both configs and skills
  affects:
    - agent-implementations
    - orchestrator
    - specialized-agents
tech-stack:
  added: []
  patterns:
    - YAML config loading with Zod validation
    - File caching with module-level Map
    - Descriptive error messages for missing/invalid files
key-files:
  created:
    - src/lib/agents/registry.ts
    - src/lib/skills/loader.ts
  modified: []
decisions:
  - Use module-level Map for caching to avoid re-reading files
  - Throw descriptive errors with full file paths for debugging
  - Cache by agent name (registry) and file path (skills)
  - clearCache functions for testing and forced reload
metrics:
  duration: 1 minute
  tasks: 2
  files: 2
  commits: 2
  completed: 2026-02-16
---

# Phase 02 Plan 03: Agent Registry & Skill Loader Summary

**One-liner:** Built YAML config loader with validation and SKILL.md reader with caching — bridges agent configurations to runtime implementations.

## Objective

Create the agent registry (YAML config loader) and skill loader (SKILL.md reader) that connect agent configurations to their runtime implementations. Agents need their YAML configs parsed into typed objects and their skill files loaded as prompt context.

## What Was Built

### Agent Registry (`src/lib/agents/registry.ts`)

Module that loads and validates YAML agent configuration files:

**Functions:**
- `loadAgentConfig(name: string): AgentConfig` - Loads single agent config from `agents/{name}.yaml`, validates against Zod schema, caches result
- `loadAllAgentConfigs(): Map<string, AgentConfig>` - Loads all `.yaml` files from agents directory, returns Map keyed by `metadata.name`
- `clearConfigCache(): void` - Clears module-level cache for testing/forced reload

**Features:**
- YAML parsing via `yaml` package (parse function)
- Zod schema validation with formatted error messages
- Module-level caching (Map) to avoid re-reading files
- Descriptive errors: "Agent config not found: {path}", "Failed to parse {path}: {message}", "Invalid agent config in {path}: {errors}"
- Error formatting: concatenates all Zod validation errors with path and message

**Error Handling:**
- File not found → descriptive error with full path
- YAML parse error → wrapped with file path context
- Schema validation failure → formatted Zod errors with field paths

### Skill Loader (`src/lib/skills/loader.ts`)

Module that loads and concatenates SKILL.md markdown files:

**Functions:**
- `loadSkill(skillPath: string): string` - Loads single skill file from project root path, caches result
- `loadSkills(skillPaths: string[]): string` - Loads multiple skills, concatenates with `\n\n---\n\n` separator
- `loadSkillsForAgent(config: AgentConfig): string` - Convenience function that reads `config.spec.skills` array and loads all skills
- `clearSkillCache(): void` - Clears module-level cache for testing/forced reload

**Features:**
- Reads markdown files from project root (e.g., `skills/SOX.md`)
- Module-level caching (Map) keyed by file path
- Returns empty string if no skills defined (handles gracefully)
- Skill separator: `\n\n---\n\n` for clear LLM context boundaries
- No `any` types - proper string return types throughout

**Error Handling:**
- File not found → descriptive error with resolved absolute path

## Tasks Completed

### Task 1: Create agent registry (YAML config loader) ✓

**Status:** Complete
**Commit:** `bfd5c98` - feat(02-03): create agent registry with YAML config loader
**Files:** `src/lib/agents/registry.ts` (85 lines)

Created YAML config loader with validation, caching, and descriptive error messages. Registry imports `AgentConfig` and `agentConfigSchema` from `./types`, uses `yaml` package for parsing, validates with Zod's `safeParse()`, and caches results in module-level Map.

**Verification passed:**
- TypeScript compilation succeeded (`pnpm typecheck`)
- Imports `AgentConfig` and `agentConfigSchema` from `./types`
- `yaml` package available in dependencies (v2.8.2)
- Exports: `loadAgentConfig`, `loadAllAgentConfigs`, `clearConfigCache`

### Task 2: Create SKILL.md loader ✓

**Status:** Complete
**Commit:** `85153e2` - feat(02-03): create SKILL.md loader
**Files:** `src/lib/skills/loader.ts` (74 lines)

Created skill file loader that reads markdown files, concatenates with separators, and caches results. Includes convenience function `loadSkillsForAgent()` that reads skill paths from AgentConfig.

**Verification passed:**
- TypeScript compilation succeeded (`pnpm typecheck`)
- Production build succeeded (`pnpm build`)
- Imports `AgentConfig` from `../agents/types`
- Exports: `loadSkill`, `loadSkills`, `loadSkillsForAgent`, `clearSkillCache`

## Deviations from Plan

None - plan executed exactly as written.

## Technical Decisions

1. **Module-level Map for caching**
   - Rationale: Simple, effective caching without external dependencies. Avoids re-reading files on every call.
   - Impact: Significant performance improvement for repeated agent invocations
   - Alternative considered: No caching (wasteful I/O), external cache library (overkill)

2. **Descriptive errors with full paths**
   - Rationale: Developer experience - makes debugging configuration issues much faster
   - Impact: Clear error messages point directly to problematic files
   - Alternative considered: Generic errors (poor DX)

3. **Separate cache clearing functions**
   - Rationale: Testing and forced reload scenarios need cache invalidation
   - Impact: Enables test isolation and runtime config updates
   - Alternative considered: No cache clearing (breaks testing)

4. **Empty string return for no skills**
   - Rationale: Graceful handling - not all agents have skills (e.g., architecture-analyzer)
   - Impact: No conditional logic needed in agent implementations
   - Alternative considered: Throw error (breaks agents without skills)

## Verification Results

All verification criteria passed:

1. ✓ `pnpm typecheck` passes with zero errors
2. ✓ `pnpm build` succeeds
3. ✓ `src/lib/agents/registry.ts` exports loadAgentConfig, loadAllAgentConfigs, clearConfigCache
4. ✓ `src/lib/skills/loader.ts` exports loadSkill, loadSkills, loadSkillsForAgent, clearSkillCache

## Success Criteria Met

- [x] Registry loads and validates YAML agent configs with caching
- [x] Skill loader reads and concatenates SKILL.md files with caching
- [x] Both throw descriptive errors for missing/invalid files
- [x] All exports are properly typed with no `any`

## Files Created/Modified

### Created (2 files)

- `src/lib/agents/registry.ts` (85 lines) - YAML config loader with validation and caching
- `src/lib/skills/loader.ts` (74 lines) - SKILL.md reader with concatenation and caching

### Modified

None

## Impact on System

**Immediate:**
- Agent implementations can now load their YAML configurations at runtime
- Compliance Mapper agent can inject skill content into LLM prompts
- All agents have typed configuration objects (not raw YAML)

**Next steps enabled:**
- Implement orchestrator that loads all agent configs (Plan 04)
- Implement specialized agents that load skills and call AI SDK (Plan 04)
- Wire up SSE streaming API route (Plan 05)

**Dependencies satisfied:**
- 02-01 (types) - Uses AgentConfig and agentConfigSchema
- 02-02 (content) - Reads YAML and SKILL.md files created in Plan 02

**Dependencies created:**
- Agent implementations will import loadAgentConfig and loadSkillsForAgent
- Orchestrator will import loadAllAgentConfigs

## Commits

1. **bfd5c98** - feat(02-03): create agent registry with YAML config loader
   - Created `src/lib/agents/registry.ts`
   - 85 lines
   - Exports: loadAgentConfig, loadAllAgentConfigs, clearConfigCache

2. **85153e2** - feat(02-03): create SKILL.md loader
   - Created `src/lib/skills/loader.ts`
   - 74 lines
   - Exports: loadSkill, loadSkills, loadSkillsForAgent, clearSkillCache

## Performance

- **Duration:** 1 minute
- **Tasks completed:** 2/2
- **Files created:** 2
- **Lines of code:** 159
- **Commits:** 2
- **Started:** 2026-02-16T06:42:57Z
- **Completed:** 2026-02-16T06:44:39Z

## Self-Check: PASSED

### Files Created
```
✓ FOUND: src/lib/agents/registry.ts
✓ FOUND: src/lib/skills/loader.ts
```

### Commits Verified
```
✓ FOUND: bfd5c98 (feat(02-03): create agent registry with YAML config loader)
✓ FOUND: 85153e2 (feat(02-03): create SKILL.md loader)
```

### Exports Verified
```
✓ registry.ts exports: loadAgentConfig, loadAllAgentConfigs, clearConfigCache
✓ loader.ts exports: loadSkill, loadSkills, loadSkillsForAgent, clearSkillCache
```

### Build Verification
```
✓ TypeScript compilation succeeded (pnpm typecheck)
✓ Production build succeeded (pnpm build)
```

All files and commits verified successfully.
