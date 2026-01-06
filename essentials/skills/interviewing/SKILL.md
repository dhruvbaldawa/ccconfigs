---
name: interviewing
description: Systematic questioning to deeply understand requirements, goals, and constraints. Use when there's ambiguity about what the user wants, hidden complexity needs uncovering, or clarity is needed before proceeding.
---

# Interviewing

## When to Use This Skill

Use interviewing when:
- Requirements or goals are ambiguous
- User isn't clear about what they want
- Hidden complexity might derail implementation
- You need to stop and understand before proceeding
- Another skill encounters fundamental ambiguity about requirements

Skip when:
- Requirements are already clear and specific
- User has explicitly stated constraints and goals
- You're exploring approaches (use brainstorming instead)
- User wants to proceed without clarification

## Core Methodology

### Ask Non-Obvious Questions

Probe deeper than surface-level requirements:

**Explore the "why":**
- "What problem does this actually solve?"
- "What happens if we don't do this?"
- "Why is this important now?"

**Find hidden constraints:**
- "What would make this solution unacceptable?"
- "What are you assuming about the environment/users/scale?"
- "What can't change?"

**Uncover edge cases and failure modes:**
- "What's the worst case scenario?"
- "What happens when X fails?"
- "Who else is affected by this?"

**Define success:**
- "How will you know this worked?"
- "What does 'done' look like?"
- "What would make you regret this approach?"

**Surface tradeoffs:**
- "What are you willing to give up for this?"
- "If you had to choose between X and Y, which matters more?"
- "What's the minimum viable version?"

**Challenge assumptions:**
- "You mentioned X, but what about Y?"
- "Is that always true, or are there exceptions?"
- "What would someone who disagrees say?"

### Avoid Weak Questions

Don't ask:
- Direct restatements of what's already said
- Yes/no confirmations
- Generic questions that apply to anything
- Leading questions that push your preferred answer

### Follow the Thread

- Dig deeper when answers reveal complexity
- Go where the interesting problems are
- Don't jump to a new topic when the current one has unexplored depth

### Batch Questions Strategically

Use the `AskUserQuestion` tool with the `questions` array parameter to batch 2-4 related questions that explore different angles of the same area. This reduces back-and-forth while maintaining depth.

```
AI: [uses AskUserQuestion with questions=[
  "What triggers this workflow?",
  "Who are the users - internal team or external customers?",
  "What's the expected volume?"
]]
```

Batch when questions explore the same topic. Ask sequentially when answers to earlier questions inform later ones.

## Saturation Detection

Continue interviewing until:
- Answers stop revealing new information
- Requirements are clear and specific
- Constraints are identified
- Success criteria are defined
- User expresses readiness to move forward

Signs you're done:
- You could explain the requirements to someone else
- No major unknowns remain
- User's answers become confirmations rather than new information

## Output: Clarified Requirements

When interviewing reaches saturation, summarize what you've learned:

```
**Clarified Requirements:**
- **Goal**: [specific, concrete goal]
- **Constraints**: [what can't change, hard limits]
- **Success criteria**: [how we'll know it worked]
- **Key tradeoffs**: [what we're prioritizing vs deprioritizing]
- **Open questions**: [anything still unclear, if any]
```

This summary serves as the handoff to the next phase (planning, brainstorming, implementation).

## Integration with Other Skills

### Projects

**Brainstorming**: If brainstorming encounters ambiguity about *what* the user wants (not *how* to approach it), pause ideation and use interviewing to clarify requirements first. Return to brainstorming once requirements are clear.

**Technical Planning**: If requirements are too vague to plan, use interviewing to clarify scope, constraints, and success criteria before creating an implementation plan.

**Debugging**: If the problem description is unclear ("it's broken"), use interviewing to understand the expected vs actual behavior, reproduction steps, and context.

### Writing

**Blog Writing**: If the topic or purpose is unclear, use interviewing to clarify:
- What's the core message or argument?
- Who is this for?
- What triggered this - experience, observation, frustration?
- What do you want readers to do or think differently?

Once the *what* is clear, brainstorming can explore *how* to structure and present it.

**Writing-specific questions:**
- "What's the one thing you want readers to remember?"
- "What's the contrarian take here - what does conventional wisdom miss?"
- "Is this prescriptive (do this) or descriptive (here's what I observed)?"
- "What's the scope - a focused insight or a comprehensive guide?"

## Example Flow

```
User: I want to add notifications to the app

AI: [invokes interviewing skill]
    [uses AskUserQuestion: questions=[
      "What events should trigger notifications?",
      "Who receives them - all users, specific roles, or configurable?",
      "What channels - in-app, email, push, or some combination?"
    ]]

User: When tasks are assigned. The assignee gets notified. Just in-app for now.

AI: [uses AskUserQuestion: "What should happen if the user is
    currently viewing the app vs away? Real-time update or
    next-time-they-visit?"]

User: Real-time would be nice but not critical. Next visit is fine for v1.

AI: [uses AskUserQuestion: questions=[
      "Should notifications be dismissible, or persist until acted on?",
      "Any batching needed - if 10 tasks assigned at once, 10 notifications or 1 summary?"
    ]]

User: Dismissible. And yeah, batch them - one summary is better.

AI: **Clarified Requirements:**
    - **Goal**: In-app notifications when tasks are assigned
    - **Constraints**: V1 doesn't need real-time; batching required
    - **Success criteria**: Assignee sees notification on next visit, can dismiss
    - **Key tradeoffs**: Simplicity over real-time; summary over individual alerts
    - **Open questions**: None identified

    Ready to proceed with planning or implementation.
```

### Writing Example

```
User: I want to write something about code reviews

AI: [invokes interviewing skill]
    [uses AskUserQuestion: questions=[
      "What aspect of code reviews - process, tooling, culture, something else?",
      "Is this from a specific experience or a pattern you've noticed over time?"
    ]]

User: How AI code review tools miss important stuff. Noticed it at my current job.

AI: [uses AskUserQuestion: "What specifically do they miss that humans catch?"]

User: Context, design decisions, why the code exists in the first place

AI: [uses AskUserQuestion: questions=[
      "So it's less about finding bugs and more about understanding intent?",
      "What's your take - are AI tools fundamentally limited, or just immature?"
    ]]

User: They're complementary. AI catches syntax and style, humans catch architecture.

AI: [uses AskUserQuestion: "Who's the audience - developers evaluating these tools,
    engineering managers, or teams already using them?"]

User: Teams already using them who might be over-relying on the AI.

AI: **Clarified Requirements:**
    - **Core message**: AI and human code review are complementary, not replacements
    - **Audience**: Teams already using AI code review tools
    - **Trigger**: Direct experience at current job
    - **Purpose**: Help teams calibrate expectations and use both effectively
    - **Open questions**: None

    Ready for brainstorming to explore angles and structure.
```
