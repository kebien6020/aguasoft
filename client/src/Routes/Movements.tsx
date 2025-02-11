import * as React from 'react'
import { useCallback, useState, useRef, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import makeStyles from '@mui/styles/makeStyles'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Pagination from '../components/pagination'

import useAuth from '../hooks/useAuth'
import useFetch from '../hooks/useFetch'
import useMovements from '../hooks/api/useMovements'
import useSnackbar from '../hooks/useSnackbar'
import Layout from '../components/Layout'
import LoadingIndicator from '../components/LoadingIndicator'
import Login from '../components/Login'
import MovementCard from '../components/inventory/MovementCard'
import SelectControl from '../components/controls/SelectControl'
import Title from '../components/Title'
import { Storage, InventoryElement, User } from '../models'
import { Params, scrollToRef } from '../utils'
import { movementCauseOptions } from '../constants'

const ITEMS_PER_PAGE = 30

const Movements = () => {
  const classes = useStyles()

  const showError = useSnackbar()
  const [storages] = useFetch<Storage[]>('/api/inventory/storages', {
    showError,
    name: 'la lista de almacenamientos',
  })
  const [inventoryElements] = useFetch<InventoryElement[]>('/api/inventory/inventoryElements', {
    showError,
    name: 'la lista de elementos',
  })

  const inventoryElementOptions =
    inventoryElements
    && inventoryElements.map(ie => ({ value: String(ie.id), label: ie.name }))

  const [offset, setOffset] = useState(0)
  const [causeFilter, setCauseFilter] = useState('')
  const [elementFilter, setElementFilter] = useState('')

  const params: Params = {
    offset,
    limit: ITEMS_PER_PAGE,
    sortDir: 'desc',
    sortField: 'createdAt',
  }
  if (causeFilter) params.cause = causeFilter
  if (elementFilter) params.inventoryElementId = elementFilter

  const { movements, totalCount, loading } = useMovements(params)

  // Handle filter change while on a high page number
  useEffect(() => {
    if (totalCount && offset > totalCount) {
      const page = Math.floor(totalCount / ITEMS_PER_PAGE)
      setOffset(page * ITEMS_PER_PAGE)
    }
  }, [offset, totalCount])

  const scrollTargetRef = useRef<HTMLDivElement>(null)

  const renderPagination = () => (
    totalCount
    && <Pagination
      limit={ITEMS_PER_PAGE}
      offset={offset}
      total={totalCount}
      onClick={(_, offset) => {
        setOffset(offset)
        scrollToRef(scrollTargetRef)
      }}
      disabled={loading}
      className={classes.pagination}
    />
  )

  const [users] = useFetch<User[]>('/api/users', {
    showError,
    name: 'lista de empleados',
  })

  // Login to register things
  const auth = useAuth()
  const history = useHistory()
  const goToRegisterRelocation = useCallback(() => {
    history.push('/movements/relocation')
  }, [history])
  const goToRegisterProduction = useCallback(() => {
    history.push('/movements/production')
  }, [history])
  const goToRegisterDamaged = useCallback(() => {
    history.push('/movements/damaged')
  }, [history])
  const goToRegisterUnpack = useCallback(() => {
    history.push('/movements/unpack')
  }, [history])
  const goToRegisterEntry = useCallback(() => {
    history.push('/movements/entry')
  }, [history])

  return (
    (<Layout title='Movimientos'>
      <Title>Registrar Salida de Bodega</Title>
      <Paper className={classes.login}>
        <Login onSuccess={goToRegisterRelocation} auth={auth} buttonColor='black' />
      </Paper>
      <Title>Registrar Producción</Title>
      <Paper className={classes.login}>
        <Login onSuccess={goToRegisterProduction} auth={auth} buttonColor='#2e7d32' />
      </Paper>
      <Title>Registrar Producto Dañado</Title>
      <Paper className={classes.login}>
        <Login onSuccess={goToRegisterDamaged} auth={auth} buttonColor='#c30808' />
      </Paper>
      <Title>Registrar Desempaque</Title>
      <Paper className={classes.login}>
        <Login onSuccess={goToRegisterUnpack} auth={auth} buttonColor='blueviolet' />
      </Paper>
      <Title>Registrar Ingreso de Insumos</Title>
      <Paper className={classes.login}>
        <Login onSuccess={goToRegisterEntry} auth={auth} buttonColor='rgb(255, 152, 0)' />
      </Paper>
      <div ref={scrollTargetRef} style={{ height: 0 }} />
      <Title>Movimientos recientes</Title>
      <Grid container spacing={3} justifyContent='center'>
        <Grid item xs={12} md={6}>
          <SelectControl
            id='cause-filter'
            name='cause-filter'
            label='Tipo de Movimiento'
            emptyOption='Todos'
            options={movementCauseOptions}
            value={causeFilter}
            onChange={(e) => setCauseFilter(e.target.value as string)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SelectControl
            id='elem-filter'
            name='elem-filter'
            label='Elemento de Inventario'
            emptyOption='Todos'
            options={inventoryElementOptions}
            value={elementFilter}
            onChange={(e) => setElementFilter(e.target.value as string)}
          />
        </Grid>
      </Grid>
      {renderPagination()}
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
      {renderPagination()}
    </Layout>)
  )
}

const useStyles = makeStyles(theme => ({
  login: {
    padding: theme.spacing(2),
  },
  pagination: {
    textAlign: 'center',
  },
  '@global': {
    html: {
      scrollBehavior: 'smooth',
    },
  },
}))

export default Movements
