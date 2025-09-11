import type { JellyfinItemsResponse, JellyfinTrack } from '../../../types/jellyfin'

// Fetch tracks for a playlist; relays minimal caching and validates essentials
export default defineEventHandler(async (event): Promise<JellyfinItemsResponse<JellyfinTrack>> => {
  const id = event.context.params?.id
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Missing playlist id' })

  const config = useRuntimeConfig() as any
  const userId = config.jellyfinUserId || config.public?.jellyfinUserId
  if (!userId)
    throw createError({ statusCode: 500, statusMessage: 'Missing Jellyfin user id' })

  const q = getQuery(event)
  const sortBy = typeof q.sortBy === 'string' && q.sortBy.length ? q.sortBy : 'SortName'

  const query: Record<string, string> = { UserId: String(userId) }
  if (sortBy !== 'SortName')
    query.SortBy = sortBy // only send non-default to keep cache key tight

  try {
    const data = await $jellyfin<JellyfinItemsResponse<JellyfinTrack>>(`Playlists/${id}/Items`, { query })
    setHeader(event, 'Cache-Control', 'public, max-age=30')
    return data
  }
  catch (e: any) {
    throw createError({
      statusCode: e?.statusCode || 500,
      statusMessage: e?.statusMessage || e?.message || 'Failed to load playlist items',
    })
  }
})
