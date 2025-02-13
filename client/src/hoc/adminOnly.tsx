import { ComponentType, Component } from 'react'
import { Navigate } from 'react-router'

import { User } from '../models'
import { fetchJsonAuth } from '../utils'
import LoadingScreen from '../components/LoadingScreen'
import useAuth from '../hooks/useAuth'
import Auth from '../Auth'

interface UserError {
  success: false
  error: {
    message: string
    code: string
  }
}

function isUserError(u: User | UserError): u is UserError {
  return (u as UserError).success === false
}

interface State {
  errorNoUser: boolean
  user: User | null
}

export default
function adminOnly<P extends Record<string, unknown>>(
  component: ComponentType<P>
): ComponentType<P> {

  type IP = P & { auth: Auth }
  class AdminRoute extends Component<IP, State> {
    constructor(props: IP) {
      super(props)
      this.state = {
        errorNoUser: false,
        user: null,
      }
    }

    async componentDidMount() {
      const { props } = this
      type UserResponse = User | UserError
      const user: UserResponse =
        await fetchJsonAuth('/api/users/getCurrent', props.auth)

      if (user) {
        if (isUserError(user)) {
          this.setState({ errorNoUser: true })
          return
        }

        this.setState({ user })
      }
    }

    render() {
      const { props, state } = this
      const Component = component

      const redirectToLogin = () => {
        const here = window.location.pathname
        return <Navigate to={`/check?next=${here}&admin=true`} replace />
      }

      if (state.errorNoUser)
        return redirectToLogin()


      if (state.user === null)
        return <LoadingScreen text='Verificando usuario...' />


      if (state.user.role !== 'admin')
        return redirectToLogin()


      return <Component {...props} />
    }
  }

  const AdminRouteWrapper = (props: P) => {
    const auth = useAuth()
    return <AdminRoute auth={auth} {...props} />
  }

  return AdminRouteWrapper
}
