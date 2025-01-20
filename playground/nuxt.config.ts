export default defineNuxtConfig({
  modules: ['../src/module'],
  ssr: false,
  devtools: { enabled: true },
  compatibilityDate: '2025-01-10',
  authPkce: {
    public: {
      entra: {
        clientId: 'your-client',
        tenantId: 'your-tenant-id',
      },
    },
  },
})
