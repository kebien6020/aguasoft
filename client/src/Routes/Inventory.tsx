import * as React from 'react'
import { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import FormControl from '@material-ui/core/FormControl'
import Grid from '@material-ui/core/Grid'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'

import Auth from '../Auth'
import Layout from '../components/Layout'
import Title from '../components/Title'
import { useSnackbar } from '../components/MySnackbar'
import useUser from '../hooks/useUser'
import { Storage } from '../models'
import { fetchJsonAuth, isErrorResponse, ErrorResponse } from '../utils'

interface Props {
  auth: Auth
}

interface ManualMovementFormProps {
  storages: Storage[] | null
}

const useManualMovementFormStyles = makeStyles(() => ({
  form: {
    marginTop: 16,
  },
  formControl: {
    minWidth: 150,
  },
}))

function ManualMovementForm(props: ManualMovementFormProps) {
  const { storages } = props

  const classes = useManualMovementFormStyles()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();


  }

  // Storage from
  const [storageFrom, setStorageFrom] = useState('')
  const handleStorageFromChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStorageFrom(event.target.value as string);
  };

  // Storage to
  const [storageTo, setStorageTo] = useState('')
  const handleStorageToChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStorageTo(event.target.value as string);
  };

  return (
    <Grid container component='form'
      spacing={2}
      onSubmit={handleSubmit}
      className={classes.form}
    >
      <Grid item component={FormControl}
        sm={12} md={6}
        className={classes.formControl}
      >
        <InputLabel id='storage-from'>Desde</InputLabel>
        <Select
          id='storage-from'
          value={storageFrom}
          onChange={handleStorageFromChange}
        >
          <MenuItem value=''>Seleccionar Almacen Desde</MenuItem>
          <MenuItem value='null'>Afuera</MenuItem>
          {storages && storages.filter(s => String(s.id) !== storageTo).map(storage =>
            <MenuItem key={storage.id} value={storage.id}>{storage.name}</MenuItem>
          )}
        </Select>
      </Grid>
      <Grid item component={FormControl}
        sm={12} md={6}
        className={classes.formControl}
      >
        <InputLabel id='storage-to'>Hacia</InputLabel>
        <Select
          id='storage-to'
          value={storageTo}
          onChange={handleStorageToChange}
        >
          <MenuItem value=''>Seleccionar Almacen Hacia</MenuItem>
          <MenuItem value='null'>Afuera</MenuItem>
          {storages && storages.filter(s => String(s.id) !== storageFrom).map(storage =>
            <MenuItem key={storage.id} value={storage.id}>{storage.name}</MenuItem>
          )}
        </Select>
      </Grid>
    </Grid>
  )
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
  const [storages, setStorages] = useState<null | Storage[]>(null)
  useEffect(() => {
    const fetchStorages = async () => {
      const url = '/api/inventory/storages'

      try {
        const response : Storage[] | ErrorResponse = await fetchJsonAuth(url, auth)

        if (!isErrorResponse(response)) {
          setStorages(response)
        } else {
          console.error(response.error)
          showError('Error tratando de obtener la lista de almacenamientos')
        }
      } catch (error) {
        console.error(error)
        showError('Error de conexión tratando de obtener la lista de almacenamientos')
      }
    }

    fetchStorages();
  }, [])


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
