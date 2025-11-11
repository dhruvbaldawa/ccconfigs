---
description: Research blockers or questions using discovery-agent
---

# Research

Research specific blocker or question using MCP tools and discovery-agent.

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

```typescript
await Task({
  subagent_type: 'discovery-agent',
  model: 'sonnet',
  description: 'Research blocker or question',
  prompt: `Research: "${{{ARGS}}}"

  ${isTaskFile ? 'Read task file for context. Update task with findings.' : 'Research question and provide summary with sources.'}

  Use research-synthesis skill to investigate using MCP tools:
  - Perplexity for broad research and best practices
  - Firecrawl for specific URLs
  - Context7 for library documentation

  Synthesize findings into actionable insights.`
});
```

Discovery agent will:
- Read task file if provided (understand blocker context)
- Use appropriate MCP tools for research (Perplexity, Firecrawl, Context7)
- Synthesize findings using research-synthesis skill
- Update task file with findings in Notes section (if task file)
- Provide summary with sources (if general question)

## Output

**For stuck tasks:**
```markdown
✅ Research Complete

Task: 003-jwt.md
Blocker: Rate limiting implementation unclear

Findings:
- express-rate-limit supports Redis store for distributed systems
- Token bucket algorithm with sliding window recommended
- Context7 lookup: express-rate-limit API documentation

Updated task with:
- Research findings in Notes section
- Updated LLM Prompt with implementation details
- Status changed from Stuck to Pending

Next: Resume implementation with /implement-plan user-auth
```

**For general questions:**
```markdown
✅ Research Complete

Question: How to implement rate limiting with Redis?

Key Findings:
1. express-rate-limit + redis store (most common Node.js pattern)
   - Token bucket algorithm
   - Distributed rate limiting across instances
   - Source: [Perplexity research]

2. nginx rate limiting (alternative approach)
   - Handles at reverse proxy level
   - limit_req_zone directive
   - Source: [Context7: nginx docs]

3. Implementation pattern:
   - Redis sorted sets for sliding window
   - Atomic operations (ZADD, ZREMRANGEBYSCORE, ZCARD)
   - Source: [Firecrawl: Redis rate limiting blog]

Recommendation: Use express-rate-limit with Redis store for application-level rate limiting.

Sources attached in findings.
```
