---
name: research-synthesis
description: Guide when to use Perplexity, Firecrawl, or Context7 for research. Synthesize findings into narrative for braindump. Use when gathering data, examples, or citations for blog posts.
---

# Research Synthesis

## When to Use This Skill

Use research-synthesis when:
- User mentions a claim that needs supporting data
- Need recent examples or trends ("what's happening with X lately?")
- Looking for citations or authoritative sources
- Extracting information from specific URLs
- Checking technical documentation or library APIs
- Filling gaps in knowledge during brainstorming or drafting

Skip when:
- Information is clearly from personal experience (no need to verify)
- User explicitly says "I don't need research, just write"
- Topic is purely opinion-based without factual claims

## MCP Tool Selection

### Perplexity (Broad Research)

**Use for:**
- Recent trends, news, or developments ("what's the latest on X?")
- Statistical data or research findings
- Multiple perspectives on a topic
- Discovering examples or case studies
- General knowledge gaps

**Examples:**
- "Recent research on OKR implementation failures"
- "Companies that abandoned agile methodologies"
- "Studies on remote work productivity metrics"

**How to invoke:**
```
AI: Let me research recent examples...
    [uses Perplexity]
    Found several relevant data points - adding to braindump...
```

### Firecrawl (Specific URL Extraction)

**Use for:**
- User mentions specific article or blog post
- Extracting content from known URLs
- Getting full text from referenced sources
- When user says "check out this article..."

**Examples:**
- User: "There's a good HBR article on this"
- User: "Add this to research: https://..."
- Extracting quotes from referenced articles

**How to invoke:**
```
AI: I'll extract the key points from that article...
    [uses Firecrawl]
    Here's what I found - should I add this to braindump?
```

### Context7 (Technical Documentation)

**Use for:**
- Library or framework documentation
- API references
- Technical specifications
- When writing about specific technologies

**Examples:**
- "How does React's useEffect actually work?"
- "What are the official recommendations for X?"
- "Check the latest API docs for Y"

**How to invoke:**
```
AI: Let me check the official docs...
    [uses Context7]
    According to the documentation...
```

## Decision Tree

```
Need research?
├─ Specific URL mentioned? → Firecrawl
├─ Technical docs/APIs? → Context7
└─ Everything else → Perplexity
```

## Synthesizing Findings

### Don't Just Dump Data

**Bad:**
```
Research shows:
- Stat 1
- Stat 2
- Stat 3
[Added to braindump]
```

**Good:**
```
Found interesting pattern: 3 recent studies show 60-70% of OKR
implementations fail to improve performance. Notable:
- HBR research: 70% failure rate, primarily due to metric gaming
- McKinsey: Companies with >100 OKRs see diminishing returns
- Google's evolution: Shifted from strict OKRs to "goals and signals"

Key insight: Failure correlates with treating OKRs as compliance
exercise rather than alignment tool.

[Added to braindump under Research]
```

### Synthesize Patterns, Not Lists

Look for:
- **Patterns**: What do multiple sources agree on?
- **Contradictions**: Where do sources disagree?
- **Gaps**: What's missing from the research?
- **Surprises**: What's unexpected or counterintuitive?

### Maintain Source Attribution

Format for citations in braindump:
```markdown
## Research

### OKR Implementation Failures
Studies show 60-70% failure rate (HBR, McKinsey).
Primary causes: metric gaming, checkbox compliance.

**Sources:**
- HBR: "Why OKRs Don't Work" - 70% fail to improve performance
- McKinsey: Survey of 500 companies, correlation with OKR count
- Google's blog: Evolution of their goals system over recent years

**Key Quote:**
> "When OKRs become a performance evaluation tool, they stop being
> a planning tool." - John Doerr, Measure What Matters
```

## Integration with Conversation

Research should flow naturally, not interrupt:

### Proactive Research
```
You: I think OKRs fail because of Goodhart's Law

AI: That's a strong claim - let me check recent data...
    [uses Perplexity]

    Good intuition! Found 3 studies that confirm this:
    [synthesized findings]

    Adding this to braindump under Research. Want to explore
    why Goodhart's Law applies specifically to OKRs?
```

### User-Requested Research
```
You: Find examples of companies that abandoned OKRs

AI: [uses Perplexity]
    Found several notable cases:
    - Company X: Switched to narrative planning (Amazon style)
    - Company Y: Reverted to simpler quarterly goals
    - Google: Evolved to "Goals and Signals" framework

    Should I add all of these to braindump, or focus on
    one specific approach?
```

### During Drafting
```
You: I need a citation for this claim

AI: [uses Perplexity]
    Found supporting research:
    [citation details]

    I'll add this to the draft with proper attribution.
```

## Adding to Braindump

Always ask before updating braindump.md (unless context is clear):

```
AI: I found X, Y, and Z. Should I add this to braindump
    under Research, or would you like to review first?
```

Update structured sections:
- **Research**: Studies, data, citations
- **Examples**: Concrete cases and stories
- **Quotes**: Notable quotations with attribution
- **Sources**: Full references for later citation

## Quality Standards

Before adding research to braindump:
- [ ] Synthesized into narrative, not just listed
- [ ] Source attribution included
- [ ] Relevance to core argument is clear
- [ ] Key insights or patterns highlighted
- [ ] Contradictions or gaps noted if relevant

## Common Pitfalls to Avoid

1. **Information Overload**: Don't dump 20 sources - synthesize 3-5 key findings
2. **Missing Attribution**: Always cite sources for later reference
3. **Irrelevant Research**: Just because you found it doesn't mean it's useful
4. **Breaking Flow**: Don't interrupt creative flow for minor fact-checks
5. **Uncritical Acceptance**: Note when sources disagree or have limitations

## Example Flow

For detailed conversation examples showing research synthesis techniques and MCP tool usage, see reference/examples.md.

## Integration with Other Skills

- **During brainstorming**: Research validates or challenges initial ideas
- **During drafting (blog-writing)**: Research provides citations and examples
- **Throughout**: Update braindump.md with structured findings
