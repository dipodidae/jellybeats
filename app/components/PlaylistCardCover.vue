<script setup lang="ts">
// Single-prop API
const props = defineProps<{ playlist: any }>()

// Core reactive primitives
const userId = useRuntimeConfig().public.jellyfinUserId
const playlistId = computed(() => props.playlist?.Id)
const title = computed(() => props.playlist?.Name || 'Untitled Playlist')

// Always invoke composable at top-level (no conditionals). We assume playlistId exists for cards.
const { data: tracksData, pending, error } = await useJellyfinData('/Playlists/{playlistId}/Items', {
  path: { playlistId: playlistId.value as string },
  query: { userId },
})

// Derived reactive state
const trackList = computed<any[]>(() => (tracksData.value as any)?.Items || [])
const hasTracks = computed(() => trackList.value.length > 0)

// Player actions (stateless wrappers)
const player = usePlayerStore()
function play() {
  if (hasTracks.value)
    player.playAll(trackList.value as any)
}
function shuffle() {
  if (hasTracks.value)
    player.playAllShuffled(trackList.value as any)
}

// (Optional) expose refresh or error handling externally later if needed
</script>

<template>
  <div class="relative h-20 w-20 shrink-0">
    <MediaImage
      :item="playlist"
      :alt="title"
      :width="300"
      :height="300"
      :quality="90"
      rounded
      class="h-full w-full"
    />
    <div class="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
      <UButton size="xs" :loading="pending" :disabled="!!error" variant="solid" icon="i-carbon-play" @click.stop="play" />
      <UButton size="xs" :loading="pending" :disabled="!!error" variant="soft" icon="i-carbon-shuffle" @click.stop="shuffle" />
    </div>
  </div>
</template>
