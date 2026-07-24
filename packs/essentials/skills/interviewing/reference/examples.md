# Interviewing Examples

## Project Example

```
User: I want to add notifications to the app

AI: [uses AskUserQuestion: questions=[
      "What events should trigger notifications?",
      "Who receives them - all users, specific roles, or configurable?",
      "What channels - in-app, email, push, or combination?"
    ]]

User: When tasks are assigned. The assignee gets notified. Just in-app for now.

AI: [uses AskUserQuestion: "What should happen if the user is currently
    viewing the app vs away? Real-time or next-visit?"]

User: Real-time would be nice but not critical. Next visit is fine for v1.

AI: [uses AskUserQuestion: questions=[
      "Should notifications be dismissible or persist until acted on?",
      "Any batching needed - 10 tasks assigned = 10 notifications or 1 summary?"
    ]]

User: Dismissible. And yeah, batch them - one summary is better.

AI: **Clarified Requirements:**
    - **Goal**: In-app notifications when tasks are assigned
    - **Constraints**: V1 doesn't need real-time; batching required
    - **Success criteria**: Assignee sees notification on next visit, can dismiss
    - **Key tradeoffs**: Simplicity over real-time; summary over individual
    - **Open questions**: None

    Ready to proceed with planning or implementation.
```

## Writing Example

```
User: I want to write something about code reviews

AI: [uses AskUserQuestion: questions=[
      "What aspect - process, tooling, culture, something else?",
      "From a specific experience or pattern you've noticed over time?"
    ]]

User: How AI code review tools miss important stuff. Noticed it at my job.

AI: [uses AskUserQuestion: "What specifically do they miss that humans catch?"]

User: Context, design decisions, why the code exists in the first place

AI: [uses AskUserQuestion: questions=[
      "So less about bugs, more about understanding intent?",
      "Your take - AI tools fundamentally limited, or just immature?"
    ]]

User: They're complementary. AI catches syntax/style, humans catch architecture.

AI: [uses AskUserQuestion: "Who's the audience - developers evaluating tools,
    managers, or teams already using them?"]

User: Teams already using them who might be over-relying on AI.

AI: **Clarified Requirements:**
    - **Core message**: AI and human code review are complementary
    - **Audience**: Teams using AI code review tools
    - **Trigger**: Direct experience at current job
    - **Purpose**: Help teams calibrate expectations
    - **Open questions**: None

    Ready for brainstorming to explore angles and structure.
```

## Key Patterns

1. **Start broad, narrow down** - First questions scope the topic, later ones probe specifics
2. **Batch related questions** - Use `questions` array to explore multiple angles at once
3. **Follow interesting threads** - When "AI misses context" came up, dug into what that means
4. **End with clear handoff** - Summarize in structured format, state what's next
