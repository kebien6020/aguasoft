import * as auth0 from 'auth0-js'
const baseUrl = window.location.origin
const domain = 'kevinpena.auth0.com'
const clientID = 'HIWjFo1TbHBO1nezMkcLew22aTYvBi7L'
const redirectUri = baseUrl + '/authCallback'
// For now, removed silent auth
// const silentRedirectUri = baseUrl + '/silentAuth'
const audience = 'https://soft.agualaif.com'
const scope = 'openid read:fullapi'

export default class Auth {
  auth0 = new auth0.WebAuth({
    domain,
    clientID,
    redirectUri,
    audience,
    responseType: 'token id_token',
    scope,
  })

  login(): void {
    this.auth0.authorize()
  }

  parseHash = (): Promise<auth0.Auth0DecodedHash> => {
    return new Promise((resolve, reject) => {
      this.auth0.parseHash({ hash: window.location.hash }, (err, authResult) => {
        if (err) {
          console.log(err)
          return reject(err)
        }
        // !err implies authResult !== null
        return resolve(authResult as auth0.Auth0DecodedHash)
      })
    })
  }

  renewAuth = (): Promise<auth0.Auth0DecodedHash> => {
    return new Promise((resolve, reject) => {
      this.auth0.renewAuth(
        {
          usePostMessage: false,
        },
        (err: auth0.Auth0Error | null, authResult: auth0.Auth0DecodedHash) => {
          if (err) {
            console.log(err)
            return reject(err)
          }
          return resolve(authResult)
        }
      )
    })
  }

  handleAuthentication = async (): Promise<void> => {
    const authResult = await this.parseHash()
    this.saveAuth(authResult)
  }

  setSession(authResult: auth0.Auth0DecodedHash): void {
    // Set the time that the access token will expire at
    if (authResult.expiresIn) {
      const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime())
      localStorage.setItem('expires_at', expiresAt)
    }

    if (authResult.accessToken)
      localStorage.setItem('access_token', authResult.accessToken)

    if (authResult.idToken)
      localStorage.setItem('id_token', authResult.idToken)
  }

  logout(): void {
    // Clear access token and ID token from local storage
    localStorage.removeItem('access_token')
    localStorage.removeItem('id_token')
    localStorage.removeItem('expires_at')
  }

  isAuthenticated(): boolean {
    // Check whether the current time is past the
    // access token's expiry time
    if (localStorage.expires_at) {
      const expiresAt = JSON.parse(localStorage.expires_at as string) as number
      return new Date().getTime() < expiresAt
    }

    return false
  }

  getAccessToken(): string {
    const accessToken = localStorage.getItem('access_token') ?? ''
    return accessToken
  }

  saveAuth(authResult: auth0.Auth0DecodedHash): void {
    console.log('Saving auth token to localStorage')
    if (authResult && authResult.accessToken && authResult.idToken) {
      this.setSession(authResult)
    } else {
      console.error('error with auth result', authResult)
      throw Error('Invalid authResult')
    }

  }

  renew = async (): Promise<true | void> => {
    try {
      this.getAccessToken()
      const authResult = await this.renewAuth()
      this.saveAuth(authResult)
      return true
    } catch (err) {
      // No previous access token: login
      return this.login()
    }
  }
}
