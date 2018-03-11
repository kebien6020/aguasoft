import * as React from 'react'
import { CircularProgress } from 'material-ui/Progress'
import Typography from 'material-ui/Typography'
import Layout from '../components/Layout'

import Auth from '../Auth'

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
  }
  render() {
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
          <div style={{marginBottom: '16px'}}><CircularProgress /></div>
          <Typography  variant="title">Iniciando sesión...</Typography>
        </div>
      </Layout>
    );
  }
}

export default AuthCallback
