import Auth from './Auth'

const apiUrl = ''

export interface FetchAuthOptions extends RequestInit {
  fetch?: Function // allow to override fetch for testing purposes
  retry?: boolean  // when true we are retrying the request
}

export async function fetchJsonAuth(
  url: string,
  auth: Auth,
  options: FetchAuthOptions = {}
) : Promise<any> {
  const fetch = options.fetch || window.fetch

  const baseHeaders = {
    'Authorization': 'bearer ' + auth.getAccessToken(),
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }


  const opts = options || {}

  const headers = Object.assign({}, baseHeaders, opts.headers)
  const allOpts: RequestInit = Object.assign({}, options, {headers, credentials: 'include'})

  const response = await fetch(apiUrl + url, allOpts)
  const data = await response.json()

  // In case of token error try renewing it with silentAuth and retry
  if (data.success === false && data.error.name === 'UnauthorizedError') {

    const success = await auth.renew()

    if (success && !opts.retry) {
      // retry
      const newOpts = Object.assign({}, options, {retry: true})
      return fetchJsonAuth(url, auth, newOpts)
    } else {
      // silent auth failed, let's do a flashy auth
      auth.login()
      return null
    }

  }

  return data
}

// Adapted from https://stackoverflow.com/a/149099/4992717
export function money(num: number, decimals: number = 0, decSep: string = ',', thouSep: string = ','): string {
  let n: (string|number) = num
  const c = decimals
  const d = decSep
  const t = thouSep
  const s = n < 0 ? "-" : ""
  const i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c)))
  const j = i.length > 3 ? i.length % 3 : 0;
  return '$ ' + s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(Number(n) - Number(i)).toFixed(c).slice(2) : "");
 }
