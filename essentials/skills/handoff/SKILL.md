---
name: handoff
description: Compact the current conversation into a handoff document for another agent to pick up. Use when context is running out, when switching machines or sessions, or when delegating in-progress work.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---

Write a handoff document summarising the current conversation so a fresh agent can continue the work. Save it to the OS temporary directory (`$TMPDIR`, falling back to `/tmp`) — never the current workspace. Report the absolute path.

Include a **suggested skills** section naming the skills the next agent should invoke, and why.

Do not duplicate content already captured in other artifacts — specs, plans, task files, ADRs, issues, commits, diffs. Reference them by path or URL instead. The handoff is a pointer document plus the reasoning that isn't written down anywhere else.

Capture, at minimum:

- **Goal** — what the work is trying to achieve, in the user's terms.
- **State** — what is done, what is in progress, what is untouched. Be honest about what was verified versus assumed.
- **Decisions made** — with the reasoning, especially where an obvious-looking alternative was rejected.
- **Open threads** — questions the user hasn't answered, things deliberately deferred.
- **Gotchas** — anything the next agent would waste time rediscovering.

Redact sensitive information: API keys, tokens, passwords, personally identifiable information.

If the user passed arguments, treat them as a description of what the next session will focus on and tailor the document accordingly — drop the parts of the history that don't bear on it.

---

_Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT)._
