import * as React from 'react'
import { Redirect } from 'react-router-dom'

import { User } from '../models'
import { fetchJsonAuth } from '../utils'
import { AuthRouteComponentProps } from '../AuthRoute'
import LoadingScreen from '../components/LoadingScreen'

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
function adminOnly<P extends AuthRouteComponentProps<unknown>>(
  component: React.ComponentType<P>
): React.ComponentType<P> {

  return class AdminRoute extends React.Component<P, State> {
    constructor(props: P) {
      super(props)
      this.state = {
        errorNoUser: false,
        user: null,
      }
    }

    async componentDidMount() {
      const { props } = this
      type UserResponse = User | UserError
      const user : UserResponse =
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
        return <Redirect to={`/check?next=${here}&admin=true`} push={false} />
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
}
