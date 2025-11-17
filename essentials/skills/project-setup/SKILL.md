# Project Setup Skill

## Purpose

Guides setting up new projects from scratch with best practices, optimal tooling, and proper configuration. Provides battle-tested templates and decision frameworks for Python and TypeScript projects.

## When to Use

- Starting a new project from scratch
- Modernizing legacy project structure and tooling
- Unsure which tools/configurations to use

## Setup Phases

Follow these phases sequentially:

1. **Directory Structure** - Organize src/, tests/, docs/ + git init + .gitignore + README
2. **Dependency Management** - Choose package manager, initialize manifest, lock dependencies
3. **Development Tooling** - Add linter, formatter, type checker, test runner, pre-commit hooks
4. **Configuration** - Editor config, CI/CD, environment variables, build config (if needed)
5. **Documentation** - README with setup/usage, CONTRIBUTING (if team project), API docs

## Approach

**Progressive Enhancement:**
1. Start minimal - get hello world running first
2. Add tooling incrementally - validate each addition works
3. Only add tools you'll actually use

**Configuration Philosophy:**
- Strict by default (catch errors early)
- Auto-fix where possible (formatters over debates)
- Fail fast (loud errors on issues)

## Technology-Specific Guidance

### Python Projects
See **`reference/python-setup.md`** for:
- Directory structures (library, application, ML/data)
- UV/Poetry setup and configurations
- Tool configs (ruff, mypy, pytest, pre-commit)
- CI/CD templates and best practices

### TypeScript Projects
See **`reference/typescript-setup.md`** for:
- Directory structures (library, web app, API, CLI)
- pnpm/Bun setup and configurations
- Tool configs (eslint, prettier, vitest, tsconfig)
- Build configs (vite, tsup) and CI/CD templates

### Cross-Cutting Concerns
See **`reference/tools-reference.md`** for:
- Git configuration and hooks
- Editor integration (VS Code, EditorConfig)
- CI/CD platforms (GitHub Actions, GitLab)
- Docker and containerization
- Documentation tools
- Version managers (pyenv, nvm, asdf)
- Tool comparison matrices
- Troubleshooting guides

## Decision Trees

### Python Package Manager

```
Publishing to PyPI?
├─ Yes → poetry or hatchling
└─ No → Production app?
    ├─ Yes → poetry (stable)
    └─ No → uv (fastest, modern)
```

### TypeScript Build Tool

```
What are you building?
├─ Frontend web app → vite
├─ Backend API → No build tool (tsx/bun)
├─ Library → tsup (simple) or rollup (complex)
└─ CLI tool → tsup with shebang
```

### Tooling Strictness

```
Project context?
├─ Prototype → Loose (basic linting, no hooks, optional types)
├─ Team → Moderate (formatter + linter + types, pre-commit for format)
└─ Production → Strict (aggressive linting, strict types, hooks + CI)
```

## Quality Checklist

Verify before considering setup complete:

**Structure:**
- [ ] Logical directory structure for project type
- [ ] README with setup instructions
- [ ] .gitignore covers artifacts/secrets

**Dependencies:**
- [ ] Package manager with lock file
- [ ] Dependencies organized (dev/test/prod)
- [ ] No unused dependencies

**Tooling:**
- [ ] Linter + formatter configured and passing
- [ ] Type checker configured (strict for new projects)
- [ ] Test runner with at least one passing test
- [ ] Tool configs checked into git

**Automation:**
- [ ] Pre-commit hooks run checks
- [ ] CI pipeline runs tests/checks on push
- [ ] Scripts for common tasks (test/lint/build)

**Developer Experience:**
- [ ] Clone and run in ≤3 commands
- [ ] Editor integration works (types, auto-complete)
- [ ] Setup instructions tested on fresh environment

## Recommended Tools

### Python
- Package manager: `uv` (modern) or `poetry` (stable)
- Linter: `ruff`
- Formatter: `ruff format`
- Type checker: `mypy` or `pyright`
- Test runner: `pytest`

### TypeScript
- Package manager: `pnpm` (efficient) or `bun` (fastest)
- Linter: `eslint` + `@typescript-eslint`
- Formatter: `prettier`
- Type checker: `tsc` (built-in)
- Test runner: `vitest` (modern) or `jest` (mature)

## Integration with Other Skills

**After setup:**
- **technical-planning** - Plan features and architecture
- **debugging** - When dev tools catch issues

**Use together:**
- **brainstorming** - Clarify project goals before setup
- **research-synthesis** - Evaluate new tools/approaches
- MCP tools (Context7) - Look up framework best practices

## Common Patterns

**Progressive Enhancement** - Add tools incrementally across 6 iterations:
1. Directory + package manager + git
2. Linter + formatter
3. Type checker
4. Testing
5. CI/CD
6. Documentation

**Configuration Inheritance** - Share configs across projects via extends

**Environment Parity** - Match dev and prod (versions, env vars, build process)

## Quick Troubleshooting

- **Too many tools?** - Minimum: package manager + linter + formatter
- **Linter vs formatter conflicts?** - Configure linter to defer style to formatter
- **CI fails, passes locally?** - Check dependency versions, env vars, file paths
- **Slow pre-commit hooks?** - Run only fast checks pre-commit, slow ones in CI

## Related Resources

- **reference/python-setup.md** - Complete Python templates and configurations
- **reference/typescript-setup.md** - Complete TypeScript templates and configurations
- **reference/tools-reference.md** - Cross-cutting tool configurations and integrations
