# Jellyfin Music – GitHub Copilot Project Instructions

These instructions guide AI assistants (and humans) contributing to Jellyfin Music. Keep responses concise, avoid exposing secrets, and conform to existing conventions.

## 1. Project Purpose

A lightweight Nuxt 3 + PWA music UI for Jellyfin: browse playlists, view tracks, and stream audio through server endpoints that proxy Jellyfin media.

## 2. Tech Stack

- Framework: Nuxt 3 (Vue 3, Vite)
- Language: TypeScript
- State: Pinia (`stores/`)
- Styling: Basic CSS (`app/assets/css/main.css`), prefer utility-lean inline classes or minimal additions
- Server/API: Nuxt server routes in `server/api/**` (file-based API endpoints)
- PWA: Config in `app/config/pwa.ts`, icons in `public/`
- Build/Deploy: Netlify (`netlify.toml`), Dockerfile present

## 3. Directory Overview

```
app/
  components/        # UI components (stateless where possible)
  layouts/           # Nuxt layouts
  pages/             # Route pages
  stores/            # Pinia stores
  utils/             # Pure utility functions
  config/            # App-specific config objects (e.g., PWA)
server/api/          # Server endpoints (Jellyfin proxying / streaming)
server/plugins/      # Server plugins (e.g., API party integration)
types/               # Global/shared type declarations
public/              # Static assets & PWA icons
```

## 4. Environment Variables (Do NOT leak real values)

Use placeholders in examples:

```
NUXT_JELLYFIN_URL=https://your-jellyfin.example
NUXT_JELLYFIN_API_KEY=changeme-api-key
NUXT_JELLYFIN_USER_ID=changeme-user-id
NUXT_UI_PRO_LICENSE=optional-license-or-remove
```

Never commit real secrets. If found, advise rotation.

## 5. Coding Conventions

- Prefer Composition API `<script setup lang="ts">`
- Keep components focused; lift state to Pinia when shared
- Avoid unnecessary abstraction until >2 callers exist
- Type everything (return types for exported functions, store state interfaces)
- Use small utility pure functions in `utils/`
- Use `defineStore` for Pinia; expose minimal public actions
- Time formatting handled via `utils/time.ts` – reuse instead of recreating
- Import order: Vue/nuxt first, third-party, local (`@/` alias), then relative

## 6. API Route Patterns (`server/api`)

- File naming: `resource/[id].get.ts` for GET by id, plain `resource.get.ts` for list endpoints
- Export default async function `(event)` using Nuxt event utilities
- Use `getRouterParam(event,'id')` (or `event.context.params`) for params
- Wrap remote calls; never expose upstream raw errors—map to a safe JSON shape
- Stream endpoints (audio) should set appropriate headers and pipe response

## 7. Error Handling

- Fail fast on missing critical env vars (validate once on startup if adding new code)
- Normalize error payload: `{ error: { message: string, code?: string } }`
- Avoid leaking stack traces to clients

## 8. Performance & UX

- Lazy-load large lists (pagination or incremental fetch if adding bigger views)
- Keep initial payload small; defer non-essential API calls until interaction
- Debounce rapid search-like inputs (250ms typical)

## 9. State Management Guidelines

Pinia store structure example:

```
export const usePlayerStore = defineStore('player', {
  state: () => ({ currentTrack: null as Track | null, queue: [] as Track[], playing: false }),
  actions: {
    play(track: Track) { /* ... */ },
    enqueue(track: Track) { /* ... */ }
  }
})
```

Expose only what UI needs. Derive display-ready values via getters not duplicated in components.

## 10. PWA Notes

- Modify PWA manifest via `app/config/pwa.ts`
- Icons live in `public/`; ensure 192 & 512 sizes retained
- If adding offline caching, prefer workbox plugin; keep strategy explicit

## 11. Testing Guidance

(If adding tests) Suggest introducing Vitest:

- Install: `pnpm add -D vitest @vitest/ui @vue/test-utils` (only after consensus)
- Place tests in `tests/` mirroring structure or alongside files with `.spec.ts`
- Test: utilities (pure functions), store logic, and API handlers

## 12. Security & Secrets

- Never log raw API keys
- If adding auth layers, centralize in a single composable or server plugin
- Sanitize any user-provided strings before using in queries/URLs

## 13. Adding New Components

Checklist:

1. Determine if a store change is needed
2. Create component in `app/components/` with PascalCase
3. Add minimal props + `defineEmits` as needed
4. Reuse existing styling patterns (avoid global CSS growth)
5. Add accessibility attributes (aria-\* where relevant)

## 14. Adding New API Endpoint

1. Create file under `server/api/<resource>.get.ts` (or `[id].get.ts`)
2. Fetch from Jellyfin using existing plugin/client (see `plugins/api-party-jellyfin.ts`)
3. Map upstream JSON to a trimmed shape consumed by frontend
4. Handle errors with standardized payload
5. Add types in `types/` if new shapes introduced

## 15. Types & Declarations

- Extend global types in `types/` only if reused across >1 module
- Use discriminated unions for variant states (e.g., loading/error/data)

## 16. Commit & PR Guidelines

- Conventional commits if possible (`feat:`, `fix:`, `refactor:`)
- One logical change per PR
- Include short description of motivation + before/after if UI

## 17. AI Assistant Response Style

- Be concise; avoid restating obvious file structure
- Suggest concrete file edits referencing exact paths
- Never output secret env values; replace with placeholders
- Provide patches (not entire unrelated file content) when editing

## 18. Common Pitfalls

- Duplicating time formatting logic – use `utils/time.ts`
- Over-fetching playlist data repeatedly – introduce caching if necessary
- Coupling components directly to raw API responses – map to view models in stores

## 19. Roadmap Ideas (Optional Enhancements)

- Search across playlists/tracks
- Offline playback caching
- Theming / dark-mode toggle

## 20. When Unsure

Make a reasonable assumption, document it briefly in the PR/response, and proceed rather than stalling.

---

Last updated: 2025-09-11
