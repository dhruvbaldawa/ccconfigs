# Root Cause Analysis Framework

Advanced techniques for identifying fundamental causes rather than symptoms.

## The 5 Whys (Applied to Code)

Ask "why" iteratively to drill down from symptom to root cause.

### Example: Null Pointer Exception

1. Why does the null pointer exception occur?
   → `user.getEmail()` is called on a null user object
2. Why is the user object null?
   → `findUserById()` returns null when no user is found
3. Why does `findUserById()` return null instead of throwing?
   → Original design used null to indicate "not found"
4. Why wasn't this caught earlier in the call chain?
   → Calling code doesn't check for null before using the user
5. Why doesn't the calling code check for null?
   → API contract is ambiguous about null as a valid return value

Root cause: Ambiguous API contract leads to inconsistent null handling.
Proper fix: Define and enforce a clear API contract (Optional/exception/documented null).

## Architectural Analysis Method

When bugs suggest deeper design issues, analyze architecture systematically.

1. Map components: interactions, data flows, boundaries
2. Identify assumptions (inputs, state, timing, external systems)
3. Find assumption mismatches between components
4. Choose architectural fix over workaround when systemic

Use `codebase_search` prompts like:
- "How does ComponentA communicate with ComponentB?"
- "What data flows from Source to Destination?"

## Data Flow Tracing

Trace transformations to locate where data goes wrong.

- Backward tracing: start at observation point → immediate source → transformation → origin
- Forward tracing: origin → each transformation → final state
- At each step compare expected vs actual state

Common root causes:
- Missing validation
- Incorrect transformation logic
- Lost context/metadata
- Race conditions
- Type/encoding mismatch

## State Analysis Patterns

Investigate state transitions and invariants.

- Uninitialized state: used before proper setup
- Stale state: cache invalidation/refresh failures
- Inconsistent state: related data out of sync (needs atomicity)
- Invalid state: invariants not enforced (add validation/assertions)
- Concurrent corruption: missing synchronization/immutability

## Integration Point Analysis

Verify integration contracts at boundaries.

- Data format: actual vs expected
- Protocol/version: compatibility and usage
- Timing: sync vs async, timeouts, ordering
- Error handling: propagation and retries
- AuthZ/AuthN: credentials, validation, failure behavior

Root cause patterns:
- Mismatched versions
- Incomplete error handling
- Configuration mismatch
- Network constraints

## Dependency Chain Analysis

Map direct, transitive, and hidden dependencies.

- Version conflicts (multiple versions)
- Missing dependencies (runtime load failures)
- Initialization order issues
- Circular dependencies

Use `codebase_search`:
- "What imports/uses ComponentX?"
- "What does ComponentX depend on?"

## Performance Root Cause Analysis

Identify bottlenecks systematically.

1. Measure first (profile under realistic load)
2. Check algorithmic complexity and hotspots
3. Analyze resource usage (CPU, memory, I/O, network)
4. Classify cause: algorithm, implementation, contention, external

Fix strategies:
- Algorithmic improvements
- Caching/batching
- Lazy loading
- Parallelization/asynchronous I/O

## Sequential Thinking Templates

Use `SequentialThinking:process_thought` to structure complex analysis.

Thought 1 - Problem Definition
- Symptom, context, confirmed facts, unknowns

Thought 2 - Hypotheses
- 3–5 candidates, assumptions, likelihood ranking

Thought 3 - Evidence
- For/against each hypothesis; challenge assumptions

Thought 4 - Selection
- Pick most likely; rationale; confidence

Thought 5 - Verification
- Predictions, test plan, alternatives if wrong
