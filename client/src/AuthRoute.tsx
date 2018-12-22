import * as React from 'react'
import { Route, RouteProps, RouteComponentProps } from 'react-router-dom'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import Layout from './components/Layout'
import Auth from './Auth'
const logo = require('./logo.png')
const auth  = new Auth()

const isAuthenticated = () => auth.isAuthenticated()

const AuthStatus = {
  'DENIED': Symbol('DENIED'),   // User is not allowed to see this page
  'GRANTED': Symbol('GRANTED'), // User is allowed to see this page
  'PENDING': Symbol('PENDING'), // Still deciding
}

interface AuthRouteProps extends RouteProps {
  component?: React.ComponentClass | React.StatelessComponent
  private?: boolean
}

export interface AuthRouteComponentProps<P> extends RouteComponentProps<P> {
  auth: Auth
}

class AuthRoute extends React.Component<AuthRouteProps> {
  state = {
    authStatus: AuthStatus.PENDING
  }

  async componentWillMount() {
    const { props } = this
    const isPrivate = props.private
    if (isAuthenticated() || !isPrivate)
      return this.setState({authStatus: AuthStatus.GRANTED})

    const success = await auth.renew()
    if (success)
      return this.setState({authStatus: AuthStatus.GRANTED})

    return this.setState({authStatus: AuthStatus.DENIED})
  }

  render() {
    const { component, children, ...outerProps } = this.props
    const { authStatus } = this.state

    // Specifying children overwrites component
    if (children) {
      return <Route {...outerProps}>{children}</Route>
    }

    if (authStatus === AuthStatus.GRANTED) {
      const Component = component
      const renderRoute = (props: any) =>
        <Component auth={auth} {...outerProps} {...props} />
      return <Route { ...outerProps } render={renderRoute} />
    }

    if (authStatus === AuthStatus.PENDING) {
      const style: React.CSSProperties = {
        display: 'flex',
        minHeight: 'calc(100vh - 64px)',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }
      return (
        <Layout>
          <div style={style}>
            <img src={logo} style={{marginBottom: '32px'}} />
            <div style={{marginBottom: '16px'}}><CircularProgress /></div>
            <Typography variant="h6">
              Intentando autenticación automática...
            </Typography>
          </div>
        </Layout>
      )
    }

    auth.login()
    return null
  }
}

export default AuthRoute
