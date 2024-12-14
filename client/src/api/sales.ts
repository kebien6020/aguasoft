import Auth from '../Auth'
import { Sell } from '../models'
import { fetchJsonAuth, isErrorResponse } from '../utils'
import { NetworkError, ServerError } from './common'

export interface SaleForCreate {
  cash: boolean
  priceOverride: number
  quantity: number
  value: number
  clientId: number
  productId: number
  variantId?: number
  batchId?: number
}

interface CreateSalesReq {
  sells: SaleForCreate[]
}

export const createSales = async (sells: SaleForCreate[], auth: Auth): Promise<Sell[]> => {
  const body: CreateSalesReq = { sells }
  let res
  try {
    res = await fetchJsonAuth<Sell[]>('/api/sells/bulkNew', auth, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  } catch (e) {
    throw new NetworkError('crear las ventas')
  }

  if (isErrorResponse(res))
    throw new ServerError(res)

  return res
}
