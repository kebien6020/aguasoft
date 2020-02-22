import Auth from './Auth'

const apiUrl = ''

export interface FetchAuthOptions extends RequestInit {
  fetch?: Function // allow to override fetch for testing purposes
  retry?: boolean  // when true we are retrying the request
}

export async function fetchJsonAuth<R = SuccessResponse>(
  url: string,
  auth: Auth,
  options: FetchAuthOptions = {}
) : Promise<R|ErrorResponse> {

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

  const invalidToken = !auth.isAuthenticated()
  const authError =
    data.success === false
    && data.error
    && data.error.errors
    && data.error.errors.name === 'UnauthorizedError'

  // In case of token error try renewing it with silentAuth and retry
  if (invalidToken || authError) {

    const success = await auth.renew()

    if (success && !opts.retry) {
      // retry
      const newOpts = Object.assign({}, options, {retry: true})
      return fetchJsonAuth(url, auth, newOpts)
    } else {
      // silent auth failed, let's do a flashy auth
      auth.login()
      return {success:false, error: {code: 'not_authenticated', message: 'No autenticado'}}
    }

  }

  return data
}

export interface ErrorResponse {
  success: false
  error: {
    message: string
    code: string
    // On validation_error
    errors?: {
      path: string
    }[]
  }
}

type ErrorResponseError = ErrorResponse['error']
export interface NotEnoughInSourceError extends ErrorResponseError {
  storageId?: number
  storageCode?: string
  storageName?: string

  inventoryElementId?: number
  inventoryElementCode?: string
  inventoryElementName?: string
}

export interface SuccessResponse {
  success: true
}

export function isErrorResponse(
  data: object | ErrorResponse): data is ErrorResponse
{
  return (data as ErrorResponse).success === false
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
  return '$\u00A0' + s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(Number(n) - Number(i)).toFixed(c).slice(2) : "");
}

export type ParamValue = string | number
export type Param = ParamValue | readonly ParamValue[]
export type Params = {[idx:string]: Param}

function isValueArr(param: Param) : param is readonly ParamValue[]  {
  return Array.isArray(param)
}

export function paramsToString(params?: Params) {
  const searchParams = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (isValueArr(val)) {
        key += '[]'
        val.forEach(s => searchParams.append(key, String(s)))
        return
      }

      searchParams.append(key, String(val))
    })
  }

  return searchParams.toString()
}

export function parseParams(str: string) : {[idx: string]: string | undefined} {
  return str
    .slice(1)
    .split('&')
    .map((pairStr: string) => pairStr.split('='))
    .reduce((obj: {[key:string]: string}, pair: string[]) => {
      obj[pair[0]] = pair[1]
      return obj
    }, {})
}

export function isNumber(value: any) {
  return !isNaN(Number(value));
}

// https://stackoverflow.com/a/51828976
export function scrollToRef<T extends HTMLElement>(ref: React.RefObject<T>) {
  if (ref.current)
    window.scrollTo(0, ref.current.offsetTop)
}
