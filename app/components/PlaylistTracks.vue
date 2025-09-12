<script setup lang="ts">
import { usePlaylistContext } from '../composables/usePlaylistContext'
import { usePlayerStore } from '../stores/player'

// Accept playlist id directly (not stored in context)
const props = defineProps<{ id: string }>()

// Shared metadata context (no id inside)
const { trackCount, tracksStatus, tracks } = usePlaylistContext()!

const userId = useRuntimeConfig().public.jellyfinUserId
const player = usePlayerStore()

// Fetch tracks for playlist (component only mounts when id exists)
const { data: tracksData, error, status } = await useJellyfinData('/Playlists/{playlistId}/Items', {
  path: { playlistId: props.id },
  query: { userId },
})

// Redefine functions now that tracks is available
function play(track: any) {
  player.playTrack(track, tracks.value)
}
watchEffect(() => {
  const list = (tracksData.value as any)?.Items || []
  tracks.value = list
  trackCount.value = list.length
  tracksStatus.value = status.value as any
})
</script>

<template>
  <div>
    <div v-if="status === 'pending'" class="py-8 text-sm opacity-75">
      Loading tracks…
    </div>
    <UAlert
      v-else-if="error"
      color="error"
      title="Failed to load tracks"
      :description="(error as any)?.data?.statusMessage || error?.message"
    />
    <div v-else-if="tracksData" class="grid gap-4">
      <TrackCard
        v-for="track in tracks"
        :key="track.Id"
        :track="track"
        @play="play"
      />
      <div v-if="!tracks.length" class="text-sm opacity-60">
        No tracks.
      </div>
    </div>
  </div>
</template>
