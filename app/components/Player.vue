<script setup lang="ts">
import { usePlayerStore } from '../stores/player'
import { formatSeconds, ticksToSeconds } from '../utils/time'

const player = usePlayerStore()

// Local UI state
const expanded = ref(false)
const volume = ref(1) // 0..1
const rootEl = ref<HTMLElement | null>(null)

// Keep slider (seek) binding in seconds
const sliderValue = computed({
  get: () => player.progress,
  set: (val: number) => player.seek(val),
})

const metaDurationSeconds = computed(() => ticksToSeconds(player.current?.RunTimeTicks as any))
const totalDuration = computed(() => player.effectiveDuration || metaDurationSeconds.value)
function formattedTime(sec: number) {
  return formatSeconds(sec)
}
const playPauseIcon = computed(() => (player.isPlaying ? 'i-lucide-pause' : 'i-lucide-play'))

// Derive artists & album
const artists = computed(() => player.current?.Artists?.join(', ') || player.current?.AlbumArtist || 'Unknown Artist')
const album = computed(() => player.current?.Album || null)

// Artwork handled by MediaImage component now

// Volume control (directly manipulate audio element via store private helper)
watch(volume, (v) => {
  // internal helper is intentionally accessed (audio element encapsulated in store)
  const anyPlayer = player as any
  const audio: HTMLAudioElement | undefined = anyPlayer._ensureAudio?.()
  if (audio)
    audio.volume = v
})

// Persist last used volume in localStorage
onMounted(() => {
  const saved = localStorage.getItem('player:volume')
  if (saved) {
    const num = Number(saved)
    if (!Number.isNaN(num))
      volume.value = Math.min(1, Math.max(0, num))
  }
})
watch(volume, v => localStorage.setItem('player:volume', String(v)))

const progressPercent = computed(() => (totalDuration.value ? (player.progress / totalDuration.value) * 100 : 0))

function toggleExpanded() {
  expanded.value = !expanded.value
}

// Observe size and update a CSS variable so layout can reserve space
function updateReservedHeight() {
  if (rootEl.value) {
    const rect = rootEl.value.getBoundingClientRect()
    // Add buffer so content never hides behind shadows or focus rings
    document.documentElement.style.setProperty('--player-reserved', `${rect.height + 16}px`)
  }
}

let resizeObs: ResizeObserver | null = null
onMounted(() => {
  if (rootEl.value && typeof ResizeObserver !== 'undefined') {
    resizeObs = new ResizeObserver(() => updateReservedHeight())
    resizeObs.observe(rootEl.value)
    updateReservedHeight()
  }
  window.addEventListener('resize', updateReservedHeight)
})
onBeforeUnmount(() => {
  resizeObs?.disconnect()
  window.removeEventListener('resize', updateReservedHeight)
})
watch(expanded, () => nextTick(() => updateReservedHeight()))
</script>

<template>
  <div
    v-if="player.hasTrack"
    ref="rootEl"
    class="global-player group relative w-full overflow-hidden border-t border-neutral-200/70 bg-white/80 backdrop-blur dark:border-neutral-800/70 dark:bg-neutral-950/70"
    :class="[
      expanded ? 'h-[320px] sm:h-[270px]' : 'h-[96px] sm:h-[90px]',
    ]"
  >
    <!-- background glow / gradient -->
    <div class="from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/10 absolute inset-0 -z-10 bg-gradient-to-tr via-transparent" />
    <div class="flex h-full flex-col">
      <!-- Top row (mini mode content) -->
      <div
        class="flex flex-1 items-center gap-4 px-4"
        :class="expanded ? 'pt-3 pb-2' : 'py-3'"
      >
        <!-- Artwork -->
        <div
          class="relative shrink-0"
          :class="expanded ? 'h-24 w-24 sm:h-28 sm:w-28' : 'h-14 w-14'"
        >
          <MediaImage
            v-if="player.current"
            :item="player.current"
            :width="expanded ? 128 : 56"
            :height="expanded ? 128 : 56"
            :quality="90"
            :alt="player.currentTitle || 'Artwork'"
            class="h-full w-full rounded-md"
          />
          <button
            class="focus:ring-primary absolute -top-2 -right-2 hidden rounded-full bg-neutral-900/80 p-1 text-neutral-100 shadow hover:bg-neutral-800 focus:ring-2 focus:outline-none sm:inline-flex dark:bg-neutral-100/20"
            :aria-label="expanded ? 'Collapse player' : 'Expand player'"
            @click.stop="toggleExpanded"
          >
            <UIcon :name="expanded ? 'i-lucide-chevron-down' : 'i-lucide-chevron-up'" class="h-4 w-4" />
          </button>
        </div>

        <!-- Metadata & controls container -->
        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="truncate text-sm leading-tight font-semibold">
                {{ player.currentTitle }}
              </p>
              <p class="truncate text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                {{ artists }}
              </p>
              <p
                v-if="album"
                class="truncate text-[11px] text-neutral-500 dark:text-neutral-500"
              >
                {{ album }}
              </p>
            </div>
            <div class="flex shrink-0 items-center gap-1 sm:gap-2">
              <UButton
                icon="i-lucide-skip-back"
                color="neutral"
                variant="soft"
                :disabled="!player.canPrev"
                square
                size="md"
                aria-label="Previous track"
                @click="player.prev"
              />
              <UButton
                :icon="playPauseIcon"
                color="primary"
                variant="solid"
                square
                size="lg"
                aria-label="Play / Pause"
                @click="player.toggle"
              />
              <UButton
                icon="i-lucide-skip-forward"
                color="neutral"
                variant="soft"
                :disabled="!player.canNext"
                square
                size="md"
                aria-label="Next track"
                @click="player.next"
              />
            </div>
          </div>

          <!-- Progress visualization -->
          <div class="mt-2">
            <USlider
              v-model="sliderValue"
              :min="0"
              :max="totalDuration || 0"
              :step="1"
              :size="expanded ? 'lg' : 'md'"
              color="primary"
              :disabled="!totalDuration"
              class="cursor-pointer"
              aria-label="Seek"
            />
            <div class="mt-1 flex justify-between text-[10px] text-neutral-500 tabular-nums dark:text-neutral-400">
              <span>{{ formattedTime(player.progress) }}</span>
              <span>{{ formattedTime(totalDuration) }}</span>
            </div>
            <div class="sr-only">
              {{ Math.round(progressPercent) }}%
            </div>
          </div>
        </div>

        <!-- Collapse / close (mobile) -->
        <div class="flex flex-col items-center gap-2 self-start pt-1">
          <UButton
            class="sm:hidden"
            :icon="expanded ? 'i-lucide-chevron-down' : 'i-lucide-chevron-up'"
            color="neutral"
            variant="ghost"
            size="xs"
            square
            aria-label="Toggle expanded"
            @click="toggleExpanded"
          />
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="xs"
            square
            aria-label="Clear player"
            class="opacity-70 hover:opacity-100"
            @click="player.clear"
          />
        </div>
      </div>

  <!-- Expanded extras (additional controls) -->
      <Transition name="fade">
        <div v-if="expanded" class="px-4 pb-4">
          <div class="grid gap-4 sm:grid-cols-3">
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-volume-2" class="h-4 w-4 text-neutral-500" />
              <USlider
                v-model="volume"
                :min="0"
                :max="1"
                :step="0.01"
                size="sm"
                color="neutral"
                aria-label="Volume"
                class="w-40"
              />
              <span class="w-6 text-right text-[10px] text-neutral-500 tabular-nums">{{ Math.round(volume * 100) }}</span>
            </div>
            <div class="col-span-2 flex items-center justify-end gap-3 text-[11px] text-neutral-500">
              <span>{{ player.queue.length }} in queue</span>
              <span v-if="album" class="hidden sm:inline">• {{ album }}</span>
              <button
                class="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-neutral-600 ring-1 ring-neutral-300/60 hover:bg-neutral-100 dark:text-neutral-300 dark:ring-neutral-700 dark:hover:bg-neutral-800"
                @click="toggleExpanded"
              >
                <UIcon name="i-lucide-minimize-2" class="h-3 w-3" />
                Collapse
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- integrated safe-area pad to keep vertical centering -->
    </div>
  </div>
</template>

<style scoped>
.global-player {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 50;
  backdrop-filter: blur(14px);
  padding-bottom: env(safe-area-inset-bottom);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
