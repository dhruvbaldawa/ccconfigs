---
description: Research blockers or questions using specialized research agents
---

# Research

Research specific blocker or question using specialized research agents and MCP tools.

## Usage

```bash
/research experimental/.plans/user-auth/implementation/003-jwt.md  # Stuck task
/research "How to implement rate limiting with Redis?"            # General question
/research "Best practices for writing technical blog posts"       # Writing research
```

## Your Task

Research: "${{{ARGS}}}"

### Step 1: Analyze & Select Agents

${isTaskFile ? 'Read task file to understand blocker context.' : 'Analyze question to determine approach.'}

| Research Need | Modes to launch |
|--------------|-----------------|
| **New technology/patterns** | survey + official-docs |
| **Specific error/issue** | deep-dive + official-docs |
| **API/library integration** | official-docs + deep-dive |
| **Best practices comparison** | survey + deep-dive |

One agent, `experimental:research:researcher`, runs in one of three modes named at the start of its prompt (`Mode: survey`, `Mode: deep-dive`, `Mode: official-docs`); launch one instance per mode.

### Step 2: Launch Agents in Parallel

Launch the selected 2-3 researcher instances in one message so they run concurrently, one Agent call per mode. Give each a prompt with the research question, its focus area, which tool to prefer, and the expected output shape.

### Step 3: Synthesize Findings

Use **research-synthesis skill** to:
- Consolidate findings by theme, identify consensus, note contradictions
- Narrativize into story (not bullet dumps): "Industry uses X (survey), via Y API (official-docs), as shown by Z (deep-dive)"
- Maintain source attribution (note which agent provided insights)
- Identify gaps (unanswered questions, disagreements)
- Extract actions (implementation path, code/configs, risks)

${isTaskFile ? `
### Step 4: Update Task File

Append research findings to task file:

\`\`\`bash
cat >> "$task_file" <<EOF

**research findings:**
- [Agent]: [key insights with sources]
- [Agent]: [key insights with sources]

**resolution:**
[Concrete path forward]

**next steps:**
[Specific actions]
EOF
\`\`\`

Update status from STUCK to Pending if blocker resolved.
` : ''}

## Output Format

### For Stuck Tasks

```markdown
✅ Research Complete

Task: 003-jwt.md
Blocker: [Description]

Modes Used: survey (industry patterns), official-docs (official docs)

Key Findings:
1. **Agent 1**: [Key insight with source]
2. **Agent 2**: [Key insight with source]

Resolution: [Concrete recommendation]

Updated task: Findings in Notes, LLM Prompt updated, Status: STUCK → Pending

Next: Resume implementation with /implement-plan <project>
```

### For General Questions

```markdown
✅ Research Complete

Question: [Original question]

Agents Used: [List with focus areas]

Synthesis:
[Narrative combining insights from all agents with source attribution]

Recommendation: [What to do with rationale]

Alternative: [If applicable]

Sources: [Links with descriptions]
```

## Key Points

- Launch agents in parallel (one message, multiple Agent calls)
- Use **research-synthesis skill** to consolidate (narrative, not lists)
- Maintain **source attribution** (link claims to agents/sources)
- For tasks: update file with findings and change status if resolved
- See `essentials/skills/research-synthesis/reference/multi-agent-invocation.md` for detailed patterns
