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

// Jellyfin playlist items endpoint: /Playlists/{id}/Items
// @ts-expect-error runtime composable; path not in typed keys
const { data, error, status } = await useJellyfinData<JellyfinItemsResponse<JellyfinTrack>>(
  () => `Playlists/${id.value}/Items`,
  { query: { UserId: useRuntimeConfig().public.jellyfinUserId } },
)

// Cast to any to access Items because api-party generic ResT typing omits it
const items = computed(() => (data.value as any)?.Items as JellyfinTrack[] || [])

const pending = computed(() => status.value === 'pending')

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
  <div class="space-y-4">
    <NuxtLink to="/playlists" class="text-primary text-sm hover:underline">
      ← All Playlists
    </NuxtLink>
    <h1 class="text-2xl font-bold">
      Playlist
    </h1>
    <div v-if="!pending" class="flex gap-2">
      <UButton size="sm" variant="solid" icon="i-carbon-play" :disabled="!items.length" @click="playAll">
        Play All
      </UButton>
      <UButton size="sm" variant="soft" icon="i-carbon-shuffle" :disabled="!items.length" @click="playShuffle">
        Shuffle Play
      </UButton>
    </div>
    <div v-if="pending">
      Loading tracks…
    </div>
    <UAlert v-else-if="error" color="error" title="Failed to load playlist" :description="error?.data?.statusMessage || error.message" />
    <div v-else class="grid gap-4 lg:grid-cols-3">
      <div class="space-y-2 lg:col-span-2">
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
    </div>
  </div>
</template>
