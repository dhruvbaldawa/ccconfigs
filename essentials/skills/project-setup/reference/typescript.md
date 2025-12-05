# TypeScript Project Setup

Opinionated TypeScript setup: strict mode, ESLint with type-aware rules, Prettier, Vitest for testing, and Husky for pre-commit hooks.

## Tool Stack (December 2025)

| Purpose | Tool | Version | Why |
|---------|------|---------|-----|
| Runtime | **Node.js** | 24 (LTS) | Latest LTS, native ESM, excellent TypeScript support |
| Package manager | **pnpm** | 9.x | Fast, strict, disk efficient |
| Type checking | **TypeScript** | 5.9.3 | Strict mode, satisfies operator, improved inference |
| Linting | **ESLint** | 9.39.1 | Flat config, native TS config support, type-aware rules |
| Linting | **typescript-eslint** | 8.48.1 | Type-aware rules, strictTypeChecked preset |
| Formatting | **Prettier** | 3.7.4 | Opinionated, widely adopted, editor integrations |
| Testing | **Vitest** | 4.0.15 | Fast, native ESM/TS, Jest-compatible API |
| Pre-commit | **Husky** | 9.1.7 | Git hooks management |
| Pre-commit | **lint-staged** | 16.2.7 | Run linters on staged files only |

## Project Structure

```
my-project/
├── package.json
├── tsconfig.json
├── eslint.config.ts          # Native TypeScript config (ESLint 9.18+)
├── .prettierrc
├── vitest.config.ts
├── .husky/
│   └── pre-commit
├── README.md
└── src/
    ├── index.ts
    ├── core.ts
    ├── core.test.ts          # Co-located tests
    ├── utils/
    │   ├── helpers.ts
    │   └── helpers.test.ts
    └── types.ts
```

## Step-by-Step Setup

### 1. Initialize Project

```bash
# Create project directory
mkdir my-project && cd my-project

# Initialize with pnpm (or npm/yarn)
pnpm init

# Install TypeScript and core dev dependencies
pnpm add -D typescript @types/node

# Initialize TypeScript
pnpm tsc --init

# Create source directory
mkdir src
touch src/index.ts
```

### 2. Configure TypeScript (tsconfig.json)

Replace generated `tsconfig.json` with strict settings:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    // Type Checking - Maximum strictness
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,

    // Module Resolution
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,

    // Emit
    "target": "ES2024",
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    // Environment
    "lib": ["ES2024"],
    "types": ["node", "vitest/globals"],
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. Set Up ESLint

Install ESLint with TypeScript support:

```bash
pnpm add -D eslint @eslint/js typescript-eslint globals
```

Create `eslint.config.ts` (native TypeScript config, supported since ESLint 9.18+):

```typescript
// eslint.config.ts
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  // Ignore patterns
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },

  // Base JavaScript rules
  eslint.configs.recommended,

  // TypeScript type-aware rules (strictest preset)
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,

  // Global settings
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Custom rules
  {
    rules: {
      // Enforce explicit return types
      '@typescript-eslint/explicit-function-return-type': 'error',

      // Enforce explicit accessibility modifiers
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        { accessibility: 'explicit' },
      ],

      // No any without explanation
      '@typescript-eslint/no-explicit-any': 'error',

      // Prefer nullish coalescing
      '@typescript-eslint/prefer-nullish-coalescing': 'error',

      // Prefer optional chaining
      '@typescript-eslint/prefer-optional-chain': 'error',

      // No floating promises
      '@typescript-eslint/no-floating-promises': 'error',

      // No misused promises
      '@typescript-eslint/no-misused-promises': 'error',

      // Consistent type imports
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // No unused vars (configured to allow underscore prefix)
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // Test file overrides
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      // Relax some rules for tests
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },

  // Disable type-checked rules for JS config files
  {
    files: ['**/*.js', '**/*.mjs'],
    ...tseslint.configs.disableTypeChecked,
  },
);
```

### 4. Set Up Prettier

```bash
pnpm add -D prettier eslint-config-prettier
```

Create `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 120,
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

Create `.prettierignore`:

```
dist
node_modules
coverage
pnpm-lock.yaml
```

Update `eslint.config.ts` to include Prettier:

```typescript
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // ... previous config ...

  // Prettier must be last (disables ESLint formatting rules)
  prettierConfig
);
```

### 5. Set Up Vitest

```bash
pnpm add -D vitest @vitest/coverage-v8
```

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Enable globals (describe, it, expect)
    globals: true,

    // Test file patterns
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/types.ts'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },

    // Treat type errors as test failures
    typecheck: {
      enabled: true,
    },
  },
});
```

Vitest types are already included in the `tsconfig.json` above (`"types": ["node", "vitest/globals"]`).

### 6. Set Up Pre-commit Hooks

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

Update `.husky/pre-commit`:

```bash
pnpm lint-staged
```

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

### 7. Add Package Scripts

Update `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "check": "pnpm typecheck && pnpm lint && pnpm format:check && pnpm test:run",
    "prepare": "husky"
  }
}
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

      - name: Install pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Format check
        run: pnpm format:check

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm typecheck

      - name: Test
        run: pnpm test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: coverage/lcov.info
```

## Testing Patterns

### Co-located Unit Tests

```typescript
// src/calculator.ts
export function add(a: number, b: number): number {
  return a + b;
}

export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Cannot divide by zero');
  }
  return a / b;
}

// src/calculator.test.ts
import { describe, it, expect } from 'vitest';
import { add, divide } from './calculator.js';

describe('calculator', () => {
  describe('add', () => {
    it('adds positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('adds negative numbers', () => {
      expect(add(-1, -1)).toBe(-2);
    });
  });

  describe('divide', () => {
    it('divides numbers', () => {
      expect(divide(10, 2)).toBe(5);
    });

    it('throws on division by zero', () => {
      expect(() => divide(10, 0)).toThrow('Cannot divide by zero');
    });
  });
});
```

### Integration Tests with HTTP Mocking

```typescript
// src/api-client.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchUser } from './api-client.js';

describe('fetchUser', () => {
  beforeEach(() => {
    // Mock fetch at the boundary
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns user data', async () => {
    const mockUser = { id: 1, name: 'Alice' };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUser),
    } as Response);

    const user = await fetchUser(1);

    expect(user).toEqual(mockUser);
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/users/1');
  });

  it('throws on network error', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    await expect(fetchUser(1)).rejects.toThrow('Network error');
  });
});
```

### Testing with Dependency Injection

```typescript
// src/user-service.ts
export interface Database {
  getUser(id: string): Promise<User | null>;
  saveUser(user: User): Promise<void>;
}

export class UserService {
  public constructor(private readonly db: Database) {}

  public async createUser(email: string): Promise<User> {
    const user = { id: crypto.randomUUID(), email };
    await this.db.saveUser(user);
    return user;
  }
}

// src/user-service.test.ts
import { describe, it, expect, vi } from 'vitest';
import { UserService, type Database } from './user-service.js';

describe('UserService', () => {
  it('creates user and saves to database', async () => {
    // Create a test double that satisfies the interface
    const mockDb: Database = {
      getUser: vi.fn(),
      saveUser: vi.fn().mockResolvedValue(undefined),
    };

    const service = new UserService(mockDb);
    const user = await service.createUser('alice@example.com');

    expect(user.email).toBe('alice@example.com');
    expect(mockDb.saveUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'alice@example.com' })
    );
  });
});
```

## Strict Mode Rationale

**Why these TypeScript flags?**

| Flag | Why |
|------|-----|
| `strict` | Enables all strict checks (base requirement) |
| `noUncheckedIndexedAccess` | Forces handling undefined for array/object access |
| `noImplicitOverride` | Requires `override` keyword, catches accidental overrides |
| `noPropertyAccessFromIndexSignature` | Forces bracket notation for index signatures |
| `exactOptionalPropertyTypes` | Distinguishes `undefined` from missing property |
| `verbatimModuleSyntax` | Enforces correct import/export for type-only imports |

**Why type-aware ESLint rules?**
- Catches runtime errors at lint time
- `no-floating-promises`: Prevents unhandled rejections
- `no-misused-promises`: Catches async mistakes in conditionals
- `consistent-type-imports`: Optimizes bundle size

## Common Issues

**ESLint: Parsing error in config**
```bash
# Ensure ESLint 9+ and flat config
# Check package.json has "type": "module"
```

**TypeScript: Module not found**
```bash
# Use .js extension in imports (NodeNext resolution)
import { foo } from './foo.js';  # Correct
import { foo } from './foo';     # May fail
```

**Vitest: Cannot find module**
```bash
# Ensure vitest.config.ts matches tsconfig paths
# Check include patterns in vitest.config.ts
```

**Pre-commit: Hook not running**
```bash
# Reinstall husky
rm -rf .husky
pnpm exec husky init
echo "pnpm lint-staged" > .husky/pre-commit
```

## .gitignore

```gitignore
# Dependencies
node_modules/

# Build outputs
dist/
build/
*.tsbuildinfo

# Testing
coverage/

# IDE
.idea/
.vscode/
*.swp

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.local
.env.*.local

# Logs
*.log
logs/
```

## .editorconfig

```ini
[*.{ts,tsx,js,jsx,json,yml,yaml}]
indent_style = space
indent_size = 2
max_line_length = 120

[*.md]
trim_trailing_whitespace = false
```

## Security Scanning

```bash
# Run npm audit
pnpm audit

# Fix vulnerabilities (where possible)
pnpm audit --fix
```

## Dependabot Configuration

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```

## Dependency Updates

```bash
# Check for outdated packages
pnpm outdated

# Update all dependencies
pnpm update

# Update to latest (including major versions)
pnpm update --latest
```
