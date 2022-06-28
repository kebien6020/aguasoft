import Auth from './Auth'

const apiUrl = ''

export interface FetchAuthOptions extends RequestInit {
  // allow to override fetch for testing purposes
  fetch?: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>
  retry?: boolean // when true we are retrying the request
}

export async function fetchJsonAuth<R = SuccessResponse>(
  url: string,
  auth: Auth,
  options: FetchAuthOptions = {}
) : Promise<R|ErrorResponse> {

  const fetch = options.fetch || window.fetch

  const baseHeaders = {
    Authorization: 'bearer ' + auth.getAccessToken(),
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }


  const opts = options || {}

  const headers = Object.assign({}, baseHeaders, opts.headers)
  const allOpts: RequestInit = Object.assign({}, options, { headers, credentials: 'include' })

  const response = await fetch(apiUrl + url, allOpts)
  const data = await response.json() as R|ErrorResponse

  const invalidToken = !auth.isAuthenticated()
  const authError =
    isErrorResponse(data)
    && data.error.errors?.[0]?.name === 'UnauthorizedError'

  // In case of token error try renewing it with silentAuth and retry
  if (invalidToken || authError) {

    const success = await auth.renew()

    if (success && !opts.retry) {
      // retry
      const newOpts = Object.assign({}, options, { retry: true })
      return fetchJsonAuth(url, auth, newOpts)
    } else {
      // silent auth failed, let's do a flashy auth
      auth.login()
      return { success: false, error: { code: 'not_authenticated', message: 'No autenticado' } }
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
      name: string
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
  data: unknown | ErrorResponse
): data is ErrorResponse {
  return (data as ErrorResponse)?.success === false
}

// Adapted from https://stackoverflow.com/a/149099/4992717
export function money(
  num: number,
  decimals = 0,
  decSep = ',',
  thouSep = ',',
  showSign = false
): string {
  const sign = num < 0 ? '-' : (showSign ? '+' : '')
  const absFixed = Math.abs(Number(num) || 0).toFixed(decimals)
  const integerPart = String(parseInt(absFixed))
  const headLen = integerPart.length > 3 ? integerPart.length % 3 : 0
  const numHeadWithSep = headLen ? integerPart.substr(0, headLen) + thouSep : ''
  const numRestWithSep = integerPart
    .substr(headLen)
    .replace(/(\d{3})(?=\d)/g, '$1' + thouSep)
  const decimalsStr = Math.abs(Number(absFixed) - Number(integerPart))
    .toFixed(decimals)
    .slice(2)
  return (
    '$\u00A0'
    + sign
    + numHeadWithSep
    + numRestWithSep
    + (decimals ? decSep + decimalsStr : '')
  )
}

export function moneySign(
  num: number,
  decimals?: number,
  decSep?: string,
  thouSep?: string
): string {
  return money(num, decimals, decSep, thouSep, true)
}

export type ParamValue = string | number | undefined
export type Param = ParamValue | readonly ParamValue[]
export type Params = {[idx:string]: Param}

function isValueArr(param: Param) : param is readonly ParamValue[] {
  return Array.isArray(param)
}

const appendParam = (search: URLSearchParams, key: string, val: ParamValue) => {
  if (val !== undefined)
    search.append(key, String(val))

}

export function paramsToString(params?: Params): string {
  const searchParams = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (isValueArr(val)) {
        key += '[]'
        val.forEach(s => appendParam(searchParams, key, s))
        return
      }

      appendParam(searchParams, key, val)
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

export function isNumber(value: unknown): boolean {
  return !isNaN(Number(value))
}

// https://stackoverflow.com/a/51828976
export function scrollToRef<T extends HTMLElement>(ref: React.RefObject<T>): void {
  if (ref.current)
    window.scrollTo(0, ref.current.offsetTop)
}

export const sleep = (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms))
