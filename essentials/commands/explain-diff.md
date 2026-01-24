---
argument-hint: [COMMIT/PR/BRANCH]
description: Generate a rich explanation of a code change as a markdown document
---

### Task

Create a rich explanation of the specified code change as a markdown document.

### Input

The user will point you to some code changes to explain (commit hash, PR, branch comparison, or file paths). If they don't explicitly specify, then explain the most recent batch of changes made in this conversation.

### Sections

- **Background**: Explain the existing system relevant to this change. You should broadly explore surrounding code for this. We don't know how much the reader already knows, so include a deep background for beginners (note that it can be skipped if the reader is already familiar), and then a more narrow background directly relevant to the change.
- **Intuition**: Explain the core intuition for the code change. The focus here is to explain the essence, not the full details. Use concrete examples with toy data. Use figures and mermaid diagrams liberally.
- **Code**: Do a high-level walkthrough of the changes to the code. Group/order the changes in an understandable way.
- **Verification**: Explain how the code change was verified for correctness, eg. unit tests, integration tests, etc. Give the user a step by step guide on how to manually QA the change.
- **Alternatives**: Describe 1-2 alternative approaches if you are able to identify any. Each alternative should include a pros and cons list compared to the specified change. Layout the pros/cons list in a comparison table. Only include an alternative if it represents an orthogonal way of solving the problem. If you cannot identify any alternatives, omit this section.
- **Quiz**: Come up with 5 questions that test the reader's knowledge of this change. This should be medium difficulty, difficult enough that you actually need to understand the substance of the change to answer them, but not gotchas. The goal is to help the reader make sure that they've actually understood. Each question should have multiple choice answers with an explanation detailing why an answer is correct or incorrect. Use collapsible details blocks to hide answers:
  ```markdown
  ### 1. Question text here?

  <details>
  <summary>A) First option</summary>

  ❌ Explanation for why it was incorrect
  </details>

  <details>
  <summary>B) Second option</summary>

  ✅ Correct! Explanation for why it was correct
  </details>

  <details>
  <summary>C) Third option</summary>

  ❌ Explanation for why it was incorrect
  </details>
  ```

### Output

Write the explanation to a markdown file. Suggested naming convention: `docs/explanations/<date>-<short-description>.md` or ask the user where to save it.

### Formatting

- Write with clarity and flow, making it engaging and written in classic style. Transitions between sections should be smooth.
- Use mermaid diagrams to illustrate concepts. Some useful kinds of diagrams:
  - A system diagram showing data flow or communication between components (include example data!)
  - Sequence diagrams for request/response flows
  - Flowcharts for decision logic
- Use blockquotes (`>`) for key concepts or definitions
- Use admonitions/callouts for important edge cases:
  ```markdown
  > **Note**: Important information here

  > **Warning**: Edge case to watch out for
  ```
- Use tables for comparisons (pros/cons, before/after)
- Include code snippets with syntax highlighting and file path references
