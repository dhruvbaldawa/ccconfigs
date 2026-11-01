# The Experimental Plugin

A sandbox for trying new commands, skills, and agents before they earn a place in essentials. It is currently empty: the kanban workflow (`/plan-feature`, `/implement-plan`, `/orchestrate` and their skills, review agents, and templates) was retired in favor of the **conveyor** skill in essentials. The researcher agent later moved to essentials and was then removed in favor of the built-in `/deep-research`.

To add an experiment, put it under `experimental/commands/`, `experimental/skills/<name>/SKILL.md`, or `experimental/agents/`, and bump `experimental/.claude-plugin/plugin.json`. When an experiment proves itself, move it to essentials.
