import * as React from 'react'
import { useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import { useFormikContext } from 'formik'

import useAuth from '../hooks/useAuth'
import useFetch from '../hooks/useFetch'
import useNonce from '../hooks/api/useNonce'
import useSnackbar from '../hooks/useSnackbar'
import useInventoryElements, { optionsFromElements } from '../hooks/api/useInventoryElements'
import Collapse from '../components/Collapse'
import Form from '../components/form/Form'
import Layout from '../components/Layout'
import SelectField, { SelectOption } from '../components/form/SelectField'
import SelectElementField from '../components/inventory/SelectElementField'
import TextField from '../components/form/TextField'
import Title from '../components/Title'
import Yup from '../components/form/Yup'
import { InventoryElement, Storage } from '../models'
import { fetchJsonAuth, isErrorResponse } from '../utils'

const useStorages = () : InventoryElement[] | null => {
  const url = '/api/inventory/storages'
  const showError = useSnackbar()
  const [storages] = useFetch<InventoryElement[]>(url, {
    showError,
    name: 'la lista de almacenes'
  })

  return storages
}

const optionsFromStorages = (storages: readonly Storage[] | null) => {
  return storages && storages.map(storage => ({
    value: storage.code,
    label: storage.name,
  }))
}

const damageTypes = [
  'devolucion',
  'general',
] as const

type DamageType = (typeof damageTypes)[number]

type Writeable<T> = { -readonly [P in keyof T]: T[P] }

const initialValues = {
  damageType: '' as DamageType | '',
  storageCode: '',
  inventoryElementCode: '',
  amount: '',
}

const validationSchema = Yup.object({
  damageType: Yup.mixed<DamageType>().oneOf(damageTypes as Writeable<typeof damageTypes>).required(),
  storageCode: Yup.mixed().when('damageType', {is: 'general',
    then: Yup.string().required(),
  }),
  inventoryElementCode: Yup.string().required(),
  amount: Yup.number().integer().positive().required(),
})

type Values = typeof initialValues

interface DamageTypeOption extends SelectOption {
  value: DamageType
}

const damageTypeOptions : DamageTypeOption[] = [
  {value: 'devolucion', label: 'Devolución'},
  {value: 'general', label: 'General'},
]

const RegisterDamaged = () => {
  const classes = useStyles()

  const [inventoryElements] = useInventoryElements()

  const auth = useAuth()
  const showMessage = useSnackbar()

  const [statesNonce, updateStates] = useNonce()
  const history = useHistory()
  const handleSubmit = async (values: Values) => {
    const { damageType : dType } = values

    const url = '/api/inventory/movements/damage'
    let payload: Object = {
      damageType: dType,
      amount: Number(values.amount),
      inventoryElementCode: values.inventoryElementCode,
    }

    if (dType === 'general') {
      payload = {
        ...payload,
        storageCode: values.storageCode,
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

            <DevolucionForm inventoryElements={inventoryElements} statesNonce={statesNonce} />
            <GeneralForm inventoryElements={inventoryElements} statesNonce={statesNonce} />
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

interface DevolucionFormProps {
  inventoryElements: readonly InventoryElement[] | null
  statesNonce: number
}

const DevolucionForm = (props: DevolucionFormProps) => {
  const { inventoryElements, statesNonce } = props
  const { values } = useFormikContext<Values>()
  const dType = values.damageType

  const productElements = inventoryElements && inventoryElements.filter(element =>
    element.type === 'product' || element.code === 'bolsa-360'
  )
  const productElementOptions = optionsFromElements(productElements)

  return (
    <Collapse in={dType === 'devolucion'}>
      <Grid item xs={12} md={6}>
        <SelectElementField
          name='inventoryElementCode'
          label='Producto'
          emptyOption='Seleccione el producto'
          options={productElementOptions}
          storageCode='terminado'
          statesNonce={statesNonce}
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

interface GeneralFormProps {
  inventoryElements: readonly InventoryElement[] | null
  statesNonce: number
}

const GeneralForm = (props: GeneralFormProps) => {
  const { inventoryElements, statesNonce } = props

  const { values } = useFormikContext<Values>()
  const dType = values.damageType

  const inventoryElementOptions = optionsFromElements(inventoryElements)
  const storages = useStorages()
  const storageOptions = optionsFromStorages(storages)

  return (
    <Collapse in={dType === 'general'}>
      <Grid item xs={12} md={6}>
        <SelectField
          name='storageCode'
          label='Almacen'
          emptyOption='Seleccione el almacen'
          options={storageOptions}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <SelectElementField
          name='inventoryElementCode'
          label='Elemento de inventario'
          emptyOption='Seleccione el elemento de inventario'
          options={inventoryElementOptions}
          storageCode={values.storageCode}
          statesNonce={statesNonce}
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
