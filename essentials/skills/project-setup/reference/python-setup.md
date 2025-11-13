# Python Project Setup Reference

Complete templates and configurations for setting up Python projects from scratch.

## Table of Contents

1. [Directory Structures](#directory-structures)
2. [Dependency Management](#dependency-management)
3. [Tool Configurations](#tool-configurations)
4. [Pre-commit Hooks](#pre-commit-hooks)
5. [CI/CD Templates](#cicd-templates)
6. [Best Practices](#best-practices)

## Directory Structures

### Library/Package Structure

```
mypackage/
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   └── mypackage/
│       ├── __init__.py
│       ├── core.py
│       └── utils.py
├── tests/
│   ├── __init__.py
│   ├── test_core.py
│   └── test_utils.py
├── docs/
│   ├── conf.py
│   └── index.md
├── .gitignore
├── .pre-commit-config.yaml
├── pyproject.toml
├── README.md
├── LICENSE
└── CHANGELOG.md
```

**Key points:**
- Source code in `src/mypackage/` (src layout prevents import issues)
- Tests mirror source structure
- Docs use Sphinx or MkDocs
- All config in `pyproject.toml` (modern standard)

### Application Structure

```
myapp/
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   └── myapp/
│       ├── __init__.py
│       ├── __main__.py      # Entry point: python -m myapp
│       ├── cli.py           # CLI interface
│       ├── config.py        # Configuration management
│       ├── core/            # Business logic
│       │   ├── __init__.py
│       │   └── service.py
│       └── utils/
│           ├── __init__.py
│           └── helpers.py
├── tests/
│   ├── conftest.py          # Pytest fixtures
│   ├── unit/
│   │   └── test_service.py
│   └── integration/
│       └── test_cli.py
├── scripts/
│   └── setup_dev.sh         # Development setup script
├── .env.example             # Environment variables template
├── .gitignore
├── .pre-commit-config.yaml
├── pyproject.toml
├── README.md
└── Dockerfile               # If containerized
```

**Key points:**
- `__main__.py` for CLI entry point
- Separate unit and integration tests
- Configuration management for environment-specific settings
- Scripts for development automation

### Data Science / ML Project Structure

```
ml-project/
├── .github/
│   └── workflows/
│       └── ci.yml
├── data/
│   ├── raw/                 # Original immutable data
│   ├── processed/           # Cleaned data
│   └── external/            # External datasets
├── notebooks/
│   ├── 01-exploration.ipynb
│   ├── 02-modeling.ipynb
│   └── 03-evaluation.ipynb
├── src/
│   └── mlproject/
│       ├── __init__.py
│       ├── data/
│       │   ├── __init__.py
│       │   └── preprocessing.py
│       ├── features/
│       │   ├── __init__.py
│       │   └── engineering.py
│       ├── models/
│       │   ├── __init__.py
│       │   ├── train.py
│       │   └── predict.py
│       └── visualization/
│           ├── __init__.py
│           └── plots.py
├── tests/
│   └── test_preprocessing.py
├── models/                  # Saved model artifacts
├── outputs/                 # Results, figures
├── .gitignore
├── .pre-commit-config.yaml
├── pyproject.toml
├── README.md
└── requirements.txt         # Or pyproject.toml
```

**Key points:**
- Data directories organized by processing stage
- Notebooks for exploration, source code for production
- Separate modules for data, features, models
- Don't commit large data files or models (use DVC or cloud storage)

## Dependency Management

### Using UV (Recommended for Modern Projects)

**Initialize project:**
```bash
# Create new project
uv init myproject
cd myproject

# Or in existing directory
uv init
```

**Add dependencies:**
```bash
# Production dependencies
uv add requests pydantic

# Development dependencies
uv add --dev pytest ruff mypy

# Optional dependency groups
uv add --group docs sphinx sphinx-rtd-theme
uv add --group dev-tools ipython
```

**pyproject.toml with UV:**
```toml
[project]
name = "myproject"
version = "0.1.0"
description = "A brief description"
readme = "README.md"
requires-python = ">=3.11"
dependencies = [
    "requests>=2.31.0",
    "pydantic>=2.5.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-cov>=4.1.0",
    "ruff>=0.1.0",
    "mypy>=1.7.0",
]
docs = [
    "sphinx>=7.2.0",
    "sphinx-rtd-theme>=2.0.0",
]

[project.scripts]
myproject = "myproject.cli:main"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.uv]
dev-dependencies = [
    "pytest>=7.4.0",
    "ruff>=0.1.0",
]

[tool.hatch.build.targets.wheel]
packages = ["src/myproject"]
```

**Common commands:**
```bash
# Install all dependencies
uv sync

# Run command in project environment
uv run pytest
uv run mypy src

# Add/remove dependencies
uv add packagename
uv remove packagename

# Update dependencies
uv lock --upgrade
```

### Using Poetry (Stable Alternative)

**Initialize project:**
```bash
poetry new myproject
cd myproject

# Or in existing directory
poetry init
```

**Add dependencies:**
```bash
poetry add requests pydantic
poetry add --group dev pytest ruff mypy
poetry add --group docs sphinx
```

**pyproject.toml with Poetry:**
```toml
[tool.poetry]
name = "myproject"
version = "0.1.0"
description = "A brief description"
authors = ["Your Name <you@example.com>"]
readme = "README.md"
packages = [{include = "myproject", from = "src"}]

[tool.poetry.dependencies]
python = "^3.11"
requests = "^2.31.0"
pydantic = "^2.5.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.0"
pytest-cov = "^4.1.0"
ruff = "^0.1.0"
mypy = "^1.7.0"

[tool.poetry.scripts]
myproject = "myproject.cli:main"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
```

**Common commands:**
```bash
# Install dependencies
poetry install

# Run command in virtual environment
poetry run pytest
poetry run mypy src

# Add/remove dependencies
poetry add packagename
poetry remove packagename

# Update dependencies
poetry update
```

## Tool Configurations

### Ruff (Linter + Formatter)

**pyproject.toml:**
```toml
[tool.ruff]
line-length = 100
target-version = "py311"

# Exclude common directories
exclude = [
    ".git",
    ".venv",
    "__pycache__",
    "build",
    "dist",
]

[tool.ruff.lint]
# Enable rule sets
select = [
    "E",      # pycodestyle errors
    "W",      # pycodestyle warnings
    "F",      # pyflakes
    "I",      # isort
    "N",      # pep8-naming
    "UP",     # pyupgrade
    "B",      # flake8-bugbear
    "C4",     # flake8-comprehensions
    "SIM",    # flake8-simplify
    "TCH",    # flake8-type-checking
    "PTH",    # flake8-use-pathlib
]

# Ignore specific rules
ignore = [
    "E501",   # Line too long (handled by formatter)
]

# Allow autofix for all enabled rules
fixable = ["ALL"]
unfixable = []

[tool.ruff.lint.per-file-ignores]
# Ignore certain rules in test files
"tests/**/*.py" = ["S101"]  # Allow assert in tests

[tool.ruff.lint.isort]
known-first-party = ["myproject"]

[tool.ruff.format]
# Use Black-compatible formatting
quote-style = "double"
indent-style = "space"
skip-magic-trailing-comma = false
line-ending = "auto"
```

**Run ruff:**
```bash
# Check for issues
ruff check .

# Auto-fix issues
ruff check --fix .

# Format code
ruff format .

# Both lint and format
ruff check --fix . && ruff format .
```

### Mypy (Type Checker)

**pyproject.toml:**
```toml
[tool.mypy]
python_version = "3.11"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_incomplete_defs = true
check_untyped_defs = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_no_return = true
warn_unreachable = true
strict_equality = true

# Per-module options
[[tool.mypy.overrides]]
module = "tests.*"
disallow_untyped_defs = false

[[tool.mypy.overrides]]
module = "third_party_without_types.*"
ignore_missing_imports = true
```

**For stricter typing (production services):**
```toml
[tool.mypy]
python_version = "3.11"
strict = true  # Enable all strict flags
warn_return_any = true
warn_unused_configs = true

[[tool.mypy.overrides]]
module = "tests.*"
strict = false
```

**Run mypy:**
```bash
mypy src
mypy src tests
```

### Pytest (Testing)

**pyproject.toml:**
```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py", "*_test.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = [
    "--strict-markers",
    "--strict-config",
    "--cov=src/myproject",
    "--cov-report=term-missing",
    "--cov-report=html",
    "--cov-fail-under=80",
]
markers = [
    "slow: marks tests as slow (deselect with '-m \"not slow\"')",
    "integration: marks tests as integration tests",
]
```

**tests/conftest.py (shared fixtures):**
```python
"""Shared pytest fixtures."""
import pytest


@pytest.fixture
def sample_data():
    """Provide sample data for tests."""
    return {"key": "value"}


@pytest.fixture
def temp_file(tmp_path):
    """Create a temporary file for testing."""
    file_path = tmp_path / "test.txt"
    file_path.write_text("test content")
    return file_path
```

**Example test file:**
```python
"""Tests for core module."""
import pytest
from myproject.core import add


def test_add():
    """Test addition function."""
    assert add(2, 3) == 5


def test_add_negative():
    """Test addition with negative numbers."""
    assert add(-1, 1) == 0


@pytest.mark.parametrize(
    ("a", "b", "expected"),
    [
        (1, 2, 3),
        (0, 0, 0),
        (-1, -1, -2),
    ],
)
def test_add_parametrized(a, b, expected):
    """Test addition with multiple inputs."""
    assert add(a, b) == expected


@pytest.mark.slow
def test_slow_operation():
    """Test that takes a long time."""
    # ... slow test code ...
    pass
```

**Run pytest:**
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov

# Run specific test
pytest tests/test_core.py::test_add

# Run only fast tests
pytest -m "not slow"

# Run with verbose output
pytest -v
```

### Coverage Configuration

**pyproject.toml:**
```toml
[tool.coverage.run]
source = ["src"]
branch = true
omit = [
    "*/tests/*",
    "*/__main__.py",
]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "def __repr__",
    "raise AssertionError",
    "raise NotImplementedError",
    "if __name__ == .__main__.:",
    "if TYPE_CHECKING:",
    "@abstractmethod",
]
precision = 2
show_missing = true
```

## Pre-commit Hooks

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
      - id: check-merge-conflict
      - id: check-toml
      - id: debug-statements

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.9
    hooks:
      # Linter
      - id: ruff
        args: [--fix]
      # Formatter
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.7.1
    hooks:
      - id: mypy
        additional_dependencies: [types-requests]
        args: [--strict, --ignore-missing-imports]
```

**Setup and usage:**
```bash
# Install pre-commit hooks
pre-commit install

# Run manually on all files
pre-commit run --all-files

# Run on specific files
pre-commit run --files src/myproject/core.py

# Update hooks to latest versions
pre-commit autoupdate
```

## CI/CD Templates

### GitHub Actions

**.github/workflows/ci.yml:**
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.11", "3.12"]

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}

      - name: Install UV
        run: curl -LsSf https://astral.sh/uv/install.sh | sh

      - name: Install dependencies
        run: |
          uv sync --all-extras

      - name: Run ruff (lint)
        run: uv run ruff check .

      - name: Run ruff (format check)
        run: uv run ruff format --check .

      - name: Run mypy
        run: uv run mypy src

      - name: Run tests
        run: uv run pytest --cov --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
          fail_ci_if_error: true
```

**With Poetry:**
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.11", "3.12"]

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}

      - name: Install Poetry
        uses: snok/install-poetry@v1
        with:
          version: 1.7.1
          virtualenvs-create: true
          virtualenvs-in-project: true

      - name: Load cached venv
        id: cached-poetry-dependencies
        uses: actions/cache@v3
        with:
          path: .venv
          key: venv-${{ runner.os }}-${{ matrix.python-version }}-${{ hashFiles('**/poetry.lock') }}

      - name: Install dependencies
        if: steps.cached-poetry-dependencies.outputs.cache-hit != 'true'
        run: poetry install --no-interaction --no-root

      - name: Install project
        run: poetry install --no-interaction

      - name: Run ruff
        run: poetry run ruff check .

      - name: Run mypy
        run: poetry run mypy src

      - name: Run tests
        run: poetry run pytest --cov --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
```

## Best Practices

### .gitignore

```gitignore
# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# Distribution / packaging
dist/
build/
*.egg-info/
.eggs/

# Virtual environments
venv/
.venv/
env/
ENV/

# Testing
.pytest_cache/
.coverage
htmlcov/
.tox/

# Type checking
.mypy_cache/
.dmypy.json
dmypy.json

# IDE
.vscode/
.idea/
*.swp
*.swo

# Environment variables
.env
.env.local

# OS
.DS_Store
Thumbs.db

# Project specific
data/raw/*
data/processed/*
!data/raw/.gitkeep
!data/processed/.gitkeep
models/*.pkl
*.log
```

### README.md Template

```markdown
# Project Name

Brief description of what this project does.

## Installation

### Prerequisites

- Python 3.11+
- UV (recommended) or Poetry

### Setup

```bash
# Clone the repository
git clone https://github.com/username/myproject.git
cd myproject

# Install dependencies
uv sync

# Or with Poetry
poetry install
```

## Usage

```python
from myproject import core

result = core.do_something()
```

### CLI

```bash
# Run the CLI
uv run myproject --help

# Or
python -m myproject --help
```

## Development

### Setup development environment

```bash
# Install dev dependencies
uv sync --all-extras

# Install pre-commit hooks
pre-commit install
```

### Running tests

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov

# Run specific test
uv run pytest tests/test_core.py
```

### Code quality

```bash
# Lint
uv run ruff check .

# Format
uv run ruff format .

# Type check
uv run mypy src
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
```

### Common Gotchas

**1. Import issues with src layout:**
```bash
# Don't run pytest from src directory
cd /path/to/project
pytest  # ✓ Correct

cd src
pytest  # ✗ Wrong - will cause import issues
```

**2. Type hints in `__init__.py`:**
```python
# src/myproject/__init__.py
from myproject.core import MyClass

__all__ = ["MyClass"]

# For type checking, re-export explicitly
if TYPE_CHECKING:
    from myproject.core import MyClass as MyClass
```

**3. Relative vs absolute imports:**
```python
# Prefer absolute imports (better for refactoring)
from myproject.utils import helper  # ✓ Good

# Avoid relative imports in application code
from ..utils import helper  # ✗ Avoid (OK in tests)
```

**4. Test isolation:**
```python
# Always use fixtures for shared state
@pytest.fixture
def clean_database():
    db = Database()
    yield db
    db.cleanup()  # Ensure cleanup

def test_insert(clean_database):
    clean_database.insert(...)  # ✓ Isolated
```

**5. Environment variables:**
```python
# Use python-decouple or pydantic-settings for config
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    api_key: str
    debug: bool = False

    class Config:
        env_file = ".env"

settings = Settings()  # Reads from .env
```

### Quick Start Script

**scripts/quickstart.py:**
```python
#!/usr/bin/env python3
"""Quick start script for Python projects."""
import subprocess
import sys
from pathlib import Path

def run(cmd: str) -> None:
    """Run shell command."""
    print(f"Running: {cmd}")
    subprocess.run(cmd, shell=True, check=True)

def main() -> None:
    """Set up Python project."""
    project_name = sys.argv[1] if len(sys.argv) > 1 else "myproject"

    # Create directory structure
    dirs = [
        f"src/{project_name}",
        "tests",
        "docs",
        ".github/workflows",
    ]
    for d in dirs:
        Path(d).mkdir(parents=True, exist_ok=True)

    # Initialize files
    (Path("src") / project_name / "__init__.py").touch()
    (Path("tests") / "__init__.py").touch()

    # Initialize git
    run("git init")

    # Initialize uv
    run("uv init")

    # Add dev dependencies
    run("uv add --dev pytest ruff mypy pre-commit")

    print(f"\n✓ Project '{project_name}' initialized!")
    print("\nNext steps:")
    print("1. Add tool configurations to pyproject.toml")
    print("2. Create .pre-commit-config.yaml")
    print("3. Run: pre-commit install")
    print("4. Write your first test in tests/")

if __name__ == "__main__":
    main()
```

Make it executable:
```bash
chmod +x scripts/quickstart.py
./scripts/quickstart.py myproject
```
