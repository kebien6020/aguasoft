import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid2 as Grid,
  TextField,
  Switch,
  Collapse,
  Button,
  SelectChangeEvent,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { isAfter, startOfDay } from 'date-fns'

import Layout from '../components/Layout'
import Title from '../components/Title'
import Alert from '../components/Alert'
import LoadingScreen from '../components/LoadingScreen'
import PriceField from '../components/PriceField'
import DatePicker from '../components/MyDatePicker'
import {
  fetchJsonAuth,
  isErrorResponse,
  ErrorResponse,
  SuccessResponse,
} from '../utils'
import { formatDateonlyMachine } from '../utils/dates'
import useAuth from '../hooks/useAuth'
import { useClients } from '../hooks/api/useClients'
import useUser from '../hooks/useUser'
import { Theme } from '../theme'

type CheckedChangeEvent = { target: { checked: boolean } }

const startOfToday = startOfDay(new Date())

const RegisterPayment = () => {
  const auth = useAuth()
  const user = useUser()
  const navigate = useNavigate()

  const [clients] = useClients()
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>()

  // Select the first client when the client list changes
  useEffect(() => {
    if (clients === null) return
    const firstClient = clients.find(cl => !cl.hidden && !cl.defaultCash)
    setSelectedClientId(firstClient?.id?.toString())
  }, [clients])

  const userIsAdmin = user?.user?.role === 'admin'

  const [date, setDate] = useState<Date>(startOfToday)
  const [moneyAmount, setMoneyAmount] = useState<string>('')
  const [invoiceEnabled, setInvoiceEnabled] = useState<boolean>(false)
  const [invoiceDate, setInvoiceDate] = useState<Date>(startOfToday)
  const [invoiceNumber, setInvoiceNumber] = useState<string>('')
  const [datesEnabled, setDatesEnabled] = useState<boolean>(false)
  const [startDate, setStartDate] = useState<Date>(startOfToday)
  const [endDate, setEndDate] = useState<Date>(startOfToday)
  const [directPayment, setDirectPayment] = useState<boolean>(true)
  const [moneyAmountError, setMoneyAmountError] = useState<string | null>(null)
  const [invoiceNumberError, setInvoiceNumberError] = useState<string | null>(null)
  const [datesError, setDatesError] = useState<string | null>(null)
  const [submitionError, setSubmitionError] = useState<string | null>(null)


  const handleChangeStartDate = useCallback((date: Date) => {
    setStartDate(date)
    setDatesError(null)
  }, [])

  const handleChangeEndDate = useCallback((date: Date) => {
    setEndDate(date)
    setDatesError(null)
  }, [])

  const handleChangeSelectedClientId = useCallback((event: SelectChangeEvent) => {
    setSelectedClientId(event.target.value)
  }, [])

  const handleChangeMoneyAmount = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setMoneyAmount(event.target.value)
    setMoneyAmountError(null)
  }, [])

  const handleChangeInvoiceEnabled = useCallback((event: CheckedChangeEvent) => {
    setInvoiceEnabled(event.target.checked)
  }, [])

  const handleChangeInvoiceNumber = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setInvoiceNumber(event.target.value)
    setInvoiceNumberError(null)
  }, [])

  const handleChangeDatesEnabled = useCallback((event: CheckedChangeEvent) => {
    setDatesEnabled(event.target.checked)
  }, [])

  const handleChangeDirectPayment = useCallback((event: CheckedChangeEvent) => {
    setDirectPayment(event.target.checked)
  }, [])

  const validateForm = useCallback(() => {
    let ok = true
    if (moneyAmount === '') {
      setMoneyAmountError('Obligatorio')
      ok = false
    } else if (Number(moneyAmount) === 0) {
      setMoneyAmountError('El dinero recibido no puede ser $0')
      ok = false
    }

    if (invoiceEnabled) {
      if (invoiceNumber === '') {
        setInvoiceNumberError('Obligatorio')
        ok = false
      }
    }

    if (datesEnabled) {
      if (isAfter(startDate, endDate)) {
        const msg = 'La fecha de inicio debe ser anterior a la fecha final'
        setDatesError(msg)
        ok = false
      }
    }

    return ok
  }, [datesEnabled, endDate, invoiceEnabled, invoiceNumber, moneyAmount, startDate])

  const handleSubmit = useCallback(async () => {
    const valid = validateForm()
    if (!valid) return

    interface Payload {
      value: number
      clientId: number
      dateFrom?: string
      dateTo?: string
      invoiceNo?: string
      invoiceDate?: string
      directPayment?: boolean
      date?: string
    }
    const payload: Payload = {
      value: Number(moneyAmount),
      clientId: Number(selectedClientId),
    }

    if (datesEnabled) {
      payload.dateFrom = formatDateonlyMachine(startDate)
      payload.dateTo = formatDateonlyMachine(endDate)
    }

    if (invoiceEnabled) {
      payload.invoiceNo = invoiceNumber
      payload.invoiceDate = formatDateonlyMachine(invoiceDate)
    }

    if (userIsAdmin) {
      payload.directPayment = directPayment
      payload.date = date.toISOString()
    }

    const response: SuccessResponse | ErrorResponse =
      await fetchJsonAuth('/api/payments/new', auth, {
        method: 'post',
        body: JSON.stringify(payload),
      })

    if (isErrorResponse(response)) {
      setSubmitionError('Error al intentar registrar el pago.')
      console.error(response.error)
      return
    }

    navigate('/payments')
  }, [
    auth,
    date,
    datesEnabled,
    directPayment,
    endDate,
    invoiceDate,
    invoiceEnabled,
    invoiceNumber,
    moneyAmount,
    navigate,
    selectedClientId,
    startDate,
    userIsAdmin,
    validateForm,
  ])

  if (clients === null)
    return <LoadingScreen text='Cargando clientes' />

  return (
    <Layout title='Registrar Pago'>
      <Wrapper>
        <Title>Registrar Pago</Title>
        {submitionError !== null
          && <Alert message={submitionError} type='error' />
        }
        {selectedClientId
          ? <form>
            <Grid container spacing={0} columnSpacing={2} justifyContent='space-between'>
              {userIsAdmin
                && <Grid size={{ xs: 12 }}>
                  <DatePicker
                    label='Fecha del pago'
                    date={date}
                    onDateChange={setDate}
                    DatePickerProps={{
                      slotProps: {
                        textField: {
                          fullWidth: true,
                        },
                      },
                    }}
                  />
                </Grid>
              }
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth margin='normal'>
                  <InputLabel htmlFor='clientId'>Cliente</InputLabel>
                  <Select
                    inputProps={{
                      name: 'clientId',
                      id: 'clientId',
                    }}
                    onChange={handleChangeSelectedClientId}
                    value={selectedClientId}
                  >
                    {clients.map((cl, idx) =>
                      <MenuItem key={idx} value={cl.id}>
                        ({cl.code}) {cl.name}
                      </MenuItem>,
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <PriceField
                  label='Dinero recibido'
                  onChange={handleChangeMoneyAmount}
                  value={moneyAmount}
                  TextFieldProps={{
                    error: moneyAmountError !== null,
                    helperText: moneyAmountError,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant='body2'>
                  Incluir detalles de la Factura
                  <Switch
                    checked={invoiceEnabled}
                    onChange={handleChangeInvoiceEnabled}
                  />
                </Typography>
              </Grid>
              <CollapseFullwidth in={invoiceEnabled}>
                <Grid container spacing={0} justifyContent='space-between'>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DatePicker
                      label='Fecha de la factura'
                      date={invoiceDate}
                      onDateChange={setInvoiceDate}
                      DatePickerProps={{
                        slotProps: {
                          textField: {
                            fullWidth: true,
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InvoiceNumberContainer>
                      <TextField
                        label='No. Factura'
                        type='number'
                        variant='standard'
                        slotProps={{ htmlInput: { min: 0 } }}
                        fullWidth
                        onChange={handleChangeInvoiceNumber}
                        value={invoiceNumber}
                        error={invoiceNumberError !== null}
                        helperText={invoiceNumberError}
                      />
                    </InvoiceNumberContainer>
                  </Grid>
                </Grid>
              </CollapseFullwidth>
              <Grid size={{ xs: 12 }}>
                <Typography variant='body2'>
                  Incluir periodo de pago
                  <Switch
                    checked={datesEnabled}
                    onChange={handleChangeDatesEnabled}
                    value='datesEnabled'
                  />
                </Typography>
              </Grid>
              <CollapseFullwidth in={datesEnabled}>
                <Grid container spacing={0} justifyContent='space-between'>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DatePicker
                      label='Inicio'
                      date={startDate}
                      onDateChange={handleChangeStartDate}
                      DatePickerProps={{
                        slotProps: {
                          textField: {
                            error: datesError !== null,
                            fullWidth: true,
                            helperText: datesError,
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DatePicker
                      label='Finalizacion'
                      date={endDate}
                      onDateChange={handleChangeEndDate}
                      DatePickerProps={{
                        slotProps: {
                          textField: {
                            fullWidth: true,
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </CollapseFullwidth>
              {userIsAdmin
                && <Grid size={{ xs: 12 }}>
                  <Typography variant='body2'>
                    Pago en planta
                    <Switch
                      checked={directPayment}
                      onChange={handleChangeDirectPayment}
                    />
                  </Typography>
                </Grid>
              }
              <Grid size={{ xs: 12 }} sx={{ pt: 4 }}>
                <Button
                  variant='contained'
                  color='primary'
                  fullWidth
                  onClick={handleSubmit}
                >
                  Registrar Pago
                </Button>
              </Grid>
            </Grid>
          </form>
          : <Alert
            type='error'
            message='Error interno en cliente seleccionado'
          />
        }
      </Wrapper>
    </Layout>
  )
}

const Wrapper = styled(Paper)(({ theme }: { theme: Theme }) => ({
  paddingTop: theme.spacing(4),
  paddingRight: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  paddingLeft: theme.spacing(4),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}))

const InvoiceNumberContainer = styled('div')(({ theme }: { theme: Theme }) => ({
  paddingTop: theme.spacing(1),
  '& input': {
    '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
      margin: 0,
    },
    '&[type=number]': {
      MozAppearance: 'textfield',
    },
  },
}))

const CollapseFullwidth = styled(Collapse)({
  width: '100%',
})

export default RegisterPayment
