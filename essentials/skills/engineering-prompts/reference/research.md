# Prompt Engineering Research & Best Practices

Latest findings from Anthropic research and community best practices for prompt engineering with Claude models.

## Table of Contents

- [Anthropic's Core Research Findings](#anthropics-core-research-findings)
- [Current-Model Guidance](#current-model-guidance)
- [Effective Context Engineering](#effective-context-engineering)
- [Agent Architecture Best Practices](#agent-architecture-best-practices)
- [Citations and Source Grounding](#citations-and-source-grounding)
- [Adaptive Thinking](#adaptive-thinking)
- [Community Best Practices](#community-best-practices)
- [Technique Selection Decision Tree](#technique-selection-decision-tree)
- [Measuring Prompt Effectiveness](#measuring-prompt-effectiveness)
- [Future Directions](#future-directions)
- [Key Takeaways from Research](#key-takeaways-from-research)
- [Research Sources](#research-sources)
- [Keeping Current](#keeping-current)
- [Research-Backed Anti-Patterns](#research-backed-anti-patterns)

---

## Anthropic's Core Research Findings

### 1. Prompt Engineering vs Fine-Tuning

**Key Finding:** Prompt engineering is preferable to fine-tuning for most use cases.

**Advantages:**
- **Speed**: Nearly instantaneous results vs hours/days for fine-tuning
- **Cost**: Uses base models, no GPU resources required
- **Flexibility**: Rapid experimentation and quick iteration
- **Data Requirements**: Works with few-shot or zero-shot learning
- **Knowledge Preservation**: Avoids catastrophic forgetting of general capabilities
- **Transparency**: Prompts are human-readable and debuggable

**When Fine-Tuning Wins:**
- Extremely consistent style requirements across millions of outputs
- Domain-specific jargon that's rare in training data
- Performance optimization for resource-constrained environments

**Source:** Anthropic Prompt Engineering Documentation

---

### 2. Long Context Window Performance

**Key Finding:** Document placement dramatically affects accuracy in long context scenarios.

**Research Results:**
- Placing documents BEFORE queries improves performance by up to 30%
- Claude experiences "lost in the middle" phenomenon like other LLMs
- XML structure helps Claude organize and retrieve from long contexts
- Quote grounding (asking Claude to quote relevant sections first) cuts through noise

**Optimal Pattern:**
```xml
<document id="1">
  <metadata>...</metadata>
  <content>...</content>
</document>
<!-- More documents -->

<instructions>
[Query based on documents]
</instructions>
```

**Source:** Claude Long Context Tips Documentation

---

### 3. Reasoning Depth

**Key Finding:** Reasoning before answering improves accuracy on analytical tasks - and on current models it happens without prompting.

**Results:**
- Adaptive thinking is on by default; the model decides when and how much to reason
- `output_config.effort` is the lever for depth; prose incantations are redundant and scripted reasoning steps cause over-planning
- Most benefit for: math, logic, multi-step analysis, debugging, long agentic runs

**Implementation Evolution:**
- Early: "think step by step" prompts and `<thinking>` tags
- Then: extended thinking with a fixed `budget_tokens`
- Now: adaptive thinking always on; depth via `effort`; `budget_tokens` rejected on current models

**Source:** Anthropic Extended Thinking Documentation

---

### 4. Prompt Caching Economics

**Key Finding:** Prompt caching can reduce costs by 90% for repeated content.

**Cost Structure:**
- Cache write: 25% of standard input token cost
- Cache read: 10% of standard input token cost
- Effective savings: ~90% for content that doesn't change

**Optimal Use Cases:**
- System prompts (stable across calls)
- Reference documentation (company policies, API docs)
- Examples in multishot prompting (reused across calls)
- Long context documents (analyzed repeatedly)

**Architecture Pattern:**
```
[Stable content - caches]
└─ System prompt
└─ Reference docs
└─ Guidelines

[Variable content - doesn't cache]
└─ User query
└─ Specific inputs
```

**ROI Example:**
- 40K token system prompt + docs
- 1,000 queries/day
- Without caching: $3.60/day (Sonnet)
- With caching: $0.36/day
- Savings: $1,180/year per 1K daily queries

**Source:** Anthropic Prompt Caching Announcement

---

### 5. XML Tags Fine-Tuning

**Key Finding:** Claude has been specifically fine-tuned to pay attention to XML tags.

**Why It Works:**
- Training included examples of XML-structured prompts
- Model learned to treat tags as hard boundaries
- Prevents instruction leakage from user input
- Improves retrieval from long contexts

**Best Practices:**
- Use semantic tag names (`<instructions>`, `<context>`, `<examples>`)
- Nest tags for hierarchy when appropriate
- Consistent tag structure across prompts (helps with caching)
- Close all tags properly

**Source:** AWS ML Blog on Anthropic Prompt Engineering

---

### 6. Contextual Retrieval

**Key Finding:** Encoding context with chunks dramatically improves RAG accuracy.

**Traditional RAG Issues:**
- Chunks encoded in isolation lose surrounding context
- Semantic similarity can miss relevant chunks
- Failed retrievals lead to incorrect or incomplete responses

**Contextual Retrieval Solution:**
- Encode each chunk with surrounding context
- Combine semantic search with BM25 lexical matching
- Apply reranking for final selection

**Results:**
- 49% reduction in failed retrievals (contextual retrieval alone)
- 67% reduction with contextual retrieval + reranking
- Particularly effective for technical documentation and code

**When to Skip RAG:**
- Knowledge base < 200K tokens (fits in context window)
- With prompt caching, including full docs is cost-effective

**Source:** Anthropic Contextual Retrieval Announcement

---

### 7. Batch Processing Economics

**Key Finding:** Batch API reduces costs by 50% for non-time-sensitive workloads.

**Use Cases:**
- Periodic reports
- Bulk data analysis
- Non-urgent content generation
- Testing and evaluation

**Combined Savings:**
- Batch processing: 50% cost reduction
- Plus prompt caching: Additional 90% on cached content
- Combined potential: 95% cost reduction vs real-time without caching

**Source:** Anthropic Batch API Documentation

---

### 8. Model Capability Tiers

**Research Finding:** Different tasks have optimal model choices based on complexity vs cost. Check the live table (`/claude-api` skill or `client.models.list()`) before pinning a model; the roster below is a snapshot.

| Model | ID | Input/Output $/M | Best for |
|---|---|---|---|
| Claude Fable 5.1 | `claude-fable-5-1` | $10 / $50 | Hardest reasoning, long-horizon agentic work |
| Claude Opus 5 | `claude-opus-5` | $5 / $25 | Default for most work |
| Claude Sonnet 5 | `claude-sonnet-5` | $2 / $10 | Balanced production workloads |
| Claude Haiku 4.5 | `claude-haiku-4-5` | $1 / $5 | High-volume simple tasks (200K context) |

**Architectural Implication:**
- Orchestrator on Opus 5 or Fable 5.1 + cheap subagents on Haiku 4.5 or low-effort Sonnet 5
- Before adding a cheaper model, try the capable model at lower `effort` - it often matches prior-generation quality at lower cost and keeps one cache namespace
- Task routing based on complexity assessment

**Source:** Anthropic model documentation

---

## Current-Model Guidance

Prompts written for older models are often too prescriptive for current ones and reduce output quality. Applies to every technique in this skill:

- State goals, constraints, and how to verify; keep numbered steps only where order genuinely matters
- Control reasoning depth with `effort`, not thinking prose
- Use structured outputs, not assistant prefill (prefill returns a 400 on Claude 4.6+)
- Say the one or two real constraints plainly with their reason; stacked MUST/NEVER markers cause over-triggering
- Remove anti-formatting rules ("never use bullets"); current models under-format, so say when formatting is appropriate instead
- Keep verification instructions ("test before reporting") and tool contract detail; those still earn their place

**Source:** Anthropic model migration guidance

---

## Effective Context Engineering

**Key Research:** Managing attention budget is as important as prompt design.

### The Attention Budget Problem
- LLMs have finite capacity to process and integrate information
- Performance degrades with very long contexts ("lost in the middle")
- n² pairwise relationships for n tokens strains attention mechanism

### Solutions:

**1. Compaction**
- Summarize conversation near context limit
- Reinitiate with high-fidelity summary
- Preserve architectural decisions, unresolved bugs, implementation details
- Discard redundant tool outputs

**2. Structured Note-Taking**
- Maintain curated notes about decisions, findings, state
- Reference notes across context windows
- More efficient than reproducing conversation history

**3. Multi-Agent Architecture**
- Distribute work across agents with specialized contexts
- Each maintains focused context on their domain
- Orchestrator coordinates without managing all context

**4. Context Editing**
- Automatically clear stale tool calls and results
- Preserve conversation flow
- 84% token reduction in 100-turn evaluations
- 29% performance improvement on agentic search tasks

**Source:** Anthropic Engineering Blog - Effective Context Engineering

---

## Agent Architecture Best Practices

**Research Consensus:** Successful agents follow three core principles.

### 1. Simplicity
- Do exactly what's needed, no more
- Avoid unnecessary abstraction layers
- Frameworks help initially, but production often benefits from basic components

### 2. Transparency
- Show explicit planning steps
- Allow humans to verify reasoning
- Enable intervention when plans seem misguided
- "Agent shows its work" principle

### 3. Careful Tool Crafting
- Thorough tool documentation with examples
- Clear descriptions of when to use each tool
- Tested tool integrations
- Agent-computer interface as first-class design concern

**Anti-Pattern:** Framework-heavy implementations that obscure decision-making

**Recommended Pattern:**
- Start with frameworks for rapid prototyping
- Gradually reduce abstractions for production
- Build with basic components for predictability

**Source:** Anthropic Research - Building Effective Agents

---

## Citations and Source Grounding

**Research Finding:** Built-in citation capabilities outperform most custom implementations.

**Citations API Benefits:**
- 15% higher recall accuracy vs custom solutions
- Automatic sentence-level chunking
- Precise attribution to source documents
- Critical for legal, academic, financial applications

**Use Cases:**
- Legal research requiring source verification
- Academic writing with proper attribution
- Fact-checking workflows
- Financial analysis with auditable sources

**Source:** Claude Citations API Announcement

---

## Adaptive Thinking

**Capability:** Current Claude models reason before responding by default, deciding adaptively how much to think.

**Key Parameters:**
- `thinking: {type: "adaptive"}` (or omit - Fable 5.1 has thinking always on)
- `output_config.effort`: `low` / `medium` / `high` / `xhigh` / `max` - the depth control
- `budget_tokens` is rejected on Fable 5/5.1, Opus 5/4.7/4.8, Sonnet 5
- `display: "summarized"` to read a reasoning summary; the raw chain of thought is never returned

**Use Cases:**
- Complex math problems
- Novel coding challenges
- Multi-step reasoning tasks
- Analysis requiring sustained attention

**Combined with Tools:**
- Alternate between reasoning and tool invocation
- Reason about available tools, invoke, analyze results, adjust reasoning
- More sophisticated than fixed reasoning → execution sequences

**Source:** Claude Extended Thinking Documentation

---

## Community Best Practices

### Disable Auto-Compact in Claude Code

**Finding:** Auto-compact can consume 45K tokens (22.5% of context window) before coding begins.

**Recommendation:**
- Turn off auto-compact: `/config` → toggle off
- Use `/clear` after 1-3 messages to prevent bloat
- Run `/clear` immediately after disabling to reclaim tokens
- Regain 88.1% of context window for productive work

**Source:** Shuttle.dev Claude Code Best Practices

### CLAUDE.md Curation

**Finding:** Auto-generated CLAUDE.md files are too generic.

**Best Practice:**
- Manually curate project-specific patterns
- Keep under 100 lines per file
- Include non-obvious relationships
- Document anti-patterns to avoid
- Optimize for AI agent understanding, not human documentation

**Source:** Claude Code Best Practices, Anthropic Engineering

### Custom Slash Commands as Infrastructure

**Finding:** Repeated prompting patterns benefit from reusable commands.

**Best Practice:**
- Store in `.claude/commands/` for project-level
- Store in `~/.claude/commands/` for user-level
- Check into version control for team benefit
- Use `$ARGUMENTS` and `$1, $2, etc.` for parameters
- Encode team best practices as persistent infrastructure

**Source:** Claude Code Documentation

---

## Technique Selection Decision Tree

Based on aggregated research and community feedback:

```
                Start: Define Task
                       ↓
        ┌──────────────┴──────────────┐
        │                             │
   Complexity?                   Repeated Use?
        │                             │
    ┌───┴───┐                    ┌────┴────┐
Simple  Medium  Complex       Yes          No
    │       │       │          │            │
Clarity  +XML   +Role      Cache        One-off
      +effort  +effort    Structure     Design
              +Examples      +XML
              +Tools

Token Budget?
    │
┌───┴───┐
Tight   Flexible
 │          │
Low      Higher effort
effort   Examples

Format Critical?
    │
┌───┴────┐
Yes      No
 │        │
+Structured  Skip
 outputs
+Examples
```

---

## Measuring Prompt Effectiveness

**Research Recommendation:** Systematic evaluation before and after prompt engineering.

### Metrics to Track

**Accuracy:**
- Correctness of outputs
- Alignment with success criteria
- Error rates

**Consistency:**
- Output format compliance
- Reliability across runs
- Variance in responses

**Cost:**
- Tokens per request
- $ cost per request
- Caching effectiveness

**Latency:**
- Time to first token
- Total response time
- User experience impact

### Evaluation Framework

1. **Baseline:** Measure current prompt performance
2. **Iterate:** Apply one technique at a time
3. **Measure:** Compare metrics to baseline
4. **Keep or Discard:** Retain only improvements
5. **Document:** Record which techniques help for which tasks

**Anti-Pattern:** Applying all techniques without measuring effectiveness

---

## Future Directions

### Emerging Trends

**1. Agent Capabilities**
- Models sustaining long-horizon autonomous runs (Fable 5.1)
- Improved context awareness and self-management
- Better tool use and reasoning integration

**2. Cost Curve Collapse**
- Lower effort on the newest models often beats prior-generation models at high effort
- Enables new deployment patterns (parallel subagents)
- Economic feasibility of agent orchestration

**3. Multimodal Integration**
- Vision + text for document analysis
- 60% reduction in document processing time
- Correlation of visual and textual information

**4. Safety and Alignment**
- Research on agentic misalignment
- Importance of human oversight at scale
- System design for ethical constraints

**5. Standardization**
- Model Context Protocol (MCP) for tool integration
- Reduced custom integration complexity
- Ecosystem of third-party tools

---

## Key Takeaways from Research

1. **Simplicity wins**: Start minimal, add complexity only when justified by results
2. **Structure scales**: XML tags become essential as complexity increases
3. **Thinking is automatic**: tune `effort` per workload instead of prompting for reasoning
4. **Caching transforms economics**: 90% savings makes long prompts feasible
5. **Placement matters**: Documents before queries, 30% better performance
6. **Tools need docs**: Clear descriptions → correct usage
7. **Agents need transparency**: Show reasoning, enable human verification
8. **Context is finite**: Manage attention budget deliberately
9. **Measure everything**: Remove techniques that don't improve outcomes
10. **Economic optimization**: Right model and effort for the task (Haiku 4.5 → Sonnet 5 → Opus 5 → Fable 5.1)

---

## Research Sources

- Anthropic Prompt Engineering Documentation
- Anthropic Engineering Blog - Context Engineering
- Anthropic Research - Building Effective Agents
- Claude Code Best Practices (Anthropic)
- Shuttle.dev Claude Code Analysis
- AWS ML Blog - Anthropic Techniques
- Contextual Retrieval Research (Anthropic)
- Anthropic Model Documentation and Migration Guides
- Citations API Documentation
- Extended Thinking Documentation
- Community Best Practices (Multiple Sources)

---

## Keeping Current

**Best Practices:**
- Follow Anthropic Engineering blog for latest research
- Monitor Claude Code documentation updates
- Track community implementations (GitHub, forums)
- Experiment with new capabilities as released
- Measure impact of new techniques on your use cases

**Resources:**
- https://www.anthropic.com/research
- https://www.anthropic.com/engineering
- https://docs.claude.com/
- https://code.claude.com/docs
- Community: r/ClaudeAI, Anthropic Discord

---

## Research-Backed Anti-Patterns

Based on empirical findings, avoid:

❌ **Ignoring Document Placement** - 30% performance loss
❌ **Not Leveraging Caching** - 10x unnecessary costs
❌ **Over-Engineering Simple Tasks** - Worse results + higher cost
❌ **Framework Over-Reliance** - Obscures decision-making
❌ **Skipping Measurement** - Can't validate improvements
❌ **One-Size-Fits-All Prompts** - Suboptimal for specific tasks
❌ **Vague Tool Documentation** - Poor tool selection
❌ **Ignoring Context Budget** - Performance degradation
❌ **No Agent Transparency** - Debugging nightmares
❌ **Wrong Model for Task** - Overpaying or underperforming

---

Verify model names, prices, and API parameters against the `/claude-api` skill before relying on them; they change faster than this summary.