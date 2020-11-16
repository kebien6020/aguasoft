import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { useHistory, Link, LinkProps } from 'react-router-dom'
import { styled } from '@material-ui/core/styles'
import moment from 'moment'

import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Paper from '@material-ui/core/Paper'

import { AuthRouteComponentProps } from '../AuthRoute'
import Layout from '../components/Layout'
import Login, { LoginProps } from '../components/Login'
import MyDatePicker, { MyDatePickerProps } from '../components/MyDatePicker'
import PaymentList from '../components/Payments'
import Title from '../components/Title'
import { Payment } from '../models'
import { fetchJsonAuth, ErrorResponse, SuccessResponse, isErrorResponse } from '../utils'
import useAuth from '../hooks/useAuth'
import useSnackbar from '../hooks/useSnackbar'
import { MakeOptional } from '../utils/types'

type PaymentsProps = AuthRouteComponentProps<unknown>;
export default function Payments({ auth }: PaymentsProps): JSX.Element {
  // Date picker
  const [date, setDate] = useState(() => moment().startOf('day'))

  // Login to register payment
  const history = useHistory()
  const handleLogin = useCallback(() => {
    history.push('/payment')
  }, [history])

  // Snackbar
  const setSnackbarError = useSnackbar()

  // Payment List
  const [payments, setPayments] = useState<Payment[]|null>(null)
  useEffect(() => {
    (async () => {
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
    })()
  }, [date, auth, setSnackbarError])

  const handleDeletePayment = useCallback(async (paymentId: number) => {
    if (!payments) return

    const url = `/api/payments/${paymentId}`
    const result =
        await fetchJsonAuth<SuccessResponse>(url, auth, {
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
      setSnackbarError('Error al eliminar el pago')
    }
  }, [payments, auth, setSnackbarError])

  return (
    <Layout title='Pagos'>
      <Title>Registrar Pago</Title>
      <PaperLogin onSuccess={handleLogin} />

      <DatePicker
        date={date}
        onDateChange={setDate}
      />

      <Title>Pagos del día</Title>
      {payments
        ? <PaymentList payments={payments} onDeletePayment={handleDeletePayment} />
        : <LoadingIndicator />
      }

      <ButtonWrapper>
        <Button
          variant='outlined'
          color='primary'
          component={ListLink}
        >
          Ver todos
        </Button>
      </ButtonWrapper>
    </Layout>
  )
}

const PaperLogin = styled(
  (props: MakeOptional<LoginProps, 'auth'>) => {
    const auth = useAuth()
    return (
      <Paper>
        <Login auth={auth} {...props}/>
      </Paper>
    )
  }
)(({ theme }) => ({
  padding: theme.spacing(2),
}))

const ListLink = React.forwardRef<HTMLAnchorElement, MakeOptional<LinkProps, 'to'>>(
  function ListLink(props, ref) {
    return <Link to='/payments/list' ref={ref} {...props} />
  }
)

const ButtonWrapper = styled('div')({
  paddingTop: '8px',
  paddingBottom: '8px',
  textAlign: 'center',
})

const LoadingIndicator = styled(CircularProgress)({
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'block',
})

const DatePicker = styled(
  (props: MyDatePickerProps) => (
    <MyDatePicker
      DatePickerProps={{
        inputVariant: 'outlined',
        label: 'Fecha',
      }}
      {...props}
    />
  )
)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(0),
}))
