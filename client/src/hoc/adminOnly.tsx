import { ComponentType, Component, useState, useCallback } from 'react'
import { Navigate } from 'react-router'

import { User } from '../models'
import LoadingScreen from '../components/LoadingScreen'
import useAuth from '../hooks/useAuth'
import Auth from '../Auth'
import { useUserFetch } from '../hooks/useUser'

interface State {
  errorNoUser: boolean
  user: User | null
}

export default
function adminOnly<P extends Record<string, unknown>>(
  component: ComponentType<P>,
): ComponentType<P> {

  type IP = P & { auth: Auth, user: User | null, userError: boolean }
  class AdminRoute extends Component<IP, State> {
    render() {
      const { user, userError } = this.props
      const Component = component

      const redirectToLogin = () => {
        const here = window.location.pathname
        return <Navigate to={`/check?next=${here}&admin=true`} replace />
      }

      if (userError)
        return redirectToLogin()

      if (user === null)
        return <LoadingScreen text='Verificando usuario...' />

      if (user.role !== 'admin')
        return redirectToLogin()


      return <Component {...this.props} />
    }
  }

  const AdminRouteWrapper = (props: P) => {
    const auth = useAuth()
    const [userError, setUserError] = useState(false)
    const onError = useCallback(() => {
      setUserError(true)
    }, [])
    const { user } = useUserFetch(onError)

    return <AdminRoute auth={auth} user={user} userError={userError} {...props} />
  }

  return AdminRouteWrapper
}
