# Experiments2 Monorepo

A monorepo setup using pnpm workspaces for managing multiple packages and applications.

## Structure

```
experiments2/
├── apps/                    # Applications
│   ├── web-app/            # Web application
│   └── cli-app/            # CLI application
├── libs/                    # Shared libraries
│   └── utils/              # Common utilities
├── packages/                # Additional packages
├── package.json            # Root package.json
├── pnpm-workspace.yaml    # Workspace configuration
└── README.md              # This file
```

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## Installation

1. Install pnpm globally (if not already installed):

   ```bash
   npm install -g pnpm
   ```

2. Install all dependencies:
   ```bash
   pnpm install
   ```

## Available Scripts

### Root Level Scripts

- `pnpm dev` - Run development mode for all packages
- `pnpm build` - Build all packages
- `pnpm test` - Run tests for all packages
- `pnpm lint` - Lint all packages
- `pnpm clean` - Clean build outputs for all packages
- `pnpm install:all` - Install all dependencies

### Package Level Scripts

Each package has its own scripts:

- `dev` - Development mode with watch
- `build` - Build the package
- `test` - Run tests
- `lint` - Lint the package
- `clean` - Clean build outputs

## Development

### Adding a New Package

1. Create a new directory in `apps/`, `libs/`, or `packages/`
2. Add a `package.json` with a unique name (prefixed with `@experiments2/`)
3. Use `workspace:*` for internal dependencies
4. Run `pnpm install` to update the workspace

### Example Package Structure

```json
{
  "name": "@experiments2/my-package",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsc --watch",
    "build": "tsc",
    "test": "echo \"No tests specified\"",
    "lint": "eslint src --ext .ts",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@utils": "workspace:*"
  }
}
```

### Working with Dependencies

- **Internal dependencies**: Use `workspace:*` to reference other packages in the monorepo
- **External dependencies**: Install normally with `pnpm add <package>`
- **Dev dependencies**: Use `pnpm add -D <package>`

## Building and Running

### Build all packages

```bash
pnpm build
```

### Run development mode for all packages

```bash
pnpm dev
```

### Run a specific package

```bash
cd apps/web-app
pnpm dev
```

### Run the CLI app

```bash
cd apps/cli-app
pnpm build
node dist/index.js "Hello World"
```

## Workspace Configuration

The workspace is configured in `pnpm-workspace.yaml`:

```yaml
packages:
  - "packages/*"
  - "apps/*"
  - "libs/*"
  - "!**/test/**"
```

This includes all packages in:

- `packages/` directory
- `apps/` directory
- `libs/` directory
- Excludes test directories

## Best Practices

1. **Package naming**: Use `@experiments2/` prefix for all internal packages
2. **Dependencies**: Use `workspace:*` for internal dependencies
3. **Scripts**: Keep script names consistent across packages
4. **TypeScript**: Use consistent TypeScript configuration
5. **Testing**: Add tests for each package
6. **Documentation**: Document each package's purpose and API

## Troubleshooting

### Common Issues

1. **Module not found errors**: Make sure the package is built and dependencies are installed
2. **TypeScript errors**: Check that all packages are built and types are generated
3. **Workspace issues**: Run `pnpm install` to refresh workspace dependencies

### Clean Start

If you encounter issues, try a clean start:

```bash
rm -rf node_modules
rm -rf */node_modules
rm pnpm-lock.yaml
pnpm install
```
