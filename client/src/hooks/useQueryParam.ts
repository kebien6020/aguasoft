import { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router'

type QueryParamValue = string | undefined
type SetQueryParam = (newVal?: string) => void
type RetVal = readonly [QueryParamValue, SetQueryParam]

export const useQueryParam = (name: string, initialValue?: string): RetVal => {
  const [searchParams, setSearchParams] = useSearchParams()

  const value = searchParams.get(name) ?? undefined

  const setValue = useCallback((newVal?: string) => {
    const params = new URLSearchParams(searchParams)

    if (newVal === undefined || newVal === '') params.delete(name)
    else params.set(name, newVal)

    setSearchParams(params, { replace: true })
  }, [name, searchParams, setSearchParams])

  // Set initial value if any
  useEffect(() => {
    if (value === undefined && initialValue !== undefined)
      setValue(initialValue)
  }, [initialValue, setValue, value])

  return [value ?? undefined, setValue] as const
}
