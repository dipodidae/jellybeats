<script setup lang="ts">
const appName = 'Jellybeats'
const items = [
  { label: 'Home', to: '/' },
  { label: 'Playlists', to: '/playlists' },
  { label: 'About', to: '/about' },
]
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/" class="text-primary flex items-center gap-2 text-xl font-bold">
        <img src="/nuxt.svg" alt="Jellybeats Logo" class="h-8 w-8">
        {{ appName }}
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
      class="ml-6"
    />

    <template #right>
      <UColorModeButton />
    </template>
  </UHeader>
</template>
