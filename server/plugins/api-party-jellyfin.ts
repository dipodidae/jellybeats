import type { H3Event } from 'h3'

export default defineNitroPlugin((nitroApp) => {
  // @ts-expect-error custom api-party hook key not in NitroRuntimeHooks typing
  nitroApp.hooks.hook('api-party:request:jellyfin', (ctx: any, _event: H3Event) => {
    // Attach Jellyfin API key header securely server-side only
    const config = useRuntimeConfig()
    if (config.jellyfinApiKey) {
      ctx.options.headers.set('X-Emby-Token', String(config.jellyfinApiKey))
    }
  })
})
