# Project Setup Skill

## Purpose

Guides setting up new projects from scratch with best practices, optimal tooling, and proper configuration. Saves time and research by providing battle-tested templates and decision frameworks for common project types.

## When to Use

- Starting a new project from scratch
- Bootstrapping a proof-of-concept or prototype
- Modernizing legacy project structure and tooling
- Establishing standards for team projects
- Unsure which tools/configurations to use for a language/framework

## Decision Framework

### 1. Project Classification

**Language & Runtime:**
- Python (API, CLI, ML/Data, General)
- TypeScript/JavaScript (Web App, API, CLI, Library)
- Other (Go, Rust, Java - follow language-specific conventions)

**Project Purpose:**
- Library/Package (published to registry, consumed by others)
- Application (end-user executable: web app, CLI, desktop)
- Service (API, microservice, daemon)
- Data/ML (notebooks, pipelines, experiments)

**Scale & Maturity:**
- Quick prototype (minimal tooling, move fast)
- Team project (standards, CI/CD, documentation)
- Production service (monitoring, deployment, security)

### 2. Setup Phases

Follow these phases in order. Don't skip ahead - each builds on previous:

#### Phase 1: Directory Structure
- Create logical organization (src/, tests/, docs/, etc.)
- Initialize version control (git)
- Add .gitignore for language/toolchain
- Create README.md with project overview

#### Phase 2: Dependency Management
- Choose package manager (pip/poetry/uv for Python, npm/yarn/pnpm/bun for JS/TS)
- Initialize project manifest (pyproject.toml, package.json)
- Configure dependency groups (dev, test, prod)
- Lock dependency versions

#### Phase 3: Development Tooling
- **Linting**: Enforce code style (ruff/pylint for Python, eslint for TS)
- **Formatting**: Auto-format on save (ruff/black for Python, prettier for TS)
- **Type Checking**: Static analysis (mypy/pyright for Python, tsc for TS)
- **Testing**: Test runner and framework (pytest for Python, vitest/jest for TS)
- **Pre-commit hooks**: Run checks before commits (husky, pre-commit)

#### Phase 4: Configuration Files
- Editor config (.editorconfig for consistency)
- CI/CD pipeline (GitHub Actions, GitLab CI)
- Environment variables (.env.example template)
- Build configuration (if needed: webpack, vite, tsup, etc.)

#### Phase 5: Documentation
- README.md (purpose, setup, usage)
- CONTRIBUTING.md (for team/open-source projects)
- API documentation (inline docstrings + generator)
- License (if applicable)

## Methodology

### Setup Approach

**Start Minimal, Layer Complexity:**
1. Get basic project running first (hello world)
2. Add tooling incrementally (linter → formatter → tests)
3. Validate each addition works before moving on
4. Don't cargo-cult - only add tools you'll actually use

**Configuration Philosophy:**
- **Strict by default**: Catch errors early (strict type checking, aggressive linting)
- **Auto-fix where possible**: Use formatters over style debates
- **Fail fast**: Tools should error loudly on issues
- **Consistent across team**: Share configs, document deviations

**Common Pitfalls:**
- Adding every tool without understanding purpose
- Copying configs without adapting to project needs
- Over-engineering for prototypes
- Inconsistent tooling across projects in same language

### Tool Selection Guidelines

**Package Manager:**
- Python: Use `uv` (fastest, modern) or `poetry` (stable, mature). Avoid plain pip for projects.
- TypeScript: Use `pnpm` (efficient) or `bun` (fastest). npm/yarn are fine but slower.

**Linter:**
- Python: `ruff` (fast, replaces flake8/pylint/isort)
- TypeScript: `eslint` with `@typescript-eslint`

**Formatter:**
- Python: `ruff format` (fast, black-compatible) or `black`
- TypeScript: `prettier`

**Type Checker:**
- Python: `mypy` (mature) or `pyright` (fast, used by VS Code)
- TypeScript: Built-in `tsc`

**Test Runner:**
- Python: `pytest` (de facto standard)
- TypeScript: `vitest` (fast, modern) or `jest` (mature)

**Build Tool (if needed):**
- Python libraries: `hatchling` or `setuptools`
- TypeScript libraries: `tsup` (simple) or `rollup` (complex)
- TypeScript apps: `vite` (frontend) or `esbuild` (backend)

## Project Templates

See reference directory for detailed templates:

### Python Projects
- **`reference/python-setup.md`**: Complete Python project setup
  - Directory structure for different project types
  - pyproject.toml with poetry/uv configurations
  - Tool configurations (ruff, mypy, pytest)
  - Pre-commit hooks setup
  - Common patterns and best practices

### TypeScript Projects
- **`reference/typescript-setup.md`**: Complete TypeScript project setup
  - Directory structure for libraries vs applications
  - package.json and tsconfig.json templates
  - Tool configurations (eslint, prettier, vitest)
  - Build configurations for different targets
  - Common patterns and best practices

### Tool Reference
- **`reference/tools-reference.md`**: Detailed tool configurations
  - Configuration file templates for all major tools
  - Integration guides (VSCode, CI/CD)
  - Troubleshooting common issues
  - Version compatibility matrices

## Quality Checklist

Use this before considering project setup complete:

### Structure & Organization
- [ ] Logical directory structure appropriate for project type
- [ ] README.md with clear project description and setup instructions
- [ ] .gitignore covers build artifacts, dependencies, secrets
- [ ] License file (if applicable)

### Dependencies
- [ ] Package manager initialized with lock file
- [ ] Dependencies organized by purpose (dev, test, prod)
- [ ] No unused dependencies in manifest
- [ ] Version constraints appropriate (loose for apps, strict for libraries)

### Development Tools
- [ ] Linter configured and passing on existing code
- [ ] Formatter integrated (ideally auto-format on save)
- [ ] Type checker configured (strict mode for new projects)
- [ ] Test runner setup with at least one passing test
- [ ] All tools have config files checked into git

### Automation
- [ ] Pre-commit hooks run linter/formatter/type-checker
- [ ] CI pipeline runs tests and checks on push
- [ ] Scripts in package.json/pyproject.toml for common tasks (test, lint, build)
- [ ] Documentation on how to run each tool locally

### Developer Experience
- [ ] Can clone repo and run project with 3 commands or less
- [ ] Error messages from tools are clear and actionable
- [ ] Editor integration works (hover types, auto-complete, errors)
- [ ] No manual steps that could be automated

### Documentation
- [ ] Setup instructions tested on fresh environment
- [ ] Architecture/design decisions documented (if non-trivial)
- [ ] Contributing guide (for team projects)
- [ ] Environment variables documented with example file

## Integration with Other Skills

**After project setup, transition to:**
- **technical-planning**: Plan the actual features and architecture
- **debugging**: When development tools catch issues
- **research-synthesis**: When evaluating new tools or approaches

**Use together with:**
- **brainstorming**: Before setup, clarify project goals and requirements
- MCP tools (Context7): Look up best practices for specific frameworks

## Decision Trees

### When to use which Python package manager?

```
Is this a library you'll publish to PyPI?
├─ Yes → Use poetry or hatchling
│         (poetry for complex deps, hatchling for simple)
└─ No → Is this a production application?
    ├─ Yes → Use poetry (stable, mature)
    └─ No → Use uv (fastest, great DX, experimental)
```

### When to use which TypeScript build tool?

```
What are you building?
├─ Frontend web app → vite (fast, batteries-included)
├─ Backend API/service → No build tool needed
│                        (run with tsx/bun, or use tsup for distribution)
├─ Library (npm package) → tsup (simple) or rollup (complex needs)
└─ CLI tool → tsup with shebang
```

### How strict should tooling be?

```
What's the project context?
├─ Solo prototype → Loose (quick feedback, move fast)
│                   - Basic linting only
│                   - No pre-commit hooks
│                   - Type checking optional
│
├─ Team project → Moderate (consistency, catch bugs)
│                 - Formatter auto-fix on save
│                 - Linter with reasonable rules
│                 - Type checking on (not strict mode)
│                 - Pre-commit hooks for formatting
│
└─ Production service → Strict (reliability, maintainability)
                        - Aggressive linting (few disabled rules)
                        - Strict type checking
                        - Pre-commit hooks + CI enforcement
                        - Test coverage requirements
```

## Common Patterns

### Pattern: Progressive Enhancement
Start minimal, add complexity as needed:
1. **Iteration 1**: Directory + package manager + git
2. **Iteration 2**: Linter + formatter (enforce style)
3. **Iteration 3**: Type checker (catch bugs)
4. **Iteration 4**: Testing infrastructure
5. **Iteration 5**: CI/CD automation
6. **Iteration 6**: Documentation + contribution guide

Each iteration should leave project in working state.

### Pattern: Configuration Inheritance
Share common configs across projects:
- Create organization-wide config packages
- Extend base configs in projects (`extends: "@company/eslint-config"`)
- Override only project-specific rules
- Version control shared configs

### Pattern: Environment Parity
Development environment should match production:
- Same language/runtime version (use version managers: pyenv, nvm)
- Same environment variables (use .env.example as template)
- Same build process (document or script it)
- Same dependency versions (use lock files)

### Pattern: Monorepo Setup
When multiple related projects:
- Use workspace-aware tools (pnpm workspaces, poetry with workspace plugin)
- Shared tooling configs at root
- Consistent conventions across packages
- Centralized CI/CD

## Troubleshooting

**"Too many tools, which do I actually need?"**
Minimum viable setup: package manager + linter + formatter. Add others as project grows.

**"Linter conflicts with formatter"**
Configure linter to defer style to formatter (eslint-config-prettier, ruff's compatibility mode).

**"Type errors everywhere in existing codebase"**
Start lenient, gradually tighten. Add type ignores initially, then fix incrementally.

**"CI fails but passes locally"**
Environment mismatch. Check: dependency versions, environment variables, file paths (case sensitivity), timezone/locale.

**"Pre-commit hooks are slow"**
Run only fast checks pre-commit (lint/format). Run slow checks (tests, type-check) in CI.

**"Project setup takes too long"**
Create project template repos to clone. Or use scaffolding tools (cookiecutter, degit, create-*).

## Quick Reference

### Python Project Checklist
```bash
# 1. Initialize
mkdir myproject && cd myproject
git init
uv init  # or: poetry init

# 2. Add tools
uv add --dev ruff mypy pytest
uv add --dev pre-commit

# 3. Configure (see reference/python-setup.md)
# Create: pyproject.toml, ruff.toml, .pre-commit-config.yaml

# 4. Install hooks
pre-commit install

# 5. First test
mkdir tests
echo "def test_example(): assert True" > tests/test_example.py
uv run pytest
```

### TypeScript Project Checklist
```bash
# 1. Initialize
mkdir myproject && cd myproject
git init
pnpm init

# 2. Add TypeScript
pnpm add -D typescript @types/node
pnpm tsc --init

# 3. Add tools
pnpm add -D eslint prettier vitest
pnpm add -D @typescript-eslint/parser @typescript-eslint/eslint-plugin

# 4. Configure (see reference/typescript-setup.md)
# Create: tsconfig.json, eslint.config.js, .prettierrc

# 5. First test
mkdir src tests
echo "export const add = (a: number, b: number) => a + b" > src/index.ts
echo "import { test, expect } from 'vitest'; test('adds', () => expect(1+1).toBe(2))" > tests/index.test.ts
pnpm vitest run
```

## Related Resources

- **reference/python-setup.md**: Full Python project template with all configurations
- **reference/typescript-setup.md**: Full TypeScript project template with all configurations
- **reference/tools-reference.md**: Deep dive on each tool and configuration options
