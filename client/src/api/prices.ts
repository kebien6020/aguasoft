import Auth from '../Auth'
import { Price } from '../models'
import { ErrorResponse, Params, fetchJsonAuth, isErrorResponse, paramsToString } from '../utils'
import { NetworkError, ServerError } from './common'


export const fetchPrices = async (clientId: number, auth: Auth, params: Params = {}): Promise<Price[]> => {
  const url = `/api/prices/${clientId}?${paramsToString(params)}`
  let res: Price[] | ErrorResponse

  try {
    res = await fetchJsonAuth<Price[]>(url, auth)
  } catch (e) {
    throw new NetworkError('obtener los precios')
  }

  if (isErrorResponse(res))
    throw new ServerError(res)

  return res
}

