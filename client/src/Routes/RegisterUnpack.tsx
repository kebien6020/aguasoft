import * as React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'

import Layout from '../components/Layout'
import Title from '../components/Title'

const RegisterUnpack = () => {
  const classes = useStyles()

  return (
    <Layout title='Registrar Desempaque'>
      <Paper className={classes.paper}>
        <Title>Registrar Desempaque</Title>
      </Paper>
    </Layout>
  )
}

const useStyles = makeStyles(theme => ({
  paper: {
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}))

export default RegisterUnpack
