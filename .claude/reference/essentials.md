# The Essentials Plugin

## Slash Commands

**`/optimize-doc [DOCUMENT]`**: Optimizes documentation for conciseness and clarity. Strengthens vague instructions, removes redundancy while preserving correctness. Can run idempotently - multiple passes won't degrade quality.

**`/catchup`**: Summarizes all changes between the current branch and main (haiku).

Planning and execution go through the **technical-planning** skill and **conveyor**; there are no separate plan/execute commands.

## Skills

**debugging**: Systematic debugging using UNDERSTAND methodology (10-step checklist). Focuses on root cause analysis over symptom treatment. Includes antipattern awareness and reference materials on common debugging failures.

**technical-planning**: Risk-first development methodology with Last Responsible Moment decision-making. Four-phase approach: Requirements & Risk Analysis, Milestone Planning, Implementation Strategy, Execution Framework. Emphasizes "what" over "how", defers implementation decisions until execution, manages deferral explicitly, and addresses highest-risk challenges first. Includes decision timing framework (what to decide early vs. defer), task breakdown guidelines (outcome-focused vs. prescriptive), and decision framework for handling unclear requirements.

**conveyor**: Milestone execution loop (v2). The orchestrator session seeds a milestone from PLAN.md: it slices it into 1–3-commit slices, asks seven seed questions (execution, reviewers, review timing, rounds cap, extra skills, their timing, push), pre-flights the commit tier, the pre-commit hook and the permission allowlist, then copies the canonical `essentials/skills/conveyor/workflow.js` to `.conveyor/<milestone>/` and launches it only by `scriptPath` (args in `args.json`; `reference/workflow-skeleton.md` documents them). Per slice: `essentials:implementer` commits through the pre-commit hook (the only check gate, no commit agent), an optional simplify pass commits its own edits, the reviewers (plus optional security-audit) review the commit range and hook log, and `essentials:fixer` answers blocking findings with new commits up to the rounds cap. Milestone end: optional `Run check:` tier with a fix loop, optional simplify, milestone review. The orchestrator watches with `scripts/watch-run.ts` under Monitor (started/finished/stall/long events; the 30-min re-arm is the cache heartbeat), is the only writer of `context.md` (Code standards copied from `~/.claude/rules/` and the repo CLAUDE.md for the agents that run without them, Mechanics, Decisions, Open questions, Environment facts; history in `log.md`), pushes approved slices and the final head by explicit sha, and never messages a running workflow agent (anthropics/claude-code#93797). Exceptions (question, blocked, rounds cap, aged findings, no-progress, rejection without blockers, null agents, run check red) end the run early; interventions change args (usually an answer keyed to the label of the call that should hear it) and resume, which replays every earlier call from cache.

**grill-me**: Relentless interview that maps a plan as a **design tree** and works it in **rounds**. The **frontier** is every decision whose prerequisites are settled; ask the whole frontier per round (multiple AskUserQuestion calls if wider than 4), never a question that depends on one still open in the same round. Each round's answers push the frontier outward. Finding facts is the agent's job — explore the codebase, dispatch a sub-agent for broad lookups, and don't block: only questions downstream of a running exploration wait. Decisions stay the user's. Done when the frontier is empty; don't act until the user confirms shared understanding.

**codebase-design**: Shared vocabulary for designing **deep modules** — a lot of behaviour behind a small interface, at a clean seam, testable through that interface. Fixes the glossary (module, interface, implementation, depth, seam, adapter, leverage, locality) and bans substitutes (component, service, API, boundary). Principles: depth is a property of the interface not the implementation; the deletion test; the interface is the test surface; one adapter = hypothetical seam, two = real. `reference/deepening.md` covers dependency categories (in-process, local-substitutable, ports & adapters, mock) and replace-don't-layer testing; `reference/design-it-twice.md` is the parallel sub-agent pattern for exploring 3+ radically different interfaces.

**improve-codebase-architecture**: Scans for deepening opportunities (scoped by git hot spots unless the user names a direction), renders them as a self-contained Tailwind + Mermaid HTML report in the OS temp dir with before/after diagrams and strength badges, then runs `essentials:grill-me` on whichever candidate the user picks. Local temp file by design — hand off to `essentials:explainer-artifact` to share. `reference/html-report.md` holds the scaffold, five diagram patterns, and the vocabulary discipline.

**prototype**: Throwaway code that answers one design question. Branches on the question: state/logic → `reference/logic.md` (one shareable HTML file, pure liftable logic module, free-play buttons plus tabbed guided walkthroughs a non-developer can drive); what-should-this-look-like → `reference/ui.md` (3 structurally different variants on one route behind `?variant=`, floating switcher, hidden in production). Shared rules: throwaway and marked as such, trivial to run, no persistence, no tests, surface the state, capture the answer and park the prototype on a throwaway branch.

**teach**: Stateful multi-session learning workspace — `MISSION.md` (why), `RESOURCES.md` (trusted sources + communities), `GLOSSARY.md`, numbered `learning-records/`, HTML `lessons/` built from reusable `assets/`, and printable `reference/`. Splits fluency strength from storage strength and designs for the latter via retrieval practice, spacing, and interleaving; targets the zone of proximal development from the learning records. Knowledge from trusted sources only (never parametric), skills through tight feedback loops, wisdom delegated to communities. Four format docs under `reference/`.

**handoff**: Compacts the conversation into a handoff document in the OS temp dir — goal, verified-vs-assumed state, decisions with reasoning, open threads, gotchas, and a suggested-skills section. References existing artifacts by path rather than duplicating them; redacts secrets. Takes an argument describing what the next session will focus on.

**wait-what**: The last message did not land. Re-pitch it with context, in ASD-STE100 Simplified Technical English, using the project's established vocabulary — starting from the step the user fell off at, not louder.

**retro**: Retrospective on a coding session (current by default, or one named from session logs) that proposes improvements to the agent's *environment*, not the code: navigation pointers, automated checks and guardrails (mechanical violations get a deterministic check, not a rule), reviewer coding standards, oversized CLAUDE.md, tool economy, no-op instructions, information access. Candidates presented in order of severity. User-invoked only.

**explainer-artifact**: Turns a debugging or design session into a concept-first Artifact for an engineer who wasn't there. Also has a change-walkthrough mode for a commit, PR, or branch: background, intuition, code walkthrough, verification, alternatives, and a quiz.

**writing-documentation**: Strunk & White principles applied to technical documentation.

**pr**: PR body template — Summary (smallest useful visual: pseudocode, call/component/file tree, Mermaid, or diff-sketch), Evidence (before/after; screenshots or test output), Merge Danger (one-way vs two-way door, blast radius). Credits Dex Horthy's `show-me` via mattpocock/skills.

## Agents

**senior-engineer-reviewer** (claude-opus-5-5, medium): Brutal architecture/maintainability review with a round-aware contract — first review judges the diff against the whole repo; re-reviews are delta-only against prior findings. Verdicts on the shared reviewer scale: REJECT / NEEDS WORK / APPROVED WITH RESERVATIONS / SHIP IT — approved means the last two. Reviews the commit range plus the hook log; writes only scratch files in the task workspace, never context.md or the code under review. Half of the conveyor review gate.

**test-reviewer** (claude-sonnet-5-5, medium): Brutal test-quality review — useless tests, flaky patterns, missing assertions, isolation failures; same round-aware contract. Verdicts on the same shared scale: REJECT / NEEDS WORK / APPROVED WITH RESERVATIONS / SHIP IT — approved means the last two. The other half of the gate.

**implementer** (claude-sonnet-5-5, tools allowlist without ListAgents/Agent/Workflow, omitClaudeMd): Implements one conveyor slice. Reads the workspace context.md first, asks before building (status `question` before any edit), writes each test red-first, commits the planned commits through the pre-commit hook, and reports status, shas, hookLog, redEvidence, extraFiles, facts, decisions and questions. Messages only "main".

**fixer** (claude-sonnet-5-5, same allowlist, omitClaudeMd): Fixes exactly the blocking review findings on a slice, one new commit per finding through the hook, scoped to the named files and their tests; maps finding ids to shas in its report.

## Research

There is no research command or agent. Use the built-in `/deep-research` for cited multi-source research, and WebSearch/WebFetch or the `mcp` plugin's gateway tools (Context7, Parallel, Brave) for quick lookups.
