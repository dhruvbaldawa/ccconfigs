# Utility Scripts

## `manage-permissions.ts`

Interactive tool for managing Claude Code permissions across project configurations. Auto-discovers projects, promotes project-specific permissions to global config, and optionally cleans up redundant local settings. Built with functional programming principles and clean separation of concerns (domain, filesystem, UI layers).

### Features

- Auto-discovers all projects with permissions by recursively scanning filesystem
- Default: searches home directory; optionally specify root path(s)
- Skips common build/dependency directories (node_modules, .git, .cache, etc.)
- Collects permissions from `.claude/settings.local.json` in discovered projects
- Multi-select interface to choose which permissions to promote to global
- Merges selected permissions into `~/.claude/settings.json`
- Optionally removes promoted permissions from project-specific files
- `--dry-run` mode to preview changes without modifying files

### Usage

**Promote mode** (default: select permissions to promote to global):
```bash
# Auto-discover and promote
bun scripts/manage-permissions.ts

# From specific roots
bun scripts/manage-permissions.ts ~/Code ~/Projects

# Dry-run preview
bun scripts/manage-permissions.ts --dry-run ~/Code
```

**Cleanup mode** (remove permissions from project local settings):
```bash
# Cleanup: select and remove permissions from projects
bun scripts/manage-permissions.ts --cleanup

# Cleanup from specific roots
bun scripts/manage-permissions.ts --cleanup ~/Code

# Cleanup dry-run
bun scripts/manage-permissions.ts --cleanup --dry-run
```

### Workflow

**Promote Mode** (default):
1. Recursively scans filesystem for projects
2. Collects all unique permissions from project local settings
3. Displays permissions in multi-select interface (with project counts)
4. User selects which permissions to promote to global config
5. Previews changes to `~/.claude/settings.json` and confirms
6. Updates global settings with selected permissions
7. Asks if user wants to remove promoted permissions from local settings
8. Shows summary of all changes applied

**Cleanup Mode** (`--cleanup` flag):
1. Recursively scans filesystem for projects
2. Collects all permissions from project local settings
3. Displays permissions in multi-select interface (with project counts)
4. User selects which permissions to remove from project locals
5. Previews cleanup scope (which projects/permissions affected)
6. Confirms and removes selected permissions from local settings
7. Shows summary of permissions removed (or would remove in dry-run mode)

### Architecture

- **Domain Layer**: Pure functions for permission operations (no I/O)
- **Filesystem Layer**: Recursive directory scanner, settings.json read/write
- **UI Layer**: User interaction via `@inquirer/prompts` (checkbox, confirm)
- **Main**: Orchestration, CLI argument parsing, workflow coordination

### Settings files touched

- Reads: `.claude/settings.local.json` from discovered projects
- Writes: `~/.claude/settings.json` (global user settings)

### Directories skipped during scan

Build artifacts, dependencies, and system dirs: `.git`, `node_modules`, `.next`, `dist`, `build`, `target`, `vendor`, `venv`, and others.

**No `package.json` required** - Bun auto-installs `@inquirer/prompts` on first run.
