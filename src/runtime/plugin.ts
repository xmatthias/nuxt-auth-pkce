import { useAuth } from './composables/auth'
import type { ModuleOptions } from '~/src/module'
import { addRouteMiddleware, useRuntimeConfig, defineNuxtPlugin, navigateTo, useRouter } from '#app'

export default defineNuxtPlugin((_nuxtApp) => {
  const moduleConfig = useRuntimeConfig().public.authPkce as ModuleOptions['public']
  const redirectURI = moduleConfig.entra?.redirectUri || '/'
  if (redirectURI !== '/') {
    // Define a route for the redirect URI to avoid 404s
    const router = useRouter()
    router.addRoute({ path: redirectURI, name: 'auth-redirect', redirect: '/' })
  }

  addRouteMiddleware('auth', async (to) => {
    if (to.hash.startsWith('#code')) {
      // Only run if we're returning from the OAuth redirect

      const { handleRedirectResponse } = useAuth()
      await handleRedirectResponse()
    }
    if (to.hash.startsWith('#code')) {
      // If #code wasn't removed by MSAL, do this ourselfs.
      return navigateTo(to.path)
    }
  }, {
    global: true,
  })

  const { fetchAuth } = useAuth()

  return {
    provide: {
      fetchAuth,
    },
  }
})
