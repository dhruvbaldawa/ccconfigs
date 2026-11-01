---
paths:
  - "**/*.{ts,tsx,js,jsx,mjs,cjs,py,go,rs,rb,java,kt,kts,scala,swift,c,h,cc,cpp,hpp,cs,php,lua,ex,exs,erl,hs,ml,clj,dart,zig,sh,bash,zsh,sql,vue,svelte}"
---

# Coding rules

## Changes

- Make the smallest reasonable change; every changed line traces directly to the request.
- Prefer the change that leaves the codebase with less code and fewer concepts: reuse before adding, and remove duplication in the code you are already changing. Simplification outside that code is a suggestion for the summary, not an edit.
- Remove imports, variables, and functions your change made unused. Mention pre-existing dead code instead of deleting it.
- Simple over clever, readable over concise.
- Edit surgically; rewrite a whole file only with Dhruv's permission.
- Backward compatibility depends on adoption: in production code with users, preserve it (a breaking change is a one-way door); in prototypes and early-stage code with no adoption, breaking changes are fine — say so in the summary.
- Match the surrounding style; consistency within a file beats external standards.
- Fix bugs as soon as you find them.

## Design

YAGNI: the best code is no code. Build exactly what the request needs, with error handling for failures that can actually happen; extensibility, configurability, and abstractions for single-use code are suggestions for the summary. If 50 lines would do the job of 200, rewrite it. Gut check: would a senior engineer call this overcomplicated? If yes, simplify.

## Naming

Name things for what they do, not how they do it or their history — "Validator", not "ZodValidator", "NewAPI", "LegacyHandler", or an unneeded "Factory".

## Comments (antirez style)

Every source file starts with a 2-line `ABOUTME:` comment saying what the file is for.

Six valid comment types: **function** (what it does, returns, side effects — every function), **design** (why X not Y), **why** (non-obvious reasoning), **teacher** (domain/algorithm explanation), **checklist** (easy-to-miss maintenance notes), **guide** (logical section markers).

Comments describe the code as it is now: leave out trivial restatements (`i++ // increment i`), history ("improved", "refactored from"), and instructions to the reader ("copy this pattern"). Remove an existing comment only when it is provably false.

## Testing

- Every failure is yours to resolve, even when you didn't cause it.
- Keep failing tests; raise them with Dhruv instead of deleting them.
- Test behavior, not coverage numbers: every behavior the change adds or alters, including its error paths, gets a test that would fail if that behavior broke. Tests exist to give confidence to move fast, not to inflate coverage.
- A test that only exercises mocks proves nothing — stop and tell Dhruv. End-to-end tests use real data and real APIs.
- Read test output in full; logs often carry the real failure.
