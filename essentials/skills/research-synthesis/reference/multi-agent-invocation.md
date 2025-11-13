# Multi-Agent Invocation Pattern

Guide for using specialized research agents in parallel for comprehensive investigation.

## Available Research Agents

### research-breadth (haiku, blue)
**Purpose**: Broad survey research for general understanding, trends, and industry consensus

**MCP Tool**: Perplexity (fallback: WebSearch)

**Use for**:
- New technology landscape understanding
- Industry trends and best practices
- Statistical data and multiple perspectives
- Comparative analyses of approaches
- "What are the common patterns for X?"
- "How do most teams handle Y?"

**Output**: Narrative patterns with consensus indicators, confidence ratings, contradictions/gaps

---

### research-depth (haiku, purple)
**Purpose**: Deep-dive research into specific URLs for detailed technical analysis

**MCP Tool**: Firecrawl (fallback: WebFetch)

**Use for**:
- Specific blog posts, tutorials, case studies
- Detailed implementation patterns
- Code examples with context
- Lessons learned and gotchas
- "How did [company/person] implement X?"
- "What are the implementation details of Y?"

**Output**: Source-by-source analysis with code examples, tradeoffs, gotchas, applicability assessment

---

### research-technical (haiku, green)
**Purpose**: Official documentation research for API references and technical specifications

**MCP Tool**: Context7 (fallback: WebSearch + WebFetch)

**Use for**:
- Official library/framework documentation
- API signatures and method references
- TypeScript types and interfaces
- Configuration schemas
- Migration guides
- Framework conventions
- "What's the official API for X?"
- "How do I configure Y according to docs?"

**Output**: Exact API specs with signatures, types, configuration options, official examples

---

## Agent Selection Decision Tree

```
┌─ Question Type ─────────────────────────────────────────────────┐
│                                                                  │
│  "How do I...?" (general approach)                              │
│  ├─ New technology/framework                                    │
│  │  └─→ research-breadth + research-technical                   │
│  │                                                               │
│  ├─ Best practices/patterns                                     │
│  │  └─→ research-breadth + research-depth                       │
│  │                                                               │
│  └─ Specific error/issue                                        │
│     └─→ research-depth + research-technical                     │
│                                                                  │
│  "What is...?" (understanding)                                  │
│  ├─ Official API/library feature                                │
│  │  └─→ research-technical (+ research-depth if examples needed)│
│  │                                                               │
│  └─ Concept/pattern                                             │
│     └─→ research-breadth (+ research-depth for deep dive)       │
│                                                                  │
│  "Why is...?" (debugging/analysis)                              │
│  └─→ research-depth + research-technical                        │
│                                                                  │
│  "Which approach...?" (comparison)                              │
│  └─→ research-breadth + research-depth                          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Parallel Invocation Patterns

### Pattern 1: Broad Understanding (New Technology)

**Scenario**: Learning a new framework or technology

**Agents**: research-breadth + research-technical

**Example**:
```typescript
await Promise.all([
  Task({
    subagent_type: 'research-breadth',
    model: 'haiku',
    description: 'Survey GraphQL ecosystem',
    prompt: `Research broad understanding of GraphQL best practices.

    Focus on:
    - Common architectural patterns
    - Schema design approaches
    - Performance considerations
    - Industry trends 2024-2025

    Use Perplexity for comprehensive survey.`
  }),

  Task({
    subagent_type: 'research-technical',
    model: 'haiku',
    description: 'GraphQL official documentation',
    prompt: `Research GraphQL.js official documentation.

    Focus on:
    - Schema definition syntax
    - Resolver implementation patterns
    - Type system capabilities
    - Configuration options

    Use Context7 for official docs.`
  })
]);
```

**Consolidation**: Combine industry patterns (breadth) with official implementation details (technical)

---

### Pattern 2: Specific Solution (Error/Issue)

**Scenario**: Debugging a specific error or implementing a known solution

**Agents**: research-depth + research-technical

**Example**:
```typescript
await Promise.all([
  Task({
    subagent_type: 'research-depth',
    model: 'haiku',
    description: 'Deep-dive N+1 query solutions',
    prompt: `Research detailed solutions for GraphQL N+1 query problem.

    Find specific blog posts/articles with:
    - Implementation examples with code
    - DataLoader pattern explanations
    - Performance benchmarks
    - Gotchas and lessons learned

    Use Firecrawl to extract full content.`
  }),

  Task({
    subagent_type: 'research-technical',
    model: 'haiku',
    description: 'DataLoader official docs',
    prompt: `Research DataLoader official documentation.

    Focus on:
    - API signature and usage
    - Configuration options
    - Caching behavior
    - TypeScript types

    Use Context7 for official docs.`
  })
]);
```

**Consolidation**: Combine real-world implementation patterns (depth) with official API usage (technical)

---

### Pattern 3: API/Library Integration

**Scenario**: Integrating with a specific library or API

**Agents**: research-technical + research-depth

**Example**:
```typescript
await Promise.all([
  Task({
    subagent_type: 'research-technical',
    model: 'haiku',
    description: 'Stripe API official docs',
    prompt: `Research Stripe Payment Intent API official documentation.

    Focus on:
    - Payment Intent creation API
    - Webhook event types
    - Error codes and handling
    - TypeScript SDK usage

    Use Context7 for official Stripe docs.`
  }),

  Task({
    subagent_type: 'research-depth',
    model: 'haiku',
    description: 'Stripe integration examples',
    prompt: `Research detailed Stripe integration examples.

    Find tutorials/blogs with:
    - Complete payment flow implementation
    - Webhook handling patterns
    - Error handling strategies
    - Testing approaches

    Use Firecrawl to extract implementation details.`
  })
]);
```

**Consolidation**: Start with official API (technical), supplement with battle-tested patterns (depth)

---

### Pattern 4: Comparative Analysis

**Scenario**: Choosing between multiple approaches

**Agents**: research-breadth + research-depth

**Example**:
```typescript
await Promise.all([
  Task({
    subagent_type: 'research-breadth',
    model: 'haiku',
    description: 'State management comparison',
    prompt: `Research comparison of React state management solutions.

    Compare:
    - Redux vs Zustand vs Jotai vs Context
    - Use cases for each
    - Community trends 2024-2025
    - Performance characteristics

    Use Perplexity for broad industry perspective.`
  }),

  Task({
    subagent_type: 'research-depth',
    model: 'haiku',
    description: 'State management case studies',
    prompt: `Research specific case studies of teams migrating state management.

    Find articles covering:
    - Migration experiences
    - Performance improvements
    - Developer experience changes
    - Lessons learned

    Use Firecrawl to extract detailed experiences.`
  })
]);
```

**Consolidation**: Combine industry trends (breadth) with real migration experiences (depth)

---

## Synthesis Strategy

After agents return findings, use **research-synthesis skill** to:

### 1. Consolidate Sources
- Group findings by theme
- Identify consensus across agents
- Note contradictions (breadth vs depth vs technical)
- Assess confidence based on source authority

### 2. Create Narrative
- **Avoid**: Bullet-point data dumps from each agent
- **Do**: Weave findings into coherent story
- **Pattern**: "Research shows X (breadth), which is implemented using Y (technical), as demonstrated by Z case study (depth)"

### 3. Maintain Attribution
- Link all claims to specific sources
- Note which agent provided which insight
- Distinguish between official docs, industry consensus, and specific examples

### 4. Identify Gaps
- What questions remain unanswered?
- What contradictions need resolution?
- Where do sources disagree?

### 5. Extract Action
- Concrete implementation path
- Specific code/configuration to apply
- Risks to watch for (from depth findings)
- Official constraints (from technical findings)

---

## Anti-Patterns

❌ **Using single agent when multiple needed**
```typescript
// BAD: Only breadth for implementation question
Task({ subagent_type: 'research-breadth', ... })

// GOOD: Breadth + Technical for complete picture
Promise.all([
  Task({ subagent_type: 'research-breadth', ... }),
  Task({ subagent_type: 'research-technical', ... })
])
```

❌ **Sequential invocation (slow)**
```typescript
// BAD: Sequential (2x slower)
const breadth = await Task({ subagent_type: 'research-breadth', ... });
const technical = await Task({ subagent_type: 'research-technical', ... });

// GOOD: Parallel (fast)
const [breadth, technical] = await Promise.all([
  Task({ subagent_type: 'research-breadth', ... }),
  Task({ subagent_type: 'research-technical', ... })
]);
```

❌ **Copying agent outputs verbatim**
```markdown
# BAD: Three separate sections
## From research-breadth
[paste agent output]

## From research-depth
[paste agent output]

## From research-technical
[paste agent output]
```

✅ **GOOD: Synthesized narrative**
```markdown
## Findings

The industry standard approach (Perplexity survey) is to use X pattern,
which is officially implemented via Y API (Context7: library docs).

A case study from Z company (Firecrawl: blog post) demonstrates this
pattern handling edge case A and B, with gotcha C to watch for.

**Recommendation**: Implement using official Y API following pattern X,
with special handling for edge cases A and B.
```

---

## Example: Complete Research Flow

**User asks**: "How do I implement real-time notifications in a Next.js app?"

**Step 1: Analyze** → New technology + implementation details
→ Use: research-breadth + research-technical

**Step 2: Launch Agents**
```typescript
const [breadth, technical] = await Promise.all([
  Task({
    subagent_type: 'research-breadth',
    description: 'Survey real-time notification patterns',
    prompt: `Research real-time notifications in Next.js ecosystem.

    Cover: WebSockets vs SSE vs Polling, popular libraries,
    scalability patterns, industry trends.`
  }),

  Task({
    subagent_type: 'research-technical',
    description: 'Official Next.js docs for real-time features',
    prompt: `Research Next.js official documentation for real-time features.

    Cover: Server actions, streaming, route handlers,
    WebSocket support, deployment considerations.`
  })
]);
```

**Step 3: Synthesize**
```markdown
## Research Findings: Real-time Notifications in Next.js

Industry research (Perplexity) shows three common approaches:

1. **Server-Sent Events (SSE)** - Most popular for Next.js (unidirectional)
2. **WebSockets** - For bidirectional real-time
3. **Polling** - Fallback for simple cases

Official Next.js documentation (Context7) indicates:
- Route handlers support SSE via ReadableStream
- Server actions don't support streaming responses
- WebSocket requires custom server or third-party service
- Vercel deployment: SSE supported, WebSockets need external service

**Recommendation**: Use SSE via Next.js route handlers for notification
delivery. This aligns with framework capabilities (official docs) and
industry best practices (survey).

For bidirectional needs, consider third-party service (Pusher, Ably) or
custom WebSocket server.

**Implementation Path**:
1. Create API route handler returning ReadableStream
2. Client uses EventSource to consume stream
3. Handle reconnection and error cases
4. Consider Vercel limitations for deployment

**Sources**:
- [Perplexity] Real-time patterns in Next.js ecosystem 2024-2025
- [Context7] Next.js Route Handlers - Streaming Responses
```

---

## Quick Reference

| Scenario | Agents | Why |
|----------|--------|-----|
| New tech/framework | breadth + technical | Industry patterns + Official API |
| Specific error/bug | depth + technical | Detailed solutions + API reference |
| API integration | technical + depth | Official docs + Real examples |
| Best practices | breadth + depth | Industry trends + Case studies |
| Comparison/decision | breadth + depth | Broad survey + Detailed experiences |
| Official API only | technical | Just need official documentation |

**Default when unsure**: breadth + technical (covers both patterns and official implementation)

---

## Integration Points

This pattern is used by:
- **`/research` command** (essentials) - User-initiated research
- **`implementing-tasks` skill** (experimental) - Automatic research when task STUCK
- **`planning` skill** (experimental) - Uses exploration agents (different category)

For exploration (codebase understanding) use:
- **architecture-explorer** + **codebase-analyzer** (both in parallel)

For review (code quality) use:
- **test-coverage-analyzer** + **error-handling-reviewer** + **security-reviewer** (all 3 in parallel)
