---
description: Research blockers or questions using specialized research agents
---

# Research

Research specific blocker or question using specialized research agents and MCP tools.

## Usage

```bash
/research .conveyor/user-auth/context.md                          # Blocker noted in a task or plan file
/research "How to implement rate limiting with Redis?"            # General question
/research "Best practices for writing technical blog posts"       # Writing research
```

## Your Task

Research: "$ARGUMENTS"

### Step 1: Analyze & Select Agents

If the argument is a task file path, read it to understand the blocker; otherwise analyze the question to choose an approach.

| Research Need | Modes to launch |
|--------------|-----------------|
| **New technology/patterns** | survey + official-docs |
| **Specific error/issue** | deep-dive + official-docs |
| **API/library integration** | official-docs + deep-dive |
| **Best practices comparison** | survey + deep-dive |

One agent, `essentials:researcher`, runs in one of three modes named at the start of its prompt (`Mode: survey`, `Mode: deep-dive`, `Mode: official-docs`); launch one instance per mode.

### Step 2: Launch Agents in Parallel

Launch the selected 2-3 researcher instances in one message so they run concurrently, one Agent call per mode. Give each a prompt with the research question, its focus area, which tool to prefer, and the expected output shape.

### Step 3: Synthesize Findings

Use **research-synthesis skill** to:
- Consolidate findings by theme, identify consensus, note contradictions
- Narrativize into story (not bullet dumps): "Industry uses X (survey), via Y API (official-docs), as shown by Z (deep-dive)"
- Maintain source attribution (note which agent provided insights)
- Identify gaps (unanswered questions, disagreements)
- Extract actions (implementation path, code/configs, risks)

### Step 4: Update the File (file input only)

Append research findings to the file:

```bash
cat >> "$task_file" <<EOF

**research findings:**
- [Agent]: [key insights with sources]
- [Agent]: [key insights with sources]

**resolution:**
[Concrete path forward]

**next steps:**
[Specific actions]
EOF
```

## Output Format

### For a Blocker in a File

```markdown
✅ Research Complete

File: context.md
Blocker: [Description]

Modes Used: survey (industry patterns), official-docs (official docs)

Key Findings:
1. **Agent 1**: [Key insight with source]
2. **Agent 2**: [Key insight with source]

Resolution: [Concrete recommendation]

Updated file: findings appended
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
- For file input: append findings to the file
- See `essentials/skills/research-synthesis/reference/multi-agent-invocation.md` for detailed patterns
