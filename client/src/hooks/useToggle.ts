import { useCallback, useState } from 'react'

type Result = readonly [
    boolean,
    {
        readonly open: () => void
        readonly close: () => void
        readonly toggle: () => void
    }
]

export const useToggle = (initialValue = false): Result => {
  const [show, setShow] = useState(initialValue)
  const open = useCallback(() => {
    setShow(true) 
  }, [])
  const close = useCallback(() => {
    setShow(false) 
  }, [])
  const toggle = useCallback(() => {
    setShow(prev => !prev) 
  }, [])

  return [show, { open, close, toggle }] as const
}
