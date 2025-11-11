# Writing Workflow Guide

Complete guide to using Claude Code for blog writing in Dhruv's distinctive style.

## Quick Start

```bash
/new-post "Your Topic Idea"
```

This creates:
- `posts/your-topic-idea/braindump.md` - Messy workspace for ideas
- `posts/your-topic-idea/draft.md` - Polished blog post

Then starts brainstorming conversation.

## Philosophy

**Conversation-first**: Natural dialogue, not rigid command sequences
**Two-document pattern**: Separate ideation (braindump) from output (draft)
**Iterative**: Write section by section, pause, resume anytime
**Your voice**: Dhruv's style - conversational, analytical, grounded in experience

## Complete Workflow

### Phase 1: Ideation (Brainstorming)

```bash
/new-post "Why OKRs Fail"
```

**What happens:**
1. Creates directory structure and files
2. Invokes **brainstorming skill** (from essentials)
3. Starts conversation with questions

**Example conversation:**
```
AI: Created posts/why-okrs-fail/

    Let's explore this topic. What triggered your interest in OKRs?
    Is this based on a specific experience or pattern you've noticed?

You: I've seen OKRs fail at 3 companies. They always measure the wrong things.

AI: Interesting - "measure the wrong things" - can you give a specific example?
    What was being measured vs what should have been measured?

You: At Company X, we measured story points completed. But that just led to
     smaller stories and busy work, not actual product progress.

AI: So the metric became the goal instead of a proxy for the goal.
    Is this about gaming the system or genuinely not knowing what matters?

You: [continues exploring]

AI: [updates braindump.md as ideas emerge]

    We've got:
    - Core argument: OKRs fail when they measure what's easy, not what matters
    - 3 examples from your experience (Company X, Y, Z)
    - Target audience: engineering managers

    Ready to structure this into an outline?

You: Yes
```

**Braindump evolves:**
```markdown
# Why OKRs Fail - Braindump

## Context
Seen OKRs fail at 3 companies. Pattern: metrics become targets,
lose connection to actual goals.

## Core Argument
OKRs fail because organizations measure what's easy to measure
(story points, commits, uptime) instead of what actually matters
(user value, product quality, team learning).

## Audience
Engineering managers and tech leads who've struggled with OKRs.

## Examples
1. Company X: Story points → smaller stories, busy work
2. Company Y: Code coverage → meaningless tests
3. Company Z: Deployment frequency → more deploys, worse quality

## Outline
[AI helps structure based on conversation]
```

### Phase 2: Research (Optional)

**During brainstorming**, use research naturally:

```
You: Are there studies on this? Goodhart's Law seems relevant.

AI: [invokes research-synthesis skill]
    [uses Perplexity to research]

    Yes! Goodhart's Law: "When a measure becomes a target, it ceases
    to be a good measure."

    Also found:
    - Campbell's Law (similar concept in social science)
    - Studies showing metric gaming in healthcare, education
    - Paper: "The Tyranny of Metrics" by Jerry Muller

    [adds to braindump.md Sources section]

    Should we use Goodhart's Law as the framing device?

You: Yes, that's perfect
```

**Research is conversational**, not a separate command.

### Phase 3: Outlining

**Still in conversation**, create structure:

```
AI: Based on our discussion, here's a structure:

    1. Hook: Story of Company X metric gaming
    2. Problem: Why OKRs fail (Goodhart's Law)
    3. Root cause: Measuring proxy vs outcome
    4. Examples: 3 companies, different failures
    5. What to do instead: Focus on outcomes, not proxies
    6. Conclusion: OKRs work when metrics stay measures

    [adds to braindump.md Outline section]

    Want to start drafting the hook?
```

### Phase 4: Drafting

**Now write in draft.md:**

```
You: Let's draft the hook

AI: [invokes blog-writing skill]
    [writes in Dhruv's voice - conversational, specific, grounded]

    [Updates draft.md:]

    At Company X, our engineering team celebrated hitting 100%
    of our OKR targets for Q3. Story points delivered: ✓
    Code coverage: ✓ Deployment frequency: ✓

    The product team was less enthusiastic. User growth had
    stalled. The most-requested features were still in the
    backlog. And three critical bugs had been open for weeks.

    We'd hit every metric and missed the point entirely.

You: Good start. Make it more specific - what were the actual numbers?

AI: [revises with specifics from braindump examples]
```

**Write section by section:**
- Hook → TL;DR → Problem → Examples → Solution → Conclusion
- Pause anytime, resume later
- Reference braindump for research, examples, notes

### Phase 5: Polish

**When draft is complete:**

```bash
/polish why-okrs-fail
# or
/polish posts/why-okrs-fail/draft.md
```

**Hybrid approach** (suggest → confirm → apply):

```
AI: [runs quality checklist from blog-writing skill]

    Found 4 improvement opportunities:

    1. [STRUCTURE] Missing TL;DR
       Current: Jumps straight to hook
       Suggest: Add 3-bullet TL;DR after title

    2. [VOICE] Paragraph too formal
       Current: "Organizations must prioritize..."
       Suggest: "You need to prioritize..."

    3. [STYLE] Long paragraph (6 sentences)
       Location: "Root cause" section
       Suggest: Break into 2 paragraphs

    4. [CONTENT] Claim needs citation
       Current: "Studies show metric gaming is common"
       Suggest: Add Muller citation from braindump

    Apply which improvements? (1,2,3,4 or all)

You: all

AI: [applies changes]
    [updates draft.md]

    Done. Want another polish pass?
```

**Can run multiple times** - not just final pass.

## Two-Document Pattern

### braindump.md - Messy Workspace

**Purpose**: Collaborative thinking space

**Contains:**
- Context (what triggered topic)
- Core Argument (evolving thesis)
- Audience (who this is for)
- Outline (structure iterations)
- Research (studies, data, citations)
- Examples (concrete cases, anecdotes)
- Quotes (notable quotations)
- Questions (open questions to resolve)
- Sources (full references)

**Never published** - just for you and Claude

### draft.md - Clean Output

**Purpose**: Publishable blog post

**Contains:**
- Title
- TL;DR (3 bullets)
- Structured content in Dhruv's voice
- References research from braindump (citations)

**Published** directly to Substack/blog

## Skills Used

### brainstorming (essentials)
**When**: During ideation phase
**What**:
- Asks questions to draw out YOUR ideas (not Claude's)
- Explores tensions and contradictions
- Challenges assumptions gently
- Finds concrete angle from abstract topic
- Updates braindump.md as ideas evolve

**Transition**: When core argument clear + 2-3 examples → ready to outline

### research-synthesis (essentials)
**When**: During conversation (as needed)
**What**:
- Perplexity: broad research, studies, patterns
- Firecrawl: specific URLs, implementations, examples
- Context7: technical docs (for technical posts)
- Synthesizes into narrative (not list dump)
- Maintains source attribution in braindump

**Natural integration**: Research happens in flow of conversation

### blog-writing (writing plugin)
**When**: During drafting phase
**What**:
- Dhruv's distinctive voice (conversational yet analytical)
- Grounded in personal experience
- Clear structure (hook → TL;DR → body → conclusion)
- Substack-optimized (web + email friendly)
- Quality checklist (14 points)

**From braindump → polished draft**

## Writing in Dhruv's Voice

### Voice Principles

**Conversational yet analytical:**
- Use contractions (I've, don't, can't)
- First person (I, we, you)
- Address reader directly
- But back up claims with data/examples

**Grounded in experience:**
- Start with specific examples
- "At Company X, I saw..." not "Companies often..."
- Personal anecdotes > abstract theory

**Clear structure:**
- Short paragraphs (1-3 sentences)
- Scannable headings
- TL;DR upfront
- Conclusion with practical implications

### Language Guidelines

**Use:**
- Active voice: "I built" not "It was built"
- Concrete examples: "3 companies" not "many companies"
- Contractions: "don't" not "do not"
- Bold for emphasis: **key insights** (sparingly)

**Avoid:**
- Corporate jargon: "leverage", "synergy", "paradigm"
- Hyperbole: "game-changing", "revolutionary"
- AI phrases: "delve into", "it's worth noting", "in today's landscape"
- Hedging: "somewhat", "perhaps", "might be"

### Quality Checklist

Before publishing, verify:
- [ ] Opens with compelling hook (anecdote/problem/question)
- [ ] TL;DR provides clear standalone summary
- [ ] Paragraphs are short (1-3 sentences)
- [ ] Uses personal examples to ground abstract concepts
- [ ] Cites sources/research to back up claims
- [ ] Acknowledges complexity, avoids oversimplification
- [ ] Examines multiple perspectives when relevant
- [ ] Uses clear headings for scannability
- [ ] Conversational tone with contractions and first person
- [ ] Avoids corporate jargon, hyperbole, AI-sounding language
- [ ] Ends with practical implications and engagement question
- [ ] Varies sentence length for rhythm
- [ ] Uses bold text for key insights (not excessively)
- [ ] Works well in web and email formats

**/polish runs this automatically**

## Command Reference

### /new-post [topic]

**Creates:**
```
posts/[topic]/
├── braindump.md  (with template sections)
└── draft.md      (with structure template)
```

**Then:** Starts brainstorming conversation

**Example:**
```bash
/new-post "Why code reviews fail"
```

### /polish [topic or path]

**Runs:** Quality checklist + suggests improvements

**Hybrid workflow:**
1. Suggests 3-5 concrete improvements
2. You choose which to apply
3. Claude applies approved changes

**Can run multiple times** during writing

**Examples:**
```bash
/polish why-okrs-fail
/polish posts/why-okrs-fail/draft.md
```

## Common Patterns

### Pattern 1: Start Vague, Refine Through Conversation

```bash
/new-post "productivity"

AI: That's pretty broad. What specifically about productivity?
    - Tools and techniques?
    - Psychology and motivation?
    - Time management?
    - Productivity culture problems?

You: Culture problems. Like how "always on" culture kills actual productivity.

AI: Interesting tension - more hours but less output?
    Have you experienced this personally?

You: [shares experience]
    [conversation refines to: "Why always-on culture creates burnout, not productivity"]
```

### Pattern 2: Research-Heavy Post

```bash
/new-post "Machine learning bias in hiring"

You: I need to research this topic. What are the major studies?

AI: [uses Perplexity]
    Found key research:
    - Amazon's hiring tool (2018) - biased against women
    - HireVue facial analysis concerns
    - MIT study on commercial ML systems
    [adds to braindump.md Sources]

You: Can you get the specifics on the Amazon case?

AI: [uses Firecrawl on provided URL]
    [extracts details, adds to Examples]

[continues research-driven conversation]
```

### Pattern 3: Technical Tutorial

```bash
/new-post "Building a rate limiter in Go"

# Brainstorm approach
# Research patterns (Context7 for Go docs)
# Draft step-by-step with code examples
# Polish for clarity

# Result: Technical post in conversational style
```

### Pattern 4: Iterative Writing

```bash
# Day 1: Brainstorm
/new-post "async communication at scale"
[have conversation, create outline in braindump]

# Day 2: Draft introduction
You: Let's draft the hook and problem statement

# Day 3: Draft examples section
You: Now let's write the examples section

# Day 4: Draft conclusion
You: Let's wrap this up with practical takeaways

# Day 5: Polish
/polish async-communication
```

## Tips & Best Practices

### Start with Questions, Not Answers

**Don't:** "Write about microservices"
**Do:** Let brainstorming ask questions to refine scope

The conversation will reveal the specific angle.

### Use Your Experience

**Weak:** "Many companies struggle with OKRs"
**Strong:** "At Company X, I saw OKRs fail when..."

Claude will ask for your specific examples.

### Separate Research from Writing

**Braindump.md:** Dump all research, notes, rough ideas
**Draft.md:** Clean, polished output

Don't pollute draft with research noise.

### Embrace Messy Braindump

The braindump SHOULD be messy:
- Half-formed ideas ✓
- Questions without answers ✓
- Multiple competing angles ✓
- Research dumps ✓

That's its purpose. Draft is clean.

### Pause and Resume Anytime

```bash
# Day 1
/new-post "topic"
[brainstorm, outline]

# Day 2
You: Let's continue. Draft the hook.
[Claude reads braindump, continues]

# Day 3
You: Now the examples section
[continues]
```

No need to finish in one session.

### Polish Multiple Times

```bash
# First pass: Structure and content
/polish topic

# Second pass: Voice and style
/polish topic

# Third pass: Final details
/polish topic
```

Each pass can focus on different aspects.

### Reference Braindump During Drafting

```
You: Use the Amazon hiring tool example from braindump

AI: [reads braindump Examples section]
    [incorporates into draft with citation]
```

Braindump is your research repository.

## Troubleshooting

### "Topic is too vague"

**Cause:** Brainstorming hasn't narrowed focus yet

**Fix:** Answer the questions. Share your specific trigger or experience.

**Example:**
```
AI: What aspect of "productivity" interests you?
You: [don't say "all of it" - pick one angle]
     The culture aspect - always-on expectations
```

### "Draft sounds too formal/AI-like"

**Cause:** blog-writing skill not fully activated

**Fix:** Run /polish - it will catch formal language

**Or explicitly:** "Make this more conversational"

### "Not enough examples"

**Cause:** Brainstorming didn't extract your experience

**Fix:** Go back to braindump, add specific examples:
```
You: Let me add an example. At Company X...
     [Claude updates braindump]
```

Then draft will use those examples.

### "Lost track of outline"

**Check braindump.md** - outline is there

**Or ask:** "What's our outline again?"

Claude will read braindump and remind you.

### "Want to change direction mid-draft"

**No problem:**
```
You: Actually, I want to focus on X instead of Y
AI: [updates braindump Core Argument]
    [suggests revising draft sections]
```

Not locked in once you start drafting.

## Advanced Techniques

### Collaborative Research

```bash
You: Research rate limiting patterns for me

AI: [Perplexity search]
    Found 4 main patterns:
    1. Token bucket
    2. Leaky bucket
    3. Fixed window
    4. Sliding window

You: Get me the Redis implementation details for token bucket

AI: [Context7 for Redis docs + Firecrawl for blog examples]
    [adds detailed implementation to braindump]
```

### Voice Customization

Currently: Dhruv's voice (conversational, analytical, experience-grounded)

**To adjust:**
Edit `writing/skills/blog-writing/SKILL.md` for different voice principles.

### Integration with Code Examples

```bash
/new-post "Building a rate limiter"

# During drafting:
You: Add code example showing token bucket implementation

AI: [reads relevant code if available]
    [writes code block in draft with explanation]
```

### Multiple Post Series

```bash
/new-post "async-communication-part-1"
/new-post "async-communication-part-2"

# Each has own braindump + draft
# But can reference across posts:
You: Reference the Slack example from part 1
```

## Examples

### Example 1: Opinion Piece

**Topic:** "Why OKRs Fail"

**Flow:**
1. Brainstorm → identify core argument (metrics become targets)
2. Extract 3 examples from experience
3. Research Goodhart's Law for framing
4. Draft → hook with specific story
5. Polish → fix formal language, add TL;DR

**Result:** 1200-word post, conversational, grounded in experience

### Example 2: Technical Tutorial

**Topic:** "Rate Limiting in Go"

**Flow:**
1. Brainstorm → decide on token bucket approach
2. Research patterns (Context7 for Go stdlib)
3. Draft → step-by-step with code examples
4. Polish → ensure code examples are clear

**Result:** Technical tutorial in approachable style

### Example 3: Analysis Piece

**Topic:** "The Cost of Meetings"

**Flow:**
1. Brainstorm → explore real cost (time × people × opportunity)
2. Research studies on meeting effectiveness
3. Draft → data-driven analysis with personal examples
4. Polish → balance data with storytelling

**Result:** Analytical piece, backed by research, told through story

## Further Reading

- Blog-writing skill (voice/tone principles, quality checklist)
- Brainstorming skill (ideation techniques, transition signals)
- Research-synthesis skill (MCP tool usage patterns)
