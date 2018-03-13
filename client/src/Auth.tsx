import * as auth0 from 'auth0-js'
const baseUrl = 'http://localhost:3000'
const domain = 'kevinpena.auth0.com'
const clientID = 'HIWjFo1TbHBO1nezMkcLew22aTYvBi7L'
const redirectUri = baseUrl + '/authCallback'
const silentRedirectUri = baseUrl + '/silentAuth'
const audience = 'https://soft.agualaif.com'
const scope = 'openid read:fullapi'

export default class Auth {
  auth0 = new auth0.WebAuth({
    domain,
    clientID,
    redirectUri,
    audience,
    responseType: 'token id_token',
    scope
  })

  login() {
    this.auth0.authorize()
  }

  parseHash = () : Promise<auth0.Auth0DecodedHash> => {
    return new Promise((resolve, reject) => {
      this.auth0.parseHash({hash: window.location.hash}, (err, authResult) => {
        if (err) {
          console.log(err)
          return reject(err)
        }
        return resolve(authResult)
      })
    })
  }

  renewAuth = () => {
    return new Promise((resolve, reject) => {
      this.auth0.renewAuth(
        {
          redirectUri: silentRedirectUri,
          usePostMessage: true,
        },
        (err, authResult) => {
          if (err) {
            console.log(err)
            return reject(err)
          }
          return resolve(authResult)
        }
      )
    })
  }

  handleAuthentication = async() => {
    const authResult = await this.parseHash()
    this.saveAuth(authResult)
  }

  setSession(authResult: auth0.Auth0DecodedHash) {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime())
    localStorage.setItem('access_token', authResult.accessToken)
    localStorage.setItem('id_token', authResult.idToken)
    localStorage.setItem('expires_at', expiresAt)
  }

  logout() {
    // Clear access token and ID token from local storage
    localStorage.removeItem('access_token')
    localStorage.removeItem('id_token')
    localStorage.removeItem('expires_at')
  }

  isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'))
    return new Date().getTime() < expiresAt
  }

  getAccessToken() {
    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) {
      throw new Error('No access token found')
    }
    return accessToken
  }

  saveAuth(authResult: auth0.Auth0DecodedHash) {
    if (authResult && authResult.accessToken && authResult.idToken) {
      this.setSession(authResult)
    } else {
      throw Error('Invalid authResult')
    }
  }

  renew = async () => {
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
