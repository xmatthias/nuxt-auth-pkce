import {
  PublicClientApplication,
  BrowserCacheLocation,
  EventType,
  type Configuration,
  NavigationClient,
  type NavigationOptions,
  type AuthenticationResult,
  type AccountInfo,
} from '@azure/msal-browser'
import type { Router } from 'vue-router'
import { ref } from 'vue'
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
const isAuthenticated = ref<boolean | null>(null)
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
  const scopes = [`${clientId}/access_as_user`, ...(authConfig.scopes || [])]

  function setupTokenExpirationTimer() {
    const accounts = msalInstance.getAllAccounts()
    if (accounts.length > 0) {
      const account = accounts[0]
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
    catch (err) {
      console.error('Token refresh error:', err)
      signOut(account.homeAccountId)
    }
  }

  function handleResponse(resp: AuthenticationResult | null) {
    if (resp?.account)
      setupTokenExpirationTimer()
    else {
      setupTokenExpirationTimer()
      getTokenSilent(true)
    }
  }

  async function setUser() {
    const accounts = getAccounts()
    if (accounts.length === 0) {
      isAuthenticated.value = false
      return
    }
    const account = accounts[0]
    user.value = {
      access_token: credentials?.accessToken ?? '',
      username: account.username ?? '',
      name: account.name ?? '',
      roles: account.idTokenClaims?.roles || [],
    }
    isAuthenticated.value = true
  }

  async function handleRedirectResponse() {
    const accessToken = await getTokenSilent()
    const isAuthenticated_ = isAuthenticated && accessToken
    if (isAuthenticated_) {
      // console.log('Authenticated')
      await setUser()
    }
    else {
      isAuthenticated.value = false
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

    await msalInstance
      .handleRedirectPromise()
      .then(handleResponse)
      .catch((err) => {
        throw new Error(err)
      })

    msalInstance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS)
        setupTokenExpirationTimer()
    })
  }

  async function getTokenSilent(force = false) {
    if (!force && credentials?.expiresOn && credentials.expiresOn > new Date())
      return credentials.accessToken

    const accounts = msalInstance.getAllAccounts()
    if (accounts.length > 0) {
      const account = accounts[0]
      msalInstance.setActiveAccount(account)
      try {
        const response = await msalInstance.acquireTokenSilent({
          account,
          scopes,
        })
        credentials = response
        isAuthenticated.value = true
        return credentials.accessToken
      }
      catch (err) {
        console.error('Token silent error:', err)
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
    initializeAuth().then(() => {
      handleRedirectResponse()
    })
  }
  return {
    initializeAuth,
    user,
    signIn,
    getAccounts,
    isAuthenticated,
    signOut,
    getTokenSilent,
    handleRedirectResponse,
  }
}
