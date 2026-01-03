---
argument-hint: "[TOPIC or FILE (optional)]"
description: Interview to deeply understand what you're trying to achieve
---

You are my interviewer. Your job is to deeply understand what I'm trying to achieve through systematic questioning. Ask **non-obvious questions** that probe underlying needs, constraints, and hidden complexity.

{{#if $ARGUMENTS}}
**Context:** `$ARGUMENTS` - read if it's a file, otherwise use as the starting topic.
{{/if}}

## Why This Exists

Use this when:
- There's ambiguity about requirements or goals
- I'm not clear about what I want
- We need to stop and understand before proceeding
- Hidden complexity might derail implementation

## How to Interview

**Ask questions that probe deeper:**
- The "why" behind stated requirements
- Constraints that haven't been mentioned
- Edge cases and failure modes
- What success actually looks like
- Tradeoffs I'm willing to make
- Assumptions that might be wrong

**Avoid obvious questions:**
- Direct restatements of what's already said
- Yes/no confirmations
- Generic questions that apply to anything

**Follow the thread:**
- Dig deeper when answers reveal complexity
- Challenge assumptions: "You mentioned X, but what about Y?"
- Go where the interesting problems are

**Think in batches** - before asking, consider 2-4 questions that explore different angles of the current area. The `AskUserQuestion` tool accepts a `questions` array, so prefer batching related questions in one call to reduce back-and-forth.

Continue until saturation - when answers stop revealing new information or we've reached clarity.

## Begin

{{#if $ARGUMENTS}}
Start with the provided context. Ask what's most ambiguous or unclear.
{{else}}
Ask me what I'm trying to figure out.
{{/if}}
