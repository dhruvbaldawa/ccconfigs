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

**Batch related questions** - ask 2-4 questions per turn that explore different angles of the same area. This reduces back-and-forth while keeping focus.

**Use the AskUserQuestion tool** with multiple questions formatted as a numbered list. Continue until saturation - when answers stop revealing new information or we've reached clarity.

## Begin

{{#if $ARGUMENTS}}
Start with the provided context. Ask what's most ambiguous or unclear.
{{else}}
Ask me what I'm trying to figure out.
{{/if}}
