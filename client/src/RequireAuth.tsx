import type { JSX, ReactNode } from 'react'
import LoadingScreen from './components/LoadingScreen'
import useAuth from './hooks/useAuth'

interface RequireAuthProps {
  children: ReactNode
}

export const RequireAuth = ({ children }: RequireAuthProps): JSX.Element | null => {
  const auth = useAuth()
  
  if (!auth.isAuthenticated()) {
    auth.login()
    return <LoadingScreen text='Redirigiendo a autenticación…' />
  }

  return <>{children}</>
}
