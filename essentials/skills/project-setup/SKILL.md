---
name: project-setup
description: Bootstrap new projects with strong typing, linting, formatting, and testing from scratch. Use when starting a new project or converting an existing one to best practices. Supports Python, TypeScript, and other languages with research fallback.
---

# Project Setup

## Core Principles

**Strong Typing**: Every project should have strict type checking enabled. Types catch bugs at compile time, improve IDE experience, and serve as documentation.

**Strong Linting**: Enforce code quality and consistency. Linting rules should be strict by default - it's easier to disable rules than add them later.

**Auto Formatting**: Code formatting should be automated and consistent. No manual formatting, no style debates in PRs.

**Checks at Every Stage**: Pre-commit hooks, CI checks, and editor integrations. Catch issues before they reach main branch.

**Tests Close to Source**: Co-locate test files with source code (`foo.ts` → `foo.test.ts`). Makes it obvious what's tested and easy to find related tests.

**Behavior-Focused Testing**: Test what code does, not how it does it. No unnecessary mocking - mock only external boundaries (network, filesystem, time).

## When to Use This Skill

Use project-setup when:
- Starting a new project from scratch
- Converting an existing project to follow best practices
- Adding tooling (linting, formatting, testing) to an existing project
- Unsure what tools/configurations to use for a language

## Quickstart

1. **Identify language/framework** - Check reference files for known setups
2. **Create project structure** - Use standard layout for the ecosystem
3. **Configure typing** - Enable strictest mode available
4. **Set up linting** - Install linter with recommended + strict rules
5. **Configure formatting** - Auto-format on save and pre-commit
6. **Add testing framework** - Co-located tests with coverage
7. **Set up pre-commit hooks** - Format, lint, type-check, test
8. **Configure CI** - Same checks as pre-commit, plus coverage reporting

## Progress Tracking with TodoWrite

Use TodoWrite to track setup progress:

```
☐ Initialize project structure
☐ Configure strict typing
☐ Set up linting (strict rules)
☐ Configure auto-formatting
☐ Add testing framework (co-located)
☐ Set up pre-commit hooks
☐ Configure CI pipeline
☐ Verify all checks pass
```

## Language-Specific Guides

See reference files for detailed, opinionated setups:

- `reference/python.md` - Python with uv, ruff, mypy, pytest
- `reference/typescript.md` - TypeScript with strict mode, ESLint, Prettier, Vitest
- `reference/common-patterns.md` - Shared patterns across languages

## Decision Framework

**IF** language has reference guide → Follow the opinionated setup
**IF** no reference guide → Research current best practices:
  1. WebSearch for "[language] project setup 2024 best practices"
  2. Look for official tooling recommendations
  3. Check popular open source projects in that ecosystem
**IF** existing project → Migrate incrementally (typing → linting → formatting → testing)
**IF** team has existing preferences → Document deviations and rationale

## Testing Philosophy

**Test Granularity**:
- **Unit tests**: Pure functions, business logic, utilities
- **Integration tests**: Database operations, API endpoints, component interactions
- **E2E tests**: Critical user journeys only (expensive, flaky)

**Test Quality Standards**:
```
Good: expect(response.status).toBe(401)      // Tests behavior
Bad:  expect(bcrypt.compare).toHaveBeenCalled() // Tests implementation

Good: Test that user can't access without auth  // Behavior
Bad:  Test that AuthMiddleware calls next()     // Implementation
```

**Mocking Guidelines**:
- Mock external boundaries: HTTP requests, filesystem, time, random
- Don't mock: Internal modules, database (use test DB), your own code
- When in doubt, don't mock - tests that mock too much test nothing

**Coverage Targets**:
- Statements: >80%
- Branches: >75%
- Focus on critical paths, not 100% coverage

## Tool Selection Criteria

1. **Ecosystem standard**: Prefer official or widely-adopted tools
2. **Actively maintained**: Check last commit, issue response time
3. **Good defaults**: Strict by default, opt-out rather than opt-in
4. **Fast**: Tools run on every save and commit
5. **Integrations**: Editor plugins, CI support, pre-commit hooks

## Common Pitfalls to Avoid

- **Permissive defaults**: Always configure strict mode for typing/linting
- **Manual formatting**: Automate everything - format-on-save, pre-commit
- **Tests in separate tree**: Co-locate tests with source code
- **Over-mocking**: Mock boundaries, not your own code
- **Coverage theater**: High coverage with poor test quality
- **Skipping pre-commit**: Every commit should pass all checks
- **Different local vs CI**: Use same tool versions and configs
- **Outdated tools**: Research current recommendations before setup

## Quality Checklist

Before declaring setup complete:

- [ ] Typing: Strictest mode enabled, no `any` without justification
- [ ] Linting: Strict rules, all warnings treated as errors
- [ ] Formatting: Auto-format on save, pre-commit hook
- [ ] Testing: Framework configured, co-located tests, coverage working
- [ ] Pre-commit: Hooks run format, lint, type-check
- [ ] CI: Same checks as pre-commit, plus test coverage
- [ ] README: Setup instructions for new contributors
- [ ] All checks pass on initial commit

## References

- `reference/python.md` - Python ecosystem tools and configurations
- `reference/typescript.md` - TypeScript/Node.js ecosystem setup
- `reference/common-patterns.md` - Patterns shared across languages
