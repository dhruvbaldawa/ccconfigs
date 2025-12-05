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

### Combination Strategies
- Pairs with ALL techniques - always start here
- Essential foundation for XML structure (what goes in each section)
- Guides chain of thought (what to reason about)
- Clarifies multishot examples (what pattern to match)

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

### Examples

**Before (Just constraint):**
```
Don't use bullet points in your response.
```

**After (With motivation):**
```
I prefer responses in natural paragraph form rather than bullet points
because I find flowing prose easier to read and share with my team.
```

**Before (Just instruction):**
```
Write a 500-word summary of this article.
```

**After (With context):**
```
Write a 500-word summary of this article for our company newsletter.
Our readers are busy executives who want key takeaways they can act on.
```

**Before (Technical constraint):**
```
Return results as JSON with snake_case keys.
```

**After (With motivation):**
```
Return results as JSON with snake_case keys because our Python backend
uses these conventions and it avoids transformation overhead.
```

### Why It Works
When Claude understands your objectives:
- Makes better decisions on edge cases not covered by explicit rules
- Adjusts tone, depth, and focus appropriately
- Avoids technically-correct-but-unhelpful responses

### Combination Strategies
- Always pair with clarity (the "what" + the "why")
- Enhances examples (explain why the example output is good)
- Improves chain of thought (Claude reasons toward your goals)

### Skip When
- Task is completely mechanical with no judgment calls
- Motivation would be redundant (obvious context)

---

## 3. Positive Framing

### What It Is
Telling Claude what TO do rather than what NOT to do. Positive instructions are clearer and more actionable.

### When to Use
Whenever you're tempted to write a negative constraint.

### Token Cost
Often neutral or reduces tokens (positive statements are usually more concise).

### Examples

| Negative (Avoid) | Positive (Prefer) |
|------------------|-------------------|
| "Don't use jargon" | "Use plain language accessible to general audiences" |
| "Don't be verbose" | "Be concise and direct" |
| "Don't make assumptions" | "Ask clarifying questions when information is missing" |
| "Don't hallucinate" | "If you're unsure, say so explicitly" |
| "Don't use passive voice" | "Use active voice throughout" |
| "Don't include preambles" | "Start directly with the answer" |

**Before (Negative list):**
```
Don't use:
- Bullet points
- Headers
- Code blocks
- Emojis
```

**After (Positive instruction):**
```
Write in flowing prose paragraphs without structural formatting.
```

### Why It Works
- Negative constraints require Claude to infer the positive alternative
- Positive instructions are unambiguous about desired behavior
- Reduces cognitive load and interpretation errors

### Combination Strategies
- Applies to all instructions - always reframe negatives
- Particularly important in examples (show what TO do)
- Improves system prompts (positive persona definition)

---

## 4. XML Structure

### What It Is
Using XML tags to create hard structural boundaries within prompts, separating instructions, context, examples, and formatting requirements.

### Modern Model Note (2024+)
XML structure was essential with earlier Claude models but is **less necessary** with Claude 4.x. Modern models understand natural language context better. Use XML when you genuinely need it, not by default.

### When to Use
- Complex prompts with multiple distinct sections
- Risk of instruction leakage (user input mixed with instructions)
- Long context where documents need clear boundaries
- Automated pipelines where structure aids parsing

### When to Skip (Modern Models)
- Simple single-section prompts
- Conversational interactions
- When natural language is equally clear

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

## 5. Chain of Thought

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

## 6. Prompt Chaining

### What It Is
Breaking complex tasks into sequential smaller prompts, where later prompts use output from earlier ones.

### When to Use
- Multi-step analysis where later steps depend on earlier results
- Tasks too complex for reliable single-pass accuracy
- When you need intermediate verification or human review
- Workflows with distinct phases (research → analyze → synthesize)

### Token Cost
Multiple API calls, but each call is simpler and more reliable.

### Examples

**Before (Single complex prompt):**
```
Analyze this codebase, identify all security vulnerabilities, prioritize them by severity,
create remediation plans for each, estimate effort for fixes, and produce a project timeline.
```

**After (Chained prompts):**
```
Prompt 1: "Analyze this codebase and list all potential security vulnerabilities."
→ Output: List of 12 vulnerabilities

Prompt 2: "Given these vulnerabilities: [list], rate each by severity (Critical/High/Medium/Low)
with justification."
→ Output: Prioritized list

Prompt 3: "For the top 5 critical/high vulnerabilities, create specific remediation plans."
→ Output: Remediation plans

Prompt 4: "Estimate implementation effort for each remediation plan."
→ Output: Effort estimates
```

### Why It Works
- Each prompt is simpler and more focused
- Intermediate outputs can be verified before proceeding
- Errors in early steps can be corrected before compounding
- Complex reasoning is broken into manageable chunks

### Trade-offs
| Benefit | Cost |
|---------|------|
| Higher accuracy | Increased latency |
| Intermediate verification | More API calls |
| Easier debugging | More complex orchestration |
| Focused prompts | State management needed |

### Combination Strategies
- Each step can use appropriate techniques (CoT for analysis, examples for formatting)
- Intermediate outputs become context for next prompt
- Can run some chains in parallel if independent

### Skip When
- Task is simple enough for single-pass
- Latency is critical
- Steps are truly interdependent (can't parallelize)

---

## 7. Multishot Prompting

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

## 8. System Prompt (Role Assignment)

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

## 9. Prefilling

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

## 10. Long Context Optimization

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

## 11. Context Budget Management

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

## 12. Tool Documentation

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
