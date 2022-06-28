import { useState, useEffect } from 'react'

export const useTime = (freqMs = 1000): Date => {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), freqMs)
    return () => clearInterval(id)
  }, [freqMs])
  return now
}
