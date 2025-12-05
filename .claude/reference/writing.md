# The Writing Plugin

## Overview

Conversation-driven workflow for blog writing in Dhruv Baldawa's distinctive style. Emphasizes natural back-and-forth over rigid command sequences, with two-document approach separating messy ideation from polished prose.

## Two-Document Workflow

**braindump.md** - Messy collaborative workspace:
- Research findings, citations, sources
- Rough ideas and notes
- Outline iterations
- Examples and anecdotes
- Questions to resolve

**draft.md** - Clean blog post:
- Structured markdown in Dhruv's voice
- Polished, publishable content
- References research from braindump

## Slash Commands

**`/new-post [topic]`**: Initializes new blog post with directory structure. Creates `posts/[topic]/` containing braindump.md (with template sections: Context, Research, Examples, etc.) and draft.md (with frontmatter and structure). Kicks off brainstorming conversation.

**`/polish [topic or path]`**: Hybrid refinement workflow (suggest → confirm → apply). Runs quality checklist from blog-writing skill, presents 3-5 concrete improvements, waits for user confirmation, applies approved changes. Can be run multiple times during writing process, not just final pass.

## Skills

**blog-writing**: Write posts in Dhruv's distinctive voice - conversational yet analytical, grounded in personal experience, with clear structure and practical insights optimized for Substack. Active during drafting phase. Transforms ideas from braindump → polished prose in draft. Includes voice/tone principles, structure template, language guidelines, quality checklist (14 points), and common pitfalls.

**Uses skills from essentials plugin:**
- **brainstorming** (essentials): Collaborative ideation through questions and exploration. Context-aware for writing - updates braindump.md, transitions to drafting when ready.
- **research-synthesis** (essentials): Research tool usage for research. Synthesizes findings into braindump.md during ideation.

**Key pattern**: Skills guide natural conversation, commands are just utilities. Most operations (add to braindump, revise draft) happen through chat. Research tools (WebFetch, WebSearch, Parallel Search, Perplexity, Context7) used proactively during conversation, not via separate commands.

## Design Philosophy

- **Conversation-first**: Natural dialogue over rigid command sequences
- **Minimal commands**: Only `/new-post` and `/polish` - everything else through chat
- **Iterative**: Write section by section, pause, resume
- **Skills guide flow**: Brainstorming → Research → Drafting → Polishing
- **Progressive disclosure**: Main SKILL.md files concise (<500 lines), examples in reference/
