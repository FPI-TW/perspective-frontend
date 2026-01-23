# Repository Guidelines

## Development Principles

- Always discuss with me before making changes if you need more information.
- Always explain the reason the impact of the change when making a big or complex change.
- Always run `pnpm format`, `pnpm type-check` and `pnpm lint:check` when finishing a task.
- Never modify the part of the code that is not related to the current task if you think it is necessary, discuss with me.
- Never use git commands except i ask, if you think it is necessary, discuss with me.

## Branching & commits

- 一律從 main 切 feature branch：feat/<topic> 或 fix/<topic>
- 每個任務至少 1 個 commit，訊息格式：<type>: <summary>
- 禁止直接改 main

## Commands to validate changes

- JS/TS: pnpm lint && pnpm test
- 變更前後都要看 git diff --staged，確保沒有混入無關變更

## Commands to validate changes (required before commit)

- 必跑：pnpm format -> pnpm lint:check -> pnpm type-check
- 若任一失敗：先修到通過再 commit
- commit 前必看：git diff --staged（確保無混入變更）

## Git workflow

- 從 main 切 feat/_ 或 fix/_ 分支
- 允許在分支上 commit（可多次小 commit）
- 禁止直接改 main（用 PR 合併）

## Task rules

- 如果任務規模大，將任務差分成多個commit，確保能夠review / reset / revert。
- 完成commit並合併到main，才算玩成任務。

## Project Structure & Module Organization

- App router in `app/` (pages, layouts, styles like `app/globals.css`).
- Static assets in `public/`.
- Build artifacts in `.next/`. Node modules in `node_modules/`.
- Config: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `.prettierrc.json`.
- Use path alias `@/*` (maps to repo root) for imports, e.g. `import Foo from '@/components/Foo'`.
- Never modify file in `.next/` or `node_modules/` folder.
- Always discuss with me before modify file in `@/components/ui` folder.

## Build, Test, and Development Commands

- `pnpm dev` — Run Next.js dev server with Turbopack at `http://localhost:3000`.
- `pnpm build` — Production build with Turbopack.
- `pnpm start` — Start the production server (after build).
- `pnpm lint` / `pnpm lint:check` — ESLint (zero warnings allowed in CI-style check).
- `pnpm format` / `pnpm format:check` — Prettier write/check.
- `pnpm type-check` — TypeScript type checking (no emit).
- `pnpm test` — Run tests.
- Pre-commit: Husky runs `pnpm type-check` then `pnpm lint:check`.
- Pre-push: Husky runs `pnpm type-check` then `pnpm lint:check` then `pnpm test`.
- Approve `pnpm format`, `pnpm type-check`, `pnpm lint:check` and `pnpm test` that can run without permission.

## Coding Style & Naming Conventions

- Language: TypeScript (strict mode). React 19 + Next.js App Router.
- Tailwind CSS v4 utilities permitted in JSX className strings.
- Use React-hook-form and zod for form validation.
- Use react-query for data fetching.
- Use zustand for global state management, however, we should avoid using it as much as possible.
- Do not use as to type cast as possible, transfer type to make sure type safety.

## Testing Guidelines

- No test runner is configured yet. When adding tests:
- Co-locate unit tests as `*.test.ts(x)` or use `__tests__/` next to source.
- Prefer Vitest + React Testing Library for components; Playwright for E2E.
- Aim for meaningful coverage on modules with logic (forms, data transforms).

## Security & Configuration Tips

- Store secrets in `.env.local` (never commit) and store public values in `.env`.
- Public values must be prefixed `NEXT_PUBLIC_`, example: `NEXT_PUBLIC_API_BASE=/api` in `.env`.
- Review `.prettierignore`/`.gitignore` before adding large assets.

## Architecture Overview

- Next.js App Router with server-first defaults; colocate UI, styles, and server actions under route folders in `app/`.
- Use `@/` imports for shared utilities and components to avoid long relative paths.

## Project Guidelines

- Desktop is priority, however, RWD is necessary.
- User experience is the first priority when designing UI.
- use snake case key of translation for json file of next-intl, folder `@/messages/*.json`.
- use snake case key of translation for json file of next-intl, folder `@/messages/*.json`.
- Use `common` key of translation for common text, such as button text, toast text, etc.
- Do not use useCallback unless neccessary, use less useMemo unless the caculation is complex or for readablity.
- Use `useDialog` hook to manage dialog open state and actions. like `const myDialog = useDialog()`, then `myDialog.open()` to open dialog, `myDialog.close()` to close dialog, `myDialog.toggle()` to toggle dialog.
