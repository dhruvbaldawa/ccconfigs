# Tools Reference Guide

Comprehensive reference for development tools, configurations, integrations, and troubleshooting.

## Table of Contents

1. [Version Control (Git)](#version-control-git)
2. [Editor Integration](#editor-integration)
3. [CI/CD Platforms](#cicd-platforms)
4. [Docker & Containers](#docker--containers)
5. [Monitoring & Logging](#monitoring--logging)
6. [Documentation Tools](#documentation-tools)
7. [Version Managers](#version-managers)
8. [Tool Comparison Matrix](#tool-comparison-matrix)
9. [Troubleshooting Guide](#troubleshooting-guide)

## Version Control (Git)

### Essential Git Configuration

**.gitconfig:**
```ini
[user]
    name = Your Name
    email = your.email@example.com

[core]
    editor = vim
    autocrlf = input  # Linux/Mac
    # autocrlf = true  # Windows

[init]
    defaultBranch = main

[pull]
    rebase = false

[push]
    default = simple
    autoSetupRemote = true

[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = log --graph --oneline --decorate --all
```

### Git Hooks with Husky

**Setup:**
```bash
# Install
pnpm add -D husky lint-staged

# Initialize
pnpm exec husky init
```

**package.json:**
```json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

**.husky/pre-commit:**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
```

**.husky/commit-msg:**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Enforce conventional commits
pnpm commitlint --edit $1
```

**Commitlint configuration (commitlint.config.js):**
```javascript
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'],
    ],
  },
};
```

### Python Pre-commit

**.pre-commit-config.yaml:**
```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
        args: ['--maxkb=1000']
      - id: check-merge-conflict
      - id: check-toml
      - id: debug-statements
      - id: mixed-line-ending

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.9
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.7.1
    hooks:
      - id: mypy
        additional_dependencies: [types-requests]
        args: [--strict]
```

## Editor Integration

### VS Code

**.vscode/settings.json:**
```json
{
  // Python
  "python.defaultInterpreterPath": "${workspaceFolder}/.venv/bin/python",
  "python.languageServer": "Pylance",
  "python.analysis.typeCheckingMode": "strict",
  "python.testing.pytestEnabled": true,
  "python.testing.unittestEnabled": false,

  // TypeScript
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,

  // Formatting
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },

  // Python specific
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll": "explicit",
      "source.organizeImports": "explicit"
    }
  },

  // Files
  "files.exclude": {
    "**/__pycache__": true,
    "**/.pytest_cache": true,
    "**/.mypy_cache": true,
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true
  },

  // Misc
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true,
  "editor.rulers": [100],
  "editor.tabSize": 2
}
```

**.vscode/extensions.json:**
```json
{
  "recommendations": [
    // Python
    "ms-python.python",
    "ms-python.vscode-pylance",
    "charliermarsh.ruff",

    // TypeScript/JavaScript
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",

    // General
    "editorconfig.editorconfig",
    "eamodio.gitlens",
    "github.copilot"
  ]
}
```

**.vscode/launch.json (Python debugging):**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: Current File",
      "type": "python",
      "request": "launch",
      "program": "${file}",
      "console": "integratedTerminal",
      "justMyCode": false
    },
    {
      "name": "Python: Pytest",
      "type": "python",
      "request": "launch",
      "module": "pytest",
      "args": ["-v"],
      "console": "integratedTerminal",
      "justMyCode": false
    }
  ]
}
```

**.vscode/launch.json (TypeScript/Node debugging):**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug TypeScript",
      "program": "${workspaceFolder}/src/index.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Vitest Current File",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["vitest", "run", "${file}"]
    }
  ]
}
```

### EditorConfig

**.editorconfig:**
```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.{js,ts,tsx,jsx,json,yml,yaml}]
indent_style = space
indent_size = 2

[*.{py}]
indent_style = space
indent_size = 4

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
```

## CI/CD Platforms

### GitHub Actions

**Reusable workflow for linting:**

**.github/workflows/lint.yml:**
```yaml
name: Lint

on:
  workflow_call:
    inputs:
      node-version:
        required: false
        type: string
        default: '20.x'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Format check
        run: pnpm prettier --check .
```

**Matrix testing:**

**.github/workflows/test.yml:**
```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18.x, 20.x]
        python-version: ['3.11', '3.12']

    steps:
      - uses: actions/checkout@v4

      # Node.js setup
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      # Python setup
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ matrix.python-version }}

      - name: Run tests
        run: pnpm test
```

**Caching dependencies:**
```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      ~/.pnpm-store
      ~/.cache/pip
      .venv
    key: ${{ runner.os }}-deps-${{ hashFiles('**/pnpm-lock.yaml', '**/poetry.lock') }}
    restore-keys: |
      ${{ runner.os }}-deps-
```

**Release automation:**

**.github/workflows/release.yml:**
```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate changelog
        id: changelog
        uses: requarks/changelog-action@v1
        with:
          token: ${{ github.token }}
          tag: ${{ github.ref_name }}

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          body: ${{ steps.changelog.outputs.changes }}
          draft: false
          prerelease: false
```

### GitLab CI

**.gitlab-ci.yml:**
```yaml
stages:
  - lint
  - test
  - build
  - deploy

variables:
  PNPM_VERSION: '8'
  NODE_VERSION: '20'

cache:
  paths:
    - node_modules/
    - .pnpm-store/

before_script:
  - npm install -g pnpm@$PNPM_VERSION
  - pnpm install --frozen-lockfile

lint:
  stage: lint
  script:
    - pnpm lint
    - pnpm prettier --check .

test:
  stage: test
  parallel:
    matrix:
      - NODE_VERSION: ['18', '20']
  script:
    - pnpm test
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

build:
  stage: build
  script:
    - pnpm build
  artifacts:
    paths:
      - dist/

deploy:
  stage: deploy
  only:
    - main
  script:
    - pnpm publish
```

## Docker & Containers

### Python Dockerfile

**Multi-stage build:**
```dockerfile
# Build stage
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen --no-dev

# Runtime stage
FROM python:3.11-slim

WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /app/.venv /app/.venv

# Copy application code
COPY src/ ./src/

# Set up environment
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1

# Run application
CMD ["python", "-m", "myapp"]
```

**.dockerignore:**
```
__pycache__/
*.py[cod]
.venv/
.pytest_cache/
.mypy_cache/
.coverage
htmlcov/
dist/
build/
*.egg-info/
.git/
.env
README.md
```

### TypeScript Dockerfile (Node.js)

**Multi-stage build:**
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build
RUN pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder /app/dist ./dist

# Run as non-root user
USER node

# Start application
CMD ["node", "dist/index.js"]
```

**.dockerignore:**
```
node_modules/
dist/
.next/
coverage/
.git/
.env
*.log
README.md
```

### Docker Compose

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/mydb
    depends_on:
      - db
    volumes:
      - ./logs:/app/logs

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

**Development override (docker-compose.override.yml):**
```yaml
version: '3.8'

services:
  app:
    build:
      target: builder
    command: pnpm dev
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
```

## Monitoring & Logging

### Structured Logging (Python)

**logger.py:**
```python
import logging
import sys
from typing import Any

import structlog


def configure_logging(level: str = "INFO") -> None:
    """Configure structured logging."""
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=level,
    )

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.StackInfoRenderer(),
            structlog.dev.set_exc_info,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.dev.ConsoleRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=False,
    )


logger = structlog.get_logger()

# Usage
logger.info("user_logged_in", user_id=123, ip="192.168.1.1")
logger.error("database_error", error="Connection timeout", query="SELECT ...")
```

### Structured Logging (TypeScript)

**logger.ts:**
```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});

export default logger;

// Usage
logger.info({ userId: 123, ip: '192.168.1.1' }, 'User logged in');
logger.error({ err: error, query: 'SELECT ...' }, 'Database error');
```

### Health Checks

**Python (FastAPI):**
```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
    }

@app.get("/ready")
async def readiness_check():
    """Readiness check endpoint."""
    # Check database connection
    try:
        await db.execute("SELECT 1")
        return {"status": "ready"}
    except Exception as e:
        return {"status": "not ready", "error": str(e)}
```

**TypeScript (Express):**
```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/ready', async (req, res) => {
  try {
    // Check database connection
    await db.raw('SELECT 1');
    res.json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message,
    });
  }
});
```

## Documentation Tools

### Sphinx (Python)

**Setup:**
```bash
pip install sphinx sphinx-rtd-theme sphinx-autodoc-typehints
sphinx-quickstart docs
```

**docs/conf.py:**
```python
import os
import sys
sys.path.insert(0, os.path.abspath('../src'))

project = 'My Project'
extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.napoleon',
    'sphinx.ext.viewcode',
    'sphinx_autodoc_typehints',
]

html_theme = 'sphinx_rtd_theme'
```

**Generate docs:**
```bash
sphinx-apidoc -o docs/api src/
sphinx-build -b html docs docs/_build
```

### TypeDoc (TypeScript)

**Setup:**
```bash
pnpm add -D typedoc
```

**typedoc.json:**
```json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs",
  "exclude": ["**/*.test.ts"],
  "excludePrivate": true,
  "excludeProtected": true,
  "readme": "README.md"
}
```

**Generate docs:**
```bash
pnpm typedoc
```

### MkDocs (Both)

**mkdocs.yml:**
```yaml
site_name: My Project
theme:
  name: material
  features:
    - navigation.sections
    - toc.integrate
    - search.suggest

nav:
  - Home: index.md
  - Getting Started: getting-started.md
  - API Reference: api/
  - Contributing: contributing.md

markdown_extensions:
  - pymdownx.highlight
  - pymdownx.superfences
  - admonition
  - toc:
      permalink: true
```

## Version Managers

### pyenv (Python)

**Setup:**
```bash
# Install pyenv
curl https://pyenv.run | bash

# Add to shell profile
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
```

**Usage:**
```bash
# Install Python version
pyenv install 3.11.7

# Set global version
pyenv global 3.11.7

# Set local version (creates .python-version)
pyenv local 3.11.7

# List versions
pyenv versions
```

### nvm (Node.js)

**Setup:**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

**Usage:**
```bash
# Install Node version
nvm install 20

# Use version
nvm use 20

# Set default
nvm alias default 20

# Install from .nvmrc
nvm install
nvm use
```

**.nvmrc:**
```
20
```

### asdf (Universal)

**Setup:**
```bash
git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.14.0
```

**Usage:**
```bash
# Add plugins
asdf plugin add python
asdf plugin add nodejs

# Install versions
asdf install python 3.11.7
asdf install nodejs 20.10.0

# Set versions (creates .tool-versions)
asdf local python 3.11.7
asdf local nodejs 20.10.0
```

**.tool-versions:**
```
python 3.11.7
nodejs 20.10.0
```

## Tool Comparison Matrix

### Package Managers

| Feature | pip+venv | Poetry | UV | npm | yarn | pnpm | bun |
|---------|----------|--------|-----|-----|------|------|-----|
| Speed | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Maturity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Lock Files | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Workspaces | ❌ | ⚠️ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Best For | Legacy | Stable | Modern | Standard | Monorepos | Performance | Bleeding Edge |

### Test Runners

| Feature | pytest | unittest | vitest | jest | mocha |
|---------|--------|----------|--------|------|-------|
| Speed | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Features | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Configuration | Simple | None | Simple | Complex | Simple |
| Ecosystem | Huge | Standard | Growing | Huge | Large |
| Best For | Python | Python std | Modern TS | React | Simple |

### Linters

| Feature | ruff | pylint | flake8 | eslint | biome |
|---------|------|--------|--------|--------|-------|
| Speed | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Rules | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Auto-fix | ✅ | ⚠️ | ⚠️ | ✅ | ✅ |
| Config | Simple | Complex | Simple | Medium | Simple |
| Best For | Modern Python | Legacy Python | Python | JS/TS | Speed |

## Troubleshooting Guide

### Common Issues

**1. "Module not found" errors:**

Python:
```bash
# Check Python path
python -c "import sys; print(sys.path)"

# Install in editable mode
pip install -e .

# Or with uv
uv pip install -e .
```

TypeScript:
```bash
# Check module resolution
tsc --traceResolution

# Clear cache
rm -rf node_modules dist
pnpm install
```

**2. Type checking fails but code runs:**

Python:
```bash
# Check mypy version
mypy --version

# Use less strict mode initially
mypy --no-strict-optional src/
```

TypeScript:
```json
// Gradually enable strict flags
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": true  // Start here
  }
}
```

**3. Tests pass locally but fail in CI:**

```bash
# Check environment differences
env | grep -E 'PATH|PYTHON|NODE'

# Use same Python/Node version
pyenv local 3.11.7
nvm use 20

# Check timezone issues
TZ=UTC pytest
```

**4. Slow CI builds:**

```yaml
# Add caching
- uses: actions/cache@v3
  with:
    path: ~/.pnpm-store
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}

# Use frozen lockfile
pnpm install --frozen-lockfile
```

**5. Import resolution issues (TypeScript):**

```json
// tsconfig.json - ensure moduleResolution matches build tool
{
  "compilerOptions": {
    // For Vite/modern bundlers
    "moduleResolution": "bundler",

    // For Node.js
    "moduleResolution": "node"
  }
}
```

### Performance Optimization

**Python:**
```toml
# pyproject.toml - exclude large directories
[tool.ruff]
exclude = [
    ".git",
    ".venv",
    "node_modules",
    "data/",
    "models/",
]

[tool.mypy]
# Skip type checking for third-party libs
ignore_missing_imports = true
```

**TypeScript:**
```json
// tsconfig.json - incremental builds
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

**Git hooks:**
```yaml
# Run fast checks only
repos:
  - repo: local
    hooks:
      - id: quick-check
        name: Quick lint
        entry: ruff check --select=E,F  # Only errors
        language: system
```

### Debugging Tips

**1. Enable verbose output:**
```bash
# Python
pytest -vv

# TypeScript
pnpm test --reporter=verbose

# Linters
eslint --debug
ruff check --verbose
```

**2. Check tool versions:**
```bash
# Create version check script
cat > check-versions.sh << 'EOF'
#!/bin/bash
echo "Python: $(python --version)"
echo "Node: $(node --version)"
echo "pnpm: $(pnpm --version)"
echo "git: $(git --version)"
EOF
chmod +x check-versions.sh
```

**3. Isolate the problem:**
```bash
# Test in clean environment
docker run -it --rm -v $(pwd):/app node:20 bash
cd /app && pnpm install && pnpm test
```
