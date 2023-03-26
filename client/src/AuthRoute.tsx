import * as React from 'react'
import { Route, RouteProps, RouteComponentProps } from 'react-router-dom'
import Auth from './Auth'
import AuthContext from './AuthContext'
import LoadingScreen from './components/LoadingScreen'

const isAuthenticated = (auth: Auth) => auth.isAuthenticated()

const AuthStatus = {
  DENIED: Symbol('DENIED'), // User is not allowed to see this page
  GRANTED: Symbol('GRANTED'), // User is allowed to see this page
  PENDING: Symbol('PENDING'), // Still deciding
}

interface AuthRouteProps extends RouteProps {
  private?: boolean
}

export interface AuthRouteComponentProps<P extends { [K in keyof P]?: string } = {}> extends RouteComponentProps<P> {
  auth: Auth
}

class AuthRoute extends React.Component<AuthRouteProps> {
  state = {
    authStatus: AuthStatus.PENDING,
  }

  static contextType = AuthContext
  declare context: React.ContextType<typeof AuthContext>

  async componentDidMount(): Promise<void> {
    const { props } = this
    const auth = this.context
    const isPrivate = props.private
    if (isAuthenticated(auth) || !isPrivate)
      return this.setState({ authStatus: AuthStatus.GRANTED })

    const success = await auth.renew()
    if (success)
      return this.setState({ authStatus: AuthStatus.GRANTED })

    return this.setState({ authStatus: AuthStatus.DENIED })
  }

  render(): JSX.Element | null {
    const { component, children, render, ...outerProps } = this.props
    const { authStatus } = this.state
    const auth = this.context

    // Specifying children overwrites component
    if (children)
      return <Route {...outerProps}>{children}</Route>


    if (authStatus === AuthStatus.GRANTED) {
      if (render)
        return <Route {...outerProps} render={render} />


      if (!component) return null

      const Component = component
      const renderRoute = (props: React.ComponentProps<typeof Component>) =>
        <Component auth={auth} {...outerProps} {...props} />
      return <Route {...outerProps} render={renderRoute} />
    }

    if (authStatus === AuthStatus.PENDING) {
      return (
        <LoadingScreen text='Intentando autenticación automática…' />
      )
    }

    auth.login()
    return null
  }
}

export default AuthRoute
