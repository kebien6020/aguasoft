import * as React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import { useFormikContext } from 'formik'

import useAuth from '../hooks/useAuth'
import useFetch from '../hooks/useFetch'
import useSnackbar from '../hooks/useSnackbar'
import Collapse from '../components/Collapse'
import Form from '../components/form/Form'
import Layout from '../components/Layout'
import SelectField, { SelectOption } from '../components/form/SelectField'
import TextField from '../components/form/TextField'
import Title from '../components/Title'
import Yup from '../components/form/Yup'
import { InventoryElement } from '../models'
import { fetchJsonAuth, isErrorResponse } from '../utils'

const useInventoryElements = () : InventoryElement[] | null => {
  const url = '/api/inventory/inventoryElements'
  const showError = useSnackbar()
  const [inventoryElements] = useFetch<InventoryElement[]>(url, {
    showError,
    name: 'los elementos de inventario'
  })

  return inventoryElements
}

const optionsFromElements = (elements: InventoryElement[] | null) => {
  return elements && elements.map(element => ({
    value: element.code,
    label: element.name,
  }))
}

const damageTypes = [
  're-empaque',
  'devolucion',
  'general',
] as const

type DamageType = (typeof damageTypes)[number]

type Writeable<T> = { -readonly [P in keyof T]: T[P] }

const initialValues = {
  damageType: '' as DamageType | '',
  inventoryElementCode: '',
  amount: '',
}

const validationSchema = Yup.object({
  damageType: Yup.mixed<DamageType>().oneOf(damageTypes as Writeable<typeof damageTypes>).required(),
  inventoryElementCode: Yup.string().required(),
  amount: Yup.number().integer().positive().required(),
})

type Values = typeof initialValues

interface DamageTypeOption extends SelectOption {
  value: DamageType
}

const damageTypeOptions : DamageTypeOption[] = [
  {value: 're-empaque', label: 'Re-empaque'},
  {value: 'devolucion', label: 'Devolución'},
  {value: 'general', label: 'General'},
]

const RegisterDamaged = () => {
  const classes = useStyles()

  const auth = useAuth()
  const showMessage = useSnackbar()

  const handleSubmit = async (values: Values) => {
    const { damageType : dType } = values

    const url = '/api/inventory/movements/damage'
    const payload: Object = {
      damageType: dType,
      amount: Number(values.amount),
      inventoryElementCode: values.inventoryElementCode,
    }

    if (dType === 'devolucion') {
      const response = await fetchJsonAuth(url, auth, {
        method: 'post',
        body: JSON.stringify(payload)
      })

      if (isErrorResponse(response)) {
        showMessage('Error: ' + response.error.message)
        return
      }

      showMessage('Guardado exitoso')
    }
  }

  return (
    <Layout title='Registrar Producto Dañado'>
      <Paper className={classes.paper}>
        <Title>Registrar producto dañado</Title>

        <Form
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
            <Grid item xs={12}>
              <SelectField
                name='damageType'
                label='Tipo de Daño'
                emptyOption='Seleccione un tipo de daño'
                options={damageTypeOptions}
              />
            </Grid>

            <DevolucionForm />
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

const DevolucionForm = () => {
  const { values } = useFormikContext<Values>()
  const dType = values.damageType

  const inventoryElements = useInventoryElements()
  const productElements = inventoryElements && inventoryElements.filter(element =>
    element.type === 'product' || element.code === 'bolsa-360'
  )
  const productElementOptions = optionsFromElements(productElements)

  return (
    <Collapse in={dType === 'devolucion'}>
      <Grid item xs={12} md={6}>
        <SelectField
          name='inventoryElementCode'
          label='Producto'
          options={productElementOptions}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          name='amount'
          label='Cantidad'
        />
      </Grid>
    </Collapse>
  )
}

const SubmitButton = () => {
  const classes = useSubmitButtonStyles()

  const { values } = useFormikContext<Values>()
  const dType = values.damageType

  return (
    <Collapse in={dType !== ''}>
      <Grid item xs={12}>
        <Button variant='contained' color='primary' type='submit' className={classes.button}>
          Registrar
        </Button>
      </Grid>
    </Collapse>
  )
}

const useSubmitButtonStyles = makeStyles({
  button: {
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  }
})

export default RegisterDamaged
