import type { JellyfinItemsResponse, JellyfinTrack } from '../../../types/jellyfin'

export default defineEventHandler(async (event): Promise<JellyfinItemsResponse<JellyfinTrack>> => {
  const config = useRuntimeConfig()
  const id = event.context.params?.id
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing playlist id' })
  }
  if (!config.jellyfinUrl || !config.jellyfinApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'Jellyfin not configured' })
  }

  const url = `${config.jellyfinUrl}/Playlists/${id}/Items`
  return await $fetch<JellyfinItemsResponse<JellyfinTrack>>(url, {
    headers: { 'X-Emby-Token': config.jellyfinApiKey as string },
  })
})
