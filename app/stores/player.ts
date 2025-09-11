import type { components } from '#nuxt-api-party/jellyfin'
import { defineStore } from 'pinia'

type JellyfinTrack = components['schemas']['BaseItemDto']

interface QueueItem {
  track: JellyfinTrack
}

interface PlayerState {
  current: JellyfinTrack | null
  queue: QueueItem[]
  index: number // index in queue
  isPlaying: boolean
  progress: number // seconds elapsed
  duration: number // seconds total
  lastUpdated: number | null
}

let audioEl: HTMLAudioElement | null = null

export const usePlayerStore = defineStore('player', {
  state: (): PlayerState => ({
    current: null,
    queue: [],
    index: -1,
    isPlaying: false,
    progress: 0,
    duration: 0,
    lastUpdated: null,
  }),
  getters: {
    hasTrack: state => !!state.current,
    currentTitle: state => state.current?.Name || '',
    canNext: state => state.index >= 0 && state.index < state.queue.length - 1,
    canPrev: state => state.index > 0,
    // Derive an effective duration: prefer actual measured duration, else fallback from metadata RunTimeTicks
    effectiveDuration: (state) => {
      if (state.duration && Number.isFinite(state.duration))
        return state.duration
      const ticks = state.current?.RunTimeTicks
      if (ticks && ticks > 0) {
        // 10,000,000 ticks per second (.NET TimeSpan)
        return Math.floor(ticks / 10_000_000)
      }
      return 0
    },
    progressPercent() {
      const total = (this as any).effectiveDuration as number
      return total ? ((this as any).progress / total) * 100 : 0
    },
    audioSrc: state => state.current ? `/api/stream/${state.current.Id}` : '',
  },
  actions: {
    _ensureAudio() {
      if (!audioEl) {
        audioEl = new Audio()
        audioEl.addEventListener('timeupdate', () => {
          this.progress = audioEl?.currentTime || 0
          this.duration = audioEl?.duration || this.duration
        })
        audioEl.addEventListener('ended', () => {
          this.next()
        })
      }
      return audioEl
    },
    setQueue(tracks: JellyfinTrack[], startTrack?: JellyfinTrack) {
      this.queue = tracks.map(t => ({ track: t }))
      if (startTrack) {
        const idx = this.queue.findIndex(q => q.track.Id === startTrack.Id)
        this.index = idx >= 0 ? idx : 0
      }
      else {
        this.index = 0
      }
      this._loadCurrentFromQueue(true)
    },
    /**
     * Replace queue with provided tracks and start playback at first (sequential play all helper)
     */
    playAll(tracks: JellyfinTrack[]) {
      if (!tracks?.length)
        return
      this.setQueue(tracks)
    },
    /**
     * Shuffle provided tracks then start playback from first of shuffled list.
     * Uses Fisher-Yates to avoid bias.
     */
    playAllShuffled(tracks: JellyfinTrack[]) {
      if (!tracks?.length)
        return
      const shuffled = [...tracks]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = shuffled[i]!
        shuffled[i] = shuffled[j]!
        shuffled[j] = temp
      }
      this.setQueue(shuffled)
    },
    playTrack(track: JellyfinTrack, queueContext?: JellyfinTrack[]) {
      if (queueContext && queueContext.length) {
        this.queue = queueContext.map(t => ({ track: t }))
        this.index = this.queue.findIndex(q => q.track.Id === track.Id)
      }
      else {
        // If no queue context provided, attempt to append or replace current
        const existingIdx = this.queue.findIndex(q => q.track.Id === track.Id)
        if (existingIdx === -1) {
          this.queue = [{ track }]
          this.index = 0
        }
        else {
          this.index = existingIdx
        }
      }
      this._loadCurrentFromQueue(true)
    },
    _loadCurrentFromQueue(autoplay = false) {
      const qItem = this.queue[this.index]
      this.current = qItem ? qItem.track : null
      const audio = this._ensureAudio()
      if (this.current) {
        audio.src = `/api/stream/${this.current.Id}`
        audio.load()
        this.progress = 0
        this.duration = 0
        if (autoplay) {
          audio.play()
          this.isPlaying = true
        }
      }
      else {
        this.isPlaying = false
      }
    },
    toggle() {
      if (!this.current)
        return
      const audio = this._ensureAudio()
      if (this.isPlaying) {
        audio.pause()
        this.isPlaying = false
      }
      else {
        audio.play()
        this.isPlaying = true
      }
    },
    pause() {
      if (!this.current)
        return
      const audio = this._ensureAudio()
      audio.pause()
      this.isPlaying = false
    },
    resume() {
      if (!this.current)
        return
      const audio = this._ensureAudio()
      audio.play()
      this.isPlaying = true
    },
    seek(toSeconds: number) {
      const audio = this._ensureAudio()
      audio.currentTime = toSeconds
      this.progress = toSeconds
    },
    next() {
      if (!this.canNext)
        return
      this.index += 1
      this._loadCurrentFromQueue(true)
    },
    prev() {
      if (!this.canPrev)
        return
      this.index -= 1
      this._loadCurrentFromQueue(true)
    },
    clear() {
      this.pause()
      this.current = null
      this.queue = []
      this.index = -1
      this.progress = 0
      this.duration = 0
    },
  },
})
