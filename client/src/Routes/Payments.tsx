import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { useHistory, Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import * as moment from 'moment'
import { Moment } from 'moment'

import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Paper from '@material-ui/core/Paper'

import { AuthRouteComponentProps } from '../AuthRoute'
import { useSnackbar } from '../components/MySnackbar'
import Layout from '../components/Layout'
import Login from '../components/Login'
import MyDatePicker from '../components/MyDatePicker'
import PaymentList from '../components/Payments';
import Title from '../components/Title'
import { Payment } from '../models'
import { fetchJsonAuth, ErrorResponse, SuccessResponse, isErrorResponse } from '../utils'

type PaymentsProps = AuthRouteComponentProps<{}>;
export default function Payments({auth}: PaymentsProps) {
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

  // Login to register payment
  const history = useHistory()
  const handleLogin = useCallback(() => {
    history.push('/payment')
  }, [history])
  const loginElem =
    <Paper className={classes.login}>
      <Login onSuccess={handleLogin} auth={auth} />
    </Paper>

  // Snackbar
  const [snackbar, setSnackbarError] = useSnackbar()

  // Payment List
  const [payments, setPayments] = useState<Payment[]|null>(null)
  useEffect(() => {
    const updatePayments = async () => {
      setPayments(null)
      const url = '/api/payments/listDay?day=' + date.format('YYYY-MM-DD')
      const payments: ErrorResponse | Payment[] =
        await fetchJsonAuth(url, auth)

      if (!isErrorResponse(payments)) {
        setPayments(payments)
      } else {
        console.error(payments.error)
        setSnackbarError('Error al cargar los pagos, por favor recarga la página')
      }
    }

    updatePayments()
  }, [date])

  const handleDeletePayment = useCallback(async (paymentId: number) => {
    if (!payments) return

    const url = '/api/payment/' + paymentId
    const result : ErrorResponse | SuccessResponse =
      await fetchJsonAuth(url, auth, {
        method: 'delete',
      })

    if (!isErrorResponse(result)) {
      const paymentsCopy = [...payments]
      const payment = paymentsCopy.find(p => p.id === paymentId)
      if (!payment) {
        console.error('Trying to mutate unknown paymentId', paymentId)
        return
      }
      payment.deletedAt = moment().toISOString()

      setPayments(paymentsCopy)
    } else {
      console.error(result)
    }
  }, [payments, auth])

  const paymentList =
    payments && <PaymentList
       payments={payments}
       onDeletePayment={handleDeletePayment}
    />

  const renderLinkPayments = React.forwardRef((props: any, ref: any) =>
    <Link to='/payments/list' ref={ref} {...props} />)

  return (
    <Layout title='Pagos' auth={auth}>
      <Title>Registrar Pago</Title>
      {loginElem}

      {datePicker}

      <Title>Pagos del día</Title>
      {payments ?
        paymentList :
        <CircularProgress className={classes.centerBlock} />
      }

      <div className={classes.seeMoreContainer}>
        <Button
          variant='outlined'
          color='primary'
          component={renderLinkPayments}
        >
          Ver todos
        </Button>
      </div>

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
