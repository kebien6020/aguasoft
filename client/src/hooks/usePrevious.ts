import { useState } from 'react'

// https://usehooks.com/usePrevious/

export function usePrevious<T>(value: T) {
  const [current, setCurrent] = useState<T>(value)
  const [previous, setPrevious] = useState<T | null>(null)

  if (value !== current) {
    setPrevious(current)
    setCurrent(value)
  }

  return previous
}

export default usePrevious
