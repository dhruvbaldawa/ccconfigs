# Common Patterns Across Languages

Patterns and configurations that apply regardless of language choice. Language-specific configurations (`.gitignore`, `.editorconfig`, CI caching, security scanning) are in the respective language reference files.

## Git Workflow Principles

### .gitignore Strategy

Organize `.gitignore` by category for maintainability:

1. **Dependencies** - Package manager artifacts (language-specific)
2. **Build outputs** - Compiled code, bundles (language-specific)
3. **IDE/Editor** - Personal editor configs (universal)
4. **OS artifacts** - System files (universal)
5. **Test/Coverage** - Test artifacts and reports (language-specific)
6. **Environment** - Secrets and local configs (universal)
7. **Logs** - Runtime logs (universal)

**Universal entries** (include in all projects):

```gitignore
# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Environment (never commit secrets)
.env
.env.local
.env.*.local
*.local.json

# Logs
*.log
logs/

# Keep team configs
!.editorconfig
.claude/settings.local.json
```

### .editorconfig Principles

Use `.editorconfig` for cross-editor consistency:

```ini
root = true

[*]
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
charset = utf-8

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
```

**Language-specific indent rules** belong in language reference files.

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

## CI/CD Patterns

### Matrix Testing

Test across multiple runtime versions to ensure compatibility:

```yaml
# GitHub Actions pattern
jobs:
  test:
    strategy:
      matrix:
        runtime-version: [LTS, current]
```

**Language-specific matrix configs** are in language reference files.

### Caching Principles

Always cache dependencies to speed up CI:

- Use language-specific caching actions (see language reference files)
- Cache based on lock file hash
- Consider caching build artifacts for large projects

### Check Order in CI

Run checks in order of speed for fast feedback:

```yaml
steps:
  # 1. Fast checks first (seconds)
  - name: Format check    # Fastest - pure text analysis
  - name: Lint            # Fast - static analysis

  # 2. Medium checks (seconds to minutes)
  - name: Type check      # Requires parsing, slower than lint

  # 3. Slow checks last (minutes)
  - name: Test            # Slowest - runs actual code
```

This order ensures quick feedback on simple issues before running expensive tests.

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

Update dependencies conservatively:

1. **Dev dependencies first** - Lower risk, easier to fix
2. **Patch versions** - Bug fixes only, safe to update
3. **Minor versions** - New features, test thoroughly
4. **Major versions** - Breaking changes, review changelog

**Language-specific update commands** are in language reference files.

### Lock Files

Always commit lock files to ensure reproducible builds:

- Lock files pin exact versions of all dependencies (including transitive)
- CI should use frozen/locked installs to match local environment
- Update lock files explicitly, not implicitly during installs

## Security Basics

### Dependency Scanning

Enable automated dependency updates:

- Use Dependabot or Renovate for automated PRs
- Configure weekly scanning schedule
- Review and merge security updates promptly

**Language-specific Dependabot configs** are in language reference files.

### Secret Scanning

- Enable GitHub secret scanning (repository settings)
- Use `.gitignore` to prevent accidental commits of `.env` files
- If secrets were ever committed, rotate them immediately
- Consider pre-commit hooks to catch secrets before commit

### Vulnerability Checking

Run security audits regularly:

- Integrate into CI pipeline (fail on high/critical vulnerabilities)
- Review and update vulnerable dependencies promptly
- Document accepted risks for unfixable vulnerabilities

**Language-specific audit commands** are in language reference files.
