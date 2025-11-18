# TypeScript Project Setup Reference

Complete templates and configurations for setting up TypeScript projects from scratch.

## Table of Contents

1. [Directory Structures](#directory-structures)
2. [Package Management](#package-management)
3. [TypeScript Configuration](#typescript-configuration)
4. [Tool Configurations](#tool-configurations)
5. [Build Configurations](#build-configurations)
6. [CI/CD Templates](#cicd-templates)
7. [Best Practices](#best-practices)

## Directory Structures

### Library/Package Structure

```
mylib/
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   ├── index.ts            # Main entry point
│   ├── core.ts
│   └── utils.ts
├── tests/
│   ├── core.test.ts
│   └── utils.test.ts
├── dist/                   # Build output (gitignored)
├── .gitignore
├── .prettierrc
├── eslint.config.js
├── tsconfig.json
├── tsconfig.build.json     # Separate config for builds
├── vitest.config.ts
├── package.json
├── README.md
└── LICENSE
```

**Key points:**
- Flat `src/` structure for libraries (easier consumption)
- Separate test files alongside or in `tests/`
- Dual package.json exports (ESM + CJS)
- Build artifacts in `dist/`

### Web Application Structure (React/Vue/Svelte)

```
webapp/
├── .github/
│   └── workflows/
│       └── ci.yml
├── public/                 # Static assets
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   └── About.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── utils/
│   │   └── helpers.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   └── e2e/                # E2E tests separate
│       └── homepage.spec.ts
├── .env.example
├── .gitignore
├── .prettierrc
├── eslint.config.js
├── tsconfig.json
├── vite.config.ts          # Or next.config.js, etc.
├── package.json
└── README.md
```

**Key points:**
- Component-based structure
- Co-locate tests with components or in `tests/`
- Separate `types/` for shared types
- Environment-based configuration

### Backend API/Service Structure

```
api/
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   ├── routes/
│   │   ├── users.ts
│   │   └── posts.ts
│   ├── controllers/
│   │   ├── userController.ts
│   │   └── postController.ts
│   ├── services/
│   │   ├── userService.ts
│   │   └── postService.ts
│   ├── models/
│   │   ├── User.ts
│   │   └── Post.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── validation.ts
│   ├── config/
│   │   └── database.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts            # Server entry point
├── tests/
│   ├── unit/
│   │   └── services/
│   │       └── userService.test.ts
│   └── integration/
│       └── routes/
│           └── users.test.ts
├── dist/                   # Compiled output
├── .env.example
├── .gitignore
├── .prettierrc
├── eslint.config.js
├── tsconfig.json
├── package.json
├── Dockerfile
└── README.md
```

**Key points:**
- Layered architecture (routes → controllers → services)
- Separate unit and integration tests
- Environment configuration
- No build tool needed (run with tsx or bun)

### CLI Tool Structure

```
mycli/
├── .github/
│   └── workflows/
│       └── release.yml
├── src/
│   ├── commands/
│   │   ├── init.ts
│   │   └── build.ts
│   ├── utils/
│   │   └── logger.ts
│   ├── types/
│   │   └── index.ts
│   ├── cli.ts              # CLI parser
│   └── index.ts            # Entry point
├── tests/
│   └── commands/
│       └── init.test.ts
├── bin/
│   └── mycli               # Executable (post-build)
├── dist/                   # Compiled output
├── .gitignore
├── .prettierrc
├── eslint.config.js
├── tsconfig.json
├── package.json
└── README.md
```

**Key points:**
- Command-based structure
- Bin script for executable
- Build to single file or directory
- Include shebang in bin script

## Package Management

### Using pnpm (Recommended)

**Initialize project:**
```bash
pnpm init
```

**package.json:**
```json
{
  "name": "myproject",
  "version": "0.1.0",
  "description": "Project description",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "ci": "pnpm lint && pnpm type-check && pnpm test"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "vitest": "^1.0.4"
  },
  "dependencies": {}
}
```

**Common commands:**
```bash
# Install dependencies
pnpm install

# Add dependencies
pnpm add packagename
pnpm add -D packagename  # Dev dependency

# Remove dependency
pnpm remove packagename

# Update dependencies
pnpm update

# Run scripts
pnpm dev
pnpm build
pnpm test
```

### Using Bun (Fastest)

**Initialize project:**
```bash
bun init
```

**package.json similar to pnpm, but with bun-specific features:**
```json
{
  "name": "myproject",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "bun --watch src/index.ts",
    "build": "bun build src/index.ts --outdir dist --target node",
    "test": "bun test",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "^5.3.3"
  }
}
```

**Common commands:**
```bash
bun install
bun add packagename
bun add -d packagename
bun run dev
bun test
```

## TypeScript Configuration

### tsconfig.json (Library)

```json
{
  "compilerOptions": {
    // Language & Environment
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",

    // Emit
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "removeComments": true,

    // Type Checking
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,

    // Interop Constraints
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,

    // Skip Lib Check
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### tsconfig.json (Application - Node.js)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,

    "outDir": "./dist",
    "rootDir": "./src",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,

    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### tsconfig.json (Web Application - React)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**tsconfig.node.json (for Vite config):**
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

## Tool Configurations

### ESLint

**eslint.config.js (Flat Config - Modern):**
```javascript
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  prettierConfig,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    ignores: ['dist', 'node_modules', 'coverage'],
  },
  {
    rules: {
      // TypeScript specific
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
    },
  }
);
```

**For React projects, add:**
```javascript
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default tseslint.config(
  // ... previous config
  reactPlugin.configs.flat.recommended,
  {
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/prop-types': 'off', // Using TypeScript
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  }
);
```

**Install dependencies:**
```bash
pnpm add -D eslint @eslint/js typescript-eslint eslint-config-prettier

# For React
pnpm add -D eslint-plugin-react eslint-plugin-react-hooks
```

### Prettier

**.prettierrc:**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**.prettierignore:**
```
dist
node_modules
coverage
.next
build
*.min.js
pnpm-lock.yaml
package-lock.json
```

**Install:**
```bash
pnpm add -D prettier
```

### Vitest (Testing)

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // or 'jsdom' for browser
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.config.*',
      ],
    },
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**For React/DOM testing:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
});
```

**tests/setup.ts:**
```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

**Example test:**
```typescript
import { describe, it, expect } from 'vitest';
import { add } from './math';

describe('add', () => {
  it('should add two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('should handle negative numbers', () => {
    expect(add(-1, 1)).toBe(0);
  });
});
```

**Install:**
```bash
# Basic
pnpm add -D vitest

# For React testing
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

## Build Configurations

### Vite (Frontend Applications)

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

### tsup (Libraries)

**tsup.config.ts:**
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  treeshake: true,
});
```

**For CLI tools:**
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  dts: false,
  splitting: false,
  sourcemap: false,
  clean: true,
  minify: true,
  shims: true, // Add Node.js shims
  banner: {
    js: '#!/usr/bin/env node',
  },
});
```

**Install:**
```bash
pnpm add -D tsup
```

### No Build Tool (tsx/bun for development)

**package.json:**
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

**Install:**
```bash
pnpm add -D tsx
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
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm type-check

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm build

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

**For publishing to npm:**
```yaml
name: Publish

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          registry-url: 'https://registry.npmjs.org'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Publish to npm
        run: pnpm publish --no-git-checks
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Best Practices

### .gitignore

```gitignore
# Dependencies
node_modules/

# Build outputs
dist/
build/
.next/
out/

# Testing
coverage/

# Environment
.env
.env.local
.env.*.local

# Editor
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Misc
.turbo
.vercel
```

### README.md Template

```markdown
# Project Name

Brief description of what this project does.

## Installation

```bash
pnpm install
```

## Usage

```typescript
import { myFunction } from 'myproject';

const result = myFunction();
```

## Development

```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Lint
pnpm lint

# Format
pnpm format

# Type check
pnpm type-check

# Build
pnpm build
```

## Scripts

- `dev` - Start development server
- `build` - Build for production
- `test` - Run tests
- `lint` - Lint code
- `format` - Format code
- `type-check` - Check TypeScript types

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `pnpm ci` to ensure everything passes
5. Commit and push
6. Open a Pull Request

## License

MIT
```

### Common Patterns

**1. Path aliases:**

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

**vite.config.ts:**
```typescript
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
});
```

**2. Environment variables:**

**.env.example:**
```
VITE_API_URL=http://localhost:3000/api
VITE_API_KEY=your_api_key_here
DATABASE_URL=postgresql://localhost:5432/mydb
```

**Usage (Vite):**
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

**Usage (Node.js with dotenv):**
```typescript
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL;
```

**3. Husky for git hooks:**

```bash
pnpm add -D husky lint-staged

# Initialize
pnpm exec husky init
```

**.husky/pre-commit:**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
```

**package.json:**
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

**4. Type-safe environment variables:**

**src/env.ts:**
```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  API_URL: z.string().url(),
  API_KEY: z.string().min(1),
  PORT: z.coerce.number().default(3000),
});

export const env = envSchema.parse(process.env);
```

### Common Gotchas

**1. Module resolution issues:**
```json
// Use "bundler" for modern projects
{
  "compilerOptions": {
    "moduleResolution": "bundler"  // Not "node"
  }
}
```

**2. .js imports in TypeScript:**
```typescript
// Don't include .ts extension
import { foo } from './foo';  // ✓ Correct
import { foo } from './foo.ts';  // ✗ Wrong
```

**3. Default exports vs named exports:**
```typescript
// Prefer named exports for tree-shaking
export const myFunction = () => {};  // ✓ Good
export default myFunction;  // ✗ Avoid for libraries
```

**4. Type imports:**
```typescript
// Use type imports for types
import type { User } from './types';  // ✓ Good
import { User } from './types';  // Works but less clear
```

**5. Async functions in tests:**
```typescript
// Always return promises or use async/await
it('async test', async () => {
  const result = await fetchData();
  expect(result).toBe('data');
});
```

### Quick Start Script

**scripts/create-project.sh:**
```bash
#!/bin/bash

PROJECT_NAME=${1:-myproject}

echo "Creating TypeScript project: $PROJECT_NAME"

# Create directory
mkdir "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Initialize
pnpm init

# Create directories
mkdir -p src tests

# Create basic files
cat > src/index.ts << 'EOF'
export const greet = (name: string): string => {
  return `Hello, ${name}!`;
};
EOF

cat > tests/index.test.ts << 'EOF'
import { describe, it, expect } from 'vitest';
import { greet } from '../src';

describe('greet', () => {
  it('should greet by name', () => {
    expect(greet('World')).toBe('Hello, World!');
  });
});
EOF

# Install dependencies
pnpm add -D typescript @types/node
pnpm add -D eslint @eslint/js typescript-eslint eslint-config-prettier
pnpm add -D prettier
pnpm add -D vitest

# Initialize configs
pnpm tsc --init

echo "✓ Project created! Next steps:"
echo "1. Configure tsconfig.json"
echo "2. Add eslint.config.js"
echo "3. Add .prettierrc"
echo "4. Run: pnpm test"
```

Make executable:
```bash
chmod +x scripts/create-project.sh
./scripts/create-project.sh myproject
```
