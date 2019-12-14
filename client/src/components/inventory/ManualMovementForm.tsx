import * as React from 'react'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

import { useSnackbar } from '../MySnackbar'
import Auth from '../../Auth'
import { Storage, InventoryElement } from '../../models'
import { fetchJsonAuth, isErrorResponse, ErrorResponse, SuccessResponse } from '../../utils'

import Form from '../form/Form'
import SelectField from '../form/SelectField'
import TextField from '../form/TextField'

export interface ManualMovementFormProps {
  storages: Storage[] | null
  inventoryElements: InventoryElement[] | null
  auth: Auth
}

export default function ManualMovementForm(props: ManualMovementFormProps) {
  const { storages, inventoryElements } = props

  const classes = useManualMovementFormStyles()

  const initialValues = {
    storageFrom: '',
    storageTo: '',
    inventoryElementFrom: '',
    inventoryElementTo: '',
    quantityFrom: '',
    quantityTo: '',
  }

  const [snackbar, showMessage] = useSnackbar()
  const handleSubmit = async (values: typeof initialValues) => {
    const url = '/api/inventory/movements/manual'
    const payload = {
      storageFromId: Number(values.storageFrom),
      storageToId: Number(values.storageTo),
      inventoryElementFromId: Number(values.inventoryElementFrom),
      inventoryElementToId: Number(values.inventoryElementTo),
      quantityFrom: Number(values.quantityFrom),
      quantityTo: Number(values.quantityTo),
    }

    let response : SuccessResponse | ErrorResponse
    try {
      response = await fetchJsonAuth(url, props.auth, {
        body: JSON.stringify(payload),
        method: 'post',
      })
    } catch (err) {
      showMessage('Error de conexión creando el movimiento manual')
      return
    }

    if (isErrorResponse(response)) {
      if (response.error.code === 'not_enough_in_source') {
        showMessage('No hay suficientes elementos en "Desde" para realizar la transferencia.')
        return
      }
      showMessage('Error al crear el movimiento manual')
      return
    }

    showMessage('Movimiento creado')

  }

  const baseStorageOptions = [
    {value: 'null', label: 'Afuera'},
  ]
  const storageOptions =
    storages ?
    [
      ...baseStorageOptions,
      ...storages.map(s => ({value: String(s.id), label: s.name}))
    ] : baseStorageOptions

  const inventoryElementOptions =
    inventoryElements &&
    inventoryElements.map(ie => ({value: String(ie.id), label: ie.name}))

  return (
    <Form
      onSubmit={handleSubmit}
      className={classes.form}
      initialValues={initialValues}
    >
      {({setFieldValue}) => (<>
        {snackbar}
        <Grid item xs={12} md={6}>
          <SelectField
            name='storageFrom'
            label='Desde'
            emptyOption='Seleccionar Almacen Desde'
            options={storageOptions}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SelectField
            name='storageTo'
            label='Hacia'
            emptyOption='Seleccionar Almacen Hacia'
            options={storageOptions}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SelectField
            name='inventoryElementFrom'
            label='Elemento'
            emptyOption='Seleccionar Elemento'
            options={inventoryElementOptions}
            onChangeOverride={((e, {field}) => {
              field.onChange(e)
              setFieldValue('inventoryElementTo', e.target.value)
            })}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SelectField
            name='inventoryElementTo'
            label='Elemento destino'
            emptyOption='Seleccionar Elemento'
            options={inventoryElementOptions}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            name='quantityFrom'
            label='Candidad'
            type='number'
            onChangeOverride={((e, {field}) => {
              field.onChange(e)
              setFieldValue('quantityTo', e.target.value)
            })}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            name='quantityTo'
            label='Candidad Destino'
            type='number'
          />
        </Grid>
        <Grid item container justify='center'>
          <Button type='submit' variant='contained' color='primary'>
            Crear
          </Button>
        </Grid>
      </>)}
    </Form>
  )
}

const useManualMovementFormStyles = makeStyles(() => ({
  form: {
    marginTop: 16,
  },
  formControl: {
    minWidth: 150,
  },
}))
