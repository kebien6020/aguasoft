import * as React from 'react'
import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
import * as colors from '@material-ui/core/colors'

import {
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon } from '@material-ui/icons'

import { AuthRouteComponentProps } from '../AuthRoute'
import Login from '../components/Login'
import Sells, { Sell } from '../components/Sells'
import Payments from '../components/Payments'
import Spendings from '../components/Spendings'
import MyDatePicker from '../components/MyDatePicker'
import DayOverview from '../components/DayOverview'
import LoadingScreen from '../components/LoadingScreen'
import Layout from '../components/Layout'
import { fetchJsonAuth, ErrorResponse, SuccessResponse, isErrorResponse } from '../utils'
import { Payment, Spending } from '../models'

import { Redirect, Link } from 'react-router-dom'
import * as moment from 'moment'
import { Moment } from 'moment'
import 'moment/locale/es'
moment.locale('es')

interface DashboardProps extends PropClasses, AuthRouteComponentProps<{}> {

}

type LoginNextOptions = 'payments'| 'spendings' | null

interface DashboardState {
  gotoSell: boolean
  gotoPayment: boolean
  gotoSpending: boolean

  date: moment.Moment
  sells: Sell[] | null
  payments: Payment[] | null
  spendings: Spending[] | null

  loginDialogOpen: boolean
  loginDialogNext: LoginNextOptions
}

const Title = (props: any) => (
  <div className={props.classes.title}>
    <Typography variant='h6'>{props.children}</Typography>
  </div>
)

class Dashboard extends React.Component<DashboardProps, DashboardState> {

  constructor(props: DashboardProps) {
    super(props)
    this.state = {
      gotoSell: false,
      gotoPayment: false,
      gotoSpending: false,
      date: moment().startOf('day'),
      sells: null,
      payments: null,
      spendings: null,
      loginDialogOpen: false,
      loginDialogNext: null,
    }
  }

  componentDidMount() {
    this.updateSells(this.state.date)
    this.updatePayments()
    this.updateSpendings()
  }

  updateSells = async (date: Moment) => {
    const { props } = this
    const sells: ErrorResponse | Sell[] = await fetchJsonAuth(
      '/api/sells/listDay?day=' + date.format('YYYY-MM-DD'),
      props.auth
    )

    if (!isErrorResponse(sells)) {
      this.setState({sells})
    } else {
      console.error(sells.error)
    }
  }

  updatePayments = async () => {
    const { props } = this
    const payments: ErrorResponse | Payment[] = await fetchJsonAuth(
      '/api/payments/recent',
      props.auth
    )

    if (!isErrorResponse(payments)) {
      this.setState({payments})
    } else {
      console.error(payments.error)
    }
  }

  updateSpendings = async () => {
    const { props } = this
    const spendings: ErrorResponse | Spending[] = await fetchJsonAuth(
      '/api/spendings/recent',
      props.auth
    )

    if (!isErrorResponse(spendings)) {
      this.setState({spendings})
    } else {
      console.error(spendings.error)
    }
  }

  handleLogin = () => {
    this.setState({gotoSell: true})
  }

  handleLoginDialogOpen = (next: LoginNextOptions) => () => {
    this.setState({loginDialogOpen: true, loginDialogNext: next})
  }

  handleLoginDialogClose = () => {
    this.setState({loginDialogOpen: false, loginDialogNext: null})
  }

  handleLoginDialogSubmit = () => {
    if (this.state.loginDialogNext === null) {
      console.error('Login destination not set')
      return
    }
    switch (this.state.loginDialogNext) {
      case 'payments':
        this.setState({gotoPayment: true})
        break
      case 'spendings':
        this.setState({gotoSpending: true})
        break
    }
  }

  handleDateChange = (date: moment.Moment) => {
    this.updateSells(date)
    this.setState({date})
  }

  handleDeleteSell = async (sellId: number) => {
    if (!this.state.sells) return

    const { props } = this

    const result : ErrorResponse | SuccessResponse = await
      fetchJsonAuth('/api/sells/' + sellId, props.auth, {
        method: 'delete',
      })

    if (!isErrorResponse(result)) {
      const sells = [...this.state.sells]
      const sell = sells.find(s => s.id === sellId)
      if (!sell) {
        console.error('Trying to mutate unknown sellId', sellId)
        return
      }
      sell.deleted = true

      this.setState({sells})
    } else {
      console.error(result)
    }
  }

  handleDeletePayment = async (paymentId: number) => {
    if (!this.state.payments) return

    const { props } = this

    const result : ErrorResponse | SuccessResponse = await
      fetchJsonAuth('/api/payments/' + paymentId, props.auth, {
        method: 'delete',
      })

    if (!isErrorResponse(result)) {
      const payments = [...this.state.payments]
      const payment = payments.find(p => p.id === paymentId)

      if (!payment) {
        console.error('Trying to mutate unknown paymentId', paymentId)
        return
      }

      payment.deletedAt = moment().toISOString()

      this.setState({payments})
    } else {
      console.error(result.error)
    }
  }

  handleDeleteSpending = async (spendingId: number) => {
    if (!this.state.spendings) return

    const { props } = this

    const result : ErrorResponse | SuccessResponse = await
      fetchJsonAuth('/api/spendings/' + spendingId, props.auth, {
        method: 'delete',
      })

    if (!isErrorResponse(result)) {
      const spendings = [...this.state.spendings]
      const spending = spendings.find(p => p.id === spendingId)

      if (!spending) {
        console.error('Trying to mutate unknown spendingId', spendingId)
        return
      }

      spending.deletedAt = moment().toISOString()

      this.setState({spendings})
    } else {
      console.error(result.error)
    }
  }

  renderLinkClients = React.forwardRef((props: any, ref: any) => <Link to='/clients' ref={ref} {...props} />)

  renderLinkPayments = React.forwardRef((props: any, ref: any) => <Link to='/payments' ref={ref} {...props} />)

  renderLinkSpendings = React.forwardRef((props: any, ref: any) => <Link to='/spendings' ref={ref} {...props} />)

  render() {
    const { state, props } = this
    const { classes } = this.props

    if (state.sells === null) {
      return <LoadingScreen text='Cargando ventas' />
    }

    if (state.payments === null) {
      return <LoadingScreen text='Cargando pagos' />
    }

    if (state.spendings === null) {
      return <LoadingScreen text='Cargando salidas' />
    }

    if (state.gotoSell) {
      return <Redirect to='/sell' push />
    }

    if (state.gotoPayment) {
      return <Redirect to='/payment' push />
    }

    if (state.gotoSpending) {
      return <Redirect to='/spending' push />
    }

    return (
      <Layout className={classes.layout} title='Ventas'>
        <Dialog
          open={state.loginDialogOpen}
          onClose={this.handleLoginDialogClose}
          fullWidth
          maxWidth='xl'
        >
          <DialogContent>
            <Login onSuccess={this.handleLoginDialogSubmit} auth={props.auth} />
          </DialogContent>
        </Dialog>
        <Title classes={classes}>Registrar Venta</Title>
        <Paper className={classes.login}>
          <Login onSuccess={this.handleLogin} auth={props.auth} />
        </Paper>
        <Title classes={classes}>Registrar Otros</Title>
        <Paper className={classes.others}>
          <Tooltip title='Pagos'>
            <Button
              variant='outlined'
              className={classes.icon}
              onClick={this.handleLoginDialogOpen('payments')}
            >
              <MoneyIcon />
            </Button>
          </Tooltip>
          <Tooltip title='Salidas'>
            <Button
              variant='outlined'
              className={[classes.icon, classes.spendingIcon].join(' ')}
              onClick={this.handleLoginDialogOpen('spendings')}
            >
              <CartIcon />
            </Button>
          </Tooltip>
        </Paper>
        <MyDatePicker
          date={state.date}
          className={classes.datePicker}
          onDateChange={this.handleDateChange}
          DatePickerProps={{
            inputVariant: 'outlined',
            label: 'Fecha',
          }}
        />
        <Grid container className={classes.bottomSection}>
          <Grid item xs={12} md={8}>
            <Title classes={classes}>Pagos Recientes</Title>
            <Payments
              payments={state.payments}
              onDeletePayment={this.handleDeletePayment}
            />
            <div className={classes.seeMoreContainer}>
              <Button
                variant='outlined'
                color='primary'
                component={this.renderLinkPayments}
              >
                Ver mas...
              </Button>
            </div>

            <Title classes={classes}>Salidas Recientes</Title>
            <Spendings
              spendings={state.spendings}
              onDeleteSpending={this.handleDeleteSpending}
            />
            <div className={classes.seeMoreContainer}>
              <Button
                variant='outlined'
                color='primary'
                component={this.renderLinkSpendings}
              >
                Ver mas...
              </Button>
            </div>

            <Title classes={classes}>Ventas del Día</Title>
            <Sells
              sells={state.sells}
              onDeleteSell={this.handleDeleteSell}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Title classes={classes}>Resumen</Title>
            <DayOverview sells={state.sells} />
            <Title classes={classes}>Admin</Title>
            <div className={classes.sidebarElement}>
              <Button
                variant='contained'
                color='primary'
                fullWidth={true}
                component={this.renderLinkClients}
              >
                Administrar clientes
              </Button>
            </div>
          </Grid>
        </Grid>
      </Layout>
    )
  }
}

const styles: StyleRulesCallback<Theme, DashboardProps> = theme => ({
  layout: {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '95%',
    [theme.breakpoints.up('md')]: { width: '90%', },
    [theme.breakpoints.up('lg')]: { width: '80%', },
    [theme.breakpoints.up('xl')]: { width: '75%', },
  },
  title: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    '& > *': {
      textAlign: 'center',
    },
  },
  login: {
    padding: theme.spacing(2),
  },
  bottomSection: {
    // Put summary on top of sells on small screens
    flexDirection: 'column-reverse',
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row',
    },
  },
  sidebarElement: {
    width: '90%',
    padding: '12px',
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'block',
  },
  datePicker: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(0),
  },
  others: {
    display: 'flex',
    justifyItems: 'start',
    padding: theme.spacing(1),
  },
  icon: {
    width: theme.spacing(12),
    height: theme.spacing(12),
    color: colors.green[500],
    borderColor: colors.green[500],
    marginRight: theme.spacing(1),
    '& svg': {
      fontSize: theme.spacing(8),
    }
  },
  spendingIcon: {
    color: colors.blue['A700'],
    borderColor: colors.blue['A700'],
  },
  seeMoreContainer: {
    paddingTop: '8px',
    paddingBottom: '8px',
    textAlign: 'center',
  },
})

export default withStyles(styles)(Dashboard)
