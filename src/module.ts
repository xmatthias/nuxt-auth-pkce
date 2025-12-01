import { defineNuxtModule, addPlugin, createResolver, addImports, addComponentsDir } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {
  public: {
    entra: {
      /** The Tenant ID of your Azure AD */
      tenantId: string
      /** The Client ID of your Azure AD application */
      clientId: string
      /** OAuth scopes to request */
      scopes?: string[]
      /** Redirect URI after authentication */
      redirectUri?: string
      /**
       * Set a timeout to refresh the token periodically
       * Necessary if user.value.access_token is used directly in the app
       */
      usePeriodicTokenRefresh?: boolean
    }
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'auth-pkce',
    configKey: 'authPkce',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  // Default configuration options of the Nuxt module
  defaults: {
    public: {
      entra: {
        tenantId: '',
        clientId: '',
        scopes: ['User.Read'],
        redirectUri: '/auth/callback',
        usePeriodicTokenRefresh: false,
      },
    },
  },
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugin'))

    _nuxt.options.runtimeConfig.public.authPkce = _options.public

    addImports({ name: 'useAuth', from: resolver.resolve('./runtime/composables/auth') })

    addComponentsDir({ path: resolver.resolve('./runtime/components') })

    // Ensure proper Vite optimization
    _nuxt.options.vite.optimizeDeps ||= {}
    _nuxt.options.vite.optimizeDeps.include ||= []
    if (!_nuxt.options.vite.optimizeDeps.include.includes('nuxt-auth-pkce > @azure/msal-browser')) {
      _nuxt.options.vite.optimizeDeps.include.push('nuxt-auth-pkce > @azure/msal-browser')
    }
  },
})
