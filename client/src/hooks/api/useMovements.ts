import useFetch from '../useFetch'
import useSnackbar from '../useSnackbar'
import { InventoryMovement } from '../../models'
import { Params, paramsToString } from '../../utils'

interface InventoryMovementsResponse {
  movements: InventoryMovement[]
}

interface InventoryMovementsWithCountResponse extends InventoryMovementsResponse {
  totalCount?: number
}

const useMovements = (params: Params = {}) => {
  const showError = useSnackbar()

  const url = '/api/inventory/movements?' + paramsToString(params)

  type Response = InventoryMovementsWithCountResponse
  const [res, loading, error] = useFetch<Response>(url, {
    showError,
    name: 'la lista de movimientos recientes',
  })

  const { movements = null, totalCount = null } = res || {}

  return {movements, totalCount, loading, error}
}

export default useMovements
