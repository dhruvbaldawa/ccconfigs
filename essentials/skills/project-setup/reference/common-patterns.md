# Common Patterns Across Languages

Patterns and configurations that apply regardless of language choice.

## Git Configuration

### .gitignore Template

```gitignore
# Dependencies
node_modules/
.venv/
venv/
__pycache__/
*.pyc

# Build outputs
dist/
build/
*.egg-info/
.eggs/

# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Test/Coverage
coverage/
htmlcov/
.coverage
*.lcov
.pytest_cache/
.mypy_cache/
.ruff_cache/

# Environment
.env
.env.local
.env.*.local
*.local.json

# Logs
*.log
logs/

# Editor configs (keep team configs, ignore personal)
!.editorconfig
.claude/settings.local.json
```

### .editorconfig

Ensure consistent formatting across editors:

```ini
root = true

[*]
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
charset = utf-8

[*.{ts,tsx,js,jsx,json,yml,yaml}]
indent_style = space
indent_size = 2

[*.py]
indent_style = space
indent_size = 4

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
```

## README Template

Every project should have a README with:

```markdown
# Project Name

Brief description of what this project does.

## Quick Start

\`\`\`bash
# Install dependencies
[package manager] install

# Run tests
[package manager] test

# Run development server (if applicable)
[package manager] dev
\`\`\`

## Development

### Prerequisites

- [Language] version X.X
- [Package manager] version X.X

### Setup

\`\`\`bash
# Clone the repository
git clone <url>
cd <project>

# Install dependencies
[command]

# Install pre-commit hooks
[command]
\`\`\`

### Commands

| Command | Description |
|---------|-------------|
| `[pm] test` | Run tests |
| `[pm] lint` | Run linter |
| `[pm] format` | Format code |
| `[pm] typecheck` | Type check |
| `[pm] check` | Run all checks |

### Project Structure

\`\`\`
project/
├── src/           # Source code
│   ├── module/    # Feature module
│   │   ├── core.ts
│   │   └── core.test.ts  # Co-located tests
│   └── index.ts
├── tests/         # Integration tests
└── [config files]
\`\`\`
```

## Pre-commit Best Practices

### Hook Order

Run hooks in this order for fast feedback:

1. **Format** (fast, auto-fixable)
2. **Lint** (fast, catches obvious issues)
3. **Type check** (medium, catches type errors)
4. **Tests** (slow, catches logic errors)

### Only Check Changed Files

Use tools that support incremental checking:

- **lint-staged** (JS/TS): Only lint staged files
- **pre-commit** (Python): Caches environments, only runs on changed files

### Skip Hooks When Needed

```bash
# Skip all hooks (use sparingly)
git commit --no-verify -m "WIP: incomplete work"

# Skip specific hook (pre-commit)
SKIP=pytest git commit -m "Quick fix"
```

## CI/CD Patterns

### Matrix Testing

Test across multiple versions:

```yaml
# GitHub Actions
jobs:
  test:
    strategy:
      matrix:
        node-version: [18, 20, 22]
        # or
        python-version: ['3.11', '3.12', '3.13']
```

### Caching

Always cache dependencies:

```yaml
# Node.js with pnpm
- uses: pnpm/action-setup@v4
- uses: actions/setup-node@v4
  with:
    cache: 'pnpm'

# Python with uv
- uses: astral-sh/setup-uv@v3
  with:
    enable-cache: true
```

### Check Order in CI

```yaml
steps:
  # Fast checks first
  - name: Type check
    run: npm run typecheck

  - name: Lint
    run: npm run lint

  - name: Format check
    run: npm run format:check

  # Slow checks last
  - name: Test
    run: npm run test:coverage
```

## Testing Philosophy (Language-Agnostic)

### Test Naming

```
# Pattern: test_[unit]_[scenario]_[expected]
test_user_creation_with_valid_email_succeeds
test_user_creation_with_invalid_email_raises_validation_error
test_divide_by_zero_throws_error

# Or: describe/it style
describe('UserService')
  describe('createUser')
    it('creates user with valid email')
    it('rejects invalid email')
```

### Test Structure (Arrange-Act-Assert)

```python
def test_user_creation():
    # Arrange
    email = "alice@example.com"
    service = UserService(mock_db)

    # Act
    user = service.create(email)

    # Assert
    assert user.email == email
    assert mock_db.save.called_once()
```

### What to Test

| Type | What | When |
|------|------|------|
| Unit | Pure functions, business logic | Always |
| Integration | Database, API endpoints | Critical paths |
| E2E | User journeys | Happy paths only |

### Mocking Rules

**Mock at boundaries:**
- HTTP requests (network)
- File system (I/O)
- Time/Date (non-determinism)
- Random (non-determinism)
- Third-party APIs

**Don't mock:**
- Your own code (test the real thing)
- Database in integration tests (use test DB)
- Internal implementation details

## Environment Variables

### Pattern: .env Files

```
.env                 # Default values (committed)
.env.local           # Local overrides (gitignored)
.env.development     # Dev-specific (committed)
.env.production      # Prod-specific (committed, no secrets)
```

### Secret Management

```bash
# Never commit secrets
# Use environment variables or secret managers

# Good: Reference in code
api_key = os.environ["API_KEY"]

# Bad: Hardcode in code
api_key = "sk-1234567890"

# CI: Use GitHub Secrets
env:
  API_KEY: ${{ secrets.API_KEY }}
```

## Documentation Standards

### Code Comments

```python
# Bad: What the code does (obvious)
# Increment counter by 1
counter += 1

# Good: Why the code does it (not obvious)
# Rate limit requires minimum 1 second between requests
counter += 1
```

### Type Annotations as Documentation

```typescript
// Types serve as documentation
interface CreateUserRequest {
  email: string;
  /** Optional display name, defaults to email prefix */
  name?: string;
  /** Role assignment, admin requires approval */
  role: 'user' | 'admin';
}
```

### README vs Code Comments

| Where | What |
|-------|------|
| README | How to use, setup, contribute |
| Code comments | Why (not what), complex algorithms |
| Type annotations | Shape of data, constraints |
| Tests | Expected behavior, edge cases |

## Versioning

### Semantic Versioning

```
MAJOR.MINOR.PATCH

1.0.0 → 1.0.1  # Patch: bug fix
1.0.1 → 1.1.0  # Minor: new feature, backward compatible
1.1.0 → 2.0.0  # Major: breaking change
```

### Changelog

Keep a CHANGELOG.md:

```markdown
# Changelog

## [Unreleased]
### Added
- New feature X

## [1.2.0] - 2024-01-15
### Added
- Feature Y

### Fixed
- Bug in Z

### Changed
- Improved performance of W
```

## Dependency Management

### Update Strategy

```bash
# Check for updates regularly
npm outdated        # Node.js
uv pip list --outdated  # Python

# Update conservatively
# 1. Update dev dependencies first (lower risk)
# 2. Update patch versions
# 3. Update minor versions with testing
# 4. Update major versions carefully (breaking changes)
```

### Lock Files

Always commit lock files:

- `package-lock.json` or `pnpm-lock.yaml` (Node.js)
- `uv.lock` (Python with uv)

Ensures reproducible builds across environments.

## Security Basics

### Dependency Scanning

```yaml
# GitHub Actions: Enable Dependabot
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"  # or "pip"
    directory: "/"
    schedule:
      interval: "weekly"
```

### Secret Scanning

- Enable GitHub secret scanning
- Use `.gitignore` to prevent accidental commits
- Audit history if secrets were ever committed

### Vulnerability Checking

```bash
# Node.js
npm audit
pnpm audit

# Python
pip-audit  # or safety
```
