# Phase 6: Polish, Demo Mode & Deployment - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Production-ready hackathon application with guided demo mode, custom CALM file upload with validation, export report functionality, polished animations across all dashboard components, and Vercel deployment. This phase delivers the presentation-ready experience for the DTCC/FINOS hackathon (Feb 23-27, 2026).

</domain>

<decisions>
## Implementation Decisions

### Demo Mode Flow
- "Run Demo" button is a prominent CTA on the landing page hero section
- Clicking transitions directly into the dashboard with the trading platform analysis running
- Dramatic 1-2 second pauses between agent phases so judges can see each agent activate — builds tension
- Critical/high-risk findings get a brief glow animation and a "KEY FINDING" badge in the agent feed
- On completion, a summary card slides in showing overall score and key stats with a prominent "Export Report" button
- Dashboard stays visible behind the summary card

### CALM Upload Experience
- Dedicated drag-and-drop section in the left sidebar, always accessible while viewing the dashboard
- Inline status indicator in the sidebar drop zone: parsing → validating via calm-cli → ready
- Validation errors appear inline with specific line/field information
- Offer 2-3 preset example CALM files via dropdown (e.g., trading platform, simple microservice, data pipeline) so judges can see variety
- Presets are selectable alongside the upload option

### Animation Choreography
- Cinematic and deliberate overall feel — slower, dramatic animations
- Compliance score uses odometer-style digit roll: each digit rolls independently like a slot machine, ones place spins fast, tens place slower
- Score counting animation takes 2-3 seconds with easing
- Cascading animation sequence: sidebar agent dot lights up → feed items slide in → graph nodes color → heat map fills → score updates
- Architecture graph nodes transition from gray to compliance color with smooth CSS transitions
- Agent feed events slide in from right with fade animation
- Heat map cells fade from gray to their color as data arrives
- Pipeline preview code appears line-by-line with syntax highlighting applied per line, short delay between lines

### Export Report
- Executive summary + detailed sections format
- Sections: overall compliance score, architecture summary (nodes, relationships, flows), compliance findings by framework, generated pipeline config, actionable recommendations
- Branded header with CALMGuard logo/name, tagline, analysis date, and architecture name
- Preview rendered report in a modal/panel first, then user confirms download
- Downloads as a .md file

### Claude's Discretion
- Error recovery strategy when calm-cli validation fails on uploaded files (show errors and allow re-upload vs best-effort analysis)
- Exact easing curves and timing values for animations
- Loading skeleton and transition designs between states
- React.memo optimization boundaries
- Vercel deployment configuration details
- Responsive layout adjustments for 1366x768

</decisions>

<specifics>
## Specific Ideas

- Demo should feel like "a real-time system revealing results" — not a static report
- Odometer/slot-machine metaphor for score counting — mechanical, satisfying
- Cascading animation creates a "visual narrative" — each component awakens in sequence
- Summary card at end gives judges a clear "result moment" before they can dig into details
- Report should work for judges who "skim first, then dig in" — TL;DR at top, details below
- Sidebar upload zone means users can always upload without leaving the analysis view

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-polish-demo-mode-deployment*
*Context gathered: 2026-02-24*
