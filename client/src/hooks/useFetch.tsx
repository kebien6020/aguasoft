import { useState, useEffect } from 'react'

import useAuth from './useAuth'
import { fetchJsonAuth, FetchAuthOptions, isErrorResponse, ErrorResponse } from '../utils'

export interface UseFetchOptions {
  showError: (s: string) => any
  name: string
  options?: FetchAuthOptions
}

const useFetch = <T extends object>(
  url: string,
  hookOptions: UseFetchOptions
) => {
  const {
    showError,
    name,
    options,
  } = hookOptions

  const auth = useAuth()

  const [data, setData] = useState<null | T>(null)
  const [error, setError] = useState<null | ErrorResponse['error']>(null)
  const [loading, setLoading] = useState<boolean>(false)
  useEffect(() => {
    const fetchData = async () => {
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
    }

    fetchData()
  }, [])

  return [data, loading, error] as [T | null, boolean, typeof error]
}

export default useFetch
