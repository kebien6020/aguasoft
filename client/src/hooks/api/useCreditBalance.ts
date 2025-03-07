import { CreditBalanceItem } from '../../models'
import { ErrorResponse, Params, paramsToString } from '../../utils'
import useFetch from '../useFetch'
import { useNonce } from '../useNonce'
import useSnackbar from '../useSnackbar'

export interface UseCreditBalanceOpts {
  showError?: (message: string) => unknown
  params?: Params
}

type Helpers = {
  readonly update: () => void;
  readonly loading: boolean;
  readonly error: ErrorResponse['error'] | null;
}

type RetVal<T> = readonly [T | null, Helpers]

export type CreditBalanceResponse<T> = {
  items: T[]
  success: true
}

export const useCreditBalance = <T extends CreditBalanceItem = CreditBalanceItem>({
  showError: showErrorParam,
  params,
}: UseCreditBalanceOpts = {}): RetVal<T[]> => {
  const showSnackbar = useSnackbar()
  const showError = showErrorParam ?? showSnackbar

  const [nonce, update] = useNonce()

  const url = `/api/clients/balances?${paramsToString(params)}`
  const [data, loading, error] = useFetch<CreditBalanceResponse<T>>(url, {
    showError,
    name: 'la lista de balances de crédito',
    nonce,
  })

  return [data?.items ?? null, { update, loading, error }] as const
}
