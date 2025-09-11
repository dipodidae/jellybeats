import type { JellyfinBaseItem, JellyfinItemsResponse, JellyfinPlaylist } from '../../types/jellyfin'
import { env } from 'node:process'

// Single in-memory cache for resolved playlists library id
let cachedPlaylistsLibraryId: string | null = null

export default defineEventHandler(async (event): Promise<JellyfinItemsResponse<JellyfinPlaylist>> => {
  const config = useRuntimeConfig()
  const userId = config.jellyfinUserId || (config.public as any)?.jellyfinUserId
  if (!config.jellyfinUrl || !userId) {
    throw createError({ statusCode: 500, statusMessage: 'Jellyfin not configured' })
  }

  const q = getQuery(event)
  const limit = Math.min(Number(q.limit ?? 100), 200)
  const startIndex = Math.max(Number(q.startIndex ?? 0), 0)

  // Optional override (deployment convenience)
  const envLibraryId = (env.NUXT_PLAYLISTS_LIBRARY_ID || '').trim() || null
  let libraryId = envLibraryId || cachedPlaylistsLibraryId

  if (!libraryId) {
  // Resolve collection folders and locate playlists folder
    const libs = await $jellyfin<JellyfinItemsResponse<JellyfinBaseItem>>(
      `Users/${userId}/Items`,
      { query: { IncludeItemTypes: 'CollectionFolder' } },
    )
    const playlistsLib = libs.Items.find(
      (item: JellyfinBaseItem) => item.Name?.toLowerCase() === 'playlists' || item.Id === '1071671e7bffa0532e930debee501d2e',
    )
    if (!playlistsLib) {
      throw createError({ statusCode: 404, statusMessage: 'Playlists library not found' })
    }
    libraryId = playlistsLib.Id
    cachedPlaylistsLibraryId = libraryId
  }

  const query = {
    IncludeItemTypes: 'Playlist',
    Recursive: true,
    SortBy: 'SortName',
    ParentId: libraryId,
    StartIndex: startIndex,
    Limit: limit,
  }

  try {
    const data = await $jellyfin<JellyfinItemsResponse<JellyfinPlaylist>>(
      `Users/${userId}/Items`,
      { query },
    )
    setHeader(event, 'Cache-Control', 'public, max-age=60')
    return data
  }
  catch (e: any) {
    throw createError({
      statusCode: e?.statusCode || 500,
      statusMessage: e?.statusMessage || e?.message || 'Failed to load playlists',
    })
  }
})
