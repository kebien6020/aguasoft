import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'

import CircularProgress from '@material-ui/core/CircularProgress'
import Paper from '@material-ui/core/Paper'


import { AuthRouteComponentProps } from '../AuthRoute'
import { useSnackbar } from '../components/MySnackbar'
import Login from '../components/Login'
import SellList, { Sell } from '../components/Sells'
import MyDatePicker from '../components/MyDatePicker'
import DayOverview from '../components/DayOverview'
import Layout from '../components/Layout'
import Title from '../components/Title'
import { fetchJsonAuth, ErrorResponse, SuccessResponse, isErrorResponse } from '../utils'

import * as moment from 'moment'
import { Moment } from 'moment'
import 'moment/locale/es'
moment.locale('es')

export interface Filter {
  client: string
  user: string
}

type SellsProps = AuthRouteComponentProps<{}>
export default function Sells(props: SellsProps) {
  const { auth } = props
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
  const [sells, setSells] = useState<Sell[]|null>(null)
  useEffect(() => {
    const updateSells = async () => {
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
    }

    updateSells()
  }, [date])

  const handleDeleteSell = useCallback(async (sellId: number) => {
    if (!sells) return

    const url = '/api/sells/' + sellId
    const result : ErrorResponse | SuccessResponse =
      await fetchJsonAuth(url, auth, {
        method: 'delete',
      })

    if (!isErrorResponse(result)) {
      const sellsCopy = [...sells]
      const sell = sellsCopy.find(s => s.id === sellId)
      if (!sell) {
        console.error('Trying to mutate unknown sellId', sellId)
        return
      }
      sell.deleted = true

      setSells(sellsCopy)
    } else {
      console.error(result)
    }
  }, [sells, auth])

  // Login to register sell
  const history = useHistory()
  const handleLogin = useCallback(() => {
    history.push('/sell')
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
      if (String(sell.Client.id) !== filter.client) {
        return false;
      }
    }

    if (filter.user !== 'ALL') {
      if (String(sell.User.code) !== filter.user) {
        return false;
      }
    }

    return true;
  })

  const sellList =
    filteredSells && <SellList
       sells={filteredSells}
       onDeleteSell={handleDeleteSell}
    />

  return (
    <Layout title='Ventas' auth={auth}>
      <Title>Registrar Venta</Title>
      {loginElem}

      {datePicker}

      <Title>Resumen</Title>
      {sells ?
        <DayOverview sells={sells} onFilterChange={setFilter} filter={filter} /> :
        <CircularProgress className={classes.centerBlock} />
      }

      <Title>Ventas del Día</Title>
      {sells ?
        sellList :
        <CircularProgress className={classes.centerBlock} />
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
