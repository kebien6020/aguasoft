import useFetch from '../useFetch'
import useNonce from './useNonce'
import useSnackbar from '../useSnackbar'
import { InventoryElement } from '../../models'
import { paramsToString, Params } from '../../utils'
import { Option } from '../../utils/types'

const useInventoryElements =
  (params?: Params): readonly [InventoryElement[] | null, () => void] => {
    const showError = useSnackbar()

    const [nonce, update] = useNonce()

    const url = `/api/inventory/inventoryElements?${paramsToString(params)}`
    const [inventoryElements] = useFetch<InventoryElement[]>(url, {
      showError,
      name: 'los elementos de inventario',
      nonce,
    })

    return [inventoryElements, update] as const
  }

export const optionsFromElements =
  (elements: readonly InventoryElement[] | null): Option[] | null => {
    return elements && elements.map(element => ({
      value: element.code,
      label: element.name,
    }))
  }

export default useInventoryElements
