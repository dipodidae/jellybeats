<script setup lang="ts">
import { appName } from '~/constants'

const items = computed(() => [
  {
    label: 'Home',
    to: '/',
  },
  {
    label: 'Counter Store',
    to: '/counter',
  },
  {
    label: 'Pageview API',
    to: '/pageview',
  },
])
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/">
        {{ appName }}
      </NuxtLink>
      <TemplateMenu />
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
    />

    <template #right>
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
