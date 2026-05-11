# Research Synthesis Examples

## Example: OKR Outputs vs Outcomes

This example shows how to use research-synthesis to validate a claim, synthesize findings into narrative, and integrate naturally into conversation.

```
[During brainstorming]

You: I want to argue that OKRs fail because they measure outputs not outcomes

AI: [invokes research-synthesis]
    That's a common critique - let me see if there's data to support it...

    [uses Perplexity: "OKR failures output vs outcome measurement"]

    Found strong supporting evidence:

    - Reforge 2024 study: 68% of failed OKR implementations measured
      outputs (features shipped) vs outcomes (user behavior change)
    - Amplitude research: Companies measuring outcomes had 3x higher
      product-market fit scores
    - Example: Spotify's "squad health" framework specifically avoided
      output metrics for this reason

    Key pattern: Output metrics are easier to measure but don't correlate
    with business value. This ties directly to your Goodhart's Law point.

    [updates braindump.md under Research section]

    Added to braindump. This gives you concrete data to back the claim.
    Want to explore specific examples of good outcome metrics?

You: Yes, give me 2-3 examples

AI: [uses Perplexity: "good OKR outcome metrics examples"]

    Strong examples:

    1. Netflix: "Hours of satisfied viewing" (outcome) vs "hours watched" (output)
    2. Airbnb: "Nights booked by repeat guests" (outcome) vs "total bookings" (output)
    3. Stripe: "Developer time to first API call" (outcome) vs "API calls made" (output)

    Pattern: Outcome metrics measure behavior change or satisfaction,
    outputs just measure activity.

    [adds to braindump under Examples]

    These work well as concrete illustrations. Should we outline the post now?
```

## What This Example Demonstrates

**MCP Tool Selection:**
- Used Perplexity for broad research (not a specific URL)
- Searched for both validation and examples
- Second query built on first findings

**Synthesis Techniques:**
- Identified pattern across sources (68% correlation)
- Connected findings to user's framework (Goodhart's Law)
- Provided concrete examples, not just statistics
- Noted implications (easier to measure ≠ more valuable)

**Integration with Conversation:**
- Research happened naturally when claim needed support
- Didn't interrupt flow—enhanced the argument
- Asked follow-up question to continue exploration
- Updated braindump.md in structured way

**Braindump Updates:**

Research section received:
```markdown
### Output vs Outcome Metrics
Reforge study: 68% of failed OKR implementations measured outputs
rather than outcomes. Companies measuring outcomes had 3x higher
product-market fit scores.

Pattern: Output metrics (features shipped, API calls) are easier to
measure but don't correlate with business value. Outcome metrics
(user satisfaction, behavior change) harder but more meaningful.
```

Examples section received:
```markdown
- Netflix: "Hours of satisfied viewing" vs "hours watched"
- Airbnb: "Nights booked by repeat guests" vs "total bookings"
- Stripe: "Developer time to first API call" vs "API calls made"
```

## Common Patterns

**Good Research Synthesis:**
- 3-5 sources, not 20
- Pattern identified across sources
- Connected to user's existing framework
- Concrete examples included
- Source attribution maintained
- Implications stated clearly

**Avoided Pitfalls:**
- No information overload (focused on key findings)
- Not just listing stats—synthesized into narrative
- Didn't break creative flow—enhanced it
- Asked before continuing (user control maintained)
