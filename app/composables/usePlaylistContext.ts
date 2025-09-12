import { createInjectionState } from '@vueuse/core'

// Injection-based per-playlist transient context (no id; components pass it explicitly)
const [useProvidePlaylistContext, usePlaylistContext] = createInjectionState(() => {
  const trackCount = ref(0)
  const tracksStatus = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
  const tracks = ref<any[]>([])
  return { trackCount, tracksStatus, tracks }
})

export { usePlaylistContext, useProvidePlaylistContext }
