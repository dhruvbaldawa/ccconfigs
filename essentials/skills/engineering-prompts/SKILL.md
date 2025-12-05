---
name: engineering-prompts
description: Engineers effective prompts using systematic methodology. Use when designing prompts for Claude, optimizing existing prompts, or balancing simplicity, cost, and effectiveness. Applies progressive disclosure and empirical validation to prompt development.
---

# Engineering Prompts

---

## LEVEL 1: QUICKSTART ⚡

**Foundation First (Always Apply):**

1. **Clarity**: Explicit instructions + success criteria
2. **Context & Motivation**: Explain WHY, not just WHAT
3. **Positive Framing**: Say what TO do, not what NOT to do

**Then Assess:**

4. **Simple task?** → Stop here. Foundation is enough.
5. **Complex task?** → Add advanced techniques sparingly
6. **Test & Iterate**: Measure effectiveness, refine based on results

> **Key insight**: The best prompt achieves goals with minimum necessary structure.

---

## LEVEL 2: DIAGNOSTICS 🔧

**Output Problems → Solutions:**

| Problem | Solution |
|---------|----------|
| Too generic | Add specificity + examples |
| Off-topic | Add context explaining goals |
| Wrong format | Examples or prefilling |
| Unreliable on complex tasks | Prompt chaining |
| Unnecessary preambles | Prefill or "start directly with..." |
| Hallucinations | "If unsure, acknowledge uncertainty" |
| Shallow reasoning | Chain of thought |

**Process Problems → Fixes:**

| Mistake | Fix |
|---------|-----|
| Over-engineering | Start minimal, add only what helps |
| Negative framing | Say what TO do instead |
| No motivation | Explain the WHY |
| No iteration | Test, measure, refine |

---

## LEVEL 3: THE 12 TECHNIQUES 🛠️

### Foundation (Always Apply)

| Technique | What It Does | Cost |
|-----------|--------------|------|
| **1. Clarity** | Explicit instructions, success criteria | Minimal |
| **2. Context & Motivation** | Explain WHY you want something | Minimal |
| **3. Positive Framing** | Say what TO do, not what NOT to do | Minimal |
| **4. XML Structure** | Separate sections in complex prompts | ~50-100 tokens |

> **Note**: XML is less essential with Claude 4.x - use when genuinely needed.

### Advanced (Apply When Needed)

| Technique | When to Use | Cost |
|-----------|-------------|------|
| **5. Chain of Thought** | Reasoning, analysis, math | 2-3x output |
| **6. Prompt Chaining** | Multi-step, complex tasks | Multiple calls |
| **7. Multishot Examples** | Pattern learning, format | 200-1K each |
| **8. System Role** | Domain expertise needed | Minimal |
| **9. Prefilling** | Strict format requirements | Minimal |
| **10. Long Context** | 20K+ token inputs | Better accuracy |
| **11. Context Budget** | Repeated use, conversations | 90% savings |
| **12. Tool Docs** | Function calling, agents | 100-500/tool |

---

## LEVEL 4: DESIGN CHECKLIST 📋

**Before Writing:**
- [ ] Core task clear?
- [ ] Output format defined?
- [ ] Constraints known? (latency/cost/accuracy)
- [ ] One-off or repeated use?

**Complexity Assessment:**
- Simple (extraction, Q&A) → Foundation only
- Medium (analysis, code gen) → + CoT, examples
- Complex (research, novel problems) → + Chaining, role

**Cost Optimization:**
- Cache system prompts + reference docs (90% savings)
- Batch non-urgent work (50% savings)
- Skip CoT for simple tasks (saves 2-3x)

**Deliverable:**
- Prompt + techniques used + rationale + token estimate

---

## LEVEL 5: ADVANCED TOPICS 🚀

### Tool Integration

**When to use MCP tools during prompt engineering:**

```
Need latest practices?
└─ mcp__plugin_essentials_perplexity

Complex analysis needed?
└─ mcp__plugin_essentials_sequential-thinking

Need library docs?
└─ mcp__plugin_essentials_context7
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

### Cost-Specific Anti-Patterns

❌ **Ignoring caching** - Not leveraging repeated content (90% savings lost)
❌ **Over-requesting CoT** - Chain of thought for simple tasks (2-3x wasted)
❌ **Redundant examples** - 5 examples when 2 suffice
❌ **No batching** - Real-time calls for non-urgent work (50% savings lost)

See **LEVEL 2: Diagnostics** for general fixes.

---

## LEVEL 6: REFERENCES 📚

### Deep Dive Documentation

**Detailed Technique Catalog:**
- `reference/technique-catalog.md` - Each technique explained with examples, token costs, combination strategies

**Real-World Examples:**
- `reference/examples.md` - Before/after pairs for coding, analysis, extraction, agent tasks

**Research Papers:**
- `reference/research.md` - Latest Anthropic research, benchmarks, best practices evolution
