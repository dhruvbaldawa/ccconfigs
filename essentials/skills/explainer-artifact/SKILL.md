---
name: explainer-artifact
description: Turns a debugging/design session into a polished, concept-first Artifact that explains a technical problem and its fix to an engineer who wasn't there. Use when the user asks for an "explainer", to "explain this visually", to make something "easy to understand", to "create an artifact explaining X", for a "walkthrough for the team", or wants a postmortem/incident/design story turned into a shareable page. The deliverable is a published Artifact, not chat text.
---

# Explainer Artifact

## Quickstart

0. Load the `artifact-design` skill — the Artifact tool requires it before writing HTML.
1. Gather the story: problem(s) + root causes, fixes, real evidence, YAGNI decisions, open questions.
2. Identify the audience and every load-bearing concept the story depends on; plan one concept box per mechanism.
3. Structure in dependency order: TL;DR cards → orientation map → problems (symptom → concept → sequence → evidence → insight → fix) → what we didn't build → rollout/open questions.
4. Apply presentation rules: status-chip sequences, terminal-styled evidence, CSS-box diagrams, semantic color, light/dark themes, tables for mappings.
5. Publish via the Artifact tool, hand over the URL, note it's private by default, offer one round of tuning.

## When to Use

**Use when:**
- User asks for an "explainer", "walkthrough", or to "make this easy to understand"
- User wants a postmortem, incident writeup, or design decision turned into a shareable page
- A debugging session or architecture discussion needs to reach someone who wasn't in it
- User explicitly asks for an artifact/page rather than a chat explanation

**Skip when:**
- User wants the raw technical writeup itself (use `writing-documentation` instead)
- The audience already has full context — just needs a decision or a diff (use `explain-diff`-style chat output)
- Nothing was actually debugged or decided yet — there's no story to tell

## The Methodology

### Step 0 — Load artifact-design

The Artifact tool refuses to render well-designed pages without it. Call the `artifact-design` skill before writing a single line of HTML. Do this even if you've written explainer artifacts before in this session — it calibrates design investment per request.

### Step 1 — Gather the story before writing

Pull from the conversation, the repo, and any investigation/agent output. Do not start writing HTML until you have:

- **(a) Problem(s) and root causes** — not just symptoms
- **(b) Fixes and decisions** — what changed and why that option won
- **(c) Real evidence, verbatim** — log lines, command output, error messages, before/after values. Copy them exactly.
- **(d) YAGNI decisions** — what was deliberately not built, and the reason
- **(e) Open questions / human-gated steps** — anything still pending a decision

**Never invent evidence.** If a log line or metric isn't in the transcript or repo, don't fabricate one to fill a box — write "evidence not captured" or omit the claim. A page with one fabricated number is worse than a page with a gap.

### Step 2 — Identify the audience and the load-bearing concepts

Target reader: a competent engineer who lacks the specific domain context — not a novice, not someone who lived through the session.

List every mechanism the story depends on (split-horizon DNS, namespace-scoped secrets, PodDisruptionBudget math, whatever is load-bearing here). For each one, plan a short concept box placed immediately **before** its first use in the narrative — never after, never assumed. One concept per box.

Analogies must be grounded and precise, never cute for cuteness's sake:
- Good: "private hosted zone = a phone book only your VPC can read"
- Bad: "DNS is like a magical address book in the cloud"

If you can't state the analogy in one plain sentence, the concept isn't understood well enough to explain yet — go verify it first.

### Step 3 — Structure in dependency order, not discovery order

The order you discovered things while debugging is almost never the order that teaches them. Restructure:

- **TL;DR cards up top** — one per problem: symptom, one-line cause, one-line fix, sized fix (e.g. "2 lines of config", "1 CLI command")
- **Orientation section ("the map")** — introduce the actors/components before any problem references them
- **Problems in dependency order** — fix A unblocks B unblocks C, not the order you hit them. Each problem follows the same arc: symptom → concept box → step-by-step failure sequence → evidence → key-insight callout → the fix
- **"What we deliberately didn't build"** — rejected alternatives with reasons, so scope decisions read as decisions, not gaps
- **Sequencing/rollout + open questions** — at the end
- **Table of contents** if the page has 5+ sections

### Step 4 — Presentation rules

- Failure walkthroughs as numbered sequence rows with per-step status chips (OK / FAIL / stuck). Make the failing steps visually distinct — don't rely on the chip text alone.
- Evidence in terminal-styled monospace blocks. Highlight the smoking-gun values — wrong vs. right, side by side — don't bury them in a wall of output.
- Diagrams built from HTML/CSS boxes plus flex/grid (namespace boxes, two-world split panels). Not hand-authored SVG paths. Every wide element (tables, diagrams, code blocks) gets `overflow-x: auto`.
- Semantic color (good/bad/warn) kept separate from the page's accent color. Both themes supported via CSS custom properties — `prefers-color-scheme` as the default plus `:root[data-theme="dark"|"light"]` overrides.
- Tables for enumerable mappings (persona → permissions); prose for reasoning and narrative.
- End with a pointer to the authoritative detailed doc (plan file, runbook, PR). The artifact explains — it doesn't replace the spec.

### Step 5 — Publish and report

1. Write the HTML to the scratchpad directory.
2. Publish with the `Artifact` tool: stable favicon (1-2 emoji, keep it across redeploys), a one-sentence `description`.
3. Give the user the URL. Note it's private by default.
4. Offer one round of audience-tuning — shorter for a share-out, deeper on a specific section — before considering it done.

## Worked Example

A compact pass through the full arc, for one problem inside a larger page:

> **Symptom:** "New pods time out calling `payments-api.internal`; old pods on the same node work fine."
>
> **Concept box** (placed right before the sequence): "Split-horizon DNS — the same hostname resolves differently depending on where the query comes from. A private hosted zone is a phone book only your VPC can read; anyone outside gets a different book, or no book at all."
>
> **Failure sequence:**
> | # | Step | Status |
> |---|------|--------|
> | 1 | Pod starts, reads `resolv.conf` | OK |
> | 2 | Pod queries `payments-api.internal` | OK |
> | 3 | VPC resolver forwards to the *public* hosted zone | FAIL |
> | 4 | Public zone returns NXDOMAIN | FAIL |
> | 5 | Pod's retry loop times out after 30s | stuck |
>
> **Evidence:**
> ```
> $ dig payments-api.internal
> ;; ->>HEADER<<- status: NXDOMAIN
>
> # expected (private zone):
> ;; ANSWER SECTION:
> payments-api.internal. 300 IN A 10.20.4.17
> ```
>
> **Key insight:** New pods landed in a subnet whose VPC was never associated with the private hosted zone — the zone association, not the pod or the service, was the missing piece.
>
> **Fix:** `aws route53 associate-vpc-with-hosted-zone` for the new subnet's VPC. One CLI command, not a code change.

Notice the concept box teaches split-horizon DNS *before* the sequence uses the term, the sequence isolates exactly where it breaks, the evidence shows wrong-vs-right side by side, and the fix is sized so the reader knows how big a deal this was.

## Quality Checklist

Before publishing:

- [ ] `artifact-design` skill loaded before writing HTML
- [ ] Every evidence block is verbatim from the transcript/repo, or explicitly marked as missing
- [ ] Every load-bearing concept has a box placed before its first use, with a precise (non-cute) analogy
- [ ] TL;DR cards exist, one per problem, each with symptom/cause/fix/size
- [ ] Orientation section introduces actors before problems reference them
- [ ] Problems ordered by dependency, not discovery order
- [ ] "What we didn't build" section present if any scope was deliberately cut
- [ ] Diagrams are HTML/CSS boxes, not hand-drawn SVG; wide elements scroll via `overflow-x: auto`
- [ ] Light and dark themes both styled; semantic color separate from accent color
- [ ] Page links to the authoritative doc (plan/runbook/PR) instead of duplicating it
- [ ] Published with a stable favicon and one-sentence description; URL and privacy note given to the user

## Common Pitfalls

- **Writing in discovery order.** The debugging session's chronology is not the reader's learning path — restructure by dependency (Step 3).
- **Concept boxes placed after first use, or missing entirely.** The reader hits an unexplained term and stalls.
- **Fabricated evidence.** If you don't have the real log line, say so — don't invent a plausible-looking one.
- **Cute analogies that don't hold up.** If the analogy breaks under one follow-up question, it's decorative, not explanatory. Cut it.
- **Hand-rolled SVG diagrams.** Slower to write, harder to theme, harder to make responsive than CSS boxes.
- **Treating "what we didn't build" as optional.** Without it, deliberate scope cuts read as oversights to the next reader.
- **Shipping without the audience-tuning offer.** The first draft is rarely the final share-out version — always offer the second pass.
