import * as React from 'react'
import { Suspense, lazy } from 'react'
import { BrowserRouter, Switch, Redirect } from 'react-router-dom'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'

import theme from './theme'
import MuiPickersUtilsProvider from '@material-ui/pickers/MuiPickersUtilsProvider'
import MomentUtils from '@date-io/moment'
import * as moment from 'moment'
import 'moment/locale/es'

import CssBaseline from '@material-ui/core/CssBaseline'

import LoadingScreen from './components/LoadingScreen'

const Route =            lazy(() => import(/* webpackChunkName: "auth-route" */ './AuthRoute'))
const CheckUser =        lazy(() => import(/* webpackChunkName: "check-user" */ './Routes/CheckUser'))
const RegisterSale =     lazy(() => import(/* webpackChunkName: "register-sale" */ './Routes/RegisterSale'))
const AuthCallback =     lazy(() => import(/* webpackChunkName: "auth-callback" */ './Routes/AuthCallback'))
const SilentAuth =       lazy(() => import(/* webpackChunkName: "silent-auth" */ './Routes/SilentAuth'))
const Logout =           lazy(() => import(/* webpackChunkName: "logout" */ './Routes/Logout'))
const MonitorSells =     lazy(() => import(/* webpackChunkName: "monitor-sells" */ './Routes/MonitorSells'))
const ClientEditor =     lazy(() => import(/* webpackChunkName: "client-editor" */ './Routes/ClientEditor'))
const ClientList =       lazy(() => import(/* webpackChunkName: "client-list" */ './Routes/ClientList'))
const ClientBalance =    lazy(() => import(/* webpackChunkName: "client-balance" */ './Routes/ClientBalance'))
const RegisterPayment =  lazy(() => import(/* webpackChunkName: "register-payment" */ './Routes/RegisterPayment'))
const PaymentList =      lazy(() => import(/* webpackChunkName: "all-payments" */ './Routes/PaymentList'))
const RegisterSpending = lazy(() => import(/* webpackChunkName: "register-spending" */ './Routes/RegisterSpending'))
const SpendingList =     lazy(() => import(/* webpackChunkName: "spending-list" */ './Routes/SpendingList'))
const Sells =            lazy(() => import(/* webpackChunkName: "sells" */ './Routes/Sells'))

moment.locale('es')

class App extends React.Component {
  render() {
    return (
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <BrowserRouter>
          <MuiThemeProvider theme={theme}>
            <CssBaseline />
            <Suspense fallback={<LoadingScreen text='Cargando página...'/>}>
              <Switch>
                <Route exact path='/authCallback' component={AuthCallback} />
                <Route exact path='/silentAuth' component={SilentAuth} />
                <Route exact path='/logout' component={Logout} />

                <Route exact private path='/sells' component={Sells} />
                <Route exact private path='/monitor/sells' component={MonitorSells} />
                <Route exact private path='/check' component={CheckUser} />
                <Route exact private path='/sell' component={RegisterSale} />
                <Route exact private path='/payment' component={RegisterPayment} />
                <Route exact private path='/spending' component={RegisterSpending} />

                <Route exact private path='/clients' component={ClientList} />
                <Route exact private path='/clients/new' component={ClientEditor} />
                <Route exact private path='/clients/:id' component={ClientEditor} />
                <Route exact private path='/clients/:id/balance' component={ClientBalance} />

                <Route exact private path='/payments' component={PaymentList} />

                <Route exact private path='/spendings' component={SpendingList} />

                <Route path='/' render={() => <Redirect to='/sells' />} />
              </Switch>
            </Suspense>
          </MuiThemeProvider>
        </BrowserRouter>
      </MuiPickersUtilsProvider>
    )
  }
}

const styles :  StyleRulesCallback<Theme, {}> = theme => ({
  "@global": {
    html: {
      fontSize: 12,
      [theme.breakpoints.up("sm")]: {
        fontSize: 16,
      },
      [theme.breakpoints.up("md")]: {
        fontSize: 18,
      },
    }
  }
})

export default withStyles(styles)(App)
