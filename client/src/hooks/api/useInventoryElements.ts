import useFetch from '../useFetch'
import useNonce from './useNonce'
import useSnackbar from '../useSnackbar'
import { InventoryElement } from '../../models'
import { paramsToString, Params } from '../../utils'

const useInventoryElements = (params?: Params) => {
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

export const optionsFromElements = (elements: readonly InventoryElement[] | null) => {
  return elements && elements.map(element => ({
    value: element.code,
    label: element.name,
  }))
}

export default useInventoryElements
