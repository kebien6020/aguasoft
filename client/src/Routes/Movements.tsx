import * as React from 'react'
import { useCallback, useState, useRef, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Pagination from 'material-ui-flat-pagination'

import useAuth from '../hooks/useAuth'
import useFetch from '../hooks/useFetch'
import useSnackbar from '../hooks/useSnackbar'
import Layout from '../components/Layout'
import LoadingIndicator from '../components/LoadingIndicator'
import Login from '../components/Login'
import MovementCard from '../components/inventory/MovementCard'
import SelectControl from '../components/controls/SelectControl'
import Title from '../components/Title'
import { Storage, InventoryElement, InventoryMovement, User } from '../models'
import { paramsToString, Params, scrollToRef } from '../utils'
import { movementCauseOptions } from '../constants'

interface InventoryMovementsResponse {
  movements: InventoryMovement[]
}

interface InventoryMovementsWithCountResponse extends InventoryMovementsResponse {
  totalCount?: number
}

const ITEMS_PER_PAGE = 30

const useMovements = (params: Params = {}) => {
  const showError = useSnackbar()

  const url = '/api/inventory/movements?' + paramsToString(params)

  type Response = InventoryMovementsWithCountResponse
  const [res, loading, error] = useFetch<Response>(url, {
    showError,
    name: 'la lista de movimientos recientes',
  })

  const { movements = null, totalCount = null } = res || {}

  return {movements, totalCount, loading, error}
}

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

  const [offset, setOffset] = useState(0)
  const [causeFilter, setCauseFilter] = useState('')

  const params: Params = {
    offset,
    limit: ITEMS_PER_PAGE,
    sortDir: 'desc',
    sortField: 'createdAt',
  }
  if (causeFilter) params.cause = causeFilter

  const {movements, totalCount, loading} = useMovements(params)

  // Handle filter change while on a high page number
  useEffect(() => {
    if (totalCount && offset > totalCount) {
      const page = Math.floor(totalCount/ITEMS_PER_PAGE)
      setOffset(page * ITEMS_PER_PAGE)
    }
  }, [offset, totalCount])

  const scrollTargetRef = useRef<HTMLDivElement>(null)

  const renderPagination = () => (
    totalCount &&
      <Pagination
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
    <Layout title='Movimientos'>
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

      <div ref={scrollTargetRef} style={{height: 0}} />
      <Title>Movimientos recientes</Title>
      <Grid container spacing={3} justify='center'>
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

    </Layout>
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
    }
  }
}))

export default Movements
