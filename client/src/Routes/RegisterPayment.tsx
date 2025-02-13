import { ChangeEvent, Component } from 'react'
import { Redirect } from 'react-router-dom'
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
} from '@mui/material'

import { Theme } from '@mui/material/styles'

import { makeStyles } from '@mui/styles'

import { AuthRouteComponentProps } from '../AuthRoute'
import Layout from '../components/Layout'
import Title from '../components/Title'
import Alert from '../components/Alert'
import LoadingScreen from '../components/LoadingScreen'
import PriceField from '../components/PriceField'
import DatePicker from '../components/MyDatePicker'
import { Client, User } from '../models'
import {
  fetchJsonAuth,
  isErrorResponse,
  ErrorResponse,
  SuccessResponse,
} from '../utils'
import { isAfter, startOfDay } from 'date-fns'
import { formatDateonlyMachine } from '../utils/dates'
import useAuth from '../hooks/useAuth'

interface Props extends AuthRouteComponentProps, PropClasses { }
interface State {
  clients: Client[] | null

  selectedClientId: string | null
  date: Date
  moneyAmount: string
  invoiceEnabled: boolean
  invoiceDate: Date
  invoiceNumber: string
  datesEnabled: boolean
  startDate: Date
  endDate: Date
  directPayment: boolean

  userIsAdmin: boolean

  moneyAmountError: string | null
  invoiceNumberError: string | null
  datesError: string | null
  submitionError: string | null

  redirectToList: boolean
}

type ValChangeEvent = ChangeEvent<{ value: string }>
type CheckedChangeEvent = { target: { checked: boolean } }

class RegisterPayment extends Component<Props, State> {

  constructor(props: Props) {
    super(props)

    const startOfToday = startOfDay(new Date())

    this.state = {
      selectedClientId: null,
      date: startOfToday,
      clients: null,
      moneyAmount: '',
      invoiceEnabled: false,
      invoiceDate: startOfToday,
      invoiceNumber: '',
      datesEnabled: false,
      startDate: startOfToday,
      endDate: startOfToday,
      directPayment: true,

      userIsAdmin: false,

      moneyAmountError: null,
      invoiceNumberError: null,
      datesError: null,
      submitionError: null,

      redirectToList: false,
    }
  }

  async componentDidMount() {
    const { props } = this
    const clients: Client[] | ErrorResponse =
      await fetchJsonAuth('/api/clients', props.auth)

    if (isErrorResponse(clients)) {
      console.error(clients.error)
      return
    }

    const activeClients = clients.filter(cl => !cl.hidden && !cl.defaultCash)

    const selectedClientId = activeClients[0] ? String(activeClients[0].id) : null

    this.setState({ clients: activeClients, selectedClientId })

    const user: User | ErrorResponse =
      await fetchJsonAuth('/api/users/getCurrent', props.auth)

    if (isErrorResponse(user)) {
      console.error(user.error)
      return
    }

    this.setState({ userIsAdmin: user.role === 'admin' })
  }

  handleChange = (name: keyof State) => (event: ValChangeEvent) => {
    // Save value to a variable because it may change (synthetic events
    // may be re-used by react)
    const value = event.target.value
    this.setState((prevState: State) => ({
      ...prevState,
      [name]: value,
    }))

    // Error clearing
    const { state } = this
    if (name === 'moneyAmount' && state.moneyAmountError !== null)
      this.setState({ moneyAmountError: null })

    if (name === 'invoiceNumber' && state.invoiceNumberError !== null)
      this.setState({ invoiceNumberError: null })

  }

  handleChangeChecked = (name: keyof State) => (event: CheckedChangeEvent) => {
    const value = event.target.checked
    this.setState((prevState: State) => ({
      ...prevState,
      [name]: value,
    }))
  }

  handleChangeDate = (name: keyof State) => (date: Date) => {
    this.setState((prevState: State) => ({
      ...prevState,
      [name]: date,
    }))

    // Error clearing
    const { state } = this
    if ((name === 'startDate' || name === 'endDate') && state.datesError !== null)
      this.setState({ datesError: null })

  }

  validateForm = () => {
    const { state } = this
    let ok = true
    if (state.moneyAmount === '') {
      this.setState({ moneyAmountError: 'Obligatorio' })
      ok = false
    } else if (Number(state.moneyAmount) === 0) {
      this.setState({ moneyAmountError: 'El dinero recibido no puede ser $0' })
      ok = false
    }

    if (state.invoiceEnabled) {
      if (state.invoiceNumber === '') {
        this.setState({ invoiceNumberError: 'Obligatorio' })
        ok = false
      }
    }

    if (state.datesEnabled) {
      if (isAfter(state.startDate, state.endDate)) {
        const msg = 'La fecha de inicio debe ser anterior a la fecha final'
        this.setState({ datesError: msg })
        ok = false
      }
    }

    return ok
  }

  handleSubmit = async () => {
    const valid = this.validateForm()
    if (!valid) return

    const { state, props } = this
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
      value: Number(state.moneyAmount),
      clientId: Number(state.selectedClientId),
    }

    if (state.datesEnabled) {
      payload.dateFrom = formatDateonlyMachine(state.startDate)
      payload.dateTo = formatDateonlyMachine(state.endDate)
    }

    if (state.invoiceEnabled) {
      payload.invoiceNo = state.invoiceNumber
      payload.invoiceDate = formatDateonlyMachine(state.invoiceDate)
    }

    if (state.userIsAdmin) {
      payload.directPayment = state.directPayment
      payload.date = state.date.toISOString()
    }

    const response: SuccessResponse | ErrorResponse =
      await fetchJsonAuth('/api/payments/new', props.auth, {
        method: 'post',
        body: JSON.stringify(payload),
      })

    if (isErrorResponse(response)) {
      this.setState({ submitionError: 'Error al intentar registrar el pago.' })
      console.error(response.error)
      return
    }

    this.setState({ redirectToList: true })
  }

  render() {
    const { props, state } = this
    const { classes } = props

    if (state.clients === null)
      return <LoadingScreen text='Cargando clientes' />


    if (state.redirectToList)
      return <Redirect to='/payments' push />


    return (
      <Layout title='Registrar Pago'>
        <Paper className={classes.paper}>
          <Title>Registrar Pago</Title>
          {state.submitionError !== null
            && <Alert message={state.submitionError} type='error' />
          }
          {state.selectedClientId
            ? <form>
              <Grid container spacing={0} columnSpacing={2} justifyContent='space-between'>
                {state.userIsAdmin
                  && <Grid size={{ xs: 12 }}>
                    <DatePicker
                      label='Fecha del pago'
                      date={state.date}
                      onDateChange={this.handleChangeDate('date')}
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
                      onChange={this.handleChange('selectedClientId')}
                      value={state.selectedClientId}
                    >
                      {state.clients.map((cl, idx) =>
                        <MenuItem key={idx} value={cl.id}>
                          ({cl.code}) {cl.name}
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <PriceField
                    label='Dinero recibido'
                    onChange={this.handleChange('moneyAmount')}
                    value={state.moneyAmount}
                    TextFieldProps={{
                      error: state.moneyAmountError !== null,
                      helperText: state.moneyAmountError,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant='body2'>
                    Incluir detalles de la Factura
                    <Switch
                      checked={state.invoiceEnabled}
                      onChange={this.handleChangeChecked('invoiceEnabled')}
                    />
                  </Typography>
                </Grid>
                <Collapse in={state.invoiceEnabled} className={classes.collapse}>
                  <Grid container spacing={0} justifyContent='space-between'>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <DatePicker
                        label='Fecha de la factura'
                        date={state.invoiceDate}
                        onDateChange={this.handleChangeDate('invoiceDate')}
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
                      <div className={classes.invoiceNumberContainer}>
                        <TextField
                          label='No. Factura'
                          type='number'
                          variant='standard'
                          slotProps={{ htmlInput: { min: 0 } }}
                          fullWidth
                          onChange={this.handleChange('invoiceNumber')}
                          value={state.invoiceNumber}
                          error={state.invoiceNumberError !== null}
                          helperText={state.invoiceNumberError}
                        />
                      </div>
                    </Grid>
                  </Grid>
                </Collapse>
                <Grid size={{ xs: 12 }}>
                  <Typography variant='body2'>
                    Incluir periodo de pago
                    <Switch
                      checked={state.datesEnabled}
                      onChange={this.handleChangeChecked('datesEnabled')}
                      value='datesEnabled'
                    />
                  </Typography>
                </Grid>
                <Collapse in={state.datesEnabled} className={classes.collapse}>
                  <Grid container spacing={0} justifyContent='space-between'>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <DatePicker
                        label='Inicio'
                        date={state.startDate}
                        onDateChange={this.handleChangeDate('startDate')}
                        DatePickerProps={{
                          slotProps: {
                            textField: {
                              error: state.datesError !== null,
                              fullWidth: true,
                              helperText: state.datesError,
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <DatePicker
                        label='Finalizacion'
                        date={state.endDate}
                        onDateChange={this.handleChangeDate('endDate')}
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
                </Collapse>
                {state.userIsAdmin
                  && <Grid size={{ xs: 12 }}>
                    <Typography variant='body2'>
                      Pago en planta
                      <Switch
                        checked={state.directPayment}
                        onChange={this.handleChangeChecked('directPayment')}
                      />
                    </Typography>
                  </Grid>
                }
                <Grid size={{ xs: 12 }} className={classes.buttonContainer}>
                  <Button
                    variant='contained'
                    color='primary'
                    fullWidth
                    onClick={this.handleSubmit}
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
        </Paper>
      </Layout>
    )
  }
}

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    paddingTop: theme.spacing(4),
    paddingRight: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  invoiceNumberContainer: {
    paddingTop: theme.spacing(1),
    '& input': {
      '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
        '-webkit-appearance': 'none',
        margin: 0,
      },
      '&[type=number]': {
        '-moz-appearance': 'textfield',
      },
    },
  },
  buttonContainer: {
    paddingTop: theme.spacing(4),
  },
  collapse: {
    width: '100%',
  },
}))

const RegisterPaymentWrapper = () => {
  const auth = useAuth()
  const classes = useStyles()

  return <RegisterPayment auth={auth} classes={classes} />
}

export default RegisterPaymentWrapper
