# Prompt Engineering Examples

Before/after examples across different use cases demonstrating the application of prompt engineering techniques.

## Table of Contents

- [Example 1: Code Review](#example-1-code-review)
- [Example 2: Data Extraction](#example-2-data-extraction)
- [Example 3: Bug Analysis](#example-3-bug-analysis)
- [Example 4: Long Document Analysis](#example-4-long-document-analysis)
- [Example 5: Agent Workflow with Tools](#example-5-agent-workflow-with-tools)
- [Example 6: Repeated Queries with Caching](#example-6-repeated-queries-with-caching)
- [Example 7: Format Conversion with Prefilling](#example-7-format-conversion-with-prefilling)
- [Example 8: Simple Task (Minimal Techniques)](#example-8-simple-task-minimal-techniques)
- [Complexity Progression](#complexity-progression)
- [Anti-Pattern Examples](#anti-pattern-examples)
- [Key Takeaways](#key-takeaways)
- [Practice Exercise](#practice-exercise)

---

## Example 1: Code Review

### Before (Poor)

```
Review this code.
```

**Issues:**
- Vague - what aspects to review?
- No format guidance
- No success criteria

### After (Optimized)

```xml
<role>
You are a senior software engineer conducting a code review.
</role>

<instructions>
Review the following code for:
1. Security vulnerabilities (SQL injection, XSS, auth issues)
2. Performance problems (N+1 queries, inefficient algorithms)
3. Code quality (naming, duplication, complexity)

For each issue found, provide:
- Severity: Critical/Warning/Suggestion
- Location: File and line number
- Problem: What's wrong
- Fix: Specific code change
</instructions>

<code>
[Code to review]
</code>

<thinking>
Analyze the code systematically for each category before providing your review.
</thinking>
```

**Techniques Applied:**
- Clarity: Specific review categories and output format
- XML Structure: Separate role, instructions, code
- System Role: Senior software engineer
- Chain of Thought: Explicit thinking step

**Cost:** ~300 tokens → 2-3x output tokens for thinking
**Benefit:** Comprehensive, structured reviews with clear action items

---

## Example 2: Data Extraction

### Before (Poor)

```
Get the important information from this document.
```

**Issues:**
- "Important" is subjective
- No format specified
- No examples of desired output

### After (Optimized)

```xml
<instructions>
Extract the following fields from the customer support ticket:
- Customer ID
- Issue category
- Priority level
- Requested action

Return as JSON.
</instructions>

<examples>
Input: "Customer #12345 reporting login issues. High priority. Need password reset."
Output: {
  "customer_id": "12345",
  "issue_category": "login",
  "priority": "high",
  "requested_action": "password_reset"
}

Input: "User Jane Smith can't access reports module. Not urgent. Investigate permissions."
Output: {
  "customer_id": null,
  "issue_category": "access_control",
  "priority": "low",
  "requested_action": "investigate_permissions"
}
</examples>

<ticket>
[Actual ticket content]
</ticket>
```

**Techniques Applied:**
- Clarity: Specific fields to extract
- XML Structure: Separate sections
- Multishot Examples: Two examples showing pattern and edge cases
- Prefilling: Could add `{` to start JSON response

**Cost:** ~400 tokens (200 per example)
**Benefit:** Consistent structured extraction, handles null values correctly

---

## Example 3: Bug Analysis

### Before (Poor)

```
Why is this code broken?
```

**Issues:**
- No systematic approach
- No context about symptoms
- No guidance on depth of analysis

### After (Optimized)

```xml
<role>
You are an expert debugger specializing in root cause analysis.
</role>

<context>
Error message: TypeError: Cannot read property 'length' of undefined
Stack trace: [stack trace]
Recent changes: Added pagination feature
</context>

<instructions>
Analyze this bug systematically:

<thinking>
1. What does the error message tell us?
2. Which code path leads to this error?
3. What are the possible causes?
4. Which cause is most likely given recent changes?
5. What would fix the root cause?
</thinking>

Then provide:
- Root cause explanation
- Specific code fix
- Prevention strategy
</instructions>

<code>
[Relevant code]
</code>
```

**Techniques Applied:**
- Clarity: Systematic analysis steps
- XML Structure: Separate role, context, instructions, code
- Chain of Thought: Explicit 5-step thinking process
- System Role: Expert debugger

**Cost:** ~250 tokens → 2-3x output for thinking
**Benefit:** Root cause identification, not just symptom fixes

---

## Example 4: Long Document Analysis

### Before (Poor)

```
Summarize these reports.

[Document 1]
[Document 2]
[Document 3]
```

**Issues:**
- Documents after query (poor placement)
- No structure for multiple documents
- No guidance on what to summarize

### After (Optimized)

```xml
<document id="1">
  <source>Q1-2024-financial-report.pdf</source>
  <type>financial</type>
  <content>
  [Full document 1 - 15K tokens]
  </content>
</document>

<document id="2">
  <source>Q2-2024-financial-report.pdf</source>
  <type>financial</type>
  <content>
  [Full document 2 - 15K tokens]
  </content>
</document>

<document id="3">
  <source>Q3-2024-financial-report.pdf</source>
  <type>financial</type>
  <content>
  [Full document 3 - 15K tokens]
  </content>
</document>

<instructions>
Analyze these quarterly financial reports:

1. First, quote the revenue and profit figures from each report
2. Then calculate and explain the trends across quarters
3. Finally, identify any concerning patterns or notable achievements

Present findings as:
- Trend Analysis: [Overall trends with percentages]
- Concerns: [Issues to watch]
- Achievements: [Positive developments]
</instructions>
```

**Techniques Applied:**
- Long Context Optimization: Documents BEFORE query
- XML Structure: Structured document metadata
- Quote Grounding: Explicit instruction to quote first
- Clarity: Specific analysis steps and output format

**Cost:** Same tokens, better accuracy (~30% improvement)
**Benefit:** Accurate multi-document analysis with proper attribution

---

## Example 5: Agent Workflow with Tools

### Before (Poor)

```
Tools:
- search(query)
- calculate(expression)

Answer user questions.
```

**Issues:**
- Vague tool descriptions
- No parameter guidance
- No strategy for tool selection

### After (Optimized)

```xml
<role>
You are a research assistant helping users find and analyze information.
</role>

<tools>
<tool>
Name: semantic_search
Description: Search our internal knowledge base using semantic similarity. Use this when users ask about company policies, products, or internal documentation. Returns the 5 most relevant passages with source citations.
Parameters:
  - query (string, required): Natural language search query. Be specific and include key terms.
    Example: "vacation policy for employees with 3+ years tenure"
  - max_results (integer, optional): Number of results (1-10). Default: 5
When to use: User asks about internal information, policies, or product details
</tool>

<tool>
Name: calculate
Description: Evaluate mathematical expressions safely. Supports basic arithmetic, percentages, and common functions (sqrt, pow, etc.). Use when users request calculations or when analysis requires math.
Parameters:
  - expression (string, required): Mathematical expression to evaluate
    Example: "(1500 * 0.15) + 200"
When to use: User asks for calculations, percentage changes, or numerical analysis
</tool>
</tools>

<workflow>
1. Understand user intent
2. Determine if tools are needed:
   - Information needs → semantic_search
   - Math needs → calculate
   - Both → search first, then calculate
3. Use tool results to form your response
4. Cite sources when using search results
</workflow>

<thinking>
For each user query, reason through:
- What information or calculation is needed?
- Which tool(s) would help?
- In what order should I use them?
</thinking>
```

**Techniques Applied:**
- Clarity: Detailed tool descriptions with examples
- XML Structure: Organized tool documentation
- System Role: Research assistant
- Tool Documentation: When to use, parameters, examples
- Chain of Thought: Reasoning about tool selection

**Cost:** ~600 tokens for tool docs
**Benefit:** Correct tool selection, proper parameter formatting, strategic tool use

---

## Example 6: Repeated Queries with Caching

### Before (Poor)

```
User: What's the return policy?

System: [Sends entire 50-page policy document + query every time]
```

**Issues:**
- Massive token waste on repeated content
- No caching strategy
- High cost per query

### After (Optimized)

```xml
<system_prompt>
You are a customer service assistant for Acme Corp. Your role is to answer policy questions accurately and concisely, always citing the specific policy section.
</system_prompt>

<company_policies>
[Full 50-page policy document - 40K tokens]
[This section is stable and will be cached]
</company_policies>

<interaction_guidelines>
- Answer clearly and directly
- Cite specific policy sections
- If policy doesn't cover the question, say so
- Be friendly but professional
</interaction_guidelines>

<!-- Everything above caches across requests -->
<!-- Only the user query below changes -->

<user_query>
What's the return policy for electronics?
</user_query>
```

**Techniques Applied:**
- Context Budget Management: Structure for caching
- XML Structure: Create cache boundaries
- System Role: Customer service assistant
- Long Context: Large policy document

**Cost Savings:**
- First call: 40K tokens input (write to cache: 25% cost)
- Subsequent calls: 40K tokens cached (read from cache: 10% cost)
- Savings: 90% on cached content

**Benefit:** $0.30 → $0.03 per query (10x cost reduction)

---

## Example 7: Format Conversion with Prefilling

### Before (Poor)

```
Convert this to JSON: "Customer John Smith, ID 12345, ordered 3 items for $150"
```

**Response:**
```
Sure! Here's the information in JSON format:

{
  "customer_name": "John Smith",
  "customer_id": "12345",
  "item_count": 3,
  "total": 150
}
```

**Issues:**
- Unnecessary preamble
- Format might vary
- Extra tokens in output

### After (Optimized)

```
<instructions>
Convert customer orders to JSON with these fields:
- customer_name
- customer_id
- item_count
- total_amount
</instructions>

<input>
Customer John Smith, ID 12345, ordered 3 items for $150
</input>
```

**With Prefilling:**
```
Assistant: {
```

**Response:**
```json
{
  "customer_name": "John Smith",
  "customer_id": "12345",
  "item_count": 3,
  "total_amount": 150
}
```

**Techniques Applied:**
- Clarity: Specific field names
- XML Structure: Separate instructions and input
- Prefilling: Start with `{` to force JSON format

**Cost:** Saves ~15 tokens per response (preamble)
**Benefit:** Consistent format, easier parsing, cost savings at scale

---

## Example 8: Simple Task (Minimal Techniques)

### Scenario
Format phone numbers consistently.

### Optimized Prompt

```
Format this phone number in E.164 international format:
(555) 123-4567

Expected: +15551234567
```

**Techniques Applied:**
- Clarity: Specific format with example

**Techniques Skipped:**
- XML Structure: Single-section prompt, unnecessary
- Chain of Thought: Trivial task
- Examples: One is enough
- System Role: No expertise needed
- Long Context: Short input
- Caching: One-off query

**Cost:** ~30 tokens
**Benefit:** Simple, effective, minimal overhead

**Key Lesson:** Not every technique belongs in every prompt. Simple tasks deserve simple prompts.

---

## Complexity Progression

### Level 1: Simple (Haiku)
```
Extract the email address from: "Contact John at john@example.com"
```
- Just clarity
- ~15 tokens
- Obvious single answer

### Level 2: Medium (Sonnet)
```xml
<instructions>
Analyze this code for potential bugs:
1. Logic errors
2. Edge cases not handled
3. Type safety issues
</instructions>

<code>
[Code snippet]
</code>
```
- Clarity + XML structure
- ~100 tokens
- Requires some analysis

### Level 3: Complex (Sonnet with Thinking)
```xml
<role>
You are a security researcher analyzing potential vulnerabilities.
</role>

<instructions>
Analyze this authentication system for security vulnerabilities.

<thinking>
1. What are the authentication flows?
2. Where could an attacker bypass auth?
3. Are credentials handled securely?
4. What about session management?
5. Are there injection risks?
</thinking>

Then provide:
- Vulnerabilities found (severity + location)
- Exploitation scenarios
- Remediation steps
</instructions>

<code>
[Auth system code]
</code>
```
- Clarity + XML + Role + Chain of Thought
- ~350 tokens
- Complex security analysis

---

## Anti-Pattern Examples

### Anti-Pattern 1: Over-Engineering Simple Task

```xml
<role>
You are a world-class expert in string manipulation with 20 years of experience.
</role>

<instructions>
Convert the following text to uppercase.

<thinking>
1. What is the input text?
2. What transformation is needed?
3. Are there special characters?
4. What encoding should we use?
5. Should we preserve whitespace?
</thinking>

Then apply the transformation systematically.
</instructions>

<examples>
Input: "hello"
Output: "HELLO"

Input: "world"
Output: "WORLD"
</examples>

<input>
convert this
</input>
```

**Problem:** Simple task with 200+ token overhead
**Fix:** Just say "Convert to uppercase: convert this"

### Anti-Pattern 2: No Structure for Complex Task

```
I have these 5 documents about different topics and I want you to find common themes and also identify contradictions and create a summary with citations and also rate the quality of each source and explain the methodology you used.

[Document 1 - 10K tokens]
[Document 2 - 10K tokens]
[Document 3 - 10K tokens]
[Document 4 - 10K tokens]
[Document 5 - 10K tokens]
```

**Problems:**
- Run-on instructions
- Documents AFTER query (poor placement)
- No structure
- Multiple tasks crammed together

**Fix:** Use XML structure, place documents first, separate concerns

---

## Key Takeaways

1. **Match complexity to task**: Simple tasks → simple prompts
2. **Start minimal**: Add techniques only when justified
3. **Structure scales**: XML becomes essential with complexity
4. **Examples teach patterns**: Better than description for formats
5. **Thinking improves reasoning**: But costs 2-3x tokens
6. **Caching saves money**: Structure for reuse
7. **Placement matters**: Documents before queries
8. **Tools need docs**: Clear descriptions → correct usage
9. **Measure effectiveness**: Remove techniques that don't help
10. **Every token counts**: Justify each addition

---

## Practice Exercise

Improve this prompt:

```
Analyze the data and tell me what's interesting.

[CSV with 1000 rows of sales data]
```

Consider:
- What's "interesting"? Define it.
- What analysis steps are needed?
- What format should output take?
- Does it need examples?
- Would thinking help?
- Should data be structured?
- What about cost optimization?

Try building an optimized version using appropriate techniques.