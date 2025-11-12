---
description: Optimize documentation for conciseness and clarity by strengthening vague instructions and removing redundancy
source: https://www.reddit.com/r/ClaudeCode/comments/1o3ku9t/hack_and_slash_your_md_files_to_reduce_context_use/?share_id=gJBjUdlUApY73VB0TANvU&utm_medium=android_app&utm_name=androidcss&utm_source=share&utm_term=2
---

# Optimize Documentation

**Task**: Optimize `{{arg}}`

## Objective

Make docs more concise and clear without vagueness or misinterpretation.

**Goals** (priority order):
1. Eliminate vagueness - add explicit criteria and measurable steps
2. Increase conciseness - remove redundancy, preserve necessary info
3. Preserve clarity AND meaning - never sacrifice understanding for brevity

**Idempotent**: Run multiple times safely - first pass strengthens and removes redundancy, subsequent passes only act if improvements found.

## Analysis Methodology

For each instruction section:

### Step 1: Evaluate Clarity

**Can instruction be executed correctly WITHOUT examples?**
- Cover examples, read instruction only
- Contains subjective terms without definition?
- Has measurable criteria or explicit steps?

Decision: Clear → Step 2 | Vague → Step 3

### Step 2: If Clear - Evaluate Examples

Check if examples serve operational purpose:

| Keep If | Remove If |
|---------|-----------|
| Defines what "correct" looks like | Explains WHY (educational) |
| Shows exact commands/success criteria | Restates clear instruction |
| Sequential workflow (order matters) | Obvious application of clear rule |
| Resolves ambiguity | Duplicate template |
| Data structures (JSON, schemas) | Verbose walkthrough when numbered steps exist |
| Boundary demos (wrong vs right) | |
| Pattern extraction rules | |

### Step 3: If Vague - Strengthen First

**DO NOT remove examples yet.**

1. Identify vagueness source: subjective terms, missing criteria, unclear boundaries, narrative vs explicit steps
2. Strengthen instruction: replace subjective terms, convert to numbered steps, add thresholds, define success
3. Keep all examples - needed until strengthened
4. Mark for next pass - re-evaluate after strengthening

## Execution-Critical Content (Never Condense)

Preserve these even if instructions are clear:

### 1. Concrete Examples Defining "Correct"
Examples showing EXACT correct vs incorrect when instruction uses abstract terms.

**Test**: Does example define something ambiguous in instruction?

### 2. Sequential Steps for State Machines
Numbered workflows where order matters for correctness.

**Test**: Can steps be executed in different order and still work? If NO → Keep sequence

### 3. Inline Comments Specifying Verification
Comments explaining what output to expect or success criteria.

**Test**: Does comment specify criteria not in instruction? If YES → Keep

### 4. Disambiguation Examples
Examples resolving ambiguity when rule uses subjective terms.

**Test**: Can instruction be misinterpreted without this? If YES → Keep

### 5. Pattern Extraction Rules
Annotations generalizing specific examples into reusable decision principles (e.g., "→ Shows that 'delete' means remove lines").

**Test**: If removed, would Claude lose ability to apply reasoning to NEW examples? If YES → Keep

## Reference-Based Consolidation Rules

### Never Replace with References

- Content within sequential workflows (breaks flow)
- Quick-reference lists (serve different purpose than detailed sections)
- Success criteria at decision points (needed inline)

### OK to Replace with References

- Explanatory content appearing in multiple places
- Content at document boundaries (intro/conclusion)
- Cross-referencing related but distinct concepts

### Semantic Equivalence Test

Before replacing with reference:
1. ✅ Referenced section contains EXACT same information
2. ✅ Referenced section serves same purpose
3. ✅ No precision lost in referenced content

**If ANY fails → Keep duplicate inline**

## The Execution Test

Before removing ANY content:

1. **Can Claude execute correctly without this?**
   - NO → KEEP (execution-critical)
   - YES → Continue

2. **Does this explain WHY (rationale/educational)?**
   - YES → REMOVE
   - NO → KEEP (operational)

3. **Does this show WHAT "correct" looks like?**
   - YES → KEEP (execution-critical)
   - NO → Continue

4. **Does this extract general decision rule from example?**
   - YES → KEEP (pattern extraction)
   - NO → May remove if redundant

### Examples

❌ **Remove** (explains WHY):
```
RATIONALE: Git history rewriting can silently drop commits...
Manual verification is the only reliable way to ensure no data loss.
```

✅ **Keep** (defines WHAT "correct" means):
```
SUCCESS CRITERIA:
- git diff shows ONLY deletions in todo.md
- git diff shows ONLY additions in changelog.md
- Both files in SAME commit
```

## Conciseness Strategies

1. **Eliminate redundancy**: Remove repeated info, consolidate overlapping instructions
2. **Tighten language**: "execute" not "you MUST execute", "to" not "in order to", remove filler
3. **Structure over prose**: Bullets not paragraphs, tables for multi-dimensional info, numbered steps for sequences
4. **Preserve essentials**: Keep executable commands, data formats, boundaries, criteria, patterns

**Never sacrifice**:
- Scannability (vertical lists > comma-separated)
- Pattern recognition (checkmarks/bullets > prose)
- Explicit criteria ("ALL", "NEVER", exact counts/strings)
- Prevention patterns (prohibited vs required)

## Execution Instructions

1. Read `{{arg}}`
2. Analyze each section using methodology above
3. Optimize directly: strengthen vague instructions, remove redundancy, apply conciseness strategies
4. Report changes to user
5. Commit with descriptive message

## Quality Standards

Every change must satisfy:
- ✅ Meaning preserved
- ✅ Executability preserved
- ✅ Success criteria intact
- ✅ Ambiguity resolved
- ✅ Conciseness increased

## Change Summary Format

```
## Optimization Summary

**Changes Made**:
1. [Section] (Lines X-Y): [Change description]
   - Before: [Issue - vagueness/redundancy/verbosity]
   - After: [Improvement]

**Metrics**:
- Lines removed: N
- Sections strengthened: M
- Redundancy eliminated: [examples]

**Next Steps**: [Further optimization possible?]
```
