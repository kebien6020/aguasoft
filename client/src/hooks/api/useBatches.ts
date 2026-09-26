import type { Batch, BatchWithCategory, SellWithDetailsWire } from '../../models'
import { Params, paramsToString } from '../../utils'
import useFetch from '../useFetch'
import { useNonce } from '../useNonce'
import useSnackbar from '../useSnackbar'
import { Option } from '../../utils/types'

export const useBatches =
  (params?: Params): readonly [Batch[] | undefined, () => void] => {
    const showError = useSnackbar()

    const [nonce, update] = useNonce()

    const url = `/api/batches?${paramsToString(params)}`
    const [batches] = useFetch<Batch[]>(url, {
      showError,
      name: 'los lotes',
      nonce,
    })

    const batchesDates = batches?.map(b => ({
      ...b,
      date: new Date(b.date),
      expirationDate: new Date(b.expirationDate),
    }))

    return [batchesDates, update] as const
  }

export const optionsFromBatches =
  (batches: readonly Batch[] | null): Option[] | null => {
    return batches && batches.map(batch => ({
      value: String(batch.id),
      label: batch.code,
    })).slice(0, 60)
  }

export const useBatch = (id: number) => {
  const showError = useSnackbar()

  const [nonce, update] = useNonce()

  const url = `/api/batches/${id}`
  const [batch, loading, error] = useFetch<BatchWithCategory>(url, {
    showError,
    name: 'el lote',
    nonce,
  })

  return [batch, { update, loading, error }] as const
}

export const useBatchSales = (id: number) => {
  const showError = useSnackbar()

  const [nonce, update] = useNonce()

  const url = `/api/sells?batchId=${id}&include[]=Batch&include=Client&include[]=Product&include[]=User&paranoid=true`
  const [sells, loading, error] = useFetch<SellWithDetailsWire[]>(url, {
    showError,
    name: 'las ventas del lote',
    nonce,
  })

  return [sells, { update, loading, error }] as const
}
