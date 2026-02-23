---
status: resolved
trigger: "Investigate why the architecture graph in the Overview page looks cramped and not navigable in its card panel."
created: 2026-02-24T00:00:00Z
updated: 2026-02-24T00:00:00Z
---

## Current Focus

hypothesis: The card container is too short (300px) while the graph component requests min-h-[400px], and the MiniMap+Controls consume significant space in the cramped viewport
test: Compare Overview card container vs Architecture page container
expecting: Architecture page works fine because it uses calc(100vh-12rem) (~full height)
next_action: Report root cause

## Symptoms

expected: Graph should be navigable, nodes visible, pan/zoom usable
actual: Graph is constrained in a ~300px tall card panel, cramped and hard to navigate
errors: none
reproduction: Load architecture, view Overview page
started: Since implementation

## Eliminated

(none needed - root cause found on first pass)

## Evidence

- timestamp: 2026-02-24
  checked: src/app/dashboard/page.tsx line 71
  found: Card wraps graph in `h-[300px]` fixed container
  implication: Graph is forced into 300px height regardless of content

- timestamp: 2026-02-24
  checked: src/components/graph/architecture-graph.tsx line 88
  found: Graph wrapper div uses `min-h-[400px]` but parent constrains to 300px, so min-h is ignored due to overflow:hidden on the Card
  implication: The graph requests 400px minimum but gets 300px — 100px of content is clipped

- timestamp: 2026-02-24
  checked: src/app/dashboard/page.tsx line 70
  found: Card has `overflow-hidden` class
  implication: The graph's min-h-[400px] is silently clipped to 300px

- timestamp: 2026-02-24
  checked: src/app/dashboard/architecture/page.tsx line 25
  found: Architecture page uses `h-[calc(100vh-12rem)]` — much larger container
  implication: Same component works fine when given adequate space

- timestamp: 2026-02-24
  checked: architecture-graph.tsx lines 102-119
  found: MiniMap and Controls are rendered inside the 300px space, consuming ~80-100px of already cramped viewport
  implication: MiniMap is counter-productive in a small card — it takes space from the actual graph

- timestamp: 2026-02-24
  checked: layout.ts lines 4-6
  found: NODE_WIDTH=180, NODE_HEIGHT=72, dagre ranksep=80, nodesep=40
  implication: Even a simple 3-node graph needs ~300px+ height for dagre layout; trust boundaries add more

## Resolution

root_cause: Three compounding issues — (1) the card container is fixed at 300px height while the graph component needs minimum 400px, (2) overflow-hidden on the Card clips the graph silently, and (3) MiniMap+Controls consume significant space within the already cramped 300px, leaving the actual node viewport severely undersized
fix: (pending user action)
verification: (pending)
files_changed: []
