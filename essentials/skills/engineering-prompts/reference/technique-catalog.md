# Prompt Engineering Technique Catalog

Deep dive into each of the 9 core prompt engineering techniques with examples, token costs, and combination strategies.

## Table of Contents

- [1. Clarity and Directness](#1-clarity-and-directness)
- [2. XML Structure](#2-xml-structure)
- [3. Chain of Thought](#3-chain-of-thought)
- [4. Multishot Prompting](#4-multishot-prompting)
- [5. System Prompt (Role Assignment)](#5-system-prompt-role-assignment)
- [6. Prefilling](#6-prefilling)
- [7. Long Context Optimization](#7-long-context-optimization)
- [8. Context Budget Management](#8-context-budget-management)
- [9. Tool Documentation](#9-tool-documentation)
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

### Combination Strategies
- Pairs with ALL techniques - always start here
- Essential foundation for XML structure (what goes in each section)
- Guides chain of thought (what to reason about)
- Clarifies multishot examples (what pattern to match)

---

## 2. XML Structure

### What It Is
Using XML tags to create hard structural boundaries within prompts, separating instructions, context, examples, and formatting requirements.

### When to Use
- Complex prompts with multiple sections
- Risk of instruction leakage (user input mixed with instructions)
- Structured data tasks
- Long prompts where sections need clear delineation

### Token Cost
~50-100 tokens overhead for tag structure.

### Examples

**Before (Mixed):**
```
You're a code reviewer. Look at this code and check for security issues, performance problems, and best practices. Here's the code: [code]. Format your response as bullet points.
```

**After (Structured):**
```xml
<instructions>
You are a code reviewer. Analyze the code for:
- Security vulnerabilities
- Performance issues
- Best practice violations
</instructions>

<code>
[code content]
</code>

<formatting>
Return findings as bullet points, organized by category.
</formatting>
```

### Why It Works
Claude has been fine-tuned to pay special attention to XML tags, preventing confusion between different types of information.

### Combination Strategies
- Use with long context (separate documents with `<document>` tags)
- Pair with examples (`<examples>` section)
- Combine with prefilling (structure output format)

### Skip When
- Simple single-section prompts
- Token budget is extremely tight
- User input doesn't risk instruction leakage

---

## 3. Chain of Thought

### What It Is
Encouraging step-by-step reasoning before providing final answers. Implemented via phrases like "Think step by step" or explicit `<thinking></thinking>` tags.

### When to Use
- Analysis tasks
- Multi-step reasoning
- Math problems
- Complex decision-making
- Debugging
- Tasks where intermediate steps matter

### Token Cost
2-3x output tokens (thinking + final answer).

### Examples

**Before:**
```
What's the root cause of this bug?
```

**After:**
```
Analyze this bug. Think step by step:
1. What is the error message telling us?
2. What code is involved in the stack trace?
3. What are the possible causes?
4. Which cause is most likely given the context?

Then provide your conclusion about the root cause.
```

**Or with structured thinking:**
```
Analyze this bug and provide:

<thinking>
Your step-by-step analysis here
</thinking>

<conclusion>
Root cause and fix
</conclusion>
```

### Why It Works
Breaking down reasoning into steps improves accuracy and makes the decision-making process transparent and verifiable.

### Combination Strategies
- Essential for complex tasks even with other techniques
- Pair with XML structure to separate thinking from output
- Works well with long context (reason about documents)
- Combine with examples showing reasoning process

### Skip When
- Simple extraction or lookup tasks
- Format conversion
- Tasks with obvious single-step answers
- Token budget is critical concern

---

## 4. Multishot Prompting

### What It Is
Providing 2-5 examples of input → desired output to demonstrate patterns.

### When to Use
- Specific formatting requirements
- Pattern learning tasks
- Subtle output nuances
- Structured data extraction
- Style matching

### Token Cost
200-1000 tokens per example (depends on complexity).

### Examples

**Before:**
```
Extract product information from these descriptions.
```

**After:**
```
Extract product information from descriptions. Format as JSON.

Examples:

Input: "Premium leather wallet, black, RFID blocking, $49.99"
Output: {"name": "Premium leather wallet", "color": "black", "features": ["RFID blocking"], "price": 49.99}

Input: "Wireless earbuds, noise cancelling, 24hr battery, multiple colors available"
Output: {"name": "Wireless earbuds", "color": "multiple", "features": ["noise cancelling", "24hr battery"], "price": null}

Now extract from: [your input]
```

### Why It Works
Examples teach patterns more effectively than textual descriptions, especially for format and style.

### Combination Strategies
- Wrap examples in `<examples>` XML tags for clarity
- Show chain of thought in examples if reasoning is complex
- Include edge cases in examples
- Can combine with prefilling to start the response

### Skip When
- Task is self-explanatory
- Examples would be trivial or redundant
- Token budget is constrained
- One-off task where setup cost isn't worth it

---

## 5. System Prompt (Role Assignment)

### What It Is
Using the system parameter to assign Claude a specific role, expertise area, or perspective.

### When to Use
- Domain-specific tasks (medical, legal, technical)
- Tone or style requirements
- Perspective-based analysis
- Specialized workflows

### Token Cost
Minimal (20-100 tokens, caches extremely well).

### Examples

**Generic:**
```
Analyze this code for security issues.
```

**With Role:**
```
System: You are a senior security engineer with 15 years of experience in application security. You specialize in identifying OWASP Top 10 vulnerabilities and secure coding practices.

User: Analyze this code for security issues.
```

### Why It Works
Roles frame Claude's approach and leverage domain-specific patterns from training data.

### Combination Strategies
- Almost always use with other techniques
- Particularly powerful with chain of thought (expert reasoning)
- Helps with multishot examples (expert demonstrates)
- Define constraints in system prompt (tools, approach)

### Skip When
- Generic tasks requiring no specific expertise
- Role would be artificial or unhelpful
- You want flexibility in perspective

---

## 6. Prefilling

### What It Is
Providing the start of Claude's response to guide format and skip preambles.

### When to Use
- Strict format requirements (JSON, XML, CSV)
- Want to skip conversational preambles
- Need consistent output structure
- Automated parsing of responses

### Token Cost
Minimal (5-20 tokens typically).

### Examples

**Without Prefilling:**
```
User: Extract data as JSON
Claude: Sure! Here's the data in JSON format:
{
  "data": ...
```

**With Prefilling:**
```
User: Extract data as JSON
Assistant: {
Claude: "data": ...
```

### Why It Works
Forces Claude to continue from the prefilled content, ensuring format compliance and skipping unnecessary text.

### Combination Strategies
- Combine with XML structure (prefill to skip tags)
- Use with multishot (prefill the pattern shown)
- Pair with system role (prefill expert format)

### Skip When
- Conversational tone is desired
- Explanation or context is valuable
- Format is flexible

### Technical Notes
- Prefill cannot end with trailing whitespace
- Works in both API and conversational interfaces

---

## 7. Long Context Optimization

### What It Is
Specific strategies for handling 20K+ token inputs effectively, including document placement, XML structure, and quote grounding.

### When to Use
- Processing multiple documents
- Analyzing long technical documents
- Research across many sources
- Complex data-rich tasks

### Token Cost
No additional cost - improves accuracy for same tokens.

### Key Strategies

**1. Document Placement**
Place long documents BEFORE queries and instructions:

```xml
<document>
[Long document 1]
</document>

<document>
[Long document 2]
</document>

<instructions>
Analyze these documents for X
</instructions>
```

**2. Metadata Tagging**
```xml
<document>
  <source>quarterly-report-q3-2024.pdf</source>
  <type>financial</type>
  <content>
  [document content]
  </content>
</document>
```

**3. Quote Grounding**
"First, quote the relevant section from the document. Then provide your analysis."

### Why It Works
- Placement: 30% better performance in evaluations
- Tags: Help Claude organize and retrieve information
- Quoting: Forces attention to specific relevant text

### Combination Strategies
- Essential with XML structure for multi-document tasks
- Pair with chain of thought (reason about documents)
- Use with system role (expert document analyst)

### Skip When
- Short prompts (<5K tokens)
- Single focused document
- Simple extraction tasks

---

## 8. Context Budget Management

### What It Is
Optimizing for repeated prompts through caching and managing attention budget across long conversations.

### When to Use
- Repeated prompts with stable content
- Long conversations
- System prompts that don't change
- Reference documentation that's reused

### Token Cost
Caching: 90% cost reduction on cached content
- Write: 25% of standard cost
- Read: 10% of standard cost

### Strategies

**1. Prompt Caching**
Structure prompts so stable content is cached:
```
[System prompt - caches]
[Reference docs - caches]
[User query - doesn't cache]
```

**2. Context Windowing**
For long conversations, periodically summarize and reset context.

**3. Structured Memory**
Use the memory tool to persist information across context windows.

### Examples

**Cacheable Structure:**
```xml
<system>
You are a code reviewer. [full guidelines]
</system>

<style_guide>
[Company style guide - 10K tokens]
</style_guide>

<user_query>
Review this PR: [specific PR]
</user_query>
```

The system prompt and style guide cache, only the user query changes.

### Why It Works
- Caching: Dramatically reduces cost for repeated content
- Windowing: Prevents context overflow and performance degradation
- Memory: Enables projects longer than context window

### Combination Strategies
- Structure with XML to create cacheable boundaries
- Use with long context tips for large documents
- Pair with system prompts (highly cacheable)

### Skip When
- One-off queries
- Content changes every call
- Short prompts where caching overhead isn't worth it

---

## 9. Tool Documentation

### What It Is
Clear, detailed descriptions of tools/functions including when to use them, parameter schemas, and examples.

### When to Use
- Function calling / tool use
- Agent workflows
- API integrations
- Multi-step automated tasks

### Token Cost
100-500 tokens per tool definition.

### Examples

**Poor Tool Definition:**
```json
{
  "name": "search",
  "description": "Search for something",
  "parameters": {
    "query": "string"
  }
}
```

**Good Tool Definition:**
```json
{
  "name": "semantic_search",
  "description": "Search internal knowledge base using semantic similarity. Use this when the user asks questions about company policies, products, or documentation. Returns top 5 most relevant passages.",
  "parameters": {
    "query": {
      "type": "string",
      "description": "Natural language search query. Be specific and include key terms. Example: 'vacation policy for employees with 3 years tenure'"
    },
    "max_results": {
      "type": "integer",
      "description": "Number of results to return (1-10). Default: 5",
      "default": 5
    }
  }
}
```

### Why It Works
Clear tool descriptions help Claude:
- Know when to invoke the tool
- Understand what parameters to provide
- Format parameters correctly
- Choose between multiple tools

### Best Practices

**Description Field:**
- What the tool does
- When to use it
- What it returns
- Keywords/scenarios

**Parameter Schemas:**
- Clear descriptions
- Type definitions
- Enums for fixed values
- Examples of valid inputs
- Defaults where applicable

### Combination Strategies
- Use with system role (define tool strategy)
- Pair with chain of thought (reason about tool choice)
- Combine with examples (show successful tool use)

### Skip When
- No tool use involved
- Single obvious tool
- Tools are self-explanatory

---

## Technique Combination Matrix

| Primary Technique | Works Well With | Avoid Combining With |
|------------------|-----------------|---------------------|
| Clarity | Everything | N/A - always use |
| XML Structure | Long Context, Examples, Caching | Simple single-section prompts |
| Chain of Thought | XML, Role, Long Context | Simple extraction (unnecessary) |
| Multishot | XML, Prefilling | Overly simple tasks |
| System Role | Chain of Thought, Tools | Generic tasks |
| Prefilling | XML, Multishot | Conversational outputs |
| Long Context | XML, Quoting, Caching | Short prompts |
| Context Budget | XML, System Prompts | One-off queries |
| Tool Docs | Role, Examples | No tool use |

---

## Decision Framework

```
Start Here
    ↓
1. Always apply CLARITY
    ↓
2. Assess prompt length:
   < 5K tokens → Skip long context tips
   > 20K tokens → Apply long context optimization
    ↓
3. Check if repeated:
   Yes → Structure for caching
   No → Skip cache optimization
    ↓
4. Does it need reasoning?
   Yes → Add chain of thought
   No → Skip (save 2-3x tokens)
    ↓
5. Is format subtle or specific?
   Yes → Add examples or prefilling
   No → Skip
    ↓
6. Is it complex or has sections?
   Yes → Use XML structure
   No → Keep simple
    ↓
7. Does domain expertise help?
   Yes → Assign role in system prompt
   No → Skip
    ↓
8. Does it involve tools?
   Yes → Write detailed tool docs
   No → Skip
    ↓
Final Check: Is every technique justified?
```

---

## Common Patterns

### Pattern 1: Simple Extraction
- Clarity ✓
- XML (maybe, if multi-section)
- Everything else: Skip

### Pattern 2: Analysis Task
- Clarity ✓
- Chain of Thought ✓
- XML Structure ✓
- System Role ✓
- Long Context (if large input) ✓

### Pattern 3: Format Conversion
- Clarity ✓
- Multishot Examples ✓
- Prefilling ✓
- XML (maybe)

### Pattern 4: Agent Workflow
- Clarity ✓
- System Role ✓
- Tool Documentation ✓
- Chain of Thought ✓
- Context Budget Management ✓
- XML Structure ✓

### Pattern 5: Repeated Queries
- Clarity ✓
- System Role ✓
- Context Budget Management ✓
- XML Structure (for cache boundaries) ✓
- Other techniques as needed

---

## Measuring Effectiveness

For each technique, track:
- **Accuracy**: Does output quality improve?
- **Token Cost**: What's the overhead?
- **Latency**: Does response time increase?
- **Consistency**: Are results more reliable?

Remove techniques that don't improve outcomes for your specific use case.
