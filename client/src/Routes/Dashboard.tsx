import * as React from 'react'
import { withStyles, Theme, StyleRulesCallback } from 'material-ui/styles'

import Typography from 'material-ui/Typography'
import Paper from 'material-ui/Paper'
import Grid from 'material-ui/Grid'

import { AuthRouteComponentProps } from '../AuthRoute'
import Login from '../components/Login'
import Sells from '../components/Sells'
import MyDatePicker from '../components/MyDatePicker'

import { Redirect } from 'react-router-dom'
import * as moment from 'moment'
import 'moment/locale/es'
moment.locale('es')

interface DashboardProps extends PropClasses, AuthRouteComponentProps<{}> {

}

interface DashboardState {
  gotoSell: boolean
  date: moment.Moment
}

const Title = (props: any) => (
  <div className={props.classes.title}>
    <Typography variant='title'>{props.children}</Typography>
  </div>
)

class Dashboard extends React.Component<DashboardProps, DashboardState> {
  state = {
    gotoSell: false,
    date: moment().startOf('day'),
  }

  handleLogin = () => {
    this.setState({gotoSell: true})
  }

  handleDateChange = (date: Date) => {
    this.setState({date: moment(date)})
  }

  render() {
    const { state, props } = this
    const { classes } = this.props

    if (state.gotoSell) {
      return <Redirect to='/sell' />
    }

    return (
      <div className={classes.layout}>
        <Title classes={classes}>Registrar Venta</Title>
        <Paper className={classes.login}>
          <Login onSuccess={this.handleLogin} auth={props.auth} />
        </Paper>
        <Grid container className={classes.bottomSection}>
          <Grid item xs={12} md={8}>
            <Title classes={classes}>Ventas del Día</Title>
            <MyDatePicker
              date={state.date.toDate()}
              onDateChange={this.handleDateChange}
            />
            <Sells day={state.date} auth={props.auth} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Title classes={classes}>Resumen</Title>
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
})

export default withStyles(styles)(Dashboard)
