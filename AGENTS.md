# Repository Guidelines

## Project Structure & Module Organization
This is a Next.js (App Router) + TypeScript frontend.

- `app/`: route entrypoints and global app wrappers (`layout.tsx`, `page.tsx`, `globals.css`).
- `components/futprof/`: feature UI for the FutProf flows.
- `components/ui/`: reusable UI primitives (Radix/shadcn-style components).
- `lib/`: shared logic (`services/`, context, env parsing, utilities, types).
- `hooks/`: reusable React hooks.
- `docs/`: backend API contracts and integration notes.
- `public/`: static assets.

Keep business logic in `lib/services` and keep components focused on rendering and interaction.

## Build, Test, and Development Commands
Use `pnpm` (lockfile is `pnpm-lock.yaml`).

- `pnpm install`: install dependencies.
- `pnpm dev`: start local dev server (Next.js).
- `pnpm build`: production build.
- `pnpm start`: run the production build.
- `pnpm lint`: run ESLint across the repo.

Before opening a PR, run at least `pnpm lint` and `pnpm build`.

## Coding Style & Naming Conventions
- Language: TypeScript with `strict` enabled in `tsconfig.json`.
- Indentation: 2 spaces; keep semicolon-less style consistent with existing files.
- Components: PascalCase exports/files for feature components (example: `AppShell`).
- Hooks/utilities: camelCase function names; hook files prefixed with `use-`.
- Use path alias imports via `@/*` for internal modules.

Prefer small, composable components and colocate feature-specific UI under `components/futprof`.

## Testing Guidelines
There is no test runner configured yet and no test suite in this snapshot.

When adding tests, prefer:
- Unit tests: `*.test.ts` / `*.test.tsx` next to source or in `__tests__/`.
- Keep tests deterministic and focused on user-visible behavior.
- Add a `test` script in `package.json` in the same PR that introduces the first test framework.

## Commit & Pull Request Guidelines
Git history is not available in this directory (`.git` is missing), so no local commit convention can be inferred.

Use Conventional Commits going forward (examples: `feat: add cart summary`, `fix: handle missing token`).

PRs should include:
- Clear summary of user-facing change.
- Linked issue/task ID when applicable.
- Screenshots or short video for UI changes.
- Notes on env/config changes (for example, `NEXT_PUBLIC_API_BASE_URL`).
