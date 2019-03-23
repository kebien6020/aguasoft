import * as React from 'react'
import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'

import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'

import { AuthRouteComponentProps } from '../AuthRoute'
import Login from '../components/Login'
import Sells, { Sell } from '../components/Sells'
import MyDatePicker from '../components/MyDatePicker'
import DayOverview from '../components/DayOverview'

import { Redirect, Link } from 'react-router-dom'
import * as moment from 'moment'
import 'moment/locale/es'
moment.locale('es')

interface DashboardProps extends PropClasses, AuthRouteComponentProps<{}> {

}

interface DashboardState {
  gotoSell: boolean
  gotoPayment: boolean
  date: moment.Moment
  sells: Sell[]
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
      date: moment().startOf('day'),
      sells: [] as Sell[],
    }
  }

  handleLogin = () => {
    this.setState({gotoSell: true})
  }

  handleLoginPayment = () => {
    this.setState({gotoPayment: true})
  }

  handleDateChange = (date: moment.Moment) => {
    this.setState({date})
  }

  handleSellsChanged = (sells: Sell[]) => {
    if (this.state.sells.length !== sells.length)
      this.setState({sells})
  }

  renderLinkClients = (props: any) => <Link to='/clients' {...props} />


  render() {
    const { state, props } = this
    const { classes } = this.props

    if (state.gotoSell) {
      return <Redirect to='/sell' push />
    }

    if (state.gotoPayment) {
      return <Redirect to='/payment' push />
    }

    return (
      <div className={classes.layout}>
        <Title classes={classes}>Registrar Venta</Title>
        <Paper className={classes.login}>
          <Login onSuccess={this.handleLogin} auth={props.auth} />
        </Paper>
        <Title classes={classes}>Registrar Pago</Title>
        <Paper className={classes.login}>
          <Login onSuccess={this.handleLoginPayment} auth={props.auth} />
        </Paper>
        <Grid container className={classes.bottomSection}>
          <Grid item xs={12} md={8}>
            <Title classes={classes}>Ventas del Día</Title>
            <MyDatePicker
              date={state.date}
              onDateChange={this.handleDateChange}
            />
            <Sells
              day={state.date}
              auth={props.auth}
              onSellsChanged={this.handleSellsChanged}
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
      </div>
    )
  }
}

const styles: StyleRulesCallback = (theme: Theme) => ({
  layout: {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '95%',
    [theme.breakpoints.up('md')]: { width: '90%', },
    [theme.breakpoints.up('lg')]: { width: '80%', },
    [theme.breakpoints.up('xl')]: { width: '75%', },
  },
  title: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
    '& > *': {
      textAlign: 'center',
    },
  },
  login: {
    padding: theme.spacing.unit * 2,
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
})

export default withStyles(styles)(Dashboard)
