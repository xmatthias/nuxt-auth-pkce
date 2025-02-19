import { useAuth } from './composables/auth'
import { addRouteMiddleware, defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((_nuxtApp) => {
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
