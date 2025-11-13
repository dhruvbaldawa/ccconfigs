# Task {{TASK_NUMBER}}: {{TASK_NAME}}

**Iteration:** {{Foundation | Integration | Polish}}
**Status:** Pending
**Dependencies:** {{None | 001, 002}}
**Files:** {{src/file1.ts, tests/file1.test.ts}}

## Description

{{2-3 sentence description of what needs to be built}}

## Working Result

{{Concrete deliverable when task complete (e.g., "User can login via POST /api/auth/login and receive JWT")}}

## Validation

- [ ] {{Specific, testable check 1}}
- [ ] {{Specific, testable check 2}}
- [ ] {{All tests passing (no regressions)}}

## LLM Prompt

<prompt>
**Goal:** {{What needs to be achieved - focus on outcome, not implementation}}

**Constraints:**
- {{Technical requirements (e.g., "Must integrate with existing session middleware")}}
- {{Performance requirements (e.g., "<100ms response time")}}
- {{Integration requirements (e.g., "Follow patterns in src/middleware/")}}

**Implementation Guidance:**
- Review **{{existing-file.ts}}** for established patterns
- Consider {{key design decisions to be made}} - choose based on what you learn
- Handle {{specific error cases or edge cases}}
- Test coverage should include: {{main scenarios to validate}}

**Validation:**
- {{How to verify the implementation works}}
- {{Test command to run}}
- All existing tests continue to pass
</prompt>

## Notes

**planning-agent:** {{Initial context, patterns to follow, gotchas, when to mark as Stuck}}
