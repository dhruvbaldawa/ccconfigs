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
{{Step-by-step instructions for implementation agent:

1. Read **{{existing-file.ts}}** to understand patterns
2. Create **{{new-file.ts}}** with {{functionality}}
3. Implement {{core logic}}
4. Add {{error handling, validation, etc.}}
5. Write tests in **{{test-file.test.ts}}**:
   - {{Test case 1}}
   - {{Test case 2}}
   - {{Edge cases}}
6. Run full test suite: {{test command}}
}}
</prompt>

## Notes

**planning-agent:** {{Initial context, patterns to follow, gotchas, when to mark as Stuck}}
