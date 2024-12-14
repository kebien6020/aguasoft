import { Product, Variant } from '../../models'
import { Params, paramsToString } from '../../utils'
import { Option } from '../../utils/types'
import useFetch from '../useFetch'
import useSnackbar from '../useSnackbar'
import useNonce from './useNonce'

export interface UseProductOpts {
  showError?: (message: string) => unknown
  params?: Params
}

type UseProductsHelpers = {
  readonly update: () => void;
}

type RetVal = readonly [Product[] | null, UseProductsHelpers]

export const useProducts = ({
  showError: showErrorParam,
  params,
}: UseProductOpts = {}): RetVal => {
  const showSnackbar = useSnackbar()
  const showError = showErrorParam ?? showSnackbar

  const [nonce, update] = useNonce()

  const url = `/api/products?${paramsToString(params)}`
  const [products] = useFetch<Product[]>(url, {
    showError,
    name: 'la lista de productos',
    nonce,
  })

  return [products, { update }] as const
}

export const optionsFromProducts =
  (products: readonly Product[] | null): Option[] | null => {
    return products && products.map(product => ({
      value: String(product.id),
      label: `(${product.code}) ${product.name}`,
    }))
  }

export const optionsFromVariants =
  (variants: readonly Variant[] | null): Option[] | null => {
    return variants && variants.map(variant => ({
      value: String(variant.id),
      label: variant.name,
    })).sort((a, b) => a.label < b.label ? -1 : 1)
  }

export const useProductsOptions = (opts: UseProductOpts = {}): readonly [Option[] | null, UseProductsHelpers] => {
  const [products, helpers] = useProducts({
    ...opts,
    params: {
      ...opts.params,
    },
  })
  const productOptions = optionsFromProducts(products)

  return [productOptions, helpers] as const
}
