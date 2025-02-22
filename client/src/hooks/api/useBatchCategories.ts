import { BatchCategory } from '../../models'
import { Params, paramsToString } from '../../utils'
import useFetch from '../useFetch'
import { useNonce } from '../useNonce'
import useSnackbar from '../useSnackbar'
import { Option } from '../../utils/types'

export const useBatchCategories =
  (params?: Params): readonly [BatchCategory[] | null, () => void] => {
    const showError = useSnackbar()

    const [nonce, update] = useNonce()

    const url = `/api/batch-categories?${paramsToString(params)}`
    const [batchCategories] = useFetch<BatchCategory[]>(url, {
      showError,
      name: 'las categorias de lote',
      nonce,
    })

    return [batchCategories, update] as const
  }

export const optionsFromBatchCategories =
  (elements: readonly BatchCategory[] | null): Option[] | null => {
    return elements && elements.map(element => ({
      value: String(element.id),
      label: element.name,
    }))
  }

export const useBatchCategory = (id: number | undefined): readonly [BatchCategory | null, () => void] => {
  const showError = useSnackbar()

  const [nonce, update] = useNonce()

  const url = id !== undefined ? `/api/batch-categories/${id}` : null
  const [batchCategory] = useFetch<BatchCategory>(url, {
    showError,
    name: 'la categoria de lote',
    nonce,
  })

  return [batchCategory, update] as const
}
