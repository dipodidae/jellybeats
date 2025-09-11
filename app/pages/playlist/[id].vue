<script setup lang="ts">
import type { JellyfinItemsResponse, JellyfinTrack } from '../../types/jellyfin'
import { useRoute } from 'vue-router'

const route = useRoute()
const id = computed(() => route.params.id as string)

// Jellyfin playlist items endpoint: /Playlists/{id}/Items
// @ts-expect-error provided by nuxt-api-party runtime
const { data, error, status } = await useJellyfinData<JellyfinItemsResponse<JellyfinTrack>>(
  () => `Playlists/${id.value}/Items`,
  { query: { UserId: useRuntimeConfig().public.jellyfinUserId } },
)

const pending = computed(() => status.value === 'pending')
const currentTrack = ref<JellyfinTrack | null>(null)

function play(track: JellyfinTrack) {
  currentTrack.value = track
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
    <div v-if="pending">
      Loading tracks…
    </div>
    <UAlert v-else-if="error" color="error" title="Failed to load playlist" :description="error?.data?.statusMessage || error.message" />
    <div v-else class="grid gap-4 lg:grid-cols-3">
      <div class="space-y-2 lg:col-span-2">
        <UCard v-for="track in data?.Items" :key="track.Id" class="hover:border-primary cursor-pointer p-3" @click="play(track)">
          <div class="flex items-center justify-between gap-3">
            <div class="truncate text-sm">
              {{ track.Name }}
            </div>
            <UButton size="2xs" variant="ghost" @click.stop="play(track)">
              Play
            </UButton>
          </div>
        </UCard>
        <div v-if="!data?.Items?.length" class="text-sm opacity-60">
          No tracks.
        </div>
      </div>
      <div v-if="currentTrack" class="sticky top-4">
        <Player :track-id="currentTrack.Id" :title="currentTrack.Name" />
      </div>
    </div>
  </div>
</template>
