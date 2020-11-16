import { Client } from '../../models'
import { Params, paramsToString } from '../../utils'
import { Option } from '../../utils/types'
import useFetch from '../useFetch'
import useSnackbar from '../useSnackbar'
import useNonce from './useNonce'

export interface UseClientOpts {
  showError?: (message: string) => unknown
  params?: Params
}

type UseClientsHelpers = {
  readonly update: () => void;
}

type RetVal = readonly [Client[] | null, UseClientsHelpers]

export const useClients = ({
  showError: showErrorParam,
  params,
}: UseClientOpts = {}): RetVal => {
  const showSnackbar = useSnackbar()
  const showError = showErrorParam ?? showSnackbar

  const [nonce, update] = useNonce()

  const url = `/api/clients?${paramsToString(params)}`
  const [clients] = useFetch<Client[]>(url, {
    showError,
    name: 'la lista de clientes',
    nonce,
  })

  return [clients, { update }] as const
}

export const optionsFromClients =
  (clients: readonly Client[] | null): Option[] | null => {
    return clients && clients.map(client => ({
      value: String(client.id),
      label: client.name,
    }))
  }

export const useClientOptions = (opts: UseClientOpts = {}): readonly [Option[] | null, UseClientsHelpers] => {
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
