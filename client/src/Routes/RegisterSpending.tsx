import { Button, Grid2 as Grid, Paper, Switch, TextField, Typography } from '@mui/material'
import Alert from '../components/Alert'
import Layout from '../components/Layout'
import DatePicker from '../components/MyDatePicker'
import PriceField from '../components/PriceField'
import ResponsiveContainer from '../components/ResponsiveContainer'
import Title from '../components/Title'
import { User } from '../models'
import {
  ErrorResponse,
  fetchJsonAuth,
  isErrorResponse,
  SuccessResponse,
} from '../utils'
import { Component } from 'react'
import { startOfDay } from 'date-fns'
import { Theme } from '../theme'
import Auth from '../Auth'
import useAuth from '../hooks/useAuth'
import { makeStyles } from '@mui/styles'
import { NavigateFunction, useNavigate } from 'react-router'

type Props = PropClasses & { auth: Auth } & { navigate: NavigateFunction }

interface State {
  date: Date
  description: string
  moneyAmount: string
  fromCash: boolean
  isTransfer: boolean

  userIsAdmin: boolean

  descriptionError: string | null
  moneyAmountError: string | null
  submitionError: string | null
}

type ValChangeEvent = { target: { value: string } }
type CheckedChangeEvent = { target: { checked: boolean } }

class RegisterSpending extends Component<Props, State> {

  constructor(props: Props) {
    super(props)

    this.state = {
      date: startOfDay(new Date()),
      description: '',
      moneyAmount: '',
      fromCash: true,
      isTransfer: false,

      userIsAdmin: false,

      descriptionError: null,
      moneyAmountError: null,
      submitionError: null,
    }
  }

  async componentDidMount() {
    const { props } = this

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

    if (name === 'description' && state.descriptionError !== null)
      this.setState({ descriptionError: null })

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
  }

  validateForm = () => {
    const { state } = this
    let ok = true

    if (state.description === '') {
      this.setState({ descriptionError: 'Obligatorio' })
      ok = false
    } else if (state.description.length <= 3) {
      this.setState({ descriptionError: 'Descripción muy corta' })
      ok = false
    }

    if (state.moneyAmount === '') {
      this.setState({ moneyAmountError: 'Obligatorio' })
      ok = false
    } else if (Number(state.moneyAmount) === 0) {
      this.setState({ moneyAmountError: 'La salida no puede ser $0' })
      ok = false
    }

    return ok
  }

  handleSubmit = async () => {
    const valid = this.validateForm()
    if (!valid) return

    const { state, props } = this
    interface Payload {
      description: string
      value: number
      fromCash: boolean
      isTransfer: boolean
      date?: string
    }
    const payload: Payload = {
      description: state.description,
      value: Number(state.moneyAmount),
      fromCash: state.fromCash,
      isTransfer: state.isTransfer,
    }

    if (state.userIsAdmin)
      payload.date = state.date.toISOString()


    const response: SuccessResponse | ErrorResponse =
      await fetchJsonAuth('/api/spendings/new', props.auth, {
        method: 'post',
        body: JSON.stringify(payload),
      })

    if (isErrorResponse(response)) {
      this.setState({ submitionError: 'Error al intentar registrar la salida.' })
      console.error(response.error)
      return
    }

    this.props.navigate('/spendings')
  }

  render() {
    const { props, state } = this
    const { classes } = props

    return (
      <Layout title='Registrar Salida' container={ResponsiveContainer}>
        <Paper className={classes.paper}>
          <Title>Registrar Salida</Title>
          {state.submitionError !== null
            && <Alert message={state.submitionError} type='error' />
          }
          <form>
            <Grid container spacing={0} justifyContent='space-between'>
              {state.userIsAdmin
                && <Grid size={{ xs: 12 }}>
                  <DatePicker
                    label='Fecha de la salida'
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
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label='Descripción'
                  onChange={this.handleChange('description')}
                  value={state.description}
                  error={state.descriptionError !== null}
                  helperText={state.descriptionError}
                  margin='normal'
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <PriceField
                  label='Dinero de salida'
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
                  De ganacias del día
                  <Switch
                    checked={state.fromCash}
                    onChange={this.handleChangeChecked('fromCash')}
                  />
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant='body2'>
                  Es transferencia a Bogotá
                  <Switch
                    checked={state.isTransfer}
                    onChange={this.handleChangeChecked('isTransfer')}
                  />
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }} className={classes.buttonContainer}>
                <Button
                  variant='contained'
                  color='primary'
                  fullWidth
                  onClick={this.handleSubmit}
                >
                  Registrar Salida
                </Button>
              </Grid>
            </Grid>
          </form>
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
}))

const RegisterSpendingWrapper = () => {
  const auth = useAuth()
  const navigate = useNavigate()
  const classes = useStyles()

  return <RegisterSpending auth={auth} navigate={navigate} classes={classes} />
}

export default RegisterSpendingWrapper
