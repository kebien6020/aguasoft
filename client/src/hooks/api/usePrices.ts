import { Price } from '../../models'
import { Params, money, paramsToString } from '../../utils'
import { Option } from '../../utils/types'
import useFetch from '../useFetch'
import useSnackbar from '../useSnackbar'
import useNonce from './useNonce'

export interface UsePriceOpts {
  showError?: (message: string) => unknown
  params?: Params
}

type UsePriceHelpers = {
  readonly update: () => void;
}

type RetVal = readonly [Price[] | null, UsePriceHelpers]

export const usePrices = (clientId: number | null, {
  showError: showErrorParam,
  params,
}: UsePriceOpts = {}): RetVal => {
  const showSnackbar = useSnackbar()
  const showError = showErrorParam ?? showSnackbar

  const [nonce, update] = useNonce()

  const cancelReq = clientId === null
    || (params !== undefined && Object.values(params).some(v =>
      v === undefined || v === ''))

  const url = cancelReq ? null : `/api/prices/${clientId.toString()}?${paramsToString(params)}`
  const [prices] = useFetch<Price[]>(url, {
    showError,
    name: 'la lista de precios',
    nonce,
  })

  return [prices, { update }] as const
}

export const optionsFromPrices =
  (prices: readonly Price[] | null): Option[] | null => {
    return prices && prices.map(price => ({
      value: String(price.id),
      label: `${price.name} | ${money(Number(price.value))}`,
    }))
  }

type OptsRetVal = readonly [Option[] | null, UsePriceHelpers]

export const usePriceOptions = (clientId: number, opts: UsePriceOpts = {}): OptsRetVal => {
  const [prices, helpers] = usePrices(clientId, {
    ...opts,
    params: {
      ...opts.params,
    },
  })
  const priceOptions = optionsFromPrices(prices)

  return [priceOptions, helpers] as const
}
