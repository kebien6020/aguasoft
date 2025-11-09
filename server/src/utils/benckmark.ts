import { Debugger } from 'debug'

const noop = () => { }
export const time = (logger: Debugger) => (label: string): () => void => {
  if (!logger.enabled) return noop

  const start = performance.now()
  return () => {
    const duration = performance.now() - start
    logger('%s: %dms', label, duration.toFixed(3))
  }
}
