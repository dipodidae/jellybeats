<script setup lang="ts">
import type { components } from '#nuxt-api-party/jellyfin'
import { useRoute } from 'vue-router'
import { usePlayerStore } from '../../stores/player'

type JellyfinTrack = components['schemas']['BaseItemDto']
type JellyfinItemsResponse<T = any> = components['schemas']['BaseItemDtoQueryResult'] & { Items?: T[] }
interface RouteParams { id: string }

const route = useRoute()
const id = computed(() => (route.params as unknown as RouteParams).id)
const player = usePlayerStore()

// Fetch playlist details for title & image (use /Items/{id} for generic item lookup)
// @ts-expect-error runtime composable; path not in typed keys
const { data: playlistData, error: playlistError, status: playlistStatus } = await useJellyfinData<components['schemas']['BaseItemDto']>(
  () => `Items/${id.value}`,
  { query: { UserId: useRuntimeConfig().public.jellyfinUserId } },
)

// Fetch playlist tracks
// Jellyfin playlist items endpoint: /Playlists/{id}/Items
// @ts-expect-error runtime composable; path not in typed keys
const { data, error, status } = await useJellyfinData<JellyfinItemsResponse<JellyfinTrack>>(
  () => `Playlists/${id.value}/Items`,
  { query: { UserId: useRuntimeConfig().public.jellyfinUserId } },
)

// Cast to any to access Items because api-party generic ResT typing omits it
const playlist = computed(() => playlistData.value)
const items = computed(() => (data.value as any)?.Items as JellyfinTrack[] || [])

const pending = computed(() => status.value === 'pending' || playlistStatus.value === 'pending')

// Cover handled by MediaImage component now

// SEO meta
useSeoMeta({
  title: () => playlist.value?.Name ? `${playlist.value.Name} • Playlist` : 'Playlist',
  ogTitle: () => playlist.value?.Name || 'Playlist',
  description: () => `Tracks in playlist ${playlist.value?.Name || ''}`.trim(),
  ogDescription: () => `Tracks in playlist ${playlist.value?.Name || ''}`.trim(),
})

function play(track: JellyfinTrack) {
  player.playTrack(track, items.value)
}

function playAll() {
  if (items.value.length)
    player.playAll(items.value)
}

function playShuffle() {
  if (items.value.length)
    player.playAllShuffled(items.value)
}
</script>

<template>
  <UPage>
    <UPageHero
      orientation="horizontal"
      :title="(playlist as any)?.Name || (playlist as any)?.OriginalTitle || 'Playlist'"
      :description="items.length ? `${items.length} track${items.length === 1 ? '' : 's'}` : ''"
      :ui="{ title: 'text-left', description: 'text-left', links: 'justify-start' }"
    >
      <MediaImage
        v-if="playlist"
        :item="playlist as any"
        :alt="(playlist as any)?.Name || 'Playlist cover'"
        :width="300"
        :height="300"
        :quality="90"
        rounded="rounded-lg"
        class="ring-default aspect-square w-full max-w-[240px] shadow-2xl ring"
      />
      <template #links>
        <div class="flex gap-2 pt-2">
          <UButton size="sm" variant="solid" icon="i-carbon-play" :disabled="!items.length || pending" @click="playAll">
            Play All
          </UButton>
          <UButton size="sm" variant="soft" icon="i-carbon-shuffle" :disabled="!items.length || pending" @click="playShuffle">
            Shuffle
          </UButton>
        </div>
      </template>
    </UPageHero>
    <UPageSection :ui="{ container: '!pt-0' }">
      <div v-if="pending" class="py-8 text-sm opacity-75">
        Loading tracks…
      </div>
      <UAlert v-else-if="error || playlistError" color="error" title="Failed to load playlist" :description="(error || playlistError)?.data?.statusMessage || (error || playlistError)?.message" />
      <div v-else class="grid gap-4">
        <TrackCard
          v-for="track in items"
          :key="track.Id"
          :track="track"
          :active="player.current?.Id === track.Id"
          @play="play"
        />
        <div v-if="!items.length" class="text-sm opacity-60">
          No tracks.
        </div>
      </div>
    </UPageSection>
  </UPage>
</template>
