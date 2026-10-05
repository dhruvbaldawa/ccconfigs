---
name: wait-what
description: Stop. That last message did not land — re-pitch it. Use when the user says "wait, what", "you lost me", "I don't follow", or otherwise signals the previous explanation failed.
disable-model-invocation: true
---

Wait — I don't understand where you've got to here. Re-pitch that:

- Give me a little bit of context first. Assume the thread of your reasoning did not survive the jump to me.
- Talk in ASD-STE100 Simplified Technical English: one idea per sentence, active voice, short sentences, no jargon that isn't load-bearing.
- Use the project's own vocabulary — the terms already established in this conversation, in `CLAUDE.md`, in a glossary if the repo has one, or in the code itself. Don't invent new names for things that already have names.

Do not repeat the previous message louder. Find the step I fell off at and start from there.

---

_Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT)._
