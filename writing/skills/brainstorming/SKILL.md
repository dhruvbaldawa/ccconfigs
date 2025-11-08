---
name: brainstorming
description: Collaborative ideation for blog posts. Ask clarifying questions, suggest angles, challenge assumptions, and help refine vague ideas into concrete topics. Use when exploring topics before drafting.
---

# Brainstorming

## When to Use This Skill

Use brainstorming when:
- User mentions wanting to write about a topic but hasn't structured it yet
- Initial idea is vague or broad ("I want to write about productivity")
- User is exploring multiple angles or approaches
- Topic needs refinement before creating outline

Skip when:
- User has a clear outline ready to draft
- Topic is well-defined and just needs writing
- User explicitly asks to skip ideation and start writing

## Core Approach

**Start with Questions, Not Suggestions**

Don't immediately propose outlines or structure. First understand:
- What triggered this topic? (specific experience, observation, frustration?)
- Who is the audience?
- What's the core insight or argument?
- What makes this topic relevant now?

**Examples:**
- "What triggered this - specific experience or pattern you've noticed?"
- "Is this for engineers, managers, or general audience?"
- "What's the contrarian take here? What does conventional wisdom miss?"
- "Why now? What makes this relevant or timely?"

## Ideation Techniques

### 1. Explore Tensions and Contradictions
Look for interesting conflicts:
- "You said X works, but also mentioned Y failed - what's the difference?"
- "That sounds like it contradicts Z - is that the point?"

### 2. Challenge Assumptions
Gently probe the premise:
- "Is that always true, or are there contexts where it breaks down?"
- "What would someone who disagrees with this say?"

### 3. Find the Concrete Angle
Move from abstract to specific:
- Vague: "I want to write about AI"
- Concrete: "Why AI code review misses context that human reviewers catch"

**Pattern:**
- Abstract topic → Specific problem
- General observation → Concrete example
- Theory → Practical implication

### 4. Suggest Multiple Perspectives
Offer 2-3 different angles, not just one:
- "You could approach this as: (1) why X fails, (2) what to do instead, or (3) when X actually works"
- "This could be prescriptive (here's how to fix it) or descriptive (here's why it happens)"

### 5. Use Personal Experience as Foundation
Ground abstract concepts:
- "You mentioned seeing this at 3 companies - what pattern did you notice?"
- "Walk me through a specific example where this happened"

## Working with Braindump

When user runs `/new-post [topic]`, add ideas to **braindump.md**:

### Capture in Structured Sections
- **Context**: What triggered this topic
- **Core Argument**: Main thesis or insight
- **Audience**: Who this is for
- **Angles**: Different approaches to explore
- **Examples**: Concrete instances, anecdotes
- **Questions**: Open questions to resolve

### Iterate Through Conversation
Update braindump.md as ideas evolve:
```
You: Maybe focus on why OKRs fail, not how to fix them
AI: [updates braindump.md → Core Argument section]
    Focusing on diagnosis over prescription - more analytical.
    Should we explore root causes or symptoms?
```

## Transition Signals

Know when to move from brainstorming → outlining → drafting:

**Ready to outline when:**
- Core argument is clear
- Audience is defined
- 2-3 concrete examples identified
- User expresses readiness ("okay, let's outline this")

**Transition pattern:**
```
AI: We've got:
    - Core argument: OKRs fail because they measure what's easy, not what matters
    - 3 examples from your experience
    - Target audience: engineering managers

    Ready to structure this into an outline?
```

**Not ready when:**
- Core argument is still fuzzy
- Multiple competing angles without clarity on which to pursue
- Missing concrete examples or evidence

## Common Pitfalls to Avoid

1. **Premature Structuring**: Don't jump to outline before the idea is clear
2. **Too Many Options**: Don't overwhelm with 10 different angles - offer 2-3
3. **Leading the Witness**: Ask genuine questions, don't push your preferred angle
4. **Over-Abstracting**: Keep pulling back to concrete examples
5. **Ignoring Constraints**: If user says "short post," don't brainstorm epic series

## Quality Checklist

Before transitioning to drafting, verify:
- [ ] Core argument is clear and specific (not vague)
- [ ] At least 2-3 concrete examples or data points identified
- [ ] Audience and purpose are defined
- [ ] User feels ready to move forward
- [ ] Braindump.md has been updated with key ideas

## Example Flow

```
You: I want to write about code reviews

AI: [invokes brainstorming skill]
    What aspect of code reviews? Process, tooling, culture?

You: How AI code review tools miss important stuff

AI: Interesting - what do they miss that humans catch?

You: Context, design decisions, why code exists

AI: So it's not about finding bugs, but understanding intent?
    Have you seen this happen in practice?

You: Yes, at my current company - AI flags style but misses architecture issues

AI: That's concrete. Are you arguing:
    (1) AI tools are fundamentally limited, or
    (2) Current tools need better context, or
    (3) Humans and AI serve different purposes?

You: Probably #3 - they're complementary

AI: Good angle - avoids being anti-AI while still critical.
    [updates braindump.md]

    Should we outline this? Thinking:
    1. The Promise (what AI code review claims to do)
    2. What It Misses (context, intent, architecture)
    3. What Humans Still Do Better
    4. How to Use Both Together

You: Yes, but add why this matters

AI: [adds to outline in braindump.md]
    Added "Why This Matters" section - practical implications
    for engineering teams. Ready to start drafting?
```

## Integration with Other Skills

- **After brainstorming**: Transition to **blog-writing** skill for drafting
- **During brainstorming**: Use **research-synthesis** skill if research is needed
- **Throughout**: Update braindump.md with evolving ideas
