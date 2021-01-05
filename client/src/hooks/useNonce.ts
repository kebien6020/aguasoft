import { useReducer } from 'react'

type UseNonceRet = readonly [number, () => void]
export const useNonce = (): UseNonceRet => {
  const [nonce, refresh] = useReducer((prev: number) => prev + 1, 1)
  return [nonce, refresh] as const
}
