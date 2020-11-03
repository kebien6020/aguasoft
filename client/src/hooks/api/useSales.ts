import { Params, paramsToString } from '../../utils'
import useFetch from '../useFetch'
import useSnackbar from '../useSnackbar'
import useNonce from './useNonce'
import { Sell } from '../../models'

type RetType<Model> = readonly [ Model[] | null, () => void ]
  
export const useSales = <Model extends Sell>(params?: Params): RetType<Model> => {
  const showError = useSnackbar()

  const [nonce, update] = useNonce()

  const url = `/api/sells?${paramsToString(params)}`
  const [sales] = useFetch<Model[]>(url, {
    showError,
    name: 'la lista de ventas',
    nonce,
  })

  return [sales, update] as const
}