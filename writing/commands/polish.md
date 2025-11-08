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
- [ ] Avoids corporate jargon, hyperbole, AI-sounding language
- [ ] Ends with practical implications and engagement question
- [ ] Varies sentence length for rhythm
- [ ] Uses bold text for key insights (not excessively)
- [ ] Works well in web and email formats

**4. Identify Improvements**

Look for:
- **Structural issues**: Missing TL;DR, weak hook, no engagement question
- **Voice issues**: Too formal, corporate language, AI phrases
- **Style issues**: Long paragraphs, monotonous rhythm, missing emphasis
- **Content issues**: Unsupported claims, missing examples, no citations
- **Substack issues**: Poor formatting, hard to scan, not mobile-friendly

**5. Present Suggestions** (Hybrid Approach)

**CRITICAL: Only suggest improvements based on existing content.**
- Don't add new ideas, examples, or milestones the user hasn't mentioned
- Only reference content from braindump.md or draft.md
- Focus on style, structure, and polish - not new content
- If something is missing (e.g., no examples), ASK the user to provide it - don't make it up

Show 3-5 concrete improvements you recommend:

```
I found several improvements to make:

1. **Hook**: Current intro is explanatory. Suggest rewriting with
   personal anecdote from braindump (Company X OKR failure story).

2. **Missing TL;DR**: Add 3-bullet summary at the top.

3. **Long paragraphs**: Section "Why OKRs Fail" has 6-sentence
   paragraph. Break into 2-3 shorter ones.

4. **Missing citation**: Claim about "70% failure rate" lacks source.
   Found in braindump - add HBR 2024 reference.

5. **Weak ending**: Currently just summarizes. Add engagement
   question: "Have you seen OKRs fail at your company? What went wrong?"

Should I apply these improvements to draft.md?
```

**6. Wait for Confirmation**

User responds:
- "Yes" / "Apply all" → Apply all suggested improvements
- "Only 1, 3, 5" → Apply specific improvements
- "Skip 2" → Apply all except specified ones
- "Show me #1 first" → Show the specific change before applying

**7. Apply Improvements**

Update `draft.md` with approved changes. After applying:

```
Applied improvements to draft.md:
✓ Rewrote intro with personal anecdote
✓ Split long paragraph in "Why OKRs Fail" section
✓ Added engagement question to conclusion

Draft is now more polished. Want to review another section or run /polish again?
```

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
- Remove AI phrases ("in conclusion," "in today's world")
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
