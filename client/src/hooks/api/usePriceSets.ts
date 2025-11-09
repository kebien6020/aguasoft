import type { PriceSet } from '../../models'
import { Params, paramsToString } from '../../utils'
import useFetch from '../useFetch'
import { useNonce } from '../useNonce'
import useSnackbar from '../useSnackbar'
import { Option } from '../../utils/types'

type Response = {
  success: true
  items: PriceSet[]
}

export const usePriceSets =
  (params?: Params): readonly [PriceSet[] | undefined, () => void] => {
    const showError = useSnackbar()

    const [nonce, update] = useNonce()

    const url = `/api/price-sets?${paramsToString(params)}`
    const [data] = useFetch<Response>(url, {
      showError,
      name: 'los conjuntos de precios',
      nonce,
    })

    return [data?.items, update] as const
  }

export const optionsFromPriceSets =
  (priceSets: readonly PriceSet[] | null): Option[] | null => {
    return priceSets && priceSets.map(ps => ({
      value: String(ps.id),
      label: ps.name,
    }))
  }
