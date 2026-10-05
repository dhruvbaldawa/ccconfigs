---
name: improve-codebase-architecture
description: Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick. Use when the user wants an architecture review, asks where the codebase is getting hard to change, or wants to find refactoring candidates.
disable-model-invocation: true
---

# Improve Codebase Architecture

Surface architectural friction and propose **deepening opportunities** — refactors that turn shallow modules into deep ones. The aim is testability and AI-navigability.

This skill is built on a shared design vocabulary: read the `essentials:codebase-design` skill for the terms (**module**, **interface**, **depth**, **seam**, **adapter**, **leverage**, **locality**) and its principles (the deletion test, "the interface is the test surface", "one adapter = hypothetical seam, two = real"). Use those terms exactly in every suggestion — don't drift into "component," "service," "API," or "boundary."

## Process

### 1. Explore

**Scope before you scan — YAGNI.** Deepening a module pays off by making future changes to it easier, so put extra weight on the parts of the codebase that have recently changed. Decide *where* to look before you look:

- If the user named a direction — a module, a subsystem, a pain point — take it, and skip the inference below.
- Otherwise, walk back a good stretch of the commit history (`git log --oneline`) to find the codebase's hot spots — the files and areas that keep coming up — and let those paths pull your attention first. If the changes are scattered with no clear hot spot, widen the net.

Read whatever the project already uses to name things — `CLAUDE.md`, a README glossary, ADRs under `docs/adr/` if they exist — before touching the area. Decisions already recorded are not up for re-litigation here.

Then walk the codebase. Don't follow rigid heuristics — explore organically and note where you experience friction:

- Where does understanding one concept require bouncing between many small modules?
- Where are modules **shallow** — interface nearly as complex as the implementation?
- Where have pure functions been extracted just for testability, but the real bugs hide in how they're called (no **locality**)?
- Where do tightly-coupled modules leak across their seams?
- Which parts of the codebase are untested, or hard to test through their current interface?

Apply the **deletion test** to anything you suspect is shallow: would deleting it concentrate complexity, or just move it? A "yes, concentrates" is the signal you want.

### 2. Present candidates as an HTML report

Write a self-contained HTML file to the OS temp directory so nothing lands in the repo. Resolve the temp dir from `$TMPDIR`, falling back to `/tmp` (or `%TEMP%` on Windows), and write to `<tmpdir>/architecture-review-<timestamp>.html` so each run gets a fresh file. Open it for the user — `xdg-open <path>` on Linux, `open <path>` on macOS, `start <path>` on Windows — and tell them the absolute path.

The report uses **Tailwind via CDN** for layout and styling, and **Mermaid via CDN** for diagrams where a graph/flow/sequence reliably communicates the structure. Mix Mermaid with hand-crafted CSS/SVG visuals — use Mermaid when relationships are graph-shaped (call graphs, dependencies, sequences), and hand-built divs/SVG when you want something more editorial (mass diagrams, cross-sections, collapse animations). Each candidate gets a **before/after visualisation**. Be visual.

For each candidate, render a card with:

- **Files** — which files/modules are involved
- **Problem** — why the current architecture is causing friction
- **Solution** — plain English description of what would change
- **Benefits** — explained in terms of locality and leverage, and how tests would improve
- **Before / After diagram** — side-by-side, custom-drawn, illustrating the shallowness and the deepening
- **Recommendation strength** — one of `Strong`, `Worth exploring`, `Speculative`, rendered as a badge

End the report with a **Top recommendation** section: which candidate you'd tackle first and why.

**Use the project's own vocabulary for the domain, and the `essentials:codebase-design` vocabulary for the architecture.** If the codebase calls it an "Order," talk about "the Order intake module" — not "the FooBarHandler," and not "the Order service."

**ADR conflicts**: if a candidate contradicts an existing ADR, only surface it when the friction is real enough to warrant revisiting the ADR. Mark it clearly in the card (e.g. a warning callout: _"contradicts ADR-0007 — but worth reopening because…"_). Don't list every theoretical refactor an ADR forbids.

See [reference/html-report.md](reference/html-report.md) for the full HTML scaffold, diagram patterns, and styling guidance.

The report is a local temp file on purpose — an architecture review of a private repo shouldn't be published by default. If the user wants to share it with the team, hand off to the `essentials:explainer-artifact` skill rather than publishing this file.

Do NOT propose interfaces yet. After the file is written, ask the user: "Which of these would you like to explore?"

### 3. Grilling loop

Once the user picks a candidate, run the `essentials:grill-me` skill to walk the decision tree with them — constraints, dependencies, the shape of the deepened module, what sits behind the seam, what tests survive.

Two side effects happen inline as decisions crystallize:

- **Want to explore alternative interfaces for the deepened module?** Use the design-it-twice parallel sub-agent pattern in the `essentials:codebase-design` skill.
- **User rejects the candidate with a load-bearing reason?** Offer an ADR, framed as: _"Want me to record this as an ADR so future architecture reviews don't re-suggest it?"_ Only offer when the reason would actually be needed by a future explorer to avoid re-suggesting the same thing — skip ephemeral reasons ("not worth it right now") and self-evident ones.

---

_Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT)._
