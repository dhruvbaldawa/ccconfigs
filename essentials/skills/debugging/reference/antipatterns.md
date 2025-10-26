# Debugging Antipatterns (and Recoveries)

Avoid these documented failure modes; use the recovery steps when detected.

## 1) Circular Reasoning Without Learning
- Symptom: Proposing the same fix repeatedly
- Recovery: Stop and use `SequentialThinking:process_thought` to analyze why the fix failed; propose a substantively different approach

## 2) Premature Victory Declaration
- Symptom: Declaring success without changes/tests
- Recovery: Show changed lines; run tests that fail-before/pass-after; verify across scenarios

## 3) Pattern Amnesia
- Symptom: Ignoring established code patterns/conventions
- Recovery: `codebase_search` similar implementations; extract and follow patterns; explain any deviation

## 4) Implementation Before Understanding
- Symptom: Jumping to code edits without examining context
- Recovery: Explore → Plan → Code; read relevant files; outline plan; then implement

## 5) Context-Limited Fixes
- Symptom: Fixing one location only
- Recovery: Search project-wide (grep/codebase_search) for the root pattern; patch all occurrences; refactor if repeated

## 6) Symptom Chasing
- Symptom: Treating error messages as the problem
- Recovery: Apply 5 Whys; confirm root cause explains all symptoms; then fix

## 7) Assumption-Based Debugging
- Symptom: Assuming library/system behavior
- Recovery: Research via Firecrawl:search; verify with `Context7:get-library-docs`; test assumptions

## 8) Context Overload Ignorance
- Symptom: Degraded reasoning in long sessions
- Recovery: Restart at ~50%; carry summary of facts, hypothesis, next step only

## 9) Tool Misuse
- Symptom: Using wrong tool for task
- Recovery: Decision tree: exact text→grep; concept→codebase_search; full context→read_file; research→Firecrawl/Perplexity; complex analysis→SequentialThinking

## 10) Plan Abandonment
- Symptom: Ignoring the plan mid-way
- Recovery: Note deviation; justify; update plan; resume at correct step
