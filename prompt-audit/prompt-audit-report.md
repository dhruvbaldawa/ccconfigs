# Prompt audit — dhruvbaldawa/ccconfigs (HEAD 62f07b4)

## Assumptions

- **Scope:** the whole repository's prompt surface. That covers `.claude/CLAUDE.md`, `.claude/reference/*.md`, `config/CLAUDE.md` (symlinked to `~/.claude/`, so **any edit there affects every project**), and every command, skill (with its reference files), subagent and template under `essentials/`, `experimental/`, `writing/` and `todoist/commands/`.
- **Not read:** `config/settings.json`, `config/statusline.json` and `mcp/.mcp.json`, because they can hold secrets. `@RTK.md` (imported at `config/CLAUDE.md:131`) points to `~/.claude/RTK.md`, which is outside the repo and was not read.
- **Target model:** files that don't pin a model are audited against **Claude Opus 5.5**, the model that ran this audit. Files that pin a model are audited against that model: `senior-engineer-reviewer` → claude-opus-5-5, the review agents and `test-reviewer` → claude-sonnet-5-5, and `catchup`, `commit`, `researcher` and `knowledge-capturer` → claude-haiku-4-5.
- **Provider markers:** none. No OpenAI, LangChain or other non-Anthropic code was found.
- **Sources for Claude Code facts:** placeholder syntax, `!` injection, task-tool availability, the Task→Agent rename and agent namespacing were checked against code.claude.com on 2026-11-01. The pages used are skills/slash-commands, tools-reference, agent-sdk/todo-tracking, the changelog and plugins-reference.
- **TodoWrite caveat:** the H5 finding assumes `config/settings.json` does not set `CLAUDE_CODE_ENABLE_TODO_TOOLS=1`. I did not check this, because I didn't read that file.

## Summary

This is a configuration repo, so most findings are in Group 2 (brittle configuration). They fall into four themes:

1. **Commands that send broken template syntax to the model.**
   - Fourteen files use `{{ARGS}}`, `${{{ARGS}}}`, `$ARGS` or `{{arg}}`. Claude Code substitutes only `$ARGUMENTS`, `$ARGUMENTS[N]`, `$N` and named arguments, so these tokens reach the model as literal text. Claude Code appends `ARGUMENTS: …` at the end, so the input still arrives, but the text says `.plans/{{ARGS}}/pending/`.
   - `/breakdown` and `/do` use `$1` and `$2`, but current docs make `$N` 0-based (`$0` is the first argument). As a result `/do spec.md 3` expands "Context:" to `3`.
   - `/research` contains JavaScript `${isTaskFile ? … }` ternaries, which reach the model as literal text.
   - `/catchup` is missing the `!` that would run its branch command.
2. **TodoWrite instructions for a tool the target models don't have.** Claude Code offers TodoWrite and the Task* tools by default only up to Opus 4.7 / Sonnet 4.6 / Haiku 4.5. Five prompt files and the architecture doc still tell the model to use TodoWrite.
3. **Reference docs that the code contradicts.**
   - The project CLAUDE.md lists 3 of the 6 plugins and points to `essentials/.mcp.json`, which was removed on 2026-08-07.
   - `experimental.md` describes "3 haiku research agents" (there is one) and review agents that "inherit model" (they pin Sonnet 5.5).
   - `architecture.md` shows a Task/general-purpose invocation pattern that the skills no longer use.
4. **Prompt-writing guidance that works against current models.**
   - `/optimize-doc` tells the model to delete the reasons behind rules and to keep ALL/NEVER emphasis.
   - The `engineering-prompts` skill teaches an older model roster: Opus 5 as the default, and `high` as the default effort.

**Counts:**

| Group | High | Medium | Flag | Notes |
|---|---|---|---|---|
| Group 1, dated prompt text | 0 | 2 (M2, M4) | 3 | |
| Group 2, brittle configuration | 9 (H1–H9) | 2 (M1, M3) | 4 | |
| Group 3, tool descriptions | — | — | — | Not applicable: no API tool definitions |
| Group 4, request config | — | — | — | Not applicable: no code that builds Claude API requests. The conveyor workflow skeleton's sub-agent roster was checked; it has no redundant agents |

**Proposed diff:**
- Combined diff: `/tmp/claude-0/-home-user-ccconfigs/56045371-05a4-5310-b261-efb16c5a2af5/scratchpad/prompt-audit.diff`
- One patch per finding: `/tmp/claude-0/-home-user-ccconfigs/56045371-05a4-5310-b261-efb16c5a2af5/scratchpad/patches/` (0001 = H1 … 0013 = M4)
- Scope: 26 files, +74/−133.
- Applied to a scratch copy only. The `scripts/` test suite passes there (`bun test scripts`: 14/14). Nothing in the repo was changed.
- If you apply it, also bump `essentials` and `experimental` `plugin.json` versions, as `.claude/CLAUDE.md` requires.

## Findings

### H1 — Argument placeholders Claude Code never substitutes (High, rewrite)
- **Locations:**
  - `essentials/commands/commit.md:78`
  - `fix-quality.md:8`
  - `optimize-doc.md:8,160`
  - `plan.md:8`
  - `research.md:19`
  - `experimental/commands/deepen-plan.md:8,103`
  - `plan-feature.md:10`
  - `add-task.md:20`
  - `triage.md:106`
  - `implement-plan.md:8,100,222,321,341`
  - `orchestrate.md:19,39`
- **Evidence:** `Commit message context: "${{{ARGS}}}"`, `Execute tasks from .plans/{{ARGS}}/pending/`, `**Task:** $ARGS`.
- **Pattern:** Group 2, volatile specifics (a command syntax that is no longer defined).
- **Why obsolete:** the documented substitutions are `$ARGUMENTS`, `$ARGUMENTS[N]`, `$N` and named `$name`. The other forms stay literal, and Claude Code appends `ARGUMENTS: <value>` at the end, so the model has to reconcile the two. The OpenCode adapter (`scripts/opencode-adapter-core.ts:200-201`) maps only `${{{ARGS}}}` and `$ARGS` to `$ARGUMENTS`, and leaves `{{ARGS}}` unmapped even there.
- **Action:** replace every form with `$ARGUMENTS`. The adapter regexes become no-ops and its tests still pass.

### H2 — `$1`/`$2` refer to the wrong arguments (High, rewrite)
- **Locations:** `essentials/commands/breakdown.md:5`, `essentials/commands/do.md:55-56`.
- **Evidence:** `Document: $1`, `Context: $1` / `Implement task $2`.
- **Pattern:** Group 2, volatile specifics.
- **Why obsolete:** the docs say "`$0` for the first argument or `$1` for the second", and an indexed placeholder with no matching argument stays literal. So `/breakdown spec.md` sends the literal text `$1`, and `/do spec.md 3` sets Context to `3`.
- **Action:** use `$0` and `$1`.

### H3 — JavaScript template logic in `/research` (High, rewrite)
- **Location:** `essentials/commands/research.md:23,47-68`.
- **Evidence:** `${isTaskFile ? 'Read task file…' : 'Analyze question…'}`, and a `${isTaskFile ? \`…\` : ''}` block with escaped backticks.
- **Pattern:** Group 2, volatile specifics. Commands are Markdown, not JavaScript templates.
- **Why obsolete:** both branches and the backslashes reach the model as literal text.
- **Action:** replace with a prose condition ("If the argument is a task file path…") and a step marked "(task-file input only)".

### H4 — `/catchup` prints the branch command instead of running it (High, rewrite)
- **Location:** `essentials/commands/catchup.md:13`.
- **Evidence:** ``Current branch: `git rev-parse --abbrev-ref HEAD` ``
- **Pattern:** Group 2, volatile specifics.
- **Why obsolete:** only the ``!`cmd` `` form is executed. Lines 15–27 in the same file use it correctly.
- **Action:** add the `!`.

### H5 — TodoWrite instructions on models that don't have the tool (High, remove)
- **Locations:**
  - `config/CLAUDE.md:92`
  - `essentials/commands/fix-quality.md:34-51`
  - `essentials/commands/optimize-doc.md:161-168`
  - `experimental/skills/testing/SKILL.md:12-20`
  - `experimental/skills/implementing-tasks/SKILL.md:19-31`
  - `.claude/reference/architecture.md:43-54`
- **Evidence:** `TodoWrite for work tracking.`, `**Use TodoWrite to track implementation progress:**`
- **Pattern:** Group 2, volatile specifics, and Group 1d, fossils.
- **Why obsolete:** Claude Code docs say TodoWrite and the Task* tools are offered by default only on Opus 4.7, Sonnet 4.6, Haiku 4.5 and earlier. They also say that newer models "track multi-step work without a written todo list". Even on Haiku 4.5 the default is TaskCreate/TaskUpdate, not TodoWrite. On Opus 5.5 and Sonnet 5.5 these instructions name a tool that isn't there.
- **Action:**
  - Remove the TodoWrite blocks.
  - Keep "Never discard tasks without Dhruv's approval."
  - Replace the architecture.md section with a short note that progress lives in the plan or task file.
  - `config/CLAUDE.md` is your global file: this edit affects every project.

### H6 — Project CLAUDE.md describes a smaller repo (High, rewrite)
- **Location:** `.claude/CLAUDE.md:3,5-14,34`.
- **Evidence:** `Plugin marketplace for Claude Code: essentials, writing, experimental.` and `- **MCP server**: essentials/.mcp.json, use pnpx`.
- **Pattern:** Group 2, volatile specifics.
- **Why obsolete:** `marketplace.json` registers six plugins: essentials, writing, experimental, todoist, notifications and mcp. `essentials/.mcp.json` was removed in 4031857 (2026-08-07), and the MCP config now lives in `mcp/.mcp.json`.
- **Action:** list all six plugins and point to `mcp/.mcp.json`. I only checked that `mcp/.mcp.json` exists. I did not check that it still uses `pnpx`.

### H7 — Experimental reference doc contradicts the agents and the command (High, rewrite)
- **Location:** `.claude/reference/experimental.md:9,12,51,106`.
- **Evidence:**
  - `Research Agents (3 agents - all haiku…)`
  - `inherits model`
  - `Session checkpoints: Every 3 tasks…`
  - `review agents inherit from parent`
- **Pattern:** Group 2, volatile specifics.
- **Why obsolete:**
  - There is one `researcher` agent with three modes (99e17a63).
  - The review agents pin `claude-sonnet-5-5` (c5550bd, 2026-10-05).
  - `implement-plan.md:330` triggers a stop on repeated rejections or STUCK states, not every 3 tasks.
- **Action:** align all four lines with the code.

### H8 — architecture.md teaches an invocation pattern the repo no longer uses (High, rewrite)
- **Location:** `.claude/reference/architecture.md:5,56-68`.
- **Evidence:** `Invoke specialized agents using Task tool with subagent_type="general-purpose"` with `prompt: "[Full agent prompt with context]"`.
- **Pattern:** Group 2, both volatile specifics and the "two instruction files rule differently" row.
- **Why obsolete:**
  - Line 33 of the same file, `essentials/commands/research.md` and `experimental/skills/reviewing-code/SKILL.md` all invoke named agents (`experimental:review:…`).
  - Docs say the Task tool was renamed Agent in v2.1.63. `Task` still works as an alias.
- **Action:** show an `Agent(... subagent_type: "experimental:review:test-coverage-analyzer")` example and tell the reader to pass only task context.

### H9 — reviewing-code description names agents that don't exist (High, rewrite)
- **Location:** `experimental/skills/reviewing-code/SKILL.md:3`.
- **Evidence:** `Launches Security Gatekeeper, Quality Guardian, and Test Auditor in parallel.`
- **Pattern:** Group 2, volatile specifics, in routing text.
- **Why obsolete:** the agents are `security-reviewer`, `quality-guardian` and `test-coverage-analyzer`, and the skill's own body (lines 167–182) uses those names.
- **Action:** use the real agent names.

### M1 — engineering-prompts teaches an older model roster (Medium, rewrite)
- **Locations:**
  - `essentials/skills/engineering-prompts/reference/research.md:203-208,327,506`
  - `technique-catalog.md:155,163,278`
  - `examples.md:411,471,479,496`
- **Evidence:** `| Claude Opus 5 | claude-opus-5 | $5 / $25 | Default for most work |`, `` `high` is the default``, `model="claude-opus-5"`.
- **Pattern:** Group 2, pinned model names that silently degrade.
- **Why obsolete:**
  - The current lineup is Opus 5.5 ($4/$20, effort defaults to `medium`), Sonnet 5.5 and Haiku 5.5 ($0.10/$0.50).
  - The repo's own agents already pin claude-opus-5-5 and claude-sonnet-5-5.
  - Code built from these examples would run on the previous Opus at a higher price, and the effort-default claim is wrong on Opus 5.5.
- **Action:**
  - Update the table, the IDs and the effort-default sentence.
  - Keep the existing "check the live table" disclaimer.

### M2 — /optimize-doc removes the reasons behind rules and keeps the shouting (Medium, rewrite)
- **Location:** `essentials/commands/optimize-doc.md:40,117-119,131-135,149,155`.
- **Evidence:**
  - `Does this explain WHY (rationale/educational)? YES → REMOVE`
  - `Structure over prose: Bullets not paragraphs`
  - `Never sacrifice: Explicit criteria ("ALL", "NEVER", …)`
- **Pattern:**
  - Group 1c, bullet walls: rules cut off from their reasons.
  - Keep-list item 1: context and reasons are never cruft.
  - Group 1a, pressure language.
- **Why obsolete:** current models apply a rule to unlisted cases by using its reason. This command is pointed at prompt and docs files, so it actively produces the patterns this audit removes.
- **Action:**
  - Keep reasons next to their rules.
  - Use structure for reference material and prose for behavior.
  - State criteria at normal volume.

### M3 — Commands and agents pinned to the previous-generation Haiku (Medium, rewrite)
- **Locations:**
  - `essentials/commands/catchup.md:2`
  - `essentials/commands/commit.md:2`
  - `experimental/agents/research/researcher.md:4`
  - `experimental/agents/capture/knowledge-capturer.md:4`
- **Evidence:** `model: claude-haiku-4-5`
- **Pattern:** Group 2, pinned model names.
- **Why obsolete:** Haiku 5.5 is the current Haiku, and it is cheaper ($0.10/$0.50 vs $1/$5). The reference docs only say "haiku", so they stay correct after the change.
- **Action:** pin `claude-haiku-5-5`. This is a behavior change, so run `/commit` and `/research` once before you rely on it.

### M4 — Global CLAUDE.md: a "don't stop early" booster and a shouted restatement (Medium, rewrite/remove)
- **Locations:** `config/CLAUDE.md:13-14,42`. These edits affect every project.
- **Evidence:**
  - `Never skip steps or take shortcuts.`
  - `Tedious systematic work is often correct. Abandon only if…`
  - `Verify ALL RULES before submitting (Rule #1)`
- **Pattern:** Group 1a ("Be thorough / do not stop early"; caps emphasis) and Group 1c (repetition used as reinforcement).
- **Why obsolete:**
  - Current models are proactive by default.
  - "Finish the whole task" (lines 32–34) already sets the scope rule, with its reason.
  - Line 42 restates Rule #1 in caps.
- **Action:** merge lines 13–14 into one sentence that keeps the real point: finish repetitive work, and change course only when the approach is technically wrong. Remove line 42. Rule #1 itself stays.

### Flag only (no edit proposed)

- **F1 — Conflicting guidance (Group 2 conflict):** `essentials/commands/optimize-doc.md:117-118` says to remove explanations of why. `essentials/skills/engineering-prompts/SKILL.md:15` says "Explain WHY, not just WHAT". Both lines come from the same commit (2e4883f), so history can't show which is current. M2 resolves it in favor of engineering-prompts. Confirm that this is the direction you want.
- **F2 — Out of scope:** `config/CLAUDE.md:131` imports `@RTK.md`, which resolves to `~/.claude/RTK.md`, outside the repo. It was not read, so it was not audited.
- **F3 — Low:** `Task(...)` call examples remain in `experimental/skills/reviewing-code/SKILL.md:160-182`, `experimental/skills/implementing-tasks/SKILL.md:77-118` and `experimental/commands/deepen-plan.md:40-68`. The docs say `Task` still works as an alias for `Agent`, so renaming them is cosmetic.
- **F4 — Low, not prompt text:** `essentials/commands/catchup.md:15` runs `echo` and `wc` inside `!` injection, but `allowed-tools` is `Bash(git:*)`. That may cause a permission prompt or a failure.
- **F5 — Low, Group 1a register:**
  - `config/CLAUDE.md:3` says "ANY rule". This is a real permission constraint, so it stays, though it could be written at normal volume.
  - `senior-engineer-reviewer.md:10` and `test-reviewer.md:10` say "Be brutal" / "HATES". This persona text serves the strict review gate.
- **F6 — Out of scope:** `experimental/README.md:233-234` gives Sonnet pricing as $3/$15. The review agents pin Sonnet 5.5, which is $2/$10. The README is documentation, not prompt text.
- **F7 — Not verified:** the `research-synthesis` description names the "Parallel Search, Context7" MCP servers. I did not check this, because `mcp/.mcp.json` was not read.

## Verify after applying

- Run each changed command once with real arguments. Check that `/do spec.md 3` reads the spec and runs task 3, and that `/catchup` shows the branch name.
- Grep for any remaining `{{ARGS}}` or `TodoWrite`.
- Run `bun test scripts` (it passed on the scratch copy).
