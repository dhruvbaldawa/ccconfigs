# Understanding the Architecture: Commands, Agents, Skills

## The Official Definitions

### Slash Commands (User-Invoked)
- **What**: User explicitly types `/command-name` to trigger
- **Purpose**: Shortcuts for executing predefined actions
- **Invocation**: Manual, user-initiated
- **Scope**: Lightweight, single-file prompts
- **Storage**: `.claude/commands/` or `~/.claude/commands/`

**Example**: User types `/breakdown spec.md` → command executes immediately

---

### Subagents (Delegated, Autonomous)
- **What**: Specialized AI assistants with separate context windows
- **Purpose**: Delegate specific tasks to expert workers
- **Invocation**: Can be explicit (command launches) OR contextual (Claude delegates)
- **Scope**: Independent workers with custom system prompts and tool restrictions
- **Storage**: `.claude/agents/` or `~/.claude/agents/`

**Key trait**: "Works independently and returns results" with separate context

**Example**: Command launches code-explorer agent → agent analyzes codebase in separate context → returns findings

---

### Skills (Model-Invoked, Automatic)
- **What**: Modular expertise packages that extend Claude's capabilities
- **Purpose**: Enable automatic expertise activation based on context
- **Invocation**: **Claude decides autonomously** based on description and relevance
- **Scope**: Reusable methodologies, not explicitly called
- **Storage**: `.claude/skills/` or `~/.claude/skills/`

**Key trait**: "Model-invoked, meaning Claude autonomously determines when to use them"

**Example**: User mentions debugging → Claude automatically activates debugging skill → brings in UNDERSTAND methodology

---

## The Critical Distinction I Missed

### Skills are NOT "invoked" by agents or commands

**Wrong understanding** (what I thought):
- Commands invoke agents
- Agents invoke skills
- Skills are execution units

**Correct understanding** (from docs):
- Commands are user-invoked (explicit `/command`)
- Agents are delegated workers (separate context)
- Skills are **model-invoked** (Claude auto-activates based on context)

**Skills don't get "called"** - they get **activated by Claude** when relevant.

---

## Re-analyzing the Experimental Plugins

### feature-dev Plugin

**Structure**:
```
commands/
  feature-dev.md          (user-invoked command)
agents/
  code-explorer.md        (delegated worker)
  code-architect.md       (delegated worker)
  code-reviewer.md        (delegated worker)
```

**No skills** - Why?
- Methodology is embedded in agent system prompts
- Command-driven workflow (not conversational)
- Agents work in separate context with all instructions included
- No need for Claude to auto-activate expertise during conversation

**Workflow**:
1. User types `/feature-dev`
2. Command orchestrates 7 phases
3. Command launches agents (code-explorer, code-architect, code-reviewer)
4. Agents work independently with prompts that include all methodology
5. Agents return results to command

---

### pr-review-toolkit Plugin

**Structure**:
```
commands/
  review-pr.md            (user-invoked command)
agents/
  comment-analyzer.md     (delegated worker)
  pr-test-analyzer.md     (delegated worker)
  silent-failure-hunter.md (delegated worker)
  type-design-analyzer.md  (delegated worker)
  code-reviewer.md        (delegated worker)
  code-simplifier.md      (delegated worker)
```

**No skills** - Why?
- Same reason: agent prompts contain all methodology
- Command-driven workflow
- Agents are self-contained experts

**BUT** - Agent descriptions suggest they can be invoked contextually:
- "Use this agent when reviewing code changes..." (comment-analyzer)
- "Use this agent when you need to review test coverage..." (pr-test-analyzer)

This means Claude can proactively launch these agents during conversation, not just via command.

---

### Our Approach

**Structure**:
```
commands/
  breakdown.md            (user-invoked)
  do.md                   (user-invoked)
  research.md             (user-invoked)
  optimize-doc.md         (user-invoked)
agents/
  discovery-agent.md      (delegated worker)
  prompt-engineer.md      (delegated worker)
skills/
  brainstorming/          (model-invoked)
  debugging/              (model-invoked)
  research-synthesis/     (model-invoked)
  technical-planning/     (model-invoked)
  blog-writing/           (model-invoked)
```

**Why do we have skills?**
- For **conversational** expertise activation
- User asks about debugging → Claude activates debugging skill
- User mentions blog writing → Claude activates blog-writing skill
- **Without needing explicit commands or agent launches**

---

## The Philosophical Difference

### Their Approach: Command-Driven + Agent-Delegated

**Philosophy**: Structured workflows with specialized workers
- User triggers command → Command orchestrates → Agents execute
- Methodology lives in agent prompts
- Optimized for: Repeatable, structured tasks (feature dev, PR review)

**When it works well**:
- Complex multi-step workflows
- Need for specialized analysis
- Team-based development processes
- Consistent, repeatable operations

**When it's limiting**:
- Conversational, exploratory tasks
- Flexible workflows that don't fit templates
- Need for expertise without full workflow

---

### Our Approach: Skill-Augmented + Conversation-Driven

**Philosophy**: Conversational assistance with auto-activated expertise
- User describes need → Claude activates relevant skills → Provides guidance
- Optional commands for structured workflows
- Methodology lives in skills (reusable, auto-activated)
- Optimized for: Flexible, conversational assistance

**When it works well**:
- Exploratory conversations (brainstorming, debugging)
- Flexible workflows that adapt to context
- Learning and guidance (not just execution)
- Writing and creative work

**When it's limiting**:
- Complex multi-step workflows need orchestration
- Parallel analysis requires explicit coordination
- Structured review processes

---

## The Key Insight

### Skills and Agents Serve Different Purposes

**Skills** (model-invoked):
- For **conversational context**
- Claude brings in expertise automatically
- Available across all conversations
- No separate context window
- User doesn't need to know they exist

**Agents** (delegated):
- For **focused work**
- Launched explicitly (by command or Claude's decision)
- Separate context window
- Self-contained with all instructions
- Returns results to caller

**Both are valuable for different use cases.**

---

## What the Great Artist Should Steal

### 1. Specialized Agents for Focused Tasks ✓ STEAL

**They have**: 9 specialized agents
- code-explorer (traces execution)
- code-architect (designs architecture)
- code-reviewer (reviews quality)
- comment-analyzer (checks comments)
- pr-test-analyzer (analyzes tests)
- silent-failure-hunter (finds error handling issues)
- type-design-analyzer (reviews types)
- code-simplifier (reduces complexity)

**We have**: 2 broad agents
- discovery-agent (brainstorming + research)
- prompt-engineer (prompt optimization)

**What to steal**:
- Create specialized analysis agents for focused tasks
- test-coverage-analyzer
- error-handling-reviewer
- architecture-explorer
- design-architect

**How to adapt**:
- Keep agents focused on analysis/work
- Let skills provide conversational expertise
- Agents for "do this specific task"
- Skills for "help me think about this"

---

### 2. Parallel Agent Orchestration ✓ STEAL

**They do**: Launch 2-3 agents in parallel for comprehensive coverage

**We do**: Launch single agent or none

**What to steal**:
- Add parallel launches to commands
- `/breakdown` → launch 2-3 exploration agents
- `/research` → launch breadth + depth + technical agents
- New `/review` → launch all review agents in parallel

**How to adapt**:
- Commands orchestrate parallel agents
- Agents work independently
- Commands consolidate results

---

### 3. Confidence Scoring in Agent Outputs ✓ STEAL

**They do**: Agents quantify confidence (0-100) and filter (≥80)

**We do**: Qualitative assessment only

**What to steal**:
- Add confidence ratings to agent outputs
- Filter low-confidence findings
- Prioritize by confidence

**How to adapt**:
- Agents quantify confidence in prompts
- Skills could provide scoring rubrics (for conversational guidance)
- Commands filter by threshold

---

### 4. Structured Multi-Phase Workflows ✓ STEAL (Partially)

**They do**: Explicit phases with checkpoints (Discovery → Exploration → Clarification → Architecture → Implementation → Review → Summary)

**We do**: Implicit phases in conversation flow

**What to steal**:
- Add explicit phases to complex commands
- Add checkpoints for user confirmation
- Add exploration/clarification phases

**How to adapt**:
- Keep conversation-driven flexibility
- Add structured option for complex workflows
- Create `/feature` as structured option
- Keep `/breakdown` + `/do` as flexible option

---

### 5. Agent Prompt Engineering Patterns ✓ STEAL

**Their agents have**:
- Ultra-clear mission statements
- Specific output formats
- Domain-specific analysis frameworks
- Explicit tool restrictions
- Model selection (haiku vs sonnet)
- Color coding

**Our agents have**:
- Broad descriptions
- Flexible outputs
- No tool restrictions
- Default model

**What to steal**:
- Improve agent prompt clarity
- Add specific output formats
- Add tool restrictions where appropriate
- Add model selection
- Add color coding

---

### 6. Contextual Agent Invocation Patterns ✓ STEAL

**Their agents** (pr-review-toolkit):
- Include description with usage examples
- Claude can invoke proactively during conversation
- "Use this agent when..." patterns

**Our agents**:
- Descriptions but no usage examples
- Primarily invoked by commands

**What to steal**:
- Add "Use this agent when..." patterns to descriptions
- Add usage examples
- Enable proactive agent invocation

---

## What NOT to Steal (Keep Our Strengths)

### 1. Skills for Conversational Expertise ✓ KEEP

**Why skills are valuable**:
- Enable expertise activation without commands
- User asks "how do I debug this?" → debugging skill activates
- No need to know specific command or agent exists
- Methodology reusable across all contexts

**Their plugins lack this** because they're command-driven, not conversational.

**Keep**: All 5 skills (brainstorming, debugging, research-synthesis, technical-planning, blog-writing)

**Enhance**: Add more skills for other domains

---

### 2. Composable Commands ✓ KEEP

**Our strength**: Commands compose
- `/breakdown` creates plan
- `/do` executes tasks from plan
- `/research` unblocks tasks
- Can use separately or together

**Their approach**: Monolithic commands
- `/feature-dev` does everything
- Can't use phases separately

**Keep**: Composability

**Add**: End-to-end option (`/feature`) that orchestrates composable commands

---

### 3. Conversation-Driven Flexibility ✓ KEEP

**Our strength**: Workflows adapt to conversation
- Can pause, discuss, change direction
- Skills activate based on context
- Not locked into rigid phases

**Their approach**: Explicit phases with checkpoints
- More structured, less flexible
- Good for repeatable workflows

**Keep**: Flexibility for exploratory work

**Add**: Structured option for repeatable workflows

---

### 4. Progressive Disclosure ✓ KEEP

**Our strength**: Skills have reference/ subdirectories
- Main SKILL.md concise (<500 lines)
- Detailed examples in reference/
- Don't overwhelm initially

**Their approach**: Everything in agent prompts
- Can be verbose
- All or nothing

**Keep**: Progressive disclosure pattern

---

## Refined Recommendations

### Phase 1: Enhance Agents (Steal Their Patterns)

1. **Create specialized review agents**
   - test-coverage-analyzer (inspired by pr-test-analyzer)
   - error-handling-reviewer (inspired by silent-failure-hunter)
   - architecture-explorer (inspired by code-explorer)
   - design-architect (inspired by code-architect)

2. **Improve agent prompts**
   - Add clear mission statements
   - Add specific output formats
   - Add "Use this agent when..." patterns with examples
   - Add confidence scoring instructions
   - Add model selection (haiku vs sonnet)
   - Add tool restrictions where appropriate

3. **Enable contextual invocation**
   - Make agent descriptions trigger-friendly
   - Add usage examples to descriptions
   - Let Claude proactively launch agents during conversation

---

### Phase 2: Enhance Commands (Steal Their Patterns)

1. **Add parallel agent orchestration**
   - `/breakdown` → launch 2-3 exploration agents in parallel
   - `/research` → launch breadth + depth + technical agents
   - New `/review` → launch all review agents in parallel

2. **Add explicit phases to complex commands**
   - `/breakdown` → Exploration → Clarification → Planning → Decomposition
   - Add checkpoints for user confirmation
   - Make phases explicit in todo tracking

3. **Create end-to-end command**
   - `/feature` → orchestrates exploration + breakdown + do + review
   - Structured workflow for repeatable tasks
   - Uses composable commands internally

---

### Phase 3: Enhance Skills (Keep Our Strength)

1. **Keep all existing skills**
   - brainstorming, debugging, research-synthesis, technical-planning, blog-writing
   - These provide conversational expertise

2. **Add skill-defined rubrics**
   - Skills provide frameworks for agents to use
   - Debugging skill defines confidence scoring for bugs
   - Technical-planning defines risk rating criteria
   - Research-synthesis defines source quality assessment

3. **Add more skills for other domains**
   - code-review-methodology skill (for review agents to reference)
   - testing-methodology skill (for test analysis)
   - architecture-methodology skill (for design agents)

---

## The Unified Architecture

```
Commands (user-invoked)
  ├─→ Orchestrate workflows
  ├─→ Launch agents (parallel or sequential)
  └─→ Create context where skills activate

Agents (delegated workers)
  ├─→ Specialized for focused tasks
  ├─→ Work in separate context
  ├─→ Can reference skill methodologies in prompts
  └─→ Return structured results with confidence scores

Skills (model-invoked)
  ├─→ Activate automatically in conversation
  ├─→ Provide reusable methodologies
  ├─→ Define rubrics agents can use
  └─→ Enable expertise without explicit invocation
```

**The synergy**:
- Commands invoke agents for structured work
- Skills activate for conversational guidance
- Agents can reference skills for methodology
- All three work together

**Example flow**:

User: "I need to add caching to the API"

1. **Skill activates**: technical-planning skill activates (conversational)
   - Claude asks clarifying questions about requirements

2. **Command triggered**: User types `/breakdown api-caching-spec.md`
   - Command launches 2-3 architecture-explorer agents in parallel
   - Agents analyze codebase with separate contexts
   - Agents return findings with confidence scores

3. **Skill activates again**: technical-planning guides breakdown creation
   - Claude uses skill methodology to create task breakdown
   - Breakdown includes risk ratings from skill rubrics

4. **Command triggered**: User types `/do api-caching-spec.md 1`
   - Command executes task
   - If stuck, launches agents for help

5. **Skill activates**: debugging skill activates if issues found
   - Claude guides troubleshooting conversationally

This combines:
- Their structured workflows (commands + agents)
- Our conversational expertise (skills)
- Their specialized analysis (focused agents)
- Our flexible guidance (skill activation)

---

## Final Answer: What Can the Great Artist Steal?

### Steal and Adapt

1. ✅ **Specialized agents** - Create focused agents for specific tasks
2. ✅ **Parallel orchestration** - Launch multiple agents for comprehensive coverage
3. ✅ **Confidence scoring** - Quantify and filter findings
4. ✅ **Structured phases** - Add explicit workflows for complex tasks
5. ✅ **Agent prompt patterns** - Clear missions, specific outputs, usage examples
6. ✅ **Contextual invocation** - Enable proactive agent launching

### Keep and Enhance

1. ✅ **Skills** - Conversational expertise activation (they don't have this)
2. ✅ **Composable commands** - Flexible building blocks (they're monolithic)
3. ✅ **Conversation-driven** - Adaptive workflows (they're rigid)
4. ✅ **Progressive disclosure** - Reference materials (they embed everything)

### The Synthesis

**Great artists steal by transforming, not copying.**

We don't want to become command-driven and rigid (their weakness).
We don't want to lose conversational flexibility (our strength).

We want to **steal their execution patterns** (specialized agents, parallel orchestration, confidence scoring) while **keeping our guidance patterns** (skills, composability, conversation-driven).

The result: **Structured execution with flexible guidance**
- Agents for focused work (stolen)
- Skills for conversational expertise (kept)
- Commands for both structured workflows (stolen) and composable building blocks (kept)

---

## Immediate Next Steps

1. **Create 4 specialized agents** (2-3 hours each)
   - architecture-explorer
   - test-coverage-analyzer
   - error-handling-reviewer
   - design-architect

2. **Add parallel orchestration to `/research`** (2 hours)
   - Launch breadth + depth + technical agents
   - Consolidate findings

3. **Add confidence scoring to agent outputs** (1 hour)
   - Add scoring instructions to agent prompts
   - Add filtering to command processing

4. **Create `/review` command** (3-4 hours)
   - Orchestrate all review agents in parallel
   - Filter by confidence
   - Present prioritized findings

5. **Enhance `/breakdown` with exploration phase** (3-4 hours)
   - Launch exploration agents before planning
   - Add clarification checkpoint
   - Make phases explicit

These steal their best patterns while keeping our conversational, skill-augmented approach.
