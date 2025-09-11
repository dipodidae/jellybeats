export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Missing track id' })

  const config = useRuntimeConfig()
  const token = config.jellyfinApiKey
  const base = config.jellyfinUrl
  if (!base || !token)
    throw createError({ statusCode: 500, statusMessage: 'Jellyfin not configured' })

  // Handle optional HTTP Range for seeking
  const range = getRequestHeader(event, 'range')
  const streamUrl = `${base}/Audio/${id}/stream.mp3`
  try {
    const resp = await fetch(streamUrl, {
      headers: {
        'X-Emby-Token': token as string,
        ...(range ? { Range: range } : {}),
      },
    })
    if (!resp.ok || !resp.body) {
      throw createError({ statusCode: resp.status, statusMessage: `Failed to fetch stream (${resp.status})` })
    }

    // Pass through core headers
    const contentType = resp.headers.get('Content-Type') || 'audio/mpeg'
    setHeader(event, 'Content-Type', contentType)
    const acceptRanges = resp.headers.get('Accept-Ranges')
    if (acceptRanges)
      setHeader(event, 'Accept-Ranges', acceptRanges)
    const contentRange = resp.headers.get('Content-Range')
    if (contentRange)
      setHeader(event, 'Content-Range', contentRange)
    const length = resp.headers.get('Content-Length')
    if (length)
      setHeader(event, 'Content-Length', Number.parseInt(length, 10))

    // If partial content, mirror status 206
    if (resp.status === 206)
      event.node.res.statusCode = 206

    return sendStream(event, resp.body)
  }
  catch (e: any) {
    if (e?.statusCode)
      throw e
    throw createError({ statusCode: 500, statusMessage: e?.message || 'Stream proxy error' })
  }
})
