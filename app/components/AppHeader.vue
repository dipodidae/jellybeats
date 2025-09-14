<script setup lang="ts">
// Prefer a local constant to avoid import churn; if reused elsewhere, pull from ~/constants
const appName = 'Jellyfin Music'

const items = computed(() => [
  {
    label: 'Home',
    to: '/',
    active: $route.path === '/',
  },
  {
    label: 'Minimal Wave',
    to: '/playlist/0e694419242d8e2c9263637e43179a00',
    active: $route.path === '/playlist/0e694419242d8e2c9263637e43179a00',
  },
])
</script>

<template>
  <UHeader>
    <template #left>
      <ULink to="/" class="flex items-center gap-2 text-xl font-bold" active-class="text-primary" inactive-class="text-muted">
        {{ appName }}
      </ULink>
    </template>

    <template #right>
      <UNavigationMenu
        :items="items"
        variant="link"
        class="hidden lg:block"
      />

      <UColorModeButton />
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />
    </template>
  </UHeader>
</template>
