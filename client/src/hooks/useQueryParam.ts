import { useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router'

const useQuery = () => new URLSearchParams(useLocation().search)

type QueryParamValue = string | undefined
type SetQueryParam = (newVal: string) => void
type RetVal = readonly [QueryParamValue, SetQueryParam]

export const useQueryParam = (name: string, initialValue?: string): RetVal => {
  const query = useQuery()
  const navigate = useNavigate()
  const location = useLocation()

  const value = query.get(name)

  const setValue = useCallback((newVal: string) => {
    query.set(name, newVal)
    const url = `${location.pathname}?${query.toString()}`
    void navigate(url, { replace: true })
  }, [navigate, location, name, query])

  // Set initial value if any
  useEffect(() => {
    if (!value && initialValue)
      setValue(initialValue)

  }, [initialValue, setValue, value])

  return [value ?? initialValue, setValue] as const
}
