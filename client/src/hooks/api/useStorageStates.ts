import useFetch from '../useFetch'
import useSnackbar from '../useSnackbar'
import { paramsToString, Params } from '../../utils'
import { StorageState } from '../../models'
import useNonce from './useNonce'

const useStorageStates = (params?: Params): readonly [StorageState[] | null, () => void] => {
  const showError = useSnackbar()

  const [nonce, update] = useNonce()

  const url = `/api/inventory/state?${paramsToString(params)}`
  const [storageStates] = useFetch<StorageState[]>(url, {
    showError,
    name: 'el estado actual de los inventarios',
    nonce,
  })

  return [storageStates, update] as const
}

export default useStorageStates
