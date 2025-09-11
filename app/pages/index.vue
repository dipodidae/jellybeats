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
const showError = computed(() => !pending.value && !!error.value)
</script>

<template>
  <UContainer>
    <div class="space-y-4">
      <h1 class="text-2xl font-bold">
        Playlists
      </h1>
      <div v-if="pending" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="n in 6"
          :key="n"
          class="border-default/40 animate-pulse rounded border border-dashed p-3"
        >
          <div class="flex gap-4">
            <div class="bg-default-200/50 h-20 w-20 rounded" />
            <div class="flex-1 space-y-2">
              <div class="bg-default-200/60 h-4 w-2/3 rounded" />
              <div class="bg-default-200/40 h-3 w-1/2 rounded" />
              <div class="flex gap-2 pt-1">
                <div class="bg-default-200/30 h-3 w-10 rounded" />
                <div class="bg-default-200/30 h-3 w-12 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <UAlert
        v-else-if="showError"
        color="error"
        title="Failed to load playlists"
        :description="error?.data?.statusMessage || error?.message"
      />
      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PlaylistCard
          v-for="pl in playlists"
          :key="pl.Id"
          :playlist="pl"
        />
        <div v-if="!playlists.length" class="col-span-full text-sm opacity-60">
          No playlists found.
        </div>
      </div>
    </div>
  </UContainer>
</template>
