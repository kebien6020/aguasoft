import * as React from 'react'
import { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'

import Paper from '@material-ui/core/Paper'

import { AuthRouteComponentProps } from '../AuthRoute'
import Layout from '../components/Layout'
import Login from '../components/Login'
import Title from '../components/Title'

type PaymentsProps = AuthRouteComponentProps<{}>;
export default function Payments({auth}: PaymentsProps) {
  const classes = useStyles()

  // Login to register sell
  const history = useHistory()
  const handleLogin = useCallback(() => {
    history.push('/payment')
  }, [history])
  const loginElem =
    <Paper className={classes.login}>
      <Login onSuccess={handleLogin} auth={auth} />
    </Paper>

  return (
    <Layout title='Pagos'>
      <Title>Registrar Pago</Title>
      {loginElem}

    </Layout>
  )
}

const useStyles = makeStyles(theme => ({
  login: {
    padding: theme.spacing(2),
  },
}))
