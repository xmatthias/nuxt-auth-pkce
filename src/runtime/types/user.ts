export interface User {
  username: string
  name: string
  /** deprecated - use getTokenSilent() instead */
  access_token: string
  roles: string[]
}
