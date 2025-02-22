import { useState, useCallback } from 'react'

const useNonce = (): readonly [number, () => void] => {
  const [nonce, setNonce] = useState(1)
  const update = useCallback(() => {
    setNonce(prev => prev + 1) 
  }, [])

  return [nonce, update] as const
}

export default useNonce
