import type { JSX } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
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
import { startOfDay } from 'date-fns'
import { formatDateonlyMachine } from '../utils/dates'
import { VSpace, Center } from '../components/utils'
import { styled } from '@mui/material/styles'
import { Theme } from '../theme'

export interface Filter {
  client: string
  user: string
}

export default function Sells(): JSX.Element {
  const auth = useAuth()

  // Date picker
  const [date, setDate] = useState(() => startOfDay(new Date))
  const handleDateChange = useCallback((date: Date) => {
    setDate(date)
  }, [])
  const datePicker =
    <MyDatePicker
      date={date}
      onDateChange={handleDateChange}
      DatePickerProps={{
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
      const url = '/api/sells/listDay?day=' + formatDateonlyMachine(date)
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
    history.push('/sell')
  }, [history])
  const loginElem =
    <LoginWrapper>
      <Login onSuccess={handleLogin} auth={auth} />
    </LoginWrapper>

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
      <VSpace />
      {datePicker}

      <Title>Resumen</Title>
      {sells
        ? <DayOverview sells={sells} onFilterChange={setFilter} filter={filter} />
        : <Center><CircularProgress /></Center>
      }

      <Title>Ventas del Día</Title>
      {filteredSells
        ? <SellList
          sells={filteredSells}
          refresh={refresh}
          disableDelete={!enableDelete}
        />
        : <Center><CircularProgress /></Center>
      }

      {snackbar}
    </Layout>
  )
}

const LoginWrapper = styled(Paper)(({ theme }: { theme: Theme }) => ({
  padding: theme.spacing(2),
})) as typeof Paper
