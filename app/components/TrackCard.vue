<script setup lang="ts">
import { usePlayerStore } from '../stores/player'
import { formatFromTicks } from '../utils/time'

// Using any for now to stay lean; upstream OpenAPI types were removed in refactor
const props = defineProps<{
  track: any
}>()

const emit = defineEmits<{ (e: 'play', track: any): void, (e: 'pause', track: any): void }>()
const player = usePlayerStore()

const artistPrimary = computed(() => props.track.AlbumArtist || props.track.Artists?.[0] || 'Unknown Artist')
const allArtists = computed(() => props.track.Artists?.length ? props.track.Artists.join(', ') : artistPrimary.value)
const album = computed(() => props.track.Album || 'Unknown Album')
const duration = computed(() => formatFromTicks(props.track.RunTimeTicks))
const year = computed(() => props.track.ProductionYear || props.track.PremiereDate?.slice(0, 4))
const bitrate = computed(() => props.track?.MediaStreams?.find((s: any) => s.Type === 'Audio')?.BitRate)
const codec = computed(() => props.track?.MediaStreams?.find((s: any) => s.Type === 'Audio')?.Codec)
const channels = computed(() => props.track?.MediaStreams?.find((s: any) => s.Type === 'Audio')?.Channels)
const genres = computed(() => props.track.Genres || [])
const isActive = computed(() => player.current?.Id === props.track.Id)

function playTrack() {
  emit('play', props.track)
}

function pauseTrack() {
  emit('pause', props.track)
}

// Image handled by MediaImage component now

const audioSummary = computed(() => {
  const parts: string[] = []
  if (bitrate.value)
    parts.push(`${Math.round(bitrate.value / 1000)}kbps`)
  if (codec.value)
    parts.push(codec.value.toUpperCase())
  if (channels.value)
    parts.push(`${channels.value}ch`)
  return parts.join(' · ')
})
</script>

<template>
  <UCard
    class="group hover:border-primary relative overflow-hidden p-3 transition-colors"
    :class="[isActive ? 'border-primary ring-primary/40 ring-1' : '']"
  >
    <div class="flex gap-4">
      <!-- Cover -->
      <div class="relative h-16 w-16 shrink-0">
        <MediaImage
          :item="track"
          :alt="track.Name || 'Track cover'"
          :width="200"
          :height="200"
          :quality="80"
          rounded
          class="h-full w-full"
        />
        <button
          class="absolute inset-0 flex items-center justify-center rounded bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
          @click.stop="playTrack"
        >
          <UIcon
            v-if="!isActive"
            name="i-carbon-play"
            class="h-6 w-6 text-white"
          />
          <UIcon
            v-else
            name="i-carbon-pause"
            class="h-6 w-6 text-white"
            @click.stop="pauseTrack"
          />
        </button>
      </div>

      <!-- Main metadata -->
      <div class="min-w-0 flex-1">
        <div class="flex items-start gap-2">
          <h3 class="truncate text-sm font-medium" :title="track.Name || ''">
            {{ track.Name }}
          </h3>
          <span v-if="year" class="bg-primary/10 text-primary shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase">
            {{ year }}
          </span>
        </div>
        <p class="text-muted truncate text-xs" :title="allArtists">
          {{ allArtists }}
        </p>
        <p class="text-muted truncate text-xs" :title="album">
          {{ album }}
        </p>

        <div class="mt-1 flex flex-wrap gap-1">
          <span v-if="audioSummary" class="border-default/50 text-muted rounded border border-dashed px-1.5 py-0.5 text-[10px]">
            {{ audioSummary }}
          </span>
          <span v-for="g in genres.slice(0, 3)" :key="g" class="bg-default-100/60 text-muted rounded px-1.5 py-0.5 text-[10px]">
            {{ g }}
          </span>
          <span v-if="genres.length > 3" class="bg-default-100/60 text-muted rounded px-1.5 py-0.5 text-[10px]">+{{ genres.length - 3 }}</span>
        </div>
      </div>

      <!-- Right column: duration & state -->
      <div class="flex w-28 shrink-0 flex-col items-end justify-between text-right">
        <span class="text-muted text-xs tabular-nums">{{ duration }}</span>
        <UButton
          size="xs"
          variant="ghost"
          :icon="isActive ? 'i-carbon-pause' : 'i-carbon-play'"
          @click.stop="isActive ? pauseTrack() : playTrack()"
        />
      </div>
    </div>
  </UCard>
</template>
