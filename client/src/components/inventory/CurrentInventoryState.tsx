import type { JSX } from 'react'
import { useState } from 'react'
import makeStyles from '@mui/styles/makeStyles'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

import useFetch from '../../hooks/useFetch'
import useUser from '../../hooks/useUser'
import useSnackbar from '../../hooks/useSnackbar'
import useStorageStates from '../../hooks/api/useStorageStates'
import LoadingIndicator from '../LoadingIndicator'
import ManualMovementForm from './ManualMovementForm'
import Title from '../Title'
import StorageCard from './StorageCard'
import { Storage, InventoryElement } from '../../models'

interface CurrentInventoryStateProps {
  inventoryElements: InventoryElement[] | null
}

const CurrentInventoryState = (props: CurrentInventoryStateProps): JSX.Element => {
  const { inventoryElements } = props

  const classes = useStyles()

  // Create manual movement
  const { isAdmin } = useUser() ?? {}
  const [showManualMovementForm, setShowManualMovementForm] = useState(false)
  const manualMovementButton =
    isAdmin && (
      <Button
        variant='outlined'
        color='primary'
        onClick={() => {
          setShowManualMovementForm(prev => !prev)
        }}
      >
        Crear movimiento manual
      </Button>
    )

  // Fetch from server
  const showError = useSnackbar()
  const [storages] = useFetch<Storage[]>('/api/inventory/storages', {
    showError,
    name: 'la lista de almacenamientos',
  })

  const [storageStates, update] = useStorageStates()

  return (
    <>
      <Title>Grafico Principal</Title>
      <div className={classes.button}>
        {manualMovementButton}
      </div>

      {showManualMovementForm
        && <ManualMovementForm
          storages={storages}
          inventoryElements={inventoryElements}
          onUpdate={update}
        />
      }

      <Grid container spacing={2}>
        {storages && storageStates && inventoryElements ? storages.map(storage =>
          <Grid key={storage.id} size={{ xs: 12, md: 6 }}>
            <StorageCard
              storage={storage}
              storageStates={storageStates}
              inventoryElements={inventoryElements}
            />
          </Grid>,
        ) : <LoadingIndicator />}
      </Grid>
    </>
  )
}

const useStyles = makeStyles(() => ({
  button: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'center',
    marginBottom: '1rem',
  },
}))

export default CurrentInventoryState

