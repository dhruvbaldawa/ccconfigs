# Common Patterns Across Languages

Language-specific configs (`.gitignore`, `.editorconfig`, CI, security) are in language reference files.

## Git Principles

**Universal .gitignore entries:**
```gitignore
.idea/
.vscode/
*.swp
.DS_Store
.env
.env.local
*.log
```

**Universal .editorconfig:**
```ini
root = true

[*]
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
charset = utf-8

[*.md]
trim_trailing_whitespace = false
```

## README Essentials

Every README needs: description, quick start (install + test), prerequisites, commands table, project structure.

## Pre-commit Order

1. **Format** (fast, auto-fixable)
2. **Lint** (fast, static analysis)
3. **Type check** (medium)
4. **Tests** (slow)

Use incremental tools: lint-staged (JS/TS), pre-commit (Python).

## CI Order

Same as pre-commit: format → lint → typecheck → test. Fast feedback on simple issues first.

## Testing Philosophy

**Test types:**
| Type | What | When |
|------|------|------|
| Unit | Pure functions, business logic | Always |
| Integration | Database, API endpoints | Critical paths |
| E2E | User journeys | Happy paths only |

**Mocking rules:**
- Mock at boundaries: HTTP, filesystem, time, random, third-party APIs
- Don't mock: your own code, database in integration tests

**Structure:** Arrange → Act → Assert

## Environment Variables

```
.env           # Defaults (committed)
.env.local     # Local overrides (gitignored)
```

Never commit secrets. Use `os.environ["KEY"]` or GitHub Secrets.

## Documentation

- **README**: Setup, usage, contribution
- **Code comments**: Why, not what
- **Types**: Shape of data, constraints
- **Tests**: Expected behavior

## Versioning

Semantic: `MAJOR.MINOR.PATCH` (breaking.feature.fix)

## Dependencies

Update order: dev deps → patch → minor → major (with testing).

Always commit lock files for reproducible builds.

## Security

- Enable Dependabot/Renovate for automated updates
- Run security audits in CI
- Never commit secrets; rotate if exposed
