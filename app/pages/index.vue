<script setup lang="ts">
// Lean Jellyfin fetch: list playlists via /Items
const userId = useRuntimeConfig().public.jellyfinUserId
const { data, error, status } = await useJellyfinData(
  '/Items',
  {
    query: {
      userId,
      includeItemTypes: ['Playlist'],
      sortBy: ['SortName'],
      recursive: true,
    },
  },
)
</script>

<template>
  <UContainer>
    <div class="space-y-4">
      <h1 class="text-2xl font-bold">
        Playlists
      </h1>
      <div v-if="status === 'pending'" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        v-else-if="error"
        color="error"
        title="Failed to load playlists"
        :description="(error as any)?.data?.statusMessage || error?.message"
      />
      <div v-else-if="status === 'idle'" class="text-sm opacity-60">
        Idle
      </div>
      <div v-else-if="data" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PlaylistCard
          v-for="pl in (data as any)?.Items || []"
          :key="pl.Id"
          :playlist="pl"
        />
        <div v-if="!(data as any)?.Items?.length" class="col-span-full text-sm opacity-60">
          No playlists found.
        </div>
      </div>
    </div>
  </UContainer>
</template>
