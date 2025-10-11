# Contributing to PathWatch

## Monorepo Structure

This project uses a monorepo architecture with Turborepo. All packages are located in:
- `apps/*` - Applications (collector, console, query)
- `tinybird/` - Analytics pipeline configuration

## Development Workflow

### 1. Install Dependencies

From the root directory:

```bash
bun install
```

This will install dependencies for all packages in the workspace.

### 2. Running in Development

Run all apps:
```bash
bun run dev
```

Run a specific app:
```bash
bun run collector:dev
bun run console:dev
bun run query:dev
```

### 3. Building

Build all packages:
```bash
bun run build
```

### 4. Testing

Run tests:
```bash
bun run test
```

### 5. Code Formatting

Format code with Prettier:
```bash
bun run format
```

## Adding Dependencies

### To a specific package
```bash
cd apps/collector
bun add <package-name>
```

### To the root (for shared dev dependencies)
```bash
bun add -D <package-name> -w
```

## Creating a New Package

1. Create a new directory in `apps/`
2. Add a `package.json` with a unique name
3. The workspace will automatically detect it

## Commit Guidelines

- Use clear, descriptive commit messages
- Reference issue numbers when applicable
- Keep commits focused and atomic

## Pull Request Process

1. Create a feature branch from `master`
2. Make your changes
3. Ensure all tests pass
4. Format your code
5. Submit a PR with a clear description
