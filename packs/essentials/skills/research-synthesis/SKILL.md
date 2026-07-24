---
name: research-synthesis
description: Guide when to use built-in tools (WebFetch, WebSearch) and MCP servers (Parallel Search, Perplexity, Context7) for research. Synthesize findings into narrative for braindump. Use when gathering data, examples, or citations for blog posts.
---

# Research Synthesis

## When to Use

Use when:
- User claims need supporting data
- Need recent examples/trends
- Looking for citations or authoritative sources
- Extracting info from specific URLs
- Checking technical docs or library APIs
- Filling knowledge gaps during brainstorming/drafting

Skip when:
- Info clearly from personal experience
- User says "don't research, just write"
- Topic is purely opinion-based

## Critical: Never Hallucinate

**Only use REAL research from MCP tools. Never invent:**
- Statistics/percentages
- Study names/researchers
- Company examples/case studies
- Technical specs/benchmarks
- Quotes/citations

**If no data found:**
❌ BAD: "Research shows 70% of OKR implementations fail..."
✅ GOOD: "I don't have data on OKR failure rates. Should I research using Perplexity?"

**Before adding to braindump:**
- Verify came from MCP tool results (not training data)
- Include source attribution always
- If uncertain, say so
- Don't fill in missing details with assumptions

## Research Tool Selection (Priority Order)

### Priority 1: Built-in Tools (Always Try First)

| Tool | Use For | Examples |
|------|---------|----------|
| **WebFetch** | Specific URLs, extracting article content, user-mentioned sources | User: "Check this article: https://..." |
| **WebSearch** | Recent trends/news, statistical data, multiple perspectives, general knowledge gaps | "Recent research on OKR failures", "Companies that abandoned agile" |

### Priority 2: Parallel Search (Advanced Synthesis)

| Tool | Use For | Examples |
|------|---------|----------|
| **Parallel Search** | Advanced web search with agentic mode, fact-checking, competitive intelligence, multi-source synthesis, deep URL extraction | Complex queries needing synthesis, validation across sources, extracting full content from URLs |

### Priority 3: Perplexity (Broad Surveys)

| Tool | Use For | Examples |
|------|---------|----------|
| **Perplexity** | Broad surveys when WebSearch/Parallel insufficient | Industry consensus, statistical data, multiple perspectives |

### Priority 4: Context7 (Technical Docs)

| Tool | Use For | Examples |
|------|---------|----------|
| **Context7** | Library/framework docs, API references, technical specifications | "How does React useEffect work?", "Check latest API docs" |

**Decision tree:**
```
Need research?
├─ Specific URL? → WebFetch → Parallel Search
├─ Technical docs/APIs? → Context7
├─ General search? → WebSearch → Parallel Search → Perplexity
└─ Complex synthesis? → Parallel Search
```

**Rationale:** Built-in tools (WebFetch, WebSearch) are faster and always available. Parallel Search provides advanced agentic mode for synthesis and deep content extraction. Perplexity offers broad surveys when needed. Context7 for official docs only.

## Synthesizing Findings

### Patterns, Not Lists

❌ **Bad** (data dump):
```
Research shows:
- Stat 1
- Stat 2
- Stat 3
```

✅ **Good** (synthesized narrative):
```
Found pattern: 3 recent studies show 60-70% OKR failure rates.
- HBR: 70% failure, metric gaming primary cause
- McKinsey: >100 OKRs correlate with diminishing returns
- Google: Shifted from strict OKRs to "goals and signals"

Key insight: Failure correlates with treating OKRs as compliance exercise.
```

### Look For

- **Patterns**: What do multiple sources agree on?
- **Contradictions**: Where do sources disagree?
- **Gaps**: What's missing?
- **Surprises**: What's unexpected or counterintuitive?

### Source Attribution Format

```markdown
## Research

### OKR Implementation Failures
60-70% failure rate (HBR, McKinsey). Primary causes: metric gaming, checkbox compliance.

**Sources:**
- HBR: "Why OKRs Don't Work" - 70% fail to improve performance
- McKinsey: Survey of 500 companies
- Google blog: Evolution of goals system

**Key Quote:**
> "When OKRs become performance evaluation, they stop being planning."
> - John Doerr, Measure What Matters
```

## Integration with Conversation

Research flows naturally into conversation:

**Proactive**: "That's a strong claim - let me check data... [uses tool] Good intuition! Found 3 confirming studies. Adding to braindump."

**Requested**: "Find X... [uses tool] Found several cases. Should I add all to braindump or focus on one approach?"

**During Drafting**: "Need citation... [uses tool] Found supporting research. Adding to draft with attribution."

## Adding to Braindump

Always ask before updating (unless context is clear): "Found X, Y, Z. Add to braindump under Research?"

Update sections:
- **Research**: Studies, data, citations
- **Examples**: Concrete cases and stories
- **Quotes**: Notable quotations with attribution
- **Sources**: Full references

## Quality Checklist

Before adding to braindump:
- [ ] Synthesized into narrative, not just listed
- [ ] Source attribution included
- [ ] Relevance to core argument clear
- [ ] Key insights/patterns highlighted
- [ ] Contradictions/gaps noted if relevant

## Common Pitfalls

1. **Information overload**: Synthesize 3-5 key findings, not 20 sources
2. **Missing attribution**: Always cite for later reference
3. **Irrelevant research**: Found ≠ useful
4. **Breaking flow**: Don't interrupt creative flow for minor fact-checks
5. **Uncritical acceptance**: Note when sources disagree/have limitations

## Integration with Other Skills

- **brainstorming**: Research validates/challenges ideas
- **blog-writing**: Provides citations and examples
- **Throughout**: Update braindump.md with structured findings

For detailed examples, see reference/examples.md
