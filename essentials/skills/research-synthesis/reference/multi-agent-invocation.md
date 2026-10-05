# Multi-Agent Invocation Pattern

Guide for using specialized research agents in parallel for comprehensive investigation.

## Research Agent Overview

One agent, `experimental:research:researcher` (haiku), runs in the mode named at the start of its prompt:

| Mode | Leads with | Use Cases | Output |
|------|-----------|-----------|--------|
| **survey** | WebSearch | Industry trends, best practices, multiple perspectives, comparative analyses, "What are common patterns?" | Narrative patterns with consensus, confidence ratings, contradictions |
| **deep-dive** | WebFetch on named sources | Specific URLs, detailed implementations, code examples, gotchas, "How did X implement Y?" | Source-by-source analysis with code, tradeoffs, applicability |
| **official-docs** | Official-documentation tool | Official docs, API signatures, types, configs, migration guides, "What's the official API?" | Exact API specs with types, configurations, official examples |

## Mode Selection Decision Tree

| Question Type | Modes | Rationale |
|--------------|-------------------|-----------|
| **New technology/framework** | survey + official-docs | Industry patterns + Official API |
| **Specific error/bug** | deep-dive + official-docs | Detailed solutions + API reference |
| **API integration** | official-docs + deep-dive | Official docs + Real examples |
| **Best practices/patterns** | survey + deep-dive | Industry trends + Case studies |
| **Comparison/decision** | survey + deep-dive | Broad survey + Detailed experiences |
| **Official API only** | technical | Just need documentation |

**Default when unsure**: survey + official-docs

## Parallel Invocation

Launch every agent in a single message (multiple Agent tool calls in one response); one call per message runs them sequentially. Each prompt: the specific research question, focus areas, and which tools to prefer.

## Common Patterns

### Pattern 1: New Technology
**Scenario**: Learning a new framework
**Agents**: survey + official-docs
**Focus**: survey (architectural patterns, industry trends), official-docs (official API, configs)
**Consolidation**: Industry patterns → Official implementation

### Pattern 2: Specific Solution
**Scenario**: Debugging or implementing known solution
**Agents**: deep-dive + official-docs
**Focus**: depth (blog posts, implementations, gotchas), technical (official API, types)
**Consolidation**: Real-world patterns → Official API usage

### Pattern 3: API Integration
**Scenario**: Integrating with library/API
**Agents**: official-docs + deep-dive
**Focus**: technical (official API, error codes), depth (tutorials, testing approaches)
**Consolidation**: Official API first → Battle-tested patterns

### Pattern 4: Comparative Analysis
**Scenario**: Choosing between approaches
**Agents**: survey + deep-dive
**Focus**: survey (comparisons, trends), deep-dive (migration experiences, lessons)
**Consolidation**: Industry trends → Real experiences

## Synthesis Strategy

Use **research-synthesis skill** to consolidate findings:

1. **Consolidate**: Group by theme, identify consensus, note contradictions
2. **Narrativize**: Weave findings into story (not bullet dumps): "Industry uses X (survey), implemented via Y (official-docs), as shown by Z (deep-dive)"
3. **Attribute**: Link claims to sources, note which agent provided insights
4. **Identify Gaps**: Unanswered questions, contradictions, disagreements
5. **Extract Actions**: Implementation path, code/configs, risks, constraints

## Anti-Patterns vs Best Practices

| ❌ Anti-Pattern | ✅ Best Practice |
|----------------|------------------|
| Single agent for multi-faceted question | 2-3 agents for comprehensive coverage |
| Sequential: one Agent call per message | Parallel: all Agent calls in one message |
| Copy agent outputs verbatim in sections | Synthesize into narrative with attribution |
| Skip source attribution | Note which agent/source for each claim |
| List findings separately | Weave into coherent story |

## Complete Example

**User**: "How do I implement real-time notifications in Next.js?"

**Step 1: Analyze** → New technology + implementation
**Step 2: Launch** → survey + official-docs in parallel
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

**Sources**: [WebSearch] Next.js real-time patterns 2024-2025 | [Context7] Next.js Route Handlers
```

## Integration Points

**Used by**:
- `/research` command (essentials) - User-initiated research
- `implementing-tasks` skill (experimental) - Auto-launch when STUCK
