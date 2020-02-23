import * as React from 'react'

import CurrentInventoryState from '../components/inventory/CurrentInventoryState'
import Layout from '../components/Layout'

const Inventory = () => {
  return (
    <Layout title='Inventario'>
      <CurrentInventoryState />

    </Layout>
  )
}

export default Inventory
