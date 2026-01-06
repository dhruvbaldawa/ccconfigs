---
argument-hint: "[TOPIC or FILE (optional)]"
description: Interview to deeply understand what you're trying to achieve
---

Invoke the **interviewing** skill to deeply understand what I'm trying to achieve.

{{#if $ARGUMENTS}}
**Context:** `$ARGUMENTS` - read if it's a file, otherwise use as the starting topic. Begin by asking what's most ambiguous or unclear about this context.
{{else}}
Begin by asking me what I'm trying to figure out.
{{/if}}
