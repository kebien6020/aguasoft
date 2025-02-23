import type { Payment } from '../../models'
import { Params, paramsToString } from '../../utils'
import useFetch from '../useFetch'
import { useNonce } from '../useNonce'
import useSnackbar from '../useSnackbar'

export interface PaymentPageResponse {
  payments: Payment[]
  totalCount: number
}

export const usePaymentsPaginated = (params?: Params) => {
  const showError = useSnackbar()

  const [nonce, update] = useNonce()

  const url = `/api/payments/paginate?${paramsToString(params)}`
  const [data, loading, error] = useFetch<PaymentPageResponse>(url, {
    showError,
    name: 'la lista de pagos',
    nonce,
  })

  return [data ?? undefined, { update, loading, error }] as const
}

