// Shared time / duration formatting helpers
// Jellyfin RunTimeTicks: 10,000,000 per second

export function ticksToSeconds(ticks?: number | null): number {
  if (!ticks || ticks <= 0)
    return 0
  return Math.floor(ticks / 10_000_000)
}

export function formatSeconds(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0)
    return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function formatFromTicks(ticks?: number | null): string {
  return formatSeconds(ticksToSeconds(ticks))
}
