<script setup lang="ts">
/**
 * Unified media image component for Jellyfin items.
 * - Accepts either an item object (with Id, ImageTags?.Primary) OR an explicit id/tag.
 * - Builds /api/image URL with sizing & quality params.
 * - Provides gradient fallback (deterministic based on id for color variety) when no image/tag present.
 * - Emits 'error' when the <img> element fails to load (still shows fallback).
 */

interface BaseMediaLike { Id?: string, ImageTags?: Record<string, string> | null, Name?: string | null }

const props = withDefaults(defineProps<{
  item?: BaseMediaLike | null
  id?: string
  tag?: string | null
  width?: number
  height?: number
  quality?: number
  alt?: string | null
  rounded?: boolean | string
  cover?: boolean
  showIcon?: boolean
  icon?: string
}>(), {
  quality: 85,
  width: 300,
  height: 300,
  rounded: true,
  cover: true,
  showIcon: true,
  icon: 'i-lucide-music-2',
})

const emit = defineEmits<{ (e: 'error'): void }>()

// Choose source id/tag priority: explicit props override item.
const mediaId = computed(() => props.id || props.item?.Id || '')
const primaryTag = computed(() => props.tag || props.item?.ImageTags?.Primary || '')

const hasImage = computed(() => !!(mediaId.value && primaryTag.value))

// Construct URL only if we have an id; still attempt even without tag (server may pick default)
const src = computed(() => {
  if (!mediaId.value)
    return ''
  const params = new URLSearchParams()
  params.set('fillHeight', String(props.height))
  params.set('fillWidth', String(props.width))
  params.set('quality', String(props.quality))
  if (primaryTag.value)
    params.set('tag', primaryTag.value)
  return `/api/image/${mediaId.value}?${params.toString()}`
})

// Deterministic gradient based on id (hash to hue)
function hashToHue(input: string) {
  let h = 0
  for (let i = 0; i < input.length; i++)
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0
  return Math.abs(h) % 360
}
const hue = computed(() => hashToHue(mediaId.value || primaryTag.value || 'fallback'))
const gradientStyle = computed(() => ({
  background: `linear-gradient(135deg, hsl(${hue.value} 70% 18%), hsl(${(hue.value + 40) % 360} 70% 32%))`,
}))

const altText = computed(() => props.alt || props.item?.Name || 'Media image')

const radiusClass = computed(() => {
  if (typeof props.rounded === 'string')
    return props.rounded
  return props.rounded ? 'rounded-md' : ''
})
</script>

<template>
  <div
    class="relative overflow-hidden ring-1 ring-black/5 dark:ring-white/10"
    :class="[radiusClass]"
    :style="{ width: `${width}px`, height: `${height}px` }"
  >
    <!-- Image when available -->
    <img
      v-if="mediaId"
      :src="src"
      :alt="altText"
      class="h-full w-full"
      :class="[cover ? 'object-cover' : 'object-contain', radiusClass]"
      loading="lazy"
      decoding="async"
      @error="emit('error')"
    >
    <!-- Fallback gradient overlay when no primary tag (or always if loading error could be tracked later) -->
    <div
      v-if="!hasImage"
      class="absolute inset-0 flex items-center justify-center text-neutral-200 dark:text-neutral-300"
      :style="gradientStyle"
    >
      <UIcon v-if="showIcon" :name="icon" class="h-2/5 w-2/5 opacity-70" />
    </div>
  </div>
</template>

<style scoped>
</style>
