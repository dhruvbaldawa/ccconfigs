# Architecture Comparison: Experimental Plugins vs Our Approach

## Structure Overview

### Experimental Plugins (Anthropic Official)

```
feature-dev/
├── commands/
│   └── feature-dev.md          (orchestration command)
└── agents/
    ├── code-explorer.md        (codebase analysis)
    ├── code-architect.md       (architecture design)
    └── code-reviewer.md        (quality review)

code-review/
└── commands/
    └── code-review.md          (orchestration + inline agents)

pr-review-toolkit/
├── commands/
│   └── review-pr.md            (orchestration command)
└── agents/
    ├── comment-analyzer.md
    ├── pr-test-analyzer.md
    ├── silent-failure-hunter.md
    ├── type-design-analyzer.md
    ├── code-reviewer.md
    └── code-simplifier.md
```

### Our Approach (ccconfigs)

```
essentials/
├── commands/
│   ├── breakdown.md            (task decomposition)
│   ├── do.md                   (task execution)
│   ├── optimize-doc.md         (documentation)
│   └── research.md             (research blockers)
├── agents/
│   ├── discovery-agent.md      (brainstorming + research)
│   └── prompt-engineer.md      (prompt optimization)
└── skills/
    ├── brainstorming/          (ideation methodology)
    ├── debugging/              (UNDERSTAND framework)
    ├── research-synthesis/     (MCP tool usage patterns)
    └── technical-planning/     (risk-first planning)

writing/
├── commands/
│   ├── new-post.md             (post initialization)
│   └── polish.md               (refinement workflow)
└── skills/
    └── blog-writing/           (voice, style, structure)
```

## Key Architectural Difference

### Their Pattern: Commands + Agents

**Commands orchestrate agents**:
- `/feature-dev` → launches code-explorer, code-architect, code-reviewer agents
- `/review-pr` → launches 6 specialized review agents
- `/code-review` → inline agent launches (no separate agent files)

**Agents are execution units**:
- Focused tools for specific analysis tasks
- Invoked by commands or by Claude proactively
- Return structured reports

**No "skills" layer** - methodology is embedded in:
- Command instructions (the workflow)
- Agent instructions (the analysis approach)

### Our Pattern: Commands + Agents + Skills

**Commands orchestrate workflows**:
- `/breakdown` → uses technical-planning skill + creates tasks
- `/do` → executes tasks, may use debugging skill
- `/research` → uses discovery-agent → invokes brainstorming + research-synthesis skills

**Agents are autonomous workers**:
- Can invoke skills during execution
- discovery-agent explicitly uses brainstorming + research-synthesis
- Agents can be launched by commands or by Claude

**Skills are reusable methodologies**:
- Not invoked directly by users
- Referenced by agents and during conversation
- Provide frameworks, checklists, decision trees
- Live across multiple commands/agents

## Comparison Table

| Aspect | Experimental Plugins | Our Approach |
|--------|---------------------|--------------|
| **Commands** | 3 total (feature-dev, code-review, review-pr) | 6 total (breakdown, do, optimize-doc, research, new-post, polish) |
| **Agents** | 9 total (code-explorer, code-architect, code-reviewer, 6 review agents) | 2 total (discovery-agent, prompt-engineer) |
| **Skills** | 0 (no skills concept) | 5 total (brainstorming, debugging, research-synthesis, technical-planning, blog-writing) |
| **Workflow location** | In command files | Split: commands define flow, skills define methodology |
| **Methodology location** | In agent prompts | In skills (reusable across contexts) |
| **Agent specialization** | High (9 narrow agents) | Low (2 broad agents) |
| **Reusability** | Agents reused across commands | Skills reused across commands + agents |

## Detailed Comparison

### 1. Commands vs Commands

#### `/feature-dev` vs `/breakdown` + `/do`

**feature-dev** (single command, 7 phases):
1. Discovery - understand request
2. Exploration - launch 2-3 code-explorer agents
3. Clarification - ask questions, wait for answers
4. Architecture - launch 2-3 code-architect agents with different approaches
5. Implementation - build the feature
6. Review - launch 3 code-reviewer agents
7. Summary - document results

**breakdown + do** (two commands, stateful):
- **breakdown**:
  - Uses technical-planning skill (4-phase approach)
  - Creates spec document with iterations and tasks
  - No exploration or clarification phases
  - No agent launches
- **do**:
  - Executes tasks from spec document
  - May use debugging skill if blocked
  - Can use `/research` command for blockers
  - Optional review with `--auto` flag

**Key differences**:
- feature-dev is monolithic, breakdown+do is composable
- feature-dev has explicit exploration/clarification phases, we don't
- feature-dev uses parallel agents extensively, we rarely do
- feature-dev presents architecture options, we use single approach from technical-planning
- Our approach maintains state in document, theirs uses TodoWrite

**Their advantages**:
✓ Exploration phase discovers patterns before planning
✓ Clarification phase catches ambiguity early
✓ Parallel agents provide multiple perspectives
✓ Architecture options give user choice
✓ Integrated review phase

**Our advantages**:
✓ Composable commands (can use separately)
✓ Skills reusable across contexts
✓ Document maintains state (survives sessions)
✓ Last Responsible Moment decision-making
✓ Iterative planning (one iteration at a time)

---

#### `/code-review` vs (we don't have this)

**code-review** (automated PR review):
- Checks eligibility (not closed/draft/already-reviewed)
- Gathers CLAUDE.md files
- Launches 5 parallel review agents
- Scores each issue 0-100 for confidence
- Filters issues < 80 confidence
- Posts GitHub comment with findings

**We have no equivalent** - this is a gap.

**What we could build**:
- `/review` command using specialized review agents
- Similar confidence scoring and filtering
- Could integrate with `/do` workflow

---

#### `/review-pr` vs (we don't have this)

**review-pr** (comprehensive review suite):
- Identifies changed files
- Determines applicable reviews (comments, tests, errors, types, code, simplify)
- Launches selected agents (sequential or parallel)
- Aggregates results by severity
- Provides action plan

**We have no equivalent** - this is a gap.

**What we could build**:
- Similar command that runs multiple review agents
- Could be part of `/do --review` flag
- Or standalone `/review` command

---

### 2. Agents vs Agents

#### Their Agents: 9 Specialized Agents

**Feature-dev agents**:
- **code-explorer**: Traces execution paths, maps architecture
- **code-architect**: Designs feature architecture with specific blueprint
- **code-reviewer**: Reviews for bugs/quality with confidence ≥80

**PR-review-toolkit agents**:
- **comment-analyzer**: Comment accuracy vs code
- **pr-test-analyzer**: Test coverage quality (rates 1-10)
- **silent-failure-hunter**: Error handling audit (CRITICAL/HIGH/MEDIUM)
- **type-design-analyzer**: Type design quality (4 dimensions, 1-10 each)
- **code-reviewer**: CLAUDE.md compliance, bugs, quality
- **code-simplifier**: Reduces complexity, improves clarity

**Characteristics**:
- Ultra-narrow focus (one concern per agent)
- Specific output formats per domain
- Domain-specific rating systems
- Invoked by commands or proactively
- Model optimization (haiku vs sonnet)

#### Our Agents: 2 Broad Agents

- **discovery-agent**: Brainstorming + research (invokes skills)
- **prompt-engineer**: Prompt optimization

**Characteristics**:
- Broad scope (multiple concerns per agent)
- Invoke skills during execution
- Less structured output formats
- Primarily invoked by commands
- No model optimization

**Key difference**:
- They have **many specialized agents**, we have **few general agents + skills**
- Their agents are execution units, our agents are orchestrators (invoke skills)

---

### 3. Skills vs (No Equivalent)

**Skills are unique to our approach** - the experimental plugins don't have this concept.

**What skills provide**:
- Reusable methodologies across commands/agents
- Frameworks (UNDERSTAND debugging, 4-phase planning)
- Decision trees (when to use which MCP tool)
- Quality checklists (14-point blog writing checklist)
- Reference materials (examples, patterns, antipatterns)

**How they're used**:
- discovery-agent explicitly invokes brainstorming + research-synthesis
- Claude references debugging during `/do` when stuck
- technical-planning guides `/breakdown`
- blog-writing guides drafting in writing plugin

**Why experimental plugins don't need them**:
- Methodology embedded directly in command instructions
- Agent prompts contain decision frameworks
- Less emphasis on reusability across contexts
- More emphasis on command-specific workflows

---

## Philosophical Differences

### Experimental Plugins: Command-Centric

**Philosophy**: Commands own complete workflows
- Each command is self-contained end-to-end workflow
- Agents are tools the command uses
- Methodology lives in command file
- Optimized for specific use cases

**Pros**:
- Clear entry points for users
- Complete workflows in one place
- Easy to understand what a command does
- Optimized for specific scenarios

**Cons**:
- Methodology not reusable across commands
- Can't compose commands easily
- Harder to adapt workflow on the fly
- Duplication across similar commands

### Our Approach: Skill-Centric

**Philosophy**: Skills own methodologies, commands apply them
- Skills are reusable frameworks
- Commands are entry points that use skills
- Agents can invoke skills
- Optimized for flexibility and reuse

**Pros**:
- Methodologies reusable across contexts
- Can invoke skills conversationally (not just via commands)
- Commands can compose (breakdown → do → research)
- Easy to adapt workflow to situation

**Cons**:
- More indirection (command → agent → skill)
- Harder to understand full workflow
- Requires understanding multiple layers
- May be over-engineered for simple cases

---

## What Should We Learn?

### 1. Agent Specialization (Their Strength)

**They have**: 9 specialized agents, each ultra-focused
**We have**: 2 broad agents that invoke skills

**Lesson**: Consider creating more specialized agents, especially for review:
- test-coverage-analyzer (like pr-test-analyzer)
- error-handling-reviewer (like silent-failure-hunter)
- architecture-explorer (like code-explorer)
- design-architect (like code-architect)

**But keep skills**: Our agents could remain orchestrators that invoke skills
- test-coverage-analyzer agent uses review-methodology skill
- error-handling-reviewer uses error-handling-principles skill

### 2. Parallel Agent Orchestration (Their Strength)

**They do**: Launch 2-3 agents in parallel for multiple perspectives
**We do**: Launch single agent or none

**Lesson**: Add parallel patterns to our commands
- `/breakdown` could launch multiple exploration agents
- `/research` could launch breadth + depth + technical agents
- New `/review` command could launch all review agents

**Integration with skills**: Parallel agents still invoke same skills
- 3 exploration agents all use technical-planning skill
- 3 research agents all use research-synthesis skill
- Different prompts/focuses, same methodology

### 3. Confidence Scoring (Their Strength)

**They do**: Quantify confidence (0-100) and filter (≥80)
**We do**: Qualitative assessment only

**Lesson**: Add confidence scoring to outputs
- Debugging findings rated 0-100
- Risk assessment in breakdown rated 1-10
- Research findings prioritized by confidence

**Integration with skills**: Skills define scoring rubrics
- debugging skill defines what makes finding high/low confidence
- technical-planning defines risk scoring criteria
- Skills own methodology, agents apply it

### 4. Explicit Workflow Phases (Their Strength)

**They do**: 7 explicit phases with checkpoints
**We do**: Implicit phases based on conversation flow

**Lesson**: Consider more explicit phases in commands
- `/breakdown` could have: Exploration → Clarification → Planning → Decomposition
- `/do` could have: Read → Plan → Implement → Verify
- But keep flexibility for conversation-driven adjustments

### 5. Skills as Reusable Frameworks (Our Strength)

**They don't have**: Skills concept
**We have**: 5 skills reusable across contexts

**Lesson**: Keep skills, but make them more discoverable
- Document when each skill is invoked
- Make skill invocation more explicit
- Consider "activating" skills for session context

**Don't copy**: Don't abandon skills for their command-centric approach
- Skills enable reuse across commands/agents
- Skills enable conversational methodology invocation
- Skills separate "what to do" from "how to invoke it"

### 6. Composable Commands (Our Strength)

**They have**: Monolithic commands (feature-dev does everything)
**We have**: Composable commands (breakdown → do → research)

**Lesson**: Keep composability but add end-to-end option
- Create `/feature` command that orchestrates breakdown + do + review
- But keep individual commands usable standalone
- Best of both worlds: composable AND comprehensive

---

## Recommendations Refined

### Immediate (Commands)

1. **Add exploration phase to `/breakdown`**
   - Launch 2-3 agents to explore codebase before planning
   - Agents use technical-planning skill for analysis
   - Return essential files list

2. **Add clarification phase to `/breakdown`**
   - After exploration, before task creation
   - Present questions, wait for answers
   - Update spec with clarifications

3. **Add parallel research to `/research`**
   - Launch breadth + depth + technical agents
   - All use research-synthesis skill
   - Consolidate findings

### Immediate (Agents)

1. **Create specialized review agents**
   - test-coverage-analyzer
   - error-handling-reviewer
   - code-quality-reviewer
   - Each invokes relevant skills

2. **Add confidence scoring to agent outputs**
   - Agents rate findings 0-100 or 1-10
   - Skills define rating rubrics
   - Commands filter by threshold

3. **Add "Essential Files" to agent outputs**
   - All agents return 5-10 key files
   - Commands explicitly read files
   - Improves efficiency

### Medium-term (Commands)

1. **Create `/feature` command** (end-to-end)
   - Orchestrates: exploration → clarification → breakdown → do → review
   - Uses existing commands internally
   - Adds phases breakdown/do don't have

2. **Create `/review` command**
   - Launches all specialized review agents
   - Aggregates by confidence/severity
   - Integrates with `/do --review` flag

3. **Add architecture options to `/breakdown`**
   - After clarification, present 2-3 approaches
   - Use technical-planning skill for each
   - User chooses approach

### Medium-term (Skills)

1. **Create review-methodology skill**
   - Confidence scoring rubrics
   - False positive patterns
   - Review output standards
   - Used by all review agents

2. **Create exploration-methodology skill**
   - Codebase analysis patterns
   - File identification guidelines
   - Architecture mapping techniques
   - Used by exploration agents

3. **Enhance existing skills with quantification**
   - Add scoring rubrics to debugging
   - Add risk ratings to technical-planning
   - Add priority ratings to research-synthesis

---

## Architecture Decision

### Should we adopt their command-centric approach or keep skill-centric?

**Verdict: Keep skill-centric, but add their patterns**

**Why keep skills**:
1. Reusability across commands/agents/conversation
2. Separation of methodology from invocation
3. Flexibility for conversation-driven workflows
4. Progressive disclosure (skills → reference/)
5. Easier to maintain (methodology in one place)

**What to adopt from them**:
1. Specialized agents (but agents invoke skills)
2. Parallel agent orchestration (but agents use same skills)
3. Confidence scoring (but skills define rubrics)
4. Explicit workflow phases (but skills guide phases)
5. End-to-end commands (but commands compose our existing commands)

**Best of both worlds**:
- **Their strengths**: Specialized agents, parallel execution, confidence scoring, explicit workflows
- **Our strengths**: Reusable skills, composable commands, conversation-driven, flexible
- **Combination**: Specialized agents that invoke skills, with both composable and end-to-end commands

---

## Conclusion

The experimental plugins demonstrate **tactical excellence** in command and agent design:
- Ultra-specialized agents for focused analysis
- Parallel execution for comprehensive coverage
- Confidence scoring for noise reduction
- Explicit workflows with checkpoints

Our approach demonstrates **strategic excellence** in methodology reuse:
- Skills separate methodology from invocation
- Composable commands for flexibility
- Conversation-driven workflows
- Progressive disclosure of complexity

**The path forward**: Adopt their tactical patterns while keeping our strategic architecture.
- Create specialized agents that invoke our skills
- Add parallel orchestration to our commands
- Add confidence scoring using skill-defined rubrics
- Create end-to-end commands that compose our existing commands

This gives us the best of both approaches without abandoning our foundational insight: **methodology should be reusable, not duplicated across commands and agents**.
