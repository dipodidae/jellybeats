<script setup lang="ts">
interface Props { trackId: string, title: string }
const props = defineProps<Props>()
const audioSrc = computed(() => `/api/stream/${props.trackId}`)
</script>

<template>
  <div class="rounded-lg border bg-white/5 p-4 shadow-sm dark:bg-black/20">
    <h2 class="mb-2 truncate text-sm font-semibold">
      {{ title }}
    </h2>
    <audio :src="audioSrc" controls class="w-full" />
  </div>
</template>
