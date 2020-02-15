import * as React from 'react'
import { useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'

import useAuth from '../hooks/useAuth'
import useSnackbar from '../hooks/useSnackbar'
import useInventoryElements, { optionsFromElements } from '../hooks/api/useInventoryElements'
import Form from '../components/form/Form'
import Layout from '../components/Layout'
import Subtitle from '../components/Subtitle'
import TextField from '../components/form/TextField'
import Title from '../components/Title'
import Yup from '../components/form/Yup'
import { fetchJsonAuth, isErrorResponse } from '../utils'
import useNonce from '../hooks/api/useNonce'
import SelectElementField from '../components/inventory/SelectElementField'

const initialValues = {
  element: '',
  amount: '',
}

const validationSchema = Yup.object({
  element: Yup.string().required(),
  amount: Yup.number().integer().positive().required(),
})

type Values = typeof initialValues

const RegisterRelocation = () => {
  const classes = useStyles()

  const auth = useAuth()
  const showMessage = useSnackbar()

  const [inventoryElements] = useInventoryElements()

  const onlyRawAndTools = inventoryElements && inventoryElements.filter(element =>
    element.type === 'raw' || element.type === 'tool'
  )

  const elementOptions = optionsFromElements(onlyRawAndTools)

  const [statesNonce, updateStates] = useNonce()

  const history = useHistory()
  const handleSubmit = async (values: Values) => {
    const url = '/api/inventory/movements/relocation'
    let payload: Object = {
      inventoryElementCode: values.element,
      amount: Number(values.amount),
    }

    const response = await fetchJsonAuth(url, auth, {
      method: 'post',
      body: JSON.stringify(payload)
    })

    if (isErrorResponse(response)) {
      showMessage('Error: ' + response.error.message)
      return
    }

    showMessage('Guardado exitoso')
    updateStates()
    history.push('/movements')
  }

  return (
    <Layout title='Registrar Salida de Bodega'>
      <Paper className={classes.paper}>
        <Title style={{marginBottom: 0}}>Registrar Salida de Bodega</Title>
        <Subtitle>Hacia área de trabajo</Subtitle>

        <Form
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
            <Grid item xs={12} md={6}>
              <SelectElementField
                name='element'
                label='Elemento a sacar de bodega'
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

const SubmitButton = () => {
  const classes = useSubmitButtonStyles()

  return (
    <Grid item xs={12}>
      <Button variant='contained' color='primary' type='submit' className={classes.button}>
        Registrar
      </Button>
    </Grid>
  )
}

const useSubmitButtonStyles = makeStyles({
  button: {
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  }
})

export default RegisterRelocation
