---
description: Research blockers or questions using specialized research agents
---

# Research

Research specific blocker or question using specialized research agents and MCP tools.

## Usage

```
# Research stuck task
/research experimental/.plans/user-auth/implementation/003-jwt.md

# Research general question
/research "How to implement rate limiting with Redis?"

# Research for writing topic
/research "Best practices for writing technical blog posts"
```

## Your Task

Research: "${{{ARGS}}}"

### Step 1: Analyze Research Type

${isTaskFile ? 'Read task file to understand blocker context and type.' : 'Analyze the question to determine research approach.'}

Determine which research agents to use:

**Broad understanding needed** (new technology, general patterns, industry trends)
→ Launch `research-breadth` + `research-technical`

**Specific solution needed** (error message, specific implementation issue)
→ Launch `research-depth` + `research-technical`

**API/library question** (official documentation, method signatures, configuration)
→ Launch `research-technical` + `research-depth`

**Best practices/patterns** (architectural decisions, design patterns)
→ Launch `research-breadth` + `research-depth`

### Step 2: Launch Research Agents in Parallel

Launch 2-3 specialized agents using the Task tool:

```typescript
// Example: For broad understanding
await Promise.all([
  Task({
    subagent_type: 'research-breadth',
    model: 'haiku',
    description: 'Broad survey research',
    prompt: `Research broad understanding of: "${{{ARGS}}}"

    Gather multiple perspectives, recent trends, statistical data, and industry consensus.
    Use Perplexity for broad coverage of recent information.
    Synthesize into narrative patterns with supporting evidence.`
  }),

  Task({
    subagent_type: 'research-technical',
    model: 'haiku',
    description: 'Technical documentation research',
    prompt: `Research official documentation for: "${{{ARGS}}}"

    Use Context7 to access official library/framework documentation.
    Extract API specifications, configuration options, and official examples.
    Provide concrete implementation guidance.`
  })
]);
```

**Available research agents:**
- **research-breadth**: Broad surveys via Perplexity (trends, industry consensus, multiple perspectives)
- **research-depth**: Deep-dive analysis via Firecrawl (specific URLs, implementation details, case studies)
- **research-technical**: Official docs via Context7 (API references, method signatures, configurations)

### Step 3: Synthesize Findings

Use the **research-synthesis skill** to:
- Consolidate findings from all agents
- Identify concrete path forward
- Extract actionable implementation guidance
- Maintain source attribution
- Note contradictions and gaps

${isTaskFile ? `
### Step 4: Update Task File

Update the task file with research findings:

\`\`\`bash
cat >> "$task_file" <<EOF

**research findings:**
- [Agent 1]: [key insights with sources]
- [Agent 2]: [key insights with sources]
- [Agent 3]: [key insights with sources]

**resolution:**
[Concrete path forward based on research]

**next steps:**
[Specific actions to take]
EOF
\`\`\`

If blocker is resolved, update status from STUCK to Pending.
` : ''}

## Output Format

**For stuck tasks:**
```markdown
✅ Research Complete

Task: 003-jwt.md
Blocker: Rate limiting implementation unclear

Research Agents Used:
- research-breadth: Industry patterns for rate limiting
- research-technical: express-rate-limit official documentation

Key Findings:
1. **Broad Survey** (research-breadth):
   - Token bucket algorithm is industry standard
   - Redis store enables distributed rate limiting
   - Source: [Perplexity: Multiple sources on rate limiting patterns]

2. **Official Documentation** (research-technical):
   - express-rate-limit supports Redis via rate-limit-redis package
   - Configuration: windowMs, max, standardHeaders
   - Source: [Context7: express-rate-limit API docs]

Resolution:
Use express-rate-limit with Redis store following official patterns.

Updated task with:
- Research findings in Notes section
- Updated LLM Prompt with implementation details
- Status changed from STUCK to Pending

Next: Resume implementation with /implement-plan user-auth
```

**For general questions:**
```markdown
✅ Research Complete

Question: How to implement rate limiting with Redis?

Research Agents Used:
- research-breadth: Industry patterns and best practices
- research-depth: Specific implementation examples
- research-technical: Official library documentation

Synthesis:

1. **Industry Standard Approach** (research-breadth):
   - express-rate-limit + Redis store (most common Node.js pattern)
   - Token bucket algorithm with sliding window
   - Distributed rate limiting across instances
   - Source: [Perplexity: Rate limiting surveys 2024-2025]

2. **Implementation Details** (research-depth):
   - Redis sorted sets for sliding window
   - Atomic operations: ZADD, ZREMRANGEBYSCORE, ZCARD
   - Example from official blog demonstrates pattern
   - Source: [Firecrawl: Redis rate limiting implementation blog]

3. **Official API Reference** (research-technical):
   - rate-limit-redis package integrates with express-rate-limit
   - RedisStore configuration options documented
   - TypeScript types available
   - Source: [Context7: express-rate-limit + rate-limit-redis docs]

Recommendation:
Use express-rate-limit with rate-limit-redis store for application-level rate limiting.
This combines simplicity (official package) with scalability (distributed via Redis).

Alternative: nginx rate limiting at reverse proxy level (use if infrastructure preference).
```

## Notes

- Research agents run in **parallel** for faster results
- Use **research-synthesis skill** to consolidate findings (narrative, not lists)
- Always maintain **source attribution** from agent outputs
- For stuck tasks, update task file with findings and next steps
- Pattern matches `implementing-tasks` skill workflow for consistency
