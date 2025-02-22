import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import makeStyles from '@mui/styles/makeStyles'
import { forwardRef, useCallback, useEffect, useState } from 'react'
import { Link, LinkProps, useNavigate } from 'react-router'
import Layout from '../components/Layout'
import Login from '../components/Login'
import MyDatePicker from '../components/MyDatePicker'
import SpendingList from '../components/Spendings'
import Title from '../components/Title'
import useSnackbar from '../hooks/useSnackbar'
import { Spending } from '../models'
import { ErrorResponse, fetchJsonAuth, isErrorResponse, SuccessResponse } from '../utils'
import { MakeOptional } from '../utils/types'
import { startOfDay } from 'date-fns'
import { formatDateonlyMachine } from '../utils/dates'
import useAuth from '../hooks/useAuth'
import { Theme } from '../theme'

export default function Spendings() {
  const auth = useAuth()
  const classes = useStyles()

  // Date picker
  const [date, setDate] = useState(() => startOfDay(new Date))
  const handleDateChange = useCallback((date: Date) => {
    setDate(date)
  }, [])
  const datePicker =
    <MyDatePicker
      date={date}
      className={classes.datePicker}
      onDateChange={handleDateChange}
      DatePickerProps={{
        slotProps: {
          textField: {
            variant: 'outlined',
          },
        },
        label: 'Fecha',
      }}
    />

  // Login to register spending
  const navigate = useNavigate()
  const handleLogin = useCallback(() => {
    navigate('/spending')
  }, [navigate])
  const loginElem =
    <Paper className={classes.login}>
      <Login onSuccess={handleLogin} />
    </Paper>

  // Snackbar
  const setSnackbarError = useSnackbar()

  // Payment List
  const [spendings, setSpendings] = useState<Spending[] | null>(null)
  useEffect(() => {
    const updateSpendings = async () => {
      setSpendings(null)
      const url = '/api/spendings/listDay?day=' + formatDateonlyMachine(date)
      const spendings: ErrorResponse | Spending[] =
        await fetchJsonAuth(url, auth)

      if (!isErrorResponse(spendings)) {
        setSpendings(spendings)
      } else {
        console.error(spendings.error)
        setSnackbarError('Error al cargar las salidas, por favor recarga la página')
      }
    }

    void updateSpendings()
  }, [date, auth, setSnackbarError])

  const handleDeleteSpending = useCallback(async (spendingId: number) => {
    if (!spendings) return

    const url = `/api/spendings/${spendingId}`
    const result: ErrorResponse | SuccessResponse =
      await fetchJsonAuth(url, auth, {
        method: 'delete',
      })

    if (!isErrorResponse(result)) {
      const spendingsCopy = [...spendings]
      const spending = spendingsCopy.find(s => s.id === spendingId)
      if (!spending) {
        console.error('Trying to mutate unknown spendingId', spendingId)
        return
      }
      spending.deletedAt = (new Date).toISOString()

      setSpendings(spendingsCopy)
    } else {
      console.error(result)
      setSnackbarError('Error al eliminar la salida: ' + result.error.message)
    }
  }, [spendings, auth, setSnackbarError])

  return (
    <Layout title='Salidas'>
      <Title>Registrar Salida</Title>
      {loginElem}

      {datePicker}

      <Title>Salidas del día</Title>
      {spendings
        ? <SpendingList spendings={spendings} onDeleteSpending={handleDeleteSpending} />
        : <CircularProgress className={classes.centerBlock} />
      }

      <div className={classes.seeMoreContainer}>
        <Button
          variant='outlined'
          color='primary'
          component={SpendingListLink}
        >
          Ver todas
        </Button>
      </div>
    </Layout>
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  login: {
    padding: theme.spacing(2),
  },
  datePicker: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(0),
  },
  seeMoreContainer: {
    paddingTop: '8px',
    paddingBottom: '8px',
    textAlign: 'center',
  },
  centerBlock: {
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'block',
  },
}))

const SpendingListLink = forwardRef<HTMLAnchorElement, MakeOptional<LinkProps, 'to'>>(
  function SpendingListLink(props, ref) {
    return <Link to='/spendings/list' ref={ref} {...props} />
  },
)

