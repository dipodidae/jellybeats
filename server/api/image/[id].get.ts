export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Missing image id' })

  const config = useRuntimeConfig()
  const token = config.jellyfinApiKey
  const base = config.jellyfinUrl
  if (!base || !token)
    throw createError({ statusCode: 500, statusMessage: 'Jellyfin not configured' })

  // Query parameters for transformations (quality, dimensions, tag)
  const q = getQuery(event)
  const tag = typeof q.tag === 'string' ? q.tag : undefined
  const fillHeight = typeof q.fillHeight === 'string' ? q.fillHeight : undefined
  const fillWidth = typeof q.fillWidth === 'string' ? q.fillWidth : undefined
  const quality = typeof q.quality === 'string' ? q.quality : '85'
  const format = typeof q.format === 'string' ? q.format : undefined

  const params = new URLSearchParams()
  if (tag)
    params.set('tag', tag)
  if (fillHeight)
    params.set('fillHeight', fillHeight)
  if (fillWidth)
    params.set('fillWidth', fillWidth)
  if (quality)
    params.set('quality', quality)
  if (format)
    params.set('format', format)

  const imgUrl = `${base}/Items/${id}/Images/Primary${params.toString() ? `?${params.toString()}` : ''}`

  try {
    const resp = await fetch(imgUrl, { headers: { 'X-Emby-Token': token as string } })
    if (!resp.ok || !resp.body)
      throw createError({ statusCode: resp.status, statusMessage: `Failed to fetch image (${resp.status})` })

    // Pass through content type & caching hints
    const contentType = resp.headers.get('Content-Type') || 'image/jpeg'
    setHeader(event, 'Content-Type', contentType)
    const cacheControl = resp.headers.get('Cache-Control') || 'public, max-age=86400'
    setHeader(event, 'Cache-Control', cacheControl)

    return sendStream(event, resp.body)
  }
  catch (e: any) {
    if (e?.statusCode)
      throw e
    throw createError({ statusCode: 500, statusMessage: e?.message || 'Image proxy error' })
  }
})
