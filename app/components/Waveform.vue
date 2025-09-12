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
const loading = ref(false)

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
  if (!ws)
    return
  ws.destroy()
  ws = null
  _hoverPlugin = null
  _minimapPlugin = null
  ready.value = false
  loading.value = false
}

function initWs(url: string) {
  if (!containerRef.value)
    return
  loading.value = true
  destroyWs()
  // Derive theme colors
  const css = getComputedStyle(document.documentElement)
  const waveBase = css.getPropertyValue('--color-neutral-500').trim() || '#6b7280'
  const primary = css.getPropertyValue('--ui-primary').trim() || '#8f8070'

  // Try to reuse the app's single audio element to avoid double network fetch & analysis
  const anyPlayer = player as any
  const mediaEl: HTMLAudioElement | undefined = anyPlayer._ensureAudio?.()

  ws = WaveSurfer.create({
    container: containerRef.value,
    // Use continuous waveform (remove barWidth/barGap) to avoid blocky appearance
    waveColor: waveBase,
    progressColor: primary,
    cursorColor: primary,
    height: 68,
    normalize: true,
    autoplay: false,
    interact: true,
    // If we have media element, attach it; else fallback to fetching via url
    media: mediaEl,
    url: mediaEl ? undefined : url,
    dragToSeek: true,
  } as any)

  _hoverPlugin = ws.registerPlugin(Hover.create({
    lineColor: primary,
    lineWidth: 1,
    labelBackground: 'rgba(0,0,0,0.55)',
    labelColor: '#fff',
  }))
  _minimapPlugin = ws.registerPlugin(Minimap.create({
    height: 22,
    waveColor: `${waveBase}55`,
    progressColor: primary,
  }))

  ws.on('ready', () => {
    ready.value = true
    loading.value = false
    if (player.progress && ws && ws.getDuration() > player.progress) {
      ws.setTime(player.progress)
    }
  })
  ws.on('error', () => { loading.value = false })
  ws.on('interaction', () => {
    if (!ws)
      return
    player.seek(ws.getCurrentTime())
  })
}

// Watch current track changes
watch(() => (player.current as any)?.Id, (id) => {
  if (!id) {
    destroyWs()
    return
  }
  const url = `/api/stream/${id}`
  initWs(url)
})

// Keep waveform cursor in sync ONLY when drifting noticeably; avoids constant setTime which can look blocky
let syncRaf: number | null = null
function syncLoop() {
  if (ws && ready.value) {
    const dur = ws.getDuration() || player.effectiveDuration || 0
    if (dur > 0) {
      const drift = Math.abs(ws.getCurrentTime() - player.progress)
      if (drift > 0.15)
        ws.setTime(Math.min(player.progress, dur - 0.02))
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

// External seek (slider) while expanded
watch(() => player.progress, (val, old) => {
  if (!ws || !ready.value)
    return
  if (Math.abs(val - (old || 0)) > 0.25 && !player.isPlaying)
    ws.setTime(val)
})
</script>

<template>
  <div class="waveform-wrapper select-none">
    <div ref="containerRef" class="waveform-container">
      <div v-if="loading && !ready" class="flex h-full items-center justify-center text-xs text-neutral-500">
        Loading waveform…
      </div>
    </div>
    <div v-if="!player.current && !loading" class="mt-2 text-center text-xs text-neutral-500">
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
  border-radius: 0.625rem;
  padding: 0.4rem 0.5rem 0.25rem;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.4));
  position: relative;
  min-height: 68px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 0 0 1px rgba(0, 0, 0, 0.25);
}
@media (prefers-color-scheme: dark) {
  .waveform-container {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      0 0 0 1px rgba(255, 255, 255, 0.06);
  }
}
.waveform-container ::part(cursor) {
  width: 2px;
  background: var(--ui-primary);
}
.waveform-container ::part(wave) {
  cursor: pointer;
}
</style>
