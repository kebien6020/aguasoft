import type { JSX } from 'react'
import Grid from '@mui/material/Grid'
import makeStyles from '@mui/styles/makeStyles'
import Button from '@mui/material/Button'

import useAuth from '../../hooks/useAuth'
import { useSnackbar } from '../MySnackbar'
import { Storage, InventoryElement } from '../../models'
import { fetchJsonAuth, isErrorResponse, ErrorResponse, SuccessResponse } from '../../utils'

import Form from '../form/Form'
import SelectField from '../form/SelectField'
import TextField from '../form/TextField'

export interface ManualMovementFormProps {
  storages: Storage[] | null
  inventoryElements: InventoryElement[] | null
  onUpdate?: () => unknown
}

export default function ManualMovementForm(props: ManualMovementFormProps): JSX.Element {
  const { storages, inventoryElements, onUpdate } = props
  const auth = useAuth()

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

    let response: SuccessResponse | ErrorResponse
    try {
      response = await fetchJsonAuth(url, auth, {
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
    if (onUpdate) onUpdate()

  }

  const baseStorageOptions = [{ value: 'null', label: 'Afuera' }]
  const storageOptions =
    storages
      ? [
        ...baseStorageOptions,
        ...storages.map(s => ({ value: String(s.id), label: s.name })),
      ] : baseStorageOptions

  const inventoryElementOptions =
    inventoryElements
    && inventoryElements.map(ie => ({ value: String(ie.id), label: ie.name }))

  return (
    (<Form
      onSubmit={handleSubmit}
      className={classes.form}
      initialValues={initialValues}
    >
      {({ setFieldValue }) => (<>
        {snackbar}
        <Grid size={{ xs: 12, md: 6 }}>
          <SelectField
            name='storageFrom'
            label='Desde'
            emptyOption='Seleccionar Almacen Desde'
            options={storageOptions}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SelectField
            name='storageTo'
            label='Hacia'
            emptyOption='Seleccionar Almacen Hacia'
            options={storageOptions}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SelectField
            name='inventoryElementFrom'
            label='Elemento'
            emptyOption='Seleccionar Elemento'
            options={inventoryElementOptions}
            onChangeOverride={((e, { field }) => {
              field.onChange(e)
              setFieldValue('inventoryElementTo', e.target.value)
            })}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SelectField
            name='inventoryElementTo'
            label='Elemento destino'
            emptyOption='Seleccionar Elemento'
            options={inventoryElementOptions}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            name='quantityFrom'
            label='Cantidad'
            type='number'
            variant='standard'
            onChangeOverride={((e, { field }) => {
              field.onChange(e)
              setFieldValue('quantityTo', e.target.value)
            })}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            name='quantityTo'
            label='Cantidad Destino'
            type='number'
            variant='standard'
          />
        </Grid>
        <Grid container justifyContent='center'>
          <Button type='submit' variant='contained' color='primary'>
            Crear
          </Button>
        </Grid>
      </>)}
    </Form>)
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
