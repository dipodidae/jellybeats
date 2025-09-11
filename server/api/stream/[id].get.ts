export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id = event.context.params?.id
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing track id' })
  }
  if (!config.jellyfinUrl || !config.jellyfinApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'Jellyfin not configured' })
  }

  // Build original Jellyfin direct stream URL (without exposing api key to client)
  const streamUrl = `${config.jellyfinUrl}/Audio/${id}/stream.mp3`

  // Proxy the stream so API key not visible. Include token via header.
  const resp = await fetch(streamUrl, {
    headers: { 'X-Emby-Token': config.jellyfinApiKey as string },
  })
  if (!resp.ok || !resp.body) {
    throw createError({ statusCode: resp.status, statusMessage: `Failed to fetch stream (${resp.status})` })
  }

  // Pass through relevant headers
  setHeader(event, 'Content-Type', resp.headers.get('Content-Type') || 'audio/mpeg')
  const length = resp.headers.get('Content-Length')
  if (length)
    setHeader(event, 'Content-Length', Number.parseInt(length, 10))

  return sendStream(event, resp.body)
})
