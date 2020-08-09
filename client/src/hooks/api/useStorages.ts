import useFetch from '../useFetch'
import useSnackbar from '../useSnackbar'
import { paramsToString, Params } from '../../utils'
import { Storage } from '../../models'
import useNonce from './useNonce'

const useStorages = (params?: Params): readonly [Storage[] | null, () => void] => {
  const showError = useSnackbar()

  const [nonce, update] = useNonce()

  const url = `/api/inventory/storages?${paramsToString(params)}`
  const [storages] = useFetch<Storage[]>(url, {
    showError,
    name: 'la lista de almacenes',
    nonce,
  })

  return [storages, update] as const
}

export default useStorages
