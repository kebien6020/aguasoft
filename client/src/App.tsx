import * as React from 'react'
import { BrowserRouter, Switch } from 'react-router-dom'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'

import theme from './theme'
import MuiPickersUtilsProvider from 'material-ui-pickers/MuiPickersUtilsProvider'
import MomentUtils from '@date-io/moment'
import * as moment from 'moment'
import 'moment/locale/es'

import CheckUser from './Routes/CheckUser'
import RegisterSale from './Routes/RegisterSale'
import AuthCallback from './Routes/AuthCallback'
import SilentAuth from './Routes/SilentAuth'
import Logout from './Routes/Logout'
import MonitorSells from './Routes/MonitorSells'
import Dashboard from './Routes/Dashboard'
import ClientEditor from './Routes/ClientEditor'
import ClientList from './Routes/ClientList'

import CssBaseline from '@material-ui/core/CssBaseline'

import Route from './AuthRoute'

moment.locale('es')

class App extends React.Component {
  render() {
    return (
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <BrowserRouter>
          <MuiThemeProvider theme={theme}>
            <CssBaseline />
            <Switch>
              <Route exact path='/authCallback' component={AuthCallback} />
              <Route exact path='/silentAuth' component={SilentAuth} />
              <Route exact path='/logout' component={Logout} />

              <Route exact private path='/' component={Dashboard} />
              <Route exact private path='/monitor/sells' component={MonitorSells} />
              <Route exact private path='/check' component={CheckUser} />
              <Route exact private path='/sell' component={RegisterSale} />

              <Route exact private path='/clients' component={ClientList} />
              <Route exact private path='/clients/new' component={ClientEditor} />
              <Route exact private path='/clients/:id' component={ClientEditor} />
            </Switch>
          </MuiThemeProvider>
        </BrowserRouter>
      </MuiPickersUtilsProvider>
    )
  }
}

const styles : StyleRulesCallback = (theme: Theme) => ({
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
