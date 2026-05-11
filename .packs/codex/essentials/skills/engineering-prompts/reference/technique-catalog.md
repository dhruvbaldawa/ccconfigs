# Prompt Engineering Technique Catalog

Deep dive into 12 prompt engineering techniques organized as **4 Foundation** (always apply) + **8 Advanced** (apply when needed), with examples, token costs, and combination strategies.

## Table of Contents

### Foundation Techniques (Always Apply)
- [1. Clarity and Directness](#1-clarity-and-directness)
- [2. Context and Motivation](#2-context-and-motivation)
- [3. Positive Framing](#3-positive-framing)
- [4. XML Structure](#4-xml-structure) *(situational with modern models)*

### Advanced Techniques (Apply When Needed)
- [5. Chain of Thought](#5-chain-of-thought)
- [6. Prompt Chaining](#6-prompt-chaining)
- [7. Multishot Prompting](#7-multishot-prompting)
- [8. System Prompt (Role Assignment)](#8-system-prompt-role-assignment)
- [9. Prefilling](#9-prefilling)
- [10. Long Context Optimization](#10-long-context-optimization)
- [11. Context Budget Management](#11-context-budget-management)
- [12. Tool Documentation](#12-tool-documentation)

### Reference
- [Technique Combination Matrix](#technique-combination-matrix)
- [Decision Framework](#decision-framework)
- [Common Patterns](#common-patterns)
- [Measuring Effectiveness](#measuring-effectiveness)

---

## 1. Clarity and Directness

### What It Is
Clear, explicit instructions that state objectives precisely, including scope and success criteria in unambiguous terms.

### When to Use
**ALWAYS.** This is the foundational technique that improves responses across virtually all scenarios.

### Token Cost
Minimal - typically 20-50 tokens for clear instructions.

### Examples

**Before (Vague):**
```
Tell me about this document.
```

**After (Clear):**
```
Extract the key financial metrics from this quarterly report, focusing on:
- Revenue growth (YoY %)
- Gross margin
- Operating cash flow

Present each metric in the format: [Metric Name]: [Value] [Trend]
```

### Why It Works
Specificity allows Claude to understand exactly what's needed and focus reasoning on relevant aspects.

---

## 2. Context and Motivation

### What It Is
Explaining the reasoning behind your request—the "why"—not just the requirements. This helps Claude understand your objectives and make better judgment calls.

### When to Use
**ALWAYS** alongside clarity. Particularly valuable when:
- Requirements might seem arbitrary without context
- Edge cases need intelligent handling
- You want Claude to adapt approach to your goals

### Token Cost
Minimal - typically 10-30 tokens for motivation.

### Example

**Before:** `Write a 500-word summary of this article.`

**After:** `Write a 500-word summary of this article for our company newsletter. Our readers are busy executives who want key takeaways they can act on.`

### Why It Works
When Claude understands your objectives, it makes better decisions on edge cases and avoids technically-correct-but-unhelpful responses.

---

## 3. Positive Framing

### What It Is
Telling Claude what TO do rather than what NOT to do. Positive instructions are clearer and more actionable.

### When to Use
Whenever you're tempted to write a negative constraint.

### Token Cost
Often neutral or reduces tokens (positive statements are usually more concise).

### Quick Reference

| Negative (Avoid) | Positive (Prefer) |
|------------------|-------------------|
| "Don't use jargon" | "Use plain language" |
| "Don't be verbose" | "Be concise and direct" |
| "Don't hallucinate" | "If unsure, say so" |
| "Don't include preambles" | "Start directly with the answer" |

### Why It Works
Positive instructions are unambiguous; negatives require Claude to infer the alternative.

---

## 4. XML Structure

### What It Is
Using XML tags to create hard structural boundaries within prompts, separating instructions, context, examples, and formatting requirements.

### Modern Model Note (2024+)
Less necessary with Claude 4.x. Use when genuinely needed, not by default.

### When to Use
- Complex prompts with multiple distinct sections
- Risk of instruction leakage (user input mixed with instructions)
- Long context where documents need clear boundaries

### Token Cost
~50-100 tokens overhead.

### Example

```xml
<instructions>
Analyze the code for security vulnerabilities and performance issues.
</instructions>

<code>
[code content]
</code>
```

### Why It Works
Claude is fine-tuned to treat XML tags as hard boundaries between different types of information.

---

## 5. Chain of Thought

### What It Is
Encouraging step-by-step reasoning before providing final answers.

### When to Use
- Analysis tasks, multi-step reasoning, math, debugging
- Tasks where intermediate steps matter

### Token Cost
2-3x output tokens (thinking + final answer).

### Example

```
Analyze this bug. Think step by step:
1. What is the error message telling us?
2. What are the possible causes?
3. Which cause is most likely given the context?

Then provide your conclusion.
```

### Why It Works
Breaking down reasoning into steps improves accuracy and makes decisions verifiable.

---

## 6. Prompt Chaining

### What It Is
Breaking complex tasks into sequential smaller prompts, where later prompts use output from earlier ones.

### When to Use
- Tasks too complex for reliable single-pass accuracy
- When you need intermediate verification
- Workflows with distinct phases (research → analyze → synthesize)

### Token Cost
Multiple API calls, but each is simpler and more reliable.

### Example

```
Prompt 1: "List all security vulnerabilities in this codebase."
→ Output: List of 12 vulnerabilities

Prompt 2: "Rate each vulnerability by severity with justification."
→ Output: Prioritized list

Prompt 3: "Create remediation plans for the top 5."
→ Output: Remediation plans
```

### Trade-offs
Higher accuracy ↔ Increased latency and orchestration complexity

---

## 7. Multishot Prompting

### What It Is
Providing 2-5 examples of input → desired output to demonstrate patterns.

### When to Use
- Specific formatting requirements
- Pattern learning, style matching
- Structured data extraction

### Token Cost
200-1000 tokens per example.

### Example

```
Extract product information as JSON.

Input: "Premium leather wallet, black, $49.99"
Output: {"name": "Premium leather wallet", "color": "black", "price": 49.99}

Input: "Wireless earbuds, multiple colors"
Output: {"name": "Wireless earbuds", "color": "multiple", "price": null}

Now extract from: [your input]
```

### Why It Works
Examples teach patterns more effectively than descriptions, especially for format and style.

---

## 8. System Prompt (Role Assignment)

### What It Is
Using the system parameter to assign Claude a specific role or expertise area.

### When to Use
- Domain-specific tasks (medical, legal, technical)
- Tone or style requirements

### Token Cost
Minimal (20-100 tokens, caches extremely well).

### Example

```
System: You are a senior security engineer specializing in OWASP Top 10 vulnerabilities.

User: Analyze this code for security issues.
```

### Why It Works
Roles frame Claude's approach and leverage domain-specific patterns from training data.

---

## 9. Prefilling

### What It Is
Providing the start of Claude's response to guide format and skip preambles.

### When to Use
- Strict format requirements (JSON, XML, CSV)
- Skip conversational preambles
- Automated parsing

### Token Cost
Minimal (5-20 tokens).

### Example

```
User: Extract data as JSON
Assistant: {
Claude: "data": ...
```

### Why It Works
Forces Claude to continue from the prefilled content, ensuring format compliance.

**Note:** Prefill cannot end with trailing whitespace.

---

## 10. Long Context Optimization

### What It Is
Strategies for handling 20K+ token inputs effectively.

### When to Use
- Multiple documents
- Long technical documents
- Research across many sources

### Token Cost
No additional cost - improves accuracy for same tokens.

### Key Strategies

**1. Document Placement** - Place documents BEFORE queries (30% better performance)

**2. Quote Grounding** - "First, quote the relevant section. Then provide your analysis."

### Example

```xml
<document source="report.pdf">
[Long document content]
</document>

<instructions>
Analyze this document for X
</instructions>
```

---

## 11. Context Budget Management

### What It Is
Optimizing repeated prompts through caching.

### When to Use
- Repeated prompts with stable content
- Long conversations
- Reused reference documentation

### Token Cost
90% cost reduction on cached content (Write: 25%, Read: 10%)

### Strategy

Structure prompts so stable content caches:
```
[System prompt - caches]
[Reference docs - caches]
[User query - doesn't cache]
```

### Why It Works
Caching dramatically reduces cost for repeated content while maintaining quality.

---

## 12. Tool Documentation

### What It Is
Clear descriptions of tools/functions including when to use them and parameter schemas.

### When to Use
- Function calling / tool use
- Agent workflows

### Token Cost
100-500 tokens per tool definition.

### Example

**Poor:** `"description": "Search for something"`

**Good:**
```json
{
  "name": "semantic_search",
  "description": "Search knowledge base. Use when user asks about policies or docs. Returns top 5 passages.",
  "parameters": {
    "query": {
      "type": "string",
      "description": "Natural language query. Example: 'vacation policy for 3yr employees'"
    }
  }
}
```

### Key Elements
- **Description**: What it does + when to use it + what it returns
- **Parameters**: Type, description, examples, defaults

---

## Technique Combination Matrix

| Primary Technique | Works Well With | Avoid Combining With |
|-------------------|-----------------|---------------------|
| Clarity | Everything | N/A - always use |
| Context & Motivation | Clarity (always pair) | N/A - always use |
| Positive Framing | All instructions | N/A - always use |
| XML Structure | Long Context, Examples, Caching | Simple prompts (modern models) |
| Chain of Thought | XML, Role, Long Context | Simple extraction |
| Prompt Chaining | All techniques per step | Latency-critical tasks |
| Multishot | XML, Prefilling | Trivial tasks |
| System Role | Chain of Thought, Tools | Generic tasks |
| Prefilling | XML, Multishot | Conversational outputs |
| Long Context | XML, Quoting, Caching | Short prompts |
| Context Budget | XML, System Prompts | One-off queries |
| Tool Docs | Role, Examples, CoT | No tool use |

---

## Decision Framework

```
Start Here
    ↓
1. ALWAYS apply foundation techniques:
   - Clarity (explicit instructions)
   - Context & Motivation (explain WHY)
   - Positive Framing (say what TO do)
    ↓
2. Assess task complexity:
   Simple → Stop here, skip advanced techniques
   Complex → Continue below
    ↓
3. Too complex for single pass?
   Yes → Use Prompt Chaining
   No → Continue
    ↓
4. Does it need reasoning?
   Yes → Add Chain of Thought
   No → Skip (save 2-3x tokens)
    ↓
5. Assess prompt length:
   > 20K tokens → Apply Long Context tips
   < 5K tokens → Skip
    ↓
6. Is it repeated use?
   Yes → Structure for Caching
   No → Skip cache optimization
    ↓
7. Is format subtle or specific?
   Yes → Add Examples or Prefilling
   No → Skip
    ↓
8. Does it need structure?
   Complex multi-section → Use XML
   Simple → Natural language is fine
    ↓
9. Does domain expertise help?
   Yes → Assign Role in system prompt
   No → Skip
    ↓
10. Does it involve tools?
    Yes → Write detailed Tool Docs
    No → Skip
    ↓
Final Check: Is every technique justified?
The best prompt achieves goals with MINIMUM necessary structure.
```

---

## Common Patterns

**Foundation techniques apply to ALL patterns:**
- Clarity ✓
- Context & Motivation ✓
- Positive Framing ✓

### Pattern 1: Simple Extraction
- Foundation only
- Skip everything else

### Pattern 2: Analysis Task
- Foundation ✓
- Chain of Thought ✓
- System Role ✓
- Long Context (if large input) ✓
- XML Structure (if complex) ✓

### Pattern 3: Format Conversion
- Foundation ✓
- Multishot Examples ✓
- Prefilling ✓

### Pattern 4: Complex Multi-Step Task
- Foundation ✓
- Prompt Chaining ✓
- Chain of Thought (per step) ✓
- System Role ✓

### Pattern 5: Agent Workflow
- Foundation ✓
- System Role ✓
- Tool Documentation ✓
- Chain of Thought ✓
- Context Budget Management ✓
- XML Structure ✓

### Pattern 6: Repeated Queries
- Foundation ✓
- System Role ✓
- Context Budget Management ✓
- XML Structure (for cache boundaries) ✓

---

## Measuring Effectiveness

For each technique, track:
- **Accuracy**: Does output quality improve?
- **Token Cost**: What's the overhead?
- **Latency**: Does response time increase?
- **Consistency**: Are results more reliable?

Remove techniques that don't improve outcomes for your specific use case.
