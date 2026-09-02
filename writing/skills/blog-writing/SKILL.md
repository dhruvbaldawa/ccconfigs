---
name: blog-writing
description: Write blog posts in Dhruv Baldawa's distinctive voice - conversational yet analytical, grounded in personal experience, with clear structure and practical insights optimized for Substack. Use when writing or revising draft.md, translating ideas from braindump into polished prose.
---

# Blog Writing

## Quickstart

1. Reference braindump.md for research, examples, and outline
2. Hook the reader with an anecdote, problem statement, or rhetorical question
3. Structure with TL;DR bullets, clear H2/H3 headings, short paragraphs
4. Ground abstract concepts in personal examples; cite research from braindump
5. End with practical implications and a question to engage readers

## When to Use This Skill

Use blog-writing when:
- Writing or revising draft.md (the actual blog post)
- User asks to draft a section or the full post
- Refining existing draft content
- User runs `/polish` for quality improvements
- Translating ideas from braindump.md into polished prose

Skip this skill for:
- Brainstorming phase (use **brainstorming** skill)
- Gathering research (use **research-synthesis** skill)
- Technical documentation or API references
- Academic papers requiring formal tone

## You assist; Dhruv authors

draft.md contains only what Dhruv has said or what braindump.md records. Do not invent examples, anecdotes, milestones, statistics, studies, or "typical" approaches to fill a gap - the post is published under his name and a fabricated detail damages his credibility. When something is missing, say what's missing and ask for it (or offer to research it via the research-synthesis skill). Present drafts for review; when he says no, drop it.

## Two-Document Workflow

When working on a blog post, you'll interact with two files:

**braindump.md** - The messy workspace:
- Research findings, citations, sources
- Rough ideas and notes
- Outline iterations
- Examples and anecdotes
- Questions to resolve

**draft.md** - The clean blog post:
- Structured markdown following the template below
- Dhruv's voice and style
- Polished, publishable content
- References research from braindump

**Your role**: Transform ideas from braindump → polished prose in draft

## Core Voice & Tone Principles

**Direct and Conversational**
- Use contractions (don't, isn't, I've) naturally
- Write in first person ("I think," "I've found," "I hope")
- Address the reader directly with rhetorical questions
- Vary sentence length: short punchy lines and longer reflective sentences

**Thoughtful and Analytical**
- Present multiple perspectives on complex issues
- Be slightly skeptical of conventional wisdom and "silver bullet" solutions
- Back up strong opinions with evidence (research, citations, personal data)
- Acknowledge limitations: "I don't really have a silver bullet for this"

**Grounded in Experience**
- Use personal anecdotes to illustrate abstract concepts
- Include self-deprecating humor when appropriate
- Reference Indian context or examples when relevant
- Draw on programming/technical analogies when they clarify concepts

**Engaging and Honest**
- End posts with questions to spark discussion
- Avoid hyperbole and exaggeration in favor of measured statements
- Acknowledge complexity; avoid oversimplification
- Focus on practical implications, not purely theoretical discussions

## Structural Principles

These are the load-bearing principles for how a post holds together. The Core Voice principles above are about *sound*; these are about *shape*. Sources compiled in `references/writing-principles.md`.

**Reader-centric, not writer-centric** (McEnerney)
- Writers use text to think horizontally—a record of their process. Readers consume it vertically—value delivered. Stage-setting must answer the reader's question, not narrate your thinking.
- Test before drafting: what problem does my reader have? What do they value? The intro answers those before the argument begins.

**Progressive Disclosure**
- Never rely on a concept you haven't introduced. If the reader meets a term for the first time mid-argument, you've lost them.
- Introduce concepts at the point of first need—not earlier, not later. Don't front-load a glossary; don't delay the definition until after third use.
- Simplest mental model first; build complexity in layers. Each layer should make sense on its own before the next one depends on it.

**Fight the curse of knowledge** (Pinker; Heath brothers)
- You know the topic too well to judge what's obvious to the reader. Read each draft as a newcomer. What am I using without introducing?
- Smart-general-reader test: would someone outside your immediate circle know this term? If no, prime it at first use.

**Surprise before argument** (Graham)
- Lead with what contradicts reader assumption. Curiosity before case.
- "You probably think X. Actually, Y. Here's why." lands better than "I want to argue Y."

**Outcome before mechanism; concrete before abstract** (Evans, McKenzie)
- State what the reader will understand or be able to do, then explain how.
- Real scenario first, extracted principle second. Not the other way around.

## Structure Template

### Title
Clear, compelling, works as email subject line

### TL;DR
3-4 bullet points summarizing core takeaways. Write bullets for a cold reader: avoid in-group terms you can't prime in one line. If a term is essential, a parenthetical gloss beats a jargon wall. The TL;DR sits above stage-setting—it has to stand on its own.

### Introduction
Hook the reader with one of:
- Personal anecdote that illustrates the problem
- Problem statement that resonates with reader experience
- Rhetorical question that frames the discussion

### Stage-Setting (1–3 short paragraphs after the hook)
Before the argument begins, ground the reader. Use SCQA as a scaffold (Minto, *The Pyramid Principle*):

- **Situation**—the baseline the reader already accepts
- **Complication**—what changed or broke, why it matters *now*
- **Question**—what naturally emerges from the complication
- **Vocabulary**—for any term the post will rely on (e.g. "subagents", "Plan Mode", "skills", "MCP"), give a one-liner on first use. Link to a deeper primer rather than inlining a long definition. Don't front-load a glossary; don't defer the definition until after you've used the term three times.
- **Prior context (for series posts)**—briefly bridge what a new reader needs from earlier posts in 1–2 sentences. Don't assume they've read them.

The Answer (your argument) starts in the Body. Stage-setting is the runway, not the takeoff.

See `references/writing-principles.md` for the sources this beat draws from.

### Body
- Use clear H2/H3 headings that guide the reader
- Keep paragraphs short (1-3 sentences) for readability
- Use bullet lists or numbered steps for clarity
- Integrate quotes, citations, or references to support arguments
- Examine multiple perspectives; critique conventional wisdom
- Use metaphors and analogies to explain complex concepts
- Bold key sentences or phrases for emphasis
- Cite relevant laws/principles (Goodhart's Law, Campbell's Law, etc.) or proverbs

### Conclusion
- Summarize the key lessons or proposed solutions
- Focus on practical implications (what can readers actually do with this?)
- End with a bold call to action or direct question:
  - "I'd like to know your thoughts on this"
  - "I would like to hear your comments"
  - "Have you encountered this problem? How did you solve it?"

## Language Guidelines

**Vocabulary**
- Use straightforward vocabulary; avoid overly formal academic language
- Include occasional technical terms when relevant to the topic
- Define or explain jargon in context for accessibility
- Use sentence fragments for emphasis when appropriate

**Distinctive Phrasing**
- "This is as good as comparing apples with not apples" (for false comparisons)
- Reference laws/principles by name when they apply
- Include well-known proverbs or sayings to illustrate points
- Use phrases like "I'd like to know your thoughts" or "I would like to hear your comments"

**Formatting for Emphasis**
- **Bold** key sentences or surprising insights
- Use em dashes—like this—for asides or clarifications
- Occasional italics for subtle emphasis, but don't overuse

## Substack Optimization

**Platform-Specific Formatting**
- Use clean, simple markdown (H1 for title, H2/H3 for sections)
- Include proper line breaks between paragraphs
- Keep lists simple with clear spacing (line break before and after)
- Avoid complex tables or advanced markdown features
- Content should work well in both web and email formats

**Email-Friendly Structure**
- Strong opening hook works as email preview text
- Scannable format with short paragraphs and clear headings
- Break up long sections with subheadings or lists
- Consider how content flows when reading on mobile

**Engagement Optimization**
- End with a question suitable for comments/replies
- Write for diverse audience across devices
- Include brief context for technical terms (email readers can't easily Google)

## Quality Checklist

Before finalizing a blog post, verify:

- [ ] Opens with a compelling hook (anecdote, problem, or question)
- [ ] TL;DR provides clear, standalone summary
- [ ] Paragraphs are short (1-3 sentences) for readability
- [ ] Uses personal examples or anecdotes to ground abstract concepts
- [ ] Cites sources/research to back up claims
- [ ] Acknowledges complexity and avoids oversimplification
- [ ] Examines multiple perspectives when relevant
- [ ] Uses clear headings and structure for scannability
- [ ] Employs conversational tone with contractions and first person
- [ ] Avoids corporate jargon, hyperbole, and mannered prose
- [ ] Ends with practical implications and an engagement question
- [ ] Varies sentence length for rhythm and interest
- [ ] Uses bold text for key insights (but not excessively)
- [ ] Works well in both web and email formats
- [ ] Stage-setting beat present: situation, complication/stakes, and vocabulary established before the argument begins
- [ ] Every term the post relies on is introduced (one-liner or link) before it's used, not after
- [ ] A reader with no prior context can follow the first 25% of the post without external lookups
- [ ] For posts in a series: prior-post context bridged in 1–2 sentences, not assumed
- [ ] Concepts build in dependency order—each one rests on what's already been introduced
- [ ] Smart-general-reader test: would a reader outside my immediate circle follow the intro?
- [ ] Read the intro aloud—does anything catch?

## Common Pitfalls to Avoid

1. **Sounding Too Corporate**: Avoid phrases like "leverage," "synergy," "best practices" without irony
2. **Mannered Prose**: Metaphor and flourish standing in for a direct statement ("a dial worth turning" for "a parameter worth varying"). When a literal phrase is available, use it.
3. **Lecturing Tone**: Don't talk down to readers; invite them into a conversation
4. **Burying the Lede vs. Skipping the Setup**: Don't save insights for the end; front-load value. But front-loading is not the same as skipping stage-setting. The reader needs enough context to understand the insight when they hit it. A two-paragraph setup that lands the insight beats a one-line hook that loses the reader.
5. **Oversimplification**: Don't pretend complex problems have simple solutions
6. **Missing the Personal Touch**: Don't write generic advice without grounding in experience
7. **Forgetting the Question**: Always end with reader engagement, not just a summary
8. **In-Group Vocabulary**: Using terms like "Plan Mode", "subagents", "skills", "MCP", "CLAUDE.md" without a one-liner on first use. You know what these mean. Your reader might not. Priming takes one sentence.
9. **Sequel Syndrome**: Writing a post that only makes sense if the reader read the previous one. Every post should be a legitimate entry point, even within a series. Bridge the context; don't assume it.
10. **Horizontal Thinking on the Page** (McEnerney): Narrating your own process of figuring something out, rather than delivering what the reader came for. Drafts often need to be rewritten from the reader's vertical—what they value—not the writer's horizontal.

## Writing Philosophy

The goal is to sound like a thoughtful person sharing insights from personal experience and research, not like an AI trying to sound authoritative. The writing should feel authentic, slightly informal but still substantive, and invite the reader into a conversation rather than lecture them.

**Key Principles:**
- Be conversational but not casual
- Be analytical but not academic
- Be opinionated but not dogmatic
- Be personal but not self-indulgent
- Be practical but not simplistic

When in doubt, ask yourself: "Does this sound like something a real person would say to a friend over coffee while discussing an interesting problem they've been thinking about?"

## Integration with Other Skills

- **Before drafting**: Use **brainstorming** skill to refine ideas
- **During drafting**: Use **research-synthesis** skill if citations are needed
- **While writing**: Reference braindump.md for examples and research
- **After drafting**: Run `/polish` to apply quality checklist
