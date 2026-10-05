---
name: debugging
description: Systematic debugging that identifies root causes rather than treating symptoms. Uses structured multi-hypothesis reasoning for complex analysis, web search for research, and structured investigation to avoid circular reasoning and whack-a-mole fixes.
---

# Debugging

## Quickstart

1. Capture exact repro, scope, and recent changes
2. Isolate components/files; trace path to failure
3. Research exact error; check official docs
4. Compare failing vs working patterns; form a testable hypothesis
5. Verify with minimal test; apply minimal fix across all instances; validate

## When to Use This Skill

Use debugging when:
- A bug has no obvious cause or has been "fixed" before but returned
- Error messages are unclear or misleading
- Multiple attempted fixes have failed
- The issue might affect multiple locations in the codebase
- Understanding the root cause is critical for proper resolution

Skip this skill for:
- Simple syntax errors with obvious fixes
- Trivial typos or missing imports
- Well-understood, isolated bugs with clear solutions

## Core Anti-Patterns to Avoid

Based on documented failures in AI debugging, explicitly avoid:

1. **Circular Reasoning**: Never propose the same fix twice without learning why it failed
2. **Premature Victory**: Always verify fixes were actually implemented and work
3. **Pattern Amnesia**: Maintain awareness of established code patterns throughout the session
4. **Symptom Chasing**: Resist fixing error messages without understanding root causes
5. **Implementation Before Understanding**: Never jump to code changes before examining existing patterns

## Tool Decision Tree

- Know exact text/symbol? → Grep
- Need conceptual location or a broad sweep? → Explore agent
- Need full file context? → Read
- Unfamiliar error/behavior? → Context7, then WebSearch / Parallel Search
- Complex multi-hypothesis analysis? → reference/root-cause-framework.md templates

## Decision Framework

**IF** same fix proposed twice → Stop; work through the sequential thinking templates (reference/root-cause-framework.md)
**IF** error is unclear → Research via WebSearch → Parallel Search; verify with docs
**IF** area is unfamiliar → Explore with the Explore agent or Grep; don't guess
**IF** fix seems too easy → Confirm it addresses root cause (not symptom)
**IF** multiple hypotheses exist → Evaluate explicitly (evidence for/against)
**IF** similar code works → Find and diff via Grep and Read
**IF** declaring success → Show changed lines; test fail-before/pass-after
**IF** fix spans multiple files → Search and patch all occurrences
**IF** library behavior assumed → Check Context7 (resolve-library-id → query-docs)

## Quality Checks Before Finishing

Before declaring a bug fixed, verify:

- [ ] Root cause identified and documented
- [ ] Fix addresses cause, not symptom
- [ ] All occurrences fixed (searched project-wide)
- [ ] Follows existing code patterns
- [ ] Original symptom eliminated
- [ ] No regressions introduced
- [ ] Tests/logs verify under relevant conditions
- [ ] Docs/tests updated (comments, docs, regression tests)

## References

- `reference/root-cause-framework.md`
- `reference/antipatterns.md`
