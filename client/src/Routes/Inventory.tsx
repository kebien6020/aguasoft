import * as React from 'react'
import { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'

import useFetch from '../hooks/useFetch'
import useUser from '../hooks/useUser'
import useSnackbar from '../hooks/useSnackbar'
import Layout from '../components/Layout'
import LoadingIndicator from '../components/LoadingIndicator'
import ManualMovementForm from '../components/inventory/ManualMovementForm'
import Title from '../components/Title'
import { Storage, InventoryElement, StorageState } from '../models'
import useStorageStates from '../hooks/api/useStorageStates'

interface StorageCardProps {
  storage: Storage
  storageStates: StorageState[]
  inventoryElements: InventoryElement[]
}

const StorageCard = (props: StorageCardProps) => {
  const classes = useStorageCardStyles()

  const { storage, storageStates, inventoryElements } = props
  const ownStorageStates = storageStates.filter(state => state.storageId === storage.id)
  return (
    <Card className={classes.card}>
      <CardHeader
        title={storage.name}
        className={classes.header}
        classes={{
          title: classes.title,
        }}
      />
      <CardContent>
        {ownStorageStates.map(state => {
          const inventoryElement = inventoryElements
            .find(element => element.id === state.inventoryElementId)

          const elemName = inventoryElement ? inventoryElement.name : 'Desconocido'

          return (
            <div key={state.inventoryElementId}>
              <strong>{elemName}</strong>: {state.quantity}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

const useStorageCardStyles = makeStyles(theme => ({
  card: {
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid',
    borderLeftColor: theme.palette.primary.main,
    height: '100%',
  },
  header: {
    borderBottom: '1px solid rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
}))

export default function Inventory() {
  const classes = useStyles()

  // Create manual movement
  const { isAdmin } = useUser()
  const [showManualMovementForm, setShowManualMovementForm] = useState(false)
  const manualMovementButton =
    isAdmin && (
      <Button
        variant='outlined'
        color='primary'
        onClick={() => setShowManualMovementForm(prev => !prev)}
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
  const [inventoryElements] = useFetch<InventoryElement[]>('/api/inventory/inventoryElements', {
    showError,
    name: 'la lista de elementos',
  })

  const [storageStates, update] = useStorageStates()

  return (
    <Layout title='Inventario'>
      <Title>Grafico Principal</Title>
      <div className={classes.button}>
        {manualMovementButton}
      </div>

      {showManualMovementForm &&
        <ManualMovementForm
          storages={storages}
          inventoryElements={inventoryElements}
          onUpdate={update}
        />
      }

      <Grid container spacing={2}>
        {storages && storageStates && inventoryElements ? storages.map(storage =>
          <Grid item key={storage.id} xs={12} md={6}>
            <StorageCard
              storage={storage}
              storageStates={storageStates}
              inventoryElements={inventoryElements}
            />
          </Grid>
        ) : <LoadingIndicator />}
      </Grid>

    </Layout>
  )
}

const useStyles = makeStyles(() => ({
  button: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'center',
    marginBottom: '1rem',
  }
}))
