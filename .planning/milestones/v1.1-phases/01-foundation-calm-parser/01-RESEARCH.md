# Phase 1: Foundation & CALM Parser - Research

**Researched:** 2026-02-15
**Domain:** Next.js 15+ App Router, CALM Schema Parsing, TypeScript Validation
**Confidence:** HIGH

## Summary

Phase 1 establishes the CALMGuard foundation with Next.js 15 App Router, TypeScript strict mode, shadcn/ui dark theme, and a CALM v1.1 parser. The research confirms that Next.js 15 with pnpm provides a production-ready foundation with excellent TypeScript support, shadcn/ui offers a modern component system with built-in dark mode via next-themes, and Zod provides robust runtime validation for CALM JSON parsing.

The CALM schema (v1.1) is well-documented with four core entities: nodes (9 types), relationships (4 types), controls (compliance/security policies), and flows (business process sequences). The parser implementation should use Zod schemas that mirror CALM's structure, leveraging `.safeParse()` for validation error handling without throwing exceptions.

**Primary recommendation:** Use Next.js 15 App Router with TypeScript strict mode, pnpm for package management, shadcn/ui components with next-themes for dark mode, Zod for CALM validation, and Zustand for client-side state. Implement CALM parser as pure functions in `src/lib/calm/` with Zod schemas co-located in `types.ts`.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.5+ | App framework with App Router | Industry standard React framework with Server Components, built-in routing, automatic code splitting, and zero-config TypeScript support |
| pnpm | 9.x | Package manager | Fast, disk-efficient, strict dependency resolution; supports workspaces for potential monorepo expansion |
| TypeScript | 5.x | Type safety | Next.js includes auto-generated tsconfig.json with `strict: true`; prevents runtime errors |
| Zod | 3.x | Runtime validation | Type-safe schema validation with static type inference; zero dependencies, 2kb core |
| shadcn/ui | Latest | UI component system | Copy-paste components (not npm package), full source control, built on Radix UI primitives |
| Tailwind CSS | 4.x | Styling framework | shadcn/ui dependency; class-based dark mode, utility-first CSS |
| next-themes | 0.4.x | Theme management | Official recommendation for shadcn/ui dark mode; handles system preferences + localStorage |
| Zustand | 5.x | Client state | Minimal API, TypeScript-first, works with Server Components via Client boundary pattern |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React Flow | 12.x | Architecture visualization | Phase 2+; node-based graph rendering for CALM nodes/relationships |
| Recharts | 2.x | Compliance charts | Phase 3+; gauges, heat maps for compliance scoring |
| Vercel AI SDK | 4.x | LLM integration | Phase 2+; `generateObject` with Zod schemas for agent outputs |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Next.js | Remix, Astro | Next.js offers best Vercel deployment, largest ecosystem, AI SDK integration |
| pnpm | npm, yarn | pnpm 3x faster, strict mode prevents phantom dependencies |
| shadcn/ui | Chakra UI, MUI | shadcn gives full component source control, no dependency bloat |
| Zod | Yup, io-ts | Zod has best TypeScript inference, smallest bundle, best Vercel AI SDK support |
| Zustand | Redux, Jotai | Zustand simpler API, no boilerplate, works naturally with RSC boundaries |

**Installation:**
```bash
# Initialize Next.js with pnpm
pnpm create next-app@latest calmguard --typescript --tailwind --app --turbopack --no-src-dir --import-alias "@/*"

# Initialize shadcn/ui
cd calmguard
pnpm dlx shadcn@latest init

# Add core dependencies
pnpm add zod zustand next-themes

# Add shadcn components (as needed)
pnpm dlx shadcn@latest add button card dropdown-menu skeleton
```

## Architecture Patterns

### Recommended Project Structure

```
calmguard/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes (SSE streaming in Phase 2+)
│   │   ├── dashboard/            # Dashboard pages
│   │   ├── layout.tsx            # Root layout with ThemeProvider
│   │   └── page.tsx              # Landing page
│   ├── lib/                      # Framework-agnostic business logic
│   │   ├── calm/                 # CALM parsing, validation, types
│   │   │   ├── parser.ts         # Core parsing logic
│   │   │   ├── types.ts          # CALM TypeScript types + Zod schemas
│   │   │   ├── validator.ts      # Validation helpers
│   │   │   └── extractor.ts      # Extract nodes/relationships/controls/flows
│   │   └── utils/                # Shared utilities
│   ├── components/
│   │   ├── ui/                   # shadcn/ui base components (DO NOT modify)
│   │   ├── dashboard/            # Dashboard-specific components
│   │   ├── layout/               # Sidebar, header, theme toggle
│   │   └── calm/                 # CALM-specific components (architecture selector, error display)
│   ├── hooks/                    # React hooks
│   │   ├── use-calm-parser.ts    # Hook for parsing CALM files
│   │   └── use-theme.ts          # Re-export from next-themes (optional wrapper)
│   └── store/                    # Zustand stores
│       └── analysis-store.ts     # Analysis state (Phase 1: parsed CALM data)
├── examples/                     # Demo CALM architecture JSON files
│   ├── trading-platform.calm.json
│   └── payment-gateway.calm.json
├── public/                       # Static assets
├── .planning/                    # Planning docs (already exists)
└── package.json
```

### Pattern 1: CALM Parser with Zod Validation

**What:** Parse CALM JSON v1.1 into typed structures using Zod schemas for runtime validation

**When to use:** All CALM input (file upload, demo selection, API responses)

**Example:**
```typescript
// src/lib/calm/types.ts
import { z } from 'zod';

// Node types enum (CALM v1.1)
export const nodeTypeSchema = z.enum([
  'actor', 'ecosystem', 'system', 'service', 'database',
  'network', 'ldap', 'webclient', 'data-asset'
]);

// Node schema (required: unique-id, node-type, name, description)
export const calmNodeSchema = z.object({
  'unique-id': z.string(),
  'node-type': nodeTypeSchema,
  name: z.string(),
  description: z.string(),
  interfaces: z.array(z.any()).optional(), // Define interface schema later
  controls: z.record(z.any()).optional(),  // Define control schema later
  metadata: z.any().optional(),
  details: z.object({
    'detailed-architecture': z.string().optional(),
    'required-pattern': z.string().optional(),
  }).optional(),
});

export type CalmNode = z.infer<typeof calmNodeSchema>;

// Relationship types enum
export const relationshipTypeSchema = z.enum([
  'interacts', 'connects', 'deployed-in', 'composed-of', 'options'
]);

// Full CALM document schema
export const calmDocumentSchema = z.object({
  nodes: z.array(calmNodeSchema),
  relationships: z.array(z.any()), // Define relationship schema with discriminated unions
  controls: z.record(z.any()).optional(),
  flows: z.array(z.any()).optional(),
});

export type CalmDocument = z.infer<typeof calmDocumentSchema>;
```

```typescript
// src/lib/calm/parser.ts
import { calmDocumentSchema, type CalmDocument } from './types';

export interface ParseResult {
  success: true;
  data: CalmDocument;
} | {
  success: false;
  error: {
    message: string;
    issues: Array<{ path: string[]; message: string }>;
  };
}

export function parseCalm(json: unknown): ParseResult {
  const result = calmDocumentSchema.safeParse(json);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Format Zod errors for user display
  return {
    success: false,
    error: {
      message: 'Invalid CALM JSON structure',
      issues: result.error.issues.map(issue => ({
        path: issue.path.map(String),
        message: issue.message,
      })),
    },
  };
}
```

### Pattern 2: Server Component Data Loading

**What:** Fetch data in Server Components, pass to Client Components via props

**When to use:** Loading demo CALM files, static data without user interaction

**Example:**
```typescript
// src/app/dashboard/page.tsx (Server Component - default)
import { readFile } from 'fs/promises';
import { ArchitectureSelector } from '@/components/calm/architecture-selector';

export default async function DashboardPage() {
  // Server-side file read (no API route needed)
  const demos = await readFile('examples/index.json', 'utf-8')
    .then(JSON.parse)
    .catch(() => []);

  return (
    <div className="container mx-auto p-6">
      <ArchitectureSelector demos={demos} />
    </div>
  );
}
```

### Pattern 3: Client Boundary for Interactivity

**What:** Use 'use client' directive only for components needing hooks, state, or events

**When to use:** File upload, dropdown interaction, Zustand state access

**Example:**
```typescript
// src/components/calm/architecture-selector.tsx
'use client';

import { useState } from 'react';
import { useAnalysisStore } from '@/store/analysis-store';
import { parseCalm } from '@/lib/calm/parser';

export function ArchitectureSelector({ demos }: { demos: any[] }) {
  const [selectedDemo, setSelectedDemo] = useState<string>('');
  const setAnalysis = useAnalysisStore((state) => state.setAnalysis);

  const handleSelect = async (demoId: string) => {
    setSelectedDemo(demoId);
    const demo = demos.find(d => d.id === demoId);
    if (demo) {
      const result = parseCalm(demo.content);
      if (result.success) {
        setAnalysis(result.data);
      }
    }
  };

  return (
    <div>
      {/* shadcn/ui dropdown, buttons, etc. */}
    </div>
  );
}
```

### Pattern 4: Zustand Store with TypeScript

**What:** Create typed Zustand store for client-side state (parsed CALM data, UI state)

**When to use:** Sharing state across Client Components without prop drilling

**Example:**
```typescript
// src/store/analysis-store.ts
import { create } from 'zustand';
import type { CalmDocument } from '@/lib/calm/types';

interface AnalysisState {
  calmData: CalmDocument | null;
  isLoading: boolean;
  error: string | null;
  setAnalysis: (data: CalmDocument) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  calmData: null,
  isLoading: false,
  error: null,
  setAnalysis: (data) => set({ calmData: data, error: null, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set({ calmData: null, error: null, isLoading: false }),
}));
```

### Pattern 5: Dark Theme with next-themes

**What:** Configure dark mode using class-based strategy with next-themes provider

**When to use:** Phase 1 setup (required for shadcn/ui dark theme)

**Example:**
```typescript
// src/app/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-900 text-slate-50">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'], // Enable class-based dark mode
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui uses CSS variables for theming
      },
    },
  },
  plugins: [],
};

export default config;
```

### Pattern 6: Skeleton Loading States

**What:** Use shadcn/ui Skeleton component for loading placeholders that match actual content dimensions

**When to use:** Dashboard component placeholders (requirement INFRA-03)

**Example:**
```typescript
// src/components/dashboard/compliance-card-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function ComplianceCardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
      <Skeleton className="h-6 w-32 rounded mb-4" /> {/* Title */}
      <Skeleton className="h-24 w-full rounded" />    {/* Chart area */}
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full rounded" />   {/* Text line */}
        <Skeleton className="h-4 w-3/4 rounded" />    {/* Text line */}
      </div>
    </div>
  );
}
```

### Anti-Patterns to Avoid

- **'use client' at root layout**: Only mark components that need interactivity; keep layout as Server Component
- **Importing Server Components into Client Components**: Pass as `children` prop instead
- **Zustand in Server Components**: Server Components can't use hooks; only access store in Client Components
- **Throwing in parse functions**: Use `.safeParse()` and return discriminated union for error handling
- **Modifying shadcn/ui base components**: Components in `src/components/ui/` are generated; customize via composition
- **Manual dark mode toggle**: Use next-themes `useTheme` hook, don't manually add/remove `dark` class
- **Mixing pnpm/npm/yarn**: Stick to pnpm; mixing causes dependency conflicts

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON schema validation | Custom validator with if/else checks | Zod schemas | Type inference, nested validation, custom error messages, 2kb bundle |
| Dark mode toggle | localStorage + manual class toggle | next-themes | SSR hydration handling, system preference detection, no flash |
| UI components | Custom button/dropdown/card from scratch | shadcn/ui | Accessibility (Radix UI), keyboard navigation, ARIA attributes, battle-tested |
| State management | Context API with reducers | Zustand | Less boilerplate, better TypeScript inference, smaller bundle, simpler API |
| File upload validation | Manual file reader + validation | Zod + native File API | Type-safe validation, MIME type checking, size limits, consistent error handling |
| Loading skeletons | CSS shimmer animations from scratch | shadcn/ui Skeleton | Consistent with component library, Tailwind integration, layout shift prevention |

**Key insight:** The Next.js ecosystem has mature, well-tested solutions for common problems. Custom implementations introduce bugs (hydration mismatches, accessibility gaps, security issues) and maintenance burden. Use standard libraries that have solved these edge cases.

## Common Pitfalls

### Pitfall 1: Server/Client Component Boundary Confusion

**What goes wrong:** Adding `'use client'` to layouts or pages when only child components need interactivity, bloating client bundle

**Why it happens:** Misunderstanding Server Components as default in App Router; treating all components as client-side like in Pages Router

**How to avoid:**
- Server Components are DEFAULT in App Router (no directive needed)
- Only add `'use client'` to components using hooks (`useState`, `useEffect`, Zustand), events (`onClick`), or browser APIs
- Server Components can import Client Components, but not vice versa
- Pass Server Components to Client Components via `children` prop

**Warning signs:**
- `'use client'` in `layout.tsx` or page files
- Import errors like "You're importing a component that needs X. It only works in a Client Component"
- Large client bundle size reported by Next.js build

### Pitfall 2: Zustand Store in Server Components

**What goes wrong:** Attempting to call Zustand hooks in Server Components causes "useState is not available in Server Components" error

**Why it happens:** Server Components render once on server; Zustand relies on React hooks which are client-only

**How to avoid:**
- Mark components accessing Zustand with `'use client'`
- Load data in Server Components, pass to Client Components via props
- Client Components then put data into Zustand store
- Never try to initialize Zustand store state from Server Component

**Warning signs:**
- Error: "Hooks can only be called inside the body of a function component"
- File without `'use client'` directive importing from `@/store/*`

### Pitfall 3: Zod Parsing with .parse() Instead of .safeParse()

**What goes wrong:** Using `schema.parse(data)` throws ZodError on invalid input, requires try/catch everywhere, makes error handling verbose

**Why it happens:** `.parse()` is the simpler API shown in basic examples; developers don't know about `.safeParse()`

**How to avoid:**
- Use `.safeParse()` for all external data (file uploads, API responses)
- Returns discriminated union: `{ success: true; data: T } | { success: false; error: ZodError }`
- Check `result.success` with if/else (TypeScript narrows type automatically)
- Format `result.error.issues` array for user-friendly error messages

**Warning signs:**
- try/catch blocks around every parse call
- Unhandled promise rejections from async parsing
- Generic "Validation failed" messages without details

### Pitfall 4: Forgetting suppressHydrationWarning on HTML Tag

**What goes wrong:** Console warning "Warning: Prop `className` did not match. Server: "" Client: "dark"" when using next-themes

**Why it happens:** next-themes updates `<html>` element className on client side to apply dark mode, causing hydration mismatch

**How to avoid:**
- Add `suppressHydrationWarning` to `<html>` tag in root layout
- This prop only applies one level deep (safe to use for theme class)
- Required when using next-themes with `attribute="class"`

**Warning signs:**
- Hydration mismatch warnings in console
- Flash of unstyled content (FOUC) on page load
- Dark mode not applying correctly on initial render

### Pitfall 5: Invalid CALM JSON Structure Assumptions

**What goes wrong:** Parser crashes on valid CALM files because schema doesn't handle optional fields, discriminated unions for relationship types

**Why it happens:** Incomplete understanding of CALM v1.1 schema; not all fields are required; relationships have mutually exclusive types

**How to avoid:**
- Study CALM v1.1 spec thoroughly (nodes, relationships, controls, flows)
- Use `.optional()` for optional CALM fields (interfaces, controls, metadata, details)
- Use Zod discriminated unions for relationship types (each type has different required fields)
- Test parser with multiple example CALM files (trading platform, payment gateway)
- Read CALM documentation at https://calm.finos.org/

**Warning signs:**
- Parser rejects valid CALM files from FINOS examples
- Overly restrictive schema requiring all optional fields
- Type errors when accessing optional properties without null checks

### Pitfall 6: Not Matching Skeleton Layout to Actual Content

**What goes wrong:** Skeletons have different dimensions than actual content, causing layout shift when content loads

**Why it happens:** Generic skeleton sizes used instead of matching actual component dimensions

**How to avoid:**
- Create skeleton variants that mirror actual content structure exactly
- Match widths, heights, border radius, spacing to real components
- Test skeleton → content transition to verify no layout shift
- Use same grid/flex layout for skeleton containers as actual content

**Warning signs:**
- Visible layout jump when skeleton is replaced with content
- Cumulative Layout Shift (CLS) score increases
- User reports of "jumpy" loading experience

### Pitfall 7: TypeScript Strict Mode Disabled

**What goes wrong:** Type errors slip through during development, cause runtime bugs in production

**Why it happens:** Default Next.js template doesn't always enable strict mode; developers disable it to "fix" type errors quickly

**How to avoid:**
- Verify `"strict": true` in tsconfig.json after project creation
- Add `"noUnusedLocals": true`, `"noUnusedParameters": true`, `"noImplicitReturns": true`
- Fix type errors properly instead of using `any` or `@ts-ignore`
- Use Zod for runtime validation of external data

**Warning signs:**
- `any` types appearing frequently in codebase
- Runtime errors in production that TypeScript should have caught
- tsconfig.json with `"strict": false`

## Code Examples

### Example 1: Complete CALM Node Schema

```typescript
// src/lib/calm/types.ts
import { z } from 'zod';

// CALM v1.1 node types (from specification)
export const nodeTypeSchema = z.enum([
  'actor',       // People, systems, or roles that interact with the system
  'ecosystem',   // High-level grouping of systems
  'system',      // Software systems
  'service',     // Microservices or components
  'database',    // Data stores
  'network',     // Network infrastructure
  'ldap',        // LDAP directories
  'webclient',   // Browser-based clients
  'data-asset',  // Data entities or datasets
]);

export type NodeType = z.infer<typeof nodeTypeSchema>;

// Interface definition
export const interfaceDefinitionSchema = z.object({
  'unique-id': z.string(),
  'definition-url': z.string().url().optional(),
  config: z.any().optional(),
});

// Node schema (required: unique-id, node-type, name, description)
export const calmNodeSchema = z.object({
  'unique-id': z.string().min(1, 'Node unique-id is required'),
  'node-type': nodeTypeSchema,
  name: z.string().min(1, 'Node name is required'),
  description: z.string().min(1, 'Node description is required'),
  interfaces: z.array(interfaceDefinitionSchema).optional(),
  controls: z.record(z.string(), z.any()).optional(), // Pattern: ^[a-zA-Z0-9-]+$
  metadata: z.record(z.string(), z.any()).optional(),
  details: z.object({
    'detailed-architecture': z.string().url().optional(),
    'required-pattern': z.string().url().optional(),
  }).optional(),
  'data-classification': z.enum(['PII', 'PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']).optional(),
  'run-as': z.string().optional(),
});

export type CalmNode = z.infer<typeof calmNodeSchema>;
```

### Example 2: CALM Relationship Schema with Discriminated Unions

```typescript
// src/lib/calm/types.ts (continued)
import { z } from 'zod';

// Protocol enum
export const protocolSchema = z.enum([
  'HTTP', 'HTTPS', 'FTP', 'SFTP', 'JDBC', 'WebSocket', 'SocketIO',
  'LDAP', 'AMQP', 'TLS', 'mTLS', 'TCP'
]);

// Base relationship properties (common to all types)
const baseRelationshipSchema = z.object({
  'unique-id': z.string().min(1, 'Relationship unique-id is required'),
  description: z.string().optional(),
  protocol: protocolSchema.optional(),
  controls: z.record(z.string(), z.any()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Interacts relationship: { actor: string, nodes: string[] }
const interactsSchema = baseRelationshipSchema.extend({
  'relationship-type': z.literal('interacts'),
  interacts: z.object({
    actor: z.string(),
    nodes: z.array(z.string()),
  }),
});

// Connects relationship: { source: node-interface, destination: node-interface }
const connectsSchema = baseRelationshipSchema.extend({
  'relationship-type': z.literal('connects'),
  connects: z.object({
    source: z.object({
      node: z.string(),
      interfaces: z.array(z.string()).optional(),
    }),
    destination: z.object({
      node: z.string(),
      interfaces: z.array(z.string()).optional(),
    }),
  }),
});

// Deployed-in relationship: { container: string, nodes: string[] }
const deployedInSchema = baseRelationshipSchema.extend({
  'relationship-type': z.literal('deployed-in'),
  'deployed-in': z.object({
    container: z.string(),
    nodes: z.array(z.string()),
  }),
});

// Composed-of relationship: { container: string, nodes: string[] }
const composedOfSchema = baseRelationshipSchema.extend({
  'relationship-type': z.literal('composed-of'),
  'composed-of': z.object({
    container: z.string(),
    nodes: z.array(z.string()),
  }),
});

// Options relationship (structure TBD - use any for now)
const optionsSchema = baseRelationshipSchema.extend({
  'relationship-type': z.literal('options'),
  options: z.any(),
});

// Discriminated union of all relationship types
export const calmRelationshipSchema = z.discriminatedUnion('relationship-type', [
  interactsSchema,
  connectsSchema,
  deployedInSchema,
  composedOfSchema,
  optionsSchema,
]);

export type CalmRelationship = z.infer<typeof calmRelationshipSchema>;
```

### Example 3: CALM Flow Schema

```typescript
// src/lib/calm/types.ts (continued)

// Flow transition
export const flowTransitionSchema = z.object({
  'relationship-unique-id': z.string(),
  'sequence-number': z.number().int().positive(),
  description: z.string().optional(),
  direction: z.enum(['source-to-destination', 'destination-to-source']).optional(), // Default: source-to-destination
});

// Flow
export const calmFlowSchema = z.object({
  'unique-id': z.string().min(1, 'Flow unique-id is required'),
  name: z.string().min(1, 'Flow name is required'),
  description: z.string().min(1, 'Flow description is required'),
  transitions: z.array(flowTransitionSchema).min(1, 'Flow must have at least one transition'),
});

export type CalmFlow = z.infer<typeof calmFlowSchema>;
```

### Example 4: Complete CALM Document Schema

```typescript
// src/lib/calm/types.ts (continued)

// Control requirement
export const controlRequirementSchema = z.object({
  'requirement-url': z.string().url(),
  'config-url': z.string().url().optional(),
  config: z.any().optional(),
});

// Control definition
export const controlDefinitionSchema = z.object({
  description: z.string().min(1, 'Control description is required'),
  requirements: z.array(controlRequirementSchema).optional(),
});

// Full CALM document
export const calmDocumentSchema = z.object({
  nodes: z.array(calmNodeSchema),
  relationships: z.array(calmRelationshipSchema),
  controls: z.record(z.string().regex(/^[a-zA-Z0-9-]+$/), controlDefinitionSchema).optional(),
  flows: z.array(calmFlowSchema).optional(),
});

export type CalmDocument = z.infer<typeof calmDocumentSchema>;
```

### Example 5: CALM Parser with Error Formatting

```typescript
// src/lib/calm/parser.ts
import { calmDocumentSchema, type CalmDocument } from './types';
import type { ZodError } from 'zod';

export interface ParseSuccess {
  success: true;
  data: CalmDocument;
}

export interface ParseError {
  success: false;
  error: {
    message: string;
    issues: Array<{
      path: string;
      message: string;
      code: string;
    }>;
  };
}

export type ParseResult = ParseSuccess | ParseError;

function formatZodError(error: ZodError): ParseError['error'] {
  return {
    message: 'Invalid CALM JSON structure',
    issues: error.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    })),
  };
}

export function parseCalm(json: unknown): ParseResult {
  const result = calmDocumentSchema.safeParse(json);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: formatZodError(result.error) };
}

// Async variant for file reading
export async function parseCalmFile(file: File): Promise<ParseResult> {
  try {
    const text = await file.text();
    const json = JSON.parse(text);
    return parseCalm(json);
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to read file',
        issues: [],
      },
    };
  }
}
```

### Example 6: CALM Data Extraction Utilities

```typescript
// src/lib/calm/extractor.ts
import type { CalmDocument, CalmNode, CalmRelationship, CalmFlow } from './types';

export interface AnalysisInput {
  nodes: CalmNode[];
  relationships: CalmRelationship[];
  controls: Record<string, any>;
  flows: CalmFlow[];
  metadata: {
    nodeCount: number;
    relationshipCount: number;
    flowCount: number;
    nodeTypes: Record<string, number>;
    relationshipTypes: Record<string, number>;
  };
}

export function extractAnalysisInput(calm: CalmDocument): AnalysisInput {
  const nodeTypeCounts = calm.nodes.reduce((acc, node) => {
    acc[node['node-type']] = (acc[node['node-type']] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const relationshipTypeCounts = calm.relationships.reduce((acc, rel) => {
    acc[rel['relationship-type']] = (acc[rel['relationship-type']] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    nodes: calm.nodes,
    relationships: calm.relationships,
    controls: calm.controls || {},
    flows: calm.flows || [],
    metadata: {
      nodeCount: calm.nodes.length,
      relationshipCount: calm.relationships.length,
      flowCount: calm.flows?.length || 0,
      nodeTypes: nodeTypeCounts,
      relationshipTypes: relationshipTypeCounts,
    },
  };
}

// Get all nodes of a specific type
export function getNodesByType(calm: CalmDocument, nodeType: string): CalmNode[] {
  return calm.nodes.filter(node => node['node-type'] === nodeType);
}

// Get relationships connected to a specific node
export function getNodeRelationships(calm: CalmDocument, nodeId: string): CalmRelationship[] {
  return calm.relationships.filter(rel => {
    switch (rel['relationship-type']) {
      case 'interacts':
        return rel.interacts.actor === nodeId || rel.interacts.nodes.includes(nodeId);
      case 'connects':
        return rel.connects.source.node === nodeId || rel.connects.destination.node === nodeId;
      case 'deployed-in':
        return rel['deployed-in'].container === nodeId || rel['deployed-in'].nodes.includes(nodeId);
      case 'composed-of':
        return rel['composed-of'].container === nodeId || rel['composed-of'].nodes.includes(nodeId);
      default:
        return false;
    }
  });
}
```

### Example 7: File Upload Component with Validation

```typescript
// src/components/calm/file-upload.tsx
'use client';

import { useState } from 'react';
import { parseCalmFile } from '@/lib/calm/parser';
import { useAnalysisStore } from '@/store/analysis-store';
import { Button } from '@/components/ui/button';

export function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const { setAnalysis, setError, setLoading } = useAnalysisStore();

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.json') && !file.name.endsWith('.calm.json')) {
      setError('Please upload a JSON file');
      return;
    }

    setLoading(true);
    const result = await parseCalmFile(file);

    if (result.success) {
      setAnalysis(result.data);
    } else {
      setError(`Validation failed: ${result.error.message}\n${result.error.issues.map(i => `- ${i.path}: ${i.message}`).join('\n')}`);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) await handleFile(file);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-900'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <p className="text-slate-400 mb-4">Drag & drop CALM JSON file here, or click to select</p>
      <input
        type="file"
        accept=".json,.calm.json"
        onChange={handleChange}
        className="hidden"
        id="file-input"
      />
      <Button asChild variant="outline">
        <label htmlFor="file-input" className="cursor-pointer">
          Select File
        </label>
      </Button>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router (`/pages`) | App Router (`/app`) | Next.js 13 (2022), stable in 14+ | Server Components default, better data fetching, layouts, streaming |
| getServerSideProps/getStaticProps | Server Components + async/await | Next.js 13 (2022) | Simpler API, no special functions, direct async in components |
| CSS Modules for dark mode | Tailwind dark: modifier + next-themes | 2023+ (shadcn/ui standardization) | Utility-first, no context switching, system preference support |
| PropTypes / manual validation | Zod runtime validation | 2021+ (Zod 3.0) | TypeScript inference, runtime safety, composable schemas |
| Redux for all state | Zustand for client state | 2020+ (Zustand rise) | Less boilerplate, simpler API, smaller bundle, better DX |
| create-react-app | create-next-app / Vite | 2023 (CRA deprecated) | Better performance, more features, active maintenance |
| npm | pnpm | 2022+ (pnpm 7+) | Faster installs, disk efficiency, strict resolution |

**Deprecated/outdated:**
- **Pages Router** - Still supported but App Router is recommended for new projects; better features, performance
- **getServerSideProps/getStaticProps** - Replaced by Server Components with async/await; simpler mental model
- **class-based components** - Functional components + hooks are standard; better TypeScript support
- **prop-types package** - TypeScript provides compile-time checking; Zod for runtime validation
- **Context API for global state** - Use for theme/auth (via libraries like next-themes); use Zustand for app state
- **Manual localStorage theme** - next-themes handles SSR hydration correctly; prevents FOUC

## Open Questions

1. **Demo CALM Architecture Complexity**
   - What we know: Need trading platform (8-10 nodes) and payment gateway (6-8 nodes) examples
   - What's unclear: Exact node types, relationships, flows to represent realistic architectures
   - Recommendation: Study FINOS CALM examples repo (when accessible), use realistic fintech patterns (trading: FIX protocol, order management; payment: PCI DSS controls, card networks)

2. **CALM v1.1 vs Draft 2024-04 Schema**
   - What we know: CLAUDE.md references v1.1, but CALM repo has draft/2024-04 schema
   - What's unclear: Are there breaking changes between 1.1 and 2024-04 draft?
   - Recommendation: Use v1.1 spec from https://calm.finos.org/ as source of truth; add comment in types.ts about schema version

3. **Relationship Options Type Structure**
   - What we know: "options" is a valid relationship-type in CALM spec
   - What's unclear: What is the structure of the "options" field? No documentation found
   - Recommendation: Use `options: z.any()` for Phase 1; refine in Phase 2 if real examples surface

4. **pnpm Workspaces for Monorepo**
   - What we know: Single Next.js app for Phase 1; pnpm supports workspaces
   - What's unclear: Will we need contracts, shared packages, or separate services later?
   - Recommendation: Single package.json for Phase 1; add pnpm-workspace.yaml in Phase 4+ if architecture splits

## Sources

### Primary (HIGH confidence)

- [Next.js Official Documentation](https://nextjs.org/docs) - App Router, TypeScript config, Server Components
- [Next.js 15.5 Release](https://nextjs.org/blog/next-15-5) - Current stable version
- [shadcn/ui Documentation](https://ui.shadcn.com/docs) - Installation, dark mode setup
- [shadcn/ui Dark Mode with Next.js](https://ui.shadcn.com/docs/dark-mode/next) - next-themes integration
- [Zod Official Documentation](https://zod.dev) - Schema validation, safeParse, error handling
- [Zustand Documentation](https://zustand.docs.pmnd.rs/getting-started/introduction) - Store creation, TypeScript
- [CALM Official Documentation](https://calm.finos.org/) - What is CALM, core concepts
- [CALM Nodes Reference](https://calm.finos.org/core-concepts/nodes/) - Node types, required fields
- [CALM Relationships Reference](https://calm.finos.org/core-concepts/relationships/) - Relationship types, structure
- [TypeScript Official tsconfig Reference](https://www.typescriptlang.org/tsconfig/) - Strict mode, compiler options
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode) - Class-based strategy
- [pnpm Workspaces Documentation](https://pnpm.io/next/workspaces) - Monorepo setup

### Secondary (MEDIUM confidence)

- [How To Use Zustand With Next.js 15](https://www.dimasroger.com/blog/how-to-use-zustand-with-next-js-15) - Setup patterns, verified with official docs
- [Setup with Next.js - Zustand](https://zustand.docs.pmnd.rs/guides/nextjs) - Next.js specific integration
- [Common mistakes with the Next.js App Router - Vercel](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) - Pitfalls from official source
- [App Router pitfalls: common Next.js mistakes](https://imidef.com/en/2026-02-11-app-router-pitfalls) - Recent (Feb 2026) analysis
- [Next.js Getting Started: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) - Official boundary patterns
- [React Flow Quick Start](https://reactflow.dev/learn) - Future Phase 2+ visualization
- [React Flow TypeScript Guide](https://reactflow.dev/learn/advanced-use/typescript) - Type-safe node/edge patterns
- [Tailwind CSS v4 Complete Guide](https://devtoolbox.dedyn.io/blog/tailwind-css-v4-complete-guide) - 2026 best practices

### Tertiary (LOW confidence)

- [pnpm create next-app options](https://www.npmjs.com/package/create-next-app) - CLI flags (verify with `--help`)
- [CALM CLI npm package](https://www.npmjs.com/package/@finos/calm-cli) - FINOS official CLI tool (not using in Phase 1, but reference)

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** - All libraries have official docs, stable versions, proven Next.js integration
- Architecture: **HIGH** - Patterns verified with official Next.js, shadcn/ui, Zustand documentation
- CALM schema: **MEDIUM-HIGH** - Official CALM docs available but some fields (options, controls) lack detailed examples
- Pitfalls: **HIGH** - Verified with official Vercel blog, Next.js docs, recent (2026) community articles

**Research date:** 2026-02-15
**Valid until:** ~45 days (March 2026) - Next.js and React ecosystem is stable; CALM schema is standardized (v1.1)

**Research completeness:**
- ✅ Next.js 15 App Router setup and patterns
- ✅ shadcn/ui dark theme configuration
- ✅ Zod validation patterns and error handling
- ✅ Zustand TypeScript store patterns
- ✅ CALM v1.1 schema structure (nodes, relationships, controls, flows)
- ✅ Common pitfalls and anti-patterns
- ✅ Code examples for all major patterns
- ⚠️ CALM "options" relationship structure (low priority - use `z.any()`)
- ⚠️ Exact FINOS example files (GitHub access issues - create own examples)
