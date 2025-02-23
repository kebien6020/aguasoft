import type { User } from '../../models'
import { Params, paramsToString } from '../../utils'
import useFetch from '../useFetch'
import { useNonce } from '../useNonce'
import useSnackbar from '../useSnackbar'
import { Option } from '../../utils/types'

export const useUsers =
  (params?: Params): readonly [User[] | undefined, () => void] => {
    const showError = useSnackbar()

    const [nonce, update] = useNonce()

    const url = `/api/users?${paramsToString(params)}`
    const [users] = useFetch<User[]>(url, {
      showError,
      name: 'la lista de usuarios (vendedores)',
      nonce,
    })

    return [users ?? undefined, update] as const
  }

export const optionsFromUsers =
  (users: readonly User[] | undefined): Option[] | undefined => {
    return users && users.map(user => ({
      value: String(user.id),
      label: `(${user.code}) ${user.name}`,
    }))
  }

export const useUserOptions = (): readonly [Option[] | undefined, () => void] => {
  const [users, update] = useUsers()
  const options = optionsFromUsers(users)

  return [options, update] as const
}
