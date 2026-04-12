# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # TypeScript compile + Vite production build
npm run lint      # ESLint across the project
npm run preview   # Preview production build locally
```

There is no test runner configured in this project.

Docker alternative:
```bash
docker-compose up  # Dev server in container on port 5173
```

Environment variables required (`.env`):
- `VITE_API_URL` — backend API base URL (used by `src/components/api/base.tsx`)
- `VITE_TRAIN_API_URL` — training service base URL

## Architecture

**Stack:** React 18 + TypeScript + Vite, React Router v7, TanStack React Query, Zustand, Tailwind CSS, Radix UI.

### Routing

`App.tsx` defines all routes. The structure is:
- `PublicRoute` → `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/callback`
- `ProtectedRoute` → everything else, wrapped in `<Layout>`
  - `/projects/:projectId/*` routes are further wrapped in `<ProjectProvider>` + `<ProjectLayout>`
  - `/projects/:projectId/images/:imageId` renders the full-screen annotation tool (`<Index>`) outside of `<Layout>`

### State Management — Three Layers

1. **React Query** (`QueryClient` in `App.tsx`) — all server state. Nearly every feature has a dedicated hook in `src/hooks/` that wraps a React Query `useQuery` or `useMutation`.

2. **React Context** (`src/contexts/`) — cross-cutting app state:
   - `AuthContext` — user, tokens, org switching, OAuth flows
   - `ProjectContext` — current `projectId` within project routes
   - `AnnotationContext`, `UploadContext`, `ClassesContext`, `ImageContext` — annotation tool state

3. **Zustand** (`src/stores/similarityStore.ts`) — local UI state for the similarity scan feature (upload clusters, selection, lightbox).

### API Layer

All authenticated requests go through `apiFetch()` in `src/services/apiClient.ts`:
- Prepends `baseURL` and injects `Authorization: Bearer <token>` automatically
- On 401: attempts one silent token refresh, then retries. If refresh fails, `logout()` is called internally.
- `AuthContext` wires in the refresh handler once on mount via `setApiClientRefreshHandler(refreshToken)`.
- Do **not** use bare `fetch()` for authenticated endpoints — always use `apiFetch()`.

Token lifecycle is managed in `src/services/authService.ts`: `authStorage` reads/writes tokens to `localStorage`, and a timer refreshes the token 5 minutes before expiry.

### Adding New Features

The established pattern for a new data-fetching feature:
1. Add TypeScript types in `src/types/`
2. Create a hook in `src/hooks/` using `useQuery`/`useMutation` + `apiFetch()`
3. Build the page component in `src/pages/<feature>/`
4. Register the route in `App.tsx`

For features needing shared UI state beyond React Query cache, add a Zustand store in `src/stores/`.

### Dark Mode

Tailwind is configured with `darkMode: 'class'`. The full custom color palette (primary, secondary, sidebar, role-based, chart colors, etc.) is defined in `tailwind.config.ts`. Always use semantic Tailwind tokens rather than hardcoded colors to support both themes.

### Path Aliases

`@/` resolves to `src/` (configured in both `tsconfig.json` and `vite.config.ts`).
