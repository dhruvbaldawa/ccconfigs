# Python Project Setup

Opinionated Python setup with modern tooling: uv for package management, ruff for linting/formatting, mypy for type checking, pytest for testing.

## Tool Stack

| Purpose | Tool | Why |
|---------|------|-----|
| Package manager | **uv** | Fast, replaces pip/pipenv/poetry, handles Python versions |
| Linting | **ruff** | Fast, replaces flake8/isort/pyupgrade, extensive rule sets |
| Formatting | **ruff format** | Fast, black-compatible, integrated with linter |
| Type checking | **mypy** | Mature, strict mode available, good IDE support |
| Testing | **pytest** | Standard, fixtures, plugins ecosystem |
| Coverage | **pytest-cov** | pytest integration, multiple report formats |
| Pre-commit | **pre-commit** | Language-agnostic hooks, cached environments |

## Project Structure

```
my-project/
├── pyproject.toml          # All config in one file
├── .python-version         # Pin Python version (for uv)
├── .pre-commit-config.yaml # Pre-commit hooks
├── README.md
├── src/
│   └── my_project/
│       ├── __init__.py
│       ├── core.py
│       ├── core_test.py    # Co-located tests
│       ├── utils.py
│       └── utils_test.py
└── tests/                  # Integration/E2E tests only
    ├── conftest.py         # Shared fixtures
    └── integration/
        └── test_api.py
```

## Step-by-Step Setup

### 1. Initialize Project

```bash
# Install uv (if not already)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create project
uv init my-project
cd my-project

# Pin Python version
echo "3.12" > .python-version

# Create source structure
mkdir -p src/my_project tests/integration
touch src/my_project/__init__.py
```

### 2. Configure pyproject.toml

Replace the generated `pyproject.toml`:

```toml
[project]
name = "my-project"
version = "0.1.0"
description = "Project description"
readme = "README.md"
requires-python = ">=3.12"
dependencies = []

[project.optional-dependencies]
dev = [
    "mypy>=1.11",
    "pytest>=8.0",
    "pytest-cov>=5.0",
    "pre-commit>=3.8",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["src/my_project"]

# =============================================================================
# Ruff - Linting & Formatting
# =============================================================================
[tool.ruff]
line-length = 88
target-version = "py312"
src = ["src", "tests"]

[tool.ruff.lint]
select = [
    "E",      # pycodestyle errors
    "W",      # pycodestyle warnings
    "F",      # pyflakes
    "I",      # isort
    "B",      # flake8-bugbear
    "C4",     # flake8-comprehensions
    "UP",     # pyupgrade
    "ARG",    # flake8-unused-arguments
    "SIM",    # flake8-simplify
    "TCH",    # flake8-type-checking
    "PTH",    # flake8-use-pathlib
    "ERA",    # eradicate (commented code)
    "PL",     # pylint
    "RUF",    # ruff-specific
]
ignore = [
    "PLR0913",  # Too many arguments (sometimes necessary)
    "PLR2004",  # Magic value comparison (too noisy)
]

[tool.ruff.lint.per-file-ignores]
"*_test.py" = ["ARG001"]  # Unused arguments OK in tests (fixtures)
"tests/**" = ["ARG001"]

[tool.ruff.lint.isort]
known-first-party = ["my_project"]

# =============================================================================
# Mypy - Type Checking
# =============================================================================
[tool.mypy]
python_version = "3.12"
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_incomplete_defs = true
check_untyped_defs = true
disallow_untyped_decorators = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_no_return = true
no_implicit_optional = true
strict_equality = true
extra_checks = true

[[tool.mypy.overrides]]
module = "tests.*"
disallow_untyped_defs = false  # Fixtures don't need types

# =============================================================================
# Pytest - Testing
# =============================================================================
[tool.pytest.ini_options]
testpaths = ["src", "tests"]
python_files = ["*_test.py", "test_*.py"]
python_functions = ["test_*"]
addopts = [
    "-ra",                    # Show summary of all results
    "--strict-markers",       # Error on unknown markers
    "--strict-config",        # Error on config issues
    "-v",                     # Verbose output
]
filterwarnings = [
    "error",                  # Treat warnings as errors
]

[tool.coverage.run]
source = ["src"]
branch = true
omit = ["*_test.py"]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "if TYPE_CHECKING:",
    "raise NotImplementedError",
]
fail_under = 80
show_missing = true
```

### 3. Set Up Pre-commit

Create `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.6.9
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.11.2
    hooks:
      - id: mypy
        additional_dependencies: []  # Add typed stubs here
        args: [--config-file=pyproject.toml]

  - repo: local
    hooks:
      - id: pytest
        name: pytest
        entry: uv run pytest
        language: system
        pass_filenames: false
        always_run: true
```

Install hooks:

```bash
uv sync --all-extras
uv run pre-commit install
```

### 4. Common Commands

```bash
# Install dependencies
uv sync --all-extras

# Run tests
uv run pytest

# Run tests with coverage
uv run pytest --cov --cov-report=term-missing

# Run linter
uv run ruff check .

# Run formatter
uv run ruff format .

# Run type checker
uv run mypy src

# Run all checks (same as pre-commit)
uv run ruff check . && uv run ruff format --check . && uv run mypy src && uv run pytest
```

## CI Configuration (GitHub Actions)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install uv
        uses: astral-sh/setup-uv@v3
        with:
          enable-cache: true

      - name: Set up Python
        run: uv python install

      - name: Install dependencies
        run: uv sync --all-extras

      - name: Lint
        run: uv run ruff check .

      - name: Format check
        run: uv run ruff format --check .

      - name: Type check
        run: uv run mypy src

      - name: Test
        run: uv run pytest --cov --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: coverage.xml
```

## Testing Patterns

### Co-located Unit Tests

```python
# src/my_project/calculator.py
def add(a: int, b: int) -> int:
    return a + b

# src/my_project/calculator_test.py
from my_project.calculator import add

def test_add_positive_numbers() -> None:
    assert add(2, 3) == 5

def test_add_negative_numbers() -> None:
    assert add(-1, -1) == -2
```

### Integration Tests with Fixtures

```python
# tests/conftest.py
import pytest
from my_project.database import Database

@pytest.fixture
def db() -> Database:
    """Provide test database connection."""
    db = Database(":memory:")
    db.setup_schema()
    yield db
    db.close()

# tests/integration/test_user_service.py
from my_project.user_service import UserService

def test_create_user(db: Database) -> None:
    service = UserService(db)
    user = service.create("alice@example.com")
    assert user.email == "alice@example.com"
    assert db.get_user(user.id) is not None
```

### Mocking External Boundaries

```python
# Only mock external HTTP calls, not your own code
from unittest.mock import patch
import httpx

def test_fetch_weather() -> None:
    mock_response = {"temp": 72, "conditions": "sunny"}

    with patch.object(httpx, "get") as mock_get:
        mock_get.return_value.json.return_value = mock_response

        result = fetch_weather("NYC")

        assert result.temperature == 72
        mock_get.assert_called_once_with("https://api.weather.com/NYC")
```

## Adding Type Stubs

For third-party packages without types:

```bash
# Search for stubs
uv run pip index versions types-requests

# Add to dependencies
uv add --dev types-requests

# Add to mypy pre-commit hook
# In .pre-commit-config.yaml under mypy hook:
additional_dependencies: [types-requests]
```

## Strict Mode Rationale

**Why `strict = true` in mypy?**
- Catches more bugs at type-check time
- Forces explicit types, improving documentation
- Makes refactoring safer
- Default is too permissive

**Why extensive ruff rules?**
- `B` (bugbear): Catches common bugs
- `C4` (comprehensions): Enforces idiomatic Python
- `UP` (pyupgrade): Keeps code modern
- `ARG` (unused-arguments): Catches dead code
- `SIM` (simplify): Reduces complexity
- `PTH` (pathlib): Modern file handling

## Troubleshooting

**mypy: Module not found**
```bash
# Ensure src is in Python path
export PYTHONPATH="${PYTHONPATH}:src"
# Or configure in pyproject.toml
```

**pre-commit: Hook failed**
```bash
# Run specific hook manually
uv run pre-commit run ruff --all-files

# Update hooks to latest
uv run pre-commit autoupdate
```

**pytest: Tests not discovered**
```bash
# Check test file naming
# Must be *_test.py or test_*.py (configured in pyproject.toml)
```
