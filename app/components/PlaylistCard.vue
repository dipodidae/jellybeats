<script setup lang="ts">
import type { components } from '#nuxt-api-party/jellyfin'

type PlaylistDto = components['schemas']['PlaylistDto'] & { Name?: string, Id?: string, ImageTags?: Record<string, string> }

const props = defineProps<{
  playlist: PlaylistDto
}>()
</script>

<template>
  <ULink
    :to="`/playlist/${(props.playlist as any)?.Id}`"
    class="focus-visible:outline-primary block rounded focus:outline-none focus-visible:outline-2"
    active-class="ring-2 ring-primary"
    inactive-class=""
  >
    <UCard class="group hover:border-primary relative overflow-hidden p-3 transition-colors">
      <div class="flex gap-4">
        <PlaylistCardCover :playlist="props.playlist" />
        <PlaylistCardMeta :playlist="props.playlist" />
        <PlaylistCardActions />
      </div>
    </UCard>
  </ULink>
</template>
