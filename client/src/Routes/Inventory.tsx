import * as React from 'react'

import Auth from '../Auth'
import Layout from '../components/Layout'
import Title from '../components/Title'

interface Props {
  auth: Auth
}

export default function Inventory(props: Props) {
  const { auth } = props

  return (
    <Layout title='Inventario' auth={auth}>
      <Title>Grafico Principal</Title>
    </Layout>
  )
}
