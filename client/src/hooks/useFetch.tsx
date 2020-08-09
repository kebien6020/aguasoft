import { useState } from 'react'

import useAuth from './useAuth'
import { fetchJsonAuth, FetchAuthOptions, isErrorResponse, ErrorResponse } from '../utils'
import useDeepCompareEffect from 'use-deep-compare-effect'

export interface UseFetchOptions {
  showError: (s: string) => unknown
  name: string
  options?: FetchAuthOptions
  nonce?: number
}

type Result<T> = [
  T | null,
  boolean,
  ErrorResponse['error'] | null
]

function useFetch<T>(
  url: string,
  hookOptions: UseFetchOptions
): Result<T> {
  const {
    showError,
    name,
    options,
    nonce = 1,
  } = hookOptions

  const auth = useAuth()

  const [data, setData] = useState<null | T>(null)
  const [error, setError] = useState<null | ErrorResponse['error']>(null)
  const [loading, setLoading] = useState<boolean>(false)
  useDeepCompareEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const response : T | ErrorResponse = await fetchJsonAuth(url, auth, options)

        if (!isErrorResponse(response)) {
          setData(response)
        } else {
          console.error(response.error)
          showError('Error tratando de obtener ' + name)
          setError(response.error)
        }
      } catch (error) {
        console.error(error)
        showError('Error de conexión tratando de obtener ' + name)
      } finally {
        setLoading(false)
      }
    })()
  }, [url, nonce, auth, name, options, showError])

  return [data, loading, error] as [T | null, boolean, typeof error]
}

export default useFetch
