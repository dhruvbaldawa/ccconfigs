---
name: prompt-engineering
description: Systematic prompt engineering methodology using Anthropic 2025 best practices. Balances simplicity, cost, and effectiveness. Reference framework for creating and optimizing prompts.
---

# Prompt Engineering

---

## LEVEL 1: QUICKSTART ⚡

**5-Step Prompt Creation:**

1. **Start Clear**: Explicit instructions + success criteria
2. **Assess Need**: Does it need structure? Examples? Reasoning?
3. **Add Sparingly**: Only techniques that improve outcomes
4. **Estimate Cost**: Count tokens, identify caching opportunities
5. **Test & Iterate**: Measure effectiveness, refine based on results

---

## LEVEL 2: CORE PHILOSOPHY 🎯

### The Three Principles

**Simplicity First**
- Start with minimal prompt
- Add complexity only when empirically justified
- More techniques ≠ better results

**Cost Awareness**
- Minimize token usage
- Leverage prompt caching (90% savings on repeated content)
- Batch processing for non-urgent work (50% savings)

**Effectiveness**
- Techniques must improve outcomes for YOUR use case
- Measure impact, don't just apply best practices
- Iterate based on results

---

## LEVEL 3: THE 9 TECHNIQUES 🛠️

### Quick Reference

| Technique | When to Use | Cost Impact |
|-----------|------------|-------------|
| **1. Clarity** | ALWAYS | Minimal, max impact |
| **2. XML Structure** | Complex prompts, instruction leakage | ~50-100 tokens |
| **3. Chain of Thought** | Reasoning, analysis, math | 2-3x output tokens |
| **4. Multishot Examples** | Pattern learning, format guidance | 200-1K tokens each |
| **5. System Role** | Domain expertise needed | Minimal (caches well) |
| **6. Prefilling** | Strict format requirements | Minimal |
| **7. Long Context** | 20K+ token inputs | Better accuracy |
| **8. Context Budget** | Repeated use, long conversations | 90% savings with cache |
| **9. Tool Docs** | Function calling, agents | 100-500 tokens per tool |

---

## LEVEL 4: DESIGN FRAMEWORK 📋

### D - Define Requirements

**Questions to Answer:**
- Core task?
- Output format?
- Constraints (latency/cost/accuracy)?
- One-off or repeated?

### E - Estimate Complexity

**Simple:**
- Extraction, formatting
- Simple Q&A
- Clear right answer

**Medium:**
- Analysis with reasoning
- Code generation
- Multi-step but clear

**Complex:**
- Deep reasoning
- Novel problem-solving
- Research synthesis

### S - Start Simple

**Minimal Viable Prompt:**
1. Clear instruction
2. Success criteria
3. Output format

Test first. Add complexity only if underperforming.

### I - Iterate Selectively

**Add techniques based on gaps:**
- Unclear outputs → More clarity, examples
- Wrong structure → XML tags, prefilling
- Shallow reasoning → Chain of thought
- Pattern misses → Multishot examples

### G - Guide on Cost

**Cost Optimization:**
- Cache system prompts, reference docs (90% savings)
- Batch non-urgent work (50% savings)
- Minimize token usage through clear, concise instructions

### N - Note Implementation

**Deliverables:**
- The optimized prompt
- Techniques applied + rationale
- Techniques skipped + why
- Token estimate
- Caching strategy

---

## LEVEL 5: ADVANCED TOPICS 🚀

### Tool Integration

**When to use MCP tools during prompt engineering:**

```
Need latest practices?
└─ mcp__perplexity__search

Complex analysis needed?
└─ mcp__sequential-thinking__sequentialthinking

Need library docs?
└─ mcp__context7__get-library-docs
```

### Context Management

**Prompt Caching:**
- Cache: System prompts, reference docs, examples
- Savings: 90% on cached content
- Write: 25% of standard cost
- Read: 10% of standard cost

**Long Context Tips:**
- Place documents BEFORE queries
- Use XML tags: `<document>`, `<source>`
- Ground responses in quotes
- 30% better performance with proper structure

### Token Optimization

**Reducing Token Usage:**
- Concise, clear instructions (no fluff)
- Reuse examples across calls (cache them)
- Structured output reduces back-and-forth
- Tool use instead of long context when possible

### Anti-Patterns

❌ **Over-engineering** - All 9 techniques for simple task
❌ **Premature optimization** - Complexity before testing simple
❌ **Vague instructions** - "Analyze this" without specifics
❌ **No examples** - Expecting format inference
❌ **Missing structure** - Long prompts without XML
❌ **Ignoring caching** - Not leveraging repeated content

**Stop here if:** You need advanced implementation details

---

## LEVEL 6: REFERENCES 📚

### Deep Dive Documentation

**Detailed Technique Catalog:**
- `reference/technique-catalog.md` - Each technique explained with examples, token costs, combination strategies

**Real-World Examples:**
- `reference/examples.md` - Before/after pairs for coding, analysis, extraction, agent tasks

**Research Papers:**
- `reference/research.md` - Latest Anthropic research, benchmarks, best practices evolution
