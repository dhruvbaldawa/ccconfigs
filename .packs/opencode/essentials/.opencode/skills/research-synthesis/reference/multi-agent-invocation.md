# Multi-Agent Invocation Pattern

Guide for using specialized research agents in parallel for comprehensive investigation.

## Research Agents Overview

| Agent | Tool | Use Cases | Output |
|-------|------|-----------|--------|
| **research-breadth** (haiku, blue) | Perplexity | Industry trends, best practices, multiple perspectives, comparative analyses, "What are common patterns?" | Narrative patterns with consensus, confidence ratings, contradictions |
| **research-depth** (haiku, purple) | Firecrawl | Specific URLs, detailed implementations, code examples, gotchas, "How did X implement Y?" | Source-by-source analysis with code, tradeoffs, applicability |
| **research-technical** (haiku, green) | Context7 | Official docs, API signatures, TypeScript types, configs, migration guides, "What's the official API?" | Exact API specs with types, configurations, official examples |

## Agent Selection Decision Tree

| Question Type | Agent Combination | Rationale |
|--------------|-------------------|-----------|
| **New technology/framework** | breadth + technical | Industry patterns + Official API |
| **Specific error/bug** | depth + technical | Detailed solutions + API reference |
| **API integration** | technical + depth | Official docs + Real examples |
| **Best practices/patterns** | breadth + depth | Industry trends + Case studies |
| **Comparison/decision** | breadth + depth | Broad survey + Detailed experiences |
| **Official API only** | technical | Just need documentation |

**Default when unsure**: breadth + technical

## Parallel Invocation Syntax

**Always use Promise.all for parallel execution:**

```typescript
await Promise.all([
  Task({
    subagent_type: 'research-breadth',  // or 'research-depth' or 'research-technical'
    model: 'haiku',
    description: 'Brief description',
    prompt: `Specific research question with focus areas and MCP tool guidance`
  }),

  Task({
    subagent_type: 'research-technical',
    model: 'haiku',
    description: 'Brief description',
    prompt: `Specific research question with focus areas and MCP tool guidance`
  })
]);
```

## Common Patterns

### Pattern 1: New Technology
**Scenario**: Learning a new framework
**Agents**: breadth + technical
**Focus**: breadth (architectural patterns, industry trends), technical (official API, configs)
**Consolidation**: Industry patterns → Official implementation

### Pattern 2: Specific Solution
**Scenario**: Debugging or implementing known solution
**Agents**: depth + technical
**Focus**: depth (blog posts, implementations, gotchas), technical (official API, types)
**Consolidation**: Real-world patterns → Official API usage

### Pattern 3: API Integration
**Scenario**: Integrating with library/API
**Agents**: technical + depth
**Focus**: technical (official API, error codes), depth (tutorials, testing approaches)
**Consolidation**: Official API first → Battle-tested patterns

### Pattern 4: Comparative Analysis
**Scenario**: Choosing between approaches
**Agents**: breadth + depth
**Focus**: breadth (comparisons, trends), depth (migration experiences, lessons)
**Consolidation**: Industry trends → Real experiences

## Synthesis Strategy

Use **research-synthesis skill** to consolidate findings:

1. **Consolidate**: Group by theme, identify consensus, note contradictions
2. **Narrativize**: Weave findings into story (not bullet dumps): "Industry uses X (breadth), implemented via Y (technical), as shown by Z (depth)"
3. **Attribute**: Link claims to sources, note which agent provided insights
4. **Identify Gaps**: Unanswered questions, contradictions, disagreements
5. **Extract Actions**: Implementation path, code/configs, risks, constraints

## Anti-Patterns vs Best Practices

| ❌ Anti-Pattern | ✅ Best Practice |
|----------------|------------------|
| Single agent for multi-faceted question | 2-3 agents for comprehensive coverage |
| Sequential: `await` each agent | Parallel: `Promise.all([...])` |
| Copy agent outputs verbatim in sections | Synthesize into narrative with attribution |
| Skip source attribution | Note which agent/source for each claim |
| List findings separately | Weave into coherent story |

## Complete Example

**User**: "How do I implement real-time notifications in Next.js?"

**Step 1: Analyze** → New technology + implementation
**Step 2: Launch** → breadth + technical in parallel
**Step 3: Synthesize**:

```markdown
## Findings

Industry research shows three approaches: SSE (most popular for Next.js), WebSockets
(bidirectional), Polling (fallback). Official Next.js docs indicate route handlers
support SSE via ReadableStream, but WebSockets require external service on Vercel.

**Recommendation**: Use SSE via Next.js route handlers - aligns with framework
capabilities and industry best practices.

**Implementation**: Create API route with ReadableStream → Client uses EventSource
→ Handle reconnection/errors → Consider Vercel limitations

**Sources**: [Perplexity] Next.js real-time patterns 2024-2025 | [Context7] Next.js Route Handlers
```

## Integration Points

**Used by**:
- `/research` command (essentials) - User-initiated research
- `implementing-tasks` skill (experimental) - Auto-launch when STUCK
- `planning` skill (experimental) - Uses exploration agents instead

**Other agent categories**:
- **Exploration** (codebase): architecture-explorer + codebase-analyzer (parallel)
- **Review** (code quality): test-coverage + error-handling + security (all 3 parallel)
