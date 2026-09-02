---
name: writing-documentation
description: Produces concise, clear documentation by applying Elements of Style principles. Use when writing or improving any technical documentation (READMEs, guides, API docs, architecture docs). Not for code comments.
---

# Writing Documentation Skill

Apply Strunk & White's *Elements of Style* principles to produce concise, clear technical documentation.

## When to Use This Skill

**Use this skill when:**
- Writing new documentation (README, API docs, guides, tutorials, architecture docs)
- Improving existing documentation
- Reviewing documentation for quality
- User asks to "make this more concise" or "improve clarity"
- User mentions: documentation, docs, README, guide, tutorial, API docs

**Do NOT use this skill for:**
- Code comments (different context, separate skill needed)
- Marketing copy (requires persuasive voice, not neutral clarity)
- Personal blog posts (requires individual voice)

## Workflow

Read `reference/strunk-white-principles.md` before writing or reviewing. For a new document, pick the type from `reference/doc-types.md` and its essential sections. For improvements, `reference/examples.md` has before/after patterns.

Then write, improve, or review against the Quality Checklist below; when improving, confirm no information was lost.

## Decision Framework

### When to Write vs Improve

**Write new documentation when:**
- No documentation exists
- Existing documentation is fundamentally wrong or outdated
- Complete restructuring needed (cheaper to rewrite)

**Improve existing documentation when:**
- Core structure and information are sound
- Style or clarity issues can be fixed incrementally
- Specific sections need enhancement

### Choosing Documentation Type

See `reference/doc-types.md` for detailed guidelines. Quick reference:

- **README**: Project overview, quick start, primary entry point
- **API Documentation**: Reference for function/endpoint signatures and behavior
- **Tutorial/Guide**: Step-by-step learning path for accomplishing specific goals
- **Architecture/Design Doc**: Explain system structure, decisions, and tradeoffs
- **CLI Tool Documentation**: Command reference with options and examples

### Prioritizing Conciseness vs Comprehensiveness

**Prioritize conciseness when:**
- Documentation type is reference (README, API docs, CLI docs)
- Readers need to scan quickly
- Getting started / quick start sections

**Prioritize comprehensiveness when:**
- Documentation type is learning-focused (tutorials, guides)
- Complex concepts require detailed explanation
- Architecture decisions need thorough justification

**Balance both:**
- Use concise overview sections with detailed subsections
- Link to comprehensive resources rather than embedding everything
- Apply progressive disclosure pattern

## Quality Checklist

### Content
- [ ] Purpose is clear
- [ ] Essential information is present
- [ ] No unnecessary information
- [ ] Correct and accurate

### Writing (Core Principles)
- [ ] Active voice predominates
- [ ] Definite statements (not hedging)
- [ ] Positive form
- [ ] Specific, concrete language
- [ ] Concise (no needless words)

### Structure
- [ ] Logical organization
- [ ] Clear headings
- [ ] Scannable
- [ ] Examples where helpful

### Technical Documentation
- [ ] Code examples are executable
- [ ] Commands include full context
- [ ] Prerequisites are stated
- [ ] Error cases are covered

## Reference Files

### When to Load Each Reference

**Load `reference/strunk-white-principles.md`:**
- Before any documentation task
- When reviewing documentation

**Load `reference/doc-types.md`:**
- When choosing what type of documentation to write
- When unsure about essential sections for a doc type
- When reviewing documentation structure

**Load `reference/examples.md`:**
- When improving existing documentation (see patterns)
- When you want concrete before/after examples

## Common Pitfalls

**Following Guidelines Rigidly**: Adapt to the specific project's needs. Some projects don't need all sections; some need additional ones.

**Over-Editing**: "Omit needless words" means remove words that add no value. Keep all information that serves the reader's purpose.

**Sacrificing Accuracy for Brevity**: Accuracy always wins. Express explanations concisely, but never misleadingly.

**Inconsistent Terminology**: Choose one term for each concept and use it consistently.

## Notes

- This skill works iteratively - you can run it multiple times on the same document without degrading quality (idempotent)
- Quality over quantity - a short, clear document is better than a comprehensive, confusing one
