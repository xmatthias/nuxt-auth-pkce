<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: Auth PKCE module
- Package name: nuxt-auth-pkce
- Description: Nuxt auth module for SPA with PKCE
-->

# Auth PKCE

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

My new Nuxt module for doing amazing things.


## Setup

1. Add the `nuxt-auth-pkce` dependency to your Nuxt.js project:

```bash
npm install nuxt-auth-pkce
# or
yarn add nuxt-auth-pkce
```

2. Add `nuxt-auth-pkce` to the `modules` section of `nuxt.config.js`:

```js
{
  modules: [
    'nuxt-auth-pkce',
  ],
  authPkce: {
    // Options
  }
}
```

3. Register your application in Azure AD and configure it as a SPA. Make sure to add the redirect URI `http://localhost:3000/auth/callback` to the app registration - as well as the URL you will be using in production.


4. Create a `.env` file in the root of your project and add the following:

```bash
NUXT_PUBLIC_AUTH_PKCE_CLIENT_ID="your-client-id"
NUXT_PUBLIC_AUTH_PKCE_TENANT_ID="your-tenant-id"
```


5. Use the `AuthGate` component in your application

``` vue
<template>
  <AuthGate auto-login>
    <div>
      <h1>My secret content</h1>
    </div>
  </AuthGate>
</template>
```


- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/nuxt-auth-pkce?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

<!-- Highlight some of the features your module provide here -->
- ⛰ &nbsp;Foo
- 🚠 &nbsp;Bar
- 🌲 &nbsp;Baz

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxi module add nuxt-auth-pkce
```

That's it! You can now use My Module in your Nuxt app ✨


## Contribution

<details>
  <summary>Local development</summary>

  ```bash
  # Install dependencies
  npm install

  # Generate type stubs
  npm run dev:prepare

  # Develop with the playground
  npm run dev

  # Build the playground
  npm run dev:build

  # Run ESLint
  npm run lint

  # Run Vitest
  npm run test
  npm run test:watch

  # Release new version
  npm run release
  ```

</details>


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-auth-pkce/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-auth-pkce

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-auth-pkce.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/nuxt-auth-pkce

[license-src]: https://img.shields.io/npm/l/nuxt-auth-pkce.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-auth-pkce

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
