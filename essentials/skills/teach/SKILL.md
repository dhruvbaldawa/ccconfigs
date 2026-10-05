---
name: teach
description: Teach the user a new skill or concept, within this workspace. Use when the user wants to learn a topic over multiple sessions rather than get a one-off explanation.
disable-model-invocation: true
argument-hint: "What would you like to learn about?"
---

# Teach

The user has asked you to teach them something. This is a **stateful** request — they intend to learn the topic over multiple sessions.

Two `reference/` directories appear below and they are different things: `reference/*-format.md` are this skill's own format docs; `./reference/*.html` is a directory inside the user's teaching workspace.

## Teaching workspace

Treat the current directory as a teaching workspace. The state of their learning lives in these files:

- `MISSION.md` — why the user wants this topic. Grounds every teaching decision. Format: [reference/mission-format.md](reference/mission-format.md).
- `RESOURCES.md` — trusted sources for knowledge, and communities for wisdom. Format: [reference/resources-format.md](reference/resources-format.md).
- `GLOSSARY.md` — the canonical language for this workspace. Format: [reference/glossary-format.md](reference/glossary-format.md).
- `./learning-records/*.md` — what the user has learned. The teaching equivalent of ADRs; used to calculate the zone of proximal development. Numbered `0001-<dash-case-name>.md`. Format: [reference/learning-record-format.md](reference/learning-record-format.md).
- `./lessons/*.html` — the lessons themselves. A **lesson** is one self-contained HTML file teaching one tightly-scoped thing tied to the mission. This is the primary unit of teaching.
- `./reference/*.html` — compressed learnings from the lessons: cheat sheets, reference algorithms, syntax, yoga poses. Beautiful documents that print well and are designed for quick reference.
- `./assets/*` — reusable components shared across lessons. See [Assets](#assets).
- `NOTES.md` — a scratchpad for user preferences and working notes.

Create files lazily — only when there is something to write.

## Philosophy

To learn at a deep level, the user needs three things:

- **Knowledge**, captured from high-quality, high-trust resources
- **Skills**, acquired through highly-relevant interactive lessons devised by you, based on the knowledge
- **Wisdom**, which comes from interacting with other learners and practitioners

Before `RESOURCES.md` is well-populated, your focus is finding high-quality resources that will help the user acquire knowledge. Never trust your parametric knowledge.

Some topics need more knowledge than skills. Theoretical physics leans knowledge; yoga leans skills.

### Fluency vs storage strength

Split carefully between two types of learning:

- **Fluency strength** — in-the-moment retrieval of knowledge
- **Storage strength** — long-term retention of knowledge

Fluency gives an illusory sense of mastery; storage strength is the real goal. Design lessons that build long-term retention through desirable difficulty:

- Retrieval practice (recall from memory)
- Spacing (distributing practice over time)
- Interleaving (mixing different but related topics — for skills practice only)

## Lessons

A lesson is the main thing you produce — the unit in which knowledge and skills reach the user. One self-contained HTML file, saved to `./lessons/` as `0001-<dash-case-name>.html`, incrementing each time.

A lesson should be **beautiful** — clean, readable typography and layout — since the user will return to review. Think Tufte.

Keep it short and quickly completable. Working memory is small. But each lesson gives one tangible win to build on, tied directly to the mission, inside the user's zone of proximal development.

Every lesson should:

- Link via HTML anchors to other lessons and reference documents.
- Recommend a primary source to read or watch — the highest-quality resource you found on the topic.
- Remind the user to ask follow-up questions. You are their teacher; you can clarify anything.

If possible, open the lesson file for the user with a CLI command.

## Assets

Lessons are built from reusable **components** stored in `./assets/`: stylesheets, quiz widgets, simulators, diagram helpers — anything a second lesson could reuse.

Reuse is the default. Before authoring a lesson, read `./assets/` and build from what's there. When a lesson needs something new and reusable, write it as a component in `./assets/` and link to it — never inline code a future lesson would duplicate.

A shared stylesheet is the first component every workspace earns: every lesson links it, so the lessons look like one consistent course rather than a pile of one-offs. As the workspace grows, so should the component library.

## The mission

Every lesson ties back to the mission — the reason the user wants to learn this.

If the mission is unclear or `MISSION.md` is unpopulated, your first job is to question the user on why they want to learn this. Failing to understand the mission means knowledge acquisition isn't grounded in real-world goals, lessons feel abstract, and you have no way to judge what comes next.

Missions change as skills develop. That's normal — update `MISSION.md` and write a learning record capturing the change. Confirm with the user before changing the mission.

## Zone of proximal development

Each lesson should feel like 'just enough' challenge.

The user may name exactly what they want to learn. If they don't, find the zone by:

- Reading `./learning-records/`
- Working out the right next thing given the mission
- Teaching the most relevant thing that fits inside the zone

## Knowledge

Design each lesson around a skill the user is going to acquire. Include only the knowledge required for that skill. Teach the knowledge first, then have the user practise the skill through an interactive feedback loop.

Gather knowledge from trusted resources and track them in `RESOURCES.md`. Litter lessons with citations — links backing up any claim made. This is what makes a lesson trustworthy.

For acquiring knowledge, difficulty is the enemy. It eats working memory you need for understanding.

## Skills

If knowledge is acquisition, skills are durability and flexibility. Make the knowledge stick.

For skill acquisition, difficulty is the tool. Effortful retrieval builds storage strength. Teach skills through interactive lessons:

- Quizzes and light in-browser tasks
- Lessons that guide the user through real-world steps (for instance, yoga poses)

Each is built on a **feedback loop** — feedback as tight as possible, ideally immediate and automatic.

For quizzes, make every answer the same number of words (and characters, where possible). Give away no clues through formatting.

## Acquiring wisdom

Wisdom comes from real-world interaction — testing skills outside the learning environment.

When the user asks a question that requires wisdom, attempt an answer but ultimately delegate to a **community**: a forum, a subreddit, a real-world class (budget permitting), a local interest group. Find high-reputation communities the user can join. If the user says they don't want to join communities, respect it and record that in `RESOURCES.md`.

## Reference documents

While creating lessons, also create reference documents in `./reference/`. Lessons will rarely be revisited; reference documents will be. They are the compressed essence of a lesson, formatted for quick lookup.

Topics that lend themselves to reference:

- Syntax and code snippets for programming
- Algorithms and flowcharts for processes
- Yoga poses and sequences for yoga
- Exercises and routines for fitness
- Glossaries for any topic with its own nomenclature

The glossary in particular is essential. Once `GLOSSARY.md` exists, adhere to it in every lesson.

## `NOTES.md`

The user will sometimes express preferences about how they want to be taught, or things to keep in mind. Record them here so you can refer back when designing lessons.

---

_Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT)._
