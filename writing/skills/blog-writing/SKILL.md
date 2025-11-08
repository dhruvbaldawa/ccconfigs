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

## Critical: User Control and No Injection

**You assist, you don't inject. The user is in control.**

**NEVER add content to draft.md without explicit approval:**
- Don't make up examples, milestones, or technical details
- Don't invent data, statistics, or research findings
- Don't add sections or points the user hasn't mentioned
- Don't fill in gaps with your own ideas

**ALWAYS ask before adding anything:**
```
User: Draft the intro
AI: I'd suggest opening with [your anecdote from braindump about Company X].
    Should I use that or would you prefer a different hook?
```

**Show, don't inject:**
```
❌ BAD (injecting):
AI: [writes intro with made-up story about OKRs failing]

✓ GOOD (showing and asking):
AI: I see in braindump you mentioned OKRs failing at 3 companies.
    Should I use that as the opening hook? If so, which company
    story would be strongest - the Series B startup or the enterprise?
```

**For technical content (roadmaps, architecture, etc.):**
- NEVER make up milestones, timelines, or technical decisions
- Only use what the user has explicitly stated in braindump
- If something is missing, ASK: "What milestones should I include here?"
- Don't fill gaps with "typical" or "standard" approaches

**For research and data:**
- Only cite real research from braindump.md (sourced via MCP tools)
- NEVER make up statistics, studies, or sources
- If you need data, ask user or use research-synthesis skill
- If uncertain, say "I don't have data for this claim - should I research it?"

**User has final say:**
- Always present drafts for review
- Accept user edits without resistance
- If user says "no," respect it immediately
- Your job is to help express THEIR thoughts, not add yours

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

## Structure Template

### Title
Clear, compelling, works as email subject line

### TL;DR
3-4 bullet points summarizing core takeaways

### Introduction
Hook the reader with one of:
- Personal anecdote that illustrates the problem
- Problem statement that resonates with reader experience
- Rhetorical question that frames the discussion

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
- [ ] Avoids corporate jargon, hyperbole, or AI-sounding language
- [ ] Ends with practical implications and an engagement question
- [ ] Varies sentence length for rhythm and interest
- [ ] Uses bold text for key insights (but not excessively)
- [ ] Works well in both web and email formats

## Common Pitfalls to Avoid

1. **Sounding Too Corporate**: Avoid phrases like "leverage," "synergy," "best practices" without irony
2. **AI Tell-Tale Signs**: Don't write "in conclusion," "in today's fast-paced world," or use excessive lists of adjectives
3. **Lecturing Tone**: Don't talk down to readers; invite them into a conversation
4. **Burying the Lede**: Don't save insights for the end; front-load value
5. **Oversimplification**: Don't pretend complex problems have simple solutions
6. **Missing the Personal Touch**: Don't write generic advice without grounding in experience
7. **Forgetting the Question**: Always end with reader engagement, not just a summary

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
