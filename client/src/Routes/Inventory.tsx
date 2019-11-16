import * as React from 'react'
import { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import FormControl from '@material-ui/core/FormControl'
import Grid from '@material-ui/core/Grid'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select, {SelectProps} from '@material-ui/core/Select'

import Auth from '../Auth'
import Layout from '../components/Layout'
import Title from '../components/Title'
import { useSnackbar } from '../components/MySnackbar'
import useUser from '../hooks/useUser'
import { Storage, InventoryElement } from '../models'
import { fetchJsonAuth, FetchAuthOptions, isErrorResponse, ErrorResponse } from '../utils'

interface Props {
  auth: Auth
}

interface CustomSelectProps extends SelectProps {
  id: string
  label: React.ReactNode
}

const CustomSelect = (props: CustomSelectProps) => {
  const { id, label, ...otherProps } = props

  const classes = useCustomSelectStyles()

  return (
    <Grid item component={FormControl}
      sm={12} md={6}
      className={classes.formControl}
    >
      <InputLabel id={id}>{label}</InputLabel>
      <Select
        id={id}
        {...otherProps}
      />
    </Grid>
  )
}

const useCustomSelectStyles = makeStyles(() => ({
  formControl: {
    minWidth: 150,
  },
}))

const useSelect = (initialValue: string) => {
  const [value, setValue] = useState(initialValue)
  const handleValueChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setValue(event.target.value as string);
  };

  const props = {
    value: value,
    onChange: handleValueChange,
  }

  return [props, setValue] as [typeof props, typeof setValue]
}


interface ManualMovementFormProps {
  storages: Storage[] | null
  inventoryElements: InventoryElement[] | null
}

function ManualMovementForm(props: ManualMovementFormProps) {
  const { storages, inventoryElements } = props

  const classes = useManualMovementFormStyles()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();


  }

  // Storage from
  const [storageFrom] = useSelect('')

  // Storage to
  const [storageTo] = useSelect('')

  // InventoryElement from
  const [inventoryElementFrom] = useSelect('')

  // InventoryElement to
  const [inventoryElementTo, setInventoryElementTo] = useSelect('')
  useEffect(() => {
    setInventoryElementTo(inventoryElementFrom.value)
  }, [inventoryElementFrom.value])

  return (
    <Grid container component='form'
      spacing={2}
      onSubmit={handleSubmit}
      className={classes.form}
    >
      <CustomSelect
        id='storage-from'
        label='Desde'
        {...storageFrom}
      >
        <MenuItem value=''>Seleccionar Almacen Desde</MenuItem>
        <MenuItem value='null'>Afuera</MenuItem>
        {storages && storages.map(storage =>
          <MenuItem key={storage.id} value={storage.id}>{storage.name}</MenuItem>
        )}
      </CustomSelect>
      <CustomSelect
        id='storage-to'
        label='Hacia'
        {...storageTo}
      >
        <MenuItem value=''>Seleccionar Almacen Hacia</MenuItem>
        <MenuItem value='null'>Afuera</MenuItem>
        {storages && storages.map(storage =>
          <MenuItem key={storage.id} value={storage.id}>{storage.name}</MenuItem>
        )}
      </CustomSelect>
      <CustomSelect
        id='product-from'
        label='Elemento'
        {...inventoryElementFrom}
      >
        <MenuItem value=''>Seleccionar Elemento</MenuItem>
        {inventoryElements && inventoryElements.map(inventoryElement =>
          <MenuItem key={inventoryElement.id} value={inventoryElement.id}>{inventoryElement.name}</MenuItem>
        )}
      </CustomSelect>
      <CustomSelect
        id='product-from'
        label='Elemento destino'
        {...inventoryElementTo}
      >
        <MenuItem value=''>Seleccionar Elemento</MenuItem>
        {inventoryElements && inventoryElements.map(inventoryElement =>
          <MenuItem key={inventoryElement.id} value={inventoryElement.id}>{inventoryElement.name}</MenuItem>
        )}
      </CustomSelect>
    </Grid>
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
