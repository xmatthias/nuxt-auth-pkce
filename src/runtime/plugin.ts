import { useAuth } from './composables/auth'
import { addRouteMiddleware, defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((_nuxtApp) => {
  addRouteMiddleware('auth', async (to) => {
    if (to.hash.startsWith('#code')) {
      // Only run if we're returning from the OAuth redirect

      const { handleRedirectResponse } = useAuth()
      await handleRedirectResponse()
    }
  }, {
    global: true,
  })
})
