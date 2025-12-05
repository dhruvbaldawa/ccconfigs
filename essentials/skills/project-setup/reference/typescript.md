# TypeScript Project Setup

## Tool Stack (December 2025)

| Purpose | Tool | Version |
|---------|------|---------|
| Runtime | Node.js | 24 (LTS) |
| Package manager | pnpm | 9.x |
| Type checking | TypeScript | 5.9.3 |
| Linting | ESLint + typescript-eslint | 9.39.1 / 8.48.1 |
| Formatting | Prettier | 3.7.4 |
| Testing | Vitest | 4.0.15 |
| Pre-commit | Husky + lint-staged | 9.1.7 / 16.2.7 |

## Project Structure

```
my-project/
├── package.json
├── tsconfig.json
├── eslint.config.ts
├── .prettierrc
├── vitest.config.ts
├── .husky/pre-commit
└── src/
    ├── index.ts
    ├── core.ts
    └── core.test.ts    # Co-located tests
```

## Setup

```bash
mkdir my-project && cd my-project
pnpm init
pnpm add -D typescript @types/node
pnpm tsc --init
mkdir src && touch src/index.ts
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "verbatimModuleSyntax": true,
    "target": "ES2024",
    "outDir": "dist",
    "declaration": true,
    "sourceMap": true,
    "lib": ["ES2024"],
    "types": ["node", "vitest/globals"],
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## ESLint

```bash
pnpm add -D eslint @eslint/js typescript-eslint globals eslint-config-prettier
```

`eslint.config.ts`:

```typescript
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**'] },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },
  {
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  { files: ['**/*.test.ts'], rules: { '@typescript-eslint/explicit-function-return-type': 'off' } },
  { files: ['**/*.js', '**/*.mjs'], ...tseslint.configs.disableTypeChecked },
  prettierConfig,
);
```

## Prettier

`.prettierrc`:

```json
{ "semi": true, "singleQuote": true, "tabWidth": 2, "printWidth": 120 }
```

## Vitest

```bash
pnpm add -D vitest @vitest/coverage-v8
```

`vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
      thresholds: { statements: 80, branches: 75, functions: 80, lines: 80 },
    },
  },
});
```

## Pre-commit

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
echo "pnpm lint-staged" > .husky/pre-commit
```

## package.json

```json
{
  "type": "module",
  "scripts": {
    "build": "tsc",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "check": "pnpm typecheck && pnpm lint && pnpm format:check && pnpm test",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
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
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm format:check
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v4
        with:
          files: coverage/lcov.info
```

## Test Example

```typescript
// src/calculator.ts
export function add(a: number, b: number): number {
  return a + b;
}

// src/calculator.test.ts
import { describe, it, expect } from 'vitest';
import { add } from './calculator.js';

describe('add', () => {
  it('adds numbers', () => {
    expect(add(2, 3)).toBe(5);
    expect(add(-1, -1)).toBe(-2);
  });
});
```

## .gitignore

```gitignore
node_modules/
dist/
coverage/
*.tsbuildinfo
.env
.env.local
```

## .editorconfig

```ini
[*.{ts,tsx,js,jsx,json,yml,yaml}]
indent_style = space
indent_size = 2
max_line_length = 120
```

## Security & Dependabot

```bash
pnpm audit
```

`.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```
