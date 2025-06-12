import { defineNuxtModule, addPlugin, createResolver, addImports, addComponentsDir } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {
  public: {
    entra: {
      tenantId: string
      clientId: string
      scopes?: string[]
      redirectUri?: string
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
    if (!_nuxt.options.vite.optimizeDeps.include.includes('@azure/msal-browser')) {
      _nuxt.options.vite.optimizeDeps.include.push('@azure/msal-browser')
    }
  },
})
