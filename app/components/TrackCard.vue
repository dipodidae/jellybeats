<script setup lang="ts">
import type { components } from '#nuxt-api-party/jellyfin'
import { usePlayerStore } from '../stores/player'

type JellyfinTrack = components['schemas']['BaseItemDto']

const props = defineProps<{
  track: JellyfinTrack
  active?: boolean
}>()

const emit = defineEmits<{ (e: 'play', track: JellyfinTrack): void }>()
const player = usePlayerStore()

function onPlayClick() {
  if (emit)
    emit('play', props.track)
  else player.playTrack(props.track)
}

const artist = computed(() => props.track.AlbumArtist || props.track.Artists?.[0] || 'Unknown Artist')
const album = computed(() => props.track.Album || 'Unknown Album')
function formatDuration(ticks?: components['schemas']['BaseItemDto']['RunTimeTicks']) {
  if (!ticks) {
    return '—'
  }
  // Jellyfin RunTimeTicks: 10,000 ticks per millisecond? Actually .NET: 10,000 ticks per millisecond, 10 million per second.
  const totalSeconds = Math.floor(ticks / 10_000_000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
const duration = computed(() => formatDuration(props.track.RunTimeTicks))
const isActive = computed(() => props.active ?? (player.current?.Id === props.track.Id))
</script>

<template>
  <UCard
    class="hover:border-primary cursor-pointer p-3 transition-colors" :class="[
      isActive ? 'border-primary ring-primary/40 ring-1' : '',
    ]"
    @click="onPlayClick"
  >
    <div class="flex flex-col gap-1">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium">
            {{ artist }} - {{ album }} - {{ track.Name }}
          </p>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <span class="w-10 text-right text-xs tabular-nums opacity-70">{{ duration }}</span>
          <UButton size="xs" variant="ghost" @click.stop="onPlayClick">
            <span v-if="isActive">Playing</span>
            <span v-else>Play</span>
          </UButton>
        </div>
      </div>
    </div>
  </UCard>
</template>
