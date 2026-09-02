---
argument-hint: [TOPIC]
description: Create a new blog post with braindump and draft files, then start brainstorming conversation
---

Topic: $1

You are starting a new blog post on the topic: **$1**

## Setup

1. Create directory structure: `posts/$1/`
2. Create `posts/$1/braindump.md` with this template:

```markdown
# $1 - Braindump

## Context
<!-- What triggered this topic? Personal experience, observation, frustration? -->

## Core Argument
<!-- Main thesis or insight you want to convey -->

## Audience
<!-- Who is this for? Engineers, managers, general audience? -->

## Outline
<!-- Evolving structure of the post -->

## Research
<!-- Studies, data, citations, sources -->

## Examples
<!-- Concrete cases, anecdotes, stories -->

## Quotes
<!-- Notable quotations with attribution -->

## Questions
<!-- Open questions to resolve during writing -->

## Sources
<!-- Full references for later citation -->
```

3. Create `posts/$1/draft.md` with this template:

```markdown
---
title:
date: YYYY-MM-DD
status: draft
---

# [Title]

## TL;DR
-
-
-

## [Introduction]

[Hook: anecdote, problem statement, or rhetorical question]

## [Body Section 1]

[Content]

## [Body Section 2]

[Content]

## [Conclusion]

[Summary, practical implications, engagement question]
```

## After Setup

After creating the files, invoke the brainstorming skill (from essentials plugin) and refine the idea before any drafting - the draft comes later, from an agreed outline. Explore what triggered the topic, the core argument, and the audience, and update braindump.md as ideas develop.
