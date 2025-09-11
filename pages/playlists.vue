<script setup lang="ts">
import type { JellyfinItemsResponse, JellyfinPlaylist } from '../types/jellyfin'
import { $fetch } from 'ofetch'
import { ref } from 'vue'

const data = ref<JellyfinItemsResponse<JellyfinPlaylist> | null>(null)
const error = ref<Error | null>(null)
const pending = ref(true)

await (async () => {
  try {
    data.value = await $fetch<JellyfinItemsResponse<JellyfinPlaylist>>('/api/playlists')
  }
  catch (e: any) {
    error.value = e
  }
  finally {
    pending.value = false
  }
})()
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold">
      Playlists
    </h1>
    <div v-if="pending">
      Loading playlists…
    </div>
    <UAlert v-else-if="error" color="red" title="Failed to load playlists" :description="error.message" />
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <UCard v-for="pl in data?.Items" :key="pl.Id" class="hover:border-primary transition-colors">
        <div class="flex items-center justify-between gap-3">
          <div class="truncate font-medium">
            {{ pl.Name }}
          </div>
          <NuxtLink :to="`/playlist/${pl.Id}`" class="shrink-0">
            <UButton size="xs" variant="solid">
              Open
            </UButton>
          </NuxtLink>
        </div>
      </UCard>
      <div v-if="!data?.Items?.length" class="col-span-full text-sm opacity-60">
        No playlists found.
      </div>
    </div>
  </div>
</template>
