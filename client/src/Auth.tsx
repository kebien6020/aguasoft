export default class Auth {
  login(): void {
    location.href = '/login'
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
    const expiresAtStr = localStorage.getItem('expires_at')
    if (expiresAtStr) {
      const expiresAt = JSON.parse(expiresAtStr) as number
      return new Date().getTime() < expiresAt
    }

    return false
  }

  getAccessToken(): string {
    const accessToken = localStorage.getItem('access_token')
    if (!accessToken)
      throw new Error('No access token found')

    return accessToken
  }
}
