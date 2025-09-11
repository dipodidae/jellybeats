import type { JellyfinItemsResponse, JellyfinPlaylist } from '../../types/jellyfin'

export default defineEventHandler(async (): Promise<JellyfinItemsResponse<JellyfinPlaylist>> => {
  const config = useRuntimeConfig()
  if (!config.jellyfinUrl || !config.jellyfinApiKey || !config.jellyfinUserId) {
    throw createError({ statusCode: 500, statusMessage: 'Jellyfin not configured' })
  }

  const url = `${config.jellyfinUrl}/Users/${config.jellyfinUserId}/Items` as const
  const query = new URLSearchParams({ IncludeItemTypes: 'Playlist' })

  return await $fetch<JellyfinItemsResponse<JellyfinPlaylist>>(`${url}?${query.toString()}`, {
    headers: { 'X-Emby-Token': config.jellyfinApiKey as string },
  })
})
