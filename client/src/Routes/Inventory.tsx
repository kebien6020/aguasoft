import * as React from 'react'
import { useState, useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'

import { useSnackbar } from '../components/MySnackbar'
import useFetch from '../hooks/useFetch'
import useUser from '../hooks/useUser'
import Layout from '../components/Layout'
import ManualMovementForm from '../components/inventory/ManualMovementForm'
import Title from '../components/Title'
import { Storage, InventoryElement, StorageState } from '../models'

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
      />
      <CardContent>
        {ownStorageStates.map(state => {
          const inventoryElement = inventoryElements
            .find(element => element.id === state.inventoryElementId)

          const elemName = inventoryElement ? inventoryElement.name : 'Desconocido'

          return (
            <>
              <strong>{elemName}</strong>: {state.quantity}
            </>
          )
        })}
      </CardContent>
    </Card>
  )
}

const useStorageCardStyles = makeStyles(theme => ({
  card: {
    marginTop: '1rem',
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid',
    borderLeftColor: theme.palette.primary.main,
  }
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
  const [snackbar, showError] = useSnackbar()
  const [storages] = useFetch<Storage[]>('/api/inventory/storages', {
    showError,
    name: 'la lista de almacenamientos',
  })
  const [inventoryElements] = useFetch<InventoryElement[]>('/api/inventory/inventoryElements', {
    showError,
    name: 'la lista de elementos',
  })

  const [statesNonce, setStatesNonce] = useState(1)
  const updateStates = useCallback(() => setStatesNonce(prev => prev + 1), [])
  const [storageStates] = useFetch<StorageState[]>('/api/inventory/state', {
    showError,
    name: 'el estado actual de los inventarios',
    nonce: statesNonce,
  })

  return (
    <Layout title='Inventario'>
      {snackbar}
      <Title>Grafico Principal</Title>
      <div className={classes.center}>
        {manualMovementButton}
      </div>

      {showManualMovementForm &&
        <ManualMovementForm
          storages={storages}
          inventoryElements={inventoryElements}
          onUpdate={updateStates}
        />
      }

      {storages && storageStates && inventoryElements && storages.map(storage =>
        <StorageCard
          key={storage.id}
          storage={storage}
          storageStates={storageStates}
          inventoryElements={inventoryElements}
        />
      )}
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
