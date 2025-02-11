import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { useHistory, Link, LinkProps } from 'react-router-dom'
import { styled } from '@mui/material/styles'

import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'

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
import { startOfDay } from 'date-fns'
import { formatDateonlyMachine } from '../utils/dates'
import { Theme } from '../theme'
import { VSpace } from '../components/utils'

type PaymentsProps = AuthRouteComponentProps;
export default function Payments({ auth }: PaymentsProps): JSX.Element {
  // Date picker
  const [date, setDate] = useState(() => startOfDay(new Date))

  // Login to register payment
  const history = useHistory()
  const handleLogin = useCallback(() => {
    history.push('/payment')
  }, [history])

  // Snackbar
  const setSnackbarError = useSnackbar()

  // Payment List
  const [payments, setPayments] = useState<Payment[] | null>(null)
  useEffect(() => {
    (async () => {
      setPayments(null)
      const url = '/api/payments/listDay?day=' + formatDateonlyMachine(date)
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
      payment.deletedAt = (new Date).toISOString()

      setPayments(paymentsCopy)
    } else {
      console.error(result)
      setSnackbarError('Error al eliminar el pago: ' + result.error.message)
    }
  }, [payments, auth, setSnackbarError])

  return (
    <Layout title='Pagos'>
      <Title>Registrar Pago</Title>
      <LoginAuth onSuccess={handleLogin} />
      <VSpace />

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

const LoginAuth = (props: MakeOptional<LoginProps, 'auth'>) => {
  const auth = useAuth()
  return (
    <LoginPaper>
      <Login auth={auth} {...props} />
    </LoginPaper>
  )
}

const LoginPaper = styled(Paper)(({ theme }: { theme: Theme }) => ({
  padding: theme.spacing(2),
})) as typeof Paper

const ListLink = React.forwardRef<HTMLAnchorElement, MakeOptional<LinkProps, 'to'>>(
  function ListLink(props, ref) {
    return <Link to='/payments/list' ref={ref} {...props} />
  }
)

const ButtonWrapper = styled('div')({
  paddingTop: '8px',
  paddingBottom: '8px',
  textAlign: 'center',
}) as unknown as 'div'

const LoadingIndicator = styled(CircularProgress)({
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'block',
}) as typeof CircularProgress

const DatePicker = styled(
  (props: MyDatePickerProps) => (
    <MyDatePicker
      DatePickerProps={{
        label: 'Fecha',
      }}
      {...props}
    />
  )
)(({ theme }: { theme: Theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(0),
})) as typeof MyDatePicker
