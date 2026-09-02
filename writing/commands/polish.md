---
argument-hint: [TOPIC or PATH]
description: Polish a blog post draft using quality checklist and style guidelines (hybrid: suggest → confirm → apply)
---

Target: $1

You are polishing a blog post draft. This can be run multiple times during the writing process, not just at the end.

## Process

**1. Locate the Draft**

If given a topic name, look for `posts/$1/draft.md`
If given a path, use that directly

**2. Read Both Files**

- Read `draft.md` (the post being polished)
- Read `braindump.md` (for context, research, examples)

**3. Apply Quality Checklist** (from blog-writing skill)

Evaluate the draft against:
- [ ] Opens with compelling hook (anecdote, problem, or question)
- [ ] TL;DR provides clear, standalone summary
- [ ] Paragraphs are short (1-3 sentences)
- [ ] Uses personal examples to ground abstract concepts
- [ ] Cites sources/research to back up claims
- [ ] Acknowledges complexity, avoids oversimplification
- [ ] Examines multiple perspectives when relevant
- [ ] Uses clear headings for scannability
- [ ] Conversational tone with contractions and first person
- [ ] Avoids corporate jargon, hyperbole, mannered prose
- [ ] Ends with practical implications and engagement question
- [ ] Varies sentence length for rhythm
- [ ] Uses bold text for key insights (not excessively)
- [ ] Works well in web and email formats
- [ ] Stage-setting beat present: situation, complication/stakes, and vocabulary established before the argument begins
- [ ] Every term the post relies on is introduced (one-liner or link) before it's used, not after
- [ ] A reader with no prior context can follow the first 25% of the post without external lookups
- [ ] For posts in a series: prior-post context bridged in 1–2 sentences, not assumed
- [ ] Concepts build in dependency order—each one rests on what's already been introduced
- [ ] Smart-general-reader test: would a reader outside the immediate circle follow the intro?
- [ ] Read the intro aloud—does anything catch?

**4. Identify Improvements**

Look for:
- **Structural issues**: Missing TL;DR, weak hook, no engagement question
- **Stage-setting issues**: Missing situation/stakes, jargon introduced without priming, sequel that doesn't bridge to new readers, concepts used before defined, horizontal (writer-centric) narration where vertical (reader-centric) value is needed
- **Voice issues**: Too formal, corporate language, mannered prose
- **Style issues**: Long paragraphs, monotonous rhythm, missing emphasis
- **Content issues**: Unsupported claims, missing examples, no citations
- **Substack issues**: Poor formatting, hard to scan, not mobile-friendly

**5. Present Suggestions** (Hybrid Approach)

Suggest polish, not new content: every suggestion must trace to draft.md or braindump.md. If something is missing (an example, a source), ask for it rather than inventing it.

Present each suggestion as: what's weak, where, and the concrete change you'd make (quoting braindump when the fix comes from there). Then ask which to apply.

**6. Wait for Confirmation**

User responds:
- "Yes" / "Apply all" → Apply all suggested improvements
- "Only 1, 3, 5" → Apply specific improvements
- "Skip 2" → Apply all except specified ones
- "Show me #1 first" → Show the specific change before applying

**7. Apply Improvements**

Update `draft.md` with approved changes. After applying, list what changed and offer another pass.

## Guidelines

**Be Specific**: Don't say "improve the intro" - show exactly what you'd change

**Prioritize Impact**: Focus on high-impact improvements (weak hook, missing engagement question) over minor tweaks

**Reference Braindump**: Suggest adding content from braindump.md when it strengthens the draft

**Preserve Voice**: Only suggest changes that align with Dhruv's style - don't make it more formal or corporate

**Iterative**: This command can be run multiple times. Each pass should improve the draft without over-polishing

**Substack Formatting**: Always check for proper markdown, line breaks, mobile readability

## Common Improvements

- Add missing TL;DR
- Rewrite weak hooks with personal anecdotes
- Break up long paragraphs (>4 sentences)
- Add bold emphasis to key insights
- Insert citations from braindump research
- Strengthen conclusion with engagement question
- Remove mannered prose (metaphor or flourish where a literal phrase exists)
- Vary sentence length for better rhythm
- Add subheadings to improve scannability
- Ensure proper spacing for email format

## After Polishing

The draft should:
- Sound like Dhruv wrote it, not an AI
- Be scannable and mobile-friendly
- Have clear structure with proper emphasis
- Include concrete examples and citations
- Invite reader engagement

If multiple issues remain, user can run `/polish` again for another pass.
