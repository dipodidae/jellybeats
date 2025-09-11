<script setup lang="ts">
import WaveSurfer from 'wavesurfer.js'
import Hover from 'wavesurfer.js/dist/plugins/hover.esm.js'
import Minimap from 'wavesurfer.js/dist/plugins/minimap.esm.js'
import { usePlayerStore } from '../stores/player'

/**
 * Waveform visualization tightly coupled to the player store state.
 * It mirrors playback position changes (both user seeking & natural progress)
 * and pushes seeks back to the underlying audio element when user interacts.
 */

const player = usePlayerStore()

const containerRef = ref<HTMLElement | null>(null)
let ws: WaveSurfer | null = null
let _hoverPlugin: any // kept for potential future customization
let _minimapPlugin: any
const ready = ref(false)

// Debounce resize (wavesurfer auto-resizes but we can force an update when expanded toggle happens)
let resizeRaf: number | null = null
function queueResize() {
  if (!ws)
    return
  if (resizeRaf)
    cancelAnimationFrame(resizeRaf)
  resizeRaf = requestAnimationFrame(() => {
    ws && ws.setOptions({}) // trigger internal re-measure
  })
}

function destroyWs() {
  if (ws) {
    ws.destroy()
    ws = null
    _hoverPlugin = null
    _minimapPlugin = null
    ready.value = false
  }
}

function initWs(url: string) {
  if (!containerRef.value)
    return
  destroyWs()
  ws = WaveSurfer.create({
    container: containerRef.value,
    waveColor: '#6366f1',
    progressColor: '#4338ca',
    cursorColor: '#0ea5e9',
    barWidth: 2,
    barGap: 1,
    height: 72,
    normalize: true,
    url,
    autoplay: false, // we let the existing audio element handle sound
    interact: true,
  })
  _hoverPlugin = ws.registerPlugin(Hover.create({
    lineColor: '#fb923c',
    lineWidth: 1,
    labelBackground: 'rgba(0,0,0,0.65)',
    labelColor: '#fff',
  }))
  _minimapPlugin = ws.registerPlugin(Minimap.create({
    height: 24,
    waveColor: '#94a3b8',
    progressColor: '#334155',
  }))

  ws.on('ready', () => {
    ready.value = true
    // Sync initial progress if player already progressed
    if (player.progress && ws && ws.getDuration()) {
      ws.setTime(player.progress)
    }
  })

  // Mirror user interactions (seek via waveform) back to audio
  ws.on('interaction', () => {
    if (!ws)
      return
    const t = ws.getCurrentTime()
    player.seek(t)
  })
}

// Watch current track changes
watch(() => player.current?.Id, (id) => {
  if (!id) {
    destroyWs()
    return
  }
  const url = `/api/stream/${id}`
  initWs(url)
})

// Keep waveform position in sync with external audio progress (throttled via rAF)
let syncRaf: number | null = null
function syncLoop() {
  if (ws && player.isPlaying) {
    const dur = ws.getDuration()
    if (dur > 0) {
      const wsTime = ws.getCurrentTime()
      // only set if drift > 80ms to reduce churn
      if (Math.abs(wsTime - player.progress) > 0.08) {
        ws.setTime(Math.min(player.progress, dur - 0.01))
      }
      // If drift huge (maybe seek happened externally), just set
    }
  }
  syncRaf = requestAnimationFrame(syncLoop)
}

onMounted(() => {
  syncLoop()
  window.addEventListener('resize', queueResize)
})

onBeforeUnmount(() => {
  if (syncRaf)
    cancelAnimationFrame(syncRaf)
  window.removeEventListener('resize', queueResize)
  destroyWs()
})

// Respond to play/pause to stop continuous setTime when paused (prevent jitter)
watch(() => player.isPlaying, (p) => {
  if (!ws)
    return
  if (!p) {
    // when paused ensure waveform cursor is exact
    ws.setTime(player.progress)
  }
})

// If progress leaps (external seek via slider maybe) update waveform
watch(() => player.progress, (val, old) => {
  if (!ws || !ready.value)
    return
  if (Math.abs(val - (old || 0)) > 0.25 && !player.isPlaying) {
    ws.setTime(val)
  }
})
</script>

<template>
  <div class="waveform-wrapper select-none">
    <div ref="containerRef" class="waveform-container" />
    <div v-if="!player.current" class="mt-2 text-center text-xs text-neutral-500">
      No track selected
    </div>
  </div>
</template>

<style scoped>
.waveform-wrapper {
  position: relative;
  width: 100%;
}
.waveform-container {
  width: 100%;
  overflow: hidden;
  border-radius: 0.375rem;
  padding: 0.5rem;
  background: rgba(245, 245, 245, 0.6);
}
@media (prefers-color-scheme: dark) {
  .waveform-container {
    background: rgba(38, 38, 38, 0.5);
  }
}
.waveform-container ::part(wave) {
  cursor: pointer;
}
</style>
