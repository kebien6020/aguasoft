import { ErrorResponse, Params, paramsToString } from '../../utils'
import useFetch from '../useFetch'
import useSnackbar from '../useSnackbar'
import useNonce from './useNonce'
import { Sell } from '../../models'

type RetType<Model> = readonly [ Model[] | null, {
  readonly update: () => void
  readonly loading: boolean
  readonly error: ErrorResponse['error'] | null
}]

export const useSales = <Model extends Sell>(params?: Params): RetType<Model> => {
  const showError = useSnackbar()

  const [nonce, update] = useNonce()

  const url = `/api/sells?${paramsToString(params)}`
  const [sales, loading, error] = useFetch<Model[]>(url, {
    showError,
    name: 'la lista de ventas',
    nonce,
  })

  return [sales, { update, loading, error }] as const
}
