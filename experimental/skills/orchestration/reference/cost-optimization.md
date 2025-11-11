# Cost Optimization for Multi-Agent Workflows

Strategies for managing the 15× token overhead of multi-agent systems while maintaining quality and speed.

## Token Economics

### Base Costs (as of 2025)

**Haiku 4.5** (Worker agents)
- Input: $1 per million tokens
- Output: $5 per million tokens
- Speed: 2× faster than Sonnet
- Performance: 90% of Sonnet capability

**Sonnet 4.5** (Orchestration/Review)
- Input: $3 per million tokens
- Output: $15 per million tokens
- Speed: Baseline
- Performance: 100% frontier capability

**Opus 4** (Reserved for extreme complexity)
- Input: $15 per million tokens
- Output: $75 per million tokens
- Speed: Slower than Sonnet
- Performance: Maximum reasoning depth

### Research Findings

- Multi-agent uses **15× more tokens** than single-agent
- 80% of performance variance explained by token usage alone
- Model selection provides 2-3× cost difference
- Prompt caching achieves **75% cost reduction** on recurring prompts

## Model Selection Strategy

### Optimization Pattern: Sonnet Orchestrator + Haiku Workers

```typescript
const modelStrategy = {
  orchestrator: 'sonnet',      // Needs reasoning for coordination
  planning: 'sonnet',          // Requires analysis and breakdown
  implementation: 'haiku',     // Worker executing clear specs
  review: 'sonnet',            // Needs judgment and nuance
  testing: 'haiku'             // Worker following test patterns
};
```

**Cost Impact:**
- Baseline (all Sonnet): $0.15 per 10K tokens
- Optimized (Sonnet + Haiku): $0.06 per 10K tokens
- **Savings: 60% reduction**

### When to Use Which Model

**Use Haiku When:**
- Clear, well-defined task spec exists
- Following established patterns
- Repetitive operations (testing, implementation)
- Budget-conscious scenarios
- Speed is valuable

**Use Sonnet When:**
- Requires reasoning or judgment
- Ambiguous requirements need interpretation
- Security/quality assessment
- Architectural decisions
- Planning and coordination

**Use Opus When:**
- Extreme complexity (rare)
- Multiple competing architectural approaches
- Deep research required
- Budget is not a constraint

### Model Selection Example

```typescript
const selectModel = (agentType, task) => {
  // Override for critical tasks
  if (task.securityCritical || task.architecturalDecision) {
    return 'sonnet';
  }

  // Default model per agent type
  const defaults = {
    'planning-agent': 'sonnet',
    'implementation-agent': 'haiku',
    'review-agent': 'sonnet',
    'testing-agent': 'haiku'
  };

  return defaults[agentType] || 'haiku';
};
```

## Prompt Caching (75% Reduction)

### How Prompt Caching Works

Claude caches the **beginning** of prompts that don't change:
- First request: Full token cost
- Subsequent requests: Only new tokens charged

**Requirements:**
1. Unchanging content at START of prompt
2. Minimum 1024 tokens to cache
3. Cache expires after 5 minutes of inactivity

### Optimization: Place Unchanging Context First

❌ **Bad: Changing content first**
```typescript
const prompt = `
Task: ${task.description}  // Changes every call
File: ${task.file}         // Changes every call

---

[Project Documentation]    // Static, but won't be cached
[Coding Guidelines]        // Static, but won't be cached
`;
```

✅ **Good: Static content first**
```typescript
const prompt = `
[Project Documentation]    // Cached ✓
[Coding Guidelines]        // Cached ✓
[Agent Instructions]       // Cached ✓

---

Task: ${task.description}  // Not cached (small portion)
File: ${task.file}
`;
```

### Foundation Session Pattern

**Strategy:** Create initial session with full context, reuse cache

```typescript
// Session 1: Establish cache
const foundationPrompt = `
${PROJECT_CLAUDE_MD}           // Cached
${AGENT_GUIDELINES}            // Cached
${PLANS_STRUCTURE_DESIGN}      // Cached
${ORCHESTRATION_SKILL}         // Cached

Initial task: Analyze project structure
`;

await Task({ prompt: foundationPrompt });

// Session 2+: Reuse cache (cheap)
const taskPrompt = `
${PROJECT_CLAUDE_MD}           // Cache HIT ✓
${AGENT_GUIDELINES}            // Cache HIT ✓
${PLANS_STRUCTURE_DESIGN}      // Cache HIT ✓
${ORCHESTRATION_SKILL}         // Cache HIT ✓

Execute task: ${task.id}       // Only this charged
`;
```

**Results:**
- Session 1: 50K tokens (full cost)
- Session 2-10: 50K cached + 2K new = 2K charged
- **Savings: 96% reduction** on subsequent sessions

### Real-World Example

From research (Anthropic production system):

```
Cache Read Tokens: 390,302
New Input Tokens: 56

Cost without caching: 390,358 tokens @ $3/M = $1.17
Cost with caching: 56 tokens @ $3/M = $0.17

Savings: 85%
```

### Implementing Prompt Caching

```typescript
const buildCachedPrompt = (staticContext, dynamicTask) => {
  // Static context first (will be cached)
  const cachedPortion = [
    fs.readFileSync('.claude/CLAUDE.md', 'utf-8'),
    fs.readFileSync('experimental/.plans-structure-design.md', 'utf-8'),
    fs.readFileSync('experimental/skills/orchestration/SKILL.md', 'utf-8')
  ].join('\n\n---\n\n');

  // Dynamic task last (won't be cached)
  const dynamicPortion = `
## Current Task

${dynamicTask.description}

Files to modify: ${dynamicTask.files.join(', ')}
Acceptance criteria: ${dynamicTask.criteria}
  `;

  return cachedPortion + '\n\n' + dynamicPortion;
};
```

### Cache Invalidation Concerns

**Cache expires when:**
- 5 minutes of inactivity
- Prompt beginning changes
- Different session/thread

**Best practices:**
- Group related tasks together (minimize cache expiry)
- Don't edit static context files during active sessions
- Plan tasks in batches to maximize cache reuse

## Progressive Disclosure

### Problem: Loading Everything Upfront

❌ **Wasteful approach:**
```typescript
// Load all 20 tasks into every agent prompt
const allTasks = tasks.map(t => fs.readFileSync(t.file)).join('\n');
const prompt = `${allTasks}\n\nExecute task 001`;

// Agent only needs task 001, but gets 20 tasks worth of tokens
```

### Solution: Load Only What's Needed

✅ **Progressive loading:**
```typescript
// Orchestrator knows all tasks
const taskList = tasks.map(t => ({ id: t.id, name: t.name }));

// Agent gets only relevant task
const prompt = `
Available tasks: ${taskList.map(t => `${t.id}: ${t.name}`).join(', ')}

Current task: ${currentTask.id}

Load details: Read .plans/project/tasks/${currentTask.id}.md
`;

// Agent loads full details only when needed
```

**Token savings:**
- Before: 100K tokens (all 20 tasks)
- After: 5K tokens (task list) + 3K (current task) = 8K
- **Savings: 92% reduction**

### Skills Use Progressive Disclosure

Skills themselves demonstrate this pattern:
1. **Skill frontmatter** (50 tokens): Always loaded
2. **SKILL.md** (1-2K tokens): Loaded when skill invoked
3. **Reference materials** (10K+ tokens): Loaded only if needed

```yaml
---
name: multi-agent-orchestration
description: Coordinate specialized agents...  # Always loaded (50 tokens)
---

# Multi-Agent Orchestration  # Loaded when invoked (2K tokens)

...main skill content...

See reference/coordination-patterns.md  # Loaded only if referenced (10K tokens)
```

## Tool Filtering

### Problem: Unused Tools Get Tokenized

Every tool granted to an agent adds tokens to system prompt:
- Read tool: ~100 tokens
- Edit tool: ~150 tokens
- Bash tool: ~200 tokens
- etc.

If agent has 20 tools but uses 3, you're paying for 17 unused tools.

### Solution: Grant Only Necessary Tools

**Planning Agent:**
```yaml
tools:
  - Read
  - Grep
  - Glob
  - Bash   # read-only operations

# NOT granted:
# - Edit (doesn't modify code)
# - Write (doesn't create files)
```

**Implementation Agent:**
```yaml
tools:
  - Read
  - Edit
  - Write
  - Bash
  - Grep
  - Glob   # full file operations

# NOT granted:
# - WebSearch (shouldn't research mid-implementation)
# - WebFetch (shouldn't fetch docs mid-task)
```

**Review Agent:**
```yaml
tools:
  - Read
  - Grep
  - Glob
  - Bash   # analysis only

# NOT granted:
# - Edit (read-only review)
# - Write (no file creation)
```

**Token savings:**
- All tools: ~2K tokens
- Filtered tools: ~600 tokens
- **Savings: 70% reduction** in tool overhead

## Output Limits

### Controlling Response Length

```typescript
const prompt = `
${task.description}

IMPORTANT: Keep response concise.
- Code changes only (no explanations unless asked)
- Handoff summary: 2-3 sentences maximum
- No verbose logging
`;
```

### Token Budgets Per Agent

```typescript
const tokenBudgets = {
  'planning-agent': {
    max: 10000,
    typical: 5000
  },
  'implementation-agent': {
    max: 8000,
    typical: 4000
  },
  'review-agent': {
    max: 6000,
    typical: 3000
  },
  'testing-agent': {
    max: 8000,
    typical: 4000
  }
};

const enforceTokenBudget = (agent, estimatedTokens) => {
  const budget = tokenBudgets[agent];

  if (estimatedTokens > budget.max) {
    throw new Error(`Task too large for ${agent}. Estimated ${estimatedTokens}, max ${budget.max}. Consider breaking down.`);
  }

  if (estimatedTokens > budget.typical) {
    console.warn(`Task approaching ${agent} budget limit: ${estimatedTokens}/${budget.max}`);
  }
};
```

## Batch Operations

### Group Related Tasks to Reuse Context

❌ **Inefficient: One task at a time**
```typescript
for (const task of tasks) {
  await spawn('implementation-agent', task);
  // Each spawn loads full context (~5K tokens)
}
// Total: 20 tasks × 5K = 100K tokens
```

✅ **Efficient: Batch related tasks**
```typescript
const batches = groupSimilarTasks(tasks);

for (const batch of batches) {
  await spawn('implementation-agent', {
    prompt: `
      Execute the following related tasks in sequence:
      ${batch.map(t => t.id).join(', ')}

      ${batch.map(t => summarize(t)).join('\n\n')}
    `
  });
  // Each spawn loads context once, executes multiple tasks
}
// Total: 4 batches × 5K + task details = ~30K tokens
// Savings: 70%
```

### Task Grouping Strategy

```typescript
const groupSimilarTasks = (tasks) => {
  const groups = {
    models: [],
    controllers: [],
    routes: [],
    tests: []
  };

  for (const task of tasks) {
    if (task.files.some(f => f.includes('/models/'))) {
      groups.models.push(task);
    } else if (task.files.some(f => f.includes('/controllers/'))) {
      groups.controllers.push(task);
    } else if (task.files.some(f => f.includes('/routes/'))) {
      groups.routes.push(task);
    } else if (task.files.some(f => f.includes('.test.'))) {
      groups.tests.push(task);
    }
  }

  return Object.values(groups).filter(g => g.length > 0);
};
```

## Cost Monitoring

### Track Token Usage Per Task

```typescript
const costTracker = {
  tasks: {},

  record(taskId, agentType, model, tokens) {
    if (!this.tasks[taskId]) {
      this.tasks[taskId] = { agents: [], totalTokens: 0, totalCost: 0 };
    }

    const cost = calculateCost(model, tokens);

    this.tasks[taskId].agents.push({ agentType, model, tokens, cost });
    this.tasks[taskId].totalTokens += tokens;
    this.tasks[taskId].totalCost += cost;
  },

  summarize() {
    return Object.entries(this.tasks).map(([taskId, data]) => ({
      taskId,
      totalTokens: data.totalTokens,
      totalCost: data.totalCost.toFixed(2),
      agents: data.agents
    }));
  },

  alertIfOverBudget(maxCostPerTask = 0.50) {
    for (const [taskId, data] of Object.entries(this.tasks)) {
      if (data.totalCost > maxCostPerTask) {
        console.warn(`⚠️  Task ${taskId} exceeded budget: $${data.totalCost.toFixed(2)} > $${maxCostPerTask}`);
      }
    }
  }
};

const calculateCost = (model, tokens) => {
  const rates = {
    haiku: (tokens * 0.7 * 1 + tokens * 0.3 * 5) / 1_000_000,
    sonnet: (tokens * 0.7 * 3 + tokens * 0.3 * 15) / 1_000_000,
    opus: (tokens * 0.7 * 15 + tokens * 0.3 * 75) / 1_000_000
  };

  return rates[model] || 0;
};
```

### Budget Thresholds

```typescript
const budgetThresholds = {
  warning: 0.30,  // Warn if task exceeds $0.30
  critical: 0.75, // Alert if task exceeds $0.75
  abort: 1.50     // Stop if task exceeds $1.50
};

const checkBudget = (taskCost) => {
  if (taskCost > budgetThresholds.abort) {
    throw new Error(`Task cost $${taskCost} exceeds abort threshold $${budgetThresholds.abort}. Stopping execution.`);
  }

  if (taskCost > budgetThresholds.critical) {
    console.error(`🚨 Critical: Task cost $${taskCost} exceeds critical threshold`);
  }

  if (taskCost > budgetThresholds.warning) {
    console.warn(`⚠️  Warning: Task cost $${taskCost} approaching budget limit`);
  }
};
```

### Project-Level Cost Tracking

```typescript
const projectCost = {
  budget: 10.00,  // $10 budget for entire project
  spent: 0.00,

  recordTaskCost(taskId, cost) {
    this.spent += cost;

    const remaining = this.budget - this.spent;
    const percentUsed = (this.spent / this.budget * 100).toFixed(1);

    console.log(`💰 Cost Update: $${this.spent.toFixed(2)}/$${this.budget} (${percentUsed}% used)`);

    if (remaining < 0) {
      throw new Error(`Budget exceeded! Spent $${this.spent.toFixed(2)}, budget $${this.budget}`);
    }

    if (remaining < this.budget * 0.2) {
      console.warn(`⚠️  Only $${remaining.toFixed(2)} remaining (${(remaining/this.budget*100).toFixed(1)}%)`);
    }
  }
};
```

## Optimization Checklist

Before running multi-agent workflow, verify:

- [ ] Model selection: Haiku for workers, Sonnet for reasoning
- [ ] Prompt caching: Static content at beginning
- [ ] Progressive disclosure: Only load relevant tasks
- [ ] Tool filtering: Grant only necessary tools
- [ ] Output limits: Enforce concise responses
- [ ] Batch operations: Group related tasks
- [ ] Cost tracking: Monitor per task and project-level
- [ ] Budget thresholds: Set warning/critical/abort limits
- [ ] Task complexity analysis: Verify multi-agent justified (>10 complexity points)

## Real-World Cost Examples

### Example 1: Simple CRUD API (8 tasks)

**Without Optimization:**
- Model: All Sonnet
- No caching
- Full task list loaded per agent
- All tools granted

**Cost:** ~$2.50

**With Optimization:**
- Model: Haiku workers, Sonnet review
- Prompt caching enabled
- Progressive disclosure
- Tool filtering

**Cost:** ~$0.45

**Savings: 82%**

### Example 2: Authentication System (12 tasks)

**Without Optimization:**
- Model: All Sonnet
- Multiple review cycles
- No batching

**Cost:** ~$4.80

**With Optimization:**
- Model: Haiku workers, Sonnet review/planning
- Foundation session caching
- Batch similar tasks
- Iterative review with limits

**Cost:** ~$0.95

**Savings: 80%**

### Example 3: Microservice (25 tasks)

**Without Optimization:**
- Model: Mix of Sonnet/Opus
- No caching strategy
- Sequential (no parallelization where possible)

**Cost:** ~$12.00

**With Optimization:**
- Model: Haiku workers, Sonnet orchestration
- Aggressive caching
- Concurrent execution for independent tasks
- Tool filtering per agent

**Cost:** ~$2.80

**Savings: 77%**

---

## Summary

**Primary Optimization Strategies:**
1. **Model Selection** (60% savings): Haiku for workers, Sonnet for reasoning
2. **Prompt Caching** (75% savings): Static content first, foundation sessions
3. **Progressive Disclosure** (90% savings): Load only what's needed
4. **Tool Filtering** (70% savings on tool overhead): Grant minimal necessary tools
5. **Batch Operations** (50-70% savings): Group related tasks

**Typical multi-agent project:**
- Unoptimized: $8-15
- Optimized: $1.50-3.50
- **Overall savings: 70-85%**

The 15× token overhead of multi-agent is real, but strategic optimization brings it down to 3-5× while maintaining quality and speed benefits.
