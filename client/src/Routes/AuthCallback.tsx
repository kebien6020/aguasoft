import * as React from 'react'

import Auth from '../Auth'
import LoadingScreen from '../components/LoadingScreen'

import { RouteComponentProps } from 'react-router-dom'

interface AuthCallbackProps extends RouteComponentProps<{}> {
  auth: Auth
}

class AuthCallback extends React.Component<AuthCallbackProps> {
  constructor(props: AuthCallbackProps) {
    super(props)
    const { auth } = props
    auth.handleAuthentication()
      .then(() => props.history.push('/') )
      .catch((error) => console.error(error))
  }
  render() {
    return (
      <LoadingScreen text='Iniciando sesión…' />
    );
  }
}

export default AuthCallback
