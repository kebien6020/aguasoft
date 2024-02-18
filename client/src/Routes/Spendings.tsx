import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import moment, { Moment } from 'moment'
import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Link, LinkProps, useHistory } from 'react-router-dom'
import { AuthRouteComponentProps } from '../AuthRoute'
import Layout from '../components/Layout'
import Login from '../components/Login'
import MyDatePicker from '../components/MyDatePicker'
import SpendingList from '../components/Spendings'
import Title from '../components/Title'
import useSnackbar from '../hooks/useSnackbar'
import { Spending } from '../models'
import { ErrorResponse, fetchJsonAuth, isErrorResponse, SuccessResponse } from '../utils'
import { MakeOptional } from '../utils/types'

type SpendingsProps = AuthRouteComponentProps;
export default function Spendings({ auth }: SpendingsProps): JSX.Element {
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

  // Login to register spending
  const history = useHistory()
  const handleLogin = useCallback(() => {
    history.push('/spending')
  }, [history])
  const loginElem =
    <Paper className={classes.login}>
      <Login onSuccess={handleLogin} auth={auth} />
    </Paper>

  // Snackbar
  const setSnackbarError = useSnackbar()

  // Payment List
  const [spendings, setSpendings] = useState<Spending[] | null>(null)
  useEffect(() => {
    const updateSpendings = async () => {
      setSpendings(null)
      const url = '/api/spendings/listDay?day=' + date.format('YYYY-MM-DD')
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
      spending.deletedAt = moment().toISOString()

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

const useStyles = makeStyles(theme => ({
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

const SpendingListLink = React.forwardRef<HTMLAnchorElement, MakeOptional<LinkProps, 'to'>>(
  function SpendingListLink(props, ref) {
    return <Link to='/spendings/list' ref={ref} {...props} />
  }
)

