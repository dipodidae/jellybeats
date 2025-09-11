<script setup lang="ts">
import type { components } from '#nuxt-api-party/jellyfin'

type PlaylistDto = components['schemas']['PlaylistDto'] & { Name?: string, Id?: string, ImageTags?: Record<string, string> }

const props = defineProps<{ playlist: PlaylistDto }>()
const emit = defineEmits<{ (e: 'open', id: string): void, (e: 'play', id: string): void, (e: 'shuffle', id: string): void }>()

// Image handled by MediaImage component now

// Basic metadata
const title = computed(() => props.playlist.Name || 'Untitled Playlist')
const trackCount = computed(() => props.playlist?.ChildCount)
const durationTicks = computed(() => (props.playlist as any)?.RunTimeTicks as number | undefined)
// Convert ticks (10M per sec) -> minutes
const totalMinutes = computed(() => {
  if (!durationTicks.value)
    return null
  const minutes = Math.round(durationTicks.value / 10_000_000 / 60)
  if (!minutes)
    return null
  if (minutes < 90)
    return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h ${m}m` : `${h}h`
})
const year = computed(() => props.playlist.ProductionYear)
const isFav = computed(() => (props.playlist as any)?.UserData?.IsFavorite)
const genres = computed(() => props.playlist.Genres || [])

function open() {
  if (props.playlist.Id)
    emit('open', props.playlist.Id)
}
function play() {
  if (props.playlist.Id)
    emit('play', props.playlist.Id)
}
function shuffle() {
  if (props.playlist.Id)
    emit('shuffle', props.playlist.Id)
}
</script>

<template>
  <NuxtLink
    :to="`/playlist/${props.playlist.Id}`"
    class="focus-visible:ring-primary/70 block rounded focus:outline-none focus-visible:ring-2"
    @click.prevent="open"
  >
    <UCard class="group hover:border-primary relative overflow-hidden p-3 transition-colors">
      <div class="flex gap-4">
        <!-- Cover -->
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
            <UButton size="2xs" variant="solid" icon="i-carbon-play" @click.stop="play" />
            <UButton size="2xs" variant="soft" icon="i-carbon-shuffle" @click.stop="shuffle" />
          </div>
        </div>

        <!-- Text / metadata -->
        <div class="min-w-0 flex-1">
          <div class="flex items-start gap-2">
            <h3 class="truncate text-sm font-medium" :title="title">
              {{ title }}
            </h3>
            <UIcon v-if="isFav" name="i-carbon-favorite-filled" class="text-primary h-4 w-4" />
          </div>
          <div class="text-muted mt-0.5 flex flex-wrap items-center gap-1 text-[11px]">
            <span v-if="trackCount" class="bg-default-100/60 rounded px-1 py-0.5">{{ trackCount }} tracks</span>
            <span v-if="totalMinutes" class="bg-default-100/60 rounded px-1 py-0.5">{{ totalMinutes }}</span>
            <span v-if="year" class="bg-default-100/60 rounded px-1 py-0.5">{{ year }}</span>
          </div>
          <div v-if="genres.length" class="mt-1 flex flex-wrap gap-1">
            <span
              v-for="g in genres.slice(0, 3)"
              :key="g"
              class="border-default/50 text-muted rounded border border-dashed px-1.5 py-0.5 text-[10px]"
            >{{ g }}</span>
            <span v-if="genres.length > 3" class="bg-default-100/60 text-muted rounded px-1.5 py-0.5 text-[10px]">+{{ genres.length - 3 }}</span>
          </div>
        </div>

        <!-- Actions (explicit buttons removed; whole card navigates) -->
        <div class="flex w-5 shrink-0 flex-col items-end justify-start pt-1">
          <UIcon name="i-carbon-arrow-right" class="text-muted h-4 w-4 opacity-40 transition-opacity group-hover:opacity-80" />
        </div>
      </div>
    </UCard>
  </NuxtLink>
</template>
