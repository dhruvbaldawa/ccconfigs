# Experimental Plugins Review: Patterns & Learnings

**Date**: 2025-11-13
**Reviewed Plugins**:
- `feature-dev` - Comprehensive feature development workflow
- `code-review` - Automated PR review with confidence scoring
- `pr-review-toolkit` - Specialized review agents collection

## Executive Summary

The experimental plugins demonstrate several sophisticated patterns that could significantly enhance our existing workflows:

1. **Structured multi-phase workflows** with explicit checkpoints
2. **Parallel agent orchestration** for comprehensive analysis
3. **Confidence-based filtering** to reduce noise
4. **Explicit decision points** requiring user confirmation
5. **Agent specialization** with clear focus areas
6. **File identification patterns** before deep reading

---

## 1. Feature-Dev Plugin Analysis

### Overview
7-phase structured workflow for feature development with specialized exploration, architecture, and review agents.

### Key Patterns

#### 1.1 Multi-Phase Workflow Structure
```
Discovery → Exploration → Questions → Architecture → Implementation → Review → Summary
```

**Pattern**: Each phase has explicit goals and outputs that feed into the next phase.

**Comparison to our workflows**:
- Our `/breakdown` creates tasks but doesn't have pre-implementation exploration phases
- Our `/do` executes tasks but lacks structured clarification/design phases
- Our `technical-planning` skill has 4 phases but less explicit checkpoints

**Potential adoption**:
- Add **explicit exploration phase** to `/breakdown` before creating tasks
- Add **clarifying questions phase** after exploration, before task creation
- Add **architecture options phase** for complex features

#### 1.2 Parallel Agent Orchestration

**Pattern**: Launch 2-3 agents in parallel for comprehensive coverage from different angles.

**Examples**:
- **Phase 2 (Exploration)**: 2-3 code-explorer agents with different focuses
  - "Find similar features and trace implementation"
  - "Map architecture and abstractions"
  - "Analyze current implementation of [existing feature]"

- **Phase 4 (Architecture)**: 2-3 code-architect agents with different trade-offs
  - Minimal changes (smallest change, maximum reuse)
  - Clean architecture (maintainability, elegant abstractions)
  - Pragmatic balance (speed + quality)

- **Phase 6 (Review)**: 3 code-reviewer agents with different focuses
  - Simplicity/DRY/elegance
  - Bugs/functional correctness
  - Project conventions/abstractions

**Comparison to our workflows**:
- We rarely use parallel agent launches
- Our `discovery-agent` works alone
- Our skills don't coordinate multiple agents

**Potential adoption**:
- Update `discovery-agent` to launch multiple research agents in parallel
- Create specialized variants: research-breadth, research-depth, research-technical
- Add parallel review pattern to `/do --auto` after task completion

#### 1.3 File Identification Before Deep Reading

**Pattern**: Agents return lists of 5-10 key files, then those files are read for deep understanding.

**From code-explorer agent**:
```markdown
## Output Guidance

Include:
- Entry points with file:line references
- Step-by-step execution flow
- Key components and their responsibilities
- Architecture insights
- List of files that are absolutely essential to understanding
```

**Comparison to our workflows**:
- We use agents for analysis but don't explicitly extract file lists
- Reading happens ad-hoc during execution

**Potential adoption**:
- Update agent templates to return "Essential Files" section
- Add explicit "Read identified files" step after agent completion
- Create file-reading checklist pattern

#### 1.4 Explicit User Confirmation at Decision Points

**Pattern**: Stop and wait for user input at critical junctures.

**Examples**:
- Phase 3: Present clarifying questions, **wait for answers**
- Phase 4: Present architecture options, **ask which to use**
- Phase 5: **Wait for explicit approval** before implementation
- Phase 6: Present review findings, **ask what to do** (fix now/later/proceed)

**Comparison to our workflows**:
- `/do --auto` can run without user intervention
- `/breakdown` doesn't stop for clarification
- Skills guide conversation but don't enforce checkpoints

**Potential adoption**:
- Add `--interactive` mode to `/do` with decision checkpoints
- Add clarification phase to `/breakdown` (not optional)
- Create "checkpoint" pattern in skills for critical decisions

#### 1.5 Agent Specialization with Clear Roles

**Pattern**: Each agent has narrow, well-defined focus with specific output format.

**Agents**:
- `code-explorer`: Traces execution paths, maps architecture, documents dependencies
- `code-architect`: Designs architectures by analyzing patterns and making confident choices
- `code-reviewer`: Reviews for bugs/quality with confidence filtering (≥80)

**Comparison to our workflows**:
- `discovery-agent`: Broad scope (brainstorming + research)
- `prompt-engineer`: Specialized but underused
- Skills cover multiple concerns (brainstorming does ideation + transitions)

**Potential adoption**:
- Split `discovery-agent` into:
  - `exploration-agent`: Codebase understanding (like code-explorer)
  - `requirements-agent`: Requirements clarification
  - `research-agent`: External research with MCP tools
- Create `architect-agent` for design options
- Create `reviewer-agent` with confidence scoring

---

## 2. Code-Review Plugin Analysis

### Overview
Automated PR review using multiple parallel agents with confidence-based scoring to filter false positives.

### Key Patterns

#### 2.1 Confidence-Based Scoring System

**Pattern**: Every issue gets a 0-100 confidence score; only issues ≥80 are reported.

**Scoring rubric** (given to agents verbatim):
- **0**: Not confident, false positive or pre-existing
- **25**: Somewhat confident, might be real
- **50**: Moderately confident, real but minor
- **75**: Highly confident, real and important
- **100**: Absolutely certain, definitely real

**How it works**:
1. Launch 5 review agents in parallel with different focuses
2. Each agent returns list of issues with reasons
3. Launch parallel scoring agents (one per issue)
4. Filter out issues < 80 confidence
5. Only post comment if high-confidence issues remain

**Comparison to our workflows**:
- We don't quantify confidence in findings
- No filtering mechanism for low-priority issues
- Skills provide qualitative assessments

**Potential adoption**:
- Add confidence scoring to debugging skill outputs
- Add priority filtering to `/research` findings
- Create scoring framework for `/breakdown` risk assessment
- Add confidence thresholds to agent outputs

#### 2.2 False Positive Filtering Strategy

**Pattern**: Explicitly define and exclude common false positives.

**Examples excluded**:
- Pre-existing issues (not introduced in PR)
- Things that look like bugs but aren't
- Pedantic nitpicks
- Issues linters will catch
- General quality issues (unless in CLAUDE.md)
- Issues with lint ignore comments
- Real issues on unmodified lines

**Comparison to our workflows**:
- No explicit false positive filtering
- Quality issues mixed with critical bugs
- No differentiation between new and pre-existing

**Potential adoption**:
- Add "pre-existing vs new" analysis to debugging workflows
- Add explicit false positive categories to skills
- Create filtering guidelines for agent outputs

#### 2.3 CLAUDE.md Compliance Verification

**Pattern**: For guideline violations, verify the guideline explicitly mentions the issue.

**Process**:
1. Gather all relevant CLAUDE.md files
2. Agents flag potential guideline violations
3. Scoring agents verify guideline explicitly calls out the issue
4. Lower confidence if guideline doesn't mention it specifically

**Comparison to our workflows**:
- CLAUDE.md used as general guidance
- No explicit verification of claimed violations
- Guidelines referenced informally

**Potential adoption**:
- Add CLAUDE.md verification step to code review workflows
- Create guideline-checking pattern for skills
- Add "verify against CLAUDE.md" to agent instructions

#### 2.4 Eligibility Checking Pattern

**Pattern**: Check if work should proceed before starting AND before finalizing.

**Process**:
1. Start: Check if PR is closed/draft/trivial/already-reviewed
2. If eligible, proceed with review
3. End: Re-check eligibility before posting comment

**Comparison to our workflows**:
- No explicit eligibility checks
- Commands assume valid context
- No re-verification before finalizing

**Potential adoption**:
- Add eligibility checks to `/do` (is task already complete?)
- Add pre-flight checks to slash commands
- Add re-verification before committing changes

#### 2.5 Structured Output Format with Links

**Pattern**: Standardized markdown format with specific GitHub link format.

**Format**:
```markdown
### Code review

Found 3 issues:

1. <brief description> (CLAUDE.md says "<quote>")

https://github.com/owner/repo/blob/[full-sha]/path/file.ext#L[start]-L[end]

2. <brief description> (bug due to <snippet>)

<link with full SHA>

🤖 Generated with [Claude Code](https://claude.ai/code)
```

**Link requirements**:
- Full SHA (not abbreviated)
- Exact format: `#L[start]-L[end]`
- At least 1 line of context around issue

**Comparison to our workflows**:
- We use `file:line` format in analysis
- No standardized output templates
- No link generation for references

**Potential adoption**:
- Create output templates for skills
- Add file:line formatting standards
- Generate links in markdown outputs

---

## 3. PR-Review-Toolkit Plugin Analysis

### Overview
Collection of 6 specialized review agents, each focusing on specific code quality aspect.

### Key Patterns

#### 3.1 Highly Specialized Agents

**Pattern**: Each agent has ultra-narrow focus with domain expertise.

**Agents**:
- `comment-analyzer`: Comment accuracy vs code, documentation completeness, comment rot
- `pr-test-analyzer`: Behavioral coverage, critical gaps, test quality, edge cases
- `silent-failure-hunter`: Error handling, catch blocks, silent failures, logging
- `type-design-analyzer`: Type encapsulation, invariant expression, usefulness, enforcement
- `code-reviewer`: General CLAUDE.md compliance, bugs, quality
- `code-simplifier`: Clarity, complexity reduction, readability

**Comparison to our workflows**:
- `discovery-agent`: Multiple concerns (brainstorming + research)
- `prompt-engineer`: Narrow focus ✓
- No specialized review agents
- Skills cover broad areas (debugging covers all debugging, not specialized)

**Potential adoption**:
- Create specialized sub-agents for different review aspects
- Split broad agents into focused variants
- Create agent composition patterns

#### 3.2 Rating Systems Tailored to Domain

**Pattern**: Each agent uses domain-appropriate rating system.

**Examples**:
- `pr-test-analyzer`: Criticality 1-10 (10 = absolutely essential to add)
- `silent-failure-hunter`: Severity levels (CRITICAL, HIGH, MEDIUM)
- `type-design-analyzer`: 4 dimensions rated 1-10 each
  - Encapsulation: 1-10
  - Invariant Expression: 1-10
  - Invariant Usefulness: 1-10
  - Invariant Enforcement: 1-10
- `code-reviewer`: Confidence 0-100 (≥91 = critical)

**Comparison to our workflows**:
- Debugging skill uses 10-step checklist (binary complete/incomplete)
- No quantitative ratings in skill outputs
- Qualitative assessments only

**Potential adoption**:
- Add risk ratings (1-10) to `/breakdown` tasks
- Add confidence scores to debugging findings
- Add priority ratings to research findings
- Create domain-specific rating systems for each skill

#### 3.3 Trigger Pattern Documentation

**Pattern**: Each agent documents when/how it should be invoked with examples.

**Structure** (from agent frontmatter):
```yaml
description: Use this agent when [conditions]. Examples:

<example>
Context: [situation]
user: "[trigger phrase]"
assistant: "[response using agent]"
<commentary>
[Why this agent was appropriate]
</commentary>
</example>
```

**Comparison to our workflows**:
- Skills have usage guidelines but not formal triggers
- Agents lack explicit invocation examples
- No documented trigger patterns

**Potential adoption**:
- Add trigger examples to all agent files
- Document when to use each skill
- Create trigger pattern library

#### 3.4 Progressive Complexity Handling

**Pattern**: Agents use appropriate model for their complexity (inherit, haiku, sonnet).

**Examples from code-review command**:
- Haiku: Eligibility checks, file listing, PR summaries, confidence scoring
- Sonnet: Deep review (CLAUDE.md compliance, bugs, history analysis)

**From pr-review-toolkit agents**:
- `model: inherit` - Use parent model (flexible)
- Color coding for visual distinction

**Comparison to our workflows**:
- All agents use default model
- No explicit model selection strategy
- No cost optimization

**Potential adoption**:
- Use Haiku for quick checks and filtering
- Use Sonnet for deep analysis
- Document model selection rationale
- Add model field to agent definitions

#### 3.5 Output Structure Standardization

**Pattern**: Every agent provides structured output with consistent sections.

**Example from pr-test-analyzer**:
```markdown
1. Summary: Brief overview
2. Critical Gaps (if any): Tests rated 8-10
3. Important Improvements (if any): Tests rated 5-7
4. Test Quality Issues (if any): Brittle tests
5. Positive Observations: What's well done
```

**Example from silent-failure-hunter**:
```markdown
1. Location: File path and line numbers
2. Severity: CRITICAL/HIGH/MEDIUM
3. Issue Description: What's wrong
4. Hidden Errors: Specific error types that could be suppressed
5. User Impact: How it affects users
6. Recommendation: How to fix
7. Example: Corrected code
```

**Comparison to our workflows**:
- Skills suggest structure but don't enforce it
- Agent outputs vary in format
- No standardized sections

**Potential adoption**:
- Create output templates for each skill
- Standardize sections across agents
- Add schema validation for agent outputs

---

## 4. Cross-Cutting Patterns

### 4.1 TodoWrite Usage

**Consistency**: All three plugins explicitly use TodoWrite for progress tracking.

**feature-dev**:
- Create todo list at start with all phases
- Update as each phase completes
- Mark complete at end

**code-review**:
- "Make a todo list first" (explicit instruction)
- Track review steps
- Mark complete after posting comment

**Comparison to our workflows**:
- `/breakdown` creates todos in document (not TodoWrite)
- `/do` updates task status in document
- Skills don't directly use TodoWrite

**Potential adoption**:
- Add TodoWrite to all slash commands
- Create standard todo patterns for each workflow
- Use TodoWrite for agent coordination

### 4.2 Agent Color Coding

**Pattern**: Agents have color attributes for visual distinction.

**Examples**:
- code-explorer: yellow
- code-architect: green
- code-reviewer: red
- pr-test-analyzer: cyan
- silent-failure-hunter: yellow
- type-design-analyzer: pink

**Comparison to our workflows**:
- No color coding in agents
- Visual distinction only via agent name

**Potential adoption**:
- Add color field to agent definitions
- Use consistent color scheme (e.g., exploration=yellow, design=green, review=red)

### 4.3 Tool Restrictions

**Pattern**: Commands specify allowed tools to constrain behavior.

**Example from code-review**:
```yaml
allowed-tools:
  - Bash(gh issue view:*)
  - Bash(gh search:*)
  - Bash(gh pr comment:*)
  - Bash(gh pr diff:*)
  - Bash(gh pr view:*)
```

**Comparison to our workflows**:
- No tool restrictions on commands
- Agents have unrestricted tool access
- Skills suggest tools but don't enforce

**Potential adoption**:
- Add allowed-tools to sensitive commands
- Restrict agent tool access based on role
- Create tool access patterns

### 4.4 Disable Model Invocation Flag

**Pattern**: Commands can disable model invocation for deterministic workflows.

**Example from code-review**:
```yaml
disable-model-invocation: false
```

**Comparison to our workflows**:
- No disable-model-invocation flags
- All commands invoke model

**Potential adoption**:
- Use for pure orchestration commands
- Add to commands that only coordinate agents
- Consider for `/do` automation mode

---

## 5. Recommendations

### Priority 1: High-Value, Low-Effort

#### 5.1 Add Parallel Agent Patterns to Discovery
**What**: Update `discovery-agent` to launch multiple research angles in parallel.

**Why**:
- Proven pattern from feature-dev (exploration phase)
- Immediate value for `/research` command
- Low implementation complexity

**How**:
1. Create research agent variants:
   - `research-breadth`: Broad survey using Perplexity
   - `research-depth`: Deep dive using Firecrawl + Context7
   - `research-technical`: Technical docs using Context7
2. Update `/research` to launch 2-3 agents based on query type
3. Consolidate findings into unified report

**Estimated effort**: 2-3 hours

#### 5.2 Add Confidence Scoring to Debugging Outputs
**What**: Add confidence ratings to debugging findings.

**Why**:
- Reduces noise in debugging results
- Helps prioritize investigation efforts
- Proven effective in code-review plugin

**How**:
1. Add confidence scoring rubric to debugging skill
2. Rate each finding 0-100 (or 1-10)
3. Filter or sort by confidence
4. Document scoring criteria in skill

**Estimated effort**: 1-2 hours

#### 5.3 Add File Identification Pattern to Agents
**What**: Require agents to return "Essential Files" list.

**Why**:
- Improves efficiency (read only essential files)
- Makes agent outputs more actionable
- Proven useful in code-explorer

**How**:
1. Add "Essential Files" section to agent output templates
2. Update agent instructions to identify 5-10 key files
3. Add explicit "read identified files" step after agent completion
4. Create checklist pattern for file reading

**Estimated effort**: 1-2 hours

### Priority 2: Moderate-Value, Moderate-Effort

#### 5.4 Add Explicit Clarification Phase to /breakdown
**What**: Add required clarification step after exploration, before task creation.

**Why**:
- Reduces ambiguity in task definitions
- Proven critical in feature-dev (Phase 3)
- Prevents wasted implementation effort

**How**:
1. Add Phase 2.5 to `/breakdown`: "Clarifying Questions"
2. After reading spec, identify underspecified aspects
3. Present questions to user
4. Wait for answers
5. Update spec with clarifications
6. Then create task breakdown

**Estimated effort**: 3-4 hours

#### 5.5 Create Specialized Review Agents
**What**: Create focused review agents inspired by pr-review-toolkit.

**Agents to create**:
- `test-coverage-analyzer`: Like pr-test-analyzer
- `error-handling-reviewer`: Like silent-failure-hunter (but general, not Claude Code specific)
- `code-quality-reviewer`: DRY, simplicity, elegance

**Why**:
- More thorough code review
- Specialized expertise in each domain
- Can run individually or as suite

**How**:
1. Create `essentials/agents/review/` directory
2. Adapt pr-review-toolkit agents to be project-agnostic
3. Update `/do --auto` to optionally run review suite after task
4. Create `/review` command to run all review agents

**Estimated effort**: 4-6 hours

#### 5.6 Add Architecture Options Phase to technical-planning
**What**: Add architecture design phase with multiple options (like feature-dev Phase 4).

**Why**:
- Makes architectural trade-offs explicit
- Gives user choice in approach
- Prevents premature optimization or over-engineering

**How**:
1. Add Phase 3.5 to technical-planning: "Architecture Options"
2. Generate 2-3 approaches: minimal, clean, pragmatic
3. Present trade-offs clearly
4. Get user decision
5. Document chosen approach

**Estimated effort**: 3-4 hours

### Priority 3: High-Value, High-Effort

#### 5.7 Create /feature Command with Full 7-Phase Workflow
**What**: Implement feature-dev workflow adapted to our patterns.

**Phases**:
1. **Discovery**: Understand feature request (like feature-dev)
2. **Exploration**: Parallel exploration agents (adapt code-explorer)
3. **Clarification**: Required questions phase (like feature-dev)
4. **Planning**: Use our technical-planning skill with architecture options
5. **Breakdown**: Create task breakdown using our `/breakdown` command
6. **Execution**: Execute tasks using our `/do` command
7. **Review**: Run specialized review agents

**Why**:
- Comprehensive, battle-tested workflow
- Combines best of feature-dev with our existing patterns
- Fills gap in our current workflow (no end-to-end feature command)

**How**:
1. Create `essentials/commands/feature.md`
2. Implement each phase with appropriate agents/skills
3. Add checkpoints for user confirmation
4. Use TodoWrite for progress tracking
5. Document extensively with examples

**Estimated effort**: 8-12 hours

#### 5.8 Implement Confidence-Based Code Review Command
**What**: Create `/review-pr` command like code-review plugin.

**Features**:
- Multiple parallel review agents
- Confidence scoring (0-100)
- False positive filtering (≥80 threshold)
- CLAUDE.md compliance verification
- Structured output with file:line links
- GitHub integration

**Why**:
- Automated, high-quality PR review
- Reduces reviewer burden
- Catches issues before human review
- Proven effective in production use

**How**:
1. Create `essentials/commands/review-pr.md`
2. Create review agents (or adapt from pr-review-toolkit)
3. Implement confidence scoring pattern
4. Add false positive filtering
5. Add GitHub integration (gh CLI)
6. Create output template

**Estimated effort**: 10-15 hours

### Priority 4: Exploration / Research

#### 5.9 Experiment with Model-Specific Agent Design
**What**: Optimize agent model selection (haiku vs sonnet) based on task complexity.

**Pattern from code-review**:
- Haiku: Eligibility checks, summaries, scoring
- Sonnet: Deep analysis, complex reasoning

**Research questions**:
- Which tasks can use Haiku without quality loss?
- What cost savings from strategic model selection?
- How to document model selection rationale?

**Estimated effort**: 4-6 hours exploration

#### 5.10 Investigate Agent Composition Patterns
**What**: Research patterns for composing multiple agents into workflows.

**Questions**:
- When to use parallel vs sequential?
- How to pass context between agents?
- How to aggregate results?
- When to re-verify eligibility?
- How to handle agent failures?

**Estimated effort**: 6-8 hours exploration

---

## 6. Comparison Matrix

| Pattern | feature-dev | code-review | pr-review-toolkit | Our Current | Priority |
|---------|-------------|-------------|-------------------|-------------|----------|
| **Multi-phase workflow** | ✓ (7 phases) | ✗ | ✗ | Partial | P3 |
| **Parallel agents** | ✓ | ✓ | Optional | ✗ | P1 |
| **Confidence scoring** | ✗ | ✓ (0-100) | ✓ (varied) | ✗ | P1 |
| **Explicit checkpoints** | ✓ | ✓ | ✗ | ✗ | P2 |
| **File identification** | ✓ | ✗ | ✗ | ✗ | P1 |
| **Agent specialization** | ✓ | ✓ | ✓✓ | Partial | P2 |
| **TodoWrite usage** | ✓ | ✓ | ✗ | Partial | P1 |
| **False positive filtering** | ✗ | ✓✓ | ✓ | ✗ | P2 |
| **CLAUDE.md verification** | ✗ | ✓ | ✓ | ✗ | P2 |
| **Eligibility checking** | ✗ | ✓ | ✗ | ✗ | P3 |
| **Structured output** | ✓ | ✓✓ | ✓✓ | Partial | P2 |
| **Model optimization** | ✗ | ✓ | ✓ | ✗ | P4 |
| **Color coding** | ✓ | ✓ | ✓ | ✗ | P4 |
| **Tool restrictions** | ✗ | ✓ | ✗ | ✗ | P4 |
| **Trigger documentation** | ✗ | ✗ | ✓ | ✗ | P3 |

Legend: ✓ = Present, ✓✓ = Exceptionally well done, ✗ = Not present, Partial = Partially implemented

---

## 7. Action Plan

### Immediate (This Week)
1. ✅ Review experimental plugins
2. ⬜ Implement **P1: Parallel agent patterns** in discovery-agent
3. ⬜ Add **P1: Confidence scoring** to debugging skill
4. ⬜ Add **P1: File identification** to agent templates

### Short-term (Next 2 Weeks)
1. ⬜ Implement **P2: Clarification phase** in /breakdown
2. ⬜ Create **P2: Specialized review agents**
3. ⬜ Add **P2: Architecture options** to technical-planning

### Medium-term (Next Month)
1. ⬜ Build **P3: /feature command** with 7-phase workflow
2. ⬜ Create **P3: /review-pr command** with confidence scoring
3. ⬜ Add **P3: Trigger documentation** to all agents

### Long-term (Future)
1. ⬜ Research **P4: Model optimization** strategies
2. ⬜ Investigate **P4: Agent composition** patterns
3. ⬜ Explore **P4: Tool restrictions** for sensitive commands

---

## 8. Conclusion

The experimental plugins demonstrate mature, production-tested patterns that address real workflow pain points:

**Key Learnings**:

1. **Parallel execution** dramatically improves exploration and review quality
2. **Confidence scoring** is essential for filtering noise and false positives
3. **Explicit checkpoints** prevent wasted effort from ambiguity
4. **Agent specialization** enables domain expertise and focused analysis
5. **Structured outputs** make results actionable and consistent

**Biggest Gaps in Our Workflows**:

1. No parallel agent coordination
2. No confidence/priority quantification
3. No structured exploration before implementation
4. No automated code review capability
5. No clarification phase in planning

**Highest-Impact Adoptions**:

1. **Parallel exploration agents** (immediate value, low effort)
2. **Confidence scoring** (reduces noise, proven effective)
3. **Clarification checkpoints** (prevents ambiguity-driven bugs)
4. **Specialized review agents** (thorough quality checking)
5. **End-to-end /feature workflow** (comprehensive, battle-tested)

The patterns in these plugins represent sophisticated workflow engineering that we can adapt to our context without wholesale replacement of our existing skills and commands.
