---
description: Enrich a plan with parallel research, learnings, and best practices
argument-hint: [PROJECT]
---

# Deepen Plan

Enhance `.plans/{{ARGS}}/plan.md` with research insights before implementation.

## Usage

```
/deepen-plan user-authentication
```

## Process

### 1. Load Plan

- Read `.plans/<project>/plan.md`
- Extract: sections, technologies, acceptance criteria
- Report: `Found N sections, technologies: [list]`

### 2. Apply Institutional Learnings

- Search `.plans/<project>/learnings/` for relevant solutions
- Match by: tags, category, technologies mentioned
- Include: prevention strategies, gotchas, code patterns

```
Found N relevant learnings:
- [ID]: [title] (tags: [matching tags])
```

### 3. Launch Research Agents (parallel)

Based on detected technologies, launch 2-3 agents:

```
Task(
  description: "Research [technology] best practices",
  prompt: "Research best practices and common pitfalls for [technology].

  Context: [extracted section context]

  Focus on:
  - Official documentation patterns
  - Common mistakes to avoid
  - Performance considerations
  - Security implications

  Return: Bullet points with references.",
  subagent_type: "experimental:research:research-technical"
)

Task(
  description: "Research [domain] patterns",
  prompt: "Research implementation patterns for [domain].

  Requirements: [from acceptance criteria]

  Focus on:
  - Industry best practices
  - Real-world examples
  - Edge cases to consider

  Return: Patterns with code examples.",
  subagent_type: "experimental:research:research-breadth"
)
```

### 4. Synthesize & Enhance

For each plan section, append:

```markdown
### Research Insights

**Best practices:**
- [from research-technical]

**Common pitfalls:**
- [from research-breadth + learnings]

**Code patterns:**
```[language]
[example from research-depth]
```

**References:**
- [links from research]
```

### 5. Output

Write enhanced plan and present options:

```
✅ Plan deepened with N insights across M sections

Options:
1. View diff (show changes)
2. Start /implement-plan {{ARGS}}
3. Deepen further (run additional research)
```

## Key Principle

"Maximum coverage over selectivity" - Run all relevant research, filter during synthesis. The diversity of perspectives catches edge cases a single search would miss.

## When to Use

- Before `/implement-plan` on complex features
- When entering unfamiliar technology territory
- When learnings exist that might prevent known issues
- When acceptance criteria are ambiguous

## What It Does NOT Do

- Does not modify implementation approach (only adds insights)
- Does not execute any code
- Does not create task files (use `/plan-feature` for that)
