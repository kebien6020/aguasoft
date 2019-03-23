import * as React from 'react'

import {
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  TextField,
  Switch,
  Collapse,
  Button,
} from '@material-ui/core'

import {
  withStyles,
  StyleRulesCallback,
  Theme,
} from '@material-ui/core/styles'

import * as moment from 'moment'

import { AuthRouteComponentProps } from '../AuthRoute'
import Layout from '../components/Layout'
import ResponsiveContainer from '../components/ResponsiveContainer'
import Title from '../components/Title'
import Alert from '../components/Alert'
import LoadingScreen from '../components/LoadingScreen'
import PriceField from '../components/PriceField'
import DatePicker from '../components/MyDatePicker'
import { Client, User } from '../models'
import { fetchJsonAuth, isErrorResponse, ErrorResponse } from '../utils'

interface Props extends AuthRouteComponentProps<{}>, PropClasses { }
interface State {
  clients: Client[] | null

  selectedClientId: string | null
  moneyAmount: string
  invoiceEnabled: boolean
  invoiceDate: moment.Moment
  invoiceNumber: string
  datesEnabled: boolean
  startDate: moment.Moment
  endDate: moment.Moment
  localPayment: boolean

  userIsAdmin: boolean

  moneyAmountError: string | null
  invoiceNumberError: string | null
  datesError: string | null
}

type ValChangeEvent = { target: { value: string } }
type CheckedChangeEvent = { target: { checked: boolean } }

class RegisterPayment extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)

    this.state = {
      selectedClientId: null,
      clients: null,
      moneyAmount: '',
      invoiceEnabled: false,
      invoiceDate: moment().startOf('day'),
      invoiceNumber: '',
      datesEnabled: false,
      startDate: moment().startOf('day'),
      endDate: moment().startOf('day'),
      localPayment: true,

      userIsAdmin: false,

      moneyAmountError: null,
      invoiceNumberError: null,
      datesError: null,
    }
  }

  async componentDidMount() {
    const { props } = this
    const clients : Client[] | ErrorResponse =
      await fetchJsonAuth('/api/clients', props.auth)

    if (isErrorResponse(clients)) {
      console.error(clients.error)
      return
    }

    const activeClients = clients.filter(cl => !cl.hidden)

    const selectedClientId = clients[0] ? String(clients[0].id) : null

    this.setState({clients: activeClients, selectedClientId})

    const user : User | ErrorResponse =
      await fetchJsonAuth('/api/users/getCurrent', props.auth)

    if (isErrorResponse(user)) {
      console.error(user.error)
      return
    }

    this.setState({userIsAdmin: user.role === 'admin'})
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
    if (name === 'moneyAmount' && state.moneyAmountError !== null) {
      this.setState({moneyAmountError: null})
    }
    if (name === 'invoiceNumber' && state.invoiceNumberError !== null) {
      this.setState({invoiceNumberError: null})
    }
  }

  handleChangeChecked = (name: keyof State) => (event: CheckedChangeEvent) => {
    const value = event.target.checked
    this.setState((prevState: State) => ({
        ...prevState,
        [name]: value,
    }))
  }

  handleChangeDate = (name: keyof State) => (date: moment.Moment) => {
    this.setState((prevState: State) => ({
        ...prevState,
        [name]: date,
    }))

    // Error clearing
    const { state } = this
    if ((name === 'startDate' || name === 'endDate') && state.datesError !== null) {
      this.setState({datesError: null})
    }
  }

  validateForm = () => {
    const { state } = this
    let ok = true
    if (state.moneyAmount === '') {
      this.setState({moneyAmountError: 'Obligatorio'})
      ok = false
    } else if (Number(state.moneyAmount) === 0) {
      this.setState({moneyAmountError: 'El dinero recibido no puede ser $0'})
      ok = false
    }

    if (state.invoiceEnabled) {
      if (state.invoiceNumber === '') {
        this.setState({invoiceNumberError: 'Obligatorio'})
        ok = false
      }
    }

    if (state.datesEnabled) {
      if (state.startDate.isAfter(state.endDate)) {
        const msg = 'La fecha de inicio debe ser anterior a la fecha final'
        this.setState({datesError: msg})
        ok = false
      }
    }

    return ok
  }

  handleSubmit = () => {
    const valid = this.validateForm()
    if (!valid) return

  }

  render() {
    const { props, state } = this
    const { classes } = props

    if (state.clients === null) {
      return <LoadingScreen text='Cargando clientes' />
    }

    return (
      <Layout>
        <ResponsiveContainer>
          <Paper className={classes.paper}>
            <Title>Registrar Pago</Title>
            {state.selectedClientId ?
              <form>
                <Grid container spacing={0} justify='space-between'>
                  {/*
                  // @ts-ignore grid-md-6 is missing in type system*/}
                  <Grid item xs={12} md={6} classes={{'grid-md-6': classes.md6}}>
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
                  {/*
                  // @ts-ignore grid-md-6 is missing in type system*/}
                  <Grid item xs={12} md={6} classes={{'grid-md-6': classes.md6}}>
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
                  <Grid item xs={12}>
                    <Typography variant='body2'>
                      Incluir detalles de la Factura
                      <Switch
                        checked={state.invoiceEnabled}
                        onChange={this.handleChangeChecked('invoiceEnabled')}
                      />
                    </Typography>
                  </Grid>
                  <Collapse in={state.invoiceEnabled} className={classes.collapse}>
                    <Grid container spacing={0} justify='space-between'>
                      {/*
                      // @ts-ignore grid-md-6 is missing in type system*/}
                      <Grid item xs={12} md={6} classes={{'grid-md-6': classes.md6}}>
                        <DatePicker
                          label='Fecha de la factura'
                          date={state.invoiceDate}
                          onDateChange={this.handleChangeDate('invoiceDate')}
                          DatePickerProps={{
                            fullWidth: true,
                          }}
                        />
                      </Grid>
                      {/*
                      // @ts-ignore grid-md-6 is missing in type system*/}
                      <Grid item xs={12} md={6} classes={{'grid-md-6': classes.md6}}>
                        <div className={classes.invoiceNumberContainer}>
                          <TextField
                            label='No. Factura'
                            type='number'
                            variant='standard'
                            inputProps={{min: 0}}
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
                  <Grid item xs={12}>
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
                    <Grid container spacing={0} justify='space-between'>
                      {/*
                      // @ts-ignore grid-md-6 is missing in type system */}
                      <Grid item xs={12} md={6} classes={{'grid-md-6': classes.md6}}>
                        <DatePicker
                          label='Inicio'
                          date={state.startDate}
                          onDateChange={this.handleChangeDate('startDate')}
                          DatePickerProps={{
                            fullWidth: true,
                            error: state.datesError !== null,
                            helperText: state.datesError,
                          }}
                        />
                      </Grid>
                      {/*
                      // @ts-ignore grid-md-6 is missing in type system */}
                      <Grid item xs={12} md={6} classes={{'grid-md-6': classes.md6}}>
                        <DatePicker
                          label='Finalizacion'
                          date={state.endDate}
                          onDateChange={this.handleChangeDate('endDate')}
                          DatePickerProps={{
                            fullWidth: true,
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Collapse>
                  {state.userIsAdmin &&
                    <Grid item xs={12}>
                      <Typography variant='body2'>
                        Pago en planta
                        <Switch
                          checked={state.localPayment}
                          onChange={this.handleChangeChecked('localPayment')}
                        />
                      </Typography>
                    </Grid>
                  }
                  <Grid item xs={12} className={classes.buttonContainer}>
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
              :
              <Alert
                type='error'
                message='Error interno en cliente seleccionado'
              />
            }
          </Paper>
        </ResponsiveContainer>
      </Layout>
    )
  }
}

const styles: StyleRulesCallback = (theme: Theme) => ({
  paper: {
    paddingTop: theme.spacing.unit * 4,
    paddingRight: theme.spacing.unit * 4,
    paddingBottom: theme.spacing.unit * 4,
    paddingLeft: theme.spacing.unit * 4,
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
  invoiceNumberContainer: {
    paddingTop: theme.spacing.unit,
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
    paddingTop: theme.spacing.unit * 4,
  },
  collapse: {
    width: '100%',
  },
  md6: {
    [theme.breakpoints.up('md')]: {
      maxWidth: '48%',
    }
  },
})

export default withStyles(styles)(RegisterPayment)
