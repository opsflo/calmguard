---
phase: 01-foundation-calm-parser
plan: 03
subsystem: demo-data
status: complete
completed: 2026-02-16

tags:
  - calm
  - demo-data
  - zustand
  - state-management
  - fintech

dependency-graph:
  requires:
    - calm-parser
    - calm-types
  provides:
    - demo-architectures
    - analysis-store
  affects:
    - dashboard-ui
    - architecture-selector

tech-stack:
  added:
    - zustand: Minimal state management with flat state structure
  patterns:
    - demo-registry: Typed demo metadata for UI selector
    - flat-state: Zustand best practice for performance
    - status-lifecycle: idle -> loading -> parsed -> analyzing -> complete

key-files:
  created:
    - examples/trading-platform.calm.json: Realistic trading platform with 10 nodes, FIX gateway, risk engine
    - examples/payment-gateway.calm.json: PCI-DSS compliant payment architecture with 8 nodes
    - examples/index.ts: Typed demo registry with metadata
    - src/store/analysis-store.ts: Zustand store for analysis state management
  modified:
    - package.json: Added tsx dev dependency for TypeScript testing

decisions:
  - decision: "Flat state structure in Zustand store"
    rationale: "Zustand works best with flat state - avoids nested object mutation issues and improves performance"
    impact: "All state fields at top level, no nested objects, easier to update and debug"

  - decision: "Status lifecycle supports future phases"
    rationale: "Added 'analyzing' and 'complete' statuses even though not used yet - avoids refactoring later"
    impact: "Store ready for Phase 2 multi-agent integration without changes"

  - decision: "Demo registry uses unknown for data field"
    rationale: "Raw JSON is validated at parse time by CALM parser, registry just holds unvalidated data"
    impact: "Type safety enforced at parse boundary, not at demo registry boundary"

  - decision: "Realistic compliance controls in demos"
    rationale: "Demo architectures need realistic controls to test compliance mapping agents in Phase 3"
    impact: "Trading platform has SEC/FINRA controls, payment gateway has PCI-DSS controls - enables realistic agent testing"

metrics:
  duration: 4
  completed-date: 2026-02-16T18:57:24Z
  tasks-completed: 2/2
  files-created: 4
  files-modified: 1
  lines-added: 700
---

# Phase 01 Plan 03: Demo Architectures & Analysis Store Summary

**Realistic fintech demo CALM architectures (trading platform, payment gateway) with Zustand state management**

## Objective

Created two production-quality demo CALM architectures showcasing realistic fintech patterns and a Zustand store for managing analysis state throughout the application lifecycle.

## What Was Built

### 1. Trading Platform Demo (examples/trading-platform.calm.json)

**Architecture Overview:**
A multi-service trading system demonstrating low-latency order execution with regulatory compliance controls.

**10 Nodes:**
- `actor`: Trader (human)
- `webclient`: Trading Dashboard
- `service`: Order Management Service (core orchestrator)
- `service`: FIX Gateway (exchange connectivity)
- `service`: Market Data Service (real-time feeds)
- `service`: Risk Engine (pre-trade validation)
- `database`: Order Database (PostgreSQL)
- `database`: Market Data Cache (Redis)
- `system`: Exchange Gateway (external)
- `network`: Trading Network (low-latency infrastructure)

**9 Relationships:**
- `interacts`: Trader → Dashboard
- `connects`: Dashboard → Order Mgmt (HTTPS), Order Mgmt → Risk (HTTPS), Order Mgmt → FIX (TCP), Order Mgmt → DB (JDBC), Market Data → Cache (TCP), FIX → Exchange (mTLS), Dashboard → Market Data (WebSocket)
- `deployed-in`: Trading Network contains [Order Mgmt, FIX, Risk, Market Data]

**1 Flow:**
"Order Execution Flow" - Complete path from trader order entry through exchange execution (6 transitions)

**Compliance Controls:**
- Data encryption (NIST FIPS 140-2)
- Audit logging (SEC Rule 17a-4)
- Access control (FIX Trading Security)
- Rate limiting (OWASP)
- Business logic validation (FINRA Rule 4210)
- Data retention (7 years per SEC requirements)
- Network segmentation (CIS Controls)

### 2. Payment Gateway Demo (examples/payment-gateway.calm.json)

**Architecture Overview:**
PCI-DSS compliant payment processing system with tokenization, fraud detection, and secure cardholder data handling.

**8 Nodes:**
- `actor`: Customer (end user)
- `webclient`: Checkout Page (payment form)
- `service`: Payment API (orchestrator)
- `service`: Tokenization Service (card vault)
- `service`: Fraud Detection (ML-based)
- `database`: Transaction Database
- `system`: Card Network (Visa/MC)
- `data-asset`: Cardholder Data (PCI-scoped)

**6 Relationships:**
- `interacts`: Customer → Checkout
- `connects`: Checkout → Payment API (HTTPS), Payment API → Tokenization (mTLS), Payment API → Fraud (HTTPS), Payment API → DB (JDBC), Tokenization → Card Network (mTLS)

**1 Flow:**
"Payment Processing Flow" - Complete payment path from card entry through authorization (6 transitions)

**Compliance Controls:**
- PCI-DSS compliance (SAQ-D)
- Input validation
- Secure transmission (TLS 1.2+)
- API authentication
- Encryption at rest (AES-256)
- HSM key management (NIST SP 800-57)
- Access logging
- Model monitoring (ISO 27001)
- Data retention (3 years)
- Data minimization (never store CVV)
- TLS enforcement

**Data Classification:**
- Tokenization Service: RESTRICTED
- Transaction Database: CONFIDENTIAL
- Cardholder Data: RESTRICTED

### 3. Demo Registry (examples/index.ts)

**TypeScript Registry:**
```typescript
export interface DemoArchitecture {
  id: string;
  name: string;
  description: string;
  nodeCount: number;
  data: unknown; // Raw JSON, validated at parse time
}

export const DEMO_ARCHITECTURES: DemoArchitecture[] = [ ... ]
```

**Features:**
- Typed metadata for architecture selector UI
- Human-readable names and descriptions
- Node counts for display
- Raw JSON data for parser consumption

### 4. Zustand Analysis Store (src/store/analysis-store.ts)

**State Schema:**
```typescript
interface AnalysisState {
  // Data
  selectedDemoId: string | null;
  rawCalmData: CalmDocument | null;
  analysisInput: AnalysisInput | null;

  // Status
  status: AnalysisStatus; // idle | loading | parsed | analyzing | complete | error
  error: string | null;

  // Actions
  setSelectedDemo: (demoId: string) => void;
  setCalmData: (data: CalmDocument, input: AnalysisInput) => void;
  setStatus: (status: AnalysisStatus) => void;
  setError: (error: string) => void;
  reset: () => void;
}
```

**Key Features:**
- Flat state structure (Zustand best practice)
- Status lifecycle supports analysis phases
- Type-safe with no `any` types
- Clean action API with focused responsibilities
- Library module (no 'use client' directive)

**Status Lifecycle:**
1. `idle` - Initial state, no architecture selected
2. `loading` - Fetching/parsing CALM data
3. `parsed` - CALM parsed successfully, ready for analysis
4. `analyzing` - Multi-agent analysis running (Phase 3+)
5. `complete` - Analysis complete with results
6. `error` - Error occurred with message

## Deviations from Plan

None - plan executed exactly as written.

## Technical Decisions

### 1. Realistic Control URLs

Used actual compliance framework URLs (PCI-DSS, SEC, FINRA, NIST, OWASP) instead of placeholder URLs.

**Benefits:**
- Demonstrates real-world compliance mapping
- Enables realistic agent testing in Phase 3
- Provides educational value for hackathon demo
- Shows understanding of fintech regulatory landscape

**Example:**
```json
{
  "requirement-url": "https://www.pcisecuritystandards.org/document_library?category=pcidss&document=pci_dss"
}
```

### 2. Data Classification Fields

Added optional `data-classification` fields to sensitive nodes in payment gateway.

**Rationale:**
- CALM v1.1 supports this field
- Critical for compliance agent analysis
- Demonstrates PCI-DSS scoping

**Classifications used:**
- RESTRICTED: Tokenization service, cardholder data
- CONFIDENTIAL: Transaction database

### 3. Zustand Flat State Pattern

Avoided nested objects in store state - all fields at top level.

**Comparison:**
```typescript
// ❌ Nested approach (harder to update, potential mutation bugs)
interface AnalysisState {
  data: {
    selectedDemoId: string | null;
    rawCalmData: CalmDocument | null;
    analysisInput: AnalysisInput | null;
  };
  status: { ... };
}

// ✅ Flat approach (cleaner, more performant)
interface AnalysisState {
  selectedDemoId: string | null;
  rawCalmData: CalmDocument | null;
  analysisInput: AnalysisInput | null;
  status: AnalysisStatus;
  error: string | null;
}
```

### 4. Future-Ready Status Values

Included `analyzing` and `complete` statuses even though not used in Phase 1.

**Rationale:**
- Avoids breaking changes when adding multi-agent analysis
- Store API remains stable across phases
- Components can be built anticipating future states

## Verification Results

All plan verification criteria met:

1. ✓ Both demo JSON files parse through `parseCalm()` returning success
2. ✓ Trading platform has 10 nodes with 6 different node-types (exceeds 8-10 requirement)
3. ✓ Payment gateway has 8 nodes with 13 PCI-DSS relevant controls
4. ✓ Demo registry exports typed array with 2 entries and metadata
5. ✓ Zustand store manages CalmDocument and AnalysisInput with proper typing
6. ✓ All files compile in TypeScript strict mode (no `any` types)

**Additional Verification:**
- All unique-ids are unique within each file
- All relationship references point to valid node unique-ids
- All flows reference existing relationships
- Trading platform has 6 unique node types
- Payment gateway has 13 distinct controls
- Both files follow CALM v1.1 schema exactly

## Self-Check

Verifying all files and commits exist:

```bash
# Check files exist
[ -f "examples/trading-platform.calm.json" ] && echo "FOUND: examples/trading-platform.calm.json" || echo "MISSING: examples/trading-platform.calm.json"
[ -f "examples/payment-gateway.calm.json" ] && echo "FOUND: examples/payment-gateway.calm.json" || echo "MISSING: examples/payment-gateway.calm.json"
[ -f "examples/index.ts" ] && echo "FOUND: examples/index.ts" || echo "MISSING: examples/index.ts"
[ -f "src/store/analysis-store.ts" ] && echo "FOUND: src/store/analysis-store.ts" || echo "MISSING: src/store/analysis-store.ts"

# Check commits exist
git log --oneline --all | grep -q "20e11d3" && echo "FOUND: 20e11d3" || echo "MISSING: 20e11d3"
git log --oneline --all | grep -q "83eaee1" && echo "FOUND: 83eaee1" || echo "MISSING: 83eaee1"
git log --oneline --all | grep -q "a7055a7" && echo "FOUND: a7055a7" || echo "MISSING: a7055a7"
```

## Self-Check: PASSED

All files created:
- FOUND: examples/trading-platform.calm.json
- FOUND: examples/payment-gateway.calm.json
- FOUND: examples/index.ts
- FOUND: src/store/analysis-store.ts

All commits exist:
- FOUND: 20e11d3 (Task 1: Demo architectures)
- FOUND: 83eaee1 (Task 2: Zustand store)
- FOUND: a7055a7 (Dev dependency)

## Next Steps

This demo data and state management layer is ready for use in:

**Plan 04 (Architecture Visualizer):**
- Load demos from `DEMO_ARCHITECTURES` registry
- Parse demo JSON with `parseCalm()`
- Store parsed data in `useAnalysisStore`
- Render architecture graphs from `analysisInput`

**Phase 2 (Multi-Agent System):**
- Pass `analysisInput` to compliance mapper agent
- Update store status to `analyzing` during agent execution
- Stream agent events to dashboard
- Set status to `complete` when analysis finishes

**Dashboard Components:**
- Architecture selector dropdown from `DEMO_ARCHITECTURES`
- Status indicators from `store.status`
- Error display from `store.error`

**No blocking issues.** Ready to proceed.
