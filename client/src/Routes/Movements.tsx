import * as React from 'react'
import { useState, useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'

import useAuth from '../hooks/useAuth'
import { useSnackbar } from '../components/MySnackbar'
import useFetch from '../hooks/useFetch'
import Layout from '../components/Layout'
import LoadingIndicator from '../components/LoadingIndicator'
import Login from '../components/Login'
import MovementCard from '../components/inventory/MovementCard'
import Title from '../components/Title'
import { Storage, InventoryElement, InventoryMovement, User } from '../models'

const Movements = () => {
  const classes = useStyles()

  const [snackbar, showError] = useSnackbar()
  const [storages] = useFetch<Storage[]>('/api/inventory/storages', {
    showError,
    name: 'la lista de almacenamientos',
  })
  const [inventoryElements] = useFetch<InventoryElement[]>('/api/inventory/inventoryElements', {
    showError,
    name: 'la lista de elementos',
  })

  const [nonce, setNonce] = useState(1)
  const update = useCallback(() => setNonce(prev => prev + 1), [])
  const [movements] = useFetch<InventoryMovement[]>('/api/inventory/movements?limit=30&sortField=createdAt&sortDir=desc', {
    showError,
    name: 'la lista de movimientos recientes',
    nonce: nonce,
  })

  const [users] = useFetch<User[]>('/api/users', {
    showError,
    name: 'lista de empleados',
  })

  // Login to register things
  const auth = useAuth()
  const history = useHistory()
  const goToRegisterProduction = useCallback(() => {
    history.push('/movements/production')
  }, [history])
  const goToRegisterDamaged = useCallback(() => {
    history.push('/movements/damaged')
  }, [history])

  return (
    <Layout title='Movimientos'>
      {snackbar}
      <Title>Registrar Producción</Title>
      <Paper className={classes.login}>
        <Login onSuccess={goToRegisterProduction} auth={auth} />
      </Paper>

      <Title>Registrar Producto Dañado</Title>
      <Paper className={classes.login}>
        <Login onSuccess={goToRegisterDamaged} auth={auth} />
      </Paper>

      <Title>Registrar Ingreso de Insumos</Title>
      <Paper className={classes.login}>
        <Login onSuccess={goToRegisterProduction} auth={auth} />
      </Paper>

      <Title>Movimientos recientes</Title>
      <Grid container spacing={3} alignItems='stretch'>
        {movements && users && storages && inventoryElements ? movements.map(movement =>
          <Grid item key={movement.id} xs={12} md={6}>
            <MovementCard
              movement={movement}
              users={users}
              storages={storages}
              elements={inventoryElements}
            />
          </Grid>
        ) : <LoadingIndicator />}
      </Grid>

    </Layout>
  )
}

const useStyles = makeStyles(theme => ({
  login: {
    padding: theme.spacing(2),
  },
}))

export default Movements
