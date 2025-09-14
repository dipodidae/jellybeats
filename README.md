# Jellyfin Music 🎵

A lightweight Nuxt 4 web app for listening to your Jellyfin music library.
Built because the default Jellyfin web client doesn’t allow **public sharing of playlists** – this project adds a fast, focused player for audio only.

## Features

- 🚀 Instant playlist browsing (direct Jellyfin API calls)
- 🎶 Simple, clean playback UI (queue, shuffle, progress)
- 📱 Installable as a PWA (mobile & desktop)
- 🔒 API key is server-side only (never exposed)
- 🎨 Built with [Nuxt UI](https://ui.nuxt.com/)

## Tech Stack

- Nuxt 4 (SSR + Islands)
- TypeScript
- Pinia (player state)
- Nuxt UI
- nuxt-api-party (typed Jellyfin API bridge)
- VitePWA

## Setup

Clone and install:

```bash
npx degit dipodidae/nuxt4-boilerplate-nuxt-ui jellyfin-music
cd jellyfin-music
pnpm install
pnpm dev
```

Create `.env`:

```env
NUXT_JELLYFIN_URL=https://your-jellyfin.example
NUXT_JELLYFIN_API_KEY=changeme-api-key
NUXT_JELLYFIN_USER_ID=changeme-user-id
NUXT_API_PARTY_ENDPOINTS_JELLYFIN_URL=https://your-jellyfin.example
```

Visit: [http://localhost:3000](http://localhost:3000)

## Usage Example

```vue
<script setup lang="ts">
const userId = useRuntimeConfig().public.jellyfinUserId

// Fetch playlists
const { data: playlists } = await useJellyfinData('/Items', {
  query: { userId, includeItemTypes: ['Playlist'], sortBy: ['SortName'], recursive: true },
})

// Fetch tracks in a playlist
const { data: tracks } = await useJellyfinData('/Playlists/{playlistId}/Items', {
  path: { playlistId: 'PLAYLIST_ID' },
  query: { userId },
})
</script>
```
