<template>
  <div class="layout-root">
    <AppHeader />

    <UMain>
      <slot />
    </UMain>

    <Player />
  </div>
</template>

<style>
.layout-root {
  /* Reserve space for fixed player (updated dynamically by Player component via CSS var) */
  padding-bottom: calc(var(--player-reserved, 110px) + env(safe-area-inset-bottom));
}
@media (min-width: 640px) {
  .layout-root {
    padding-bottom: calc(var(--player-reserved, 96px) + env(safe-area-inset-bottom));
  }
}
</style>
