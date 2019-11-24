import * as React from 'react'
import { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'

import Auth from '../Auth'
import Form from '../components/form/Form'
import Layout from '../components/Layout'
import SelectField from '../components/form/SelectField'
import Title from '../components/Title'
import { useSnackbar } from '../components/MySnackbar'
import useUser from '../hooks/useUser'
import { Storage, InventoryElement } from '../models'
import { fetchJsonAuth, FetchAuthOptions, isErrorResponse, ErrorResponse } from '../utils'

interface Props {
  auth: Auth
}

interface ManualMovementFormProps {
  storages: Storage[] | null
  inventoryElements: InventoryElement[] | null
}

function ManualMovementForm(props: ManualMovementFormProps) {
  const { storages, inventoryElements } = props

  const classes = useManualMovementFormStyles()

  const initialValues = {
    storageFrom: '',
    storageTo: '',
    productFrom: '',
    productTo: '',
  }

  const handleSubmit = (values: typeof initialValues) => {
    console.log(values)


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
            name='productFrom'
            label='Elemento'
            emptyOption='Seleccionar Elemento'
            options={inventoryElementOptions}
            onChangeOverride={((e, {field}) => {
              field.onChange(e)
              setFieldValue('productTo', e.target.value)
            })}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SelectField
            name='productTo'
            label='Elemento destino'
            emptyOption='Seleccionar Elemento'
            options={inventoryElementOptions}
          />
        </Grid>
        <Button type='submit'>test</Button>
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

interface UseFetchOptions {
  showError: (s: string) => any
  auth: Auth
  name: string
  options?: FetchAuthOptions
}

const useFetch = <T extends object>(
  url: string,
  hookOptions: UseFetchOptions
) => {
  const {
    showError,
    auth,
    name,
    options,
  } = hookOptions

  const [data, setData] = useState<null | T>(null)
  const [error, setError] = useState<null | ErrorResponse['error']>(null)
  const [loading, setLoading] = useState<boolean>(false)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response : T | ErrorResponse = await fetchJsonAuth(url, auth, options)

        if (!isErrorResponse(response)) {
          setData(response)
        } else {
          console.error(response.error)
          showError('Error tratando de obtener ' + name)
          setError(response.error)
        }
      } catch (error) {
        console.error(error)
        showError('Error de conexión tratando de obtener ' + name)
      } finally {
        setLoading(false)
      }
    }

    fetchData();
  }, [])

  return [data, loading, error] as [T | null, boolean, typeof error]
}

export default function Inventory(props: Props) {
  const { auth } = props
  const classes = useStyles()

  // Create manual movement
  const { isAdmin } = useUser(auth)
  const [showManualMovementForm, setShowManualMovementForm] = useState(false)
  const manualMovementButton =
    isAdmin && (
      <Button
        variant='outlined'
        color='primary'
        onClick={() => setShowManualMovementForm(!showManualMovementForm)}
      >
        Crear movimiento manual
      </Button>
    )

  // Fetch from server
  const [snackbar, showError] = useSnackbar()
  const [storages] = useFetch<Storage[]>('/api/inventory/storages', {
    showError,
    name: 'la lista de almacenamientos',
    auth,
  })
  const [inventoryElements] = useFetch<InventoryElement[]>('/api/inventory/inventoryElements', {
    showError,
    name: 'la lista de elementos',
    auth,
  })

  return (
    <Layout title='Inventario' auth={auth}>
      {snackbar}
      <Title>Grafico Principal</Title>
      <div className={classes.center}>
        {manualMovementButton}
      </div>

      {showManualMovementForm &&
        <ManualMovementForm
          storages={storages}
          inventoryElements={inventoryElements}
        />
      }
    </Layout>
  )
}

const useStyles = makeStyles(() => ({
  center: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'center',
  }
}))
