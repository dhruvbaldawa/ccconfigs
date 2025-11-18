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

| Research Need | Agent Combination |
|--------------|-------------------|
| **New technology/patterns** | breadth + technical |
| **Specific error/issue** | depth + technical |
| **API/library integration** | technical + depth |
| **Best practices comparison** | breadth + depth |

**Agents available:**
- **research-breadth** (haiku) - WebSearch → Parallel Search → Perplexity: industry trends, consensus, multiple perspectives
- **research-depth** (haiku) - WebFetch → Parallel Search → Firecrawl: specific URLs, implementations, case studies, gotchas
- **research-technical** (haiku) - Context7: official docs, API signatures, types, configs

### Step 2: Launch Agents in Parallel

Use Promise.all to launch 2-3 agents:

```typescript
await Promise.all([
  Task({
    subagent_type: 'research-breadth',  // or 'research-depth' or 'research-technical'
    model: 'haiku',
    description: 'Brief agent description',
    prompt: `Research: "${{{ARGS}}}"

    Focus areas and guidance for this agent.
    Specify which MCP tool to use.
    Expected output format.`
  }),

  Task({
    subagent_type: 'research-technical',
    model: 'haiku',
    description: 'Brief agent description',
    prompt: `Research official docs for: "${{{ARGS}}}"

    Focus areas and guidance for this agent.`
  })
]);
```

### Step 3: Synthesize Findings

Use **research-synthesis skill** to:
- Consolidate findings by theme, identify consensus, note contradictions
- Narrativize into story (not bullet dumps): "Industry uses X (breadth), via Y API (technical), as shown by Z (depth)"
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

Agents Used: breadth (industry patterns), technical (official docs)

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

- Launch agents **in parallel** (Promise.all) for speed
- Use **research-synthesis skill** to consolidate (narrative, not lists)
- Maintain **source attribution** (link claims to agents/sources)
- For tasks: update file with findings and change status if resolved
- See `essentials/skills/research-synthesis/reference/multi-agent-invocation.md` for detailed patterns
