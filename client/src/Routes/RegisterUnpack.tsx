import makeStyles from '@mui/styles/makeStyles'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'

import useAuth from '../hooks/useAuth'
import useSnackbar from '../hooks/useSnackbar'
import Form from '../components/form/Form'
import Layout from '../components/Layout'
import SubmitButton from '../components/form/SubmitButton'
import TextField from '../components/form/TextField'
import Title from '../components/Title'
import Yup from '../components/form/Yup'
import { fetchJsonAuth, isErrorResponse } from '../utils'
import { Theme } from '../theme'
import { useNavigate } from 'react-router'

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

  const navigate = useNavigate()
  const handleSubmit = async (values: Values) => {
    const url = '/api/inventory/movements/unpack'
    const payload = {
      amount: Number(values.amount),
    }

    const response = await fetchJsonAuth(url, auth, {
      method: 'post',
      body: JSON.stringify(payload),
    })

    if (isErrorResponse(response)) {
      showMessage('Error: ' + response.error.message)
      return
    }

    showMessage('Guardado exitoso')
    navigate('/movements')
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
          <Grid size={{ xs: 12 }}>
            <TextField
              name='amount'
              label='Pacas a desempacar'
            />
          </Grid>

          <SubmitButton />
        </Form>
      </Paper>
    </Layout>
  )
}

const useStyles = makeStyles((theme: Theme) => ({
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
