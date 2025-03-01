import { useEffect, useState } from 'react'
import type { JSX, ReactNode } from 'react'
import LoadingScreen from './components/LoadingScreen'
import useAuth from './hooks/useAuth'

const AuthStatus = {
  DENIED: Symbol('DENIED'), // User is not allowed to see this page
  GRANTED: Symbol('GRANTED'), // User is allowed to see this page
  PENDING: Symbol('PENDING'), // Still deciding
}

interface RequireAuthProps {
  children: ReactNode
}

export const RequireAuth = ({ children }: RequireAuthProps): JSX.Element | null => {
  const authStatus = useAuthWithRenew()

  const auth = useAuth()
  useEffect(() => {
    if (authStatus === AuthStatus.DENIED)
      auth.login()
  }, [auth, authStatus])

  if (authStatus === AuthStatus.GRANTED)
    return <>{children}</>

  if (authStatus === AuthStatus.PENDING)
    return <LoadingScreen text='Intentando autenticación automática…' />

  return null
}

const useAuthWithRenew = () => {
  const auth = useAuth()
  const [authStatus, setAuthStatus] = useState(AuthStatus.PENDING)

  useEffect(() => {
    if (auth.isAuthenticated()) {
      setAuthStatus(AuthStatus.GRANTED)
      return
    }

    auth.login()
  }, [auth])

  return authStatus
}
