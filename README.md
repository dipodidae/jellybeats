# Nuxt 4 Boilerplate with Nuxt UI

> A modern Nuxt 4 starter template, using [Nuxt UI](https://ui.nuxt.com/) instead of UnoCSS. This boilerplate is designed for rapid prototyping and production-ready Nuxt apps, with batteries included and sensible defaults.

**Repo:** [github.com/dipodidae/nuxt4-boilerplate-nuxt-ui](https://github.com/dipodidae/nuxt4-boilerplate-nuxt-ui)

## Features

- 💚 [Nuxt 4](https://nuxt.com/) — SSR, file-based routing, auto-imported components, and more
- ⚡️ Vite — Fast HMR and build
- 🎨 [Nuxt UI](https://ui.nuxt.com/) — Beautiful, customizable UI components for Nuxt
- 🔥 `<script setup>` syntax
- 🍍 [Pinia](https://github.com/vuejs/pinia) — State management
- 📑 Layout system
- 📥 Auto-imported APIs for Composition API, VueUse, and custom composables
- 🏎 Zero-config serverless functions (Nitro)
- 🦾 TypeScript-first
- 📲 [PWA](https://github.com/vite-pwa/nuxt) with offline support and auto-update
- 🧹 ESLint and code quality tools pre-configured
- 🎨 [ESLint Tailwind CSS](https://github.com/francoismassart/eslint-plugin-tailwindcss) — Tailwind CSS best practices and class ordering
- 🚀 [Commitlint](https://commitlint.js.org/) — Conventional commit messages with git hooks
- 🪝 [Husky](https://typicode.github.io/husky/) — Git hooks for automated quality checks

## Plugins & Modules

- [Nuxt UI](https://ui.nuxt.com/) — UI components
- [Pinia](https://github.com/vuejs/pinia) — Store
- [VueUse](https://github.com/vueuse/vueuse) — Useful composition utilities
- [VitePWA](https://github.com/vite-pwa/nuxt) — PWA support
- [Nuxt DevTools](https://github.com/nuxt/devtools) — Enhanced DX
- [ESLint](https://eslint.org/) — Linting
- [ESLint Tailwind CSS](https://github.com/francoismassart/eslint-plugin-tailwindcss) — Tailwind CSS linting
- [Commitlint](https://commitlint.js.org/) — Conventional commits
- [Husky](https://typicode.github.io/husky/) — Git hooks

## IDE

We recommend [VS Code](https://code.visualstudio.com/) with [Volar](https://github.com/johnsoncodehk/volar) for the best experience. (Disable [Vetur](https://vuejs.github.io/vetur/) if you have it.)

## Usage

### Online

### Clone to local

To start a new project with this boilerplate:

```bash
npx degit dipodidae/nuxt4-boilerplate-nuxt-ui my-nuxt-app
cd my-nuxt-app
pnpm i # Or npm install -g pnpm && pnpm i
```

Or just copy this repo and start hacking!

## Development

### Commit Messages

This project uses [Commitlint](https://commitlint.js.org/) with [Conventional Commits](https://www.conventionalcommits.org/) to enforce consistent commit messages.

Examples of valid commit messages:

````bash
feat: add new counter store example
fix: resolve pageview API response type
docs: update README with commitlint info
style: format code with prettier
refactor: simplify component structure
<div align="center">

## Jellyfin Music

Lightweight, installable web player for your Jellyfin music library – fast playlist browsing, clean playback UI, and minimal abstraction.

</div>

---

### Why?
The full Jellyfin UI is powerful but heavy for quick music listening. Jellyfin Music focuses purely on audio:

* Instant playlists grid
* Fast track listing & playback
* PWA install (mobile / desktop)
* Zero exposed API key in the client

### Core Idea
Keep a thin, typed bridge to the Jellyfin API and let the browser do the work. No re-wrapping of types, no custom fetch layers, no over-engineered state. One small player store + direct OpenAPI-driven calls.

### Tech Stack
* Nuxt 4 (SSR / Islands)
* TypeScript
* Pinia (player + minimal global state)
* Nuxt UI (layout + components)
* `nuxt-api-party` (typed Jellyfin API proxy)
* VitePWA (installable shell)

### Data Fetching Pattern (Required)
Use `useJellyfinData` exactly like `useFetch`. No wrappers, no derived `pending` refs, no custom type aliases.

```vue
<script setup lang="ts">
const userId = useRuntimeConfig().public.jellyfinUserId
// List playlists
const { data, status, error } = await useJellyfinData('/Items', {
  query: { userId, includeItemTypes: ['Playlist'], sortBy: ['SortName'], recursive: true },
})
// Single playlist
const { data: playlist } = await useJellyfinData('/Items/{itemId}', {
  path: { itemId: 'PLAYLIST_ID' },
  query: { userId },
})
// Tracks in playlist
const { data: tracks } = await useJellyfinData('/Playlists/{playlistId}/Items', {
  path: { playlistId: 'PLAYLIST_ID' },
  query: { userId },
})
</script>
````

### Key Endpoints Used

| Purpose           | Jellyfin Endpoint                                   |
| ----------------- | --------------------------------------------------- |
| List playlists    | `GET /Items` (filters: `includeItemTypes=Playlist`) |
| Playlist metadata | `GET /Items/{itemId}`                               |
| Playlist tracks   | `GET /Playlists/{playlistId}/Items`                 |
| Stream audio      | `GET /api/stream/:id` (proxy in this app)           |
| Images            | Proxied through `/api/image/:id` (server route)     |

### Player Model

Single Pinia store (`player`) manages:

- Current track
- Queue (sequential or shuffled)
- Playback state & progress (HTMLAudioElement internally)
- Derived duration (fallback to `RunTimeTicks` when needed)

### Environment Variables

Create `.env`:

```
NUXT_JELLYFIN_URL=https://your-jellyfin.example
NUXT_JELLYFIN_API_KEY=changeme-api-key
NUXT_JELLYFIN_USER_ID=changeme-user-id
NUXT_API_PARTY_ENDPOINTS_JELLYFIN_URL=https://your-jellyfin.example
```

The API key is injected server-side only (never shipped to client bundles).

### Development

```bash
pnpm install
pnpm dev
```

Visit `http://localhost:3000`.

### Architectural Principles

1. Direct OpenAPI paths – use placeholders (`/Items/{itemId}`) + `path: {}`.
2. No re-defined Jellyfin types – rely on generated `components['schemas'][...]` when necessary (or `any` sparingly at view layer boundaries).
3. Stateless UI components; shared logic in Pinia or small `utils/` helpers.
4. Avoid premature abstraction; extract only after a second usage pattern appears.
5. Small network footprint: only fetch what the page shows.

### Contributing

- Follow the lean fetch pattern above.
- Conventional commits: `feat:`, `fix:`, `refactor:`, etc.
- Don’t add caching layers or wrappers unless there’s a demonstrated need.
- Don’t leak or log real env values.

### Roadmap (Aspirational)

- Search (playlists + tracks)
- Offline track caching (PWA partial sync)
- Recently played & basic listening stats
- Theming / dark mode refinements
- Range / partial content streaming improvements

### Troubleshooting

| Issue             | Check                                                        |
| ----------------- | ------------------------------------------------------------ |
| Empty playlists   | Ensure `NUXT_JELLYFIN_USER_ID` matches a valid Jellyfin user |
| 401 / 403 errors  | API key validity & server CORS / reverse proxy headers       |
| Images missing    | Confirm `/api/image/:id` route & Jellyfin image availability |
| Audio not playing | Browser autoplay policy (first interaction required)         |

### Security Notes

- API key never exposed client-side.
- Only read operations (except streaming) – no library mutation endpoints included.
- Sanitize any future user-input before injecting into queries.

### License

MIT – see `LICENSE`.

---

Built to make Jellyfin music playback feel instant and focused. Enjoy. 🎧
