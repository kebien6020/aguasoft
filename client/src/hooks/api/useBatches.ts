import type { Batch } from '../../models'
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
