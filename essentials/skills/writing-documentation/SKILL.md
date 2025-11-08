---
name: writing-documentation
description: Produces concise, clear documentation by applying Elements of Style principles. Use when writing or improving any technical documentation (READMEs, guides, API docs, architecture docs). Not for code comments.
---

# Writing Documentation Skill

This skill helps you produce concise, clear technical documentation by applying timeless writing principles from Strunk & White's *Elements of Style*.

## Core Principle

The key technique: **Load writing principles before generating documentation**. This produces measurably better results (~30% shorter with improved clarity) compared to writing without explicit principles.

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

## Workflows

### Workflow 1: Write New Documentation

Use this workflow when creating documentation from scratch.

**Steps:**

1. **Understand the purpose**
   - [ ] What is the primary goal of this documentation?
   - [ ] Who is the target audience?
   - [ ] What do readers need to accomplish after reading?

2. **Load writing principles**
   - [ ] Read `reference/strunk-white-principles.md` to internalize core principles
   - [ ] Keep principles active in mind while writing

3. **Determine documentation type**
   - [ ] Read `reference/doc-types.md` to understand different types
   - [ ] Use decision framework to select appropriate type
   - [ ] Identify essential sections based on guidelines

4. **Draft the documentation**
   - [ ] Apply Strunk & White principles as you write
   - [ ] Use active voice
   - [ ] Make definite statements
   - [ ] Omit needless words
   - [ ] Choose clear, specific language

5. **Validate quality**
   - [ ] Run through Quality Checklist (below)
   - [ ] Verify all essential information is present
   - [ ] Confirm document achieves its purpose

### Workflow 2: Improve Existing Documentation

Use this workflow when enhancing or fixing existing documentation.

**Steps:**

1. **Read the current documentation**
   - [ ] Understand its purpose and audience
   - [ ] Identify what's working well
   - [ ] Note specific problems (verbosity, unclear sections, missing info)

2. **Load writing principles**
   - [ ] Read `reference/strunk-white-principles.md`
   - [ ] Review `reference/examples.md` for before/after patterns

3. **Analyze against principles**
   - [ ] Identify violations of core principles
   - [ ] Find needless words and phrases
   - [ ] Locate passive voice constructions
   - [ ] Spot vague or weak statements
   - [ ] Find redundant or repetitive content

4. **Apply improvements**
   - [ ] Remove needless words (aim for ~30% reduction)
   - [ ] Convert passive to active voice
   - [ ] Strengthen vague statements
   - [ ] Eliminate redundancy
   - [ ] Improve organization if needed

5. **Validate improvements**
   - [ ] Run through Quality Checklist
   - [ ] Verify no information was lost
   - [ ] Confirm clarity improved
   - [ ] Check length reduction achieved

### Workflow 3: Review Documentation

Use this workflow when reviewing documentation for quality.

**Steps:**

1. **Load writing principles**
   - [ ] Read `reference/strunk-white-principles.md`
   - [ ] Review relevant guidelines in `reference/doc-types.md`

2. **Assess against quality criteria**
   - [ ] Run through Quality Checklist (below)
   - [ ] Note specific violations with examples
   - [ ] Identify missing essential information

3. **Provide feedback**
   - [ ] List specific issues found
   - [ ] Reference violated principles
   - [ ] Suggest concrete improvements
   - [ ] Provide rewritten examples for major issues

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
- Information density matters
- Getting started / quick start sections

**Prioritize comprehensiveness when:**
- Documentation type is learning-focused (tutorials, guides)
- Complex concepts require detailed explanation
- Edge cases and error handling must be covered
- Architecture decisions need thorough justification

**Balance both when:**
- Most documentation requires both
- Use concise overview sections with detailed subsections
- Link to comprehensive resources rather than embedding everything
- Apply "progressive disclosure" pattern

## Quality Checklist

Use this checklist to validate documentation before completion.

### Content Quality

- [ ] **Purpose is clear**: Reader understands what this is and why it matters
- [ ] **Audience is appropriate**: Language and detail level match target readers
- [ ] **Essential information is present**: No critical gaps
- [ ] **No unnecessary information**: Every section justifies its presence
- [ ] **Correct and accurate**: Technical details are verified

### Writing Quality (Core Principles)

- [ ] **Active voice predominates**: "The function returns X" not "X is returned by the function"
- [ ] **Definite statements**: "Use X for Y" not "You might want to consider possibly using X for Y"
- [ ] **Positive form**: "Do X" not "Don't avoid X"
- [ ] **Specific language**: Concrete nouns and verbs, minimal qualifiers
- [ ] **Concise**: No needless words, phrases, or sections

### Structure Quality

- [ ] **Logical organization**: Information flows in natural order
- [ ] **Clear headings**: Section titles describe content accurately
- [ ] **Appropriate depth**: Balance between overview and detail
- [ ] **Scannable**: Reader can quickly find specific information
- [ ] **Examples where helpful**: Code samples for abstract concepts

### Technical Documentation Specifics

- [ ] **Code examples are executable**: Can be copy-pasted and run
- [ ] **Commands include context**: Show full commands, not fragments
- [ ] **Paths are clear**: Absolute or clearly relative paths
- [ ] **Prerequisites are stated**: Don't assume reader's environment
- [ ] **Error cases are covered**: Common failures and solutions

## Reference Files

### When to Load Each Reference

**Load `reference/strunk-white-principles.md`:**
- At the start of EVERY documentation writing/improvement task
- When reviewing documentation
- This is the core "weird trick" - always load it

**Load `reference/doc-types.md`:**
- When choosing what type of documentation to write
- When unsure about essential sections for a doc type
- When reviewing documentation structure

**Load `reference/examples.md`:**
- When improving existing documentation (see patterns)
- When you want concrete before/after examples
- When explaining what kind of improvements to make

## Common Pitfalls

### Pitfall 1: Skipping Principle Loading

**Problem**: Writing documentation without first reading principles produces verbose, passive output.

**Solution**: ALWAYS load `reference/strunk-white-principles.md` before writing. This is not optional.

### Pitfall 2: Following Templates Rigidly

**Problem**: Treating guidelines as rigid templates that must be followed exactly.

**Solution**: Guidelines describe common patterns and principles. Adapt to the specific project's needs. Some projects don't need all sections; some need additional ones.

### Pitfall 3: Over-Editing

**Problem**: Removing so much content that essential information is lost.

**Solution**: "Omit needless words" means remove words that add no value. Keep all information that serves the reader's purpose.

### Pitfall 4: Sacrificing Accuracy for Brevity

**Problem**: Simplifying explanations until they become misleading.

**Solution**: Accuracy always wins. If a concept requires detailed explanation, provide it. But express that explanation concisely.

### Pitfall 5: Inconsistent Terminology

**Problem**: Using multiple terms for the same concept (field/box/element/control).

**Solution**: Choose one term for each concept and use it consistently throughout the document.

## Anti-Patterns

**Don't do this:**
- ❌ Write documentation without loading principles first
- ❌ Use passive voice extensively ("it is recommended that...")
- ❌ Add qualifiers everywhere ("might", "possibly", "arguably", "somewhat")
- ❌ Include information just because you can
- ❌ Apologize for documentation quality ("this is incomplete but...")
- ❌ Use marketing language in technical docs ("amazing", "revolutionary")

**Do this instead:**
- ✅ Load principles, then write
- ✅ Use active voice ("We recommend...")
- ✅ Make definite statements ("Use X for Y")
- ✅ Include only information readers need
- ✅ Fix quality issues or note "TODO" for specific items
- ✅ Use neutral, precise language

## Success Criteria

Documentation is successful when:

1. **Readers accomplish their goals** without external help
2. **Length is minimal** while preserving all essential information
3. **Clarity is high** - no re-reading required to understand
4. **Voice is active** and statements are definite
5. **Structure is logical** and scannable
6. **Examples are concrete** and executable
7. **Tone is neutral** and professional

## Output Pattern

When writing or improving documentation, follow this pattern:

1. **State what you're doing**: "I'll write a README for this project" or "I'll improve this API documentation"
2. **Load principles**: Explicitly read the principles file
3. **Execute workflow**: Follow relevant workflow checklist
4. **Present result**: Show the documentation
5. **Validate**: Confirm quality checklist passes

## Notes

- This skill works iteratively - you can run it multiple times on the same document without degrading quality (idempotent)
- Aim for ~30% length reduction when improving documentation
- The "weird trick" works because loading principles changes behavior, even though Claude "knows" these rules
- Quality over quantity - a short, clear document is better than a comprehensive, confusing one
