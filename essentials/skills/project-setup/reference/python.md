# Python Project Setup

## Tool Stack (December 2025)

| Purpose | Tool | Version |
|---------|------|---------|
| Runtime | Python | 3.14 |
| Package manager | uv | 0.9.15 |
| Linting/Formatting | ruff | 0.14.8 |
| Type checking | basedpyright | 1.35.0 |
| Testing | pytest | 9.0.1 |
| Coverage | pytest-cov | 7.0.0 |
| Pre-commit | pre-commit | 4.5.0 |

## Project Structure

```
my-project/
├── pyproject.toml
├── .python-version
├── .pre-commit-config.yaml
├── src/my_project/
│   ├── __init__.py
│   ├── core.py
│   └── core_test.py      # Co-located tests
└── tests/integration/    # Integration tests only
```

## Setup

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
uv init my-project && cd my-project
echo "3.14" > .python-version
mkdir -p src/my_project tests/integration
touch src/my_project/__init__.py
```

## pyproject.toml

```toml
[project]
name = "my-project"
version = "0.1.0"
requires-python = ">=3.14"
dependencies = []

[project.optional-dependencies]
dev = ["basedpyright>=1.35.0", "pytest>=9.0.1", "pytest-cov>=7.0.0", "pre-commit>=4.5.0"]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["src/my_project"]

[tool.ruff]
line-length = 120
target-version = "py314"
src = ["src", "tests"]

[tool.ruff.lint]
select = ["F", "E", "W", "C4", "B", "I", "UP", "ARG", "SIM", "TCH", "PTH", "ERA", "PL", "RUF"]
ignore = ["E501", "PLR0913", "PLR2004"]

[tool.ruff.lint.per-file-ignores]
"*_test.py" = ["ARG001"]
"tests/**" = ["ARG001"]

[tool.ruff.lint.isort]
known-first-party = ["my_project"]

[tool.basedpyright]
pythonVersion = "3.14"
typeCheckingMode = "all"
reportMissingTypeStubs = "warning"
reportUnusedImport = "error"
reportUnusedVariable = "error"
reportOptionalMemberAccess = "error"
reportOptionalSubscript = "error"
reportOptionalCall = "error"

[tool.pytest.ini_options]
testpaths = ["src", "tests"]
python_files = ["*_test.py", "test_*.py"]
addopts = ["--import-mode=importlib", "-ra", "--strict-markers", "--strict-config"]
filterwarnings = ["error"]
strict = true

[tool.coverage.run]
source = ["src"]
branch = true
omit = ["*_test.py"]

[tool.coverage.report]
exclude_lines = ["pragma: no cover", "if TYPE_CHECKING:", "raise NotImplementedError"]
fail_under = 80
show_missing = true
```

## .pre-commit-config.yaml

```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.14.8
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]
      - id: ruff-format
  - repo: local
    hooks:
      - id: basedpyright
        name: basedpyright
        entry: uv run basedpyright
        language: system
        types: [python]
        pass_filenames: false
      - id: pytest
        name: pytest
        entry: uv run pytest
        language: system
        pass_filenames: false
        always_run: true
```

```bash
uv sync --all-extras && uv run pre-commit install
```

## Commands

```bash
uv run pytest                    # Run tests
uv run pytest --cov              # With coverage
uv run ruff check . --fix        # Lint + fix
uv run ruff format .             # Format
uv run basedpyright              # Type check
uv pip list --outdated           # Check updates
uv lock --upgrade                # Update deps
```

## GitHub Actions CI

`.github/workflows/ci.yml`:

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
      - uses: astral-sh/setup-uv@v4
        with:
          enable-cache: true
          cache-dependency-glob: 'uv.lock'
      - run: uv python install
      - run: uv sync --all-extras
      - run: uv run ruff format --check .
      - run: uv run ruff check .
      - run: uv run basedpyright
      - run: uv run pytest --cov --cov-report=xml
      - uses: codecov/codecov-action@v4
        with:
          files: coverage.xml
```

## Test Example

```python
# src/my_project/calculator.py
def add(a: int, b: int) -> int:
    return a + b

# src/my_project/calculator_test.py
from my_project.calculator import add

def test_add() -> None:
    assert add(2, 3) == 5
    assert add(-1, -1) == -2
```

## .gitignore

```gitignore
__pycache__/
*.py[cod]
.venv/
.basedpyright/
.pytest_cache/
.coverage
coverage.xml
.ruff_cache/
dist/
*.egg-info/
.env
.env.local
```

## .editorconfig

```ini
[*.py]
indent_style = space
indent_size = 4
max_line_length = 120
```

## Security & Dependabot

```bash
uv add --dev pip-audit && uv run pip-audit
```

`.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "pip"
    directory: "/"
    schedule:
      interval: "weekly"
```
