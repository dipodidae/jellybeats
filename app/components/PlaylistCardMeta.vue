<script setup lang="ts">
const props = defineProps<{ playlist: any }>()

// Derived metadata (duplicated from previous inline logic to keep parent lean)
const title = computed(() => props.playlist?.Name || 'Untitled Playlist')
const trackCount = computed(() => (props.playlist as any)?.ChildCount as number | undefined)
const durationTicks = computed(() => (props.playlist as any)?.RunTimeTicks as number | undefined)
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
const year = computed(() => (props.playlist as any)?.ProductionYear as number | undefined)
const isFav = computed(() => (props.playlist as any)?.UserData?.IsFavorite)
const genres = computed(() => ((props.playlist as any)?.Genres as string[] | undefined) || [])
</script>

<template>
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
</template>
