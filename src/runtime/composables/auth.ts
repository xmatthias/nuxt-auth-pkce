import {
  PublicClientApplication,
  BrowserCacheLocation,
  EventType,
  NavigationClient,
  InteractionRequiredAuthError,
  type Configuration,
  type NavigationOptions,
  type AuthenticationResult,
  type AccountInfo,
} from '@azure/msal-browser'
import type { Router } from 'vue-router'
import { ref, computed } from 'vue'
import type { User } from '../types/user'
import { useRouter, useRuntimeConfig } from '#app'
import type { ModuleOptions } from '~/src/module'

class CustomNavigationClient extends NavigationClient {
  private router: Router

  constructor(router: Router) {
    super()
    this.router = router
  }

  override async navigateInternal(url: string, options: NavigationOptions) {
    const relativePath = url.replace(window.location.origin, '')
    if (options.noHistory)
      this.router.replace(relativePath)
    else
      this.router.push(relativePath)

    return false
  }
}

export const user = ref<User | null>(null)
const initialized = ref(false)
let msalInstance: PublicClientApplication

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let tokenExpirationTimer: any
let credentials: AuthenticationResult | null = null

export function useAuth() {
  const router = useRouter()
  const moduleConfig: ModuleOptions['public'] = useRuntimeConfig().public.authPkce as ModuleOptions['public']
  const authConfig = moduleConfig.entra

  const tenantId: string = authConfig.tenantId as string
  const clientId: string = authConfig.clientId as string
  const scopes = [...(authConfig.scopes || [])]

  const isAuthenticated = computed<boolean>(() => {
    return !!user.value && !!user.value.access_token
  })

  function setupTokenExpirationTimer() {
    if (!authConfig.usePeriodicTokenRefresh)
      // Don't periodically refresh the token unless configured to do so
      return
    const account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0]
    if (account) {
      if (account.idTokenClaims && account.idTokenClaims.exp) {
        const tokenExpirationTime = account.idTokenClaims.exp * 1000
        const currentTime = Date.now()
        const timeUntilExpiration = tokenExpirationTime - currentTime

        clearTimeout(tokenExpirationTimer)

        tokenExpirationTimer = setTimeout(() => {
          refreshAccessToken(account)
        }, timeUntilExpiration)
      }
    }
  }

  async function refreshAccessToken(account: AccountInfo) {
    try {
      const response = await msalInstance.acquireTokenSilent({
        account,
        scopes,
      })

      if (user.value)
        user.value.access_token = response.accessToken

      setupTokenExpirationTimer()
    }
    catch (err: unknown) {
      console.error('Token refresh error:', err)
      if (err instanceof InteractionRequiredAuthError)
        return msalInstance.acquireTokenRedirect ({ scopes })

      await signOut(account.homeAccountId)
    }
  }

  async function handleResponse(resp: AuthenticationResult | null) {
    const account = resp?.account ?? msalInstance.getActiveAccount() ?? getAccounts()[0]
    if (!account)
      return

    msalInstance.setActiveAccount(account)
    await setUser(account)
    setupTokenExpirationTimer()
  }

  async function setUser(account?: AccountInfo) {
    const targetAccount = account ?? getAccounts()[0]
    if (!targetAccount)
      return

    msalInstance.setActiveAccount(targetAccount)
    await getTokenSilent(true)

    user.value = {
      access_token: credentials?.accessToken ?? '',
      username: targetAccount.username ?? '',
      name: targetAccount.name ?? '',
      roles: targetAccount.idTokenClaims?.roles || [],
    }
  }

  async function initializeAuth() {
    if (msalInstance) {
      return
    }
    const msalConfig: Configuration = {
      auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        redirectUri: authConfig.redirectUri,
        postLogoutRedirectUri: '/',
        navigateToLoginRequestUrl: true,
      },
      cache: {
        cacheLocation: BrowserCacheLocation.LocalStorage,
        storeAuthStateInCookie: true,
      },
      system: {
        tokenRenewalOffsetSeconds: 300,
        navigationClient: new CustomNavigationClient(router),
      },
    }

    msalInstance = new PublicClientApplication(msalConfig)
    await msalInstance.initialize()

    const redirectResponse = await msalInstance.handleRedirectPromise().catch((err) => {
      throw new Error(err)
    })
    await handleResponse(redirectResponse)

    msalInstance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS)
        setupTokenExpirationTimer()
    })
  }

  async function getTokenSilent(force = false) {
    if (!force && credentials?.expiresOn && credentials.expiresOn > new Date())
      return credentials.accessToken

    const account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0]
    if (account) {
      msalInstance.setActiveAccount(account)
      try {
        const response = await msalInstance.acquireTokenSilent({
          account,
          scopes,
        })
        credentials = response
        return credentials.accessToken
      }
      catch (err: unknown) {
        console.error('Token silent error:', err)
        if (err instanceof InteractionRequiredAuthError)
          await msalInstance.loginRedirect({ scopes })

        return null
      }
    }
    else {
      console.error('No accounts found')
      return null
    }
  }

  async function signIn() {
    await initializeAuth()

    try {
      await msalInstance.loginRedirect({ scopes })
    }
    catch (err) {
      console.log('Login error:', err)
    }
  }

  function getAccounts() {
    return msalInstance.getAllAccounts()
  }

  async function signOut(accountId?: string) {
    const account = accountId
      ? msalInstance.getAllAccounts({ homeAccountId: accountId })[0]
      : getAccounts()[0]
    if (account) {
      await msalInstance.logoutRedirect({
        account,
      })
      localStorage.clear()
    }
    else {
      console.error('Account not found')
    }
  }

  // Initialize the auth instance asynchonously
  if (!initialized.value) {
    initialized.value = true
    initializeAuth().then(async () => {
      await setUser()
    })
  }

  const fetchAuth = $fetch.create({
    async onRequest({ options }) {
      const token = await getTokenSilent()
      if (token)
        options.headers.set('Authorization', `Bearer ${token}`)
    },
  })

  return {
    initializeAuth,
    user,
    signIn,
    getAccounts,
    isAuthenticated,
    signOut,
    getTokenSilent,
    handleRedirectResponse: setUser,
    fetchAuth,
  }
}
