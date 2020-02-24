import * as React from 'react'

import CurrentInventoryState from '../components/inventory/CurrentInventoryState'
import Layout from '../components/Layout'
import LoadingIndicator from '../components/LoadingIndicator'
import MovementSummary from '../components/inventory/MovementSummary'
import useSnackbar from '../hooks/useSnackbar'
import useFetch from '../hooks/useFetch'
import { InventoryElement } from '../models'

const Inventory = () => {
  const showError = useSnackbar()

  const [inventoryElements] = useFetch<InventoryElement[]>('/api/inventory/inventoryElements', {
    showError,
    name: 'la lista de elementos',
  })

  return (
    <Layout title='Inventario'>
      <CurrentInventoryState inventoryElements={inventoryElements} />
      {inventoryElements ?
        <MovementSummary /> :
        <LoadingIndicator />
      }
    </Layout>
  )
}

export default Inventory
