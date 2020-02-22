import * as React from 'react'
import { useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import { FormikHelpers } from 'formik'

import useAuth from '../hooks/useAuth'
import useSnackbar from '../hooks/useSnackbar'
import Form from '../components/form/Form'
import Layout from '../components/Layout'
import SubmitButton from '../components/form/SubmitButton'
import TextField from '../components/form/TextField'
import Title from '../components/Title'
import Yup from '../components/form/Yup'
import { fetchJsonAuth, isErrorResponse } from '../utils'

const initialValues = {
  amount: '',
}

const validationSchema = Yup.object({
  amount: Yup.number().integer().positive().required(),
})

type Values = typeof initialValues

const RegisterUnpack = () => {
  const classes = useStyles()

  const auth = useAuth()
  const showMessage = useSnackbar()

  const history = useHistory()
  const handleSubmit = async (values: Values, {setSubmitting}: FormikHelpers<Values>) => {
    const url = '/api/inventory/movements/unpack'
    let payload: Object = {
      amount: Number(values.amount),
    }

    const response = await fetchJsonAuth(url, auth, {
      method: 'post',
      body: JSON.stringify(payload)
    })

    if (isErrorResponse(response)) {
      showMessage('Error: ' + response.error.message)
      setSubmitting(false)
      return
    }

    showMessage('Guardado exitoso')
    history.push('/movements')
    setSubmitting(false)
  }

  return (
    <Layout title='Registrar Desempaque'>
      <Paper className={classes.paper}>
        <Title>Registrar Desempaque</Title>

        <Form
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
            <Grid item xs={12}>
              <TextField
                name='amount'
                label='Bolsas a desempacar'
              />
            </Grid>

            <SubmitButton />
        </Form>
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
