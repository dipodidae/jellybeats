<script setup lang="ts">
import { useRoute } from 'vue-router'
import { usePlayerStore } from '../../stores/player'

const route = useRoute()
const id = computed(() => String(route.params.id))
const userId = useRuntimeConfig().public.jellyfinUserId
const player = usePlayerStore()

// Details (BaseItemDto)
// Using string path (lean pattern; types may not include dynamic key -> cast as any)
const { data: playlist, error: playlistError, status: playlistStatus } = await useJellyfinData(
  () => `Items/${id.value}` as any,
  { query: { userId } },
)

// Tracks for playlist
const { data: tracksData, error, status } = await useJellyfinData(
  () => `Playlists/${id.value}/Items` as any,
  { query: { userId } },
)

const tracks = computed(() => (tracksData.value as any)?.Items || [])

useSeoMeta({
  title: () => (playlist.value as any)?.Name ? `${(playlist.value as any).Name} • Playlist` : 'Playlist',
})

function play(track: any) {
  player.playTrack(track, tracks.value)
}
function playAll() {
  if ((tracks.value as any[]).length)
    player.playAll(tracks.value)
}
function playShuffle() {
  if ((tracks.value as any[]).length)
    player.playAllShuffled(tracks.value)
}
</script>

<template>
  <UPage>
    <UPageHero
      orientation="horizontal"
      :title="(playlist as any)?.Name || (playlist as any)?.OriginalTitle || 'Playlist'"
      :description="tracks.length ? `${tracks.length} track${tracks.length === 1 ? '' : 's'}` : ''"
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
          <UButton size="sm" variant="solid" icon="i-carbon-play" :disabled="!tracks.length || status === 'pending'" @click="playAll">
            Play All
          </UButton>
          <UButton size="sm" variant="soft" icon="i-carbon-shuffle" :disabled="!tracks.length || status === 'pending'" @click="playShuffle">
            Shuffle
          </UButton>
        </div>
      </template>
    </UPageHero>
    <UPageSection :ui="{ container: '!pt-0' }">
      <div v-if="status === 'pending' || playlistStatus === 'pending'" class="py-8 text-sm opacity-75">
        Loading tracks…
      </div>
      <UAlert
        v-else-if="error || playlistError"
        color="error"
        title="Failed to load playlist"
        :description="((error || playlistError) as any)?.data?.statusMessage || (error || playlistError)?.message"
      />
      <div v-else-if="tracksData" class="grid gap-4">
        <TrackCard
          v-for="track in tracks"
          :key="track.Id"
          :track="track"
          :active="player.current?.Id === track.Id"
          @play="play"
        />
        <div v-if="!tracks.length" class="text-sm opacity-60">
          No tracks.
        </div>
      </div>
    </UPageSection>
  </UPage>
</template>
