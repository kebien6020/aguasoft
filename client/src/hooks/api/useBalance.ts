import { ErrorResponse } from '../../utils'
import { formatDateonlyHumanShort, formatDateonlyMachine } from '../../utils/dates'
import useFetch from '../useFetch'
import { useNonce } from '../useNonce'
import useSnackbar from '../useSnackbar'

type ShowBalanceResponse = {
  data: number
  success: true
}

export type UseBalanceRet = readonly [
  number | null,
  {
    readonly loading: boolean
    readonly error: ErrorResponse['error'] | null
    readonly refresh: () => void
  },
]
export const useBalance = (date: Date): UseBalanceRet => {
  const showError = useSnackbar()
  const [nonce, refresh] = useNonce()
  const [balanceResponse, loading, error] = useFetch<ShowBalanceResponse>(`/api/balance/${formatDateonlyMachine(date)}`, {
    name: `balance en la fecha ${formatDateonlyHumanShort(date)}`,
    showError,
    nonce,
  })
  const balance = balanceResponse?.data ?? null

  return [balance, { loading, error, refresh }] as const
}
