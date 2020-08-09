import * as React from 'react'

import Auth from '../Auth'
import LoadingScreen from '../components/LoadingScreen'

import { RouteComponentProps } from 'react-router-dom'

interface AuthCallbackProps extends RouteComponentProps<Record<string, string|undefined>> {
  auth: Auth
}

class AuthCallback extends React.Component<AuthCallbackProps> {
  constructor(props: AuthCallbackProps) {
    super(props)
    const { auth } = props
    auth.handleAuthentication()
      .then(() => props.history.push('/'))
      .catch((error) => console.error(error))
  }
  render(): JSX.Element {
    return (
      <LoadingScreen text='Iniciando sesión…' />
    )
  }
}

export default AuthCallback
