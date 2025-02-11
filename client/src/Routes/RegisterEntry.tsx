import makeStyles from '@mui/styles/makeStyles'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'

import useAuth from '../hooks/useAuth'
import useNonce from '../hooks/api/useNonce'
import useSnackbar from '../hooks/useSnackbar'
import useInventoryElements, { optionsFromElements } from '../hooks/api/useInventoryElements'
import Form from '../components/form/Form'
import Layout from '../components/Layout'
import TextField from '../components/form/TextField'
import Title from '../components/Title'
import Yup from '../components/form/Yup'
import SelectElementField from '../components/inventory/SelectElementField'
import SubmitButton from '../components/form/SubmitButton'
import adminOnly from '../hoc/adminOnly'
import { fetchJsonAuth, isErrorResponse } from '../utils'
import { Theme } from '../theme'

const initialValues = {
  element: '',
  amount: '',
}

const validationSchema = Yup.object({
  element: Yup.string().required(),
  amount: Yup.number().integer().positive().required(),
})

type Values = typeof initialValues

const RegisterEntry = () => {
  const classes = useStyles()

  const auth = useAuth()
  const showMessage = useSnackbar()

  const [inventoryElements] = useInventoryElements()

  const onlyRawAndTools = inventoryElements && inventoryElements.filter(element =>
    element.type === 'raw' || element.type === 'tool'
  )

  const elementOptions = optionsFromElements(onlyRawAndTools)

  const [statesNonce, updateStates] = useNonce()

  const handleSubmit = async (values: Values) => {
    const url = '/api/inventory/movements/entry'
    const payload: Record<string, unknown> = {
      inventoryElementCode: values.element,
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
    updateStates()
  }

  return (
    <Layout title='Registrar Ingreso a Bodega'>
      <Paper className={classes.paper}>
        <Title>Registrar Ingreso a Bodega</Title>

        <Form
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <Grid item xs={12} md={6}>
            <SelectElementField
              name='element'
              label='Elemento a ingresar a bodega'
              emptyOption='Seleccione el elemento'
              options={elementOptions}
              statesNonce={statesNonce}
              storageCode='bodega'
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name='amount'
              label='Cantidad'
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

export default adminOnly(RegisterEntry)
