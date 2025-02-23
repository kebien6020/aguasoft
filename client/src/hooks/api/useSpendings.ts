import type { Spending } from '../../models'
import { Params, paramsToString } from '../../utils'
import useFetch from '../useFetch'
import { useNonce } from '../useNonce'
import useSnackbar from '../useSnackbar'

export interface SpendingPageResponse {
  spendings: Spending[]
  totalCount: number
}

export const useSpendingsPaginated = (params?: Params) => {
  const showError = useSnackbar()

  const [nonce, update] = useNonce()

  const url = `/api/spendings/paginate?${paramsToString(params)}`
  const [data, loading, error] = useFetch<SpendingPageResponse>(url, {
    showError,
    name: 'la lista de salidas',
    nonce,
  })

  return [data ?? undefined, { update, loading, error }] as const
}

