import * as React from 'react'
import { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

import { useSnackbar } from '../components/MySnackbar'
import useFetch from '../hooks/useFetch'
import useUser from '../hooks/useUser'
import Layout from '../components/Layout'
import ManualMovementForm from '../components/inventory/ManualMovementForm'
import Title from '../components/Title'
import { Storage, InventoryElement } from '../models'

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
  })
  const [inventoryElements] = useFetch<InventoryElement[]>('/api/inventory/inventoryElements', {
    showError,
    name: 'la lista de elementos',
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
