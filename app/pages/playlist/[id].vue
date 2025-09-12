<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useProvidePlaylistContext } from '../../composables/usePlaylistContext'
import { usePlayerStore } from '../../stores/player'

const route = useRoute('playlist-id')
const itemId = computed(() => String(route.params.id))
const userId = useRuntimeConfig().public.jellyfinUserId

const { data: playlist, error: playlistError } = await useJellyfinData(
  '/Items/{itemId}',
  {
    path: { itemId: itemId.value },
    query: { userId },
  },
)

// Provide playlist context (scoped to this page subtree)
const { trackCount, tracksStatus, tracks } = useProvidePlaylistContext()
const player = usePlayerStore()

useSeoMeta({
  title: () => (playlist.value as any)?.Name ? `${(playlist.value as any).Name} • Playlist` : 'Playlist',
})

function playAll() {
  if (tracks.value.length)
    player.playAll(tracks.value)
}

function playShuffle() {
  if (tracks.value.length)
    player.playAllShuffled(tracks.value)
}
</script>

<template>
  <UPage>
    <UAlert
      v-if="playlistError"
      color="error"
      title="Failed to load playlist"
      :description="(playlistError as any)?.data?.statusMessage || playlistError?.message"
      class="mb-6"
    />
    <UPageHero
      v-else
      orientation="horizontal"
      :title="(playlist as any)?.Name || (playlist as any)?.OriginalTitle || 'Playlist'"
      :description="trackCount ? `${trackCount} track${trackCount === 1 ? '' : 's'}` : ''"
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
          <UButton size="sm" variant="solid" icon="i-carbon-play" :disabled="!trackCount || tracksStatus === 'pending'" @click="playAll">
            Play All
          </UButton>
          <UButton size="sm" variant="soft" icon="i-carbon-shuffle" :disabled="!trackCount || tracksStatus === 'pending'" @click="playShuffle">
            Shuffle
          </UButton>
        </div>
      </template>
    </UPageHero>

    <UPageSection :ui="{ container: '!pt-0' }">
      <PlaylistTracks v-if="itemId" :id="itemId" />
    </UPageSection>
  </UPage>
</template>
