
type Environment = 'development' | 'test' | 'production'
const isEnvironment = (env: string): env is Environment => ['development', 'test', 'production'].includes(env)

const envStr = process.env.NODE_ENV || 'development'
if (!isEnvironment(envStr))
  throw new Error('Invalid environment')

// Just to have the correct type
export const env = envStr
