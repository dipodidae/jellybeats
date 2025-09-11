<script setup lang="ts">
import type { components } from '#nuxt-api-party/jellyfin'

type JellyfinPlaylist = components['schemas']['PlaylistDto']
type JellyfinItemsResponse<T = any> = components['schemas']['BaseItemDtoQueryResult'] & { Items?: T[] }

// @ts-expect-error composable provided by nuxt-api-party at runtime (generic keys not enforced)
const { data, error, status } = await useJellyfinData<JellyfinItemsResponse<JellyfinPlaylist>>(
  () => `Users/${useRuntimeConfig().public.jellyfinUserId}/Items`,
  { query: { IncludeItemTypes: 'Playlist', SortBy: 'SortName', Recursive: true } },
)
const pending = computed(() => status.value === 'pending')
const playlists = computed(() => (data.value as any)?.Items || [])
</script>

<template>
  <div class="landing-page">
    <header>
      <img src="/nuxt.svg" alt="Jellybeats Logo" class="logo">
      <h1>Jellybeats</h1>
      <p class="subtitle">
        A modern, open-source music streaming experience powered by Nuxt.
      </p>
    </header>
    <main>
      <section class="cta">
        <h2 class="mb-4 text-xl font-semibold">
          Featured Playlists
        </h2>
        <div v-if="pending">
          Loading playlists…
        </div>
        <UAlert
          v-else-if="error"
          color="error"
          title="Failed to load playlists"
          :description="error?.data?.statusMessage || error.message"
        />
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
        </div>
      </section>
    </main>
    <footer>
      <p>&copy; 2025 Jellybeats. All rights reserved.</p>
    </footer>
  </div>
</template>

<style scoped>
.landing-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
  color: #fff;
}
.logo {
  width: 80px;
  margin-bottom: 1rem;
}
header {
  text-align: center;
  margin-bottom: 2rem;
}
.subtitle {
  font-size: 1.2rem;
  opacity: 0.85;
}
.cta {
  margin: 2rem 0;
}
.get-started {
  background: #06b6d4;
  color: #fff;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 999px;
  font-size: 1.1rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: background 0.2s;
  text-decoration: none;
  display: inline-block;
}
.get-started:hover {
  background: #4f46e5;
}
footer {
  margin-top: auto;
  padding: 1rem 0;
  font-size: 0.9rem;
  opacity: 0.7;
}
</style>
