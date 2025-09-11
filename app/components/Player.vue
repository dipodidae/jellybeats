<script setup lang="ts">
import { usePlayerStore } from '../stores/player'

const player = usePlayerStore()

function onSeek(e: Event) {
  const target = e.target as HTMLInputElement
  player.seek(Number(target.value))
}

function formattedTime(sec: number) {
  if (!Number.isFinite(sec))
    return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}
</script>

<template>
  <div v-if="player.hasTrack" class="global-player flex items-center gap-4 rounded-t-lg border border-b-0 bg-white/80 p-3 backdrop-blur dark:bg-black/60">
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium">
        {{ player.currentTitle }}
      </p>
      <div class="mt-1 flex items-center gap-2">
        <button class="text-xs opacity-70 hover:opacity-100" :disabled="!player.canPrev" @click="player.prev">
          ⏮
        </button>
        <button class="text-sm font-semibold" @click="player.toggle">
          <span v-if="player.isPlaying">⏸</span>
          <span v-else>▶️</span>
        </button>
        <button class="text-xs opacity-70 hover:opacity-100" :disabled="!player.canNext" @click="player.next">
          ⏭
        </button>
        <span class="ml-2 text-[10px] tabular-nums opacity-70">{{ formattedTime(player.progress) }} / {{ formattedTime(player.duration) }}</span>
      </div>
      <input v-model="player.progress" type="range" min="0" :max="player.duration || 0" step="1" class="mt-2 w-full" @input="onSeek">
    </div>
    <button class="text-xs opacity-60 hover:opacity-100" @click="player.clear">
      ✕
    </button>
  </div>
</template>

<style scoped>
.global-player {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
}
</style>
