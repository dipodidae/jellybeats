<script setup lang="ts">
import type { components } from '#nuxt-api-party/jellyfin'

type JellyfinPlaylist = components['schemas']['PlaylistDto']
type JellyfinItemsResponse<T = any> = components['schemas']['BaseItemDtoQueryResult'] & { Items?: T[] }

// @ts-expect-error runtime composable generics
const { data, error, status } = await useJellyfinData<JellyfinItemsResponse<JellyfinPlaylist>>(
  () => `Users/${useRuntimeConfig().public.jellyfinUserId}/Items`,
  {
    query: {
      IncludeItemTypes: 'Playlist',
      SortBy: 'SortName',
      Recursive: true,
    },
  },
)

const pending = computed(() => status.value === 'pending')
const playlists = computed(() => (data.value as any)?.Items || [])
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold">
      Playlists
    </h1>
    <div v-if="pending">
      Loading playlists…
    </div>
    <UAlert v-else-if="error" color="error" title="Failed to load playlists" :description="error?.data?.statusMessage || error.message" />
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <UCard v-for="pl in playlists" :key="pl.Id" class="hover:border-primary transition-colors">
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
      <div v-if="!playlists.length" class="col-span-full text-sm opacity-60">
        No playlists found.
      </div>
    </div>
  </div>
</template>
