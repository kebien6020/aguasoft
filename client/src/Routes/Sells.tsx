import CircularProgress from '@material-ui/core/CircularProgress'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import moment from 'moment'
import { Moment } from 'moment'
import 'moment/locale/es'
import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import DayOverview from '../components/DayOverview'
import Layout from '../components/Layout'
import Login from '../components/Login'
import MyDatePicker from '../components/MyDatePicker'
import { useSnackbar } from '../components/MySnackbar'
import SellList, { Sell } from '../components/Sells'
import Title from '../components/Title'
import useNonce from '../hooks/api/useNonce'
import useAuth from '../hooks/useAuth'
import { useUserFetch } from '../hooks/useUser'
import { ErrorResponse, fetchJsonAuth, isErrorResponse } from '../utils'




moment.locale('es')

export interface Filter {
  client: string
  user: string
}

export default function Sells(): JSX.Element {
  const auth = useAuth()
  const classes = useStyles()

  // Date picker
  const [date, setDate] = useState(() => moment().startOf('day'))
  const handleDateChange = useCallback((date: Moment) => {
    setDate(date)
  }, [])
  const datePicker =
    <MyDatePicker
      date={date}
      className={classes.datePicker}
      onDateChange={handleDateChange}
      DatePickerProps={{
        inputVariant: 'outlined',
        label: 'Fecha',
      }}
    />

  // Snackbar
  const [snackbar, setSnackbarError] = useSnackbar()

  // Sell List
  const [sells, setSells] = useState<Sell[] | null>(null)
  const [nonce, refresh] = useNonce()
  useEffect(() => {
    (async () => {
      setSells(null)
      const url = '/api/sells/listDay?day=' + date.format('YYYY-MM-DD')
      const sells: ErrorResponse | Sell[] =
        await fetchJsonAuth(url, auth)

      if (!isErrorResponse(sells)) {
        setSells(sells)
      } else {
        console.error(sells.error)
        setSnackbarError('Error al cargar las ventas, por favor recarga la página')
      }
    })()
  }, [date, auth, setSnackbarError, nonce])

  // Login to register sell
  const history = useHistory()
  const handleLogin = useCallback(() => {
    history.push('/sell2')
  }, [history])
  const loginElem =
    <Paper className={classes.login}>
      <Login onSuccess={handleLogin} auth={auth} />
    </Paper>

  // Filter
  const [filter, setFilter] = useState<Filter>({
    client: 'ALL', // 'ALL' for no filter
    user: 'ALL',
  })

  const filteredSells = sells && sells.filter(sell => {
    if (filter.client !== 'ALL') {
      if (String(sell.Client.id) !== filter.client)
        return false

    }

    if (filter.user !== 'ALL') {
      if (String(sell.User.code) !== filter.user)
        return false

    }

    return true
  })

  const handleUserError = useCallback((error: ErrorResponse['error']) => {
    if (error.code === 'no_user') {
      // ignore not logged in
      return
    }
    setSnackbarError(`Error al cargar el usuario actual: ${error.message}`)
  }, [setSnackbarError])
  const { isAdmin } = useUserFetch(handleUserError)

  const enableDelete = Boolean(isAdmin)

  return (
    <Layout title='Ventas'>
      <Title>Registrar Venta</Title>
      {loginElem}

      {datePicker}

      <Title>Resumen</Title>
      {sells
        ? <DayOverview sells={sells} onFilterChange={setFilter} filter={filter} />
        : <CircularProgress className={classes.centerBlock} />
      }

      <Title>Ventas del Día</Title>
      {filteredSells
        ? <SellList
          sells={filteredSells}
          refresh={refresh}
          disableDelete={!enableDelete}
        />
        : <CircularProgress className={classes.centerBlock} />
      }

      {snackbar}
    </Layout>
  )
}

const useStyles = makeStyles(theme => ({
  login: {
    padding: theme.spacing(2),
  },
  datePicker: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(0),
  },
  centerBlock: {
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'block',
  },
}))
