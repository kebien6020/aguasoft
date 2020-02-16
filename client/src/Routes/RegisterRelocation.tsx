import * as React from 'react'
import { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'

import useAuth from '../hooks/useAuth'
import useFetch from '../hooks/useFetch'
import useNonce from '../hooks/api/useNonce'
import useSnackbar from '../hooks/useSnackbar'
import useInventoryElements, { optionsFromElements } from '../hooks/api/useInventoryElements'
import Collapse from '../components/Collapse'
import Form from '../components/form/Form'
import Layout from '../components/Layout'
import SelectElementField from '../components/inventory/SelectElementField'
import Subtitle from '../components/Subtitle'
import TextField from '../components/form/TextField'
import Title from '../components/Title'
import Yup from '../components/form/Yup'
import { fetchJsonAuth, isErrorResponse, isNumber } from '../utils'
import { MachineCounter } from '../models'

const validationSchema = Yup.object({
  element: Yup.string().required(),
  amount: Yup.number().integer().positive().required(),
  counter: Yup.mixed().when('element', {is: 'rollo-360',
    then: Yup.number().integer().positive().moreThan(Yup.ref('previousCounter')).required(),
  }),
})


const RegisterRelocation = () => {
  const classes = useStyles()

  const auth = useAuth()
  const showMessage = useSnackbar()

  const [initialValues, setInitialValues] = useState({
    element: '',
    amount: '',
    counter: '',
    previousCounter: null as number|null,
  })

  type Values = typeof initialValues

  const [inventoryElements] = useInventoryElements()

  const onlyRawAndTools = inventoryElements && inventoryElements.filter(element =>
    element.type === 'raw' || element.type === 'tool'
  )

  const elementOptions = optionsFromElements(onlyRawAndTools)

  const [lastMachineCounter] = useFetch<MachineCounter>('/api/machine-counters/most-recent/new-reel', {
    showError: showMessage,
    name: 'el contador anterior de cambio de rollo',
  })

  useEffect(() => {
    if (lastMachineCounter !== null) {
      setInitialValues(prev => ({
        ...prev,
        previousCounter: lastMachineCounter.value
      }))
    }
  }, [lastMachineCounter])

  const [statesNonce, updateStates] = useNonce()

  const history = useHistory()
  const handleSubmit = async (values: Values) => {
    const url = '/api/inventory/movements/relocation'
    let payload: Object = {
      inventoryElementCode: values.element,
      amount: Number(values.amount),
    }

    if (values.element === 'rollo-360') {
      payload = {
        ...payload,
        counter: values.counter,
      }
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
          enableReinitialize
        >
          {({values, setFieldValue}) => <>
            <Grid item xs={12} md={6}>
              <SelectElementField
                name='element'
                label='Elemento a sacar de bodega'
                emptyOption='Seleccione el elemento'
                options={elementOptions}
                statesNonce={statesNonce}
                storageCode='bodega'
                onChangeOverride={event => {
                  const value = event.target.value
                  setFieldValue('element', value)

                  if (value === 'rollo-360') {
                    setFieldValue('amount', '1')
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name='amount'
                label='Cantidad'
                disabled={values.element === 'rollo-360'}
                helperText={values.element === 'rollo-360' ?
                  'Solo se permite 1 rollo de 360 al tiempo' :
                  undefined
                }
              />
            </Grid>
            <Collapse in={values.element === 'rollo-360'}>
              <Grid item xs={12} md={6}>
                <TextField
                  name='counter'
                  label='Contador de la maquina'
                />
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  Esta accion mueve un rollo de la bodega al area de trabajo y remueve un rollo del area de trabajo (el rollo anterior vacío).
                </Typography>
              </Grid>
            </Collapse>
            <Collapse in={
                 isNumber(values.counter)
              && lastMachineCounter !== null
              && Number(values.counter) > lastMachineCounter.value
            }>
              <Grid item xs={12}>
                <Typography>
                  Cantidad desde el rollo anterior: {lastMachineCounter ? Number(values.counter) - lastMachineCounter.value : ''}.
                </Typography>
              </Grid>
            </Collapse>
            <SubmitButton />
          </>}
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
