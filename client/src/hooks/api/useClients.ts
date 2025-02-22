import { Client } from '../../models'
import { ErrorResponse, Params, paramsToString } from '../../utils'
import { Option } from '../../utils/types'
import useFetch from '../useFetch'
import useSnackbar from '../useSnackbar'
import useNonce from './useNonce'

export interface UseClientsOpts {
  showError?: (message: string) => unknown
  params?: Params
}

type UseClientsHelpers = {
  readonly update: () => void;
  readonly loading: boolean;
  readonly error: ErrorResponse['error'] | null;
}

type RetVal<T> = readonly [T | null, UseClientsHelpers]

export const useClients = <T extends Client = Client>({
  showError: showErrorParam,
  params,
}: UseClientsOpts = {}): RetVal<T[]> => {
  const showSnackbar = useSnackbar()
  const showError = showErrorParam ?? showSnackbar

  const [nonce, update] = useNonce()

  const url = `/api/clients?${paramsToString(params)}`
  const [clients, loading, error] = useFetch<T[]>(url, {
    showError,
    name: 'la lista de clientes',
    nonce,
  })

  return [clients, { update, loading, error }] as const
}

export interface UseClientOpts {
  showError?: (message: string) => unknown
}

export type UseClientRetVal = readonly [Client | null, UseClientsHelpers]

export const useClient = (id: number | null, { showError: showErrorParam }: UseClientOpts = {}): UseClientRetVal => {
  const showSnackbar = useSnackbar()
  const showError = showErrorParam ?? showSnackbar

  const [nonce, update] = useNonce()

  const url = id === null ? null : `/api/clients/${id}`
  const [client, loading, error] = useFetch<Client>(url, {
    showError,
    name: 'la lista de clientes',
    nonce,
  })

  return [client, { update, loading, error }] as const
}

export const optionsFromClients =
  (clients: readonly Client[] | null): Option[] | null => {
    return clients && clients.map(client => ({
      value: String(client.id),
      label: `(${client.code}) ${client.name}`,
    }))
  }

export const useClientOptions = (opts: UseClientsOpts = {}): readonly [Option[] | null, UseClientsHelpers] => {
  const [clients, helpers] = useClients({
    ...opts,
    params: {
      hidden: 'not-hidden',
      ...opts.params,
    },
  })
  const clientOptions = optionsFromClients(clients)

  return [clientOptions, helpers] as const
}
