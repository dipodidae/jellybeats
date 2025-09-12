import { env } from 'node:process'
import { pwa } from './app/config/pwa'
import { appDescription } from './app/constants/index'

export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@nuxt/eslint',
    '@nuxt/ui-pro',
    'nuxt-api-party',
  ],

  devtools: {
    enabled: true,
  },

  app: {
    head: {
      viewport: 'width=device-width,initial-scale=1',
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: appDescription },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'theme-color', media: '(prefers-color-scheme: light)', content: 'white' },
        { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#222222' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    jellyfinUrl: env.NUXT_JELLYFIN_URL,
    jellyfinApiKey: env.NUXT_JELLYFIN_API_KEY,
    jellyfinUserId: env.NUXT_JELLYFIN_USER_ID,
    public: {
      jellyfinUserId: env.NUXT_PUBLIC_JELLYFIN_USER_ID || env.NUXT_JELLYFIN_USER_ID,
    },
  },

  future: {
    compatibilityVersion: 4,
  },

  experimental: {
    // when using generate, payload js assets included in sw precache manifest
    // but missing on offline, disabling extraction it until fixed
    payloadExtraction: false,
    renderJsonPayloads: true,
    typedPages: true,
  },

  compatibilityDate: '2024-08-14',

  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    prerender: {
      crawlLinks: false,
      routes: ['/'],
    },
  },

  // nuxt-api-party module configuration (static, not in runtimeConfig!)
  apiParty: {
    endpoints: {
      jellyfin: {
        // Provide a default empty string so type is always string; actual value should be set via env var
        url: env.NUXT_API_PARTY_ENDPOINTS_JELLYFIN_URL || env.NUXT_JELLYFIN_URL || '',
        schema: 'https://api.jellyfin.org/openapi/jellyfin-openapi-stable.json',
      },
    },
  },

  eslint: {
    config: {
      standalone: false,
      nuxt: {
        sortConfigKeys: true,
      },
    },
  },

  pwa,
})
