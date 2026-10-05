---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
---

Interview the user relentlessly until you reach a shared understanding. Map the plan as a **design tree**: every decision branches into the decisions that hang off it.

## Work the tree in rounds

The **frontier** is every decision whose prerequisites are already settled — the questions you can ask *now* without guessing at answers you haven't heard yet. Ask the whole frontier in one round, then wait for the user's answers before the next round.

A question whose answer depends on another question still open in this round belongs to a *later* round, not this one. Don't smuggle it in.

Each round's answers reshape the tree — settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round.

## Asking

Use the AskUserQuestion tool. For each question:

- Give 2-4 concrete options, with your recommended answer marked `(Recommended)`.
- Keep headers short (e.g. "Scope", "Auth", "Storage").
- Batch related questions together, up to 4 per call. If the frontier is wider than 4, make several calls in the same round rather than deferring questions to a later one.

## Finding facts is your job, never the user's

If a question can be answered by exploring the codebase, explore the codebase instead of asking. For a broad lookup, dispatch a sub-agent.

Don't block on it: a running exploration is an unsettled prerequisite, so only the questions *downstream* of it wait for the answer — ask the rest of the frontier now.

The **decisions** are the user's. Put each one to them and wait.

## Done

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Do not act on the plan until the user confirms you have reached a shared understanding.

---

_Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT)._
