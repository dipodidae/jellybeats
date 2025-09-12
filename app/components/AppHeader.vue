<script setup lang="ts">
import { ref } from 'vue'

// Prefer a local constant to avoid import churn; if reused elsewhere, pull from ~/constants
const appName = 'Jellyfin Music'
const items = [
  { label: 'Home', to: '/' },
  { label: 'Minimal Wave', to: '/playlist/0e694419242d8e2c9263637e43179a00' },
]

const mobileNavOpen = ref(false)

function closeMobileNav() {
  mobileNavOpen.value = false
}
</script>

<template>
  <UHeader>
    <template #left>
      <ULink to="/" class="flex items-center gap-2 text-xl font-bold" active-class="text-primary" inactive-class="text-muted">
        {{ appName }}
      </ULink>
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
      class="ml-6 hidden md:flex"
    />

    <template #right>
      <!-- Hamburger button (mobile) -->
      <UButton
        color="neutral"
        variant="ghost"
        class="md:hidden"
        aria-label="Open navigation menu"
        @click="mobileNavOpen = true"
      >
        <UIcon name="i-heroicons-bars-3" class="size-6" />
      </UButton>
      <UColorModeButton />
    </template>
  </UHeader>

  <!-- Mobile navigation slide-over -->
  <USlideover v-model="mobileNavOpen" side="left" class="md:hidden">
    <div class="flex h-full flex-col p-4">
      <div class="mb-4 flex items-center justify-between">
        <span class="text-lg font-bold">{{ appName }}</span>
        <UButton
          color="neutral"
          variant="ghost"
          aria-label="Close navigation menu"
          @click="closeMobileNav"
        >
          <UIcon name="i-heroicons-x-mark" class="size-6" />
        </UButton>
      </div>
      <nav class="flex flex-col gap-2">
        <ULink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          class="rounded px-3 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          active-class="font-semibold text-primary"
          inactive-class="text-muted"
          @click="closeMobileNav"
        >
          {{ item.label }}
        </ULink>
      </nav>
      <div class="mt-auto pt-6 text-xs text-gray-500 dark:text-gray-400">
        <span>&copy; {{ new Date().getFullYear() }} {{ appName }}</span>
      </div>
    </div>
  </USlideover>
</template>
